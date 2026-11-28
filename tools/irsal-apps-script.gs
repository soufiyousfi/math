/* «أوراق التلاميذ» — receives the photos the pupils send from the site (assets/irsal.js), and lets ONLY the teacher
   grade them with Gemini, from this sheet's menu «🤖 التصحيح». The teacher: يوسفي السوفي.

   SET-UP (once): see the guide «دليل_تركيب_إرسال_الأوراق.md».
   1) A new Google Sheet «أوراق التلاميذ» → Extensions → Apps Script → paste this file → Save.
   2) Project Settings (⚙️) → Script properties → add:
        PUPIL_CODE      the class code the pupils type (e.g. BMH2026)
        GEMINI_API_KEY  your key from aistudio.google.com (used only from the menu, by you)
        MODELS          (optional) free models to try in order, comma separated
   3) Deploy → New deployment → Web app → Execute as: Me, Who has access: Anyone → copy the /exec address.

   What is kept: in YOUR Drive (folder «أوراق التلاميذ») the photos; in this sheet one row per sending.
   Nothing is sent to Gemini when a pupil sends: grading happens only when YOU choose it from the menu.
   Gemini receives the photos and the paper (questions, model answer, marking scheme). No name is ever asked.
   The pupil gets a receipt number; he sees his mark ONLY after you approve it («✅ اعتمد»). */

var SITE = "https://soufiyousfi.github.io/math/";
var SHEET = "الإرسالات";
var FOLDER = "أوراق التلاميذ";
var TZ = "Africa/Algiers";
var DEFAULT_MODELS = "gemini-2.5-flash,gemini-2.5-flash-lite,gemini-2.0-flash";
/* columns: no name, no class (his rule 2026-11-28: «لا أحتاج أسماء أحتاج نقاط فقط»). The pupil keeps a receipt number. */
var HEAD = ["التاريخ", "رقم الوصل", "الورقة", "العنوان", "الصور", "الحالة", "النقطة", "نقاط التمارين", "تفصيل التصحيح", "النموذج", "ملاحظة الأستاذ"];
var C = { date: 1, receipt: 2, page: 3, title: 4, imgs: 5, status: 6, total: 7, per: 8, detail: 9, model: 10, note: 11 };
var PAGE_RE = /^[1-4]m\/t[1-3]\/(fard|ikhtibar|wadjib)\/[a-z0-9\-]+\.html$/;

function prop_(k) { return PropertiesService.getScriptProperties().getProperty(k) || ""; }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function doGet() { return json_({ ok: true }); }

function doPost(e) {
  var b;
  try { b = JSON.parse(e.postData.contents); } catch (x) { return json_({ ok: false, msg: "طلب غير صالح." }); }
  var code = String(b.code || "").trim();
  if (!prop_("PUPIL_CODE") || code.toLowerCase() !== prop_("PUPIL_CODE").trim().toLowerCase())
    return json_({ ok: false, bad: "code", msg: "الكود غير صحيح. تأكّد منه وأعد المحاولة." });
  if (b.a === "check") return json_({ ok: true });
  if (b.a === "send") return json_(receive_(b));
  if (b.a === "results") return json_(results_(b));
  return json_({ ok: false, msg: "طلب غير معروف." });
}

/* a light brake: at most 40 sendings per 10 minutes for the whole school (protects your Drive) */
function brake_() {
  var c = CacheService.getScriptCache(), k = "n" + Math.floor(Date.now() / 600000), n = Number(c.get(k) || 0);
  if (n >= 40) return false;
  c.put(k, String(n + 1), 900); return true;
}

