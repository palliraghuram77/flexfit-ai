// Serverless proxy for the Food Scanner.
// Keeps the Gemini API key on the server - the browser never sees it.
// Frontend contract (see analyzeFoodPhoto in script.js):
//   POST /api/scan-food  { image: base64String, mimeType: string }
//   -> 200 {
//        items: [{ name, grams, calories, protein, carbs, fat }],
//        calories, protein, carbs, fat   (totals, summed here from items)
//      }

const { generate, failure } = require("./_gemini");
const { backupConfig, callBackup, extractJson } = require("./_backup");

// Only accept an answer that really contains a parsable list of food items.
function scanAccept(data) {
  try {
    const parts = data.candidates[0].content.parts;
    const raw = parts.filter((p) => !p.thought).map((p) => p.text || "").join("").trim();
    return Array.isArray(JSON.parse(raw).items);
  } catch (e) {
    return false;
  }
}
const MAX_BASE64_LENGTH = 6_000_000; // roughly a 4.5MB photo once decoded

const PROMPT =
  "You are an expert nutritionist reading a photo of a meal (often Indian or home-cooked food). " +
  "List EVERY distinct food on the plate as its own item (rice, dal, roti, sabzi, egg, chicken, salad, curd, oil/ghee, sauces...). Name each dish specifically (e.g. 'jeera rice', 'paneer butter masala', 'fried egg'). " +
  "Estimate each portion in grams of the COOKED, served food, using the plate, bowl, spoon or hand as size references; a standard dinner plate is about 25 cm. " +
  "Then give calories, protein, carbs and fat for that portion using standard nutrition data per 100 g, adding visible cooking oil or ghee. " +
  "Be realistic and consistent: calories must roughly equal 4*protein + 4*carbs + 9*fat. One best-estimate number per field, no ranges. " +
  "If there is no food in the image, return an empty items array.";

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    items: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          grams: { type: "NUMBER" },
          calories: { type: "NUMBER" },
          protein: { type: "NUMBER" },
          carbs: { type: "NUMBER" },
          fat: { type: "NUMBER" },
        },
        required: ["name", "grams", "calories", "protein", "carbs", "fat"],
      },
    },
  },
  required: ["items"],
};

const BACKUP_JSON_HINT =
  '\n\nReply with ONLY a JSON object, no other text, in exactly this shape: ' +
  '{"items":[{"name":"","grams":0,"calories":0,"protein":0,"carbs":0,"fat":0}]}';
const TOTAL_BUDGET_MS = 9200; // Netlify free functions stop at ~10 s

function cleanItems(parsed) {
  return Array.isArray(parsed && parsed.items)
    ? parsed.items.slice(0, 15).map((item) => ({
        name: String((item && item.name) || "Item").slice(0, 60),
        grams: Number(item && item.grams) || 0,
        calories: Number(item && item.calories) || 0,
        protein: Number(item && item.protein) || 0,
        carbs: Number(item && item.carbs) || 0,
        fat: Number(item && item.fat) || 0,
      }))
    : null;
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const started = Date.now();
  const apiKey = process.env.GEMINI_API_KEY;
  const backup = backupConfig();
  if (!apiKey && !backup) {
    console.error("scan-food: neither GEMINI_API_KEY nor BACKUP_API_KEY is configured");
    return { statusCode: 500, body: JSON.stringify({ error: "No AI key is configured on the server" }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    console.error("scan-food: invalid JSON body from client");
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  const image = payload.image;
  const mimeType = payload.mimeType || "image/jpeg";
  if (!image || typeof image !== "string") {
    console.error("scan-food: missing image in request body");
    return { statusCode: 400, body: JSON.stringify({ error: "image (base64 string) is required" }) };
  }
  if (image.length > MAX_BASE64_LENGTH) {
    console.error("scan-food: image too large,", image.length, "base64 chars");
    return { statusCode: 413, body: JSON.stringify({ error: "Photo is too large - try a smaller image" }) };
  }

  let items = null;
  let provider = null;
  let geminiFail = null; // { status, detail }
  let backupFail = null;

  // 1) Gemini: one model at a time (never parallel, so one tap = as few API calls as possible).
  //    If a backup exists, Gemini only gets ~5 s so the backup still has time to answer.
  if (apiKey) {
    try {
      const response = await generate(
        apiKey,
        {
          contents: [{ role: "user", parts: [{ text: PROMPT }, { inlineData: { mimeType, data: image } }] }],
          generationConfig: { responseMimeType: "application/json", responseSchema: RESPONSE_SCHEMA, maxOutputTokens: 1400, temperature: 0.2 },
        },
        { prefer: "accurate", sequential: true, maxModels: 2, deadlineMs: backup ? 5200 : 8300, accept: scanAccept }
      );
      if (response.ok) {
        const data = await response.json();
        const parts = data.candidates[0].content.parts;
        const raw = parts.filter((p) => !p.thought).map((p) => p.text || "").join("").trim();
        items = cleanItems(JSON.parse(raw));
        if (items) provider = "gemini";
      } else {
        geminiFail = { status: response.status, detail: await response.text() };
        console.error("scan-food: Gemini failed,", geminiFail.status, geminiFail.detail.slice(0, 300));
      }
    } catch (err) {
      geminiFail = { status: 502, detail: String((err && err.message) || err) };
      console.error("scan-food: Gemini error,", err && err.stack || err);
    }
  }

  // 2) Backup provider, only if Gemini did not give a usable answer.
  if (!items && backup) {
    const left = TOTAL_BUDGET_MS - (Date.now() - started);
    if (left > 1500) {
      const r = await callBackup(backup, { text: PROMPT + BACKUP_JSON_HINT, image, mimeType, timeoutMs: left, maxTokens: 1400, json: true });
      if (r.ok) {
        items = cleanItems(extractJson(r.text));
        if (items) provider = backup.provider;
        else console.error("scan-food: backup returned unusable text:", r.text.slice(0, 300));
      } else {
        backupFail = r;
        console.error("scan-food: backup failed,", r.status, String(r.error).slice(0, 300));
      }
    }
  }

  if (!items) {
    const f = geminiFail || { status: backupFail ? backupFail.status : 503, detail: backupFail ? backupFail.error : "" };
    const out = failure(f.status, f.detail);
    const b = JSON.parse(out.body);
    b.backupStatus = backupFail ? backupFail.status : backup ? "unusable" : "not configured";
    out.body = JSON.stringify(b);
    return out;
  }

  // Sum totals ourselves so they always match the per-item numbers shown.
  const totals = items.reduce(
    (sum, item) => ({ calories: sum.calories + item.calories, protein: sum.protein + item.protein, carbs: sum.carbs + item.carbs, fat: sum.fat + item.fat }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
  console.log("scan-food: ok via " + provider + " in " + (Date.now() - started) + " ms");
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items,
      calories: Math.round(totals.calories),
      protein: Math.round(totals.protein),
      carbs: Math.round(totals.carbs),
      fat: Math.round(totals.fat),
      provider,
    }),
  };
};
