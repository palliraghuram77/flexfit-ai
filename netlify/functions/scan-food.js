// Serverless Food Scanner  (version 2: "AI looks, the table counts")
//
// In plain words:
//   1. The photo goes to a vision AI: Groq first, then Gemini, then the optional backup provider.
//   2. The AI only says WHAT is on the plate and roughly HOW MANY GRAMS of each food.
//   3. This file looks each food up in FOOD_ROWS below (calories/protein/carbs/fat per 100 g)
//      and does the maths itself. Foods not in the table fall back to the AI's own numbers.
//
// API keys stay on the server. The browser never sees them.
// Frontend contract (analyzeFoodPhoto in script.js) is UNCHANGED, so script.js needs no edit:
//   POST /api/scan-food  { image: base64String, mimeType: string }
//   -> 200 { items: [{ name, grams, calories, protein, carbs, fat }], calories, protein, carbs, fat, provider }
//
// Netlify environment variables:
//   GROQ_API_KEY     your key from console.groq.com  (main scanner)
//   GROQ_MODEL       optional, a Groq vision model to try first (default qwen/qwen3.8-27b)
//   GEMINI_API_KEY   optional, fallback if Groq fails
//   BACKUP_API_KEY   optional, older backup provider, last resort

// Helper files are loaded defensively: if one is missing, the Groq scanner still works.
let gemini = null;
let backupMod = null;
try { gemini = require("./_gemini"); } catch (e) { console.error("scan-food: _gemini.js not available -", e && e.message); }
try { backupMod = require("./_backup"); } catch (e) { console.error("scan-food: _backup.js not available -", e && e.message); }

const crypto = require("crypto");

// Same photo in = same answer out. Results are remembered for a while (while this function stays warm),
// so scanning the same photo twice can never show two different macro lists.
const SCAN_CACHE = new Map();
const SCAN_CACHE_MAX = 40;

const MAX_BASE64_LENGTH = 6000000; // about a 4.5 MB photo once decoded
const GROQ_MAX_BASE64 = 3900000; // Groq rejects images above about 4 MB of base64
const TOTAL_BUDGET_MS = 9200; // Netlify free functions stop at about 10 s
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODELS = ["qwen/qwen3.8-27b", "qwen/qwen3.6-27b"];

