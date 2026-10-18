// DarsIzi — oflayn ishlash uchun service worker
const CACHE = "darsizi-v1";
const FILES = ["./", "./index.html", "./css/style.css", "./js/data.js", "./js/ai.js", "./js/app.js", "./manifest.json", "./icons/icon.svg", "./icons/icon-192.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
