const CACHE_NAME = 'sito-manfredonia-v1';
const ASSETS_TO_CACHE = [
  '/',
  'index.html',
  'mobile.html',
  'mobile.min.css',
  'js/mobile-scripts.min.js',
  'js/config-manager.js',
  'img/favicon.png',
  'img/pannello1.png',
  'img/pannello2.png',
  'img/pannello3.png',
  'img/pannello1.webp',
  'img/pannello2.webp',
  'img/pannello3.webp',
  // aggiungi altre risorse statiche se necessario
];

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

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
}); 