const STORAGE_KEY = "flexfit-ai-dashboard";
const GUEST_STORAGE_KEY = "flexfit-ai-dashboard-guest-session";
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DEFAULT_PROFILE = {
  age: 20,
  height: 179,
  weight: 73,
  targetWeight: 78,
  level: "beginner",
  sports: ["Bodybuilding", "Running", "Martial Arts"],
  goals: ["Lean bulk", "Boxing conditioning", "Body recomposition", "Increase strength while lean", "Run a 10K", "Return from injury"],
};
const DEFAULT_TARGETS = { calories: 2850, protein: 180, carbs: 350, fat: 80 };
const SPORT_CHOICES = ["Bodybuilding", "Powerlifting", "CrossFit", "Running", "Trail Running", "Sprinting", "Martial Arts", "Boxing", "Kickboxing", "Brazilian Jiu-Jitsu", "Wrestling", "Cycling", "Mountain Biking", "Swimming", "Triathlon", "Yoga", "Pilates", "Calisthenics", "Rock Climbing", "Hiking", "Football", "Basketball", "Tennis", "Badminton", "Table Tennis", "Volleyball", "Cricket", "Baseball", "Golf", "Rugby", "Hockey", "Skiing", "Snowboarding", "Surfing", "Rowing", "Dance", "Gymnastics", "Skateboarding"];
const GOAL_CHOICES = ["Lean bulk", "Boxing conditioning", "Body recomposition", "Increase strength while lean", "Run a 10K", "Return from injury", "Build endurance", "Improve mobility", "General fitness"];
const EXERCISES = [
  ["Barbell Bench Press", "Chest", "intermediate", "4 x 6-8", "120s rest", "chest | triceps | shoulders"],
  ["Incline Dumbbell Press", "Chest", "beginner", "4 x 8-10", "90s rest", "chest | shoulders"],
  ["Push-Up", "Chest", "beginner", "3 x 12-20", "60s rest", "chest | triceps | core"],
  ["Cable Chest Fly", "Chest", "beginner", "3 x 12-15", "60s rest", "chest"],
  ["Dumbbell Chest Press", "Chest", "beginner", "4 x 8-12", "90s rest", "chest | triceps"],
  ["Weighted Dip", "Chest", "advanced", "3 x 6-10", "120s rest", "chest | triceps"],
  ["Decline Barbell Press", "Chest", "intermediate", "4 x 8-10", "90s rest", "chest | triceps"],
  ["Pec Deck Machine", "Chest", "beginner", "3 x 12-15", "60s rest", "chest"],
  ["Barbell Row", "Back", "intermediate", "4 x 8-10", "90s rest", "back | biceps"],
  ["Lat Pulldown", "Back", "beginner", "3 x 10-12", "75s rest", "back | biceps"],
  ["Pull-Up", "Back", "intermediate", "4 x 6-10", "90s rest", "back | biceps"],
  ["Seated Cable Row", "Back", "beginner", "3 x 10-12", "75s rest", "back | biceps"],
  ["Single-Arm Dumbbell Row", "Back", "beginner", "3 x 10-12", "60s rest", "back | biceps"],
  ["Deadlift", "Back", "advanced", "4 x 5-6", "150s rest", "back | hamstrings | glutes"],
  ["T-Bar Row", "Back", "intermediate", "4 x 8-10", "90s rest", "back | biceps"],
  ["Standing Shoulder Press", "Shoulders", "intermediate", "4 x 8-10", "90s rest", "shoulders | triceps"],
  ["Lateral Raise", "Shoulders", "beginner", "3 x 12-15", "45s rest", "shoulders"],
  ["Face Pull", "Shoulders", "beginner", "3 x 15-20", "45s rest", "shoulders | back"],
  ["Arnold Press", "Shoulders", "intermediate", "3 x 8-10", "75s rest", "shoulders | triceps"],
  ["Front Raise", "Shoulders", "beginner", "3 x 12-15", "45s rest", "shoulders"],
  ["Rear Delt Fly", "Shoulders", "beginner", "3 x 12-15", "45s rest", "shoulders | back"],
  ["Barbell Curl", "Biceps", "beginner", "3 x 8-12", "60s rest", "biceps"],
  ["Dumbbell Hammer Curl", "Biceps", "beginner", "3 x 10-12", "60s rest", "biceps | forearms"],
  ["Incline Dumbbell Curl", "Biceps", "intermediate", "3 x 10-12", "60s rest", "biceps"],
  ["Preacher Curl", "Biceps", "intermediate", "3 x 8-10", "60s rest", "biceps"],
  ["Cable Curl", "Biceps", "beginner", "3 x 12-15", "45s rest", "biceps"],
  ["Concentration Curl", "Biceps", "beginner", "3 x 10-12", "45s rest", "biceps"],
  ["Close-Grip Bench Press", "Triceps", "intermediate", "4 x 8-10", "90s rest", "triceps | chest"],
  ["Tricep Rope Pushdown", "Triceps", "beginner", "3 x 12-15", "45s rest", "triceps"],
  ["Overhead Tricep Extension", "Triceps", "beginner", "3 x 10-12", "60s rest", "triceps"],
  ["Skull Crusher", "Triceps", "intermediate", "3 x 8-10", "75s rest", "triceps"],
  ["Bench Dip", "Triceps", "beginner", "3 x 12-15", "45s rest", "triceps | chest"],
  ["Diamond Push-Up", "Triceps", "intermediate", "3 x 10-15", "60s rest", "triceps | chest"],
  ["Goblet Squat", "Quads", "beginner", "4 x 10-12", "90s rest", "quads | glutes | core"],
  ["Barbell Back Squat", "Quads", "intermediate", "4 x 6-8", "120s rest", "quads | glutes | core"],
  ["Leg Press", "Quads", "beginner", "4 x 10-12", "90s rest", "quads | glutes"],
  ["Walking Lunge", "Quads", "beginner", "3 x 12 each", "60s rest", "quads | glutes"],
  ["Bulgarian Split Squat", "Quads", "intermediate", "3 x 10 each", "75s rest", "quads | glutes"],
  ["Leg Extension", "Quads", "beginner", "3 x 12-15", "60s rest", "quads"],
  ["Front Squat", "Quads", "advanced", "4 x 6-8", "120s rest", "quads | core"],
  ["Romanian Deadlift", "Hamstrings", "intermediate", "4 x 8-10", "120s rest", "hamstrings | glutes | back"],
  ["Leg Curl", "Hamstrings", "beginner", "3 x 12-15", "60s rest", "hamstrings"],
  ["Good Morning", "Hamstrings", "intermediate", "3 x 8-10", "90s rest", "hamstrings | back"],
  ["Stiff-Leg Deadlift", "Hamstrings", "intermediate", "4 x 8-10", "90s rest", "hamstrings | glutes"],
  ["Nordic Curl", "Hamstrings", "advanced", "3 x 6-8", "90s rest", "hamstrings"],
  ["Hip Thrust", "Glutes", "beginner", "4 x 10-12", "90s rest", "glutes | hamstrings"],
  ["Glute Bridge", "Glutes", "beginner", "3 x 15-20", "45s rest", "glutes"],
  ["Cable Kickback", "Glutes", "beginner", "3 x 12-15 each", "45s rest", "glutes"],
  ["Sumo Deadlift", "Glutes", "advanced", "4 x 6-8", "120s rest", "glutes | hamstrings | back"],
  ["Step-Up", "Glutes", "beginner", "3 x 10 each", "60s rest", "glutes | quads"],
  ["Plank", "Core", "beginner", "3 x 45s", "45s rest", "core"],
  ["Hanging Leg Raise", "Core", "intermediate", "3 x 12-15", "60s rest", "core"],
  ["Cable Woodchopper", "Core", "beginner", "3 x 12 each", "45s rest", "core | shoulders"],
  ["Russian Twist", "Core", "beginner", "3 x 20", "45s rest", "core"],
  ["Ab Wheel Rollout", "Core", "advanced", "3 x 8-12", "60s rest", "core | shoulders"],
  ["Bicycle Crunch", "Core", "beginner", "3 x 20", "45s rest", "core"],
  ["Standing Calf Raise", "Calves", "beginner", "4 x 12-15", "45s rest", "calves"],
  ["Seated Calf Raise", "Calves", "beginner", "3 x 15-20", "45s rest", "calves"],
  ["Single-Leg Calf Raise", "Calves", "intermediate", "3 x 12 each", "45s rest", "calves"],
  ["Jump Rope", "Calves", "beginner", "3 x 60s", "45s rest", "calves | cardio"],
];
const ACTIVITIES = {
  Walking: [["Brisk walking", 4.3]],
  Running: [["Jogging (8 km/h)", 8.3], ["Running (10 km/h)", 9.8], ["Running (12 km/h)", 11.5], ["Running (16 km/h)", 14.5], ["Treadmill intervals", 12.2]],
  Cycling: [["Cycling (moderate)", 7.5]],
  Swimming: [["Freestyle swimming", 8.3]],
  Gym: [["Strength training", 5]],
  HIIT: [["HIIT circuit", 10.5]],
  Yoga: [["Vinyasa yoga", 3.8]],
  "Team Sports": [["Football practice", 7]],
  "Racquet Sports": [["Tennis singles", 8]],
  Combat: [["Boxing conditioning", 9]],
  "Winter Sports": [["Skiing", 7]],
  "Low Intensity": [["Mobility flow", 2.8]],
  Other: [["General cardio", 6]],
};

