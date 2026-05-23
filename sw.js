// Orbit App — Service Worker
// Enables background push notifications and offline caching

const CACHE = 'orbit-v2';
const APP_URL = 'https://khanishk6619-cmyk.github.io/Orbit-App/new_life.html';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

// ── NOTIFICATION MESSAGES FROM MAIN THREAD ───────────────────────────────────
self.addEventListener('message', e => {
  if (!e.data) return;

  if (e.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, tag, icon } = e.data;
    self.registration.showNotification(title, {
      body: body || '',
      icon: icon || 'https://khanishk6619-cmyk.github.io/Orbit-App/icon-192.png',
      badge: 'https://khanishk6619-cmyk.github.io/Orbit-App/icon-192.png',
      tag: tag || 'orbit',
      vibrate: [200, 100, 200],
      requireInteraction: false,
      data: { url: APP_URL },
    });
  }

  if (e.data.type === 'SCHEDULE_NOTIFICATION') {
    const { title, body, tag, delay, icon } = e.data;
    setTimeout(() => {
      self.registration.showNotification(title, {
        body: body || '',
        icon: icon || 'https://khanishk6619-cmyk.github.io/Orbit-App/icon-192.png',
        badge: 'https://khanishk6619-cmyk.github.io/Orbit-App/icon-192.png',
        tag: tag || 'orbit-scheduled',
        vibrate: [200, 100, 200],
        requireInteraction: false,
        data: { url: APP_URL },
      });
    }, Math.max(0, delay || 0));
  }
});

// ── NOTIFICATION CLICK → OPEN/FOCUS APP ─────────────────────────────────────
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = e.notification.data?.url || APP_URL;
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
      const open = cs.find(c => c.url.includes('Orbit-App') || c.url.includes('orbit'));
      if (open) return open.focus();
      return clients.openWindow(url);
    })
  );
});

// ── BASIC OFFLINE CACHE (cache app shell on first load) ──────────────────────
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      // Cache the app HTML for offline use
      if (e.request.url.includes('new_life.html')) {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() => cached))
  );
});
