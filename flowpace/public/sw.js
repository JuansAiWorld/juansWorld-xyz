const CACHE_NAME = 'flowpace-v1';
const STATIC_ASSETS = [
  '/',
  '/css/style.css',
  '/js/db.js',
  '/js/app.js',
  '/sounds/step_change.wav',
  '/sounds/minimal_step_change.wav',
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
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(
      fetch(request).catch(() => new Response(JSON.stringify({ offline: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }))
    );
    return;
  }

  // Static assets: cache first
  e.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      });
    })
  );
});
