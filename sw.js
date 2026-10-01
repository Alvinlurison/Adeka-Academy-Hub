// Service worker for Adeka Academy Hub.
// Three jobs: (1) makes the site "installable" as an app on phones/
// desktops, (2) lets the app still open if someone's offline, and
// (3) supports the in-app "Update available?" prompt — new versions
// install in the background but wait for the person to say yes
// before taking over, so nobody gets interrupted mid-task.
//
// IMPORTANT: fetches still use "network-first" with { cache: "no-store" }
// — every time there's an internet connection, it always fetches the
// latest version of a file straight from GitHub, bypassing the
// browser's own HTTP cache. It only falls back to the last-saved copy
// when there's genuinely no connection. Live data (Firestore, chat,
// quiz scores) still needs the internet regardless — only the app's
// own files are cached here.

const CACHE_NAME = "adeka-academy-hub-v3";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (event) => {
  // Deliberately NOT calling self.skipWaiting() here anymore — a newly
  // installed worker now waits in the background until the person
  // confirms the update prompt in-app (see the "message" listener below).
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

// The page sends this once the person taps "Update Now" on the prompt.
self.addEventListener("message", (event) => {
  if(event.data === "SKIP_WAITING"){
    self.skipWaiting();
  }
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