// name | other names the AI may use | kcal | protein g | carbs g | fat g   (per 100 g of the food AS SERVED)
// Typical averages (IFCT / USDA style): good for tracking, not lab-exact.
const FOOD_ROWS = `
white rice|rice,steamed rice,plain rice,boiled rice,basmati rice,cooked rice|130|2.7|28|0.3
jeera rice|cumin rice,zeera rice|150|3|29|2.5
brown rice|brown rice cooked|123|2.7|25.6|1
fried rice|veg fried rice,egg fried rice,chinese fried rice|165|3.5|27|4.5
veg biryani|vegetable biryani|160|3.5|25|5
chicken biryani|biryani,mutton biryani,egg biryani|185|8|22|7
pulao|pulav,veg pulao,peas pulao|150|3|26|3.5
khichdi|dal khichdi,moong dal khichdi|110|4|18|2.5
curd rice|dahi rice,thayir sadam|120|3.5|18|3.5
lemon rice|tamarind rice,puliyogare|150|3|27|3.5
poha|flattened rice,kanda poha|140|2.8|25|3
upma|rava upma,suji upma|150|3.5|22|5.5
oatmeal|oats,porridge,oats porridge,cooked oats|71|2.5|12|1.5
pasta|spaghetti,macaroni,penne,cooked pasta|158|5.8|31|0.9
noodles|hakka noodles,chowmein,chow mein,veg noodles|150|4|24|4
instant noodles|maggi,ramen|140|3|20|5.5
roti|chapati,phulka,fulka,whole wheat roti,tawa roti|290|9.5|50|5
paratha|plain paratha,lachha paratha|320|7.5|44|13
aloo paratha|stuffed paratha,gobi paratha,paneer paratha|270|6|38|10
puri|poori|350|7|45|16
naan|butter naan,tandoori naan,garlic naan,kulcha|300|9|51|5.5
bread|white bread,bread slice,toast,bread toast|265|9|49|3.2
brown bread|whole wheat bread,multigrain bread|250|10|44|3.5
idli|idly,steamed idli|140|4.2|28|0.8
dosa|plain dosa,sada dosa|165|3.9|28|3.7
masala dosa|mysore masala dosa,paper dosa|190|4|28|7
uttapam|uthappam,oothappam|150|4.5|24|3.8
vada|medu vada,urad vada|290|8|28|16
dal|toor dal,moong dal,masoor dal,dal tadka,dal fry,lentil curry,yellow dal|105|5.5|14|3
dal makhani|black dal,maa ki dal|135|5.5|13|6.5
rajma|rajma curry,kidney beans curry,rajma masala|120|5.5|16|3.5
chole|chana masala,chickpea curry,chole masala|150|6.5|19|5
boiled chickpeas|chana,kala chana,boiled chana,chickpeas|164|8.9|27|2.6
sambar|sambhar|60|3|9|1.5
sprouts|moong sprouts,sprouts salad,boiled sprouts|80|6|12|0.5
soya chunks|soy chunks,soya nuggets,meal maker|115|17|11|0.5
tofu|firm tofu,bean curd|144|15.8|2.8|8.7
paneer|paneer cubes,raw paneer,cottage cheese|265|18|1.2|20.8
paneer butter masala|paneer makhani,shahi paneer,kadai paneer,paneer tikka masala|240|8.5|8|19
palak paneer|saag paneer|180|9|6|13
paneer bhurji|paneer scramble|230|13|5|17
mixed veg sabzi|mixed vegetable curry,vegetable curry,veg curry,sabzi|90|2.5|9|5
aloo sabzi|aloo gobi,aloo curry,potato curry,jeera aloo,dum aloo|100|2.2|13|4.5
bhindi|okra,bhindi masala,bhindi fry|95|2|8|6.5
baingan|brinjal,eggplant,baingan bharta,aubergine|90|2|7|6
gobi sabzi|cauliflower sabzi,gobi masala,cauliflower curry|80|2.5|8|4.5
palak|spinach,saag,palak sabzi,sarson saag|70|3|5|4.5
mushroom curry|mushroom masala|80|3|5|5.5
egg curry|anda curry,egg masala|140|8|5|10
chicken curry|chicken masala,kadai chicken,chicken gravy|150|14|4|8.5
butter chicken|chicken makhani|190|14|6|12
chicken tikka|tikka,chicken kebab,chicken seekh|150|24|3|5
tandoori chicken|chicken tandoori,chicken leg,chicken drumstick|175|25|3|7
grilled chicken|chicken breast,boiled chicken,roast chicken,chicken|165|31|0|3.6
fried chicken|chicken fry,chicken 65,chicken nuggets,chicken pakora|250|19|10|15
fish curry|machli curry,fish masala|120|14|3|6
fried fish|fish fry,tawa fish|220|19|8|12
grilled fish|baked fish,steamed fish,fish|130|22|0|4
mutton curry|lamb curry,mutton masala,rogan josh|190|16|3|12
keema|minced meat,mutton keema,chicken keema|210|17|4|14
prawn curry|shrimp curry,prawns,shrimp|110|13|3|5
boiled egg|egg,hard boiled egg,whole egg|155|13|1.1|11
fried egg|sunny side up,egg fry,half fry|196|13.6|0.8|15
omelette|omelet,egg omelette,masala omelette,folded omelette|185|11|2|14
scrambled egg|egg bhurji,anda bhurji,scrambled eggs|180|11|3|14
egg white|egg whites,boiled egg white|52|11|0.7|0.2
milk|glass of milk,whole milk,cow milk,toned milk|62|3.2|4.8|3.3
curd|dahi,yogurt,plain yogurt,plain curd|65|3.5|4.7|3.5
greek yogurt|hung curd,high protein yogurt|97|9|3.9|5
buttermilk|chaas,chhaas,mattha,salted lassi|40|2|4|1.5
raita|boondi raita,cucumber raita,veg raita|60|2.5|5|3
lassi|sweet lassi,mango lassi|90|3|14|2.5
cheese|cheddar,cheese slice,processed cheese,mozzarella|350|22|2|27
ghee|clarified butter|900|0|0|100
butter|white butter,makhan|717|0.9|0.1|81
peanut butter|nut butter|588|25|20|50
cucumber|kheera,cucumber slices|15|0.7|3.6|0.1
carrot|gajar,carrot slices,boiled carrot|40|0.9|9.5|0.2
beetroot|beet,boiled beetroot,chukandar|44|1.7|10|0.2
tomato|tomatoes,tomato slices|18|0.9|3.9|0.2
onion|onion slices,raw onion|40|1.1|9.3|0.1
lettuce|lettuce leaves,green leaves|15|1.4|2.9|0.2
cabbage|raw cabbage|25|1.3|5.8|0.1
green salad|salad,mixed salad,kachumber,vegetable salad|20|1.2|4|0.2
broccoli|boiled broccoli,steamed broccoli|35|2.4|7|0.4
steamed vegetables|boiled vegetables,sauteed vegetables,mixed vegetables|45|2|8|0.4
potato|boiled potato,potatoes,aloo|87|1.9|20|0.1
sweet potato|shakarkandi,boiled sweet potato|76|1.4|18|0.1
french fries|fries,potato wedges|312|3.4|41|15
sweet corn|corn,boiled corn,corn on the cob,bhutta|96|3.4|21|1.5
avocado|avocado slices|160|2|9|15
green peas|peas,matar,boiled peas|84|5.4|15|0.2
banana|kela|89|1.1|23|0.3
apple|seb|52|0.3|14|0.2
orange|santra,mosambi,sweet lime|47|0.9|12|0.1
mango|aam|60|0.8|15|0.4
grapes|angoor|69|0.7|18|0.2
watermelon|tarbooz|30|0.6|7.6|0.2
papaya|papita|43|0.5|11|0.3
pomegranate|anar|83|1.7|19|1.2
pineapple|ananas|50|0.5|13|0.1
strawberries|strawberry|32|0.7|7.7|0.3
guava|amrud|68|2.6|14|1
kiwi|kiwi fruit|61|1.1|15|0.5
dates|khajoor,dry dates|282|2.5|75|0.4
fruit salad|mixed fruit,cut fruit|50|0.7|13|0.2
almonds|badam|579|21|22|50
peanuts|moongfali,roasted peanuts|585|24|21|50
cashews|kaju|553|18|30|44
walnuts|akhrot|654|15|14|65
mixed nuts|dry fruits,trail mix|607|20|21|54
samosa|veg samosa,punjabi samosa|290|5.5|30|17
pakora|bhajiya,pakoda,onion bhaji|290|7|28|17
vada pav|batata vada|250|6|32|11
pav bhaji|bhaji pav|160|4|22|6.5
pizza|pizza slice|266|11|33|10
burger|veg burger,chicken burger,cheeseburger|250|12|25|11
sandwich|veg sandwich,grilled sandwich,sub|210|8|27|7
momos|steamed momos,dumplings,veg momos,chicken momos|160|7|22|4.5
wrap|roll,kathi roll,frankie,chapati roll|220|8|28|8
gulab jamun|jamun|320|5|50|12
jalebi|imarti|370|2|60|15
rasgulla|rosogolla|186|4.5|40|1
kheer|rice pudding,payasam|140|3.5|22|4.5
halwa|suji halwa,sheera,gajar halwa|300|3.5|45|12
ice cream|kulfi,gelato|207|3.5|24|11
chocolate|milk chocolate,dark chocolate|535|7.6|59|30
biscuits|cookies,biscuit,digestive biscuit,rusk|450|6|70|16
cake|cake slice,pastry,brownie|380|5|52|17
potato chips|chips,crisps,namkeen,bhujia,mixture|536|7|53|35
popcorn|pop corn|380|12|74|5
honey|syrup|304|0.3|82|0
jam|jelly,fruit jam|250|0.4|65|0.1
mayonnaise|mayo|680|1|0.6|75
ketchup|tomato ketchup,tomato sauce|100|1|25|0.1
chutney|green chutney,mint chutney,coconut chutney,tamarind chutney|120|2|10|8
tea|chai,milk tea,masala chai,tea with milk|45|1|7|1.5
black coffee|coffee black,americano|1|0.1|0|0
coffee|milk coffee,filter coffee,latte,cappuccino|45|1.5|6|1.5
cola|soft drink,soda,pepsi,coke,cold drink|42|0|10.6|0
fruit juice|juice,orange juice,mango juice|46|0.5|11|0.1
coconut water|nariyal pani|19|0.7|3.7|0.2
milkshake|shake,banana shake,smoothie|100|3.3|15|3
protein shake|whey shake|45|8|2|0.8
vegetable soup|soup,veg soup,tomato soup|35|1.2|6|0.8
chicken soup|clear soup,manchow soup|40|3.5|3|1.5
`;

