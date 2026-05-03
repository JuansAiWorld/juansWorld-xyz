const CACHE_NAME = 'flowpace-v2';
const STATIC_ASSETS = [
  '/flowpace',
  '/flowpace/css/style.css',
  '/flowpace/js/db.js',
  '/flowpace/js/app.js',
  '/flowpace/sounds/step_change.wav',
  '/flowpace/sounds/minimal_step_change.wav',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // API calls: network first, no cache fallback needed (app handles offline)
  if (url.pathname.startsWith('/api/flowpace/')) {
    e.respondWith(
      fetch(request).catch(() => new Response(JSON.stringify({ offline: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }))
    );
    return;
  }

  // Static assets: cache first, but never cache or serve redirect responses
  e.respondWith(
    caches.match(request).then((cached) => {
      if (cached && !cached.redirected) {
        return cached;
      }
      return fetch(request).then((response) => {
        // Don't cache redirect responses
        if (response.status >= 300 && response.status < 400) {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      });
    })
  );
});
