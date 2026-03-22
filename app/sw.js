const STATIC_CACHE = "ledlab-static-v7";
const RUNTIME_CACHE = "ledlab-runtime-v1";

const APP_SHELL = [
  "./main.html",
  "./manifest.webmanifest",
  "./src/main.js",
  "./src/styles/main.css",
  "./src/styles/_tokens.css",
  "./src/styles/_base.css",
  "./src/styles/_layout.css",
  "./src/styles/_stats.css",
  "./src/styles/_buttons.css",
  "./src/styles/_forms.css",
  "./src/styles/_tables.css",
  "./src/styles/_screens.css",
  "./src/styles/_cabinets.css",
  "./src/styles/_cabling.css",
  "./src/styles/_testcard.css",
  "./src/styles/_report.css",
  "./src/styles/_responsive.css",
  "./src/styles/_print.css",
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
      .then((cache) =>
        Promise.all(
          APP_SHELL.map((assetUrl) => cache.add(assetUrl).catch(() => null)),
        ),
      )
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

  if (destination === "document") {
    // Keep HTML always fresh after deployments.
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(cacheFirst(request));
});
