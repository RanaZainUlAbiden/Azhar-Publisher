// maktabedtech.com offline worker (shell-v2).
// Network-first: always serves fresh files when online, falls back to
// the saved copy when offline. Book content under /AzharEd_Deploy/ is
// stored by the Teach worker cache, not duplicated here.
const CACHE='azhared-shell-v1';
const CORE=['/','/index.html','/Maktab_Cloud/','/Maktab_Cloud/index.html','/Maktab_Cloud/app.js','/Maktab_Cloud/supabase_config.js','/AzharEd_Family_Portal/','/AzharEd_Family_Portal/index.html','/AzharEd_Family_Portal/children.js','/AzharEd_Family_Portal/supabase_config.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.allSettled(CORE.map(u=>c.add(u)))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k==='azhared-v3'||(k.indexOf('azhared-shell-')===0&&k!==CACHE)).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
const clean=r=>r&&r.redirected?new Response(r.body,{status:r.status,statusText:r.statusText,headers:r.headers}):r;
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin)return;
  const skipStore=url.pathname.indexOf('/AzharEd_Deploy/')===0;
  e.respondWith((async()=>{
    try{
      const res=await fetch(req);
      if(res&&res.ok&&!skipStore){const c=await caches.open(CACHE);c.put(url.href,res.clone());}
      return res;
    }catch(err){
      const hit=await caches.match(url.href,{ignoreSearch:true});
      if(hit)return clean(hit);
      if(req.mode==='navigate'){
        const dir=url.pathname.replace(/[^/]*$/,'');
        const idx=await caches.match(dir,{ignoreSearch:true});
        if(idx)return clean(idx);
      }
      throw err;
    }
  })());
});
