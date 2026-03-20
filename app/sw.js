const STATIC_CACHE = "ledlab-static-v2";
const RUNTIME_CACHE = "ledlab-runtime-v1";

const APP_SHELL = [
  "./",
  "./index.html",
  "./main.html",
  "./manifest.webmanifest",
  "./src/main.js",
  "./src/styles/main.css",
  "./assets/icons/apple-touch-icon.png",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/icon-192.svg",
  "./assets/icons/icon-512.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== RUNTIME_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isProjectDataRequest(url) {
  return /\.(json|txt|csv)$/i.test(url.pathname);
}

function cacheFirst(request) {
  return caches
    .match(request, { ignoreSearch: true })
    .then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        const responseClone = networkResponse.clone();
        caches
          .open(STATIC_CACHE)
          .then((cache) => cache.put(request, responseClone));
        return networkResponse;
      });
    });
}

function networkFirst(request) {
  return fetch(request)
    .then((networkResponse) => {
      if (!networkResponse || networkResponse.status !== 200) {
        return networkResponse;
      }

      const responseClone = networkResponse.clone();
      caches
        .open(RUNTIME_CACHE)
        .then((cache) => cache.put(request, responseClone));
      return networkResponse;
    })
    .catch(() => caches.match(request, { ignoreSearch: true }));
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET") return;
  if (url.origin !== self.location.origin) return;

  const destination = request.destination;
  const isStaticDestination =
    destination === "document" ||
    destination === "script" ||
    destination === "style" ||
    destination === "image" ||
    destination === "manifest";

  if (isProjectDataRequest(url)) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (!isStaticDestination) return;

  event.respondWith(cacheFirst(request));
});
