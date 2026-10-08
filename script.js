const GUEST_STORAGE_KEY = "flexfit-ai-dashboard-guest-session";

// --- Supabase setup ---
// Both values are public/safe to commit (like the old GOOGLE_CLIENT_ID) - find them in your
// Supabase project under Settings -> API. The anon key only grants what your Row Level
// Security policies allow, never full database access.
const SUPABASE_URL = (window.FLEXFIT_CONFIG && window.FLEXFIT_CONFIG.SUPABASE_URL) || "";
const SUPABASE_ANON_KEY = (window.FLEXFIT_CONFIG && window.FLEXFIT_CONFIG.SUPABASE_ANON_KEY) || "";
const sb = (SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase)
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
// A brand new account must start completely blank - no pre-picked sports/goals/numbers.
// "beginner" is the only exception, since the level picker needs some starting radio value.
const DEFAULT_PROFILE = {
  age: "",
  height: "",
  weight: "",
  targetWeight: "",
  level: "",
  sports: [],
  goals: [],
};
const DEFAULT_TARGETS = { calories: 2850, protein: 180, carbs: 350, fat: 80 };
const SPORT_CHOICES = ["Bodybuilding", "Powerlifting", "CrossFit", "Running", "Trail Running", "Sprinting", "Martial Arts", "Boxing", "Kickboxing", "Brazilian Jiu-Jitsu", "Wrestling", "Cycling", "Mountain Biking", "Swimming", "Triathlon", "Yoga", "Pilates", "Calisthenics", "Rock Climbing", "Hiking", "Football", "Basketball", "Tennis", "Badminton", "Table Tennis", "Volleyball", "Cricket", "Baseball", "Golf", "Rugby", "Hockey", "Skiing", "Snowboarding", "Surfing", "Rowing", "Dance", "Gymnastics", "Skateboarding"];
const GOAL_CHOICES = ["Lean bulk", "Boxing conditioning", "Body recomposition", "Increase strength while lean", "Run a 10K", "Return from injury", "Build endurance", "Improve mobility", "General fitness"];
const EXERCISES = [
  // Chest
  ["Barbell Bench Press","Chest","intermediate","4 x 6-8","120s rest","chest | triceps | shoulders"],
  ["Incline Dumbbell Press","Chest","beginner","4 x 8-10","90s rest","chest | shoulders"],
  ["Push-Up","Chest","beginner","3 x 12-20","60s rest","chest | triceps | core"],
  ["Cable Chest Fly","Chest","beginner","3 x 12-15","60s rest","chest"],
  ["Dumbbell Chest Press","Chest","beginner","4 x 8-12","90s rest","chest | triceps"],
  ["Weighted Dip","Chest","advanced","3 x 6-10","120s rest","chest | triceps"],
  ["Decline Barbell Press","Chest","intermediate","4 x 8-10","90s rest","chest | triceps"],
  ["Pec Deck Machine","Chest","beginner","3 x 12-15","60s rest","chest"],
  // Back
  ["Barbell Row","Back","intermediate","4 x 8-10","90s rest","back | biceps"],
  ["Lat Pulldown","Back","beginner","3 x 10-12","75s rest","back | biceps"],
  ["Pull-Up","Back","intermediate","4 x 6-10","90s rest","back | biceps"],
  ["Seated Cable Row","Back","beginner","3 x 10-12","75s rest","back | biceps"],
  ["Single-Arm Dumbbell Row","Back","beginner","3 x 10-12","60s rest","back | biceps"],
  ["Deadlift","Back","advanced","4 x 5-6","150s rest","back | hamstrings | glutes"],
  ["T-Bar Row","Back","intermediate","4 x 8-10","90s rest","back | biceps"],
  // Shoulders
  ["Standing Shoulder Press","Shoulders","intermediate","4 x 8-10","90s rest","shoulders | triceps"],
  ["Lateral Raise","Shoulders","beginner","3 x 12-15","45s rest","shoulders"],
  ["Face Pull","Shoulders","beginner","3 x 15-20","45s rest","shoulders | back"],
  ["Arnold Press","Shoulders","intermediate","3 x 8-10","75s rest","shoulders | triceps"],
  ["Front Raise","Shoulders","beginner","3 x 12-15","45s rest","shoulders"],
  ["Rear Delt Fly","Shoulders","beginner","3 x 12-15","45s rest","shoulders | back"],
  // Biceps
  ["Barbell Curl","Biceps","beginner","3 x 8-12","60s rest","biceps"],
  ["Dumbbell Hammer Curl","Biceps","beginner","3 x 10-12","60s rest","biceps | forearms"],
  ["Incline Dumbbell Curl","Biceps","intermediate","3 x 10-12","60s rest","biceps"],
  ["Preacher Curl","Biceps","intermediate","3 x 8-10","60s rest","biceps"],
  ["Cable Curl","Biceps","beginner","3 x 12-15","45s rest","biceps"],
  ["Concentration Curl","Biceps","beginner","3 x 10-12","45s rest","biceps"],
  // Triceps
  ["Close-Grip Bench Press","Triceps","intermediate","4 x 8-10","90s rest","triceps | chest"],
  ["Tricep Rope Pushdown","Triceps","beginner","3 x 12-15","45s rest","triceps"],
  ["Overhead Tricep Extension","Triceps","beginner","3 x 10-12","60s rest","triceps"],
  ["Skull Crusher","Triceps","intermediate","3 x 8-10","75s rest","triceps"],
  ["Bench Dip","Triceps","beginner","3 x 12-15","45s rest","triceps | chest"],
  ["Diamond Push-Up","Triceps","intermediate","3 x 10-15","60s rest","triceps | chest"],
  // Quads
  ["Goblet Squat","Quads","beginner","4 x 10-12","90s rest","quads | glutes | core"],
  ["Barbell Back Squat","Quads","intermediate","4 x 6-8","120s rest","quads | glutes | core"],
  ["Leg Press","Quads","beginner","4 x 10-12","90s rest","quads | glutes"],
  ["Walking Lunge","Quads","beginner","3 x 12 each","60s rest","quads | glutes"],
  ["Bulgarian Split Squat","Quads","intermediate","3 x 10 each","75s rest","quads | glutes"],
  ["Leg Extension","Quads","beginner","3 x 12-15","60s rest","quads"],
  ["Front Squat","Quads","advanced","4 x 6-8","120s rest","quads | core"],
  // Hamstrings
  ["Romanian Deadlift","Hamstrings","intermediate","4 x 8-10","120s rest","hamstrings | glutes | back"],
  ["Leg Curl","Hamstrings","beginner","3 x 12-15","60s rest","hamstrings"],
  ["Good Morning","Hamstrings","intermediate","3 x 8-10","90s rest","hamstrings | back"],
  ["Stiff-Leg Deadlift","Hamstrings","intermediate","4 x 8-10","90s rest","hamstrings | glutes"],
  ["Nordic Curl","Hamstrings","advanced","3 x 6-8","90s rest","hamstrings"],
  // Glutes
  ["Hip Thrust","Glutes","beginner","4 x 10-12","90s rest","glutes | hamstrings"],
  ["Glute Bridge","Glutes","beginner","3 x 15-20","45s rest","glutes"],
  ["Cable Kickback","Glutes","beginner","3 x 12-15 each","45s rest","glutes"],
  ["Sumo Deadlift","Glutes","advanced","4 x 6-8","120s rest","glutes | hamstrings | back"],
  ["Step-Up","Glutes","beginner","3 x 10 each","60s rest","glutes | quads"],
  // Core
  ["Plank","Core","beginner","3 x 45s","45s rest","core"],
  ["Hanging Leg Raise","Core","intermediate","3 x 12-15","60s rest","core"],
  ["Cable Woodchopper","Core","beginner","3 x 12 each","45s rest","core | shoulders"],
  ["Russian Twist","Core","beginner","3 x 20","45s rest","core"],
  ["Ab Wheel Rollout","Core","advanced","3 x 8-12","60s rest","core | shoulders"],
  ["Bicycle Crunch","Core","beginner","3 x 20","45s rest","core"],
  // Calves
  ["Standing Calf Raise","Calves","beginner","4 x 12-15","45s rest","calves"],
  ["Seated Calf Raise","Calves","beginner","3 x 15-20","45s rest","calves"],
  ["Single-Leg Calf Raise","Calves","intermediate","3 x 12 each","45s rest","calves"],
  ["Jump Rope","Calves","beginner","3 x 60s","45s rest","calves | cardio"],
  // Pilates
  ["The Hundred","Pilates","beginner","1 x 100 pumps","30s rest","core | breath | endurance"],
  ["Roll-Up","Pilates","beginner","3 x 10","30s rest","core | spine | flexibility"],
  ["Single Leg Stretch","Pilates","beginner","3 x 10 each","30s rest","core | hip flexors"],
  ["Double Leg Stretch","Pilates","intermediate","3 x 10","30s rest","core | coordination"],
  ["Swan Dive","Pilates","intermediate","3 x 8","30s rest","back extension | spine"],
  ["Side-Lying Leg Lift","Pilates","beginner","3 x 15 each","30s rest","glutes | hips | stability"],
  ["Pilates Teaser","Pilates","advanced","3 x 8","45s rest","core | hip flexors | balance"],
  ["Clamshell","Pilates","beginner","3 x 20 each","30s rest","glutes | hips | stability"],
  ["Spine Stretch Forward","Pilates","beginner","3 x 8","20s rest","spine | hamstrings | posture"],
  ["Leg Circle","Pilates","beginner","3 x 10 each","30s rest","hips | core | stability"],
  ["Bridge with Pulse","Pilates","beginner","3 x 15","30s rest","glutes | hamstrings | core"],
  ["Criss-Cross","Pilates","intermediate","3 x 12 each","30s rest","core | obliques | rotation"],
  // Yoga
  ["Sun Salutation A","Yoga","beginner","5 x flow","60s rest","full body | breath | flexibility"],
  ["Warrior I","Yoga","beginner","3 x 30s each","20s rest","quads | hips | balance"],
  ["Warrior II","Yoga","beginner","3 x 30s each","20s rest","quads | hips | shoulders"],
  ["Downward Dog","Yoga","beginner","3 x 45s","20s rest","hamstrings | shoulders | spine"],
  ["Chair Pose","Yoga","beginner","3 x 30s","30s rest","quads | core | balance"],
  ["Tree Pose","Yoga","beginner","3 x 30s each","20s rest","balance | hips | core"],
  ["Boat Pose","Yoga","intermediate","3 x 20s","30s rest","core | hip flexors | balance"],
  ["Pigeon Pose","Yoga","intermediate","3 x 60s each","20s rest","hips | glutes | flexibility"],
  ["Crow Pose","Yoga","advanced","3 x 15s","30s rest","core | arms | balance"],
  ["Standing Forward Fold","Yoga","beginner","3 x 45s","20s rest","hamstrings | spine | flexibility"],
  // Boxing / Martial Arts / Combat
  ["Jab-Cross Combo","Combat","beginner","5 x 60s rounds","60s rest","shoulders | core | cardio"],
  ["Uppercut Drill","Combat","beginner","5 x 30s","45s rest","shoulders | core | legs"],
  ["Hook Combination","Combat","intermediate","5 x 45s","60s rest","shoulders | core | rotation"],
  ["Shadow Boxing","Combat","beginner","5 x 2min","60s rest","full body | cardio | coordination"],
  ["Heavy Bag Rounds","Combat","intermediate","6 x 2min","60s rest","full body | cardio | power"],
  ["Slip & Counter Drill","Combat","intermediate","4 x 60s","45s rest","core | agility | reaction"],
  ["Muay Thai Kicks","Combat","intermediate","4 x 60s","60s rest","legs | hips | balance | cardio"],
  ["Burpee to Push-Up","Combat","beginner","4 x 10","60s rest","full body | cardio | strength"],
  ["Clinch Work","Combat","advanced","5 x 90s","60s rest","grip | back | core | endurance"],
  ["Speed Bag","Combat","beginner","4 x 60s","30s rest","shoulders | coordination | rhythm"],
  // Running / Endurance
  ["Tempo Run","Running","intermediate","1 x 20-30min","—","cardio | legs | lungs"],
  ["Interval Sprints","Running","intermediate","8 x 200m","90s rest","legs | cardio | power"],
  ["Long Slow Run","Running","beginner","1 x 40-60min","—","cardio | endurance | legs"],
  ["Hill Repeats","Running","intermediate","6 x hill sprint","90s rest","legs | glutes | cardio"],
  ["Strides","Running","beginner","6 x 80m","60s rest","speed | form | legs"],
  ["Fartlek Run","Running","intermediate","1 x 30min","—","cardio | legs | mental toughness"],
  // Calisthenics
  ["Muscle-Up","Calisthenics","advanced","4 x 5","120s rest","back | chest | triceps | core"],
  ["Handstand Push-Up","Calisthenics","advanced","4 x 5-8","120s rest","shoulders | triceps | core"],
  ["L-Sit Hold","Calisthenics","intermediate","4 x 15s","60s rest","core | hip flexors | triceps"],
  ["Pistol Squat","Calisthenics","intermediate","3 x 8 each","90s rest","quads | glutes | balance"],
  ["Front Lever Row","Calisthenics","advanced","3 x 5","120s rest","back | core | lats"],
  ["Human Flag Progression","Calisthenics","advanced","4 x 10s","120s rest","core | shoulders | lats"],
  ["Tuck Planche","Calisthenics","advanced","4 x 10s","120s rest","chest | shoulders | core"],
  ["Dips","Calisthenics","beginner","3 x 10-15","60s rest","chest | triceps | shoulders"],
  // Dance / Gymnastics
  ["Plie Squat","Dance","beginner","4 x 15","45s rest","quads | glutes | inner thighs"],
  ["Releve Balance","Dance","beginner","3 x 30s","30s rest","calves | balance | core"],
  ["Arabesque Hold","Dance","intermediate","3 x 20s each","30s rest","glutes | back | balance"],
  ["Grand Battement","Dance","beginner","3 x 12 each","30s rest","hip flexors | glutes | flexibility"],
  ["Core Contraction","Dance","beginner","3 x 15","30s rest","core | posture | control"],
  // CrossFit / HIIT
  ["Thruster","Full Body","intermediate","4 x 10","90s rest","quads | shoulders | core | full body"],
  ["Kettlebell Swing","Full Body","beginner","4 x 15","60s rest","glutes | hamstrings | back | cardio"],
  ["Box Jump","Full Body","intermediate","4 x 8","90s rest","quads | glutes | calves | power"],
  ["Burpee","Full Body","beginner","4 x 10","60s rest","full body | cardio"],
  ["Wall Ball","Full Body","intermediate","4 x 15","75s rest","quads | shoulders | core"],
  ["Double-Under Jump Rope","Full Body","intermediate","4 x 30","45s rest","calves | coordination | cardio"],
  ["Sled Push","Full Body","intermediate","4 x 20m","90s rest","quads | glutes | core | cardio"],
  ["Battle Ropes","Full Body","beginner","4 x 30s","45s rest","shoulders | core | cardio"],
];
// Extra exercises (and the split catalog) live in workout-data.js.
if (window.FLEXFIT_DATA) {
  window.FLEXFIT_DATA.extraExercises.forEach((item) => { if (!EXERCISES.some((e) => e[0] === item[0])) EXERCISES.push(item); });
}

let state = defaultState();
let exerciseGroup = "Chest";
// ── Strava-style GPS cardio tracker state ──
let cardioSeconds = 0;
let cardioTimer = null;
let cardioGpsWatch = null;
let cardioRoute = []; // [{lat, lng, alt, t}]
let cardioElevGain = 0;
let cardioPaused = false;
let cardioSelectedActivity = null; // nothing is pre-selected: the user must choose
const CARDIO_CATEGORIES = [
  ["Walk & Run", false, [["Walking",3.5,"🚶"],["Brisk Walking",4.3,"🚶"],["Nordic Walking",4.8,"🚶"],["Hiking",6.0,"🥾"],["Jogging",7.0,"🏃"],["Running",9.8,"🏃"],["Trail Running",9.0,"🏔️"],["Sprinting",12.0,"💨"],["Stair Climbing",8.8,"🪜"],["Mountain Climbing",8.0,"⛰️"]]],
  ["Cycling", false, [["Cycling",7.5,"🚴"],["Mountain Biking",8.5,"🚵"],["E-bike",4.0,"🚲"]]],
  ["Water", false, [["Swimming",8.0,"🏊"],["Rowing",7.0,"🚣"],["Kayaking",5.0,"🛶"],["Paddleboarding",6.0,"🏄"],["Surfing",3.0,"🏄"],["Sailing",3.0,"⛵"]]],
  ["Gym & Fitness", true, [["HIIT",10.0,"⚡"],["Jump Rope",12.0,"🪢"],["Weight Training",6.0,"🏋️"],["CrossFit",8.0,"🏋️"],["Circuit Training",8.0,"🔁"],["Calisthenics",8.0,"🤸"],["Elliptical",5.0,"🌀"],["Treadmill",9.0,"🏃"],["Stationary Bike",7.0,"🚴"],["Aerobics",6.5,"🤸"],["Zumba",6.5,"💃"],["Boot Camp",8.0,"🪖"]]],
  ["Mind & Body", true, [["Yoga",3.0,"🧘"],["Pilates",3.0,"🧘"],["Tai Chi",3.0,"☯️"],["Stretching",2.3,"🙆"],["Barre",4.0,"🩰"],["Dance",5.5,"💃"]]],
  ["Combat", true, [["Boxing",7.8,"🥊"],["Kickboxing",10.0,"🥊"],["Muay Thai",10.0,"🥋"],["Karate",10.0,"🥋"],["Judo",10.0,"🥋"],["Taekwondo",10.0,"🥋"],["Brazilian Jiu-Jitsu",8.0,"🤼"],["Wrestling",6.0,"🤼"],["Fencing",6.0,"🤺"]]],
  ["Team Sports", true, [["Football",7.0,"⚽"],["Basketball",6.5,"🏀"],["Cricket",4.8,"🏏"],["Volleyball",4.0,"🏐"],["Handball",8.0,"🤾"],["Rugby",8.3,"🏉"],["Hockey",7.8,"🏑"],["Baseball",5.0,"⚾"],["American Football",8.0,"🏈"],["Ultimate Frisbee",8.0,"🥏"],["Kabaddi",7.0,"🤼"]]],
  ["Racquet Sports", true, [["Tennis",7.3,"🎾"],["Badminton",5.5,"🏸"],["Table Tennis",4.0,"🏓"],["Squash",12.0,"🎾"],["Padel",6.0,"🎾"]]],
  ["Winter", true, [["Skiing",7.0,"⛷️"],["Snowboarding",5.3,"🏂"],["Ice Skating",7.0,"⛸️"],["Cross-country Skiing",9.0,"⛷️"]]],
  ["Outdoor & Other", true, [["Rock Climbing",8.0,"🧗"],["Golf",4.8,"⛳"],["Skateboarding",5.0,"🛹"],["Roller Skating",7.0,"🛼"],["Horse Riding",5.5,"🏇"],["Archery",4.3,"🏹"],["Gardening",3.8,"🌱"],["Housework",3.3,"🧹"]]],
];
// "timed" activities are indoors or too stop-start for GPS, so calories come from elapsed time instead of movement.
const CARDIO_ACTIVITIES = CARDIO_CATEGORIES.flatMap(([cat, timed, list]) => list.map(([name, met, icon]) => ({ name, met, icon, cat, timed })));
let toastTimer = null;
let uploadUrl = "";

const el = (id) => document.getElementById(id);
const all = (selector) => Array.from(document.querySelectorAll(selector));
const num = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

function defaultState() {
  return {
    session: { signedIn: false, name: "", guest: false },
    onboarded: false,
    theme: "system",
    profile: { ...DEFAULT_PROFILE, sports: [...DEFAULT_PROFILE.sports], goals: [...DEFAULT_PROFILE.goals] },
    targets: { ...DEFAULT_TARGETS },
    meals: [],
    cardioSessions: [],
    completedWorkouts: [],
    weightHistory: [],
    ingredients: [],
    jiyaChats: [],
    activeChatId: null,
    dietGenerated: false,
    dietPrefs: { diet: "nonveg", cuisine: "any", picks: {} },
    workoutVersion: 0,
    workoutPlan: null,
    dayExercises: {},
    sessionProgress: {},
    customExercises: [],
    ownWorkouts: [],
    history: [],
    recommendations: false,
  };
}

function newChatObject() {
  return {
    id: "chat-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    title: "New chat",
    createdAt: Date.now(),
    messages: [],
  };
}

function deriveChatTitle(messages) {
  const firstUser = messages.find((message) => message.role === "user");
  if (!firstUser || !firstUser.text) return "New chat";
  const text = firstUser.text.trim();
  return text.length > 42 ? text.slice(0, 42) + "..." : text;
}

