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


let state = defaultState();
let exerciseGroup = "Chest";
// ── Strava-style GPS cardio tracker state ──
let cardioSeconds = 0;
let cardioTimer = null;
let cardioGpsWatch = null;
let cardioRoute = []; // [{lat, lng, alt, t}]
let cardioElevGain = 0;
let cardioPaused = false;
let cardioSelectedActivity = { name: "Running", met: 9.8, icon: "🏃" };
const CARDIO_ACTIVITIES = [
  { name: "Running",     met: 9.8,  icon: "🏃" },
  { name: "Cycling",     met: 7.5,  icon: "🚴" },
  { name: "Walking",     met: 3.5,  icon: "🚶" },
  { name: "Hiking",      met: 6.0,  icon: "🥾" },
  { name: "Swimming",    met: 8.0,  icon: "🏊" },
  { name: "Rowing",      met: 7.0,  icon: "🚣" },
  { name: "HIIT",        met: 10.0, icon: "⚡" },
  { name: "Football",    met: 7.0,  icon: "⚽" },
  { name: "Basketball",  met: 6.5,  icon: "🏀" },
  { name: "Jump Rope",   met: 12.0, icon: "🪢" },
  { name: "Yoga",        met: 3.0,  icon: "🧘" },
  { name: "Dance",       met: 5.5,  icon: "💃" },
];
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
    workoutVersion: 0,
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

