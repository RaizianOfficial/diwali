// Basic Service Worker for PWA Installability
const CACHE_NAME = 'diwali-mela-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
  // Let Vite handle development/production assets with network fallback
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
