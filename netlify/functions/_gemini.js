// Shared Gemini helper for jiya.js and scan-food.js.
// It asks Google which models your key can really use, so a wrong or retired model name
// in Netlify can never break the app: it quietly picks a working "flash" model instead.
const BASE = "https://generativelanguage.googleapis.com/v1beta/";
const DEADLINE_MS = 8300; // Netlify free functions stop at ~10 s

let listCache = null; // { names: [...], at: ms }
const badModels = new Set(); // models that answered "not found" - skipped for the rest of this warm start

function clean(name) {
  return String(name || "").trim().replace(/^models\//, "");
}

function score(name) {
  // Lower = tried earlier. Stable flash first (fast + accurate), then flash-lite, then previews.
  const version = parseFloat((name.match(/gemini-(\d+(?:\.\d+)?)/) || [0, 0])[1]) || 0;
  const preview = /preview|exp/.test(name) ? 1000 : 0;
  const lite = /lite/.test(name) ? 500 : 0;
  const alias = /latest/.test(name) ? -50 : 0;
  return preview + lite + alias - version;
}

async function listModels(apiKey) {
  if (listCache && Date.now() - listCache.at < 6 * 3600 * 1000) return listCache.names;
  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 2000);
    const res = await fetch(BASE + "models?pageSize=200", { headers: { "x-goog-api-key": apiKey }, signal: ctl.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    const names = (data.models || [])
      .filter((m) => (m.supportedGenerationMethods || []).includes("generateContent"))
      .map((m) => clean(m.name))
      .filter((n) => /^gemini-/.test(n) && /flash/.test(n) && !/image|tts|audio|live|embedding|robotics|computer|native|vision|thinking|learnlm/.test(n))
      .sort((a, b) => score(a) - score(b));
    if (names.length) listCache = { names, at: Date.now() };
    return names.length ? names : null;
  } catch (err) {
    return null;
  }
}

async function candidateModels(apiKey) {
  const wanted = [process.env.GEMINI_MODEL, process.env.GEMINI_FALLBACK_MODEL].map(clean).filter(Boolean);
  const available = await listModels(apiKey); // null when the list could not be fetched
  let list = [];
  for (const name of wanted) {
    if (!available || available.includes(name)) list.push(name);
    else console.error("gemini: configured model '" + name + "' is not available for this key - skipping it");
  }
  if (available) list = list.concat(available);
  else if (!list.length) list = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];
  return list.filter((m, i, a) => a.indexOf(m) === i && !badModels.has(m)).slice(0, 4);
}

function needsNoThinking(model) {
  return model.startsWith("gemini-3") ? { thinkingLevel: "low" } : { thinkingBudget: 0 };
}

// Sends the request to the best model; if one is busy / out of quota / missing, the next one gets a turn.
// Returns the last fetch Response (check .ok).
async function generate(apiKey, requestBody) {
  const deadline = Date.now() + DEADLINE_MS;
  const models = await candidateModels(apiKey);
  let last = new Response("busy", { status: 503 });
  for (let i = 0; i < models.length; i += 1) {
    const model = models[i];
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const left = deadline - Date.now();
      if (left < 2200) return last;
      const body = JSON.parse(JSON.stringify(requestBody));
      body.generationConfig = body.generationConfig || {};
      if (attempt === 0) body.generationConfig.thinkingConfig = needsNoThinking(model);
      else delete body.generationConfig.thinkingConfig; // second try: this model may not accept that setting
      const more = i < models.length - 1;
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), more ? Math.min(left - 300, 4500) : left - 300);
      let retrySame = false;
      try {
        last = await fetch(BASE + "models/" + model + ":generateContent", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
          body: JSON.stringify(body),
          signal: ctl.signal,
        });
        clearTimeout(timer);
        if (last.ok) return last;
        const copy = await last.clone().text().catch(() => "");
        console.error("gemini: " + model + " answered " + last.status + " - " + copy.slice(0, 200));
        if (last.status === 404) badModels.add(model);
        if (last.status === 400 && /thinking/i.test(copy) && attempt === 0) retrySame = true;
        if (last.status === 401 || last.status === 403) return last; // key problem - other models will not help
      } catch (err) {
        clearTimeout(timer);
        last = new Response("timeout", { status: 504 });
        console.error("gemini: " + model + " timed out");
      }
      if (!retrySame) break; // busy / quota / missing: move on to the next model
    }
  }
  return last;
}

// Always reports a friendly, non-technical message to the app; the real reason stays in the Netlify logs.
function failure(status, text) {
  const t = String(text || "");
  let reason = "busy";
  if (status === 429 || /RESOURCE_EXHAUSTED|quota/i.test(t)) reason = "quota";
  else if (status === 401 || status === 403 || /API key/i.test(t)) reason = "key";
  else if (status === 504 || /timeout/i.test(t)) reason = "timeout";
  return { statusCode: 503, body: JSON.stringify({ error: "AI is busy", reason, upstream: status }) };
}

module.exports = { generate, failure };