let state = loadState();
let exerciseGroup = "Chest";
let activityGroup = "Running";
let selectedActivity = { name: "Jogging (8 km/h)", met: 8.3 };
let cardioSeconds = 0;
let cardioTimer = null;
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

function loadState() {
  const fallback = defaultState();
  try {
    const guestRaw = sessionStorage.getItem(GUEST_STORAGE_KEY);
    if (guestRaw) return mergeState(fallback, JSON.parse(guestRaw));
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    return mergeState(fallback, JSON.parse(raw));
  } catch {
    return fallback;
  }
}

function saveState() {
  const payload = JSON.stringify(state);
  if (state.session.guest) {
    sessionStorage.setItem(GUEST_STORAGE_KEY, payload);
  } else {
    localStorage.setItem(STORAGE_KEY, payload);
  }
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
    return '<div class="chart-column"><i class="chart-bar" style="height:' + height + '%"></i><span>' + labels[index] + '</span></div>';
  }).join("");
}

function renderDashboard() {
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
  const normal = [
    ["Monday", "Full Body A", "chest, back, quads, core", "Chest", false],
    ["Tuesday", "Active Recovery", "Recovery day - stretch, walk, sleep well.", "", true],
    ["Wednesday", "Full Body B", "shoulders, back, hamstrings, glutes", "Shoulders", false],
    ["Thursday", "Rest Day", "Recovery day - stretch, walk, sleep well.", "", true],
    ["Friday", "Full Body C", "chest, biceps, triceps, quads", "Chest", false],
    ["Saturday", "Conditioning", "hiit full body", "Full Body", false],
    ["Sunday", "Rest Day", "Recovery day - stretch, walk, sleep well.", "", true],
  ];
  const alternate = [
    ["Monday", "Upper Strength", "chest, back, shoulders", "Chest", false],
    ["Tuesday", "Zone 2 Cardio", "aerobic base, mobility", "Running", false],
    ["Wednesday", "Lower Strength", "quads, hamstrings, glutes", "Quads", false],
    ["Thursday", "Rest Day", "Recovery day - stretch, walk, sleep well.", "", true],
    ["Friday", "Full Body Power", "push, pull, core", "Full Body", false],
    ["Saturday", "Boxing Conditioning", "hiit full body", "Combat", false],
    ["Sunday", "Rest Day", "Recovery day - stretch, walk, sleep well.", "", true],
  ];
  return state.workoutVersion % 2 ? alternate : normal;
}

