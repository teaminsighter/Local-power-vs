/**
 * Service Worker for Advanced Caching Strategies
 * Provides offline support and optimized asset caching
 */

const CACHE_NAME = 'local-power-v1.0.0';
const STATIC_CACHE_NAME = 'local-power-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'local-power-dynamic-v1.0.0';
const IMAGE_CACHE_NAME = 'local-power-images-v1.0.0';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/fonts/GeistVF.woff2',
  '/fonts/GeistMonoVF.woff2',
  '/offline.html'
];

// Cache strategies
const CACHE_STRATEGIES = {
  // Cache first for static assets
  CACHE_FIRST: [
    /\/_next\/static\//,
    /\/fonts\//,
    /\/images\/.*\.(png|jpg|jpeg|webp|avif|svg|ico)$/,
    /\/logos\//
  ],
  
  // Network first for API routes
  NETWORK_FIRST: [
    /\/api\//,
    /\/auth\//
  ],
  
  // Stale while revalidate for pages
  STALE_WHILE_REVALIDATE: [
    /^https:\/\/localhost:3002\//,
    /\/(admin|dashboard|calculator)/
  ]
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== CACHE_NAME &&
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== DYNAMIC_CACHE_NAME &&
              cacheName !== IMAGE_CACHE_NAME
            ) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other protocols
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  event.respondWith(handleFetch(request));
});

// Main fetch handler
async function handleFetch(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  try {
    // Determine cache strategy
    const strategy = getCacheStrategy(pathname);
    
    switch (strategy) {
      case 'CACHE_FIRST':
        return await cacheFirst(request);
      
      case 'NETWORK_FIRST':
        return await networkFirst(request);
      
      case 'STALE_WHILE_REVALIDATE':
        return await staleWhileRevalidate(request);
      
      default:
        return await fetch(request);
    }
  } catch (error) {
    console.error('Fetch error:', error);
    return await handleFetchError(request, error);
  }
}

// Determine cache strategy based on URL
function getCacheStrategy(pathname) {
  // Check cache first patterns
  for (const pattern of CACHE_STRATEGIES.CACHE_FIRST) {
    if (pattern.test(pathname)) {
      return 'CACHE_FIRST';
    }
  }
  
  // Check network first patterns
  for (const pattern of CACHE_STRATEGIES.NETWORK_FIRST) {
    if (pattern.test(pathname)) {
      return 'NETWORK_FIRST';
    }
  }
  
  // Check stale while revalidate patterns
  for (const pattern of CACHE_STRATEGIES.STALE_WHILE_REVALIDATE) {
    if (pattern.test(pathname)) {
      return 'STALE_WHILE_REVALIDATE';
    }
  }
  
  return 'NETWORK_ONLY';
}

// Cache first strategy
async function cacheFirst(request) {
  const cacheName = isImageRequest(request) ? IMAGE_CACHE_NAME : STATIC_CACHE_NAME;
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    throw error;
  }
}

// Network first strategy
async function networkFirst(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Stale while revalidate strategy
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Start network request (don't await)
  const networkPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Network failed, but we might have cache
  });
  
  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Otherwise wait for network
  return await networkPromise;
}

// Handle fetch errors
async function handleFetchError(request, error) {
  const url = new URL(request.url);
  
  // For navigation requests, serve offline page
  if (request.mode === 'navigate') {
    const cache = await caches.open(STATIC_CACHE_NAME);
    const offlinePage = await cache.match('/offline.html');
    
    if (offlinePage) {
      return offlinePage;
    }
  }
  
  // For images, serve placeholder
  if (isImageRequest(request)) {
    return new Response(
      `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af">
          Image unavailable
        </text>
      </svg>`,
      {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'no-cache'
        }
      }
    );
  }
  
  throw error;
}

// Check if request is for an image
function isImageRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  return /\.(png|jpg|jpeg|webp|avif|svg|gif|ico)$/i.test(pathname) ||
         pathname.includes('/images/') ||
         pathname.includes('/logos/');
}

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync());
  }
});

// Handle background sync
async function handleBackgroundSync() {
  console.log('Background sync triggered');
  
  // Here you could retry failed API requests, sync offline data, etc.
  // For now, we'll just clear old cache entries
  
  try {
    await cleanupOldCacheEntries();
  } catch (error) {
    console.error('Background sync error:', error);
  }
}

// Cleanup old cache entries
async function cleanupOldCacheEntries() {
  const maxCacheSize = 50; // Maximum number of entries per cache
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  
  const cacheNames = [DYNAMIC_CACHE_NAME, IMAGE_CACHE_NAME];
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    
    // Remove old entries
    const now = Date.now();
    let removedCount = 0;
    
    for (const request of requests) {
      const response = await cache.match(request);
      const dateHeader = response?.headers.get('date');
      
      if (dateHeader) {
        const cacheDate = new Date(dateHeader).getTime();
        
        if (now - cacheDate > maxAge) {
          await cache.delete(request);
          removedCount++;
        }
      }
    }
    
    // Remove excess entries if still over limit
    const remainingRequests = await cache.keys();
    if (remainingRequests.length > maxCacheSize) {
      const excessRequests = remainingRequests.slice(maxCacheSize);
      
      for (const request of excessRequests) {
        await cache.delete(request);
        removedCount++;
      }
    }
    
    if (removedCount > 0) {
      console.log(`Cleaned up ${removedCount} entries from ${cacheName}`);
    }
  }
}

// Push notification handling (for future use)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Local Power', {
        body: data.body || 'You have a new message',
        icon: '/favicon-192x192.png',
        badge: '/favicon-192x192.png',
        tag: data.tag || 'default',
        data: data.url || '/'
      })
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data || '/')
  );
});

console.log('Service Worker registered and ready!');