function receive_(b) {
  var page = String(b.page || "");
  if (!PAGE_RE.test(page)) return { ok: false, msg: "اختر ورقة من القائمة." };
  var imgs = Array.isArray(b.images) ? b.images.slice(0, 6) : [];
  if (!imgs.length) return { ok: false, msg: "أضف صورة واحدة على الأقل." };
  if (!brake_()) return { ok: false, msg: "ضغط كبير على الخدمة الآن. أعد المحاولة بعد 10 دقائق." };
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) return { ok: false, msg: "أعد المحاولة بعد لحظات." };
  try {
    var folder = sub_(sub_(root_(), page.split("/")[0]), page.replace(/\//g, "_").replace(/\.html$/, ""));
    var stamp = Utilities.formatDate(new Date(), TZ, "yyyy-MM-dd_HH-mm"), receipt = newReceipt_();
    var ids = [];
    for (var i = 0; i < imgs.length; i++) {
      var s = String(imgs[i] || "");
      if (s.length > 3000000) return { ok: false, msg: "صورة كبيرة جدا. أعد تصويرها." };
      var bytes = Utilities.base64Decode(s);
      if (!(bytes[0] === -1 && bytes[1] === -40)) return { ok: false, msg: "صيغة صورة غير مقبولة." };   // JPEG only
      var f = folder.createFile(Utilities.newBlob(bytes, "image/jpeg", stamp + "_" + receipt + "_" + (i + 1) + ".jpg"));
      ids.push(f.getId());
    }
    sheet_().appendRow([new Date(), receipt, page, String(b.title || "").slice(0, 120), ids.join(","), "جديد", "", "", "", "", ""]);
    return { ok: true, receipt: receipt };
  } finally { lock.releaseLock(); }
}

/* 6 characters without look-alikes (no 0/O, 1/I/L): about 900 million possibilities, unique in the sheet */
function newReceipt_() {
  var A = "ABCDEFGHJKMNPQRSTUVWXYZ23456789", used = {};
  sheet_().getRange(1, C.receipt, Math.max(sheet_().getLastRow(), 1), 1).getValues().forEach(function (r) { used[r[0]] = 1; });
  for (;;) { var s = ""; for (var i = 0; i < 6; i++) s += A.charAt(Math.floor(Math.random() * A.length)); if (!used[s]) return s; }
}

/* the pupil's results: ONLY rows the teacher approved («معتمد») give a mark */
function results_(b) {
  var want = {}; (Array.isArray(b.receipts) ? b.receipts.slice(0, 40) : []).forEach(function (r) { want[String(r).toUpperCase()] = 1; });
  var v = sheet_().getDataRange().getValues(), out = [];
  for (var i = 1; i < v.length; i++) {
    var row = v[i], r = String(row[C.receipt - 1]);
    if (!want[r]) continue;
    var it = { r: r, page: row[C.page - 1], title: row[C.title - 1], date: new Date(row[C.date - 1]).getTime(), status: "pending" };
    if (row[C.status - 1] === "معتمد") {
      var t = String(row[C.total - 1]).split("/");
      it.status = "approved"; it.total = (t[0] || "").trim(); it.max = (t[1] || "20").trim();
      it.per = String(row[C.per - 1] || "").split(";").map(function (x) { return x.trim(); }).filter(String);
      it.feedback = String(row[C.detail - 1] || "").replace(/ \(راجع الرسم بنفسك\)/g, "").split("\n\n").filter(function (x) { return !/:\s*$/.test(x); }).join("\n\n").slice(0, 3000); it.note = String(row[C.note - 1] || "").slice(0, 500);
    }
    out.push(it);
  }
  return { ok: true, items: out };
}

function root_() { var it = DriveApp.getFoldersByName(FOLDER); return it.hasNext() ? it.next() : DriveApp.createFolder(FOLDER); }
function sub_(parent, name) { var it = parent.getFoldersByName(name); return it.hasNext() ? it.next() : parent.createFolder(name); }
function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet(), sh = ss.getSheetByName(SHEET);
  if (!sh) { sh = ss.insertSheet(SHEET); sh.appendRow(HEAD); sh.setFrozenRows(1); sh.setRightToLeft(true); }
  return sh;
}

/* ================= the teacher's side (menu) ================= */
function onOpen() {
  SpreadsheetApp.getUi().createMenu("🤖 التصحيح")
    .addItem("صحّح الإرسالات الجديدة", "gradeNew")
    .addItem("صحّح الصف المحدد (من جديد)", "gradeSelected")
    .addSeparator()
    .addItem("✅ اعتمد كل النقاط المقترحة (يراها التلاميذ)", "approveAll")
    .addItem("✅ اعتمد الصف المحدد فقط", "approveSelected")
    .addToUi();
}