function weekPlan() {
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
  const byName = (name) => EXERCISES.find((item) => item[0] === name);
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
      EXERCISES.filter((item) => item[1] === MUSCLE_WORDS[term])
        .sort((a, b) => Math.abs(levelOrder[a[2]] - userLevel) - Math.abs(levelOrder[b[2]] - userLevel))
        .slice(0, 2).forEach(add);
      return;
    }
    // 2) Everyday shorthand -> exact library name.
    const aliasKey = Object.keys(EXERCISE_ALIASES).find((key) => (" " + termKey + " ").includes(" " + key + " "));
    // 3) Otherwise score every exercise in the WHOLE library (not just this day's group).
    let best = null;
    let bestScore = 0;
    EXERCISES.forEach((item) => {
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

// Which specific day's exercises the library should show, or null for normal browsing.
let dayViewExercises = null;
let dayViewLabel = "";

function renderWorkout() {
  const plan = weekPlan();
  el("split-goal").textContent = state.profile.goals[0] || "general fitness";
  el("week-grid").innerHTML = plan.map((session, index) => {
    const id = today() + "-" + index;
    const complete = state.completedWorkouts.some((item) => item.id === id);
    const rest = session[4];
    const FULL_DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const realToday = FULL_DAYS[new Date().getDay()];
    const isToday = session[0] === realToday;
    const todayLabel = isToday ? '<span class="today-label">Today</span>' : "";
    const action = rest ? "" : '<button class="outline-button view-exercises" type="button" data-day-index="' + index + '">View Exercises</button>';
    const completeButton = rest ? "" : '<button class="complete-button ' + (complete ? "done" : "") + '" type="button" data-workout="' + index + '">' + (complete ? "Completed" : "Complete") + '</button>';
    return '<article class="week-card ' + (isToday ? "today" : "") + '">' + completeButton + '<span class="day-label">' + session[0] + '</span>' + todayLabel + '<h3>' + session[1] + '</h3><p>' + session[2] + '</p>' + action + '</article>';
  }).join("");
  all("[data-workout]").forEach((button) => button.addEventListener("click", () => {
    const index = num(button.dataset.workout);
    const id = today() + "-" + index;
    if (state.completedWorkouts.some((item) => item.id === id)) {
      state.completedWorkouts = state.completedWorkouts.filter((item) => item.id !== id);
      toast("Workout marked incomplete.");
    } else {
      state.completedWorkouts.push({ id, date: today(), title: plan[index][1] });
      toast("Workout logged. Great work.");
    }
    saveState();
    renderWorkout();
    renderDashboard();
    renderProgress();
  }));
  all(".view-exercises").forEach((button) => button.addEventListener("click", () => {
    const index = num(button.dataset.dayIndex);
    const session = plan[index];
    const matches = exercisesForSession(session);
    if (matches.length) {
      // Real day-specific view: show exactly this day's assigned exercises, not a whole muscle group.
      dayViewExercises = matches;
      dayViewLabel = session[0] + " — " + session[1];
      exerciseGroup = session[3] || "Chest";
    } else {
      // No confident match (e.g. a very free-form description) - fall back to browsing the group.
      dayViewExercises = null;
      exerciseGroup = EXERCISES.some((item) => item[1] === session[3]) ? session[3] : "Chest";
    }
    changeTab("workout", "library");
    renderExercises();
  }));
}

function renderExercises() {
  const banner = el("day-view-banner");
  const libraryTools = el("library-tools");
  if (dayViewExercises) {
    banner.hidden = false;
    libraryTools.hidden = true;
    el("day-view-label").textContent = dayViewLabel;
    el("exercise-grid").innerHTML = dayViewExercises.map(renderExerciseCard).join("");
    wireExerciseCardButtons();
    return;
  }
  banner.hidden = true;
  libraryTools.hidden = false;
  // Always show base groups + any sport-specific groups the user cares about
  const sports = state.profile.sports || [];
  const baseGroups = ["Chest","Back","Shoulders","Biceps","Triceps","Quads","Hamstrings","Glutes","Core","Calves","Full Body"];
  const sportGroups = [];
  if (sports.some(s => ["Pilates"].includes(s))) sportGroups.push("Pilates");
  if (sports.some(s => ["Yoga"].includes(s))) sportGroups.push("Yoga");
  if (sports.some(s => ["Boxing","Kickboxing","Martial Arts","Brazilian Jiu-Jitsu","Wrestling"].includes(s))) sportGroups.push("Combat");
  if (sports.some(s => ["Running","Trail Running","Sprinting","Triathlon"].includes(s))) sportGroups.push("Running");
  if (sports.some(s => ["Calisthenics"].includes(s))) sportGroups.push("Calisthenics");
  if (sports.some(s => ["Dance","Gymnastics"].includes(s))) sportGroups.push("Dance");
  const groups = [...baseGroups, ...sportGroups];
  el("exercise-filters").innerHTML = groups.map((group) => '<button type="button" class="' + (group === exerciseGroup ? "active" : "") + '" data-exercise-filter="' + group + '">' + group + '</button>').join("");
  all("[data-exercise-filter]").forEach((button) => button.addEventListener("click", () => {
    exerciseGroup = button.dataset.exerciseFilter;
    renderExercises();
  }));
  const query = el("exercise-search").value.trim().toLowerCase();
  const filtered = EXERCISES.filter((item) => (exerciseGroup === "Full Body" || item[1] === exerciseGroup) && item[0].toLowerCase().includes(query));
  el("exercise-grid").innerHTML = filtered.length ? filtered.map(renderExerciseCard).join("") : '<div class="empty-state">No matching exercises found.</div>';
  wireExerciseCardButtons();
}

function renderExerciseCard(item) {
  return '<article class="exercise-card"><h3>' + item[0] + '</h3><div class="tag-row"><span class="tag accent">' + item[2] + '</span><span class="tag">' + item[3] + '</span><span class="tag">' + item[4] + '</span></div><p>' + item[5] + '</p><div class="exercise-actions"><button type="button" data-exercise-info="' + safe(item[0]) + '">How to do it</button><button type="button" data-exercise-demo="' + safe(item[0]) + '">Watch demo</button></div></article>';
}

function wireExerciseCardButtons() {
  all("[data-exercise-info]").forEach((button) => button.addEventListener("click", () => openExerciseInfo(button.dataset.exerciseInfo)));
  all("[data-exercise-demo]").forEach((button) => button.addEventListener("click", () => {
    const query = encodeURIComponent(button.dataset.exerciseDemo + " exercise form");
    window.open("https://www.youtube.com/results?search_query=" + query, "_blank", "noopener");
  }));
  const exitButton = el("day-view-exit");
  if (exitButton) exitButton.onclick = () => {
    dayViewExercises = null;
    renderExercises();
    changeTab("workout", "split"); // "Back" returns to the weekly split, not the library
  };
}

function renderMealPlan() {
  const meals = [
    ["Breakfast", "Protein oats with berries", "Oats, Greek yogurt, berries and seeds."],
    ["Lunch", "Chicken rice bowl", "Grilled chicken, rice, greens and avocado."],
    ["Snack", "Yogurt fruit bowl", "High-protein yogurt, banana and almonds."],
    ["Dinner", "Salmon with potatoes", "Salmon, roasted potatoes and vegetables."],
  ];
  el("meal-plan").innerHTML = state.dietGenerated ? meals.map((meal, index) => '<article class="meal-card"><span>' + meal[0] + '</span><h3 id="meal-title-' + index + '">' + meal[1] + '</h3><p id="meal-detail-' + index + '">' + meal[2] + '</p><button type="button" data-swap="' + index + '">Swap alternative</button></article>').join("") : "";
  all("[data-swap]").forEach((button) => button.addEventListener("click", () => {
    const options = [
      ["Egg and veggie wrap", "Eggs, whole-grain wrap, spinach and fruit."],
      ["Turkey quinoa bowl", "Turkey, quinoa, salad and olive oil."],
      ["Cottage cheese toast", "Cottage cheese, toast, banana and cinnamon."],
      ["Tofu noodle stir fry", "Tofu, rice noodles and colorful vegetables."],
    ];
    const index = num(button.dataset.swap);
    el("meal-title-" + index).textContent = options[index][0];
    el("meal-detail-" + index).textContent = options[index][1];
    button.disabled = true;
    button.textContent = "Alternative selected";
  }));
}

function renderIngredients() {
  el("ingredient-list").innerHTML = state.ingredients.map((item, index) => '<span class="ingredient-chip">' + safe(item) + '<button type="button" data-remove-ingredient="' + index + '" aria-label="Remove ' + safe(item) + '">&times;</button></span>').join("");
  all("[data-remove-ingredient]").forEach((button) => button.addEventListener("click", () => {
    state.ingredients.splice(num(button.dataset.removeIngredient), 1);
    saveState();
    renderIngredients();
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
  return cardioSelectedActivity.met * num(state.profile.weight || 70) * 3.5 * seconds / (200 * 60);
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
  // activity type grid
  el("activity-type-grid").innerHTML = CARDIO_ACTIVITIES.map((a) =>
    '<button type="button" class="activity-type-btn' + (cardioSelectedActivity.name === a.name ? " active" : "") + '" data-act="' + safe(a.name) + '">' +
    '<span class="act-icon">' + a.icon + '</span>' + a.name + '</button>'
  ).join("");
  all("[data-act]").forEach((btn) => btn.addEventListener("click", () => {
    cardioSelectedActivity = CARDIO_ACTIVITIES.find((a) => a.name === btn.dataset.act) || cardioSelectedActivity;
    el("selected-activity-name").textContent = cardioSelectedActivity.name;
    renderCardio();
  }));
  el("selected-activity-name").textContent = cardioSelectedActivity.name;

  // totals & history
  const calories = state.cardioSessions.reduce((sum, s) => sum + num(s.calories), 0);
  const minutes = state.cardioSessions.reduce((sum, s) => sum + num(s.seconds) / 60, 0);
  const km = state.cardioSessions.reduce((sum, s) => sum + num(s.km || 0), 0);
  el("cardio-total-kcal").textContent = Math.round(calories);
  el("cardio-total-minutes").textContent = Math.round(minutes);
  if (el("cardio-total-km")) el("cardio-total-km").textContent = km.toFixed(1);
  el("cardio-history").innerHTML = state.cardioSessions.length
    ? state.cardioSessions.slice().reverse().slice(0, 10).map((s) =>
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
  if (!navigator.geolocation) {
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
      if (Date.now() - cardioLastMoveAt < 8000) cardioMovingSeconds++;
      updateLiveStats();
    }
  }, 1000);

  // GPS watch
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
  return "I didn't quite catch that. Try asking about a workout, a meal plan, your protein/calorie targets, cardio, or your progress.";
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
  try {
    const response = await fetch("/api/jiya", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: message,
        profile: state.profile,
        targets: state.targets,
        history: (chat ? chat.messages : []).filter((m) => !m.pending).slice(-6).map((m) => ({ role: m.role, text: m.text })),
      }),
    });
    if (!response.ok) throw new Error("bad status " + response.status);
    const data = await response.json();
    if (!data || !data.reply) throw new Error("no reply in response");
    return data.reply;
  } catch (err) {
    // Covers: no /api route (plain GitHub Pages, or opened via file://), the
    // Gemini key not configured yet on the server, or an upstream/network
    // failure. The app should never break just because the AI backend is
    // unreachable - fall back to the local rule-based coach instead.
    return coachReply(message);
  }
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
  el("modal-form").onsubmit = null;
}

function openMealModal() {
  el("modal-backdrop").hidden = false;
  el("modal-title").textContent = "Log meal";
  el("modal-form").innerHTML = '<label>Meal name<input name="name" type="text" required placeholder="Chicken rice bowl" /></label><label>Calories<input name="calories" type="number" min="0" value="550" required /></label><div class="details-grid"><label>Protein (g)<input name="protein" type="number" min="0" value="35" required /></label><label>Carbs (g)<input name="carbs" type="number" min="0" value="62" required /></label><label>Fat (g)<input name="fat" type="number" min="0" value="16" required /></label></div><button class="primary-button" type="submit">Save meal</button>';
  el("modal-form").onsubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    state.meals.push({ id: String(Date.now()), date: today(), name: String(data.get("name")).trim(), calories: num(data.get("calories")), protein: num(data.get("protein")), carbs: num(data.get("carbs")), fat: num(data.get("fat")) });
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
    saveState();
    closeModal();
    renderProgress();
    renderProfile();
    renderDashboard();
    toast("Weight logged.");
  };
}

