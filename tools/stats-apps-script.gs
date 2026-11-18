/* عدّاد زيارات منصة الرياضيات — الأستاذ يوسفي السوفي
   يُلصق في: Google Sheets ← الإضافات (Extensions) ← Apps Script، ثم «نشر» كتطبيق ويب (Web app).
   ما يُحفظ: تاريخ الزيارة + عنوان الصفحة فقط. لا اسم، لا عنوان IP، لا معرّف جهاز.
   الجدول يبقى في حساب الأستاذ على جوجل، ولا يراه غيره.
   2026-11-18: «🚩 أبلغ عن خطأ» — البلاغات تُحفظ في ورقة «بلاغات»: التاريخ، الصفحة، التمرين، النوع، الملاحظة، الحالة.
   لا اسم ولا عنوان IP. اكتب «تم» في عمود الحالة بعد تصحيح الخطأ، فلا يُعدّ في بطاقة الأستاذ.
   بعد لصق هذا الكود: نشر (Deploy) ← إدارة عمليات النشر (Manage deployments) ← ✏️ ← الإصدار: إصدار جديد (New version) ← نشر.
   هكذا يبقى الرابط نفسه، ولا يلزم تغيير الموقع. */
var SHEET_NAME = "زيارات";
var TZ = "Africa/Algiers";

function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.a === "hit") return json_(hit_(p.p));
  if (p.a === "stats") return json_(stats_());
  if (p.a === "report") return json_(report_(p));
  return json_({ ok: true });
}

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) { sh = ss.insertSheet(SHEET_NAME); sh.appendRow(["التاريخ", "الصفحة"]); }
  return sh;
}

/* one visit: only addresses of the site's own pages are accepted */
function hit_(page) {
  page = String(page || "/").slice(0, 150);
  if (!/^[A-Za-z0-9_\-\/\.]+$/.test(page)) return { ok: false };
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(8000)) return { ok: false };
  try { sheet_().appendRow([new Date(), page]); } finally { lock.releaseLock(); }
  return { ok: true };
}

/* «🚩 أبلغ عن خطأ»: one report from a page of the site (no name, no IP) */
var REPORT_SHEET = "بلاغات";
var REPORT_KINDS = { sol: "خطأ في الحل أو التصحيح", rej: "جوابي صحيح لكنه رُفض", q: "خطأ في السؤال أو الشكل", btn: "زر أو صفحة لا تعمل", other: "أخرى" };
function report_(p) {
  var page = String(p.p || "").slice(0, 150);
  if (!/^[A-Za-z0-9_\-\/\.]+$/.test(page)) return { ok: false };
  var kind = REPORT_KINDS[p.k] || REPORT_KINDS.other;
  function clean(t, n) {
    t = String(t || "").replace(/[\u0000-\u001f\u007f]+/g, " ").trim().slice(0, n);
    return /^[=+\-@]/.test(t) ? "'" + t : t;            /* never a formula in the sheet */
  }
  var cache = CacheService.getScriptCache(), n = +(cache.get("rep-min") || 0);
  if (n > 30) return { ok: false, busy: 1 };          /* at most ~30 reports a minute for the whole site */
  cache.put("rep-min", String(n + 1), 60);
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(8000)) return { ok: false };
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet(), sh = ss.getSheetByName(REPORT_SHEET);
    if (!sh) { sh = ss.insertSheet(REPORT_SHEET); sh.appendRow(["التاريخ", "الصفحة", "التمرين", "النوع", "الملاحظة", "الحالة"]); }
    sh.appendRow([new Date(), page, clean(p.e, 30), kind, clean(p.m, 300), ""]);
  } finally { lock.releaseLock(); }
  cache.remove("stats");
  return { ok: true, saved: 1 };
}

/* open reports (status column empty) for the teacher's card */
function openReports_() {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(REPORT_SHEET);
  if (!sh || sh.getLastRow() < 2) return 0;
  return sh.getRange(2, 6, sh.getLastRow() - 1, 1).getValues().filter(function (r) { return !String(r[0]).trim(); }).length;
}

/* numbers for the teacher's card (kept 2 minutes so the sheet is not read on every request) */
function stats_() {
  var cache = CacheService.getScriptCache(), c = cache.get("stats");
  if (c) return JSON.parse(c);
  var rows = sheet_().getDataRange().getValues().slice(1);
  var now = new Date(), today = Utilities.formatDate(now, TZ, "yyyy-MM-dd");
  var res = { total: rows.length, today: 0, week: 0, pages: {} };
  rows.forEach(function (r) {
    var d = new Date(r[0]), o = res.pages[r[1]] || (res.pages[r[1]] = [0, 0]);
    o[0]++;
    if (now - d <= 7 * 864e5) { res.week++; o[1]++; }
    if (Utilities.formatDate(d, TZ, "yyyy-MM-dd") === today) res.today++;
  });
  res.reports = openReports_();
  cache.put("stats", JSON.stringify(res), 120);
  return res;
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
