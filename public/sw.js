const ROOT = new URL("./", self.location.href).pathname;
const CACHE_PREFIX = "steady-" + ROOT.replace(/[^a-z0-9]/gi, "_") + "-";
const CACHE = CACHE_PREFIX + "BUILD_VERSION";
const ASSETS = [ROOT, ROOT + "favicon.svg", ROOT + "manifest.webmanifest", ROOT + "icon-192.png", ROOT + "icon-512.png"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE).map(key => caches.delete(key)))));
});
self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== location.origin || !url.pathname.startsWith(ROOT)) return;
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).then(response => {
      if (response.ok) {const copy = response.clone(); event.waitUntil(caches.open(CACHE).then(cache => cache.put(ROOT, copy)));}
      return response;
    }).catch(() => caches.match(ROOT).then(response => response || Response.error())));
    return;
  }
  event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
    if (response.ok) {const copy = response.clone(); event.waitUntil(caches.open(CACHE).then(cache => cache.put(request, copy)));}
    return response;
  })));
});
