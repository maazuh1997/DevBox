const CACHE_NAME = "devbox-shell-v4";
const scopeUrl = new URL(self.registration.scope);
const SHELL_URLS = [scopeUrl.href, new URL("index.html", scopeUrl).href];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_URLS)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key.startsWith("devbox-shell-") && key !== CACHE_NAME).map(key => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== scopeUrl.origin || !url.href.startsWith(scopeUrl.href)) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(new URL("index.html", scopeUrl).href, copy)));
        }
        return response;
      }).catch(async () =>
        (await caches.match(request)) ||
        (await caches.match(scopeUrl.href)) ||
        (await caches.match(new URL("index.html", scopeUrl).href))
      )
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (!response || !response.ok || response.type !== "basic") return response;
        const copy = response.clone();
        event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(request, copy)));
        return response;
      });
    })
  );
});
