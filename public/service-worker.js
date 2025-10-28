// Service Worker for Gode Jewellers PWA
const CACHE_NAME = 'gode-jewellers-v1';
const STATIC_CACHE = 'gode-jewellers-static-v1';

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/favicon.ico'
];

// Cache-first strategy for static assets
const cacheFirstStrategy = async (request) => {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    // Return offline page or fallback
    return new Response('Offline - Resource not available', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('Service Worker: Caching static assets');
      return cache.addAll(STATIC_ASSETS.map(url => new Request(url)));
    })
  );
  
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  return self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }
  
  // Cache-first strategy for HTML, CSS, JS, and icons
  if (
    request.method === 'GET' &&
    (request.destination === 'document' ||
     request.destination === 'script' ||
     request.destination === 'style' ||
     request.destination === 'image' ||
     request.url.endsWith('.json') ||
     request.url.endsWith('.svg') ||
     request.url.endsWith('.ico'))
  ) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }
  
  // Network-first strategy for API calls and dynamic content
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clone the response for caching
        if (request.method === 'GET') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Try to serve from cache if network fails
        return caches.match(request);
      })
  );
});

// Background sync event (optional - for offline form submissions)
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag);
  // Implement background sync logic if needed
});

