/* site.js — shared layer added to every page of the site (by .github/scripts/build_index.py).
   1. Bar «🏠 الفهرس» + where you are (level · term · type).
   2. Saves the pupil's mark and stars on this device (localStorage "math-progress"), read by the index.
   3. Exercise pages (engine with const exercises): exercise pills, one-exercise mode, choice buttons
      instead of «اكتب 1 نعم أو 2 لا», answer-format chips, numeric keyboard, Enter = check,
      question kept visible above the phone keyboard, «📄 الموضوع كاملا», buttons in the final window.
   4. 4AM pages with sin/cos/tan: angle calculator in degrees (DEG).
   Nothing here changes the questions, the answers, the hints or the marks. */
(function () {
  "use strict";
  var me = document.currentScript;
  if (!me || window.__siteLayer) return;
  window.__siteLayer = true;
  var ROOT = new URL("../", me.src);
  var LEVEL = { "1m": "الأولى متوسط", "2m": "الثانية متوسط", "3m": "الثالثة متوسط", "4m": "الرابعة متوسط" };
  var TERM = { t1: "الفصل الأول", t2: "الفصل الثاني", t3: "الفصل الثالث" };
  var SECTION = { dars: "درس تفاعلي", al3ab: "ألعاب", series: "سلسلة تمارين", fard: "فرض", wadjib: "واجب منزلي",
    ikhtibar: "اختبار", chahada: "سلسلة الشهادة", tahaddi: "تحدٍّ", bem: "سلاسل الشهادة" };
  var path = decodeURIComponent(location.pathname);
  var rootPath = decodeURIComponent(ROOT.pathname);
  var rel = path.indexOf(rootPath) === 0 ? path.slice(rootPath.length) : path.replace(/^\//, "");
  var pm = rel.match(/^([1-4]m)\/(?:(t[1-3])\/([a-z0-9]+)|(bem))\//);
  if (!pm) return;
  var level = pm[1], term = pm[2] || "t1", section = pm[3] || pm[4];
  var home = ROOT.href + "#" + level + "-" + term;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function fmt(n) { return String(Math.round(n * 100) / 100).replace(".", ","); }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  /* ---------- styles ---------- */
  var css = `
.sx-bar{direction:rtl;display:flex;align-items:center;gap:8px;flex-wrap:wrap;max-width:880px;margin:0 auto;padding:8px 12px;font-family:inherit;font-size:.86rem}
.sx-home,.sx-btn{display:inline-flex;align-items:center;gap:5px;font:inherit;font-weight:800;text-decoration:none;cursor:pointer;
  color:#1e3a8a;background:#fff;border:1.5px solid #c7d2fe;border-radius:10px;padding:5px 11px;line-height:1.4;box-shadow:0 1px 3px rgba(0,0,0,.06)}
.sx-home:hover,.sx-btn:hover{background:#eef2ff}
.sx-crumb{color:#475569;font-weight:700}
.sx-crumb b{color:#0f766e}
.sx-pills{display:flex;gap:5px;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;width:100%;padding:2px 0 1px;direction:rtl}
.sx-pills::-webkit-scrollbar{display:none}
.sx-pill{flex:none;font:inherit;font-size:.8rem;font-weight:800;cursor:pointer;border-radius:999px;padding:3px 11px;
  border:1.5px solid #cbd5e1;background:#fff;color:#334155;line-height:1.5}
.sx-pill.cur{border-color:#1e3a8a;box-shadow:0 0 0 2px #c7d2fe}
.sx-pill.prog{border-color:#f59e0b}
.sx-pill.ok{background:#dcfce7;border-color:#16a34a;color:#166534}
.sx-pill.part{background:#fef3c7;border-color:#d97706;color:#92400e}
.sx-pill.bad{background:#fee2e2;border-color:#dc2626;color:#991b1b}
.sx-pill.tool{border-color:#c7d2fe;color:#1e3a8a}
.sx-pill.tool[aria-pressed="true"]{background:#1e3a8a;color:#fff;border-color:#1e3a8a}
.sx-one .exercise-card{display:none}
.sx-one .exercise-card.sx-show{display:block}
.sx-step{display:none;gap:8px;justify-content:space-between;margin:-6px 0 22px}
.sx-one .sx-step{display:flex}
.sx-step button{flex:1;font:inherit;font-weight:800;cursor:pointer;border-radius:12px;padding:11px 10px;border:0;background:#1e3a8a;color:#fff;font-size:.98rem}
.sx-step button.prev{background:#e2e8f0;color:#1e293b}
.sx-step button:disabled{opacity:.35;cursor:default}
.sx-chips{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 6px}
.sx-chip{font-size:.78rem;font-weight:800;border-radius:8px;padding:1px 8px;background:#eff6ff;color:#1e40af;border:1px solid #bfdbfe}
.sx-chip.u{background:#f0fdfa;color:#115e59;border-color:#99f6e4}
.sx-choices{display:flex;gap:8px;flex-wrap:wrap;margin:4px 0 2px}
.sx-choice{flex:1 1 140px;font:inherit;font-weight:800;font-size:.98rem;cursor:pointer;border-radius:12px;padding:10px 12px;
  border:2px solid #93c5fd;background:#fff;color:#1e3a8a;text-align:center;line-height:1.45}
.sx-choice:hover{background:#eff6ff}
.sx-choice small{display:block;font-size:.72rem;color:#64748b;font-weight:700}
.sx-choice.picked{border-color:#dc2626;background:#fef2f2;color:#991b1b}
.sx-choice.right{border-color:#16a34a;background:#dcfce7;color:#166534}
.sx-choice:disabled{cursor:default}
.sx-hide{display:none!important}
.sx-ov{position:fixed;inset:0;z-index:3000;background:rgba(15,23,42,.6);display:flex;align-items:flex-start;justify-content:center;overflow:auto;padding:14px}
.sx-ov .sx-sheet{background:#fff;color:#0f172a;border-radius:14px;max-width:820px;width:100%;padding:12px;position:relative}
.sx-ov .sx-sheet .copy{display:block!important;padding:8px!important;border:0!important;font-size:15px!important;margin:0!important}
.sx-ov .sx-sheet .copy .qr{display:none!important}
.sx-ov .sx-sheet .copy .cols{display:block!important}
.sx-ov .sx-sheet svg{max-width:100%;height:auto}
.sx-ov .sx-sheet .ph{display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px 12px;font-weight:700;font-size:.9rem;margin:2px 0}
.sx-ov .sx-sheet .ttl{border:1.5px solid #1e293b;border-radius:8px;text-align:center;font-weight:800;padding:6px 8px;margin:6px 0 8px}
.sx-ov .sx-sheet .ex{margin:10px 0}
.sx-ov .sx-sheet h4{color:#b91c1c;text-decoration:underline;margin:10px 0 4px;font-size:1rem}
.sx-ov .sx-sheet .foot{text-align:center;font-weight:800;margin-top:10px}
.sx-ov .sx-sheet p{margin:4px 0}
.sx-ov .sx-top{position:sticky;top:-12px;background:#fff;display:flex;gap:8px;justify-content:space-between;align-items:center;padding:4px 0 8px;border-bottom:1px solid #e2e8f0;margin-bottom:6px;z-index:2}
.sx-ov .sx-top b{color:#1e3a8a}
.sx-resume{direction:rtl;max-width:860px;margin:10px auto 0;padding:10px 12px;border-radius:12px;background:#fef3c7;border:1.5px solid #f59e0b;color:#78350f;
  display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-weight:700;font-size:.9rem}
.sx-resume span{flex:1 1 100%}
.sx-resume button{font:inherit;font-weight:800;cursor:pointer;border-radius:10px;padding:8px 12px;border:0;background:#1e3a8a;color:#fff;flex:1}
.sx-resume button.new{background:#fff;color:#78350f;border:1.5px solid #f59e0b}
.sx-report{text-align:right;margin:12px 0 4px;font-size:.88rem}
.sx-report .h{font-weight:800;color:#1e3a8a;margin-bottom:6px}
.sx-report .r{display:flex;justify-content:space-between;gap:8px;padding:5px 8px;border-radius:8px;margin-bottom:4px;background:#f8fafc}
.sx-report .r.ok{background:#dcfce7} .sx-report .r.mid{background:#fef3c7} .sx-report .r.low{background:#fee2e2}
.sx-report .r b{direction:ltr;unicode-bidi:isolate;white-space:nowrap}
.sx-report .tip{margin:6px 0 0;font-size:.82rem;color:#475569}
.sx-sharecard{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}
.sx-sharecard input{flex:1 1 150px;font:inherit;padding:7px 10px;border-radius:10px;border:1.5px solid #cbd5e1}
.sx-sharecard button{font:inherit;font-weight:800;cursor:pointer;border-radius:10px;padding:8px 12px;border:0;background:#1877f2;color:#fff}
.modal-card{max-height:92vh;overflow:auto}
#finalScoreText,.modal-score,#scoreVal,#globalScore{direction:ltr;unicode-bidi:isolate}
.sx-modal-btns{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:10px}
.sx-modal-btns a,.sx-modal-btns button{font:inherit;font-weight:800;text-decoration:none;cursor:pointer;border-radius:10px;padding:8px 14px;border:1.5px solid #1e3a8a;background:#fff;color:#1e3a8a}
.sx-calc-fab{position:fixed;left:12px;bottom:14px;z-index:2500;font:inherit;font-weight:800;cursor:pointer;border:0;border-radius:999px;
  padding:10px 14px;background:#0f766e;color:#fff;box-shadow:0 6px 18px rgba(0,0,0,.25)}
.sx-calc{position:fixed;left:10px;right:10px;bottom:10px;z-index:2600;max-width:420px;margin:0 auto;background:#0f172a;color:#fff;border-radius:16px;
  padding:12px;box-shadow:0 12px 32px rgba(0,0,0,.35);direction:rtl;font-family:inherit}
.sx-calc[hidden]{display:none}
.sx-calc .t{display:flex;justify-content:space-between;align-items:center;font-weight:800;font-size:.9rem;color:#cbd5e1;margin-bottom:8px}
.sx-calc .t button{font:inherit;background:transparent;color:#cbd5e1;border:0;font-size:1.2rem;cursor:pointer}
.sx-calc input{width:100%;box-sizing:border-box;direction:ltr;text-align:left;font:inherit;font-size:1.1rem;padding:8px 10px;border-radius:10px;border:1px solid #334155;background:#1e293b;color:#fff}
.sx-calc .k{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:8px;direction:ltr}
.sx-calc .k button{font:inherit;font-weight:800;cursor:pointer;border:0;border-radius:9px;padding:9px 2px;background:#0d9488;color:#fff;font-size:.95rem}
.sx-calc .k button.inv{background:#2563eb}
.sx-calc .r{margin-top:8px;padding:8px 10px;border-radius:10px;background:#1e293b;color:#7dd3fc;font-weight:800;direction:ltr;text-align:left;min-height:1.6em}
.sx-calc .n{font-size:.74rem;color:#94a3b8;margin-top:6px}
/* clearer text, calm colours (his asks 2026-11-15: «الكتابة واضحة», then «نقص شوي من الألوان») */
body.sx-ex{font-size:17px}
body.sx-ex .q-title{font-size:1.1rem;color:#0f172a;line-height:1.75}
body.sx-ex .context-box{font-size:1.06rem;line-height:1.85;color:#0f172a}
body.sx-ex .math{font-size:1.02em;font-weight:700;color:#0f172a}
body.sx-ex .card-header h2{font-size:1.18rem}
body.sx-ex .feedback-box{font-size:1rem;line-height:1.75}
body.sx-ex .model-solution{font-size:1rem;line-height:1.85}
body.sx-ex input[type="text"]{font-size:1.15rem;padding:11px 12px;min-height:48px}
body.sx-ex .btn-check{font-size:1rem;padding:11px 18px}
body.sx-ex .q-meta{font-size:.82rem}
body.sx-ex .sym-toolbar{flex-wrap:wrap;gap:6px;margin-top:8px}
body.sx-ex .sym-btn{min-width:42px;min-height:42px;font-size:1.12rem;border-radius:10px}
body.sx-ex .exercise-card{border-top:4px solid #1e3a8a}
body.sx-ex .q-box.solved{border-inline-start:4px solid #16a34a}
body.sx-ex .q-box.failed{border-inline-start:4px solid #dc2626}
body.sx-ex .sx-chip{font-size:.84rem}
body.sx-ex .sx-choice{font-size:1.06rem;min-height:48px}
@media print{.sx-bar,.sx-calc,.sx-calc-fab,.sx-ov,.sx-step,.sx-chips,.sx-choices{display:none!important}}
`;
  document.head.appendChild(el("style", null, css));

  /* ---------- 1. bar «🏠 الفهرس» ---------- */
  var bar = el("nav", "sx-bar");
  bar.setAttribute("aria-label", "التنقل");
  bar.innerHTML = '<a class="sx-home" href="' + home + '">🏠 الفهرس</a><span class="sx-crumb">' + LEVEL[level] +
    " · " + TERM[term] + " · <b>" + (SECTION[section] || "") + "</b></span>";
  document.body.insertBefore(bar, document.body.firstChild);

  if ("serviceWorker" in navigator) window.addEventListener("load", function () { navigator.serviceWorker.register(ROOT.href + "sw.js").catch(function () {}); });

  /* ---------- 2. progress saved for the index ---------- */
  var KEY = "math-progress";
  function readAll() { try { return JSON.parse(store(KEY) || "{}") || {}; } catch (e) { return {}; } }
  function engine() {
    try {
      if (typeof totalScore !== "undefined" && typeof completedQuestions !== "undefined" && typeof totalQuestionsCount !== "undefined")
        return { s: +totalScore || 0, st: typeof totalStars !== "undefined" ? +totalStars || 0 : 0, a: +completedQuestions || 0, n: +totalQuestionsCount || 0 };
    } catch (e) {}
    return null;
  }
  function readScore() {
    var en = engine(), m = 20, s = null, st = 0, done = false, a = 0, n = 0;
    var se = $("#scoreVal") || $("#globalScore") || $("#score");
    if (se) {
      var txt = (se.textContent.indexOf("/") >= 0 ? se.textContent : (se.parentElement || se).textContent).replace(/\s+/g, " ");
      var mm = txt.match(/(-?[\d٠-٩]+(?:[.,][\d]+)?)\s*\/\s*(\d+)/);
      if (mm) { s = parseFloat(mm[1].replace(",", ".")); m = +mm[2]; }
    }
    var ste = $("#starsVal") || $("#stars");
    if (ste) st = parseInt(ste.textContent.replace(/[^\d]/g, ""), 10) || 0;
    if (en) { s = en.s; st = en.st || st; a = en.a; n = en.n; done = n > 0 && a >= n; }
    else { var fm = $("#finalModal"); done = !!(fm && fm.offsetParent !== null && getComputedStyle(fm).display !== "none"); }
    return s == null ? null : { s: s, m: m, st: st, a: a, n: n, d: done };
  }
  var last = "";
  function save() {
    var r = readScore();
    if (!r || (!r.s && !r.a && !r.st)) return;
    var sig = JSON.stringify(r);
    if (sig === last) return;
    last = sig;
    var all = readAll(), old = all[rel] || {};
    var best = Math.max(old.b || 0, r.d ? r.s : 0);
    all[rel] = { s: r.s, m: r.m, st: r.st, a: r.a, n: r.n, d: !!(r.d || old.d), b: best, t: Date.now() };
    store(KEY, JSON.stringify(all));
  }
  setInterval(save, 1500);
  document.addEventListener("click", function () { setTimeout(save, 400); }, true);
  window.addEventListener("pagehide", save);

  /* ---------- 3. exercise pages ---------- */
  function onReady(fn) {
    if (document.readyState === "complete") setTimeout(fn, 30);
    else window.addEventListener("load", function () { setTimeout(fn, 30); });
  }
  onReady(function () {
    var data = null;
    try { if (typeof exercises !== "undefined" && Array.isArray(exercises)) data = exercises; } catch (e) {}
    var root = $("#exercisesRoot");
    if (data && root) enhanceExercises(data, root);
    if (level === "4m" && /\b(cos|sin|tan)\b/.test(document.body.textContent)) addCalc(!!(data && root));
  });

  function plain(html) { var d = document.createElement("div"); d.innerHTML = html; return d.textContent.replace(/\s+/g, " ").trim(); }
  function norm(v) {
    var s = String(v).trim();
    try { if (typeof normalizeInput === "function") return normalizeInput(s); } catch (e) {}
    return s.replace(/\s+/g, "").toLowerCase();
  }

  /* «ثم اكتب 1 نعم أو 2 لا» → [{v:"1",t:"نعم"},{v:"2",t:"لا"}] */
  function parseChoices(q) {
    if (Array.isArray(q.choices)) return q.choices.map(function (c) { return typeof c === "string" ? { v: c, t: c } : c; });
    var p = plain(q.text), out = [];
    var k = p.search(/ثم اكتب/);
    if (k < 0) return null;
    var tail = p.slice(k + 7);
    if (/رقم الجواب الصحيح/.test(tail)) {
      var head = p.slice(0, k).split("✍")[0];
      var c = head.lastIndexOf(":");
      if (c < 0) return null;
      var re = /(\d)\)\s*([^؛]+?)\s*(?=؛|\.?$|\s\d\))/g, m;
      var body = head.slice(c + 1).trim().replace(/\.\s*$/, "");
      while ((m = re.exec(body))) out.push({ v: m[1], t: m[2].trim() });
    } else {
      tail = tail.replace(/^[^\d]*?:\s*/, " ").replace(/\.\s*$/, "");
      var parts = tail.split(/(?:^|\s|،|؛|:|و)(?=[1-9](?:\s|$))/);
      parts.forEach(function (seg) {
        var mm = seg.match(/^([1-9])\s+([\s\S]+)$/) || seg.match(/^([1-9])$/);
        if (!mm) return;
        var t = (mm[2] || "").trim().replace(/[،؛,]\s*$/, "").replace(/\s+(أو|و)$/, "").replace(/[،؛,]\s*(أو|و)?$/, "").trim();
        t = t.replace(/^(إن|إذا)\s+/, "");
        out.push({ v: mm[1], t: t });
      });
    }
    if (out.length < 2 || out.some(function (o) { return !o.t; })) return null;
    var vals = out.map(function (o) { return o.v; });
    if (!q.exact.every(function (a) { return vals.indexOf(norm(a)) >= 0 || vals.indexOf(String(a).trim()) >= 0; })) return null;
    return out;
  }

  function chipsFor(q) {
    var p = plain(q.text), chips = [];
    var r = p.match(/قيمة مقرّبة إلى\s*(الوحدة|[\d,]+)/);
    if (r) chips.push(["🎯 قيمة مقرّبة إلى " + r[1], ""]);
    if (/كسرا? مختزلا|غير قابل للاختزال|على أبسط شكل|اختزل/.test(p)) chips.push(["➗ اكتب الكسر هكذا: البسط / المقام", ""]);
    if (/a\s*√\s*b/.test(p)) chips.push(["√ على الشكل a√b", ""]);
    var u = p.match(/\(بـ\s*(cm²|m²|cm|mm|m|km|kg|g|DA|°|L|cl)\b/) || p.match(/بـ\s*(cm²|m²|cm|mm|km|kg|DA)\b/);
    if (u) chips.push(["📏 الوحدة: " + u[1] + " (كتابتها اختيارية)", "u"]);
    return chips;
  }

  function isNumeric(q) {
    return q.exact.some(function (a) { return /^[−-]?\d+(?:[.,]\d+)?$/.test(String(a).trim()); }) &&
      !q.exact.some(function (a) { return /[a-zA-Zأ-ي√]/.test(String(a)); });
  }

  function enhanceExercises(data, root) {
    var cards = $$(".exercise-card", root);
    if (!cards.length || cards.length !== data.length) return;
    document.body.classList.add("sx-ex");
    var sticky = $(".sticky-inner") || $(".sticky-bar");
    var stickyBar = $(".sticky-bar");
    function stickyH() { return stickyBar ? stickyBar.getBoundingClientRect().height : 0; }

    /* questions */
    data.forEach(function (ex) {
      (ex.questions || []).forEach(function (q) {
        var box = document.getElementById("qbox-" + q.qId), inp = document.getElementById("in-" + q.qId),
          btn = document.getElementById("btn-" + q.qId);
        if (!box || !inp || !btn) return;
        var area = $(".answer-area", box) || inp.parentElement;
        var ch = chipsFor(q);
        if (ch.length) {
          var row = el("div", "sx-chips");
          ch.forEach(function (c) { row.appendChild(el("span", "sx-chip " + c[1], c[0])); });
          area.parentElement.insertBefore(row, area);
        }
        var choices = parseChoices(q);
        if (choices) {
          var span = $(".q-title > span", box);
          if (span && /ثم اكتب/.test(span.innerHTML) && !Array.isArray(q.choices))
            span.innerHTML = span.innerHTML.replace(/ثم اكتب[\s\S]*$/, "ثم اختر الجواب الصحيح:");
          if (span && /رقم الجواب الصحيح/.test(plain(q.text))) {
            var h = span.innerHTML, w = h.indexOf("✍"), c2 = w > 0 ? h.lastIndexOf(":", w) : -1;
            if (c2 > 0) span.innerHTML = h.slice(0, c2).replace(/\s+$/, "") + "؟<br>" + h.slice(w);
          }
          var wrap = el("div", "sx-choices");
          choices.forEach(function (c) {
            var b = el("button", "sx-choice", c.t + (Array.isArray(q.choices) ? "" : ""));
            b.type = "button";
            b.onclick = function () {
              if (inp.disabled) return;
              inp.value = c.v;
              btn.click();
              setTimeout(function () { markPick(b); }, 60);
            };
            function markPick(b) {
                var solved = box.classList.contains("solved");
                if (solved) b.classList.add("right");
                else b.classList.add("picked");
                if (inp.disabled) $$(".sx-choice", wrap).forEach(function (x) { x.disabled = true; });
                if (inp.disabled && !solved) {
                  $$(".sx-choice", wrap).forEach(function (x, i) {
                    if (q.exact.some(function (a) { return norm(a) === norm(choices[i].v); })) x.classList.add("right");
                  });
                }
            }
            b.__v = c.v; b.__mark = function () { markPick(b); };
            wrap.appendChild(b);
          });
          area.parentElement.insertBefore(wrap, area);
          area.classList.add("sx-hide");
          /* the model answer no longer needs «فاكتب 1» / «(1)»: the pupil chose a button */
          var sol = document.getElementById("sol-" + q.qId);
          if (sol && !Array.isArray(q.choices)) {
            sol.innerHTML = sol.innerHTML
              .replace(/[،,]?\s*فاكتب\s*(?:<span class="math">)?\d(?:<\/span>)?/g, "")
              .replace(/\s*\((?:<span class="math">)?\d(?:<\/span>)?\)/g, "");
          }
          return;
        }
        if (isNumeric(q)) inp.setAttribute("inputmode", "decimal");
        inp.setAttribute("autocapitalize", "off");
        inp.setAttribute("autocorrect", "off");
        inp.setAttribute("spellcheck", "false");
        inp.setAttribute("enterkeyhint", "done");
        inp.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); btn.click(); } });
        inp.addEventListener("focus", function () { keepVisible(box); });
      });
    });

    /* keep the question above the phone keyboard */
    var focusedBox = null;
    function keepVisible(box) {
      focusedBox = box;
      setTimeout(function () { place(box); }, 320);
    }
    function place(box) {
      if (!box) return;
      var t = $(".q-title", box) || box;
      var y = t.getBoundingClientRect().top + window.scrollY - stickyH() - 8;
      var vv = window.visualViewport, vh = vv ? vv.height : window.innerHeight;
      var r = box.getBoundingClientRect();
      if (r.top < stickyH() + 4 || r.bottom > vh - 4) window.scrollTo({ top: y, behavior: "smooth" });
    }
    if (window.visualViewport) window.visualViewport.addEventListener("resize", function () {
      var a = document.activeElement;
      if (focusedBox && a && a.tagName === "INPUT" && focusedBox.contains(a)) place(focusedBox);
    });

    /* pills + one-exercise mode */
    var many = data.length >= 6;
    var oneKey = "sx-one:" + (many ? "many" : "few");
    var one = store(oneKey);
    one = one == null ? many : one === "1";
    var cur = 0;
    var pills = el("div", "sx-pills");
    pills.setAttribute("aria-label", "التمارين");
    var homeP = el("a", "sx-pill tool", "🏠");
    homeP.href = home; homeP.title = "العودة إلى الفهرس"; homeP.setAttribute("aria-label", "العودة إلى الفهرس");
    pills.appendChild(homeP);
    var pillEls = data.map(function (ex, i) {
      var name = /وضعية/.test(ex.title || "") ? "الوضعية" : "ت" + (i + 1);
      var p = el("button", "sx-pill", name);
      p.type = "button"; p.title = plain(ex.title || "");
      p.onclick = function () { go(i, true); };
      pills.appendChild(p);
      return p;
    });
    var modeB = el("button", "sx-pill tool", "📑 تمرين واحد");
    modeB.type = "button";
    modeB.title = "عرض تمرين واحد في الشاشة أو كل التمارين";
    modeB.onclick = function () { one = !one; store(oneKey, one ? "1" : "0"); apply(); go(cur, true); };
    pills.appendChild(modeB);
    if (sticky) sticky.appendChild(pills);
    else root.parentElement.insertBefore(pills, root);

    cards.forEach(function (c, i) {
      c.id = c.id || "sx-ex-" + (i + 1);
      var nav = el("div", "sx-step");
      var prev = el("button", "prev", "→ السابق"), next = el("button", "next", i === cards.length - 1 ? "✔ النهاية" : "التمرين التالي ←");
      prev.type = next.type = "button";
      prev.disabled = i === 0;
      next.disabled = i === cards.length - 1;
      prev.onclick = function () { go(i - 1, true); };
      next.onclick = function () { go(i + 1, true); };
      nav.appendChild(prev); nav.appendChild(next);
      c.parentNode.insertBefore(nav, c.nextSibling);
      c.__nav = nav;
    });
    function apply() {
      document.body.classList.toggle("sx-one", one);
      modeB.setAttribute("aria-pressed", one ? "true" : "false");
      modeB.textContent = one ? "📑 كل التمارين" : "📑 تمرين واحد";
      cards.forEach(function (c, i) { c.classList.toggle("sx-show", i === cur); c.__nav.style.display = one && i === cur ? "" : "none"; });
    }
    function go(i, scroll) {
      if (i < 0 || i >= cards.length) return;
      cur = i; apply(); paint();
      if (scroll) {
        var y = cards[i].getBoundingClientRect().top + window.scrollY - stickyH() - 8;
        window.scrollTo({ top: Math.max(0, y), behavior: one ? "auto" : "smooth" });
      }
      var p = pillEls[i]; if (p && p.scrollIntoView) p.scrollIntoView({ block: "nearest", inline: "center" });
    }
    function paint() {
      data.forEach(function (ex, i) {
        var qs = ex.questions || [], locked = 0, full = 0, some = 0, earned = 0;
        qs.forEach(function (q) {
          var L = false, E = 0;
          try { L = !!questionLocked[q.qId]; E = +questionEarned[q.qId] || 0; } catch (e) {
            var b = document.getElementById("qbox-" + q.qId); L = !!(b && (b.classList.contains("solved") || b.classList.contains("failed")));
            E = b && b.classList.contains("solved") ? q.pts : 0;
          }
          if (L) locked++;
          if (E >= q.pts - 1e-9) full++;
          if (E > 0) some++;
          earned += E;
        });
        var p = pillEls[i];
        p.className = "sx-pill" + (i === cur ? " cur" : "") +
          (locked === qs.length && qs.length ? (full === qs.length ? " ok" : some ? " part" : " bad") : locked || some ? " prog" : "");
        p.title = plain(ex.title || "") + " — " + fmt(earned) + " / " + fmt(ex.pts || 0);
      });
    }
    /* when the page is scrolled (all-exercises mode), the pill of the visible exercise is marked */
    window.addEventListener("scroll", function () {
      if (one) return;
      var top = stickyH() + 30, k = 0;
      cards.forEach(function (c, i) { if (c.getBoundingClientRect().top <= top) k = i; });
      if (k !== cur) { cur = k; paint(); }
    }, { passive: true });
    document.addEventListener("click", function () { setTimeout(paint, 120); }, true);
    /* after a question is locked in one-exercise mode, nothing else to do; the pupil moves with «التالي» */
    apply(); paint();

    /* final window: back to the index / again */
    var mc = $("#finalModal .modal-card");
    if (mc && !$(".sx-modal-btns", mc)) {
      var mb = el("div", "sx-modal-btns");
      mb.innerHTML = '<a href="' + home + '">🏠 العودة إلى الفهرس</a><button type="button">🔁 أعد المحاولة</button>';
      mb.querySelector("button").onclick = function () { clearLog(); location.reload(); };
      mc.appendChild(mb);
    }

    /* ---- answers saved on this device, «▶ أكمل من حيث توقفت» ---- */
    var LOGK = "math-answers:" + rel, replaying = false;
    function getLog() { try { return JSON.parse(store(LOGK) || "{}") || {}; } catch (e) { return {}; } }
    function clearLog() { try { localStorage.removeItem(LOGK); } catch (e) {} }
    var allQ = [];
    data.forEach(function (ex) { (ex.questions || []).forEach(function (q) { allQ.push(q); }); });
    root.addEventListener("click", function (e) {
      if (replaying) return;
      var b = e.target.closest && e.target.closest(".btn-check");
      if (!b || b.disabled) return;
      var qid = b.id.replace(/^btn-/, ""), inp = document.getElementById("in-" + qid);
      if (!inp || inp.disabled || !inp.value.trim()) return;
      var L = getLog(); (L[qid] = L[qid] || []).push(inp.value.trim()); L._t = Date.now();
      store(LOGK, JSON.stringify(L));
    }, true);
    function replay() {
      var L = getLog(), snd, fly = window.flyStars;
      replaying = true;
      try { snd = soundEnabled; soundEnabled = false; } catch (e) {}
      window.flyStars = function () {};
      allQ.forEach(function (q) {
        var vals = L[q.qId] || [], inp = document.getElementById("in-" + q.qId), btn = document.getElementById("btn-" + q.qId);
        if (!inp || !btn) return;
        vals.forEach(function (v) {
          if (inp.disabled) return;
          inp.value = v; btn.click();
          var box = document.getElementById("qbox-" + q.qId);
          $$(".sx-choice", box).forEach(function (cb) { if (cb.__v === v) cb.__mark(); });
        });
        if (!inp.disabled) inp.value = "";
      });
      window.flyStars = fly;
      try { soundEnabled = snd; } catch (e) {}
      $$(".shake").forEach(function (x) { x.classList.remove("shake"); });
      replaying = false;
      paint(); save();
      var first = 0;
      data.some(function (ex, i) { first = i; return (ex.questions || []).some(function (q) { try { return !questionLocked[q.qId]; } catch (e) { return false; } }); });
      go(first, true);
    }
    var saved = getLog(), nSaved = allQ.filter(function (q) { return (saved[q.qId] || []).length; }).length;
    if (nSaved) {
      var rb = el("div", "sx-resume");
      rb.innerHTML = '<span>📌 لديك محاولة محفوظة على هذا الجهاز (' + nSaved + " من " + allQ.length + ' سؤالا).</span>' +
        '<button type="button" class="go">▶ أكمل من حيث توقفت</button><button type="button" class="new">↺ ابدأ من جديد</button>';
      $(".go", rb).onclick = function () { rb.remove(); replay(); };
      $(".new", rb).onclick = function () { clearLog(); rb.remove(); };
      root.parentElement.insertBefore(rb, root);
    }

    /* ---- end of the page: strong and weak exercises + result card to share ---- */
    var fm = $("#finalModal");
    function report() {
      if (!mc || !fm || getComputedStyle(fm).display === "none") return;
      var rows = data.map(function (ex, i) {
        var e = 0; (ex.questions || []).forEach(function (q) { try { e += +questionEarned[q.qId] || 0; } catch (x) {} });
        var r = ex.pts ? e / ex.pts : 0;
        return { i: i, t: plain(ex.title || "").replace(/^(التمرين|تمرين)\s*\S*\s*[:：-]\s*/, ""), e: e, p: ex.pts || 0, r: r };
      });
      var box = $(".sx-report", mc) || el("div", "sx-report");
      box.innerHTML = '<div class="h">📋 حصيلتك في كل تمرين</div>' + rows.map(function (r) {
        return '<div class="r ' + (r.r >= 0.75 ? "ok" : r.r >= 0.5 ? "mid" : "low") + '"><span>' + (r.r >= 0.75 ? "✅" : r.r >= 0.5 ? "🟡" : "🔁") + " " + r.t +
          '</span><b>' + fmt(r.e) + " / " + fmt(r.p) + "</b></div>";
      }).join("") + (rows.some(function (r) { return r.r < 0.5; })
        ? '<p class="tip">🔁 أعد قراءة الحل النموذجي للتمارين المعلّمة، ثم أعد الفرض غدا بهدوء.</p>'
        : '<p class="tip">🌟 عمل متقن! جرّب تحديا أو سلسلة أخرى من الفهرس.</p>');
      var btns = $(".sx-modal-btns", mc);
      if (!box.parentNode) mc.insertBefore(box, btns);
      if (!$(".sx-sharecard", mc)) {
        var sc = el("div", "sx-sharecard");
        var nm = ""; try { nm = localStorage.getItem("math-name") || ""; } catch (e) {}
        sc.innerHTML = '<input type="text" maxlength="30" placeholder="اسمك على البطاقة (اختياري)" value="' + nm.replace(/"/g, "") + '">' +
          '<button type="button">📤 بطاقة نتيجتي</button>';
        $("button", sc).onclick = function () { var n = $("input", sc).value.trim(); try { localStorage.setItem("math-name", n); } catch (e) {} shareCard(n); };
        mc.insertBefore(sc, btns);
      }
    }
    document.addEventListener("click", function () { setTimeout(report, 900); }, true);
    if (fm && window.MutationObserver) new MutationObserver(function () { setTimeout(report, 50); }).observe(fm, { attributes: true, attributeFilter: ["style"] });

    function shareCard(name) {
      var r = readScore() || { s: 0, m: 20, st: 0 };
      var c = document.createElement("canvas"); c.width = 1080; c.height = 1080;
      var x = c.getContext("2d"), g = x.createLinearGradient(0, 0, 1080, 1080);
      g.addColorStop(0, "#0a355c"); g.addColorStop(0.55, "#0f4c81"); g.addColorStop(1, "#0d9488");
      x.fillStyle = g; x.fillRect(0, 0, 1080, 1080);
      x.globalAlpha = 0.1; x.fillStyle = "#fff"; x.font = "bold 120px serif";
      [["√", 90, 200], ["π", 900, 230], ["∑", 120, 930], ["÷", 930, 950], ["x²", 820, 620], ["∠", 160, 600]].forEach(function (a) { x.fillText(a[0], a[1], a[2]); });
      x.globalAlpha = 1; x.textAlign = "center"; x.direction = "rtl";
      var F = '"Tajawal", "Segoe UI", Tahoma, sans-serif';
      x.fillStyle = "#fbbf24"; x.fillRect(0, 1040, 1080, 40);
      x.font = "120px " + F; x.fillText("🏆", 540, 220);
      x.fillStyle = "#fff"; x.font = "bold 66px " + F;
      x.fillText(r.s / (r.m || 20) >= 0.5 ? "أحسنت! إنجاز رائع" : "أتممتُ المحاولة، وسأتحسّن!", 540, 330);
      if (name) { x.font = "bold 58px " + F; x.fillStyle = "#fde68a"; x.fillText(name, 540, 420); }
      x.fillStyle = "#fff"; x.font = "bold 190px " + F; x.direction = "ltr";
      x.fillText(fmt(r.s) + " / " + (r.m || 20), 540, 640);
      x.direction = "rtl"; x.font = "bold 54px " + F; x.fillStyle = "#fde68a";
      if (r.st) x.fillText("⭐ " + r.st + " نجمة", 540, 730);
      x.fillStyle = "#fff"; x.font = "44px " + F;
      var t = document.title.split(" - ")[0].slice(0, 40);
      x.fillText(t, 540, 820);
      x.fillText((LEVEL[level] ? "السنة " + LEVEL[level] : "") + " — الأستاذ يوسفي السوفي", 540, 885);
      x.font = "36px " + F; x.fillStyle = "#cbd5e1"; x.direction = "ltr";
      x.fillText(ROOT.host + ROOT.pathname, 540, 980);
      c.toBlob(function (blob) {
        if (!blob) return;
        var file = new File([blob], "natijati.png", { type: "image/png" });
        var text = "حصلت على " + fmt(r.s) + " / " + (r.m || 20) + " في «" + t + "». جرّبه أنت أيضا: " + location.href.split("#")[0];
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share({ files: [file], text: text }).catch(function () {});
        } else {
          var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "natijati.png";
          document.body.appendChild(a); a.click(); a.remove();
        }
      }, "image/png");
    }

    /* «📄 الموضوع كاملا» : the printed sheet (questions only) on the screen */
    var sheet = $("#paper .copy");
    var header = $("header");
    if (sheet && header) {
      var sb = el("button", "print-btn sx-sheet-btn", "📄 الموضوع كاملا");
      sb.type = "button";
      sb.onclick = function () {
        var ov = el("div", "sx-ov");
        var box = el("div", "sx-sheet");
        var top = el("div", "sx-top", "<b>📄 الموضوع كاملا (للحل على الورقة)</b>");
        var cl = el("button", "sx-btn", "✕ إغلاق");
        cl.type = "button";
        cl.onclick = function () { ov.remove(); };
        top.appendChild(cl);
        box.appendChild(top);
        box.appendChild(sheet.cloneNode(true));
        ov.appendChild(box);
        ov.addEventListener("click", function (e) { if (e.target === ov) ov.remove(); });
        document.body.appendChild(ov);
      };
      var pb = $(".print-btn", header);
      if (pb) pb.parentNode.insertBefore(sb, pb); else header.appendChild(sb);
      if (location.hash === "#sheet") sb.click();
    }
  }

  /* ---------- 4. angle calculator (DEG) ---------- */
  function addCalc(inBar) {
    var panel = el("div", "sx-calc");
    panel.hidden = true;
    panel.innerHTML = '<div class="t"><span>🧮 حاسبة الزوايا (بالدرجات DEG)</span><button type="button" aria-label="إغلاق">✕</button></div>' +
      '<input type="text" inputmode="decimal" placeholder="اكتب عددا: زاوية أو نسبة" aria-label="العدد">' +
      '<div class="k">' +
      '<button type="button" data-f="sin">sin</button><button type="button" data-f="cos">cos</button><button type="button" data-f="tan">tan</button><button type="button" data-f="sqrt">√</button>' +
      '<button type="button" class="inv" data-f="asin">sin⁻¹</button><button type="button" class="inv" data-f="acos">cos⁻¹</button><button type="button" class="inv" data-f="atan">tan⁻¹</button><button type="button" class="inv" data-f="sq">x²</button>' +
      '</div><div class="r" aria-live="polite"></div><div class="n">الحاسبة تعطي الناتج بأربعة أرقام بعد الفاصلة؛ أنت من يكتب القيمة المقرّبة المطلوبة في خانة الجواب.</div>';
    document.body.appendChild(panel);
    var x = $("input", panel), out = $(".r", panel);
    $(".t button", panel).onclick = function () { panel.hidden = true; };
    $$(".k button", panel).forEach(function (b) {
      b.onclick = function () {
        var raw = x.value.trim().replace(/[٠-٩]/g, function (d) { return "٠١٢٣٤٥٦٧٨٩".indexOf(d); }).replace(",", ".").replace(/[−–]/g, "-");
        var v = parseFloat(raw), f = b.dataset.f, R = Math.PI / 180, s;
        if (isNaN(v)) { out.textContent = "اكتب عددا أولا"; return; }
        var shown = String(v).replace(".", ",");
        function r4(n) { return String(Math.round(n * 10000) / 10000).replace(".", ","); }
        if (f === "sin") s = "sin " + shown + "° ≈ " + r4(Math.sin(v * R));
        else if (f === "cos") s = "cos " + shown + "° ≈ " + r4(Math.cos(v * R));
        else if (f === "tan") s = Math.abs(Math.cos(v * R)) < 1e-12 ? "tan " + shown + "° غير معرّف" : "tan " + shown + "° ≈ " + r4(Math.tan(v * R));
        else if (f === "sqrt") s = v < 0 ? "لا يوجد جذر لعدد سالب" : "√" + shown + " ≈ " + r4(Math.sqrt(v));
        else if (f === "sq") s = shown + "² = " + r4(v * v);
        else if (f === "atan") s = "tan⁻¹(" + shown + ") ≈ " + r4(Math.atan(v) / R) + "°";
        else if (v < -1 || v > 1) s = "النسبة يجب أن تكون بين 0 و 1";
        else s = (f === "asin" ? "sin⁻¹(" : "cos⁻¹(") + shown + ") ≈ " + r4((f === "asin" ? Math.asin(v) : Math.acos(v)) / R) + "°";
        out.textContent = s;
      };
    });
    function toggle() { panel.hidden = !panel.hidden; if (!panel.hidden) x.focus(); }
    var pills = $(".sx-pills");
    if (inBar && pills) {
      var b = el("button", "sx-pill tool", "🧮 الحاسبة");
      b.type = "button"; b.onclick = toggle;
      pills.appendChild(b);
    } else {
      var tb = el("button", "sx-btn", "🧮 الحاسبة");
      tb.type = "button"; tb.onclick = toggle;
      bar.insertBefore(tb, bar.children[1]);
    }
  }
})();
