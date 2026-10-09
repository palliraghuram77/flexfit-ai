// Backup AI provider, used only when Gemini fails (quota, timeout, outage).
// Configure in Netlify > Site settings > Environment variables:
//   BACKUP_API_KEY   (required)  key for the backup provider
//   BACKUP_PROVIDER  openai (default) | anthropic | groq | openrouter
//   BACKUP_MODEL     optional for openai/anthropic, REQUIRED for groq/openrouter (must be a vision model)
//   BACKUP_URL       optional, override the endpoint
const DEFAULTS = {
  openai: { url: "https://api.openai.com/v1/chat/completions", model: "gpt-4o-mini" },
  anthropic: { url: "https://api.anthropic.com/v1/messages", model: "claude-haiku-5-5" },
  groq: { url: "https://api.groq.com/openai/v1/chat/completions", model: "" },
  openrouter: { url: "https://openrouter.ai/api/v1/chat/completions", model: "" },
};

function backupConfig() {
  const key = process.env.BACKUP_API_KEY;
  if (!key) return null;
  const provider = (process.env.BACKUP_PROVIDER || "openai").trim().toLowerCase();
  const d = DEFAULTS[provider];
  if (!d) {
    console.error("backup: unknown BACKUP_PROVIDER '" + provider + "'");
    return null;
  }
  const model = (process.env.BACKUP_MODEL || d.model || "").trim();
  if (!model) {
    console.error("backup: BACKUP_MODEL is required for provider '" + provider + "'");
    return null;
  }
  return { key: key.trim(), provider, model, url: (process.env.BACKUP_URL || d.url).trim() };
}

// Returns { ok, status, text, ms, error }. Never throws.
async function callBackup(cfg, { text, image, mimeType, timeoutMs, maxTokens, json }) {
  const t0 = Date.now();
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), Math.max(500, timeoutMs || 5000));
  try {
    let headers;
    let body;
    if (cfg.provider === "anthropic") {
      headers = { "content-type": "application/json", "x-api-key": cfg.key, "anthropic-version": "2023-06-01" };
      const content = [];
      if (image) content.push({ type: "image", source: { type: "base64", media_type: mimeType || "image/jpeg", data: image } });
      content.push({ type: "text", text });
      body = { model: cfg.model, max_tokens: maxTokens || 1200, temperature: 0.2, messages: [{ role: "user", content }] };
    } else {
      headers = { "content-type": "application/json", authorization: "Bearer " + cfg.key };
      const content = [{ type: "text", text }];
      if (image) content.push({ type: "image_url", image_url: { url: "data:" + (mimeType || "image/jpeg") + ";base64," + image } });
      body = { model: cfg.model, max_tokens: maxTokens || 1200, temperature: 0.2, messages: [{ role: "user", content }] };
      if (json && cfg.provider === "openai") body.response_format = { type: "json_object" };
    }
    const res = await fetch(cfg.url, { method: "POST", headers, body: JSON.stringify(body), signal: ctl.signal });
    const raw = await res.text();
    if (!res.ok) return { ok: false, status: res.status, error: raw.slice(0, 300), ms: Date.now() - t0 };
    const data = JSON.parse(raw);
    const out =
      cfg.provider === "anthropic"
        ? (data.content || []).filter((c) => c.type === "text").map((c) => c.text).join("")
        : data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    return { ok: true, status: 200, text: String(out || "").trim(), ms: Date.now() - t0 };
  } catch (err) {
    return { ok: false, status: err && err.name === "AbortError" ? 504 : 502, error: String((err && err.message) || err), ms: Date.now() - t0 };
  } finally {
    clearTimeout(timer);
  }
}

// Pulls the first {...} block out of a reply (handles ```json fences and chatter).
function extractJson(text) {
  const t = String(text || "").replace(/```(?:json)?/gi, "");
  const a = t.indexOf("{");
  const b = t.lastIndexOf("}");
  if (a < 0 || b <= a) return null;
  try {
    return JSON.parse(t.slice(a, b + 1));
  } catch (e) {
    return null;
  }
}

module.exports = { backupConfig, callBackup, extractJson };
