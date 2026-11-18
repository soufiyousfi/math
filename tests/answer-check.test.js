/* Tests for assets/answer-check.js — run: node tests/answer-check.test.js  (no installation needed)
   1. Same answer written another way → accepted.   2. A different value → still refused.
   3. Every interactive page: with the shared checker, no «partial» answer becomes equal to an «exact» one,
      and every «exact» answer is still accepted. */
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm");
const A = require("../assets/answer-check.js");
let fail = 0, pass = 0;
function ok(cond, msg) { if (cond) pass++; else { fail++; console.log("✗ " + msg); } }

/* ---------- 1. accepted: same answer, other writing ---------- */
const SAME = [
  ["3√5", "3×√5"], ["3√5", "√5×3"], ["3√5", "3 √5"], ["3√5", "3√(5)"], ["3√5", "3*√5"],
  ["-2√3", "-2×√3"], ["5+2√3", "5+√3×2"], ["2√3-1", "2×√3-1"],
  ["2x", "2×x"], ["2x", "x×2"], ["2x", "2*x"], ["3a+1", "3×a+1"], ["x", "1x"], ["√2", "1√2"],
  ["-3/4", "(-3)/4"], ["-3/4", "3/(-4)"], ["-3/4", "3/-4"], ["-3/4", "-(3/4)"],
  ["3,5", "3.5"], ["3,5", "٣٫٥"], ["3,5", "۳,۵"], ["3,5", "3,50"], ["12", "+12"], ["-7", "−7"],
  ["4,2", "4,20"], ["1/2", " 1 / 2 "], ["15", "x=15"], ["2,5", "٢،٥"]
];
for (const [a, b] of SAME) ok(A.same(a, b), `should be the same: «${a}» and «${b}» → ${A.normalize(a)} | ${A.normalize(b)}`);

/* ---------- 2. refused: another value (the page decides if it also accepts it) ---------- */
const DIFF = [
  ["3√5", "5√3"], ["3√5", "√15"], ["3√5", "√45"], ["3√5", "3√6"], ["1/2", "2/4"], ["1/2", "0,5"],
  ["-3/4", "3/4"], ["2x", "x2x"], ["2x", "2"], ["2x", "x+2"], ["2√3", "2+√3"], ["√5×√3", "√15"],
  ["12", "21"], ["3,5", "35"], ["0,5", "5"], ["10x", "x"], ["1,5x", "x"], ["√5×3+1", "3√5"],
  ["2x+3", "2(x+3)"], ["9", "√81"]
];
for (const [a, b] of DIFF) ok(!A.same(a, b), `should be DIFFERENT: «${a}» and «${b}» → both ${A.normalize(a)}`);

/* ---------- 3. every page of the site ---------- */
const ROOT = path.join(__dirname, "..");
function htmlFiles(d) {
  let out = [];
  for (const n of fs.readdirSync(d)) {
    if (n.startsWith(".") || n === "node_modules") continue;
    const p = path.join(d, n), st = fs.statSync(p);
    if (st.isDirectory()) out = out.concat(htmlFiles(p)); else if (n.endsWith(".html")) out.push(p);
  }
  return out;
}
function block(src, start, open, close) {
  let i = src.indexOf(open, start), depth = 0, q = null;
  for (let j = i; j < src.length; j++) {
    const c = src[j];
    if (q) { if (c === "\\") j++; else if (c === q) q = null; continue; }
    if (c === '"' || c === "'" || c === "`") q = c;
    else if (c === open) depth++;
    else if (c === close && --depth === 0) return src.slice(i, j + 1);
  }
  return null;
}
let pages = 0, qs = 0, changed = 0;
for (const f of htmlFiles(ROOT)) {
  const src = fs.readFileSync(f, "utf8");
  const ie = src.indexOf("const exercises"), inorm = src.indexOf("function normalizeInput");
  if (ie < 0 || inorm < 0) continue;
  const rel = path.relative(ROOT, f);
  let exercises, pageNorm;
  try {
    exercises = vm.runInNewContext("(" + block(src, ie, "[", "]") + ")");
    pageNorm = vm.runInNewContext("(" + src.slice(inorm, inorm + block(src, inorm, "{", "}").length + src.indexOf("{", inorm) - inorm) + ")");
  } catch (e) { ok(false, rel + ": cannot read the page data (" + e.message + ")"); continue; }
  const shared = A.wrap(pageNorm);
  pages++;
  for (const ex of exercises) for (const q of ex.questions || []) {
    if (!Array.isArray(q.exact)) continue;
    qs++;
    const E0 = new Set(q.exact.map(pageNorm)), E = new Set(q.exact.map(shared));
    for (const a of q.exact) {
      ok(E.has(shared(a)), `${rel} ${q.qId}: exact «${a}» no longer accepted`);
      if (pageNorm(a) !== shared(a)) changed++;
    }
    for (const p of q.partial || []) {
      if (E0.has(pageNorm(p))) continue;          /* already equal before: page's own choice */
      ok(!E.has(shared(p)), `${rel} ${q.qId}: partial «${p}» would now count as exact`);
    }
  }
}
ok(pages >= 50, "expected at least 50 interactive pages, found " + pages);
console.log(`${pass} passed, ${fail} failed · ${pages} pages, ${qs} questions, ${changed} stored answers written in a new shared form`);
process.exit(fail ? 1 : 0);
