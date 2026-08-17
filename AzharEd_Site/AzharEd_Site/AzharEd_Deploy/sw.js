// AzharEd Teach offline worker.
// App shell: network-first (fresh when online, saved copy when offline).
// Books, interactives and papers: instant from the saved copy once
// opened or saved, refreshed in the background.
const CACHE='azhared-v4';
const CORE=['./','index.html','content_data.js','question_bank.js','manifest.json','offline_saver.js','assets/azhar_logo.png','assets/bookfactory_logo.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.allSettled(CORE.map(u=>c.add(u)))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.indexOf('azhared-')===0&&k!==CACHE&&k.indexOf('azhared-shell-')!==0).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin)return;
  const p=decodeURIComponent(url.pathname);
  const isContent=p.indexOf('/Flipbooks/')>-1||p.indexOf('/Interactives/')>-1||p.indexOf('/Papers & Books/')>-1||p.indexOf('/Decks/')>-1;
  e.respondWith((async()=>{
    const c=await caches.open(CACHE);
    if(isContent){
      const hit=await c.match(url.href,{ignoreSearch:true});
      const net=fetch(req).then(res=>{if(res&&res.ok)c.put(url.href,res.clone());return res}).catch(()=>hit);
      return hit||net;
    }
    try{
      const res=await fetch(req);
      if(res&&res.ok)c.put(url.href,res.clone());
      return res;
    }catch(err){
      const hit=await c.match(url.href,{ignoreSearch:true});
      if(hit)return hit;
      if(req.mode==='navigate'){
        const dir=url.pathname.replace(/[^/]*$/,'');
        const d1=await c.match(dir,{ignoreSearch:true});
        if(d1)return d1;
        const d2=await c.match(dir+'index.html',{ignoreSearch:true});
        if(d2)return d2;
      }
      throw err;
    }
  })());
});
