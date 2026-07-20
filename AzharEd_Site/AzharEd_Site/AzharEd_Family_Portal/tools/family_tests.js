const fs=require("fs");const {JSDOM}=require("jsdom");
const html=fs.readFileSync("index.html","utf8")
  .replace(/<script src="[^"]*content_data\.js"><\/script>/,"")
  .replace(/<script src="[^"]*question_bank\.js"><\/script>/,"")
  .replace(/<script src="children\.js"><\/script>/,"")
  .replace(/<link[^>]*>/g,"");
const c1=fs.readFileSync("../AzharEd_Deploy/content_data.js","utf8");
const c2=fs.readFileSync("../AzharEd_Deploy/question_bank.js","utf8");
let popups=[];
const dom=new JSDOM(html,{url:"https://fam.test/",runScripts:"dangerously",pretendToBeVisual:true,
  beforeParse(w){w.eval(c1);w.eval(c2);w.eval(fs.readFileSync("children.js","utf8"));w.open=()=>{popups.push(1);return{};};w.confirm=()=>true;}});
const w=dom.window,d=w.document;
const checks=[];const ok=(n,c)=>{checks.push((c?"PASS":"FAIL")+"  "+n);if(!c)process.exitCode=1;};
const $$=s=>[...d.querySelectorAll(s)];

ok("login shows demo note + 3 children", d.body.textContent.includes("Demo preview") && $$(".kid").length===3);
$$(".kid")[0].click();
ok("home renders for Ahmed", d.body.textContent.includes("Ahmed at a glance"));
ok("attendance stat", d.body.textContent.includes("attendance"));
ok("timetable rows", $$(".tlrow").length===5);
ok("tab bar 5 tabs", $$(".tab").length===5);

$$(".tab").find(t=>t.textContent.includes("Learn")).click();
ok("learn shows class books", $$(".bcard").length>=3);
ok("practice quiz renders", $$(".kq").length===3);
const kop=$$(".kop")[0]; kop.click();
ok("quiz answer feedback", kop.classList.contains("yes")||kop.classList.contains("no"));
$$(".bcard")[0].click();
ok("book actions appear", d.getElementById("bkActs").textContent.includes("open together"));
$$("#bkActs .abtn")[0].click();
ok("flipbook opens", popups.length>=1);

$$(".tab").find(t=>t.textContent.includes("Report")).click();
ok("report card table", $$(".rc-table tr").length>=6 && d.body.textContent.includes("Teacher's note"));
$$(".tab").find(t=>t.textContent.includes("Fees")).click();
ok("fees page (Ahmed paid)", d.body.textContent.includes("All clear"));
$$(".tab").find(t=>t.textContent.includes("Notices")).click();
ok("notices page", d.body.textContent.includes("Parent–Teacher Meeting"));

d.getElementById("outBtn").click();
ok("switch child returns to login", $$(".kid").length===3);
/* add a child via the login form */
d.getElementById("addKidBtn").click();
d.getElementById("nkName").value="Test Kid";
d.getElementById("nkSave").click();
ok("add child works", $$(".kid").length===4 && (w.localStorage.getItem("azharedfam:kids")||"").includes("Test Kid"));
$$(".kid")[3].click();
ok("new child gets default data", d.body.textContent.includes("Test at a glance") && d.body.textContent.includes("attendance"));
d.getElementById("outBtn").click();
d.querySelector("[data-rmkid]").click();
ok("remove added child works", $$(".kid").length===3);
$$(".kid")[1].click();
$$(".tab").find(t=>t.textContent.includes("Fees")).click();
ok("Zoya shows due amount", d.body.textContent.includes("2,500"));
/* live link: simulate the teacher's register in shared storage */
w.localStorage.setItem("azharedone:students", JSON.stringify([
  {id:1,name:"Ahmed Ali",cls:"Nursery",roll:1,guardian:"Ali Raza",phone:"0300-1234501",fee:4500,paid:2000}
]));
const iso = new Date().toISOString().slice(0,10);
w.localStorage.setItem("azharedone:att:"+iso, JSON.stringify({1:"A"}));
w.localStorage.setItem("azharedone:att:2026-07-01", JSON.stringify({1:"P"}));
w.localStorage.setItem("azharedone:att:2026-06-15", JSON.stringify({1:"A"})); // old month — must NOT count
d.getElementById("outBtn").click(); // back to login first
$$(".kid")[0].click(); // Ahmed
ok("live badge shows", d.body.textContent.includes("Live from the school register"));
ok("live attendance = current month only", d.body.textContent.includes("50%") && d.body.textContent.includes("attendance · "));
ok("live fee due shown", d.body.textContent.includes("2,500"));
$$(".tab").find(t=>t.textContent.includes("Fees")).click();
ok("fees page live due", d.body.textContent.includes("2,500") && d.body.textContent.includes("live from the school register"));

/* live report marks from the AzharEd gradebook */
w.localStorage.setItem("azhared2:gradebook", JSON.stringify({
  "Nursery A|2nd Term": { subjects:["English","Urdu","Counting"],
    rows:[{name:"Ahmed Ali", m:{English:93, Urdu:87, Counting:99}}] }
}));
$$(".tab").find(t=>t.textContent.includes("Report")).click();
ok("report shows live term", d.body.textContent.includes("2nd Term"));
ok("report shows live marks", d.body.textContent.includes("93") && d.body.textContent.includes("99"));
ok("report live badge", d.body.textContent.includes("Live from the teacher's gradebook"));

console.log(checks.join("\n"));
console.log("Fails:",checks.filter(c=>c.startsWith("FAIL")).length);
process.exit(process.exitCode||0);
