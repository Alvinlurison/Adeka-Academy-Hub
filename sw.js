// Minimal service worker for Adeka Academy Hub.
// Two jobs: (1) makes the site "installable" as an app on phones/desktops,
// (2) caches the app shell so it opens even with a flaky connection.
// Live data (Firestore, chat, quiz scores) still needs the internet —
// only the app's own files are cached here.

const CACHE_NAME = "adeka-academy-hub-v1";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
