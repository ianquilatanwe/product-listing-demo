// Offline support for the product listing.
// - Page HTML and product data: network first, so online users always get
//   fresh data; the last good copy is served when the network is gone.
// - Scripts, styles, icons and product images: cache first. Next.js gives
//   build files unique names, so a cached copy never goes stale.
// ponytail: one cache, never pruned per entry; bump CACHE when files in
// public/ change, and add an expiry if the catalogue grows past a few hundred images.
const CACHE = "fashionhub-v2";
const API = "https://dummyjson.com/";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.add("/")));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, "/"));
  } else if (request.url.startsWith(API)) {
    event.respondWith(networkFirst(request));
  } else if (new URL(request.url).origin === self.location.origin) {
    event.respondWith(cacheFirst(request));
  }
});

async function networkFirst(request, cacheKey = request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(cacheKey, response.clone());
    return response;
  } catch {
    return (await cache.match(cacheKey)) ?? Response.error();
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}