function gradeNew() {
  var sh = sheet_(), v = sh.getDataRange().getValues(), t0 = Date.now(), done = 0;
  for (var r = 1; r < v.length; r++) {
    if (v[r][C.status - 1] !== "جديد") continue;
    if (Date.now() - t0 > 270000) break;    // Apps Script stops after 6 minutes: run the menu again for the rest
    gradeRow_(sh, r + 1); done++;
  }
  SpreadsheetApp.getActive().toast(done + " إرسالات صُحّحت. راجع النقاط قبل اعتمادها.", "🤖 التصحيح", 8);
}

function gradeSelected() {
  var sh = sheet_(), r = sh.getActiveRange().getRow();
  if (r < 2) return SpreadsheetApp.getUi().alert("اختر صفا من الإرسالات.");
  gradeRow_(sh, r);
}

/* approval: the total is recomputed from «نقاط التمارين» (so your corrections there count), then the pupil can see it */
function approveRow_(sh, row) {
  var v = sh.getRange(row, 1, 1, HEAD.length).getValues()[0];
  if (v[C.status - 1] !== "مقترح" && v[C.status - 1] !== "معتمد") return false;
  var per = String(v[C.per - 1] || "").split(";").map(function (x) { return Number(String(x).split("/")[0].replace(",", ".")); });
  var max = String(v[C.total - 1]).split("/")[1];
  if (per.length && per.every(function (x) { return !isNaN(x); }))
    sh.getRange(row, C.total).setValue(String(per.reduce(function (a, x) { return a + x; }, 0)).replace(".", ",") + " / " + (max || "20").trim());
  sh.getRange(row, C.status).setValue("معتمد");
  return true;
}
function approveAll() {
  var sh = sheet_(), v = sh.getDataRange().getValues(), n = 0;
  for (var r = 1; r < v.length; r++) if (v[r][C.status - 1] === "مقترح" && approveRow_(sh, r + 1)) n++;
  SpreadsheetApp.getActive().toast(n + " نقاط اعتُمدت. يراها التلاميذ الآن برقم الوصل.", "✅ اعتماد", 8);
}
function approveSelected() {
  var sh = sheet_(), r = sh.getActiveRange().getRow();
  if (r < 2 || !approveRow_(sh, r)) return SpreadsheetApp.getUi().alert("اختر صفا حالته «مقترح».");
  SpreadsheetApp.getActive().toast("اعتُمدت.", "✅ اعتماد", 5);
}

function gradeRow_(sh, row) {
  var v = sh.getRange(row, 1, 1, HEAD.length).getValues()[0];
  try {
    var paper = paper_(v[C.page - 1]);
    var parts = [{ text: prompt_(paper) }];
    String(v[C.imgs - 1]).split(",").filter(String).forEach(function (id) {
      parts.push({ inline_data: { mime_type: "image/jpeg", data: Utilities.base64Encode(DriveApp.getFileById(id).getBlob().getBytes()) } });
    });
    var res = gemini_(parts), g = res.json, total = 0, max = 0, lines = [], per = [];
    paper.forEach(function (ex, i) {
      var e = (g.exercises || [])[i] || {}, m = Math.max(0, Math.min(Number(e.mark) || 0, ex.pts));
      m = Math.round(m * 4) / 4; total += m; max += ex.pts; per.push(String(m).replace(".", ",") + "/" + ex.pts);
      lines.push("التمرين " + (i + 1) + (e.teacher ? " (راجع الرسم بنفسك)" : "") + ": " + String(e.feedback || "").slice(0, 600));
    });
    if (g.remark) lines.push("ملاحظة عامة: " + String(g.remark).slice(0, 400));
    sh.getRange(row, C.status, 1, 5).setValues([["مقترح", String(total).replace(".", ",") + " / " + max, per.join(" ; "), lines.join("\n\n"), res.model]]);
  } catch (err) {
    sh.getRange(row, C.status, 1, 5).setValues([["خطأ", "", "", String(err.message || err).slice(0, 500), ""]]);
  }
}