function mergeState(fallback, saved) {
  if (!saved) return fallback;
  const merged = {
    ...fallback,
    ...saved,
    session: { ...fallback.session, ...(saved.session || {}) },
    profile: { ...fallback.profile, ...(saved.profile || {}) },
    targets: { ...fallback.targets, ...(saved.targets || {}) },
    meals: Array.isArray(saved.meals) ? saved.meals : [],
    cardioSessions: Array.isArray(saved.cardioSessions) ? saved.cardioSessions : [],
    completedWorkouts: Array.isArray(saved.completedWorkouts) ? saved.completedWorkouts : [],
    weightHistory: Array.isArray(saved.weightHistory) ? saved.weightHistory : [],
    ingredients: Array.isArray(saved.ingredients) ? saved.ingredients : [],
    jiyaChats: Array.isArray(saved.jiyaChats) ? saved.jiyaChats.filter((chat) => chat && Array.isArray(chat.messages)) : [],
    customExercises: Array.isArray(saved.customExercises) ? saved.customExercises.filter((e) => e && typeof e.name === "string") : [],
    history: Array.isArray(saved.history) ? saved.history : [],
    dayExercises: saved.dayExercises && typeof saved.dayExercises === "object" && !Array.isArray(saved.dayExercises) ? saved.dayExercises : {},
    sessionProgress: saved.sessionProgress && typeof saved.sessionProgress === "object" && !Array.isArray(saved.sessionProgress) ? saved.sessionProgress : {},
    workoutPlan: saved.workoutPlan && typeof saved.workoutPlan.splitId === "string" ? saved.workoutPlan : null,
  };

  // Migrate the old single flat "chat" array (pre chat-history feature) into one saved conversation.
  if (!merged.jiyaChats.length && Array.isArray(saved.chat) && saved.chat.length) {
    const migrated = newChatObject();
    migrated.messages = saved.chat.filter((message) => message && !message.pending);
    migrated.title = deriveChatTitle(migrated.messages);
    merged.jiyaChats = [migrated];
  }
  delete merged.chat;

  merged.activeChatId = merged.jiyaChats.some((chat) => chat.id === saved.activeChatId)
    ? saved.activeChatId
    : (merged.jiyaChats[0] ? merged.jiyaChats[0].id : null);

  return merged;
}

// Merges a row loaded from Supabase (or nothing, for a brand new user) into a fresh
// defaultState() and returns the current signed-in Supabase user as a session object.
function sessionFromSupabaseUser(user) {
  const meta = user.user_metadata || {};
  return {
    signedIn: true,
    name: meta.name || meta.full_name || (user.email ? user.email.split("@")[0] : "there"),
    email: user.email || "",
    guest: false,
    provider: (user.app_metadata && user.app_metadata.provider) || "email",
    userId: user.id,
  };
}

// Loads (or, for a first-time sign-in, creates) this user's saved state row from Supabase.
async function applySupabaseSession(session) {
  if (!session || !session.user) {
    state = defaultState();
    return;
  }
  const userId = session.user.id;
  const { data: row, error } = await sb.from("app_state").select("state").eq("user_id", userId).maybeSingle();
  if (error) console.error("Supabase load failed:", error.message);
  const restored = row && row.state ? mergeState(defaultState(), row.state) : defaultState();
  restored.session = sessionFromSupabaseUser(session.user);
  if (!row) {
    // First time we've seen this account (e.g. a brand new Google sign-in) - create its row.
    const { session: _drop, ...toSave } = restored;
    await sb.from("app_state").insert({ user_id: userId, state: toSave });
  }
  state = restored;
}

let saveStateDebounceTimer = null;

// Writes the whole app state to wherever it belongs for the current session. Guests save
// instantly to this tab's sessionStorage; signed-in users are debounced and upserted to
// Supabase (Row Level Security means each user can only ever write their own row).
function saveState() {
  if (state.session.guest) {
    sessionStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(state));
    return;
  }
  if (!sb || !state.session.signedIn || !state.session.userId) return;
  const { session, ...toSave } = state; // session lives in Supabase Auth, no need to duplicate it here
  const userId = state.session.userId;
  clearTimeout(saveStateDebounceTimer);
  saveStateDebounceTimer = setTimeout(async () => {
    const { error } = await sb.from("app_state").upsert({ user_id: userId, state: toSave });
    if (error) console.error("Supabase save failed:", error.message);
  }, 500);
}

