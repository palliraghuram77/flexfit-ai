// Tests scan-food.js with FAKE AI servers (no internet needed). Run: node tests/check-scanner.js
const path = require("path");
const fnDir = path.join(__dirname, "..", "netlify", "functions");
let bad = 0;
const ok = (c, m) => { if (!c) { bad++; console.log("FAIL:", m); } else console.log("ok  :", m); };
const resp = (status, body) => ({ ok: status >= 200 && status < 300, status, text: async () => (typeof body === "string" ? body : JSON.stringify(body)), json: async () => (typeof body === "string" ? JSON.parse(body) : body) });
const groqReply = (content) => resp(200, { choices: [{ message: { content } }] });
const PLATE = JSON.stringify({ items: [
  { name: "Folded omelette", key: "omelette", grams: 100, calories: 0, protein: 0, carbs: 0, fat: 0 },
  { name: "Carrot slices", key: "carrot", grams: 40, calories: 0, protein: 0, carbs: 0, fat: 0 },
  { name: "Cucumber", key: "cucumber", grams: 60, calories: 0, protein: 0, carbs: 0, fat: 0 },
  { name: "Beetroot", key: "beetroot", grams: 50, calories: 0, protein: 0, carbs: 0, fat: 0 },
  { name: "Steamed rice", key: "white rice", grams: 150, calories: 0, protein: 0, carbs: 0, fat: 0 },
  { name: "Mystery dessert", key: "other", grams: 80, calories: 200, protein: 3, carbs: 30, fat: 8 },
] });
const ev = (extra) => Object.assign({ httpMethod: "POST", body: JSON.stringify({ image: "AAAA".repeat(1000), mimeType: "image/jpeg" }) }, extra || {});
function load() { Object.keys(require.cache).forEach((k) => { if (k.startsWith(fnDir)) delete require.cache[k]; }); return require(path.join(fnDir, "scan-food.js")); }
function env(o) { ["GROQ_API_KEY", "GROQ_MODEL", "GEMINI_API_KEY", "BACKUP_API_KEY", "BACKUP_PROVIDER", "BACKUP_MODEL"].forEach((k) => delete process.env[k]); Object.assign(process.env, o); }

