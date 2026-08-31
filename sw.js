// Minimal service worker for Adeka Academy Hub.
// Two jobs: (1) makes the site "installable" as an app on phones/desktops,
// (2) lets the app still open if someone's offline.
//
// IMPORTANT: this uses a "network-first" strategy — every time there's
// an internet connection, it always fetches the latest version from
// GitHub first (so your updates show up immediately for everyone with
// the app installed). It only falls back to the last-saved copy when
// there's genuinely no connection. Live data (Firestore, chat, quiz
// scores) still needs the internet regardless — only the app's own
// files are cached here.
//
// { cache: "no-store" } below is important: without it, the browser's
// own HTTP cache could quietly hand back a recently-fetched copy of
// index.html instead of actually reaching GitHub, even though this
// service worker is trying to go "network-first." This forces a real
// network round-trip every time so updates always show up.

const CACHE_NAME = "adeka-academy-hub-v2";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        )
      ),
      self.clients.claim()
    ])
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request, { cache: "no-store" })
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
