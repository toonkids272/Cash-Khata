// Cash Khata Production Service Worker for PWABuilder, Android APK, and Offline Access
const CACHE_NAME = 'cash-khata-v3';
const OFFLINE_URL = '/';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  '/app-icon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Precache partial warning:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) {
            return caches.delete(k);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip Firebase Auth, Firestore API endpoints, Google APIs, and Ads from cache
  if (
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('google.com') ||
    url.hostname.includes('googlesyndication.com') ||
    url.hostname.includes('doubleclick.net')
  ) {
    return;
  }

  // Network-first with cache fallback strategy for maximum data freshness & offline reliability
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache).catch(() => {});
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        // If navigating to a page and offline, serve root index.html
        if (event.request.mode === 'navigate') {
          const fallback = await caches.match(OFFLINE_URL);
          if (fallback) return fallback;
        }
        return new Response('Offline - Cash Khata is currently running in offline mode.', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' },
        });
      })
  );
});