function norm(text) {
  return String(text || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

// Build the lookup tables once.
const FOODS = [];
const ALIAS = new Map(); // normalised name -> food
const ALIAS_LIST = []; // [normalised name, food] for "contains" matching
FOOD_ROWS.trim().split("\n").forEach((line) => {
  const p = line.split("|");
  const food = { key: p[0].trim(), kcal: Number(p[2]), protein: Number(p[3]), carbs: Number(p[4]), fat: Number(p[5]) };
  FOODS.push(food);
  [food.key].concat(p[1].split(",")).forEach((name) => {
    const n = norm(name);
    if (n && !ALIAS.has(n)) { ALIAS.set(n, food); ALIAS_LIST.push([n, food]); }
  });
});
const KEY_LIST = FOODS.map((f) => f.key).join(", ");

// Finds the table entry for what the AI said: exact name -> a table name inside the AI's name (longest wins)
// -> the AI's name inside a table name. Returns null if nothing fits (then the AI's own numbers are used).
function matchFood(keyRaw, nameRaw) {
  const terms = [norm(keyRaw), norm(nameRaw)].filter((t) => t && t !== "other");
  for (const t of terms) {
    if (ALIAS.has(t)) return ALIAS.get(t);
    if (t.endsWith("s") && ALIAS.has(t.slice(0, -1))) return ALIAS.get(t.slice(0, -1));
  }
  for (const t of terms) {
    let best = null;
    let bestLen = 0;
    ALIAS_LIST.forEach(([alias, food]) => {
      if (alias.length >= 4 && alias.length > bestLen && (" " + t + " ").includes(" " + alias + " ")) { best = food; bestLen = alias.length; }
    });
    if (best) return best;
  }
  for (const t of terms) {
    if (t.length < 5) continue;
    let best = null;
    let bestLen = 1e9;
    ALIAS_LIST.forEach(([alias, food]) => {
      if (alias.length < bestLen && (" " + alias + " ").includes(" " + t + " ")) { best = food; bestLen = alias.length; }
    });
    if (best) return best;
  }
  return null;
}

const r1 = (n) => Math.round(n * 10) / 10;

// Turns one raw AI item into the item shown in the app.
function buildItem(raw) {
  const rawName = String((raw && (raw.name || raw.key)) || "Food").trim() || "Food";
  const name = (rawName.charAt(0).toUpperCase() + rawName.slice(1)).slice(0, 60);
  let grams = Number(raw && raw.grams) || 0;
  grams = Math.max(0, Math.min(2000, grams));
  // The AI's gram guess wobbles a little from run to run. Rounding to steady steps (5 g under 50 g, else 10 g)
  // removes most of that wobble.
  if (grams) grams = grams < 50 ? Math.max(5, Math.round(grams / 5) * 5) : Math.round(grams / 10) * 10;
  const food = matchFood(raw && raw.key, raw && raw.name);
  if (food) {
    if (!grams) grams = 100;
    const k = grams / 100;
    return { name, grams: Math.round(grams), calories: r1(food.kcal * k), protein: r1(food.protein * k), carbs: r1(food.carbs * k), fat: r1(food.fat * k), source: "database" };
  }
  // Not in the table: use the AI's own numbers (rebuild calories from macros if the AI left them out).
  let calories = Number(raw && raw.calories) || 0;
  const protein = Number(raw && raw.protein) || 0;
  const carbs = Number(raw && raw.carbs) || 0;
  const fat = Number(raw && raw.fat) || 0;
  if (!calories && (protein || carbs || fat)) calories = 4 * protein + 4 * carbs + 9 * fat;
  if (!calories) {
    // The AI gave nothing usable: a cautious average of mixed home food (about 150 kcal per 100 g).
    const k = (grams || 100) / 100;
    return { name, grams: Math.round(grams || 100), calories: r1(150 * k), protein: r1(5 * k), carbs: r1(20 * k), fat: r1(5 * k), source: "rough-average" };
  }
  return { name, grams: Math.round(grams), calories: r1(calories), protein: r1(protein), carbs: r1(carbs), fat: r1(fat), source: "ai" };
}

const PROMPT =
  "You are a food-recognition assistant inside a fitness app. Look at the photo of a meal (often Indian or home-cooked food). " +
  "List EVERY distinct food you can see as its own item, including side vegetables such as cucumber, carrot or beetroot. " +
  "For each item give:\n" +
  "- \"name\": a specific plain-English name (for example 'jeera rice', 'paneer butter masala', 'folded omelette').\n" +
  "- \"key\": the closest name from the KNOWN FOODS list below, copied exactly. If nothing in the list is close, use \"other\".\n" +
  "- \"grams\": the weight in grams of that item as served (cooked weight). Use the plate (a dinner plate is about 25 cm), spoon, bowl or hand as size clues. " +
  "Typical weights: 1 egg 50 g, 1 roti 40 g, 1 idli 40 g, 1 dosa 90 g, 1 bread slice 28 g, 1 samosa 60 g, 1 banana 120 g, 1 apple 180 g, a cup of cooked rice 160 g, a katori of dal 150 g.\n" +
  "- \"calories\", \"protein\", \"carbs\", \"fat\": fill these ONLY when key is \"other\" (numbers for the grams you gave). For every item with a known key use 0 - the app looks those up itself.\n" +
  "Cooked dishes already include their cooking oil, so do not list oil or ghee separately unless it is clearly a separate portion. " +
  "Give one best-estimate number per field, no ranges. If there is no food in the image, return an empty items array.\n" +
  "Reply with ONLY a JSON object, no other text, in exactly this shape: " +
  "{\"items\":[{\"name\":\"\",\"key\":\"\",\"grams\":0,\"calories\":0,\"protein\":0,\"carbs\":0,\"fat\":0}]}\n" +
  "KNOWN FOODS: " + KEY_LIST;

const GEMINI_SCHEMA = {
  type: "OBJECT",
  properties: {
    items: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          key: { type: "STRING" },
          grams: { type: "NUMBER" },
          calories: { type: "NUMBER" },
          protein: { type: "NUMBER" },
          carbs: { type: "NUMBER" },
          fat: { type: "NUMBER" },
        },
        required: ["name", "key", "grams", "calories", "protein", "carbs", "fat"],
      },
    },
  },
  required: ["items"],
};