function safe(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function dateBefore(days) {
  const value = new Date();
  value.setDate(value.getDate() - days);
  return value.toISOString().slice(0, 10);
}

function mealTotals(meals) {
  return meals.reduce((total, meal) => ({
    calories: total.calories + num(meal.calories),
    protein: total.protein + num(meal.protein),
    carbs: total.carbs + num(meal.carbs),
    fat: total.fat + num(meal.fat),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
}

function mealsOn(date) {
  return state.meals.filter((meal) => meal.date === date);
}

function weight(value) {
  return Number.isInteger(num(value)) ? String(num(value)) : num(value).toFixed(1);
}

function toast(message) {
  const node = el("toast");
  node.textContent = message;
  node.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove("show"), 3200);
}

function changePage(page, hash = true) {
  if (!state.session.signedIn) return;
  if (!state.onboarded) page = "profile";
  const valid = el(page + "-page") ? page : "dashboard";
  all("[data-page-view]").forEach((view) => {
    const active = view.dataset.pageView === valid;
    view.hidden = !active;
    view.classList.toggle("active", active);
  });
  all("[data-page]").forEach((button) => button.classList.toggle("active", button.dataset.page === valid));
  if (hash && window.location.hash !== "#" + valid) window.location.hash = valid;
  document.body.classList.remove("menu-open");
  el("menu-button").setAttribute("aria-expanded", "false");
  if (valid === "workout") openTodaySession(); // opening Workout lands on today's session
  if (valid === "logs") renderLogsPage();
  if (valid === "history") renderHistory();
  el("main-content").scrollIntoView({ behavior: "instant", block: "start" });
}

function changeTab(group, tab) {
  all('[data-tab-group="' + group + '"]').forEach((button) => {
    const active = button.dataset.tab === tab;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
  all('[data-panel-group="' + group + '"]').forEach((panel) => {
    const active = panel.dataset.panel === tab;
    panel.hidden = !active;
    panel.classList.toggle("active", active);
  });
}

function bars(node, values, labels) {
  const max = Math.max(1, ...values);
  node.innerHTML = values.map((value, index) => {
    const height = value ? Math.max(4, Math.round(value / max * 88)) : 2;
    return '<div class="chart-column"><i class="chart-bar" style="height:' + height + '%"></i><span>' + labels[index] + (value ? '<small>' + value + '</small>' : '') + '</span></div>';
  }).join("");
}

function renderDashboard() {
  renderLogs();
  const profile = state.profile;
  const target = state.targets;
  const totals = mealTotals(mealsOn(today()));
  const weekly = state.completedWorkouts.filter((entry) => entry.date >= dateBefore(6)).length;
  el("dashboard-sports").textContent = profile.sports.join(" - ");
  el("dashboard-goals").textContent = profile.goals.join(" - ");
  el("today-calories").textContent = Math.round(totals.calories);
  el("calorie-target").textContent = target.calories;
  el("chart-target").textContent = target.calories;
  el("weekly-workouts").textContent = weekly;
  el("current-weight").textContent = weight(profile.weight);
  el("target-weight").textContent = weight(profile.targetWeight);
  el("fitness-level").textContent = profile.level;
  el("fitness-goal-copy").textContent = profile.goals.slice(0, 3).join(", ");
  el("macro-protein").textContent = Math.round(totals.protein) + "/" + target.protein + "g";
  el("macro-carbs").textContent = Math.round(totals.carbs) + "/" + target.carbs + "g";
  el("macro-fat").textContent = Math.round(totals.fat) + "/" + target.fat + "g";
  el("macro-empty").hidden = totals.calories > 0;
  const todaySession = weekPlan()[todayIndex()];
  el("today-training-copy").textContent = todaySession[4]
    ? "Rest day today - recover, stretch and walk."
    : "Today: " + todaySession[1] + " (" + todaySession[5].length + " exercises)." + (sessionComplete(todayIndex()) ? " Completed - nice work." : "");

  const values = [];
  const labels = [];
  for (let index = 6; index >= 0; index -= 1) {
    const key = dateBefore(index);
    values.push(Math.round(mealTotals(mealsOn(key)).calories));
    labels.push(DAYS[new Date(key + "T12:00:00").getDay()]);
  }
  bars(el("calorie-chart"), values, labels);

  const content = el("recommendation-content");
  if (state.recommendations) {
    const note = totals.calories < target.calories * 0.7 ? "Add a balanced meal to close today's calorie target." : "Your intake is on track; keep your next meal protein-forward.";
    content.innerHTML = '<div class="recommendation-list"><div>' + safe(note) + '</div><div>Train with controlled volume this week, then log each completed session.</div><div>Build recovery around consistent sleep and your next weigh-in.</div></div>';
  } else {
    content.innerHTML = '<p>Get 3-4 personalised tips based on your profile and recent logs.</p><button class="outline-button" type="button" id="get-recommendations">Get recommendations</button>';
    el("get-recommendations").addEventListener("click", () => {
      state.recommendations = true;
      saveState();
      renderDashboard();
    });
  }
}

function legacyWeekPlan() {
  const sports = state.profile.sports || [];
  const goals  = state.profile.goals  || [];
  const REST   = (day) => [day, "Rest & Recovery", "Recovery day — stretch, walk, sleep well.", "", true];

  // ── Pilates ──
  if (sports.includes("Pilates")) {
    const v = state.workoutVersion % 2;
    return v ? [
      ["Monday",    "Pilates Core Flow",      "hundred, roll-up, criss-cross",          "Pilates", false],
      ["Tuesday",   "Yoga & Stretch",          "sun salutation, pigeon pose, forward fold","Yoga",  false],
      ["Wednesday", "Pilates Lower Body",      "bridge, clam, leg circle, side leg lift","Pilates", false],
      REST("Thursday"),
      ["Friday",    "Pilates Full Body",       "teaser, swan dive, double leg stretch",  "Pilates", false],
      ["Saturday",  "Active Recovery Yoga",    "warrior I & II, tree pose, downward dog","Yoga",   false],
      REST("Sunday"),
    ] : [
      ["Monday",    "Pilates Fundamentals",    "hundred, single leg stretch, spine stretch","Pilates",false],
      REST("Tuesday"),
      ["Wednesday", "Glute & Hip Focus",       "hip thrust, clamshell, glute bridge",    "Glutes", false],
      ["Thursday",  "Pilates Upper Body",      "plank, push-up, spine stretch forward",  "Pilates",false],
      REST("Friday"),
      ["Saturday",  "Full Pilates Session",    "teaser, roll-up, leg circle, criss-cross","Pilates",false],
      REST("Sunday"),
    ];
  }

  // ── Yoga ──
  if (sports.includes("Yoga")) {
    const v = state.workoutVersion % 2;
    return v ? [
      ["Monday",    "Yoga Flow A",             "sun salutation, warrior I, warrior II",  "Yoga",   false],
      ["Tuesday",   "Core & Stability",        "boat pose, plank, L-sit, bicycle crunch","Core",   false],
      ["Wednesday", "Hip Opening Flow",        "pigeon pose, warrior II, leg circle",    "Yoga",   false],
      REST("Thursday"),
      ["Friday",    "Yoga Strength",           "crow pose, chair pose, standing fold",   "Yoga",   false],
      ["Saturday",  "Full Body Stretch",       "downward dog, pigeon, spine stretch",    "Yoga",   false],
      REST("Sunday"),
    ] : [
      ["Monday",    "Morning Yoga",            "sun salutation A, tree pose, warrior I", "Yoga",   false],
      REST("Tuesday"),
      ["Wednesday", "Balance & Strength",      "crow pose, boat pose, chair pose",       "Yoga",   false],
      ["Thursday",  "Flexibility Focus",       "pigeon, forward fold, downward dog",     "Yoga",   false],
      REST("Friday"),
      ["Saturday",  "Power Yoga",              "sun salutation, warrior II, crow pose",  "Yoga",   false],
      REST("Sunday"),
    ];
  }

  // ── Boxing / Martial Arts / Combat ──
  if (sports.some(s => ["Boxing","Kickboxing","Martial Arts","Brazilian Jiu-Jitsu","Wrestling"].includes(s))) {
    const v = state.workoutVersion % 2;
    return v ? [
      ["Monday",    "Striking Fundamentals",   "jab-cross, shadow boxing, heavy bag",   "Combat", false],
      ["Tuesday",   "Strength & Conditioning", "deadlift, pull-up, core work",           "Back",   false],
      ["Wednesday", "Combination Drills",      "hook combo, uppercut drill, slip & counter","Combat",false],
      REST("Thursday"),
      ["Friday",    "Sparring Prep",           "shadow boxing, heavy bag rounds, speed bag","Combat",false],
      ["Saturday",  "Cardio & Footwork",       "interval sprints, burpees, jump rope",   "Full Body",false],
      REST("Sunday"),
    ] : [
      ["Monday",    "Boxing Conditioning",     "shadow boxing, heavy bag, burpees",      "Combat", false],
      ["Tuesday",   "Lower Body Power",        "squat, hip thrust, walking lunge",       "Quads",  false],
      ["Wednesday", "Technical Drills",        "jab-cross, slip & counter, speed bag",   "Combat", false],
      REST("Thursday"),
      ["Friday",    "Full Contact Conditioning","heavy bag rounds, clinch work, kicks",  "Combat", false],
      ["Saturday",  "Strength Day",            "deadlift, bench press, barbell row",     "Chest",  false],
      REST("Sunday"),
    ];
  }

  // ── Running / Endurance ──
  if (sports.some(s => ["Running","Trail Running","Sprinting","Triathlon","Cycling"].includes(s)) ||
      goals.some(g => ["Run a 10K","Build endurance"].includes(g))) {
    const v = state.workoutVersion % 2;
    return v ? [
      ["Monday",    "Easy Run",                "long slow run at conversational pace",   "Running",false],
      ["Tuesday",   "Strength & Core",         "squat, deadlift, core work",             "Quads",  false],
      ["Wednesday", "Tempo Run",               "sustained effort 20-30 min tempo",       "Running",false],
      REST("Thursday"),
      ["Friday",    "Interval Sprints",        "8 x 200m with recovery jogs",            "Running",false],
      ["Saturday",  "Long Run",                "easy long run, build base mileage",      "Running",false],
      REST("Sunday"),
    ] : [
      ["Monday",    "Fartlek Session",         "30min varied pace running",              "Running",false],
      ["Tuesday",   "Hill Repeats",            "6 x hill sprints for power",             "Running",false],
      ["Wednesday", "Cross-Training",          "cycling or swimming for active recovery","Full Body",false],
      REST("Thursday"),
      ["Friday",    "Strides & Speed",         "6 x 80m strides, form focus",            "Running",false],
      ["Saturday",  "Race Pace Run",           "run at goal race pace for 20-40 min",    "Running",false],
      REST("Sunday"),
    ];
  }

  // ── Calisthenics ──
  if (sports.includes("Calisthenics")) {
    const v = state.workoutVersion % 2;
    return v ? [
      ["Monday",    "Push Skills",             "handstand push-up, dips, planche tuck", "Calisthenics",false],
      ["Tuesday",   "Pull Skills",             "muscle-up, front lever row, pull-up",   "Calisthenics",false],
      ["Wednesday", "Legs & Core",             "pistol squat, L-sit, ab wheel rollout", "Calisthenics",false],
      REST("Thursday"),
      ["Friday",    "Skill Practice",          "human flag, handstand, planche",        "Calisthenics",false],
      ["Saturday",  "Full Body Circuit",       "burpees, dips, pull-up, pistol squat",  "Full Body",false],
      REST("Sunday"),
    ] : [
      ["Monday",    "Upper Push",              "dips, diamond push-up, handstand push-up","Calisthenics",false],
      REST("Tuesday"),
      ["Wednesday", "Upper Pull",              "pull-up, muscle-up, front lever row",   "Calisthenics",false],
      ["Thursday",  "Lower & Core",            "pistol squat, L-sit, bicycle crunch",   "Calisthenics",false],
      REST("Friday"),
      ["Saturday",  "Full Skill Day",          "all skills practice, mobility work",    "Calisthenics",false],
      REST("Sunday"),
    ];
  }

  // ── Bodybuilding / Powerlifting / General Strength ──
  const v = state.workoutVersion % 2;
  if (goals.some(g => ["Lean bulk","Increase strength while lean","Body recomposition"].includes(g)) ||
      sports.some(s => ["Bodybuilding","Powerlifting","CrossFit"].includes(s))) {
    return v ? [
      ["Monday",    "Chest & Triceps",         "bench press, incline press, dips",       "Chest",  false],
      ["Tuesday",   "Back & Biceps",           "deadlift, barbell row, pull-up",         "Back",   false],
      ["Wednesday", "Legs",                    "squat, leg press, romanian deadlift",    "Quads",  false],
      REST("Thursday"),
      ["Friday",    "Shoulders & Arms",        "shoulder press, lateral raise, curls",   "Shoulders",false],
      ["Saturday",  "Full Body & Core",        "compound lifts, core circuit",           "Full Body",false],
      REST("Sunday"),
    ] : [
      ["Monday",    "Upper Strength A",        "bench press, barbell row, shoulder press","Chest", false],
      ["Tuesday",   "Lower Strength A",        "squat, hip thrust, walking lunge",       "Quads",  false],
      REST("Wednesday"),
      ["Thursday",  "Upper Strength B",        "incline press, pull-up, lateral raise",  "Chest",  false],
      ["Friday",    "Lower Strength B",        "deadlift, leg curl, calf raise",         "Hamstrings",false],
      ["Saturday",  "Conditioning",            "kettlebell swing, burpee, battle ropes", "Full Body",false],
      REST("Sunday"),
    ];
  }

  // ── Default (general fitness / mobility / return from injury) ──
  return v ? [
    ["Monday",    "Full Body A",              "chest, back, quads, core",               "Chest",  false],
    ["Tuesday",   "Active Recovery",          "Recovery day — stretch, walk, sleep well.","",     true],
    ["Wednesday", "Full Body B",              "shoulders, back, hamstrings, glutes",     "Shoulders",false],
    REST("Thursday"),
    ["Friday",    "Full Body C",              "chest, biceps, triceps, quads",           "Chest",  false],
    ["Saturday",  "Conditioning",             "hiit full body",                          "Full Body",false],
    REST("Sunday"),
  ] : [
    ["Monday",    "Upper Strength",           "chest, back, shoulders",                  "Chest",  false],
    ["Tuesday",   "Zone 2 Cardio",            "aerobic base, mobility",                  "Running",false],
    ["Wednesday", "Lower Strength",           "quads, hamstrings, glutes",               "Quads",  false],
    REST("Thursday"),
    ["Friday",    "Full Body Power",          "push, pull, core",                        "Full Body",false],
    ["Saturday",  "HIIT Conditioning",        "hiit full body",                          "Full Body",false],
    REST("Sunday"),
  ];
}

// Finds the specific EXERCISES entries that match a workout session's free-text description
// (e.g. "bench press, incline press, dips" -> Barbell Bench Press / Incline Dumbbell Press / Dips),
// so "View Exercises" shows exactly that day's exercises instead of a whole muscle group.
// Returns [] when nothing matches well, and the caller falls back to browsing the group.

// Everyday shorthand -> the exact library name it means.
const EXERCISE_ALIASES = {
  "squat": "Barbell Back Squat",
  "bench press": "Barbell Bench Press",
  "incline press": "Incline Dumbbell Press",
  "shoulder press": "Standing Shoulder Press",
  "dip": "Weighted Dip",
  "curl": "Barbell Curl",
  "calf raise": "Standing Calf Raise",
  "row": "Barbell Row",
  "core work": "Plank",
  "core circuit": "Plank",
  "jab cross": "Jab-Cross Combo",
  "heavy bag": "Heavy Bag Rounds",
  "kick": "Muay Thai Kicks",
  "long run": "Long Slow Run",
  "hill sprint": "Hill Repeats",
  "sprint": "Interval Sprints",
  "jump rope": "Double-Under Jump Rope",
  "kettlebell swing": "Kettlebell Swing",
  "bridge": "Glute Bridge",
  "clam": "Clamshell",
  "sun salutation": "Sun Salutation A",
  "pigeon": "Pigeon Pose",
  "forward fold": "Standing Forward Fold",
  "standing fold": "Standing Forward Fold",
  "side leg lift": "Side-Lying Leg Lift",
  "compound lift": "Barbell Back Squat",
  "tempo": "Tempo Run",
  "race pace": "Tempo Run",
  "fartlek": "Fartlek Run",
  "varied pace": "Fartlek Run",
  "interval": "Interval Sprints",
  "easy long run": "Long Slow Run",
  "zone 2": "Long Slow Run",
  "aerobic base": "Long Slow Run",
  "hiit": ["Burpee", "Kettlebell Swing", "Box Jump"],
  "cross training": ["Jump Rope"],
  "stride": "Strides",
  "200m": "Interval Sprints",
};
// A bare muscle word ("chest, back, quads") means "a couple of good exercises for that muscle".
const MUSCLE_WORDS = {
  "chest": "Chest", "back": "Back", "shoulders": "Shoulders", "biceps": "Biceps",
  "triceps": "Triceps", "quads": "Quads", "hamstrings": "Hamstrings", "glutes": "Glutes",
  "core": "Core", "calves": "Calves",
};
const GENERIC_WORDS = new Set(["barbell", "dumbbell", "cable", "machine", "standing", "seated", "work", "the", "and", "with", "for", "all", "practice"]);

function normalizeExerciseText(text) {
  return text.toLowerCase().replace(/[-&]/g, " ").replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
}
function singular(word) {
  return word.length > 3 && word.endsWith("s") && !word.endsWith("ss") ? word.slice(0, -1) : word;
}

function exercisesForSession(session) {
  const sessionGroup = session[3];
  const description = session[2];
  if (!description) return [];
  const LIB = libraryExercises();
  const byName = (name) => LIB.find((item) => item[0] === name);
  const matched = [];
  const add = (item) => { if (item && !matched.includes(item)) matched.push(item); };
  const levelOrder = { beginner: 0, intermediate: 1, advanced: 2 };
  const userLevel = levelOrder[state.profile.level] ?? 0;

  description.split(",").forEach((rawTerm) => {
    const term = normalizeExerciseText(rawTerm);
    if (!term) return;
    const termWords = term.split(" ").map(singular);
    const termKey = termWords.join(" ");

    // 1) Bare muscle word -> two exercises for that muscle, closest to the user's level.
    if (termWords.length === 1 && MUSCLE_WORDS[term]) {
      LIB.filter((item) => item[1] === MUSCLE_WORDS[term])
        .sort((a, b) => Math.abs(levelOrder[a[2]] - userLevel) - Math.abs(levelOrder[b[2]] - userLevel))
        .slice(0, 2).forEach(add);
      return;
    }
    // 2) Everyday shorthand -> exact library name.
    const aliasKey = Object.keys(EXERCISE_ALIASES).find((key) => (" " + termKey + " ").includes(" " + key + " "));
    // 3) Otherwise score every exercise in the WHOLE library (not just this day's group).
    let best = null;
    let bestScore = 0;
    LIB.forEach((item) => {
      if (matched.includes(item)) return;
      const nameWords = normalizeExerciseText(item[0]).split(" ").map(singular);
      const nameKey = nameWords.join(" ");
      let score = 0;
      if (nameKey === termKey) score = 10;
      else if (nameKey.includes(termKey) || termKey.includes(nameKey)) score = 6;
      else {
        const sig = termWords.filter((w) => w.length > 2 && !GENERIC_WORDS.has(w));
        const hits = sig.filter((w) => nameWords.includes(w)).length;
        // Need at least half of the meaningful words to line up, otherwise it's a coincidence.
        if (sig.length && hits / sig.length >= 0.5) score = 2 + hits;
      }
      if (score && item[1] === sessionGroup) score += 0.5; // tie-break toward the day's own group
      if (score > bestScore) { bestScore = score; best = item; }
    });
    // An exact library-name match beats an alias; otherwise the alias beats a weak partial match.
    if (aliasKey && bestScore < 10) [].concat(EXERCISE_ALIASES[aliasKey]).forEach((name) => add(byName(name)));
    else if (best && bestScore >= 2) add(best);
  });
  return matched;
}

// ───────── Workout: plans, today's session, library ─────────
const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const LEVEL_RANK = { beginner: 0, intermediate: 1, advanced: 2, elite: 3 };
let sessionDayIndex = null;   // null = today's session
let guideOpenAll = false;
const lastSessionPct = {};

function todayIndex() { return (new Date().getDay() + 6) % 7; } // Monday = 0

function libraryExercises() {
  const custom = (state.customExercises || []).map((e) => [e.name, e.group, e.level, e.sets, e.rest, e.muscles]);
  return EXERCISES.concat(custom);
}
function findExercise(name) { return libraryExercises().find((item) => item[0] === name); }
function isCustomExercise(name) { return (state.customExercises || []).some((e) => e.name === name); }
function demoUrl(name) { return "https://www.youtube.com/results?search_query=" + encodeURIComponent(name + " exercise form"); }

// Every change the user makes is recorded here; the History page (next batch) reads it.
function logChange(type, text) {
  state.history.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), ts: Date.now(), date: today(), type, text });
  if (state.history.length > 500) state.history = state.history.slice(-500);
}

// ── Splits: recommended by sport, goal and level ──
function splitById(id) { return window.FLEXFIT_DATA ? window.FLEXFIT_DATA.splits.find((sp) => sp.id === id) : null; }
function sportOverlap(sp) { return sp.sports.filter((s) => state.profile.sports.includes(s)); }
function goalOverlap(sp) { return sp.goals.filter((g) => state.profile.goals.includes(g)); }
function scoreSplit(sp) {
  const level = state.profile.level;
  return sportOverlap(sp).length * 4 + goalOverlap(sp).length * 2 + (level ? (sp.levels.includes(level) ? 2 : -3) : 0);
}
function splitReason(sp) {
  const sports = sportOverlap(sp), goals = goalOverlap(sp);
  if (sports.length) return "Built for " + sports.slice(0, 2).join(" & ");
  if (goals.length) return "Matches goal: " + goals[0];
  return sp.levels.includes(state.profile.level) ? "Suits " + state.profile.level + " level" : "General option";
}
// Up to 4 options: the best sport-specific splits first, then general ones (PPL, Upper/Lower, Full Body, Bro split...).
// "offset" rotates through the candidates so "Show different options" gives fresh choices.
function recommendSplits(offset = 0) {
  const D = window.FLEXFIT_DATA;
  if (!D) return [];
  const ranked = D.splits.slice().sort((a, b) => scoreSplit(b) - scoreSplit(a));
  const sportList = ranked.filter((sp) => sp.sports.length && sportOverlap(sp).length);
  const generalIds = ["full-body-3", "upper-lower", "ppl", "bro-split", "hybrid-recomp", "glute-focus", "rebuild"];
  const generalList = ranked.filter((sp) => !sportList.includes(sp) && generalIds.includes(sp.id));
  const pick = (list, n, off) => Array.from({ length: Math.min(n, list.length) }, (_, i) => list[(off + i) % list.length]);
  const chosen = pick(sportList, Math.min(2, sportList.length), offset * 2);
  pick(generalList, 4 - chosen.length, offset * (4 - chosen.length)).forEach((sp) => { if (!chosen.includes(sp)) chosen.push(sp); });
  ranked.forEach((sp) => { if (chosen.length < 4 && !chosen.includes(sp)) chosen.push(sp); });
  return chosen.slice(0, 4);
}
function currentSplit() {
  if (!window.FLEXFIT_DATA) return null;
  return splitById(state.workoutPlan && state.workoutPlan.splitId) || recommendSplits(0)[0] || null;
}

// The week as [day, title, description, group, isRest, exerciseNames]. User edits override the split's defaults.
function weekPlan() {
  const split = currentSplit();
  if (!split) {
    return legacyWeekPlan().map((s) => [s[0], s[1], s[2], s[3], s[4], Array.isArray(state.dayExercises[s[0]]) ? state.dayExercises[s[0]] : (s[4] ? [] : exercisesForSession(s).map((e) => e[0]))]);
  }
  return split.days.map((d) => {
    const edited = Array.isArray(state.dayExercises[d[0]]);
    const names = edited ? state.dayExercises[d[0]] : d[5];
    const desc = d[4] ? d[2] : (names.length ? names.slice(0, 3).join(", ") + (names.length > 3 ? " +" + (names.length - 3) + " more" : "") : "No exercises yet - add some");
    return [d[0], d[1], desc, d[3], d[4], names.slice()];
  });
}

// ── Session progress & completion (same id as the weekly grid, so both always agree) ──
function sessionKey(index) { return today() + "-" + index; }
function doneNames(index) { return state.sessionProgress[sessionKey(index)] || []; }
function sessionComplete(index) { return state.completedWorkouts.some((item) => item.id === sessionKey(index)); }
function pruneProgress() {
  const cutoff = dateBefore(14);
  Object.keys(state.sessionProgress).forEach((key) => { if (key.slice(0, 10) < cutoff) delete state.sessionProgress[key]; });
}
function refreshWorkoutViews() {
  renderWorkout();
  renderDashboard();
  renderProgress();
}
function setSessionComplete(index, complete) {
  const s = weekPlan()[index];
  const id = sessionKey(index);
  state.completedWorkouts = state.completedWorkouts.filter((item) => item.id !== id);
  if (complete) {
    state.completedWorkouts.push({ id, date: today(), title: s[1] });
    state.sessionProgress[id] = s[5].slice();
    logChange("complete", "Completed " + s[0] + " - " + s[1]);
    toast("Workout logged. Great work.");
  } else {
    state.sessionProgress[id] = [];
    logChange("uncomplete", "Marked " + s[0] + " - " + s[1] + " as not completed");
    toast("Workout marked incomplete.");
  }
  pruneProgress();
  saveState();
  refreshWorkoutViews();
}
function toggleExerciseDone(index, name) {
  const key = sessionKey(index);
  const list = doneNames(index).slice();
  const at = list.indexOf(name);
  if (at >= 0) list.splice(at, 1); else list.push(name);
  state.sessionProgress[key] = list;
  const total = weekPlan()[index][5].length;
  if (sessionComplete(index) && list.length < total) {
    state.completedWorkouts = state.completedWorkouts.filter((item) => item.id !== key); // un-ticking reopens the session
  }
  pruneProgress();
  saveState();
  refreshWorkoutViews();
  const box = Array.from(document.querySelectorAll("#session-view [data-done]")).find((node) => node.dataset.done === name);
  if (box) box.focus(); // re-rendering replaces the checkbox, so hand keyboard focus back to it
}

// ── Editing a day's exercises ──
function setDayExercises(index, names, message) {
  const s = weekPlan()[index];
  state.dayExercises[s[0]] = names;
  const key = sessionKey(index);
  state.sessionProgress[key] = (state.sessionProgress[key] || []).filter((n) => names.includes(n));
  logChange("exercise", message);
  saveState();
  refreshWorkoutViews();
}
function addToSession(index, name) {
  const s = weekPlan()[index];
  if (s[4]) { toast(s[0] + " is a rest day - pick a training day first."); return false; }
  if (s[5].includes(name)) { toast(name + " is already in " + s[0] + "'s session."); return false; }
  setDayExercises(index, s[5].concat(name), "Added " + name + " to " + s[0] + " (" + s[1] + ")");
  toast("Added " + name + ".");
  return true;
}
function removeFromSession(index, name) {
  const s = weekPlan()[index];
  setDayExercises(index, s[5].filter((n) => n !== name), "Removed " + name + " from " + s[0] + " (" + s[1] + ")");
  toast("Removed " + name + ".");
}
function resetDay(index) {
  const s = weekPlan()[index];
  delete state.dayExercises[s[0]];
  state.sessionProgress[sessionKey(index)] = [];
  logChange("exercise", "Reset " + s[0] + " to the plan's default exercises");
  saveState();
  refreshWorkoutViews();
  toast("Restored the plan's exercises for " + s[0] + ".");
}

// ── Smarter suggestions: tailored to the day's focus, your sports, goals and level ──
const SPORT_FOCUS = [
  [["Boxing", "Kickboxing", "Martial Arts", "Brazilian Jiu-Jitsu", "Wrestling"], ["Combat", "Athletic", "Core"]],
  [["Running", "Trail Running", "Sprinting"], ["Running", "Athletic", "Endurance"]],
  [["Cycling", "Mountain Biking", "Triathlon", "Rowing"], ["Endurance", "Quads"]],
  [["Swimming"], ["Swimming", "Back"]],
  [["Yoga"], ["Yoga", "Mobility"]], [["Pilates"], ["Pilates", "Core"]],
  [["Calisthenics", "Gymnastics"], ["Calisthenics", "Core"]],
  [["Rock Climbing", "Hiking"], ["Climbing", "Endurance"]],
  [["Football", "Basketball", "Tennis", "Badminton", "Table Tennis", "Volleyball", "Cricket", "Baseball", "Golf", "Rugby", "Hockey", "Skiing", "Snowboarding", "Surfing", "Skateboarding"], ["Athletic", "Mobility", "Core"]],
  [["Dance"], ["Dance", "Mobility"]],
  [["Bodybuilding", "Powerlifting", "CrossFit"], ["Chest", "Back", "Quads", "Full Body"]],
];
const GOAL_FOCUS = {
  "Improve mobility": ["Mobility", "Yoga", "Pilates"], "Return from injury": ["Mobility", "Pilates"],
  "Build endurance": ["Endurance", "Running"], "Run a 10K": ["Running", "Endurance"],
  "Boxing conditioning": ["Combat"], "Lean bulk": ["Chest", "Back", "Quads"],
  "Increase strength while lean": ["Quads", "Back", "Chest"], "Body recomposition": ["Full Body", "Glutes"],
};
function exerciseRelevance(item, sessionGroup, sessionMuscles) {
  const profile = state.profile;
  let score = 0, reason = "";
  if (item[1] === sessionGroup) { score += 4; reason = "Targets today's focus (" + sessionGroup + ")"; }
  const muscles = item[5].split("|").map((m) => m.trim());
  if (muscles.some((m) => sessionMuscles.has(m))) score += 2;
  const sportHit = SPORT_FOCUS.find(([sports, groups]) => groups.includes(item[1]) && sports.some((s) => profile.sports.includes(s)));
  if (sportHit) { score += 2.5; if (!reason) reason = "Supports your " + sportHit[0].find((s) => profile.sports.includes(s)); }
  const goalHit = profile.goals.find((g) => (GOAL_FOCUS[g] || []).includes(item[1]));
  if (goalHit) { score += 1.5; if (!reason) reason = "Supports your goal: " + goalHit; }
  const diff = (LEVEL_RANK[item[2]] ?? 0) - (LEVEL_RANK[profile.level] ?? 0);
  score += diff > 0 ? -2 * diff : 0.5;
  return { score, reason: reason || "Good all-round option" };
}
function suggestExercises(index, limit = 4) {
  const s = weekPlan()[index];
  const sessionMuscles = new Set();
  s[5].forEach((name) => { const it = findExercise(name); if (it) it[5].split("|").forEach((m) => sessionMuscles.add(m.trim())); });
  return libraryExercises().filter((item) => !s[5].includes(item[0]))
    .map((item) => ({ item, ...exerciseRelevance(item, s[3], sessionMuscles) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score).slice(0, limit);
}

// ── Today's session view ──
function sessionRowHtml(index, name, checked) {
  const item = findExercise(name);
  if (!item) return "";
  return '<article class="session-exercise ' + (checked ? "done" : "") + '">' +
    '<label class="se-check"><input type="checkbox" data-done="' + safe(name) + '" ' + (checked ? "checked" : "") + ' /><span class="sr-only">Mark ' + safe(name) + ' as done</span></label>' +
    '<div class="se-main"><h3>' + safe(name) + '</h3><div class="tag-row"><span class="tag accent">' + safe(item[2]) + '</span><span class="tag">' + safe(item[3]) + '</span><span class="tag">' + safe(item[4]) + '</span></div><p>' + safe(item[5]) + '</p>' +
    '<div class="exercise-actions"><button type="button" data-exercise-info="' + safe(name) + '">How to do it</button>' +
    '<a href="' + demoUrl(name) + '" target="_blank" rel="noopener">Watch demo</a>' +
    '<button type="button" class="finish-ex' + (checked ? ' done' : '') + '" data-finish-ex="' + safe(name) + '" aria-pressed="' + (checked ? 'true' : 'false') + '">' + (checked ? '✓ Finished' : 'Mark finished') + '</button>' +
    '<button type="button" class="remove-ex" data-remove-ex="' + safe(name) + '">Remove</button></div></div></article>';
}

function renderSession() {
  const root = el("session-view");
  if (!root) return;
  const plan = weekPlan();
  const tIndex = todayIndex();
  const index = sessionDayIndex == null ? tIndex : sessionDayIndex;
  const s = plan[index];
  const pills = plan.map((p, i) => '<button type="button" class="day-pill ' + (i === index ? "active" : "") + (i === tIndex ? " is-today" : "") + '" data-session-day="' + i + '" aria-pressed="' + (i === index) + '" aria-label="' + p[0] + (p[4] ? " (rest day)" : "") + '">' + p[0].slice(0, 3) + (p[4] ? "<small>rest</small>" : "") + '</button>').join("");
  const split = currentSplit();
  let html = '<div class="session-head"><div><span class="day-label">' + s[0] + '</span>' + (index === tIndex ? '<span class="today-label">Today</span>' : "") +
    '<h2>' + safe(s[1]) + '</h2><p class="muted-line">' + (split ? safe(split.name) + " plan" : "Weekly plan") + '</p></div>' +
    '<button class="outline-button" type="button" id="session-to-split">&larr; Weekly split</button></div><div class="day-pills" role="group" aria-label="Choose a day">' + pills + '</div>';

  if (s[4]) {
    const next = plan.findIndex((p, i) => i > index && !p[4]);
    const target = next >= 0 ? next : plan.findIndex((p) => !p[4]);
    html += '<div class="session-rest"><h3>Rest &amp; recovery</h3><p>No training scheduled. Walk, stretch and sleep well - your muscles grow while you recover.</p>' +
      (target >= 0 ? '<button class="primary-button" type="button" data-session-day="' + target + '">See ' + plan[target][0] + "'s session &rarr;</button>" : "") + '</div>';
    root.innerHTML = html;
    wireSession(root, index);
    return;
  }

  const names = s[5];
  const complete = sessionComplete(index);
  const done = doneNames(index).filter((n) => names.includes(n));
  const count = complete ? names.length : done.length;
  const pct = names.length ? Math.round(count / names.length * 100) : 0;
  const key = sessionKey(index);
  const from = lastSessionPct[key] ?? 0;
  html += '<div class="session-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '" aria-label="Session progress">' +
    '<div class="sp-track"><i class="sp-fill" id="sp-fill" style="width:' + from + '%"></i></div><span class="sp-label" id="sp-label">' + count + " of " + names.length + " done &middot; " + pct + '%</span></div>';
  html += names.length ? '<div class="session-list">' + names.map((n) => sessionRowHtml(index, n, complete || done.includes(n))).join("") + '</div>'
    : '<div class="empty-state">No exercises in this session. Add some from the library below.</div>';

  const edited = Array.isArray(state.dayExercises[s[0]]);
  html += '<div class="session-tools"><button class="outline-button" type="button" id="open-add-exercise">+ Add from library</button><button class="outline-button" type="button" id="open-custom-exercise">+ Create your own exercise</button>' +
    (edited ? '<button class="link-button" type="button" id="reset-day">Reset to plan default</button>' : "") + '</div>';

  const suggestions = suggestExercises(index);
  if (suggestions.length) {
    html += '<div class="suggest-box"><h3>Suggested for you</h3><div class="suggest-row">' + suggestions.map((e) =>
      '<button type="button" class="suggest-chip" data-add-name="' + safe(e.item[0]) + '"><b>+ ' + safe(e.item[0]) + '</b><small>' + safe(e.reason) + '</small></button>').join("") + '</div></div>';
  }
  html += '<div class="finish-bar"><button type="button" id="finish-session" class="' + (complete ? "outline-button finished" : "primary-button") + '"' + (names.length ? "" : " disabled") + '>' +
    (complete ? "&#10003; Completed - tap to undo" : "Finish workout") + '</button></div>';
  root.innerHTML = html;
  wireSession(root, index);

  const fill = el("sp-fill");
  if (fill) {
    lastSessionPct[key] = pct;
    requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.width = pct + "%"; }));
  }
}

function wireSession(root, index) {
  root.querySelectorAll("[data-session-day]").forEach((b) => b.addEventListener("click", () => { sessionDayIndex = num(b.dataset.sessionDay); renderSession(); }));
  root.querySelectorAll("[data-done]").forEach((b) => b.addEventListener("change", () => toggleExerciseDone(index, b.dataset.done)));
  root.querySelectorAll("[data-finish-ex]").forEach((b) => b.addEventListener("click", () => toggleExerciseDone(index, b.dataset.finishEx)));
  root.querySelectorAll("[data-remove-ex]").forEach((b) => b.addEventListener("click", () => removeFromSession(index, b.dataset.removeEx)));
  root.querySelectorAll("[data-add-name]").forEach((b) => b.addEventListener("click", () => addToSession(index, b.dataset.addName)));
  root.querySelectorAll("[data-exercise-info]").forEach((b) => b.addEventListener("click", () => openExerciseInfo(b.dataset.exerciseInfo)));
  const on = (id, fn) => { const node = el(id); if (node) node.addEventListener("click", fn); };
  on("session-to-split", () => changeTab("workout", "split"));
  on("open-add-exercise", () => openAddExerciseModal(index));
  on("open-custom-exercise", () => openCustomExerciseModal(index));
  on("reset-day", () => resetDay(index));
  on("finish-session", () => {
    setSessionComplete(index, !sessionComplete(index));
    const again = el("finish-session");
    if (again) again.focus();
  });
}

function openTodaySession() {
  sessionDayIndex = null;
  renderSession();
  changeTab("workout", "today");
}

// ── Weekly split ──
function renderWorkout() {
  const plan = weekPlan();
  const split = currentSplit();
  el("split-goal").textContent = state.profile.goals[0] || "general fitness";
  el("split-name").textContent = split ? split.name : "Weekly plan";
  const realToday = todayIndex();
  el("week-grid").innerHTML = plan.map((session, index) => {
    const complete = sessionComplete(index);
    const rest = session[4];
    const isToday = index === realToday;
    const todayLabel = isToday ? '<span class="today-label">Today</span>' : "";
    const action = rest ? "" : '<button class="outline-button view-exercises" type="button" data-day-index="' + index + '">View Exercises</button>';
    const completeButton = rest ? "" : '<button class="complete-button ' + (complete ? "done" : "") + '" type="button" data-workout="' + index + '">' + (complete ? "Completed" : "Complete") + '</button>';
    return '<article class="week-card ' + (isToday ? "today" : "") + '">' + completeButton + '<span class="day-label">' + session[0] + '</span>' + todayLabel + '<h3>' + safe(session[1]) + '</h3><p>' + safe(session[2]) + '</p>' + action + '</article>';
  }).join("");
  all("[data-workout]").forEach((button) => button.addEventListener("click", () => {
    const index = num(button.dataset.workout);
    setSessionComplete(index, !sessionComplete(index));
    const again = document.querySelector('[data-workout="' + index + '"]');
    if (again) again.focus();
  }));
  all(".view-exercises").forEach((button) => button.addEventListener("click", () => {
    sessionDayIndex = num(button.dataset.dayIndex);
    renderSession();
    changeTab("workout", "today");
  }));
  renderPlanGuide();
  renderSession();
}

// How-to and demo links for every exercise in the chosen plan.
function renderPlanGuide() {
  const node = el("plan-guide");
  if (!node) return;
  const plan = weekPlan().filter((s) => !s[4]);
  node.innerHTML = '<h3>Your plan guide</h3><p class="muted-line">Open any day for form tips and demo videos for every exercise.</p>' + plan.map((s, i) =>
    '<details class="guide-day" ' + (guideOpenAll || i === 0 ? "open" : "") + '><summary><strong>' + s[0] + '</strong> &ndash; ' + safe(s[1]) + ' <span>' + s[5].length + ' exercises</span></summary><ul>' +
    s[5].map((name) => { const it = findExercise(name); return it ? '<li><span><b>' + safe(name) + '</b><small>' + safe(it[3]) + ' &middot; ' + safe(it[4]) + '</small></span><span class="guide-links"><button type="button" data-exercise-info="' + safe(name) + '">How-to</button><a href="' + demoUrl(name) + '" target="_blank" rel="noopener">Demo video</a></span></li>' : ""; }).join("") +
    '</ul></details>').join("");
  node.querySelectorAll("[data-exercise-info]").forEach((b) => b.addEventListener("click", () => openExerciseInfo(b.dataset.exerciseInfo)));
}

// ── Split chooser (AI Regenerate) ──
function openSplitChooser(offset = 0) {
  const options = recommendSplits(offset);
  const current = currentSplit();
  el("modal-backdrop").hidden = false;
  document.querySelector(".modal").classList.add("wide");
  el("modal-title").textContent = "Choose your split";
  el("modal-form").innerHTML = '<p class="modal-copy">Picked for your sports, goals and level. Choosing one replaces your weekly plan.</p><div class="split-options">' + options.map((sp) => {
    const days = sp.days.filter((d) => !d[4]).length;
    return '<article class="split-option ' + (current && current.id === sp.id ? "current" : "") + '"><div><h3>' + safe(sp.name) + '</h3><p>' + safe(sp.blurb) + '</p><div class="tag-row"><span class="tag accent">' + days + ' days / week</span><span class="tag">' + safe(splitReason(sp)) + '</span></div></div>' +
      '<button type="button" class="' + (current && current.id === sp.id ? "outline-button" : "primary-button") + '" data-choose-split="' + sp.id + '">' + (current && current.id === sp.id ? "Current plan" : "Use this plan") + '</button></article>';
  }).join("") + '</div><button type="button" class="outline-button" id="more-splits">Show different options</button>';
  el("modal-form").onsubmit = (event) => event.preventDefault();
  all("[data-choose-split]").forEach((b) => b.addEventListener("click", () => chooseSplit(b.dataset.chooseSplit)));
  el("more-splits").addEventListener("click", () => openSplitChooser(offset + 1));
}
function chooseSplit(id) {
  const sp = splitById(id);
  if (!sp) return;
  const previous = currentSplit();
  state.workoutPlan = { splitId: sp.id, chosenAt: Date.now() };
  state.dayExercises = {};
  state.workoutVersion += 1;
  logChange("plan", "Changed plan to " + sp.name + (previous && previous.id !== sp.id ? " (was " + previous.name + ")" : ""));
  saveState();
  closeModal();
  sessionDayIndex = null;
  guideOpenAll = true;
  refreshWorkoutViews();
  changeTab("workout", "split");
  toast(sp.name + " is now your plan. Form tips and demo links are below.");
  const guide = el("plan-guide");
  if (guide) guide.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ── Add from library / custom exercise ──
function libraryGroups() {
  const order = ["Chest", "Back", "Shoulders", "Biceps", "Triceps", "Quads", "Hamstrings", "Glutes", "Core", "Calves", "Full Body"];
  const present = [...new Set(libraryExercises().map((e) => e[1]))];
  return order.filter((g) => present.includes(g)).concat(present.filter((g) => !order.includes(g)).sort());
}
function openAddExerciseModal(index) {
  const s = weekPlan()[index];
  el("modal-backdrop").hidden = false;
  document.querySelector(".modal").classList.add("wide");
  el("modal-title").textContent = "Add exercise - " + s[0];
  el("modal-form").innerHTML = '<label>Search<input id="picker-search" type="search" placeholder="Search exercises or muscles..." /></label>' +
    '<label>Muscle group<select id="picker-group"><option value="">All groups</option>' + libraryGroups().map((g) => '<option>' + safe(g) + '</option>').join("") + '</select></label>' +
    '<div class="picker-list" id="picker-list"></div><button type="button" class="outline-button" id="picker-custom">+ Create your own exercise</button>';
  el("modal-form").onsubmit = (event) => event.preventDefault();
  const muscles = new Set();
  s[5].forEach((n) => { const it = findExercise(n); if (it) it[5].split("|").forEach((m) => muscles.add(m.trim())); });
  const paint = () => {
    const q = el("picker-search").value.trim().toLowerCase();
    const group = el("picker-group").value;
    const rows = libraryExercises().filter((it) => !s[5].includes(it[0]) && (!group || it[1] === group) && (it[0] + " " + it[5]).toLowerCase().includes(q))
      .map((it) => ({ it, score: exerciseRelevance(it, s[3], muscles).score })).sort((a, b) => b.score - a.score).slice(0, 40);
    el("picker-list").innerHTML = rows.length ? rows.map(({ it }) => '<div class="picker-row"><div><strong>' + safe(it[0]) + '</strong><small>' + safe(it[1]) + ' &middot; ' + safe(it[2]) + ' &middot; ' + safe(it[3]) + '</small></div><button type="button" class="outline-button" data-pick="' + safe(it[0]) + '">Add</button></div>').join("") : '<div class="empty-state">No matching exercises.</div>';
    all("[data-pick]").forEach((b) => b.addEventListener("click", () => { if (addToSession(index, b.dataset.pick)) closeModal(); }));
  };
  el("picker-search").addEventListener("input", paint);
  el("picker-group").addEventListener("change", paint);
  el("picker-custom").addEventListener("click", () => openCustomExerciseModal(index));
  paint();
}
function openCustomExerciseModal(index) {
  const s = index == null ? null : weekPlan()[index];
  const canAdd = s && !s[4];
  el("modal-backdrop").hidden = false;
  document.querySelector(".modal").classList.remove("wide");
  el("modal-title").textContent = "Create your own exercise";
  el("modal-form").innerHTML = '<label>Exercise name<input name="name" type="text" required maxlength="50" placeholder="e.g. Sandbag Carry" /></label>' +
    '<label>Muscle group<select name="group">' + libraryGroups().map((g) => '<option>' + safe(g) + '</option>').join("") + '</select></label>' +
    '<label>Level<select name="level"><option>beginner</option><option>intermediate</option><option>advanced</option></select></label>' +
    '<div class="details-grid"><label>Sets x reps<input name="sets" type="text" maxlength="30" value="3 x 10" required /></label><label>Rest<input name="rest" type="text" maxlength="30" value="60s rest" required /></label></div>' +
    '<label>Muscles worked (separate with |)<input name="muscles" type="text" maxlength="80" placeholder="core | grip | legs" /></label>' +
    (canAdd ? '<label class="inline-check"><input name="addToDay" type="checkbox" checked /> Also add to ' + s[0] + "'s session</label>" : "") +
    '<button class="primary-button" type="submit">Save exercise</button>';
  el("modal-form").onsubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name")).trim().replace(/\s+/g, " ");
    if (!name) return;
    if (libraryExercises().some((e) => e[0].toLowerCase() === name.toLowerCase())) { toast("An exercise called \"" + name + "\" already exists."); return; }
    state.customExercises.push({ name, group: String(data.get("group")), level: String(data.get("level")), sets: String(data.get("sets")).trim() || "3 x 10", rest: String(data.get("rest")).trim() || "60s rest", muscles: String(data.get("muscles") || "").trim() || String(data.get("group")).toLowerCase() });
    logChange("custom", "Created custom exercise " + name);
    const addToDay = canAdd && data.get("addToDay");
    saveState();
    closeModal();
    if (addToDay) addToSession(index, name); else refreshWorkoutViews();
    renderExercises();
    toast("Saved " + name + " to your library.");
  };
}

// ── Full exercise library ──
function renderExercises() {
  const groups = ["All"].concat(libraryGroups());
  el("exercise-filters").innerHTML = groups.map((group) => '<button type="button" class="' + (group === exerciseGroup ? "active" : "") + '" data-exercise-filter="' + safe(group) + '">' + safe(group) + '</button>').join("");
  all("[data-exercise-filter]").forEach((button) => button.addEventListener("click", () => {
    exerciseGroup = button.dataset.exerciseFilter;
    renderExercises();
  }));
  const query = el("exercise-search").value.trim().toLowerCase();
  const filtered = libraryExercises().filter((item) => (exerciseGroup === "All" || item[1] === exerciseGroup) && (item[0] + " " + item[5]).toLowerCase().includes(query));
  el("exercise-grid").innerHTML = filtered.length ? filtered.map(renderExerciseCard).join("") : '<div class="empty-state">No matching exercises found.</div>';
  wireExerciseCardButtons();
}

function renderExerciseCard(item) {
  const name = item[0];
  const target = sessionDayIndex == null ? todayIndex() : sessionDayIndex;
  const inSession = weekPlan()[target][5].includes(name);
  return '<article class="exercise-card"><h3>' + safe(name) + '</h3><div class="tag-row"><span class="tag accent">' + safe(item[2]) + '</span><span class="tag">' + safe(item[3]) + '</span><span class="tag">' + safe(item[4]) + '</span></div><p>' + safe(item[5]) + '</p>' +
    '<div class="exercise-actions"><button type="button" data-exercise-info="' + safe(name) + '">How to do it</button><a href="' + demoUrl(name) + '" target="_blank" rel="noopener">Watch demo</a>' +
    '<button type="button" data-lib-add="' + safe(name) + '" ' + (inSession ? "disabled" : "") + '>' + (inSession ? "In session" : "+ Session") + '</button>' +
    (isCustomExercise(name) ? '<button type="button" class="remove-ex" data-lib-delete="' + safe(name) + '">Delete</button>' : "") + '</div></article>';
}

function wireExerciseCardButtons() {
  all("#exercise-grid [data-exercise-info]").forEach((button) => button.addEventListener("click", () => openExerciseInfo(button.dataset.exerciseInfo)));
  all("[data-lib-add]").forEach((button) => button.addEventListener("click", () => {
    const target = sessionDayIndex == null ? todayIndex() : sessionDayIndex;
    if (addToSession(target, button.dataset.libAdd)) renderExercises();
  }));
  all("[data-lib-delete]").forEach((button) => button.addEventListener("click", () => {
    const name = button.dataset.libDelete;
    state.customExercises = state.customExercises.filter((e) => e.name !== name);
    Object.keys(state.dayExercises).forEach((day) => { state.dayExercises[day] = state.dayExercises[day].filter((n) => n !== name); });
    logChange("custom", "Deleted custom exercise " + name);
    saveState();
    refreshWorkoutViews();
    renderExercises();
    toast("Deleted " + name + ".");
  }));
}

// name | ingredients | kcal | protein g | cuisine (i = Indian, w = Western)
const DIET_SLOTS = [["Breakfast", 0.25], ["Lunch", 0.35], ["Snack", 0.12], ["Dinner", 0.28]];
const DIET_MEALS = {
  veg: {
    Breakfast: ["Paneer bhurji with 2 rotis|Paneer, onion, tomato, roti|420|24|i", "Moong dal chilla with curd|Moong dal, spinach, curd|350|22|i", "Protein oats with berries|Oats, milk, yogurt, berries|380|25|w", "Greek yogurt parfait|Greek yogurt, granola, banana|400|26|w", "Peanut butter banana toast|Whole-grain bread, peanut butter, banana, milk|420|16|w"],
    Lunch: ["Rajma chawal with salad|Kidney beans, rice, cucumber salad|600|22|i", "Paneer tikka bowl|Paneer, brown rice, peppers, curd|620|36|i", "Dal, roti and sabzi|Toor dal, 3 rotis, mixed veg|580|24|i", "Quinoa chickpea bowl|Quinoa, chickpeas, feta, veg|600|26|w", "Pasta primavera with cheese|Whole-wheat pasta, veg, parmesan|620|24|w"],
    Snack: ["Roasted chana and buttermilk|Chana, chaas|220|13|i", "Sprouts chaat|Moong sprouts, onion, tomato, lemon|200|14|i", "Greek yogurt with almonds|Yogurt, almonds, honey|230|18|w", "Cottage cheese and fruit|Cottage cheese, apple|240|20|w", "Banana peanut butter shake|Milk, banana, peanut butter|300|15|w"],
    Dinner: ["Palak paneer with roti|Paneer, spinach, 2 rotis|560|30|i", "Soya chunk curry with rice|Soya chunks, tomato gravy, rice|540|38|i", "Moong dal khichdi with curd|Rice, moong dal, ghee, curd|500|22|i", "Mushroom spinach pasta|Whole-wheat pasta, mushrooms, spinach, cheese|560|24|w", "Lentil soup with grilled cheese|Lentils, bread, cheese|520|26|w"],
  },
  vegan: {
    Breakfast: ["Poha with peanuts|Flattened rice, peanuts, veg|380|10|i", "Besan chilla with chutney|Gram flour, onion, mint chutney|340|16|i", "Tofu scramble on toast|Tofu, spinach, whole-grain toast|380|26|w", "Overnight oats with soy milk|Oats, soy milk, chia, berries|390|18|w", "Peanut butter smoothie bowl|Soy milk, banana, peanut butter, oats|430|17|w"],
    Lunch: ["Chole with rice|Chickpeas, rice, onion salad|620|24|i", "Dal tadka, rice and sabzi|Dal, rice, mixed veg|580|22|i", "Soya keema with 3 rotis|Soya granules, peas, rotis|600|40|i", "Quinoa black bean bowl|Quinoa, black beans, avocado, corn|620|24|w", "Tofu stir-fry with noodles|Tofu, rice noodles, veg|600|30|w"],
    Snack: ["Roasted chana and orange|Chana, orange|200|11|i", "Sprouts salad|Sprouts, cucumber, lemon|180|12|i", "Hummus with veg sticks|Hummus, carrot, cucumber|210|8|w", "Soy protein shake with banana|Soy milk, plant protein, banana|280|28|w", "Almonds and dates|Almonds, dates|240|7|w"],
    Dinner: ["Soya chunk curry with rice|Soya chunks, tomato gravy, rice|540|38|i", "Rajma masala with roti|Rajma, onion gravy, 2 rotis|540|22|i", "Moong dal khichdi|Rice, moong dal, veg|480|20|i", "Lentil bolognese pasta|Whole-wheat pasta, lentil sauce|560|28|w", "Chickpea curry with brown rice|Chickpeas, coconut gravy, brown rice|550|22|w"],
  },
  nonveg: {
    Breakfast: ["Masala omelette with 2 rotis|3 eggs, onion, roti|450|27|i", "Egg bhurji with toast|Eggs, onion, toast|420|26|i", "Eggs, toast and fruit|3 eggs, whole-grain toast, orange|440|28|w", "Protein oats with whey|Oats, whey, banana|420|34|w", "Chicken sausage egg wrap|Wrap, eggs, chicken sausage|460|30|w"],
    Lunch: ["Chicken curry with rice|Chicken, rice, salad|640|42|i", "Chicken tikka bowl|Chicken tikka, brown rice, veg|620|48|i", "Egg curry with 2 rotis|3 eggs, gravy, rotis|580|30|i", "Grilled chicken rice bowl|Chicken, rice, greens, avocado|650|46|w", "Tuna pasta salad|Tuna, whole-wheat pasta, veg|600|42|w"],
    Snack: ["Egg chaat|Boiled eggs, onion, chaat masala|190|14|i", "Chicken tikka skewers|Chicken breast, mint chutney|220|32|i", "Tuna on crackers|Tuna, crackers|220|24|w", "Whey shake with banana|Whey, milk, banana|300|32|w", "Greek yogurt with almonds|Yogurt, almonds, honey|230|18|w"],
    Dinner: ["Fish curry with rice and veg|Fish, rice, sabzi|560|40|i", "Light butter chicken with roti|Chicken, tomato gravy, 2 rotis|600|44|i", "Chicken keema with roti|Chicken mince, peas, 2 rotis|580|42|i", "Salmon with potatoes|Salmon, roasted potatoes, veg|620|40|w", "Chicken stir-fry with noodles|Chicken, noodles, veg|580|42|w"],
  },
};
const DIET_LABELS = [["veg", "🥛 Vegetarian"], ["nonveg", "🍗 Non-veg"], ["vegan", "🌱 Vegan"]];
const CUISINE_LABELS = [["any", "Any cuisine"], ["indian", "Indian first"], ["western", "Western first"]];

function renderMealPlan() {
  const host = el("meal-plan");
  if (!state.dietGenerated) { host.innerHTML = ""; return; }
  const prefs = state.dietPrefs;
  const target = num(state.targets.calories, 2000);
  let totalK = 0, totalP = 0;
  const cards = DIET_SLOTS.map(([slot, share]) => {
    let list = (DIET_MEALS[prefs.diet] || DIET_MEALS.nonveg)[slot].map((row) => { const [name, items, kcal, protein, cuisine] = row.split("|"); return { name, items, kcal: num(kcal), protein: num(protein), cuisine }; });
    const first = prefs.cuisine === "indian" ? "i" : prefs.cuisine === "western" ? "w" : "";
    if (first) list = list.filter((m) => m.cuisine === first).concat(list.filter((m) => m.cuisine !== first));
    const slotTarget = target * share;
    const pick = Math.min(num(prefs.picks[slot], 0), list.length - 1);
    let html = '<h3 class="plan-head">' + slot + ' <small>about ' + Math.round(slotTarget) + ' kcal - choose 1 of ' + list.length + '</small></h3>';
    list.forEach((m, i) => {
      const scale = Math.round(Math.min(1.8, Math.max(0.6, slotTarget / m.kcal)) * 10) / 10;
      if (i === pick) { totalK += m.kcal * scale; totalP += m.protein * scale; }
      html += '<article class="meal-card' + (i === pick ? " selected" : "") + '"><span>' + (m.cuisine === "i" ? "🇮🇳 Indian" : "🌍 Western") + '</span><h3>' + safe(m.name) + '</h3><p>' + safe(m.items) + '</p><p class="meal-macros"><b>' + Math.round(m.kcal * scale) + ' kcal</b> - ' + Math.round(m.protein * scale) + 'g protein - serving x' + scale + '</p><button type="button" data-pick="' + slot + '|' + i + '">' + (i === pick ? "✓ Selected" : "Choose this") + '</button></article>';
    });
    return html;
  }).join("");
  host.innerHTML = '<div class="plan-head plan-toolbar"><div class="filter-row">' + DIET_LABELS.map(([k, l]) => '<button type="button" class="' + (prefs.diet === k ? "active" : "") + '" data-diet="' + k + '">' + l + '</button>').join("") + '</div><div class="filter-row">' + CUISINE_LABELS.map(([k, l]) => '<button type="button" class="' + (prefs.cuisine === k ? "active" : "") + '" data-cuisine="' + k + '">' + l + '</button>').join("") + '</div><p class="plan-total">Your day: <b>' + Math.round(totalK) + ' kcal</b> - ' + Math.round(totalP) + 'g protein (target ' + Math.round(target) + ' kcal)</p></div>' + cards;
  const change = (patch) => { Object.assign(state.dietPrefs, patch, { picks: {} }); saveState(); renderMealPlan(); };
  host.querySelectorAll("[data-diet]").forEach((b) => b.addEventListener("click", () => change({ diet: b.dataset.diet })));
  host.querySelectorAll("[data-cuisine]").forEach((b) => b.addEventListener("click", () => change({ cuisine: b.dataset.cuisine })));
  host.querySelectorAll("[data-pick]").forEach((b) => b.addEventListener("click", () => { const [slot, i] = b.dataset.pick.split("|"); state.dietPrefs.picks[slot] = num(i); saveState(); renderMealPlan(); }));
}

function renderIngredients() {
  el("ingredient-list").innerHTML = state.ingredients.map((item, index) => '<span class="ingredient-chip">' + safe(item) + '<button type="button" data-remove-ingredient="' + index + '" aria-label="Remove ' + safe(item) + '">&times;</button></span>').join("");
  all("[data-remove-ingredient]").forEach((button) => button.addEventListener("click", () => {
    state.ingredients.splice(num(button.dataset.removeIngredient), 1);
    saveState();
    renderIngredients();
    el("ai-meal-results").innerHTML = ""; // old ideas no longer match the pantry
  }));
}

function renderFood() {
  const target = state.targets;
  const totals = mealTotals(mealsOn(today()));
  el("diet-target").textContent = target.calories;
  el("food-total").textContent = Math.round(totals.calories);
  el("food-target").textContent = target.calories;
  const macro = [["Protein", totals.protein, target.protein], ["Carbs", totals.carbs, target.carbs], ["Fat", totals.fat, target.fat]];
  el("food-progress").innerHTML = macro.map((item) => {
    const percent = Math.min(100, Math.round(item[1] / item[2] * 100));
    return '<div><strong>' + Math.round(item[1]) + "/" + item[2] + ' g</strong><span>' + item[0] + '</span><div class="meter"><i style="width:' + percent + '%"></i></div></div>';
  }).join("");
  el("meal-log").innerHTML = state.meals.filter((meal) => meal.date === today()).length ? mealsOn(today()).map((meal) => {
    return '<div class="meal-item"><div><strong>' + safe(meal.name) + '</strong><p>' + Math.round(meal.calories) + " kcal | " + Math.round(meal.protein) + "g protein | " + Math.round(meal.carbs) + "g carbs | " + Math.round(meal.fat) + 'g fat</p></div><button type="button" data-remove-meal="' + meal.id + '" aria-label="Remove ' + safe(meal.name) + '">&times;</button></div>';
  }).join("") : '<div class="empty-state">No meals logged yet.</div>';
  all("[data-remove-meal]").forEach((button) => button.addEventListener("click", () => {
    state.meals = state.meals.filter((meal) => meal.id !== button.dataset.removeMeal);
    saveState();
    renderFood();
    renderDashboard();
  }));
  renderMealPlan();
  renderIngredients();
}

// ── GPS / haversine helpers ──
function haversineKm(a, b) {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

function totalRouteKm(route) {
  let d = 0;
  for (let i = 1; i < route.length; i++) d += haversineKm(route[i - 1], route[i]);
  return d;
}

function cardioCalories(seconds) {
  return (cardioSelectedActivity ? cardioSelectedActivity.met : 0) * num(state.profile.weight || 70) * 3.5 * seconds / (200 * 60);
}

function fmtTime(s) {
  const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60;
  return [h, m, sec].map((x) => String(x).padStart(2, "0")).join(":");
}

function fmtPace(km, seconds) {
  if (km < 0.01) return "--:--";
  const secPerKm = seconds / km;
  return Math.floor(secPerKm / 60) + ":" + String(Math.round(secPerKm % 60)).padStart(2, "0");
}

// ── Map canvas drawing ──
function drawRoute() {
  const canvas = el("cardio-map-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.offsetWidth, H = canvas.offsetHeight;
  canvas.width = W; canvas.height = H;
  ctx.clearRect(0, 0, W, H);

  // dark map background with subtle grid
  ctx.fillStyle = "#1a2030";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  if (cardioRoute.length < 2) return;

  const lats = cardioRoute.map((p) => p.lat), lngs = cardioRoute.map((p) => p.lng);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const pad = 40;
  const scaleX = (maxLng === minLng) ? 1 : (W - pad * 2) / (maxLng - minLng);
  const scaleY = (maxLat === minLat) ? 1 : (H - pad * 2) / (maxLat - minLat);
  const toX = (lng) => pad + (lng - minLng) * scaleX;
  const toY = (lat) => H - pad - (lat - minLat) * scaleY;

  // glow trail
  ctx.shadowBlur = 10;
  ctx.shadowColor = "#eb7a58";
  ctx.strokeStyle = "#eb7a58";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  cardioRoute.forEach((p, i) => {
    i === 0 ? ctx.moveTo(toX(p.lng), toY(p.lat)) : ctx.lineTo(toX(p.lng), toY(p.lat));
  });
  ctx.stroke();
  ctx.shadowBlur = 0;

  // start dot (green)
  const sp = cardioRoute[0];
  ctx.fillStyle = "#4ade80";
  ctx.beginPath();
  ctx.arc(toX(sp.lng), toY(sp.lat), 6, 0, Math.PI * 2);
  ctx.fill();

  // current position dot — update the floating dot overlay
  const lp = cardioRoute[cardioRoute.length - 1];
  const dotEl = el("live-gps-dot");
  if (dotEl) {
    dotEl.hidden = false;
    dotEl.style.left = toX(lp.lng) + "px";
    dotEl.style.top = toY(lp.lat) + "px";
  }
}

function updateLiveStats() {
  const km = totalRouteKm(cardioRoute);
  el("cardio-timer").textContent = fmtTime(cardioSeconds);
  el("live-distance").textContent = km.toFixed(2);
  el("live-pace").textContent = fmtPace(km, cardioSeconds);
  el("cardio-burned").textContent = Math.round(cardioCalories(cardioMovingSeconds));
  el("live-elevation").textContent = Math.round(cardioElevGain);
  // speed: last 3 points avg
  if (cardioRoute.length >= 2) {
    const recent = cardioRoute.slice(-3);
    let d = 0;
    for (let i = 1; i < recent.length; i++) d += haversineKm(recent[i - 1], recent[i]);
    const dt = (recent[recent.length - 1].t - recent[0].t) / 3600000;
    el("live-speed").textContent = dt > 0 && Date.now() - cardioLastMoveAt < 8000 ? (d / dt).toFixed(1) : "0.0";
  }
}

function renderCardio() {
  // activity picker, grouped by category, with search
  const query = (el("activity-search") ? el("activity-search").value : "").trim().toLowerCase();
  el("activity-type-grid").innerHTML = CARDIO_CATEGORIES.map(([cat, timed, list]) => {
    const shown = list.filter((item) => !query || item[0].toLowerCase().includes(query) || cat.toLowerCase().includes(query));
    return shown.length ? '<h3 class="activity-cat">' + safe(cat) + (timed ? ' <small>timer-based</small>' : ' <small>GPS</small>') + '</h3><div class="activity-cat-grid">' + shown.map(([name, met, icon]) =>
      '<button type="button" class="activity-type-btn' + (cardioSelectedActivity && cardioSelectedActivity.name === name ? " active" : "") + '" data-act="' + safe(name) + '"><span class="act-icon">' + icon + '</span>' + safe(name) + '</button>').join("") + '</div>' : "";
  }).join("") || '<p class="empty-state">No activity matches your search.</p>';
  all("[data-act]").forEach((btn) => btn.addEventListener("click", () => {
    cardioSelectedActivity = CARDIO_ACTIVITIES.find((a) => a.name === btn.dataset.act) || cardioSelectedActivity;
    el("selected-activity-name").textContent = cardioSelectedActivity.name;
    el("gps-note").textContent = cardioSelectedActivity.timed ? "This activity is timer-based: calories come from your time and body weight, no GPS needed." : "GPS required - allow location access when prompted.";
    renderCardio();
  }));
  el("selected-activity-name").textContent = cardioSelectedActivity ? cardioSelectedActivity.name : "Choose an activity";
  el("cardio-start-btn").disabled = !cardioSelectedActivity;

  // totals & history
  const calories = state.cardioSessions.reduce((sum, s) => sum + num(s.calories), 0);
  const minutes = state.cardioSessions.reduce((sum, s) => sum + num(s.seconds) / 60, 0);
  const km = state.cardioSessions.reduce((sum, s) => sum + num(s.km || 0), 0);
  el("cardio-total-kcal").textContent = Math.round(calories);
  el("cardio-total-minutes").textContent = Math.round(minutes);
  if (el("cardio-total-km")) el("cardio-total-km").textContent = km.toFixed(1);
  el("cardio-history").innerHTML = state.cardioSessions.length
    ? state.cardioSessions.slice().reverse().map((s) =>
        '<div class="history-item strava-item">' +
        '<div class="strava-item-left"><span class="strava-act-icon">' + (s.icon || "🏃") + '</span>' +
        '<div><strong>' + safe(s.name) + '</strong><small>' + s.date + '</small></div></div>' +
        '<div class="strava-item-stats">' +
        '<span>' + (num(s.km || 0)).toFixed(2) + ' km</span>' +
        '<span>' + Math.round(s.calories) + ' kcal</span>' +
        '<span>' + fmtTime(num(s.seconds)) + '</span>' +
        '</div></div>'
      ).join("")
    : '<div class="empty-state">No activities yet. Hit Start to record your first session.</div>';
}

let cardioMovingSeconds = 0;
let cardioLastMoveAt = 0;

function startGpsSession() {
  if (!cardioSelectedActivity) { toast("Pick an activity first."); return; }
  const timedActivity = !!cardioSelectedActivity.timed;
  if (!timedActivity && !navigator.geolocation) {
    toast("GPS not available on this device.");
    return;
  }
  // switch to live view
  el("cardio-setup").hidden = true;
  el("cardio-live").hidden = false;
  el("live-activity-name").textContent = cardioSelectedActivity.name;
  cardioSeconds = 0;
  cardioMovingSeconds = 0;
  cardioLastMoveAt = 0;
  cardioRoute = [];
  cardioElevGain = 0;
  cardioPaused = false;
  el("map-no-gps").hidden = false;
  el("live-gps-dot").hidden = true;

  // timer
  cardioTimer = window.setInterval(() => {
    if (!cardioPaused) {
      cardioSeconds++;
      // Only time spent actually MOVING (a real GPS position change in the last 8 s) earns calories.
      if (timedActivity || Date.now() - cardioLastMoveAt < 8000) cardioMovingSeconds++;
      updateLiveStats();
    }
  }, 1000);

  // GPS watch (skipped for indoor / timer-based activities)
  if (timedActivity) { el("map-no-gps").hidden = false; el("map-no-gps").querySelector("p").textContent = "⏱️ Timer-based activity - no GPS needed"; return; }
  cardioGpsWatch = navigator.geolocation.watchPosition(
    (pos) => {
      el("map-no-gps").hidden = true;
      if (cardioPaused) return;
      if (pos.coords.accuracy && pos.coords.accuracy > 35) return; // weak fix (e.g. desktop Wi-Fi location): ignore
      const point = { lat: pos.coords.latitude, lng: pos.coords.longitude, alt: pos.coords.altitude || 0, t: Date.now() };
      if (cardioRoute.length > 0) {
        const last = cardioRoute[cardioRoute.length - 1];
        const dist = haversineKm(last, point);
        if (dist < 0.005) return; // ignore GPS jitter under 5 m
        cardioLastMoveAt = Date.now();
        if (point.alt && last.alt && point.alt > last.alt) cardioElevGain += point.alt - last.alt;
      }
      cardioRoute.push(point);
      drawRoute();
      updateLiveStats();
    },
    (err) => {
      el("map-no-gps").hidden = false;
      el("map-no-gps").querySelector("p").textContent = "📍 GPS error: " + err.message;
    },
    { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
  );
}

function pauseGpsSession() {
  cardioPaused = !cardioPaused;
  el("cardio-pause-btn").textContent = cardioPaused ? "▶ Resume" : "⏸ Pause";
}

function finishGpsSession() {
  if (cardioTimer) { window.clearInterval(cardioTimer); cardioTimer = null; }
  if (cardioGpsWatch !== null) { navigator.geolocation.clearWatch(cardioGpsWatch); cardioGpsWatch = null; }
  const km = totalRouteKm(cardioRoute);
  if (cardioSeconds > 10) {
    state.cardioSessions.push({
      id: String(Date.now()),
      date: today(),
      name: cardioSelectedActivity.name,
      icon: cardioSelectedActivity.icon,
      seconds: cardioSeconds,
      calories: cardioCalories(cardioMovingSeconds),
      km: km,
      elevGain: cardioElevGain,
    });
    logChange("cardio", "Finished " + cardioSelectedActivity.name + " - " + km.toFixed(2) + " km, " + Math.round(cardioCalories(cardioMovingSeconds)) + " kcal, " + fmtTime(cardioSeconds));
    saveState();
    toast("Activity saved — great work!");
  } else {
    toast("Session too short to save.");
  }
  cardioSeconds = 0;
  cardioRoute = [];
  cardioElevGain = 0;
  cardioPaused = false;
  el("cardio-live").hidden = true;
  el("cardio-setup").hidden = false;
  el("cardio-pause-btn").textContent = "⏸ Pause";
  renderCardio();
  renderDashboard();
  renderProgress();
}

function coachReply(prompt) {
  const text = prompt.toLowerCase().trim();
  const who = state.session.name ? " " + state.session.name : "";
  const todayLine = () => {
    let s = null;
    try { s = weekPlan()[todayIndex()]; } catch (e) { /* plan not ready */ }
    if (!s) return "Open the Workout tab to see today's session.";
    if (s[4]) return "Today (" + s[0] + ") is a rest day - walk, stretch, hydrate and sleep well so you come back stronger.";
    const names = (s[5] || []).slice(0, 3).join(", ");
    return "Today (" + s[0] + ") is " + s[1] + (names ? ": start with " + names : "") + ". Open Workout and tick each exercise off as you finish it.";
  };
  if (/^(wass?up|sup|wyd|what'?s up|whats up|how are you|how r u)\b/.test(text)) return "Doing great" + who + "! " + todayLine();
  if (/((do|train|workout|plan).*(to\w*day|now)|to\w*day.*(workout|plan|train)|should i do)/.test(text)) return todayLine();
  if (/(how much|what).*prot\w*/.test(text)) return "Your daily protein target is " + state.targets.protein + "g - about " + Math.round(num(state.targets.protein) / 4) + "g across 4 meals, from eggs, chicken, paneer, soya, dal or whey.";
  if (/^(hi|hii+|hey+|hello+|yo|sup|howdy)\b/.test(text) || text === "hi" || text === "hey") {
    return "Hey" + (state.session.name ? " " + state.session.name : "") + "! I'm Jiya. Ask me for a workout, a meal plan, your protein target, or a HIIT session and I'll tailor it to your profile.";
  }
  if (/(who are you|what can you do|what do you do|help)/.test(text)) {
    return "I'm Jiya, your AI training coach. Try things like \"generate a push day workout\", \"create a meal plan for cutting\", \"how much protein do I need\", or \"give me a HIIT workout\".";
  }
  if (/(thanks|thank you|thx)/.test(text)) return "Anytime - keep the consistency up and the results follow.";
  if (text.includes("protein")) return "Your current target is " + state.targets.protein + "g protein. Spread it across three or four meals and anchor each with a complete protein source.";
  if (text.includes("carb")) return "Your current target is " + state.targets.carbs + "g carbs - lean on them most around training sessions for fuel and recovery.";
  if (text.includes("calorie") || text.includes("kcal")) return "Your current daily target is " + state.targets.calories + " kcal, based on your profile and goals.";
  if (text.includes("meal") || text.includes("cut") || text.includes("diet")) return "Build meals around lean protein, vegetables and a measured carb portion. Aim for about " + Math.round(state.targets.calories / 4) + " kcal per meal if you eat four times.";
  if (text.includes("hiit")) return "Try five rounds: 40 seconds work, 20 seconds easy. Rotate squats, push-ups, mountain climbers and fast feet, then cool down for five minutes.";
  if (text.includes("cardio") || text.includes("run")) return "For steady-state cardio, aim for 25-40 minutes at a pace where you can still hold a conversation. Log it in Cardio so it counts toward your weekly total.";
  if (text.includes("weight") || text.includes("progress")) return "You're currently at " + state.profile.weight + "kg with a target of " + state.profile.targetWeight + "kg. Log your weight regularly in Progress so the trend stays accurate.";
  if (text.includes("push") || text.includes("chest") || text.includes("workout") || text.includes("split") || text.includes("exercise")) return "For your next push session: press, incline press, shoulder press, lateral raises and triceps work. Keep one or two reps in reserve.";
  return "Your targets are " + state.targets.calories + " kcal and " + state.targets.protein + "g protein. " + todayLine() + " You can also ask me about meals, cardio or progress.";
}

function activeChat() {
  return state.jiyaChats.find((chat) => chat.id === state.activeChatId) || null;
}

function renderChat() {
  const chat = activeChat();
  const messages = chat ? chat.messages : [];
  el("chat-log").innerHTML = messages.map((message) => '<div class="chat-message ' + message.role + (message.pending ? " pending" : "") + '">' + safe(message.text) + "</div>").join("");
  el("chat-log").scrollTop = el("chat-log").scrollHeight;
}

function renderChatHistory() {
  const list = el("chat-history-list");
  if (!list) return;
  if (!state.jiyaChats.length) {
    list.innerHTML = '<p class="chat-history-empty">No conversations yet - ask Jiya something to start one.</p>';
    return;
  }
  list.innerHTML = state.jiyaChats.map((chat) => {
    const active = chat.id === state.activeChatId;
    const dateLabel = new Date(chat.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" });
    return '<button type="button" class="chat-history-item' + (active ? " active" : "") + '" data-chat-id="' + chat.id + '">' +
      '<span class="chat-history-title">' + safe(chat.title) + "</span>" +
      '<span class="chat-history-date">' + dateLabel + "</span>" +
      "</button>";
  }).join("");
}

async function fetchJiyaReply(message, chat) {
  const payload = JSON.stringify({
    message: message,
    profile: state.profile,
    targets: state.targets,
    history: (chat ? chat.messages : []).filter((m) => !m.pending).slice(-6).map((m) => ({ role: m.role, text: m.text })),
  });
  let jiyaReason = "";
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 9000); // never leave the user waiting more than ~9 s
      const response = await fetch("/api/jiya", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, signal: ctl.signal });
      clearTimeout(timer);
      if (!response.ok) {
        let why = "";
        try { why = (await response.json()).reason || ""; } catch (e) { /* not JSON */ }
        jiyaReason = why || (response.status === 504 ? "timeout" : "down");
        if (["quota", "key", "model"].includes(why)) break; // retrying can't fix these
        throw new Error("bad status " + response.status);
      }
      const data = await response.json();
      if (!data || !data.reply) throw new Error("no reply in response");
      return data.reply;
    } catch (err) {
      if (!jiyaReason) jiyaReason = err && err.name === "AbortError" ? "timeout" : "down";
      if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 500)); // brief pause, then retry once
    }
  }
  // Both tries failed (AI busy or offline): answer from the built-in coach, and say so.
  return "(quick offline answer) " + coachReply(message);
}

async function addChat(prompt) {
  const clean = prompt.trim();
  if (!clean) return;
  let chat = activeChat();
  if (!chat) {
    chat = newChatObject();
    state.jiyaChats.unshift(chat);
    state.activeChatId = chat.id;
  }
  chat.messages.push({ role: "user", text: clean });
  if (chat.title === "New chat") chat.title = deriveChatTitle(chat.messages);
  chat.messages.push({ role: "jiya", text: "Thinking...", pending: true });
  state.jiyaChats = state.jiyaChats.slice(0, 30);
  saveState();
  renderChat();
  renderChatHistory();
  const reply = await fetchJiyaReply(clean, chat);
  const last = chat.messages[chat.messages.length - 1];
  if (last && last.pending) {
    last.text = reply;
    delete last.pending;
  } else {
    chat.messages.push({ role: "jiya", text: reply });
  }
  saveState();
  renderChat();
  renderChatHistory();
}

function renderProgress() {
  const calories = [];
  const labels = [];
  for (let index = 6; index >= 0; index -= 1) {
    const key = dateBefore(index);
    calories.push(Math.round(state.cardioSessions.filter((item) => item.date === key).reduce((sum, item) => sum + num(item.calories), 0)));
    labels.push(DAYS[new Date(key + "T12:00:00").getDay()]);
  }
  bars(el("burn-chart"), calories, labels);
  const entries = state.weightHistory.slice(-7);
  weightLineChart(el("weight-chart"), state.weightHistory.slice(-14), state.profile.targetWeight);
  el("weight-chart-message").hidden = entries.length > 0;
  const consistency = Array.from({ length: 8 }, (_, index) => {
    const end = dateBefore(index * 7);
    const start = dateBefore(index * 7 + 6);
    return state.completedWorkouts.filter((item) => item.date >= start && item.date <= end).length;
  }).reverse();
  el("consistency-chart").innerHTML = consistency.map((value, index) => '<div><i style="height:' + Math.max(3, Math.min(100, value * 25)) + '%"></i><span>W' + (index + 1) + (value ? '<small>' + value + '</small>' : '') + '</span></div>').join("");
  const total = state.cardioSessions.reduce((sum, item) => sum + num(item.calories), 0);
  el("summary-workouts").textContent = state.completedWorkouts.length;
  el("summary-completed").textContent = state.completedWorkouts.length;
  el("summary-burned").textContent = Math.round(total);
  el("summary-weight").textContent = state.weightHistory.length;
}

function renderProfile() {
  const profile = state.profile;
  const target = state.targets;
  el("profile-calories").textContent = target.calories + " kcal";
  el("profile-protein").textContent = target.protein + " g";
  el("profile-carbs").textContent = target.carbs + " g";
  el("profile-fat").textContent = target.fat + " g";
  el("selected-sports").textContent = profile.sports.join(", ");
  el("selected-goals").textContent = profile.goals.join(", ");
  el("sport-choices").innerHTML = SPORT_CHOICES.map((item) => '<button type="button" class="choice-button ' + (profile.sports.includes(item) ? "active" : "") + '" data-sport="' + safe(item) + '">' + item + '</button>').join("");
  el("goal-choices").innerHTML = getRelevantGoals().map((item) => '<button type="button" class="choice-button ' + (profile.goals.includes(item) ? "active" : "") + '" data-goal="' + safe(item) + '">' + item + '</button>').join("");
  all("[data-sport]").forEach((button) => button.addEventListener("click", () => toggleChoice("sports", button.dataset.sport)));
  all("[data-goal]").forEach((button) => button.addEventListener("click", () => toggleChoice("goals", button.dataset.goal)));
  const form = el("profile-form");
  form.elements.age.value = profile.age;
  form.elements.height.value = profile.height;
  form.elements.weight.value = profile.weight;
  form.elements.targetWeight.value = profile.targetWeight;
  form.querySelectorAll('input[name="level"]').forEach((radio) => { radio.checked = radio.value === profile.level; });
}

function toggleChoice(key, value) {
  const list = state.profile[key];
  if (list.includes(value)) {
    if (list.length === 1) {
      toast("Keep at least one selection.");
      return;
    }
    state.profile[key] = list.filter((item) => item !== value);
  } else {
    state.profile[key] = [...list, value];
  }
  // Goals only make sense for the chosen sports - drop any that no longer apply.
  if (key === "sports") state.profile.goals = state.profile.goals.filter((goal) => getRelevantGoals().includes(goal));
  saveState();
  renderProfile();
  renderDashboard();
}

function calculateTargets(profile) {
  const factor = { beginner: 1.4, intermediate: 1.55, advanced: 1.7, elite: 1.85 };
  const bmr = 10 * num(profile.weight) + 6.25 * num(profile.height) - 5 * num(profile.age) + 5;
  const extra = profile.goals.includes("Lean bulk") ? 220 : profile.goals.includes("Build endurance") ? 100 : 0;
  const calories = Math.max(1600, Math.round((bmr * (factor[profile.level] || 1.4) + extra) / 25) * 25);
  const protein = Math.round(num(profile.weight) * 2.2);
  const fat = Math.round(num(profile.weight) * 0.9);
  return { calories, protein, carbs: Math.max(80, Math.round((calories - protein * 4 - fat * 9) / 4)), fat };
}

function closeModal() {
  el("modal-backdrop").hidden = true;
  document.querySelector(".modal").classList.remove("wide");
  el("modal-form").onsubmit = null;
  if (typeof renderLogsPage === "function") { renderLogsPage(); renderHistory(); }
}

function openMealModal() {
  el("modal-backdrop").hidden = false;
  el("modal-title").textContent = "Log meal";
  el("modal-form").innerHTML = '<label>Meal name<input name="name" type="text" required placeholder="Chicken rice bowl" /></label><label>Calories<input name="calories" type="number" min="0" value="550" required /></label><div class="details-grid"><label>Protein (g)<input name="protein" type="number" min="0" value="35" required /></label><label>Carbs (g)<input name="carbs" type="number" min="0" value="62" required /></label><label>Fat (g)<input name="fat" type="number" min="0" value="16" required /></label></div><button class="primary-button" type="submit">Save meal</button>';
  el("modal-form").onsubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    state.meals.push({ id: String(Date.now()), date: today(), name: String(data.get("name")).trim(), calories: num(data.get("calories")), protein: num(data.get("protein")), carbs: num(data.get("carbs")), fat: num(data.get("fat")) });
    logChange("food", "Logged meal " + String(data.get("name")).trim() + " (" + num(data.get("calories")) + " kcal)");
    saveState();
    closeModal();
    renderFood();
    renderDashboard();
    toast("Meal added to today's log.");
  };
}

