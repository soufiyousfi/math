/* عدّاد زيارات منصة الرياضيات — الأستاذ يوسفي السوفي
   يُلصق في: Google Sheets ← الإضافات (Extensions) ← Apps Script، ثم «نشر» كتطبيق ويب (Web app).
   ما يُحفظ: تاريخ الزيارة + عنوان الصفحة فقط. لا اسم، لا عنوان IP، لا معرّف جهاز.
   الجدول يبقى في حساب الأستاذ على جوجل، ولا يراه غيره. */
var SHEET_NAME = "زيارات";
var TZ = "Africa/Algiers";

function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.a === "hit") return json_(hit_(p.p));
  if (p.a === "stats") return json_(stats_());
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
  cache.put("stats", JSON.stringify(res), 120);
  return res;
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
