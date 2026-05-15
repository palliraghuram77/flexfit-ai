const menuButton = document.querySelector(".menu-toggle");
const header = document.querySelector(".site-header");
const navLinks = document.querySelectorAll(".site-nav a");
const workoutForm = document.querySelector("#workout-form");
const workoutResult = document.querySelector("#workout-result");
const macroForm = document.querySelector("#macro-form");
const macroResult = document.querySelector("#macro-result");
const progressForm = document.querySelector("#progress-form");
const progressSummary = document.querySelector("#progress-summary");
const barChart = document.querySelector("#bar-chart");
const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const defaultProgress = {
  workouts: 3,
  water: 2.5,
  sleep: 7,
  history: [45, 60, 52, 74, 66, 82, 70],
};

const exerciseBank = {
  gym: {
    push: "Bench press, shoulder press, incline dumbbell press, triceps rope pressdown",
    pull: "Lat pulldown, seated row, face pulls, dumbbell curls",
    legs: "Back squat, Romanian deadlift, leg press, calf raises",
    full: "Goblet squat, push-ups, cable rows, sled push, plank finisher",
  },
  dumbbells: {
    push: "Dumbbell floor press, Arnold press, lateral raises, overhead extensions",
    pull: "One-arm rows, reverse flyes, hammer curls, renegade rows",
    legs: "Goblet squats, split squats, dumbbell deadlifts, loaded carries",
    full: "Thrusters, rows, reverse lunges, push press, farmer carry",
  },
  bodyweight: {
    push: "Push-ups, pike push-ups, dips on chair, plank shoulder taps",
    pull: "Doorway rows, towel rows, reverse snow angels, superman holds",
    legs: "Squats, reverse lunges, hip bridges, wall sits",
    full: "Squats, push-ups, mountain climbers, burpees, hollow holds",
  },
};

function toggleMenu() {
  const isOpen = header.classList.toggle("nav-open");
  document.body.classList.toggle("nav-open", isOpen);
  menuButton.setAttribute("aria-expanded", String(isOpen));
}

function closeMenu() {
  header.classList.remove("nav-open");
  document.body.classList.remove("nav-open");
  menuButton.setAttribute("aria-expanded", "false");
}

function getWorkoutFocus(goal) {
  if (goal === "lose fat") {
    return "conditioning circuits, steady progress, and short rest periods";
  }

  if (goal === "strength") {
    return "compound lifts, heavier sets, and longer rest periods";
  }

  if (goal === "mobility") {
    return "controlled movement, flexibility work, and joint-friendly strength";
  }

  return "hypertrophy, progressive overload, and balanced recovery";
}

function createWorkoutPlan(goal, level, equipment, days) {
  const bank = exerciseBank[equipment];
  const split = days <= 3 ? ["Full Body", "Lower Body", "Upper Body"] : ["Push", "Lower Body", "Pull", "Full Body"];
  const plan = [];
  const volume = level === "beginner" ? "3 sets" : level === "intermediate" ? "4 sets" : "5 sets";
  const reps = goal === "strength" ? "4-6 reps" : goal === "mobility" ? "8-10 slow reps" : "8-12 reps";

  for (let index = 0; index < days; index += 1) {
    const splitName = split[index % split.length];
    const key = splitName === "Push" ? "push" : splitName === "Pull" ? "pull" : splitName === "Lower Body" ? "legs" : "full";
    plan.push(`Day ${index + 1}: ${splitName} - ${bank[key]} (${volume}, ${reps})`);
  }

  return {
    title: `${days}-day ${goal} plan`,
    focus: getWorkoutFocus(goal),
    plan,
  };
}

function handleWorkoutSubmit(event) {
  event.preventDefault();
  const formData = new FormData(workoutForm);
  const goal = formData.get("goal");
  const level = formData.get("level");
  const equipment = formData.get("equipment");
  const days = Number(formData.get("days"));
  const workout = createWorkoutPlan(goal, level, equipment, days);

  workoutResult.innerHTML = `
    <p class="panel-kicker">Generated plan</p>
    <h3>${workout.title}</h3>
    <p>${capitalize(level)} plan focused on ${workout.focus}.</p>
    <ul>${workout.plan.map((item) => `<li>${item}</li>`).join("")}</ul>
  `;
}

