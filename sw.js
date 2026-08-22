/* CUTOUT service worker — network-first, self-updating.
   New commits appear on next app open; no reinstall needed. */
const CACHE='cutout-v2';

self.addEventListener('install',e=>{self.skipWaiting();});

self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
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