function openExerciseInfo(name) {
  const item = EXERCISES.find((exercise) => exercise[0] === name);
  if (!item) return;
  el("modal-backdrop").hidden = false;
  el("modal-title").textContent = item[0];
  el("modal-form").innerHTML = '<p class="modal-copy">' + item[3] + ' with ' + item[4] + '. Keep your setup stable, use a controlled range of motion, and stop when form breaks down.</p><button class="primary-button" type="button" id="exercise-close">Got it</button>';
  el("exercise-close").addEventListener("click", closeModal);
}

let lastScanResult = null;

function demoScanResult(reason) {
  // "reason" says WHY the real scanner wasn't used, so a broken setup is visible instead of silent.
  const why = reason ? '<p class="scan-demo-note"><strong>Why you\'re seeing this:</strong> ' + safe(reason) + "</p>" : "";
  return '<strong>Demo estimate (AI scanner not connected):</strong><span>Chicken 180g</span><span>Rice 220g</span><span>Vegetables 120g</span><span>Approx. 620 kcal</span><p class="scan-demo-note">This is a fixed placeholder, not a real analysis of your photo. Set up the Gemini-powered scanner (see README) for a real per-photo estimate.</p>' + why;
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
  let detail = "";
  try { const parsed = JSON.parse(bodyText); detail = String(parsed.detail || parsed.error || "").slice(0, 220); } catch (e) { /* not JSON */ }
  if (status === 404) return "The /api/scan-food function wasn't found (404). It isn't deployed here - on Netlify check that netlify/functions/scan-food.js is in the repo, or run the site with `netlify dev` locally.";
  if (status === 502) return "Gemini rejected or failed the request" + (detail ? " (" + detail + ")" : "") + ". Open Netlify -> Logs -> Functions -> scan-food for Google's exact message - usually an invalid model name or API key.";
  if (status === 500) return "The scanner function ran but failed (" + status + ")" + (detail ? ": " + detail : ".") + " The most common cause is GEMINI_API_KEY missing in Netlify -> Site configuration -> Environment variables (redeploy after adding it).";
  if (status === 413) return "The photo was too large for the server (413).";
  if (status === 429) return "Gemini's rate limit was hit (429) - wait a minute and try again.";
  return "The scanner returned status " + status + (detail ? ": " + detail : ".");
}