function calculateBmr({ age, weight, height }) {
  return 10 * weight + 6.25 * height - 5 * age + 5;
}

function calculateMacros({ age, weight, height, activity, macroGoal }) {
  const bmr = calculateBmr({ age, weight, height });
  let calories = Math.round(bmr * activity);

  if (macroGoal === "cut") {
    calories -= 400;
  } else if (macroGoal === "bulk") {
    calories += 250;
  }

  const protein = Math.round(weight * 2);
  const fats = Math.round((calories * 0.25) / 9);
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fats * 9) / 4));

  return { calories, protein, carbs, fats };
}

function handleMacroSubmit(event) {
  event.preventDefault();
  const formData = new FormData(macroForm);
  const result = calculateMacros({
    age: Number(formData.get("age")),
    weight: Number(formData.get("weight")),
    height: Number(formData.get("height")),
    activity: Number(formData.get("activity")),
    macroGoal: formData.get("macroGoal"),
  });

  macroResult.innerHTML = `
    <div class="macro-ring">
      <strong>${result.calories}</strong>
      <span>kcal/day</span>
    </div>
    <div class="macro-list">
      <div><span>Protein</span><strong>${result.protein}g</strong></div>
      <div><span>Carbs</span><strong>${result.carbs}g</strong></div>
      <div><span>Fat</span><strong>${result.fats}g</strong></div>
    </div>
  `;
}

function loadProgress() {
  const saved = localStorage.getItem("flexfit-progress");

  if (!saved) {
    return defaultProgress;
  }

  try {
    return { ...defaultProgress, ...JSON.parse(saved) };
  } catch {
    return defaultProgress;
  }
}

function saveProgress(progress) {
  localStorage.setItem("flexfit-progress", JSON.stringify(progress));
}

function renderProgress(progress) {
  progressSummary.innerHTML = `
    <div><span>Workouts</span><strong>${progress.workouts}</strong></div>
    <div><span>Water</span><strong>${progress.water}L</strong></div>
    <div><span>Sleep</span><strong>${progress.sleep}h</strong></div>
  `;

  barChart.innerHTML = progress.history
    .map((value, index) => {
      const height = Math.max(18, Math.min(100, value));
      return `
        <div class="bar">
          <span style="height: ${height}%"></span>
          ${dayLabels[index]}
        </div>
      `;
    })
    .join("");
}

function handleProgressSubmit(event) {
  event.preventDefault();
  const formData = new FormData(progressForm);
  const workouts = Number(formData.get("workouts"));
  const water = Number(formData.get("water"));
  const sleep = Number(formData.get("sleep"));
  const score = Math.round(Math.min(100, workouts * 12 + water * 12 + sleep * 5));
  const current = loadProgress();
  const history = [...current.history.slice(1), score];
  const progress = { workouts, water, sleep, history };

  saveProgress(progress);
  renderProgress(progress);
}

function handleContactSubmit(event) {
  event.preventDefault();
  const formData = new FormData(contactForm);
  const name = String(formData.get("name")).trim();
  formStatus.textContent = `Thanks, ${name || "friend"}. Your demo message was captured on the front end.`;
  contactForm.reset();
}

function capitalize(value) {
  return String(value).charAt(0).toUpperCase() + String(value).slice(1);
}

menuButton.addEventListener("click", toggleMenu);
navLinks.forEach((link) => link.addEventListener("click", closeMenu));
workoutForm.addEventListener("submit", handleWorkoutSubmit);
macroForm.addEventListener("submit", handleMacroSubmit);
progressForm.addEventListener("submit", handleProgressSubmit);
contactForm.addEventListener("submit", handleContactSubmit);
renderProgress(loadProgress());
