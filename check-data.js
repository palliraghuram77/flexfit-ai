// Validates workout-data.js against the real exercise library in script.js.
// Run with: node tests/check-data.js   (exit code 1 on any problem)
const fs = require("fs");
const path = require("path");
global.window = {};
require(path.join(__dirname, "..", "workout-data.js"));
const D = window.FLEXFIT_DATA;
const script = fs.readFileSync(path.join(__dirname, "..", "script.js"), "utf8");
const base = [...script.match(/const EXERCISES = \[([\s\S]*?)\n\];/)[1].matchAll(/^\s*\["([^"]+)","([^"]+)"/gm)].map((m) => m[1]);
const extra = D.extraExercises.map((e) => e[0]);
const lib = new Set([...base, ...extra]);
let problems = 0;
const fail = (msg) => { console.log("FAIL:", msg); problems += 1; };

D.extraExercises.forEach((e) => { if (e.length !== 6) fail("bad tuple " + e[0]); });
extra.filter((n) => base.includes(n)).forEach((n) => fail("extra duplicates base: " + n));
extra.filter((n, i) => extra.indexOf(n) !== i).forEach((n) => fail("duplicate extra: " + n));
const ids = new Set();
D.splits.forEach((sp) => {
  if (ids.has(sp.id)) fail("duplicate split id " + sp.id); ids.add(sp.id);
  if (sp.days.length !== 7) fail(sp.id + " does not have 7 days");
  const training = sp.days.filter((d) => !d[4]);
  if (training.length < 3) fail(sp.id + " has fewer than 3 training days");
  sp.days.forEach((d) => d[5].forEach((n) => { if (!lib.has(n)) fail(sp.id + " uses missing exercise: " + n); }));
});
const sports = script.match(/const SPORT_CHOICES = \[(.*?)\];/)[1].match(/"[^"]+"/g).map((x) => x.slice(1, -1));
sports.filter((s) => !D.splits.some((x) => x.sports.includes(s))).forEach((s) => fail("sport without a split: " + s));
Object.keys(D.cues).filter((n) => !lib.has(n)).forEach((n) => fail("cue for unknown exercise: " + n));
console.log("library:", lib.size, "| splits:", D.splits.length, "| sports covered:", sports.length);
console.log(problems ? problems + " problem(s)" : "data OK");
process.exit(problems ? 1 : 0);