function openWeightModal() {
  el("modal-backdrop").hidden = false;
  el("modal-title").textContent = "Log weight";
  el("modal-form").innerHTML = '<label>Weight (kg)<input name="weight" type="number" min="30" max="250" step="0.1" value="' + safe(state.profile.weight) + '" required /></label><button class="primary-button" type="submit">Save weight</button>';
  el("modal-form").onsubmit = (event) => {
    event.preventDefault();
    const value = num(new FormData(event.currentTarget).get("weight"));
    state.weightHistory.push({ date: today(), weight: value });
    state.profile.weight = value;
    logChange("weight", "Logged weight " + value + " kg");
    saveState();
    closeModal();
    renderProgress();
    renderProfile();
    renderDashboard();
    toast("Weight logged.");
  };
}

function openExerciseInfo(name) {
  const item = findExercise(name);
  if (!item) return;
  const cue = (window.FLEXFIT_DATA && window.FLEXFIT_DATA.cues[name]) || "Keep your setup stable, use a controlled range of motion, and stop when form breaks down.";
  el("modal-backdrop").hidden = false;
  document.querySelector(".modal").classList.remove("wide");
  el("modal-title").textContent = item[0];
  el("modal-form").onsubmit = (event) => event.preventDefault();
  el("modal-form").innerHTML = '<p class="modal-copy"><strong>' + safe(item[3]) + '</strong> with ' + safe(item[4]) + '. Works: ' + safe(item[5]) + '.</p><p class="modal-copy">' + safe(cue) + '</p><a class="outline-button" href="' + demoUrl(item[0]) + '" target="_blank" rel="noopener">Watch demo video</a><button class="primary-button" type="button" id="exercise-close">Got it</button>';
  el("exercise-close").addEventListener("click", closeModal);
}

