const CACHE_NAME = 'sito-manfredonia-v1';
const ASSETS_TO_CACHE = [
  '/',
  'index.html',
  'mobile.html',
  'mobile.min.css',
  'critical.css',
  'js/mobile-scripts.min.js',
  'js/config-manager.js',
  'img/favicon.png',
  'img/pannello1.webp',
  'img/pannello2.webp',
  'img/pannello3.webp',
  'manifest.json'
];

// Strategia di caching: Cache First, poi Network
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
});

// Strategia di caching differenziata per tipo di risorsa
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Strategia per le risorse statiche (immagini, CSS, JS)
  if (
    event.request.destination === 'image' ||
    event.request.destination === 'style' ||
    event.request.destination === 'script' ||
    ASSETS_TO_CACHE.includes(url.pathname)
  ) {
    event.respondWith(cacheFirst(event.request));
    return;
  }
  
  // Strategia per le API o risorse dinamiche
  if (url.pathname.includes('/api/')) {
    event.respondWith(networkFirst(event.request));
    return;
  }
  
  // Strategia predefinita: stale-while-revalidate
  event.respondWith(staleWhileRevalidate(event.request));
});

// Implementazione della strategia Cache First
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    return new Response('Network error', { status: 408 });
  }
}

// Implementazione della strategia Network First
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response('Network error', { status: 408 });
  }
}

// Implementazione della strategia Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  
  // Cerca nella cache
  const cachedResponse = await cache.match(request);
  
  // Aggiorna la cache in background
  const fetchPromise = fetch(request).then(networkResponse => {
    cache.put(request, networkResponse.clone());
    return networkResponse;
  });
  
  // Restituisci la risposta dalla cache se disponibile, altrimenti dalla rete
  return cachedResponse || fetchPromise;
}
