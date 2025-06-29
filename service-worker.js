self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('weather-cache').then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/style.css',
        '/script.js',
        '/manifest.json',
        '/icon.png',
        '/sunny.gif',
        '/cloudy.gif',
        '/rain.gif',
        '/snow.gif'
      ]);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});
