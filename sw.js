const CACHE_NAME = 'bettracker-pro-v4.0';
const ASSETS = [
  './',
  './index.html',
  './paris.html',
  './montante.html',
  './transactions.html',
  './outils.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icon.svg'
];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', e => {
    // Ne pas cacher les requêtes API s'il y en a plus tard, mais pour une app 100% offline, on sert le cache en priorité.
    e.respondWith(
        caches.match(e.request).then(response => {
            return response || fetch(e.request).then(fetchRes => {
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(e.request.url, fetchRes.clone());
                    return fetchRes;
                });
            });
        })
    );
});
