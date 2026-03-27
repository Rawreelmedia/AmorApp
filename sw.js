const CACHE_VERSION = 'amor-v4';
const ASSETS = [
  './index.html',
  './manifest.json',
  './amor-medical-calculator.html',
  './amor-medical-emr.html',
  './command-center.html',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Install - cache assets and skip waiting immediately
self.addEventListener('install', e => {
  console.log('[SW] Installing new version...');
  e.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(ASSETS))
      .then(() => {
        console.log('[SW] Assets cached, skipping wait...');
        return self.skipWaiting(); // Activate immediately
      })
  );
});

// Activate - clear old caches and claim clients
self.addEventListener('activate', e => {
  console.log('[SW] Activating...');
  e.waitUntil(
    caches.keys()
      .then(keys => {
        return Promise.all(
          keys.filter(key => key !== CACHE_VERSION)
              .map(key => {
                console.log('[SW] Deleting old cache:', key);
                return caches.delete(key);
              })
        );
      })
      .then(() => {
        console.log('[SW] Claiming clients...');
        return self.clients.claim(); // Take control immediately
      })
  );
});

// Fetch - serve from cache, fallback to network
self.addEventListener('fetch', e => {
  // Skip non-GET requests
  if (e.request.method !== 'GET') return;
  
  // Always fetch version.json from network (no cache)
  if (e.request.url.includes('version.json')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  
  e.respondWith(
    caches.match(e.request)
      .then(cached => {
        // Return cached version, but also fetch update in background
        const fetchPromise = fetch(e.request)
          .then(response => {
            // Update cache with fresh version
            if (response && response.status === 200) {
              const clone = response.clone();
              caches.open(CACHE_VERSION).then(cache => {
                cache.put(e.request, clone);
              });
            }
            return response;
          })
          .catch(() => cached);
        
        return cached || fetchPromise;
      })
  );
});

// Listen for messages from main thread
self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
