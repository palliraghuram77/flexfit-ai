// Serverless proxy for the Food Scanner.
// Keeps the Gemini API key on the server - the browser never sees it.
// Frontend contract (see analyzeFoodPhoto in script.js):
//   POST /api/scan-food  { image: base64String, mimeType: string }
//   -> 200 {
//        items: [{ name, grams, calories, protein, carbs, fat }],
//        calories, protein, carbs, fat   (totals, summed here from items)
//      }

const { generate, failure } = require("./_gemini");
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

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("scan-food: GEMINI_API_KEY missing");
    return { statusCode: 500, body: JSON.stringify({ error: "GEMINI_API_KEY is not configured on the server" }) };
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

  try {
    const response = await generate(apiKey, {
        contents: [
          {
            role: "user",
            parts: [{ text: PROMPT }, { inlineData: { mimeType, data: image } }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
          maxOutputTokens: 900,
          temperature: 0.2,
          thinkingConfig: { thinkingLevel: "low" },
        },
      }
    );

    if (!response.ok) {
      const detail = await response.text();
      console.error("scan-food: Gemini request failed,", response.status, detail.slice(0, 500));
      return failure(response.status, detail);
    }

    const data = await response.json();
    const parts = data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts;
    const raw = Array.isArray(parts) ? parts.map((p) => p.text || "").join("").trim() : "";
    if (!raw) {
      console.error("scan-food: Gemini returned no text in candidates", JSON.stringify(data).slice(0, 500));
      return { statusCode: 502, body: JSON.stringify({ error: "Gemini returned an empty reply" }) };
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      console.error("scan-food: could not JSON.parse Gemini output:", raw.slice(0, 500));
      return { statusCode: 502, body: JSON.stringify({ error: "Gemini did not return valid JSON" }) };
    }

    const items = Array.isArray(parsed.items)
      ? parsed.items.slice(0, 15).map((item) => ({
          name: String((item && item.name) || "Item").slice(0, 60),
          grams: Number(item && item.grams) || 0,
          calories: Number(item && item.calories) || 0,
          protein: Number(item && item.protein) || 0,
          carbs: Number(item && item.carbs) || 0,
          fat: Number(item && item.fat) || 0,
        }))
      : [];

    // Sum totals ourselves rather than trusting a separate model-stated total,
    // so the totals always match what's actually shown per item.
    const totals = items.reduce(
      (sum, item) => ({
        calories: sum.calories + item.calories,
        protein: sum.protein + item.protein,
        carbs: sum.carbs + item.carbs,
        fat: sum.fat + item.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items,
        calories: Math.round(totals.calories),
        protein: Math.round(totals.protein),
        carbs: Math.round(totals.carbs),
        fat: Math.round(totals.fat),
      }),
    };
  } catch (err) {
    console.error("scan-food: uncaught error,", err && err.stack || err);
    return { statusCode: 502, body: JSON.stringify({ error: "Request to Gemini failed", detail: String(err && err.message || err) }) };
  }
};
