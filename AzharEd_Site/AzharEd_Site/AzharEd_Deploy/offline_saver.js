(function(){
'use strict';
if(!('caches' in window))return;
var CACHE='azhared-v4';
var baseAbs=new URL('/AzharEd_Deploy/',location.origin);
function abs(p){return new URL(p,baseAbs).href}
function getBooks(cb){
  if(window.AZHAR_CONTENT&&window.AZHAR_CONTENT.books)return cb(window.AZHAR_CONTENT.books);
  fetch(abs('content_data.js')).then(function(r){return r.text()}).then(function(t){
    try{(new Function(t))()}catch(e){}
    cb((window.AZHAR_CONTENT&&window.AZHAR_CONTENT.books)||[]);
  }).catch(function(){cb([])});
}
function urlsFor(b){
  var seen={},out=[];
  function add(p){if(!p||typeof p!=='string')return;var u;try{u=abs(p)}catch(e){return}if(seen[u])return;seen[u]=1;out.push(u)}
  add(b.flipbook);add(b.interactive);add(b.deckPdf||b.deck);add(b.cover);add(b.coverImg);
  (b.papers||[]).forEach(function(p){if(p)add(p.path)});
  return out;
}
function isSaved(c,b,cb){
  var urls=urlsFor(b);if(!urls.length)return cb(false);
  var n=0,ok=true;
  urls.forEach(function(u){c.match(u,{ignoreSearch:true}).then(function(hit){if(!hit)ok=false;n++;if(n===urls.length)cb(ok)})});
}
function saveBook(c,b,onprog,ondone){
  var urls=urlsFor(b),total=urls.length,fin=0,fail=0,i=0,ended=false;
  if(!total)return ondone(false);
  function step(){
    if(i>=urls.length)return;
    var u=urls[i++];
    fetch(u,{cache:'reload'}).then(function(res){
      if(!res.ok)throw new Error('HTTP');
      var alt=/\.html$/.test(u)?u.replace(/\.html$/,''):null;
      var p=c.put(u,res.clone());
      return alt?p.then(function(){return c.put(alt,res.clone())}):p;
    }).then(function(){fin++},function(){fin++;fail++}).then(function(){
      onprog(fin,total);
      if(fin===total){if(!ended){ended=true;ondone(fail===0)}}
      else step();
    });
  }
  var w=Math.min(2,urls.length);
  for(var k=0;k<w;k++)step();
}
function el(t,css,txt){var e=document.createElement(t);if(css)e.style.cssText=css;if(txt!=null)e.textContent=txt;return e}
function init(books){
  if(!books.length)return;
  var open=false;
  var btn=el('button','position:fixed;bottom:18px;right:18px;z-index:2147483000;background:#0f3460;color:#fff;border:0;border-radius:24px;padding:10px 16px;font:700 13px system-ui,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.4);cursor:pointer','Offline books');
  var wrap=el('div','display:none;position:fixed;top:0;right:0;bottom:0;left:0;z-index:2147483001;background:rgba(8,12,30,.55)');
  var card=el('div','position:absolute;bottom:74px;right:18px;width:340px;max-width:92vw;max-height:70vh;overflow:auto;background:#101a33;color:#e8ecf7;border-radius:14px;padding:14px;font:13px/1.5 system-ui,sans-serif;box-shadow:0 10px 40px rgba(0,0,0,.5)');
  wrap.appendChild(card);
  wrap.onclick=function(ev){if(ev.target===wrap){wrap.style.display='none';open=false}};
  card.appendChild(el('div','font-weight:800;font-size:15px;margin-bottom:2px','Save books for offline'));
  card.appendChild(el('div','opacity:.7;margin-bottom:10px;font-size:12px','Saved items open without internet on this device. Save while on wifi.'));
  var groups={};
  books.forEach(function(b){var g=(b.series||'Books')+' - '+(b.level||'');(groups[g]=groups[g]||[]).push(b)});
  caches.open(CACHE).then(function(c){
    Object.keys(groups).sort().forEach(function(g){
      var gh=el('div','margin:10px 0 4px;font-weight:800;color:#9fb4e8;display:flex;justify-content:space-between;align-items:center');
      gh.appendChild(el('span',null,g));
      var saveAll=el('button','background:#1a4a8a;color:#fff;border:0;border-radius:8px;padding:3px 8px;font:600 11px system-ui;cursor:pointer','Save all');
      gh.appendChild(saveAll);
      card.appendChild(gh);
      var rowsBtns=[];
      groups[g].forEach(function(b){
        var row=el('div','display:flex;justify-content:space-between;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.06)');
        var name=el('span','flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap',(b.subject||b.title||b.id));
        var bb=el('button','background:#e94560;color:#fff;border:0;border-radius:8px;padding:4px 10px;font:700 11px system-ui;cursor:pointer;min-width:74px','Save');
        function setSaved(){bb.textContent='Saved';bb.style.background='#00a884';bb.disabled=true}
        isSaved(c,b,function(ok){if(ok)setSaved()});
        bb.onclick=function(){
          bb.disabled=true;bb.textContent='...';
          saveBook(c,b,function(d,t){bb.textContent=d+'/'+t},function(ok){
            if(ok){setSaved()}else{bb.textContent='Retry';bb.disabled=false;bb.style.background='#b23048'}
          });
        };
        rowsBtns.push(bb);
        row.appendChild(name);row.appendChild(bb);
        card.appendChild(row);
      });
      saveAll.onclick=function(){rowsBtns.forEach(function(bb){if(!bb.disabled)bb.onclick()})};
    });
  });
  card.appendChild(el('div','opacity:.6;margin-top:10px;font-size:11px','Video lessons stream from YouTube and stay online-only.'));
  btn.onclick=function(){open=!open;wrap.style.display=open?'block':'none'};
  document.body.appendChild(btn);document.body.appendChild(wrap);
}
function boot(){getBooks(function(b){try{init(b)}catch(e){}})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
