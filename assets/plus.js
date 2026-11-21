/* plus.js — platform features of 2026-11-18 (his list from another AI's review, «ابدأ الآن… أكمل كل شيء»).
   Loaded after site.js on every page (build_index.py). Everything stays on the pupil's phone: no server, no name sent.
   1. 🎲 تمارين لا نهائية: random numbers for every level (site.js generators + new ones below), with diagnosis of typical errors.
   2. 🔁 نقل التقدّم: a code / link that carries this child's progress to another phone (no account, no server).
   3. 📊 تقرير التقدّم: report for parents and teacher by domain (numbers, geometry, data), strengths and weak points.
   4. 🎓 ركن الشهادة (4m): practice mix of BEM skills + links; the exam date is shown only once officially announced.
   5. 🎖️ رمز الإنجاز: a short code for a finished page that the teacher can read back (low stakes: it can be faked).
   6. ♿ labels for screen readers on icon-only buttons, live regions on feedback boxes. */
(function () {
  "use strict";
  var me = document.currentScript;
  var ROOT = new URL("..", (me && me.src) || location.href);
  var rootPath = decodeURIComponent(ROOT.pathname), path = decodeURIComponent(location.pathname);
  var rel = path.indexOf(rootPath) === 0 ? path.slice(rootPath.length) : path.replace(/^\//, "");
  var pm = rel.match(/^([1-4]m)\/(?:(t[1-3])\/([a-z0-9]+)|(bem))\//);
  var isIndex = !pm && /(^|\/)(index\.html)?$/.test(rel);
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function get(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  var LV = { "1m": "السنة الأولى متوسط", "2m": "السنة الثانية متوسط", "3m": "السنة الثالثة متوسط", "4m": "السنة الرابعة متوسط" };

  var css = el("style");
  css.textContent =
    ".px{margin:12px 0 4px;background:var(--surface,#fff);color:var(--text,#0f172a);border:1px solid var(--border,#e2e8f0);border-top:4px solid #0e8f8a;border-radius:16px;padding:12px 14px;box-shadow:var(--shadow-sm);direction:rtl}" +
    ".px h2{margin:0;font-size:1.05rem}.px .sub{color:var(--muted,#475569);font-size:.85rem}" +
    ".px .row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.px .sp{flex:1}" +
    ".px .chips{display:flex;gap:6px;overflow-x:auto;padding:8px 0 4px;flex-wrap:nowrap}.px .chips button{flex:0 0 auto;font:inherit;font-size:.82rem;font-weight:700;border-radius:999px;padding:5px 11px;border:1.5px solid var(--border,#cbd5e1);background:var(--soft,#f8fafc);color:var(--text,#0f172a);cursor:pointer}" +
    ".px .chips button.on{border-color:#0e8f8a;background:#ccfbf1;color:#115e59}" +
    ".px .q{margin:8px 0;font-size:1.05rem;line-height:1.9}.px .tag{display:inline-block;font-size:.75rem;font-weight:800;border-radius:8px;padding:1px 8px;background:#ccfbf1;color:#115e59;margin-bottom:4px}" +
    ".px .math{white-space:nowrap;direction:ltr;unicode-bidi:isolate}.px .fr{display:inline-flex;flex-direction:column;vertical-align:middle;text-align:center;line-height:1.05;margin:0 2px;font-size:.92em}.px .fr>span:first-child{border-bottom:2px solid currentColor;padding:0 3px 1px}" +
    ".px input,.px textarea{font:inherit;font-size:1.02rem;padding:8px 10px;border:2px solid var(--border,#cbd5e1);border-radius:10px;background:var(--surface,#fff);color:var(--text,#0f172a)}" +
    ".px input{flex:1;min-width:0;direction:ltr;text-align:center}.px textarea{width:100%;min-height:90px;direction:ltr;font-size:.8rem}" +
    ".px .b{font:inherit;font-weight:800;border:0;border-radius:10px;padding:8px 14px;background:#0f4c81;color:#fff;cursor:pointer;min-height:42px}.px .b.s{background:var(--soft,#f1f5f9);color:var(--text,#0f172a);border:1.5px solid var(--border,#cbd5e1)}" +
    ".px .b:disabled,.px input:disabled{opacity:.6}" +
    ".px .syms{display:flex;gap:6px;margin:8px 0 0;overflow-x:auto}.px .syms button{direction:ltr;font:inherit;font-weight:800;min-width:40px;min-height:40px;flex:0 0 auto;border-radius:9px;border:1.5px solid var(--border,#cbd5e1);background:var(--soft,#f8fafc);color:var(--text,#0f172a);cursor:pointer}" +
    ".px .fb{display:block;font-weight:400;text-decoration:none;margin-top:8px;border-radius:10px;padding:8px 10px;font-size:.92rem;line-height:1.8}.px .fb:empty{display:none}" +
    ".px .fb.h{background:#fffbeb;border:1px solid #fcd34d;color:#713f12}.px .fb.s{background:#dcfce7;border:1px solid #86efac;color:#14532d}.px .fb.f{background:#eff6ff;border:1px solid #93c5fd;color:#1e3a8a}" +
    ".px [hidden]{display:none!important}.px .pxmini{font-weight:700;font-size:.92rem}" +
    ".px .sol{margin-top:8px;border:1px solid var(--border,#e2e8f0);border-radius:10px;padding:8px 10px;line-height:1.9}.px .sol>div{overflow-x:auto}.px .sol .end{font-weight:800}" +
    ".px .pills{display:flex;gap:6px}.px .pill{font-size:.8rem;font-weight:800;border-radius:999px;padding:3px 10px;border:1px solid var(--border,#e2e8f0);background:var(--soft,#f8fafc)}" +
    ".px .shake{animation:pxs .35s}@keyframes pxs{0%,100%{transform:none}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}" +
    ".px-ov{position:fixed;inset:0;z-index:4600;background:rgba(15,23,42,.45);display:flex;align-items:flex-end;justify-content:center;direction:rtl}" +
    ".px-ov>.px{width:100%;max-width:640px;max-height:90vh;overflow:auto;border-radius:16px 16px 0 0;margin:0}" +
    ".px table{width:100%;border-collapse:collapse;font-size:.88rem;margin:6px 0}.px td,.px th{border:1px solid var(--border,#e2e8f0);padding:4px 6px;text-align:right}.px th{background:var(--soft,#f1f5f9)}" +
    ".px .bar{height:8px;border-radius:6px;background:#e2e8f0;overflow:hidden;min-width:60px}.px .bar i{display:block;height:100%;background:#0e8f8a}" +
    ".px .code{font-family:monospace;font-size:1.3rem;font-weight:800;letter-spacing:2px;direction:ltr;text-align:center;background:var(--soft,#f8fafc);border:1.5px dashed #0e8f8a;border-radius:10px;padding:6px}" +
    ".px-btns{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin:10px 0}" +
    /* 2026-11-21 his «مازال تحدي الشهادة لونه اشهب… إطار مميز يضيئ… يفتح التمرين ويحاط بلون مميز» + «سؤال المراجعة اليومية»:
       black text, a glowing frame around «ركن الشهادة» and «سؤال اليوم», the opened challenge exercise framed in blue */
    "#bemhub.px{border:3px solid #f59e0b!important;border-top-width:6px!important;animation:pxglowA 2.4s ease-in-out infinite}" +
    "#daily{border:3px solid #3b82f6!important;border-top-width:6px!important;animation:pxglowB 2.4s ease-in-out infinite}" +
    "#practice.px{border:3px solid #0d9488!important;border-top-width:6px!important;animation:pxglowC 2.4s ease-in-out infinite}" +
    "@keyframes pxglowC{0%,100%{box-shadow:0 0 6px rgba(13,148,136,.3)}50%{box-shadow:0 0 0 4px rgba(13,148,136,.2),0 0 22px rgba(13,148,136,.5)}}" +
    "#bemhub h2,#daily h2,#practice h2{font-size:1.15rem;font-weight:800}" +
    "#bemp.px{border:3px solid #2563eb!important;border-radius:14px;margin:12px 0 2px;box-shadow:0 0 0 4px rgba(37,99,235,.2),0 0 18px rgba(37,99,235,.35)!important;animation:pxin .5s ease-out}" +
    "@keyframes pxglowA{0%,100%{box-shadow:0 0 6px rgba(245,158,11,.35)}50%{box-shadow:0 0 0 4px rgba(245,158,11,.22),0 0 22px rgba(245,158,11,.6)}}" +
    "@keyframes pxglowB{0%,100%{box-shadow:0 0 6px rgba(59,130,246,.3)}50%{box-shadow:0 0 0 4px rgba(59,130,246,.2),0 0 22px rgba(59,130,246,.55)}}" +
    "@keyframes pxin{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}" +
    "@media (prefers-reduced-motion:reduce){#bemhub.px,#daily,#bemp.px,#practice.px{animation:none!important}}" +
    "html[data-theme=\"light\"] #bemhub,html[data-theme=\"light\"] #bemp,html[data-theme=\"light\"] #practice,html[data-theme=\"light\"] #daily{--text:#000;--muted:#1f2937}html[data-theme=\"light\"] #bemhub.px{background:linear-gradient(180deg,#fffbeb,#fff 60%)!important}html[data-theme=\"light\"] #daily{background:linear-gradient(180deg,#eff6ff,#fff 60%)!important}html[data-theme=\"light\"] #bemp.px{background:#fff!important}" +
    "@media (prefers-color-scheme:light){html:not([data-theme=\"dark\"]) #bemhub,html:not([data-theme=\"dark\"]) #bemp,html:not([data-theme=\"dark\"]) #practice,html:not([data-theme=\"dark\"]) #daily{--text:#000;--muted:#1f2937}html:not([data-theme=\"dark\"]) #bemhub.px{background:linear-gradient(180deg,#fffbeb,#fff 60%)!important}html:not([data-theme=\"dark\"]) #daily{background:linear-gradient(180deg,#eff6ff,#fff 60%)!important}html:not([data-theme=\"dark\"]) #bemp.px{background:#fff!important}}" +
    "@media print{body>*:not(.px-ov){display:none!important}.px-ov{position:static;background:none}.px-ov>.px{max-height:none;box-shadow:none;border:0}.px .noprint{display:none!important}}";
  document.head.appendChild(css);

  /* ========== 1. generators (same shape as site.js: q, ans, h1, h2, steps, res, concl, unit, chip) + diag(v) + ok(v) ========== */
  function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function M(s) { return '<span class="math">' + s + "</span>"; }
  function FR(a, b) { return '<span class="fr"><span>' + a + "</span><span>" + b + "</span></span>"; }
  function dn(v) { return String(Math.round(v * 1000) / 1000).replace(".", ",").replace(/^-/, "−"); }
  function sg(n) { return n < 0 ? "−" + Math.abs(n) : String(n); }
  function par(n) { return n < 0 ? "(−" + Math.abs(n) + ")" : "(+" + n + ")"; }
  /* polynomial in x → [c0,c1,c2]; "dup" if a power repeats (not simplified) */
  function poly(s) {
    s = String(s).replace(/[٠-٩]/g, function (d) { return "٠١٢٣٤٥٦٧٨٩".indexOf(d); }).replace(/\s+/g, "").replace(/[−–]/g, "-").replace(/²/g, "^2").replace(/,/g, ".").replace(/[×*·]/g, "").replace(/X/g, "x");
    if (!s) return null;
    var c = [0, 0, 0], seen = {}, first = true;
    while (s.length) {
      var m = /^([+-])?(\d+(?:\.\d+)?)?(x(\^2)?)?/.exec(s);
      if (!m || !m[0] || (!m[2] && !m[3]) || (!first && !m[1])) return null;
      var d = m[3] ? (m[4] ? 2 : 1) : 0;
      if (seen[d]) return "dup";
      seen[d] = 1; c[d] += (m[2] ? +m[2] : 1) * (m[1] === "-" ? -1 : 1);
      s = s.slice(m[0].length); first = false;
    }
    return c;
  }
  function pstr(c) {
    var t = "";
    [[c[2], "x²"], [c[1], "x"], [c[0], ""]].forEach(function (p) {
      var k = p[0]; if (!k) return;
      var a = Math.abs(k), s = (a === 1 && p[1] ? "" : String(a)) + p[1];
      t += t ? (k < 0 ? " − " : " + ") + s : (k < 0 ? "−" : "") + s;
    });
    return t || "0";
  }
  function polyOk(want) { return function (raw) { var p = poly(raw); return p && p !== "dup" && p[0] === want[0] && p[1] === want[1] && p[2] === want[2]; }; }
  function num(raw) { var s = String(raw).replace(/[٠-٩]/g, function (d) { return "٠١٢٣٤٥٦٧٨٩".indexOf(d); }).replace(/\s+/g, "").replace(/(cm²|m²|cm|mm|km|kg|m|da|دج)$/i, "").replace(/[−–]/g, "-").replace(",", "."); return /^-?\d+(\.\d+)?$/.test(s) ? +s : NaN; }

  var NEW = {
    div: function () {
      var b = ri(3, 25), q = ri(6, 80), r = ri(0, b - 1), a = b * q + r;
      return { q: "أنجز القسمة الإقليدية للعدد " + M(a) + " على " + M(b) + ".", chip: "اكتب: حاصل القسمة ; الباقي (مثال الكتابة: 12 ; 3)",
        ans: [q + ";" + r], diag: function (v) { return v.replace(/\s/g, "") === r + ";" + q ? "بدّلت بين حاصل القسمة والباقي: اكتب حاصل القسمة أولا." : /;/.test(v) && +v.split(";")[1] >= b ? "الباقي يجب أن يكون أصغر من القاسم " + M(b) + "." : ""; },
        h1: "ابحث عن أكبر مضاعف للعدد " + M(b) + " لا يتجاوز " + M(a) + ".", h2: M(b + " × " + q + " = " + b * q) + "، ثم احسب الباقي " + M(a + " − " + b * q) + ".",
        steps: ["<b>الطريقة:</b> نبحث عن حاصل القسمة " + M("q") + " والباقي " + M("r") + " حيث " + M("a = b × q + r") + " و " + M("r < b") + ".", M(b + " × " + q + " = " + b * q + " ≤ " + a + " < " + b * (q + 1) + " = " + b + " × " + (q + 1)), M(a + " − " + b * q + " = " + r)],
        res: "النتيجة: " + M(a + " = " + b + " × " + q + " + " + r) + " مع " + M(r + " < " + b), concl: "<b>الاستنتاج:</b> حاصل القسمة " + M(q) + " والباقي " + M(r) + "." };
    },
    arr: function () {
      var n = ri(2, 300), d = pick([1, 2]), f = ri(1, d === 1 ? 9 : 99), x = n + f / Math.pow(10, d), ans = Math.round(x), first = d === 1 ? f : Math.floor(f / 10);
      return { q: "دوّر العدد " + M(dn(x)) + " إلى الوحدة.", ans: [String(ans)],
        diag: function (v) { return +v === n && ans !== n ? "حذفت الجزء العشري فقط: رقم الأعشار " + M(first) + " أكبر من 5 أو يساويه، فنضيف 1." : +v === n + 1 && ans === n ? "رقم الأعشار " + M(first) + " أصغر من 5: نُبقي الوحدة كما هي." : ""; },
        h1: "انظر إلى رقم الأعشار (أول رقم بعد الفاصلة).", h2: "إذا كان رقم الأعشار 5 أو أكثر نضيف 1 إلى رقم الوحدات، وإلا نُبقيه.",
        steps: ["<b>الطريقة:</b> لتدوير عدد عشري إلى الوحدة ننظر إلى رقم الأعشار: إذا كان أصغر من 5 نحذف الجزء العشري، وإلا نضيف 1 إلى الجزء الصحيح.", "رقم الأعشار هو " + M(first) + (first >= 5 ? " ≥ 5" : " < 5") + "."],
        res: "النتيجة: " + M(ans), concl: "<b>الاستنتاج:</b> مدوّر العدد " + M(dn(x)) + " إلى الوحدة هو " + M(ans) + "." };
    },
    rel: function () {
      var a = ri(-20, 20) || 7, b = ri(-20, 20) || -5, s = a + b;
      return { q: "احسب: " + M(par(a) + " + " + par(b)), ans: [String(s)],
        diag: function (v) { var w = num(v); return w === -s && s ? "انتبه إلى إشارة النتيجة: هي إشارة العدد ذي المسافة إلى الصفر الأكبر." : (a * b < 0 && w === Math.abs(a) + Math.abs(b) * (s < 0 ? -1 : 1)) ? "العددان مختلفا الإشارة: نطرح المسافتين إلى الصفر ولا نجمعهما." : ""; },
        h1: a * b > 0 ? "العددان لهما نفس الإشارة: نجمع المسافتين إلى الصفر ونحتفظ بالإشارة." : "العددان مختلفا الإشارة: نطرح المسافة الصغرى من الكبرى.",
        h2: "المسافتان إلى الصفر: " + M(Math.abs(a)) + " و " + M(Math.abs(b)) + ".",
        steps: ["<b>الطريقة:</b> " + (a * b > 0 ? "مجموع عددين نسبيين لهما نفس الإشارة: نجمع المسافتين إلى الصفر ونحتفظ بالإشارة المشتركة." : "مجموع عددين نسبيين مختلفي الإشارة: نطرح المسافة الصغرى من الكبرى، ونأخذ إشارة العدد ذي المسافة الأكبر."),
          a * b > 0 ? M(Math.abs(a) + " + " + Math.abs(b) + " = " + (Math.abs(a) + Math.abs(b))) : M(Math.max(Math.abs(a), Math.abs(b)) + " − " + Math.min(Math.abs(a), Math.abs(b)) + " = " + Math.abs(s))],
        res: "النتيجة: " + M(par(a) + " + " + par(b) + " = " + sg(s)), concl: "<b>الاستنتاج:</b> المجموع يساوي " + M(sg(s)) + "." };
    },
    prop: function () {
      var u = ri(8, 24) * 5, k = ri(2, 6), m = ri(2, 12); if (m === k) m++;
      var P = k * u, R = m * u, it = pick([["الطماطم من بوشقوف", "kg"], ["البرتقال", "kg"], ["زيت الزيتون من قالمة", "L"]]);
      return { q: "ثمن " + M(k + " " + it[1]) + " من " + it[0] + " هو " + M(P + " DA") + ". ما ثمن " + M(m + " " + it[1]) + "؟ (الثمن متناسب مع الكمية)", ans: [String(R)], unit: "DA",
        diag: function (v) { return num(v) === P * m ? "ضربت الثمن الكلي في الكمية الجديدة: احسب أولا ثمن الوحدة." : ""; },
        h1: "احسب أولا ثمن " + M("1 " + it[1]) + ".", h2: M(P + " ÷ " + k + " = " + u) + " DA، ثم اضرب في " + M(m) + ".",
        steps: ["<b>الطريقة:</b> الرجوع إلى الوحدة: نحسب ثمن الوحدة ثم نضرب في الكمية المطلوبة.", M(P + " ÷ " + k + " = " + u) + " DA", M(u + " × " + m + " = " + R) + " DA"],
        res: "النتيجة: " + M(R + " DA"), concl: "<b>الاستنتاج:</b> ثمن " + M(m + " " + it[1]) + " هو " + M(R + " DA") + "." };
    },
    pyth: function () {
      var T = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10], [7, 24, 25], [9, 12, 15]]), k = T[2] > 17 ? 1 : ri(1, 2), a = T[0] * k, b = T[1] * k, c = T[2] * k, hyp = Math.random() < .6;
      if (hyp) return { q: "المثلث " + M("ABC") + " قائم في " + M("A") + "، " + M("AB = " + a + " cm") + " و " + M("AC = " + b + " cm") + ". احسب " + M("BC") + ".", ans: [String(c)], unit: "cm",
        diag: function (v) { var w = num(v); return w === a + b ? "الوتر لا يساوي مجموع الضلعين: استعمل المربعات." : w === c * c ? "هذا هو " + M("BC²") + "، بقي حساب الجذر." : ""; },
        h1: "المثلث قائم في " + M("A") + ": الوتر هو " + M("[BC]") + " و " + M("BC² = AB² + AC²") + ".", h2: M("BC² = " + a * a + " + " + b * b + " = " + c * c) + ".",
        steps: ["<b>الطريقة:</b> المثلث " + M("ABC") + " قائم في " + M("A") + "، حسب خاصية فيتاغورس: " + M("BC² = AB² + AC²") + ".", M("BC² = " + a + "² + " + b + "² = " + a * a + " + " + b * b + " = " + c * c), M("BC = √" + c * c + " = " + c)],
        res: "النتيجة: " + M("BC = " + c + " cm"), concl: "<b>الاستنتاج:</b> " + M("BC = " + c + " cm") + "." };
      return { q: "المثلث " + M("ABC") + " قائم في " + M("A") + "، " + M("BC = " + c + " cm") + " و " + M("AB = " + a + " cm") + ". احسب " + M("AC") + ".", ans: [String(b)], unit: "cm",
        diag: function (v) { var w = num(v); return w === Math.round(Math.sqrt(c * c + a * a) * 100) / 100 ? "جمعت المربعين: " + M("[BC]") + " هو الوتر، فـ " + M("AC² = BC² − AB²") + "." : w === b * b ? "هذا هو " + M("AC²") + "، بقي حساب الجذر." : ""; },
        h1: "الوتر هو " + M("[BC]") + ": " + M("BC² = AB² + AC²") + "، إذن " + M("AC² = BC² − AB²") + ".", h2: M("AC² = " + c * c + " − " + a * a + " = " + b * b) + ".",
        steps: ["<b>الطريقة:</b> المثلث قائم في " + M("A") + "، حسب خاصية فيتاغورس: " + M("BC² = AB² + AC²") + ".", M("AC² = BC² − AB² = " + c * c + " − " + a * a + " = " + b * b), M("AC = √" + b * b + " = " + b)],
        res: "النتيجة: " + M("AC = " + b + " cm"), concl: "<b>الاستنتاج:</b> " + M("AC = " + b + " cm") + "." };
    },
    pow: function () {
      var a = ri(2, 5), n = a > 3 ? ri(2, 3) : ri(2, 4), neg = Math.random() < .6, base = neg ? -a : a, v = Math.pow(base, n);
      var bs = neg ? "(−" + a + ")" : String(a), f = []; for (var i = 0; i < n; i++) f.push(bs);
      return { q: "احسب: " + M(bs + "<sup>" + n + "</sup>"), ans: [String(v)],
        diag: function (w) { w = num(w); return w === base * n ? "ضربت الأساس في الأس: القوة جداء " + M(n) + " عوامل كلها تساوي " + M(bs) + "." : w === -v ? "راجع الإشارة: عدد العوامل السالبة " + (n % 2 ? "فردي فالنتيجة سالبة" : "زوجي فالنتيجة موجبة") + "." : ""; },
        h1: M(bs + "<sup>" + n + "</sup>") + " هو جداء " + M(n) + " عوامل كلها تساوي " + M(bs) + ".", h2: M(f.join(" × ")) + (neg ? "، والإشارة حسب عدد العوامل السالبة." : "."),
        steps: ["<b>الطريقة:</b> " + M("a<sup>n</sup>") + " جداء " + M("n") + " عاملا كلها تساوي " + M("a") + (neg ? "؛ جداء عدد زوجي من العوامل السالبة موجب، وعدد فردي سالب." : "."), M(bs + "<sup>" + n + "</sup> = " + f.join(" × ") + " = " + sg(v))],
        res: "النتيجة: " + M(sg(v)), concl: "<b>الاستنتاج:</b> " + M(bs + "<sup>" + n + "</sup> = " + sg(v)) + "." };
    },
    dev: function () {
      var k = pick([-5, -4, -3, -2, 2, 3, 4, 5, 6]), a = ri(1, 6), b = pick([-9, -7, -5, -4, -3, -2, 2, 3, 4, 5, 7, 8]), want = [k * b, k * a, 0];
      var e = (k < 0 ? "−" + (-k) : k) + "(" + (a === 1 ? "" : a) + "x " + (b < 0 ? "− " + (-b) : "+ " + b) + ")";
      return { q: "انشر وبسّط: " + M(e), ans: [pstr(want)], ok: polyOk(want), chip: "استعمل الأزرار x و − و +",
        diag: function (v) { var p = poly(v); return p && p !== "dup" && p[1] === k * a && p[0] === b ? "ضربت " + M(k) + " في الحد الأول فقط: التوزيع على الحدّين." : p && p !== "dup" && p[1] === k * a && p[0] === -k * b ? "راجع إشارة الحد الثاني: " + M(par(k) + " × " + par(b)) + "." : ""; },
        h1: "خاصية التوزيع: " + M("k(a + b) = ka + kb") + ".", h2: M(par(k) + " × " + a + "x") + " و " + M(par(k) + " × " + par(b)) + ".",
        steps: ["<b>الطريقة:</b> خاصية التوزيع " + M("k(a + b) = ka + kb") + ".", M(e + " = " + par(k) + " × " + (a === 1 ? "" : a) + "x + " + par(k) + " × " + par(b)), M("= " + pstr(want))],
        res: "النتيجة: " + M(pstr(want)), concl: "<b>الاستنتاج:</b> " + M(e + " = " + pstr(want)) + "." };
    },
    idt: function () {
      var a = ri(1, 9), t = pick(["+", "-", "x"]), want, e, rule, mid;
      if (t === "+") { want = [a * a, 2 * a, 1]; e = "(x + " + a + ")²"; rule = "(a + b)² = a² + 2ab + b²"; mid = "x² + 2 × x × " + a + " + " + a + "²"; }
      else if (t === "-") { want = [a * a, -2 * a, 1]; e = "(x − " + a + ")²"; rule = "(a − b)² = a² − 2ab + b²"; mid = "x² − 2 × x × " + a + " + " + a + "²"; }
      else { want = [-a * a, 0, 1]; e = "(x + " + a + ")(x − " + a + ")"; rule = "(a + b)(a − b) = a² − b²"; mid = "x² − " + a + "²"; }
      return { q: "انشر وبسّط: " + M(e), ans: [pstr(want)], ok: polyOk(want), chip: "استعمل الأزرار x و ² و + و −",
        diag: function (v) { var p = poly(v); if (!p || p === "dup") return p === "dup" ? "اجمع الحدود المتشابهة." : ""; return t !== "x" && p[2] === 1 && p[1] === 0 && Math.abs(p[0]) === a * a ? "نسيت الحد " + M("2ab") + " (الجداء المضاعف)." : t === "x" && p[0] === a * a ? "إشارة الحد الثابت: " + M("(a + b)(a − b) = a² − b²") + "." : ""; },
        h1: "المتطابقة الشهيرة: " + M(rule) + ".", h2: M(e + " = " + mid) + ".",
        steps: ["<b>الطريقة:</b> نطبّق المتطابقة الشهيرة " + M(rule) + ".", M(e + " = " + mid), M("= " + pstr(want))],
        res: "النتيجة: " + M(pstr(want)), concl: "<b>الاستنتاج:</b> " + M(e + " = " + pstr(want)) + "." };
    },
    eq: function () {
      var a = pick([2, 3, 4, 5, 6, 7, 8, 9, -2, -3, -4, -5]), x = ri(-9, 9), b = ri(-20, 20) || 4, c = a * x + b;
      var e = (a === -1 ? "−" : a < 0 ? "−" + (-a) : a) + "x " + (b < 0 ? "− " + (-b) : "+ " + b) + " = " + sg(c);
      return { q: "حلّ المعادلة: " + M(e), ans: [String(x)], chip: "اكتب قيمة x فقط",
        diag: function (v) { var w = num(v); return w === (c + b) / a ? "عند نقل " + M(sg(b)) + " إلى الطرف الآخر تتغيّر إشارته." : w === -x && x ? "راجع إشارة الحل: اقسم على " + M(sg(a)) + " بإشارته." : w === (c - b) * a ? "نقسم على معامل x ولا نضرب فيه." : ""; },
        h1: "انقل " + M(sg(b)) + " إلى الطرف الثاني مع تغيير إشارته.", h2: M(sg(a) + "x = " + sg(c) + (b < 0 ? " + " + (-b) : " − " + b) + " = " + sg(c - b)) + "، ثم اقسم على " + M(sg(a)) + ".",
        steps: ["<b>الطريقة:</b> نعزل " + M("x") + ": ننقل الحد الثابت ثم نقسم على معامل " + M("x") + ".", M(sg(a) + "x = " + sg(c - b)), M("x = " + FR(sg(c - b), sg(a)) + " = " + sg(x))],
        res: "النتيجة: " + M("x = " + sg(x)), concl: "<b>الاستنتاج:</b> للمعادلة حل وحيد هو " + M(sg(x)) + "." };
    }
  };
  /* ========== 1b. 4AM generators for the rest of the programme (2026-11-20, «تحدي الشهادة اللانهائي») ========== */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function nz(a, b) { var v; do { v = ri(a, b); } while (!v); return v; }
  function clean(raw) { return String(raw).replace(/[٠-٩]/g, function (d) { return "٠١٢٣٤٥٦٧٨٩".indexOf(d); }).replace(/\s+/g, "").replace(/[−–]/g, "-").replace(/,/g, ".").replace(/[×*·]/g, "").replace(/X/g, "x"); }
  /* "a ; b" answers (order kept or free) */
  function pairOk(a, b, any) { return function (raw) { var p = clean(raw).replace(/[()]/g, "").split(/[;؛]/); if (p.length !== 2) return false; var u = +p[0], v = +p[1]; if (p[0] === "" || p[1] === "" || isNaN(u) || isNaN(v)) return false; return (u === a && v === b) || (!!any && u === b && v === a); }; }
  function lin1(k, c) { return pstr([c, k, 0]); }           /* kx + c */
  function px(s) { return M(s); }
  var NEW4 = {
    fac: function () {
      if (Math.random() < .5) {
        var k = pick([2, 3, 4, 5, 6, 7]), a = pick([1, 2, 3, 5]), b = nz(-9, 9); while (gcd(a, b) !== 1) b = nz(-9, 9);
        var want = [k * b, k * a, 0], e = pstr(want), inner = lin1(a, b);
        return { q: "حلّل إلى جداء: " + M(e), ans: [k + "(" + inner + ")"], chip: "استعمل الأزرار ( ) و x و + و −",
          ok: function (raw) { var s = clean(raw), m = /^(\d+)\((.+)\)$/.exec(s) || /^\((.+)\)(\d+)$/.exec(s); if (!m) return false; var kk = +(/^\d+$/.test(m[1]) ? m[1] : m[2]), p = poly(/^\d+$/.test(m[1]) ? m[2] : m[1]); return kk === k && p && p !== "dup" && p[2] === 0 && p[1] === a && p[0] === b; },
          diag: function (raw) { var s = clean(raw), m = /^(\d+)\((.+)\)$/.exec(s); if (!m) return ""; var p = poly(m[2]); return p && p !== "dup" && +m[1] * p[1] === k * a && +m[1] * p[0] === k * b && +m[1] < k ? "التحليل صحيح لكنه غير كامل: أخرج العامل المشترك الأكبر " + M(k) + "." : ""; },
          h1: "ابحث عن العامل المشترك بين " + M(pstr([0, k * a, 0])) + " و " + M(sg(k * b)) + ".", h2: "العامل المشترك الأكبر هو " + M(k) + ": " + M(e + " = " + k + " × " + (a === 1 ? "" : a) + "x " + (b < 0 ? "− " : "+ ") + k + " × " + Math.abs(b)) + ".",
          steps: ["<b>الطريقة:</b> نُخرج العامل المشترك: " + M("ka + kb = k(a + b)") + ".", M(e + " = " + k + " × " + (a === 1 ? "" : a) + "x " + (b < 0 ? "− " : "+ ") + k + " × " + Math.abs(b))],
          res: "النتيجة: " + M(k + "(" + inner + ")"), concl: "<b>الاستنتاج:</b> " + M(e + " = " + k + "(" + inner + ")") + "." };
      }
      var c = ri(2, 12), e2 = "x² − " + c * c;
      return { q: "حلّل إلى جداء: " + M(e2), ans: ["(x−" + c + ")(x+" + c + ")", "(x+" + c + ")(x−" + c + ")"], chip: "استعمل الأزرار ( ) و x و + و −",
        ok: function (raw) { var m = /^\(x([+-])(\d+)\)\(x([+-])(\d+)\)$/.exec(clean(raw)); return !!m && +m[2] === c && +m[4] === c && m[1] !== m[3]; },
        diag: function (raw) { var s = clean(raw); return s === "(x-" + c + ")^2" || s === "(x-" + c + ")²" ? "هذا مربع فرق، بينما العبارة فرق مربعين: " + M("a² − b² = (a − b)(a + b)") + "." : /\(x[+-]\d+\)\(x[+-]\d+\)/.test(s) && s.indexOf(String(c * c)) >= 0 ? "خذ جذر العدد " + M(c * c) + " داخل القوسين." : ""; },
        h1: "العبارة فرق مربعين: " + M("a² − b² = (a − b)(a + b)") + ".", h2: M(c * c + " = " + c + "²") + ".",
        steps: ["<b>الطريقة:</b> نستعمل المتطابقة " + M("a² − b² = (a − b)(a + b)") + ".", M(e2 + " = x² − " + c + "²")],
        res: "النتيجة: " + M("(x − " + c + ")(x + " + c + ")"), concl: "<b>الاستنتاج:</b> " + M(e2 + " = (x − " + c + ")(x + " + c + ")") + "." };
    },
    pnul: function () {
      var a = nz(-9, 9), b = pick([1, 1, 2, 3]), r = nz(-6, 6), c = -b * r; /* (x − a)(bx + c) = 0, second root r */
      var f1 = "(x " + (a < 0 ? "+ " + (-a) : "− " + a) + ")", f2 = "(" + lin1(b, c) + ")", e = f1 + f2 + " = 0";
      return { q: "حلّ المعادلة: " + M(e), ans: [a + ";" + r, r + ";" + a], ok: pairOk(a, r, true), chip: "اكتب الحلّين: حل ; حل",
        diag: function (raw) { return pairOk(-a, -r, true)(raw) || pairOk(-a, r, true)(raw) || pairOk(a, -r, true)(raw) ? "راجع إشارة الحلّ: " + M("x − a = 0") + " يعطي " + M("x = a") + "." : ""; },
        h1: "جداء معدوم: يكون الجداء معدوما إذا كان أحد عامليه معدوما.", h2: M(f1.slice(1, -1) + " = 0") + " أو " + M(f2.slice(1, -1) + " = 0") + ".",
        steps: ["<b>الطريقة:</b> " + M("A × B = 0") + " يعني " + M("A = 0") + " أو " + M("B = 0") + ".", M(f1.slice(1, -1) + " = 0") + " يعطي " + M("x = " + sg(a)), M(f2.slice(1, -1) + " = 0") + " يعطي " + M(b === 1 ? "x = " + sg(r) : b + "x = " + sg(-c) + " ، x = " + sg(r))],
        res: "النتيجة: " + M(sg(a) + " ; " + sg(r)), concl: "<b>الاستنتاج:</b> للمعادلة حلّان هما " + M(sg(a)) + " و " + M(sg(r)) + "." };
    },
    ineq: function () {
      var a = pick([2, 3, 4, 5, -2, -3, -4]), x = ri(-6, 6), b = nz(-12, 12), c = a * x + b, op = pick(["<", ">", "≤", "≥"]);
      var flip = { "<": ">", ">": "<", "≤": "≥", "≥": "≤" }, rop = a < 0 ? flip[op] : op, e = lin1(a, b) + " " + op + " " + sg(c);
      var want = "x" + rop + x;
      return { q: "حلّ المتراجحة: " + M(e), ans: ["x " + rop + " " + sg(x)], chip: "اكتب الحلول على الشكل x < 3 (استعمل الأزرار < > ≤ ≥)",
        ok: function (raw) { return clean(raw).replace("<=", "≤").replace(">=", "≥") === want; },
        diag: function (raw) { var s = clean(raw).replace("<=", "≤").replace(">=", "≥"); return a < 0 && s === "x" + op + x ? "عند القسمة على عدد سالب " + M(sg(a)) + " يتغيّر اتجاه المتراجحة." : s.replace(/[<>≤≥]/, "") === "x" + x && s !== want ? "راجع اتجاه المتراجحة." : ""; },
        h1: "انقل " + M(sg(b)) + " إلى الطرف الثاني، ثم اقسم على " + M(sg(a)) + (a < 0 ? " (عدد سالب!)" : "") + ".", h2: M(sg(a) + "x " + op + " " + sg(c - b)) + (a < 0 ? "، والقسمة على عدد سالب تقلب اتجاه المتراجحة." : "."),
        steps: ["<b>الطريقة:</b> نعزل " + M("x") + " كما في المعادلة؛ " + (a < 0 ? "نقسم على عدد سالب فيتغيّر اتجاه المتراجحة." : "نقسم على عدد موجب فلا يتغيّر الاتجاه."), M(sg(a) + "x " + op + " " + sg(c - b)), M("x " + rop + " " + FR(sg(c - b), sg(a)) + " = " + sg(x))],
        res: "النتيجة: " + M("x " + rop + " " + sg(x)), concl: "<b>الاستنتاج:</b> حلول المتراجحة هي كل الأعداد " + M("x") + " حيث " + M("x " + rop + " " + sg(x)) + "." };
    },
    sys: function () {
      var x = ri(1, 12), y = ri(1, 12), a = pick([2, 3, 4, 5]), b = pick([1, 2, 3]); if (a === b) a++;
      var S = x + y, T = a * x + b * y, it = pick([["تذكرة كبير", "تذكرة صغير", "DA"], ["كراس", "قلم", "DA"]]);
      var pa = a * 50, pb = b * 50, TT = T * 50;
      return { q: "اشترى أب " + M(S) + " تذاكر لحديقة التسلية بقالمة: تذاكر للكبار بـ " + M(pa + " DA") + " للواحدة وتذاكر للصغار بـ " + M(pb + " DA") + " للواحدة، فدفع " + M(TT + " DA") + ". كم تذكرة للكبار وكم تذكرة للصغار؟",
        ans: [x + ";" + y], ok: pairOk(x, y, false), chip: "اكتب: عدد تذاكر الكبار ; عدد تذاكر الصغار",
        diag: function (raw) { return pairOk(y, x, false)(raw) ? "بدّلت بين العددين: اكتب عدد تذاكر الكبار أولا." : ""; },
        h1: "سمّ " + M("x") + " عدد تذاكر الكبار و " + M("y") + " عدد تذاكر الصغار، واكتب جملة معادلتين.", h2: M("x + y = " + S) + " و " + M(pa + "x + " + pb + "y = " + TT) + ".",
        steps: ["<b>الطريقة:</b> نضع المسألة في جملة معادلتين من الدرجة الأولى بمجهولين ونحلّها بالتعويض.", M("x + y = " + S) + " ؛ " + M(pa + "x + " + pb + "y = " + TT), M("y = " + S + " − x") + " ، إذن " + M(pa + "x + " + pb + "(" + S + " − x) = " + TT), M((pa - pb) + "x = " + (TT - pb * S)) + " ، " + M("x = " + x) + " و " + M("y = " + y)],
        res: "النتيجة: " + M(x + " ; " + y), concl: "<b>الاستنتاج:</b> اشترى " + M(x) + " تذاكر للكبار و " + M(y) + " تذاكر للصغار (تحقق: " + M(pa + " × " + x + " + " + pb + " × " + y + " = " + TT) + ")." };
    },
    lin: function () {
      var a = pick([2, 3, 4, 5, 6, -2, -3, -4, 1.5, 2.5, -0.5]), k = nz(-8, 8), v = Math.round(a * k * 100) / 100;
      if (Math.random() < .5) return { q: M("f") + " دالة خطية حيث " + M("f(x) = " + dn(a) + "x") + ". احسب صورة العدد " + M(sg(k)) + "، أي " + M("f(" + sg(k) + ")") + ".", ans: [dn(v)],
        diag: function (raw) { return num(raw) === -v && v ? "راجع الإشارة: " + M(dn(a) + " × " + par(k)) + "." : num(raw) === a + k ? "الصورة جداء وليست مجموعا." : ""; },
        h1: "عوّض " + M("x") + " بـ " + M(sg(k)) + ".", h2: M("f(" + sg(k) + ") = " + dn(a) + " × " + par(k)) + ".",
        steps: ["<b>الطريقة:</b> صورة عدد بالدالة الخطية " + M("f(x) = ax") + " هي جداء العدد في " + M("a") + ".", M("f(" + sg(k) + ") = " + dn(a) + " × " + par(k) + " = " + dn(v))],
        res: "النتيجة: " + M("f(" + sg(k) + ") = " + dn(v)), concl: "<b>الاستنتاج:</b> صورة " + M(sg(k)) + " هي " + M(dn(v)) + "." };
      return { q: M("f") + " دالة خطية حيث " + M("f(" + sg(k) + ") = " + dn(v)) + ". عيّن معامل الدالة " + M("a") + ".", ans: [dn(a)],
        diag: function (raw) { return num(raw) === Math.round(v * k * 100) / 100 ? "المعامل حاصل قسمة وليس جداء: " + M("a = f(x) ÷ x") + "." : num(raw) === -a ? "راجع الإشارة." : ""; },
        h1: M("f(x) = ax") + " إذن " + M("a = " + FR("f(x)", "x")) + ".", h2: M("a = " + dn(v) + " ÷ " + par(k)) + ".",
        steps: ["<b>الطريقة:</b> للدالة الخطية " + M("f(x) = ax") + " لدينا " + M("a = " + FR("f(x)", "x")) + " (حيث " + M("x ≠ 0") + ").", M("a = " + FR(dn(v), sg(k)) + " = " + dn(a))],
        res: "النتيجة: " + M("a = " + dn(a)), concl: "<b>الاستنتاج:</b> " + M("f(x) = " + dn(a) + "x") + "." };
    },
    aff: function () {
      var a = nz(-5, 5), b = nz(-9, 9), x1 = ri(-4, 2), x2 = x1 + ri(1, 5), y1 = a * x1 + b, y2 = a * x2 + b;
      return { q: M("g") + " دالة تآلفية حيث " + M("g(" + sg(x1) + ") = " + sg(y1)) + " و " + M("g(" + sg(x2) + ") = " + sg(y2)) + ". عيّن العددين " + M("a") + " و " + M("b") + " حيث " + M("g(x) = ax + b") + ".",
        ans: [a + ";" + b], ok: pairOk(a, b, false), chip: "اكتب: a ; b",
        diag: function (raw) { return pairOk(-a, b, false)(raw) || pairOk(-a, -b, false)(raw) ? "راجع الإشارة في " + M("a = " + FR("g(x₂) − g(x₁)", "x₂ − x₁")) + "." : pairOk(b, a, false)(raw) ? "اكتب " + M("a") + " أولا ثم " + M("b") + "." : ""; },
        h1: M("a = " + FR("g(x₂) − g(x₁)", "x₂ − x₁")) + "، ثم " + M("b = g(x₁) − a x₁") + ".", h2: M("a = " + FR(sg(y2) + " − " + par(y1), sg(x2) + " − " + par(x1))) + ".",
        steps: ["<b>الطريقة:</b> معامل الدالة التآلفية " + M("a = " + FR("g(x₂) − g(x₁)", "x₂ − x₁")) + "، ثم نعوّض لإيجاد " + M("b") + ".", M("a = " + FR(String(y2 - y1).replace("-", "−"), String(x2 - x1)) + " = " + sg(a)), M("b = " + sg(y1) + " − " + par(a) + " × " + par(x1) + " = " + sg(b))],
        res: "النتيجة: " + M("a = " + sg(a) + " ; b = " + sg(b)), concl: "<b>الاستنتاج:</b> " + M("g(x) = " + lin1(a, b)) + "." };
    },
    vec: function () {
      var xa = ri(-6, 6), ya = ri(-6, 6), xb = ri(-6, 6), yb = ri(-6, 6); if (xa === xb && ya === yb) xb++;
      var u = xb - xa, v = yb - ya;
      return { q: "في معلم، " + M("A(" + sg(xa) + " ; " + sg(ya) + ")") + " و " + M("B(" + sg(xb) + " ; " + sg(yb) + ")") + ". احسب مركّبتي الشعاع " + M("AB") + ".", ans: [u + ";" + v], ok: pairOk(u, v, false), chip: "اكتب: x ; y",
        diag: function (raw) { return pairOk(-u, -v, false)(raw) ? "حسبت مركّبتي " + M("BA") + ": نطرح إحداثيات المبدأ " + M("A") + " من إحداثيات النهاية " + M("B") + "." : ""; },
        h1: "مركّبتا " + M("AB") + ": " + M("(x_B − x_A ; y_B − y_A)") + ".", h2: M(sg(xb) + " − " + par(xa)) + " و " + M(sg(yb) + " − " + par(ya)) + ".",
        steps: ["<b>الطريقة:</b> " + M("AB(x_B − x_A ; y_B − y_A)") + ".", M(sg(xb) + " − " + par(xa) + " = " + sg(u)), M(sg(yb) + " − " + par(ya) + " = " + sg(v))],
        res: "النتيجة: " + M("AB(" + sg(u) + " ; " + sg(v) + ")"), concl: "<b>الاستنتاج:</b> مركّبتا الشعاع " + M("AB") + " هما " + M(sg(u)) + " و " + M(sg(v)) + "." };
    },
    dist: function () {
      var T = pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 6, 10], [4, 3, 5], [12, 5, 13]]), xa = ri(-5, 5), ya = ri(-5, 5), sx = pick([1, -1]), sy = pick([1, -1]);
      var xb = xa + sx * T[0], yb = ya + sy * T[1];
      return { q: "في معلم متعامد ومتجانس، " + M("A(" + sg(xa) + " ; " + sg(ya) + ")") + " و " + M("B(" + sg(xb) + " ; " + sg(yb) + ")") + ". احسب المسافة " + M("AB") + ".", ans: [String(T[2])],
        diag: function (raw) { return num(raw) === T[2] * T[2] ? "هذا هو " + M("AB²") + "، بقي حساب الجذر." : num(raw) === T[0] + T[1] ? "المسافة ليست مجموع الفرقين: استعمل المربعات." : ""; },
        h1: M("AB = √((x_B − x_A)² + (y_B − y_A)²)") + ".", h2: M("(" + sg(sx * T[0]) + ")² + (" + sg(sy * T[1]) + ")² = " + T[2] * T[2]) + ".",
        steps: ["<b>الطريقة:</b> في معلم متعامد ومتجانس " + M("AB = √((x_B − x_A)² + (y_B − y_A)²)") + ".", M("x_B − x_A = " + sg(sx * T[0]) + " ; y_B − y_A = " + sg(sy * T[1])), M("AB² = " + T[0] * T[0] + " + " + T[1] * T[1] + " = " + T[2] * T[2]), M("AB = √" + T[2] * T[2] + " = " + T[2])],
        res: "النتيجة: " + M("AB = " + T[2]), concl: "<b>الاستنتاج:</b> المسافة " + M("AB") + " تساوي " + M(T[2]) + " (وحدة الطول)." };
    },
    rpoly: function () {
      var n = pick([3, 4, 5, 6, 8, 9, 10, 12]), c = 360 / n, nm = { 3: "مثلث متقايس الأضلاع", 4: "مربع", 5: "خماسي منتظم", 6: "سداسي منتظم", 8: "ثماني منتظم", 9: "تساعي منتظم", 10: "عشاري منتظم", 12: "مضلع منتظم بـ 12 ضلعا" }[n];
      return { q: M("O") + " مركز " + nm + " " + M("ABC…") + " (" + M(n) + " أضلاع). ما قيس الزاوية المركزية " + M("AOB") + " بالدرجات؟", ans: [String(c)],
        diag: function (raw) { return num(raw) === 180 / n ? "الزوايا المركزية تملأ دورة كاملة " + M("360°") + " لا " + M("180°") + "." : num(raw) === 180 - c ? "هذه زاوية أخرى: الزاوية المركزية رأسها المركز " + M("O") + "." : ""; },
        h1: "الزوايا المركزية للمضلع المنتظم متقايسة ومجموعها " + M("360°") + ".", h2: M("360 ÷ " + n) + ".",
        steps: ["<b>الطريقة:</b> في مضلع منتظم عدد أضلاعه " + M("n") + "، الزاوية المركزية " + M("360° ÷ n") + ".", M("360 ÷ " + n + " = " + dn(c))],
        res: "النتيجة: " + M(dn(c) + "°"), concl: "<b>الاستنتاج:</b> " + M("AOB = " + dn(c) + "°") + "." };
    },
    mean: function () {
      var n = pick([4, 5, 6]), m = ri(9, 15), v = [], s = 0, i; for (i = 0; i < n - 1; i++) { v.push(ri(m - 5, m + 5)); s += v[i]; }
      var last = n * m - s; if (last < 0 || last > 20) return NEW4.mean(); v.push(last); v.sort(function () { return Math.random() - .5; });
      return { q: "علامات تلميذ في " + M(n) + " فروض: " + M(v.join(" ; ")) + ". احسب معدّل هذه العلامات.", ans: [String(m)],
        diag: function (raw) { return num(raw) === n * m ? "هذا مجموع العلامات: اقسمه على عددها " + M(n) + "." : ""; },
        h1: "المعدّل = مجموع القيم ÷ عددها.", h2: "المجموع " + M(n * m) + ".",
        steps: ["<b>الطريقة:</b> المتوسط الحسابي = مجموع القيم ÷ عددها.", M(v.join(" + ") + " = " + n * m), M(n * m + " ÷ " + n + " = " + m)],
        res: "النتيجة: " + M(m), concl: "<b>الاستنتاج:</b> معدّل العلامات " + M(m) + " من 20." };
    },
    median: function () {
      var v = [], i; for (i = 0; i < 7; i++) v.push(ri(4, 19));
      var s = v.slice().sort(function (a, b) { return a - b; }), me = s[3];
      return { q: "أطوال قفزات " + M(7) + " تلاميذ (بالدسيمتر): " + M(v.join(" ; ")) + ". عيّن الوسيط (الموسّط) لهذه السلسلة.", ans: [String(me)],
        diag: function (raw) { return num(raw) === v[3] && v[3] !== me ? "رتّب القيم أولا ثم خذ القيمة التي في الوسط." : ""; },
        h1: "رتّب القيم ترتيبا تصاعديا.", h2: "القيم السبع مرتبة: الوسيط هو القيمة الرابعة.",
        steps: ["<b>الطريقة:</b> نرتّب القيم ترتيبا تصاعديا؛ عددها فردي " + M("7") + " فالوسيط هو القيمة الرابعة.", M(s.join(" ; "))],
        res: "النتيجة: " + M(me), concl: "<b>الاستنتاج:</b> الوسيط " + M(me) + ": نصف التلاميذ قفزوا " + M(me + " dm") + " أو أقل، والنصف الآخر " + M(me + " dm") + " أو أكثر." };
    }
  };
  for (var k4 in NEW4) NEW[k4] = NEW4[k4];
  var NAMES = { x10: "الضرب والقسمة على 10، 100…", decops: "جمع وطرح الأعداد العشرية", rect: "محيط ومساحة المستطيل", circle: "محيط الدائرة", rtri: "مساحة المثلث القائم",
    div: "القسمة الإقليدية", arr: "التدوير إلى الوحدة", eucl: "القسمة الإقليدية", prio: "سلسلة عمليات", frac2: "العمليات على الكسور", rel: "جمع الأعداد النسبية", prop: "التناسبية",
    relmul: "ضرب الأعداد النسبية وقسمتها", fracop: "العمليات على الأعداد الناطقة", midline: "مستقيم المنتصفين", pyth: "خاصية فيتاغورس", pow: "القوى", dev: "النشر (التوزيع)",
    pgcd: "PGCD", irr: "الكسر غير القابل للاختزال", aroot: "الكتابة a√b", rootsum: "الحساب على الجذور", thales: "خاصية طالس", trig: "حساب المثلثات", idt: "المتطابقات الشهيرة", eq: "المعادلات" };
  var TYPES = { "1m": ["x10", "decops", "div", "arr", "rect", "circle", "rtri"], "2m": ["eucl", "prio", "frac2", "rel", "prop"],
    "3m": ["relmul", "fracop", "pow", "dev", "pyth", "midline"], "4m": ["pgcd", "irr", "aroot", "rootsum", "idt", "eq", "thales", "trig"] };
  var GEO = /rect|circle|rtri|midline|pyth|thales|trig/;
  var SYM = { "4m": ["√", "²", "x", "−", "+", ";", ",", "/", "⌫"], "3m": ["x", "−", "+", "/", ",", ";", "⌫"], "2m": ["−", "/", ",", ";", "⌫"], "1m": [",", ";", "⌫"] };
  var BANK = null;
  function bank() {
    if (BANK) return BANK;
    BANK = {};
    var gb = window.__sxGenBank ? window.__sxGenBank() : (window.__sx && window.__sx.GEN) || {};
    for (var k in gb) BANK[k] = gb[k];
    for (var n in NEW) BANK[n] = NEW[n];
    return BANK;
  }
  function norm(s) {
    var v = String(s);
    try { if (window.MathAnswer) v = window.MathAnswer.normalize(v); } catch (e) {}
    return String(v).replace(/\s+/g, "").replace(/[−–]/g, "-").replace(/\./g, ",").replace(/(cm²|m²|cm|mm|km|kg|m|da|دج|l)$/i, "").toLowerCase();
  }
  function right(g, raw) {
    if (g.ok && g.ok(raw)) return true;
    var v = norm(raw);
    return (g.ans || []).some(function (a) { return norm(a) === v; });
  }
  /* stats per skill on this phone (for the report) */
  function stat(lv, id, good) { var S = get("math-practice", {}); S[lv] = S[lv] || {}; var r = S[lv][id] || (S[lv][id] = { n: 0, ok: 0 }); r.n++; if (good) r.ok++; r.t = Date.now(); put("math-practice", S); }

  /* a practice card in host: level lv, list of skills; opt.title */
  function practice(host, lv, list, opt) {
    var B = bank(); list = list.filter(function (t) { return B[t]; });
    if (!list.length) { host.hidden = true; return; }
    var sel = null, streak = 0, best = get("math-practice-best", 0);
    host.className = "px"; host.hidden = false;
    function draw() {
      var id = sel || pick(list), g, left = 3;
      try { g = B[id](); } catch (e) { return; }
      host.innerHTML = '<div class="row"><div><h2>' + (opt.title || "🎲 تمارين لا نهائية بأرقام متغيرة") + '</h2><span class="sub">' + LV[lv] + " · للتدرّب فقط، لا تُحسب في علامتك</span></div><span class=\"sp\"></span>" +
        '<div class="pills"><span class="pill" title="إجابات صحيحة متتالية">🔥 ' + streak + '</span><span class="pill" title="أفضل سلسلة">🏅 ' + best + "</span></div></div>" +
        '<div class="chips" role="group" aria-label="اختر المهارة"><button type="button" data-t="" class="' + (sel ? "" : "on") + '">🔀 الكل</button>' +
        list.map(function (t) { return '<button type="button" data-t="' + t + '" class="' + (sel === t ? "on" : "") + '">' + esc(NAMES[t] || t) + "</button>"; }).join("") + "</div>" +
        '<span class="tag">' + esc(NAMES[id] || id) + '</span><div class="q">' + g.q + "</div>" +
        (g.chip || g.unit ? '<div class="sub">' + (g.chip ? "✍️ " + g.chip + " " : "") + (g.unit ? "📏 الوحدة: " + g.unit : "") + "</div>" : "") +
        '<div class="row"><input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="done" aria-label="إجابتك" placeholder="اكتب إجابتك"><button type="button" class="b go">تحقّق</button></div>' +
        '<div class="syms">' + (opt.syms || SYM[lv] || []).map(function (s) { return '<button type="button" aria-label="' + (s === "⌫" ? "حذف" : "أضف " + s) + '">' + s + "</button>"; }).join("") + "</div>" +
        '<div class="fb" role="status" aria-live="polite"></div>' +
        '<div class="sol" hidden><b>✔ الإجابة النموذجية:</b>' + g.steps.map(function (s) { return "<div>" + s + "</div>"; }).join("") + "<div>" + g.res + '</div><div class="end">' + g.concl + "</div></div>" +
        '<div class="row" style="margin-top:8px"><span class="sp"></span><button type="button" class="b s nx">🔄 تمرين آخر</button></div>';
      var inp = $("input", host), fb = $(".fb", host), sol = $(".sol", host), go = $(".go", host);
      $$(".chips button", host).forEach(function (b) { b.onclick = function () { sel = b.getAttribute("data-t") || null; draw(); }; });
      $$(".syms button", host).forEach(function (b) { b.onclick = function () { if (inp.disabled) return; var s = b.textContent; inp.value = s === "⌫" ? inp.value.slice(0, -1) : inp.value + s; inp.focus(); }; });
      $(".nx", host).onclick = draw;
      /* after the answer (his «تحدي الشهادة نفس المشكل، إخفاؤه آليا»): no answer box, solution folded behind a button,
         and the panel folds BY ITSELF into one line after 6 s unless the solution is open */
      var foldT = null;
      function fold(good) {
        if (!host.contains(fb) || !sol.hidden) return;
        host.innerHTML = '<div class="row pxmini"><span>' + (good ? "✅ أحسنت!" : "📘 انتهى التمرين.") + (streak ? " · 🔥 " + streak : "") + '</span><span class="px-btns">' +
          '<button type="button" class="b s nx2">🔄 تمرين آخر</button><button type="button" class="b s hd">✕ أخفِ</button></span></div>';
        $(".nx2", host).onclick = draw;
        $(".hd", host).onclick = function () { if (opt.lazy) intro(); else host.hidden = true; };
      }
      function end(good, raw) {
        inp.disabled = go.disabled = true; stat(lv, id, good);
        inp.parentNode.hidden = true; $(".syms", host).hidden = true;
        var nx = $(".nx", host), tg = el("button", "b s", "📖 الحل");
        tg.type = "button"; nx.parentNode.insertBefore(tg, nx);
        tg.onclick = function () { sol.hidden = !sol.hidden; tg.textContent = sol.hidden ? "📖 الحل" : "🔼 أخفِ الحل"; if (sol.hidden) fold(good); };
        foldT = setTimeout(function () { fold(good); }, 6000);
        if (good) { streak++; if (streak > best) { best = streak; put("math-practice-best", best); } fb.className = "fb s"; fb.innerHTML = "⭐".repeat(left) + " أحسنت! " + (streak >= 3 ? "🔥 " + streak + " إجابات صحيحة متتالية." : "واصل.") + (g.unit && norm(raw) === String(raw).replace(/\s+/g, "").toLowerCase() ? "<br>⚠️ لا تنس الوحدة (" + g.unit + ") في كراسك." : ""); try { if (window.flyStars) window.flyStars(fb, 10); } catch (e) {} }
        else { streak = 0; fb.className = "fb f"; fb.innerHTML = "🌟 لا بأس، فكلّ خطأ درسٌ يقرّبك من النجاح. اقرأ الإجابة النموذجية، ثم اضغط «🔄 تمرين آخر»."; }
        $(".pill", host).textContent = "🔥 " + streak; $$(".pill", host)[1].textContent = "🏅 " + best;
      }
      function check() {
        if (inp.disabled) return;
        var raw = inp.value.trim();
        if (!raw) { fb.className = "fb h"; fb.textContent = "اكتب إجابتك أولا."; return; }
        if (right(g, raw)) return end(true, raw);
        left--;
        inp.classList.remove("shake"); void inp.offsetWidth; inp.classList.add("shake");
        if (left > 0) {
          var d = "";
          try { d = g.diag ? g.diag(raw) : ""; } catch (e) {}
          if (!d && g.simp) { try { if (g.simp(norm(raw))) d = g.sm; } catch (e) {} }
          fb.className = "fb h";
          fb.innerHTML = (d ? "🔎 " + d + "<br>" : (left === 2 ? "أعد قراءة السؤال بهدوء." : "محاولة أخيرة: اكتب الحساب في كراسك أولا.") + "<br>") + "<strong>💡 التلميح " + (3 - left) + ":</strong> " + (left === 2 ? g.h1 : g.h2);
        } else end(false, raw);
      }
      go.onclick = check;
      inp.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); check(); } });
    }
    function intro() {
      host.innerHTML = '<div class="row"><div><h2>' + (opt.title || "🎲 تمارين لا نهائية بأرقام متغيرة") + '</h2><span class="sub">' + LV[lv] + " · " + list.length + " مهارات · أرقام جديدة في كل مرة</span></div><span class=\"sp\"></span>" +
        '<button type="button" class="b go0">▶ ابدأ التدرّب</button></div>';
      $(".go0", host).onclick = draw;
    }
    if (opt.lazy) intro(); else draw();
  }
  /* ========== 1c. «تحدي الشهادة» لا نهائي على كامل برنامج الرابعة (2026-11-20, his ask):
     the pupil chooses sequences (or single skills); with no choice, skills follow the annual plan 2026/2027 (only what is taught by today). ========== */
  var BEMSEQ = [
    ["م1", "الأعداد الطبيعية والناطقة، الجذور", [["pgcd", "2026-10-04"], ["irr", "2026-10-11"], ["aroot", "2026-10-18"], ["rootsum", "2026-10-18"]]],
    ["م2", "طالس وحساب المثلثات", [["thales", "2026-11-02"], ["trig", "2026-11-08"]]],
    ["م3", "الحساب الحرفي", [["idt", "2026-11-29"], ["fac", "2026-11-29"], ["pnul", "2026-12-13"], ["eq", "2027-01-03"], ["ineq", "2027-01-03"]]],
    ["م4", "الأشعة والمعالم", [["vec", "2027-01-17"], ["dist", "2027-02-07"]]],
    ["م5", "الجمل والدوال", [["sys", "2027-02-14"], ["lin", "2027-02-21"], ["aff", "2027-02-28"]]],
    ["م6", "الدوران والمضلعات المنتظمة", [["rpoly", "2027-04-11"]]],
    ["م7", "الإحصاء", [["mean", "2027-04-25"], ["median", "2027-04-25"]]]];
  var NAMES4 = { fac: "التحليل إلى جداء", pnul: "معادلة جداء معدوم", ineq: "المتراجحات", sys: "جملة معادلتين", lin: "الدالة الخطية", aff: "الدالة التآلفية",
    vec: "مركّبتا شعاع", dist: "المسافة بين نقطتين", rpoly: "المضلعات المنتظمة", mean: "المتوسط الحسابي", median: "الوسيط" };
  for (var n4 in NAMES4) NAMES[n4] = NAMES4[n4];
  function planSkills(today) {
    var d = today || new Date(), out = [];
    var iso = d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
    BEMSEQ.forEach(function (s) { s[2].forEach(function (k) { if (k[1] <= iso || iso > "2027-05-27") out.push(k[0]); }); });
    return out.length ? out : BEMSEQ[0][2].map(function (k) { return k[0]; });
  }
  function bemChallenge(host) {
    var st = get("math-bem-choice", { mode: "plan", seq: [] }), inner;
    function list() {
      if (st.mode === "plan" || !st.seq.length) return planSkills();
      var out = []; BEMSEQ.forEach(function (s, i) { if (st.seq.indexOf(i) >= 0) s[2].forEach(function (k) { out.push(k[0]); }); });
      return out;
    }
    function head() {
      var plan = st.mode === "plan" || !st.seq.length;
      return '<div class="row"><div><h2>⚡ تحدي الشهادة: تمارين لا نهائية</h2><span class="sub">كل برنامج الرابعة متوسط · أرقام جديدة في كل مرة · للتدرّب فقط</span></div></div>' +
        '<div class="chips" role="group" aria-label="اختيار المقاطع">' +
        '<button type="button" data-p="1" class="' + (plan ? "on" : "") + '" title="المقاطع التي دُرست حتى اليوم حسب التوزيع السنوي">📅 حسب المخطط السنوي</button>' +
        BEMSEQ.map(function (s, i) { return '<button type="button" data-s="' + i + '" class="' + (!plan && st.seq.indexOf(i) >= 0 ? "on" : "") + '" title="' + esc(s[1]) + '">' + s[0] + " " + esc(s[1]) + "</button>"; }).join("") + "</div>" +
        '<div class="sub">' + (plan ? "📅 الأسئلة من الموارد المدروسة حتى اليوم حسب التوزيع السنوي. اختر مقطعا أو أكثر لتغيير ذلك." : "🗂️ اخترت: " + st.seq.map(function (i) { return BEMSEQ[i][0]; }).join("، ") + ". اضغط «حسب المخطط السنوي» للرجوع.") + "</div>";
    }
    function draw() {
      host.className = "px"; host.hidden = false; host.style.borderTopColor = "#b45309";
      host.innerHTML = head() + '<div class="bemq"></div>';
      $$(".chips button", host).forEach(function (b) {
        b.onclick = function () {
          if (b.getAttribute("data-p")) st = { mode: "plan", seq: [] };
          else { var i = +b.getAttribute("data-s"), k = st.seq.indexOf(i); if (st.mode === "plan") st = { mode: "pick", seq: [] }; if (k >= 0) st.seq.splice(k, 1); else st.seq.push(i); st.seq.sort(); if (!st.seq.length) st.mode = "plan"; }
          put("math-bem-choice", st); draw();
        };
      });
      inner = $(".bemq", host);
      practice(inner, "4m", list(), { title: "🎯 تمرين", syms: ["√", "²", "x", "(", ")", "−", "+", ";", ",", "/", "<", ">", "≤", "≥", "⌫"] });
      inner.style.cssText = "border:0;box-shadow:none;padding:0;margin:4px 0 0";
    }
    draw();
  }
  window.__bem = { planSkills: planSkills, BEMSEQ: BEMSEQ, bemChallenge: bemChallenge };
  window.__px = { NEW: NEW, poly: poly, right: right, bank: bank, TYPES: TYPES };

  /* ========== 2. progress transfer (no server): code + link ========== */
  var GLOBAL = { "math-theme": 1, "math-kids": 1, "math-kid": 1, "math-kid-tip": 1, "math-prof": 1, "math-dests": 1, "math-offline": 1 };
  function myKeys() {
    var id = window.__kid || "", pre = id ? "kid" + id + "|" : "", out = {}, L = window.localStorage;
    var raw = window.__kidRaw ? window.__kidRaw.g : function (k) { return L.getItem(k); };
    for (var i = 0; i < L.length; i++) {
      var k = L.key(i); if (!k) continue;
      if (pre) { if (k.indexOf(pre) !== 0) continue; k = k.slice(pre.length); }
      else if (/^kid[^|]*\|/.test(k)) continue;
      if (GLOBAL[k] || /^math-hit|^math-daily-mute|^math-last$|^math-time|^sahb-mute$/.test(k)) continue;
      var v = raw((pre || "") + k); if (v != null) out[k] = v;
    }
    return out;
  }
  function b64(bytes) { var s = ""; for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
  function unb64(t) { t = t.replace(/-/g, "+").replace(/_/g, "/"); while (t.length % 4) t += "="; var s = atob(t), a = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a; }
  function pipe(bytes, Stream) { return new Response(new Blob([bytes]).stream().pipeThrough(new Stream("deflate-raw"))).arrayBuffer().then(function (b) { return new Uint8Array(b); }); }
  function exportCode() {
    var json = JSON.stringify({ v: 1, d: myKeys() }), bytes = new TextEncoder().encode(json);
    if (window.CompressionStream) return pipe(bytes, CompressionStream).then(function (z) { return "Z" + b64(z); }).catch(function () { return "J" + b64(bytes); });
    return Promise.resolve("J" + b64(bytes));
  }
  function importCode(code) {
    code = String(code).trim().replace(/^.*[#&]nql=/, "").replace(/\s+/g, "");
    var kind = code.charAt(0), body = code.slice(1);
    var p = kind === "Z" ? pipe(unb64(body), DecompressionStream) : kind === "J" ? Promise.resolve(unb64(body)) : Promise.reject(new Error("bad"));
    return p.then(function (bytes) { var o = JSON.parse(new TextDecoder().decode(bytes)); if (!o || o.v !== 1 || typeof o.d !== "object") throw new Error("bad"); return o.d; });
  }
  /* merge: progress keeps the best of both phones; other keys are taken from the code */
  function applyData(d) {
    var n = 0;
    Object.keys(d).forEach(function (k) {
      var v = d[k];
      if (k === "math-progress" || k === "math-mastery") {
        var a = get(k, {}), b = {};
        try { b = JSON.parse(v) || {}; } catch (e) {}
        Object.keys(b).forEach(function (u) {
          var x = a[u], y = b[u];
          if (!x) a[u] = y;
          else if (k === "math-progress") { if ((y.b || 0) > (x.b || 0) || (y.d && !x.d) || (!x.d && (y.s || 0) > (x.s || 0))) a[u] = y; }
          else if ((y.best || 0) > (x.best || 0) || (y.d1 && !x.d1)) a[u] = y;
        });
        put(k, a);
      } else { try { localStorage.setItem(k, v); } catch (e) {} }
      n++;
    });
    return n;
  }
  function sheet(html) {
    var ov = el("div", "px-ov"), box = el("div", "px", html);
    ov.appendChild(box); document.body.appendChild(ov);
    ov.addEventListener("click", function (e) { if (e.target === ov) ov.remove(); });
    $$(".x", box).forEach(function (b) { b.onclick = function () { ov.remove(); }; });
    return box;
  }
  function openTransfer(pref) {
    var base = ROOT.href;
    var box = sheet('<div class="row"><h2>🔁 نقل تقدّمي إلى هاتف آخر</h2><span class="sp"></span><button type="button" class="b s x">✕</button></div>' +
      '<p class="sub">بدون حساب وبدون خادم: نجومك وعلاماتك محفوظة في هذا الهاتف فقط. لتنقلها: أرسل الرابط إلى نفسك (واتساب، رسالة…) وافتحه في الهاتف الآخر، أو انسخ الرمز والصقه هناك. لا يحتوي الرمز على اسمك.</p>' +
      '<h3>📤 من هذا الهاتف</h3><div class="row"><button type="button" class="b mk">إنشاء رمز النقل</button></div><div class="out" hidden><textarea readonly aria-label="رمز النقل"></textarea>' +
      '<div class="row"><button type="button" class="b cp">📋 نسخ الرابط</button><button type="button" class="b s sh">📲 مشاركة</button></div></div>' +
      '<h3>📥 إلى هذا الهاتف</h3><textarea class="in" aria-label="الصق الرمز أو الرابط هنا" placeholder="الصق الرمز أو الرابط هنا"></textarea><div class="row"><button type="button" class="b im">استرجاع التقدّم</button></div><div class="fb" role="status"></div>');
    var out = $(".out", box), ta = $(".out textarea", box), fb = $(".fb", box), link = "";
    $(".mk", box).onclick = function () {
      exportCode().then(function (c) { link = base + "#nql=" + c; ta.value = link; out.hidden = false; fb.className = "fb s"; fb.textContent = "✓ الرمز جاهز (" + Object.keys(myKeys()).length + " عنصرا محفوظا)."; });
    };
    $(".cp", box).onclick = function () { ta.select(); try { navigator.clipboard.writeText(link).then(function () { fb.className = "fb s"; fb.textContent = "✓ نُسخ الرابط: أرسله إلى نفسك وافتحه في الهاتف الآخر."; }); } catch (e) { try { document.execCommand("copy"); } catch (er) {} } };
    $(".sh", box).onclick = function () { if (navigator.share) navigator.share({ title: "تقدّمي في رياضيات المتوسط", url: link }).catch(function () {}); else $(".cp", box).click(); };
    function doImport(code) {
      importCode(code).then(function (d) {
        var n = applyData(d);
        fb.className = "fb s"; fb.textContent = "✓ استُرجع تقدّمك (" + n + " عنصرا). تُعاد الصفحة الآن…";
        setTimeout(function () { location.replace(base); }, 1500);
      }).catch(function () { fb.className = "fb h"; fb.textContent = "الرمز غير صالح أو ناقص: انسخه كاملا ثم أعد المحاولة."; });
    }
    $(".im", box).onclick = function () { var c = $(".in", box).value.trim(); if (c) doImport(c); };
    if (pref) { $(".in", box).value = pref; fb.className = "fb h"; fb.innerHTML = "📥 وصلك رمز نقل تقدّم. اضغط «استرجاع التقدّم» لإضافته إلى هذا الهاتف (تُحفظ أفضل علامة لكل نشاط)."; }
  }

  /* ========== 3. report by domain (parents / teacher) ========== */
  function items() { try { return JSON.parse(($("#items") || {}).textContent || "[]") || []; } catch (e) { return []; } }
  function domainOf(t) {
    if (/مثلث|زاوي|تناظر|دائر|طالس|فيت?اغورس|مستقيم|متواز|مساح|محيط|انسحاب|دوران|أشعة|شعاع|هرم|موشور|مكعب|منقلة|هندس|إنشاء|مماثل|معين|مربع|مستطيل|cos|sin|tan|المثلثات|منصف|محور/i.test(t)) return "geo";
    if (/تناسب|إحصاء|نسبة مئوية|مخطط|دالة|تمثيل|معطيات|سلم/.test(t)) return "data";
    return "num";
  }
  var DOM = { num: "الأعداد والحساب", geo: "الهندسة والقياس", data: "التناسبية والدوال وتنظيم المعطيات" };
  function verdict(p) { return p == null ? "—" : p >= 75 ? "🟢 متمكّن" : p >= 50 ? "🟡 في طريق التمكّن" : "🔴 يحتاج دعما"; }
  function code36(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36).toUpperCase().slice(-4); }
  /* 🎖️ achievement code: page index in files list + mark + day, with a check part. Readable back by the teacher. */
  function achCode(it, P) {
    var all = items(), i = all.indexOf(it), day = Math.floor((P.t || Date.now()) / 864e5) - 20400;
    var core = i.toString(36) + "-" + Math.round((P.b || P.s || 0) * 4).toString(36) + "-" + Math.max(0, day).toString(36);
    return (core + "-" + code36(core + "|math")).toUpperCase();
  }
  function readAch(c) {
    var p = String(c).trim().toLowerCase().split("-");
    if (p.length !== 4 || code36(p.slice(0, 3).join("-") + "|math").toLowerCase() !== p[3]) return null;
    var it = items()[parseInt(p[0], 36)], d = new Date((parseInt(p[2], 36) + 20400) * 864e5);
    return it ? { t: it.title, l: LV[it.level], m: parseInt(p[1], 36) / 4, d: d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear() } : null;
  }
  function openReport(lv) {
    var all = items().filter(function (i) { return i.level === lv && i.type === "html"; }), P = get("math-progress", {}), MS = get("math-mastery", {}), PR = (get("math-practice", {}) || {})[lv] || {};
    var dom = { num: { s: 0, n: 0, list: [] }, geo: { s: 0, n: 0, list: [] }, data: { s: 0, n: 0, list: [] } }, done = 0, started = 0;
    all.forEach(function (it) {
      var p = P[it.url]; if (!p) return;
      started++; if (p.d) done++;
      var pct = p.d ? Math.round(100 * (p.b || p.s || 0) / (p.m || 20)) : p.n ? Math.round(100 * (p.a || 0) / p.n) * ((p.s || 0) / Math.max(1, (p.m || 20))) : null;
      if (pct == null || !p.d) return;
      var d = dom[domainOf(it.title + " " + (it.topics || []).join(" "))];
      d.s += pct; d.n++; d.list.push({ it: it, pct: pct, p: p });
    });
    Object.keys(PR).forEach(function (k) { var r = PR[k], d = dom[GEO.test(k) ? "geo" : k === "prop" ? "data" : "num"]; if (r.n >= 3) { d.s += Math.round(100 * r.ok / r.n); d.n++; } });
    var rows = Object.keys(dom).map(function (k) { var d = dom[k], p = d.n ? Math.round(d.s / d.n) : null; return "<tr><td>" + DOM[k] + "</td><td>" + (p == null ? "لا نشاط بعد" : p + "%") + "</td><td>" + verdict(p) + "</td></tr>"; }).join("");
    var weak = [].concat(dom.num.list, dom.geo.list, dom.data.list).sort(function (a, b) { return a.pct - b.pct; }).filter(function (x) { return x.pct < 60; }).slice(0, 4);
    var strong = [].concat(dom.num.list, dom.geo.list, dom.data.list).sort(function (a, b) { return b.pct - a.pct; }).filter(function (x) { return x.pct >= 80; }).slice(0, 3);
    var mast = Object.keys(MS).filter(function (u) { return u.indexOf(lv + "/") === 0; }), ml = { 3: 0, 2: 0, 1: 0 };
    mast.forEach(function (u) { var r = MS[u], l = window.MASTERY ? window.MASTERY.level(r) : r.d1 ? 2 : 1; ml[l] = (ml[l] || 0) + 1; });
    var prRows = Object.keys(PR).filter(function (k) { return PR[k].n; }).map(function (k) { var r = PR[k], p = Math.round(100 * r.ok / r.n); return "<tr><td>" + esc(NAMES[k] || k) + "</td><td>" + r.ok + " / " + r.n + '</td><td><div class="bar"><i style="width:' + p + '%"></i></div></td></tr>'; }).join("");
    var codes = [].concat(dom.num.list, dom.geo.list, dom.data.list).sort(function (a, b) { return (b.p.t || 0) - (a.p.t || 0); }).slice(0, 6)
      .map(function (x) { return "<tr><td>" + esc(x.it.title) + "</td><td>" + String(x.pct) + '%</td><td dir="ltr">' + achCode(x.it, x.p) + "</td></tr>"; }).join("");
    var d0 = new Date();
    var box = sheet('<div class="row noprint"><h2>📊 تقرير التقدّم</h2><span class="sp"></span><button type="button" class="b s pr">🖨️ طباعة</button><button type="button" class="b s x">✕</button></div>' +
      "<h2 style=\"margin-top:6px\">📊 تقرير تقدّم التلميذ(ة) — " + LV[lv] + "</h2><p class=\"sub\">تاريخ التقرير: " + d0.getDate() + "/" + (d0.getMonth() + 1) + "/" + d0.getFullYear() + " · مبني على ما أُنجز في هذا الهاتف فقط، دون أي اسم.</p>" +
      '<div class="row"><span class="pill">✅ أنشطة مكتملة: ' + done + '</span><span class="pill">⏳ بدأها: ' + started + '</span><span class="pill">🎯 دروس متقنة: ' + (ml[3] || 0) + "</span></div>" +
      "<h3>حسب الكفاءة</h3><table><tr><th>الميدان</th><th>المعدل</th><th>الحكم</th></tr>" + rows + "</table>" +
      (strong.length ? "<h3>💪 نقاط القوة</h3><ul>" + strong.map(function (x) { return "<li>" + esc(x.it.title) + " (" + x.pct + "%)</li>"; }).join("") + "</ul>" : "") +
      (weak.length ? "<h3>📌 يحتاج مراجعة</h3><ul>" + weak.map(function (x) { return '<li><a href="' + esc(ROOT.href + x.it.url) + '">' + esc(x.it.title) + "</a> (" + x.pct + "%)</li>"; }).join("") + "</ul>" : "") +
      (prRows ? "<h3>🎲 التمارين اللانهائية</h3><table><tr><th>المهارة</th><th>صحيحة</th><th></th></tr>" + prRows + "</table>" : "") +
      (codes ? "<h3>🎖️ رموز الإنجاز (للأستاذ)</h3><p class=\"sub\">يكتبها التلميذ في كراسه، ويقرؤها الأستاذ من هذا الزر نفسه. رمز للتشجيع فقط: يمكن تقليده، فلا يُعتمد في التقييم.</p><table><tr><th>النشاط</th><th>العلامة</th><th>الرمز</th></tr>" + codes + "</table>" : "") +
      '<div class="noprint"><h3>👨‍🏫 قراءة رمز إنجاز</h3><div class="row"><input class="ac" aria-label="رمز الإنجاز" placeholder="مثال: 1F-50-9K-ABCD"><button type="button" class="b rd">قراءة</button></div><div class="fb rf" role="status"></div></div>' +
      '<p class="sub">الحكم: 🟢 75% فأكثر · 🟡 من 50% إلى 74% · 🔴 أقل من 50%. يتحسّن التقرير كلما أنجز التلميذ أنشطة أكثر.</p>');
    $(".pr", box).onclick = function () { window.print(); };
    $(".rd", box).onclick = function () { var r = readAch($(".ac", box).value), f = $(".rf", box); if (!r) { f.className = "fb rf h"; f.textContent = "رمز غير صحيح."; return; } f.className = "fb rf s"; f.textContent = "✓ " + r.t + " (" + r.l + ") — العلامة " + String(r.m).replace(".", ",") + " — بتاريخ " + r.d; };
  }

  /* ========== index: panels and buttons ========== */
  function curLevel() { var b = $('.lv[aria-pressed="true"]'); return b ? b.getAttribute("data-level") : null; }
  function initIndex() {
    var daily = $("#daily");
    var host = el("section"); host.id = "practice"; host.hidden = true; host.setAttribute("aria-label", "تمارين لا نهائية");
    var bem = el("section"); bem.id = "bemhub"; bem.hidden = true; bem.setAttribute("aria-label", "ركن الشهادة");
    var levels = $("#levels");
    if (levels && levels.parentNode) { levels.parentNode.insertBefore(host, levels.nextSibling); levels.parentNode.insertBefore(bem, host.nextSibling); }
    else if (daily && daily.parentNode) { daily.parentNode.insertBefore(host, daily.nextSibling); daily.parentNode.insertBefore(bem, host.nextSibling); }
    var btns = $("footer .btns");
    if (btns) {
      var b1 = el("button", "", "🔁 نقل تقدّمي إلى هاتف آخر"); b1.type = "button"; b1.onclick = function () { openTransfer(); };
      var b2 = el("button", "", "📊 تقرير التقدّم للولي والأستاذ"); b2.type = "button"; b2.onclick = function () { openReport(curLevel() || "1m"); };
      btns.appendChild(b2); btns.appendChild(b1);
    }
    var cur = null;
    function render() {
      var lv = curLevel();
      if (!lv || lv === cur) return;
      cur = lv;
      practice(host, lv, TYPES[lv] || [], { lazy: true });
      if (lv === "4m") {
        var all = items().filter(function (i) { return i.level === "4m" && (i.section === "chahada" || i.section === "bem"); });
        var BEMDATE = null; /* write the date here ONLY once the ministry announces it, e.g. "2027-06-01" */
        var cd = BEMDATE ? Math.ceil((new Date(BEMDATE) - new Date()) / 864e5) : null;
        bem.className = "px"; bem.hidden = false; bem.style.borderTopColor = "#b45309";
        bem.innerHTML = '<div class="row"><div><h2>🎓 ركن شهادة التعليم المتوسط</h2><span class="sub">' + (cd != null && cd > 0 ? "⏳ بقي " + cd + " يوما على الامتحان" : "📅 تاريخ الامتحان: يُضاف هنا فور إعلانه رسميا") + "</span></div></div>" +
          '<div class="px-btns"><button type="button" class="b go1">⚡ تحدي الشهادة: تمرين بأرقام جديدة</button><button type="button" class="b s go2">📊 تقريري</button></div>' +
          (all.length ? '<details class="sub"><summary>📚 سلاسل ومواضيع الشهادة (' + all.length + ")</summary><ul>" + all.map(function (i) { return '<li><a href="' + esc(i.url) + '">' + esc(i.title) + "</a></li>"; }).join("") + "</ul></details>" : "") +
          '<div class="bemp" id="bemp" hidden></div>';
        $(".go1", bem).onclick = function () { var p = $("#bemp"); p.hidden = false; bemChallenge(p); p.scrollIntoView({ block: "start", behavior: "smooth" }); };
        $(".go2", bem).onclick = function () { openReport("4m"); };
      } else bem.hidden = true;
    }
    render();
    document.addEventListener("click", function (e) { if (e.target.closest && e.target.closest("[data-level]")) setTimeout(render, 40); });
    window.addEventListener("hashchange", function () { setTimeout(render, 40); });
    var m = location.hash.match(/nql=([A-Za-z0-9_-]+)/);
    if (m) { var c = m[1]; history.replaceState(null, "", location.pathname); setTimeout(function () { openTransfer(c); }, 300); }
    indexBar();
  }

  /* ========== index: ONE floating check button for «سؤال اليوم», the infinite exercises and «تحدي الشهادة»
     (2026-11-21 his «وزر التحقق عائم والتمارين اللانهاية ايضا»). Same bar as the exercise pages: ✔ تحقق → 🔄 تمرين آخر.
     It works on the box the pupil last touched (or the one on screen); the boxes' own «تحقّق» buttons are hidden. ========== */
  function indexBar() {
    var off = null; try { off = localStorage.getItem("sx-onebtn"); } catch (e) {}
    if (off === "0") return;
    var IDS = ["daily", "practice", "bemp"];
    var st = el("style");
    st.textContent = ".px-1bar{position:fixed;left:0;right:0;bottom:0;z-index:2500;display:flex;justify-content:center;padding:8px 12px calc(8px + env(safe-area-inset-bottom));" +
      "background:rgba(255,255,255,.96);border-top:1px solid #cbd5e1;box-shadow:0 -4px 14px rgba(15,23,42,.12);direction:rtl;transition:bottom .12s}" +
      ".px-1bar[hidden]{display:none}" +
      ".px-1bar button{flex:1;max-width:560px;font:inherit;font-weight:800;font-size:1.3rem;border:none;border-radius:14px;padding:15px 18px;min-height:58px;cursor:pointer;color:#fff;background:#1e3a8a;box-shadow:0 3px 0 rgba(15,23,42,.35)}" +
      ".px-1bar button.next{background:#15803d}" +
      "body.px-1b #daily .inrow .ok,body.px-1b #practice .row>.b.go,body.px-1b #bemp .row>.b.go{display:none!important}" +
      "body.px-1b.px-on{padding-bottom:90px}" +
      "body.px-on .sx-upd{bottom:96px!important}" +
      ".px-cur input:not(:disabled){border:3px solid #1e3a8a!important;background:#fffbeb!important;color:#000!important}" +
      "@media (prefers-color-scheme:dark){html:not([data-theme=\"light\"]) .px-1bar{background:rgba(15,23,42,.96);border-color:#334155}}" +
      "html[data-theme=\"dark\"] .px-1bar{background:rgba(15,23,42,.96);border-color:#334155}" +
      "@media print{.px-1bar{display:none!important}}";
    document.head.appendChild(st);
    var bar = el("div", "px-1bar"), B = el("button");
    B.type = "button"; bar.appendChild(B); bar.hidden = true; document.body.appendChild(bar);
    document.body.classList.add("px-1b");
    B.addEventListener("mousedown", function (e) { e.preventDefault(); });   /* keep the keyboard open */
    var cur = null;
    function vis(e) { return e && !e.hidden && e.offsetParent !== null; }
    function boxes() { return IDS.map(function (i) { return document.getElementById(i); }).filter(vis); }
    function act(w) {
      var c = w.querySelector(".inrow .ok") || w.querySelector(".row>.b.go");
      var inp = c && c.parentNode.querySelector("input");
      if (c && !c.disabled && inp && !inp.disabled && c.parentNode.offsetParent !== null && !c.parentNode.hidden) return { b: c, t: "✔ تحقق", k: "" };
      var n = w.querySelector(".end2:not([hidden]) .more") || w.querySelector(".nx2") || w.querySelector(".nx");
      if (vis(n)) return { b: n, t: w.id === "daily" ? "➕ سؤال آخر" : "🔄 تمرين آخر", k: "next" };
      return null;
    }
    function onScreen(w) { var r = w.getBoundingClientRect(), h = window.innerHeight; return r.bottom > 60 && r.top < h - 80; }
    function pick() {
      if (cur && vis(cur) && onScreen(cur) && act(cur)) return cur;
      var best = null, bs = 0, h = window.innerHeight;
      boxes().forEach(function (w) {
        if (!act(w)) return;
        var r = w.getBoundingClientRect(), s = Math.min(r.bottom, h) - Math.max(r.top, 0);
        if (s > bs) { bs = s; best = w; }
      });
      return bs > 80 ? best : null;
    }
    var shown = null;
    function show() {
      var w = pick(), a = w && act(w);
      boxes().forEach(function (x) { x.classList.toggle("px-cur", x === w && !!a && a.k === ""); });
      if (!a) { if (!bar.hidden) bar.hidden = true; document.body.classList.remove("px-on"); shown = null; return; }
      shown = { w: w, a: a };
      if (bar.hidden) bar.hidden = false;
      document.body.classList.add("px-on");
      if (B.textContent !== a.t) B.textContent = a.t;
      if (B.className !== a.k) B.className = a.k;
    }
    B.onclick = function () {
      if (!shown) return;
      var w = shown.w; cur = w;
      shown.a.b.click();
      setTimeout(function () {
        var i = w.querySelector("input:not(:disabled)");
        if (shown && shown.a.k === "next" && i) { try { i.focus({ preventScroll: true }); } catch (e) {} w.scrollIntoView({ block: "start", behavior: "smooth" }); }
        show();
      }, 150);
    };
    function owner(t) { for (var i = 0; i < IDS.length; i++) { var w = document.getElementById(IDS[i]); if (w && w.contains(t)) return w; } return null; }
    document.addEventListener("focusin", function (e) { var w = owner(e.target); if (w) { cur = w; show(); } });
    document.addEventListener("click", function (e) { var w = owner(e.target); if (w) cur = w; setTimeout(show, 160); }, true);
    document.addEventListener("keyup", function () { setTimeout(show, 80); });
    window.addEventListener("scroll", function () { clearTimeout(show.s); show.s = setTimeout(show, 120); }, { passive: true });
    function lift() {
      var vv = window.visualViewport; if (!vv) return;
      var hid = window.innerHeight - (vv.height + vv.offsetTop);
      bar.style.bottom = (hid > 40 ? hid : 0) + "px";
    }
    if (window.visualViewport) { window.visualViewport.addEventListener("resize", lift); window.visualViewport.addEventListener("scroll", lift); }
    new MutationObserver(function () { clearTimeout(show.t); show.t = setTimeout(show, 120); }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "disabled"] });
    setTimeout(show, 600);
  }

  /* ========== 6. accessibility: names for icon-only buttons, live feedback ========== */
  var ICON = { "🔊": "الصوت", "🔇": "الصوت مغلق", "⌫": "حذف آخر حرف", "√": "جذر تربيعي", "²": "مربع", "×": "ضرب", "÷": "قسمة", "/": "خط الكسر", "−": "ناقص", "+": "زائد", ";": "فاصلة منقوطة", ",": "فاصلة عشرية", "±": "زائد أو ناقص", "✕": "إغلاق", "🌙": "الوضع الليلي", "☀️": "الوضع النهاري", "🏠": "الصفحة الرئيسية", "x": "المجهول x" };
  function a11y(root) {
    $$("button", root).forEach(function (b) {
      if (b.hasAttribute("aria-label")) return;
      var t = b.textContent.trim();
      if (ICON[t]) b.setAttribute("aria-label", ICON[t]);
      else if (t && !/[؀-ۿA-Za-z0-9]/.test(t) && b.title) b.setAttribute("aria-label", b.title);
    });
    $$(".feedback-box,.fb,.feedback,.sx-gfb,.toast", root).forEach(function (f) { if (!f.hasAttribute("aria-live")) f.setAttribute("aria-live", "polite"); });
    $$("input:not([aria-label])", root).forEach(function (i) { if (i.placeholder) i.setAttribute("aria-label", i.placeholder); });
  }
  function start() {
    if (isIndex) initIndex();
    a11y(document);
    var t = null;
    new MutationObserver(function () { clearTimeout(t); t = setTimeout(function () { a11y(document); }, 400); }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
