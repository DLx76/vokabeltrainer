// Vokabeltrainer – Service Worker
const VERSION = '3.3.0';
const CACHE = 'vt-englisch5-' + VERSION;
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  // alle Dateien frisch aus dem Netz holen, KEIN automatisches skipWaiting
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(FILES.map(f =>
    fetch(new Request(f, {cache: 'reload'})).then(r => { if (!r.ok) throw new Error(f + ' ' + r.status); return c.put(f, r); })
  ))));
});
self.addEventListener('message', e => { if (e.data === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys
    .filter(k => k.startsWith('vt-englisch5-') && k !== CACHE)
    .map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.pathname.endsWith('/version.json')) { e.respondWith(fetch(e.request, {cache: 'no-store'})); return; }
  e.respondWith(caches.match(e.request, {ignoreSearch: true})
    .then(r => r || fetch(e.request).catch(() => caches.match('./index.html'))));
});