let lastScanResult = null;

function demoScanResult(reason) {
  return '<strong>Couldn\'t scan this photo</strong><p class="scan-demo-note">' + safe(reason || "Something went wrong. Please try again.") + '</p>';
}

function renderScanItems(data) {
  const rows = data.items.map((item) =>
    '<li><span class="scan-item-name">' + safe(item.name) + (item.grams ? " <small>" + Math.round(item.grams) + "g</small>" : "") + '</span>' +
    '<span class="scan-item-macros">' + Math.round(item.calories) + " kcal &middot; P " + Math.round(item.protein) + "g &middot; C " + Math.round(item.carbs) + "g &middot; F " + Math.round(item.fat) + "g</span></li>"
  ).join("");
  return (
    "<strong>AI estimate for your photo:</strong>" +
    '<ul class="scan-items">' + rows + "</ul>" +
    '<p class="scan-totals"><strong>Total:</strong> ' + Math.round(data.calories) + " kcal &middot; Protein " + Math.round(data.protein) + "g &middot; Carbs " + Math.round(data.carbs) + "g &middot; Fat " + Math.round(data.fat) + "g</p>" +
    '<button type="button" class="primary-button" id="log-scanned-food">Log this scan</button>'
  );
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      resolve(typeof result === "string" ? result.split(",")[1] || "" : "");
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

// Phone photos are often 5-12 MB, and Netlify Functions reject request bodies over ~6 MB
// (base64 also adds ~33%). Shrinking to 1024px JPEG keeps uploads small AND makes Gemini faster.
async function imageToScanBase64(file, maxSize = 1024, quality = 0.82) {
  try {
    const url = URL.createObjectURL(file);
    const img = await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("decode failed"));
      image.src = url;
    });
    URL.revokeObjectURL(url);
    const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    return { base64: dataUrl.split(",")[1] || "", mimeType: "image/jpeg" };
  } catch (err) {
    // Some formats (e.g. HEIC on desktop browsers) can't be decoded - send the original instead.
    return { base64: await fileToBase64(file), mimeType: file.type || "image/jpeg" };
  }
}

