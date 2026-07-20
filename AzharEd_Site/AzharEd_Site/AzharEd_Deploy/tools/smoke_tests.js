/* AzharEd full smoke-test suite (jsdom).
   Setup (once):  cd /tmp/build && npm init -y && npm i esbuild react@18.2.0 react-dom@18.2.0 jsdom
   Compile:       extract <script type="text/babel"> from index.html -> /tmp/app.jsx
                  esbuild /tmp/app.jsx --loader:.jsx=jsx --outfile=/tmp/app.compiled.js
   Run:           cd /tmp/build && node <path to this file> */
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");
const DEPLOY = path.join(__dirname, "..");

const dom = new JSDOM(`<!DOCTYPE html><html><body><div id="root"></div></body></html>`,
  { url: "https://azhared.test/", pretendToBeVisual: true });
global.window = dom.window; global.document = dom.window.document;
global.localStorage = dom.window.localStorage; global.navigator = dom.window.navigator;
global.confirm = () => true;
let openedDocs = [], openedUrls = [];
window.open = (u) => { openedUrls.push(u || ""); const doc = { html: "", write(s){ this.html += s; }, close(){} }; openedDocs.push(doc); return { document: doc }; };

global.React = require("react"); global.ReactDOM = require("react-dom/client");
const { act } = require("react-dom/test-utils");
global.IS_REACT_ACT_ENVIRONMENT = true;

eval(fs.readFileSync(path.join(DEPLOY, "content_data.js"), "utf8"));
window.AZHAR_CONTENT = global.window.AZHAR_CONTENT;
eval(fs.readFileSync(path.join(DEPLOY, "question_bank.js"), "utf8"));
window.AZHAR_QBANK = global.window.AZHAR_QBANK;
act(() => { eval(fs.readFileSync("/tmp/app.compiled.js", "utf8")); });

const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const clickEl = el => act(() => { el.dispatchEvent(new window.MouseEvent("click", { bubbles: true })); });
const typeIn = (el, val) => act(() => {
  const st = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  st.call(el, val); el.dispatchEvent(new window.Event("input", { bubbles: true }));
});
const selectVal = (el, val) => act(() => {
  const st = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value").set;
  st.call(el, val); el.dispatchEvent(new window.Event("change", { bubbles: true }));
});
const results = [];
const check = (n, c) => { results.push((c ? "PASS" : "FAIL") + "  " + n); if (!c) process.exitCode = 1; };
const navTo = l => clickEl($$(".sb-item").find(i => i.textContent.includes(l)));
const smsTab = l => clickEl($$(".sms-tab").find(x => x.textContent.includes(l)));

/* ---- auth + dashboard ---- */
check("auth screen renders", document.body.textContent.includes("Teacher & School Portal"));
clickEl($$(".chip").find(c => c.textContent.includes("admin")));
check("dashboard after login", document.body.textContent.includes("Welcome,"));
check("dashboard has ring", $$(".ringwrap svg").length >= 1);
check("session saved", (localStorage.getItem("azhared2:session") || "").includes("admin"));

/* ---- library ---- */
navTo("Book Library");
check("library renders all books", $$(".book-card").length === window.AZHAR_CONTENT.books.length);
clickEl($$(".book-card")[0]);
check("book modal opens", !!$(".modal"));
clickEl($$(".act2")[0]);
check("flipbook opened", openedUrls.length + openedDocs.length >= 1);
clickEl($(".modal .star-btn")); clickEl($(".modal-x"));
check("favourite + viewed saved", JSON.parse(localStorage.getItem("azhared2:favs")).length === 1 && !!localStorage.getItem("azhared2:viewed"));

/* ---- paper generator (compact single-card) ---- */
navTo("Paper Generator");
check("papergen renders", document.body.textContent.includes("Paper Generator"));
let pgSels = $$(".rc-toolbar select");
selectVal(pgSels[0], "Nursery");
pgSels = $$(".rc-toolbar select");
check("book dropdown for early years", [...pgSels[1].options].some(o => o.value.includes("counting")));
selectVal(pgSels[1], "panda_nursery_counting");
check("page range + availability shown", document.body.textContent.includes("questions available in this range"));
clickEl($$("button").find(b => b.textContent.includes("Generate paper")));
check("paper generated from book", $$(".mini").some(m => m.textContent.startsWith("p. ")));
clickEl($$("button").find(b => b.textContent.includes("Print for students")));
check("student paper printed (no answers)", openedDocs[openedDocs.length - 1].html.includes("Total Marks") && !openedDocs[openedDocs.length - 1].html.includes("Answer Key"));
clickEl($$("button").find(b => b.textContent.includes("Print with answers")));
check("teacher paper printed (with key)", openedDocs[openedDocs.length - 1].html.includes("Answer Key"));
pgSels = $$(".rc-toolbar select");
selectVal(pgSels[0], "Three");
check("class 3 uses subject bank", document.body.textContent.includes("subject bank"));
pgSels = $$(".rc-toolbar select");
selectVal(pgSels[1], "Maths");
clickEl($$("button").find(b => b.textContent.includes("Generate paper")));
check("maths paper generated", (document.body.textContent.match(/= ____/g) || []).length >= 3);
clickEl($$("button").find(b => b.textContent.includes("Add your own questions")));
const addInp = $$("input").find(i => i.placeholder && i.placeholder.includes("Type a question"));
typeIn(addInp, "Custom Q: solve 5 word problems.");
clickEl($$("button").find(b => b.textContent === "Add"));
check("custom question saved", (localStorage.getItem("azhared2:qbank2") || "").includes("Custom Q"));

