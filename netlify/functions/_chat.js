// Shared chat helper for Jiya (used by jiya.js and ai-status.js).
//
// In plain words:
//   * It can talk to Groq and OpenRouter (both use the same "OpenAI-style" API).
//   * It asks each provider which models exist RIGHT NOW, so a retired model name can never break Jiya.
//   * If a model says "too many requests" (429) it is skipped for a short while, so the next
//     message goes straight to a model that works instead of failing again.
//   * race() starts the best option first and, if it is slow or fails, starts the next one at the same
//     time. Whoever gives a good answer first wins.
//
// Netlify environment variables (all optional except that you need at least ONE AI key overall):
//   GROQ_API_KEY         key from console.groq.com
//   JIYA_GROQ_MODEL      optional, comma list of Groq models to try first
//   OPENROUTER_API_KEY   key from openrouter.ai/keys
//   OPENROUTER_MODEL     optional, comma list of OpenRouter models to try first (e.g. a paid one)

const GROQ_BASE = "https://api.groq.com/openai/v1/";
const OR_BASE = "https://openrouter.ai/api/v1/";
const LIST_TTL = 6 * 3600 * 1000;

const listCache = { groq: null, openrouter: null };
const cooldown = new Map(); // "provider:model" -> time (ms) until which it is skipped
const dead = new Set(); // models that no longer exist (skipped for this warm start)
const keyBad = new Map(); // provider -> time until which a rejected key is not retried

const envList = (name) => String(process.env[name] || "").split(",").map((s) => s.trim()).filter(Boolean);
const rank = (name, prefs) => {
  const i = prefs.findIndex((re) => re.test(name));
  return i < 0 ? 99 : i;
};

