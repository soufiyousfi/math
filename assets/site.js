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
  var path = decodeURIComponent(location.pathname);
  var rootPath = decodeURIComponent(ROOT.pathname);
  var rel = path.indexOf(rootPath) === 0 ? path.slice(rootPath.length) : path.replace(/^\//, "");

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
          (d.reports != null ? '<div style="margin-bottom:6px">🚩 بلاغات عن أخطاء لم تُعالج بعد: <b>' + d.reports + '</b> <small>(جدول «إحصاء المنصة»، ورقة «بلاغات»)</small></div>' : "") +
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
.sx-pad-area{flex:1;position:relative;touch-action:none;background-color:#fff;
  background-image:linear-gradient(#e0e7ff 1px,transparent 1px),linear-gradient(90deg,#e0e7ff 1px,transparent 1px);background-size:22px 22px}
.sx-pad-area canvas{position:absolute;inset:0;touch-action:none;cursor:crosshair}
.sx-pad-note{font-size:.78rem;color:#64748b;padding:5px 10px;border-top:1px solid #e2e8f0}
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
.sx-repw{position:fixed;inset:0;z-index:4500;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(15,23,42,.45)}
.sx-repf{width:min(440px,100%);max-height:88vh;overflow:auto;direction:rtl;background:#fff;color:#0f172a;border:1.5px solid #cbd5e1;border-right:5px solid #b91c1c;border-radius:14px;padding:14px 16px;box-shadow:0 10px 28px rgba(0,0,0,.25);font-family:inherit;line-height:1.7}
.sx-repf h4{margin:0 0 8px;font-size:1.05rem}.sx-repf>label{display:block;font-weight:700;margin:6px 0}
.sx-repf select,.sx-repf input[name=e],.sx-repf textarea{display:block;width:100%;box-sizing:border-box;font:inherit;font-weight:400;margin-top:4px;padding:7px 9px;border:1.5px solid #cbd5e1;border-radius:9px;background:#fff;color:#0f172a}
.sx-repf .k{display:grid;gap:2px;margin:6px 0}.sx-repf .k label{font-weight:600;cursor:pointer}
.sx-repf .w{margin:4px 0;color:#92400e;font-size:.9rem}.sx-repf .r{margin:6px 0 0;font-weight:700;color:#b91c1c;min-height:1em}
.sx-repf .b{display:flex;gap:8px;margin-top:8px}.sx-repf .b button{font:inherit;font-weight:800;cursor:pointer;border-radius:10px;padding:8px 14px;border:0;background:#b91c1c;color:#fff}
.sx-repf .b button.x{background:#fff;color:#475569;border:1px solid #cbd5e1}.sx-repf .b button:disabled{opacity:.6}
@media print{.sx-repw,.sx-rep{display:none!important}}
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
  foot.innerHTML = '<a class="sx-home" href="' + home + '">🏠 الصفحة الرئيسية</a><a class="sx-btn" href="#" onclick="window.scrollTo({top:0,behavior:\'smooth\'});return false">⬆️ أعلى الصفحة</a>';
  document.body.appendChild(foot);
  /* ---------- 1b. «🚩 أبلغ عن خطأ» (his ask 2026-11-18) ----------
     Pupils and colleagues tell the teacher about a mistake. The report goes to the teacher's own Google Sheet
     (same Apps Script as the counter, sheet «بلاغات»): page, exercise, kind, a short note. No name, no IP. */
  var repB = el("button", "sx-btn sx-rep", "🚩 أبلغ عن خطأ");
  repB.type = "button"; repB.title = "وجدت خطأ في هذه الصفحة؟ أخبر الأستاذ";
  repB.onclick = openReport;
  foot.appendChild(repB);
  function openReport() {
    if ($(".sx-repw")) return;
    var exs = []; try { if (typeof exercises !== "undefined" && Array.isArray(exercises)) exs = exercises; } catch (e) {}
    var exField = exs.length
      ? '<select name="e"><option value="">الصفحة كلها</option>' + exs.map(function (x, i) { return '<option value="' + (i + 1) + '">التمرين ' + (i + 1) + "</option>"; }).join("") + "</select>"
      : '<input name="e" maxlength="30" placeholder="مثلا: السؤال 3 (اختياري)">';
    var KINDS = [["sol", "خطأ في الحل أو التصحيح"], ["rej", "جوابي صحيح لكنه رُفض"], ["q", "خطأ في السؤال أو الشكل"], ["btn", "زر أو صفحة لا تعمل"], ["other", "أخرى"]];
    var w = el("div", "sx-repw");
    w.innerHTML = '<form class="sx-repf" role="dialog" aria-label="أبلغ عن خطأ"><h4>🚩 أبلغ الأستاذ عن خطأ</h4>' +
      '<label>أين؟ ' + exField + "</label>" +
      '<div class="k">' + KINDS.map(function (k, i) { return '<label><input type="radio" name="k" value="' + k[0] + '"' + (i ? "" : " checked") + "> " + k[1] + "</label>"; }).join("") + "</div>" +
      '<label>ماذا لاحظت؟ (اختياري)<textarea name="m" maxlength="300" rows="3" placeholder="مثلا: كتبت 12 cm والجواب الصحيح 12 cm لكنه رُفض"></textarea></label>' +
      '<p class="w">⚠️ لا تكتب اسمك ولا أي معلومة شخصية.</p>' +
      '<div class="b"><button type="submit">📤 أرسل</button><button type="button" class="x">إلغاء</button></div><p class="r" role="status"></p></form>';
    document.body.appendChild(w);
    var f = $("form", w), out = $(".r", f);
    function close() { w.remove(); }
    $(".x", f).onclick = close;
    w.addEventListener("click", function (e) { if (e.target === w) close(); });
    f.onsubmit = function (e) {
      e.preventDefault();
      var day = new Date().toISOString().slice(0, 10), lim = {};
      try { lim = JSON.parse(localStorage.getItem("math-rep") || "{}") || {}; } catch (er) {}
      if (lim.d !== day) lim = { d: day, n: 0 };
      if (lim.n >= 5) { out.textContent = "شكرا! أرسلت 5 بلاغات اليوم، وهذا يكفي. أعد المحاولة غدا."; return; }
      if (navigator.onLine === false) { out.textContent = "لا يوجد اتصال بالإنترنت. أرسل البلاغ عندما تتصل."; return; }
      var page = rel.replace(/index\.html$/, "") || "/";
      var q = "?a=report&p=" + encodeURIComponent(page) + "&e=" + encodeURIComponent(f.e.value || "") +
        "&k=" + encodeURIComponent((f.querySelector("input[name=k]:checked") || {}).value || "other") +
        "&m=" + encodeURIComponent((f.m.value || "").slice(0, 300));
      var sb = $("button[type=submit]", f); sb.disabled = true; out.textContent = "جارٍ الإرسال…";
      fetch(STATS_URL + q, { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (d) {
        if (!d || !d.saved) throw 0;
        lim.n++; try { localStorage.setItem("math-rep", JSON.stringify(lim)); } catch (er) {}
        close(); toast("✓ وصل بلاغك إلى الأستاذ. شكرا لك!");
      }).catch(function () { sb.disabled = false; out.textContent = "تعذّر الإرسال الآن. أعد المحاولة بعد قليل."; });
    };
  }
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
    all[rel] = { s: r.s, m: r.m, st: r.st, a: r.a, n: r.n, d: !!(r.d || old.d), b: best, t: Date.now() };
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
        toast("▶ أكملتَ من حيث توقفت (" + nSaved + " من " + allQ.length + " سؤالا).");
      }, 60);
    } else if (nSaved) {
      var rb = el("div", "sx-resume");
      rb.innerHTML = '<span>📌 لديك محاولة محفوظة على هذا الجهاز (' + nSaved + " من " + allQ.length + ' سؤالا).</span>' +
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
          return '<button type="button" data-m="' + m + '" class="' + (m === def ? "on" : "") + '">' + (m >= 60 && m % 60 === 0 ? (m === 60 ? "ساعة" : m === 120 ? "ساعتان" : m / 60 + " ساعات") : m === 90 ? "ساعة ونصف" : m + " دقيقة") + "</button>";
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
        (miss ? "<br>⚠️ لم تُجب عن " + miss + " سؤالا." : "") + '</p><div class="sx-row"><button type="button" class="sx-main go">نعم، سلّم الورقة</button><button type="button" class="sx-btn no">أكمل الامتحان</button></div>';
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
      $("span", cbn).textContent = "تحدٍّ من " + (chal.n || "زميلك") + ": " + fmt(chal.s) + " / " + chal.m + (chal.t ? " خلال " + chal.t + " دقيقة" : "") + ". هل تتغلّب على هذه النتيجة؟";
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
        (tu ? '<p class="tip">⏱️ ' + (tu.exam ? "وضع الامتحان: استغرقت " + mins + " دقيقة من " + tu.exam : "المدة: حوالي " + mins + " دقيقة") + ".</p>" : "") +
        (rows.some(function (o) { return o.st !== "ok"; }) ? '<p class="tip">🔁 ابدأ بالموارد 🔴 ثم 🟡: اقرأ الحل النموذجي، ثم تدرّب بتمرين مشابه، وأعد الورقة غدا بهدوء.</p>'
          : '<p class="tip">🌟 كل الموارد متحكَّم فيها! جرّب تحديا أو سلسلة أخرى من الفهرس.</p>');
      if (chal) {
        var win = r0.s > chal.s || (r0.s === chal.s && chal.t && mins && mins < chal.t);
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
      var text = "🏁 أحرزتُ " + fmt(r.s) + "/" + r.m + " في «" + t + "»" + (mins ? " خلال " + mins + " دقيقة" : "") + "، هل يمكنك التغلب على نتيجتي؟";
      if (navigator.share) { navigator.share({ text: text, url: url }).catch(function () {}); return; }
      copyTxt(text + "\n" + url);
      toast("🔗 نُسخت رسالة التحدي: الصقها لزميلك في واتساب أو ماسنجر.");
    }
    function copyTxt(t) {
      function old() { var a = document.createElement("textarea"); a.value = t; document.body.appendChild(a); a.select(); try { document.execCommand("copy"); } catch (e) {} a.remove(); }
      try { navigator.clipboard.writeText(t).catch(old); } catch (e) { old(); }
    }

    function certificate(name, cls, rows, tu) {
      var r = readScore() || { s: 0, m: 20, st: 0 }, ratio = r.s / (r.m || 20);
      var W = 1080, H = 1350, c = document.createElement("canvas"); c.width = W; c.height = H;
      var x = c.getContext("2d"), F = '"Tajawal", "Segoe UI", Tahoma, Arial, sans-serif';
      x.fillStyle = "#fff"; x.fillRect(0, 0, W, H);
      x.strokeStyle = "#1e3a8a"; x.lineWidth = 14; x.strokeRect(30, 30, W - 60, H - 60);
      x.strokeStyle = "#d97706"; x.lineWidth = 3; x.strokeRect(56, 56, W - 112, H - 112);
      x.textAlign = "center"; x.direction = "rtl"; x.fillStyle = "#334155";
      x.font = "bold 30px " + F;
      x.fillText("الجمهورية الجزائرية الديمقراطية الشعبية — وزارة التربية", W / 2, 120);
      x.fillText("متوسطة محمد العربي بن مهيدي، وادي فراغة، قالمة", W / 2, 165);
      var title = ratio >= 0.8 ? "شهادة تفوّق" : ratio >= 0.5 ? "شهادة نجاح" : "شهادة مثابرة";
      x.font = "120px " + F; x.fillText(ratio >= 0.8 ? "🏆" : ratio >= 0.5 ? "🎓" : "💪", W / 2, 310);
      x.fillStyle = "#1e3a8a"; x.font = "bold 82px " + F; x.fillText(title, W / 2, 420);
      x.fillStyle = "#475569"; x.font = "bold 34px " + F; x.fillText("تُمنح هذه الشهادة إلى التلميذ(ة):", W / 2, 490);
      x.fillStyle = "#0f172a"; x.font = "bold 64px " + F; x.fillText(name || "....................", W / 2, 575);
      x.fillStyle = "#475569"; x.font = "bold 34px " + F;
      x.fillText((cls ? "القسم: " + cls + " — " : "") + (LEVEL[level] ? "السنة " + LEVEL[level] : ""), W / 2, 630);
      var t = document.title.split(" - ")[0].slice(0, 44);
      x.fillText("في «" + t + "»", W / 2, 680);
      x.direction = "ltr"; x.fillStyle = "#1e3a8a"; x.font = "bold 150px " + F; x.fillText(fmt(r.s) + " / " + (r.m || 20), W / 2, 840);
      x.direction = "rtl"; x.fillStyle = "#92400e"; x.font = "bold 40px " + F;
      var mins = tu ? Math.max(1, Math.round(tu.ms / 60000)) : 0;
      x.fillText((r.st ? "⭐ " + r.st + " نجمة" : "") + (r.st && mins ? "   ·   " : "") + (mins ? "⏱️ " + mins + " دقيقة" : ""), W / 2, 910);
      /* diagnosis, small */
      var y = 975, shown = rows.slice(0, 5);
      x.font = "bold 30px " + F; x.textAlign = "right";
      shown.forEach(function (o) {
        x.fillStyle = o.st === "ok" ? "#15803d" : o.st === "mid" ? "#b45309" : "#b91c1c";
        x.beginPath(); x.arc(W - 150, y - 10, 11, 0, 7); x.fill();
        x.fillStyle = "#334155"; x.fillText(o.n.slice(0, 40), W - 175, y);
        x.textAlign = "left"; x.direction = "ltr"; x.fillText(fmt(o.e) + " / " + fmt(o.p), 150, y); x.textAlign = "right"; x.direction = "rtl";
        y += 46;
      });
      x.textAlign = "center"; x.fillStyle = "#475569"; x.font = "bold 32px " + F;
      var d = new Date(), ds = d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear();
      x.fillText("الأستاذ: يوسفي السوفي", W / 2, H - 140);
      x.font = "28px " + F; x.direction = "ltr"; x.fillStyle = "#64748b";
      x.fillText(ds + "  ·  " + ROOT.host + ROOT.pathname, W / 2, H - 92);
      c.toBlob(function (blob) {
        if (!blob) return;
        var file = new File([blob], "shahada.png", { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) navigator.share({ files: [file], text: title + " — " + t }).catch(function () { dl(blob); });
        else dl(blob);
      }, "image/png");
      function dl(blob) { var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "shahada.png"; document.body.appendChild(a); a.click(); a.remove(); toast("🎓 حُفظت الشهادة في هاتفك (التنزيلات)."); }
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
  function openPad(key, title, src) {
    var strokes = pads[key] = pads[key] || [];
    var ov = el("div", "sx-pad");
    var COLS = [["#111827", "أسود"], ["#1d4ed8", "أزرق"], ["#dc2626", "أحمر"], ["#15803d", "أخضر"]];
    ov.innerHTML = '<div class="sx-pad-top"><b>📝 مسودة الحساب</b><span class="t"></span><button type="button" class="x">✕ إغلاق</button></div>' +
      '<div class="sx-pad-tools">' + COLS.map(function (c, i) { return '<button type="button" class="col' + (i === 0 ? " on" : "") + '" data-c="' + c[0] + '" aria-label="' + c[1] + '"><i style="background:' + c[0] + '"></i></button>'; }).join("") +
      '<button type="button" class="w" data-w="2.6">✏️ رفيع</button><button type="button" class="er">🧽 ممحاة</button><button type="button" class="un">↶ تراجع</button><button type="button" class="cl">🗑️ مسح</button></div>' +
      (src ? '<details class="sx-pad-q" open><summary>📄 نص التمرين (اضغط للتصغير)</summary><div></div></details>' : "") +
      '<div class="sx-pad-area"><canvas></canvas></div><div class="sx-pad-note">المسودة لا تُصحَّح ولا تُرسل: اكتب بإصبعك، ثم انقل النتيجة مع الوحدة إلى خانة الجواب.</div>';
    $(".t", ov).textContent = title || "";
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
  var SMSG = "إجابتك تساوي النتيجة، لكنها ليست على أبسط شكل: أكمل الاختزال (اقسم البسط والمقام على قاسمهما المشترك الأكبر).";
  var GEN = {
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