function scanFailureReason(status, bodyText) {
  // Friendly wording only - the technical reason is written to the Netlify function logs.
  if (status === 413) return "That photo is too large. Try a smaller or closer photo.";
  if (status === 404) return "The scanner isn't set up on this site yet. Please try again after some time.";
  return "The food scanner is busy right now. Please try again after some time.";
}

async function analyzeFoodPhoto(file) {
  if (!file) {
    lastScanResult = null;
    return demoScanResult("No photo was selected.");
  }
  try {
    const { base64, mimeType } = await imageToScanBase64(file);
    let response;
    for (let attempt = 1; attempt <= 3; attempt += 1) { // the scanner retries by itself so you don't have to
      response = await fetch("/api/scan-food", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: base64, mimeType }) });
      if (response.ok || ![503, 504].includes(response.status) || attempt === 3) break;
      el("scan-result").innerHTML = "<strong>The scanner is busy - retrying (" + attempt + "/3)...</strong>";
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
    if (!response.ok) {
      lastScanResult = null;
      return demoScanResult(scanFailureReason(response.status, await response.text().catch(() => "")));
    }
    const data = await response.json();
    if (!data || !Array.isArray(data.items)) throw new Error("unexpected response shape");
    if (!data.items.length) {
      lastScanResult = null;
      return '<strong>No food items detected.</strong><p class="scan-demo-note">Try a clearer, well-lit photo with the food clearly visible.</p>';
    }
    // Make sure totals exist even if the function only returned per-item numbers.
    ["calories", "protein", "carbs", "fat"].forEach((key) => {
      if (!Number.isFinite(Number(data[key]))) data[key] = data.items.reduce((sum, item) => sum + (Number(item[key]) || 0), 0);
    });
    lastScanResult = data;
    return renderScanItems(data);
  } catch (err) {
    // Network error (no server at all, e.g. opened via file://) or an unreadable response.
    lastScanResult = null;
    return demoScanResult("Couldn't reach /api/scan-food (" + (err && err.message ? err.message : "network error") + "). This happens when the page isn't served by Netlify - e.g. opened as a local file.");
  }
}

// ── Sport-aware goals ──
const SG = {
  strength: ["Increase strength while lean", "Hit a new squat PR", "Hit a new bench press PR", "Hit a new deadlift PR", "Improve lifting technique", "Build explosive power", "Improve grip strength"],
  endurance: ["Build endurance", "Improve VO2 max", "Improve recovery between sessions", "Lose body fat while keeping fitness"],
  combat: ["Build fight endurance", "Improve footwork and speed", "Build punching/striking power", "Improve flexibility and mobility", "Make weight for a competition", "Improve reaction time", "Build a strong core and neck", "Prepare for a first competition"],
  team: ["Improve speed and agility", "Build explosive power", "Improve sport-specific endurance", "Prevent injuries", "Improve vertical jump", "Improve change of direction", "Build a strong core"],
  racket: ["Improve footwork and agility", "Build shoulder and arm strength", "Improve rotational power", "Build match endurance", "Prevent shoulder and elbow injuries", "Improve reaction time"],
  mind: ["Reduce stress", "Improve posture", "Improve balance and stability", "Improve flexibility", "Improve sleep and recovery", "Build a daily practice habit"],
};
const SPORT_GOALS = {
  "Bodybuilding": ["Lean bulk", "Aggressive bulk", "Cutting / fat loss", "Body recomposition", "Muscle hypertrophy", "Build bigger arms", "Wider shoulders", "Stronger chest", "Build a bigger back", "Grow legs and glutes", "Define abs and core", "Prep for a show", "Maintain physique", "Improve symmetry", "Fix weak points", "Increase strength while lean"],
  "Powerlifting": [...SG.strength, "Peak for a meet", "Lean bulk", "Move up a weight class", "Make weight safely", "Improve mobility for squat depth"],
  "CrossFit": ["Improve WOD performance", "Build work capacity", "Master gymnastics skills", "Get first muscle-up", "Improve Olympic lifting technique", "Improve double-unders", "Prepare for a competition", ...SG.strength.slice(0, 2)],
  "Running": ["Run your first 5K", "Run a faster 5K", "Run a 10K", "Run a half marathon", "Run a marathon", "Improve running speed", "Improve running economy", "Lose weight through running", ...SG.endurance],
  "Trail Running": ["Run a trail race", "Build hill and climbing endurance", "Improve technical downhill running", "Run an ultramarathon", "Strengthen ankles and stabilisers", ...SG.endurance],
  "Sprinting": ["Improve 100m time", "Improve 200m/400m time", "Improve acceleration", "Improve top-end speed", "Build explosive power", "Improve start and block technique", "Prevent hamstring injuries"],
  "Martial Arts": [...SG.combat],
  "Boxing": ["Boxing conditioning", ...SG.combat],
  "Kickboxing": [...SG.combat, "Improve kick power and balance"],
  "Brazilian Jiu-Jitsu": ["Build grappling endurance", "Improve hip mobility", "Build grip and forearm strength", "Improve guard retention", "Make weight for a competition", "Earn the next belt", "Prevent joint injuries"],
  "Wrestling": ["Build grappling endurance", "Improve takedown power", "Build neck and core strength", "Make weight for a competition", "Improve explosiveness", "Increase strength while lean"],
  "Cycling": ["Build cycling endurance", "Improve FTP / power", "Complete a century ride", "Improve climbing", "Improve sprint power", "Prevent back and knee pain", ...SG.endurance.slice(1)],
  "Mountain Biking": ["Improve technical handling", "Build leg power", "Improve balance and core strength", "Build endurance for long rides", "Improve upper-body strength", "Prevent crash injuries"],
  "Swimming": ["Improve swim speed", "Improve stroke technique", "Build swim endurance", "Swim a open-water race", "Improve shoulder mobility", "Improve breathing efficiency", "Build core and kick strength"],
  "Triathlon": ["Complete a sprint triathlon", "Complete an Olympic triathlon", "Complete a half or full Ironman", "Improve transitions", "Improve pacing across all three sports", ...SG.endurance],
  "Yoga": [...SG.mind, "Master a handstand", "Do the splits", "Build core strength", "Deepen backbends"],
  "Pilates": ["Build core strength", "Improve posture", "Improve flexibility", "Rehab and prevent back pain", "Improve body control", "Tone and lengthen muscles"],
  "Calisthenics": ["Master pull-ups", "Get first muscle-up", "Learn a handstand", "Learn a front lever", "Learn a planche", "Build bodyweight strength", "Body recomposition", "Master dips and push-up variations"],
  "Rock Climbing": ["Build finger and grip strength", "Climb a harder grade", "Improve climbing endurance", "Improve flexibility and hip mobility", "Improve pull strength", "Prevent finger and shoulder injuries"],
  "Hiking": ["Prepare for a multi-day trek", "Build leg and core strength", "Improve uphill endurance", "Build balance and ankle strength", "Carry a heavier pack comfortably", ...SG.endurance.slice(0, 2)],
  "Football": [...SG.team, "Improve sprint speed", "Improve ball-striking power"],
  "Basketball": [...SG.team, "Improve shooting stamina", "Improve defensive footwork"],
  "Tennis": [...SG.racket, "Improve serve power"],
  "Badminton": [...SG.racket, "Improve jump-smash power"],
  "Table Tennis": ["Improve reaction time", "Improve footwork", "Build forearm and wrist strength", "Improve match focus", "Prevent shoulder strain"],
  "Volleyball": [...SG.team, "Improve spike and block jump", "Build shoulder strength"],
  "Cricket": ["Improve batting power", "Improve bowling speed", "Improve fielding agility", "Build rotational core strength", "Prevent back and shoulder injuries", "Build stamina for long matches"],
  "Baseball": ["Improve throwing velocity", "Improve bat speed", "Build rotational power", "Prevent shoulder and elbow injuries", "Improve sprint speed", "Improve fielding agility"],
  "Golf": ["Increase driving distance", "Improve rotational mobility", "Build core and glute strength", "Improve balance and swing consistency", "Prevent lower-back pain", "Build walking endurance for 18 holes"],
  "Rugby": [...SG.team, "Build tackling strength", "Gain functional mass", "Build neck strength"],
  "Hockey": [...SG.team, "Improve skating or running speed", "Build shot power"],
  "Skiing": ["Build leg endurance", "Improve balance and edge control", "Strengthen knees and prevent injury", "Improve core stability", "Prepare for ski season"],
  "Snowboarding": ["Build leg endurance", "Improve balance and core stability", "Strengthen wrists and prevent falls injuries", "Prepare for the season", "Improve flexibility"],
  "Surfing": ["Improve paddling endurance", "Improve pop-up speed", "Build shoulder strength and mobility", "Improve balance and core", "Improve breath-hold and recovery"],
  "Rowing": ["Improve 2K erg time", "Build rowing endurance", "Build leg drive and back strength", "Improve technique", "Prevent lower-back pain", "Make lightweight weight"],
  "Dance": ["Improve flexibility", "Build stamina", "Improve balance and control", "Build leg and core strength", "Prevent ankle and knee injuries", "Prepare for a performance"],
  "Gymnastics": ["Build shoulder and core strength", "Improve flexibility", "Learn a new skill", "Improve body control", "Prevent wrist and shoulder injuries", "Improve explosive power"],
  "Skateboarding": ["Improve balance and ankle strength", "Learn a new trick", "Build leg power", "Prevent wrist and ankle injuries", "Improve endurance for long sessions"],
};
const FALLBACK_SPORT_GOALS = ["Improve sport performance", "Build endurance", "Increase strength while lean", "Improve mobility", "Prevent injuries"];
const GENERAL_GOALS = ["Lose body fat", "Build muscle", "Improve overall health", "Return from injury", "General fitness"];

function getRelevantGoals() {
  const goals = [];
  state.profile.sports.forEach((sport) => (SPORT_GOALS[sport] || FALLBACK_SPORT_GOALS).forEach((goal) => { if (!goals.includes(goal)) goals.push(goal); }));
  GENERAL_GOALS.forEach((goal) => { if (!goals.includes(goal)) goals.push(goal); });
  return goals;
}

