/* Mastery of the «أُتقِن» lessons (idea taken from Khan Academy, his OK 2026-11-17 «نعم طبق»; lessons only, not فروض/اختبارات).
   Stored on the pupil's own phone only (localStorage "math-mastery"), nothing is sent anywhere.
   Levels per lesson: 0 لم يبدأ · 1 محاولة (<70%) · 2 مألوف (lesson done with ≥70%) · 3 متقن (≥70% AND a successful review on a LATER day).
   A failed review brings متقن back to مألوف. Reviews are due 3 days after the last success (مألوف) or 7 days (متقن). */
(function () {
  var K = "math-mastery";
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function today() { var d = new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function load() { try { return JSON.parse(localStorage.getItem(K) || "{}") || {}; } catch (e) { return {}; } }
  function save(m) { try { localStorage.setItem(K, JSON.stringify(m)); } catch (e) {} }
  function rel(p) { var m = String(p || location.pathname).match(/([1-4]m\/t\d\/dars\/[^\/?#]+\.html)/); return m ? m[1] : String(p || location.pathname); }
  function days(a, b) { return Math.round((Date.parse(b) - Date.parse(a)) / 864e5); }
  function lastReview(r) { var v = (r && r.rv) || []; return v.length ? v[v.length - 1] : null; }
  function level(r) {
    if (!r) return 0;
    var l = lastReview(r);
    if (r.d1) return l && l.ok && l.d > r.d1 ? 3 : 2;
    return l && l.ok ? 2 : 1;
  }
  function lastDate(r) { var l = lastReview(r), d = r.d1 || r.d0 || ""; if (l && l.d > d) d = l.d; return d; }
  /* days until the next review (≤0 = due today), or null when no review is planned */
  function dueIn(r, t) {
    var lv = level(r);
    if (lv < 2) return null;
    return (lv === 3 ? 7 : 3) - days(lastDate(r), t || today());
  }
  function rec(cb) { var m = load(), k = rel(), r = m[k] || (m[k] = { d0: today() }); cb(r); save(m); return r; }
  window.MASTERY = {
    NAMES: ["لم يبدأ", "محاولة", "مألوف", "متقن"],
    today: today, load: load, rel: rel, level: level, dueIn: dueIn, lastDate: lastDate,
    /* called by the lesson engine after each answered question (not on restore) */
    lesson: function (title, pct, complete) {
      return rec(function (r) {
        r.t = title;
        if (!complete) return;
        r.best = Math.max(r.best || 0, Math.round(pct * 100) / 100);
        if (pct >= 0.7 && !r.d1) r.d1 = today();
      });
    },
    /* called once when the 3 review questions are answered */
    review: function (title, good, of) {
      return rec(function (r) {
        r.t = title;
        r.rv = (r.rv || []).filter(function (x) { return x.d !== today(); });
        r.rv.push({ d: today(), ok: good >= Math.ceil(of * 2 / 3), g: good, n: of });
        if (r.rv.length > 12) r.rv = r.rv.slice(-12);
      });
    }
  };
})();
