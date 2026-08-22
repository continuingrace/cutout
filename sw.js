/* CUTOUT service worker — network-first.
   New commits appear on the next fresh launch. We intentionally do NOT
   skipWaiting/claim aggressively, because forcing activation mid-session makes
   iOS fire controllerchange (which was reloading and wiping the user's work). */
const CACHE='cutout-v4';

self.addEventListener('install',e=>{/* wait normally; activates next launch */});

self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
  })());
});

self.addEventListener('message',e=>{if(e.data==='skip')self.skipWaiting();});

self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET'){return;}
  e.respondWith((async()=>{
    try{
      const fresh=await fetch(req,{cache:'no-store'});
      const cache=await caches.open(CACHE);
      cache.put(req,fresh.clone());
      return fresh;
    }catch(err){
      const cached=await caches.match(req);
      if(cached)return cached;
      throw err;
    }
  })());
});
