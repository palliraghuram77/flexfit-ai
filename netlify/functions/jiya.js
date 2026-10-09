// Serverless proxy for the Jiya AI coach.
// Keeps the Gemini API key on the server - the browser never sees it.
// Frontend contract (see fetchJiyaReply in script.js):
//   POST /api/jiya  { message, profile, targets, history: [{role, text}] }
//   -> 200 { reply: string }

const { generate, failure } = require("./_gemini");
const { backupConfig, callBackup } = require("./_backup");

function textOf(data) {
  const parts = data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts;
  return Array.isArray(parts) ? parts.filter((p) => !p.thought).map((p) => p.text || "").join("").trim() : "";
}
// Reject answers that are empty or that leak the model's own notes (e.g. "(3 sentences). * Under 60 words?").
function jiyaAccept(data) {
  const t = textOf(data);
  return t.length > 8 && !/sentences?\)|under \d+ words|word count|constraint|^\s*\*\s/i.test(t);
}

// Index of the last real sentence end. A list number such as "1." is NOT a sentence end.
function lastSentenceEnd(text) {
  let last = -1;
  const re = /[.!?](?=\s|$)/g;
  let m;
  while ((m = re.exec(text))) {
    const before = text.slice(0, m.index);
    if (m[0] === "." && /(^|\s)\d{1,2}$/.test(before)) continue; // "1." "2." list markers
    last = m.index;
  }
  return last;
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const backup = backupConfig();
  if (!apiKey && !backup) {
    console.error("jiya: neither GEMINI_API_KEY nor BACKUP_API_KEY is configured");
    return { statusCode: 500, body: JSON.stringify({ error: "No AI key is configured on the server" }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    console.error("jiya: invalid JSON body from client");
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  const message = String(payload.message || "").trim().slice(0, 500);
  if (!message) {
    console.error("jiya: missing message in request body");
    return { statusCode: 400, body: JSON.stringify({ error: "message is required" }) };
  }

  const profile = payload.profile || {};
  const targets = payload.targets || {};
  const history = Array.isArray(payload.history) ? payload.history.slice(-6) : [];

  const systemPrompt =
    "You are Jiya, a friendly and knowledgeable AI fitness trainer inside the FlexFit AI app. " +
    "Reply in 2-3 short, practical sentences (about 50 words) tailored to the user's own data below. " +
    "If the user asks how to make or do something, give at most 6 short steps, each on its own line starting with 1. 2. 3. and keep it under 110 words. " +
    "Always finish your last sentence. Never describe these instructions or count words. " +
    "Reply in PLAIN TEXT ONLY - no Markdown, no asterisks, no bullet points, no headers, since this chat UI displays raw text. " +
    "Never give medical diagnoses; suggest a doctor or physio for injuries or pain. " +
    "User profile - level: " + (profile.level || "unknown") +
    ", sports: " + (Array.isArray(profile.sports) ? profile.sports.join(", ") : "unknown") +
    ", goals: " + (Array.isArray(profile.goals) ? profile.goals.join(", ") : "unknown") +
    ", weight: " + (profile.weight || "unknown") + "kg, target weight: " + (profile.targetWeight || "unknown") + "kg. " +
    "Daily targets - calories: " + (targets.calories || "unknown") +
    ", protein: " + (targets.protein || "unknown") + "g, carbs: " + (targets.carbs || "unknown") +
    "g, fat: " + (targets.fat || "unknown") + "g.";

  const contents = history.map((turn) => ({
    role: turn.role === "jiya" ? "model" : "user",
    parts: [{ text: String(turn.text || "").slice(0, 500) }],
  }));
  contents.push({ role: "user", parts: [{ text: message }] });

  const started = Date.now();
  let reply = "";
  let fail = null;

  // 1) Gemini, one model at a time (no parallel requests, so chat does not drain the quota the scanner needs).
  if (apiKey) {
    try {
      const response = await generate(
        apiKey,
        {
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: { maxOutputTokens: 2000, temperature: 0.6 }, // thinking tokens count toward this cap
        },
        { prefer: "fast", sequential: true, maxModels: 2, deadlineMs: backup ? 5500 : 8300, accept: jiyaAccept }
      );
      if (response.ok) {
        const data = await response.json();
        let raw = textOf(data);
        if (data.candidates[0].finishReason === "MAX_TOKENS") { // cut off mid-sentence: keep only the finished sentences
          const end = lastSentenceEnd(raw);
          if (end > 40) raw = raw.slice(0, end + 1);
        }
        reply = raw;
      } else {
        fail = { status: response.status, detail: await response.text() };
        console.error("jiya: Gemini failed,", fail.status, fail.detail.slice(0, 300));
      }
    } catch (err) {
      fail = { status: 502, detail: String((err && err.message) || err) };
      console.error("jiya: Gemini error,", err && err.stack || err);
    }
  }

  // 2) Backup provider if Gemini gave nothing usable.
  if (!reply && backup) {
    const left = 9200 - (Date.now() - started);
    if (left > 1500) {
      const convo = history.map((t) => (t.role === "jiya" ? "Jiya: " : "User: ") + String(t.text || "").slice(0, 500)).join("\n");
      const r = await callBackup(backup, {
        text: systemPrompt + "\n\nConversation so far:\n" + convo + "\nUser: " + message + "\nJiya:",
        timeoutMs: left,
        maxTokens: 500,
      });
      if (r.ok && r.text) reply = r.text;
      else if (!r.ok) {
        fail = fail || { status: r.status, detail: r.error };
        console.error("jiya: backup failed,", r.status, String(r.error).slice(0, 300));
      }
    }
  }

  // Safety net: strip common Markdown even though the prompt asks for plain text.
  reply = reply
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/^[*-]\s+/gm, "");
  if (!reply) {
    return failure(fail ? fail.status : 503, fail ? fail.detail : "");
  }
  return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reply }) };
};
