// ===== SERVICE WORKER MIREJ-C =====
// Chaque fois que vous modifiez l'app, changez ce numéro de version
const CACHE_VERSION = 'mirejc-v1';
const CACHE_FILES = ['/index.html'];

// Installation : mise en cache initiale
self.addEventListener('install', event => {
  self.skipWaiting(); // Active immédiatement le nouveau SW
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => cache.addAll(CACHE_FILES))
  );
});

// Activation : supprime les anciens caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim()) // Prend le contrôle immédiatement
  );
});

// Fetch : réseau d'abord, cache en secours
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Mettre à jour le cache avec la version fraîche
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request)) // Si hors ligne → cache
  );
});
