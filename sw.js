const CACHE='amor-v2';
const ASSETS=['./index.html','./manifest.json','./amor-medical-calculator.html','./amor-medical-emr.html','./command-center.html','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));
