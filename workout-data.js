// FlexFit AI - workout data: extra exercises, split catalog and form cues.
// Loaded before script.js. Each exercise is [name, group, level, sets x reps, rest, muscles].
// Every name used in a split below MUST exist in the library (script.js EXERCISES + extraExercises);
// tests/check-data.js verifies that automatically.
(function () {
  const extraExercises = [
    // Chest
    ["Incline Barbell Press", "Chest", "intermediate", "4 x 6-8", "120s rest", "chest | shoulders | triceps"],
    ["Machine Chest Press", "Chest", "beginner", "3 x 10-12", "75s rest", "chest | triceps"],
    ["Low-to-High Cable Fly", "Chest", "beginner", "3 x 12-15", "45s rest", "chest | shoulders"],
    ["Paused Bench Press", "Chest", "advanced", "4 x 3-5", "150s rest", "chest | triceps | shoulders"],
    // Back
    ["Chin-Up", "Back", "intermediate", "4 x 6-10", "90s rest", "back | biceps"],
    ["Straight-Arm Pulldown", "Back", "beginner", "3 x 12-15", "45s rest", "back | core"],
    ["Inverted Row", "Back", "beginner", "3 x 10-15", "60s rest", "back | biceps | core"],
    ["Chest-Supported Row", "Back", "beginner", "3 x 10-12", "75s rest", "back | biceps"],
    ["Rack Pull", "Back", "intermediate", "4 x 5-6", "120s rest", "back | glutes | hamstrings"],
    // Shoulders
    ["Dumbbell Shoulder Press", "Shoulders", "beginner", "3 x 8-12", "75s rest", "shoulders | triceps"],
    ["Cable Lateral Raise", "Shoulders", "beginner", "3 x 12-15", "45s rest", "shoulders"],
    ["Pike Push-Up", "Shoulders", "beginner", "3 x 8-12", "60s rest", "shoulders | triceps"],
    ["Landmine Press", "Shoulders", "intermediate", "3 x 8-10 each", "60s rest", "shoulders | core | chest"],
    // Legs
    ["Hack Squat", "Quads", "intermediate", "4 x 8-10", "90s rest", "quads | glutes"],
    ["Reverse Lunge", "Quads", "beginner", "3 x 10 each", "60s rest", "quads | glutes"],
    ["Wall Sit", "Quads", "beginner", "3 x 45s", "45s rest", "quads | endurance"],
    ["Pause Squat", "Quads", "intermediate", "4 x 4-6", "150s rest", "quads | glutes | core"],
    ["Single-Leg Romanian Deadlift", "Hamstrings", "intermediate", "3 x 8 each", "60s rest", "hamstrings | glutes | balance"],
    ["Swiss Ball Leg Curl", "Hamstrings", "intermediate", "3 x 10-12", "60s rest", "hamstrings | core"],
    ["Banded Lateral Walk", "Glutes", "beginner", "3 x 15 each way", "30s rest", "glutes | hips"],
    ["Single-Leg Hip Thrust", "Glutes", "intermediate", "3 x 10 each", "60s rest", "glutes | hamstrings"],
    ["Curtsy Lunge", "Glutes", "beginner", "3 x 10 each", "45s rest", "glutes | quads | balance"],
    // Core
    ["Dead Bug", "Core", "beginner", "3 x 10 each", "30s rest", "core | coordination"],
    ["Pallof Press", "Core", "beginner", "3 x 12 each", "45s rest", "core | anti-rotation"],
    ["Side Plank", "Core", "beginner", "3 x 30s each", "30s rest", "core | obliques"],
    ["Mountain Climber", "Core", "beginner", "3 x 30s", "30s rest", "core | cardio | shoulders"],
    ["Hollow Body Hold", "Core", "intermediate", "3 x 25s", "45s rest", "core | hip flexors"],
    ["Bird Dog", "Core", "beginner", "3 x 10 each", "30s rest", "core | back | balance"],
    ["Cable Crunch", "Core", "beginner", "3 x 12-15", "45s rest", "core"],
    // Athletic / power
    ["Broad Jump", "Athletic", "beginner", "4 x 5", "60s rest", "glutes | quads | power"],
    ["Medicine Ball Slam", "Athletic", "beginner", "4 x 10", "45s rest", "core | shoulders | power"],
    ["Lateral Bound", "Athletic", "intermediate", "3 x 8 each", "60s rest", "glutes | agility | balance"],
    ["Agility Ladder Drill", "Athletic", "beginner", "5 x 30s", "30s rest", "footwork | coordination"],
    ["Cone Shuttle Run", "Athletic", "beginner", "6 x 20m", "60s rest", "legs | agility | cardio"],
    ["Power Clean", "Athletic", "advanced", "5 x 3", "120s rest", "full body | power"],
    ["Jump Squat", "Athletic", "beginner", "4 x 6", "60s rest", "quads | glutes | power"],
    ["Medicine Ball Rotational Throw", "Athletic", "intermediate", "4 x 8 each", "45s rest", "core | rotation | power"],
    ["Depth Jump", "Athletic", "advanced", "4 x 5", "90s rest", "legs | reactive power"],
    ["Landmine Rotation", "Athletic", "beginner", "3 x 10 each", "45s rest", "core | rotation | shoulders"],
    // Endurance & swimming
    ["Zone 2 Cycling", "Endurance", "beginner", "1 x 45-60min", "-", "legs | aerobic base"],
    ["Rowing Machine Intervals", "Endurance", "intermediate", "6 x 500m", "90s rest", "back | legs | cardio"],
    ["Stair Climber", "Endurance", "beginner", "1 x 20-30min", "-", "glutes | quads | cardio"],
    ["Brisk Incline Walk", "Endurance", "beginner", "1 x 30-45min", "-", "legs | cardio"],
    ["Cycling Hill Intervals", "Endurance", "intermediate", "6 x 2min climbs", "2min rest", "legs | cardio | power"],
    ["Swim Laps Freestyle", "Swimming", "beginner", "1 x 20-30min", "-", "full body | cardio | shoulders"],
    ["Kickboard Sets", "Swimming", "beginner", "6 x 50m", "30s rest", "legs | hips | core"],
    ["Pull Buoy Sets", "Swimming", "intermediate", "6 x 50m", "30s rest", "lats | shoulders | core"],
    ["Swim Sprint Intervals", "Swimming", "intermediate", "8 x 25m", "30s rest", "full body | power"],
    // Climbing
    ["Dead Hang", "Climbing", "beginner", "3 x 20-30s", "60s rest", "forearms | grip | shoulders"],
    ["Hangboard Repeaters", "Climbing", "advanced", "5 x 7s on / 3s off", "2min rest", "fingers | forearms"],
    ["Climbing Traverse", "Climbing", "beginner", "4 x 3min", "90s rest", "grip | back | core | endurance"],
    ["Scapular Pull-Up", "Climbing", "beginner", "3 x 10", "45s rest", "back | shoulder stability"],
    // Mobility
    ["Hip 90/90", "Mobility", "beginner", "3 x 8 each", "20s rest", "hips | glutes"],
    ["Cat-Cow", "Mobility", "beginner", "2 x 10", "15s rest", "spine | core"],
    ["World's Greatest Stretch", "Mobility", "beginner", "2 x 5 each", "20s rest", "hips | hamstrings | thoracic spine"],
    ["Thoracic Rotation", "Mobility", "beginner", "2 x 8 each", "20s rest", "thoracic spine | shoulders"],
    ["Couch Stretch", "Mobility", "beginner", "2 x 60s each", "15s rest", "hip flexors | quads"],
    ["Band Shoulder Dislocates", "Mobility", "beginner", "2 x 12", "20s rest", "shoulders | chest"],
    ["Ankle Mobility Drill", "Mobility", "beginner", "2 x 10 each", "15s rest", "ankles | calves"],
    // Calisthenics
    ["Handstand Hold", "Calisthenics", "intermediate", "4 x 20-30s", "75s rest", "shoulders | core | balance"],
    // More Chest
    ["Cable Crossover", "Chest", "intermediate", "3 x 10-12", "75s rest", "chest"],
    ["Pec Deck Fly", "Chest", "intermediate", "3 x 10-12", "75s rest", "chest"],
    ["Svend Press", "Chest", "intermediate", "3 x 10-12", "75s rest", "chest"],
    ["Dumbbell Pullover", "Chest", "intermediate", "3 x 10-12", "75s rest", "chest | lats"],
    ["Wide Push-Up", "Chest", "intermediate", "3 x 10-12", "75s rest", "chest | triceps"],
    ["Archer Push-Up", "Chest", "intermediate", "3 x 10-12", "75s rest", "chest | triceps"],
    ["Deficit Push-Up", "Chest", "intermediate", "3 x 10-12", "75s rest", "chest | shoulders"],
    ["Smith Machine Incline Press", "Chest", "intermediate", "3 x 10-12", "75s rest", "chest | shoulders"],
    // More Back
    ["Meadows Row", "Back", "intermediate", "4 x 8-10", "90s rest", "lats | biceps"],
    ["Wide-Grip Lat Pulldown", "Back", "intermediate", "4 x 8-10", "90s rest", "lats | biceps"],
    ["Close-Grip Pulldown", "Back", "intermediate", "4 x 8-10", "90s rest", "lats | biceps"],
    ["Back Extension", "Back", "intermediate", "4 x 8-10", "90s rest", "lower back | glutes"],
    ["Superman Hold", "Back", "intermediate", "4 x 8-10", "90s rest", "lower back | glutes"],
    // More Shoulders
    ["Upright Row", "Shoulders", "intermediate", "3 x 10-12", "60s rest", "shoulders | traps"],
    ["Seated Dumbbell Press", "Shoulders", "intermediate", "3 x 10-12", "60s rest", "shoulders | triceps"],
    ["Push Press", "Shoulders", "intermediate", "3 x 10-12", "60s rest", "shoulders | legs"],
    ["Bus Driver", "Shoulders", "intermediate", "3 x 10-12", "60s rest", "shoulders | forearms"],
    ["Reverse Pec Deck", "Shoulders", "intermediate", "3 x 10-12", "60s rest", "rear delts"],
    // More Traps
    ["Barbell Shrug", "Traps", "intermediate", "4 x 10-12", "60s rest", "traps"],
    ["Dumbbell Shrug", "Traps", "intermediate", "4 x 10-12", "60s rest", "traps"],
    ["Farmer's Carry", "Traps", "intermediate", "4 x 10-12", "60s rest", "traps | forearms | core"],
    ["Cable Shrug", "Traps", "intermediate", "4 x 10-12", "60s rest", "traps"],
    // More Biceps
    ["Hammer Curl", "Biceps", "beginner", "3 x 10-12", "60s rest", "biceps | forearms"],
    ["Spider Curl", "Biceps", "beginner", "3 x 10-12", "60s rest", "biceps"],
    ["Zottman Curl", "Biceps", "beginner", "3 x 10-12", "60s rest", "biceps | forearms"],
    ["EZ-Bar Curl", "Biceps", "beginner", "3 x 10-12", "60s rest", "biceps"],
    // More Triceps
    ["Overhead Triceps Extension", "Triceps", "beginner", "3 x 10-12", "60s rest", "triceps"],
    ["Triceps Pushdown", "Triceps", "beginner", "3 x 10-12", "60s rest", "triceps"],
    ["Triceps Kickback", "Triceps", "beginner", "3 x 10-12", "60s rest", "triceps"],
    ["Rope Pushdown", "Triceps", "beginner", "3 x 10-12", "60s rest", "triceps"],
    ["JM Press", "Triceps", "beginner", "3 x 10-12", "60s rest", "triceps"],
    // More Quads
    ["Sissy Squat", "Quads", "intermediate", "4 x 8-10", "90s rest", "quads"],
    ["Box Squat", "Quads", "intermediate", "4 x 8-10", "90s rest", "quads | glutes"],
    ["Smith Machine Squat", "Quads", "intermediate", "4 x 8-10", "90s rest", "quads | glutes"],
    // More Hamstrings
    ["Lying Leg Curl", "Hamstrings", "intermediate", "3 x 10-12", "75s rest", "hamstrings"],
    ["Seated Leg Curl", "Hamstrings", "intermediate", "3 x 10-12", "75s rest", "hamstrings"],
    ["Glute-Ham Raise", "Hamstrings", "intermediate", "3 x 10-12", "75s rest", "hamstrings | glutes"],
    ["Cable Pull-Through", "Hamstrings", "intermediate", "3 x 10-12", "75s rest", "hamstrings | glutes"],
    ["Stability Ball Leg Curl", "Hamstrings", "intermediate", "3 x 10-12", "75s rest", "hamstrings | core"],
    // More Glutes
    ["Frog Pump", "Glutes", "beginner", "3 x 12-15", "60s rest", "glutes"],
    ["Donkey Kick", "Glutes", "beginner", "3 x 12-15", "60s rest", "glutes"],
    ["Fire Hydrant", "Glutes", "beginner", "3 x 12-15", "60s rest", "glute medius"],
    ["Hip Abduction Machine", "Glutes", "beginner", "3 x 12-15", "60s rest", "glute medius"],
    // More Core
    ["V-Up", "Core", "beginner", "3 x 12-15", "45s rest", "abs"],
    ["Woodchopper", "Core", "beginner", "3 x 12-15", "45s rest", "obliques"],
    ["Reverse Crunch", "Core", "beginner", "3 x 12-15", "45s rest", "lower abs"],
    ["Toe Touch Crunch", "Core", "beginner", "3 x 12-15", "45s rest", "abs"],
    // More Calves
    ["Donkey Calf Raise", "Calves", "beginner", "4 x 12-20", "45s rest", "calves"],
    ["Leg Press Calf Raise", "Calves", "beginner", "4 x 12-20", "45s rest", "calves"],
    ["Jump Rope Calf Bounce", "Calves", "beginner", "4 x 12-20", "45s rest", "calves | cardio"],
    ["Tibialis Raise", "Calves", "beginner", "4 x 12-20", "45s rest", "tibialis | shins"],
    // More Forearms
    ["Wrist Curl", "Forearms", "beginner", "3 x 15-20", "45s rest", "forearms"],
    ["Reverse Wrist Curl", "Forearms", "beginner", "3 x 15-20", "45s rest", "forearms"],
    ["Plate Pinch", "Forearms", "beginner", "3 x 15-20", "45s rest", "forearms | grip"],
    ["Reverse Curl", "Forearms", "beginner", "3 x 15-20", "45s rest", "forearms | biceps"],
    // More Full Body
    ["Clean and Press", "Full Body", "intermediate", "4 x 8", "60s rest", "full body"],
    ["Kettlebell Snatch", "Full Body", "intermediate", "4 x 8", "60s rest", "full body | glutes"],
    ["Turkish Get-Up", "Full Body", "intermediate", "4 x 8", "60s rest", "full body | core"],
    ["Battle Rope Waves", "Full Body", "intermediate", "4 x 8", "60s rest", "arms | cardio"],
    ["Bear Crawl", "Full Body", "intermediate", "4 x 8", "60s rest", "full body | core"],
    ["Man Maker", "Full Body", "intermediate", "4 x 8", "60s rest", "full body"],
  ];

  // --- Session helpers --------------------------------------------------------------------------
  const DAYS7 = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const rest = (d) => [d, "Rest & Recovery", "Recovery day - walk, stretch, sleep well.", "", true, []];
  const sess = (title, group, names) => (d) => [d, title, names.slice(0, 3).join(", "), group, false, names];
  const week = (...slots) => DAYS7.map((d, i) => (slots[i] ? slots[i](d) : rest(d)));

  // Reusable sessions
  const PUSH = sess("Push (Chest, Shoulders, Triceps)", "Chest", ["Barbell Bench Press", "Standing Shoulder Press", "Incline Dumbbell Press", "Lateral Raise", "Tricep Rope Pushdown"]);
  const PULL = sess("Pull (Back, Biceps)", "Back", ["Pull-Up", "Barbell Row", "Seated Cable Row", "Face Pull", "Barbell Curl"]);
  const LEGS = sess("Legs", "Quads", ["Barbell Back Squat", "Romanian Deadlift", "Leg Press", "Leg Curl", "Standing Calf Raise"]);
  const UPPER = sess("Upper Body", "Chest", ["Barbell Bench Press", "Barbell Row", "Standing Shoulder Press", "Lat Pulldown", "Dumbbell Hammer Curl", "Tricep Rope Pushdown"]);
  const LOWER = sess("Lower Body", "Quads", ["Barbell Back Squat", "Romanian Deadlift", "Walking Lunge", "Hip Thrust", "Standing Calf Raise"]);
  const FULL_A = sess("Full Body A", "Full Body", ["Goblet Squat", "Dumbbell Chest Press", "Seated Cable Row", "Plank"]);
  const FULL_B = sess("Full Body B", "Full Body", ["Leg Press", "Dumbbell Shoulder Press", "Lat Pulldown", "Glute Bridge", "Dead Bug"]);
  const FULL_C = sess("Full Body C", "Full Body", ["Romanian Deadlift", "Incline Dumbbell Press", "Single-Arm Dumbbell Row", "Walking Lunge", "Bicycle Crunch"]);
  const CORE = sess("Core & Stability", "Core", ["Plank", "Dead Bug", "Pallof Press", "Side Plank", "Hanging Leg Raise"]);
  const HIIT = sess("HIIT Conditioning", "Full Body", ["Burpee", "Kettlebell Swing", "Box Jump", "Battle Ropes", "Mountain Climber"]);
  const Z2 = sess("Zone 2 Cardio", "Endurance", ["Zone 2 Cycling", "Brisk Incline Walk", "Cat-Cow"]);
  const MOBILITY = sess("Mobility Flow", "Mobility", ["World's Greatest Stretch", "Hip 90/90", "Thoracic Rotation", "Cat-Cow", "Couch Stretch"]);
  const STRENGTH_LEGS_PLYO = sess("Leg Strength & Power", "Quads", ["Barbell Back Squat", "Romanian Deadlift", "Jump Squat", "Single-Leg Calf Raise", "Step-Up"]);
  const UPPER_PULL_PUSH = sess("Upper Strength", "Back", ["Pull-Up", "Dumbbell Shoulder Press", "Chest-Supported Row", "Push-Up", "Face Pull"]);
  const ROT_POWER = sess("Rotational Power", "Athletic", ["Medicine Ball Rotational Throw", "Landmine Rotation", "Cable Woodchopper", "Medicine Ball Slam", "Pallof Press"]);
  const AGILITY = sess("Speed & Agility", "Athletic", ["Agility Ladder Drill", "Cone Shuttle Run", "Lateral Bound", "Broad Jump", "Strides"]);

  const ALL = ["beginner", "intermediate", "advanced", "elite"];

  const splits = [
    // ---------------- General / goal-based ----------------
    { id: "ppl", name: "Push / Pull / Legs", blurb: "6 days: push, pull and legs twice a week. High volume for muscle.", levels: ["intermediate", "advanced", "elite"], sports: ["Bodybuilding"], goals: ["Lean bulk", "Increase strength while lean"],
      days: week(PUSH, PULL, LEGS, PUSH, PULL, LEGS) },
    { id: "upper-lower", name: "Upper / Lower", blurb: "4 days: upper and lower twice a week with plenty of recovery.", levels: ALL, sports: ["Bodybuilding", "Powerlifting"], goals: ["Increase strength while lean", "Body recomposition", "Lean bulk"],
      days: week(UPPER, LOWER, null, UPPER, LOWER) },
    { id: "full-body-3", name: "Full Body 3x", blurb: "3 days: whole body each session. Simple and ideal for beginners.", levels: ["beginner", "intermediate"], sports: [], goals: ["General fitness", "Lose body fat", "Improve overall health", "Body recomposition"],
      days: week(FULL_A, null, FULL_B, null, FULL_C) },
    { id: "bro-split", name: "Bro Split", blurb: "5 days: one muscle group per day for focused volume.", levels: ["intermediate", "advanced", "elite"], sports: ["Bodybuilding"], goals: ["Lean bulk", "Build muscle"],
      days: week(
        sess("Chest Day", "Chest", ["Barbell Bench Press", "Incline Dumbbell Press", "Cable Chest Fly", "Weighted Dip", "Push-Up"]),
        sess("Back Day", "Back", ["Deadlift", "Pull-Up", "Barbell Row", "Seated Cable Row", "Straight-Arm Pulldown"]),
        sess("Shoulder Day", "Shoulders", ["Standing Shoulder Press", "Lateral Raise", "Rear Delt Fly", "Arnold Press", "Face Pull"]),
        sess("Arm Day", "Biceps", ["Barbell Curl", "Skull Crusher", "Incline Dumbbell Curl", "Close-Grip Bench Press", "Dumbbell Hammer Curl"]),
        sess("Leg Day", "Quads", ["Barbell Back Squat", "Leg Press", "Leg Extension", "Leg Curl", "Standing Calf Raise"])) },
    { id: "powerlifting-5", name: "Powerlifting Strength", blurb: "5 days built around squat, bench and deadlift plus weak-point work.", levels: ["intermediate", "advanced", "elite"], sports: ["Powerlifting"], goals: ["Increase strength while lean"],
      days: week(
        sess("Squat Focus", "Quads", ["Barbell Back Squat", "Pause Squat", "Romanian Deadlift", "Hanging Leg Raise"]),
        sess("Bench Focus", "Chest", ["Barbell Bench Press", "Paused Bench Press", "Close-Grip Bench Press", "Barbell Row"]),
        null,
        sess("Deadlift Focus", "Back", ["Deadlift", "Rack Pull", "Good Morning", "Seated Cable Row"]),
        sess("Overhead & Accessories", "Shoulders", ["Standing Shoulder Press", "Weighted Dip", "Chin-Up", "Face Pull"]),
        sess("Weak-Point Day", "Full Body", ["Front Squat", "Incline Barbell Press", "T-Bar Row", "Ab Wheel Rollout"])) },
    { id: "hybrid-recomp", name: "Strength + Conditioning Hybrid", blurb: "5 days mixing lifting with conditioning to drop fat and keep muscle.", levels: ALL, sports: ["CrossFit"], goals: ["Body recomposition", "Lose body fat"],
      days: week(UPPER, LOWER, HIIT, null, FULL_C, Z2) },
    { id: "glute-focus", name: "Glute & Lower Body Focus", blurb: "4 days emphasising glutes, hamstrings and hips with upper-body support.", levels: ALL, sports: [], goals: ["Body recomposition", "Build muscle", "General fitness"],
      days: week(
        sess("Glute Strength", "Glutes", ["Hip Thrust", "Romanian Deadlift", "Bulgarian Split Squat", "Cable Kickback"]),
        UPPER_PULL_PUSH, null,
        sess("Glute Volume", "Glutes", ["Single-Leg Hip Thrust", "Curtsy Lunge", "Banded Lateral Walk", "Step-Up", "Glute Bridge"]),
        sess("Legs & Core", "Quads", ["Goblet Squat", "Leg Curl", "Leg Press", "Dead Bug", "Plank"])) },
    { id: "rebuild", name: "Gentle Rebuild & Mobility", blurb: "4 low-impact days to move well again after a layoff or injury.", levels: ["beginner", "intermediate"], sports: [], goals: ["Return from injury", "Improve mobility"],
      days: week(MOBILITY, sess("Light Strength", "Full Body", ["Glute Bridge", "Bird Dog", "Machine Chest Press", "Seated Cable Row", "Wall Sit"]), null, MOBILITY, sess("Easy Cardio & Core", "Endurance", ["Brisk Incline Walk", "Dead Bug", "Side Plank"])) },

    // ---------------- Sport-specific ----------------
    { id: "combat-conditioning", name: "Combat Conditioning", blurb: "Striking skill, power and conditioning for boxing and martial arts.", levels: ALL, sports: ["Boxing", "Kickboxing", "Martial Arts"], goals: ["Boxing conditioning"],
      days: week(
        sess("Boxing Conditioning", "Combat", ["Shadow Boxing", "Heavy Bag Rounds", "Jab-Cross Combo", "Burpee to Push-Up"]),
        STRENGTH_LEGS_PLYO,
        sess("Technical Drills", "Combat", ["Jab-Cross Combo", "Slip & Counter Drill", "Hook Combination", "Speed Bag"]),
        null,
        sess("Full Contact Rounds", "Combat", ["Heavy Bag Rounds", "Muay Thai Kicks", "Uppercut Drill", "Clinch Work"]),
        sess("Strength Day", "Back", ["Deadlift", "Pull-Up", "Barbell Bench Press", "Russian Twist"])) },
    { id: "grappling-power", name: "Grappling Strength & Grip", blurb: "Pulling strength, hips and core endurance for BJJ and wrestling.", levels: ALL, sports: ["Brazilian Jiu-Jitsu", "Wrestling"], goals: ["Increase strength while lean", "Build endurance"],
      days: week(
        sess("Pull & Grip", "Back", ["Pull-Up", "Barbell Row", "Dead Hang", "Single-Arm Dumbbell Row"]),
        sess("Hips & Legs", "Glutes", ["Sumo Deadlift", "Bulgarian Split Squat", "Hip Thrust", "Nordic Curl"]),
        sess("Mat Conditioning", "Combat", ["Clinch Work", "Burpee to Push-Up", "Heavy Bag Rounds", "Battle Ropes"]),
        null,
        sess("Push & Core", "Chest", ["Push-Up", "Standing Shoulder Press", "Ab Wheel Rollout", "Hanging Leg Raise"]),
        MOBILITY) },
    { id: "run-10k", name: "10K Runner Plan", blurb: "Easy, tempo and speed runs with strength support to stay injury-free.", levels: ALL, sports: ["Running", "Trail Running"], goals: ["Run a 10K", "Build endurance"],
      days: week(
        sess("Easy Run", "Running", ["Long Slow Run", "Strides"]),
        sess("Runner Strength", "Quads", ["Goblet Squat", "Single-Leg Romanian Deadlift", "Single-Leg Calf Raise", "Plank"]),
        sess("Tempo Run", "Running", ["Tempo Run", "Strides"]),
        null,
        sess("Intervals", "Running", ["Interval Sprints", "Hill Repeats"]),
        sess("Long Run", "Running", ["Long Slow Run"])) },
    { id: "sprint-power", name: "Sprint & Power", blurb: "Acceleration, top speed and explosive strength for sprinters.", levels: ["intermediate", "advanced", "elite"], sports: ["Sprinting"], goals: ["Improve sport performance", "Increase strength while lean"],
      days: week(
        sess("Acceleration", "Running", ["Interval Sprints", "Strides", "Sled Push"]),
        STRENGTH_LEGS_PLYO, AGILITY, null,
        sess("Top Speed", "Running", ["Interval Sprints", "Hill Repeats", "Broad Jump"]),
        sess("Power Day", "Athletic", ["Power Clean", "Depth Jump", "Medicine Ball Slam"])) },
    { id: "endurance-multi", name: "Endurance Engine", blurb: "Aerobic base, threshold work and leg strength for cyclists, rowers and triathletes.", levels: ALL, sports: ["Cycling", "Mountain Biking", "Triathlon", "Rowing"], goals: ["Build endurance", "Run a 10K"],
      days: week(
        Z2,
        sess("Strength & Core", "Quads", ["Goblet Squat", "Romanian Deadlift", "Seated Cable Row", "Pallof Press"]),
        sess("Threshold Intervals", "Endurance", ["Cycling Hill Intervals", "Rowing Machine Intervals"]),
        null,
        sess("Aerobic Mix", "Endurance", ["Stair Climber", "Long Slow Run", "Dead Bug"]),
        sess("Long Session", "Endurance", ["Zone 2 Cycling", "Brisk Incline Walk"])) },
    { id: "swim-strength", name: "Swimmer Strength & Technique", blurb: "Pool sets plus lat, shoulder and core work on dry land.", levels: ALL, sports: ["Swimming", "Triathlon"], goals: ["Build endurance", "Improve sport performance"],
      days: week(
        sess("Pool: Endurance", "Swimming", ["Swim Laps Freestyle", "Kickboard Sets"]),
        sess("Dry-Land Strength", "Back", ["Lat Pulldown", "Face Pull", "Straight-Arm Pulldown", "Plank"]),
        sess("Pool: Technique & Pull", "Swimming", ["Pull Buoy Sets", "Kickboard Sets", "Swim Laps Freestyle"]),
        null,
        sess("Pool: Speed", "Swimming", ["Swim Sprint Intervals", "Swim Laps Freestyle"]),
        sess("Core & Mobility", "Core", ["Hollow Body Hold", "Band Shoulder Dislocates", "Thoracic Rotation"])) },
    { id: "climb-hike", name: "Climber & Hiker Strength", blurb: "Pulling power, grip, core and leg endurance for climbing and hiking.", levels: ALL, sports: ["Rock Climbing", "Hiking"], goals: ["Build endurance", "Increase strength while lean"],
      days: week(
        sess("Pull & Grip", "Climbing", ["Scapular Pull-Up", "Dead Hang", "Chin-Up", "Inverted Row"]),
        sess("Leg Endurance", "Quads", ["Step-Up", "Reverse Lunge", "Wall Sit", "Single-Leg Calf Raise"]),
        sess("Wall Time", "Climbing", ["Climbing Traverse", "Hangboard Repeaters", "Dead Hang"]),
        null,
        CORE,
        sess("Long Hike / Stair Day", "Endurance", ["Stair Climber", "Brisk Incline Walk"])) },
    { id: "team-field", name: "Field Sport Athlete", blurb: "Speed, strength and conditioning for football, rugby and hockey.", levels: ALL, sports: ["Football", "Rugby", "Hockey"], goals: ["Improve sport performance", "Build endurance"],
      days: week(STRENGTH_LEGS_PLYO, UPPER_PULL_PUSH, AGILITY, null, sess("Full Body Power", "Athletic", ["Power Clean", "Box Jump", "Medicine Ball Slam", "Sled Push"]), sess("Match Conditioning", "Endurance", ["Cone Shuttle Run", "Rowing Machine Intervals", "Plank"])) },
    { id: "court-ball", name: "Court Sport Jump & Agility", blurb: "Vertical power, lateral quickness and shoulder health for basketball and volleyball.", levels: ALL, sports: ["Basketball", "Volleyball"], goals: ["Improve sport performance"],
      days: week(
        sess("Jump Power", "Athletic", ["Jump Squat", "Box Jump", "Depth Jump", "Single-Leg Calf Raise"]),
        UPPER_PULL_PUSH, AGILITY, null,
        sess("Leg Strength", "Quads", ["Goblet Squat", "Bulgarian Split Squat", "Nordic Curl", "Dead Bug"]),
        MOBILITY) },
    { id: "racquet", name: "Racquet Sport Speed & Rotation", blurb: "Footwork, rotational power and shoulder stability for tennis, badminton and table tennis.", levels: ALL, sports: ["Tennis", "Badminton", "Table Tennis"], goals: ["Improve sport performance"],
      days: week(AGILITY, ROT_POWER, null, sess("Legs & Balance", "Quads", ["Reverse Lunge", "Lateral Bound", "Single-Leg Romanian Deadlift", "Side Plank"]), sess("Shoulder Care & Pull", "Shoulders", ["Face Pull", "Rear Delt Fly", "Seated Cable Row", "Band Shoulder Dislocates"]), MOBILITY) },
    { id: "bat-swing", name: "Rotational Power (Cricket, Baseball, Golf)", blurb: "Hips, core rotation and shoulder durability for bat-and-club sports.", levels: ALL, sports: ["Cricket", "Baseball", "Golf"], goals: ["Improve sport performance", "Improve mobility"],
      days: week(ROT_POWER, sess("Lower Strength", "Quads", ["Goblet Squat", "Romanian Deadlift", "Curtsy Lunge", "Hip 90/90"]), null, sess("Upper & Scap", "Back", ["Single-Arm Dumbbell Row", "Face Pull", "Landmine Press", "Thoracic Rotation"]), AGILITY, MOBILITY) },
    { id: "board-snow", name: "Board & Snow Sport Legs", blurb: "Leg endurance, balance and core control for skiing, snowboarding, surfing and skateboarding.", levels: ALL, sports: ["Skiing", "Snowboarding", "Surfing", "Skateboarding"], goals: ["Improve sport performance", "Prevent injuries"],
      days: week(
        sess("Leg Endurance", "Quads", ["Wall Sit", "Reverse Lunge", "Hack Squat", "Single-Leg Calf Raise"]),
        sess("Balance & Core", "Core", ["Bird Dog", "Side Plank", "Lateral Bound", "Pallof Press"]),
        sess("Upper Pull & Paddle", "Back", ["Pull-Up", "Chest-Supported Row", "Push-Up", "Face Pull"]),
        null, sess("Power & Landing", "Athletic", ["Jump Squat", "Broad Jump", "Single-Leg Romanian Deadlift"]), MOBILITY) },
    { id: "dance-gym", name: "Dance & Gymnastics Control", blurb: "Flexibility, balance, core and leg strength for dancers and gymnasts.", levels: ALL, sports: ["Dance", "Gymnastics"], goals: ["Improve mobility", "Improve sport performance"],
      days: week(
        sess("Technique & Balance", "Dance", ["Plie Squat", "Releve Balance", "Arabesque Hold", "Grand Battement"]),
        sess("Core & Shapes", "Calisthenics", ["Hollow Body Hold", "L-Sit Hold", "Handstand Hold", "Core Contraction"]),
        MOBILITY, null,
        sess("Strength for Jumps", "Quads", ["Goblet Squat", "Single-Leg Hip Thrust", "Jump Squat", "Single-Leg Calf Raise"]),
        sess("Flexibility", "Yoga", ["Pigeon Pose", "Standing Forward Fold", "Downward Dog"])) },
    { id: "calisthenics-skills", name: "Calisthenics Skills & Strength", blurb: "Push, pull and leg skills plus a skill-practice day.", levels: ALL, sports: ["Calisthenics"], goals: ["Increase strength while lean", "Body recomposition"],
      days: week(
        sess("Push Skills", "Calisthenics", ["Handstand Push-Up", "Dips", "Pike Push-Up", "Tuck Planche"]),
        sess("Pull Skills", "Calisthenics", ["Muscle-Up", "Front Lever Row", "Chin-Up", "Inverted Row"]),
        sess("Legs & Core", "Calisthenics", ["Pistol Squat", "L-Sit Hold", "Hollow Body Hold", "Reverse Lunge"]),
        null,
        sess("Skill Practice", "Calisthenics", ["Human Flag Progression", "Handstand Hold", "Tuck Planche"]),
        sess("Full Body Circuit", "Full Body", ["Burpee", "Dips", "Pull-Up", "Pistol Squat"])) },
    { id: "yoga-flow", name: "Yoga Flow Week", blurb: "Strength, balance and flexibility flows across the week.", levels: ALL, sports: ["Yoga"], goals: ["Improve mobility", "General fitness"],
      days: week(
        sess("Morning Flow", "Yoga", ["Sun Salutation A", "Warrior I", "Tree Pose", "Downward Dog"]),
        null,
        sess("Balance & Strength", "Yoga", ["Chair Pose", "Boat Pose", "Crow Pose", "Warrior II"]),
        sess("Flexibility Focus", "Yoga", ["Pigeon Pose", "Standing Forward Fold", "Downward Dog"]),
        null,
        sess("Power Flow", "Yoga", ["Sun Salutation A", "Warrior II", "Crow Pose", "Boat Pose"])) },
    { id: "pilates-core", name: "Pilates Core Week", blurb: "Controlled core, glute and posture sessions.", levels: ALL, sports: ["Pilates"], goals: ["Improve mobility", "General fitness"],
      days: week(
        sess("Pilates Fundamentals", "Pilates", ["The Hundred", "Single Leg Stretch", "Spine Stretch Forward", "Roll-Up"]),
        null,
        sess("Glute & Hip Focus", "Pilates", ["Bridge with Pulse", "Clamshell", "Leg Circle", "Side-Lying Leg Lift"]),
        sess("Pilates Upper Body", "Pilates", ["Plank", "Swan Dive", "Double Leg Stretch", "Criss-Cross"]),
        null,
        sess("Full Pilates Session", "Pilates", ["Pilates Teaser", "Roll-Up", "Criss-Cross", "Leg Circle"])) },
    { id: "crossfit-wod", name: "CrossFit-Style Mixed Modal", blurb: "Strength, gymnastics and engine work in the same week.", levels: ["intermediate", "advanced", "elite"], sports: ["CrossFit"], goals: ["Improve sport performance", "Body recomposition", "Build endurance"],
      days: week(
        sess("Strength + WOD", "Full Body", ["Barbell Back Squat", "Thruster", "Wall Ball", "Burpee"]),
        sess("Gymnastics & Engine", "Calisthenics", ["Pull-Up", "Handstand Hold", "Rowing Machine Intervals", "Double-Under Jump Rope"]),
        null,
        sess("Olympic Lifting Day", "Athletic", ["Power Clean", "Front Squat", "Standing Shoulder Press", "Box Jump"]),
        sess("Chipper", "Full Body", ["Kettlebell Swing", "Burpee", "Sled Push", "Battle Ropes"]),
        Z2) },
  ];

  // Short form cues for the "How to do it" dialog. Anything not listed gets a general cue.
  const cues = {
    "Barbell Bench Press": "Eyes under the bar, shoulder blades pinched, feet planted. Lower to mid-chest, press up and slightly back.",
    "Barbell Back Squat": "Bar on upper back, brace your core, knees track over toes. Sit between your hips until thighs are parallel or lower.",
    "Deadlift": "Bar over mid-foot, flat back, push the floor away. Lock hips and knees together at the top.",
    "Pull-Up": "Start from a dead hang, pull elbows to your ribs until chin clears the bar, lower under control.",
    "Push-Up": "Hands under shoulders, body in one straight line, chest to just above the floor.",
    "Plank": "Elbows under shoulders, squeeze glutes and abs, keep hips level. Breathe steadily.",
    "Romanian Deadlift": "Soft knees, push hips back, bar slides down thighs. Stop when hamstrings are tight, stand by driving hips forward.",
    "Hip Thrust": "Upper back on a bench, drive through heels, chin tucked. Pause and squeeze glutes at the top.",
    "Goblet Squat": "Hold a weight at your chest, elbows inside knees at the bottom, chest tall.",
    "Walking Lunge": "Long step, back knee lightly kisses the floor, front knee tracks over the toes.",
    "Lat Pulldown": "Lean back slightly, pull the bar to upper chest, elbows down and back.",
    "Barbell Row": "Hinge to about 45 degrees, flat back, pull the bar to your lower ribs.",
    "Standing Shoulder Press": "Ribs down, glutes tight, press straight up and move your head through at the top.",
    "Lateral Raise": "Slight elbow bend, lift to shoulder height, lead with elbows, lower slowly.",
    "Face Pull": "Rope to eye level, pull toward your face with elbows high, squeeze rear delts.",
    "Dead Bug": "Lower back stays pressed to the floor. Extend opposite arm and leg slowly, exhale on the way out.",
    "Bird Dog": "Neutral spine, reach opposite arm and leg long, no hip rotation.",
    "Side Plank": "Stack feet, lift hips so body is straight, keep the shoulder over the elbow.",
    "Pallof Press": "Stand side-on to the cable, press out and resist the pull, do not rotate.",
    "Kettlebell Swing": "Hinge, snap hips forward so the bell floats to chest height. Arms just guide it.",
    "Burpee": "Chest to floor, explosive jump, land softly. Keep a steady rhythm you can hold.",
    "Box Jump": "Swing arms, jump with both feet, land softly with bent knees, step down.",
    "Jab-Cross Combo": "Rotate off the back foot, hands return to guard after every punch, chin down.",
    "Shadow Boxing": "Stay light on your toes, move your head, throw combinations at full speed with relaxed shoulders.",
    "Heavy Bag Rounds": "Work in 2-3 minute rounds, mix power shots with movement, keep your guard up.",
    "Tempo Run": "Comfortably hard pace you could hold for about an hour. Relax shoulders, quick light steps.",
    "Long Slow Run": "Conversational pace - you should be able to speak in full sentences throughout.",
    "Interval Sprints": "Warm up well. Run fast but controlled, walk or jog back, full recovery between reps.",
    "Zone 2 Cycling": "Steady effort where you can still talk. Keep cadence smooth around 80-95 rpm.",
    "Swim Laps Freestyle": "Long strokes, rotate from the hips, exhale underwater, kick from the hips not the knees.",
    "Dead Hang": "Grip the bar with active shoulders (do not shrug up), breathe, hold for time.",
    "Hip 90/90": "Sit with both knees bent at 90 degrees, rotate side to side keeping your chest tall.",
    "World's Greatest Stretch": "Deep lunge, same-side hand inside the foot, rotate chest up toward the ceiling, then switch.",
    "Cat-Cow": "On all fours, arch and round your spine slowly, matching the movement to your breath.",
    "Sun Salutation A": "Flow with the breath: reach up, fold, half-lift, plank, lower, cobra, downward dog, return.",
    "Downward Dog": "Hands wide, hips high, press the floor away, heels reach toward the ground.",
    "The Hundred": "Curl head and shoulders up, legs at tabletop or extended, pump arms and breathe in 5, out 5.",
  };

  window.FLEXFIT_DATA = { extraExercises, splits, cues, DAYS7 };
})();
