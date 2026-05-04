const CACHE = 'jpl-v17';
const ASSETS = [
  '/jpl/',
  '/jpl/index.html',
  '/jpl/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
});

// Listen for skip waiting message from app
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', e => {
  // Pass through all external requests
  if (e.request.url.includes('workers.dev') ||
      e.request.url.includes('googleapis') ||
      e.request.url.includes('storage.googleapis') ||
      e.request.url.includes('fonts.g') ||
      e.request.url.includes('forms.gle') ||
      e.request.url.includes('wa.me')) {
    e.respondWith(fetch(e.request));
    return;
  }
  // Cache first for app assets
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        const clone = response.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, clone));
        return response;
      });
    })
  );
});
