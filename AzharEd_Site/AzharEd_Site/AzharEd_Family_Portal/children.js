/* ============================================================
   AzharEd Family — the children list.
   ADD A CHILD: copy the block between the { } below (including
   both braces), paste it after the last one, add a comma between
   blocks, and change the details. Save, then refresh the page.

   Only "name" and "cls" are required — everything else gets
   sensible demo defaults if you leave it out.
   cls must be one of: Playgroup, Nursery, Prep
   av = any emoji · col = card colour (leave as is if unsure)
   ============================================================ */
window.FAMILY_KIDS = [
  {
    name: "Ahmed Ali", cls: "Nursery", roll: 12, av: "🦁", col: "#FDE8E3",
    father: "Mr. Ali Raza",
    att: { present: 58, total: 62 },
    fee: { monthly: 4500, paid: true, history: [["July","paid"],["June","paid"],["May","paid"]] },
    marks: [["English",100,82],["Urdu",100,75],["Counting",100,88],["General Knowledge",50,41],["Rhymes & Drawing",50,45]],
    skills: [["Listens attentively","Very Good"],["Follows instructions","Good"],["Pencil control","Very Good"],["Sharing & social skills","Excellent"]],
    remarks: "A cheerful and hardworking child. Ahmed takes part enthusiastically — a little more Urdu writing practice at home will help."
  },
  {
    name: "Zoya Khan", cls: "Prep", roll: 7, av: "🦋", col: "#E5EFFB",
    father: "Mr. Imran Khan",
    att: { present: 60, total: 62 },
    fee: { monthly: 5000, paid: false, due: 2500, history: [["July","Rs 2,500 due"],["June","paid"],["May","paid"]] },
    marks: [["English",100,91],["Urdu",100,84],["Counting",100,95],["General Knowledge",50,46],["Rhymes & Drawing",50,44]],
    skills: [["Listens attentively","Excellent"],["Follows instructions","Excellent"],["Pencil control","Very Good"],["Sharing & social skills","Very Good"]],
    remarks: "Zoya is a star of the class — confident, kind and always ready first. Keep up the daily reading habit!"
  },
  {
    name: "Bilal Aslam", cls: "Playgroup", roll: 3, av: "🐼", col: "#E7F5EC",
    father: "Mr. Aslam Butt",
    att: { present: 55, total: 62 },
    fee: { monthly: 4000, paid: true, history: [["July","paid"],["June","paid"],["May","paid"]] },
    marks: [["English",50,38],["Urdu",50,35],["Counting",50,42]],
    skills: [["Settling into class","Very Good"],["Joining rhymes & play","Excellent"],["Holding crayon","Good"]],
    remarks: "Bilal has settled in beautifully and loves story time. We are practising counting to five."
  }

  /* ── TEMPLATE — copy from the next line down, paste above (after a comma) ──
  ,{
    name: "New Child", cls: "Nursery", av: "🐯",
    father: "Mr. Guardian Name"
  }
  ─────────────────────────────────────────────────────────── */
];