// Reads the AI's reply. Handles <think>...</think> text, ```json fences and chatter around the JSON.
function parseItems(text) {
  let t = String(text || "");
  if (t.includes("</think>")) t = t.slice(t.lastIndexOf("</think>") + 8);
  t = t.replace(/<think>[\s\S]*?<\/think>/gi, "").replace(/```(?:json)?/gi, "");
  const a = t.indexOf("{");
  const b = t.lastIndexOf("}");
  if (a < 0 || b <= a) return null;
  try {
    const parsed = JSON.parse(t.slice(a, b + 1));
    return Array.isArray(parsed && parsed.items) ? parsed.items.slice(0, 15) : null;
  } catch (e) {
    return null;
  }
}

function geminiText(data) {
  try {
    return data.candidates[0].content.parts.filter((p) => !p.thought).map((p) => p.text || "").join("").trim();
  } catch (e) {
    return "";
  }
}

// Asks one Groq model. Models differ in which options they accept; a 400 means "I don't know that option",
// so we quietly retry with fewer options. Returns { ok, status, text, error }. Never throws.
async function callGroq(key, model, image, mimeType, timeoutMs) {
  const t0 = Date.now();
  const shapes = [
    { response_format: { type: "json_object" }, reasoning_effort: "none", seed: 7 }, // JSON answer, thinking off (fast), repeatable
    { response_format: { type: "json_object" }, seed: 7 },
    {},
  ];
  let last = { ok: false, status: 502, error: "no attempt made" };
  for (const extra of shapes) {
    const left = timeoutMs - (Date.now() - t0);
    if (left < 800) return { ok: false, status: 504, error: "ran out of time" };
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), left);
    try {
      const body = Object.assign({
        model,
        temperature: 0,
        max_tokens: 1500,
        messages: [{ role: "user", content: [{ type: "text", text: PROMPT }, { type: "image_url", image_url: { url: "data:" + mimeType + ";base64," + image } }] }],
      }, extra);
      const res = await fetch(GROQ_URL, { method: "POST", headers: { "content-type": "application/json", authorization: "Bearer " + key }, body: JSON.stringify(body), signal: ctl.signal });
      const raw = await res.text();
      clearTimeout(timer);
      if (res.ok) {
        const data = JSON.parse(raw);
        const content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
        return { ok: true, status: 200, text: String(content || "") };
      }
      last = { ok: false, status: res.status, error: raw.slice(0, 300) };
      if (res.status !== 400) return last; // 429 / 401 / 5xx: another request shape will not help
    } catch (err) {
      clearTimeout(timer);
      return { ok: false, status: err && err.name === "AbortError" ? 504 : 502, error: String((err && err.message) || err) };
    }
  }
  return last;
}

// Friendly message for the app; the real reason stays in the Netlify logs.
function failure(status, text) {
  const t = String(text || "");
  let reason = "busy";
  if (status === 429 || /RESOURCE_EXHAUSTED|quota|rate.?limit/i.test(t)) reason = "quota";
  else if (status === 401 || status === 403 || /API key|invalid_api_key/i.test(t)) reason = "key";
  else if (status === 504 || /timeout|timed out/i.test(t)) reason = "timeout";
  return { statusCode: 503, body: JSON.stringify({ error: "AI is busy", reason, upstream: status }) };
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const started = Date.now();
  const elapsed = () => Date.now() - started;
  const groqKey = (process.env.GROQ_API_KEY || (String(process.env.BACKUP_PROVIDER || "").trim().toLowerCase() === "groq" ? process.env.BACKUP_API_KEY : "") || "").trim();
  const geminiKey = (process.env.GEMINI_API_KEY || "").trim();
  const backup = backupMod ? backupMod.backupConfig() : null;
  const backupIsGroq = !!backup && backup.provider === "groq";
  if (!groqKey && !geminiKey && !backup) {
    console.error("scan-food: no AI key configured (set GROQ_API_KEY in Netlify)");
    return { statusCode: 500, body: JSON.stringify({ error: "No AI key is configured on the server" }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (e) {
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

  const imageHash = crypto.createHash("sha256").update(image).digest("hex");
  if (SCAN_CACHE.has(imageHash)) {
    console.log("scan-food: same photo seen before - returning the saved result");
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: SCAN_CACHE.get(imageHash) };
  }

  let rawItems = null;
  let provider = null;
  let firstFail = null;

  const hasLater = !!(geminiKey && gemini) || !!(backup && !backupIsGroq);
  const groqDeadline = hasLater ? 5600 : TOTAL_BUDGET_MS - 300;

  // 1) Groq: the main scanner. Each model gets one turn; a 401/403 (bad key) stops early.
  if (groqKey && image.length <= GROQ_MAX_BASE64) {
    const models = [(process.env.GROQ_MODEL || "").trim()].concat(GROQ_MODELS).filter((m, i, a) => m && a.indexOf(m) === i).slice(0, 2);
    for (const model of models) {
      const left = groqDeadline - elapsed();
      if (left < 1500) break;
      const r = await callGroq(groqKey, model, image, mimeType, Math.min(left, 6500));
      if (r.ok) {
        const parsed = parseItems(r.text);
        if (parsed) { rawItems = parsed; provider = "groq:" + model; break; }
        console.error("scan-food: Groq " + model + " returned unusable text:", r.text.slice(0, 300));
        firstFail = firstFail || { status: 502, detail: "unusable answer" };
        continue;
      }
      console.error("scan-food: Groq " + model + " failed,", r.status, String(r.error).slice(0, 300));
      firstFail = firstFail || { status: r.status, detail: r.error };
      if (r.status === 401 || r.status === 403 || r.status === 429) break;
    }
  }

  // 2) Gemini as the first fallback.
  if (!rawItems && geminiKey && gemini) {
    const left = TOTAL_BUDGET_MS - elapsed() - 200;
    if (left > 1800) {
      try {
        const response = await gemini.generate(
          geminiKey,
          {
            contents: [{ role: "user", parts: [{ text: PROMPT }, { inlineData: { mimeType, data: image } }] }],
            generationConfig: { responseMimeType: "application/json", responseSchema: GEMINI_SCHEMA, maxOutputTokens: 1400, temperature: 0, seed: 7 },
          },
          { prefer: "accurate", sequential: true, maxModels: 2, deadlineMs: left, accept: (d) => !!parseItems(geminiText(d)) }
        );
        if (response.ok) {
          const parsed = parseItems(geminiText(await response.json()));
          if (parsed) { rawItems = parsed; provider = "gemini"; }
        } else {
          const detail = await response.text();
          console.error("scan-food: Gemini failed,", response.status, detail.slice(0, 300));
          firstFail = firstFail || { status: response.status, detail };
        }
      } catch (err) {
        console.error("scan-food: Gemini error,", (err && err.stack) || err);
        firstFail = firstFail || { status: 502, detail: String((err && err.message) || err) };
      }
    }
  }

  // 3) The older optional backup provider (skipped if it is just Groq again).
  if (!rawItems && backup && !backupIsGroq) {
    const left = TOTAL_BUDGET_MS - elapsed();
    if (left > 1500) {
      const r = await backupMod.callBackup(backup, { text: PROMPT, image, mimeType, timeoutMs: left, maxTokens: 1400, json: true });
      if (r.ok) {
        const parsed = parseItems(r.text);
        if (parsed) { rawItems = parsed; provider = backup.provider; }
        else console.error("scan-food: backup returned unusable text:", r.text.slice(0, 300));
      } else {
        console.error("scan-food: backup failed,", r.status, String(r.error).slice(0, 300));
        firstFail = firstFail || { status: r.status, detail: r.error };
      }
    }
  }

  if (!rawItems) {
    const f = firstFail || { status: 503, detail: "" };
    return failure(f.status, f.detail);
  }

  // The AI said what is on the plate and how much; the table does the nutrition maths.
  const items = rawItems
    .filter((x) => x && typeof x === "object")
    .map(buildItem)
    .sort((a, b) => b.calories - a.calories || a.name.localeCompare(b.name)); // fixed order, so the list never reshuffles
  const totals = items.reduce(
    (sum, item) => ({ calories: sum.calories + item.calories, protein: sum.protein + item.protein, carbs: sum.carbs + item.carbs, fat: sum.fat + item.fat }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
  console.log("scan-food: ok via " + provider + " in " + elapsed() + " ms, " + items.length + " items, " + items.filter((i) => i.source === "database").length + " from table");
  const body = JSON.stringify({
    items,
    calories: Math.round(totals.calories),
    protein: Math.round(totals.protein),
    carbs: Math.round(totals.carbs),
    fat: Math.round(totals.fat),
    provider,
  });
  if (items.length) {
    if (SCAN_CACHE.size >= SCAN_CACHE_MAX) SCAN_CACHE.delete(SCAN_CACHE.keys().next().value);
    SCAN_CACHE.set(imageHash, body);
  }
  return { statusCode: 200, headers: { "Content-Type": "application/json" }, body };
};

// Exposed only so tests/ can check the table and matching.
exports._test = { FOODS, ALIAS, matchFood, buildItem, parseItems, KEY_LIST, PROMPT };