function resetScanner() {
  if (typeof uploadUrl !== "undefined" && uploadUrl) { URL.revokeObjectURL(uploadUrl); uploadUrl = null; }
  lastScanResult = null;
  const input = el("food-upload"); if (input) input.value = "";
  const preview = el("scan-preview"); if (preview) preview.textContent = "Snap or upload a photo of your plate - every ingredient is measured separately.";
  const result = el("scan-result"); if (result) { result.hidden = true; result.innerHTML = ""; }
  const button = el("scan-food"); if (button) button.disabled = true;
}

// ── Charts ──
function weightLineChart(node, entries, target) {
  if (!entries.length) { node.innerHTML = ""; return; }
  const W = 640, H = 280, L = 52, R = 24, T = 26, B = 42;
  const values = entries.map((item) => num(item.weight));
  const goal = num(target, 0);
  const pool = goal ? [...values, goal] : values;
  let lo = Math.min(...pool), hi = Math.max(...pool);
  if (hi - lo < 2) { lo -= 1.5; hi += 1.5; } else { const pad = (hi - lo) * 0.15; lo -= pad; hi += pad; }
  const x = (i) => entries.length === 1 ? L + (W - L - R) / 2 : L + i * (W - L - R) / (entries.length - 1);
  const y = (v) => T + (hi - v) / (hi - lo) * (H - T - B);
  const muted = 'style="fill:var(--muted);font-size:11px"';
  let svg = '<svg class="weight-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Weight history line chart">';
  for (let k = 0; k <= 4; k += 1) {
    const v = lo + (hi - lo) * k / 4;
    svg += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(v) + '" y2="' + y(v) + '" style="stroke:var(--line)"/><text x="' + (L - 8) + '" y="' + (y(v) + 4) + '" text-anchor="end" ' + muted + '>' + v.toFixed(1) + '</text>';
  }
  if (goal) svg += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(goal) + '" y2="' + y(goal) + '" style="stroke:var(--accent);stroke-dasharray:6 5"/><text x="' + (W - R) + '" y="' + (y(goal) - 6) + '" text-anchor="end" style="fill:var(--accent);font-size:11px;font-weight:700">Target ' + goal + ' kg</text>';
  const pts = values.map((v, i) => x(i) + ',' + y(v));
  if (entries.length > 1) svg += '<polyline points="' + pts.join(' ') + '" fill="none" style="stroke:var(--accent)" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>';
  const step = Math.ceil(entries.length / 7);
  values.forEach((v, i) => {
    svg += '<circle cx="' + x(i) + '" cy="' + y(v) + '" r="5" style="fill:var(--accent)"><title>' + entries[i].date + ': ' + v + ' kg</title></circle>';
    if (entries.length <= 10 || i === entries.length - 1) svg += '<text x="' + x(i) + '" y="' + (y(v) - 11) + '" text-anchor="middle" style="fill:var(--text);font-size:12px;font-weight:700">' + v + '</text>';
    if (i % step === 0 || i === entries.length - 1) svg += '<text x="' + x(i) + '" y="' + (H - 14) + '" text-anchor="middle" ' + muted + '>' + entries[i].date.slice(5) + '</text>';
  });
  node.innerHTML = svg + '</svg>';
}

function renderLogs() {
  const foodList = el("food-log-list"), weightList = el("weight-log-list");
  if (!foodList || !weightList) return;
  const meals = state.meals.slice(-8).reverse();
  foodList.innerHTML = meals.length ? meals.map((meal) => '<li><span>' + safe(meal.name) + '<small>' + safe(meal.date) + ' - P ' + num(meal.protein) + 'g C ' + num(meal.carbs) + 'g F ' + num(meal.fat) + 'g</small></span><strong>' + num(meal.calories) + ' kcal</strong></li>').join("") : '<li class="log-empty">No meals logged yet.</li>';
  const weights = state.weightHistory.slice(-8);
  weightList.innerHTML = weights.length ? weights.map((entry, i) => {
    const prev = i > 0 ? weights[i - 1].weight : (state.weightHistory.length > weights.length ? state.weightHistory[state.weightHistory.length - weights.length - 1].weight : null);
    const diff = prev === null ? "" : (num(entry.weight) - num(prev) > 0 ? "+" : "") + (num(entry.weight) - num(prev)).toFixed(1) + " kg";
    return '<li><span>' + safe(entry.date) + '<small>' + diff + '</small></span><strong>' + num(entry.weight) + ' kg</strong></li>';
  }).reverse().join("") : '<li class="log-empty">No weight logged yet.</li>';
}

// ── Nutrition AI: per-100g [kcal, protein, carbs, fat, type, usual portion g] ──
const NUTRITION_DB = {
  chicken: [165, 31, 0, 3.6, "p", 150], egg: [143, 13, 1, 10, "p", 120], soya: [120, 18, 10, 0.5, "p", 120], soy: [120, 18, 10, 0.5, "p", 120],
  paneer: [265, 18, 1.2, 20, "p", 100], tofu: [76, 8, 2, 4.8, "p", 150], fish: [130, 22, 0, 4, "p", 150], tuna: [116, 26, 0, 1, "p", 120],
  salmon: [208, 20, 0, 13, "p", 140], beef: [250, 26, 0, 15, "p", 130], mutton: [250, 25, 0, 17, "p", 130], dal: [116, 9, 20, 0.4, "p", 180],
  lentil: [116, 9, 20, 0.4, "p", 180], chickpea: [164, 9, 27, 2.6, "p", 150], rajma: [127, 9, 23, 0.5, "p", 150], beans: [127, 9, 23, 0.5, "p", 150],
  curd: [61, 3.5, 4.7, 3.3, "p", 150], yogurt: [61, 3.5, 4.7, 3.3, "p", 150], milk: [61, 3.2, 4.8, 3.3, "p", 200], whey: [380, 78, 8, 6, "p", 30],
  rice: [130, 2.7, 28, 0.3, "c", 180], roti: [297, 9, 50, 7, "c", 80], chapati: [297, 9, 50, 7, "c", 80], bread: [265, 9, 49, 3.2, "c", 60],
  oats: [389, 17, 66, 7, "c", 50], potato: [77, 2, 17, 0.1, "c", 200], pasta: [158, 6, 31, 1, "c", 180], noodle: [138, 4.5, 25, 2, "c", 180],
  quinoa: [120, 4.4, 21, 1.9, "c", 180], banana: [89, 1.1, 23, 0.3, "c", 100], apple: [52, 0.3, 14, 0.2, "c", 150],
  broccoli: [34, 2.8, 7, 0.4, "v", 120], spinach: [23, 2.9, 3.6, 0.4, "v", 100], tomato: [18, 0.9, 3.9, 0.2, "v", 100], onion: [40, 1.1, 9, 0.1, "v", 60],
  carrot: [41, 0.9, 10, 0.2, "v", 100], cucumber: [15, 0.7, 3.6, 0.1, "v", 100], capsicum: [31, 1, 6, 0.3, "v", 100], pepper: [31, 1, 6, 0.3, "v", 100],
  cabbage: [25, 1.3, 6, 0.1, "v", 100], peas: [81, 5, 14, 0.4, "v", 100], mushroom: [22, 3.1, 3.3, 0.3, "v", 100],
  "peanut butter": [588, 25, 20, 50, "f", 20], almond: [579, 21, 22, 50, "f", 25], nuts: [600, 18, 20, 52, "f", 25], cheese: [402, 25, 1.3, 33, "f", 30],
  oil: [884, 0, 0, 100, "f", 10], ghee: [900, 0, 0, 100, "f", 10], butter: [717, 0.9, 0.1, 81, "f", 10],
};

const RECIPES = [
  ["Chicken rice bowl", "nv", "chicken,rice,broccoli,oil", "Pan-sear the chicken, steam the broccoli and serve over rice."],
  ["Chicken veggie stir-fry", "nv", "chicken,capsicum,onion,rice,oil", "Stir-fry chicken with onion and capsicum on high heat, serve with rice."],
  ["Chicken wrap", "nv", "chicken,roti,cucumber,onion,curd", "Fill a roti with spiced chicken, cucumber, onion and a spoon of curd."],
  ["Egg fried rice", "v", "egg,rice,peas,carrot,oil", "Scramble eggs, toss with rice, peas and carrot."],
  ["Masala omelette and toast", "v", "egg,onion,tomato,bread,oil", "Whisk eggs with onion and tomato, cook as an omelette, serve with toast."],
  ["Egg bhurji with roti", "v", "egg,onion,tomato,roti,oil", "Scramble eggs with onion and tomato, eat with roti."],
  ["Egg and potato hash", "v", "egg,potato,onion,capsicum,oil", "Pan-fry diced potato and veg, crack eggs on top and cover."],
  ["Mushroom spinach omelette", "v", "egg,mushroom,spinach,oil", "Saute mushroom and spinach, pour in beaten eggs."],
  ["Soya chunk curry with rice", "vg", "soya,tomato,onion,rice,oil", "Soak soya chunks, simmer in onion-tomato masala, serve with rice."],
  ["Soya veggie stir-fry bowl", "vg", "soya,capsicum,broccoli,rice", "Stir-fry soaked soya with veg, serve over rice."],
  ["Paneer bhurji wrap", "v", "paneer,capsicum,onion,roti", "Crumble paneer with onion and capsicum, roll in a roti."],
  ["Paneer tikka bowl", "v", "paneer,capsicum,rice,curd", "Marinate paneer in curd and spices, grill, serve over rice."],
  ["Tofu veggie scramble", "vg", "tofu,spinach,tomato,bread", "Crumble tofu into a pan with spinach and tomato, serve on toast."],
  ["Dal rice", "vg", "dal,rice,onion,tomato,oil", "Pressure-cook dal, temper with onion and tomato, serve with rice."],
  ["Rajma chawal", "vg", "rajma,rice,onion,tomato", "Simmer rajma in onion-tomato gravy, serve with rice."],
  ["Chana salad", "vg", "chickpea,cucumber,tomato,onion", "Toss boiled chickpeas with chopped veg, lemon and salt."],
  ["Aloo matar with roti", "vg", "potato,peas,onion,roti,oil", "Cook potato and peas in onion masala, eat with roti."],
  ["Quinoa veggie bowl", "vg", "quinoa,chickpea,spinach,tomato", "Cook quinoa, top with chickpeas, spinach and tomato."],
  ["Protein oats", "v", "oats,milk,banana,peanut butter", "Cook oats in milk, top with banana and a spoon of peanut butter."],
  ["Overnight oats", "v", "oats,curd,banana,almond", "Soak oats in curd overnight, top with banana and almonds."],
  ["Fruit and yogurt bowl", "v", "curd,banana,apple,almond", "Layer curd with chopped fruit and crushed almonds."],
  ["Peanut butter banana toast", "v", "bread,peanut butter,banana", "Spread peanut butter on toast and add banana slices."],
  ["Curd rice with veg", "v", "curd,rice,cucumber,carrot", "Mix curd into soft rice, add grated carrot and cucumber."],
  ["Veggie pasta with cheese", "v", "pasta,tomato,mushroom,cheese,oil", "Boil pasta, toss with sauteed mushroom, tomato and cheese."],
  ["Tuna salad sandwich", "nv", "tuna,cucumber,tomato,bread", "Mix tuna with veg and stuff between toasted bread."],
  ["Fish with potato and broccoli", "nv", "fish,potato,broccoli,oil", "Pan-sear fish, roast potato and broccoli alongside."],
  ["Salmon quinoa bowl", "nv", "salmon,quinoa,spinach", "Bake salmon, serve on quinoa with wilted spinach."],
  ["Mutton curry with rice", "nv", "mutton,onion,tomato,rice", "Slow-cook mutton in onion-tomato masala, serve with rice."],
];
const FOOD_ALIASES = { soya: ["soya", "soy"], curd: ["curd", "yogurt", "yoghurt", "dahi"], dal: ["dal", "daal", "lentil"], roti: ["roti", "chapati", "phulka"], chickpea: ["chickpea", "chana", "chole"], rajma: ["rajma", "kidney bean"], egg: ["egg"], mutton: ["mutton", "lamb"], potato: ["potato", "aloo"] };
const DIET_BADGE = { nv: "🍗 Non-veg", v: "🥛 Vegetarian", vg: "🌱 Vegan" };

function buildRecipeIdeas(ingredients) {
  const pantry = ingredients.map((item) => item.toLowerCase());
  const has = (key) => (FOOD_ALIASES[key] || [key]).some((word) => pantry.some((item) => item.includes(word)));
  return RECIPES.map(([name, diet, needs, how]) => {
    const keys = needs.split(",");
    const have = keys.filter(has);
    let cal = 0, p = 0, c = 0, f = 0;
    keys.forEach((key) => { const d = NUTRITION_DB[key]; cal += d[0] * d[5] / 100; p += d[1] * d[5] / 100; c += d[2] * d[5] / 100; f += d[3] * d[5] / 100; });
    return { name, diet, how, have, missing: keys.filter((key) => !has(key)), score: have.length / keys.length, cal: Math.round(cal), p: Math.round(p), c: Math.round(c), f: Math.round(f) };
  }).filter((recipe) => recipe.have.length).sort((a, b) => b.score - a.score || a.missing.length - b.missing.length).slice(0, 6);
}

function buildMealIdeas(ingredients) {
  const parsed = ingredients.map((name) => {
    const key = Object.keys(NUTRITION_DB).sort((a, b) => b.length - a.length).find((k) => name.toLowerCase().includes(k));
    return key ? { name, data: NUTRITION_DB[key], estimated: false } : { name, data: [100, 3, 15, 3, "o", 80], estimated: true };
  });
  const templates = [
    { name: "High-protein power bowl", mult: { p: 1.3, c: 1, v: 1, f: 1, o: 1 }, how: "Build a bowl: carbs at the base, protein on top, finish with veg and a little fat." },
    { name: "Quick one-pan stir-fry", mult: { p: 1, c: 0.7, v: 1.5, f: 0.7, o: 1 }, how: "Heat a pan, cook the protein first, add veg for a few minutes, then toss with the carbs." },
    { name: "Light and lean plate", mult: { p: 1, c: 0.5, v: 1.7, f: 0.4, o: 0.8 }, how: "Keep it light: a lean protein, a big portion of veg and just a small carb side." },
    { name: "Hearty recovery meal", mult: { p: 1.1, c: 1.4, v: 1, f: 1, o: 1 }, how: "A bigger carb portion to refuel after training, with protein and veg alongside." },
  ];
  return templates.map((template) => {
    let cal = 0, p = 0, c = 0, f = 0;
    const items = parsed.map((item) => {
      const [k, pr, cb, ft, type, portion] = item.data;
      const grams = Math.max(10, Math.round(portion * (template.mult[type] || 1) / 5) * 5);
      cal += k * grams / 100; p += pr * grams / 100; c += cb * grams / 100; f += ft * grams / 100;
      return item.name + " " + grams + "g";
    });
    return { name: template.name, how: template.how, items: items.join(", "), cal: Math.round(cal), p: Math.round(p), c: Math.round(c), f: Math.round(f), estimated: parsed.some((item) => item.estimated) };
  });
}

// ── Sign-up password helper ──
const PASSWORD_RULES = {
  length: (pw) => pw.length >= 8,
  case: (pw) => /[a-z]/.test(pw) && /[A-Z]/.test(pw),
  number: (pw) => /\d/.test(pw),
  symbol: (pw) => /[^A-Za-z0-9]/.test(pw),
};
const STRENGTH_LABELS = ["Too short", "Weak", "Fair", "Good", "Strong"];

// Returns { level: 0-4, met: {length, case, number, symbol} } for a password.
function passwordStrength(pw) {
  const met = {};
  let count = 0;
  Object.keys(PASSWORD_RULES).forEach((rule) => {
    met[rule] = PASSWORD_RULES[rule](pw);
    if (met[rule]) count += 1;
  });
  // Under 8 characters is always "too short" no matter what else it contains.
  return { level: met.length ? Math.max(1, count) : 0, met, empty: !pw };
}

function updatePasswordHelper() {
  const pw = el("auth-password").value;
  const { level, met, empty } = passwordStrength(pw);
  el("pw-meter-bar").dataset.level = empty ? "0" : String(level);
  el("pw-strength-label").textContent = "Password strength: " + (empty ? "enter a password" : STRENGTH_LABELS[level]);
  all("#pw-checklist li").forEach((item) => item.classList.toggle("met", !!met[item.dataset.rule]));
  updateConfirmMatch();
}

function updateConfirmMatch() {
  const note = el("pw-match");
  const confirm = el("auth-confirm").value;
  if (!confirm) { note.hidden = true; return; }
  const same = confirm === el("auth-password").value;
  note.hidden = false;
  note.className = "pw-match " + (same ? "ok" : "bad");
  note.textContent = same ? "Passwords match." : "Passwords don't match yet.";
}

// ── Logs + History pages ──
let historyFilter = "all";
const HISTORY_ICONS = { complete: "✅", uncomplete: "↩️", plan: "🗓️", exercise: "🔁", custom: "🛠️", food: "🍽️", weight: "⚖️", cardio: "🏃", ownworkout: "🏋️" };
const HISTORY_FILTERS = [["all", "All"], ["workout", "🏋️ Sessions"], ["plan", "🗓️ Plans"], ["exercise", "🔁 Exercises"], ["food", "🍽️ Food"], ["weight", "⚖️ Weight"], ["cardio", "🏃 Cardio"]];
const HISTORY_GROUPS = { workout: ["complete", "uncomplete", "ownworkout"], plan: ["plan"], exercise: ["exercise", "custom"], food: ["food"], weight: ["weight"], cardio: ["cardio"] };

