/* MAKTAB — jsdom tests. Run: NODE_PATH=/tmp/build/node_modules node tools/maktab_tests.js */
const fs=require("fs");const path=require("path");const {JSDOM}=require("jsdom");
const HERE=path.join(__dirname,"..");
const html=fs.readFileSync(path.join(HERE,"index.html"),"utf8")
  .replace(/<script src="[^"]*content_data\.js"><\/script>/,"")
  .replace(/<script src="[^"]*question_bank\.js"><\/script>/,"")
  .replace(/<link[^>]*>/g,"");
const c1=fs.readFileSync(path.join(HERE,"../AzharEd_Deploy/content_data.js"),"utf8");
const c2=fs.readFileSync(path.join(HERE,"../AzharEd_Deploy/question_bank.js"),"utf8");
let popups=[];
const dom=new JSDOM(html,{url:"https://maktab.test/",runScripts:"dangerously",pretendToBeVisual:true,
  beforeParse(w){w.eval(c1);w.eval(c2);
    w.open=u=>{const doc={html:"",write(x){this.html+=x;},close(){}};popups.push(doc);return{document:doc};};
    w.prompt=()=>"4500";w.confirm=()=>true;
    w.localStorage.setItem("azhared2:training",JSON.stringify([
      {id:1,icon:"🍎",title:"Classroom management for early years",desc:"Routines",url:"https://youtu.be/abc123XYZ00"},
      {id:2,icon:"🔤",title:"Teaching phonics",desc:"Sounds",url:""}]));}});
const w=dom.window,d=w.document;
const checks=[];const ok=(n,c)=>{checks.push((c?"PASS":"FAIL")+"  "+n);if(!c)process.exitCode=1;};
const $$=s=>[...d.querySelectorAll(s)];

ok("hero renders featured book", d.getElementById("heroTitle").textContent.length>4);
ok("hero kick shows series", /SERIES/.test(d.getElementById("heroKick").textContent));
ok("hero dots", $$(".hdot").length>=5);
ok("rails render", $$(".rail").length>=4);
ok("fresh rail has 8 new books", $$(".rail")[0].querySelectorAll(".bk").length===8);
ok("all 28 books appear somewhere", new Set($$(".bk").map(b=>b.dataset.bk)).size>=28);

/* detail overlay */
$$(".bk")[0].click();
ok("detail opens", d.getElementById("dt").classList.contains("on"));
ok("detail has focus CTA", !!d.querySelector("#dtCard [data-focus]"));
const openBtn=d.querySelector("#dtCard [data-open]");
if(openBtn) openBtn.click();
ok("asset opens from detail", popups.length>=1);

/* focus mode */
d.querySelector("#dtCard [data-focus]").click();
ok("focus mode opens", d.getElementById("fx").classList.contains("on"));
ok("focus has 4 action tiles", $$(".fxa").length===4);
ok("timer ring renders", !!d.querySelector("#tring svg"));
const chip30=$$("#fx [data-min]").find(x=>x.dataset.min==="30");
chip30.click();
ok("timer set to 30 min", d.querySelector("#tring .tt").textContent.includes("30:00"));
ok("timer choice persisted", (w.localStorage.getItem("maktab:timerMin")||"").includes("30"));
d.getElementById("tGo").click();
ok("timer starts", d.getElementById("tGo").textContent.includes("Pause"));
d.getElementById("tGo").click();

/* quiz */
const qzBtn=d.getElementById("fxQuiz");
if(qzBtn&&!qzBtn.disabled){
  qzBtn.click();
  ok("quiz opens with big question", d.getElementById("qz").classList.contains("on") && $$(".qzo").length>=2);
  $$(".qzo")[0].click();
  ok("quiz answer feedback", $$(".qzo.yes,.qzo.no").length>=1);
  d.getElementById("qzClose").click();
}else ok("quiz available on this book", false);
d.getElementById("fxExit").click();
ok("focus exits", !d.getElementById("fx").classList.contains("on"));
ok("last book remembered", !!w.localStorage.getItem("maktab:lastBook"));

/* spotlight */
d.getElementById("slOpen").click();
ok("spotlight opens", d.getElementById("sl").classList.contains("on"));
const si=d.getElementById("slInput"); si.value="rhymes";
si.dispatchEvent(new w.Event("input",{bubbles:true}));
ok("spotlight finds rhymes", $$(".slr").length>=1 && $$(".slr")[0].textContent.includes("Rhymes"));
$$(".slr")[0].click();
ok("spotlight opens book detail", d.getElementById("dt").classList.contains("on"));

/* ---------- teacher training rail ---------- */
ok("training rail renders", !!d.getElementById("trainRail"));
ok("training cards with link buttons", $$("#trainRail [data-trlink]").length>=2);
ok("linked video shows WATCH badge", d.getElementById("trainRail").textContent.includes("▶ WATCH"));
$$("#trainRail [data-tr]")[0].click();
ok("video player opens", d.getElementById("dt").classList.contains("on") && !!d.querySelector("#dtCard iframe"));
d.getElementById("dtX").click();