async function fetchJson(url, headers, ms) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), ms);
  try {
    const res = await fetch(url, { headers, signal: ctl.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// ---------- which models can we use? ----------

const GROQ_PREFER = [/llama-3\.3-70b/, /gpt-oss-120b/, /llama-4/, /gpt-oss-20b/, /llama-3\.1-8b/, /kimi/, /qwen/];
const GROQ_SKIP = /whisper|tts|orpheus|playai|guard|safeguard|embed|compound|vision|image|audio|moderation/i;

async function groqModels(key) {
  let found = listCache.groq && Date.now() - listCache.groq.at < LIST_TTL ? listCache.groq.names : null;
  if (!found) {
    const data = await fetchJson(GROQ_BASE + "models", { authorization: "Bearer " + key }, 1500);
    const names = data && Array.isArray(data.data)
      ? data.data.filter((m) => m && m.active !== false).map((m) => String(m.id || "")).filter((id) => id && !GROQ_SKIP.test(id))
      : [];
    if (names.length) {
      names.sort((a, b) => rank(a, GROQ_PREFER) - rank(b, GROQ_PREFER));
      listCache.groq = { names, at: Date.now() };
      found = names;
    }
  }
  const base = found ? found.slice(0, 4) : ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];
  return envList("JIYA_GROQ_MODEL").concat(base).filter((m, i, a) => a.indexOf(m) === i);
}

const OR_PREFER = [/llama-3\.3-70b/, /gpt-oss-120b/, /gpt-oss-20b/, /gemma/, /qwen/, /mistral/, /llama/];
const OR_SKIP = /vision|image|audio|embed|guard|safeguard|moderation|-vl|vl-|coder|thinking|reasoning|(^|[-\/])r1($|[-:])|lyria|veo|tts|whisper|search|research|sonar/i;

async function openrouterModels() {
  let found = listCache.openrouter && Date.now() - listCache.openrouter.at < LIST_TTL ? listCache.openrouter.names : null;
  if (!found) {
    const data = await fetchJson(OR_BASE + "models", {}, 2000);
    const names = data && Array.isArray(data.data)
      ? data.data
          .filter((m) => m && typeof m.id === "string")
          .filter((m) => m.id.endsWith(":free") || (m.pricing && Number(m.pricing.prompt) === 0 && Number(m.pricing.completion) === 0))
          .filter((m) => !OR_SKIP.test(m.id))
          .filter((m) => !(m.architecture && Array.isArray(m.architecture.output_modalities)) || m.architecture.output_modalities.includes("text"))
          .filter((m) => !m.context_length || m.context_length >= 8000)
          .sort((a, b) => rank(a.id, OR_PREFER) - rank(b.id, OR_PREFER) || (b.context_length || 0) - (a.context_length || 0))
          .map((m) => m.id)
      : [];
    if (names.length) {
      listCache.openrouter = { names, at: Date.now() };
      found = names;
    }
  }
  const base = found ? found.slice(0, 5) : ["openrouter/free"];
  return envList("OPENROUTER_MODEL").concat(base).filter((m, i, a) => a.indexOf(m) === i);
}

// ---------- remembering who is busy ----------

function usable(provider, model) {
  const id = provider + ":" + model;
  if (dead.has(id)) return false;
  if ((cooldown.get(id) || 0) > Date.now()) return false;
  if ((keyBad.get(provider) || 0) > Date.now()) return false;
  return true;
}

function penalize(provider, model, status, body) {
  const id = provider + ":" + model;
  const text = String(body || "");
  if (status === 429) cooldown.set(id, Date.now() + 45000);
  else if (status === 402) cooldown.set(id, Date.now() + 10 * 60000); // OpenRouter: out of credit
  else if (status === 404 || (status === 400 && /decommission|not found|does not exist|no longer supported/i.test(text))) dead.add(id);
  else if (status === 401 || status === 403) keyBad.set(provider, Date.now() + 10 * 60000);
  else if (status >= 500) cooldown.set(id, Date.now() + 10000);
}

// ---------- reading answers ----------

function stripThink(text) {
  let t = String(text || "");
  if (t.includes("</think>")) t = t.slice(t.lastIndexOf("</think>") + 8);
  return t.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}

// Index of the last real sentence end. A list number such as "1." is NOT a sentence end.
function lastSentenceEnd(text) {
  let last = -1;
  const re = /[.!?](?=\s|$)/g;
  let m;
  while ((m = re.exec(text))) {
    const before = text.slice(0, m.index);
    if (m[0] === "." && /(^|\s)\d{1,2}$/.test(before)) continue;
    last = m.index;
  }
  return last;
}

// Reject empty answers and answers that leak the model's own notes.
function accept(text) {
  const t = String(text || "").trim();
  return t.length > 3 && !/sentences?\)|under \d+ words|word count|^\s*\*\s/i.test(t);
}

// ---------- one request to an OpenAI-style API ----------
// Returns { ok, status, text, error }. Never throws.
async function callCompat(o) {
  const t0 = Date.now();
  const messages = [{ role: "system", content: o.system }].concat(o.turns || []).concat([{ role: "user", content: o.message }]);
  const extra = o.provider === "groq" ? (/gpt-oss/.test(o.model) ? { reasoning_effort: "low" } : /qwen/.test(o.model) ? { reasoning_effort: "none" } : null) : null;
  const shapes = extra ? [extra, {}] : [{}]; // some models reject the extra option: a 400 retries without it
  let last = { ok: false, status: 502, error: "no attempt made" };
  for (const shape of shapes) {
    const left = o.timeoutMs - (Date.now() - t0);
    if (left < 600) return { ok: false, status: 504, error: "ran out of time" };
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), left);
    const onAbort = () => ctl.abort();
    if (o.signal) o.signal.addEventListener("abort", onAbort, { once: true });
    try {
      const res = await fetch(o.url, {
        method: "POST",
        headers: Object.assign({ "content-type": "application/json", authorization: "Bearer " + o.key }, o.headers || {}),
        body: JSON.stringify(Object.assign({ model: o.model, messages, max_tokens: o.maxTokens || 700, temperature: 0.5 }, shape)),
        signal: ctl.signal,
      });
      const raw = await res.text();
      if (res.ok) {
        let data;
        try { data = JSON.parse(raw); } catch (e) { return { ok: false, status: 502, error: "reply was not JSON" }; }
        const choice = data && data.choices && data.choices[0];
        let text = stripThink(choice && choice.message && choice.message.content);
        if (!text) {
          penalize(o.provider, o.model, 500, "");
          return { ok: false, status: 502, error: "empty answer: " + raw.slice(0, 200) };
        }
        if (choice.finish_reason === "length") {
          const end = lastSentenceEnd(text);
          if (end > 40) text = text.slice(0, end + 1);
        }
        return { ok: true, status: 200, text, ms: Date.now() - t0 };
      }
      last = { ok: false, status: res.status, error: raw.slice(0, 300) };
      penalize(o.provider, o.model, res.status, raw);
      if (res.status !== 400) return last;
    } catch (err) {
      return { ok: false, status: err && err.name === "AbortError" ? 504 : 502, error: String((err && err.message) || err) };
    } finally {
      clearTimeout(timer);
      if (o.signal) o.signal.removeEventListener("abort", onAbort);
    }
  }
  return last;
}

