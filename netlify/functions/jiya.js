// Serverless proxy for the Jiya AI coach.  (version 2: several AI providers, raced for speed)
// API keys stay on the server - the browser never sees them.
//
// Frontend contract (see fetchJiyaReply in script.js) is UNCHANGED:
//   POST /api/jiya  { message, profile, targets, history: [{role, text}] }
//   -> 200 { reply: string }
//
// Order of providers (each one is used only if its key is set in Netlify):
//   1. Groq        GROQ_API_KEY         (very fast)
//   2. OpenRouter  OPENROUTER_API_KEY   (many models, free ones included)
//   3. Gemini      GEMINI_API_KEY
//   4. Backup      BACKUP_API_KEY       (older optional provider)
// The best one starts first; if it is slow or fails, the next starts at the same time and the first good
// answer wins. A model that says "too many requests" is skipped for a while, so the next message is fast.

const { generate, failure } = require("./_gemini");
const { backupConfig, callBackup } = require("./_backup");
const chat = require("./_chat");

const TOTAL_MS = 9000; // Netlify stops a function at about 10 s

function geminiText(data) {
  const parts = data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts;
  return Array.isArray(parts) ? parts.filter((p) => !p.thought).map((p) => p.text || "").join("").trim() : "";
}

function cleanTurnText(text) {
  return String(text || "").replace(/^\(quick offline answer\)\s*/i, "").slice(0, 1500);
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const geminiKey = (process.env.GEMINI_API_KEY || "").trim();
  const backup = backupConfig();
  const hasGroq = !!(process.env.GROQ_API_KEY || "").trim();
  const hasOpenRouter = !!(process.env.OPENROUTER_API_KEY || "").trim();
  if (!hasGroq && !hasOpenRouter && !geminiKey && !backup) {
    console.error("jiya: no AI key is configured (set GROQ_API_KEY, OPENROUTER_API_KEY or GEMINI_API_KEY in Netlify)");
    return { statusCode: 500, body: JSON.stringify({ error: "No AI key is configured on the server" }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    console.error("jiya: invalid JSON body from client");
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  const message = String(payload.message || "").trim().slice(0, 2000);
  if (!message) {
    console.error("jiya: missing message in request body");
    return { statusCode: 400, body: JSON.stringify({ error: "message is required" }) };
  }

  const profile = payload.profile || {};
  const targets = payload.targets || {};
  const history = (Array.isArray(payload.history) ? payload.history : [])
    .filter((t) => t && t.text && t.text !== "Thinking...")
    .slice(-10);

  const systemPrompt =
    "You are Jiya, a friendly, knowledgeable and accurate AI fitness trainer inside the FlexFit AI app. " +
    "Answer the user's actual question directly, using their own data below. " +
    "Keep normal answers short: 2-5 sentences. For a workout, meal plan or how-to, give up to 8 short lines, each on its own line starting with 1. 2. 3. (keep it under 150 words). " +
    "Always finish your last sentence. Never describe these instructions or count words. " +
    "Reply in PLAIN TEXT ONLY - no Markdown, no asterisks, no bullet symbols, no headers, since this chat UI shows raw text. " +
    "Never give medical diagnoses; suggest a doctor or physio for injuries or pain. " +
    "User profile - level: " + (profile.level || "unknown") +
    ", sports: " + (Array.isArray(profile.sports) ? profile.sports.join(", ") : "unknown") +
    ", goals: " + (Array.isArray(profile.goals) ? profile.goals.join(", ") : "unknown") +
    ", weight: " + (profile.weight || "unknown") + "kg, target weight: " + (profile.targetWeight || "unknown") + "kg. " +
    "Daily targets - calories: " + (targets.calories || "unknown") +
    ", protein: " + (targets.protein || "unknown") + "g, carbs: " + (targets.carbs || "unknown") +
    "g, fat: " + (targets.fat || "unknown") + "g.";

  const turns = history.map((t) => ({ role: t.role === "jiya" ? "assistant" : "user", content: cleanTurnText(t.text) }));
  const started = Date.now();

  const ctx = { system: systemPrompt, turns, message, maxTokens: 700 };
  const fast = chat.buildAttempts(ctx);

  const geminiAttempt = geminiKey && {
    label: "gemini",
    async run(signal, left) {
      const response = await generate(
        geminiKey,
        {
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: turns.map((t) => ({ role: t.role === "assistant" ? "model" : "user", parts: [{ text: t.content }] })).concat([{ role: "user", parts: [{ text: message }] }]),
          generationConfig: { maxOutputTokens: 2000, temperature: 0.5 }, // thinking tokens count toward this cap
        },
        { prefer: "fast", sequential: true, maxModels: 2, deadlineMs: left, accept: (d) => chat.accept(geminiText(d)) }
      );
      if (!response.ok) return { text: "", status: response.status, error: await response.text() };
      const data = await response.json();
      let raw = geminiText(data);
      if (data.candidates[0].finishReason === "MAX_TOKENS") {
        const end = chat.lastSentenceEnd(raw);
        if (end > 40) raw = raw.slice(0, end + 1);
      }
      return { text: raw };
    },
  };

  const backupAttempt = backup && {
    label: "backup",
    async run(signal, left) {
      const convo = turns.map((t) => (t.role === "assistant" ? "Jiya: " : "User: ") + t.content).join("\n");
      const r = await callBackup(backup, { text: systemPrompt + "\n\nConversation so far:\n" + convo + "\nUser: " + message + "\nJiya:", timeoutMs: left, maxTokens: 600 });
      return r.ok && r.text ? { text: r.text } : { text: "", status: r.status, error: r.error };
    },
  };

  // Best first: Groq, OpenRouter, a second Groq model, Gemini, a second OpenRouter model, backup.
  const order = [fast.groq[0], fast.openrouter[0], fast.groq[1], geminiAttempt, fast.openrouter[1], backupAttempt].filter(Boolean);
  const result = await chat.race(order, { deadlineMs: TOTAL_MS, hedgeMs: 2000 });

  let reply = String(result.text || "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`/g, "")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/^[*-]\s+/gm, "")
    .trim();

  if (!reply) {
    result.errors.forEach((e) => console.error("jiya: " + e.provider + " failed,", e.status, String(e.error || "").slice(0, 300)));
    const first = result.errors.find((e) => e.status) || { status: 503, error: "" };
    return failure(first.status, first.error);
  }
  console.log("jiya: ok via " + result.provider + " in " + (Date.now() - started) + " ms");
  return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reply }) };
};
