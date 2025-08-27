const CACHE = 'thrive-shell-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest'
  // Vite will fingerprint assets; this is a minimal shell to allow offline app shell.
];
self.addEventListener('install', (e)=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
});
self.addEventListener('activate', (e)=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
});
self.addEventListener('fetch', (e)=>{
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (url.origin === location.origin) {
    e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request)));
  }
});
