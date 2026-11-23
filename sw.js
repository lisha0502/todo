/* 항상 최신 파일을 먼저 받아 오고, 인터넷이 없을 때만 저장해 둔 파일을 써요. */
const CACHE = 'todo-v4';
const FILES = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png', './vendor/marked.min.js', './vendor/purify.min.js', './seed.js', './library.js'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(FILES.map(f => fetch(f, {cache:'no-store'}).then(r => r.ok && c.put(f, r)).catch(()=>{})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  const isPage = e.request.mode === 'navigate';
  const key = isPage ? './index.html' : e.request;
  e.respondWith(
    fetch(e.request, {cache:'no-store'})
      .then(r => { if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(key, cp)); } return r; })
      .catch(() => caches.match(key, {ignoreSearch:true}).then(r => r || caches.match('./index.html')))
  );
});
