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
  const alias = /latest/.test(name) ? 2000 : 0; // "-latest" names can silently switch to a slower thinking model
  return preview + lite + alias - version;
}

async function listModels(apiKey) {
  if (listCache && Date.now() - listCache.at < 6 * 3600 * 1000) return listCache.names;
  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 1200);
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

// prefer "fast" (chat) puts flash-lite first; "accurate" (photos) puts flash first.
async function candidateModels(apiKey, prefer, maxModels) {
  const wanted = [process.env.GEMINI_MODEL, process.env.GEMINI_FALLBACK_MODEL].map(clean).filter(Boolean);
  const pins = prefer === "fast" ? ["gemini-2.5-flash-lite", "gemini-2.5-flash"] : ["gemini-2.5-flash", "gemini-2.5-flash-lite"];
  const available = await listModels(apiKey); // null when the list could not be fetched
  const ok = (n) => !available || available.includes(n);
  let list = wanted.filter((n) => {
    if (ok(n)) return true;
    console.error("gemini: configured model '" + n + "' is not available for this key - skipping it");
    return false;
  });
  list = list.concat(pins.filter(ok));
  if (available) list = list.concat(available);
  return list.filter((m, i, a) => a.indexOf(m) === i && !badModels.has(m)).slice(0, maxModels || 3);
}

function needsNoThinking(model) {
  return model.startsWith("gemini-3") ? { thinkingLevel: "low" } : { thinkingBudget: 0 };
}

// Sends the request to the best model. If it has not answered after hedgeMs, or fails, the next model
// is started AT THE SAME TIME and whichever answers first (and passes accept) wins - so one tap is enough.
// Returns a Response (check .ok).
async function generate(apiKey, requestBody, opts = {}) {
  const deadline = Date.now() + (opts.deadlineMs || DEADLINE_MS);
  const hedgeMs = opts.hedgeMs || 2500;
  const sequential = !!opts.sequential; // true = never send parallel requests; next model only after the previous one failed
  const accept = opts.accept || (() => true);
  const models = await candidateModels(apiKey, opts.prefer, opts.maxModels);
  return new Promise((resolve) => {
    let next = 0;
    let running = 0;
    let done = false;
    let hedgeTimer = null;
    let last = new Response("busy", { status: 503 });
    const controllers = [];
    const finish = (res) => {
      if (done) return;
      done = true;
      clearTimeout(hedgeTimer);
      clearTimeout(hardStop);
      controllers.forEach((c) => c.abort());
      resolve(res);
    };
    const hardStop = setTimeout(() => finish(last), Math.max(0, deadline - Date.now() - 100));

    async function run(model) {
      for (let attempt = 0; attempt < 2; attempt += 1) {
        const left = deadline - Date.now() - 300;
        if (left < 1200) return null;
        const body = JSON.parse(JSON.stringify(requestBody));
        body.generationConfig = body.generationConfig || {};
        if (attempt === 0) body.generationConfig.thinkingConfig = needsNoThinking(model);
        else delete body.generationConfig.thinkingConfig;
        const ctl = new AbortController();
        controllers.push(ctl);
        const timer = setTimeout(() => ctl.abort(), left);
        try {
          const res = await fetch(BASE + "models/" + model + ":generateContent", {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
            body: JSON.stringify(body),
            signal: ctl.signal,
          });
          if (res.ok) {
            const data = await res.json();
            clearTimeout(timer);
            if (accept(data)) return new Response(JSON.stringify(data), { status: 200 });
            console.error("gemini: " + model + " gave an unusable answer - trying another model");
            return null;
          }
          clearTimeout(timer);
          const text = await res.text().catch(() => "");
          console.error("gemini: " + model + " answered " + res.status + " - " + text.slice(0, 200));
          last = new Response(text, { status: res.status });
          if (res.status === 404) badModels.add(model);
          if (res.status === 400 && /thinking/i.test(text) && attempt === 0) continue; // retry this model without that setting
          if (res.status === 401 || res.status === 403) return last; // key problem - other models will not help
          return null;
        } catch (err) {
          clearTimeout(timer);
          if (!done) console.error("gemini: " + model + " failed - " + (err && err.name === "AbortError" ? "timed out" : err));
          last = new Response("timeout", { status: 504 });
          return null;
        }
      }
      return null;
    }

    const launch = () => {
      if (done) return;
      clearTimeout(hedgeTimer);
      if (next >= models.length || deadline - Date.now() < 1500) {
        if (running === 0) finish(last);
        return;
      }
      const model = models[next++];
      running += 1;
      run(model).then((res) => {
        running -= 1;
        if (res) finish(res);
        else launch();
      });
      if (!sequential) hedgeTimer = setTimeout(launch, hedgeMs);
    };
    launch();
  });
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