function renderWorkout() {
  const plan = weekPlan();
  el("split-goal").textContent = state.profile.goals[0] || "general fitness";
  el("week-grid").innerHTML = plan.map((session, index) => {
    const id = today() + "-" + index;
    const complete = state.completedWorkouts.some((item) => item.id === id);
    const rest = session[4];
    const todayLabel = session[0] === "Saturday" ? '<span class="today-label">Today</span>' : "";
    const action = rest ? "" : '<button class="outline-button view-exercises" type="button" data-group="' + safe(session[3]) + '">View Exercises</button>';
    const completeButton = rest ? "" : '<button class="complete-button ' + (complete ? "done" : "") + '" type="button" data-workout="' + index + '">' + (complete ? "Completed" : "Complete") + '</button>';
    return '<article class="week-card ' + (session[0] === "Saturday" ? "today" : "") + '">' + completeButton + '<span class="day-label">' + session[0] + '</span>' + todayLabel + '<h3>' + session[1] + '</h3><p>' + session[2] + '</p>' + action + '</article>';
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
    exerciseGroup = EXERCISES.some((item) => item[1] === button.dataset.group) ? button.dataset.group : "Chest";
    changeTab("workout", "library");
    renderExercises();
  }));
}

function renderExercises() {
  const groups = ["Chest", "Back", "Shoulders", "Biceps", "Triceps", "Quads", "Hamstrings", "Glutes", "Core", "Calves", "Full Body"];
  el("exercise-filters").innerHTML = groups.map((group) => '<button type="button" class="' + (group === exerciseGroup ? "active" : "") + '" data-exercise-filter="' + group + '">' + group + '</button>').join("");
  all("[data-exercise-filter]").forEach((button) => button.addEventListener("click", () => {
    exerciseGroup = button.dataset.exerciseFilter;
    renderExercises();
  }));
  const query = el("exercise-search").value.trim().toLowerCase();
  const filtered = EXERCISES.filter((item) => (exerciseGroup === "Full Body" || item[1] === exerciseGroup) && item[0].toLowerCase().includes(query));
  el("exercise-grid").innerHTML = filtered.length ? filtered.map((item) => {
    return '<article class="exercise-card"><h3>' + item[0] + '</h3><div class="tag-row"><span class="tag accent">' + item[2] + '</span><span class="tag">' + item[3] + '</span><span class="tag">' + item[4] + '</span></div><p>' + item[5] + '</p><div class="exercise-actions"><button type="button" data-exercise-info="' + safe(item[0]) + '">How to do it</button><button type="button" data-exercise-demo="' + safe(item[0]) + '">Watch demo</button></div></article>';
  }).join("") : '<div class="empty-state">No matching exercises found.</div>';
  all("[data-exercise-info]").forEach((button) => button.addEventListener("click", () => openExerciseInfo(button.dataset.exerciseInfo)));
  all("[data-exercise-demo]").forEach((button) => button.addEventListener("click", () => toast("Demo search ready for " + button.dataset.exerciseDemo + ".")));
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

function cardioCalories(seconds) {
  return selectedActivity.met * num(state.profile.weight) * 3.5 * seconds / (200 * 60);
}

function updateTimer() {
  const hours = Math.floor(cardioSeconds / 3600);
  const minutes = Math.floor(cardioSeconds % 3600 / 60);
  const seconds = cardioSeconds % 60;
  el("cardio-timer").textContent = [hours, minutes, seconds].map((item) => String(item).padStart(2, "0")).join(":");
  el("cardio-burned").textContent = Math.round(cardioCalories(cardioSeconds));
  el("cardio-minutes").textContent = Math.floor(cardioSeconds / 60);
  el("selected-activity").textContent = selectedActivity.name;
  el("activity-meta").textContent = "MET " + selectedActivity.met + " | body weight " + weight(state.profile.weight) + " kg";
  el("cardio-toggle").textContent = cardioTimer ? "Finish session" : "Start";
}

function renderCardio() {
  const groups = Object.keys(ACTIVITIES);
  el("activity-filters").innerHTML = groups.map((group) => '<button type="button" class="' + (group === activityGroup ? "active" : "") + '" data-activity-group="' + safe(group) + '">' + group + '</button>').join("");
  all("[data-activity-group]").forEach((button) => button.addEventListener("click", () => {
    activityGroup = button.dataset.activityGroup;
    renderCardio();
  }));
  const query = el("activity-search").value.trim().toLowerCase();
  const current = ACTIVITIES[activityGroup].filter((item) => item[0].toLowerCase().includes(query));
  el("activity-list").innerHTML = current.map((item) => '<button class="activity-choice ' + (selectedActivity.name === item[0] ? "active" : "") + '" type="button" data-activity="' + safe(item[0]) + '" data-met="' + item[1] + '">' + item[0] + '<small>MET ' + item[1] + '</small></button>').join("");
  all("[data-activity]").forEach((button) => button.addEventListener("click", () => {
    selectedActivity = { name: button.dataset.activity, met: num(button.dataset.met) };
    cardioSeconds = 0;
    renderCardio();
  }));
  const calories = state.cardioSessions.reduce((sum, item) => sum + num(item.calories), 0);
  const minutes = state.cardioSessions.reduce((sum, item) => sum + num(item.seconds) / 60, 0);
  el("cardio-total-kcal").textContent = Math.round(calories);
  el("cardio-total-minutes").textContent = Math.round(minutes);
  el("cardio-history").innerHTML = state.cardioSessions.length ? state.cardioSessions.slice().reverse().slice(0, 8).map((item) => '<div class="history-item"><span>' + safe(item.name) + '</span><span>' + Math.round(item.calories) + " kcal | " + Math.max(1, Math.round(item.seconds / 60)) + ' min</span></div>').join("") : '<div class="empty-state">No sessions yet.</div>';
  updateTimer();
}

function toggleCardio() {
  if (cardioTimer) {
    window.clearInterval(cardioTimer);
    cardioTimer = null;
    if (cardioSeconds > 0) {
      state.cardioSessions.push({ id: String(Date.now()), date: today(), name: selectedActivity.name, seconds: cardioSeconds, calories: cardioCalories(cardioSeconds) });
      saveState();
      toast("Cardio session saved.");
    }
    cardioSeconds = 0;
    renderCardio();
    renderDashboard();
    renderProgress();
  } else {
    cardioTimer = window.setInterval(() => {
      cardioSeconds += 1;
      updateTimer();
    }, 1000);
    updateTimer();
  }
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
  bars(el("weight-chart"), entries.length ? entries.map((item) => num(item.weight)) : [0, 0, 0, 0, 0, 0, 0], entries.length ? entries.map((item) => item.date.slice(5)) : DAYS);
  el("weight-chart-message").hidden = entries.length > 0;
  const consistency = Array.from({ length: 8 }, (_, index) => {
    const end = dateBefore(index * 7);
    const start = dateBefore(index * 7 + 6);
    return state.completedWorkouts.filter((item) => item.date >= start && item.date <= end).length;
  }).reverse();
  el("consistency-chart").innerHTML = consistency.map((value, index) => '<div><i style="height:' + Math.max(3, Math.min(100, value * 25)) + '%"></i><span>W' + (index + 1) + '</span></div>').join("");
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
  el("goal-choices").innerHTML = GOAL_CHOICES.map((item) => '<button type="button" class="choice-button ' + (profile.goals.includes(item) ? "active" : "") + '" data-goal="' + safe(item) + '">' + item + '</button>').join("");
  all("[data-sport]").forEach((button) => button.addEventListener("click", () => toggleChoice("sports", button.dataset.sport)));
  all("[data-goal]").forEach((button) => button.addEventListener("click", () => toggleChoice("goals", button.dataset.goal)));
  const form = el("profile-form");
  form.elements.age.value = profile.age;
  form.elements.height.value = profile.height;
  form.elements.weight.value = profile.weight;
  form.elements.targetWeight.value = profile.targetWeight;
  const radio = form.querySelector('input[name="level"][value="' + profile.level + '"]');
  if (radio) radio.checked = true;
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
  saveState();
  renderProfile();
  renderDashboard();
}

function calculateTargets(profile) {
  const factor = { beginner: 1.4, intermediate: 1.55, advanced: 1.7, elite: 1.85 };
  const bmr = 10 * num(profile.weight) + 6.25 * num(profile.height) - 5 * num(profile.age) + 5;
  const extra = profile.goals.includes("Lean bulk") ? 220 : profile.goals.includes("Build endurance") ? 100 : 0;
  const calories = Math.max(1600, Math.round((bmr * factor[profile.level] + extra) / 25) * 25);
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

function demoScanResult() {
  return '<strong>Demo estimate (AI scanner not connected):</strong><span>Chicken 180g</span><span>Rice 220g</span><span>Vegetables 120g</span><span>Approx. 620 kcal</span><p class="scan-demo-note">This is a fixed placeholder, not a real analysis of your photo. Set up the Gemini-powered scanner (see README) for a real per-photo estimate.</p>';
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

async function analyzeFoodPhoto(file) {
  if (!file) {
    lastScanResult = null;
    return demoScanResult();
  }
  try {
    const base64 = await fileToBase64(file);
    const response = await fetch("/api/scan-food", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: base64, mimeType: file.type || "image/jpeg" }),
    });
    if (!response.ok) throw new Error("bad status " + response.status);
    const data = await response.json();
    if (!data || !Array.isArray(data.items)) throw new Error("bad payload");
    if (!data.items.length) {
      lastScanResult = null;
      return '<strong>No food items detected.</strong><p class="scan-demo-note">Try a clearer, well-lit photo with the food clearly visible.</p>';
    }
    lastScanResult = data;
    return renderScanItems(data);
  } catch (err) {
    // Covers: no /api route, the Gemini key not configured yet, or an
    // upstream failure - never break the scanner, just show the demo result.
    lastScanResult = null;
    return demoScanResult();
  }
}