(async () => {
  // 1. Happy path
  env({ GROQ_API_KEY: "gsk_test" });
  let calls = [];
  global.fetch = async (url, opt) => { calls.push(JSON.parse(opt.body)); return groqReply(PLATE); };
  let r = await load().handler(ev());
  let b = JSON.parse(r.body);
  ok(r.statusCode === 200 && b.items.length === 6, "happy path returns 6 items");
  ok(calls.length === 1 && calls[0].model === "qwen/qwen3.8-27b" && calls[0].reasoning_effort === "none", "one Groq call, thinking off, right model");
  const om = b.items[0];
  ok(om.calories === 185 && om.protein === 11 && om.fat === 14, "omelette 100g = 185 kcal from table");
  ok(b.items[4].calories === 195, "rice 150g = 195 kcal");
  ok(b.items[5].calories === 200 && b.items[5].source === "ai", "unknown dessert keeps AI numbers");
  const sum = b.items.reduce((s, i) => s + i.calories, 0);
  ok(Math.abs(sum - b.calories) <= 1, "total " + b.calories + " matches items " + sum.toFixed(1));
  ok(b.items.every((i) => ["name", "grams", "calories", "protein", "carbs", "fat"].every((k) => k in i)), "every item has the fields the app needs");
  console.log("   total:", b.calories, "kcal P", b.protein, "C", b.carbs, "F", b.fat, "via", b.provider);

  // 2. Groq rejects options (400) -> retries simpler
  calls = [];
  global.fetch = async (u, o) => { const j = JSON.parse(o.body); calls.push(j); return j.reasoning_effort ? resp(400, "unknown param reasoning_effort") : groqReply("<think>hmm</think>```json\n" + PLATE + "\n```"); };
  r = await load().handler(ev()); b = JSON.parse(r.body);
  ok(r.statusCode === 200 && calls.length === 2 && !calls[1].reasoning_effort, "400 -> retried without reasoning_effort, and <think>/fences parsed");

  // 3. Main model missing (404) -> second Groq model
  calls = [];
  global.fetch = async (u, o) => { const j = JSON.parse(o.body); calls.push(j.model); return j.model === "qwen/qwen3.8-27b" ? resp(404, "model not found") : groqReply(PLATE); };
  r = await load().handler(ev()); b = JSON.parse(r.body);
  ok(r.statusCode === 200 && b.provider === "groq:qwen/qwen3.6-27b", "model 3.8 missing -> falls to 3.6 (" + calls.join(",") + ")");

  // 4. Groq quota (429) -> Gemini fallback
  env({ GROQ_API_KEY: "gsk_test", GEMINI_API_KEY: "g_test" });
  calls = [];
  global.fetch = async (url, o) => {
    calls.push(url.includes("groq") ? "groq" : "gemini");
    if (url.includes("groq")) return resp(429, "rate limit");
    if (url.includes("models?pageSize")) return resp(200, { models: [{ name: "models/gemini-2.5-flash", supportedGenerationMethods: ["generateContent"] }] });
    return resp(200, { candidates: [{ content: { parts: [{ text: PLATE }] } }] });
  };
  r = await load().handler(ev()); b = JSON.parse(r.body);
  ok(r.statusCode === 200 && b.provider === "gemini" && calls.filter((c) => c === "groq").length === 1, "Groq 429 -> exactly 1 Groq call, then Gemini answers");

  // 5. Bad Groq key and nothing else
  env({ GROQ_API_KEY: "bad" });
  global.fetch = async () => resp(401, "invalid_api_key");
  r = await load().handler(ev()); b = JSON.parse(r.body);
  ok(r.statusCode === 503 && b.reason === "key", "bad key -> friendly 503 reason=key");

  // 6. Junk reply everywhere
  global.fetch = async () => groqReply("Sorry, I cannot help");
  r = await load().handler(ev());
  ok(r.statusCode === 503, "unusable AI text -> clean 503, no crash");

  // 7. Empty plate
  global.fetch = async () => groqReply('{"items":[]}');
  r = await load().handler(ev()); b = JSON.parse(r.body);
  ok(r.statusCode === 200 && b.items.length === 0, "no food -> empty items (app shows 'No food items detected')");

  // 8. Timeout (fetch never answers, honours abort)
  env({ GROQ_API_KEY: "gsk_test" });
  global.fetch = (u, o) => new Promise((_, rej) => o.signal.addEventListener("abort", () => { const e = new Error("aborted"); e.name = "AbortError"; rej(e); }));
  const t0 = Date.now();
  r = await load().handler(ev());
  ok(r.statusCode === 503 && Date.now() - t0 < 9500, "hung AI -> gives up in " + (Date.now() - t0) + " ms (< 10 s Netlify limit)");

  // 9. Input guards
  env({ GROQ_API_KEY: "gsk_test" });
  let m = load();
  ok((await m.handler({ httpMethod: "GET" })).statusCode === 405, "GET -> 405");
  ok((await m.handler(ev({ body: "{bad" }))).statusCode === 400, "bad JSON -> 400");
  ok((await m.handler(ev({ body: "{}" }))).statusCode === 400, "no image -> 400");
  ok((await m.handler(ev({ body: JSON.stringify({ image: "A".repeat(6100000) }) }))).statusCode === 413, "huge image -> 413");
  env({});
  ok((await load().handler(ev())).statusCode === 500, "no keys at all -> 500");

  // 10. Matching on typical Indian meals
  const T = load()._test;
  const cases = [["Roti", "roti"], ["Dal tadka", "other"], ["Paneer Butter Masala", "other"], ["Plain Curd", "other"], ["2 idlis", "idli"], ["Jeera Rice", "other"], ["Boiled eggs", "other"], ["Tea", "chai"], ["Mixed salad with onion", "other"], ["Chicken Biryani", "other"], ["Aloo Gobi", "other"], ["Masala Chai", "other"]];
  cases.forEach(([n, k]) => { const f = T.matchFood(k, n); console.log("   match:", n.padEnd(24), "->", f ? f.key : "(not in table -> AI numbers)"); });
  ok(T.matchFood("other", "Dal tadka").key === "dal" && T.matchFood("other", "Chicken Biryani").key === "chicken biryani" && T.matchFood("other", "Aloo Gobi").key === "aloo sabzi", "common dishes match the right table row");
  ok(T.matchFood("", "Zzzxqy") === null, "unknown food -> null");
  console.log(bad ? "\n" + bad + " FAILED" : "\nALL SCANNER TESTS PASSED");
  process.exit(bad ? 1 : 0);
})();
