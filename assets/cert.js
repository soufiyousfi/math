/* 🏅 شهادات التقدير (2026-11-22, his ask «شهادات متنوعة… جميع الإنجازات لها شهادة… شكل مميز… ميّز بين كل شهادة وأخرى:
   التحدي، السلاسل، السرعة، الفروض والاختبارات، السؤال اليومي، تحدي الشهادة»).
   - CATALOG: one certificate per activity of the platform, each with its own colour, emblem and border motif,
     three tiers (برونزية · فضية · ذهبية) computed ON THE PHONE from what the site already saves (nothing is sent anywhere).
   - TEACHER: certificates the teacher gives by hand (behaviour, cooperation, class ranking) from awards.html in teacher mode.
   - draw(canvas, spec): the certificate itself (A4 landscape, canvas, so it can be saved as an image or printed).
   Used by awards.html, by the end card of every exercise page (site.js «🎓 شهادتي») and by the index (count of certificates). */
(function () {
  "use strict";
  if (window.MathCert) return;

  var TIERS = [
    { k: "b", n: "الدرجة البرونزية", acc: "#b0713a", light: "#fbeadf" },
    { k: "s", n: "الدرجة الفضية", acc: "#8d99a6", light: "#eef2f6" },
    { k: "g", n: "الدرجة الذهبية", acc: "#c8962a", light: "#f8efd8" }
  ];
  var LEVEL = { "1m": "السنة الأولى متوسط", "2m": "السنة الثانية متوسط", "3m": "السنة الثالثة متوسط", "4m": "السنة الرابعة متوسط" };

  /* Arabic number + counted noun (same rule as arN in site.js) */
  var W = {
    silsila: ["سلسلة واحدة", "سلسلتان", "سلاسل", "سلسلة", "سلسلة", "سلسلتين"],
    wadjib: ["واجب واحد", "واجبان", "واجبات", "واجبا", "واجب", "واجبين"],
    page: ["صفحة واحدة", "صفحتان", "صفحات", "صفحة", "صفحة", "صفحتين"],
    day: ["يوم واحد", "يومان", "أيام", "يوما", "يوم", "يومين"],
    ans: ["إجابة صحيحة واحدة", "إجابتان صحيحتان", "إجابات صحيحة", "إجابة صحيحة", "إجابة صحيحة", "إجابتين صحيحتين"],
    sit: ["وضعية واحدة", "وضعيتان", "وضعيات", "وضعية", "وضعية", "وضعيتين"],
    game: ["لعبة واحدة", "لعبتان", "ألعاب", "لعبة", "لعبة", "لعبتين"],
    lesson: ["درس واحد", "درسان", "دروس", "درسا", "درس", "درسين"],
    chal: ["تحدٍّ واحد", "تحدّيان", "تحدّيات", "تحدّيا", "تحدٍّ", "تحدّيين"],
    cert: ["شهادة واحدة", "شهادتان", "شهادات", "شهادة", "شهادة", "شهادتين"],
    q: ["سؤال واحد", "سؤالان", "أسئلة", "سؤالا", "سؤال", "سؤالين"]
  };
  function arN(n, k, obl) {
    var w = W[k]; n = +n || 0;
    if (n === 1) return w[0];
    if (n === 2) return obl ? w[5] : w[1];
    var m = n % 100;
    if (m >= 3 && m <= 10) return n + " " + w[2];
    if (m >= 11 && m <= 99) return n + " " + w[3];
    return n + " " + w[4];
  }
  function fmt(x) { x = Math.round(x * 100) / 100; return String(x).replace(".", ","); }

  /* ---------- the certificates of the activities ---------- */
  /* each: id, t = title, act = activity shown on the card, emb, main colour, pat = border motif (0-4), lv = levels (default all),
     how = text of the condition, th = thresholds of the 3 tiers, unit = how the number is written, why(n, x) = line written on the certificate */
  var CATALOG = [
    { id: "fard", t: "شهادة الامتياز في الفروض", act: "الفروض", emb: "📝", main: "#0b2a5b", pat: 0, th: [14, 16, 18], mark: true,
      how: "علامة 14 ثم 16 ثم 18 من 20 في فرض", why: function (n, x) { return "تقديرًا لعلامة " + fmt(n) + " من 20 في " + (x || "فرض الرياضيات"); } },
    { id: "ikhtibar", t: "شهادة التفوّق في الاختبارات", act: "الاختبارات", emb: "🏆", main: "#4c1d70", pat: 1, th: [14, 16, 18], mark: true,
      how: "علامة 14 ثم 16 ثم 18 من 20 في اختبار", why: function (n, x) { return "تقديرًا لعلامة " + fmt(n) + " من 20 في " + (x || "اختبار الرياضيات"); } },
    { id: "series", t: "شهادة الإنجاز", act: "سلاسل التمارين", emb: "✅", main: "#14532d", pat: 2, th: [3, 8, 15], unit: "silsila",
      how: "إكمال 3 ثم 8 ثم 15 سلسلة بنصف العلامة على الأقل", why: function (n) { return "تقديرًا لإكمال " + arN(n, "silsila", true) + " من التمارين بنجاح"; } },
    { id: "wadjib", t: "شهادة المسؤولية", act: "الواجبات المنزلية", emb: "🎒", main: "#115e59", pat: 3, th: [3, 8, 15], unit: "wadjib",
      how: "إنجاز 3 ثم 8 ثم 15 واجبا منزليا", why: function (n) { return "تقديرًا لإنجاز " + arN(n, "wadjib", true) + " منزلية بجدّ وانتظام"; } },
    { id: "chahada", t: "شهادة الاستعداد للشهادة", act: "سلاسل الشهادة", emb: "🎓", main: "#1e3a8a", pat: 4, lv: ["4m"], th: [2, 5, 10], unit: "silsila",
      how: "إكمال 2 ثم 5 ثم 10 من سلاسل الشهادة", why: function (n) { return "تقديرًا لإكمال " + arN(n, "silsila", true) + " من تمارين شهادة التعليم المتوسط"; } },
    { id: "bem", t: "شهادة بطل تحدي الشهادة", act: "تحدي الشهادة", emb: "🥇", main: "#312e81", pat: 0, lv: ["4m"], th: [10, 30, 60], unit: "ans",
      how: "10 ثم 30 ثم 60 إجابة صحيحة في «تحدي الشهادة»", why: function (n) { return "تقديرًا لـ " + arN(n, "ans", true) + " في «تحدي الشهادة»"; } },
    { id: "tahaddi", t: "شهادة سيّد التحديات", act: "التحديات", emb: "🏁", main: "#9f1239", pat: 1, th: [1, 3, 6], unit: "chal",
      how: "النجاح في 1 ثم 3 ثم 6 تحديات (صفحات التحدي أو «تحدَّ زميلك»)", why: function (n) { return "تقديرًا للنجاح في " + arN(n, "chal", true) + " رياضية"; } },
    { id: "fast", t: "شهادة سرعة البديهة", act: "السرعة (تحدي الـ3 دقائق)", emb: "⚡", main: "#0e7490", pat: 2, th: [3, 10, 25], unit: "q",
      how: "حل سؤال اليوم صحيحا في أقل من 3 دقائق: 3 ثم 10 ثم 25 مرة", why: function (n) { return "تقديرًا لحلّ " + arN(n, "q", true) + " صحيحا في أقل من 3 دقائق"; } },
    { id: "daily", t: "شهادة المواظبة", act: "سؤال اليوم", emb: "🔥", main: "#7a2e0e", pat: 3, th: [7, 15, 30], unit: "day",
      how: "سلسلة سؤال اليوم: 7 ثم 15 ثم 30 يوما متتالية", why: function (n) { return "تقديرًا للمواظبة على سؤال اليوم " + arN(n, "day", true) + " متتالية"; } },
    { id: "idmaj", t: "شهادة حلّ المشكلات", act: "الوضعيات الإدماجية", emb: "🧩", main: "#3f6212", pat: 4, th: [1, 3, 6], unit: "sit",
      how: "حل 1 ثم 3 ثم 6 وضعيات إدماجية بثلاثة أرباع العلامة", why: function (n) { return "تقديرًا لحلّ " + arN(n, "sit", true) + " إدماجية بإتقان"; } },
    { id: "al3ab", t: "شهادة العقل الرياضي", act: "الألعاب", emb: "🎮", main: "#9d174d", pat: 0, th: [2, 5, 8], unit: "game",
      how: "الفوز في 2 ثم 5 ثم 8 ألعاب بثلاثة أرباع العلامة", why: function (n) { return "تقديرًا للفوز في " + arN(n, "game", true) + " رياضية"; } },
    { id: "dars", t: "شهادة الإتقان", act: "الدروس التفاعلية", emb: "📘", main: "#075985", pat: 1, th: [1, 4, 10], unit: "lesson",
      how: "إتقان 1 ثم 4 ثم 10 دروس (ثلاثة أرباع العلامة أو «متقن»)", why: function (n) { return "تقديرًا لإتقان " + arN(n, "lesson", true) + " تفاعلية"; } },
    { id: "jump", t: "شهادة القفزة النوعية", act: "التطوّر", emb: "📈", main: "#c2410c", pat: 2, th: [1, 3, 6], unit: "page",
      how: "تحسين العلامة بـ 4 نقاط من 20 على الأقل عند إعادة ورقة: 1 ثم 3 ثم 6 مرات", why: function (n, x) { return n === 1 && x ? "تقديرًا لتحسّن العلامة " + x : "تقديرًا لتحسّن العلامة بوضوح في " + arN(n, "page", true); } },
    { id: "diamond", t: "وسام الماسة النادرة", act: "الإنجاز الاستثنائي", emb: "💎", main: "#0f172a", pat: 3, th: [2, 4, 6], unit: "cert",
      how: "الحصول على 2 ثم 4 ثم 6 شهادات ذهبية", why: function (n) { return "تقديرًا لإنجاز استثنائي: " + arN(n, "cert", true) + " ذهبية"; } }
  ];

  /* certificates the teacher gives by hand (awards.html, teacher mode) */
  var TEACHER = [
    { id: "t-model", t: "شهادة التلميذ النموذجي", emb: "🌟", main: "#1e40af", pat: 0, why: "تقديرًا للسلوك المثالي والجدّ في القسم" },
    { id: "t-team", t: "شهادة روح الفريق", emb: "🤝", main: "#047857", pat: 2, why: "تقديرًا للتعاون المثمر مع الزملاء في العمل الجماعي" },
    { id: "t-resp", t: "شهادة المسؤولية والانضباط", emb: "🕰️", main: "#334155", pat: 3, why: "تقديرًا للانضباط والحرص على أداء الواجبات في وقتها" },
    { id: "t-moral", t: "شهادة الأخلاق الرفيعة", emb: "🌿", main: "#166534", pat: 4, why: "تقديرًا للأخلاق الرفيعة واحترام الآخرين" },
    { id: "t-init", t: "شهادة المبادرة الإيجابية", emb: "🚀", main: "#6d28d9", pat: 1, why: "تقديرًا للمبادرات الإيجابية والمشاركة الفعّالة" },
    { id: "t-help", t: "شهادة المساعدة والعطاء", emb: "🎁", main: "#be123c", pat: 0, why: "تقديرًا لمساعدة الزملاء على فهم الرياضيات" },
    { id: "t-ambas", t: "شهادة سفير القسم", emb: "🎖️", main: "#0f766e", pat: 2, why: "تقديرًا للتمثيل المشرّف للقسم" },
    { id: "t-week", t: "شهادة نجم الأسبوع", emb: "⭐", main: "#a16207", pat: 1, why: "تقديرًا لأفضل إنجاز في القسم هذا الأسبوع" },
    { id: "t-prog", t: "شهادة أفضل تطوّر في القسم", emb: "📈", main: "#c2410c", pat: 3, why: "تقديرًا لأكبر تحسّن في نتائج الرياضيات في القسم" },
    { id: "t-top", t: "شهادة الأوّل في القسم", emb: "👑", main: "#7c2d12", pat: 4, why: "تقديرًا لأعلى معدّل في الرياضيات في القسم" }
  ];

  /* ---------- what the phone already saved ---------- */
  function get(k, d) { try { var v = JSON.parse(localStorage.getItem(k) || "null"); return v == null ? d : v; } catch (e) { return d; } }
  function secOf(p) { var m = String(p).match(/^([1-4]m)\/t\d\/([a-z0-9]+)\//); return m ? { lv: m[1], s: m[2] } : null; }
  function ratio(r) { return r && r.m ? (r.d ? Math.max(r.b || 0, r.s || 0) : r.b || 0) / r.m : 0; }

  /* compute(titles): for each certificate {a: catalog entry, n: number reached, tier: -1..2, why, lv, next}
     titles = {path: page title} (from files.json), optional, makes the reasons precise */
  function compute(titles) {
    titles = titles || {};
    var P = get("math-progress", {}), C = get("math-cnt", {}), D = get("math-daily", {}), M = get("math-mastery", {});
    var cnt = {}, best = {}, lvs = {}, jumps = [];
    function add(id, lv) { cnt[id] = (cnt[id] || 0) + 1; if (lv) lvs[id] = lv; }
    Object.keys(P).forEach(function (p) {
      var o = secOf(p), r = P[p];
      if (!o || !r || !r.m) return;
      var q = ratio(r), done = !!r.d;
      if (o.s === "fard" || o.s === "ikhtibar") {
        if (done) { var mk = Math.round(q * 20 * 4) / 4; if (!best[o.s] || mk > best[o.s].n) best[o.s] = { n: mk, x: titles[p] ? "«" + titles[p] + "»" : "", lv: o.lv }; }
      } else if (o.s === "series" && done && q >= 0.5) add("series", o.lv);
      else if (o.s === "wadjib" && done && q >= 0.5) add("wadjib", o.lv);
      else if (o.s === "chahada" && done && q >= 0.5) add("chahada", o.lv);
      else if (o.s === "tahaddi" && done && q >= 0.75) add("tahaddi", o.lv);
      else if (o.s === "idmaj" && done && q >= 0.75) add("idmaj", o.lv);
      else if (o.s === "al3ab" && done && q >= 0.75) add("al3ab", o.lv);
      else if (o.s === "dars" && ((done && q >= 0.75) || (window.MASTERY && M[p] && window.MASTERY.level(M[p]) === 3))) add("dars", o.lv);
      if (r.f != null && r.b != null && (r.b - r.f) / r.m >= 0.2) jumps.push({ p: p, f: r.f, b: r.b, m: r.m, lv: o.lv });
    });
    Object.keys(M).forEach(function (p) {   /* mastered lessons that are not in math-progress */
      if (P[p] || !window.MASTERY || window.MASTERY.level(M[p]) !== 3) return;
      var o = secOf(p); add("dars", o && o.lv);
    });
    cnt.tahaddi = (cnt.tahaddi || 0) + Object.keys(C.chal || {}).length;
    cnt.fast = C.fast || 0;
    cnt.bem = C.bem || 0;
    cnt.daily = Math.max(D.best || 0, D.streak || 0);
    cnt.jump = jumps.length;
    var out = CATALOG.map(function (a) {
      var n, x = "", lv = lvs[a.id] || "";
      if (a.mark) { var b = best[a.id]; n = b ? b.n : 0; x = b ? b.x : ""; lv = b ? b.lv : ""; }
      else n = cnt[a.id] || 0;
      if (a.id === "jump" && jumps.length === 1) {
        var j = jumps[0], k = 20 / j.m;
        x = "من " + fmt(j.f * k) + " إلى " + fmt(j.b * k) + " من 20" + (titles[j.p] ? " في «" + titles[j.p] + "»" : "");
        lv = j.lv;
      }
      return mk(a, n, x, lv);
    });
    var golds = out.filter(function (o) { return o.tier === 2; }).length;
    out[out.length - 1] = mk(CATALOG[CATALOG.length - 1], golds, "", "");
    return out;
  }
  function mk(a, n, x, lv) {
    var tier = -1;
    a.th.forEach(function (t, i) { if (n >= t) tier = i; });
    return { a: a, n: n, tier: tier, x: x, lv: lv, why: tier >= 0 ? a.why(n, x) : "", next: tier < 2 ? a.th[tier + 1] : null };
  }

  /* certificate of ONE page (end card of the exercise pages): the activity of the page gives the colour and the title */
  var PAGEMAP = { fard: "fard", ikhtibar: "ikhtibar", series: "series", wadjib: "wadjib", chahada: "chahada", tahaddi: "tahaddi",
    idmaj: "idmaj", al3ab: "al3ab", dars: "dars", bem: "chahada" };
  function byId(id) { for (var i = 0; i < CATALOG.length; i++) if (CATALOG[i].id === id) return CATALOG[i]; for (i = 0; i < TEACHER.length; i++) if (TEACHER[i].id === id) return TEACHER[i]; return null; }

  /* ---------- drawing ---------- */
  var FT = '"Tajawal", "Segoe UI", Tahoma, Arial, sans-serif', FA = '"Amiri", "Traditional Arabic", "Times New Roman", serif';
  function fontsReady() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    var L = ['700 80px "Amiri"', '500 20px "Tajawal"', '800 20px "Tajawal"'];
    function once() { return Promise.all(L.map(function (f) { return document.fonts.load(f, "شهادة التفوّق 19").catch(function () {}); })); }
    function ok() { try { return document.fonts.check(L[0]); } catch (e) { return true; } }
    /* the stylesheet may still be loading: try again a few times (at most about 3 s), then draw with what is there */
    return new Promise(function (res) {
      var n = 0;
      (function tryIt() { once().then(function () { if (ok() || ++n > 6) res(); else setTimeout(tryIt, 500); }, function () { res(); }); })();
    });
  }
  /* loads the two fonts once (Google Fonts, stylesheet only, no script) */
  function needFonts() {
    if (document.getElementById("mc-fonts")) return;
    var l = document.createElement("link");
    l.id = "mc-fonts"; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Amiri:wght@700&family=Tajawal:wght@500;800&display=swap";
    document.head.appendChild(l);
  }
  function star(x, cx, cy, r, inner) {
    x.beginPath();
    for (var i = 0; i < 16; i++) { var a = Math.PI * i / 8, rr = i % 2 ? r * (inner || 0.62) : r; x[i ? "lineTo" : "moveTo"](cx + rr * Math.cos(a), cy + rr * Math.sin(a)); }
    x.closePath();
  }
  function poly(x, cx, cy, r, n, rot) {
    x.beginPath();
    for (var i = 0; i < n; i++) { var a = rot + 2 * Math.PI * i / n; x[i ? "lineTo" : "moveTo"](cx + r * Math.cos(a), cy + r * Math.sin(a)); }
    x.closePath();
  }
  /* one 44 x 44 tile of the border, 5 motifs so that every certificate looks different */
  function tile(x, pat, ox, oy, acc) {
    x.strokeStyle = acc; x.fillStyle = acc; x.lineWidth = 1.5;
    var c = ox + 22, d = oy + 22;
    if (pat === 0) {          /* 8-point stars */
      star(x, c, d, 16); x.stroke(); star(x, c, d, 7); x.globalAlpha = .85; x.fill(); x.globalAlpha = 1;
      [[0, 0], [44, 0], [0, 44], [44, 44]].forEach(function (p) { star(x, ox + p[0], oy + p[1], 9); x.stroke(); });
    } else if (pat === 1) {   /* hexagons and 6-point stars */
      poly(x, c, d, 17, 6, Math.PI / 6); x.stroke();
      poly(x, c, d, 8, 3, -Math.PI / 2); x.fill(); poly(x, c, d, 8, 3, Math.PI / 2); x.fill();
      [[0, 0], [44, 0], [0, 44], [44, 44]].forEach(function (p) { x.beginPath(); x.arc(ox + p[0], oy + p[1], 3, 0, 7); x.fill(); });
    } else if (pat === 2) {   /* chain of diamonds */
      poly(x, c, d, 20, 4, 0); x.stroke(); poly(x, c, d, 11, 4, 0); x.stroke(); poly(x, c, d, 4, 4, 0); x.fill();
      [[0, 0], [44, 0], [0, 44], [44, 44]].forEach(function (p) { poly(x, ox + p[0], oy + p[1], 6, 4, 0); x.fill(); });
    } else if (pat === 3) {   /* interlaced circles */
      [[0, 0], [44, 0], [0, 44], [44, 44]].forEach(function (p) { x.beginPath(); x.arc(ox + p[0], oy + p[1], 22, 0, 7); x.stroke(); });
      x.beginPath(); x.arc(c, d, 6, 0, 7); x.fill();
    } else {                  /* rosettes of petals */
      for (var i = 0; i < 8; i++) { var a = Math.PI * i / 4; x.beginPath(); x.ellipse(c + 9 * Math.cos(a), d + 9 * Math.sin(a), 8, 3.4, a, 0, 7); x.stroke(); }
      x.beginPath(); x.arc(c, d, 3.5, 0, 7); x.fill();
      [[0, 0], [44, 0], [0, 44], [44, 44]].forEach(function (p) { x.beginPath(); x.arc(ox + p[0], oy + p[1], 2.5, 0, 7); x.fill(); });
    }
  }
  /* writes text on one line, smaller if too long */
  function fit(x, s, cx, y, size, maxW, font, weight) {
    var f = size;
    do { x.font = (weight || "") + " " + f + "px " + font; f -= 1; } while (x.measureText(s).width > maxW && f > 10);
    x.fillText(s, cx, y);
  }
  /* writes text on up to 2 lines */
  function lines2(x, s, cx, y, size, maxW, font, weight, gap) {
    x.font = (weight || "") + " " + size + "px " + font;
    if (x.measureText(s).width <= maxW) { x.fillText(s, cx, y); return 1; }
    var w = s.split(" "), a = "", i;
    for (i = 0; i < w.length; i++) { var t = a ? a + " " + w[i] : w[i]; if (x.measureText(t).width > maxW && a) break; a = t; }
    x.fillText(a, cx, y - gap / 2);
    fit(x, w.slice(i).join(" "), cx, y + gap / 2, size, maxW, font, weight);
    return 2;
  }

  /* spec: {t, emb, main, pat, tier (0-2 or -1/none), name, cls, lv ("4m"), why, date, school, teacher} */
  function draw(canvas, spec) {
    var Wd = 1123, Ht = 794, S = 1.6;
    canvas.width = Math.round(Wd * S); canvas.height = Math.round(Ht * S);
    var x = canvas.getContext("2d");
    x.setTransform(S, 0, 0, S, 0, 0);
    var tr = spec.tier >= 0 ? TIERS[spec.tier] : { n: "", acc: "#c8962a", light: "#f8efd8" };
    var main = spec.main || "#0b2a5b", acc = tr.acc;
    /* border band */
    x.fillStyle = main; x.fillRect(0, 0, Wd, Ht);
    for (var ty = 0; ty < Ht; ty += 44) for (var tx = 0; tx < Wd; tx += 44) tile(x, spec.pat || 0, tx, ty, acc);
    /* sheet */
    var g = x.createRadialGradient(Wd / 2, Ht * .45, 40, Wd / 2, Ht * .45, Wd * .62);
    g.addColorStop(0, "#ffffff"); g.addColorStop(1, tr.light);
    x.fillStyle = g; x.fillRect(40, 40, Wd - 80, Ht - 80);
    x.strokeStyle = acc; x.lineWidth = 5; x.strokeRect(40, 40, Wd - 80, Ht - 80);
    x.strokeStyle = main; x.lineWidth = 1.5; x.strokeRect(54, 54, Wd - 108, Ht - 108);
    [[54, 54], [Wd - 54, 54], [54, Ht - 54], [Wd - 54, Ht - 54]].forEach(function (p) {
      star(x, p[0], p[1], 26); x.fillStyle = main; x.fill(); x.strokeStyle = acc; x.lineWidth = 3; x.stroke();
      star(x, p[0], p[1], 10); x.fillStyle = acc; x.fill();
    });
    /* watermark */
    x.save(); x.globalAlpha = .04; x.fillStyle = main; x.textAlign = "center"; x.direction = "ltr";
    x.font = "700 330px " + FA; x.fillText("π √ ∑", Wd / 2, Ht / 2 + 120); x.restore();
    /* texts */
    x.textAlign = "center"; x.direction = "rtl"; x.fillStyle = main;
    x.font = "500 19px " + FT;
    x.fillText("الجمهورية الجزائرية الديمقراطية الشعبية — وزارة التربية الوطنية", Wd / 2, 102);
    fit(x, spec.school || "متوسطة محمد العربي بن مهيدي، وادي فراغة، قالمة", Wd / 2, 130, 19, 700, FT, "500");
    x.strokeStyle = acc; x.lineWidth = 2; x.beginPath(); x.moveTo(Wd / 2 - 170, 150); x.lineTo(Wd / 2 + 170, 150); x.stroke();
    star(x, Wd / 2, 150, 7); x.fillStyle = acc; x.fill();
    x.fillStyle = main; fit(x, spec.t, Wd / 2, 248, 80, 860, FA, "700");
    if (tr.n) { x.fillStyle = acc; x.font = "800 24px " + FT; x.fillText("✦ " + tr.n + " ✦", Wd / 2, 298); }
    x.fillStyle = "#334155"; x.font = "500 25px " + FT;
    x.fillText("يسرّ أستاذ مادة الرياضيات أن يمنح هذه الشهادة إلى التلميذ(ة)", Wd / 2, 356);
    x.fillStyle = "#111827"; fit(x, spec.name || "........................", Wd / 2, 438, 64, 700, FA, "700");
    x.strokeStyle = acc; x.lineWidth = 2.5; x.setLineDash([1, 8]); x.lineCap = "round";
    x.beginPath(); x.moveTo(Wd / 2 - 230, 462); x.lineTo(Wd / 2 + 230, 462); x.stroke(); x.setLineDash([]);
    var info = [spec.cls ? "القسم: " + spec.cls : "", "الرياضيات", LEVEL[spec.lv] || ""].filter(Boolean).join(" — ");
    x.fillStyle = "#334155"; fit(x, info, Wd / 2, 504, 23, 800, FT, "500");
    x.fillStyle = main; var nl = lines2(x, spec.why || "", Wd / 2, 556, 27, 760, FT, "800", 36);
    x.fillStyle = "#475569"; x.font = "500 21px " + FT;
    x.fillText("تقديرًا للجهد، وتشجيعًا على مواصلة التقدّم.", Wd / 2, nl > 1 ? 618 : 600);
    /* seal with ribbons (left) */
    x.save(); x.translate(190, 655); x.scale(.8, .8);
    x.fillStyle = main;
    x.beginPath(); x.moveTo(-38, 30); x.lineTo(-58, 118); x.lineTo(-30, 100); x.lineTo(-14, 128); x.lineTo(4, 40); x.closePath(); x.fill();
    x.beginPath(); x.moveTo(38, 30); x.lineTo(58, 118); x.lineTo(30, 100); x.lineTo(14, 128); x.lineTo(-4, 40); x.closePath(); x.fill();
    x.beginPath(); for (var i = 0; i < 72; i++) { var a = Math.PI * i / 36, rr = i % 2 ? 70 : 78; x[i ? "lineTo" : "moveTo"](rr * Math.cos(a), rr * Math.sin(a)); } x.closePath();
    x.fillStyle = acc; x.fill();
    x.beginPath(); x.arc(0, 0, 62, 0, 7); x.fillStyle = main; x.fill();
    x.setLineDash([3, 4]); x.strokeStyle = acc; x.lineWidth = 2; x.beginPath(); x.arc(0, 0, 55, 0, 7); x.stroke(); x.setLineDash([]);
    x.textAlign = "center"; x.textBaseline = "middle"; x.font = "56px " + FT; x.fillStyle = "#fff"; x.fillText(spec.emb || "🏅", 0, 4);
    x.restore();
    /* teacher + date (right), site (middle) */
    x.textAlign = "center"; x.direction = "rtl"; x.fillStyle = main; x.font = "800 22px " + FT;
    x.fillText(spec.teacher || "الأستاذ: يوسفي السوفي", Wd - 230, 660);
    x.strokeStyle = "#94a3b8"; x.lineWidth = 1; x.beginPath(); x.moveTo(Wd - 330, 700); x.lineTo(Wd - 130, 700); x.stroke();
    x.direction = "ltr"; x.fillStyle = "#64748b"; x.font = "500 18px " + FT;
    x.fillText(spec.date || today(), Wd - 230, 730);
    x.font = "500 16px " + FT; x.fillText("soufiyousfi.github.io/math", Wd / 2, 730);
    return canvas;
  }
  function today() { var d = new Date(); return d.getDate() + " / " + (d.getMonth() + 1) + " / " + d.getFullYear(); }

  /* save / share the image */
  function share(canvas, title, toast) {
    canvas.toBlob(function (blob) {
      if (!blob) return;
      var file = new File([blob], "shahada.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) navigator.share({ files: [file], text: title }).catch(function () { dl(blob); });
      else dl(blob);
    }, "image/png");
    function dl(blob) {
      var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "shahada.png";
      document.body.appendChild(a); a.click(); a.remove();
      if (toast) toast("🎓 حُفظت الشهادة في هاتفك (التنزيلات).");
    }
  }
  /* print one or several certificates, one per A4 landscape page (also «حفظ PDF» from the print window) */
  function printAll(canvases) {
    var box = document.getElementById("mc-print");
    if (!box) {
      box = document.createElement("div"); box.id = "mc-print"; document.body.appendChild(box);
      var st = document.createElement("style");
      st.textContent = "#mc-print{display:none}@media print{@page{size:A4 landscape;margin:0}body>*{display:none!important}#mc-print{display:block!important}" +
        "#mc-print img{display:block;width:297mm;height:210mm;page-break-after:always;break-after:page}#mc-print img:last-child{page-break-after:auto;break-after:auto}}";
      document.head.appendChild(st);
    }
    box.innerHTML = "";
    canvases.forEach(function (c) { var im = new Image(); im.src = c.toDataURL("image/png"); box.appendChild(im); });
    setTimeout(function () { window.print(); }, 300);
  }

  /* counters used by the certificates (site.js and plus.js call this): math-cnt {fast, bem, chal:{page:1}} */
  function bump(k, page) {
    var C = get("math-cnt", {});
    if (k === "chal") { C.chal = C.chal || {}; C.chal[page] = 1; }
    else C[k] = (C[k] || 0) + 1;
    try { localStorage.setItem("math-cnt", JSON.stringify(C)); } catch (e) {}
  }

  window.MathCert = { CATALOG: CATALOG, TEACHER: TEACHER, TIERS: TIERS, LEVEL: LEVEL, PAGEMAP: PAGEMAP, byId: byId, compute: compute,
    draw: draw, fontsReady: fontsReady, needFonts: needFonts, share: share, printAll: printAll, bump: bump, arN: arN, fmt: fmt };
})();