function renderHistory() {
  if (!el("history-list")) return;
  el("history-filters").innerHTML = HISTORY_FILTERS.map(([key, label]) => '<button type="button" class="' + (key === historyFilter ? "active" : "") + '" data-history-filter="' + key + '">' + label + '</button>').join("");
  all("[data-history-filter]").forEach((button) => button.addEventListener("click", () => { historyFilter = button.dataset.historyFilter; renderHistory(); }));
  const allowed = HISTORY_GROUPS[historyFilter];
  const items = state.history.filter((item) => !allowed || allowed.includes(item.type)).slice().reverse();
  if (!items.length) { el("history-list").innerHTML = '<div class="empty-state">Nothing here yet. Complete a session, change your plan or log a meal and it will show up.</div>'; return; }
  const days = [];
  items.forEach((item) => { let day = days.find((d) => d.date === item.date); if (!day) { day = { date: item.date, rows: [] }; days.push(day); } day.rows.push(item); });
  el("history-list").innerHTML = days.map((day) => '<h3 class="log-day">' + safe(day.date) + '</h3>' + day.rows.map((item) =>
    '<div class="log-row"><span class="log-icon" aria-hidden="true">' + (HISTORY_ICONS[item.type] || "📌") + '</span><span class="log-text">' + safe(item.text) + '<small>' + new Date(item.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + '</small></span></div>').join("")).join("");
}

function renderLogsPage() {
  if (!el("logs-food")) return;
  const dates = [...new Set(state.meals.map((m) => m.date))].sort().reverse();
  el("logs-food").innerHTML = dates.length ? dates.map((date) => {
    const meals = state.meals.filter((m) => m.date === date);
    const t = mealTotals(meals);
    return '<h3 class="log-day">' + safe(date) + ' <small>' + Math.round(t.calories) + ' kcal - P ' + Math.round(t.protein) + 'g C ' + Math.round(t.carbs) + 'g F ' + Math.round(t.fat) + 'g</small></h3>' + meals.map((m) =>
      '<div class="log-row"><span class="log-icon" aria-hidden="true">🍽️</span><span class="log-text">' + safe(m.name) + '<small>P ' + num(m.protein) + 'g - C ' + num(m.carbs) + 'g - F ' + num(m.fat) + 'g</small></span><strong>' + num(m.calories) + ' kcal</strong><button type="button" class="log-delete" data-del-meal="' + safe(m.id) + '" aria-label="Delete ' + safe(m.name) + '">✕</button></div>').join("");
  }).join("") : '<div class="empty-state">No meals logged yet. Tap "Log meal" above.</div>';
  const weights = state.weightHistory.map((w, i) => ({ ...w, i }));
  el("logs-weight").innerHTML = weights.length ? weights.slice().reverse().map((w) => {
    const prev = w.i > 0 ? state.weightHistory[w.i - 1].weight : null;
    const diff = prev === null ? "first entry" : (num(w.weight) - num(prev) > 0 ? "+" : "") + (num(w.weight) - num(prev)).toFixed(1) + " kg";
    return '<div class="log-row"><span class="log-icon" aria-hidden="true">⚖️</span><span class="log-text">' + safe(w.date) + '<small>' + diff + '</small></span><strong>' + num(w.weight) + ' kg</strong><button type="button" class="log-delete" data-del-weight="' + w.i + '" aria-label="Delete weight entry">✕</button></div>';
  }).join("") : '<div class="empty-state">No weight logged yet. Tap "Log weight" above.</div>';
  const own = (state.ownWorkouts || []).slice().reverse();
  const done = state.completedWorkouts.slice().reverse().slice(0, 15);
  el("logs-workouts").innerHTML = (own.length ? '<h3 class="log-day">Your own workouts</h3>' + own.map((w) =>
    '<div class="log-row"><span class="log-icon" aria-hidden="true">🏋️</span><span class="log-text">' + safe(w.name) + '<small>' + safe(w.date) + (w.minutes ? ' - ' + num(w.minutes) + ' min' : '') + (w.calories ? ' - ' + num(w.calories) + ' kcal' : '') + (w.exercises ? ' - ' + safe(w.exercises) : '') + (w.notes ? ' - ' + safe(w.notes) : '') + '</small></span><button type="button" class="log-delete" data-del-workout="' + safe(w.id) + '" aria-label="Delete workout">✕</button></div>').join("") : '<div class="empty-state">No workouts of your own yet. Tap "Log your own workout" above.</div>')
    + (done.length ? '<h3 class="log-day">Completed plan sessions</h3>' + done.map((w) => '<div class="log-row"><span class="log-icon" aria-hidden="true">✅</span><span class="log-text">' + safe(w.title || "Workout") + '<small>' + safe(w.date) + '</small></span></div>').join("") : "");
  all("[data-del-meal]").forEach((b) => b.addEventListener("click", () => {
    const meal = state.meals.find((m) => m.id === b.dataset.delMeal);
    state.meals = state.meals.filter((m) => m.id !== b.dataset.delMeal);
    if (meal) logChange("food", "Deleted meal " + meal.name);
    saveState(); renderAll();
  }));
  all("[data-del-weight]").forEach((b) => b.addEventListener("click", () => {
    const entry = state.weightHistory[num(b.dataset.delWeight)];
    state.weightHistory.splice(num(b.dataset.delWeight), 1);
    if (entry) logChange("weight", "Deleted weight entry " + entry.weight + " kg (" + entry.date + ")");
    saveState(); renderAll();
  }));
  all("[data-del-workout]").forEach((b) => b.addEventListener("click", () => {
    const w = state.ownWorkouts.find((x) => x.id === b.dataset.delWorkout);
    state.ownWorkouts = state.ownWorkouts.filter((x) => x.id !== b.dataset.delWorkout);
    if (w) logChange("ownworkout", "Deleted your workout " + w.name);
    saveState(); renderAll();
  }));
}

function openOwnWorkoutModal() {
  el("modal-backdrop").hidden = false;
  el("modal-title").textContent = "Log your own workout";
  el("modal-form").innerHTML = '<label>Workout name<input name="name" type="text" required placeholder="Evening gym session" /></label><div class="details-grid"><label>Date<input name="date" type="date" value="' + today() + '" required /></label><label>Duration (min)<input name="minutes" type="number" min="1" max="600" value="45" required /></label><label>Calories (optional)<input name="calories" type="number" min="0" /></label></div><label>Exercises (optional)<input name="exercises" type="text" placeholder="Bench 4x8, Rows 4x10, Plank 3x60s" /></label><label>Notes (optional)<input name="notes" type="text" placeholder="Felt strong today" /></label><button class="primary-button" type="submit">Save workout</button>';
  el("modal-form").onsubmit = (event) => {
    event.preventDefault();
    const d = new FormData(event.currentTarget);
    const w = { id: String(Date.now()), date: String(d.get("date")) || today(), name: String(d.get("name")).trim(), minutes: num(d.get("minutes")), calories: num(d.get("calories")), exercises: String(d.get("exercises") || "").trim(), notes: String(d.get("notes") || "").trim() };
    state.ownWorkouts.push(w);
    logChange("ownworkout", "Logged your own workout: " + w.name + " (" + w.minutes + " min)");
    saveState(); closeModal(); toast("Workout logged.");
  };
}

function events() {
  all("[data-page]").forEach((button) => button.addEventListener("click", () => changePage(button.dataset.page)));
  all("[data-nav]").forEach((link) => link.addEventListener("click", (event) => {
    event.preventDefault();
    changePage(link.dataset.nav);
  }));
  all("[data-tab-group]").forEach((button) => button.addEventListener("click", () => {
    if (button.dataset.tabGroup === "workout" && button.dataset.tab === "library") renderExercises();
    changeTab(button.dataset.tabGroup, button.dataset.tab);
  }));
  all("[data-next-profile]").forEach((button) => button.addEventListener("click", () => {
    const currentPanel = button.closest("[data-panel]");
    const from = currentPanel ? currentPanel.dataset.panel : "";
    const to = button.dataset.nextProfile;
    // Only guard forward navigation - never block clicking "Back".
    if (from === "sports" && to === "goals" && state.profile.sports.length === 0) {
      toast("Pick at least one sport to continue.");
      return;
    }
    if (from === "goals" && to === "details" && state.profile.goals.length === 0) {
      toast("Pick at least one goal to continue.");
      return;
    }
    changeTab("profile", to);
  }));
  el("menu-button").addEventListener("click", () => {
    const open = document.body.classList.toggle("menu-open");
    el("menu-button").setAttribute("aria-expanded", String(open));
  });
  el("theme-toggle").addEventListener("click", () => {
    const order = ["system", "light", "dark"];
    const currentIndex = order.indexOf(state.theme);
    state.theme = order[(currentIndex + 1) % order.length];
    saveState();
    applyTheme();
  });
  el("sign-out").addEventListener("click", async () => {
    const wasGuest = state.session.guest;
    if (wasGuest) {
      // Guest data lives only in sessionStorage for this tab - drop it entirely on sign out
      // rather than writing it into a persistent slot, so it never leaks into the next
      // person's (or device's) session.
      sessionStorage.removeItem(GUEST_STORAGE_KEY);
    } else if (sb) {
      await sb.auth.signOut(); // clears Supabase's own session storage on this device
    }
    state.session = { signedIn: false, name: "", guest: false };
    state = defaultState();
    resetScanner();
    applyAuthGate();
    renderAll();
    toast(wasGuest ? "Guest session ended - nothing from it was saved." : "Signed out. Your data stays saved in your account.");
  });
  all("[data-auth-tab]").forEach((button) => button.addEventListener("click", () => {
    all("[data-auth-tab]").forEach((b) => { b.classList.toggle("active", b === button); b.setAttribute("aria-selected", b === button ? "true" : "false"); });
    const isSignup = button.dataset.authTab === "signup";
    el("auth-submit").textContent = isSignup ? "Create Account" : "Sign In";
    el("auth-name-label").hidden = !isSignup;
    el("auth-name").required = isSignup;
    // Strength meter + confirm field only matter when creating an account.
    el("pw-helper").hidden = !isSignup;
    el("auth-confirm-label").hidden = !isSignup;
    el("auth-confirm").required = isSignup;
    el("auth-confirm").value = "";
    el("auth-password").autocomplete = isSignup ? "new-password" : "current-password";
    updatePasswordHelper();
  }));
  el("auth-password").addEventListener("input", updatePasswordHelper);
  el("auth-confirm").addEventListener("input", updateConfirmMatch);
  el("auth-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!sb) {
      toast("Supabase isn't configured yet - add your project URL and anon key in script.js.");
      return;
    }
    const name = el("auth-name").value.trim();
    const email = el("auth-email").value.trim();
    const password = el("auth-password").value;
    const isSignup = el("auth-submit").textContent.trim() === "Create Account";
    const submitButton = el("auth-submit");
    if (isSignup) {
      // Client-side checks first so people get instant, specific feedback.
      if (!passwordStrength(password).met.length) {
        toast("Use a password with at least 8 characters.");
        el("auth-password").focus();
        return;
      }
      if (el("auth-confirm").value !== password) {
        toast("Passwords don't match - please re-enter them.");
        el("auth-confirm").focus();
        return;
      }
    }
    submitButton.disabled = true;

    if (isSignup) {
      signingUp = true;
      const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: { data: { name } }, // stored as user_metadata, read back by sessionFromSupabaseUser()
      });
      submitButton.disabled = false;
      if (error) {
        signingUp = false;
        toast(error.message);
        return;
      }
      if (!data.session) {
        signingUp = false;
        // Email confirmation is enabled on this Supabase project - there's no session yet.
        toast("Account created! Check " + email + " to confirm your address, then sign in.");
        return;
      }
      // Brand new account - always start completely clean, never leak old/default profile data.
      const fresh = defaultState();
      fresh.session = sessionFromSupabaseUser(data.session.user);
      const { session: _drop, ...toSave } = fresh;
      await sb.from("app_state").insert({ user_id: fresh.session.userId, state: toSave });
      // Account is ready - send the person back to Sign In instead of logging them straight in.
      pendingSigninEmail = email;
      await sb.auth.signOut();
      signingUp = false;
      return;
    } else {
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      submitButton.disabled = false;
      if (error) {
        toast(error.message === "Invalid login credentials" ? "Incorrect email or password." : error.message);
        return;
      }
      // Correct credentials - load this account's own saved data, never anyone else's.
      await applySupabaseSession(data.session);
    }
    applyAuthGate();
    renderAll();
    toast("Welcome" + (state.session.name ? ", " + state.session.name : "") + "!");
  });
  el("google-signin-button").addEventListener("click", async () => {
    if (!sb) {
      toast("Supabase isn't configured yet - add your project URL and anon key in script.js.");
      return;
    }
    // This redirects the whole page to Google and back - the redirect-back is picked up by
    // the onAuthStateChange listener in boot(), which loads/creates this account's saved state.
    const { error } = await sb.auth.signInWithOAuth({ provider: "google" });
    if (error) toast(error.message);
  });
  el("auth-guest").addEventListener("click", () => {
    // Guest mode always starts from a completely clean slate, kept in this tab's
    // sessionStorage only - it never reads or overwrites the real signed-in account's
    // saved profile in localStorage, and it disappears when the tab closes.
    sessionStorage.removeItem(GUEST_STORAGE_KEY);
    state = defaultState();
    state.session = { signedIn: true, name: "Guest", guest: true };
    saveState();
    applyAuthGate();
    renderAll();
    toast("Exploring as Guest - nothing here will be saved after this tab closes.");
  });
  el("regenerate-workout").addEventListener("click", () => openSplitChooser(0));
  el("exercise-search").addEventListener("input", renderExercises);
  el("generate-diet").addEventListener("click", () => {
    state.dietGenerated = true;
    saveState();
    renderMealPlan();
    toast("Your daily meal plan is ready.");
  });
  el("food-upload").addEventListener("change", (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (uploadUrl) URL.revokeObjectURL(uploadUrl);
    uploadUrl = URL.createObjectURL(file);
    el("scan-preview").innerHTML = '<img src="' + uploadUrl + '" alt="Uploaded food plate preview" />';
    el("scan-food").disabled = false;
    el("scan-result").hidden = true;
  });
  el("open-camera").addEventListener("click", () => {
    // On phones "capture" opens the camera directly; desktop browsers just show the file picker.
    const input = el("food-upload");
    input.setAttribute("capture", "environment");
    input.click();
    input.addEventListener("change", () => input.removeAttribute("capture"), { once: true });
  });
  el("scan-food").addEventListener("click", async () => {
    const file = el("food-upload").files && el("food-upload").files[0];
    el("scan-result").hidden = false;
    el("scan-result").innerHTML = "<strong>Analyzing your photo...</strong>";
    el("scan-result").innerHTML = await analyzeFoodPhoto(file);
    if (el("log-scanned-food")) {
      el("log-scanned-food").addEventListener("click", () => {
        if (!lastScanResult) return;
        const names = lastScanResult.items.map((item) => item.name);
        const label = names.slice(0, 3).join(", ") + (names.length > 3 ? " +" + (names.length - 3) + " more" : "");
        state.meals.push({
          id: String(Date.now()),
          date: today(),
          name: "Scanned: " + label,
          calories: lastScanResult.calories,
          protein: lastScanResult.protein,
          carbs: lastScanResult.carbs,
          fat: lastScanResult.fat,
        });
        saveState();
        renderFood();
        renderDashboard();
        el("log-scanned-food").textContent = "Logged \u2713";
        el("log-scanned-food").disabled = true;
        toast("Logged to your nutrition log.");
      });
    }
  });
  el("open-meal-modal").addEventListener("click", openMealModal);
  el("logs-add-meal").addEventListener("click", openMealModal);
  el("logs-add-weight").addEventListener("click", openWeightModal);
  el("logs-add-workout").addEventListener("click", openOwnWorkoutModal);
  if (el("activity-search")) el("activity-search").addEventListener("input", renderCardio);
  el("nutrition-ai-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = el("ingredient-input");
    const value = input.value.trim();
    if (value) {
      el("ai-meal-results").innerHTML = "";
      value.split(/[,;\n]+/).map((part) => part.trim()).filter(Boolean).forEach((part) => {
        if (!state.ingredients.some((item) => item.toLowerCase() === part.toLowerCase())) state.ingredients.push(part);
      });
      saveState();
      renderIngredients();
    }
    input.value = "";
  });
  el("generate-ai-meals").addEventListener("click", () => {
    if (!state.ingredients.length) { el("ai-meal-results").innerHTML = "<div><strong>Add ingredients first</strong>Type what you have (e.g. chicken, rice, eggs) and press +.</div>"; return; }
    const recipes = buildRecipeIdeas(state.ingredients);
    el("ai-meal-results").innerHTML = recipes.length
      ? recipes.map((r) => '<div><strong>' + safe(r.name) + ' <small>' + DIET_BADGE[r.diet] + '</small></strong>' + safe(r.how) + '<span class="ai-meal-macros">✅ You have: ' + safe(r.have.join(", ")) + (r.missing.length ? '<br>🛒 Add: ' + safe(r.missing.join(", ")) : '<br>🎉 You have everything!') + '<br><b>' + r.cal + ' kcal</b> - P ' + r.p + 'g - C ' + r.c + 'g - F ' + r.f + 'g (one serving)</span></div>').join("")
      : buildMealIdeas(state.ingredients).map((meal) => '<div><strong>' + safe(meal.name) + '</strong>' + safe(meal.how) + '<span class="ai-meal-macros">' + safe(meal.items) + '<br><b>' + meal.cal + ' kcal</b> - P ' + meal.p + 'g - C ' + meal.c + 'g - F ' + meal.f + 'g</span></div>').join("");
  });
  el("cardio-start-btn").addEventListener("click", startGpsSession);
  el("cardio-pause-btn").addEventListener("click", pauseGpsSession);
  el("cardio-finish-btn").addEventListener("click", finishGpsSession);
  el("chat-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = el("coach-input");
    addChat(input.value);
    input.value = "";
  });
  all("[data-prompt]").forEach((button) => button.addEventListener("click", () => addChat(button.dataset.prompt)));
  el("new-chat-button").addEventListener("click", () => {
    state.activeChatId = null;
    saveState();
    renderChat();
    renderChatHistory();
    document.body.classList.remove("history-open");
    el("coach-input").focus();
  });
  el("chat-history-list").addEventListener("click", (event) => {
    const button = event.target.closest("[data-chat-id]");
    if (!button) return;
    state.activeChatId = button.dataset.chatId;
    saveState();
    renderChat();
    renderChatHistory();
    document.body.classList.remove("history-open");
  });
  el("mobile-history-toggle").addEventListener("click", () => {
    const open = document.body.classList.toggle("history-open");
    el("mobile-history-toggle").setAttribute("aria-expanded", String(open));
  });
  el("open-weight-modal").addEventListener("click", openWeightModal);
  el("close-modal").addEventListener("click", closeModal);
  el("modal-backdrop").addEventListener("click", (event) => {
    if (event.target === el("modal-backdrop")) closeModal();
  });
  el("profile-form").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!state.profile.sports.length) { toast("Pick at least one sport first."); changeTab("profile", "sports"); return; }
    if (!state.profile.goals.length) { toast("Pick at least one goal next."); changeTab("profile", "goals"); return; }
    if (!new FormData(event.currentTarget).get("level")) { toast("Choose your fitness level."); return; }
    const data = new FormData(event.currentTarget);
    state.profile = {
      ...state.profile,
      age: num(data.get("age"), state.profile.age),
      height: num(data.get("height"), state.profile.height),
      weight: num(data.get("weight"), state.profile.weight),
      targetWeight: num(data.get("targetWeight"), state.profile.targetWeight),
      level: String(data.get("level") || state.profile.level),
    };
    state.targets = calculateTargets(state.profile);
    const firstTime = !state.onboarded;
    state.onboarded = true;
    saveState();
    renderAll();
    applyAuthGate();
    changePage("dashboard");
    toast(firstTime ? "Profile set up - welcome to your dashboard!" : "Profile saved and AI targets updated.");
  });
  window.addEventListener("hashchange", () => changePage(window.location.hash.slice(1) || "dashboard", false));
}

function renderAll() {
  renderDashboard();
  renderWorkout();
  renderExercises();
  renderFood();
  renderCardio();
  renderChat();
  renderChatHistory();
  renderProgress();
  renderProfile();
  renderLogsPage();
  renderHistory();
}

function applyTheme() {
  const order = ["system", "light", "dark"];
  const current = order.includes(state.theme) ? state.theme : "system";
  if (current === "system") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", current);
  }
  const button = el("theme-toggle");
  if (button) button.textContent = "Theme: " + current.charAt(0).toUpperCase() + current.slice(1);
}

let pendingSigninEmail = "";
let signingUp = false; // while true, the auth listener ignores the temporary sign-in that sign-up creates

// Shows the Sign In tab (used after creating an account) with the email already typed in.
function showSigninAfterSignup() {
  const tab = document.querySelector('[data-auth-tab="signin"]');
  if (tab) tab.click();
  el("auth-email").value = pendingSigninEmail;
  el("auth-password").value = "";
  toast("Account created! Please sign in with your email and password.");
  el("auth-password").focus();
  pendingSigninEmail = "";
}

function applyAuthGate() {
  const authScreen = el("auth-screen");
  const shell = el("app-shell");
  if (!state.session.signedIn) {
    authScreen.hidden = false;
    shell.hidden = true;
    document.body.classList.remove("onboarding-mode");
    resetScanner();
    sessionDayIndex = null;
    el("auth-form").reset();
    return;
  }
  authScreen.hidden = true;
  shell.hidden = false;
  if (!state.onboarded) {
    document.body.classList.add("onboarding-mode");
    changeTab("profile", "sports"); // always start onboarding at step 1
    el("profile-heading-title").textContent = "Welcome to FlexFit AI" + (state.session.name ? ", " + state.session.name : "");
    el("profile-heading-copy").textContent = "Let's set up your profile first - Jiya uses it to calculate your daily targets.";
    el("profile-target-panel").hidden = true;
    changePage("profile");
  } else {
    document.body.classList.remove("onboarding-mode");
    el("profile-heading-title").textContent = "Your Profile";
    el("profile-heading-copy").textContent = "Pick as many sports and goals as you like - Jiya calculates your daily targets from all of them.";
    el("profile-target-panel").hidden = false;
  }
}

function finishBoot() {
  renderAll();
  changePage(window.location.hash.slice(1) || "dashboard", false);
  applyAuthGate();
  applyTheme();
  document.documentElement.classList.remove("booting"); // reveal the page only once we know which screen to show
}

// Boots the app. A guest session (this tab only) needs no network call and takes priority.
// Otherwise, if Supabase is configured, onAuthStateChange fires once immediately with whatever
// session already exists on this device (or null), then again on every future sign-in/out/
// token-refresh/Google-redirect-back - so this one listener covers both "restore my session on
// page load" and "react to auth changes" without a separate getSession() call.
function boot() {
  const guestRaw = sessionStorage.getItem(GUEST_STORAGE_KEY);
  if (guestRaw) {
    try {
      state = mergeState(defaultState(), JSON.parse(guestRaw));
    } catch {
      state = defaultState();
    }
    finishBoot();
    return;
  }
  if (!sb) {
    finishBoot(); // Supabase not configured yet - show the sign-in screen as-is
    return;
  }
  sb.auth.onAuthStateChange(async (event, session) => {
    if (state.session.guest) return; // a guest session should never be overwritten by this
    if (signingUp && event !== "SIGNED_OUT") return; // sign-up is in progress: stay on the sign-in screen
    if (event === "SIGNED_OUT") {
      state = defaultState();
    } else {
      await applySupabaseSession(session);
    }
    if (event === "SIGNED_OUT") signingUp = false;
    finishBoot();
    if (event === "SIGNED_OUT" && pendingSigninEmail) showSigninAfterSignup();
  });
  setTimeout(() => document.documentElement.classList.remove("booting"), 3000); // safety: never leave the page hidden
}

events();
applyTheme();
boot();