// Fill this in with your own Google OAuth Client ID to enable "Sign in with
// Google" (see README - it's a public value, safe to commit, not a secret).
const GOOGLE_CLIENT_ID = "";

function decodeGoogleCredential(token) {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    return JSON.parse(json);
  } catch (err) {
    return null;
  }
}

function handleGoogleCredential(response) {
  const payload = decodeGoogleCredential(response.credential);
  const name = (payload && payload.name) || "Google User";
  state.session = { signedIn: true, name, provider: "google", guest: false };
  saveState();
  applyAuthGate();
  toast("Welcome, " + name + "!");
}

function initGoogleSignIn() {
  const slot = el("google-signin-button");
  if (!slot) return;
  if (!GOOGLE_CLIENT_ID) {
    slot.innerHTML = '<p class="auth-note">Google sign-in isn\'t configured yet - add a Client ID in script.js (see README).</p>';
    return;
  }
  if (!window.google || !window.google.accounts || !window.google.accounts.id) {
    slot.innerHTML = '<p class="auth-note">Google sign-in is unavailable right now - use email or Continue as Guest instead.</p>';
    return;
  }
  window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleGoogleCredential });
  window.google.accounts.id.renderButton(slot, { theme: "outline", size: "large", width: 300 });
}

function events() {
  all("[data-page]").forEach((button) => button.addEventListener("click", () => changePage(button.dataset.page)));
  all("[data-nav]").forEach((link) => link.addEventListener("click", (event) => {
    event.preventDefault();
    changePage(link.dataset.nav);
  }));
  all("[data-tab-group]").forEach((button) => button.addEventListener("click", () => changeTab(button.dataset.tabGroup, button.dataset.tab)));
  all("[data-next-profile]").forEach((button) => button.addEventListener("click", () => changeTab("profile", button.dataset.nextProfile)));
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
  el("sign-out").addEventListener("click", () => {
    const wasGuest = state.session.guest;
    if (wasGuest) {
      // Guest data lives only in sessionStorage for this tab - drop it entirely on sign out
      // rather than writing it into the persistent slot, so it never leaks into the next
      // person's (or device's) session.
      sessionStorage.removeItem(GUEST_STORAGE_KEY);
      state = loadState();
      state.session = { signedIn: false, name: "", guest: false };
    } else {
      state.session = { signedIn: false, name: "", guest: false };
      saveState();
    }
    applyAuthGate();
    renderAll();
    toast(wasGuest ? "Guest session ended - nothing from it was saved." : "Signed out. Your data stays saved on this device.");
  });
  all("[data-auth-tab]").forEach((button) => button.addEventListener("click", () => {
    all("[data-auth-tab]").forEach((b) => { b.classList.toggle("active", b === button); b.setAttribute("aria-selected", b === button ? "true" : "false"); });
    el("auth-submit").textContent = button.dataset.authTab === "signup" ? "Create Account" : "Sign In";
  }));
  el("auth-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const name = el("auth-name").value.trim();
    state.session = { signedIn: true, name, guest: false };
    saveState();
    applyAuthGate();
    toast("Welcome" + (name ? ", " + name : "") + "!");
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
  el("open-camera").addEventListener("click", () => toast("Use Upload photo to scan a food image in this local demo."));
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
    if (value && !state.ingredients.includes(value)) {
      state.ingredients.push(value);
      saveState();
      renderIngredients();
    }
    input.value = "";
  });
  el("generate-ai-meals").addEventListener("click", () => {
    const foods = state.ingredients.length ? state.ingredients.join(", ") : "your pantry ingredients";
    el("ai-meal-results").innerHTML = '<div><strong>Quick bowl</strong>Build a high-protein bowl with ' + safe(foods) + ' and a measured carb base.</div><div><strong>Recovery plate</strong>Pair ' + safe(foods) + " with vegetables, a protein source and olive oil.</div>";
  });
  el("activity-search").addEventListener("input", renderCardio);
  el("cardio-toggle").addEventListener("click", toggleCardio);
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
    return;
  }
  authScreen.hidden = true;
  shell.hidden = false;
  if (!state.onboarded) {
    document.body.classList.add("onboarding-mode");
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

events();
renderAll();
changePage(window.location.hash.slice(1) || "dashboard", false);
applyAuthGate();
applyTheme();
window.addEventListener("load", initGoogleSignIn);
