// Serverless proxy for the Food Scanner.
// Keeps the Gemini API key on the server - the browser never sees it.
// Frontend contract (see analyzeFoodPhoto in script.js):
//   POST /api/scan-food  { image: base64String, mimeType: string }
//   -> 200 { items: [{ name, grams }], calories: number }

const MODEL = "gemini-3.6-flash";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/" + MODEL + ":generateContent";
const MAX_BASE64_LENGTH = 6_000_000; // roughly a 4.5MB photo once decoded

const PROMPT =
  "Identify the food items visible in this photo of a plate or meal. " +
  "Estimate a reasonable portion size in grams for each item and the total calories for everything shown. " +
  'Respond ONLY as JSON matching this shape: {"items": [{"name": string, "grams": number}], "calories": number}. ' +
  "If you cannot identify any food in the image, return an empty items array and calories: 0.";

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "GEMINI_API_KEY is not configured on the server" }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  const image = payload.image;
  const mimeType = payload.mimeType || "image/jpeg";
  if (!image || typeof image !== "string") {
    return { statusCode: 400, body: JSON.stringify({ error: "image (base64 string) is required" }) };
  }
  if (image.length > MAX_BASE64_LENGTH) {
    return { statusCode: 413, body: JSON.stringify({ error: "Photo is too large - try a smaller image" }) };
  }

  try {
    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: PROMPT }, { inlineData: { mimeType, data: image } }],
          },
        ],
        generationConfig: { responseMimeType: "application/json", maxOutputTokens: 300, temperature: 0.4 },
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      return { statusCode: 502, body: JSON.stringify({ error: "Gemini request failed", detail: detail.slice(0, 300) }) };
    }

    const data = await response.json();
    const parts = data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts;
    const raw = Array.isArray(parts) ? parts.map((p) => p.text || "").join("").trim() : "";
    if (!raw) {
      return { statusCode: 502, body: JSON.stringify({ error: "Gemini returned an empty reply" }) };
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return { statusCode: 502, body: JSON.stringify({ error: "Gemini did not return valid JSON" }) };
    }

    const items = Array.isArray(parsed.items)
      ? parsed.items.slice(0, 12).map((item) => ({
          name: String((item && item.name) || "Item").slice(0, 60),
          grams: Number(item && item.grams) || undefined,
        }))
      : [];
    const calories = Number(parsed.calories) || 0;

    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items, calories }) };
  } catch (err) {
    return { statusCode: 502, body: JSON.stringify({ error: "Request to Gemini failed", detail: String(err && err.message || err) }) };
  }
};