/* the paper exactly as published on the site: exercises, questions, model steps, marking scheme */
function paper_(page) {
  if (!PAGE_RE.test(page)) throw new Error("عنوان ورقة غير صالح");
  var html = UrlFetchApp.fetch(SITE + page, { muteHttpExceptions: true }).getContentText();
  var a = html.indexOf("const exercises = ");
  if (a < 0) throw new Error("لم أجد تمارين الورقة في الموقع");
  a += 18; var b = html.indexOf(";\n", a);
  var ex = JSON.parse(html.slice(a, b));
  var txt = function (s) { return String(s || "").replace(/<span class="fr"><span>([^<]*)<\/span><span>([^<]*)<\/span><\/span>/g, "($1)/($2)").replace(/<sup>([^<]*)<\/sup>/g, "^$1").replace(/<[^>]+>/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim(); };
  return ex.map(function (e) {
    return { title: txt(e.title), pts: Number(e.pts) || 0, context: txt(e.context),
      questions: (e.questions || []).map(function (q) {
        return { text: txt(q.text), steps: (q.steps || []).map(txt), rubric: (q.rubric || []).map(function (r) { return txt(r.step) + ": " + r.mark; }) };
      }) };
  });
}

function prompt_(paper) {
  return [
    "أنت أستاذ رياضيات في التعليم المتوسط الجزائري. تساعد الأستاذ (وليس التلميذ) على تصحيح ورقة.",
    "الصور المرفقة هي ورقة إجابة تلميذ، بخط اليد، وقد تكون غير مرتّبة. اقرأها بعناية.",
    "قارن كل جواب بالحل النموذجي وسلم التنقيط التاليين، وامنح نقطة كل تمرين حسب السلم فقط (أرباع النقطة مسموحة).",
    "اقبل كل طريقة صحيحة في مستوى التلميذ حتى لو خالفت الحل النموذجي. خطأ في التبسيط وحده = نقطة جزئية حسب الخطوات.",
    "إذا كان السؤال إنشاءً هندسيا (ارسم، أنشئ) ولا يمكنك الحكم عليه بدقة من الصورة، ضع teacher = true.",
    "إذا كان جزء غير مقروء فاذكر ذلك ولا تخمّن.",
    "اكتب feedback بالعربية، قصيرا: أين أصاب، أين أخطأ، ونصيحة واحدة. لا تذكر أي اسم.",
    "أجب بـ JSON فقط بهذا الشكل: {\"exercises\":[{\"mark\":0,\"teacher\":false,\"feedback\":\"\"}],\"remark\":\"\"} بنفس ترتيب التمارين.",
    "الورقة:",
    JSON.stringify(paper)
  ].join("\n");
}

/* free models in order; when one has no quota left (429) or is busy, the next one is tried */
function gemini_(parts) {
  var key = prop_("GEMINI_API_KEY");
  if (!key) throw new Error("أضف GEMINI_API_KEY في خصائص السكربت");
  var models = (prop_("MODELS") || DEFAULT_MODELS).split(",").map(function (s) { return s.trim(); }).filter(String), last = "";
  for (var i = 0; i < models.length; i++) {
    var r = UrlFetchApp.fetch("https://generativelanguage.googleapis.com/v1beta/models/" + models[i] + ":generateContent", {
      method: "post", contentType: "application/json", muteHttpExceptions: true, headers: { "x-goog-api-key": key },
      payload: JSON.stringify({ contents: [{ role: "user", parts: parts }],
        generationConfig: { temperature: 0.2, responseMimeType: "application/json" } })
    });
    var c = r.getResponseCode(), body = r.getContentText();
    if (c === 200) {
      var j = JSON.parse(body), t = (((j.candidates || [])[0] || {}).content || {}).parts;
      t = t && t[0] && t[0].text;
      if (!t) { last = "رد فارغ من " + models[i]; continue; }
      return { json: JSON.parse(t), model: models[i] };
    }
    last = models[i] + ": " + c + " " + body.slice(0, 200);
    if (c === 429 || c === 503 || c === 500 || c === 404) continue;   // no quota / busy / model not available → next model
    break;
  }
  throw new Error("لم ينجح أي نموذج مجاني الآن. " + last);
}
