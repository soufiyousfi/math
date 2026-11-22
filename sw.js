/* Service worker: the site can be installed on the phone (home-screen app) and works without internet.
   Network first: with internet the newest version published on GitHub is always taken (and saved on the phone);
   without internet the last saved copy opens. The page itself shows «🔄 تتوفر تمارين جديدة من الأستاذ»
   when a newer version is published while the app is open (assets/site.js + version.json). */
const CACHE = "math-v3";
const CORE = ["./", "index.html", "report.html", "awards.html", "assets/cert.js", "manifest.webmanifest", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request, url = new URL(r.url);
  if (r.method !== "GET" || url.origin !== location.origin || /\/version\.json$/.test(url.pathname)) return;
  const nav = r.mode === "navigate";
  const key = nav ? url.origin + url.pathname : r;
  e.respondWith(
    fetch(new Request(r, { cache: "no-cache" })).then(res => {
      if (res && res.ok && res.type === "basic") {
        const copy = res.clone();
        caches.open(CACHE).then(async c => {
          if (url.search && /\/assets\//.test(url.pathname)) {   /* keep one copy of site.js?v=… */
            for (const k of await c.keys()) { const u = new URL(k.url); if (u.pathname === url.pathname && u.search !== url.search) c.delete(k); }
          }
          c.put(key, copy);
        });
      }
      if (nav && res && res.status === 404)   /* a lost address: open the saved copy or the index instead of a 404 */
        return caches.match(key, { ignoreSearch: true }).then(m => m || caches.match("index.html")).then(m => m || res);
      return res;
    }).catch(() => caches.match(key, { ignoreSearch: true }).then(m => m || (nav ? caches.match("index.html") : Response.error())))
  );
});