async function analyzeFoodPhoto(file) {
  if (!file) {
    lastScanResult = null;
    return demoScanResult("No photo was selected.");
  }
  try {
    const { base64, mimeType } = await imageToScanBase64(file);
    const response = await fetch("/api/scan-food", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: base64, mimeType }),
    });
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

function events() {
  all("[data-page]").forEach((button) => button.addEventListener("click", () => changePage(button.dataset.page)));
  all("[data-nav]").forEach((link) => link.addEventListener("click", (event) => {
    event.preventDefault();
    changePage(link.dataset.nav);
  }));
  all("[data-tab-group]").forEach((button) => button.addEventListener("click", () => {
    // Clicking the Exercise Library tab directly (not via a day's "View Exercises" button)
    // always starts from normal browsing, not a leftover day-specific view.
    if (button.dataset.tabGroup === "workout" && button.dataset.tab === "library" && dayViewExercises) {
      dayViewExercises = null;
      renderExercises();
    }
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
      const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: { data: { name } }, // stored as user_metadata, read back by sessionFromSupabaseUser()
      });
      submitButton.disabled = false;
      if (error) {
        toast(error.message);
        return;
      }
      if (!data.session) {
        // Email confirmation is enabled on this Supabase project - there's no session yet.
        toast("Account created! Check " + email + " to confirm your address, then sign in.");
        return;
      }
      // Brand new account - always start completely clean, never leak old/default profile data.
      state = defaultState();
      state.session = sessionFromSupabaseUser(data.session.user);
      const { session: _drop, ...toSave } = state;
      await sb.from("app_state").insert({ user_id: state.session.userId, state: toSave });
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
  el("regenerate-workout").addEventListener("click", () => {
    state.workoutVersion += 1;
    saveState();
    renderWorkout();
    toast("Weekly split regenerated.");
  });
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
  el("nutrition-ai-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = el("ingredient-input");
    const value = input.value.trim();
    if (value) {
      value.split(/[,;\n]+/).map((part) => part.trim()).filter(Boolean).forEach((part) => {
        if (!state.ingredients.some((item) => item.toLowerCase() === part.toLowerCase())) state.ingredients.push(part);
      });
      saveState();
      renderIngredients();
    }
    input.value = "";
  });
  el("generate-ai-meals").addEventListener("click", () => {
    el("ai-meal-results").innerHTML = state.ingredients.length
      ? buildMealIdeas(state.ingredients).map((meal) => '<div><strong>' + safe(meal.name) + '</strong>' + safe(meal.how) + '<span class="ai-meal-macros">' + safe(meal.items) + '<br><b>' + meal.cal + ' kcal</b> - P ' + meal.p + 'g - C ' + meal.c + 'g - F ' + meal.f + 'g' + (meal.estimated ? ' (some items estimated)' : '') + '</span></div>').join("")
      : "<div><strong>Add ingredients first</strong>Type what you have (e.g. chicken, rice, eggs) and press +.</div>";
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

function applyAuthGate() {
  const authScreen = el("auth-screen");
  const shell = el("app-shell");
  if (!state.session.signedIn) {
    authScreen.hidden = false;
    shell.hidden = true;
    document.body.classList.remove("onboarding-mode");
    resetScanner();
    dayViewExercises = null; dayViewLabel = "";
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
    if (event === "SIGNED_OUT") {
      state = defaultState();
    } else {
      await applySupabaseSession(session);
    }
    finishBoot();
  });
}

events();
applyTheme();
boot();