/* ---- lesson planner (compact) ---- */
navTo("Lesson Planner");
check("planner renders", document.body.textContent.includes("Lesson Planner"));
let plSels = $$(".rc-toolbar select");
check("week dropdown present", [...plSels[3].options].length === 14);
selectVal(plSels[3], "3");
const planInp = $$(".gtable .tt-inp")[0];
typeIn(planInp, "Counting book p. 12-15");
check("plan saved", (localStorage.getItem("azhared2:planner") || "").includes("p. 12-15"));
check("planner progress text", document.body.textContent.includes("planned"));
clickEl($$("button").find(b => b.textContent.includes("Print this week")));
check("week printed", openedDocs[openedDocs.length - 1].html.includes("Weekly Lesson Plan"));

/* ---- gradebook + bulk report cards ---- */
navTo("Class Gradebook");
sels = $$(".rc-toolbar select");
selectVal(sels[0], "Nursery");
clickEl($$("button").find(b => b.textContent.includes("Import class students")));
check("students imported", $$(".gtable tbody tr").length >= 2);
navTo("Report Cards");
check("bulk print select present", $$("select").some(s => s.textContent.includes("Print whole class")));
const bulkSel = $$("select").find(s => s.textContent.includes("Print whole class"));
selectVal(bulkSel, [...bulkSel.options].find(o => o.value).value);
check("bulk cards printed", openedDocs[openedDocs.length - 1].html.split("Progress Report Card").length >= 3);

/* ---- SMS: reports tab ---- */
navTo("School Management");
smsTab("Student Attendance");
clickEl($$(".att-b")[1]); // mark one absent today
smsTab("Reports");
check("reports tab renders", document.body.textContent.includes("Monthly reports"));
check("report KPIs", document.body.textContent.includes("Days attendance marked"));
clickEl($$("button").find(b => b.textContent.includes("Student attendance register")));
check("attendance register printed", openedDocs[openedDocs.length - 1].html.includes("Attendance Register"));
clickEl($$("button").find(b => b.textContent.includes("Fee report")));
check("fee report printed", openedDocs[openedDocs.length - 1].html.includes("Defaulter List"));

/* ---- timetable dropdowns ---- */
smsTab("Timetable");
check("timetable dropdown cells", $$(".tt-cell").length === 25);

/* ---- homework diary ---- */
navTo("Homework Diary");
check("diary renders", document.body.textContent.includes("Homework Diary"));
const dInp = $$(".gtable .tt-inp")[0];
typeIn(dInp, "Trace numbers 1-5");
check("diary saves per class+day", (localStorage.getItem("azhared2:diary") || "").includes("Trace numbers 1-5"));
clickEl($$("button").find(b => b.textContent.includes("Print")));
check("diary prints", openedDocs[openedDocs.length - 1].html.includes("Homework Diary"));
check("diary WhatsApp button", $$("button").some(b => b.textContent.includes("Send to WhatsApp")));

/* ---- certificates ---- */
navTo("Certificates");
check("certs page renders", document.body.textContent.includes("Which award?"));
clickEl($$(".fchip").find(c => c.textContent.includes("Best Handwriting")));
check("cert preview updates", document.body.textContent.includes("beautiful, careful writing"));
clickEl($$("button").find(b => b.textContent.includes("Print certificate")));
check("certificate prints", openedDocs[openedDocs.length - 1].html.includes("CERTIFICATE") && openedDocs[openedDocs.length - 1].html.includes("proudly presented to"));

/* ---- fee vouchers ---- */
navTo("School Management");
smsTab("Fees");
clickEl($$("button").find(b => b.textContent.includes("Print fee vouchers")));
check("fee vouchers print", openedDocs[openedDocs.length - 1].html.includes("FEE VOUCHER") && openedDocs[openedDocs.length - 1].html.includes("Amount payable"));
clickEl($$("button").find(b => b.title === "Print this student's fee voucher"));
check("single student voucher prints", openedDocs[openedDocs.length - 1].html.includes("FEE VOUCHER") && (openedDocs[openedDocs.length - 1].html.match(/class="v"/g) || []).length === 1);

/* ---- Urdu toggle ---- */
const langBtn = $$("button").find(b => b.title === "اردو / English");
check("lang toggle present", !!langBtn);
clickEl(langBtn);
check("urdu applied", $$(".sb-item").some(i => i.textContent.includes("کتب خانہ")) && document.documentElement.lang === "ur");
clickEl($$("button").find(b => b.title === "اردو / English"));
check("english restored", $$(".sb-item").some(i => i.textContent.includes("Book Library")));

/* ---- settings ---- */
navTo("Profile & Settings");
check("storage meter", document.body.textContent.includes("KB used"));
check("no bar charts anywhere", $$(".bars").length === 0 && $$(".storage-bar").length === 0);

/* ---- PWA files ---- */
check("manifest exists", fs.existsSync(path.join(DEPLOY, "manifest.json")));
check("service worker exists", fs.existsSync(path.join(DEPLOY, "sw.js")));
check("icons exist", fs.existsSync(path.join(DEPLOY, "assets/icon-192.png")) && fs.existsSync(path.join(DEPLOY, "assets/icon-512.png")));
check("index links manifest + sw", fs.readFileSync(path.join(DEPLOY, "index.html"), "utf8").includes('rel="manifest"') && fs.readFileSync(path.join(DEPLOY, "index.html"), "utf8").includes("serviceWorker"));

console.log(results.join("\n"));
console.log("\nTotal:", results.length, "| Fails:", results.filter(r => r.startsWith("FAIL")).length);
