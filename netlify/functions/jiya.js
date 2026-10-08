// Serverless proxy for the Jiya AI coach.
// Keeps the Gemini API key on the server - the browser never sees it.
// Frontend contract (see fetchJiyaReply in script.js):
//   POST /api/jiya  { message, profile, targets, history: [{role, text}] }
//   -> 200 { reply: string }

const { generate, failure } = require("./_gemini");

function textOf(data) {
  const parts = data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts;
  return Array.isArray(parts) ? parts.filter((p) => !p.thought).map((p) => p.text || "").join("").trim() : "";
}
// Reject answers that are empty or that leak the model's own notes (e.g. "(3 sentences). * Under 60 words?").
function jiyaAccept(data) {
  const t = textOf(data);
  return t.length > 8 && !/sentences?\)|under \d+ words|word count|constraint|^\s*\*\s/i.test(t);
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("jiya: GEMINI_API_KEY missing");
    return { statusCode: 500, body: JSON.stringify({ error: "GEMINI_API_KEY is not configured on the server" }) };
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

  try {
    const response = await generate(apiKey, {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: { maxOutputTokens: 900, temperature: 0.6 },
      },
      { prefer: "fast", hedgeMs: 2200, accept: jiyaAccept }
    );

    if (!response.ok) {
      const detail = await response.text();
      console.error("jiya: Gemini request failed,", response.status, detail.slice(0, 500));
      return failure(response.status, detail);
    }

    const data = await response.json();
    let raw = textOf(data);
    if (data.candidates[0].finishReason === "MAX_TOKENS") { // cut off mid-sentence: keep only the finished sentences
      const end = Math.max(raw.lastIndexOf("."), raw.lastIndexOf("!"), raw.lastIndexOf("?"));
      if (end > 40) raw = raw.slice(0, end + 1);
    }
    // Safety net: strip common Markdown even though the prompt asks for plain
    // text, since models don't always follow that instruction perfectly.
    const reply = raw
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/__(.*?)__/g, "$1")
      .replace(/^#{1,6}\s*/gm, "")
      .replace(/^[*-]\s+/gm, "");
    if (!reply) {
      console.error("jiya: Gemini returned no usable text,", JSON.stringify(data).slice(0, 500));
      return { statusCode: 502, body: JSON.stringify({ error: "Gemini returned an empty reply" }) };
    }

    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reply }) };
  } catch (err) {
    console.error("jiya: uncaught error,", err && err.stack || err);
    return { statusCode: 502, body: JSON.stringify({ error: "Request to Gemini failed", detail: String(err && err.message || err) }) };
  }
};