/* ---------- OFFICE ---------- */
d.getElementById("dtX")&&d.getElementById("dtX").click();
d.getElementById("bsBtn").click();
ok("office opens", d.getElementById("bs").classList.contains("on") && d.getElementById("hero").style.display==="none");
ok("office uses plain DAY theme", d.body.classList.contains("day"));
ok("no theatrical naming", !d.getElementById("bs").textContent.includes("Box Office") && !d.getElementById("bs").textContent.includes("Backstage") && !d.getElementById("bs").textContent.includes("Crew"));
ok("plain sections present", d.getElementById("bs").textContent.includes("Attendance") && d.getElementById("bs").textContent.includes("Fees") && d.getElementById("bs").textContent.includes("Staff"));
ok("roll call renders class pills", $$("[data-cls]").length===8);
const nurBtn=$$("[data-cls]").find(b=>b.dataset.cls==="Nursery"); nurBtn.click();
ok("students chips render", $$(".stuc[data-edit]").length>=2);
d.querySelector("[data-cyc]").click();
ok("attendance cycles + SHARED key", (w.localStorage.getItem("azharedone:att:"+new Date().toISOString().slice(0,10))||"").includes("A"));
d.getElementById("allPresent").click();
ok("mark all present works", !(w.localStorage.getItem("azharedone:att:"+new Date().toISOString().slice(0,10))||"").includes('"A"'));
/* enroll */
d.getElementById("nStu").value="Maktab Kid"; d.getElementById("nStuGo").click();
ok("enroll works on shared students", (w.localStorage.getItem("azharedone:students")||"").includes("Maktab Kid"));
/* editor */
d.querySelector(".stuc[data-edit]").click();
ok("student editor opens", !!d.getElementById("eN"));
d.getElementById("eG").value="Guardian M"; d.getElementById("eSave").click();
ok("editor saves", (w.localStorage.getItem("azharedone:students")||"").includes("Guardian M"));
/* payment + receipt */
popups=[];
const payBadge=d.querySelector("[data-pay]");
if(payBadge){ payBadge.click();
  ok("payment via prompt + receipt", popups.some(p=>p.html&&p.html.includes("FEE PAYMENT RECEIPT"))); }
else ok("payment badge exists", false);
/* box office */
ok("box office numbers", d.body.textContent.includes("Collected") && d.body.textContent.includes("Outstanding"));
popups=[];
const vch=d.querySelector("[data-vch]"); if(vch){vch.click(); ok("single voucher prints", popups.some(p=>p.html&&p.html.includes("FEE VOUCHER")));}
else ok("single voucher prints (no dues left)", true);
/* marks -> shared gradebook */
const mi=d.querySelector('.minp2[data-ms="English"]');
const kidName=mi.dataset.mn;
mi.value="91"; mi.dispatchEvent(new w.Event("change",{bubbles:true}));
ok("marks saved to azhared2:gradebook", (w.localStorage.getItem("azhared2:gradebook")||"").includes(kidName) && (w.localStorage.getItem("azhared2:gradebook")||"").includes("91"));
popups=[];
d.getElementById("prCards").click();
ok("report cards print", popups.some(p=>p.html&&p.html.includes("Progress Report Card")));
/* crew */
const sc=$$("[data-scyc]").length;
d.querySelector("[data-scyc]").click();
ok("staff attendance cycles", (w.localStorage.getItem("azharedone:satt:"+new Date().toISOString().slice(0,10))||"").includes("A"));
d.getElementById("nStaffN").value="New Crew"; d.getElementById("nStaffGo").click();
ok("staff add", $$("[data-scyc]").length===sc+1);
/* notices */
d.getElementById("nNtc").value="Sports day Friday"; d.getElementById("nNtcGo").click();
ok("notice posted", d.body.textContent.includes("Sports day Friday"));
/* printables */
popups=[];
d.getElementById("prAtt").click();
ok("attendance register prints", popups.some(p=>p.html&&p.html.includes("Attendance Register")));
d.getElementById("prFees").click();
ok("fee report prints", popups.some(p=>p.html&&p.html.includes("Fee Report")));
/* certificates */
ok("certificates panel renders", d.getElementById("bs").textContent.includes("Certificates") && $$("[data-cert]").length===6);
$$("[data-cert]")[2].click();
ok("award pill selects", $$("[data-cert]")[2].classList.contains("on"));
popups=[];
d.getElementById("certPrint").click();
ok("certificate prints", popups.some(p=>p.html&&p.html.includes("CERTIFICATE")&&p.html.includes("proudly presented to")));

/* student register */
ok("student register table", $$("[data-rowedit]").length>=6);
popups=[];
d.getElementById("prStuReg").click();
ok("student register prints", popups.some(p=>p.html&&p.html.includes("Student Register")));
$$("[data-rowedit]")[0].click();
ok("row click opens editor", !!d.getElementById("eN"));
d.getElementById("dtX").click();

/* gradebook + staff register */
ok("gradebook heading present", d.getElementById("bs").textContent.includes("Gradebook"));
ok("staff register table with month %", d.getElementById("bs").textContent.includes("This month"));

/* back to stage */
d.getElementById("bsBtn").click();
ok("back on stage", !d.getElementById("bs").classList.contains("on") && d.getElementById("hero").style.display!=="none");
ok("dark theatre returns on stage", !d.body.classList.contains("day"));

console.log(checks.join("\n"));
console.log("Fails:",checks.filter(c=>c.startsWith("FAIL")).length);
process.exit(process.exitCode||0);