// ---------- ready-made attempts for the race ----------
// ctx = { system, turns: [{role:"user"|"assistant", content}], message, maxTokens }
function slotAttempt(provider, slot, key, ctx) {
  return {
    label: provider + "#" + slot,
    async run(signal, left) {
      const all = provider === "groq" ? await groqModels(key) : await openrouterModels();
      const model = all.filter((m) => usable(provider, m))[slot];
      if (!model) return { text: "", status: 0, error: provider + ": no model available right now" };
      const r = await callCompat({
        provider,
        model,
        key,
        url: (provider === "groq" ? GROQ_BASE : OR_BASE) + "chat/completions",
        headers: provider === "openrouter" ? { "HTTP-Referer": process.env.URL || "https://flexfit.app", "X-Title": "FlexFit AI" } : null,
        system: ctx.system,
        turns: ctx.turns,
        message: ctx.message,
        maxTokens: ctx.maxTokens,
        signal,
        timeoutMs: left,
      });
      if (r.ok && accept(r.text)) return { text: r.text, via: provider + ":" + model };
      return { text: "", status: r.status, error: r.error || "unusable answer" };
    },
  };
}

function buildAttempts(ctx) {
  const out = { groq: [], openrouter: [] };
  const groqKey = String(process.env.GROQ_API_KEY || "").trim();
  const orKey = String(process.env.OPENROUTER_API_KEY || "").trim();
  if (groqKey) [0, 1].forEach((slot) => out.groq.push(slotAttempt("groq", slot, groqKey, ctx)));
  if (orKey) [0, 1].forEach((slot) => out.openrouter.push(slotAttempt("openrouter", slot, orKey, ctx)));
  return out;
}

// ---------- the race ----------
// attempts: [{ label, run(signal, msLeft) -> { text, via?, status?, error? } }]
// Starts attempt #1. If it fails, or has not answered after hedgeMs, starts the next one WITHOUT stopping the
// first. The first good answer wins and the others are cancelled.
function race(attempts, opts) {
  const deadlineMs = (opts && opts.deadlineMs) || 9000;
  const hedgeMs = (opts && opts.hedgeMs) || 2000;
  return new Promise((resolve) => {
    const t0 = Date.now();
    const errors = [];
    const controllers = [];
    let next = 0;
    let running = 0;
    let done = false;
    let hedge = null;
    const finish = (value) => {
      if (done) return;
      done = true;
      clearTimeout(hedge);
      clearTimeout(hard);
      controllers.forEach((c) => c.abort());
      resolve(Object.assign({ errors }, value));
    };
    const hard = setTimeout(() => finish({ text: "" }), deadlineMs);
    const launch = () => {
      if (done) return;
      clearTimeout(hedge);
      const left = deadlineMs - (Date.now() - t0) - 150;
      if (next >= attempts.length || left < 700) {
        if (running === 0) finish({ text: "" });
        return;
      }
      const attempt = attempts[next++];
      running += 1;
      const ctl = new AbortController();
      controllers.push(ctl);
      Promise.resolve()
        .then(() => attempt.run(ctl.signal, left))
        .catch((err) => ({ text: "", status: 502, error: String((err && err.message) || err) }))
        .then((r) => {
          running -= 1;
          if (r && r.text) finish({ text: r.text, provider: r.via || attempt.label });
          else {
            errors.push({ provider: attempt.label, status: r && r.status, error: r && r.error });
            launch();
          }
        });
      hedge = setTimeout(launch, hedgeMs);
    };
    launch();
  });
}

module.exports = { buildAttempts, race, groqModels, openrouterModels, callCompat, accept, lastSentenceEnd, stripThink, GROQ_BASE, OR_BASE };
