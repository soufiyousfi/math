/* answer-check.js — ONE shared answer checker for the whole site (2026-11-18, his ask).
   It does NOT decide what is right: each page keeps its own list of accepted answers (exact / partial).
   It only makes sure that the SAME answer written in another way is recognised, e.g.
     3√5 = 3×√5 = √5×3 = 3√(5)      2x = 2×x = x×2      -3/4 = (-3)/4 = 3/(-4)
     ٣,٥ = ۳,۵ = 3.5 = 3,50           12 cm = 12cm
   It never turns one value into another (2/4 stays 2/4, 0,5 stays 0,5): a page that wants 1/2
   to accept 0,5 must list it, so «اختزل» / «أبسط شكل» questions keep their meaning.
   Used by: assets/site.js (wraps the page's normalizeInput) — tests: tests/answer-check.test.js
   API: MathAnswer.normalize(raw) · MathAnswer.canon(s) · MathAnswer.same(a, b) · MathAnswer.wrap(pageNormalize) */
(function (root) {
  "use strict";
  var NUM = "\\d+(?:,\\d+)?";

  /* basic writing: digits, signs, decimal comma, spaces (same rules as the pages' normalizeInput) */
  function basic(raw) {
    if (raw == null) return "";
    var s = String(raw).trim();
    s = s.replace(/[٠-٩]/g, function (d) { return String(d.charCodeAt(0) - 0x0660); })   /* Arabic digits */
         .replace(/[۰-۹]/g, function (d) { return String(d.charCodeAt(0) - 0x06F0); });   /* Persian keyboards */
    s = s.replace(/\s+/g, "");
    s = s.replace(/^[a-zA-Z]\s*=/, "");
    s = s.replace(/[،٫]/g, ",").replace(/\./g, ",");
    s = s.replace(/[*·∙]/g, "×").replace(/(\d)[xX](?=\d)/g, "$1×").replace(/[−–—]/g, "-");
    s = s.replace(/^\+(?=\d)/, "");
    s = s.replace(/(\d),(\d*?)0+(?=$|[^\d])/g, function (m, a, b) { return b ? a + "," + b : a; });
    return s.toLowerCase();
  }

  /* the same value written another way → one form */
  function canon(s) {
    s = String(s == null ? "" : s);
    s = s.replace(/[٠-٩]/g, function (d) { return String(d.charCodeAt(0) - 0x0660); })
         .replace(/[۰-۹]/g, function (d) { return String(d.charCodeAt(0) - 0x06F0); })
         .replace(/[٫]/g, ",").replace(/[*·∙]/g, "×").replace(/[−–—]/g, "-").replace(/\s+/g, "");
    var prev;
    do {
      prev = s;
      s = s.replace(new RegExp("√\\((" + NUM + ")\\)", "g"), "√$1");                    /* √(5) → √5 */
      /* inside a term: start, or after + - ( = ; */
      s = s.replace(new RegExp("(^|[+\\-(=;])(" + NUM + ")×√(" + NUM + ")(?=$|[+\\-)=;])", "g"), "$1$2√$3");  /* 3×√5 → 3√5 */
      s = s.replace(new RegExp("(^|[+\\-(=;])√(" + NUM + ")×(" + NUM + ")(?=$|[+\\-)=;])", "g"), "$1$3√$2");  /* √5×3 → 3√5 */
      s = s.replace(new RegExp("(^|[+\\-(=;])(" + NUM + ")×([a-z])(?![a-z(])", "g"), "$1$2$3");             /* 2×x → 2x */
      s = s.replace(new RegExp("(^|[+\\-(=;])([a-z])×(" + NUM + ")(?=$|[+\\-)=;])", "g"), "$1$3$2");         /* x×2 → 2x */
      s = s.replace(new RegExp("^\\(-(" + NUM + ")\\)/(" + NUM + ")$"), "-$1/$2");                           /* (-3)/4 → -3/4 */
      s = s.replace(new RegExp("^(" + NUM + ")/\\(-(" + NUM + ")\\)$"), "-$1/$2");                            /* 3/(-4) → -3/4 */
      s = s.replace(new RegExp("^(" + NUM + ")/-(" + NUM + ")$"), "-$1/$2");                                  /* 3/-4 → -3/4 */
      s = s.replace(new RegExp("^-\\((" + NUM + "/" + NUM + ")\\)$"), "-$1");                                 /* -(3/4) → -3/4 */
      s = s.replace(/^1([a-z])(?=$|[+\-])/, "$1");                                                            /* 1x → x */
      s = s.replace(new RegExp("^1√(" + NUM + ")(?=$|[+\\-])"), "√$1");                                     /* 1√2 → √2 */
    } while (s !== prev);
    return s;
  }

  function normalize(raw) { return canon(basic(raw)); }

  /* the page's own normalizeInput stays first (its unit list, its rules), the shared forms are added after */
  function wrap(pageNormalize) {
    if (typeof pageNormalize !== "function" || pageNormalize.__shared) return pageNormalize;
    var f = function (raw) {
      var out;
      try { out = pageNormalize(raw); } catch (e) { out = basic(raw); }
      return canon(out);
    };
    f.__shared = true;
    f.page = pageNormalize;
    return f;
  }

  function same(a, b) { return normalize(a) === normalize(b); }

  var api = { basic: basic, canon: canon, normalize: normalize, wrap: wrap, same: same, version: "1" };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.MathAnswer = api;
})(typeof window !== "undefined" ? window : this);
