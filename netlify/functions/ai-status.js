// Diagnostic endpoint: open https://YOUR-SITE/api/ai-status in a browser to see which AI providers work right now.
// Optional: set DIAG_TOKEN in Netlify and open /api/ai-status?token=THAT_VALUE. Never shows any key.
const { backupConfig, callBackup } = require("./_backup");
const BASE = "https://generativelanguage.googleapis.com/v1beta/";

async function testGemini(apiKey, model) {
  const t0 = Date.now();
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 6000);
  try {
    const res = await fetch(BASE + "models/" + model + ":generateContent", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: "Reply with the word ok" }] }], generationConfig: { maxOutputTokens: 5, thinkingConfig: { thinkingBudget: 0 } } }),
      signal: ctl.signal,
    });
    const text = res.ok ? "" : (await res.text()).slice(0, 250);
    return { model, status: res.status, ok: res.ok, ms: Date.now() - t0, error: text || undefined };
  } catch (err) {
    return { model, status: 0, ok: false, ms: Date.now() - t0, error: err && err.name === "AbortError" ? "timed out" : String(err) };
  } finally {
    clearTimeout(timer);
  }
}

exports.handler = async (event) => {
  const need = process.env.DIAG_TOKEN;
  if (need && ((event.queryStringParameters || {}).token || "") !== need) {
    return { statusCode: 403, body: JSON.stringify({ error: "forbidden" }) };
  }
  const report = { time: new Date().toISOString() };
  const key = process.env.GEMINI_API_KEY;
  report.gemini = key ? { keySet: true, tests: await Promise.all(["gemini-2.5-flash", "gemini-2.5-flash-lite"].map((m) => testGemini(key, m))) } : { keySet: false };
  const groqKey = (process.env.GROQ_API_KEY || "").trim();
  if (groqKey) {
    const model = (process.env.GROQ_MODEL || "qwen/qwen3.8-27b").trim();
    const t0 = Date.now();
    try {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 6000);
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: "Bearer " + groqKey },
        body: JSON.stringify({ model, max_tokens: 10, messages: [{ role: "user", content: "Reply with the word ok" }] }),
        signal: ctl.signal,
      });
      clearTimeout(timer);
      report.groq = { keySet: true, model, ok: res.ok, status: res.status, ms: Date.now() - t0, error: res.ok ? undefined : (await res.text()).slice(0, 250) };
    } catch (err) {
      report.groq = { keySet: true, model, ok: false, status: 0, ms: Date.now() - t0, error: err && err.name === "AbortError" ? "timed out" : String(err) };
    }
  } else {
    report.groq = { keySet: false, hint: "Set GROQ_API_KEY in Netlify environment variables" };
  }
  // Jiya's chat providers: which models would really be used right now, and does a test message work?
  const chat = require("./_chat");
  report.jiya = {};
  const orKey = (process.env.OPENROUTER_API_KEY || "").trim();
  async function testChat(provider, key, models) {
    const model = models[0];
    if (!model) return { keySet: true, ok: false, error: "no model found" };
    const r = await chat.callCompat({
      provider, model, key,
      url: (provider === "groq" ? chat.GROQ_BASE : chat.OR_BASE) + "chat/completions",
      headers: provider === "openrouter" ? { "X-Title": "FlexFit AI" } : null,
      system: "Reply with the word ok", turns: [], message: "ok", maxTokens: 20, timeoutMs: 6000,
    });
    return { keySet: true, modelsInOrder: models.slice(0, 4), tested: model, ok: r.ok, status: r.status, ms: r.ms, error: r.ok ? undefined : String(r.error).slice(0, 250) };
  }
  report.jiya.groq = groqKey ? await testChat("groq", groqKey, await chat.groqModels(groqKey)) : { keySet: false };
  report.jiya.openrouter = orKey ? await testChat("openrouter", orKey, await chat.openrouterModels()) : { keySet: false, hint: "Set OPENROUTER_API_KEY in Netlify environment variables (optional)" };
  const cfg = backupConfig();
  if (cfg) {
    const r = await callBackup(cfg, { text: "Reply with the word ok", timeoutMs: 6000, maxTokens: 10 });
    report.backup = { configured: true, provider: cfg.provider, model: cfg.model, ok: r.ok, status: r.status, ms: r.ms, error: r.ok ? undefined : String(r.error).slice(0, 250) };
  } else {
    report.backup = { configured: false, hint: "Set BACKUP_API_KEY (and BACKUP_PROVIDER / BACKUP_MODEL) in Netlify environment variables" };
  }
  return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify(report, null, 2) };
};
