/* site.js — shared layer added to every page of the site (by .github/scripts/build_index.py).
   1. Bar «🏠 الفهرس» + where you are (level · term · type).
   2. Saves the pupil's mark and stars on this device (localStorage "math-progress"), read by the index.
   3. Exercise pages (engine with const exercises): exercise pills, one-exercise mode, choice buttons
      instead of «اكتب 1 نعم أو 2 لا», answer-format chips, numeric keyboard, Enter = check,
      question kept visible above the phone keyboard, «📄 الموضوع كاملا», buttons in the final window.
   4. 4AM pages with sin/cos/tan: angle calculator in degrees (DEG).
   5. 2026-11-16: 📝 scratchpad, 🗣️ Arabic reading, ⏱️ optional exam mode, 🩺 diagnosis by resource,
      🔄 similar exercise with new numbers, 🎓 certificate + 🏁 challenge link, 🔄 «new exercises» update bar.
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
    ikhtibar: "اختبار", chahada: "سلسلة الشهادة", tahaddi: "تحدٍّ", idmaj: "وضعية إدماجية", bem: "سلاسل الشهادة" };
  /* Arabic number + counted noun (العدد والمعدود): 1 «سؤال واحد», 2 «سؤالان», 3-10 «3 أسئلة», 11-99 «12 سؤالا», 100 «100 سؤال» */
  var AR_W = {
    q: ["سؤال واحد", "سؤالان", "أسئلة", "سؤالا", "سؤال", "سؤالين"], ex: ["تمرين واحد", "تمرينان", "تمارين", "تمرينا", "تمرين", "تمرينين"],
    star: ["نجمة واحدة", "نجمتان", "نجوم", "نجمة", "نجمة", "نجمتين"], min: ["دقيقة واحدة", "دقيقتان", "دقائق", "دقيقة", "دقيقة", "دقيقتين"],
    day: ["يوم واحد", "يومان", "أيام", "يوما", "يوم", "يومين"], page: ["صفحة واحدة", "صفحتان", "صفحات", "صفحة", "صفحة", "صفحتين"]
  };
  function arN(n, k, obl) {
    var w = AR_W[k] || k; n = Math.round(Number(n) || 0);
    if (n === 1) return w[0];
    if (n === 2) return obl ? w[5] : w[1];
    var r = n % 100;
    return n + " " + (r >= 3 && r <= 10 ? w[2] : r >= 11 ? w[3] : n === 0 ? w[2] : w[4]);
  }
  window.__arN = arN;
  var path = decodeURIComponent(location.pathname);
  var rootPath = decodeURIComponent(ROOT.pathname);
  var rel = path.indexOf(rootPath) === 0 ? path.slice(rootPath.length) : path.replace(/^\//, "");

  /* ---------- 0. shared answer checker (assets/answer-check.js, 2026-11-18) ----------
     The page keeps its own accepted answers; the shared checker only recognises the SAME answer written
     another way (3√5 = √5×3, 2x = 2×x, ٣,٥ = 3.5…). It wraps the page's normalizeInput, used for the
     pupil's answer AND for the stored answers, so nothing else in the page changes. */
  (function () {
    function hook() {
      try {
        if (window.MathAnswer && typeof window.normalizeInput === "function" && !window.normalizeInput.__shared)
          window.normalizeInput = window.MathAnswer.wrap(window.normalizeInput);
      } catch (e) {}
    }
    if (window.MathAnswer) return hook();
    if (typeof window.normalizeInput !== "function") return;
    var sc = document.createElement("script");           /* page published without the injected tag */
    sc.src = ROOT.href + "assets/answer-check.js" + (me.getAttribute("data-v") ? "?v=" + me.getAttribute("data-v") : "");
    sc.onload = hook;
    document.head.appendChild(sc);
  })();

  /* ---------- 0a. visits counter: the teacher's OWN Google Sheet (Apps Script web app) ----------
     Each page sends ONE request per visit (once per page and per browser session): date + page address only,
     no name, no IP kept, no cookie. The teacher's device (?prof=1) is not counted.
     The index shows the teacher (and only him) a card with the numbers. Script: tools/stats-apps-script.gs */
  var STATS_URL = "https://script.google.com/macros/s/AKfycbzlY66fSXWEjM0rbBllJPBvAzS2FyOVFfzoe35ZA1rAREiZR_biQKQypTzIRK0RcnA/exec";
  (function () {
    if (!STATS_URL || !window.fetch) return;
    var prof = false, page = rel.replace(/index\.html$/, "") || "/";
    try { prof = localStorage.getItem("math-prof") === "1"; } catch (e) {}
    if (!prof && /^(?:[1-4]m\/|$|\/$|index\.html$)/.test(page)) {
      var key = "math-hit:" + page, seen = false;
      try { seen = sessionStorage.getItem(key) === "1"; sessionStorage.setItem(key, "1"); } catch (e) {}
      if (!seen) fetch(STATS_URL + "?a=hit&p=" + encodeURIComponent(page), { mode: "no-cors", cache: "no-store", keepalive: true }).catch(function () {});
    }
    var itemsEl = document.getElementById("items");
    if (!prof || !itemsEl) return;
    var titles = {};
    try { JSON.parse(itemsEl.textContent).forEach(function (it) { titles[it.url] = it.title; }); } catch (e) {}
    var st = document.createElement("style");
    /* hidden while browsing: a small «👁️ N» button in the header opens it as a centred window */
    st.textContent = ".sx-wrap{position:fixed;inset:0;z-index:3500;display:none;align-items:center;justify-content:center;padding:16px;background:rgba(15,23,42,.5);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}" +
      ".sx-wrap.on{display:flex}.sx-stats{position:relative;width:min(420px,100%);max-height:80vh;overflow:auto;direction:rtl;" +
      "background:#0f172a;color:#e2e8f0;border:1.5px solid #38bdf8;border-radius:14px;padding:12px 14px;box-shadow:0 10px 28px rgba(0,0,0,.4);font-family:inherit;font-size:.86rem}" +
      ".sx-stats h4{margin:0 0 8px;font-size:.95rem;color:#38bdf8;display:flex;justify-content:space-between;gap:8px;align-items:center}" +
      ".sx-stats .n{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:8px;text-align:center}" +
      ".sx-stats .n b{display:block;font-size:1.25rem;color:#fff}.sx-stats .n span{color:#94a3b8;font-size:.72rem}" +
      ".sx-stats ol{margin:0;padding-inline-start:18px;line-height:1.55}.sx-stats ol small{color:#94a3b8}" +
      ".sx-stats button{font:inherit;font-weight:800;cursor:pointer;border-radius:9px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;padding:4px 9px}" +
      ".sx-stats .row{display:flex;gap:6px;margin-top:8px}@media print{.sx-wrap,.sx-statbtn{display:none!important}}" +
      ".sx-statbtn{font:inherit;font-size:.85rem;font-weight:800;cursor:pointer;border-radius:999px;padding:3px 10px;background:#0f172a;color:#fff;border:1px solid rgba(255,255,255,.45)}" +
      ".sx-statbtn.fl{position:fixed;left:12px;bottom:12px;z-index:3400}";
    document.head.appendChild(st);
    var box = document.createElement("div");
    box.className = "sx-stats";
    box.innerHTML = '<h4><span>👁️ زيارات المنصة (لك وحدك)</span><button type="button" data-x="1" aria-label="إخفاء">✕</button></h4><div class="b">…</div>' +
      '<div class="row"><button type="button" data-copy="1">🔗 نسخ رابط الموقع</button><button type="button" data-r="1">🔄 تحديث</button></div>';
    var wrap = document.createElement("div");
    wrap.className = "sx-wrap"; wrap.appendChild(box);
    document.body.appendChild(wrap);
    var pill = document.createElement("button");
    pill.type = "button"; pill.className = "sx-statbtn"; pill.title = "زيارات المنصة (لك وحدك)"; pill.textContent = "👁️ …";
    var slot = document.getElementById("hbtns");
    if (slot) slot.appendChild(pill); else { pill.className += " fl"; document.body.appendChild(pill); }
    pill.onclick = function () { wrap.classList.add("on"); load(); };
    wrap.addEventListener("click", function (e) { if (e.target === wrap) wrap.classList.remove("on"); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") wrap.classList.remove("on"); });
    function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
    function load() {
      box.querySelector(".b").textContent = "…";
      fetch(STATS_URL + "?a=stats", { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (d) {
        var pages = Object.keys(d.pages || {}).map(function (k) { return [k, d.pages[k][0], d.pages[k][1]]; })
          .filter(function (p) { return p[0] !== "/"; }).sort(function (a, b) { return b[2] - a[2] || b[1] - a[1]; }).slice(0, 10);
        var home = (d.pages || {})["/"];
        pill.textContent = "👁️ " + d.total;
        box.querySelector(".b").innerHTML =
          '<div class="n"><div><b>' + d.today + '</b><span>اليوم</span></div><div><b>' + d.week + '</b><span>7 أيام</span></div><div><b>' + d.total + '</b><span>المجموع</span></div></div>' +
          (home ? '<div style="margin-bottom:6px">🏠 الصفحة الرئيسية: <b>' + home[1] + '</b> هذا الأسبوع · ' + home[0] + ' في المجموع</div>' : "") +
          (pages.length ? '<div style="margin-bottom:4px;color:#94a3b8">الأكثر زيارة هذا الأسبوع:</div><ol>' + pages.map(function (p) {
            return "<li>" + esc(titles[p[0]] || p[0]) + " <small>(" + p[2] + " · " + p[1] + ")</small></li>";
          }).join("") + "</ol>" : "");
      }).catch(function () { box.querySelector(".b").textContent = "تعذّر الاتصال بجدول الإحصاء. تحقّق من الإنترنت."; });
    }
    box.addEventListener("click", function (e) {
      if (e.target.closest("[data-x]")) wrap.classList.remove("on");
      else if (e.target.closest("[data-r]")) load();
      else if (e.target.closest("[data-copy]")) {
        var u = ROOT.href, b = e.target.closest("[data-copy]");
        (navigator.clipboard ? navigator.clipboard.writeText(u) : Promise.reject()).then(function () { b.textContent = "✓ نُسخ"; }, function () { prompt("انسخ الرابط:", u); });
      }
    });
    load();
  })();
  /* ---------- 0. new version of the site («🔄 تتوفر تمارين جديدة من الأستاذ») ----------
     Each deployed page carries the version it was built with (data-v, added by build_index.py).
     When the app comes back to the screen, or the connection returns, version.json is read:
     if the teacher has published something since, a small bar offers to reload. */
  var VER = me.getAttribute("data-v") || "";
  (function () {
    if (!VER || !window.fetch) return;
    var shown = false, st = document.createElement("style");
    st.textContent = ".sx-upd{position:fixed;left:10px;right:10px;bottom:12px;z-index:4000;max-width:520px;margin:0 auto;direction:rtl;display:flex;gap:8px;align-items:center;flex-wrap:wrap;" +
      "background:#fff;color:#0f172a;border:1.5px solid #cbd5e1;border-right:5px solid #0f766e;border-radius:12px;padding:10px 12px;box-shadow:0 8px 24px rgba(0,0,0,.18);font-family:inherit;font-weight:700;font-size:.95rem}" +
      ".sx-upd span{flex:1 1 180px}.sx-upd button{font:inherit;font-weight:800;cursor:pointer;border-radius:10px;padding:8px 12px;border:0;background:#0f766e;color:#fff}" +
      ".sx-upd button.x{background:#fff;color:#475569;border:1px solid #cbd5e1;padding:8px 10px}@media print{.sx-upd{display:none!important}}";
    document.head.appendChild(st);
    function show() {
      if (shown) return;
      shown = true;
      var b = document.createElement("div");
      b.className = "sx-upd";
      b.setAttribute("role", "status");
      b.innerHTML = '<span>🔄 تتوفر تمارين جديدة من الأستاذ (يُحدَّث وحده عند عودتك، وأجوبتك محفوظة)</span><button type="button" class="go">حدّث الآن</button><button type="button" class="x" aria-label="لاحقا">✕</button>';
      b.querySelector(".go").onclick = function () { location.reload(); };
      b.querySelector(".x").onclick = function () { b.remove(); };
      document.body.appendChild(b);
    }
    /* 2026-11-16 his ask «لماذا لا يتم التحديث التلقائي… لجميع معطيات الموقع»: the new version is taken by itself.
       The page reloads on its own unless the pupil is in the middle of something (an answer typed but not yet checked,
       the draft open, a timed exam): then the bar is shown and the reload happens the next time the app comes back.
       Answers, stars and progress live in localStorage and are replayed after the reload, so nothing is lost. */
    var typing = false, newV = "";
    document.addEventListener("input", function (e) { if (e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) typing = true; }, true);
    document.addEventListener("click", function (e) { if (e.target && e.target.closest && e.target.closest(".btn-check")) typing = false; }, true);
    function busy() {
      var a = document.activeElement;
      return typing || document.body.classList.contains("sx-exam") || !!document.querySelector(".sx-pad") ||
        !!(a && /^(INPUT|TEXTAREA)$/.test(a.tagName) && a.value);
    }
    function apply() {
      var k = "math-upd", t = null;
      try { t = JSON.parse(sessionStorage.getItem(k) || "null"); } catch (e) {}
      /* guard: if the reload already gave the old page back (server copy not refreshed yet), do not loop */
      if (t && t.v === newV && Date.now() - t.t < 3 * 60000) return show();
      if (busy()) return show();
      try { sessionStorage.setItem(k, JSON.stringify({ v: newV, t: Date.now() })); } catch (e) {}
      try { remember(); } catch (e) {}
      location.reload();
    }
    function check() {
      if (navigator.onLine === false) return;
      if (newV) return apply();
      try { navigator.serviceWorker && navigator.serviceWorker.getRegistration && navigator.serviceWorker.getRegistration().then(function (g) { if (g) g.update(); }).catch(function () {}); } catch (e) {}
      fetch(ROOT.href + "version.json?t=" + Date.now(), { cache: "no-store" })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) { if (j && j.v && j.v !== VER) { newV = j.v; apply(); } })
        .catch(function () {});
    }
    window.__sxUpdate = check;
    setTimeout(check, 1500);
    document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") check(); });
    window.addEventListener("online", check);
    setInterval(check, 15 * 60000);
  })();

  /* ---------- 0b. the phone closed the app in the background (2026-11-16 his report) ----------
     Android may kill the app while the pupil is in another app; it then reopens on the start page.
     The last page is remembered and reopened (if left less than 3 hours ago), and its answers are replayed. */
  var LASTK = "math-last";
  var isPage = /^([1-4]m)\//.test(rel);
  function remember() {
    if (!isPage) return;
    try { localStorage.setItem(LASTK, JSON.stringify({ u: location.pathname + location.search.replace(/[?&]exam=\d+/, ""), y: Math.round(window.scrollY), t: Date.now() })); } catch (e) {}
  }
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "hidden") remember(); });
  window.addEventListener("pagehide", remember);
  if (!isPage) {
    try {
      var ls = JSON.parse(localStorage.getItem(LASTK) || "null"), app = /[?&]app=1/.test(location.search) ||
        (window.matchMedia && matchMedia("(display-mode: standalone)").matches && !document.referrer && !location.hash);
      if (ls && app && !sessionStorage.getItem("math-opened") && Date.now() - ls.t < 3 * 3600000) {
        sessionStorage.setItem("math-opened", "1");
        location.replace(ls.u);
      }
      sessionStorage.setItem("math-opened", "1");
    } catch (e) {}
  }

  /* ---------- 0c. 👪 several children on one phone (2026-11-16 his remark «اذا انتقل الولي من مستوى إلى آخر معناه لديه تلميذين او ابنين او أكثر») ----------
     Each child has a profile; the early script added by build_index.py keeps every localStorage key of the active profile apart
     (marks, stars, saved answers, last page, name, level). The first child keeps the data already on the phone. */
  var KIDS = (function () {
    var raw = window.__kidRaw || { g: function (k) { return localStorage.getItem(k); }, s: function (k, v) { localStorage.setItem(k, v); } };
    var LV = { "1m": "1م", "2m": "2م", "3m": "3م", "4m": "4م" };
    function list() {
      var a = null;
      try { a = JSON.parse(raw.g("math-kids") || "null"); } catch (e) {}
      if (!a || !a.length) {
        var n = "", l = "";
        try { n = raw.g("math-name") || ""; l = raw.g("math-level") || ""; } catch (e) {}
        a = [{ id: "", n: n || "تلميذ 1", l: l }];
      }
      return a;
    }
    function save(a) { try { raw.s("math-kids", JSON.stringify(a)); } catch (e) {} }
    function curId() { return window.__kid || ""; }
    function cur() { var a = list(), c = curId(); for (var i = 0; i < a.length; i++) if (a[i].id === c) return a[i]; return a[0]; }
    function pre(id) { return id ? "kid" + id + "|" : ""; }
    var st = document.createElement("style");
    st.textContent = ".sx-kid-btn{font:inherit;font-weight:800;cursor:pointer;border-radius:999px;padding:6px 12px;background:#fff;color:#1e3a8a;border:1.5px solid #93c5fd;max-width:55vw;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
      ".sx-kids{position:fixed;inset:0;z-index:4500;background:rgba(15,23,42,.45);display:flex;align-items:flex-end;justify-content:center;direction:rtl;font-family:inherit}" +
      ".sx-kids>div{background:#fff;color:#0f172a;width:100%;max-width:520px;border-radius:16px 16px 0 0;padding:14px 16px 18px;max-height:88vh;overflow:auto;border-top:5px solid #1e3a8a}" +
      ".sx-kids h3{margin:0 0 4px;font-size:1.1rem}.sx-kids p{margin:0 0 10px;color:#475569;font-size:.88rem;line-height:1.6}" +
      ".sx-kids .row{display:flex;gap:8px;align-items:center;margin:6px 0}.sx-kids .row button.k{flex:1;text-align:right;font:inherit;font-weight:800;cursor:pointer;border-radius:12px;padding:10px 12px;background:#fff;color:#0f172a;border:1.5px solid #cbd5e1}" +
      ".sx-kids .row button.k.on{border-color:#1e3a8a;border-right:6px solid #1e3a8a;background:#eff6ff}.sx-kids .row button.k small{color:#64748b;font-weight:700}" +
      ".sx-kids .row button.d{font:inherit;cursor:pointer;border-radius:10px;padding:8px 10px;background:#fff;color:#991b1b;border:1px solid #fecaca;font-size:.8rem;white-space:nowrap}" +
      ".sx-kids form{display:flex;gap:6px;flex-wrap:wrap;margin-top:12px;padding-top:10px;border-top:1px dashed #cbd5e1}" +
      ".sx-kids input,.sx-kids select{font:inherit;font-size:1rem;padding:8px;border:1.5px solid #cbd5e1;border-radius:10px;background:#fff;color:#0f172a}.sx-kids input{flex:1 1 140px;min-width:0}" +
      ".sx-kids form button,.sx-kids .close{font:inherit;font-weight:800;cursor:pointer;border-radius:10px;padding:8px 12px;border:0;background:#1e3a8a;color:#fff}" +
      ".sx-kids .close{background:#fff;color:#475569;border:1px solid #cbd5e1;margin-top:12px;width:100%}" +
      ".sx-kid-tip{position:fixed;left:10px;right:10px;bottom:14px;z-index:4400;max-width:520px;margin:0 auto;direction:rtl;background:#fff;color:#0f172a;border:1.5px solid #cbd5e1;border-right:5px solid #1e3a8a;border-radius:12px;padding:10px 12px;box-shadow:0 8px 24px rgba(0,0,0,.18);font-weight:700;display:flex;gap:8px;align-items:center;flex-wrap:wrap}" +
      ".sx-kid-tip span{flex:1 1 200px}.sx-kid-tip button{font:inherit;font-weight:800;cursor:pointer;border-radius:10px;padding:7px 11px;border:0;background:#1e3a8a;color:#fff}.sx-kid-tip button.x{background:#fff;color:#475569;border:1px solid #cbd5e1}" +
      "@media print{.sx-kid-btn,.sx-kids,.sx-kid-tip{display:none!important}}";
    document.head.appendChild(st);
    var btns = [];
    function label() { var c = cur(); return "👤 " + c.n + (c.l && LV[c.l] ? " · " + LV[c.l] : ""); }
    function button() {
      var b = document.createElement("button");
      b.type = "button"; b.className = "sx-kid-btn"; b.textContent = label(); b.title = "من يتعلّم الآن على هذا الهاتف؟";
      b.onclick = open; btns.push(b); return b;
    }
    function go(k) {
      try { raw.s("math-kid", k.id); sessionStorage.setItem("math-opened", "1"); } catch (e) {}
      location.href = ROOT.href + (k.l ? "#" + k.l : "");
      if (!isPage) setTimeout(function () { location.reload(); }, 50);
    }
    function open() {
      var a = list(), c = curId(), ov = document.createElement("div"), del = null;
      ov.className = "sx-kids";
      function draw() {
        a = list();
        var h = '<div role="dialog" aria-label="من يتعلّم الآن؟"><h3>👪 من يتعلّم الآن على هذا الهاتف؟</h3>' +
          '<p>لكل ابن ملفّه: نقاطه ونجومه وأجوبته ومستواه، فلا تختلط النتائج بين الإخوة. المعطيات تبقى في هذا الهاتف فقط.</p>';
        a.forEach(function (k, i) {
          h += '<div class="row"><button type="button" class="k' + (k.id === c ? " on" : "") + '" data-i="' + i + '">' + (k.id === c ? "✓ " : "") + esc(k.n) +
            (k.l && LV[k.l] ? " <small>· السنة " + LV[k.l] + "</small>" : "") + '</button>' +
            (k.id && k.id !== c ? '<button type="button" class="d" data-d="' + i + '">' + (del === i ? "اضغط للتأكيد" : "🗑️ حذف") + '</button>' : "") + '</div>';
        });
        h += '<form><input name="n" maxlength="30" placeholder="اسم الابن (مثلا: أمينة)" autocomplete="off" required>' +
          '<select name="l" aria-label="المستوى"><option value="1m">السنة 1م</option><option value="2m">السنة 2م</option><option value="3m">السنة 3م</option><option value="4m">السنة 4م</option></select>' +
          '<button type="submit">➕ إضافة</button></form><button type="button" class="close">إغلاق</button></div>';
        ov.innerHTML = h;
        ov.querySelector("form").onsubmit = function (e) {
          e.preventDefault();
          var n = this.n.value.trim().slice(0, 30), l = this.l.value;
          if (!n) return;
          var id = String(Date.now() % 1e9), all = list();
          all.push({ id: id, n: n, l: l }); save(all);
          try { raw.s(pre(id) + "math-name", n); raw.s(pre(id) + "math-level", l); } catch (e2) {}
          go({ id: id, l: l });
        };
        ov.querySelector(".close").onclick = function () { ov.remove(); };
      }
      ov.onclick = function (e) {
        if (e.target === ov) return ov.remove();
        var k = e.target.closest("[data-i]"), d = e.target.closest("[data-d]");
        if (k) { var x = list()[+k.getAttribute("data-i")]; if (x.id === c) return ov.remove(); go(x); }
        else if (d) {
          var i = +d.getAttribute("data-d");
          if (del !== i) { del = i; return draw(); }
          var all = list(), gone = all.splice(i, 1)[0]; save(all);
          try { var p = pre(gone.id), ks = []; for (var j = 0; j < localStorage.length; j++) { var kk = localStorage.key(j); if (kk && kk.indexOf(p) === 0) ks.push(kk); } ks.forEach(function (kk) { (window.__kidRaw ? window.__kidRaw.r : function (q) { localStorage.removeItem(q); })(kk); }); } catch (e3) {}
          del = null; draw();
        }
      };
      draw();
      document.body.appendChild(ov);
    }
    /* keep the level of the child up to date, and on the index tell the parent once that each child can have a profile */
    function levelChanged(l) {
      var a = list(), c = curId(), me2 = null;
      a.forEach(function (k) { if (k.id === c) me2 = k; });
      if (!me2) { me2 = a[0]; }
      var old = me2.l; me2.l = l; save(a);
      btns.forEach(function (b) { b.textContent = label(); });
      if (old && old !== l && a.length < 2 && !raw.g("math-kid-tip")) {
        try { raw.s("math-kid-tip", "1"); } catch (e) {}
        var t = document.createElement("div");
        t.className = "sx-kid-tip"; t.setAttribute("role", "status");
        t.innerHTML = "<span>👪 هل لديك أكثر من ابن؟ أنشئ ملفًّا لكل واحد حتى لا تختلط نقاطهم وأجوبتهم.</span><button type='button' class='go'>👤 إنشاء ملف</button><button type='button' class='x'>✕</button>";
        t.querySelector(".go").onclick = function () { t.remove(); open(); };
        t.querySelector(".x").onclick = function () { t.remove(); };
        document.body.appendChild(t);
        setTimeout(function () { if (t.parentNode) t.remove(); }, 15000);
      }
    }
    if (!window.__kidRaw) return { button: button, open: open, levelChanged: function () {} , off: true };
    return { button: button, open: open, levelChanged: levelChanged, many: function () { return list().length > 1; } };
  })();
  window.__sxKids = KIDS;
  if (!isPage && !KIDS.off) {
    var heroK = document.querySelector("#hero .cta");
    var slotK = document.getElementById("hbtns");
    if (slotK) slotK.insertBefore(KIDS.button(), slotK.firstChild);
    else if (heroK) { var kb = KIDS.button(); kb.style.marginTop = "8px"; heroK.parentNode.insertBefore(kb, heroK.nextSibling); }
    document.addEventListener("click", function (e) { var lb = e.target.closest && e.target.closest("[data-level]"); if (lb) KIDS.levelChanged(lb.getAttribute("data-level")); }, true);
  }

  /* ---------- 0d. 📊 «تقريري» for the parents (2026-11-19 his ask «اضف زر تقريري لجميع المستويات لمتابعة الاولياء لابنائهم للتحكم في إستعمال الهاتف») ----------
     Time spent on the platform is counted ON THIS PHONE ONLY (localStorage "math-act", per child profile, nothing is sent anywhere):
     a minute counts only when the page is on the screen AND the pupil touched / scrolled / typed in the last 3 minutes.
     Per day: total seconds, seconds per hour of the day, and per page (seconds, openings, title, first and last time).
     The report page report.html reads it. A parent may set a daily limit and a bedtime (math-limit): the pupil then gets a
     calm reminder (not a lock), and the report shows the extra time. 400 days are kept (a whole school year). */
  (function () {
    if (/^report\.html$/.test(rel)) return;                 /* the parent reading the report is not the child's time */
    var AK = "math-act", TICK = 10000, IDLE = 180000, pending = 0, pendingH = {}, lastIn = Date.now(), opened = false, lastAlert = 0;
    function dayKey(t) { var d = new Date(t); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
    function rd() { try { var a = JSON.parse(localStorage.getItem(AK) || "null"); if (a && a.d) return a; } catch (e) {} return { v: 1, d: {} }; }
    function title() { return (document.title || "").split(" - ")[0].split(" | ")[0].trim().slice(0, 90); }
    var page = rel.replace(/index\.html$/, "") || "";
    ["pointerdown", "keydown", "scroll", "touchstart", "input", "wheel"].forEach(function (ev) {
      window.addEventListener(ev, function () { lastIn = Date.now(); }, { passive: true, capture: true });
    });
    function flush() {
      if (!pending && opened) return;
      try {
        var now = Date.now(), a = rd(), k = dayKey(now), day = a.d[k] || (a.d[k] = { s: 0, h: {}, p: {} });
        var p = day.p[page] || (day.p[page] = { s: 0, o: 0, t: "", f: now, l: now });
        if (!opened) { p.o++; opened = true; }
        p.s += pending; day.s += pending; p.l = now; p.t = title() || p.t;
        Object.keys(pendingH).forEach(function (h) { day.h[h] = (day.h[h] || 0) + pendingH[h]; });
        pending = 0; pendingH = {};
        var keys = Object.keys(a.d).sort();
        while (keys.length > 400) delete a.d[keys.shift()];
        localStorage.setItem(AK, JSON.stringify(a));
      } catch (e) {}
    }
    function lim() { try { return JSON.parse(localStorage.getItem("math-limit") || "null") || {}; } catch (e) { return {}; } }
    function remind() {
      var L = lim(), now = Date.now(), d = new Date(now), msg = "";
      if (!L.min && !L.bed) return;
      try { lastAlert = Math.max(lastAlert, +sessionStorage.getItem("math-limit-t") || 0); } catch (e) {}
      if (now - lastAlert < 10 * 60000 || document.querySelector(".sx-limit")) return;
      var today = 0; try { var a = rd(), x = a.d[dayKey(now)]; today = (x ? x.s : 0) + pending; } catch (e) {}
      var hr = d.getHours(), late = L.bed && (hr >= +L.bed || hr < 5);
      if (late) msg = "🌙 تجاوزت الساعة " + L.bed + ":00 التي حدّدها وليّك للتوقّف. النوم الكافي يساعدك على الفهم غدا.";
      else if (L.min && today >= L.min * 60) msg = "⏰ أكملت اليوم " + arN(Math.round(today / 60), "min") + "، وهو الوقت الذي حدّده وليّك (" + arN(L.min, "min") + "). أحسنت! خذ استراحة الآن.";
      if (!msg) return;
      lastAlert = now; try { sessionStorage.setItem("math-limit-t", String(now)); } catch (e) {}
      try { var a2 = rd(), k2 = dayKey(now), dd = a2.d[k2] || (a2.d[k2] = { s: 0, h: {}, p: {} }); dd.r = (dd.r || 0) + 1; localStorage.setItem(AK, JSON.stringify(a2)); } catch (e) {}
      var ov = document.createElement("div");
      ov.className = "sx-limit"; ov.setAttribute("role", "alertdialog");
      ov.style.cssText = "position:fixed;inset:0;z-index:5000;background:rgba(15,23,42,.55);display:flex;align-items:center;justify-content:center;padding:16px;direction:rtl;font-family:inherit";
      ov.innerHTML = '<div style="background:#fff;color:#0f172a;max-width:420px;width:100%;border-radius:16px;border-top:6px solid #1e3a8a;padding:16px 16px 14px;box-shadow:0 12px 30px rgba(0,0,0,.3);line-height:1.8;font-size:1.02rem">' +
        '<p style="margin:0 0 12px;font-weight:800"></p><button type="button" style="font:inherit;font-weight:800;cursor:pointer;border:0;border-radius:12px;padding:9px 14px;background:#1e3a8a;color:#fff;width:100%">حسنا 👍</button></div>';
      ov.querySelector("p").textContent = msg;
      ov.querySelector("button").onclick = function () { ov.remove(); };
      (document.body || document.documentElement).appendChild(ov);
    }
    function tick() {
      if (document.visibilityState === "visible" && Date.now() - lastIn < IDLE) {
        var s = TICK / 1000, h = new Date().getHours();
        pending += s; pendingH[h] = (pendingH[h] || 0) + s;
      }
    }
    setInterval(tick, TICK);
    setInterval(function () { flush(); remind(); }, 30000);
    document.addEventListener("visibilitychange", function () { if (document.visibilityState === "hidden") flush(); else { lastIn = Date.now(); remind(); } });
    window.addEventListener("pagehide", flush);
    setTimeout(function () { flush(); remind(); }, 1500);
    window.__sxAct = { flush: flush, tick: tick, remind: remind };
  })();

  /* ---------- 0e. opened inside the Facebook / Messenger / Instagram browser (2026-11-18 his ask) ----------
     That browser keeps no lasting memory: stars, marks and the streak can be lost when it closes.
     A small banner invites the pupil to open the same page in Chrome (Android) or Safari (iPhone). */
  (function () {
    var ua = navigator.userAgent || "";
    if (!/FBAN|FBAV|FB_IAB|FBIOS|FB4A|FBMD|Messenger|Instagram/i.test(ua)) return;
    try { if (sessionStorage.getItem("math-fbb") === "1") return; } catch (e) {}
    var ios = /iphone|ipad|ipod/i.test(ua), url = location.href.split("#")[0];
    function show() {
      var b = document.createElement("div");
      b.setAttribute("role", "note");
      b.style.cssText = "position:sticky;top:0;z-index:4000;direction:rtl;background:#fff7ed;color:#7c2d12;border-bottom:2px solid #fb923c;" +
        "padding:9px 12px;font-family:inherit;font-size:.9rem;line-height:1.6;box-shadow:0 2px 8px rgba(0,0,0,.12)";
      var btn = "font:inherit;font-weight:800;border-radius:9px;padding:5px 10px;cursor:pointer;text-decoration:none;display:inline-block;";
      var open = ios ? '<span style="font-weight:700">اضغط ⋯ أو ⬆️ في الأعلى، ثم «فتح في Safari» أو «فتح في المتصفح».</span>'
        : '<a href="intent://' + url.replace(/^https?:\/\//, "") + "#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=" + encodeURIComponent(url) + ';end" style="' + btn + 'background:#c2410c;color:#fff;border:0">🌐 افتح في Chrome</a>';
      b.innerHTML = '<div style="max-width:880px;margin:0 auto;display:flex;flex-wrap:wrap;gap:8px;align-items:center">' +
        '<span style="flex:1 1 220px">📘 أنت داخل متصفح فيسبوك: قد تضيع نجومك وعلاماتك عند إغلاقه. افتح المنصة في ' + (ios ? "Safari" : "Chrome") + " لتُحفظ على هاتفك.</span>" + open +
        '<button type="button" data-c="1" style="' + btn + 'background:#fff;color:#7c2d12;border:1.5px solid #fdba74">🔗 انسخ الرابط</button>' +
        '<button type="button" data-x="1" aria-label="إخفاء" style="' + btn + 'background:none;border:0;color:#7c2d12">✕</button></div>';
      b.addEventListener("click", function (e) {
        var t = e.target.closest ? e.target.closest("button") : null;
        if (!t) return;
        if (t.getAttribute("data-x")) { b.remove(); try { sessionStorage.setItem("math-fbb", "1"); } catch (er) {} return; }
        var done = function () { t.textContent = "✓ نُسخ: الصقه في Chrome"; };
        var old = function () {
          var ta = document.createElement("textarea"); ta.value = url; ta.setAttribute("readonly", ""); ta.style.cssText = "position:fixed;opacity:0";
          document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); } catch (er) {} ta.remove(); done();
        };
        try { navigator.clipboard.writeText(url).then(done, old); } catch (er) { old(); }
      });
      document.body.insertBefore(b, document.body.firstChild);
    }
    if (document.body) show(); else document.addEventListener("DOMContentLoaded", show);
  })();

  /* 📝 scratchpad styles: on the exercise pages (inside css below) and on the home page (2026-11-22 his report
     «في تمارين لا نهائية وتمرين اليوم وتحدي الشهادة لا تظهر المسودة»: plus.js opens the pad there through window.__sxPad) */
  var PADCSS = `
html.sx-noscroll,html.sx-noscroll body{overflow:hidden}
.sx-pad{position:fixed;inset:0;z-index:3500;background:#fff;display:flex;flex-direction:column;direction:rtl;font-family:inherit}
.sx-pad-top{display:flex;align-items:center;gap:8px;padding:8px 10px;border-bottom:1px solid #e2e8f0}
.sx-pad-top b{color:#1e3a8a;white-space:nowrap}
.sx-pad-top .t{flex:1;min-width:0;color:#475569;font-size:.85rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sx-pad-top button,.sx-pad-tools button{font:inherit;font-weight:800;cursor:pointer;border-radius:10px;padding:6px 10px;background:#fff;color:#1e293b;border:1.5px solid #cbd5e1;font-size:.86rem}
.sx-pad-tools{display:flex;gap:6px;flex-wrap:wrap;padding:6px 10px;border-bottom:1px solid #e2e8f0}
.sx-pad-tools .col{padding:4px 8px}
.sx-pad-tools .col i{display:block;width:18px;height:18px;border-radius:50%}
.sx-pad-tools .on{border-color:#1e3a8a;box-shadow:0 0 0 2px #c7d2fe}
.sx-pad-q{padding:4px 12px;border-bottom:1px solid #e2e8f0;font-size:.92rem}
.sx-pad-q summary{cursor:pointer;font-weight:800;color:#1e3a8a}
.sx-pad-q>div{max-height:34vh;overflow:auto;line-height:1.75}
.sx-pad-q p{margin:4px 0}
.sx-pad-q .pq{border-top:1px dashed #e2e8f0;padding:4px 0}
.sx-pad-q .pa{display:flex;gap:6px;margin:2px 0 4px}
.sx-pad-q .pa input{flex:1;min-width:0;font:inherit;font-size:1rem;padding:5px 8px;border:1.5px solid #cbd5e1;border-radius:8px;direction:ltr;text-align:center}
.sx-pad-q .pa button{font:inherit;font-weight:800;font-size:.82rem;cursor:pointer;border-radius:8px;padding:4px 9px;border:0;background:#1e3a8a;color:#fff;white-space:nowrap}
.sx-pad-q .pf{font-size:.82rem;color:#334155}
.sx-pad-q .pf.ok{color:#166534}.sx-pad-q .pf.no{color:#92400e}
.sx-pad-fab{position:fixed;right:12px;bottom:14px;z-index:2500;font:inherit;font-weight:800;cursor:pointer;border-radius:999px;padding:10px 14px;
  background:#fff;color:#1e3a8a;border:2px solid #1e3a8a;box-shadow:0 6px 18px rgba(0,0,0,.2)}
body.sx-exam .sx-pad-fab{bottom:74px}
@media print{.sx-pad-fab{display:none!important}}
body:has(#finalModal[style*="flex"]) .sx-pad-fab,body:has(#finalModal[style*="flex"]) .sx-calc-fab{display:none!important}
.sx-pad-area{flex:1;position:relative;touch-action:none;background-color:#fff;
  background-image:linear-gradient(#e0e7ff 1px,transparent 1px),linear-gradient(90deg,#e0e7ff 1px,transparent 1px);background-size:22px 22px}
.sx-pad-area canvas{position:absolute;inset:0;touch-action:none;cursor:crosshair}
.sx-pad-note{font-size:.78rem;color:#64748b;padding:5px 10px;border-top:1px solid #e2e8f0}
`;
  window.__sxPad = function (key, title, html) {
    if (!document.getElementById("sx-padcss")) { var ps = el("style", null, PADCSS); ps.id = "sx-padcss"; document.head.appendChild(ps); }
    openPad(key, title, null, html);
  };
  /* ---------- 🔘 floating check bar: shared helpers + the GENERIC bar (2026-11-23 his report «الزر العائم لا يظهر في جميع
     الأنشطة وفي الأنشطة التي يظهر فيها يغطي السؤال» + «اصلح جميع الانشطة تعمل بالزر العائم للتحقق»).
     barKit(): keeps the pupil's question and answer box in the visible part (under the top bar, above the floating bar and the
     phone keyboard), makes the bar compact while the keyboard is open and gives the page enough room at the bottom. ---------- */
  var BARKIT_CSS = "body.sx-kb .sx-1bar{padding:4px 10px!important;gap:6px}body.sx-kb .sx-1bar button{min-height:42px!important;padding:6px 12px!important;font-size:1.05rem!important}" +
    "body.sx-kb .sx-1bar button.skip{min-height:36px!important;font-size:.85rem!important}body.sx-kb .sx-1bar .n{font-size:.75rem}";
  function barKit(bar, getBox, titleSel) {
    if (!document.getElementById("sx-barkit")) { var s = el("style", null, BARKIT_CSS); s.id = "sx-barkit"; document.head.appendChild(s); }
    function hdr() {
      var h = 0;
      $$(".sticky-bar,.top,.sx-bar,header").forEach(function (e) {
        var p = getComputedStyle(e).position;
        if (p !== "sticky" && p !== "fixed") return;
        var r = e.getBoundingClientRect();
        if (r.top <= 2 && r.bottom > h && r.height < window.innerHeight / 3) h = r.bottom;
      });
      return h;
    }
    function typingIn() {
      var a = document.activeElement;
      if (!a || !/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) || a.disabled || a.type === "range" || a.type === "checkbox" || a.type === "radio") return null;
      if (a.closest && a.closest(".sx-1bar,.sx-pad,.sx-calc,.sx-wrap,.sx-ov,.px-1bar")) return null;
      return a;
    }
    /* force = scroll the current box into view even when nothing is focused (after «السؤال الموالي») */
    function fit(force) {
      var a = typingIn(), box = getBox ? getBox() : null;
      if (!a && !force) return;
      if (a && (!box || !box.contains(a))) box = a.closest(".q,.q-box,.question,[data-id],.card,section,fieldset") || a.parentElement;
      if (!box) return;
      var vv = window.visualViewport, vt = vv ? vv.offsetTop : 0;
      var top = vt + hdr() + 6, bottom = bar.getBoundingClientRect().top - 8;
      var t = ((titleSel && box.querySelector(titleSel)) || box).getBoundingClientRect();
      var r = (a || box).getBoundingClientRect();
      if (!a && r.height > bottom - top) r = { bottom: t.top + Math.min(r.height, 140) };   /* tall box: its start is enough */
      var dy = 0;
      if (t.top < top || r.bottom > bottom) dy = t.top - top;
      if (r.bottom - dy > bottom) dy = r.bottom - bottom;
      if (Math.abs(dy) > 4) window.scrollBy({ top: dy, behavior: "smooth" });
    }
    function lift() {
      var vv = window.visualViewport, hidden = vv ? window.innerHeight - (vv.height + vv.offsetTop) : 0, kb = hidden > 40;
      bar.style.bottom = kb ? hidden + "px" : "";      /* "" keeps the page's own bottom (exam mode bar sits higher) */
      document.body.classList.toggle("sx-kb", kb);
      /* room under the last question = bar (+ keyboard): the last answer box can always scroll above the bar */
      var need = bar.offsetHeight + (kb ? hidden : 0) + 18;
      if (bar.style.display !== "none" && need > 96) document.body.style.setProperty("padding-bottom", need + "px", "important");
      else document.body.style.removeProperty("padding-bottom");
      clearTimeout(lift.t); lift.t = setTimeout(function () { fit(false); }, 140);
    }
    if (window.visualViewport) { window.visualViewport.addEventListener("resize", lift); window.visualViewport.addEventListener("scroll", function () { clearTimeout(lift.s); lift.s = setTimeout(lift, 60); }); }
    window.addEventListener("resize", lift);
    window.addEventListener("focusin", function () { setTimeout(lift, 320); setTimeout(function () { fit(false); }, 650); });
    window.addEventListener("focusout", function () { setTimeout(lift, 320); });
    setTimeout(lift, 200);
    return { fit: fit, lift: lift };
  }

  /* the GENERIC bar: pages with their own engine and no bar yet (games «ألعاب», labs «مختبر», game lessons, old series/homework
     pages, olympiad training). It never changes the page's own logic: it presses the page's own buttons.
       ✔ تحقق       → the «تحقق» button of the question being worked on (nearest one on the screen if none is chosen)
       التالي ⬅     → the page's own «… التالي ←» button when it appears after a check (games)
       السؤال الموالي ⬅ → next question that is still open (pages with many questions)
       🏁 النتيجة    → when every question is done
     The page's own «تحقق» buttons stay where they are (these engines differ too much to hide them safely). */
  function genericBar() {
    if (document.querySelector(".sx-1bar")) return;
    if (store("sx-onebtn") === "0") return;
    if (/mu2allif|kharitat/.test(rel)) return;     /* the author tool and the lessons map are not quizzes */
    var CK = /تحق/, NX = /[←⬅]\s*$/;
    function txt(b) { return (b.textContent || "").replace(/\s+/g, " ").trim(); }
    function ours(b) { return !!(b.closest && b.closest(".sx-1bar,.sx-pad,.sx-calc,.sx-wrap,.sx-ov,.sx-modal-btns,.sx-desk,.sx-tools,#cert,.cert")); }
    function shown(b) {
      if (!b.offsetParent && getComputedStyle(b).position !== "fixed") return false;
      var r = b.getBoundingClientRect(); return r.width > 0 && r.height > 0;
    }
    function checks() { return $$("button").filter(function (b) { var t = txt(b); return CK.test(t) && t.length < 40 && !/مسبق|إجاباتي/.test(t) && !ours(b) && shown(b); }); }
    function nexts() { return $$("button").filter(function (b) { var t = txt(b); return NX.test(t) && t.length < 34 && !b.disabled && !ours(b) && shown(b) && !/^[◀▶←→⬅]$/.test(t); }); }
    var bar = null, num, B, cur = null, kit = null;
    function box(b) {
      if (!b) return null;
      var bx = b.closest(".q,.q-box,.q-block,.question,[data-id],.card,.mission,.step,section,fieldset") || b.parentElement;
      for (var k = 0; k < 3 && bx.parentElement && bx !== document.body; k++) {          /* a bare answer row: take its question too */
        var c = bx.cloneNode(true); $$("button,select,input,textarea", c).forEach(function (e) { e.parentNode.removeChild(e); });
        if (c.textContent.replace(/\s+/g, "").length >= 12) break;
        bx = bx.parentElement;
      }
      return bx;
    }
    /* a disabled «تحقق» is DONE only when nothing in its question can still be answered (inputs/choices disabled too);
       a disabled «تحقق» next to open choices = a game waiting for the pupil's choice */
    function locked(b) {
      if (!b.disabled) return false;
      var bx = box(b); if (!bx) return true;
      var F = $$("input,select,textarea", bx).filter(function (e) { return e.type !== "hidden" && !ours(e); });
      if (F.length) return !F.some(function (e) { return !e.disabled; });       /* answer boxes: open while one can still be typed in */
      return !$$("button", bx).some(function (e) {                                /* choice games: open while a choice can be pressed */
        var t = txt(e);
        return e !== b && !e.disabled && !ours(e) && !CK.test(t) && t.length > 2 && shown(e) && !/^[🔊⌫◀▶]/.test(t);
      });
    }
    function make() {
      var css = el("style");
      css.textContent = ".sx-1bar{position:fixed;left:0;right:0;bottom:0;z-index:2500;display:flex;gap:8px;align-items:center;justify-content:center;" +
        "padding:8px 12px calc(8px + env(safe-area-inset-bottom));background:rgba(255,255,255,.96);border-top:1px solid #cbd5e1;box-shadow:0 -4px 14px rgba(15,23,42,.12);direction:rtl}" +
        ".sx-1bar .n{font-size:.85rem;font-weight:800;color:#475569;white-space:nowrap;direction:ltr}" +
        ".sx-1bar button{flex:1;max-width:560px;font:inherit;font-weight:800;font-size:1.3rem;border:none;border-radius:14px;padding:15px 18px;min-height:58px;cursor:pointer;color:#fff;background:#1e3a8a;box-shadow:0 3px 0 rgba(15,23,42,.35)}" +
        ".sx-1bar button:active{transform:translateY(2px);box-shadow:none}.sx-1bar{transition:bottom .12s}" +
        ".sx-1bar button.next{background:#15803d}.sx-1bar button.end{background:#b45309}.sx-1bar button.wait{background:#64748b}" +
        "body.sx-1b{padding-bottom:96px!important}body.sx-1b .sx-upd{bottom:96px!important}body.sx-1b .sx-pad-fab,body.sx-1b .sx-calc-fab{bottom:80px!important}" +
        "body.sx-kb .sx-pad-fab,body.sx-kb .sx-calc-fab{display:none!important}body.sx-1b .sx-gcur{outline:2.5px solid #38bdf8;outline-offset:3px;border-radius:10px}" +
        ".sx-toast{position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:5000;max-width:min(92vw,520px);direction:rtl;background:#fff;color:#0f172a;border:1.5px solid #cbd5e1;border-right:5px solid #0f766e;border-radius:12px;padding:10px 14px;font-weight:700;box-shadow:0 8px 24px rgba(0,0,0,.18);transition:opacity .5s}.sx-toast.out{opacity:0}" +
        "html.sx-dark .sx-1bar{background:rgba(15,23,42,.96);border-color:#334155}html.sx-dark .sx-1bar .n{color:#cbd5e1}" +
        "@media print{.sx-1bar{display:none!important}}";
      document.head.appendChild(css);
      bar = el("div", "sx-1bar sx-1gen"); num = el("span", "n"); B = el("button");
      B.type = "button"; bar.appendChild(num); bar.appendChild(B); document.body.appendChild(bar);
      document.body.classList.add("sx-1b");
      B.addEventListener("mousedown", function (e) { e.preventDefault(); });   /* the keyboard stays open */
      B.onclick = press;
      kit = barKit(bar, function () { return box(cur); }, ".qt,.q-title,h3,h4,.question-text,.q-text,p");
    }
    /* the question the pupil is on: the one he touched, else the first open one on the screen, else the first open one */
    function pick(C) {
      if (cur && C.indexOf(cur) >= 0) return cur;   /* a finished question stays current until «السؤال الموالي» takes the pupil on */
      var open = C.filter(function (b) { return !locked(b); });
      var bt = bar ? bar.getBoundingClientRect().top : window.innerHeight;
      var onScreen = open.filter(function (b) { var r = box(b).getBoundingClientRect(); return r.bottom > 60 && r.top < bt; });
      return onScreen[0] || open[0] || C[0] || null;
    }
    function state() {
      var C = checks(), N = nexts();
      if (!C.length && !N.length) return null;
      cur = pick(C);
      var open = C.filter(function (b) { return !locked(b); });
      if (cur && !cur.disabled) return { k: "check" };
      if (cur && !locked(cur)) return { k: "wait" };   /* a game whose «تحقق» waits for a choice */
      if (N.length) return { k: "next", b: N[N.length - 1] };
      if (open.length) return { k: "move", b: open.filter(function (b) { return !cur || (cur.compareDocumentPosition(b) & 4); })[0] || open[0] };
      if (C.length > 1) return { k: "end" };
      return { k: "wait" };
    }
    function show() {
      var s = state();
      if (!s) { if (bar) { bar.style.display = "none"; document.body.classList.remove("sx-1b"); kit.lift(); } return; }
      if (!bar) make();
      if (bar.style.display === "none") { bar.style.display = ""; document.body.classList.add("sx-1b"); kit.lift(); }
      var C = checks();
      var gb = C.length > 1 && cur ? box(cur) : null;      /* change the outline only when the question changes (no observer loop) */
      if (gb !== show.gb) { if (show.gb) show.gb.classList.remove("sx-gcur"); if (gb) gb.classList.add("sx-gcur"); show.gb = gb; }
      var done = C.filter(locked).length;
      num.textContent = C.length > 1 ? (Math.min(C.indexOf(cur) + 1, C.length) + " / " + C.length) : "";
      num.style.display = num.textContent ? "" : "none";
      if (s.k === "check") { B.className = ""; B.textContent = "✔ تحقق"; }
      else if (s.k === "wait") { B.className = "wait"; B.textContent = "✔ تحقق"; }
      else if (s.k === "next") { B.className = "next"; B.textContent = txt(s.b).replace(/\s*[←⬅]\s*$/, "") + " ⬅"; }
      else if (s.k === "move") { B.className = "next"; B.textContent = "السؤال الموالي ⬅"; }
      else { B.className = "end"; B.textContent = "🏁 النتيجة"; }
      B.title = done + " / " + C.length;
    }
    function go(b) {
      cur = b; var bx = box(b);
      var inp = bx && bx.querySelector("input:not([disabled]):not([type=range]):not([type=checkbox]):not([type=radio]),select:not([disabled]),textarea:not([disabled])");
      bx.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(function () { if (inp) { try { inp.focus({ preventScroll: true }); } catch (e) {} } kit.fit(true); show(); }, 380);
    }
    function press() {
      var s = state(); if (!s) return;
      if (s.k === "check") { cur.click(); setTimeout(show, 150); setTimeout(show, 700); return; }
      if (s.k === "wait") { toast("👆 أجب أولا (اختر أو اكتب جوابك)، ثم اضغط «تحقق»."); var bx = box(cur); if (bx) bx.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
      if (s.k === "next") { s.b.click(); cur = null; setTimeout(function () { show(); var c = checks()[0]; if (c) kit.fit(true); }, 350); return; }
      if (s.k === "move") { go(s.b); return; }
      var end = document.querySelector("#finalModal,#result,.result,.final,#score,.score-card");
      if (end && end.offsetParent) end.scrollIntoView({ behavior: "smooth", block: "center" });
      else window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }
    document.addEventListener("focusin", function (e) {
      if (!bar || (e.target.closest && e.target.closest(".sx-1bar"))) return;
      var C = checks();
      for (var i = 0; i < C.length; i++) if (box(C[i]) && box(C[i]).contains(e.target)) { cur = C[i]; break; }
      show();
    });
    document.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest(".sx-1bar")) return;
      var C = checks();
      for (var i = 0; i < C.length; i++) if (C[i] === e.target.closest("button") || (box(C[i]) && box(C[i]).contains(e.target))) { cur = C[i]; break; }
      setTimeout(show, 160);
    }, true);
    document.addEventListener("keyup", function () { clearTimeout(show.k); show.k = setTimeout(show, 120); });
    if (window.MutationObserver) new MutationObserver(function (m) {
      for (var i = 0; i < m.length; i++) if (bar && bar.contains(m[i].target)) return;
      clearTimeout(show.t); show.t = setTimeout(show, 150);
    }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["disabled", "style", "class", "hidden"] });
    show();
  }
  if (/^olymp\/g/.test(rel)) onReady(function () { setTimeout(genericBar, 700); });

  var pm = rel.match(/^([1-4]m)\/(?:(t[1-3])\/([a-z0-9]+)|(bem))\//);
  window.__sxGenBank = genBank;
  if (!pm) { initDaily(); return; }
  var level = pm[1], term = pm[2] || "t1", section = pm[3] || pm[4];
  var home = ROOT.href + "#" + level + "-" + term;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function fmt(n) { return String(Math.round(n * 100) / 100).replace(".", ","); }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  /* ---------- 0d. Arabic number + counted noun in texts the pages write themselves (2026-11-18 his remark «10 سؤالا، 3 سؤالا، 1 وضعية…»)
     Old pages write «⭐ 5 نجمة» or «بعد 3 دقيقة»: fixed here when they appear, without touching the pages. ---------- */
  (function () {
    var RX = [[/(⭐\s*)(\d+) نجمة/g, "star"], [/(بعد |خلال |حوالي )(\d+) دقيقة/g, "min"], [/()(\d+) سؤالا/g, "q"]];
    function fix(t) {
      var v = t.nodeValue, w = v;
      if (!/\d/.test(v)) return;
      RX.forEach(function (r) { w = w.replace(r[0], function (all, pre, n) { return pre + arN(+n, r[1], r[1] === "min"); }); });
      if (w !== v) t.nodeValue = w;
    }
    function walk(n) {
      if (n.nodeType === 3) return fix(n);
      if (n.nodeType !== 1 || /^(SCRIPT|STYLE|TEXTAREA|INPUT)$/.test(n.nodeName)) return;
      var tw = document.createTreeWalker(n, 4), t;
      while ((t = tw.nextNode())) fix(t);
    }
    function start() {
      walk(document.body);
      try {
        new MutationObserver(function (ms) {
          ms.forEach(function (m) { if (m.type === "characterData") fix(m.target); else Array.prototype.forEach.call(m.addedNodes, walk); });
        }).observe(document.body, { childList: true, subtree: true, characterData: true });
      } catch (e) {}
    }
    if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);
  })();

  /* ---------- 0e. Arabic text inside a left-to-right box (2026-11-22 his remark «الكتابة بالغتين مختلطة لا يفهمها التلميذ»)
     Many pages give buttons, chips and answer lines «direction:ltr» so that maths reads well. When such a box holds an
     Arabic sentence («نرسم [E′F′] طولها EF») the words come out in the wrong order. Here: a ltr box whose own text has
     Arabic letters becomes rtl and its names/calculations are isolated ltr; a ltr row made only of such boxes (the
     chosen steps «… ثم …») becomes rtl too. Boxes with only numbers or maths (1 < 2 < 3, AB = 3 cm), keypads and rows
     of number cards stay exactly as they are. ---------- */
  (function () {
    var AR = /[؀-ۿݐ-ݿﭐ-﷿ﹰ-ﻼ]/;
    var SKIP = "script,style,textarea,input,select,svg,math,.m,.mb,.math,.sx-m,.key,.vop,.eq,.v,.screen";
    var RUN = /[A-Za-z0-9\[(√−][A-Za-z0-9\[\]()′″'’=+\-−×÷<>≤≥≠\/.,²³°√ ]*[A-Za-z0-9\])′″'’²³°]|[A-Za-z]/g;
    var NEED = /[A-Za-z\[\]()=+−×÷<>≤≥≠√]/; /* plain numbers read well in rtl; names and calculations do not */
    var st = document.createElement("style");
    st.textContent = ".sx-ar{direction:rtl!important;unicode-bidi:isolate}.sx-m{direction:ltr;unicode-bidi:isolate;white-space:nowrap}";
    (document.head || document.documentElement).appendChild(st);
    function ltr(e) { try { return getComputedStyle(e).direction === "ltr"; } catch (x) { return false; } }
    function isolate(t) {
      var s = t.nodeValue, m, last = 0, hit = false, out = document.createDocumentFragment();
      RUN.lastIndex = 0;
      while ((m = RUN.exec(s))) {
        if (!NEED.test(m[0])) continue;
        hit = true;
        out.appendChild(document.createTextNode(s.slice(last, m.index)));
        var sp = document.createElement("span"); sp.className = "sx-m"; sp.textContent = m[0]; out.appendChild(sp);
        last = m.index + m[0].length;
      }
      if (!hit || !t.parentNode) return;
      out.appendChild(document.createTextNode(s.slice(last)));
      t.parentNode.replaceChild(out, t);
    }
    /* a row turns only when it holds at least two pieces and every piece is Arabic */
    function allAr(p) {
      try { if (/grid/.test(getComputedStyle(p).display)) return false; } catch (x) { return false; }
      var k = Array.prototype.filter.call(p.children, function (c) { return c.textContent.trim(); });
      return k.length >= 2 && k.every(function (c) { return AR.test(c.textContent); });
    }
    function flip(e) {
      if (e.classList.contains("sx-ar")) return;
      e.classList.add("sx-ar");
      var tw = document.createTreeWalker(e, 4, { acceptNode: function (n) { return NEED.test(n.nodeValue) && !n.parentElement.closest(SKIP) ? 1 : 3; } }), t, l = [];
      while ((t = tw.nextNode())) l.push(t);
      l.forEach(isolate);
      var p = e.parentElement;
      if (p && p !== document.body && !e.classList.contains("lt") && !p.classList.contains("sx-ar") && ltr(p) &&
          !p.querySelector("input,textarea,select,svg,canvas,table,.key") && allAr(p)) flip(p);
    }
    function scan(root) {
      if (!root || root.nodeType !== 1 || !root.isConnected || root.closest(SKIP)) return;
      var tw = document.createTreeWalker(root, 4, {
        acceptNode: function (n) { var p = n.parentElement; return p && !p.closest(SKIP) && AR.test(n.nodeValue) ? 1 : 3; }
      }), t, seen = [];
      while ((t = tw.nextNode())) { var p = t.parentElement; if (seen.indexOf(p) < 0) seen.push(p); }
      seen.forEach(function (p) { if (!p.closest(".sx-ar") && ltr(p)) flip(p); });
      /* a row whose pieces were already turned one by one (the chosen steps redrawn) */
      Array.prototype.forEach.call(root.querySelectorAll(".sx-ar"), function (e) {
        var p = e.parentElement;
        if (p && p !== document.body && !p.classList.contains("sx-ar") && !e.classList.contains("lt") && ltr(p) &&
            !p.querySelector("input,textarea,select,svg,canvas,table,.key") && allAr(p)) flip(p);
      });
    }
    var queue = [], busy = false;
    function later(n) {
      queue.push(n);
      if (busy) return; busy = true;
      (window.requestAnimationFrame || setTimeout)(function () { busy = false; var q = queue; queue = []; q.forEach(scan); });
    }
    function start() {
      scan(document.body);
      try {
        new MutationObserver(function (ms) {
          ms.forEach(function (m) { Array.prototype.forEach.call(m.addedNodes, function (n) { later(n.nodeType === 3 ? n.parentElement : n); }); });
        }).observe(document.body, { childList: true, subtree: true });
      } catch (e) {}
    }
    if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);
  })();

  /* ---------- styles ---------- */
  var css = `
.sx-bar{direction:rtl;display:flex;align-items:center;gap:8px;flex-wrap:wrap;max-width:880px;margin:0 auto;padding:8px 12px;font-family:inherit;font-size:.86rem}
.sx-home,.sx-btn{display:inline-flex;align-items:center;gap:5px;font:inherit;font-weight:800;text-decoration:none;cursor:pointer;
  color:#1e3a8a;background:#fff;border:1.5px solid #c7d2fe;border-radius:10px;padding:5px 11px;line-height:1.4;box-shadow:0 1px 3px rgba(0,0,0,.06)}
.sx-home:hover,.sx-btn:hover{background:#eef2ff}
.sx-foot{justify-content:center;padding:14px 12px 72px}
.sx-top1{flex-wrap:nowrap;padding:6px 12px}
.sx-top1>.sx-btn{padding:5px 9px}
.sx-top1>.sx-home{margin-left:auto}
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
.sx-calc .k button.d{background:#334155}.sx-calc .k button.op{background:#475569;font-size:1.1rem}
.sx-calc .k button.eq{background:#f59e0b;color:#111827;font-size:1.1rem}.sx-calc .k button.w3{grid-column:span 3}
.sx-calc .k button.cl{background:#7f1d1d}.sx-calc .k button{padding:7px 2px;font-size:1rem}.sx-calc .k{gap:5px}
.sx-calc .r.er{color:#fca5a5}.sx-calc [hidden]{display:none!important}
.sx-calc .r{margin-top:8px;padding:8px 10px;border-radius:10px;background:#1e293b;color:#7dd3fc;font-weight:800;direction:ltr;text-align:left;min-height:1.6em}
.sx-calc .n{font-size:.74rem;color:#94a3b8;margin-top:6px}
/* clearer text, calm colours (his asks 2026-11-15: «الكتابة واضحة», then «نقص شوي من الألوان») */
body.sx-ex{font-size:17px}
/* 2026-11-21 his ask «لون الأسئلة أسود داكن»: questions and statements in deep black, a little bolder */
body.sx-ex .q-title,body.sx-ex .q-title > span{font-size:1.1rem;color:#000!important;font-weight:700;line-height:1.75}
body.sx-ex .context-box,body.sx-ex .context-box *:not(.math):not(svg *){color:#000!important}
body.sx-ex .context-box{font-size:1.06rem;line-height:1.85;font-weight:600}
body.sx-ex .math{font-size:1.02em;font-weight:700;color:#000}
#app .q .qt,#app .q .qt *:not(.qp):not(svg *){color:#000!important}#app .q .qt{font-weight:700!important}#app .intro{color:#111827!important}
/* 2026-11-21 his «والتمارين»: the games (al3ab) and station lessons (dars) write all their text with var(--ink) → deep black there too */
body.sx-ink0{--ink:#000!important}
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
/* white sheet, coloured edges only (his ask 2026-11-16 «الحل يكون على ورقة بيضاء ملونة الحواف فقط») */
body.sx-ex .card-header{background:#fff;border:1px solid #e2e8f0;border-right:4px solid #1e3a8a}
body.sx-ex .context-box{background:#fff;border:1.5px dashed #94a3b8}
body.sx-ex .q-box,body.sx-ex .q-box.solved,body.sx-ex .q-box.failed{background:#fff}
body.sx-ex .q-box.solved{border-color:#bbf7d0}
body.sx-ex .q-box.failed{border-color:#fecaca}
body.sx-ex .model-solution{background:#fff;border:1px solid #cbd5e1;border-right:4px solid #0f766e}
body.sx-ex .sol-result{background:#fff;border:1px solid #bfdbfe;border-right:4px solid #1e3a8a}
body.sx-ex .sol-line.sx-rule{background:#fffbeb;border:1px solid #fde68a;border-right:4px solid #d97706;border-radius:8px;padding:6px 10px;margin:4px 0 6px;color:#713f12}
body.sx-ex .sol-line.sx-rule b{color:#b45309}
body.sx-ex .math{background:#f1f5f9}
body.sx-ex .sx-chip{background:#fff;color:#334155;border-color:#cbd5e1}
body.sx-ex .sx-chip.u{background:#fff;color:#334155;border-color:#94a3b8}
body.sx-ex .sx-chip.u.sit{background:#fffbeb;color:#92400e;border-color:#f59e0b}
.sx-unit-warn{margin-top:6px;padding:6px 10px;border-radius:8px;background:#fffbeb;color:#92400e;border:1px solid #fde68a;border-right:4px solid #d97706;font-weight:700}
html.sx-dark{filter:invert(.9) hue-rotate(180deg);background:#fff}
html.sx-dark img,html.sx-dark video,html.sx-dark canvas,html.sx-dark .sx-pad-area,html.sx-dark .fly-star,html.sx-dark .star-burst{filter:invert(1) hue-rotate(180deg)}
html.sx-dark .sx-pad-area canvas{filter:none}
html.sx-dark body>header,html.sx-dark .hero{filter:invert(1) hue-rotate(180deg)}
@media print{html.sx-dark{filter:none}}
@media print{.sx-bar,.sx-calc,.sx-calc-fab,.sx-ov,.sx-step,.sx-chips,.sx-choices{display:none!important}}
/* 2026-11-16 tools: calm look, white sheet, coloured edges only */
.sx-toast{position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:5000;max-width:min(92vw,520px);direction:rtl;background:#fff;color:#0f172a;
  border:1.5px solid #cbd5e1;border-right:5px solid #0f766e;border-radius:12px;padding:10px 14px;font-weight:700;box-shadow:0 8px 24px rgba(0,0,0,.18);transition:opacity .5s}
.sx-toast.out{opacity:0}
.sx-tools{display:flex;gap:6px;flex-wrap:wrap;margin:-4px 0 12px}
.sx-tool,.sx-gen-btn{font:inherit;font-weight:800;font-size:.86rem;cursor:pointer;border-radius:10px;padding:5px 11px;background:#fff;color:#1e3a8a;border:1.5px solid #c7d2fe}
.sx-tool:hover,.sx-gen-btn:hover{background:#eef2ff}
.sx-gen-btn{display:block;margin:8px 0 2px;border-color:#99f6e4;color:#115e59}
.sx-say{font:inherit;font-size:.82rem;line-height:1.5;cursor:pointer;border-radius:8px;padding:0 6px;margin-inline-end:6px;background:#fff;border:1px solid #cbd5e1;vertical-align:middle}
.sx-say.on{border-color:#0f766e;box-shadow:0 0 0 2px #ccfbf1}
${PADCSS}
.sx-dlg{max-width:520px!important;margin-top:8vh}
.sx-dlg p{margin:8px 0;line-height:1.7}
.sx-list{margin:6px 0 10px;padding-inline-start:20px;line-height:1.75}
.sx-lbl{font-weight:800;margin:6px 0 4px}
.sx-durs{display:flex;gap:6px;flex-wrap:wrap}
.sx-durs button{font:inherit;font-weight:800;cursor:pointer;border-radius:10px;padding:7px 11px;background:#fff;color:#1e293b;border:1.5px solid #cbd5e1}
.sx-durs button.on{border-color:#1e3a8a;background:#eef2ff;color:#1e3a8a}
.sx-warn{background:#fffbeb;border:1px solid #fde68a;border-right:4px solid #d97706;border-radius:8px;padding:6px 10px;color:#92400e;font-weight:700}
.sx-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
.sx-main{flex:1;font:inherit;font-weight:800;cursor:pointer;border-radius:12px;padding:11px 14px;border:0;background:#1e3a8a;color:#fff;font-size:1rem}
.sx-exbar{position:fixed;left:0;right:0;bottom:0;z-index:2700;direction:rtl;display:flex;align-items:center;gap:8px;flex-wrap:nowrap;justify-content:space-between;
  background:#fff;border-top:1.5px solid #cbd5e1;border-right:6px solid #1e3a8a;padding:8px 12px;box-shadow:0 -6px 18px rgba(0,0,0,.08);font-weight:800}
.sx-exbar .tm{font-size:1.25rem;color:#1e3a8a;direction:ltr;unicode-bidi:isolate}
.sx-exbar.warn{border-right-color:#dc2626}
.sx-exbar.warn .tm{color:#b91c1c}
.sx-exbar .ct{color:#475569;font-size:.8rem;flex:1;min-width:0;line-height:1.3}
.sx-exbar button{font:inherit;font-weight:800;cursor:pointer;border-radius:10px;padding:8px 12px;border:0;background:#1e3a8a;color:#fff;white-space:nowrap}
body.sx-exam{padding-bottom:64px}
body.sx-exam .model-solution,body.sx-exam .sx-resume,body.sx-exam .sx-gen-btn,body.sx-exam .sol-btn,body.sx-exam .sol-wait{display:none!important}
body.sx-exam .sx-calc-fab{bottom:74px}
.feedback-box.sx-exnote{display:block;background:#fff;border:1px solid #cbd5e1;border-right:4px solid #1e3a8a;color:#1e293b}
.sx-choice.sel{border-color:#1e3a8a;background:#eef2ff;color:#1e3a8a;box-shadow:0 0 0 2px #c7d2fe}
.sx-chal{direction:rtl;max-width:860px;margin:10px auto 0;padding:10px 12px;border-radius:12px;background:#fff;border:1.5px solid #cbd5e1;border-right:5px solid #d97706;color:#78350f;font-weight:800}
.sx-report .r small{display:block;font-size:.76rem;font-weight:700;color:#475569}
.sx-report .r.ok,.sx-report .r.mid,.sx-report .r.low{background:#fff;border:1px solid #e2e8f0}
.sx-report .r.ok{border-right:4px solid #16a34a}
.sx-report .r.mid{border-right:4px solid #d97706}
.sx-report .r.low{border-right:4px solid #dc2626}
.sx-report .acts{display:flex;gap:6px;flex-wrap:wrap;margin:-1px 0 8px;padding-inline-start:8px}
.sx-report .acts button,.sx-report .acts a{font:inherit;font-size:.8rem;font-weight:800;cursor:pointer;border-radius:8px;padding:3px 9px;background:#fff;color:#1e3a8a;border:1px solid #c7d2fe;text-decoration:none}
.sx-report .acts .rem{display:contents}
.sx-sharecard input{flex:1 1 120px}
.sx-sharecard button.ch{background:#fff;color:#92400e;border:1.5px solid #f59e0b}
.sx-gen{max-width:640px!important}
.sx-gen .sx-note{margin:4px 0 8px;font-size:.84rem;color:#475569}
.sx-gq{font-size:1.06rem;line-height:1.9;margin:6px 0 8px;font-weight:700}
.sx-gq .math,.sx-gen .sol-line .math,.sx-gen .sol-result .math{direction:ltr;unicode-bidi:isolate;display:inline-block;background:#f1f5f9;border-radius:6px;padding:0 5px}
.sx-gin{display:flex;gap:8px;flex-wrap:wrap}
.sx-gin input{flex:1 1 160px;font:inherit;font-size:1.15rem;padding:10px 12px;min-height:46px;border-radius:10px;border:1.5px solid #cbd5e1;direction:ltr;text-align:center;box-sizing:border-box}
.sx-gin .btn-check{font:inherit;font-weight:800}
.sx-gen .sym-toolbar{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0;direction:ltr}
.sx-gen .sym-btn{min-width:42px;min-height:40px;font-size:1.1rem;border-radius:10px;cursor:pointer;background:#fff;border:1.5px solid #cbd5e1}
.sx-gen .feedback-box{margin-top:8px}
.sx-gen .feedback-box:empty{display:none}
.sx-gsol{margin-top:10px;background:#fff;border:1px solid #cbd5e1;border-right:4px solid #0f766e;border-radius:10px;padding:8px 12px;line-height:1.85}
.sx-ov .sx-sheet .sx-gsol h4{margin:0 0 6px;color:#0f766e;text-decoration:none}
.sx-gsol .sol-line.sx-rule{background:#fffbeb;border:1px solid #fde68a;border-right:4px solid #d97706;border-radius:8px;padding:6px 10px;margin:4px 0 6px;color:#713f12}
.sx-gsol .sol-result{border-right:4px solid #1e3a8a;padding:4px 8px;margin-top:4px}
.sx-vert{font-family:"Courier New",monospace;font-size:1.05rem;line-height:1.35;background:#fff;border:1px dashed #94a3b8;border-radius:8px;padding:6px 12px;display:inline-block;margin:4px 0}
.sx-gen .fr{display:inline-flex;flex-direction:column;vertical-align:middle;text-align:center;line-height:1.05;margin:0 2px;font-size:.92em}
.sx-gen .fr>span:first-child{border-bottom:1.5px solid currentColor;padding:0 3px}
@media print{.sx-foot,.sx-tools,.sx-gen-btn,.sx-say,.sx-exbar,.sx-pad,.sx-chal,.sx-toast{display:none!important}}
`;
  document.head.appendChild(el("style", null, css));

  /* ---------- 1. bar «🏠 الفهرس» ---------- */
  var bar = el("nav", "sx-bar");
  bar.setAttribute("aria-label", "التنقل");
  /* colleague's remark 2026-11-17 «على قد ما تنقصوا معلومات في صفحة يركز في حاجة وحدة»: ONE short row at the top.
     The level/term crumb repeated the page header, so it is gone; tools are icons only (title = tooltip). */
  bar.classList.add("sx-top1");
  bar.innerHTML = '<a class="sx-home" href="' + home + '" title="' + LEVEL[level] + " · " + TERM[term] + " · " + (SECTION[section] || "") + '">🏠 الرئيسية</a>';
  document.body.insertBefore(bar, document.body.firstChild);
  /* his ask 2026-11-17 «اضف زر الصفحة الاساسية في الاعلى والاسفل»: the same home button again at the bottom of every page */
  var foot = el("nav", "sx-bar sx-foot");
  foot.setAttribute("aria-label", "العودة");
  foot.innerHTML = '<a class="sx-home" href="' + home + '">🏠 الصفحة الرئيسية</a><a class="sx-btn" href="#" onclick="window.scrollTo({top:0,behavior:\'smooth\'});return false">⬆️ أعلى الصفحة</a><a class="sx-btn" href="' + ROOT.href + 'report.html" title="تقرير المتابعة للأولياء">📊 تقريري</a><a class="sx-btn" href="' + ROOT.href + 'awards.html" title="شهادات التقدير">🏅 شهاداتي</a>';
  document.body.appendChild(foot);
  var padB = el("button", "sx-btn", "📝");
  padB.type = "button"; padB.title = "مسودة الحساب: اكتب بإصبعك"; padB.setAttribute("aria-label", "مسودة");
  padB.onclick = function () { openPad("page", document.title.split(" - ")[0]); };
  bar.appendChild(padB);
  /* 🌙 / ☀️ night or day (his ask 2026-11-16 «اجعل اللون ليلي او نهاري») */
  var thB = el("button", "sx-btn sx-theme", "");
  thB.type = "button";
  function thPaint() { var d = document.documentElement.classList.contains("sx-dark"); thB.textContent = d ? "☀️" : "🌙"; thB.title = d ? "الوضع النهاري" : "الوضع الليلي"; }
  thB.onclick = function () {
    var d = !document.documentElement.classList.contains("sx-dark");
    document.documentElement.classList.toggle("sx-dark", d);
    store("math-theme", d ? "dark" : "light");
    thPaint();
  };
  if (store("math-theme") === "dark") document.documentElement.classList.add("sx-dark");
  thPaint();
  bar.appendChild(thB);
  /* the child button only when the phone has 2+ child profiles (one row, less information); profiles stay reachable from the home page */
  if (!KIDS.off && KIDS.many && KIDS.many()) { var kidB = KIDS.button(); kidB.classList.add("sx-btn"); bar.appendChild(kidB); }

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
    var first = old.f != null ? old.f : old.d ? old.b || 0 : r.d ? r.s : null;   /* first finished mark (🏅 «شهادة القفزة النوعية», cert.js) */
    all[rel] = { s: r.s, m: r.m, st: r.st, a: r.a, n: r.n, d: !!(r.d || old.d), b: best, t: Date.now() };
    if (first != null) all[rel].f = first;
    store(KEY, JSON.stringify(all));
  }
  setInterval(save, 1500);
  document.addEventListener("click", function () { setTimeout(save, 400); }, true);
  window.addEventListener("pagehide", save);

  /* ---------- 2b. the level is saved on the phone BY ITSELF (2026-11-18 his ask) ----------
     Most pupils will never press «📥 حفظ تمارين هذا المستوى». So, once the pupil has worked on 4 pages of the
     same level, all the pages of that level are fetched quietly in the background (sw.js keeps them), and they open
     without internet. Afterwards only new or corrected pages are fetched again (the "mod" date in files.json).
     Not done without a connection, or when the phone is in data-saver mode. Sizes: 1.6 to 3.5 MB per level. */
  var OFFK = "math-offline", OFF_MIN = 4, offBusy = false;
  function autoOffline() {
    if (offBusy) return;
    try {
      if (!("serviceWorker" in navigator) || !navigator.serviceWorker.controller || navigator.onLine === false) return;
      var cn = navigator.connection;
      if (cn && (cn.saveData || /(^|-)2g$/.test(cn.effectiveType || ""))) return;
      var all = readAll(), n = 0;
      Object.keys(all).forEach(function (k) { var r = all[k]; if (k.indexOf(level + "/") === 0 && r && (r.a > 0 || r.s > 0)) n++; });
      if (n < OFF_MIN) return;
      var saved = {}; try { saved = JSON.parse(store(OFFK) || "{}") || {}; } catch (e) {}
      var mine = saved[level] || {};
      if (mine.v && mine.v === VER) return;            /* already checked for this version of the site */
      offBusy = true;
      fetch(ROOT.href + "files.json", { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
        if (!j || !j.items) { offBusy = false; return; }
        var list = j.items.filter(function (it) { return it.level === level && it.type === "html"; });
        var todo = list.filter(function (it) { return !mine.p || mine.p[it.url] !== (it.mod || it.date || "1"); });
        var first = !mine.p, done = {}, fail = 0, extra = {};
        for (var u in (mine.p || {})) done[u] = mine.p[u];
        var i = 0;
        function next() {
          if (navigator.onLine === false) return finish();
          var part = todo.slice(i, i + 3); i += 3;
          if (!part.length) return finish();
          Promise.all(part.map(function (it) {
            return fetch(ROOT.href + it.url, { cache: "no-cache" }).then(function (r) {
              if (!r.ok) throw 0;
              return r.text().then(function (t) {
                (t.match(/assets\/[\w.\/-]+\.js(?:\?v=[\w-]+)?/g) || []).forEach(function (a) { extra[a] = 1; });
                done[it.url] = it.mod || it.date || "1";
              });
            }).catch(function () { fail++; });
          })).then(function () { setTimeout(next, 300); });
        }
        function finish() {
          Object.keys(extra).forEach(function (a) { fetch(ROOT.href + a).catch(function () {}); });
          saved[level] = { v: fail ? "" : VER, p: done };
          store(OFFK, JSON.stringify(saved));
          offBusy = false;
          if (first && !fail && todo.length) toast("✓ حُفظت تمارين " + LEVEL[level] + " على هاتفك: تفتح الآن حتى دون إنترنت.");
        }
        if (!todo.length) { saved[level] = { v: VER, p: done }; store(OFFK, JSON.stringify(saved)); offBusy = false; return; }
        next();
      }).catch(function () { offBusy = false; });
    } catch (e) { offBusy = false; }
  }
  /* after the page is calm (the pupil is reading), never while it is loading */
  setTimeout(autoOffline, 8000);
  document.addEventListener("click", function () { setTimeout(autoOffline, 2500); }, true);

  /* ---------- 2c. no automatic zoom when the pupil taps an answer box (2026-11-21 his report «كي نحط الحل يدير الزوم وحدو») ----------
     The phone zooms in on a text box it judges small. While a box is being used, the page says «maximum-scale=1» (no automatic
     zoom); when the box is left, the old viewport comes back, so the pupil can still zoom with two fingers when reading. */
  (function () {
    var vp = document.querySelector('meta[name="viewport"]');
    if (!vp) return;
    var orig = vp.getAttribute("content") || "width=device-width, initial-scale=1.0";
    var locked = orig.replace(/,?\s*(maximum|minimum)-scale=[^,]*/g, "") + ", minimum-scale=1, maximum-scale=1";
    /* 2026-11-21 his second report «مازال التكبير التلقائي»: switching at the tap came too late on his phone → pages with answer
       boxes keep «maximum-scale=1» all the time (the site's own text sizes are made for phones) */
    if (document.getElementById("exercisesRoot") || document.querySelector('input[type="text"],textarea')) {
      vp.setAttribute("content", locked);
      window.__noZoom = function () {};
      return;
    }
    function isBox(t) { return t && t.tagName && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName); }
    function lock() { vp.setAttribute("content", locked); }
    function unlock() { setTimeout(function () { if (!isBox(document.activeElement)) vp.setAttribute("content", orig); }, 400); }
    document.addEventListener("touchstart", function (e) { if (isBox(e.target)) lock(); }, { passive: true, capture: true });
    document.addEventListener("focusin", function (e) { if (isBox(e.target)) lock(); }, true);
    document.addEventListener("focusout", function (e) { if (isBox(e.target)) unlock(); }, true);
    window.__noZoom = lock;
  })();

  /* ---------- 2d. phone opened in «عرض الحاسوب» (Chrome «Desktop site») (2026-11-21 his «نعم») ----------
     Chrome then shows a 980 px page and zooms in by itself on every answer box; no page can stop it → a small hint, closable,
     only for a touch phone whose page is much wider than its screen. Closed = hidden 7 days. */
  (function () {
    try {
      var touch = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
      var sw = Math.min(screen.width || 9999, screen.height || 9999);
      if (!touch || sw > 600 || window.innerWidth < 900) return;
      var k = "sx-desk-hint", t = +store(k) || 0;
      if (Date.now() - t < 7 * 864e5) return;
      var st = document.createElement("style");
      st.textContent = ".sx-desk{position:fixed;top:0;left:0;right:0;z-index:5000;direction:rtl;display:flex;gap:14px;align-items:center;justify-content:center;" +
        "background:#fef3c7;color:#78350f;border-bottom:3px solid #d97706;padding:18px 20px;font:inherit;font-weight:800;font-size:34px;line-height:1.5;box-shadow:0 6px 18px rgba(0,0,0,.2)}" +
        ".sx-desk button{font:inherit;font-size:30px;font-weight:800;border:0;border-radius:14px;padding:10px 22px;background:#78350f;color:#fff;cursor:pointer;white-space:nowrap}" +
        "@media print{.sx-desk{display:none!important}}";
      document.head.appendChild(st);
      var d = document.createElement("div");
      d.className = "sx-desk";
      d.innerHTML = '<span>📱 لعرض أفضل وبدون تكبير تلقائي: من قائمة ⋮ في المتصفح ألغِ «عرض الحاسوب» (Desktop site).</span><button type="button">حسنا</button>';
      d.querySelector("button").onclick = function () { store(k, String(Date.now())); d.remove(); };
      (document.body || document.documentElement).appendChild(d);
    } catch (e) {}
  })();

  /* ---------- 3. exercise pages ---------- */
  (function () {
    function ink() { if (document.body && /\/(dars|al3ab)\//.test(location.pathname)) document.body.classList.add("sx-ink0"); }
    if (document.body) ink(); else document.addEventListener("DOMContentLoaded", ink);
  })();
  function onReady(fn) {
    if (document.readyState === "complete") setTimeout(fn, 30);
    else window.addEventListener("load", function () { setTimeout(fn, 30); });
  }
  onReady(function () {
    var data = null;
    try { if (typeof exercises !== "undefined" && Array.isArray(exercises)) data = exercises; } catch (e) {}
    var root = $("#exercisesRoot");
    if (data && root) enhanceExercises(data, root);
    var cMode = calcMode(level, section); if (cMode) addCalc(!!(data && root), cMode);
  });

  /* ---------- 3b. ONE check button on the «أُتقِن» lessons too (2026-11-21 his «لماذا لم تضع الزر العائم في دروس أتقن؟») ----------
     Those lessons have their own engine (#app .q, button «تحقّق» per question, twin questions added after a miss).
     Same bar as the exercise pages: ✔ تحقق → السؤال الموالي ⬅ → 🏁 الشهادة; the questions' own «تحقّق» buttons are hidden. */
  onReady(function () {
    try { if (typeof exercises !== "undefined") return; } catch (e) {}
    var app = document.getElementById("app");
    if (!app || !app.querySelector(".q")) return;
    var me1 = store("sx-onebtn"); if (me1 === "0") return;
    function chk(box) {
      var bs = box.querySelectorAll("button.btn");
      for (var i = 0; i < bs.length; i++) if (/تحق/.test(bs[i].textContent) && !bs[i].classList.contains("sec")) return bs[i];
      return null;
    }
    function list() {
      return Array.prototype.filter.call(app.querySelectorAll(".q"), function (b) { return chk(b) && b.offsetParent !== null; });
    }
    if (!list().length) return;
    document.body.classList.add("sx-1b");
    var css = el("style");
    css.textContent = ".sx-1bar{position:fixed;left:0;right:0;bottom:0;z-index:2500;display:flex;gap:8px;align-items:center;justify-content:center;" +
      "padding:8px 12px calc(8px + env(safe-area-inset-bottom));background:rgba(255,255,255,.96);border-top:1px solid #cbd5e1;box-shadow:0 -4px 14px rgba(15,23,42,.12);direction:rtl}" +
      ".sx-1bar .n{font-size:.85rem;font-weight:800;color:#475569;white-space:nowrap;direction:ltr}" +
      ".sx-1bar button{flex:1;max-width:560px;font:inherit;font-weight:800;font-size:1.3rem;border:none;border-radius:14px;padding:15px 18px;min-height:58px;cursor:pointer;color:#fff;background:#1e3a8a;box-shadow:0 3px 0 rgba(15,23,42,.35)}" +
      ".sx-1bar button.next{background:#15803d}.sx-1bar button.end{background:#b45309}.sx-1bar{transition:bottom .12s}" +
      "body.sx-1b{padding-bottom:96px!important}body.sx-1b .sx-upd{bottom:96px!important}body.sx-1b #app .q .sx-own{display:none!important}" +
      "body.sx-1b #app .q.sx-cur{outline:2.5px solid #38bdf8;outline-offset:3px;border-radius:10px}" +
      "body.sx-1b #app .q.sx-cur input.ans:not(:disabled){border:3px solid #1e3a8a!important;background:#fffbeb!important}" +
      "body.sx-kb .sx-pad-fab{display:none!important}html.sx-dark .sx-1bar{background:rgba(15,23,42,.96);border-color:#334155}" +
      "@media print{.sx-1bar{display:none!important}}";
    document.head.appendChild(css);
    var bar = el("div", "sx-1bar"), num = el("span", "n"), B = el("button");
    B.type = "button"; bar.appendChild(num); bar.appendChild(B); document.body.appendChild(bar);
    B.addEventListener("mousedown", function (e) { e.preventDefault(); });
    var curBox = null;
    function locked(b) { var c = chk(b); return !c || c.disabled; }
    function mark() { list().forEach(function (b) { var c = chk(b); if (c) c.classList.add("sx-own"); }); }
    function show() {
      mark();
      var Q = list();
      if (!curBox || Q.indexOf(curBox) < 0) { curBox = Q.filter(function (b) { return !locked(b); })[0] || Q[Q.length - 1]; }
      var k = Q.indexOf(curBox);
      Q.forEach(function (b) { b.classList.toggle("sx-cur", b === curBox); });
      num.textContent = (k + 1) + " / " + Q.length;
      if (!locked(curBox)) { B.className = ""; B.textContent = "✔ تحقق"; return; }
      var n = nextOpen(Q, k);
      if (n < 0) { B.className = "end"; B.textContent = "🏁 الشهادة"; }
      else { B.className = "next"; B.textContent = "السؤال الموالي ⬅"; }
    }
    function nextOpen(Q, k) {
      for (var i = k + 1; i < Q.length; i++) if (!locked(Q[i])) return i;
      for (i = 0; i < k; i++) if (!locked(Q[i])) return i;
      return -1;
    }
    function goBox(b) {
      curBox = b;
      var sb = document.querySelector(".top") , h = 0;
      if (sb && getComputedStyle(sb).position.indexOf("sticky") >= 0 || sb && getComputedStyle(sb).position === "fixed") h = sb.getBoundingClientRect().height;
      var t = b.querySelector(".qt") || b;
      window.scrollTo({ top: Math.max(0, t.getBoundingClientRect().top + window.scrollY - h - 10), behavior: "smooth" });
      var inp = b.querySelector("input.ans:not(:disabled)");
      if (inp) { try { inp.focus({ preventScroll: true }); } catch (e) {} }
      setTimeout(show, 80);
    }
    B.onclick = function () {
      var Q = list(); if (!curBox) show();
      if (!locked(curBox)) { chk(curBox).click(); setTimeout(show, 120); return; }
      var n = nextOpen(Q, Q.indexOf(curBox));
      if (n >= 0) { goBox(Q[n]); return; }
      var c = document.getElementById("cert"); if (c) c.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    app.addEventListener("focusin", function (e) { var b = e.target.closest && e.target.closest(".q"); if (b && chk(b)) { curBox = b; show(); } });
    app.addEventListener("click", function (e) { var b = e.target.closest && e.target.closest(".q"); if (b && chk(b)) curBox = b; setTimeout(show, 150); });
    document.addEventListener("keyup", function () { setTimeout(show, 80); });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" || e.defaultPrevented || e.isComposing) return;
      var t = e.target;
      if (t && t.closest && (t.closest(".sx-pad") || t.closest(".sx-ov") || t.closest(".sx-wrap") || t.closest("#cert"))) return;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) && !t.disabled) return;   /* the lesson's own Enter = check */
      if (t && /^(BUTTON|A)$/.test(t.tagName) && t !== B) return;
      e.preventDefault(); B.click();
    });
    /* 2026-11-23 his report «يغطي السؤال»: above the keyboard the bar is compact and the question + answer box stay visible (barKit) */
    var kit = barKit(bar, function () { return curBox; }, ".qt");
    new MutationObserver(function () { clearTimeout(show.t); show.t = setTimeout(show, 100); }).observe(app, { childList: true, subtree: true });
    setTimeout(show, 500);
  });

  /* 3c. every other activity page gets the GENERIC bar (games, labs, game lessons, old engines) */
  onReady(function () { setTimeout(genericBar, 900); });

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

  function chipsFor(q, sit) {
    var p = plain(q.text), chips = [];
    var r = p.match(/قيمة مقرّبة إلى\s*(الوحدة|[\d,]+)/);
    if (r) chips.push(["🎯 قيمة مقرّبة إلى " + r[1], ""]);
    if (/كسرا? مختزلا|غير قابل للاختزال|على أبسط شكل|اختزل/.test(p)) chips.push(["➗ اكتب الكسر هكذا: البسط / المقام", ""]);
    if (/a\s*√\s*b/.test(p)) chips.push(["√ على الشكل a√b", ""]);
    var u = p.match(/\(بـ\s*(cm²|m²|cm|mm|m|km|kg|g|DA|°|L|cl)\b/) || p.match(/بـ\s*(cm²|m²|cm|mm|km|kg|DA)\b/);
    if (u) chips.push([sit ? "⚠️ الوحدة إلزامية في الوضعية: اكتب الجواب مع الوحدة " + u[1] : "📏 اكتب الجواب مع الوحدة: " + u[1], "u" + (sit ? " sit" : "")]);
    return chips;
  }

  function isNumeric(q) {
    return q.exact.some(function (a) { return /^[−-]?\d+(?:[.,]\d+)?$/.test(String(a).trim()); }) &&
      !q.exact.some(function (a) { return /[a-zA-Zأ-ي√]/.test(String(a)); });
  }

  /* the unit is NOT optional (his ask 2026-11-16 «وضع الوحدة ليس اختياري بل نبه له وفي الوضعيات خاصة»):
     the mark is unchanged, but a right answer written without its unit gets a visible reminder */
  function unitWatch(q, box, inp, sit) {
    var p = plain(q.text);
    var u = p.match(/\(بـ\s*(cm²|m²|cm|mm|m|km|kg|g|DA|°|L|cl)\b/) || p.match(/بـ\s*(cm²|m²|cm|mm|km|kg|DA)\b/);
    if (!u) return;
    var unit = u[1], typed = "";
    box.addEventListener("click", function (e) {
      if (e.target && (e.target.id === "btn-" + q.qId || (e.target.closest && e.target.closest(".sx-choice")))) typed = inp.value;
    }, true);
    box.addEventListener("click", function (e) {
      if (!e.target || e.target.id !== "btn-" + q.qId) return;
      var v = typed;
      setTimeout(function () {
        var fb = document.getElementById("fb-" + q.qId);
        if (!fb || !box.classList.contains("solved") || $(".sx-unit-warn", fb)) return;
        var w = v.replace(/\s+/g, "").toLowerCase();
        var has = unit === "DA" ? /(da|دج|دينار)$/.test(w) : w.slice(-unit.length) === unit.toLowerCase();
        if (has) return;
        fb.appendChild(el("div", "sx-unit-warn", "⚠️ انتبه: لم تكتب الوحدة. الجواب الكامل يُكتب مع الوحدة (" + unit + ")" +
          (sit ? "، وفي الوضعية الإدماجية نسيانها يُعدّ نقصا في الإجابة." : "، فلا تنسها في كراسك وفي الامتحان.")));
      }, 30);
    });
  }

  function enhanceExercises(data, root) {
    var cards = $$(".exercise-card", root);
    if (!cards.length || cards.length !== data.length) return;
    document.body.classList.add("sx-ex");
    var sticky = $(".sticky-inner") || $(".sticky-bar");
    var stickyBar = $(".sticky-bar");
    function stickyH() { return stickyBar ? stickyBar.getBoundingClientRect().height : 0; }

    /* rules and properties in a distinct colour (his ask 2026-11-16: white sheet, coloured edges, colour only for warnings, rules, properties) */
    $$(".sol-line", root).forEach(function (d) { if (/^\s*<b>\s*(الطريقة|الخاصية|القاعدة|تذكير)/.test(d.innerHTML)) d.classList.add("sx-rule"); });

    /* questions */
    data.forEach(function (ex) {
      (ex.questions || []).forEach(function (q) {
        var box = document.getElementById("qbox-" + q.qId), inp = document.getElementById("in-" + q.qId),
          btn = document.getElementById("btn-" + q.qId);
        if (!box || !inp || !btn) return;
        var area = $(".answer-area", box) || inp.parentElement;
        var sit = /وضعية/.test(plain(ex.title || "")), ch = chipsFor(q, sit);
        unitWatch(q, box, inp, sit);
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
    /* 2026-11-21: «#ex-N» in the address opens exercise N (the BEM card of «تحدي الشهادة» on the home page links here) */
    (function () {
      var hm = location.hash.match(/^#ex-(\d+)$/);
      if (!hm || !cards[+hm[1] - 1]) return;
      setTimeout(function () {
        var c = cards[+hm[1] - 1];
        go(+hm[1] - 1, true);
        c.style.outline = "4px solid #2563eb"; c.style.outlineOffset = "4px"; c.style.borderRadius = "12px";
        setTimeout(function () { c.style.outline = ""; }, 5000);
      }, 450);
    })();
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

    /* ---- 🔘 ONE check button that follows the pupil + «📘 راجع الدرس» (2026-11-21 his idea, TRIAL) ----
       His words: «زر التحقق واحد يسير معك ويتحول إلى زر السؤال الموالي بعد الإجابة الصحيحة وعرض الحل أو بعد المحاولة الأخيرة،
       والربط بدروس أُتقِن، والحفاظ على كل شيء كما هو». ON FOR ALL since 2026-11-21 (his «ادمجها»); «?new=0» = the old pages on that phone, «?new=1» = back on.
       Nothing else changes: the cards' own «تحقق» buttons stay (hidden on phones while the trial is on). */
    (function () {
      var qp = /[?&]new=([01])\b/.exec(location.search);
      if (qp) store("sx-onebtn", qp[1]);
      var ONEBTN_FOR_ALL = true;   /* 2026-11-21 his «ادمجها»: on for everyone. false = back to the old pages for all; «?new=0» = old on one phone */
      var me1 = store("sx-onebtn");
      if (me1 === "0" || (!ONEBTN_FOR_ALL && me1 !== "1")) return;
      var Q = [];
      data.forEach(function (ex, i) {
        (ex.questions || []).forEach(function (q) {
          var box = document.getElementById("qbox-" + q.qId), inp = document.getElementById("in-" + q.qId), btn = document.getElementById("btn-" + q.qId);
          if (box && inp && btn) Q.push({ q: q, box: box, inp: inp, btn: btn, ex: i });
        });
      });
      if (!Q.length) return;
      document.body.classList.add("sx-1b");
      var css = el("style");
      css.textContent = ".sx-1bar{position:fixed;left:0;right:0;bottom:0;z-index:2500;display:flex;gap:8px;align-items:center;justify-content:center;" +
        "padding:8px 12px calc(8px + env(safe-area-inset-bottom));background:rgba(255,255,255,.96);border-top:1px solid #cbd5e1;box-shadow:0 -4px 14px rgba(15,23,42,.12);direction:rtl}" +
        ".sx-1bar .n{font-size:.85rem;font-weight:800;color:#475569;white-space:nowrap;direction:ltr}" +
        ".sx-1bar button{flex:1;max-width:560px;font:inherit;font-weight:800;font-size:1.3rem;border:none;border-radius:14px;padding:15px 18px;min-height:58px;cursor:pointer;color:#fff;background:#1e3a8a;box-shadow:0 3px 0 rgba(15,23,42,.35)}" +
        ".sx-1bar button:active{transform:translateY(2px);box-shadow:none}.sx-1bar{transition:bottom .12s}" +
        ".sx-1bar button.skip{flex:0 0 auto;font-size:.95rem;min-height:44px;padding:8px 12px;background:#fff;color:#6d28d9;border:2px solid #c4b5fd;box-shadow:none}" +
        ".sx-1bar button.next{background:#15803d}.sx-1bar button.end{background:#b45309}" +
        "body.sx-1b{padding-bottom:84px!important}body.sx-1b .q-box.sx-cur{outline:2.5px solid #38bdf8;outline-offset:3px;border-radius:10px}" +
        "body.sx-1b .q-box.sx-cur input[type=text]:not(:disabled){border:3px solid #1e3a8a!important;background:#fffbeb!important;box-shadow:0 0 0 4px rgba(56,189,248,.35)!important}" +
        "body.sx-1b .q-box.sx-cur input[type=text]:not(:disabled)::placeholder{color:#92400e;opacity:1;font-weight:700}" +
        "body.sx-kb .sx-pad-fab,body.sx-kb .sx-calc-fab{display:none!important}" +
        "body.sx-1b .q-box .btn-check{display:none!important}body.sx-1b{padding-bottom:96px!important}body.sx-1b .sx-upd{bottom:96px!important}" +
        "body.sx-1b .sx-pad-fab,body.sx-1b .sx-calc-fab{bottom:80px!important}body.sx-exam .sx-1bar{bottom:58px}body.sx-exam.sx-1b{padding-bottom:140px!important}body.sx-exam.sx-1b .sx-pad-fab,body.sx-exam.sx-1b .sx-calc-fab{bottom:136px!important}" +
        ".sx-lesson{display:block;margin:10px 0 2px;padding:8px 12px;border:1.5px dashed #0f766e;border-radius:10px;color:#0f766e;font-weight:800;text-decoration:none;background:#f0fdfa}" +
        "html.sx-dark .sx-1bar{background:rgba(15,23,42,.96);border-color:#334155}html.sx-dark .sx-1bar .n{color:#cbd5e1}" +
        "@media print{.sx-1bar,.sx-lesson{display:none!important}}";
      document.head.appendChild(css);
      var bar = el("div", "sx-1bar"), num = el("span", "n"), B = el("button");
      B.type = "button"; bar.appendChild(num); bar.appendChild(B); document.body.appendChild(bar);
      /* 2026-11-21 his report: with the phone keyboard open the bar was hidden under it → keep the bar just above the keyboard */
      B.addEventListener("mousedown", function (e) { e.preventDefault(); });   /* tapping the button does not close the keyboard */
      B.addEventListener("touchstart", function () {}, { passive: true });
      /* 2026-11-21 «مكان الإجابة غير ظاهر جيدا» + 2026-11-23 «يغطي السؤال»: the bar sits above the keyboard (compact there), the question
         and its answer box stay between the top bar and the floating bar, the page keeps room at the bottom (shared barKit) */
      var kit = barKit(bar, function () { var x = Q[cur]; return x ? x.box : null; }, ".q-title");
      var cur = 0;
      function locked(k) { try { return !!questionLocked[Q[k].q.qId]; } catch (e) { return Q[k].inp.disabled; } }
      function nextOpen(from) {
        for (var k = from + 1; k < Q.length; k++) if (!locked(k)) return k;
        for (k = 0; k < from; k++) if (!locked(k)) return k;
        return -1;
      }
      function firstOpen() { for (var k = 0; k < Q.length; k++) if (!locked(k)) return k; return -1; }
      /* 2026-11-22 his report «الزر العائم في وضعيات التحليل لا يعمل جيدا … يعمل مع التحقق فقط»: on the pupil-analysis pages
         (idmaj-tahlil / idmaj-dhakira, block #anBox) the questions are hidden while the analysis runs, so the bar drives
         the ANALYSIS: ✔ تحقق (the step's own check) → التالي ⬅ (next step) → 📋 بطاقة تحليلي; a small «⏭ تخطّ» skips it;
         once the analysis card is shown the bar takes the pupil to the questions (✍️ انتقل إلى الحل), then the usual flow */
      var skipB = el("button", "skip"); skipB.type = "button"; skipB.textContent = "⏭ تخطّ"; skipB.title = "تخطّ التحليل وانتقل إلى الحل";
      skipB.style.display = "none"; bar.insertBefore(skipB, B);
      skipB.addEventListener("mousedown", function (e) { e.preventDefault(); });
      var anToQ = false;   /* true once the pupil has been taken to the questions after the analysis */
      function anBox() { var a = document.getElementById("anBox"); return a && a.parentElement ? a : null; }
      function anOn() { var a = anBox(); return !!(a && a.parentElement.classList.contains("an-locked")); }
      function vis(e) { return !!(e && !e.disabled && e.offsetParent !== null); }
      function anShow() {
        var a = anBox(), n = $$(".an-prog span", a).length || 1, on = $$(".an-prog span.on", a).length;
        Q.forEach(function (x) { x.box.classList.toggle("sx-cur", false); });
        num.textContent = "🔍 " + Math.min(on + 1, n) + " / " + n; num.title = "خطوة التحليل " + (on + 1) + " من " + n;
        skipB.style.display = "";
        if (vis($(".an-next", a))) { B.className = "next"; B.textContent = on + 1 >= n ? "📋 بطاقة تحليلي" : "التالي ⬅"; return; }
        B.className = ""; B.textContent = "✔ تحقق";
      }
      function anView() {
        var a = anBox(); if (!a) return;
        var tg = anOn() ? (vis($(".an-next", a)) ? $(".an-fb", a) : a) : a;
        var r = tg.getBoundingClientRect(), bt = bar.getBoundingClientRect().top;
        if (r.top < 60 || r.bottom > bt - 8) tg.scrollIntoView({ behavior: "smooth", block: r.height > bt - 80 ? "start" : "center" });
      }
      function anClick() {
        var a = anBox(), nx = $(".an-next", a), ck = $(".an-check", a);
        if (vis(nx)) nx.click();
        else if (vis(ck)) ck.click();
        else {
          var fb = $(".an-fb", a);
          if (fb) { fb.className = "an-fb w"; fb.innerHTML = "👆 اختر جوابا من الاقتراحات أعلاه."; }
          toast("👆 اختر جوابا من الاقتراحات.");
        }
        setTimeout(function () { show(); anView(); }, 120);
      }
      skipB.onclick = function () { if (window.__anSkip) window.__anSkip(); setTimeout(function () { show(); anView(); }, 80); };
      function show() {
        if (anOn()) { anShow(); return; }
        skipB.style.display = "none";
        if (anBox() && !anToQ && firstOpen() === 0 && !Q[0].inp.value.trim()) {
          Q.forEach(function (x) { x.box.classList.toggle("sx-cur", false); });
          num.textContent = "1 / " + Q.length; B.className = "next"; B.textContent = "✍️ انتقل إلى الحل"; return;
        }
        Q.forEach(function (x, k) { x.box.classList.toggle("sx-cur", k === cur); });
        num.textContent = (cur + 1) + " / " + Q.length; num.title = "السؤال " + (cur + 1) + " من " + Q.length;
        if (!locked(cur)) { B.className = ""; B.textContent = "✔ تحقق"; return; }
        var n = nextOpen(cur);
        if (n < 0) { B.className = "end"; B.textContent = "🏁 النتيجة النهائية"; }
        else { B.className = "next"; B.textContent = "السؤال الموالي ⬅"; }
      }
      function goQ(k) {
        cur = k;
        var x = Q[k];
        if (!x.box.offsetParent) { var pill = $$(".sx-pill:not(.tool)")[x.ex]; if (pill) pill.click(); }
        setTimeout(function () {
          var sb = $(".sticky-bar"), h = sb ? sb.getBoundingClientRect().height : 0;
          var t = $(".q-title", x.box) || x.box;
          window.scrollTo({ top: Math.max(0, t.getBoundingClientRect().top + window.scrollY - h - 10), behavior: "smooth" });
          var area = $(".answer-area", x.box);
          if (area && !area.classList.contains("sx-hide")) { try { if (window.__noZoom) window.__noZoom(); x.inp.focus({ preventScroll: true }); } catch (e) {} }
          show();
        }, 60);
      }
      B.onclick = function () {
        if (anOn()) { anClick(); return; }
        if (B.textContent === "✍️ انتقل إلى الحل") { anToQ = true; var f0 = firstOpen(); goQ(f0 < 0 ? 0 : f0); return; }
        if (!locked(cur)) {
          var x = Q[cur], area = $(".answer-area", x.box);
          if (area && area.classList.contains("sx-hide")) { goQ(cur); toast("👆 اختر الجواب الصحيح من الأزرار."); return; }
          if (!x.inp.value.trim()) { goQ(cur); }
          x.btn.click();
          setTimeout(show, 80);
          return;
        }
        var n = nextOpen(cur);
        if (n >= 0) { goQ(n); return; }
        var fm2 = $("#finalModal"); if (fm2) fm2.style.display = "flex";
      };
      /* the pupil may still answer any question: the button follows the box being worked in */
      root.addEventListener("focusin", function (e) {
        if (!anOn()) for (var k0 = 0; k0 < Q.length; k0++) if (Q[k0].box.contains(e.target)) anToQ = true;
        for (var k = 0; k < Q.length; k++) if (Q[k].box.contains(e.target)) { if (k !== cur) { cur = k; show(); } return; }
      });
      root.addEventListener("click", function (e) {
        for (var k = 0; k < Q.length; k++) if (Q[k].box.contains(e.target)) { cur = k; break; }
        setTimeout(show, 120);
      });
      document.addEventListener("keyup", function () { setTimeout(show, 60); });
      /* 2026-11-21 his report: on a computer «Enter» checked but did not move to the next question → Enter = the bar button
         whenever the pupil is not typing in an open answer box (that box's own Enter = check stays) */
      document.addEventListener("keydown", function (e) {
        if (e.key !== "Enter" || e.defaultPrevented || e.isComposing) return;
        var t = e.target, fm3 = $("#finalModal");
        if (fm3 && fm3.style.display === "flex") return;
        if (t && t.closest && (t.closest(".sx-pad") || t.closest(".sx-ov") || t.closest(".sx-wrap") || t.closest(".sx-kids"))) return;
        if (t && t.closest && t.closest("#anBox") && t.tagName === "INPUT" && !t.disabled) { e.preventDefault(); B.click(); return; }
        if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) && !t.disabled) return;
        if (t && /^(BUTTON|A)$/.test(t.tagName) && t !== B) return;
        e.preventDefault(); B.click();
      });
      setTimeout(function () { var f = firstOpen(); cur = f < 0 ? 0 : f; show(); }, 400);
      /* the analysis box redraws itself (its own buttons, «أعد التحليل», skip): read the bar again each time */
      if (window.MutationObserver) {
        var anT = 0;
        new MutationObserver(function () { if (!anBox()) return; clearTimeout(anT); anT = setTimeout(show, 50); })
          .observe(root, { childList: true, subtree: true });
      }

      /* «📘 راجع الدرس»: at the end of each exercise, the lesson («أُتقِن» first) of the resources of its questions
         (window.__resmap = question → resource, assets/resources.json = resource → lesson; both written at deploy) */
      var RM = window.__resmap; if (!RM) return;
      fetch(ROOT.href + "assets/resources.json", { cache: "force-cache" }).then(function (r) { return r.json(); }).then(function (R) {
        var rows = R[level]; if (!rows) return;
        data.forEach(function (ex, i) {
          var seen = {}, links = [];
          (ex.questions || []).forEach(function (q) {
            var m = RM[q.qId]; if (!m || m[0] < 0 || seen[m[0]]) return; seen[m[0]] = 1;
            var r = rows[m[0]]; if (r && r.l && r.l !== rel) links.push([r.l, r.n]);
          });
          links.sort(function (a, b) { return (/itqan/.test(b[0]) ? 1 : 0) - (/itqan/.test(a[0]) ? 1 : 0); });
          var card = cards[i]; if (!card || !links.length) return;
          links.slice(0, 2).forEach(function (L) {
            var t = String(L[1]).split(" (")[0]; if (t.length > 70) t = t.slice(0, 68).replace(/\s+\S*$/, "") + "…";
            var a = el("a", "sx-lesson", "📘 راجع الدرس: " + t);
            a.href = ROOT.href + L[0];
            card.appendChild(a);
          });
        });
      }).catch(function () {});
    })();

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
      var L = getLog(); (L[qid] = L[qid] || []).push(inp.value.trim()); L._t = Date.now(); if (!L._s) L._s = L._t;
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
      /* 2026-11-22 his report (screenshot): back from the home page to a finished sheet → the replay finished every question and
         the page's own code opened the final window by itself. A replay never opens it: the bar keeps «🏁 النتيجة النهائية». */
      var fmR = $("#finalModal"), stopAt = Date.now() + 1500;
      if (fmR && fmR.style.display !== "flex") {
        var mo = window.MutationObserver ? new MutationObserver(function () {
          if (Date.now() > stopAt) { mo.disconnect(); return; }
          if (fmR.style.display === "flex") { fmR.style.display = "none"; mo.disconnect(); toast("✅ أنهيتَ هذه الورقة من قبل. اضغط «🏁 النتيجة النهائية» لرؤية علامتك."); }
        }) : null;
        if (mo) { mo.observe(fmR, { attributes: true, attributeFilter: ["style"] }); setTimeout(function () { mo.disconnect(); }, 1600); }
      }
      paint(); save();
      var first = 0;
      data.some(function (ex, i) { first = i; return (ex.questions || []).some(function (q) { try { return !questionLocked[q.qId]; } catch (e) { return false; } }); });
      go(first, true);
    }
    var saved = getLog(), nSaved = allQ.filter(function (q) { return (saved[q.qId] || []).length; }).length;
    var recent = nSaved && saved._t && Date.now() - saved._t < 3 * 3600000 && !store("math-exam:" + rel);
    if (recent) {
      setTimeout(function () {
        replay();
        try {
          var ls = JSON.parse(store("math-last") || "null");
          if (ls && ls.u === location.pathname + location.search && ls.y) window.scrollTo(0, ls.y);
        } catch (e) {}
        toast("▶ أكملتَ من حيث توقفت (" + nSaved + " من " + arN(allQ.length, "q", 1) + ").");
      }, 60);
    } else if (nSaved) {
      var rb = el("div", "sx-resume");
      rb.innerHTML = '<span>📌 لديك محاولة محفوظة على هذا الجهاز (' + nSaved + " من " + arN(allQ.length, "q", 1) + ').</span>' +
        '<button type="button" class="go">▶ أكمل من حيث توقفت</button><button type="button" class="new">↺ ابدأ من جديد</button>';
      $(".go", rb).onclick = function () { rb.remove(); replay(); };
      $(".new", rb).onclick = function () { clearLog(); rb.remove(); };
      root.parentElement.insertBefore(rb, root);
    }

    /* ================= 2026-11-16: his 7 features =================
       A. 🗣️ Arabic reading (speechSynthesis)   B. 📝 scratchpad per exercise
       C. ⏱️ exam mode (OPTIONAL)                D. 🩺 diagnosis by resource
       E. 🔄 similar exercise with new numbers   F. 🎓 certificate + 🏁 challenge link */
    var fm = $("#finalModal"), fbs = {};
    allQ.forEach(function (q) { fbs[q.qId] = document.getElementById("fb-" + q.qId); });
    var exOf = {};
    data.forEach(function (ex, i) { (ex.questions || []).forEach(function (q) { exOf[q.qId] = i; }); });
    function earnedOf(q) { try { return +questionEarned[q.qId] || 0; } catch (e) { return 0; } }
    function lockedOf(q) { try { return !!questionLocked[q.qId]; } catch (e) { return false; } }
    function leftOf(q) { try { return +attemptsLeft[q.qId]; } catch (e) { return 3; } }

    /* ---- 📋 results by resource and Bloom level, for the parents' report «تقريري» (2026-11-19) ----
       window.__resmap (written into the page at deploy) links each question to an official resource of the level and a
       Bloom level (1 تذكّر·فهم·تطبيق, 2 تحليل, 3 تقويم·توظيف). Only answered questions count (correct, or 3 tries used).
       localStorage "math-res" = { "<level>|<resource>": { "<page>": { f: first day, d: day of the last change, b: {1:[earned, points], …} } } }.
       A second page (or the same page on a later day) on the same resource is the review. */
    (function () {
      var RM = window.__resmap; if (!RM) return;
      var RK = "math-res", lastSig = "";
      function day() { var d = new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
      function rec() {
        var cur = {};
        data.forEach(function (ex) {
          (ex.questions || []).forEach(function (q) {
            var m = RM[q.qId]; if (!m || m[0] < 0 || !lockedOf(q)) return;
            var k = level + "|" + m[0], c = cur[k] || (cur[k] = {}), b = c[m[1]] || (c[m[1]] = [0, 0]);
            b[0] += earnedOf(q); b[1] += +q.pts || 1;
          });
        });
        var sig = JSON.stringify(cur); if (sig === lastSig || sig === "{}") return; lastSig = sig;
        try {
          var all = JSON.parse(localStorage.getItem(RK) || "{}") || {}, t = day();
          Object.keys(cur).forEach(function (k) {
            var r = all[k] || (all[k] = {}), old = r[rel];
            r[rel] = { f: old ? old.f : t, d: old && JSON.stringify(old.b) === JSON.stringify(cur[k]) ? old.d : t, b: cur[k] };
          });
          localStorage.setItem(RK, JSON.stringify(all));
        } catch (e) {}
      }
      setInterval(rec, 2000);
      document.addEventListener("click", function () { setTimeout(rec, 600); }, true);
      window.addEventListener("pagehide", rec);
    })();

    /* ---- A. reading aloud ---- */
    cards.forEach(function (c, i) {
      var cb = $(".context-box", c);
    });
    /* 📝 one floating button, always within reach of the thumb; it opens the draft of the exercise on the screen */
    var padFab = el("button", "sx-pad-fab", "📝 مسودة");
    padFab.type = "button"; padFab.title = "مسودة الحساب للتمرين المعروض";
    padFab.onclick = function () { openPad("ex" + cur, plain(data[cur].title || ""), cards[cur]); };
    document.body.appendChild(padFab);
    if (padB && padB.parentNode) padB.parentNode.removeChild(padB);
    whenVoice(function () {
      cards.forEach(function (c) {
        var cb = $(".context-box", c);
        if (cb && plain(cb.innerHTML).length > 3) cb.insertBefore(sayBtn(cb), cb.firstChild);
      });
      allQ.forEach(function (q) {
        var box = document.getElementById("qbox-" + q.qId), sp = box && $(".q-title > span", box);
        if (sp) sp.insertBefore(sayBtn(sp), sp.firstChild);
        var fb = fbs[q.qId];
        if (fb && window.MutationObserver) new MutationObserver(function () {
          if (fb.classList.contains("hint") && !$(".sx-say", fb) && plain(fb.innerHTML).length > 3) fb.insertBefore(sayBtn(fb), fb.firstChild);
        }).observe(fb, { childList: true });
      });
    });

    /* ---- C. exam mode (optional) ---- */
    var EXK = "math-exam:" + rel, examOn = false, exTimer = null, exBar = null, warned = false;
    var EXMIN = { idmaj: 40, fard: 60, wadjib: 60, series: 60, tahaddi: 45, chahada: 120, bem: 120, ikhtibar: level === "4m" ? 120 : 90 };
    function exGet() { try { return JSON.parse(store(EXK) || "null"); } catch (e) { return null; } }
    function exPut(s) { store(EXK, JSON.stringify(s)); }
    function exDel() { try { localStorage.removeItem(EXK); } catch (e) {} }
    function mmss(ms) { var s = Math.max(0, Math.ceil(ms / 1000)), m = Math.floor(s / 60); s %= 60; return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s; }
    if (EXMIN[section]) {
      var exB = el("button", "sx-pill tool", "⏱️ وضع الامتحان");
      exB.type = "button";
      exB.title = "اختياري: عدّاد تنازلي، دون تلميحات، والتصحيح في النهاية";
      exB.onclick = function () { examDialog(); };
      pills.insertBefore(exB, modeB.nextSibling);
    }
    function examDialog(preset) {
      var started = allQ.some(function (q) { return lockedOf(q) || earnedOf(q) > 0; }) || nSaved;
      var def = preset || EXMIN[section] || 60, opts = [30, 45, 60, 90, 120];
      if (opts.indexOf(def) < 0) opts.push(def), opts.sort(function (a, b) { return a - b; });
      var ov = el("div", "sx-ov"), box = el("div", "sx-sheet sx-dlg");
      box.innerHTML = '<div class="sx-top"><b>⏱️ وضع الامتحان (اختياري)</b><button type="button" class="sx-btn x">✕</button></div>' +
        '<ul class="sx-list"><li>عدّاد تنازلي كما في الفرض أو امتحان الشهادة.</li>' +
        '<li>لا تلميحات ولا تصحيح أثناء الامتحان: تُسجَّل إجابتك فقط، ويمكنك تغييرها قبل التسليم.</li>' +
        '<li>عند «📥 سلّم ورقتك» أو انتهاء الوقت تُصحَّح الورقة كلها مرة واحدة: الجواب الصحيح يأخذ علامته كاملة، ويظهر الحل النموذجي وسلم التنقيط وبطاقة التشخيص.</li>' +
        '<li>لا تنس الوحدة في كل جواب، خاصة في الوضعية الإدماجية.</li></ul>' +
        '<div class="sx-lbl">المدة:</div><div class="sx-durs">' + opts.map(function (m) {
          return '<button type="button" data-m="' + m + '" class="' + (m === def ? "on" : "") + '">' + (m >= 60 && m % 60 === 0 ? (m === 60 ? "ساعة" : m === 120 ? "ساعتان" : m / 60 + " ساعات") : m === 90 ? "ساعة ونصف" : arN(m, "min")) + "</button>";
        }).join("") + "</div>" +
        (started ? '<p class="sx-warn">⚠️ ستبدأ الورقة من جديد (تُمحى محاولتك الحالية على هذا الجهاز).</p>' : "") +
        '<div class="sx-row"><button type="button" class="sx-main go">▶ ابدأ الامتحان</button><button type="button" class="sx-btn x2">إلغاء</button></div>';
      ov.appendChild(box);
      document.body.appendChild(ov);
      var dur = def;
      $$(".sx-durs button", box).forEach(function (b) { b.onclick = function () { dur = +b.dataset.m; $$(".sx-durs button", box).forEach(function (x) { x.classList.toggle("on", x === b); }); }; });
      function close() { ov.remove(); }
      $(".x", box).onclick = close; $(".x2", box).onclick = close;
      ov.addEventListener("click", function (e) { if (e.target === ov) close(); });
      $(".go", box).onclick = function () {
        var now = Date.now();
        exPut({ start: now, end: now + dur * 60000, dur: dur, ans: {} });
        clearLog();
        try { localStorage.removeItem("math-time:" + rel); } catch (e) {}
        location.href = location.href.split("#")[0].replace(/[?&]exam=\d+/, "");
      };
    }
    function examStart(st) {
      examOn = true;
      document.body.classList.add("sx-exam");
      exBar = el("div", "sx-exbar");
      exBar.innerHTML = '<span class="tm" aria-live="off">⏱️ --:--</span><span class="ct"></span><button type="button">📥 سلّم ورقتك</button>';
      document.body.appendChild(exBar);
      $("button", exBar).onclick = function () { handIn(); };
      allQ.forEach(function (q) {
        var v = st.ans[q.qId];
        if (v != null) { var inp = document.getElementById("in-" + q.qId); if (inp) inp.value = v; noteSaved(q.qId, v); }
      });
      count();
      tick();
      exTimer = setInterval(tick, 1000);
      var rb = $(".sx-resume"); if (rb) rb.remove();
    }
    function count() {
      var st = exGet(); if (!st || !exBar) return;
      var n = allQ.filter(function (q) { return st.ans[q.qId] != null && String(st.ans[q.qId]).trim(); }).length;
      $(".ct", exBar).textContent = "أجبت عن " + n + " من " + allQ.length;
    }
    function tick() {
      var st = exGet(); if (!st) return;
      var left = st.end - Date.now();
      $(".tm", exBar).textContent = "⏱️ " + mmss(left);
      exBar.classList.toggle("warn", left <= 5 * 60000);
      if (left <= 5 * 60000 && !warned && left > 0) { warned = true; toast("⏳ بقيت 5 دقائق: راجع إجاباتك ولا تنس الوحدات."); }
      if (left <= 0) finishExam(true);
    }
    function noteSaved(qid, v) {
      var fb = fbs[qid]; if (!fb) return;
      fb.className = "feedback-box sx-exnote";
      fb.innerHTML = "📝 سُجّلت إجابتك: <bdi dir=\"ltr\">" + esc(v) + "</bdi>. يمكنك تغييرها قبل تسليم الورقة.";
      var box = document.getElementById("qbox-" + qid);
      $$(".sx-choice", box).forEach(function (cb) { cb.classList.remove("picked", "right"); cb.classList.toggle("sel", cb.__v === v); });
    }
    /* during the exam a check only records the answer (no hint, no mark) */
    window.addEventListener("click", function (e) {
      if (!examOn) return;
      var b = e.target && e.target.closest && e.target.closest(".btn-check");
      if (!b || !root.contains(b)) return;
      e.stopImmediatePropagation(); e.preventDefault();
      var qid = b.id.replace(/^btn-/, ""), inp = document.getElementById("in-" + qid), st = exGet();
      if (!inp || !st) return;
      var v = inp.value.trim();
      if (!v) { var fb = fbs[qid]; if (fb) { fb.className = "feedback-box sx-exnote"; fb.textContent = "اكتب إجابتك أولا في الخانة."; } return; }
      st.ans[qid] = v; exPut(st); count();
      noteSaved(qid, v);
      setTimeout(function () { noteSaved(qid, v); }, 150);
    }, true);
    function handIn() {
      var st = exGet(); if (!st) return;
      var miss = allQ.filter(function (q) { return !(st.ans[q.qId] && String(st.ans[q.qId]).trim()); }).length;
      var ov = el("div", "sx-ov"), box = el("div", "sx-sheet sx-dlg");
      box.innerHTML = '<div class="sx-top"><b>📥 تسليم الورقة</b></div><p>هل تريد تسليم ورقتك الآن؟ بقي من الوقت <bdi dir="ltr">' + mmss(st.end - Date.now()) + "</bdi>." +
        (miss ? "<br>⚠️ لم تُجب عن " + arN(miss, "q", 1) + "." : "") + '</p><div class="sx-row"><button type="button" class="sx-main go">نعم، سلّم الورقة</button><button type="button" class="sx-btn no">أكمل الامتحان</button></div>';
      ov.appendChild(box); document.body.appendChild(ov);
      $(".no", box).onclick = function () { ov.remove(); };
      $(".go", box).onclick = function () { ov.remove(); finishExam(false); };
    }
    function finishExam(auto) {
      var st = exGet(); if (!st) return;
      examOn = false;
      if (exTimer) clearInterval(exTimer);
      if (exBar) exBar.remove();
      document.body.classList.remove("sx-exam");
      var used = Math.min(st.dur * 60000, Math.max(0, Date.now() - st.start));
      store("math-time:" + rel, JSON.stringify({ ms: used, exam: st.dur, t: Date.now() }));
      exDel();
      var snd, fly = window.flyStars;
      try { snd = soundEnabled; soundEnabled = false; } catch (e) {}
      window.flyStars = function () {};
      allQ.forEach(function (q) {
        var inp = document.getElementById("in-" + q.qId), btn = document.getElementById("btn-" + q.qId);
        if (!inp || !btn || inp.disabled) return;
        var v = st.ans[q.qId] && String(st.ans[q.qId]).trim() ? String(st.ans[q.qId]).trim() : "—";
        for (var k = 0; k < 3 && !inp.disabled; k++) { inp.value = v; btn.click(); }
        var box = document.getElementById("qbox-" + q.qId);
        $$(".sx-choice", box).forEach(function (cb) { cb.classList.remove("sel"); if (cb.__v === v) cb.__mark(); });
      });
      window.flyStars = fly;
      try { soundEnabled = snd; } catch (e) {}
      $$(".shake").forEach(function (x) { x.classList.remove("shake"); });
      paint(); save(); genButtons();
      toast(auto ? "⏰ انتهى الوقت: سُلّمت ورقتك وصُحّحت." : "📥 سُلّمت ورقتك وصُحّحت. انظر الحل النموذجي وبطاقة التشخيص.");
    }

    /* ---- E. similar exercise with new numbers ---- */
    function genButtons() {
      allQ.forEach(function (q) {
        if (!lockedOf(q)) return;
        var box = document.getElementById("qbox-" + q.qId);
        if (!box || $(".sx-gen-btn", box)) return;
        var g = genFor(data[exOf[q.qId]], q);
        if (!g) return;
        var b = el("button", "sx-gen-btn", "🔄 تدرّب على تمرين مشابه بأرقام جديدة");
        b.type = "button";
        b.onclick = function () { openGen(g); };
        box.appendChild(b);
      });
    }
    document.addEventListener("click", function () { setTimeout(genButtons, 250); }, true);

    /* ---- D + F. end of the page: diagnosis by resource, certificate, challenge ---- */
    var chal = readChallenge();
    if (chal) {
      var cbn = el("div", "sx-chal");
      cbn.innerHTML = "🏁 <span></span>";
      $("span", cbn).textContent = "تحدٍّ من " + (chal.n || "زميلك") + ": " + fmt(chal.s) + " / " + chal.m + (chal.t ? " خلال " + arN(chal.t, "min", 1) : "") + ". هل تتغلّب على هذه النتيجة؟";
      root.parentElement.insertBefore(cbn, root);
    }
    function timeUsed() {
      try { var t = JSON.parse(store("math-time:" + rel) || "null"); if (t && t.ms) return t; } catch (e) {}
      var L = getLog();
      if (L._s && L._t && L._t > L._s) { var ms = L._t - L._s; if (ms < 4 * 3600000) return { ms: ms }; }
      return null;
    }
    function report() {
      if (!mc || !fm || getComputedStyle(fm).display === "none" || examOn) return;
      var rows = diagnose();
      var box = $(".sx-report", mc) || el("div", "sx-report");
      var tu = timeUsed(), mins = tu ? Math.max(1, Math.round(tu.ms / 60000)) : 0;
      var r0 = readScore() || { s: 0, m: 20 };
      var html = '<div class="h">🩺 بطاقة التشخيص: مواردك في هذه الورقة</div>' + rows.map(function (o, k) {
        return '<div class="r ' + o.st + '"><span>' + (o.st === "ok" ? "🟢" : o.st === "mid" ? "🟡" : "🔴") + " " + esc(o.n) +
          '<small>' + (o.st === "ok" ? "متحكَّم فيه" : o.st === "mid" ? "يحتاج تدعيما" + (o.h && o.r >= 0.75 ? " (استعملت التلميحات)" : "") : "غير مكتسب بعد: راجع الدرس") + "</small></span><b>" + fmt(o.e) + " / " + fmt(o.p) + "</b></div>" +
          (o.st === "ok" ? "" : '<div class="acts" data-k="' + k + '"><button type="button" class="see">📖 راجع الحل</button>' +
            (o.g ? '<button type="button" class="gen">🔄 تمرين مشابه</button>' : "") + '<span class="rem"></span></div>');
      }).join("") +
        (tu ? '<p class="tip">⏱️ ' + (tu.exam ? "وضع الامتحان: استغرقت " + arN(mins, "min", 1) + " من " + tu.exam : "المدة: حوالي " + arN(mins, "min", 1)) + ".</p>" : "") +
        (rows.some(function (o) { return o.st !== "ok"; }) ? '<p class="tip">🔁 ابدأ بالموارد 🔴 ثم 🟡: اقرأ الحل النموذجي، ثم تدرّب بتمرين مشابه، وأعد الورقة غدا بهدوء.</p>'
          : '<p class="tip">🌟 كل الموارد متحكَّم فيها! جرّب تحديا أو سلسلة أخرى من الفهرس.</p>');
      if (chal) {
        var win = r0.s > chal.s || (r0.s === chal.s && chal.t && mins && mins < chal.t);
        if (win) try { var CN = JSON.parse(store("math-cnt") || "{}") || {}; CN.chal = CN.chal || {}; if (!CN.chal[rel]) { CN.chal[rel] = 1; store("math-cnt", JSON.stringify(CN)); } } catch (e) {}   /* 🏅 «شهادة سيّد التحديات» */
        html += '<p class="tip sx-chal-res">' + (win ? "🏆 تغلّبت على التحدي!" : r0.s === chal.s ? "🤝 تعادلت مع صاحب التحدي." : "💪 لم تتغلّب على التحدي هذه المرة. راجع مواردك وأعد غدا.") + "</p>";
      }
      if (box.__h === html) return;
      box.__h = html;
      box.innerHTML = html;
      $$(".acts", box).forEach(function (a) {
        var o = rows[+a.dataset.k];
        $(".see", a).onclick = function () { fm.style.display = "none"; go(o.ex, true); };
        var gb = $(".gen", a); if (gb) gb.onclick = function () { openGen(o.g); };
        remedial(o.n, function (it) {
          if (!it) return;
          var l = el("a", "", "📘 " + esc(it.title));
          l.href = ROOT.href + it.url;
          $(".rem", a).appendChild(l);
        });
      });
      var btns = $(".sx-modal-btns", mc);
      if (!box.parentNode) mc.insertBefore(box, btns);
      if (!$(".sx-sharecard", mc)) {
        var sc = el("div", "sx-sharecard");
        var nm = store("math-name") || "", cl = store("math-class") || "";
        sc.innerHTML = '<input type="text" class="nm" maxlength="30" placeholder="اسمك الأول (اختياري)" value="' + esc(nm) + '">' +
          '<input type="text" class="cl" maxlength="12" placeholder="القسم، مثلا ' + level.charAt(0) + 'م2" value="' + esc(cl) + '">' +
          '<button type="button" class="cert">🎓 شهادتي (صورة)</button><button type="button" class="ch">🏁 تحدَّ زميلك</button>';
        function who() { var n = $(".nm", sc).value.trim(), c = $(".cl", sc).value.trim(); store("math-name", n); store("math-class", c); return { n: n, c: c }; }
        $(".cert", sc).onclick = function () { var w = who(); certificate(w.n, w.c, rows, tu); };
        $(".ch", sc).onclick = function () { var w = who(); challenge(w.n, tu); };
        mc.insertBefore(sc, btns);
      }
    }
    document.addEventListener("click", function () { setTimeout(report, 900); }, true);
    if (fm && window.MutationObserver) new MutationObserver(function () { setTimeout(report, 50); }).observe(fm, { attributes: true, attributeFilter: ["style"] });

    function resOf(ex, q) {
      var t = plain(ex.title || "");
      if (/وضعية/.test(t)) return "الوضعية الإدماجية (توظيف الموارد)";
      var m = t.match(/\(المورد\s*\d*\s*:\s*([^—)]+?)\s*(?:—|\)|$)/);
      if (m) return m[1].trim();
      if (level === "4m") {
        var KW = [[/طالس|\/\//, "خاصية طالس وعكسها"], [/\b(cos|sin|tan)\b|جيب|ظل زاوية/, "النسب المثلثية في المثلث القائم"], [/فيثاغورس/, "خاصية فيثاغورس"],
          [/PGCD|إقليدس|القواسم|قواسم/, "القواسم والقاسم المشترك الأكبر"], [/غير قابل للاختزال|اختزل/, "الكسر غير القابل للاختزال"],
          [/x\s*²\s*=|المعادلة/, "المعادلة x² = a"], [/كتابة علمية|الكتابة العلمية/, "الكتابة العلمية"], [/√/, "الحساب على الجذور التربيعية"]];
        var p = plain(q.text), i;
        for (i = 0; i < KW.length; i++) if (KW[i][0].test(p)) return KW[i][1];
        for (i = 0; i < KW.length; i++) if (KW[i][0].test(t)) return KW[i][1];
      }
      return t.replace(/^(التمرين|تمرين)\s*\S*\s*[:：-]\s*/, "").replace(/^(تطبيق مباشر|ربط|وضعية)\s*:\s*/, "").replace(/\s*\(.*$/, "").trim() || t;
    }
    function diagnose() {
      var map = {}, order = [];
      data.forEach(function (ex, i) {
        (ex.questions || []).forEach(function (q) {
          var n = resOf(ex, q);
          if (!map[n]) { map[n] = { n: n, e: 0, p: 0, q: 0, h: 0, ex: i, g: null }; order.push(n); }
          var o = map[n], E = earnedOf(q);
          o.p += +q.pts || 0; o.e += E; o.q++;
          if (E > 0 && leftOf(q) < 3) o.h++;
          if (!o.g && !/وضعية/.test(ex.title || "")) o.g = genFor(ex, q);
        });
      });
      return order.map(function (k) {
        var o = map[k];
        o.r = o.p ? o.e / o.p : 0;
        o.st = o.r >= 0.75 && o.h <= o.q / 2 ? "ok" : o.r < 0.5 ? "low" : "mid";
        return o;
      });
    }
    var filesP = null;
    function remedial(name, cb) {
      if (!filesP) filesP = fetch(ROOT.href + "files.json").then(function (r) { return r.ok ? r.json() : { items: [] }; }).catch(function () { return { items: [] }; });
      var STOP = /^(التمرين|تمرين|تطبيق|مباشر|ربط|الوضعية|الإدماجية|توظيف|الموارد|على|في|من|إلى|مع|حساب)$/;
      function words(s) { return String(s).replace(/[()،,:؛.]/g, " ").split(/\s+/).map(function (w) { return w.replace(/^(و|ال)/, ""); }).filter(function (w) { return w.length >= 3 && !STOP.test(w); }); }
      var W = words(name);
      filesP.then(function (j) {
        var best = null, bs = 0;
        (j.items || []).forEach(function (it) {
          if (it.level !== level || it.type !== "html" || it.url === rel || /وضعية/.test(name)) return;
          var hay = words(it.title + " " + (it.topics || []).join(" ")), s = 0;
          W.forEach(function (w) { if (hay.indexOf(w) >= 0) s++; });
          if (it.section === "dars") s += 0.5;
          if (s >= 1.5 && s > bs) { bs = s; best = it; }
        });
        cb(best);
      });
    }

    function readChallenge() {
      try {
        var m = location.search.match(/[?&]c=([^&#]+)/);
        if (m) {
          var raw = decodeURIComponent(escape(atob(decodeURIComponent(m[1]).replace(/-/g, "+").replace(/_/g, "/"))));
          var o = JSON.parse(raw), c = { n: String(o.n || "").slice(0, 30), s: Math.max(0, Math.min(+o.m || 20, +o.s || 0)), m: Math.max(1, Math.min(100, +o.m || 20)), t: Math.max(0, Math.min(600, Math.round(+o.t || 0))) };
          sessionStorage.setItem("math-chal:" + rel, JSON.stringify(c));
          return c;
        }
        return JSON.parse(sessionStorage.getItem("math-chal:" + rel) || "null");
      } catch (e) { return null; }
    }
    function challenge(name, tu) {
      name = String(name || "").trim().split(/\s+/)[0].slice(0, 15); // first name only in shared links (privacy)
      var r = readScore() || { s: 0, m: 20 }, mins = tu ? Math.max(1, Math.round(tu.ms / 60000)) : 0;
      var code = btoa(unescape(encodeURIComponent(JSON.stringify({ n: name, s: r.s, m: r.m, t: mins })))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      var url = location.href.split("#")[0].split("?")[0] + "?c=" + code;
      var t = document.title.split(" - ")[0];
      var text = "🏁 أحرزتُ " + fmt(r.s) + "/" + r.m + " في «" + t + "»" + (mins ? " خلال " + arN(mins, "min", 1) : "") + "، هل يمكنك التغلب على نتيجتي؟";
      if (navigator.share) { navigator.share({ text: text, url: url }).catch(function () {}); return; }
      copyTxt(text + "\n" + url);
      toast("🔗 نُسخت رسالة التحدي: الصقها لزميلك في واتساب أو ماسنجر.");
    }
    function copyTxt(t) {
      function old() { var a = document.createElement("textarea"); a.value = t; document.body.appendChild(a); a.select(); try { document.execCommand("copy"); } catch (e) {} a.remove(); }
      try { navigator.clipboard.writeText(t).catch(old); } catch (e) { old(); }
    }

    /* 🎓 certificate of this page (2026-11-22 his «شكل مميز… ميّز بين كل شهادة وأخرى»): drawn by assets/cert.js,
       colour, emblem and border of the ACTIVITY of the page (فرض، اختبار، سلسلة، تحدٍّ…), tier from the mark. */
    function certificate(name, cls, rows, tu) {
      function go() {
        var MC = window.MathCert, r = readScore() || { s: 0, m: 20 }, q = r.s / (r.m || 20), mk = MC.fmt(Math.round(q * 20 * 4) / 4);
        var a = MC.byId(MC.PAGEMAP[section] || "series") || MC.CATALOG[2], t = document.title.split(" - ")[0].slice(0, 60);
        var tier = q >= 0.9 ? 2 : q >= 0.8 ? 1 : q >= 0.7 ? 0 : -1;
        var sp = { t: a.t, emb: a.emb, main: a.main, pat: a.pat, tier: tier, name: name, cls: cls, lv: level, why: "تقديرًا لعلامة " + mk + " من 20 في «" + t + "»" };
        if (tier < 0 && q >= 0.5) { sp.t = "شهادة النجاح"; sp.emb = "🎓"; sp.main = "#1d4ed8"; sp.pat = 2; }
        if (q < 0.5) { sp.t = "شهادة المثابرة"; sp.emb = "💪"; sp.main = "#475569"; sp.pat = 4; sp.why = "تقديرًا للمحاولة والمثابرة في «" + t + "»"; }
        MC.needFonts();
        MC.fontsReady().then(function () { MC.share(MC.draw(document.createElement("canvas"), sp), sp.t + " — " + t, toast); });
      }
      if (window.MathCert) return go();
      var sc = document.createElement("script");
      sc.src = ROOT.href + "assets/cert.js";
      sc.onload = go;
      sc.onerror = function () { toast("⚠️ تعذّر تحميل الشهادة، تحقّق من الاتصال."); };
      document.head.appendChild(sc);
    }

    /* exam mode from a link (?exam=60) or an exam in progress */
    var est = exGet();
    if (est) { if (Date.now() >= est.end) setTimeout(function () { finishExam(true); }, 200); else examStart(est); }
    else { var qm = location.search.match(/[?&]exam=(\d{2,3})/); if (qm && EXMIN[section]) examDialog(+qm[1]); }
    genButtons();

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

  /* ---------- 5. tools shared by all pages (2026-11-16) ---------- */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function toast(t) {
    var d = el("div", "sx-toast", esc(t));
    document.body.appendChild(d);
    setTimeout(function () { d.classList.add("out"); }, 3600);
    setTimeout(function () { d.remove(); }, 4200);
  }

  /* ---- 🗣️ reading aloud in Arabic (speechSynthesis); the buttons appear only if the device has an Arabic voice ---- */
  var VOICE = null, voiceWait = [];
  function whenVoice(fn) {
    if (VOICE) return fn();
    voiceWait.push(fn);
    if (voiceWait.length > 1 || !("speechSynthesis" in window) || !window.SpeechSynthesisUtterance) return;
    function pickV() {
      var vs = [];
      try { vs = speechSynthesis.getVoices() || []; } catch (e) {}
      var ar = vs.filter(function (v) { return /^ar([-_]|$)/i.test(v.lang); });
      if (!ar.length) return false;
      VOICE = ar.filter(function (v) { return /DZ/i.test(v.lang); })[0] || ar.filter(function (v) { return /SA/i.test(v.lang); })[0] || ar[0];
      voiceWait.splice(0).forEach(function (f) { try { f(); } catch (e) {} });
      return true;
    }
    if (!pickV()) {
      try { speechSynthesis.addEventListener("voiceschanged", function h() { if (pickV()) speechSynthesis.removeEventListener("voiceschanged", h); }); } catch (e) {}
      setTimeout(pickV, 1500);
    }
  }
  /* maths written for the eye → words for the ear */
  function spoken(node) {
    var d = node.cloneNode(true);
    $$(".sx-say,.sym-toolbar,.sx-chips,button,svg,.star-burst", d).forEach(function (x) { x.remove(); });
    $$(".fr", d).forEach(function (f) {
      var p = f.children;
      if (p.length === 2) f.textContent = " " + p[0].textContent + " على " + p[1].textContent + " ";
    });
    var t = d.textContent;
    return t
      .replace(/[\u{1F300}-\u{1FAFF}☀-➿️]/gu, " ")
      .replace(/PGCD/g, " القاسم المشترك الأكبر ")
      .replace(/√\s*\(([^)]*)\)/g, " جذر $1 ").replace(/√/g, " جذر ")
      .replace(/²/g, " مربع ").replace(/³/g, " مكعب ")
      .replace(/\bcos\b/g, " جيب تمام ").replace(/\bsin\b/g, " جيب ").replace(/\btan\b/g, " ظل ")
      .replace(/(\d)\s*cm²/g, "$1 سنتيمتر مربع").replace(/(\d)\s*m²/g, "$1 متر مربع")
      .replace(/(\d)\s*km\b/g, "$1 كيلومتر").replace(/(\d)\s*cm\b/g, "$1 سنتيمتر").replace(/(\d)\s*mm\b/g, "$1 مليمتر").replace(/(\d)\s*m\b/g, "$1 متر")
      .replace(/(\d)\s*kg\b/g, "$1 كيلوغرام").replace(/(\d)\s*g\b/g, "$1 غرام").replace(/(\d)\s*DA\b/g, "$1 دينار").replace(/\bDA\b/g, " دينار ")
      .replace(/(\d)\s*°/g, "$1 درجة").replace(/π/g, " بي ")
      .replace(/(\d),(\d)/g, "$1 فاصلة $2")
      .replace(/\/\//g, " يوازي ").replace(/(\d)\s*\/\s*(\d)/g, "$1 على $2")
      .replace(/≈/g, " يساوي تقريبا ").replace(/≠/g, " لا يساوي ").replace(/≤/g, " أصغر من أو يساوي ").replace(/≥/g, " أكبر من أو يساوي ")
      .replace(/=/g, " يساوي ").replace(/×/g, " ضرب ").replace(/÷/g, " قسمة ").replace(/\+/g, " زائد ").replace(/[−–]/g, " ناقص ")
      .replace(/(\s|^)-(?=\s*\d)/g, " ناقص ").replace(/</g, " أصغر من ").replace(/>/g, " أكبر من ").replace(/;/g, " و ")
      .replace(/\s+/g, " ").trim();
  }
  var sayCur = null;
  function sayBtn(node) {
    var b = el("button", "sx-say", "🗣️");
    b.type = "button"; b.title = "اقرأ لي"; b.setAttribute("aria-label", "اقرأ النص بصوت عال");
    b.onclick = function (e) {
      e.preventDefault(); e.stopPropagation();
      try { speechSynthesis.cancel(); } catch (x) {}
      if (sayCur === b) { b.classList.remove("on"); sayCur = null; return; }
      if (sayCur) sayCur.classList.remove("on");
      var u = new SpeechSynthesisUtterance(spoken(node));
      u.voice = VOICE; u.lang = VOICE.lang; u.rate = 0.88;
      u.onend = u.onerror = function () { b.classList.remove("on"); if (sayCur === b) sayCur = null; };
      sayCur = b; b.classList.add("on");
      speechSynthesis.speak(u);
    };
    return b;
  }

  /* ---- 📝 scratchpad: finger drawing on squared paper, colours, eraser, undo ---- */
  var pads = {};
  function openPad(key, title, src, html) {
    if (!pads) pads = {};   /* home page: the line above is never reached (the page part returns early) */
    var strokes = pads[key] = pads[key] || [];
    var ov = el("div", "sx-pad");
    var COLS = [["#111827", "أسود"], ["#1d4ed8", "أزرق"], ["#dc2626", "أحمر"], ["#15803d", "أخضر"]];
    ov.innerHTML = '<div class="sx-pad-top"><b>📝 مسودة الحساب</b><span class="t"></span><button type="button" class="x">✕ إغلاق</button></div>' +
      '<div class="sx-pad-tools">' + COLS.map(function (c, i) { return '<button type="button" class="col' + (i === 0 ? " on" : "") + '" data-c="' + c[0] + '" aria-label="' + c[1] + '"><i style="background:' + c[0] + '"></i></button>'; }).join("") +
      '<button type="button" class="w" data-w="2.6">✏️ رفيع</button><button type="button" class="er">🧽 ممحاة</button><button type="button" class="un">↶ تراجع</button><button type="button" class="cl">🗑️ مسح</button></div>' +
      (src || html ? '<details class="sx-pad-q" open><summary>📄 نص التمرين (اضغط للتصغير)</summary><div></div></details>' : "") +
      '<div class="sx-pad-area"><canvas></canvas></div><div class="sx-pad-note">المسودة لا تُصحَّح ولا تُرسل: اكتب بإصبعك، ثم انقل النتيجة مع الوحدة إلى خانة الجواب.</div>';
    $(".t", ov).textContent = title || "";
    if (html && !src) { var hq = $(".sx-pad-q div", ov); hq.appendChild(el("div", "", html)); $$("button,input,.sx-say", hq).forEach(function (x) { x.remove(); }); }
    if (src) {
      var q = $(".sx-pad-q div", ov), cb = $(".context-box", src);
      if (cb) q.appendChild(el("p", "", cb.innerHTML));
      /* each question stays visible with its own answer box: the result found on the draft goes straight to the page */
      $$(".q-box", src).forEach(function (box) {
        var s = $(".q-title > span:first-child", box), inp = $("input[id^='in-']", box), btn = $(".btn-check", box), fb = $(".feedback-box", box);
        if (!s) return;
        var w = el("div", "pq"), pp = el("p", "", s.innerHTML);
        $$(".sx-say", pp).forEach(function (x) { x.parentNode.removeChild(x); });
        w.appendChild(pp);
        if (inp && btn && !$$(".sx-choice", box).length) {
          var row = el("div", "pa", '<input type="text" autocomplete="off" placeholder="جوابك (مع الوحدة)"><button type="button">✔ انقل وتحقق</button>'),
            mi = $("input", row), mb = $("button", row), pf = el("div", "pf");
          if (inp.inputMode) mi.inputMode = inp.inputMode;
          var sync = function () {
            if (inp.disabled) mi.value = inp.value;
            mi.disabled = mb.disabled = inp.disabled;
            var t = fb ? fb.textContent.replace(/\s+/g, " ").trim() : "";
            pf.textContent = t.length > 160 ? t.slice(0, 160) + "…" : t;
            pf.className = "pf" + (box.classList.contains("solved") ? " ok" : t ? " no" : "");
          };
          mb.onclick = function () {
            if (!mi.value.trim() || inp.disabled) return;
            inp.value = mi.value; btn.click();
            setTimeout(sync, 200);
          };
          mi.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); mb.click(); } });
          sync();
          w.appendChild(row); w.appendChild(pf);
        }
        q.appendChild(w);
      });
      $$(".sx-say", q).forEach(function (x) { x.remove(); });
    }
    document.body.appendChild(ov);
    document.documentElement.classList.add("sx-noscroll");
    var cv = $("canvas", ov), area = $(".sx-pad-area", ov), ctx = cv.getContext("2d");
    var color = COLS[0][0], width = 2.6, erase = false, cur = null, dpr = Math.min(3, window.devicePixelRatio || 1);
    function size() {
      var r = area.getBoundingClientRect();
      cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
      cv.style.width = r.width + "px"; cv.style.height = r.height + "px";
      redraw();
    }
    function line(s, a, b) {
      ctx.globalCompositeOperation = s.er ? "destination-out" : "source-over";
      ctx.strokeStyle = s.c; ctx.lineWidth = s.w * dpr; ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.beginPath(); ctx.moveTo(a[0] * dpr, a[1] * dpr); ctx.lineTo(b[0] * dpr, b[1] * dpr); ctx.stroke();
    }
    function redraw() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      strokes.forEach(function (s) { for (var i = 0; i < s.p.length; i++) line(s, s.p[Math.max(0, i - 1)], s.p[i]); });
    }
    function pos(e) { var r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
    cv.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      try { cv.setPointerCapture(e.pointerId); } catch (x) {}
      cur = { c: color, w: erase ? 26 : width, er: erase, p: [pos(e)] };
      strokes.push(cur); line(cur, cur.p[0], cur.p[0]);
    });
    cv.addEventListener("pointermove", function (e) {
      if (!cur) return;
      e.preventDefault();
      var p = pos(e), l = cur.p[cur.p.length - 1];
      if (Math.abs(p[0] - l[0]) + Math.abs(p[1] - l[1]) < 1.2) return;
      cur.p.push(p); line(cur, l, p);
    });
    function up() { cur = null; }
    cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up); cv.addEventListener("pointerleave", up);
    $$(".col", ov).forEach(function (b) {
      b.onclick = function () { color = b.dataset.c; erase = false; $$(".col,.er", ov).forEach(function (x) { x.classList.toggle("on", x === b); }); };
    });
    $(".w", ov).onclick = function () { width = width < 4 ? 5.5 : 2.6; this.textContent = width < 4 ? "✏️ رفيع" : "🖍️ عريض"; };
    $(".er", ov).onclick = function () { erase = true; $$(".col", ov).forEach(function (x) { x.classList.remove("on"); }); this.classList.add("on"); };
    $(".un", ov).onclick = function () { strokes.pop(); redraw(); };
    $(".cl", ov).onclick = function () { strokes.length = 0; redraw(); };
    function close() { ov.remove(); document.documentElement.classList.remove("sx-noscroll"); window.removeEventListener("resize", size); }
    $(".x", ov).onclick = close;
    window.addEventListener("resize", size);
    var det = $(".sx-pad-q", ov); if (det) det.addEventListener("toggle", function () { setTimeout(size, 30); });
    setTimeout(size, 20);
  }

  /* ---- 🔄 similar exercise with new numbers (only for types that can be generated safely, by level) ----
     Each generator gives: question, accepted answers, hint 1, hint 2, model answer (الطريقة, steps, النتيجة, الاستنتاج). */
  function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function dn(v) { return String(Math.round(v * 1000) / 1000).replace(".", ",").replace(/^-/, "−"); }
  function M(s) { return '<span class="math">' + s + "</span>"; }
  function FR(a, b) { return '<span class="fr"><span>' + a + "</span><span>" + b + "</span></span>"; }
  function sg(n) { return n < 0 ? "−" + Math.abs(n) : String(n); }
  function par(n) { return n < 0 ? "(−" + Math.abs(n) + ")" : "(+" + n + ")"; }
  function pn(n) { return n < 0 ? "(−" + Math.abs(n) + ")" : String(n); }
  function SF(n, d) { return d === 1 ? sg(n) : n < 0 ? "−" + FR(-n, d) : FR(n, d); }
  function euclid(a, b) { var L = []; while (b) { var q = Math.floor(a / b), r = a % b; L.push(a + " = " + b + " × " + q + " + " + r); a = b; b = r; } return { L: L, g: a }; }
  /* n / 10^s written with a decimal comma */
  function decS(n, s) {
    if (s <= 0) return String(n * Math.pow(10, -s));
    var t = String(Math.abs(n));
    while (t.length <= s) t = "0" + t;
    var i = t.length - s, r = (t.slice(0, i) + "," + t.slice(i)).replace(/,?0+$/, "");
    return (n < 0 ? "−" : "") + r;
  }
  function decFix(n, s) { var t = String(n); if (!s) return t; while (t.length <= s) t = "0" + t; return t.slice(0, t.length - s) + "," + t.slice(t.length - s); }
  function fracAns(P, Q) { if (Q < 0) { P = -P; Q = -Q; } var g = gcd(P, Q), p = P / g, q = Q / g; return q === 1 ? [String(p)] : [p + "/" + q]; }
  function equivFrac(P, Q) {
    return function (v) {
      var m = String(v).match(/^(-?\d+)\/(-?\d+)$/);
      if (m && +m[2] !== 0) return +m[1] * Q === +m[2] * P;
      return /^-?\d+$/.test(v) ? +v * Q === P : false;
    };
  }
  /* reduction written in place (detailed-solutions rule) */
  function reduceLine(name, P, Q) {
    if (Q < 0) { P = -P; Q = -Q; }
    var g = gcd(P, Q);
    if (g === 1) return [];
    var p = P / g, q = Q / g, n = P < 0 ? "−" : "";
    return [M(name + " = " + n + FR(Math.abs(P) + " ÷ " + g, Q + " ÷ " + g) + " = " + SF(p, q))];
  }
  var GEN = genBank();
  function genBank() {
  var SMSG = "إجابتك تساوي النتيجة، لكنها ليست على أبسط شكل: أكمل الاختزال (اقسم البسط والمقام على قاسمهما المشترك الأكبر).";
  return {
    pgcd: function () {
      var g, n, m, a, b;
      do { g = ri(4, 45); n = ri(2, 14); m = ri(n + 1, 3 * n); a = g * m; b = g * n; } while (gcd(m, n) !== 1 || a > 1500);
      var E = euclid(a, b), P = M("PGCD(" + a + " ; " + b + ")");
      return { q: "عيّن " + P + " باستعمال خوارزمية إقليدس.", ans: [String(g)],
        h1: "اقسم " + M(a) + " على " + M(b) + "، ثم اقسم القاسم على الباقي، وكرّر حتى تحصل على باقٍ معدوم.",
        h2: "أول قسمة: " + M(E.L[0]) + ". القاسم المشترك الأكبر هو آخر باقٍ غير معدوم.",
        steps: ["<b>الطريقة:</b> خوارزمية إقليدس: نقسم العدد الأكبر على الأصغر، ثم نقسم القاسم على الباقي، ونكرر حتى نحصل على باقٍ معدوم. القاسم المشترك الأكبر هو آخر باقٍ غير معدوم."]
          .concat(E.L.map(M), ["آخر باقٍ غير معدوم " + M(g)]),
        res: "النتيجة: " + M("PGCD(" + a + " ; " + b + ") = " + g), concl: "<b>الاستنتاج:</b> " + M("PGCD(" + a + " ; " + b + ") = " + g) + "." };
    },
    irr: function () {
      var g, n, m;
      do { g = ri(6, 40); n = ri(2, 16); m = ri(n + 1, 3 * n); } while (gcd(n, m) !== 1 || g * m > 1200);
      var a = g * n, b = g * m, E = euclid(b, a);
      return { q: "اكتب الكسر " + M(FR(a, b)) + " على شكل كسر غير قابل للاختزال.", ans: [n + "/" + m], chip: "➗ اكتب الكسر هكذا: البسط / المقام",
        h1: "احسب أولا " + M("PGCD(" + b + " ; " + a + ")") + " بخوارزمية إقليدس.",
        h2: "اقسم البسط والمقام على " + M("PGCD(" + b + " ; " + a + ")") + "، وهو آخر باقٍ غير معدوم في خوارزمية إقليدس.",
        steps: ["<b>الطريقة:</b> خاصية: بقسمة البسط والمقام على قاسمهما المشترك الأكبر نحصل على كسر غير قابل للاختزال."]
          .concat(E.L.map(M), [M("PGCD(" + b + " ; " + a + ") = " + g), M(a + " ÷ " + g + " = " + n) + " و" + M(b + " ÷ " + g + " = " + m)]),
        res: "النتيجة: " + M(FR(a, b) + " = " + FR(a + " ÷ " + g, b + " ÷ " + g) + " = " + FR(n, m)),
        concl: "<b>الاستنتاج:</b> " + M(FR(n, m)) + " غير قابل للاختزال لأن " + M("PGCD(" + n + " ; " + m + ") = 1") + ".",
        simp: equivFrac(a, b), sm: SMSG };
    },
    aroot: function () {
      var m, k, N;
      do { m = pick([2, 3, 5, 6, 7, 10, 11]); k = ri(2, 9); N = k * k * m; } while (N > 450);
      var R = M("√" + N + " = " + k + "√" + m);
      return { q: "اكتب " + M("√" + N) + " على الشكل " + M("a√b") + " حيث " + M("a") + " و" + M("b") + " عددان طبيعيان و" + M("b") + " أصغر ما يمكن.",
        ans: [k + "√" + m], chip: "√ على الشكل a√b",
        h1: "ابحث عن أكبر مربع تام يقسم " + M(N) + " من بين " + M("4 ; 9 ; 16 ; 25 ; 36 ; 49 ; 64 ; 81") + ".",
        h2: "اكتب " + M(N) + " على شكل جداء مربع تام في عدد آخر، ثم استعمل " + M("√(a × b) = √a × √b") + ".",
        steps: ["<b>الطريقة:</b> خاصية: " + M("√(a × b) = √a × √b") + " حيث a وb موجبان. نكتب العدد تحت الجذر على شكل جداء مربع تام (أكبر ما يمكن) في عدد آخر.",
          M("√" + N + " = √(" + k * k + " × " + m + ")"), M("√" + N + " = √" + k * k + " × √" + m)],
        res: "النتيجة: " + R, concl: "<b>الاستنتاج:</b> " + R + " أي " + M("a = " + k) + " و" + M("b = " + m) + ".",
        simp: function (v) { var mm = String(v).match(/^(\d+)√(\d+)$/); return !!(mm && +mm[1] * +mm[1] * +mm[2] === N); },
        sm: "إجابتك تساوي العدد، لكن " + M("b") + " ليس أصغر ما يمكن: ابحث عن مربع تام أكبر يقسم العدد تحت الجذر." };
    },
    rootsum: function () {
      var m, ks, cs, sn, v;
      do {
        m = pick([2, 3, 5, 7]); ks = [ri(2, 5), ri(2, 5), ri(2, 5)]; cs = [ri(1, 3), ri(1, 3), ri(1, 3)]; sn = [1, pick([1, -1]), pick([1, -1])];
        v = cs[0] * ks[0] + sn[1] * cs[1] * ks[1] + sn[2] * cs[2] * ks[2];
      } while (v <= 0 || ks[0] === ks[1] || ks[1] === ks[2] || ks[0] === ks[2] || ks.some(function (k) { return k * k * m > 200; }));
      function op(i) { return sn[i] > 0 ? " + " : " − "; }
      function term(i) { return (cs[i] === 1 ? "" : cs[i]) + "√" + ks[i] * ks[i] * m; }
      var co = cs.map(function (c, i) { return c * ks[i]; });
      var lines = [0, 1, 2].map(function (i) {
        var N = ks[i] * ks[i] * m, base = "√(" + ks[i] * ks[i] + " × " + m + ")";
        return M(cs[i] === 1 ? "√" + N + " = " + base + " = " + ks[i] + "√" + m : cs[i] + "√" + N + " = " + cs[i] + " × " + base + " = " + cs[i] + " × " + ks[i] + "√" + m + " = " + co[i] + "√" + m);
      });
      var A = (v === 1 ? "" : v) + "√" + m;
      return { q: "لدينا " + M("A = " + term(0) + op(1) + term(1) + op(2) + term(2)) + "<br>اكتب " + M("A") + " على الشكل " + M("a√" + m) + " حيث " + M("a") + " عدد طبيعي.",
        ans: v === 1 ? ["√" + m, "1√" + m] : [v + "√" + m], chip: "√ على الشكل a√" + m,
        h1: "بسّط كل جذر وحده: اكتب العدد تحت الجذر على شكل جداء مربع تام في " + M(m) + ".",
        h2: "بعد التبسيط تصبح كل الحدود من الشكل " + M("…√" + m) + "، فاجمع المعاملات كما في " + M("5x − 2x + x = (5 − 2 + 1)x") + ".",
        steps: ["<b>الطريقة:</b> خاصية: " + M("√(a × b) = √a × √b") + " حيث a وb موجبان. نبسّط كل جذر، ثم نجمع الحدود التي لها نفس الجذر " + M("√" + m) + "."]
          .concat(lines, [M("A = " + co[0] + "√" + m + op(1) + co[1] + "√" + m + op(2) + co[2] + "√" + m), M("A = (" + co[0] + op(1) + co[1] + op(2) + co[2] + ")√" + m)]),
        res: "النتيجة: " + M("A = " + A), concl: "<b>الاستنتاج:</b> " + M("A = " + A) + "." };
    },
    thales: function () {
      var ask = pick(["AN", "MN"]), AB, AM, X;
      do { AB = ri(4, 15); AM = ri(2, AB - 1); X = ri(3, 18); } while ((AM * X * 10) % AB !== 0 || X === AB);
      var v = AM * X / AB, den = ask === "AN" ? "AC" : "BC";
      return { q: M("ABC") + " مثلث، " + M("M") + " نقطة من " + M("[AB]") + " و" + M("N") + " نقطة من " + M("[AC]") + " حيث " + M("(MN) // (BC)") + ".<br>" +
          M("AM = " + AM + " cm") + " ، " + M("AB = " + AB + " cm") + " ، " + M(den + " = " + X + " cm") + ".<br>احسب الطول " + M(ask) + " (بـ cm).",
        ans: [dn(v)].concat(v % 1 ? fracAns(AM * X, AB) : []), unit: "cm",
        h1: "المستقيمان " + M("(MN)") + " و" + M("(BC)") + " متوازيان: استعمل خاصية طالس في المثلث " + M("ABC") + ".",
        h2: "اكتب المساواة " + M(FR("AM", "AB") + " = " + FR(ask, den)) + " ثم احسب بالجداء المتصالب.",
        steps: ["<b>الطريقة:</b> خاصية طالس: النقط " + M("A") + " و" + M("M") + " و" + M("B") + " في استقامية، والنقط " + M("A") + " و" + M("N") + " و" + M("C") + " في استقامية وبنفس الترتيب، و" + M("(MN) // (BC)") + "، إذن:",
          M(FR("AM", "AB") + " = " + FR("AN", "AC") + " = " + FR("MN", "BC")), M(FR(AM, AB) + " = " + FR(ask, X)), M(ask + " = " + FR(AM + " × " + X, AB)), M(ask + " = " + FR(AM * X, AB))],
        res: "النتيجة: " + M(ask + " = " + dn(v) + " cm"), concl: "<b>الاستنتاج:</b> طول " + M(ask) + " هو " + M(dn(v) + " cm") + "." };
    },
    trig: function () {
      var h = ri(40, 150) / 10, th = ri(20, 70), f = pick(["cos", "sin"]), R = Math.PI / 180;
      var val = h * (f === "cos" ? Math.cos(th * R) : Math.sin(th * R)), side = f === "cos" ? "AB" : "AC";
      var r1 = Math.round(val * 10) / 10, fl = Math.floor(val * 10) / 10, ce = Math.ceil(val * 10) / 10;
      return { q: M("ABC") + " مثلث قائم في " + M("A") + " حيث " + M("BC = " + dn(h) + " cm") + " وقيس الزاوية " + M("ABC") + " هو " + M(th + "°") + ".<br>احسب الطول " + M(side) + " ثم أعط قيمته المقرّبة إلى " + M("0,1") + " (بـ cm).",
        ans: [dn(r1), dn(fl), dn(ce)], unit: "cm", chip: "🎯 قيمة مقرّبة إلى 0,1",
        h1: M("BC") + " هو الوتر، و" + M(side) + " هو الضلع " + (f === "cos" ? "المجاور" : "المقابل") + " للزاوية " + M("ABC") + ": أيّ نسبة مثلثية تربطهما؟",
        h2: "استعمل " + M(f + " ABC = " + FR(side, "BC")) + " ثم اضرب في " + M("BC") + " (الحاسبة على الدرجات DEG).",
        steps: ["<b>الطريقة:</b> في المثلث " + M("ABC") + " القائم في " + M("A") + ": " + (f === "cos" ? "جيب تمام زاوية حادة = الضلع المجاور ÷ الوتر." : "جيب زاوية حادة = الضلع المقابل ÷ الوتر."),
          M(f + " ABC = " + FR(side, "BC")), M(f + " " + th + "° = " + FR(side, dn(h))), M(side + " = " + dn(h) + " × " + f + " " + th + "°"), M(side + " ≈ " + dn(Math.round(val * 1000) / 1000))],
        res: "النتيجة: " + M(side + " ≈ " + dn(r1) + " cm"), concl: "<b>الاستنتاج:</b> " + M(side + " ≈ " + dn(r1) + " cm") + " (قيمة مقرّبة إلى " + M("0,1") + ")." };
    },
    relmul: function () {
      var a, b, c, v, expr, abs;
      if (Math.random() < 0.6) {
        do { a = ri(2, 9) * pick([1, -1]); b = ri(2, 9) * pick([1, -1]); c = ri(2, 6) * pick([1, -1]); } while (a > 0 && b > 0 && c > 0);
        v = a * b * c; expr = par(a) + " × " + par(b) + " × " + par(c);
        abs = Math.abs(a) + " × " + Math.abs(b) + " × " + Math.abs(c) + " = " + Math.abs(v);
      } else {
        var t; do { a = ri(2, 9) * pick([1, -1]); c = ri(2, 9) * pick([1, -1]); t = ri(2, 6) * pick([1, -1]); } while (a > 0 && c > 0 && t > 0);
        b = c * t; v = a * t; expr = par(a) + " × " + par(b) + " ÷ " + par(c);
        abs = Math.abs(a) + " × " + Math.abs(b) + " ÷ " + Math.abs(c) + " = " + Math.abs(a * b) + " ÷ " + Math.abs(c) + " = " + Math.abs(v);
      }
      var neg = [a, b, c].filter(function (n) { return n < 0; }).length;
      return { q: "احسب: " + M("A = " + expr),
        ans: [String(v)],
        h1: "ابدأ بإشارة النتيجة: عُدّ الأعداد السالبة.",
        h2: "عدد الأعداد السالبة " + M(neg) + "؛ إن كان زوجيا فالنتيجة موجبة، وإن كان فرديا فهي سالبة. ثم احسب بالمسافات إلى الصفر.",
        steps: ["<b>الطريقة:</b> قاعدة الإشارات: جداء (أو حاصل قسمة) أعداد نسبية يكون موجبا إذا كان عدد العوامل السالبة زوجيا، وسالبا إذا كان فرديا؛ ثم نحسب بالمسافات إلى الصفر.",
          "عدد العوامل السالبة " + M(neg) + " وهو " + (neg % 2 ? "فردي، إذن الإشارة " + M("−") : "زوجي، إذن الإشارة " + M("+")) + ".", M(abs)],
        res: "النتيجة: " + M("A = " + sg(v)), concl: "<b>الاستنتاج:</b> " + M("A = " + sg(v)) + "." };
    },
    fracop: function () {
      var op = pick(["×", "÷", "+", "−"]), a, b, c, d, P, Q, L;
      function rf() { var den = ri(2, 9), num; do { num = ri(1, 11) * pick([1, 1, -1]); } while (gcd(num, den) !== 1); return [num, den]; }
      do {
        var f1 = rf(), f2 = rf(); a = f1[0]; b = f1[1]; c = f2[0]; d = f2[1];
        if (op === "×") { P = a * c; Q = b * d; }
        else if (op === "÷") { P = a * d; Q = b * c; }
        else { L = b * d / gcd(b, d); P = a * (L / b) + (op === "+" ? 1 : -1) * c * (L / d); Q = L; }
        if (Q < 0) { P = -P; Q = -Q; }
      } while (P === 0 || Q > 72 || Math.abs(P) > 120 || (op === "+" || op === "−") && b === d);
      var B = c < 0 ? "(" + SF(c, d) + ")" : SF(c, d), expr = SF(a, b) + " " + op + " " + B, steps, meth;
      if (op === "×" || op === "÷") {
        var cc = op === "÷" ? d * (c < 0 ? -1 : 1) : c, dd = op === "÷" ? Math.abs(c) : d;
        meth = op === "÷" ? "القسمة على عدد ناطق غير معدوم هي الضرب في مقلوبه، ثم نضرب البسطين معا والمقامين معا (مع قاعدة الإشارات)، ثم نختزل."
          : "لضرب عددين ناطقين نضرب البسطين معا والمقامين معا (مع قاعدة الإشارات)، ثم نختزل.";
        steps = (op === "÷" ? [M("A = " + SF(a, b) + " × " + (cc < 0 ? "(" + SF(cc, dd) + ")" : SF(cc, dd)))] : [])
          .concat([M("A = " + FR(pn(a) + " × " + pn(cc), b + " × " + dd)), M("A = " + SF(a * cc, b * dd))]);
      } else {
        var A1 = a * (L / b), C1 = c * (L / d);
        meth = "نوحّد المقامين (نأخذ المضاعف المشترك الأصغر " + M(L) + ")، ثم " + (op === "+" ? "نجمع" : "نطرح") + " البسطين ونحتفظ بالمقام المشترك، ثم نختزل.";
        steps = [M("A = " + SF(A1, L) + " " + op + " " + (C1 < 0 ? "(" + SF(C1, L) + ")" : SF(C1, L))), M("A = " + FR(pn(A1) + " " + op + " " + pn(C1), L)), M("A = " + SF(P, Q))];
      }
      steps = ["<b>الطريقة:</b> " + meth].concat(steps, reduceLine("A", P, Q));
      var ans = fracAns(P, Q), g = gcd(P, Q), res = SF(P / g, Q / g);
      return { q: "احسب العدد الناطق " + M("A") + " ثم اكتبه على أبسط شكل:<br>" + M("A = " + expr), ans: ans, chip: "➗ اكتب الكسر هكذا: البسط / المقام",
        h1: op === "÷" ? "القسمة على كسر هي الضرب في مقلوبه." : op === "×" ? "اضرب البسطين معا والمقامين معا، وانتبه للإشارة." : "وحّد المقامين أولا: ابحث عن مضاعف مشترك للمقامين " + M(b) + " و" + M(d) + ".",
        h2: "طبّق قاعدة الإشارات، ثم اختزل الكسر الناتج بقسمة البسط والمقام على قاسمهما المشترك الأكبر.",
        steps: steps, res: "النتيجة: " + M("A = " + res), concl: "<b>الاستنتاج:</b> " + M("A = " + res) + " على أبسط شكل.",
        simp: equivFrac(P, Q), sm: SMSG };
    },
    midline: function () {
      var inv = Math.random() < 0.4, x10 = ri(30, 160), v;
      var data = inv ? M("IJ = " + dn(x10 / 10) + " cm") : M("BC = " + dn(x10 / 10) + " cm"), ask = inv ? "BC" : "IJ";
      v = inv ? x10 / 5 : x10 / 20;
      return { q: M("ABC") + " مثلث، " + M("I") + " منتصف " + M("[AB]") + " و" + M("J") + " منتصف " + M("[AC]") + "، و" + data + ".<br>احسب الطول " + M(ask) + " (بـ cm).",
        ans: [dn(v)], unit: "cm",
        h1: M("I") + " و" + M("J") + " منتصفا ضلعين في المثلث: تذكّر خاصية مستقيم المنتصفين.",
        h2: "طول القطعة الواصلة بين منتصفي ضلعين يساوي نصف طول الضلع الثالث: " + M("IJ = " + FR("BC", 2)) + ".",
        steps: ["<b>الطريقة:</b> خاصية مستقيم المنتصفين: في مثلث، طول القطعة الواصلة بين منتصفي ضلعين يساوي نصف طول الضلع الثالث.",
          "في المثلث " + M("ABC") + ": " + M("I") + " منتصف " + M("[AB]") + " و" + M("J") + " منتصف " + M("[AC]") + "، إذن " + M("IJ = " + FR("BC", 2)),
          inv ? M("BC = 2 × IJ = 2 × " + dn(x10 / 10)) : M("IJ = " + FR(dn(x10 / 10), 2))],
        res: "النتيجة: " + M(ask + " = " + dn(v) + " cm"), concl: "<b>الاستنتاج:</b> " + M(ask + " = " + dn(v) + " cm") + "." };
    },
    prio: function () {
      var f = ri(1, 5), a, b, c, d, s, v, L;
      if (f === 1) { a = ri(5, 60); b = ri(2, 12); c = ri(2, 12); s = a + " + " + b + " × " + c; L = [a + " + " + b * c]; v = a + b * c; }
      else if (f === 2) { b = ri(2, 12); c = ri(2, 12); a = ri(b * c + 1, b * c + 60); s = a + " − " + b + " × " + c; L = [a + " − " + b * c]; v = a - b * c; }
      else if (f === 3) { a = ri(2, 20); b = ri(2, 20); c = ri(2, 9); s = "(" + a + " + " + b + ") × " + c; L = [(a + b) + " × " + c]; v = (a + b) * c; }
      else if (f === 4) { c = ri(2, 9); b = c * ri(2, 12); a = ri(2, 12); d = ri(2, 9); s = a + " × " + d + " + " + b + " ÷ " + c; L = [a * d + " + " + b / c]; v = a * d + b / c; }
      else { a = ri(2, 9); c = ri(2, 15); b = c + ri(1, 12); d = ri(1, 30); s = d + " + " + a + " × (" + b + " − " + c + ")"; L = [d + " + " + a + " × " + (b - c), d + " + " + a * (b - c)]; v = d + a * (b - c); }
      return { q: "احسب: " + M("A = " + s), ans: [String(v)],
        h1: "تذكّر الأولويات: الأقواس أولا، ثم الضرب والقسمة، ثم الجمع والطرح.",
        h2: "ابدأ بـ " + M(f === 3 || f === 5 ? "( … )" : f === 4 ? "×  و  ÷" : "×") + " ثم أكمل الحساب.",
        steps: ["<b>الطريقة:</b> الأولويات: نحسب ما بين الأقواس أولا، ثم الضرب والقسمة، ثم الجمع والطرح من اليسار إلى اليمين.", M("A = " + s)].concat(L.map(function (l) { return M("A = " + l); })),
        res: "النتيجة: " + M("A = " + v), concl: "<b>الاستنتاج:</b> " + M("A = " + v) + "." };
    },
    eucl: function () {
      var b = ri(6, 25), a, q, r;
      do { a = ri(100, 999); q = Math.floor(a / b); r = a % b; } while (r === 0);
      return { q: "أنجز القسمة الإقليدية للعدد " + M(a) + " على " + M(b) + "، ثم اكتب حاصل القسمة والباقي مفصولين بـ " + M(";") + ".",
        ans: [q + ";" + r], chip: "اكتب: حاصل القسمة ; الباقي",
        h1: "ابحث عن أكبر مضاعف للعدد " + M(b) + " لا يتجاوز " + M(a) + ".",
        h2: "تحقّق: المقسوم = القاسم × حاصل القسمة + الباقي، والباقي أصغر من " + M(b) + ".",
        steps: ["<b>الطريقة:</b> في القسمة الإقليدية: المقسوم = القاسم × حاصل القسمة + الباقي، مع الباقي أصغر من القاسم.",
          M(b + " × " + q + " = " + b * q), M(a + " − " + b * q + " = " + r), M(r + " < " + b)],
        res: "النتيجة: " + M(a + " = " + b + " × " + q + " + " + r), concl: "<b>الاستنتاج:</b> حاصل القسمة " + M(q) + " والباقي " + M(r) + "." };
    },
    frac2: function () {
      var op = pick(["+", "−", "×"]), a, b, c, d, k, P, Q, steps;
      if (op === "×") {
        do { a = ri(1, 9); b = ri(2, 9); c = ri(1, 9); d = ri(2, 9); } while (gcd(a, b) !== 1 || gcd(c, d) !== 1);
        P = a * c; Q = b * d;
        steps = ["<b>الطريقة:</b> لضرب كسرين نضرب البسطين معا والمقامين معا، ثم نختزل إن أمكن.", M("A = " + FR(a + " × " + c, b + " × " + d)), M("A = " + FR(P, Q))];
      } else {
        do { b = ri(2, 9); k = ri(2, 4); d = b * k; a = ri(1, 2 * b); c = ri(1, 2 * d); P = op === "+" ? a * k + c : a * k - c; } while (gcd(a, b) !== 1 || gcd(c, d) !== 1 || P <= 0 || d > 36);
        Q = d;
        steps = ["<b>الطريقة:</b> نجعل للكسرين نفس المقام، ثم " + (op === "+" ? "نجمع" : "نطرح") + " البسطين ونحتفظ بالمقام، ثم نختزل إن أمكن.",
          M(FR(a, b) + " = " + FR(a + " × " + k, b + " × " + k) + " = " + FR(a * k, d)), M("A = " + FR(a * k, d) + " " + op + " " + FR(c, d) + " = " + FR(a * k + " " + op + " " + c, d)), M("A = " + FR(P, Q))];
      }
      steps = steps.concat(reduceLine("A", P, Q));
      var g = gcd(P, Q), res = SF(P / g, Q / g), B = op === "×" ? FR(c, d) : FR(c, d);
      return { q: "احسب، ثم اختزل النتيجة إن أمكن: " + M("A = " + FR(a, b) + " " + op + " " + B), ans: fracAns(P, Q), chip: "➗ اكتب الكسر هكذا: البسط / المقام",
        h1: op === "×" ? "اضرب البسطين معا والمقامين معا." : "المقام " + M(d) + " مضاعف للمقام " + M(b) + ": اجعل للكسرين نفس المقام.",
        h2: "بعد الحساب، اختزل الكسر بقسمة البسط والمقام على نفس العدد.",
        steps: steps, res: "النتيجة: " + M("A = " + res), concl: "<b>الاستنتاج:</b> " + M("A = " + res) + ".", simp: equivFrac(P, Q), sm: SMSG };
    },
    x10: function () {
      var s = ri(1, 2), n = ri(101, 99999), o = pick([["×", 1], ["×", 2], ["×", 3], ["÷", 1], ["÷", 2], ["÷", 3], ["×0", 1], ["×0", 2]]);
      var k = o[1], by = o[0] === "×0" ? (k === 1 ? "0,1" : "0,01") : String(Math.pow(10, k)), sym = o[0] === "÷" ? "÷" : "×";
      var right = o[0] === "×", x = decS(n, s), r = decS(n, right ? s - k : s + k), mr = ["", "بمرتبة واحدة", "بمرتبتين", "بثلاث مراتب"][k];
      var meth = o[0] === "×" ? "لضرب عدد عشري في " + M(by) + " نزيح الفاصلة نحو اليمين " + mr + "، ونضيف أصفارا عند الحاجة."
        : o[0] === "÷" ? "لقسمة عدد عشري على " + M(by) + " نزيح الفاصلة نحو اليسار " + mr + "، ونضيف أصفارا عند الحاجة."
          : "الضرب في " + M(by) + " يعني القسمة على " + M(k === 1 ? 10 : 100) + ": نزيح الفاصلة نحو اليسار " + mr + ".";
      return { q: "احسب: " + M(x + " " + sym + " " + by), ans: [r.replace("−", "-")],
        h1: "لا حاجة إلى عملية عمودية: يكفي أن تزيح الفاصلة.",
        h2: (right ? "نحو اليمين " : "نحو اليسار ") + mr + ".",
        steps: ["<b>الطريقة:</b> " + meth, M(x + " " + sym + " " + by + " = " + r)],
        res: "النتيجة: " + M(r), concl: "<b>الاستنتاج:</b> " + M(x + " " + sym + " " + by + " = " + r) + "." };
    },
    decops: function () {
      var op = pick(["+", "−"]), s1 = ri(1, 2), s2 = ri(0, 2), a, b;
      do { a = ri(100, 9999); b = ri(10, 999); } while (a % 10 === 0 || (s2 && b % 10 === 0));
      var S = Math.max(s1, s2);
      var A = a * Math.pow(10, S - s1), B = b * Math.pow(10, S - s2);
      if (op === "−" && B >= A) { var t = A; A = B; B = t; t = a; a = b; b = t; t = s1; s1 = s2; s2 = t; }
      var R = op === "+" ? A + B : A - B, x = decS(a, s1), y = decS(b, s2), r = decS(R, S);
      var l1 = decFix(A, S), l2 = decFix(B, S), l3 = decFix(R, S), w = Math.max(l1.length, l2.length, l3.length) + 2;
      function pad(t, p) { while (t.length < w) t = " " + t; return p + t.slice(1); }
      var vert = '<pre class="sx-vert" dir="ltr">' + pad(l1, " ") + "\n" + pad(l2, op === "+" ? "+" : "−") + "\n" + new Array(w + 1).join("—") + "\n" + pad(l3, " ") + "</pre>";
      return { q: "احسب: " + M(x + " " + op + " " + y), ans: [r],
        h1: "اكتب العددين عموديا بحيث تكون الفاصلة تحت الفاصلة.",
        h2: "تمّم بالأصفار حتى يكون للعددين نفس عدد الأرقام بعد الفاصلة، ثم " + (op === "+" ? "اجمع" : "اطرح") + " كما في الأعداد الطبيعية.",
        steps: ["<b>الطريقة:</b> نكتب العددين عموديا: الفاصلة تحت الفاصلة والأرقام من نفس المرتبة بعضها تحت بعض، ونتمّم بالأصفار، ثم " + (op === "+" ? "نجمع" : "نطرح") + " ونضع الفاصلة في مكانها.", vert],
        res: "النتيجة: " + M(x + " " + op + " " + y + " = " + r), concl: "<b>الاستنتاج:</b> " + M(x + " " + op + " " + y + " = " + r) + "." };
    },
    rect: function () {
      var sq = Math.random() < 0.35, area = Math.random() < 0.5, u = pick(["cm", "m"]), L = ri(3, 25), l = sq ? L : ri(2, L - 1), v, f, calc;
      if (sq) { v = area ? L * L : L * 4; f = area ? "مساحة المربع = طول الضلع × طول الضلع" : "محيط المربع = طول الضلع × 4"; calc = area ? L + " × " + L : L + " × 4"; }
      else { v = area ? L * l : (L + l) * 2; f = area ? "مساحة المستطيل = الطول × العرض" : "محيط المستطيل = (الطول + العرض) × 2"; calc = area ? L + " × " + l : "(" + L + " + " + l + ") × 2 = " + (L + l) + " × 2"; }
      var U = area ? u + "²" : u, what = area ? "مساحته" : "محيطه";
      return { q: (sq ? "مربع طول ضلعه " + M(L + " " + u) : "مستطيل طوله " + M(L + " " + u) + " وعرضه " + M(l + " " + u)) + ". احسب " + what + " (بـ " + U + ").",
        ans: [String(v)], unit: U,
        h1: "تذكّر القاعدة: " + f.split("=")[0].trim() + " = ؟",
        h2: f + ".",
        steps: ["<b>الطريقة:</b> " + f + ".", M(calc)], res: "النتيجة: " + M(v + " " + U),
        concl: "<b>الاستنتاج:</b> " + (area ? "مساحة " : "محيط ") + (sq ? "المربع " : "المستطيل ") + M(v + " " + U) + "." };
    },
    diam: function () {   /* 1AM S2 «مصطلحات الدائرة»: القطر = 2 × نصف القطر */
      var toD = Math.random() < 0.5, r10 = ri(15, 120), r = r10 / 10, d = r10 / 5, v = toD ? d : r;
      return { q: "دائرة مركزها " + M("O") + (toD ? " ونصف قطرها " + M(dn(r) + " cm") + ". ما طول قطرها؟" : " وقطرها " + M(dn(d) + " cm") + ". ما طول نصف قطرها؟") + " (بـ cm)",
        ans: [dn(v)], unit: "cm",
        h1: "القطر يمرّ بالمركز " + M("O") + " ويتكوّن من نصفي قطر.",
        h2: toD ? "القطر = نصف القطر × 2." : "نصف القطر = القطر ÷ 2.",
        steps: ["<b>الطريقة:</b> القطر = 2 × نصف القطر.", toD ? M(dn(r) + " × 2 = " + dn(d)) : M(dn(d) + " ÷ 2 = " + dn(r))],
        res: "النتيجة: " + M(dn(v) + " cm"), concl: "<b>الاستنتاج:</b> " + (toD ? "قطر الدائرة " : "نصف قطر الدائرة ") + M(dn(v) + " cm") + "." };
    },
    symc: function () {   /* 2AM S2 «خواص التناظر المركزي»: يحفظ الأطوال والزوايا، فالمحيط نفسه */
      var a = ri(25, 90) / 10, b = ri(25, 90) / 10, c = Math.max(Math.abs(a - b) + 0.6, Math.min(a + b - 0.6, ri(25, 90) / 10)), per = Math.round((a + b + c) * 10) / 10;
      c = Math.round(c * 10) / 10; per = Math.round((a + b + c) * 10) / 10;
      return { q: "المثلث " + M("A′B′C′") + " نظير المثلث " + M("ABC") + " بالنسبة إلى النقطة " + M("O") + "، حيث " + M("AB = " + dn(a) + " cm") + " و " + M("BC = " + dn(b) + " cm") + " و " + M("AC = " + dn(c) + " cm") + ".<br>احسب محيط المثلث " + M("A′B′C′") + " (بـ cm).",
        ans: [dn(per)], unit: "cm",
        h1: "ماذا يحفظ التناظر المركزي؟ قارن أطوال المثلثين.",
        h2: "التناظر المركزي يحفظ الأطوال: " + M("A′B′ = AB") + " و " + M("B′C′ = BC") + " و " + M("A′C′ = AC") + "، ثم اجمع.",
        steps: ["<b>الطريقة:</b> التناظر المركزي يحفظ الأطوال، فالمثلثان المتناظران لهما نفس الأضلاع ونفس المحيط.",
          M("A′B′ = " + dn(a) + "  ;  B′C′ = " + dn(b) + "  ;  A′C′ = " + dn(c)), M(dn(a) + " + " + dn(b) + " + " + dn(c) + " = " + dn(per))],
        res: "النتيجة: " + M(dn(per) + " cm"), concl: "<b>الاستنتاج:</b> محيط المثلث " + M("A′B′C′") + " يساوي " + M(dn(per) + " cm") + "." };
    },
    propor: function () {   /* 3AM S2 «تناسبية الأطوال في المثلث» (مستقيم يوازي ضلعا) */
      var AB = ri(4, 12), AM = ri(1, AB - 1), k = ri(2, 6), BC = AB * k / 2, v = AM * BC / AB;
      while (Math.round(v * 10) !== v * 10) { AM = ri(1, AB - 1); v = AM * BC / AB; }
      return { q: M("ABC") + " مثلث، " + M("M") + " نقطة من " + M("[AB]") + " و " + M("N") + " نقطة من " + M("[AC]") + " حيث " + M("(MN) // (BC)") + ".<br>" +
          M("AM = " + AM + " cm") + " و " + M("AB = " + AB + " cm") + " و " + M("BC = " + dn(BC) + " cm") + ". احسب الطول " + M("MN") + " (بـ cm).",
        ans: [dn(v)], unit: "cm",
        h1: M("(MN) // (BC)") + ": أطوال أضلاع المثلثين " + M("AMN") + " و " + M("ABC") + " متناسبة.",
        h2: M(FR("AM", "AB") + " = " + FR("MN", "BC")) + "، إذن " + M("MN = " + FR("AM × BC", "AB")) + ".",
        steps: ["<b>الطريقة:</b> في المثلث " + M("ABC") + "، " + M("M ∈ [AB]") + " و " + M("N ∈ [AC]") + " و " + M("(MN) // (BC)") + "، إذن أطوال أضلاع المثلثين " + M("AMN") + " و " + M("ABC") + " متناسبة: " + M(FR("AM", "AB") + " = " + FR("AN", "AC") + " = " + FR("MN", "BC")) + ".",
          M(FR(AM, AB) + " = " + FR("MN", dn(BC))), M("MN = " + FR(AM + " × " + dn(BC), AB) + " = " + dn(v))],
        res: "النتيجة: " + M("MN = " + dn(v) + " cm"), concl: "<b>الاستنتاج:</b> " + M("MN = " + dn(v) + " cm") + "." };
    },
    circle: function () {
      var dia = Math.random() < 0.5, r = ri(2, 20), d = 2 * r, v = d * 314 / 100;
      return { q: "دائرة " + (dia ? "قطرها " + M(d + " cm") : "نصف قطرها " + M(r + " cm")) + ". احسب محيطها (بـ cm) مع أخذ " + M("π ≈ 3,14") + ".",
        ans: [dn(v)], unit: "cm",
        h1: "محيط الدائرة = القطر × " + M("3,14") + ".",
        h2: dia ? "القطر معطى: اضربه في " + M("3,14") + "." : "القطر = نصف القطر × 2، ثم اضرب في " + M("3,14") + ".",
        steps: ["<b>الطريقة:</b> محيط الدائرة = القطر × " + M("π") + "، مع " + M("π ≈ 3,14") + "."].concat(dia ? [] : [M("القطر = " + r + " × 2 = " + d + " cm")], [M(d + " × 3,14 = " + dn(v))]),
        res: "النتيجة: " + M(dn(v) + " cm"), concl: "<b>الاستنتاج:</b> محيط الدائرة حوالي " + M(dn(v) + " cm") + "." };
    },
    rtri: function () {
      var a = ri(3, 20), b = ri(3, 20), u = pick(["cm", "m"]), v = a * b / 2;
      return { q: "مثلث قائم طولا ضلعي الزاوية القائمة فيه " + M(a + " " + u) + " و" + M(b + " " + u) + ". احسب مساحته (بـ " + u + "²).",
        ans: [dn(v)], unit: u + "²",
        h1: "المثلث القائم هو نصف مستطيل بعداه ضلعا الزاوية القائمة.",
        h2: "مساحة المثلث القائم = (ضلع الزاوية القائمة الأول × الضلع الثاني) ÷ 2.",
        steps: ["<b>الطريقة:</b> مساحة المثلث القائم = (جداء طولي ضلعي الزاوية القائمة) ÷ 2، لأنه نصف مستطيل.", M("(" + a + " × " + b + ") ÷ 2 = " + a * b + " ÷ 2")],
        res: "النتيجة: " + M(dn(v) + " " + u + "²"), concl: "<b>الاستنتاج:</b> مساحة المثلث القائم " + M(dn(v) + " " + u + "²") + "." };
    }
  };
  }
  function genFor(ex, q) {
    var p = plain(q.text || ""), t = plain(ex.title || ""), h = q.text || "", c = plain(ex.context || "");
    if (/وضعية/.test(t)) return null;
    var e = p.replace(/^\s*\d+\)\s*/, "").replace(/^[A-Z]\s*=\s*/, "");   /* bare expression such as «(−6) × (+7)» */
    var bare = /^[\d\s,()+−×÷\-]+$/.test(e) && /\d/.test(e);
    if (!bare && !/احسب|أحسب|عيّن|عين|أوجد|اكتب|بسّط|أنجز/.test(p)) return null;
    if (bare && !/احسب|أحسب|بسّط|أنجز/.test(p + " " + c + " " + t) && !/[×÷+−]/.test(e)) return null;
    var fr = /class="fr"/.test(h), roots = (p.match(/√\s*\d+/g) || []).length, noRatio = !/[A-Z]{2}\s*[A-Z]{2}/.test(p);
    var numFr = /class="fr"><span>\d+<\/span><span>\d+<\/span>/.test(h);
    if (level === "4m") {
      if (/PGCD\s*\(/.test(p) && !/اختزال|كسر/.test(p)) return "pgcd";
      if (/غير قابل للاختزال/.test(p) && numFr && !/[+−×]/.test(p.replace(/^\s*\d+\)/, "")) && noRatio) return "irr";
      if (/على الشكل\s*a\s*√\s*b/.test(p) && roots === 1) return "aroot";
      if (/على الشكل\s*a\s*√\s*\d/.test(p) && roots >= 2) return "rootsum";
      var len = /احسب\s*(الطول|طول)?\s*[A-Z]{2}\b/.test(p) && !/²|قائم|فيثاغورس|قيس|محيط|مساحة/.test(p);
      if (/طالس/.test(t) && !/عكس/.test(t) && len && !/\b(cos|sin|tan)\b/.test(p)) return "thales";
      if (/\b(cos|sin|tan)\b|جيب|النسب المثلثية/.test(t + " " + p) && len && !/طالس/.test(t + " " + p)) return "trig";
    } else if (level === "3m") {
      if (/نسبي/.test(t) && bare && !fr && /[×÷]/.test(e) && !/[+]\s*\(|\)\s*[+−]\s*\(/.test(e.replace(/\(\s*[+−]/g, "(")) && /\(\s*[−+]/.test(e)) return "relmul";
      if (/كسر|الكسور|الناطق/.test(t) && fr && /\S\s+[×÷+−]\s+\S/.test(p) && !/قارن|مقلوب|على شكل عدد|الكتابة العشرية|\.\.\./.test(p)) return "fracop";
      if (/المنتصفين/.test(t) && !/العكسية/.test(t) && /احسب\s*(الطول|طول)?\s*[A-Z]{2}\b/.test(p) && !/محيط|قيس|زاوية|مساحة/.test(p)) return "midline";
    } else if (level === "2m") {
      if (/القسمة الإقليدية/.test(p) && /أنجز|احسب|عيّن/.test(p)) return "eucl";
      if (/سلسلة عمليات|أولوي|الأقواس|الأولويات/.test(t) && !/توزيع|العامل المشترك|ذهني/.test(t) && bare && !fr && /[×÷]/.test(e) && /[+−]|\(/.test(e)) return "prio";
      if (/كسر|كسرين|الكسور/.test(t) && fr && /\S\s+[+−×]\s+\S/.test(p) && !/قارن|\.\.\./.test(p)) return "frac2";
    } else if (level === "1m") {
      if (/[×÷:]\s*(10|100|1000|0,1|0,01)(?![\d,])/.test(p) && (bare || /احسب/.test(p)) && !/\.\.\./.test(p)) return "x10";
      if ((bare || /احسب/.test(p)) && /\d,\d+\s*[+−-]\s*\d|\d\s*[+−-]\s*\d+,\d/.test(p) && !/[×÷]/.test(p)) return "decops";
      if (/دائرة/.test(p) && /محيط/.test(p) && /احسب/.test(p)) return "circle";
      if (/مستطيل|مربع/.test(p) && /محيط|مساحة/.test(p) && /احسب/.test(p) && !/رصف|مثلث|دائرة/.test(p)) return "rect";
      if (/مثلث/.test(p) && /مثلث قائم/.test(p + " " + t) && /مساحة/.test(p) && /احسب/.test(p)) return "rtri";
      if (/محيطه|مساحته/.test(p) && /مستطيل|مربع/.test(t + " " + c) && /احسب/.test(p) && !/رصف|مثلث|دائرة/.test(t)) return "rect";
    }
    return null;
  }
  function nz(s) {
    try { if (typeof normalizeInput === "function") return normalizeInput(String(s)); } catch (e) {}
    return String(s).replace(/\s+/g, "").replace(/[−–]/g, "-").replace(/\./g, ",").replace(/(cm²|m²|cm|mm|km|kg|m|g|da)$/i, "").toLowerCase();
  }
  function hasUnit(raw, u) {
    var w = String(raw).replace(/\s+/g, "").toLowerCase(), U = u.toLowerCase();
    if (U === "da") return /(da|دج|دينار)$/.test(w);
    return w.slice(-U.length) === U || (/²$/.test(U) && w.slice(-U.length) === U.replace("²", "2"));
  }
  var GSYM = { "4m": ["√", "²", "−", ";", ",", "/", "×", "⌫"], "3m": ["−", "/", ",", ";", "⌫"], "2m": ["/", ",", ";", "⌫"], "1m": [",", "⌫"] };
  function openGen(id) {
    if (!GEN[id]) return;
    var ov = el("div", "sx-ov"), box = el("div", "sx-sheet sx-gen"), solved = 0;
    ov.appendChild(box); document.body.appendChild(ov);
    function close() { ov.remove(); try { speechSynthesis.cancel(); } catch (e) {} }
    ov.addEventListener("click", function (e) { if (e.target === ov) close(); });
    function fresh() {
      var g = GEN[id](), left = 3, done = false;
      var numeric = g.ans.every(function (a) { return /^[−-]?\d+(,\d+)?$/.test(a); });
      box.innerHTML = '<div class="sx-top"><b>🔄 تمرين مشابه بأرقام جديدة</b><button type="button" class="sx-btn x">✕ إغلاق</button></div>' +
        '<p class="sx-note">للتدرّب فقط، لا يُحسب في علامتك. الأجوبة الصحيحة: <b>' + solved + "</b></p>" +
        '<div class="sx-gq">' + g.q + "</div>" +
        (g.chip || g.unit ? '<div class="sx-chips">' + (g.chip ? '<span class="sx-chip">' + g.chip + "</span>" : "") + (g.unit ? '<span class="sx-chip u">📏 اكتب الجواب مع الوحدة: ' + g.unit + "</span>" : "") + "</div>" : "") +
        '<div class="sx-gin"><input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="done" placeholder="اكتب إجابتك هنا"' + (numeric ? ' inputmode="decimal"' : "") + '><button type="button" class="btn-check go">تحقق</button></div>' +
        '<div class="sym-toolbar">' + (GSYM[level] || []).map(function (s) { return '<button type="button" class="sym-btn">' + s + "</button>"; }).join("") + "</div>" +
        '<div class="feedback-box sx-gfb"></div>' +
        '<div class="sx-gsol" hidden><h4>✔ الإجابة النموذجية المفصلة:</h4>' + g.steps.map(function (s) { return '<div class="sol-line' + (/^<b>الطريقة/.test(s) ? " sx-rule" : "") + '">' + s + "</div>"; }).join("") +
        '<div class="sol-line">' + g.res + '</div><div class="sol-result">' + g.concl + "</div></div>" +
        '<div class="sx-row"><button type="button" class="sx-main nx">🔄 أرقام جديدة</button></div>';
      var inp = $("input", box), fb = $(".sx-gfb", box), sol = $(".sx-gsol", box), gq = $(".sx-gq", box);
      $(".x", box).onclick = close;
      $(".nx", box).onclick = fresh;
      if (VOICE) gq.insertBefore(sayBtn(gq), gq.firstChild);
      $$(".sym-btn", box).forEach(function (b) {
        b.onclick = function () { if (done) return; var s = b.textContent; inp.value = s === "⌫" ? inp.value.slice(0, -1) : inp.value + s; inp.focus(); };
      });
      function finish(ok, raw) {
        done = true; inp.disabled = true; $(".go", box).disabled = true; sol.hidden = false;
        if (ok) {
          solved++;
          fb.className = "feedback-box success sx-gfb";
          fb.innerHTML = '<span class="star-burst">' + "⭐".repeat(left) + "</span> أحسنت! إجابة صحيحة." +
            (g.unit && !hasUnit(raw, g.unit) ? '<div class="sx-unit-warn">⚠️ انتبه: لم تكتب الوحدة (' + g.unit + ")، فلا تنسها في كراسك وفي الامتحان.</div>" : "");
          try { if (window.flyStars) window.flyStars(fb, 14); } catch (e) {}
        } else {
          fb.className = "feedback-box fail sx-gfb";
          fb.innerHTML = "🌟 لا بأس، فكلّ خطأ درسٌ يقرّبك من النجاح. اقرأ الإجابة النموذجية، ثم اضغط «🔄 أرقام جديدة».";
        }
        $(".sx-note b", box).textContent = solved;
      }
      function check() {
        if (done) return;
        var raw = inp.value.trim();
        if (!raw) { fb.className = "feedback-box hint sx-gfb"; fb.textContent = "اكتب إجابتك أولا في الخانة."; return; }
        var v = nz(raw);
        if (g.ans.some(function (a) { return nz(a) === v; })) return finish(true, raw);
        left--;
        var simp = g.simp && g.simp(v);
        try { if (typeof playTone === "function" && soundEnabled) playTone("error"); } catch (e) {}
        inp.classList.remove("shake"); void inp.offsetWidth; inp.classList.add("shake");
        if (left === 2 || left === 1) {
          fb.className = "feedback-box hint sx-gfb";
          fb.innerHTML = (simp ? g.sm : left === 2 ? "لا بأس، أعد قراءة السؤال بهدوء." : "محاولة أخيرة: اكتب الحساب في المسودة قبل أن تجيب.") +
            "<br><strong>💡 التلميح " + (3 - left) + ":</strong> " + (left === 2 ? g.h1 : g.h2);
          if (VOICE) fb.insertBefore(sayBtn(fb), fb.firstChild);
          try { if (window.flyStars) window.flyStars(fb, 8, ["⭐", "💡", "✨"]); } catch (e) {}
        } else finish(false, raw);
      }
      $(".go", box).onclick = check;
      inp.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); check(); } });
      setTimeout(function () { box.scrollIntoView({ block: "start" }); }, 10);
    }
    fresh();
  }

  window.__sx = { GEN: GEN, genFor: genFor, openGen: openGen, openPad: openPad };

  /* ---------- 4. 🧮 simple calculator (2026-11-22 his «ما رأيك بإضافة آلة حاسبة بسيطة» + «الثانية والثالثة مسموحة في حدود فقط»)
     mode "bem" (4AM, every page, allowed in exam mode as in the BEM): + − × ÷ ( ) , √ x² and sin cos tan + inverses in DEGREES;
     mode "basic" (2AM-3AM, only where calcMode() allows it): + − × ÷ ( ) , (+ √ x² in 3AM). 1AM: never.
     The expression is read by a small parser (no eval); the result keeps up to 6 digits after the comma: the pupil writes the
     rounding the question asks for. ---------- */
  function calcEval(src) {
    var s = String(src).replace(/[٠-٩]/g, function (d) { return "٠١٢٣٤٥٦٧٨٩".indexOf(d); })
      .replace(/\s+/g, "").replace(/,/g, ".").replace(/[−–]/g, "-").replace(/[×x*]/g, "*").replace(/[÷:/]/g, "/")
      .replace(/sin⁻¹/g, "A").replace(/cos⁻¹/g, "B").replace(/tan⁻¹/g, "C").replace(/sin/g, "S").replace(/cos/g, "O").replace(/tan/g, "T").replace(/√/g, "R");
    var i = 0, D = Math.PI / 180;
    function peek() { return s.charAt(i); }
    function fail(m) { throw new Error(m || "اكتب عملية صحيحة"); }
    function num() {
      var m = /^\d+(\.\d+)?|^\.\d+/.exec(s.slice(i)); if (!m) fail();
      i += m[0].length; return parseFloat(m[0]);
    }
    function prim() {
      var c = peek();
      if (c === "(") { i++; var v = expr(); if (peek() === ")") i++; return v; }
      if (c === "-") { i++; return -pow(); }
      if (c === "+") { i++; return pow(); }
      if (c && "ABCSOTR".indexOf(c) >= 0) {
        i++; var a = pow();
        if (c === "R") { if (a < 0) fail("لا يوجد جذر لعدد سالب"); return Math.sqrt(a); }
        if (c === "S") return Math.sin(a * D);
        if (c === "O") return Math.cos(a * D);
        if (c === "T") { if (Math.abs(Math.cos(a * D)) < 1e-12) fail("tan غير معرّف"); return Math.tan(a * D); }
        if (c === "C") return Math.atan(a) / D;
        if (a < -1 || a > 1) fail("النسبة يجب أن تكون بين 1- و 1");
        return (c === "A" ? Math.asin(a) : Math.acos(a)) / D;
      }
      return num();
    }
    function pow() {
      var v = prim();
      while (peek() === "²" || peek() === "^") {
        if (peek() === "²") { i++; v = v * v; } else { i++; v = Math.pow(v, prim()); }
      }
      /* implicit product: 2(3+1), 2√9, (1+2)(3) */
      if (peek() === "(" || (peek() && "ABCSOTR".indexOf(peek()) >= 0)) v *= pow();
      return v;
    }
    function term() {
      var v = pow();
      while (peek() === "*" || peek() === "/") {
        var o = s.charAt(i++), b = pow();
        if (o === "/") { if (b === 0) fail("لا يمكن القسمة على 0"); v /= b; } else v *= b;
      }
      return v;
    }
    function expr() {
      var v = term();
      while (peek() === "+" || peek() === "-") { var o = s.charAt(i++), b = term(); v = o === "+" ? v + b : v - b; }
      return v;
    }
    if (!s) fail("اكتب عملية أولا");
    var r = expr();
    if (i < s.length || !isFinite(r)) fail();
    return r;
  }
  function calcShow(n) {
    var r = Math.round(n * 1e6) / 1e6;
    if (Math.abs(r) >= 1e15) return String(n);
    var t = String(r); if (/e/.test(t)) t = r.toFixed(6).replace(/0+$/, "").replace(/\.$/, "");
    return t.replace("-", "−").replace(".", ",");
  }
  window.__sxCalcEval = calcEval;
  function calcMode(lv, sec) {
    if (lv === "4m") return "bem";
    /* 2AM-3AM, his choice 2026-11-22 «كل شيء ما عدا الحساب»: everywhere EXCEPT the calculation exercises (operations, fractions,
       relative and rational numbers, powers, literal calculus, equations). Decided per EXERCISE from the resources of its questions
       (window.__resmap + assets/resources.json); pages without that map: only the situations (idmaj) */
    if (lv === "2m" || lv === "3m") return window.__resmap || sec === "idmaj" ? "basic" : "";
    return "";
  }
  function addCalc(inBar, mode) {
    var trig = mode === "bem", roots = mode === "bem" || level === "3m";
    var panel = el("div", "sx-calc");
    panel.hidden = true;
    var K = mode === "bem" ? ["sin", "cos", "tan", "²", "sin⁻¹", "cos⁻¹", "tan⁻¹", "√", "(", ")", "C", "⌫"]
      : roots ? ["√", "²", "(", ")"] : ["C", "⌫", "(", ")"];
    K = K.concat(["7", "8", "9", "÷", "4", "5", "6", "×", "1", "2", "3", "−"]);
    K = K.concat(mode === "bem" || !roots ? ["0", ",", "=", "+"] : ["0", ",", "⌫", "+", "C", "="]);
    var keys = K;
    panel.innerHTML = '<div class="t"><span>🧮 الآلة الحاسبة' + (trig ? " (الزوايا بالدرجات DEG)" : "") + '</span><button type="button" aria-label="إغلاق">✕</button></div>' +
      '<input type="text" inputmode="none" autocomplete="off" spellcheck="false" placeholder="مثال: (12,5 + 7) × 3" aria-label="العملية">' +
      '<div class="k">' + keys.map(function (k) {
        var c = /^[0-9,]$/.test(k) ? "d" : k === "=" ? (K.length % 4 === 2 ? "eq w3" : "eq") : k === "C" || k === "⌫" ? "cl" : /sin|cos|tan/.test(k) ? "inv" : "op";
        return '<button type="button" class="' + c + '" data-k="' + k + '">' + k + "</button>";
      }).join("") + '</div><div class="r" aria-live="polite"></div>' +
      '<div class="n">الحاسبة للتحقق من الحساب فقط: اكتب خطوات الحل في كراسك، ثم اكتب القيمة المطلوبة (المقرّبة إن طُلب) مع الوحدة في خانة الجواب.</div>';
    document.body.appendChild(panel);
    var x = $("input", panel), out = $(".r", panel);
    $(".t button", panel).onclick = function () { panel.hidden = true; };
    function run() {
      try { var v = calcEval(x.value); out.textContent = "= " + calcShow(v); out.classList.remove("er"); }
      catch (e) { out.textContent = e.message; out.classList.add("er"); }
    }
    $$(".k button", panel).forEach(function (b) {
      b.addEventListener("mousedown", function (e) { e.preventDefault(); });
      b.onclick = function () {
        var k = b.dataset.k;
        if (k === "=") return run();
        if (k === "C") { x.value = ""; out.textContent = ""; return; }
        if (k === "⌫") { x.value = x.value.replace(/(sin⁻¹|cos⁻¹|tan⁻¹|sin|cos|tan)$|.$/, ""); return; }
        if (/^(sin|cos|tan)/.test(k) || k === "√") { x.value += k + "("; return; }
        if (/^= /.test(out.textContent) && /^[−+×÷²]$/.test(k) && !x.value.trim()) x.value = out.textContent.slice(2);
        x.value += k;
      };
    });
    x.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); run(); } });
    var CALCRES = /سلسلة عمليات|الأقواس|توزيع الضرب|قسمة|كسرين|عدد(?:ين)? نسبي|أعداد نسبية|مجموع جبري|المسافة بين نقطتين|مقلوب|ناطق|قوة|قوى|الكتابة العلمية|عبارة|نشر عبارات|المعادلات/;
    var resRows = null, lastCard = null;
    if (mode === "basic" && window.__resmap) {
      fetch(ROOT.href + "assets/resources.json", { cache: "force-cache" }).then(function (r) { return r.json(); }).then(function (R) { resRows = R[level] || []; }).catch(function () {});
      document.addEventListener("focusin", function (e) { var c = e.target.closest && e.target.closest(".exercise-card,.card"); if (c && !panel.contains(e.target)) lastCard = c; });
      document.addEventListener("click", function (e) { var c = e.target.closest && e.target.closest(".exercise-card,.card"); if (c) lastCard = c; }, true);
    }
    function cardNow() {
      var cs = $$(".exercise-card,.card").filter(function (c) { return c.offsetParent !== null && $(".q-box", c); });
      if (lastCard && cs.indexOf(lastCard) >= 0) { var r0 = lastCard.getBoundingClientRect(); if (r0.bottom > 0 && r0.top < window.innerHeight) return lastCard; }
      var best = null, bs = 0, h = window.innerHeight;
      cs.forEach(function (c) { var r = c.getBoundingClientRect(), v = Math.min(r.bottom, h) - Math.max(r.top, 0); if (v > bs) { bs = v; best = c; } });
      return best;
    }
    /* true = calculation exercise: every mapped question of the exercise on screen is a calculation resource */
    function calcOnly() {
      if (mode !== "basic" || section === "idmaj" || !window.__resmap) return false;
      if (!resRows) return true;   /* map not loaded yet: be strict */
      var c = cardNow(); if (!c) return false;
      var hd = $(".card-header", c); if (hd && /الوضعية/.test(hd.textContent)) return false;   /* the situation part of an exam */
      var n = 0, calc = 0;
      $$(".q-box[id^='qbox-']", c).forEach(function (b) {
        var m = window.__resmap[b.id.slice(5)]; if (!m || m[0] < 0) return;
        n++; var row = resRows[m[0]]; if (row && CALCRES.test(row.n || "")) calc++;
      });
      return n > 0 && calc === n;
    }
    var stop = el("div", "r er sx-calc-no");
    stop.innerHTML = "🚫 هذا تمرين حساب: الحاسبة غير مسموحة فيه. احسب في كراسك، فالهدف هو أن تتقن الحساب بنفسك.";
    function toggle() {
      if (!panel.hidden) { panel.hidden = true; return; }
      var no = calcOnly();
      if (no && !stop.parentNode) panel.insertBefore(stop, $(".k", panel));
      stop.hidden = !no; $(".k", panel).hidden = no; x.hidden = no; out.hidden = no;
      panel.hidden = false;
    }
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

  /* ---------- 7. «☀️ سؤال اليوم» on the index (2026-11-18 his ask): ONE question a day for each level, the same for
     everybody on the same date (numbers drawn from the date), 3 tries with hint 1 / hint 2 / model answer, stars,
     «⚡ تحدي الـ3 دقائق» and the streak «🔥 سلسلة المواظبة» kept on this device only ("math-daily", per child). ---------- */
  function initDaily() {
    var host = document.getElementById("daily");
    if (!host) return;
    /* follows the annual distribution (التوزيع السنوي، المخططات السنوية 2022) a little BEHIND it (his ask «متزامن مع المخطط أو متأخر عنه قليلا»):
       a type enters the daily questions on the Sunday AFTER the week its resource is taught ("MM-DD" of the 2026/2027 calendar). */
    /* 2026-11-23 his ask «الاسئلة تكون قريبة من درس المخطط، هي مازالت في المقطع الاول»: a type now enters in the WEEK its resource
       is taught (third field = sequence), and two days out of three the question comes from the CURRENT sequence (see question()). */
    var PLAN = {
      "1m": [["10-18", "x10", 1], ["10-25", "decops", 1], ["11-15", "diam", 2], ["11-22", "rect", 2], ["11-29", "rtri", 2], ["11-29", "circle", 2]],
      "2m": [["10-11", "prio", 1], ["10-18", "eucl", 1], ["10-25", "frac2", 1], ["11-22", "symc", 2]],
      "3m": [["10-11", "relmul", 1], ["10-25", "fracop", 1], ["11-15", "midline", 2], ["11-22", "propor", 2]],
      "4m": [["10-04", "pgcd", 1], ["10-11", "irr", 1], ["10-18", "aroot", 1], ["10-18", "rootsum", 1], ["10-25", "thales", 2], ["11-08", "trig", 2]]
    };
    function syDay(m, d) { return (m >= 8 ? m - 8 : m + 4) * 31 + d; }   /* order inside a school year that starts in September */
    function pool(lv) {
      var t = syDay(now.getMonth(), now.getDate()), L = (PLAN[lv] || []).filter(function (x) { var p = x[0].split("-"); return syDay(+p[0] - 1, +p[1]) <= t; });
      if (!L.length && PLAN[lv]) L = [PLAN[lv][0]];
      var sq = L[L.length - 1][2];
      CUR[lv] = L.filter(function (x) { return x[2] === sq; }).map(function (x) { return x[1]; });   /* types of the sequence taught now */
      return L.map(function (x) { return x[1]; });
    }
    var CUR = {};
    var DAILY;
    var LV = { "1m": "الأولى متوسط", "2m": "الثانية متوسط", "3m": "الثالثة متوسط", "4m": "الرابعة متوسط" };
    var SYM = { "4m": ["√", "²", "−", ";", ",", "/", "×", "⌫"], "3m": ["−", "/", ",", ";", "⌫"], "2m": ["/", ",", ";", "⌫"], "1m": [",", "⌫"] }; /* = GSYM of the pages */
    var PRAISE = ["أحسنت! تركيزك أوصلك إلى الجواب الصحيح.", "ممتاز! الصبر والدقة سرّ النجاح.", "رائع! واصل هكذا كل يوم."];
    var GEN2 = genBank();
    function ymd(d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
    function dayNo(d) { return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5); }
    var now = new Date(), today = ymd(now), yest = ymd(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
    DAILY = { "1m": pool("1m"), "2m": pool("2m"), "3m": pool("3m"), "4m": pool("4m") };
    function load() { try { return JSON.parse(localStorage.getItem("math-daily") || "{}") || {}; } catch (e) { return {}; } }
    function save(d) { try { localStorage.setItem("math-daily", JSON.stringify(d)); } catch (e) {} }
    function streakNow(d) { return d.last === today || d.last === yest ? d.streak || 0 : 0; }
    function seeded(seed) {
      return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    }
    function question(lv) {
      /* every other day the newest resource taught, otherwise a review of an earlier one */
      /* day 1 of 3: the newest resource; day 2: another resource of the current sequence; day 3: a review of an earlier sequence */
      var list = DAILY[lv], cur = CUR[lv] || list, old = list.filter(function (x) { return cur.indexOf(x) < 0; }), n = dayNo(now), k = (n + lv.charCodeAt(0)) % 3;
      var id = k === 0 ? cur[cur.length - 1] : k === 1 || !old.length ? cur[Math.floor(n / 3) % cur.length] : old[Math.floor(n / 3) % old.length], h = 0, s = today + "|" + lv, R = Math.random, g;
      for (var i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 2654435761);
      Math.random = seeded(h);
      try { g = GEN2[id](); } finally { Math.random = R; }
      return g;
    }
    function badge(n) {
      return n >= 30 ? "🏆 شهر كامل من المواظبة!" : n >= 14 ? "🥇 أسبوعان متتاليان، مواظبة رائعة!" : n >= 7 ? "🏅 أسبوع كامل دون انقطاع!" :
        n >= 5 ? "🔥 واظبت " + arN(n, "day") + " متتالية!" : n >= 3 ? "🔥 بداية مواظبة جميلة: " + arN(n, "day") + " متتالية." : "";
    }
    var css = document.createElement("style");
    css.textContent =
      "#daily{margin:12px 0 4px;background:var(--surface,#fff);color:var(--text,#0f172a);border:1px solid var(--border,#e2e8f0);border-top:4px solid var(--accent,#f59e0b);border-radius:16px;padding:12px 14px;box-shadow:var(--shadow-sm)}" +
      "#daily .dh{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}" +
      "#daily h2{margin:0;font-size:1.05rem}#daily .lvn{color:var(--muted,#475569);font-size:.85rem;font-weight:700}" +
      "#daily .pills{display:flex;gap:6px;flex-wrap:wrap}#daily .pill{font-size:.8rem;font-weight:800;border-radius:999px;padding:3px 10px;border:1px solid var(--border,#e2e8f0);background:var(--soft,#f8fafc)}" +
      "#daily .pill.fire{border-color:#fdba74}#daily .pill.t.late{color:var(--muted,#475569)}" +
      "#daily .dq{margin:10px 0 8px;font-size:1.05rem;line-height:1.9}" +
      "#daily .math{white-space:nowrap;direction:ltr;unicode-bidi:isolate;font-family:Arial,sans-serif}" +
      "#daily .fr{display:inline-flex;flex-direction:column;vertical-align:middle;text-align:center;line-height:1.05;margin:0 2px;font-size:.92em}" +
      "#daily .fr>span:first-child{border-bottom:2px solid currentColor;padding:0 3px 1px}#daily .fr>span:last-child{padding:1px 3px 0}" +
      "#daily .chip{display:inline-block;font-size:.78rem;font-weight:700;border-radius:8px;padding:2px 8px;margin:0 0 6px 6px;background:var(--accent-light,#fef3c7);color:#713f12}" +
      "#daily .inrow{display:flex;gap:8px}#daily input{flex:1;min-width:0;font:inherit;font-size:1.05rem;padding:8px 10px;border:2px solid var(--border,#cbd5e1);border-radius:10px;background:var(--surface,#fff);color:var(--text,#0f172a);direction:ltr;text-align:center}" +
      "#daily .ok{font:inherit;font-weight:800;border:0;border-radius:10px;padding:8px 16px;background:var(--primary,#0f4c81);color:#fff;cursor:pointer}" +
      "#daily .ok:disabled,#daily input:disabled{opacity:.6}" +
      "#daily .syms{display:flex;gap:6px;margin:8px 0 0;flex-wrap:nowrap;overflow-x:auto}#daily .syms button{direction:ltr;unicode-bidi:isolate;font:inherit;font-weight:800;min-width:34px;flex:0 0 auto;padding:5px 8px;border-radius:9px;border:1.5px solid var(--border,#cbd5e1);background:var(--soft,#f8fafc);color:var(--text,#0f172a);cursor:pointer}" +
      "#daily .fb{margin-top:8px;border-radius:10px;padding:8px 10px;font-size:.92rem;line-height:1.8}#daily .fb:empty{display:none}" +
      "#daily .fb.h{background:#fffbeb;border:1px solid #fcd34d;color:#713f12}#daily .fb.s{background:#dcfce7;border:1px solid #86efac;color:#14532d}#daily .fb.f{background:#eff6ff;border:1px solid #93c5fd;color:#1e3a8a}" +
      "#daily .sol{margin-top:8px;border:1px solid var(--border,#e2e8f0);border-radius:10px;padding:8px 10px;line-height:1.9}#daily .sol h4{margin:0 0 4px;font-size:.92rem}" +
      "#daily .sol .rule{color:#92400e}#daily .sol .end{font-weight:800}#daily .sol>div{overflow-x:auto}" +
      "#daily .end2{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-top:8px;font-size:.9rem}" +
      "#daily .bdg{font-weight:800;color:#c2410c}#daily .mute{font:inherit;border:0;background:none;cursor:pointer;font-size:1rem}" +
      "#daily .shake{animation:dshake .35s}@keyframes dshake{0%,100%{transform:none}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}" +
      "#daily .burst{font-size:1.2rem;letter-spacing:2px}#daily [hidden]{display:none!important}" +
      "#daily.min{padding:8px 12px;border-top-width:3px}#daily .mini{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;font-size:.9rem;font-weight:700}" +
      "#daily .mini .fire{color:#c2410c}#daily .btns{display:inline-flex;gap:6px;flex-wrap:wrap}#daily .sh,#daily .hide,#daily .more,#daily .tg{font:inherit;font-size:.82rem;font-weight:800;cursor:pointer;border-radius:9px;padding:4px 10px;border:1.5px solid var(--border,#cbd5e1);background:var(--soft,#f8fafc);color:var(--text,#0f172a)}";
    document.head.appendChild(css);
    var mute = false;
    try { mute = localStorage.getItem("math-daily-mute") === "1"; } catch (e) {}
    function tone(ok) {
      if (mute) return;
      try {
        var A = window.__dAC || (window.__dAC = new (window.AudioContext || window.webkitAudioContext)()), o = A.createOscillator(), g = A.createGain();
        o.frequency.value = ok ? 880 : 220; o.type = ok ? "sine" : "triangle"; g.gain.value = .08;
        o.connect(g); g.connect(A.destination); o.start(); o.stop(A.currentTime + (ok ? .18 : .25));
      } catch (e) {}
    }
    var cur = null, timer = null;
    /* once today's question is finished the card folds into ONE small line until tomorrow (2026-11-18 his remark «عند حلها من المفروض تختفي») */
    function mini(lv, rec) {
      var s2 = streakNow(load());
      host.classList.add("min");
      host.innerHTML = '<div class="mini"><span>' + (rec.ok ? "✅ أنجزت سؤال اليوم" + (rec.st ? " " + "⭐".repeat(rec.st) : "") : "📘 أنهيت سؤال اليوم") +
        (s2 ? ' · <b class="fire">🔥 ' + arN(s2, "day") + "</b>" : "") + " · 🌙 سؤال جديد غدًا</span>" +
        '<span class="btns"><button type="button" class="more">➕ سؤال آخر</button><button type="button" class="sh">📖 الحل</button></span></div>';
      host.querySelector(".sh").onclick = function () { render(lv, true); };
      host.querySelector(".more").onclick = function () { render(lv, true, true); };
    }
    /* extra = «➕ سؤال آخر»: new random numbers, for practice only (no streak, nothing saved) */
    function render(lv, full, extra) {
      if (!DAILY[lv]) { host.hidden = true; return; }
      cur = lv; host.hidden = false; clearInterval(timer); host.classList.remove("min");
      var D = load(), key = today + "|" + lv, rec = (D.done || {})[key];
      if (rec && !full) return mini(lv, rec);
      if (extra) rec = null;
      var xl = Math.random() < 0.75 && CUR[lv] ? CUR[lv] : DAILY[lv], g = extra ? GEN2[xl[Math.floor(Math.random() * xl.length)]]() : question(lv), left = 3, t0 = Date.now(), st = streakNow(D);
      var numeric = g.ans.every(function (a) { return /^[−-]?\d+(,\d+)?$/.test(a); });
      host.innerHTML = '<div class="dh"><div><h2>' + (extra ? "➕ سؤال إضافي للتدرّب" : "☀️ سؤال اليوم") + '</h2><span class="lvn">' + LV[lv] + " · " + now.toLocaleDateString("ar-DZ", { weekday: "long", day: "numeric", month: "long" }) + "</span></div>" +
        '<div class="pills"><span class="pill fire" title="سلسلة المواظبة: أيام متتالية أجبت فيها عن سؤال اليوم">🔥 ' + st + '</span><span class="pill t">⏱️ 3:00</span>' +
        '<button type="button" class="mute" aria-label="الصوت">' + (mute ? "🔇" : "🔊") + "</button></div></div>" +
        '<div class="dq">' + g.q + "</div>" +
        (g.chip || g.unit ? "<div>" + (g.chip ? '<span class="chip">' + g.chip + "</span>" : "") + (g.unit ? '<span class="chip">📏 اكتب الجواب مع الوحدة: ' + g.unit + "</span>" : "") + "</div>" : "") +
        '<div class="inrow"><input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="done" placeholder="اكتب إجابتك هنا"' + (numeric ? ' inputmode="decimal"' : "") + ' aria-label="إجابتك"><button type="button" class="ok">تحقّق</button></div>' +
        '<div class="syms">' + SYM[lv].map(function (s) { return '<button type="button">' + s + "</button>"; }).join("") + "</div>" +
        '<div class="fb" role="status"></div>' +
        '<div class="sol" hidden><h4>✔ الإجابة النموذجية المفصلة:</h4>' + g.steps.map(function (s) { return '<div class="' + (/^<b>الطريقة/.test(s) ? "rule" : "") + '">' + s + "</div>"; }).join("") +
        "<div>" + g.res + '</div><div class="end">' + g.concl + "</div></div>" +
        '<div class="end2" hidden><span class="bdg"></span><span class="nx">🌙 سؤال اليوم الجديد غدًا إن شاء الله.</span><span class="btns"><button type="button" class="tg">📖 الحل المفصل</button><button type="button" class="more">➕ سؤال آخر</button><button type="button" class="hide">✓ أخفِ السؤال</button></span></div>';
      var inp = host.querySelector("input"), ok = host.querySelector(".ok"), fb = host.querySelector(".fb"), sol = host.querySelector(".sol"),
        tp = host.querySelector(".pill.t"), fire = host.querySelector(".pill.fire"), end2 = host.querySelector(".end2");
      host.querySelector(".mute").onclick = function () { mute = !mute; this.textContent = mute ? "🔇" : "🔊"; try { localStorage.setItem("math-daily-mute", mute ? "1" : "0"); } catch (e) {} };
      Array.prototype.forEach.call(host.querySelectorAll(".syms button"), function (b) {
        b.onclick = function () { if (inp.disabled) return; var s = b.textContent; inp.value = s === "⌫" ? inp.value.slice(0, -1) : inp.value + s; inp.focus(); };
      });
      function showEnd(r) {
        inp.disabled = true; ok.disabled = true; end2.hidden = false; tp.hidden = true;
        /* compact end (his remark «يملأ الصفحة كاملة»): no answer box, model answer folded behind a button */
        host.querySelector(".inrow").hidden = true; host.querySelector(".syms").hidden = true;
        sol.hidden = !r; var tg = host.querySelector(".tg");
        tg.textContent = r ? "🔼 أخفِ الحل" : "📖 الحل المفصل";
        tg.onclick = function () {
          sol.hidden = !sol.hidden; tg.textContent = sol.hidden ? "📖 الحل المفصل" : "🔼 أخفِ الحل";
          var x = (load().done || {})[key];
          if (sol.hidden && x && !extra) mini(lv, x);   /* solution read: fold the card */
        };
        var D2 = load(), s2 = streakNow(D2);
        fire.textContent = "🔥 " + s2;
        host.querySelector(".bdg").textContent = badge(s2) || (s2 ? "🔥 سلسلة المواظبة: " + arN(s2, "day") + "." : "");
        if (r && r.a) inp.value = r.a;
        host.querySelector(".hide").onclick = function () { var x = (load().done || {})[key]; if (x) mini(lv, x); else host.hidden = true; host.scrollIntoView({ block: "nearest" }); };
        host.querySelector(".more").onclick = function () { render(lv, true, true); host.scrollIntoView({ block: "start" }); };
      }
      if (rec) {
        fb.className = rec.ok ? "fb s" : "fb f";
        fb.innerHTML = rec.ok ? "✅ أجبت عن سؤال اليوم إجابة صحيحة" + (rec.st ? ' <span class="burst">' + "⭐".repeat(rec.st) + "</span>" : "") + (rec.fast ? " ⚡ في أقل من 3 دقائق." : ".")
          : "📘 أنهيت سؤال اليوم. راجع الإجابة النموذجية في كراسك.";
        return showEnd(rec);
      }
      timer = setInterval(function () {
        var r = 180 - Math.floor((Date.now() - t0) / 1000);
        if (r <= 0) { clearInterval(timer); tp.textContent = "⏱️ خذ وقتك"; tp.classList.add("late"); return; }
        tp.textContent = "⏱️ " + Math.floor(r / 60) + ":" + ("0" + r % 60).slice(-2);
      }, 1000);
      /* folds BY ITSELF a few seconds after the answer (his «الإخفاء الأفضل يكون آليا»), unless the pupil opens the solution or asks another question */
      var foldT = null;
      function autoFold() {
        foldT = setTimeout(function () { if (!host.contains(fb)) return; var x = (load().done || {})[key]; if (x && sol.hidden) mini(lv, x); }, 6000);
      }
      function finish(good, raw) {
        clearInterval(timer);
        if (extra) {
          tone(good);
          fb.className = good ? "fb s" : "fb f";
          fb.innerHTML = good ? '<span class="burst">' + "⭐".repeat(left) + "</span> " + PRAISE[left % PRAISE.length] : "🌟 لا بأس، فكلّ خطأ درسٌ يقرّبك من النجاح. اقرأ الإجابة النموذجية خطوة خطوة.";
          if (good) try { if (window.flyStars) window.flyStars(fb, 14); } catch (e) {}
          return showEnd(null);
        }
        autoFold();
        var D2 = load(), fast = good && Date.now() - t0 <= 180000;
        if (D2.last !== today) { D2.streak = D2.last === yest ? (D2.streak || 0) + 1 : 1; D2.last = today; }
        D2.best = Math.max(D2.best || 0, D2.streak || 0);
        var done = D2.done || {}, keep = {};
        Object.keys(done).forEach(function (k) { if (k.slice(0, 10) >= ymd(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7))) keep[k] = done[k]; });
        keep[key] = { ok: good, st: good ? left : 0, fast: fast, a: String(raw).slice(0, 40) };
        D2.done = keep; save(D2);
        if (fast) try { var CN = JSON.parse(localStorage.getItem("math-cnt") || "{}") || {}; CN.fast = (CN.fast || 0) + 1; localStorage.setItem("math-cnt", JSON.stringify(CN)); } catch (e) {}   /* 🏅 «شهادة سرعة البديهة» */
        tone(good);
        if (good) {
          fb.className = "fb s";
          fb.innerHTML = '<span class="burst">' + "⭐".repeat(left) + "</span> " + PRAISE[(dayNo(now) + left) % PRAISE.length] + (fast ? " ⚡ نجحت في تحدي الـ3 دقائق!" : "") +
            (g.unit && !hasUnit(raw, g.unit) ? "<br>⚠️ انتبه: لم تكتب الوحدة (" + g.unit + ")، فلا تنسها في كراسك وفي الامتحان." : "");
          try { if (window.flyStars) window.flyStars(fb, 14); } catch (e) {}
        } else {
          fb.className = "fb f";
          fb.innerHTML = "🌟 لا بأس، فكلّ خطأ درسٌ يقرّبك من النجاح. اقرأ الإجابة النموذجية خطوة خطوة، وغدًا سؤال جديد.";
        }
        showEnd(null);
      }
      function check() {
        if (inp.disabled) return;
        var raw = inp.value.trim();
        if (!raw) { fb.className = "fb h"; fb.textContent = "اكتب إجابتك أولا في الخانة."; return; }
        var v = nz(raw);
        if (g.ans.some(function (a) { return nz(a) === v; })) return finish(true, raw);
        left--;
        tone(false);
        inp.classList.remove("shake"); void inp.offsetWidth; inp.classList.add("shake");
        if (left > 0) {
          var simp = g.simp && g.simp(v);
          fb.className = "fb h";
          fb.innerHTML = (simp ? g.sm : left === 2 ? "لا بأس، أعد قراءة السؤال بهدوء وركّز." : "محاولة أخيرة: اكتب الحساب في كراسك قبل أن تجيب.") +
            "<br><strong>💡 التلميح " + (3 - left) + ":</strong> " + (left === 2 ? g.h1 : g.h2);
        } else finish(false, raw);
      }
      ok.onclick = check;
      inp.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); check(); } });
    }
    function curLevel() {
      var b = document.querySelector('.lv[aria-pressed="true"]');
      return b ? b.getAttribute("data-level") : "1m";
    }
    render(curLevel());
    function again() { setTimeout(function () { var l = curLevel(); if (l !== cur) render(l); }, 30); }
    document.addEventListener("click", function (e) { if (e.target.closest && e.target.closest("[data-level]")) again(); });
    window.addEventListener("hashchange", again);
  }
})();
