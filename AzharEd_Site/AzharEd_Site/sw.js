// maktabedtech.com root service worker (cleanup release).
// Removes outdated offline data from earlier versions so pages always
// load the current published files. The Teach app keeps its own
// offline support at /AzharEd_Deploy/sw.js.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    try {
      for (const k of await caches.keys()) await caches.delete(k);
      await self.registration.unregister();
      const pages = await self.clients.matchAll({ type: 'window' });
      for (const p of pages) { try { p.navigate(p.url); } catch (err) {} }
    } catch (err) {}
  })());
});
