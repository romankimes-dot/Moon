// Cache hors-ligne : la page, les icônes, les scripts three.js du CDN et les extensions.
// La version est calculée à chaque publication (build.py) pour forcer la mise à jour.
const CACHE = 'moon-sweeper-24be574a';
const FILES = ['./', './index.html', './story.js', './manifest.webmanifest', 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Barlow:wght@400;500;600&display=swap', './icons/icon-180.png', './icons/icon-167.png', './icons/icon-152.png', './icons/icon-192.png', './icons/icon-512.png', 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/shaders/CopyShader.js', 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/shaders/LuminosityHighPassShader.js', 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/EffectComposer.js', 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/RenderPass.js', 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/ShaderPass.js', 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/UnrealBloomPass.js', './features/feel.js', './features/histoire.js', './features/meta.js', './features/monde.js', './features/progression.js', './features/relief.js', './features/style.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== CACHE).map(n => caches.delete(n)))).then(() => self.clients.claim())); });
// réseau d'abord pour la page (mises à jour), cache d'abord pour le reste
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const page = e.request.mode === 'navigate';
  e.respondWith(page
    ? fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put('./index.html', c)); return r; }).catch(() => caches.match('./index.html'))
    : caches.match(e.request).then(r => r || fetch(e.request).then(n => { if (n.ok) { const c = n.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); } return n; })));
});
