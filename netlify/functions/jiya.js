// Serverless proxy for the Jiya AI coach.
// Keeps the Gemini API key on the server - the browser never sees it.
// Frontend contract (see fetchJiyaReply in script.js):
//   POST /api/jiya  { message, profile, targets, history: [{role, text}] }
//   -> 200 { reply: string }

const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models/";

// Gemini sometimes answers 503 "high demand" for a few seconds. Retry, then try an optional backup model.
const MODEL_LIST = [MODEL, process.env.GEMINI_FALLBACK_MODEL].filter((m, i, a) => m && a.indexOf(m) === i);
// Tell the app (and you, in the Netlify logs) WHY Gemini failed instead of one vague message.
function failure(status, text) {
  const t = String(text || "");
  let reason = "other";
  let code = 502;
  if (status === 429 || /RESOURCE_EXHAUSTED|quota/i.test(t)) { reason = "quota"; code = 429; }
  else if (status === 503 || /UNAVAILABLE|high demand|overloaded/i.test(t)) { reason = "busy"; code = 503; }
  else if (status === 504 || /timeout/i.test(t)) { reason = "timeout"; code = 503; }
  else if (status === 401 || status === 403 || /API key/i.test(t)) { reason = "key"; }
  else if (status === 404 || /not found|no longer available/i.test(t)) { reason = "model"; }
  return { statusCode: code, body: JSON.stringify({ error: "Gemini request failed", reason, upstream: status, detail: t.slice(0, 300) }) };
}

async function fetchWithRetry(options) {
  // Netlify stops free functions at ~10 s, so answer before that: tidy "busy" beats a raw 504.
  const deadline = Date.now() + 8300;
  let last = new Response("busy", { status: 503 });
  for (const model of MODEL_LIST) {
    const hasBackup = MODEL_LIST.length > 1;
    for (let attempt = 0; attempt < (hasBackup ? 1 : 2); attempt += 1) { // with a backup model: one try each, so the backup always gets a turn
      const left = deadline - Date.now();
      if (left < 2500) return last;
      const body = JSON.parse(options.body);
      body.generationConfig = body.generationConfig || {};
      body.generationConfig.thinkingConfig = model.startsWith("gemini-3") ? { thinkingLevel: "low" } : { thinkingBudget: 0 };
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), hasBackup && model === MODEL_LIST[0] ? Math.min(left - 300, 4500) : left - 300); // main model gets 4.5 s, then the backup takes over
      try {
        last = await fetch(GEMINI_BASE + model + ":generateContent", { ...options, body: JSON.stringify(body), signal: ctl.signal });
        clearTimeout(timer);
        if (last.ok || ![500, 502, 503, 504].includes(last.status)) return last; // never retry a quota (429) error: it only burns more quota
      } catch (err) {
        clearTimeout(timer);
        last = new Response("timeout", { status: 504 });
      }
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
  }
  return last;
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
    "Reply in 2-3 short, practical sentences (under 60 words) tailored to the user's own data below. " +
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
    const response = await fetchWithRetry({
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: { maxOutputTokens: 400, temperature: 0.7, thinkingConfig: { thinkingLevel: "low" } },
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("jiya: Gemini request failed,", response.status, detail.slice(0, 500));
      return failure(response.status, detail);
    }

    const data = await response.json();
    const parts = data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts;
    const raw = Array.isArray(parts) ? parts.map((p) => p.text || "").join("").trim() : "";
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
