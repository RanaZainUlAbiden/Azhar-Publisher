const { useState, useMemo, useEffect, useRef } = React;
const C = window.AZHAR_CONTENT || { books: [] };
const LVL_LABEL = { One: "Class 1", Two: "Class 2", Three: "Class 3", Four: "Class 4", Five: "Class 5" };
const ALL_BOOKS = C.books;
let BOOKS = ALL_BOOKS;
function applyAdoption(ids) {
  BOOKS = ids && ids.length ? ALL_BOOKS.filter((b) => ids.indexOf(b.id) >= 0) : ALL_BOOKS;
}
const BASE = "../AzharEd_Deploy/";
const LOGO_AZHAR = BASE + "assets/azhar_logo.png";
const LOGO_BF = BASE + "assets/bookfactory_logo.png";
const NS = "azhared2:";
const LS = {
  get(k, d) {
    try {
      const v = localStorage.getItem(NS + k);
      return v == null ? d : JSON.parse(v);
    } catch (e) {
      return d;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem(NS + k, JSON.stringify(v));
    } catch (e) {
    }
  },
  del(k) {
    try {
      localStorage.removeItem(NS + k);
    } catch (e) {
    }
  },
  keys() {
    try {
      return Object.keys(localStorage).filter((k) => k.indexOf(NS) === 0).map((k) => k.slice(NS.length));
    } catch (e) {
      return [];
    }
  }
};
function useLS(key, init) {
  const [v, setV] = useState(() => LS.get(key, init));
  useEffect(() => {
    LS.set(key, v);
  }, [key, v]);
  return [v, setV];
}
let toast = () => {
};
function Toasts() {
  const [list, setList] = useState([]);
  useEffect(() => {
    toast = (msg, icon = "\u2705") => {
      const id = Date.now() + Math.random();
      setList((l) => [...l.slice(-2), { id, msg, icon }]);
      setTimeout(() => setList((l) => l.filter((t2) => t2.id !== id)), 2600);
    };
    return () => {
      toast = () => {
      };
    };
  }, []);
  return /* @__PURE__ */ React.createElement("div", { className: "toasts" }, list.map((t2) => /* @__PURE__ */ React.createElement("div", { key: t2.id, className: "toast" }, t2.icon, " ", t2.msg)));
}
function recordOpen(entry) {
  const list = LS.get("recent", []);
  LS.set("recent", [{ ...entry, at: Date.now() }, ...list.filter((x) => x.path !== entry.path)].slice(0, 12));
}
function markViewed(bookId, path) {
  const v = LS.get("viewed", {});
  const set = new Set(v[bookId] || []);
  set.add(path);
  v[bookId] = [...set];
  LS.set("viewed", v);
}
const isViewed = (viewed, bookId, path) => (viewed[bookId] || []).indexOf(path) >= 0;
const openFile = (p, meta) => {
  if (!p) return;
  if (meta) {
    recordOpen({ path: p, ...meta });
    if (meta.bookId) markViewed(meta.bookId, p);
  }
  window.open(encodeURI(BASE + p), "_blank");
};
const initials = (n) => n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
const SERIES_COLOR = { GoldCrest: ["#0f3460", "#1a4a8a"], Panda: ["#b23048", "#e94560"] };
const seriesGrad = (s) => `linear-gradient(135deg,${(SERIES_COLOR[s] || ["#0f3460", "#1a4a8a"]).join(",")})`;
const todayISO = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
const niceDate = (iso) => (/* @__PURE__ */ new Date(iso + "T12:00")).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const rupee = (n) => "Rs " + Number(n || 0).toLocaleString("en-PK");
const timeAgo = (t2) => {
  const m = Math.round((Date.now() - t2) / 6e4);
  if (m < 1) return "just now";
  if (m < 60) return m + " min ago";
  const h = Math.round(m / 60);
  if (h < 24) return h + "h ago";
  return Math.round(h / 24) + "d ago";
};
function Ring({ pct, size = 46, stroke = 5, color = "var(--green)", label }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, p = Math.max(0, Math.min(100, Math.round(pct || 0)));
  return /* @__PURE__ */ React.createElement("div", { className: "ringwrap", style: { width: size, height: size }, title: p + "%" }, /* @__PURE__ */ React.createElement("svg", { width: size, height: size }, /* @__PURE__ */ React.createElement("circle", { cx: size / 2, cy: size / 2, r, fill: "none", stroke: "var(--border)", strokeWidth: stroke }), /* @__PURE__ */ React.createElement(
    "circle",
    {
      cx: size / 2,
      cy: size / 2,
      r,
      fill: "none",
      stroke: color,
      strokeWidth: stroke,
      strokeLinecap: "round",
      strokeDasharray: c,
      strokeDashoffset: c * (1 - p / 100),
      transform: `rotate(-90 ${size / 2} ${size / 2})`,
      style: { transition: "stroke-dashoffset .4s" }
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "ring-lbl", style: { fontSize: Math.max(8, Math.round(size * 0.22)) } }, label != null ? label : p + "%"));
}
function Avatar({ photo, name, size = 30, bg }) {
  return photo ? /* @__PURE__ */ React.createElement("img", { className: "av-sm", style: { width: size, height: size }, src: photo, alt: name || "" }) : /* @__PURE__ */ React.createElement("div", { className: "avatar", style: { width: size, height: size, fontSize: Math.round(size * 0.37), background: bg || "#5b7bb5" } }, initials(name || "?"));
}
function pickPhoto(cb) {
  const inp = document.createElement("input");
  inp.type = "file";
  inp.accept = "image/*";
  inp.onchange = () => {
    const f = inp.files[0];
    if (!f) return;
    const img = new Image();
    img.onload = () => {
      try {
        const S = 128, cv = document.createElement("canvas");
        cv.width = S;
        cv.height = S;
        const ctx = cv.getContext("2d"), m = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, S, S);
        cb(cv.toDataURL("image/jpeg", 0.72));
      } catch (e) {
        toast("Couldn't process that image", "\u26A0\uFE0F");
      }
    };
    img.onerror = () => toast("Couldn't read that image", "\u26A0\uFE0F");
    img.src = URL.createObjectURL(f);
  };
  inp.click();
}
function storageBytes() {
  let b = 0;
  LS.keys().forEach((k) => {
    b += ((localStorage.getItem(NS + k) || "").length + k.length + 9) * 2;
  });
  return b;
}
const UR = {
  "Dashboard": "\u0688\u06CC\u0634 \u0628\u0648\u0631\u0688",
  "Book Library": "\u06A9\u062A\u0628 \u062E\u0627\u0646\u06C1",
  "Teacher Training": "\u0627\u0633\u0627\u062A\u0630\u06C1 \u06A9\u06CC \u062A\u0631\u0628\u06CC\u062A",
  "Class Gradebook": "\u06A9\u0644\u0627\u0633 \u06AF\u0631\u06CC\u0688 \u0628\u06A9",
  "Report Cards": "\u0631\u067E\u0648\u0631\u0679 \u06A9\u0627\u0631\u0688\u0632",
  "School Management": "\u0627\u0633\u06A9\u0648\u0644 \u0627\u0646\u062A\u0638\u0627\u0645\u06CC\u06C1",
  "Profile & Settings": "\u067E\u0631\u0648\u0641\u0627\u0626\u0644 \u0627\u0648\u0631 \u062A\u0631\u062A\u06CC\u0628\u0627\u062A",
  "Paper Generator": "\u067E\u0631\u0686\u06C1 \u0633\u0627\u0632",
  "Lesson Planner": "\u06C1\u0641\u062A\u06C1 \u0648\u0627\u0631 \u0645\u0646\u0635\u0648\u0628\u06C1",
  "Homework Diary": "\u06C1\u0648\u0645 \u0648\u0631\u06A9 \u0688\u0627\u0626\u0631\u06CC",
  "Certificates": "\u0627\u0633\u0646\u0627\u062F",
  "Main": "\u0645\u0631\u06A9\u0632\u06CC",
  "Teaching": "\u062A\u062F\u0631\u06CC\u0633",
  "Administration": "\u0627\u0646\u062A\u0638\u0627\u0645\u06CC\u06C1",
  "Account": "\u0627\u06A9\u0627\u0624\u0646\u0679",
  "Sign out": "\u0644\u0627\u06AF \u0622\u0624\u0679",
  "Overview": "\u062C\u0627\u0626\u0632\u06C1",
  "Students": "\u0637\u0644\u0628\u06C1",
  "Staff": "\u0639\u0645\u0644\u06C1",
  "Fees": "\u0641\u06CC\u0633\u06CC\u06BA",
  "Student Attendance": "\u0637\u0644\u0628\u06C1 \u06A9\u06CC \u062D\u0627\u0636\u0631\u06CC",
  "Staff Attendance": "\u0639\u0645\u0644\u06D2 \u06A9\u06CC \u062D\u0627\u0636\u0631\u06CC",
  "Timetable": "\u0679\u0627\u0626\u0645 \u0679\u06CC\u0628\u0644",
  "Notices": "\u0627\u0639\u0644\u0627\u0646\u0627\u062A",
  "Reports": "\u0631\u067E\u0648\u0631\u0679\u0633",
  "Interactive books": "\u0627\u0646\u0679\u0631\u0627\u06CC\u06A9\u0679\u0648 \u06A9\u062A\u0627\u0628\u06CC\u06BA",
  "Exam papers": "\u0627\u0645\u062A\u062D\u0627\u0646\u06CC \u067E\u0631\u0686\u06D2",
  "Resources opened": "\u06A9\u06BE\u0648\u0644\u06D2 \u06AF\u0626\u06D2 \u0648\u0633\u0627\u0626\u0644",
  "Favourite books": "\u067E\u0633\u0646\u062F\u06CC\u062F\u06C1 \u06A9\u062A\u0627\u0628\u06CC\u06BA",
  "Quick actions": "\u0641\u0648\u0631\u06CC \u0627\u0642\u062F\u0627\u0645\u0627\u062A",
  "Continue where you left off": "\u062C\u06C1\u0627\u06BA \u0686\u06BE\u0648\u0691\u0627 \u062A\u06BE\u0627 \u0648\u06C1\u06CC\u06BA \u0633\u06D2 \u062C\u0627\u0631\u06CC \u0631\u06A9\u06BE\u06CC\u06BA",
  "Your favourite books": "\u0622\u067E \u06A9\u06CC \u067E\u0633\u0646\u062F\u06CC\u062F\u06C1 \u06A9\u062A\u0627\u0628\u06CC\u06BA",
  "Latest notices": "\u062A\u0627\u0632\u06C1 \u0627\u0639\u0644\u0627\u0646\u0627\u062A",
  "Search books, papers\u2026": "\u06A9\u062A\u0627\u0628\u06CC\u06BA \u0627\u0648\u0631 \u067E\u0631\u0686\u06D2 \u062A\u0644\u0627\u0634 \u06A9\u0631\u06CC\u06BA\u2026",
  "teacher": "\u0627\u0633\u062A\u0627\u062F",
  "admin": "\u0645\u0646\u062A\u0638\u0645"
};
let LANGV = "en";
const t = (s) => LANGV === "ur" && UR[s] || s;
function downloadFile(name, content, type) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content], { type }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4e3);
}
function downloadCSV(name, rows) {
  const csv = rows.map((r) => r.map((x) => {
    x = String(x == null ? "" : x);
    return /[",\n]/.test(x) ? '"' + x.replace(/"/g, '""') + '"' : x;
  }).join(",")).join("\n");
  downloadFile(name, "\uFEFF" + csv, "text/csv;charset=utf-8");
  toast("CSV downloaded", "\u{1F4E5}");
}
function exportBackup() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (/^(azhared2:|azharedone:|azharedfam:|maktab:)/.test(k)) data[k] = localStorage.getItem(k);
  }
  downloadFile("MAKTAB_school_backup_" + todayISO() + ".json", JSON.stringify({ app: "AzharEd", version: 3, exported: (/* @__PURE__ */ new Date()).toISOString(), data }, null, 1), "application/json");
  try {
    localStorage.setItem("azhared2:lastBackup", JSON.stringify(Date.now()));
  } catch (e) {
  }
  toast("Backup downloaded \u2014 keep it somewhere safe (Drive, USB, email)", "\u{1F4BE}");
}
function importBackup(file, done) {
  const r = new FileReader();
  r.onload = () => {
    try {
      const obj = JSON.parse(r.result);
      if (!obj || obj.app !== "AzharEd" || !obj.data) throw new Error("bad");
      Object.keys(obj.data).forEach((k) => {
        if (obj.version >= 3) localStorage.setItem(k, obj.data[k]);
        else LS.set(k, obj.data[k]);
      });
      done(true);
    } catch (e) {
      done(false);
    }
  };
  r.readAsText(file);
}
function waLink(phone, msg) {
  let digits = String(phone || "").replace(/[^0-9]/g, "");
  if (!digits) return null;
  if (digits.indexOf("0") === 0) digits = "92" + digits.slice(1);
  return "https://wa.me/" + digits + "?text=" + encodeURIComponent(msg);
}
function printHTML(title, bodyHTML) {
  const w = window.open("", "_blank", "width=760,height=900");
  if (!w) return;
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
  <style>body{font-family:-apple-system,Segoe UI,Arial,sans-serif;color:#17203a;padding:28px;max-width:720px;margin:0 auto}
  h1{font-size:20px;color:#0f3460;margin-bottom:2px}
  .sub{color:#888;font-size:12px;margin-bottom:18px}
  table{width:100%;border-collapse:collapse;font-size:12.5px}
  th,td{border:1px solid #ccd3e0;padding:7px 9px;text-align:left}
  th{background:#0f3460;color:#fff}
  tr:nth-child(even){background:#f6f8fc}
  .btn{display:block;width:100%;padding:11px;background:#0f3460;color:#fff;border:none;border-radius:9px;font-size:14px;font-weight:700;margin-top:20px;cursor:pointer}
  .f{text-align:center;font-size:10.5px;color:#aab;margin-top:16px}
  @media print{.btn{display:none}}</style></head><body>
  ${bodyHTML}
  <div class="f">Generated by AzharEd \xB7 Azhar Publishers \xB7 ${niceDate(todayISO())}</div>
  <button class="btn" onclick="window.print()">Print / Save as PDF</button>
  </body></html>`);
  w.document.close();
}
const SEARCH_INDEX = (() => {
  const ix = [];
  BOOKS.forEach((b) => {
    ix.push({ type: "book", icon: b.icon, label: b.title + " \xB7 " + b.level, sub: b.series + " Series \xB7 open book page", book: b });
    if (b.flipbook) ix.push({ type: "flipbook", icon: "\u{1F4D6}", label: b.title + " Flipbook \xB7 " + b.level, sub: "Digital flipbook", path: b.flipbook, book: b });
    if (b.interactive) ix.push({ type: "interactive", icon: "\u{1F3AF}", label: b.title + " Interactive \xB7 " + b.level, sub: "Interactive lesson", path: b.interactive, book: b });
    if (b.deckPdf || b.deck) ix.push({ type: "deck", icon: "\u{1F5A5}\uFE0F", label: b.title + " Teaching Slides \xB7 " + b.level, sub: "Projectable deck", path: b.deckPdf || b.deck, book: b });
    (b.papers || []).forEach((p) => ix.push({ type: "paper", icon: "\u{1F4C4}", label: p.label + " \u2014 " + b.title + " (" + b.level + ")", sub: "Exam paper", path: p.path, book: b }));
  });
  return ix;
})();
const PAGE_LINKS = [
  ["dashboard", "\u{1F3E0}", "Dashboard"],
  ["library", "\u{1F4DA}", "Book Library"],
  ["training", "\u{1F393}", "Teacher Training"],
  ["gradebook", "\u{1F4CA}", "Class Gradebook"],
  ["reportcards", "\u{1F9FE}", "Report Cards"],
  ["admin", "\u{1F3EB}", "School Management"],
  ["profile", "\u{1F464}", "Profile & Settings"]
];
function SearchModal({ onClose, onOpenBook, go }) {
  const [q, setQ] = useState("");
  const inpRef = useRef(null);
  useEffect(() => {
    inpRef.current && inpRef.current.focus();
  }, []);
  const ql = q.toLowerCase().trim();
  const results = useMemo(() => {
    if (!ql) return [];
    const toks = ql.split(/\s+/);
    const pages = PAGE_LINKS.filter(([id, ic, l]) => toks.every((t2) => l.toLowerCase().includes(t2))).map(([id, ic, l]) => ({ type: "page", icon: ic, label: l, sub: "Go to page", page: id }));
    const items = SEARCH_INDEX.filter((it) => {
      const hay = (it.label + " " + it.sub + " " + (it.book ? it.book.series + " " + it.book.subject : "")).toLowerCase();
      return toks.every((t2) => hay.includes(t2));
    });
    return [...pages, ...items].slice(0, 14);
  }, [ql]);
  const pick = (it) => {
    onClose();
    if (it.type === "page") go(it.page);
    else if (it.type === "book") onOpenBook(it.book);
    else openFile(it.path, { type: it.type, bookId: it.book.id, label: it.label, icon: it.icon });
  };
  return /* @__PURE__ */ React.createElement("div", { className: "cmdk", onClick: onClose }, /* @__PURE__ */ React.createElement("div", { className: "cmdk-box", onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement("div", { className: "cmdk-inp" }, "\u{1F50D}", /* @__PURE__ */ React.createElement("input", { ref: inpRef, value: q, placeholder: "Search books, papers, flipbooks, pages\u2026", onChange: (e) => setQ(e.target.value), onKeyDown: (e) => {
    if (e.key === "Escape") onClose();
    if (e.key === "Enter" && results[0]) pick(results[0]);
  } })), /* @__PURE__ */ React.createElement("div", { className: "cmdk-list" }, !ql && /* @__PURE__ */ React.createElement("div", { className: "cmdk-empty" }, "Type to search all ", BOOKS.length, " books, ", SEARCH_INDEX.filter((i) => i.type === "paper").length, " exam papers and every page.", /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11.5 } }, "Tip: try \u201Cpanda urdu\u201D, \u201Cmonthly test prep\u201D or \u201Cgradebook\u201D.")), ql && results.length === 0 && /* @__PURE__ */ React.createElement("div", { className: "cmdk-empty" }, "No matches for \u201C", q, "\u201D."), results.map((it, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "cmdk-item" + (i === 0 ? " hl" : ""), onClick: () => pick(it) }, /* @__PURE__ */ React.createElement("div", { className: "ci" }, it.icon), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "cl" }, it.label), /* @__PURE__ */ React.createElement("div", { className: "cs" }, it.sub)))))));
}
const SB = typeof window !== "undefined" && window.supabase && window.MAKTAB_DB ? window.supabase.createClient(window.MAKTAB_DB.url, window.MAKTAB_DB.key) : null;
async function cloudProfile() {
  const { data: { user } } = await SB.auth.getUser();
  if (!user) return null;
  const { data: p } = await SB.from("profiles").select("role,full_name,school_id").eq("id", user.id).single();
  return {
    id: user.id,
    email: user.email,
    name: p && p.full_name || user.email.split("@")[0],
    role: p && p.role || "teacher",
    school_id: p && p.school_id,
    cloud: true
  };
}
async function cloudPullGradebook() {
  if (!SB) return false;
  try {
    const { data, error } = await SB.from("gradebook").select("cls,sec,term,subjects,rows");
    if (error || !data) return false;
    const gb = LS.get("gradebook", {});
    data.forEach((r) => {
      gb[r.cls + " " + r.sec + "|" + r.term] = { subjects: r.subjects || [], rows: r.rows || [] };
    });
    LS.set("gradebook", gb);
    return true;
  } catch (e) {
    return false;
  }
}
let _gbPushT = null;
function cloudPushGradebook(key, sheet, user) {
  if (!SB || !user || !user.cloud || !user.school_id) return;
  clearTimeout(_gbPushT);
  _gbPushT = setTimeout(async () => {
    try {
      const [cs, term] = key.split("|");
      const parts = cs.split(" ");
      const sec = parts.pop();
      const cls = parts.join(" ");
      const { error } = await SB.from("gradebook").upsert(
        { school_id: user.school_id, cls, sec, term, subjects: sheet.subjects, rows: sheet.rows, updated_at: (/* @__PURE__ */ new Date()).toISOString() },
        { onConflict: "school_id,cls,sec,term" }
      );
      window.__gbSync = error ? "error" : "ok";
    } catch (e) {
      window.__gbSync = "error";
    }
  }, 800);
}
const CLOUD = { user: null };
const _debounce = (fn, ms) => {
  let t2;
  return (...a) => {
    clearTimeout(t2);
    t2 = setTimeout(() => fn(...a), ms);
  };
};
async function cloudPullAll() {
  if (!SB) return null;
  try {
    const out = {};
    const { data: stu } = await SB.from("students").select("*").eq("archived", false);
    const { data: fees } = await SB.from("fees").select("student_id,month,amount,paid_on");
    const since = new Date(Date.now() - 70 * 864e5).toISOString().slice(0, 10);
    const { data: att } = await SB.from("attendance").select("student_id,day,status").gte("day", since);
    const { data: stf } = await SB.from("staff").select("*").eq("archived", false);
    const { data: adopt } = await SB.from("school_books").select("book_id");
    out.adopted = (adopt || []).map((r) => r.book_id);
    if (stu && stu.length) {
      const local = LS.get("sms:students", []);
      const byCid = {};
      local.forEach((x) => {
        if (x.cid) byCid[x.cid] = x;
      });
      const month = (/* @__PURE__ */ new Date()).toISOString().slice(0, 7);
      out.students = stu.map((r, i) => {
        const prev = byCid[r.id] || {};
        const paid = (fees || []).filter((f) => f.student_id === r.id && f.month === month).reduce((a, f) => a + Number(f.amount), 0);
        return {
          id: prev.id || "c" + r.id.slice(0, 8),
          cid: r.id,
          name: r.name,
          cls: r.cls,
          sec: r.sec,
          roll: prev.roll || i + 1,
          guardian: r.guardian || "",
          phone: r.phone || "",
          fee: Number(r.monthly_fee) || 0,
          paid,
          photo: r.photo || prev.photo
        };
      });
      LS.set("sms:students", out.students);
      if (att && att.length) {
        const cid2id = {};
        out.students.forEach((x) => cid2id[x.cid] = x.id);
        const A = LS.get("sms:stuAtt", {});
        att.forEach((r) => {
          const lid = cid2id[r.student_id];
          if (!lid) return;
          (A[r.day] = A[r.day] || {})[lid] = r.status;
        });
        LS.set("sms:stuAtt", A);
      }
      if (fees && fees.length) {
        const cid2s = {};
        out.students.forEach((x) => cid2s[x.cid] = x);
        LS.set("sms:payments", fees.map((f, i) => ({ id: "f" + i, student: (cid2s[f.student_id] || {}).name || "?", cls: (cid2s[f.student_id] || {}).cls || "", amount: Number(f.amount), method: "\u2014", date: f.paid_on, cloud: true })));
      }
    }
    if (stf && stf.length) {
      const localS = LS.get("sms:staff", []);
      const byCid = {};
      localS.forEach((x) => {
        if (x.cid) byCid[x.cid] = x;
      });
      LS.set("sms:staff", stf.map((r) => {
        const prev = byCid[r.id] || {};
        return { id: prev.id || "c" + r.id.slice(0, 8), cid: r.id, name: r.name, role: r.role || "Teacher", subject: prev.subject || "", phone: r.phone || "", salary: Number(r.salary) || 0 };
      }));
    }
    return out;
  } catch (e) {
    return null;
  }
}
const cloudPushStudents = _debounce(async (list) => {
  const u = CLOUD.user;
  if (!SB || !u || !u.cloud || !u.school_id) return;
  try {
    const fresh = list.filter((x) => !x.cid);
    if (fresh.length) {
      const { data } = await SB.from("students").insert(fresh.map((x) => ({ school_id: u.school_id, name: x.name, cls: x.cls, sec: x.sec, guardian: x.guardian || "", phone: x.phone || "", monthly_fee: x.fee || 0, photo: x.photo || null }))).select("id");
      if (data && data.length === fresh.length) {
        const all = LS.get("sms:students", []);
        fresh.forEach((x, i) => {
          const t2 = all.find((y) => y.id === x.id);
          if (t2) t2.cid = data[i].id;
        });
        LS.set("sms:students", all);
      }
    }
    const olds = list.filter((x) => x.cid);
    if (olds.length) await SB.from("students").upsert(olds.map((x) => ({ id: x.cid, school_id: u.school_id, name: x.name, cls: x.cls, sec: x.sec, guardian: x.guardian || "", phone: x.phone || "", monthly_fee: x.fee || 0, photo: x.photo || null, archived: false })));
    const keep = new Set(list.map((x) => x.cid).filter(Boolean));
    const { data: allCloud } = await SB.from("students").select("id").eq("archived", false);
    const gone = (allCloud || []).map((r) => r.id).filter((id) => !keep.has(id));
    if (gone.length) await SB.from("students").update({ archived: true }).in("id", gone);
  } catch (e) {
  }
}, 1500);
const cloudPushStaff = _debounce(async (list) => {
  const u = CLOUD.user;
  if (!SB || !u || !u.cloud || !u.school_id) return;
  try {
    const fresh = list.filter((x) => !x.cid);
    if (fresh.length) {
      const { data } = await SB.from("staff").insert(fresh.map((x) => ({ school_id: u.school_id, name: x.name, role: x.role || "Teacher", phone: x.phone || "", salary: x.salary || 0 }))).select("id");
      if (data && data.length === fresh.length) {
        const all = LS.get("sms:staff", []);
        fresh.forEach((x, i) => {
          const t2 = all.find((y) => y.id === x.id);
          if (t2) t2.cid = data[i].id;
        });
        LS.set("sms:staff", all);
      }
    }
    const olds = list.filter((x) => x.cid);
    if (olds.length) await SB.from("staff").upsert(olds.map((x) => ({ id: x.cid, school_id: u.school_id, name: x.name, role: x.role || "Teacher", phone: x.phone || "", salary: x.salary || 0, archived: false })));
  } catch (e) {
  }
}, 1500);
const cloudPushAttendance = _debounce(async (attAll) => {
  const u = CLOUD.user;
  if (!SB || !u || !u.cloud || !u.school_id) return;
  try {
    const students = LS.get("sms:students", []);
    const id2cid = {};
    students.forEach((x) => {
      if (x.cid) id2cid[x.id] = x.cid;
    });
    const days = Object.keys(attAll).sort().slice(-7);
    const rows = [];
    days.forEach((day) => Object.entries(attAll[day] || {}).forEach(([lid, st]) => {
      const cid = id2cid[lid];
      if (cid && ["P", "A", "L"].indexOf(st) >= 0) rows.push({ school_id: u.school_id, student_id: cid, day, status: st });
    }));
    if (rows.length) await SB.from("attendance").upsert(rows, { onConflict: "student_id,day" });
  } catch (e) {
  }
}, 1500);
async function cloudPushPayment(studentLocalId, amount) {
  const u = CLOUD.user;
  if (!SB || !u || !u.cloud || !u.school_id) return;
  try {
    const x = LS.get("sms:students", []).find((y) => String(y.id) === String(studentLocalId));
    if (!x || !x.cid) return;
    await SB.from("fees").insert({ school_id: u.school_id, student_id: x.cid, month: (/* @__PURE__ */ new Date()).toISOString().slice(0, 7), amount });
  } catch (e) {
  }
}
async function cloudLinkParent(student, email) {
  if (!SB || !student.cid) return "This student hasn't synced to the cloud yet \u2014 open this page while online and try again.";
  const { data: prof, error } = await SB.from("profiles").select("id,role").eq("email", email.toLowerCase().trim()).maybeSingle();
  if (error) return "Lookup failed: " + error.message;
  if (!prof) return "No account with that email. Ask the parent to create one on the Family portal first.";
  if (prof.role !== "parent") return "That account is a " + prof.role + " account, not a parent account.";
  const { error: e2 } = await SB.from("parent_children").upsert({ parent_id: prof.id, student_id: student.cid });
  return e2 ? "Link failed: " + e2.message : null;
}
const USERS = [
  { id: 1, email: "teacher@maktabedtech.com", password: "teacher@786", name: "Mrs. Aisha Khan", role: "teacher", school: "Azhar Model School" },
  { id: 2, email: "admin@maktabedtech.com", password: "admin@786", name: "Mr. Khalid", role: "admin", school: "Azhar Model School" }
];
function Auth({ onLogin }) {
  const [email, setEmail] = useState(""), [pw, setPw] = useState(""), [err, setErr] = useState(""), [busy, setBusy] = useState(false);
  const submit = async () => {
    const em = email.toLowerCase().trim();
    const demo = USERS.find((x) => x.email === em && x.password === pw);
    if (demo) {
      onLogin(demo);
      return;
    }
    if (SB) {
      setBusy(true);
      setErr("");
      const { error } = await SB.auth.signInWithPassword({ email: em, password: pw });
      if (error) {
        setBusy(false);
        setErr("Sign-in failed: " + error.message);
        return;
      }
      const prof = await cloudProfile();
      setBusy(false);
      if (prof && prof.role === "parent") {
        await SB.auth.signOut();
        setErr("This is a parent account \u2014 please sign in on the Maktab Family portal instead.");
        return;
      }
      if (prof) onLogin(prof);
      else setErr("Signed in, but no profile found \u2014 ask your admin.");
    } else setErr("Invalid email or password.");
  };
  return /* @__PURE__ */ React.createElement("div", { className: "auth-wrap" }, /* @__PURE__ */ React.createElement("div", { className: "auth-left" }, /* @__PURE__ */ React.createElement("div", { className: "auth-brand" }, /* @__PURE__ */ React.createElement("div", { className: "logo-bar" }, /* @__PURE__ */ React.createElement("img", { src: LOGO_AZHAR, alt: "Azhar Publishers" }), /* @__PURE__ */ React.createElement("div", { className: "divider" }), /* @__PURE__ */ React.createElement("img", { src: LOGO_BF, alt: "Book Factory" })), /* @__PURE__ */ React.createElement("div", { className: "mark" }, "MAKTA", /* @__PURE__ */ React.createElement("span", null, "B")), /* @__PURE__ */ React.createElement("h1", null, "The teaching platform for Azhar Publishers schools"), /* @__PURE__ */ React.createElement("p", null, "Your GoldCrest & Panda early-years books \u2014 flipbooks, interactive lessons, teaching slides and exam papers \u2014 in one place for every teacher."), /* @__PURE__ */ React.createElement("div", { className: "auth-feat" }, /* @__PURE__ */ React.createElement("div", { className: "fi" }, "\u{1F4DA}"), BOOKS.length, " interactive books \xB7 ", BOOKS.reduce((a, b) => a + b.paperCount, 0), " exam papers"), /* @__PURE__ */ React.createElement("div", { className: "auth-feat" }, /* @__PURE__ */ React.createElement("div", { className: "fi" }, "\u{1F50D}"), "Instant search across every book and paper"), /* @__PURE__ */ React.createElement("div", { className: "auth-feat" }, /* @__PURE__ */ React.createElement("div", { className: "fi" }, "\u{1F4CA}"), "Gradebook, report cards, fees & attendance \u2014 saved on this device"), /* @__PURE__ */ React.createElement("div", { className: "auth-feat" }, /* @__PURE__ */ React.createElement("div", { className: "fi" }, "\u{1F319}"), "Works on mobile, tablet and whiteboard \xB7 light & dark mode"))), /* @__PURE__ */ React.createElement("div", { className: "auth-right" }, /* @__PURE__ */ React.createElement("div", { className: "auth-card" }, /* @__PURE__ */ React.createElement("h2", null, "MAKTA", /* @__PURE__ */ React.createElement("span", null, "B")), /* @__PURE__ */ React.createElement("div", { className: "sub" }, "Teacher & School Portal"), err && /* @__PURE__ */ React.createElement("div", { className: "err" }, err), /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", null, "Email"), /* @__PURE__ */ React.createElement("input", { value: email, onChange: (e) => setEmail(e.target.value), onKeyDown: (e) => e.key === "Enter" && submit(), placeholder: "you@azhar.edu" })), /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", null, "Password"), /* @__PURE__ */ React.createElement("input", { type: "password", value: pw, onChange: (e) => setPw(e.target.value), onKeyDown: (e) => e.key === "Enter" && submit(), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" })), /* @__PURE__ */ React.createElement("button", { className: "btn-primary", onClick: submit, disabled: busy }, busy ? "Signing in\u2026" : "Sign In"),/* @__PURE__ */ React.createElement("p", { style: { fontSize: 11.5, marginTop: 10, color: "var(--muted)", fontWeight: 700 } }, SB ? "\u{1F512} Connected to MAKTAB cloud \u2014 school accounts sign in here" : "\u26A1 Offline mode"))));
}
function FocusMode({ book, onClose }) {
  const [mins, setMins] = useState(() => LS.get("fxmin", 20));
  const [left, setLeft] = useState(mins * 60);
  const [run, setRun] = useState(false);
  const [quiz, setQuiz] = useState(null);
  useEffect(() => {
    if (!run) return;
    const t2 = setInterval(() => setLeft((l) => {
      if (l <= 1) {
        setRun(false);
        toast("\u23F0 Time's up \u2014 shabash class!", "\u{1F389}");
        return 0;
      }
      return l - 1;
    }), 1e3);
    return () => clearInterval(t2);
  }, [run]);
  const total = mins * 60;
  const setM = (m) => {
    setMins(m);
    setLeft(m * 60);
    setRun(false);
    LS.set("fxmin", m);
  };
  const fmt = (s) => Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
  const r = 52, c = 2 * Math.PI * r, p = total ? left / total : 0;
  const bank = (window.AZHAR_QBANK || {})[book.id];
  const mcq = bank ? bank.items.filter((q) => q.k === "mcq" && q.options.length <= 4) : [];
  const startQuiz = () => {
    const used = {}, qs = [];
    while (qs.length < 3 && qs.length < mcq.length) {
      const q = mcq[Math.floor(Math.random() * mcq.length)];
      if (!used[q.text]) {
        used[q.text] = 1;
        qs.push(q);
      }
    }
    setQuiz({ qs, i: 0, right: 0, picked: null });
  };
  const pick = (oi) => {
    if (quiz.picked != null) return;
    const q = quiz.qs[quiz.i], correct = q.options[oi] === q.answer;
    setQuiz({ ...quiz, picked: oi, right: quiz.right + (correct ? 1 : 0) });
    setTimeout(() => setQuiz((z) => z ? { ...z, i: z.i + 1, picked: null } : z), 1100);
  };
  const open = (p2, type, icon, label) => openFile(p2, { type, bookId: book.id, icon, label });
  return /* @__PURE__ */ React.createElement("div", { className: "fx2" }, /* @__PURE__ */ React.createElement("button", { className: "fx2-exit", onClick: onClose }, "\u2715 \xA0Exit stage"), /* @__PURE__ */ React.createElement("div", { className: "kick2" }, book.series, " SERIES \xB7 ", /* @__PURE__ */ React.createElement("b", null, book.level.toUpperCase()), " \xB7 FOCUS MODE"), /* @__PURE__ */ React.createElement("h2", null, book.title), /* @__PURE__ */ React.createElement("div", { className: "fx2-acts" }, /* @__PURE__ */ React.createElement("button", { className: "fxa2", disabled: !book.flipbook, onClick: () => open(book.flipbook, "flipbook", "\u{1F4D6}", book.title + " Flipbook \xB7 " + book.level) }, /* @__PURE__ */ React.createElement("span", { className: "i" }, "\u{1F4D6}"), "Flipbook", /* @__PURE__ */ React.createElement("small", null, "read together")), /* @__PURE__ */ React.createElement("button", { className: "fxa2", disabled: !book.interactive, onClick: () => open(book.interactive, "interactive", "\u{1F3AF}", book.title + " Interactive \xB7 " + book.level) }, /* @__PURE__ */ React.createElement("span", { className: "i" }, "\u{1F3AF}"), "Interactive", /* @__PURE__ */ React.createElement("small", null, "play on the board")), /* @__PURE__ */ React.createElement("button", { className: "fxa2", disabled: !(book.deckPdf || book.deck), onClick: () => open(book.deckPdf || book.deck, "deck", "\u{1F5A5}\uFE0F", book.title + " Slides \xB7 " + book.level) }, /* @__PURE__ */ React.createElement("span", { className: "i" }, "\u{1F5A5}\uFE0F"), "Slides", /* @__PURE__ */ React.createElement("small", null, "teach & project")), /* @__PURE__ */ React.createElement("button", { className: "fxa2", disabled: mcq.length < 3, onClick: startQuiz }, /* @__PURE__ */ React.createElement("span", { className: "i" }, "\u26A1"), "Quick quiz", /* @__PURE__ */ React.createElement("small", null, mcq.length >= 3 ? mcq.length + " questions from its pages" : "no bank yet"))), /* @__PURE__ */ React.createElement("div", { className: "fx2-timer" }, /* @__PURE__ */ React.createElement("div", { className: "tring2" }, /* @__PURE__ */ React.createElement("svg", { width: "124", height: "124" }, /* @__PURE__ */ React.createElement("circle", { cx: "62", cy: "62", r, fill: "none", stroke: "rgba(255,255,255,.1)", strokeWidth: "9" }), /* @__PURE__ */ React.createElement(
    "circle",
    {
      cx: "62",
      cy: "62",
      r,
      fill: "none",
      stroke: left <= 60 ? "#f472b6" : "#22d3ee",
      strokeWidth: "9",
      strokeLinecap: "round",
      strokeDasharray: c,
      strokeDashoffset: c * (1 - p),
      style: { transition: "stroke-dashoffset .5s linear" }
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "tt2" }, fmt(left), /* @__PURE__ */ React.createElement("small", null, run ? "TEACHING" : "PAUSED"))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, [10, 20, 30, 40].map((m) => /* @__PURE__ */ React.createElement("button", { key: m, className: "tchip2" + (mins === m ? " on" : ""), onClick: () => setM(m) }, m, " min"))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { className: "tchip2", onClick: () => setRun((x) => !x) }, run ? "\u23F8 Pause" : "\u25B6 Start lesson"), /* @__PURE__ */ React.createElement("button", { className: "tchip2", onClick: () => {
    setRun(false);
    setLeft(total);
  } }, "\u21BA Reset")))), quiz && (quiz.i >= quiz.qs.length ? /* @__PURE__ */ React.createElement("div", { className: "qz2" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "qq2" }, quiz.right === quiz.qs.length ? "\u{1F31F} Perfect!" : "\u{1F44F} Well done!"), /* @__PURE__ */ React.createElement("div", { className: "pg2" }, quiz.right, " OUT OF ", quiz.qs.length), /* @__PURE__ */ React.createElement("button", { className: "lh-gold", onClick: startQuiz }, "\u26A1 Three more"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("button", { className: "qz2-x", onClick: () => setQuiz(null) }, "Back to the lesson")))) : /* @__PURE__ */ React.createElement("div", { className: "qz2" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "qq2" }, quiz.qs[quiz.i].text), /* @__PURE__ */ React.createElement("div", { className: "pg2" }, "QUESTION ", quiz.i + 1, " OF ", quiz.qs.length, " \xB7 PAGE ", quiz.qs[quiz.i].pg, " OF THE BOOK"), /* @__PURE__ */ React.createElement("div", null, quiz.qs[quiz.i].options.map((o, oi) => {
    const q = quiz.qs[quiz.i];
    const cls2 = quiz.picked == null ? "" : o === q.answer ? " yes" : oi === quiz.picked ? " no" : "";
    return /* @__PURE__ */ React.createElement("button", { key: oi, className: "qzo2" + cls2, onClick: () => pick(oi) }, o);
  })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("button", { className: "qz2-x", onClick: () => setQuiz(null) }, "\u2715 Close quiz"))))));
}
function LibraryHero({ onOpen, onFocus }) {
  const feats = useMemo(() => BOOKS.filter((b2) => b2.coverImg), [BOOKS.length]);
  const [i, setI] = useState(() => Math.floor(Math.random() * Math.max(feats.length, 1)));
  useEffect(() => {
    const t2 = setInterval(() => setI((x) => (x + 1) % feats.length), 7e3);
    return () => clearInterval(t2);
  }, [feats.length]);
  if (!feats.length) return null;
  const b = feats[i % feats.length];
  return /* @__PURE__ */ React.createElement("div", { className: "lib-hero" }, /* @__PURE__ */ React.createElement("div", { className: "lh-bg", style: { backgroundImage: `url("${encodeURI(BASE + b.coverImg)}")` } }), /* @__PURE__ */ React.createElement("div", { className: "lh-veil" }), /* @__PURE__ */ React.createElement("div", { className: "lh-in" }, /* @__PURE__ */ React.createElement("div", { className: "lh-cov" }, /* @__PURE__ */ React.createElement("img", { src: encodeURI(BASE + b.coverImg), alt: "" })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { className: "lh-kick" }, b.series, " SERIES \xB7 ", /* @__PURE__ */ React.createElement("b", null, b.level.toUpperCase()), " \xB7 FEATURED"), /* @__PURE__ */ React.createElement("div", { className: "lh-title" }, b.title), /* @__PURE__ */ React.createElement("div", { className: "lh-cta" }, /* @__PURE__ */ React.createElement("button", { className: "lh-gold", onClick: () => onFocus(b) }, "\u25B6 \xA0Teach this now"), /* @__PURE__ */ React.createElement("button", { className: "lh-ghost", onClick: () => onOpen(b) }, "Details")))), /* @__PURE__ */ React.createElement("div", { className: "lh-dots" }, feats.slice(0, 8).map((_, di) => /* @__PURE__ */ React.createElement("button", { key: di, className: "lh-dot" + (di === i % Math.min(feats.length, 8) ? " on" : ""), onClick: () => setI(di) }))));
}
function Dashboard({ user, go, openBook, notices }) {
  const totalPapers = BOOKS.reduce((a, b) => a + b.paperCount, 0);
  const totalResources = BOOKS.reduce((a, b) => a + b.paperCount + (b.flipbook ? 1 : 0) + (b.interactive ? 1 : 0) + (b.deckPdf || b.deck ? 1 : 0), 0);
  const recent = LS.get("recent", []);
  const favs = LS.get("favs", []);
  const viewed = LS.get("viewed", {});
  const viewedCount = Object.keys(viewed).reduce((a, k) => a + viewed[k].length, 0);
  const favBooks = BOOKS.filter((b) => favs.indexOf(b.id) >= 0);
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "page-head" }, /* @__PURE__ */ React.createElement("h2", null, "Welcome, ", user.name.split(" ").slice(-1), " \u{1F44B}"), /* @__PURE__ */ React.createElement("p", null, user.school, " \xB7 ", (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }))), /* @__PURE__ */ React.createElement("div", { className: "stats" }, /* @__PURE__ */ React.createElement("div", { className: "stat" }, /* @__PURE__ */ React.createElement("div", { className: "ic" }, "\u{1F4DA}"), /* @__PURE__ */ React.createElement("div", { className: "v" }, BOOKS.length), /* @__PURE__ */ React.createElement("div", { className: "l" }, t("Interactive books"))), /* @__PURE__ */ React.createElement("div", { className: "stat" }, /* @__PURE__ */ React.createElement("div", { className: "ic" }, "\u{1F4DD}"), /* @__PURE__ */ React.createElement("div", { className: "v" }, totalPapers), /* @__PURE__ */ React.createElement("div", { className: "l" }, t("Exam papers"))), /* @__PURE__ */ React.createElement("div", { className: "stat" }, /* @__PURE__ */ React.createElement("div", { className: "stat-flex" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "ic" }, "\u2705"), /* @__PURE__ */ React.createElement("div", { className: "v" }, viewedCount), /* @__PURE__ */ React.createElement("div", { className: "l" }, t("Resources opened"))), /* @__PURE__ */ React.createElement(Ring, { pct: totalResources ? viewedCount / totalResources * 100 : 0, size: 54 }))), /* @__PURE__ */ React.createElement("div", { className: "stat" }, /* @__PURE__ */ React.createElement("div", { className: "ic" }, "\u2B50"), /* @__PURE__ */ React.createElement("div", { className: "v" }, favBooks.length), /* @__PURE__ */ React.createElement("div", { className: "l" }, t("Favourite books")))), recent.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-flex" }, /* @__PURE__ */ React.createElement("h3", null, "\u23F1\uFE0F ", t("Continue where you left off")), /* @__PURE__ */ React.createElement("button", { className: "link-btn", onClick: () => {
    LS.del("recent");
    go("dashboard");
    toast("History cleared", "\u{1F9F9}");
  } }, "Clear history")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, recent.slice(0, 5).map((r, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "paper-row", onClick: () => openFile(r.path, { type: r.type, bookId: r.bookId, label: r.label, icon: r.icon }) }, /* @__PURE__ */ React.createElement("div", { className: "pl" }, /* @__PURE__ */ React.createElement("span", null, r.icon || "\u{1F4C4}"), r.label), /* @__PURE__ */ React.createElement("div", { className: "po" }, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--muted)", fontWeight: 600 } }, timeAgo(r.at)), " Open \u2197"))))), favBooks.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("h3", null, "\u2B50 ", t("Your favourite books")), /* @__PURE__ */ React.createElement("div", { className: "filter-bar" }, favBooks.map((b) => /* @__PURE__ */ React.createElement("span", { key: b.id, className: "fchip", style: { display: "inline-flex", gap: 6, alignItems: "center" }, onClick: () => openBook(b) }, b.icon, " ", b.title, " \xB7 ", b.level)))), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("h3", null, "\u{1F680} ", t("Quick actions")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("span", { className: "qa-chip", onClick: () => go("library") }, "\u{1F4DA} ", t("Book Library")), /* @__PURE__ */ React.createElement("span", { className: "qa-chip", onClick: () => go("papergen") }, "\u{1F4DD} ", t("Paper Generator")), /* @__PURE__ */ React.createElement("span", { className: "qa-chip", onClick: () => go("planner") }, "\u{1F5D3}\uFE0F ", t("Lesson Planner")), /* @__PURE__ */ React.createElement("span", { className: "qa-chip", onClick: () => go("gradebook") }, "\u{1F4CA} ", t("Class Gradebook")), /* @__PURE__ */ React.createElement("span", { className: "qa-chip", onClick: () => go("reportcards") }, "\u{1F9FE} ", t("Report Cards")), user.role === "admin" && /* @__PURE__ */ React.createElement("span", { className: "qa-chip", onClick: () => go("admin") }, "\u{1F3EB} ", t("School Management")))), notices.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "card" }, (() => {
    const lb = LS.get("lastBackup", 0), hasData = LS.get("sms:students", []).length > 0;
    return hasData && Date.now() - lb > 7 * 24 * 3600 * 1e3 ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, background: "rgba(240,165,0,.1)", border: "1px solid rgba(240,165,0,.4)", borderRadius: 12, padding: "10px 14px", marginBottom: 16, fontSize: 13, fontWeight: 700 } }, "\u{1F4BE} ", lb ? "It\u2019s been over a week since your last school backup." : "No school backup has been made on this device yet.", /* @__PURE__ */ React.createElement("button", { className: "link-btn", style: { marginLeft: "auto" }, onClick: () => go("profile") }, "Back up now \u2192")) : null;
  })(), /* @__PURE__ */ React.createElement("div", { className: "card-flex" }, /* @__PURE__ */ React.createElement("h3", null, "\u{1F4E2} ", t("Latest notices")), user.role === "admin" && /* @__PURE__ */ React.createElement("button", { className: "link-btn", onClick: () => go("admin") }, "Manage \u2192")), notices.slice(0, 3).map((n) => /* @__PURE__ */ React.createElement("div", { key: n.id, className: "notice-item" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("b", null, n.title), /* @__PURE__ */ React.createElement("div", { className: "nd" }, n.body)), /* @__PURE__ */ React.createElement("span", { className: "nt" }, n.date)))));
}
function Library({ openBook, favs, setFavs, onFocus }) {
  const [series, setSeries] = useState("All");
  const [level, setLevel] = useState("All");
  const [subject, setSubject] = useState("All");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("default");
  const [onlyFav, setOnlyFav] = useState(false);
  const viewed = LS.get("viewed", {});
  const subjects = useMemo(() => ["All", ...new Set(BOOKS.map((b) => b.subject))], [BOOKS.length]);
  const toggleFav = (e, id) => {
    e.stopPropagation();
    const on = favs.indexOf(id) >= 0;
    setFavs(on ? favs.filter((f) => f !== id) : [...favs, id]);
    toast(on ? "Removed from favourites" : "Added to favourites", on ? "\u2606" : "\u2B50");
  };
  let filtered = BOOKS.filter((b) => (series === "All" || b.series === series) && (level === "All" || b.level === level) && (subject === "All" || b.subject === subject) && (!onlyFav || favs.indexOf(b.id) >= 0) && (!q.trim() || (b.title + " " + b.series + " " + b.level + " " + b.subject).toLowerCase().includes(q.toLowerCase().trim())));
  if (sort === "az") filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
  if (sort === "level") filtered = [...filtered].sort((a, b) => ["Playgroup", "Nursery", "Prep"].indexOf(a.level) - ["Playgroup", "Nursery", "Prep"].indexOf(b.level));
  if (sort === "progress") filtered = [...filtered].sort((a, b) => (viewed[b.id] || []).length / (b.paperCount || 1) - (viewed[a.id] || []).length / (a.paperCount || 1));
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "page-head" }, /* @__PURE__ */ React.createElement("h2", null, "\u{1F4DA} Book Library"), /* @__PURE__ */ React.createElement("p", null, "Flipbooks, interactive lessons, teaching slides and exam papers for every book.")), /* @__PURE__ */ React.createElement(LibraryHero, { onOpen: openBook, onFocus }), /* @__PURE__ */ React.createElement("div", { className: "filter-bar", style: { marginBottom: 10 } }, /* @__PURE__ */ React.createElement("input", { className: "date-inp", style: { flex: 1, minWidth: 180, maxWidth: 340, fontWeight: 600 }, placeholder: "\u{1F50D} Filter books\u2026", value: q, onChange: (e) => setQ(e.target.value) }), /* @__PURE__ */ React.createElement("select", { className: "tt-sel", value: sort, onChange: (e) => setSort(e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "default" }, "Sort: Default"), /* @__PURE__ */ React.createElement("option", { value: "az" }, "Sort: A\u2013Z"), /* @__PURE__ */ React.createElement("option", { value: "level" }, "Sort: Level"), /* @__PURE__ */ React.createElement("option", { value: "progress" }, "Sort: Progress")), /* @__PURE__ */ React.createElement("span", { className: "fchip star" + (onlyFav ? " active" : ""), onClick: () => setOnlyFav((f) => !f) }, "\u2B50 Favourites")), /* @__PURE__ */ React.createElement("div", { className: "filter-bar", style: { marginBottom: 22 } }, ["All", ...C.series || []].map((s) => /* @__PURE__ */ React.createElement("span", { key: s, className: "fchip" + (series === s ? " active" : ""), onClick: () => setSeries(s) }, s === "Alfatah" ? "Al-Fatah" : s)), /* @__PURE__ */ React.createElement("span", { style: { width: 1, height: 20, background: "var(--border)", margin: "0 6px" } }), ["All", ...C.levels || []].map((l) => /* @__PURE__ */ React.createElement("span", { key: l, className: "fchip" + (level === l ? " active" : ""), onClick: () => setLevel(l) }, l === "All" ? "All levels" : LVL_LABEL[l] || l)), /* @__PURE__ */ React.createElement("span", { style: { width: 1, height: 20, background: "var(--border)", margin: "0 6px" } }), /* @__PURE__ */ React.createElement("select", { className: "sub-select", value: subject, onChange: (e) => setSubject(e.target.value) }, subjects.map((s) => /* @__PURE__ */ React.createElement("option", { key: s, value: s }, s === "All" ? "All subjects" : s))), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--muted)", fontSize: 12, fontWeight: 700, marginLeft: "auto" } }, filtered.length, " book", filtered.length !== 1 ? "s" : "")), filtered.length === 0 && /* @__PURE__ */ React.createElement("div", { className: "empty" }, /* @__PURE__ */ React.createElement("div", { className: "ei" }, "\u{1F50D}"), "No books match. Try clearing filters."), (C.series || []).map((sn) => {
    const shelf = filtered.filter((b) => b.series === sn);
    if (!shelf.length) return null;
    return /* @__PURE__ */ React.createElement("div", { key: sn }, /* @__PURE__ */ React.createElement("div", { className: "shelf-div" }, /* @__PURE__ */ React.createElement("span", null, sn === "Alfatah" ? "Al-Fatah" : sn, " Series"), /* @__PURE__ */ React.createElement("i", null), /* @__PURE__ */ React.createElement("em", null, shelf.length, " book", shelf.length !== 1 ? "s" : "")), /* @__PURE__ */ React.createElement("div", { className: "book-grid" }, shelf.map((b) => {
      const done = (viewed[b.id] || []).length, tot = b.paperCount + ((b.flipbook ? 1 : 0) + (b.interactive ? 1 : 0) + (b.deckPdf || b.deck ? 1 : 0));
      const pc = tot ? Math.min(100, Math.round(done / tot * 100)) : 0;
      return /* @__PURE__ */ React.createElement("div", { key: b.id, className: "book-card", onClick: () => openBook(b) }, /* @__PURE__ */ React.createElement("button", { className: "star-btn", title: "Favourite", onClick: (e) => toggleFav(e, b.id) }, favs.indexOf(b.id) >= 0 ? "\u2B50" : "\u2606"), b.coverImg ? /* @__PURE__ */ React.createElement("div", { className: "book-cover-img" }, /* @__PURE__ */ React.createElement("img", { src: encodeURI(BASE + b.coverImg), alt: b.title, loading: "lazy" }), /* @__PURE__ */ React.createElement("span", { className: "bl" }, b.series)) : /* @__PURE__ */ React.createElement("div", { className: "book-cover", style: { background: seriesGrad(b.series) } }, /* @__PURE__ */ React.createElement("div", { className: "bc-top" }, /* @__PURE__ */ React.createElement("span", { className: "bl" }, b.series, " Series"), /* @__PURE__ */ React.createElement("span", { className: "bc-age" }, b.age || "Early Years")), /* @__PURE__ */ React.createElement("div", { className: "bi" }, b.icon), /* @__PURE__ */ React.createElement("div", { className: "bc-title" }, b.title), /* @__PURE__ */ React.createElement("div", { className: "bc-level" }, b.level), /* @__PURE__ */ React.createElement("div", { className: "bc-pub" }, "Azhar Publishers")), /* @__PURE__ */ React.createElement("div", { className: "book-info" }, /* @__PURE__ */ React.createElement("div", { className: "t" }, b.title), /* @__PURE__ */ React.createElement("div", { className: "m" }, b.subject, " \xB7 ", b.level), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "flex-end", gap: 6 } }, /* @__PURE__ */ React.createElement("div", { className: "tags", style: { flex: 1 } }, b.flipbook && /* @__PURE__ */ React.createElement("span", { className: "mini" }, "\u{1F4D6} Flipbook"), b.interactive && /* @__PURE__ */ React.createElement("span", { className: "mini" }, "\u25B6 Interactive"), /* @__PURE__ */ React.createElement("span", { className: "mini" }, "\u{1F4DD} ", b.paperCount, " papers")), pc > 0 && /* @__PURE__ */ React.createElement(Ring, { pct: pc, size: 34, stroke: 4 }))));
    })));
  }));
}
function BookModal({ book, onClose, favs, setFavs, onFocus }) {
  const [, force] = useState(0);
  const viewed = LS.get("viewed", {});
  const fav = favs.indexOf(book.id) >= 0;
  const open = (p, type, icon, label) => {
    openFile(p, { type, bookId: book.id, icon, label });
    setTimeout(() => force((x) => x + 1), 300);
  };
  const allDone = () => {
    const v = LS.get("viewed", {});
    v[book.id] = [book.flipbook, book.interactive, book.deckPdf || book.deck, ...(book.papers || []).map((p) => p.path)].filter(Boolean);
    LS.set("viewed", v);
    force((x) => x + 1);
    toast("All marked as done");
  };
  const reset = () => {
    const v = LS.get("viewed", {});
    delete v[book.id];
    LS.set("viewed", v);
    force((x) => x + 1);
    toast("Progress reset", "\u{1F9F9}");
  };
  const doneCount = (viewed[book.id] || []).length;
  const totalItems = book.papers.length + (book.flipbook ? 1 : 0) + (book.interactive ? 1 : 0) + (book.deckPdf || book.deck ? 1 : 0);
  return /* @__PURE__ */ React.createElement("div", { className: "overlay", onClick: onClose }, /* @__PURE__ */ React.createElement("div", { className: "modal", onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement("div", { className: "modal-top" }, /* @__PURE__ */ React.createElement("div", { className: "modal-hero", style: { background: seriesGrad(book.series) } }, book.coverImg ? /* @__PURE__ */ React.createElement("img", { className: "modal-cover", src: encodeURI(BASE + book.coverImg), alt: book.title }) : /* @__PURE__ */ React.createElement("div", { className: "bi" }, book.icon), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", null, book.title), /* @__PURE__ */ React.createElement("p", null, book.series, " Series \xB7 ", book.level, " \xB7 ", book.age || "Early Years"))), /* @__PURE__ */ React.createElement("button", { className: "modal-x", onClick: onClose }, "\u2715"), /* @__PURE__ */ React.createElement("button", { className: "star-btn", style: { top: 14, right: 56 }, onClick: () => {
    setFavs(fav ? favs.filter((f) => f !== book.id) : [...favs, book.id]);
    toast(fav ? "Removed from favourites" : "Added to favourites", fav ? "\u2606" : "\u2B50");
  } }, fav ? "\u2B50" : "\u2606")), /* @__PURE__ */ React.createElement("div", { className: "modal-body" }, /* @__PURE__ */ React.createElement("div", { className: "act-list" }, onFocus && /* @__PURE__ */ React.createElement("button", { className: "act2 teach", style: { borderLeftColor: "#0f1e46", background: "linear-gradient(135deg,#101736,#1b2547)", color: "#fff" }, onClick: () => {
    onClose();
    onFocus(book);
  } }, /* @__PURE__ */ React.createElement("div", { className: "a2i", style: { background: "rgba(255,179,0,.2)" } }, "\u{1F3AC}"), /* @__PURE__ */ React.createElement("div", { className: "a2b" }, /* @__PURE__ */ React.createElement("div", { className: "a2t", style: { color: "#ffb300" } }, "Focus Mode"), /* @__PURE__ */ React.createElement("div", { className: "a2d", style: { color: "#8a94b8" } }, "full-screen lesson stage with timer & quick quiz \u2014 for the projector")), /* @__PURE__ */ React.createElement("div", { className: "a2go", style: { color: "#ffb300" } }, "Enter \u2197")), /* @__PURE__ */ React.createElement("button", { className: "act2 flip" + (book.flipbook ? "" : " disabled"), onClick: () => open(book.flipbook, "flipbook", "\u{1F4D6}", book.title + " Flipbook \xB7 " + book.level) }, /* @__PURE__ */ React.createElement("div", { className: "a2i" }, "\u{1F4D6}"), /* @__PURE__ */ React.createElement("div", { className: "a2b" }, /* @__PURE__ */ React.createElement("div", { className: "a2t" }, "Digital Flipbook ", isViewed(viewed, book.id, book.flipbook) && "\u2713"), /* @__PURE__ */ React.createElement("div", { className: "a2d" }, "Turn through every page of ", book.title, " on screen")), /* @__PURE__ */ React.createElement("div", { className: "a2go" }, "Open \u2197")), /* @__PURE__ */ React.createElement("button", { className: "act2 inter" + (book.interactive ? "" : " disabled"), onClick: () => open(book.interactive, "interactive", "\u{1F3AF}", book.title + " Interactive \xB7 " + book.level) }, /* @__PURE__ */ React.createElement("div", { className: "a2i" }, "\u{1F3AF}"), /* @__PURE__ */ React.createElement("div", { className: "a2b" }, /* @__PURE__ */ React.createElement("div", { className: "a2t" }, "Interactive Lesson ", isViewed(viewed, book.id, book.interactive) && "\u2713"), /* @__PURE__ */ React.createElement("div", { className: "a2d" }, "Tap-and-play ", book.subject.toLowerCase(), " activities for the classroom board")), /* @__PURE__ */ React.createElement("div", { className: "a2go" }, "Open \u2197")), /* @__PURE__ */ React.createElement("button", { className: "act2 teach" + (book.deckPdf || book.deck ? "" : " disabled"), onClick: () => open(book.deckPdf || book.deck, "deck", "\u{1F5A5}\uFE0F", book.title + " Teaching Slides \xB7 " + book.level) }, /* @__PURE__ */ React.createElement("div", { className: "a2i" }, "\u{1F5A5}\uFE0F"), /* @__PURE__ */ React.createElement("div", { className: "a2b" }, /* @__PURE__ */ React.createElement("div", { className: "a2t" }, "Teaching Slides ", isViewed(viewed, book.id, book.deckPdf || book.deck) && "\u2713"), /* @__PURE__ */ React.createElement("div", { className: "a2d" }, "Projectable walkthrough to teach this book, ", book.level, " level")), /* @__PURE__ */ React.createElement("div", { className: "a2go" }, "Open \u2197"))), /* @__PURE__ */ React.createElement("div", { className: "papers-h" }, /* @__PURE__ */ React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 8 } }, /* @__PURE__ */ React.createElement(Ring, { pct: totalItems ? doneCount / totalItems * 100 : 0, size: 30, stroke: 4 }), " Exam Papers \xB7 ", book.papers.length), /* @__PURE__ */ React.createElement("span", null, doneCount > 0 && /* @__PURE__ */ React.createElement("button", { className: "link-btn", onClick: reset }, "Reset ticks"), " ", /* @__PURE__ */ React.createElement("button", { className: "link-btn", onClick: allDone }, "Mark all done"))), book.papers.map((p, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "paper-row", onClick: () => open(p.path, "paper", "\u{1F4C4}", p.label + " \u2014 " + book.title + " (" + book.level + ")") }, /* @__PURE__ */ React.createElement("div", { className: "pl" }, /* @__PURE__ */ React.createElement("span", { className: "tick" + (isViewed(viewed, book.id, p.path) ? " on" : "") }, "\u2713"), p.label), /* @__PURE__ */ React.createElement("div", { className: "po" }, "Open \u2197"))), book.papers.length === 0 && /* @__PURE__ */ React.createElement("p", { style: { color: "var(--muted)", fontSize: 13 } }, "No exam papers linked for this book yet."))));
}
const TRAIN_SEED = [
  { id: 1, icon: "\u{1F34E}", title: "Classroom management for early years", desc: "Setting up routines for Playgroup\u2013Prep", url: "" },
  { id: 2, icon: "\u{1F524}", title: "Teaching phonics with GoldCrest English", desc: "Sounds, blending and reading readiness", url: "" },
  { id: 3, icon: "\u{1F522}", title: "Counting & number sense (Panda / GoldCrest)", desc: "Hands-on methods for numeracy", url: "" },
  { id: 4, icon: "\u270D\uFE0F", title: "Pre-writing & handwriting strokes", desc: "Building fine-motor control", url: "" },
  { id: 6, icon: "\uFE8D", title: "Teaching Urdu Qaida", desc: "Letter recognition and pronunciation", url: "" }
];
function ytId(url) {
  const m = String(url || "").match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : null;
}
function Training({ user }) {
  const [topics, setTopics] = useLS("training", TRAIN_SEED);
  useEffect(() => {
    setTopics((t2) => t2.filter((x) => x.title !== "Conducting monthly & term exams"));
  }, []);
  const [play, setPlay] = useState(null);
  const [nf, setNf] = useState({ title: "", desc: "", url: "" });
  const isAdmin = user.role === "admin";
  const setUrl = (id, url) => setTopics((t2) => t2.map((x) => x.id === id ? { ...x, url } : x));
  const addTopic = () => {
    if (!nf.title.trim()) return;
    setTopics((t2) => [...t2, { id: Date.now(), icon: "\u{1F3AC}", title: nf.title.trim(), desc: nf.desc.trim(), url: nf.url.trim() }]);
    setNf({ title: "", desc: "", url: "" });
    toast("Training topic added");
  };
  const del = (id) => {
    setTopics((t2) => t2.filter((x) => x.id !== id));
    toast("Topic removed", "\u{1F5D1}\uFE0F");
  };
  const clickThumb = (t2) => {
    if (ytId(t2.url)) setPlay(t2);
    else if (t2.url) window.open(t2.url, "_blank");
  };
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "page-head" }, /* @__PURE__ */ React.createElement("h2", null, "\u{1F393} Teacher Training"), /* @__PURE__ */ React.createElement("p", null, "Training videos mapped to the books your teachers use. Paste a YouTube link into any topic \u2014 it saves automatically.")), isAdmin && /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("h3", null, "Add a training topic"), /* @__PURE__ */ React.createElement("div", { className: "quick-add" }, /* @__PURE__ */ React.createElement("input", { placeholder: "Topic title\u2026", value: nf.title, onChange: (e) => setNf({ ...nf, title: e.target.value }) }), /* @__PURE__ */ React.createElement("input", { placeholder: "Short description\u2026", value: nf.desc, onChange: (e) => setNf({ ...nf, desc: e.target.value }) }), /* @__PURE__ */ React.createElement("input", { placeholder: "YouTube link (optional)\u2026", value: nf.url, onChange: (e) => setNf({ ...nf, url: e.target.value }) }), /* @__PURE__ */ React.createElement("button", { className: "btn btn-navy btn-sm", onClick: addTopic }, "+ Add topic"))), /* @__PURE__ */ React.createElement("div", { className: "train-grid" }, topics.map((t2) => /* @__PURE__ */ React.createElement("div", { key: t2.id, className: "train-card" }, /* @__PURE__ */ React.createElement("div", { className: "train-thumb", onClick: () => clickThumb(t2) }, ytId(t2.url) ? /* @__PURE__ */ React.createElement("img", { src: "https://img.youtube.com/vi/" + ytId(t2.url) + "/hqdefault.jpg", alt: "", style: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" } }) : t2.icon, t2.url ? /* @__PURE__ */ React.createElement("div", { className: "play" }, "\u25B6\uFE0F") : /* @__PURE__ */ React.createElement("span", { className: "soon soon2" }, "Add video link below")), /* @__PURE__ */ React.createElement("div", { className: "train-b" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", gap: 8 } }, /* @__PURE__ */ React.createElement("div", { className: "t" }, t2.title), isAdmin && /* @__PURE__ */ React.createElement("button", { className: "del-btn", onClick: () => del(t2.id), title: "Remove" }, "\u2715")), /* @__PURE__ */ React.createElement("div", { className: "d" }, t2.desc), isAdmin && /* @__PURE__ */ React.createElement("input", { placeholder: "Paste YouTube / video link\u2026", value: t2.url, onChange: (e) => setUrl(t2.id, e.target.value) }))))), play && /* @__PURE__ */ React.createElement("div", { className: "overlay", onClick: () => setPlay(null) }, /* @__PURE__ */ React.createElement("div", { className: "modal", style: { maxWidth: 760, padding: 16 }, onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 } }, /* @__PURE__ */ React.createElement("h3", { style: { color: "var(--brand)", fontSize: 16 } }, play.title), /* @__PURE__ */ React.createElement("button", { className: "del-btn", onClick: () => setPlay(null) }, "\u2715")), /* @__PURE__ */ React.createElement("iframe", { className: "video-frame", src: "https://www.youtube.com/embed/" + ytId(play.url), allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture", allowFullScreen: true, title: play.title }))));
}
const GB_TERMS = ["1st Term", "2nd Term", "3rd Term"];
const TT_CLASSES = ["Playgroup", "Nursery", "Prep", "One", "Two", "Three", "Four", "Five"];
const TT_SECTIONS = ["A", "B", "C", "D"];
const EARLY_CLASSES = ["Playgroup", "Nursery", "Prep"];
const isEarly = (cls) => EARLY_CLASSES.indexOf(cls) >= 0;
const DEFAULT_SUBJECTS = { early: ["English", "Urdu", "Counting"], primary: ["English", "Urdu", "Maths", "Islamiat", "General Knowledge", "Science"] };
const SUBJECT_POOL = {
  early: ["English", "Urdu", "Counting", "General Knowledge", "Rhymes", "Art", "Story Time"],
  primary: ["English", "Urdu", "Maths", "Islamiat", "General Knowledge", "Science", "Social Studies", "Computer", "Nazra Quran", "Art", "P.E."]
};
function Gradebook({ students, goReport, user }) {
  const [cls, setCls] = useLS("gb:cls", "Nursery");
  const [sec, setSec] = useLS("gb:sec", "A");
  const [term, setTerm] = useLS("gb:term", "1st Term");
  const [gb, setGb] = useLS("gradebook", {});
  const [newStu, setNewStu] = useState("");
  const [newSub, setNewSub] = useState("");
  const key = cls + " " + sec + "|" + term;
  const early = isEarly(cls);
  const sheet = gb[key] || { subjects: early ? DEFAULT_SUBJECTS.early : DEFAULT_SUBJECTS.primary, rows: [] };
  const suggestions = (early ? SUBJECT_POOL.early : SUBJECT_POOL.primary).filter((s) => sheet.subjects.indexOf(s) < 0);
  const photoOf = (name) => {
    const s = students.find((x) => x.name === name);
    return s ? s.photo : null;
  };
  const avail = students.filter((s) => s.cls === cls && s.sec === sec && !sheet.rows.some((r) => r.name === s.name));
  const pickStudent = (name) => {
    if (!name) return;
    save({ ...sheet, rows: [...sheet.rows, { name, m: {} }] });
    toast(name + " added", "\u{1F392}");
  };
  const pickSubject = (s) => {
    if (!s || sheet.subjects.indexOf(s) >= 0) return;
    save({ ...sheet, subjects: [...sheet.subjects, s] });
    toast(s + " column added", "\u{1F4DA}");
  };
  const save = (s) => {
    setGb({ ...gb, [key]: s });
    cloudPushGradebook(key, s, user);
  };
  const setMark = (ri, sub, v) => {
    const rows = sheet.rows.map((r, i) => i === ri ? { ...r, m: { ...r.m, [sub]: Math.max(0, Math.min(100, +v || 0)) } } : r);
    save({ ...sheet, rows });
  };
  const addStudent = () => {
    if (!newStu.trim()) return;
    save({ ...sheet, rows: [...sheet.rows, { name: newStu.trim(), m: {} }] });
    setNewStu("");
  };
  const importSMS = () => {
    const inCls = students.filter((s) => s.cls === cls && s.sec === sec && !sheet.rows.some((r) => r.name === s.name));
    if (inCls.length === 0) {
      toast("No new students found for " + cls + " " + sec, "\u2139\uFE0F");
      return;
    }
    save({ ...sheet, rows: [...sheet.rows, ...inCls.map((s) => ({ name: s.name, m: {} }))] });
    toast(inCls.length + " students imported from School Management");
  };
  const removeRow = (ri) => save({ ...sheet, rows: sheet.rows.filter((_, i) => i !== ri) });
  const addSubject = () => {
    const s = newSub.trim();
    if (!s || sheet.subjects.indexOf(s) >= 0) return;
    save({ ...sheet, subjects: [...sheet.subjects, s] });
    setNewSub("");
  };
  const removeSubject = (sub) => save({ ...sheet, subjects: sheet.subjects.filter((s) => s !== sub), rows: sheet.rows.map((r) => {
    const m = { ...r.m };
    delete m[sub];
    return { ...r, m };
  }) });
  const total = (r) => sheet.subjects.reduce((a, s) => a + (+r.m[s] || 0), 0);
  const pct = (r) => sheet.subjects.length ? Math.round(total(r) / (sheet.subjects.length * 100) * 100) : 0;
  const grade = (p) => p >= 80 ? ["A", "#00a884"] : p >= 65 ? ["B", "#2f6fed"] : p >= 50 ? ["C", "#F0A500"] : p > 0 ? ["D", "#e94560"] : ["\u2014", "#aaa"];
  const exportCSV = () => downloadCSV(
    "Gradebook_" + cls + "_" + sec + "_" + term.replace(/ /g, "_") + ".csv",
    [["Student", ...sheet.subjects, "Total", "%", "Grade"], ...sheet.rows.map((r) => [r.name, ...sheet.subjects.map((s) => r.m[s] || 0), total(r), pct(r) + "%", grade(pct(r))[0]])]
  );
  const classAvg = sheet.rows.length ? Math.round(sheet.rows.reduce((a, r) => a + pct(r), 0) / sheet.rows.length) : 0;
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "page-head" }, /* @__PURE__ */ React.createElement("h2", null, "\u{1F4CA} Class Gradebook"), /* @__PURE__ */ React.createElement("p", null, "Marks save automatically on this device. Pick a class, section and term \u2014 every combination keeps its own sheet.")), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "rc-toolbar" }, /* @__PURE__ */ React.createElement("select", { className: "tt-sel", value: cls, onChange: (e) => setCls(e.target.value) }, TT_CLASSES.map((c) => /* @__PURE__ */ React.createElement("option", { key: c }, c))), /* @__PURE__ */ React.createElement("select", { className: "tt-sel", value: sec, onChange: (e) => setSec(e.target.value) }, TT_SECTIONS.map((s) => /* @__PURE__ */ React.createElement("option", { key: s }, "Sec ", s))), /* @__PURE__ */ React.createElement("select", { className: "tt-sel", value: term, onChange: (e) => setTerm(e.target.value) }, GB_TERMS.map((t2) => /* @__PURE__ */ React.createElement("option", { key: t2 }, t2))), /* @__PURE__ */ React.createElement("button", { className: "mini-btn ghost", onClick: importSMS }, "\u{1F465} Import class students"), /* @__PURE__ */ React.createElement("button", { className: "mini-btn ghost", onClick: exportCSV }, "\u{1F4E5} Export CSV"), user && user.cloud && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11.5, fontWeight: 800, color: "var(--green)", border: "1px solid var(--green)", borderRadius: 999, padding: "3px 10px" } }, "\u2601 Cloud sync on \u2014 marks save to the school database"), sheet.rows.length > 0 && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, fontWeight: 800, color: "var(--muted)", marginLeft: "auto" } }, sheet.rows.length, " students \xB7 avg ", classAvg, "% \xB7 \u{1F3C6} ", sheet.rows.filter((r) => pct(r) >= 80).length, " \xB7 \u{1F4C9} ", sheet.rows.filter((r) => pct(r) > 0 && pct(r) < 50).length)), /* @__PURE__ */ React.createElement("details", { className: "disc" }, /* @__PURE__ */ React.createElement("summary", null, "\uFF0B Add a student or subject"), /* @__PURE__ */ React.createElement("div", { className: "disc-b" }, /* @__PURE__ */ React.createElement("div", { className: "quick-add", style: { marginBottom: 8 } }, /* @__PURE__ */ React.createElement("select", { className: "tt-sel", value: "", onChange: (e) => pickStudent(e.target.value), style: { minWidth: 220 } }, /* @__PURE__ */ React.createElement("option", { value: "" }, "\u{1F392} Pick a student \u2014 ", avail.length, " in ", cls, " ", sec, " (School Management)\u2026"), avail.map((s) => /* @__PURE__ */ React.createElement("option", { key: s.id || s.name, value: s.name }, s.name))), /* @__PURE__ */ React.createElement("input", { placeholder: "\u2026or type a new name", value: newStu, onChange: (e) => setNewStu(e.target.value), onKeyDown: (e) => e.key === "Enter" && addStudent(), style: { minWidth: 140, maxWidth: 190 } }), /* @__PURE__ */ React.createElement("button", { className: "btn btn-navy btn-sm", onClick: addStudent }, "+ Student")), /* @__PURE__ */ React.createElement("div", { className: "quick-add", style: { marginBottom: 0 } }, /* @__PURE__ */ React.createElement("select", { className: "tt-sel", value: "", onChange: (e) => pickSubject(e.target.value), style: { minWidth: 220 } }, /* @__PURE__ */ React.createElement("option", { value: "" }, "\u{1F4DA} Pick a subject for ", early ? "early years" : "Class " + cls, "\u2026"), suggestions.map((s) => /* @__PURE__ */ React.createElement("option", { key: s, value: s }, s))), /* @__PURE__ */ React.createElement("input", { placeholder: "\u2026or type your own", value: newSub, onChange: (e) => setNewSub(e.target.value), onKeyDown: (e) => e.key === "Enter" && addSubject(), style: { minWidth: 120, maxWidth: 190 } }), /* @__PURE__ */ React.createElement("button", { className: "btn btn-navy btn-sm", onClick: addSubject }, "+ Subject")))), sheet.rows.length === 0 && /* @__PURE__ */ React.createElement("div", { className: "empty" }, /* @__PURE__ */ React.createElement("div", { className: "ei" }, "\u{1F4DD}"), "No students yet. Add them above, or click \u201CImport class students\u201D to pull the ", cls, " ", sec, " list from School Management."), sheet.rows.length > 0 && /* @__PURE__ */ React.createElement("table", { className: "gtable" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Student"), sheet.subjects.map((s) => /* @__PURE__ */ React.createElement("th", { key: s }, s, " /100 ", /* @__PURE__ */ React.createElement("span", { style: { cursor: "pointer", opacity: 0.7 }, title: "Remove subject", onClick: () => removeSubject(s) }, "\u2715"))), /* @__PURE__ */ React.createElement("th", null, "Total"), /* @__PURE__ */ React.createElement("th", null, "%"), /* @__PURE__ */ React.createElement("th", null, "Grade"), /* @__PURE__ */ React.createElement("th", null))), /* @__PURE__ */ React.createElement("tbody", null, sheet.rows.map((r, ri) => {
    const p = pct(r), [g, gc] = grade(p);
    return /* @__PURE__ */ React.createElement("tr", { key: ri }, /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { className: "tbl-name" }, /* @__PURE__ */ React.createElement(Avatar, { photo: photoOf(r.name), name: r.name, size: 26 }), r.name)), sheet.subjects.map((s) => /* @__PURE__ */ React.createElement("td", { key: s }, /* @__PURE__ */ React.createElement("input", { type: "number", value: r.m[s] || "", onChange: (e) => setMark(ri, s, e.target.value) }))), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("b", null, total(r))), /* @__PURE__ */ React.createElement("td", null, p, "%"), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { className: "grade-pill", style: { background: gc + "22", color: gc } }, g)), /* @__PURE__ */ React.createElement("td", { style: { whiteSpace: "nowrap" } }, /* @__PURE__ */ React.createElement("button", { className: "mini-btn ghost", title: "Open report card", onClick: () => goReport({ student: r.name, cls: cls + " " + sec, term, subs: sheet.subjects.map((s) => ({ name: s, total: 100, got: +r.m[s] || 0 })) }) }, "\u{1F9FE}"), " ", /* @__PURE__ */ React.createElement("button", { className: "del-btn", title: "Remove student", onClick: () => removeRow(ri) }, "\u2715")));
  }))), /* @__PURE__ */ React.createElement("p", { className: "hint" }, "\u{1F4BE} Saved automatically \xB7 \u{1F9FE} opens a pre-filled report card for that student \xB7 student and subject dropdowns are under \u201C\uFF0B Add\u201D.")));
}
function ReportCard({ prefill, students }) {
  const [saved, setSaved] = useLS("reportcard", null);
  const base = prefill ? {
    info: { school: "Azhar Model School", student: prefill.student, father: "", cls: prefill.cls, roll: "", term: prefill.term, session: "2026\u201327", present: "", total: "" },
    subs: prefill.subs
  } : saved || {
    info: { school: "Azhar Model School", student: "Ahmed Ali", father: "Mr. Ali Raza", cls: "Nursery A", roll: "12", term: "First Term", session: "2026\u201327", present: "58", total: "60" },
    subs: [{ name: "English", total: 100, got: 82 }, { name: "Urdu", total: 100, got: 75 }, { name: "Counting / Maths", total: 100, got: 88 }, { name: "General Knowledge", total: 50, got: 41 }, { name: "Rhymes & Drawing", total: 50, got: 45 }]
  };
  const [info, setInfo] = useState(base.info);
  const [subs, setSubs] = useState(base.subs);
  const [skills, setSkills] = useState(saved && saved.skills || [
    ["Listens attentively", "Very Good"],
    ["Follows instructions", "Good"],
    ["Fine-motor / pencil control", "Very Good"],
    ["Social skills & sharing", "Excellent"],
    ["Class participation", "Good"],
    ["Letter / number recognition", "Very Good"]
  ]);
  const [remarks, setRemarks] = useState(saved && saved.remarks || "A cheerful and hardworking child, making steady progress and taking part enthusiastically in class activities.");
  useEffect(() => {
    setSaved({ info, subs, skills, remarks });
  }, [info, subs, skills, remarks]);
  useEffect(() => {
    if (prefill) {
      const s = students.find((x) => x.name === prefill.student);
      setInfo({ ...base.info, photo: s && s.photo || null, father: s && s.guardian ? "Mr. " + s.guardian : "", roll: s ? String(s.roll) : "" });
      setSubs(base.subs);
    }
  }, [prefill]);
  const ratings = ["Excellent", "Very Good", "Good", "Satisfactory", "Needs Support"];
  const upd = (k, v) => setInfo((p) => ({ ...p, [k]: v }));
  const setSub = (i, k, v) => setSubs((p) => p.map((s, idx) => idx === i ? { ...s, [k]: k === "name" ? v : +v || 0 } : s));
  const setSkill = (i, v) => setSkills((p) => p.map((s, idx) => idx === i ? [s[0], v] : s));
  const grade = (p) => p >= 80 ? "A" : p >= 65 ? "B" : p >= 50 ? "C" : p > 0 ? "D" : "\u2014";
  const totGot = subs.reduce((a, s) => a + (+s.got || 0), 0), totMax = subs.reduce((a, s) => a + (+s.total || 0), 0);
  const pct = totMax ? Math.round(totGot / totMax * 100) : 0;
  const pickStudent = (name) => {
    const s = students.find((x) => x.name === name);
    if (!s) return;
    setInfo((p) => ({ ...p, student: s.name, father: s.guardian ? "Mr. " + s.guardian : p.father, cls: s.cls + " " + s.sec, roll: String(s.roll), photo: s.photo || null }));
  };
  const gbAll = LS.get("gradebook", {});
  const bulkKeys = Object.keys(gbAll).filter((k) => gbAll[k].rows && gbAll[k].rows.length > 0);
  const esc = (x) => String(x == null ? "" : x).replace(/</g, "&lt;");
  const printBulk = (bk) => {
    const sheet = gbAll[bk];
    if (!sheet) return;
    const parts = bk.split("|"), clsSec = parts[0], termN = parts[1] || "";
    const cards = sheet.rows.map((r) => {
      const stu = students.find((x) => x.name === r.name);
      const tot = sheet.subjects.reduce((a, s) => a + (+r.m[s] || 0), 0), max = sheet.subjects.length * 100, p = max ? Math.round(tot / max * 100) : 0;
      const av = stu && stu.photo ? `<img src="${stu.photo}" style="width:58px;height:58px;border-radius:50%;object-fit:cover;border:2px solid #0f3460">` : "";
      const rowsH = sheet.subjects.map((s) => `<tr><td>${esc(s)}</td><td style="text-align:center">100</td><td style="text-align:center">${+r.m[s] || 0}</td><td style="text-align:center"><b>${grade(+r.m[s] || 0)}</b></td></tr>`).join("");
      return `<div style="page-break-after:always;padding:4px 0">
       <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #0f3460;padding-bottom:10px;margin-bottom:12px">
         <div><div style="font-size:19px;font-weight:800;color:#0f3460">${esc(info.school)}</div>
           <div style="font-size:11.5px;color:#889">Progress Report Card \xB7 ${esc(termN)} \xB7 Session ${esc(info.session)}</div></div>
         <div style="display:flex;align-items:center;gap:12px">${av}<div style="font-weight:800;color:#0f3460;font-size:16px">Azhar<span style="color:#e94560">Ed</span></div></div></div>
       <p style="font-size:13.5px;margin-bottom:12px"><b>Student:</b> ${esc(r.name)} &nbsp;&nbsp; <b>Class:</b> ${esc(clsSec)} ${stu ? "&nbsp;&nbsp; <b>Roll:</b> " + stu.roll : ""}</p>
       <table><tr><th>Subject</th><th>Max</th><th>Obtained</th><th>Grade</th></tr>${rowsH}
       <tr style="background:#eef2fb"><td><b>Total</b></td><td style="text-align:center"><b>${max}</b></td><td style="text-align:center"><b>${tot}</b></td><td style="text-align:center"><b>${p}% \xB7 ${grade(p)}</b></td></tr></table>
       <p style="font-size:12.5px;margin-top:16px"><b>Teacher's Remarks:</b> ___________________________________________________</p>
       <div style="display:flex;justify-content:space-between;margin-top:46px;font-size:12px;color:#556">
         <span style="border-top:1px solid #333;padding:5px 20px 0">Class Teacher</span>
         <span style="border-top:1px solid #333;padding:5px 20px 0">Principal</span>
         <span style="border-top:1px solid #333;padding:5px 20px 0">Parent / Guardian</span></div>
      </div>`;
    }).join("");
    printHTML("Report Cards \u2014 " + bk, cards);
    toast(sheet.rows.length + " report cards ready to print", "\u{1F5A8}\uFE0F");
  };
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "page-head" }, /* @__PURE__ */ React.createElement("h2", null, "\u{1F9FE} Report Cards"), /* @__PURE__ */ React.createElement("p", null, "Early-years template (marks + skills). Everything is editable, saves automatically, and prints cleanly.")), /* @__PURE__ */ React.createElement("div", { className: "rc-toolbar" }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-navy", onClick: () => window.print() }, "\u{1F5A8}\uFE0F Print / Save as PDF"), /* @__PURE__ */ React.createElement("select", { className: "tt-sel", defaultValue: "", onChange: (e) => {
    pickStudent(e.target.value);
    e.target.value = "";
  } }, /* @__PURE__ */ React.createElement("option", { value: "", disabled: true }, "Fill from student list\u2026"), students.map((s) => /* @__PURE__ */ React.createElement("option", { key: s.id, value: s.name }, s.name, " \xB7 ", s.cls, " ", s.sec))), bulkKeys.length > 0 && /* @__PURE__ */ React.createElement("select", { className: "tt-sel", defaultValue: "", onChange: (e) => {
    if (e.target.value) printBulk(e.target.value);
    e.target.value = "";
  } }, /* @__PURE__ */ React.createElement("option", { value: "", disabled: true }, "\u{1F5A8}\uFE0F Print whole class\u2026"), bulkKeys.map((k) => /* @__PURE__ */ React.createElement("option", { key: k, value: k }, k.replace("|", " \xB7 "), " (", gbAll[k].rows.length, " students)"))), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11.5, color: "var(--muted)", opacity: 0.85 } }, "Tip: the Gradebook \u{1F9FE} button pre-fills a card with a student's marks.")), /* @__PURE__ */ React.createElement("div", { className: "report-sheet" }, /* @__PURE__ */ React.createElement("div", { className: "rc-head" }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("input", { className: "rc-inp", style: { fontSize: 20, fontWeight: 800, color: "#0f3460", borderBottom: "none", width: "100%" }, value: info.school, onChange: (e) => upd("school", e.target.value) }), /* @__PURE__ */ React.createElement("div", { className: "sub" }, "Progress Report Card \xB7 Session ", info.session)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 16 } }, /* @__PURE__ */ React.createElement("button", { className: "av-btn" + (info.photo ? "" : " rc-nophoto"), title: "Add / change student photo", onClick: () => pickPhoto((d) => upd("photo", d)) }, info.photo ? /* @__PURE__ */ React.createElement("img", { className: "av-sm", style: { width: 66, height: 66, border: "2.5px solid #0f3460" }, src: info.photo, alt: "student" }) : /* @__PURE__ */ React.createElement("div", { style: { width: 66, height: 66, borderRadius: "50%", border: "2px dashed #c4cad8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10.5, color: "#8a90a0", fontWeight: 700 } }, "+ Photo")), /* @__PURE__ */ React.createElement("div", { className: "rc-badge" }, "Azhar", /* @__PURE__ */ React.createElement("span", { style: { color: "#e94560" } }, "Ed")))), /* @__PURE__ */ React.createElement("div", { className: "rc-title" }, "Student Progress Report \u2014 ", info.term), /* @__PURE__ */ React.createElement("div", { className: "rc-info" }, /* @__PURE__ */ React.createElement("div", { className: "rc-field" }, /* @__PURE__ */ React.createElement("label", null, "Student"), /* @__PURE__ */ React.createElement("input", { className: "rc-inp", value: info.student, onChange: (e) => upd("student", e.target.value) })), /* @__PURE__ */ React.createElement("div", { className: "rc-field" }, /* @__PURE__ */ React.createElement("label", null, "Father"), /* @__PURE__ */ React.createElement("input", { className: "rc-inp", value: info.father, onChange: (e) => upd("father", e.target.value) })), /* @__PURE__ */ React.createElement("div", { className: "rc-field" }, /* @__PURE__ */ React.createElement("label", null, "Class"), /* @__PURE__ */ React.createElement("input", { className: "rc-inp", value: info.cls, onChange: (e) => upd("cls", e.target.value) })), /* @__PURE__ */ React.createElement("div", { className: "rc-field" }, /* @__PURE__ */ React.createElement("label", null, "Roll No"), /* @__PURE__ */ React.createElement("input", { className: "rc-inp", value: info.roll, onChange: (e) => upd("roll", e.target.value) })), /* @__PURE__ */ React.createElement("div", { className: "rc-field" }, /* @__PURE__ */ React.createElement("label", null, "Term"), /* @__PURE__ */ React.createElement("input", { className: "rc-inp", value: info.term, onChange: (e) => upd("term", e.target.value) })), /* @__PURE__ */ React.createElement("div", { className: "rc-field" }, /* @__PURE__ */ React.createElement("label", null, "Attendance"), /* @__PURE__ */ React.createElement("input", { className: "rc-inp", style: { maxWidth: 44, flex: "none" }, value: info.present, onChange: (e) => upd("present", e.target.value) }), /* @__PURE__ */ React.createElement("span", { style: { color: "#8a90a0" } }, "of"), /* @__PURE__ */ React.createElement("input", { className: "rc-inp", style: { maxWidth: 44, flex: "none" }, value: info.total, onChange: (e) => upd("total", e.target.value) }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: "#8a90a0" } }, "days"))), /* @__PURE__ */ React.createElement("table", { className: "rc-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Subject"), /* @__PURE__ */ React.createElement("th", { className: "c" }, "Max Marks"), /* @__PURE__ */ React.createElement("th", { className: "c" }, "Obtained"), /* @__PURE__ */ React.createElement("th", { className: "c" }, "Grade"))), /* @__PURE__ */ React.createElement("tbody", null, subs.map((s, i) => /* @__PURE__ */ React.createElement("tr", { key: i }, /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("input", { className: "rc-inp", value: s.name, onChange: (e) => setSub(i, "name", e.target.value) })), /* @__PURE__ */ React.createElement("td", { className: "c" }, /* @__PURE__ */ React.createElement("input", { className: "rc-inp", style: { width: 52, textAlign: "center", flex: "none" }, type: "number", value: s.total, onChange: (e) => setSub(i, "total", e.target.value) })), /* @__PURE__ */ React.createElement("td", { className: "c" }, /* @__PURE__ */ React.createElement("input", { className: "rc-inp", style: { width: 52, textAlign: "center", flex: "none" }, type: "number", value: s.got, onChange: (e) => setSub(i, "got", e.target.value) })), /* @__PURE__ */ React.createElement("td", { className: "c" }, /* @__PURE__ */ React.createElement("b", null, grade(s.total ? s.got / s.total * 100 : 0))))), /* @__PURE__ */ React.createElement("tr", { className: "rc-total" }, /* @__PURE__ */ React.createElement("td", null, "Total"), /* @__PURE__ */ React.createElement("td", { className: "c" }, totMax), /* @__PURE__ */ React.createElement("td", { className: "c" }, totGot), /* @__PURE__ */ React.createElement("td", { className: "c" }, pct, "% \xB7 ", grade(pct))))), /* @__PURE__ */ React.createElement("div", { className: "rc-key" }, "Grading key: A = 80\u2013100% (Outstanding) \xB7 B = 65\u201379% (Good) \xB7 C = 50\u201364% (Satisfactory) \xB7 D = below 50% (Needs improvement)"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 800, color: "#0f3460", margin: "4px 0 8px" } }, "Skills & Personal Development"), /* @__PURE__ */ React.createElement("table", { className: "rc-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Area"), /* @__PURE__ */ React.createElement("th", { className: "c", style: { width: 210 } }, "Rating"))), /* @__PURE__ */ React.createElement("tbody", null, skills.map((s, i) => /* @__PURE__ */ React.createElement("tr", { key: i }, /* @__PURE__ */ React.createElement("td", null, s[0]), /* @__PURE__ */ React.createElement("td", { className: "c" }, /* @__PURE__ */ React.createElement("select", { className: "rc-sel", value: s[1], onChange: (e) => setSkill(i, e.target.value) }, ratings.map((r) => /* @__PURE__ */ React.createElement("option", { key: r }, r)))))))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 800, color: "#0f3460", margin: "16px 0 8px" } }, "Class Teacher\u2019s Remarks"), /* @__PURE__ */ React.createElement("textarea", { className: "rc-remarks", value: remarks, onChange: (e) => setRemarks(e.target.value) }), /* @__PURE__ */ React.createElement("div", { className: "rc-sign" }, /* @__PURE__ */ React.createElement("div", { className: "s" }, "Class Teacher"), /* @__PURE__ */ React.createElement("div", { className: "s" }, "Principal"), /* @__PURE__ */ React.createElement("div", { className: "s" }, "Parent / Guardian"))));
}
const QBANK = window.AZHAR_QBANK || {};
const QB = {
  "English|primary": ["Fill in the blank: She ____ (go/goes) to school every day.", "Write the plurals: box \u2192 ____ , child \u2192 ____", "Use these words in sentences: happy, school, friend", "Circle the noun: The boy plays with a red ball.", "Write the opposites: big, hot, day, fast", "Punctuate this sentence: where is my book", "Choose the correct word: I have (a / an) orange.", "Make a sentence from these words: garden / flowers / the / in", "Write five sentences about your school.", "Change to past tense: I play cricket.", "Circle the verb: Ali runs very fast.", "Fill in the blank: The sun rises in the ____."],
  "Urdu|primary": ["\u062E\u0627\u0644\u06CC \u062C\u06AF\u06C1 \u067E\u064F\u0631 \u06A9\u0631\u06CC\u06BA: \u0639\u0644\u0645 \u0628\u0691\u06CC ____ \u06C1\u06D2\u06D4 (\u062F\u0648\u0644\u062A / \u0686\u06CC\u0632)", "\u0648\u0627\u062D\u062F \u062C\u0645\u0639 \u0644\u06A9\u06BE\u06CC\u06BA: \u06A9\u062A\u0627\u0628 \u060C \u0642\u0644\u0645 \u060C \u0627\u0633\u062A\u0627\u062F", "\u0627\u0646 \u0627\u0644\u0641\u0627\u0638 \u06A9\u06D2 \u062C\u0645\u0644\u06D2 \u0628\u0646\u0627\u0626\u06CC\u06BA: \u0645\u062D\u0646\u062A \u060C \u06A9\u0627\u0645\u06CC\u0627\u0628\u06CC \u060C \u0648\u0642\u062A", "\u0645\u062A\u0636\u0627\u062F \u0627\u0644\u0641\u0627\u0638 \u0644\u06A9\u06BE\u06CC\u06BA: \u062F\u0646 \u060C \u0628\u0691\u0627 \u060C \u0631\u0648\u0634\u0646\u06CC", "\xAB\u0645\u06CC\u0631\u0627 \u0627\u0633\u06A9\u0648\u0644\xBB \u06A9\u06D2 \u0645\u0648\u0636\u0648\u0639 \u067E\u0631 \u067E\u0627\u0646\u0686 \u062C\u0645\u0644\u06D2 \u0644\u06A9\u06BE\u06CC\u06BA\u06D4", "\u0645\u0630\u06A9\u0631 \u0645\u0648\u0646\u062B \u0644\u06A9\u06BE\u06CC\u06BA: \u0627\u0633\u062A\u0627\u062F \u060C \u0628\u06A9\u0631\u06CC \u060C \u062F\u0627\u062F\u0627", "\u0645\u062D\u0627\u0648\u0631\u06C1 \u0645\u06A9\u0645\u0644 \u06A9\u0631\u06CC\u06BA: \u0646\u06CC\u06A9\u06CC \u06A9\u0631 \u062F\u0631\u06CC\u0627 \u0645\u06CC\u06BA ____", "\u062F\u0631\u0633\u062A \u062C\u0645\u0644\u06C1 \u0628\u0646\u0627\u0626\u06CC\u06BA: \u062C\u0627\u062A\u0627 \u0645\u06CC\u06BA \u0627\u0633\u06A9\u0648\u0644 \u06C1\u0648\u06BA", "\u0627\u0646 \u062D\u0631\u0648\u0641 \u0633\u06D2 \u0644\u0641\u0638 \u0628\u0646\u0627\u0626\u06CC\u06BA: \u0628 + \u0627 + \u063A = ____"],
  "General Knowledge|primary": ["What is the capital of Pakistan? ____", "How many provinces does Pakistan have? Name them.", "How many continents are there in the world? ____", "Which is the largest planet? ____", "Who is the founder of Pakistan? ____", "Which gas do plants give us? ____", "Name three sources of water.", "What is our national language? ____", "Name our national flower and national animal."],
  "Islamiat|primary": ["\u067E\u06C1\u0644\u0627 \u06A9\u0644\u0645\u06C1 \u0644\u06A9\u06BE\u06CC\u06BA\u06D4", "\u0646\u0645\u0627\u0632 \u062F\u0646 \u0645\u06CC\u06BA \u06A9\u062A\u0646\u06CC \u0628\u0627\u0631 \u0641\u0631\u0636 \u06C1\u06D2\u061F ____", "\u06C1\u0645\u0627\u0631\u06D2 \u067E\u06CC\u0627\u0631\u06D2 \u0646\u0628\u06CC \uFDFA \u06A9\u0627 \u0646\u0627\u0645\u0650 \u0645\u0628\u0627\u0631\u06A9 \u0644\u06A9\u06BE\u06CC\u06BA\u06D4", "\u0627\u0633\u0644\u0627\u0645 \u06A9\u06D2 \u067E\u0627\u0646\u0686 \u0627\u0631\u06A9\u0627\u0646 \u06A9\u06D2 \u0646\u0627\u0645 \u0644\u06A9\u06BE\u06CC\u06BA\u06D4", "\u0642\u0631\u0622\u0646 \u0645\u062C\u06CC\u062F \u06A9\u0633 \u0632\u0628\u0627\u0646 \u0645\u06CC\u06BA \u0646\u0627\u0632\u0644 \u06C1\u0648\u0627\u061F ____", "\u0631\u0645\u0636\u0627\u0646 \u06A9\u06D2 \u0645\u06C1\u06CC\u0646\u06D2 \u0645\u06CC\u06BA \u0645\u0633\u0644\u0645\u0627\u0646 \u06A9\u06CC\u0627 \u06A9\u0631\u062A\u06D2 \u06C1\u06CC\u06BA\u061F", "\u0648\u0636\u0648 \u06A9\u06D2 \u0641\u0631\u0627\u0626\u0636 \u06A9\u062A\u0646\u06D2 \u06C1\u06CC\u06BA\u061F ____", "\u0633\u0644\u0627\u0645 \u06A9\u0631\u0646\u06D2 \u0627\u0648\u0631 \u062C\u0648\u0627\u0628 \u062F\u06CC\u0646\u06D2 \u06A9\u0627 \u0637\u0631\u06CC\u0642\u06C1 \u0644\u06A9\u06BE\u06CC\u06BA\u06D4"],
  "Science|primary": ["Name the three states of matter.", "Which part of the plant makes food? ____", "We breathe in ____ and breathe out carbon dioxide.", "Name two sources of light.", "Water boils at ____ \xB0C.", "Which organ pumps blood in our body? ____", "Write three living and three non-living things.", "Why do we eat food? Write two reasons.", "Name the five senses."],
  "Social Studies|primary": ["Name the four provinces of Pakistan and their capitals.", "What is a map? ____", "Name three community helpers.", "The sun rises from the ____ .", "Write two duties of a good citizen.", "Name two famous cities of Pakistan.", "Why do we need rules? Write two reasons."],
  "Computer|primary": ["Name three parts of a computer.", "What do we use a keyboard for? ____", "Circle the input device: monitor / mouse / printer", "The brain of the computer is called ____ .", "Write two uses of computers in school.", "What does Save mean on a computer? ____"],
  "Nazra Quran|primary": ["\u0628\u0633\u0645 \u0627\u0644\u0644\u06C1 \u0645\u06A9\u0645\u0644 \u0644\u06A9\u06BE\u06CC\u06BA\u06D4", "\u0633\u0648\u0631\u06C3 \u0627\u0644\u0641\u0627\u062A\u062D\u06C1 \u06A9\u06CC \u067E\u06C1\u0644\u06CC \u0622\u06CC\u062A \u0644\u06A9\u06BE\u06CC\u06BA\u06D4", "\u062D\u0631\u0648\u0641\u0650 \u0645\u062F\u06C1 \u06A9\u0648\u0646 \u0633\u06D2 \u06C1\u06CC\u06BA\u061F ____", "\u0633\u0648\u0631\u06C3 \u0627\u0644\u0627\u062E\u0644\u0627\u0635 \u0632\u0628\u0627\u0646\u06CC \u0633\u0646\u0627\u0626\u06CC\u06BA\u06D4 (\u0632\u0628\u0627\u0646\u06CC)", "\u0646\u0648\u0646 \u0633\u0627\u06A9\u0646 \u06A9\u06CC \u0627\u06CC\u06A9 \u0645\u062B\u0627\u0644 \u0644\u06A9\u06BE\u06CC\u06BA\u06D4"]
};
function PaperGen({ schoolName, openBook }) {
  const [cls, setCls] = useLS("pg:cls", "Nursery");
  const early = isEarly(cls);
  const levelBooks = BOOKS.filter((b) => b.level === cls);
  const [bookId, setBookId] = useLS("pg:book", "");
  const book = BOOKS.find((b) => b.id === bookId);
  const bank = QBANK[bookId];
  useEffect(() => {
    if (early) {
      const ok = levelBooks.some((b) => b.id === bookId && QBANK[b.id]);
      if (!ok) {
        const first = levelBooks.find((b) => QBANK[b.id]);
        setBookId(first ? first.id : "");
      }
    }
  }, [cls]);
  const [subject, setSubject] = useLS("pg:subject", "English");
  useEffect(() => {
    if (!early && SUBJECT_POOL.primary.indexOf(subject) < 0) setSubject(SUBJECT_POOL.primary[0]);
  }, [cls]);
  const maxPage = bank ? Math.max.apply(null, bank.items.map((q) => q.pg)) : 1;
  const [pgFrom, setPgFrom] = useState(1);
  const [pgTo, setPgTo] = useState(999);
  useEffect(() => {
    setPgFrom(1);
    setPgTo(maxPage);
  }, [bookId]);
  const [count, setCount] = useLS("pg:count", 10);
  const [title, setTitle] = useLS("pg:title", "Monthly Test");
  const [paper, setPaper] = useState(null);
  const [qbank, setQbank] = useLS("qbank2", []);
  const [nq, setNq] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const target = early ? bookId : subject + "|primary";
  const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const mathQ = () => {
    if (subject === "Tables") {
      const a2 = R(2, 10), b2 = R(1, 10);
      return { text: a2 + " \xD7 " + b2 + " = ____", answer: String(a2 * b2) };
    }
    if (cls === "One" || cls === "Two") {
      const a2 = R(10, 99), b2 = R(1, a2);
      return Math.random() < 0.5 ? { text: a2 + " + " + b2 + " = ____", answer: String(a2 + b2) } : { text: a2 + " \u2212 " + b2 + " = ____", answer: String(a2 - b2) };
    }
    const a = R(2, 12), b = R(2, 12);
    return Math.random() < 0.5 ? { text: a + " \xD7 " + b + " = ____", answer: String(a * b) } : { text: a * b + " \xF7 " + a + " = ____", answer: String(b) };
  };
  const shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t2 = arr[i];
      arr[i] = arr[j];
      arr[j] = t2;
    }
    return arr;
  };
  const generate = () => {
    let pool = [];
    if (early) {
      if (!bank) {
        toast("Pick a book first", "\u2139\uFE0F");
        return;
      }
      pool = bank.items.filter((q) => q.pg >= pgFrom && q.pg <= pgTo).map((q) => Object.assign({}, q));
    } else {
      if (subject === "Maths" || subject === "Tables") {
        for (let i = 0; i < count * 3; i++) pool.push(Object.assign({ k: "short" }, mathQ()));
      }
      const alias = { Islamiat: "Islamiyat" };
      BOOKS.filter((b) => b.level === cls && QBANK[b.id] && b.subject === (alias[subject] || subject)).forEach((b) => QBANK[b.id].items.forEach((q) => pool.push(Object.assign({}, q))));
      (QB[subject + "|primary"] || []).forEach((s2) => pool.push({ k: "short", text: s2, answer: "" }));
    }
    qbank.filter((q) => q.target === target).forEach((q) => pool.push({ k: "short", text: q.text, answer: "" }));
    if (!pool.length) {
      toast("No questions in this page range \u2014 widen it", "\u26A0\uFE0F");
      return;
    }
    shuffle(pool);
    const seen = {}, out = [];
    pool.forEach((q) => {
      if (!seen[q.text] && out.length < count) {
        seen[q.text] = 1;
        out.push(q);
      }
    });
    out.forEach((q) => {
      if (q.k === "match" && q.pairs) {
        q.left = q.pairs.map((p) => p[0]);
        q.right = shuffle(q.pairs.map((p) => p[1]).slice());
      }
    });
    setPaper(out);
    toast("Paper ready \u2014 " + out.length + " questions", "\u{1F4DD}");
  };
  const esc2 = (s2) => String(s2).replace(/</g, "&lt;");
  const qHTML = (q, i) => {
    let body;
    if (q.k === "mcq") body = `<div>${esc2(q.text)}</div><div style="margin-top:9px">${q.options.map((o) => `\u25EF ${esc2(o)}`).join("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;")}</div>`;
    else if (q.k === "match") body = `<div>${esc2(q.text)}</div><table style="margin-top:9px;width:auto;border-collapse:collapse"><tr>${q.left.map((l) => `<td style="border:1px solid #ccd3e0;padding:6px 14px;text-align:center">${esc2(l)}</td>`).join("")}</tr><tr>${q.right.map((r2) => `<td style="border:1px solid #ccd3e0;padding:6px 14px;text-align:center">${esc2(r2)}</td>`).join("")}</tr></table><div style="font-size:11px;color:#99a;margin-top:4px">Draw lines to match the two rows.</div>`;
    else body = `<div>${esc2(q.text)}</div>`;
    return `<div style="display:flex;gap:10px;margin:0 0 24px;font-size:14px"><b>${i + 1}.</b><div style="flex:1">${body}</div><span style="color:#99a;font-size:11px;white-space:nowrap">/ 1</span></div>`;
  };
  const printPaper = (withKey) => {
    if (!paper) return;
    const src = early ? book ? book.title + " \xB7 pages " + pgFrom + "\u2013" + pgTo + " \xB7 " + cls : "" : subject + " \xB7 Class " + cls;
    const key = withKey ? `<div style="page-break-before:always"><h1 style="font-size:16px">Answer Key (teacher copy)</h1>` + paper.map((q, i) => {
      let a = q.answer || "";
      if (q.k === "match" && q.pairs) a = q.pairs.map((p) => p[0] + " \u2192 " + p[1]).join(" ,  ");
      return a ? `<div style="font-size:12.5px;margin-bottom:6px"><b>${i + 1}.</b> ${esc2(a)} ${q.pg ? '<span style="color:#99a">(p. ' + q.pg + ")</span>" : ""}</div>` : "";
    }).join("") + "</div>" : "";
    printHTML(
      title,
      `<h1>${esc2(schoolName)}</h1><div class="sub">${esc2(title)} \xB7 ${esc2(src)} \xB7 Total Marks: ${paper.length}</div>
       <div style="display:flex;gap:26px;font-size:13px;margin:14px 0 24px;flex-wrap:wrap"><span>Name: __________________</span><span>Roll No: ______</span><span>Date: __________</span></div>
       ${paper.map(qHTML).join("")}${key}`
    );
  };
  const addQ = () => {
    const v = nq.trim();
    if (!v || !target) return;
    setQbank((p) => [...p, { id: Date.now(), target, text: v }]);
    setNq("");
    toast("Question added");
  };
  const myQs = qbank.filter((q) => q.target === target);
  const inRange = bank ? bank.items.filter((q) => q.pg >= pgFrom && q.pg <= pgTo).length : 0;
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "page-head" }, /* @__PURE__ */ React.createElement("h2", null, "\u{1F4DD} ", t("Paper Generator")), /* @__PURE__ */ React.createElement("p", null, "Pick the book and the pages you've taught, press Generate, print. Every paper is built from the book's own pages.")), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "rc-toolbar", style: { marginBottom: 0 } }, /* @__PURE__ */ React.createElement("select", { className: "tt-sel", value: cls, onChange: (e) => {
    setCls(e.target.value);
    setPaper(null);
  } }, TT_CLASSES.map((c) => /* @__PURE__ */ React.createElement("option", { key: c }, c))), early ? /* @__PURE__ */ React.createElement("select", { className: "tt-sel", value: bookId, onChange: (e) => {
    setBookId(e.target.value);
    setPaper(null);
  }, style: { maxWidth: 250 } }, levelBooks.map((b) => /* @__PURE__ */ React.createElement("option", { key: b.id, value: b.id, disabled: !QBANK[b.id] }, b.title, QBANK[b.id] ? "" : " (no bank)"))) : /* @__PURE__ */ React.createElement("select", { className: "tt-sel", value: subject, onChange: (e) => {
    setSubject(e.target.value);
    setPaper(null);
  } }, SUBJECT_POOL.primary.map((s2) => /* @__PURE__ */ React.createElement("option", { key: s2 }, s2))), early && bank && /* @__PURE__ */ React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700 } }, "p.", /* @__PURE__ */ React.createElement("input", { type: "number", className: "date-inp", style: { width: 62, padding: "6px 8px" }, min: 1, max: maxPage, value: pgFrom, onChange: (e) => {
    setPgFrom(Math.max(1, +e.target.value || 1));
    setPaper(null);
  } }), "\u2013", /* @__PURE__ */ React.createElement("input", { type: "number", className: "date-inp", style: { width: 62, padding: "6px 8px" }, min: 1, max: maxPage, value: pgTo, onChange: (e) => {
    setPgTo(Math.min(maxPage, +e.target.value || maxPage));
    setPaper(null);
  } })), /* @__PURE__ */ React.createElement("select", { className: "tt-sel", value: count, onChange: (e) => setCount(+e.target.value) }, [5, 10, 15, 20].map((n) => /* @__PURE__ */ React.createElement("option", { key: n, value: n }, n, " Qs"))), /* @__PURE__ */ React.createElement("select", { className: "tt-sel", value: title, onChange: (e) => setTitle(e.target.value) }, ["Monthly Test", "Class Test", "1st Term Exam", "2nd Term Exam", "3rd Term Exam", "Practice Worksheet"].map((x) => /* @__PURE__ */ React.createElement("option", { key: x }, x))), /* @__PURE__ */ React.createElement("button", { className: "btn btn-navy", onClick: generate }, "\u{1F3B2} Generate paper")), /* @__PURE__ */ React.createElement("p", { className: "hint" }, early ? bank ? inRange + " questions available in this range (book has " + maxPage + " pages). Ready-made PDF papers stay on each book's page in the Library." : "Pick a book to begin." : "Classes One\u2013Five use the subject bank plus questions from that class\u2019s own books (like the Al-Fatah series) where available. Maths and Tables sums are freshly generated every time.", " ", /* @__PURE__ */ React.createElement("button", { className: "link-btn", onClick: () => setShowAdd((x) => !x) }, showAdd ? "Hide my questions" : "\u2795 Add your own questions")), showAdd && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 6 } }, /* @__PURE__ */ React.createElement("div", { className: "quick-add", style: { marginBottom: 6 } }, /* @__PURE__ */ React.createElement("input", { placeholder: "Type a question to add\u2026", value: nq, onChange: (e) => setNq(e.target.value), onKeyDown: (e) => e.key === "Enter" && addQ(), style: { maxWidth: 520 } }), /* @__PURE__ */ React.createElement("button", { className: "btn btn-navy btn-sm", onClick: addQ }, "Add")), myQs.map((q) => /* @__PURE__ */ React.createElement("div", { key: q.id, className: "notice-item" }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13 } }, q.text), /* @__PURE__ */ React.createElement("button", { className: "del-btn", onClick: () => setQbank((p) => p.filter((x) => x.id !== q.id)) }, "\u2715"))))), paper && /* @__PURE__ */ React.createElement("div", { className: "card", style: { borderLeft: "4px solid var(--green)" } }, /* @__PURE__ */ React.createElement("div", { className: "card-flex" }, /* @__PURE__ */ React.createElement("h3", null, "\u2705 ", title, " \xB7 ", early ? book ? book.title : "" : subject + " \xB7 Class " + cls, " \xB7 ", paper.length, " questions"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-navy btn-sm", onClick: () => printPaper(false) }, "\u{1F5A8}\uFE0F Print for students"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-outline btn-sm", onClick: () => printPaper(true) }, "\u{1F5A8}\uFE0F Print with answers"), /* @__PURE__ */ React.createElement("button", { className: "mini-btn ghost", onClick: generate }, "\u{1F504} Shuffle"))), paper.map((q, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--border)", fontSize: 13.5, alignItems: "flex-start" } }, /* @__PURE__ */ React.createElement("b", { style: { color: "var(--brand)" } }, i + 1, "."), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", null, q.text), q.k === "mcq" && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 5, color: "var(--muted)", fontSize: 12.5 } }, q.options.map((o, oi) => /* @__PURE__ */ React.createElement("span", { key: oi, style: { marginRight: 16 } }, "\u25EF ", o))), q.k === "match" && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 5, color: "var(--muted)", fontSize: 12.5 } }, q.left.join("  \xB7  "), "  \u21C4  ", q.right.join("  \xB7  "))), q.pg ? /* @__PURE__ */ React.createElement("span", { className: "mini", title: q.pt }, "p. ", q.pg) : null))));
}
function Planner({ schoolName, openBook }) {
  const [cls, setCls] = useLS("pl:cls", "Nursery");
  const [sec, setSec] = useLS("pl:sec", "A");
  const [term, setTerm] = useLS("pl:term", "1st Term");
  const [week, setWeek] = useLS("pl:week", 1);
  const [plans, setPlans] = useLS("planner", {});
  const subs = isEarly(cls) ? SUBJECT_POOL.early : SUBJECT_POOL.primary;
  const key = cls + " " + sec + "|" + term + "|W" + week;
  const plan = plans[key] || { rows: {}, notes: "" };
  const setRow = (s2, v) => setPlans({ ...plans, [key]: { rows: { ...plan.rows, [s2]: v }, notes: plan.notes } });
  const setNotes = (v) => setPlans({ ...plans, [key]: { rows: plan.rows, notes: v } });
  const copyPrev = () => {
    if (week <= 1) {
      toast("This is week 1", "\u2139\uFE0F");
      return;
    }
    const pk = cls + " " + sec + "|" + term + "|W" + (week - 1);
    if (plans[pk]) {
      setPlans({ ...plans, [key]: JSON.parse(JSON.stringify(plans[pk])) });
      toast("Copied week " + (week - 1) + " \u2014 edit what's new", "\u{1F4CB}");
    } else toast("Week " + (week - 1) + " has no plan yet", "\u2139\uFE0F");
  };
  const esc2 = (s2) => String(s2).replace(/</g, "&lt;");
  const printWeek = () => printHTML(
    "Lesson Plan " + cls + " " + sec,
    `<h1>${esc2(schoolName)}</h1><div class="sub">Weekly Lesson Plan \u2014 ${esc2(cls)} ${esc2(sec)} \xB7 ${esc2(term)} \xB7 Week ${week}</div>
     <table><tr><th style="width:150px">Subject</th><th>Topic \xB7 Book pages \xB7 Activity</th></tr>
     ${subs.map((s2) => `<tr><td><b>${esc2(s2)}</b></td><td>${esc2(plan.rows[s2] || "") || "\u2014"}</td></tr>`).join("")}</table>
     ${plan.notes ? `<p style="font-size:12.5px;margin-top:14px"><b>Notes:</b> ${esc2(plan.notes)}</p>` : ""}`
  );
  const filled = subs.filter((s2) => plan.rows[s2] && plan.rows[s2].trim()).length;
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "page-head" }, /* @__PURE__ */ React.createElement("h2", null, "\u{1F5D3}\uFE0F ", t("Lesson Planner")), /* @__PURE__ */ React.createElement("p", null, "One line per subject per week \u2014 what you'll teach and which book pages. Saves as you type.")), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "rc-toolbar" }, /* @__PURE__ */ React.createElement("select", { className: "tt-sel", value: cls, onChange: (e) => setCls(e.target.value) }, TT_CLASSES.map((c) => /* @__PURE__ */ React.createElement("option", { key: c }, c))), /* @__PURE__ */ React.createElement("select", { className: "tt-sel", value: sec, onChange: (e) => setSec(e.target.value) }, TT_SECTIONS.map((x) => /* @__PURE__ */ React.createElement("option", { key: x }, "Sec ", x))), /* @__PURE__ */ React.createElement("select", { className: "tt-sel", value: term, onChange: (e) => setTerm(e.target.value) }, GB_TERMS.map((x) => /* @__PURE__ */ React.createElement("option", { key: x }, x))), /* @__PURE__ */ React.createElement("select", { className: "tt-sel", value: week, onChange: (e) => setWeek(+e.target.value) }, Array.from({ length: 14 }, (_, i) => i + 1).map((w2) => /* @__PURE__ */ React.createElement("option", { key: w2, value: w2 }, "Week ", w2))), /* @__PURE__ */ React.createElement("button", { className: "mini-btn ghost", onClick: copyPrev }, "\u{1F4CB} Copy last week"), /* @__PURE__ */ React.createElement("button", { className: "mini-btn ghost", onClick: printWeek }, "\u{1F5A8}\uFE0F Print this week"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, fontWeight: 800, color: filled === subs.length && filled > 0 ? "var(--green)" : "var(--muted)" } }, filled, "/", subs.length, " planned \xB7 \u{1F4BE} auto-saves")), /* @__PURE__ */ React.createElement("table", { className: "gtable" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { style: { width: 170 } }, "Subject"), /* @__PURE__ */ React.createElement("th", null, "What will you teach? (topic \xB7 book pages \xB7 activity)"))), /* @__PURE__ */ React.createElement("tbody", null, subs.map((s2) => /* @__PURE__ */ React.createElement("tr", { key: s2 }, /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("b", null, s2)), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("input", { className: "tt-inp", style: { textAlign: "left", minWidth: 220 }, placeholder: "e.g. " + (isEarly(cls) ? "Counting book p. 12\u201315 \xB7 numbers 6\u201310" : "Unit 3 \xB7 exercise Q1\u20135"), value: plan.rows[s2] || "", onChange: (e) => setRow(s2, e.target.value) })))))), /* @__PURE__ */ React.createElement("div", { className: "field", style: { marginTop: 14 } }, /* @__PURE__ */ React.createElement("label", null, "Notes for the week (optional)"), /* @__PURE__ */ React.createElement("input", { value: plan.notes, onChange: (e) => setNotes(e.target.value), placeholder: "e.g. Monthly Test 2 on Friday \xB7 PTM Saturday" }))));
}
const CERT_TYPES = [
  ["\u2B50", "Star of the Week", "for shining bright in class this week"],
  ["\u{1F5D3}\uFE0F", "Excellent Attendance", "for wonderful regularity and punctuality"],
  ["\u270D\uFE0F", "Best Handwriting", "for beautiful, careful writing"],
  ["\u{1F4DA}", "Reading Champion", "for outstanding progress in reading"],
  ["\u{1F49A}", "Good Behaviour Award", "for kindness and wonderful manners"],
  ["\u{1F3C6}", "Achievement Award", "for excellent performance"]
];
function Certificates({ students, schoolName }) {
  const [name, setName] = useState(students[0] ? students[0].name : "");
  const [ti, setTi] = useState(0);
  const [reason, setReason] = useState("");
  const stu = students.find((x) => x.name === name);
  const clsLabel = stu ? stu.cls + " " + stu.sec : "";
  const [em, title, defReason] = CERT_TYPES[ti];
  const why = reason.trim() || defReason;
  const dateStr = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const printCert = () => {
    const w = window.open("", "_blank", "width=980,height=720");
    if (!w) return;
    const av = stu && stu.photo ? `<img src="${stu.photo}" style="width:96px;height:96px;border-radius:50%;object-fit:cover;border:4px solid #F0A500;box-shadow:0 4px 14px rgba(0,0,0,.25)"/>` : `<div style="font-size:64px">${em}</div>`;
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Certificate \u2014 ${name}</title>
    <style>@page{size:A4 landscape;margin:10mm}
    body{font-family:Georgia,'Times New Roman',serif;margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f4efe4}
    .cert{width:960px;background:#fffdf6;border:10px solid #0f3460;outline:4px solid #F0A500;outline-offset:-22px;padding:56px 70px;text-align:center;position:relative}
    .sch{font-size:15px;letter-spacing:4px;text-transform:uppercase;color:#0f3460;font-weight:700}
    .big{font-size:44px;color:#0f3460;margin:14px 0 2px;letter-spacing:2px}
    .type{font-size:22px;color:#e94560;font-style:italic;margin-bottom:22px}
    .pres{font-size:13px;color:#888;letter-spacing:2px;text-transform:uppercase}
    .nm{font-size:40px;color:#1a1a2e;margin:12px 0 4px;font-style:italic}
    .cl{font-size:14px;color:#777;margin-bottom:14px}
    .why{font-size:16px;color:#444;max-width:600px;margin:0 auto 26px;line-height:1.6}
    .ph{margin:6px auto 14px;display:flex;justify-content:center}
    .row{display:flex;justify-content:space-between;margin-top:38px;font-size:12px;color:#666}
    .row div{border-top:1.5px solid #333;padding:6px 30px 0}
    .dt{position:absolute;top:26px;right:36px;font-size:12px;color:#999}
    .btn{position:fixed;bottom:16px;left:50%;transform:translateX(-50%);padding:11px 26px;background:#0f3460;color:#fff;border:none;border-radius:9px;font-size:14px;font-weight:700;cursor:pointer;font-family:sans-serif}
    @media print{.btn{display:none}body{background:#fff}}</style></head><body>
    <div class="cert"><div class="dt">${dateStr}</div>
      <div class="sch">${schoolName} \xB7 Azhar Publishers</div>
      <div class="big">\u{1F3C5} CERTIFICATE</div>
      <div class="type">${em} ${title}</div>
      <div class="ph">${av}</div>
      <div class="pres">proudly presented to</div>
      <div class="nm">${name}</div>
      <div class="cl">${clsLabel ? "Class " + clsLabel + " \xB7 " : ""}Session 2026\u201327</div>
      <div class="why">${why}</div>
      <div class="row"><div>Class Teacher</div><div>Principal</div></div>
    </div>
    <button class="btn" onclick="window.print()">\u{1F5A8}\uFE0F Print certificate</button>
    </body></html>`);
    w.document.close();
    toast("Certificate ready \u2014 landscape A4 \u{1F3C5}");
  };
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "page-head" }, /* @__PURE__ */ React.createElement("h2", null, "\u{1F3C5} ", t("Certificates")), /* @__PURE__ */ React.createElement("p", null, "A printable award in three taps \u2014 pick the child, pick the award, print.")), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("h3", null, /* @__PURE__ */ React.createElement("span", { style: { marginRight: 6 } }, "1."), "Who is it for?"), /* @__PURE__ */ React.createElement("div", { className: "filter-bar", style: { marginBottom: 6 } }, /* @__PURE__ */ React.createElement("select", { className: "tt-sel", value: name, onChange: (e) => setName(e.target.value), style: { minWidth: 220 } }, students.map((s) => /* @__PURE__ */ React.createElement("option", { key: s.id, value: s.name }, s.name, " \xB7 ", s.cls, " ", s.sec))), /* @__PURE__ */ React.createElement("input", { className: "date-inp", style: { minWidth: 200, fontWeight: 600 }, placeholder: "\u2026or type any name", value: name, onChange: (e) => setName(e.target.value) }))), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("h3", null, /* @__PURE__ */ React.createElement("span", { style: { marginRight: 6 } }, "2."), "Which award?"), /* @__PURE__ */ React.createElement("div", { className: "filter-bar" }, CERT_TYPES.map((c, i) => /* @__PURE__ */ React.createElement("span", { key: i, className: "fchip" + (ti === i ? " active" : ""), onClick: () => setTi(i) }, c[0], " ", c[1]))), /* @__PURE__ */ React.createElement("div", { className: "quick-add", style: { marginTop: 10, marginBottom: 0 } }, /* @__PURE__ */ React.createElement("input", { placeholder: 'Reason (optional \u2014 otherwise: "' + defReason + '")', value: reason, onChange: (e) => setReason(e.target.value), style: { maxWidth: 520 } }))), /* @__PURE__ */ React.createElement("div", { className: "card", style: { borderLeft: "4px solid var(--gold)" } }, /* @__PURE__ */ React.createElement("div", { className: "card-flex" }, /* @__PURE__ */ React.createElement("h3", null, /* @__PURE__ */ React.createElement("span", { style: { marginRight: 6 } }, "3."), "Preview"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-navy", onClick: printCert }, "\u{1F5A8}\uFE0F Print certificate")), /* @__PURE__ */ React.createElement("div", { style: { border: "6px solid var(--navy)", outline: "3px solid var(--gold)", outlineOffset: -14, borderRadius: 4, padding: "30px 24px", textAlign: "center", background: "#fffdf6", color: "#1a1a2e" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "#0f3460", fontWeight: 700 } }, schoolName), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 26, color: "#0f3460", fontWeight: 800, margin: "8px 0 2px" } }, "\u{1F3C5} CERTIFICATE"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, color: "#e94560", fontStyle: "italic", marginBottom: 12 } }, em, " ", title), stu && stu.photo && /* @__PURE__ */ React.createElement("img", { src: stu.photo, alt: "", style: { width: 64, height: 64, borderRadius: "50%", objectFit: "cover", border: "3px solid #F0A500", marginBottom: 8 } }), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "#999", letterSpacing: 2, textTransform: "uppercase" } }, "proudly presented to"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 26, fontStyle: "italic", margin: "4px 0" } }, name || "\u2014"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: "#555", maxWidth: 420, margin: "6px auto 0" } }, why)), /* @__PURE__ */ React.createElement("p", { className: "hint" }, "Prints on A4 landscape with signature lines for teacher and principal. Uses the student's photo if one is saved in School Management.")));
}
function Diary({ schoolName }) {
  const [cls, setCls] = useLS("dy:cls", "Nursery");
  const [sec, setSec] = useLS("dy:sec", "A");
  const [date, setDate] = useState(todayISO());
  const [diary, setDiary] = useLS("diary", {});
  const key = cls + " " + sec + "|" + date;
  const subs = isEarly(cls) ? SUBJECT_POOL.early : SUBJECT_POOL.primary;
  const entry = diary[key] || { rows: {}, note: "" };
  const setRow = (su, v) => setDiary({ ...diary, [key]: { rows: { ...entry.rows, [su]: v }, note: entry.note } });
  const setNote = (v) => setDiary({ ...diary, [key]: { rows: entry.rows, note: v } });
  const filled = subs.filter((su) => entry.rows[su] && entry.rows[su].trim());
  const esc = (x) => String(x == null ? "" : x).replace(/</g, "&lt;");
  const printDiary = () => printHTML(
    "Homework " + cls + " " + sec,
    `<h1>${esc(schoolName)}</h1><div class="sub">Homework Diary \u2014 ${esc(cls)} ${esc(sec)} \xB7 ${niceDate(date)}</div>
     <table><tr><th style="width:150px">Subject</th><th>Homework</th></tr>
     ${subs.map((su) => `<tr><td><b>${esc(su)}</b></td><td>${esc(entry.rows[su] || "") || "\u2014"}</td></tr>`).join("")}</table>
     ${entry.note ? `<p style="font-size:12.5px;margin-top:14px"><b>Note for parents:</b> ${esc(entry.note)}</p>` : ""}`
  );
  const waShare = () => {
    if (!filled.length) {
      toast("Write some homework first \u270D\uFE0F");
      return;
    }
    const lines = filled.map((su) => "\u2022 " + su + ": " + entry.rows[su]).join("\\n");
    const msg = "\u{1F4D4} *Homework \u2014 " + cls + " " + sec + "* (" + niceDate(date) + ")\\n" + schoolName + "\\n\\n" + lines + (entry.note ? "\\n\\n\u{1F4CC} " + entry.note : "");
    window.open("https://wa.me/?text=" + encodeURIComponent(msg), "_blank");
  };
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "page-head" }, /* @__PURE__ */ React.createElement("h2", null, "\u{1F4D4} ", t("Homework Diary")), /* @__PURE__ */ React.createElement("p", null, "Today's homework for the whole class \u2014 write once, print for the board or send to the parents' WhatsApp group.")), /* @__PURE__ */ React.createElement("div", { className: "rc-toolbar" }, /* @__PURE__ */ React.createElement("select", { className: "tt-sel", value: cls, onChange: (e) => setCls(e.target.value) }, TT_CLASSES.map((c) => /* @__PURE__ */ React.createElement("option", { key: c }, c))), /* @__PURE__ */ React.createElement("select", { className: "tt-sel", value: sec, onChange: (e) => setSec(e.target.value) }, TT_SECTIONS.map((x) => /* @__PURE__ */ React.createElement("option", { key: x }, x))), /* @__PURE__ */ React.createElement("input", { type: "date", className: "date-inp", value: date, onChange: (e) => setDate(e.target.value) }), /* @__PURE__ */ React.createElement("button", { className: "mini-btn ghost", onClick: printDiary }, "\u{1F5A8}\uFE0F Print"), /* @__PURE__ */ React.createElement("button", { className: "mini-btn wa", onClick: waShare }, "\u{1F4AC} Send to WhatsApp")), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-flex" }, /* @__PURE__ */ React.createElement("h3", null, cls, " ", sec, " \xB7 ", niceDate(date)), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, fontWeight: 800, color: filled.length ? "var(--green)" : "var(--muted)" } }, filled.length, " of ", subs.length, " subjects \xB7 \u{1F4BE} saves automatically")), /* @__PURE__ */ React.createElement("table", { className: "gtable" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { style: { width: 170 } }, "Subject"), /* @__PURE__ */ React.createElement("th", null, "Homework"))), /* @__PURE__ */ React.createElement("tbody", null, subs.map((su) => /* @__PURE__ */ React.createElement("tr", { key: su }, /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("b", null, su)), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("input", { className: "tt-inp", style: { textAlign: "left", minWidth: 220 }, placeholder: "e.g. " + (isEarly(cls) ? "Trace numbers 1\u20135 \xB7 colour the apple" : "Ex 4.2 Q1\u20135 \xB7 learn definitions"), value: entry.rows[su] || "", onChange: (e) => setRow(su, e.target.value) })))))), /* @__PURE__ */ React.createElement("div", { className: "field", style: { marginTop: 14 } }, /* @__PURE__ */ React.createElement("label", null, "Note for parents (optional)"), /* @__PURE__ */ React.createElement("input", { value: entry.note, onChange: (e) => setNote(e.target.value), placeholder: "e.g. Please send colour pencils tomorrow" })), /* @__PURE__ */ React.createElement("p", { className: "hint" }, "Leave a subject blank if there's no homework. Every class + day keeps its own diary \u2014 pick any date to see or edit it.")));
}
const SEED_STUDENTS = [
  { id: 1, name: "Ahmed Ali", cls: "Nursery", sec: "A", roll: 1, guardian: "Ali Raza", phone: "0300-1234501", fee: 4500, paid: 4500 },
  { id: 2, name: "Fatima Noor", cls: "Nursery", sec: "A", roll: 2, guardian: "Noor Ahmed", phone: "0300-1234502", fee: 4500, paid: 0 },
  { id: 3, name: "Hassan Raza", cls: "Prep", sec: "A", roll: 1, guardian: "Raza Khan", phone: "0300-1234503", fee: 5e3, paid: 5e3 },
  { id: 4, name: "Zoya Khan", cls: "Prep", sec: "B", roll: 2, guardian: "Imran Khan", phone: "0300-1234504", fee: 5e3, paid: 2500 },
  { id: 5, name: "Bilal Aslam", cls: "Playgroup", sec: "A", roll: 1, guardian: "Aslam Butt", phone: "0300-1234505", fee: 4e3, paid: 4e3 },
  { id: 6, name: "Ayesha Tariq", cls: "Playgroup", sec: "A", roll: 2, guardian: "Tariq Mehmood", phone: "0300-1234506", fee: 4e3, paid: 0 },
  { id: 7, name: "Usman Ghani", cls: "One", sec: "A", roll: 1, guardian: "Ghani Sheikh", phone: "0300-1234507", fee: 5500, paid: 5500 },
  { id: 8, name: "Maryam Iqbal", cls: "One", sec: "A", roll: 2, guardian: "Iqbal Ahmed", phone: "0300-1234508", fee: 5500, paid: 5500 },
  { id: 9, name: "Hamza Sheikh", cls: "Two", sec: "A", roll: 1, guardian: "Sheikh Riaz", phone: "0300-1234509", fee: 6e3, paid: 3e3 },
  { id: 10, name: "Sara Malik", cls: "Two", sec: "A", roll: 2, guardian: "Malik Zubair", phone: "0300-1234510", fee: 6e3, paid: 0 },
  { id: 11, name: "Ali Hamza", cls: "Prep", sec: "A", roll: 3, guardian: "Hamza Gul", phone: "0300-1234511", fee: 5e3, paid: 5e3 },
  { id: 12, name: "Hina Shah", cls: "Nursery", sec: "B", roll: 3, guardian: "Shah Nawaz", phone: "0300-1234512", fee: 4500, paid: 4500 }
];
const SEED_STAFF = [
  { id: 1, name: "Mrs. Aisha Khan", role: "Teacher", subject: "English", phone: "0300-1112201", salary: 45e3 },
  { id: 2, name: "Ms. Sana Tariq", role: "Teacher", subject: "Urdu", phone: "0300-1112202", salary: 42e3 },
  { id: 3, name: "Mr. Bilal Ahmed", role: "Teacher", subject: "Maths", phone: "0300-1112203", salary: 44e3 },
  { id: 4, name: "Ms. Nadia Aslam", role: "Teacher", subject: "Counting", phone: "0300-1112204", salary: 4e4 },
  { id: 5, name: "Mr. Khalid Mehmood", role: "Admin", subject: "\u2014", phone: "0300-1112205", salary: 55e3 },
  { id: 6, name: "Mr. Rashid Ali", role: "Support", subject: "\u2014", phone: "0300-1112206", salary: 25e3 }
];
const SEED_NOTICES = [
  { id: 1, date: "6 Jul 2026", title: "Parent\u2013Teacher Meeting", body: "PTM for all classes this Friday, 10 July at 9:00 AM." },
  { id: 2, date: "3 Jul 2026", title: "Fee Due Reminder", body: "July fees are due by the 10th. Please clear outstanding dues." },
  { id: 3, date: "1 Jul 2026", title: "New Term Begins", body: "First term 2026\u201327 has started. Welcome back!" }
];
const SEED_PAYMENTS = [
  { id: 1, student: "Ahmed Ali", cls: "Nursery", amount: 4500, method: "Cash", date: "5 Jul 2026" },
  { id: 2, student: "Hassan Raza", cls: "Prep", amount: 5e3, method: "Bank Transfer", date: "4 Jul 2026" },
  { id: 3, student: "Zoya Khan", cls: "Prep", amount: 2500, method: "JazzCash", date: "4 Jul 2026" }
];
const FEE_HISTORY = [["Feb", 312], ["Mar", 298], ["Apr", 335], ["May", 321], ["Jun", 348]];
const TT_TIMES = ["8:30", "9:15", "10:00", "11:15", "12:00"];
const TT_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const EY_SUBJECTS = ["English", "Urdu", "Counting", "G. Knowledge", "Rhymes", "Art", "Story", "Free Play"];
const PR_SUBJECTS = ["English", "Urdu", "Maths", "Islamiat", "G. Knowledge", "Science", "Social Studies", "Computer", "Nazra Quran", "Art", "P.E."];
function genTimetable(cls) {
  const early = isEarly(cls);
  const pool = early ? EY_SUBJECTS : PR_SUBJECTS;
  const grid = [];
  for (let d = 0; d < TT_DAYS.length; d++) {
    const row = [];
    for (let p = 0; p < TT_TIMES.length; p++) row.push(pool[(d * 3 + p * 2 + d) % pool.length]);
    grid.push(row);
  }
  return grid;
}
const SEED_TT = (() => {
  const o = {};
  TT_CLASSES.forEach((c) => TT_SECTIONS.forEach((s) => {
    o[c + "-" + s] = genTimetable(c);
  }));
  return o;
})();
function AdminSMS({ students, setStudents, notices, setNotices, schoolName }) {
  const [tab, setTab] = useLS("sms:tab", "overview");
  const [staff, setStaff] = useLS("sms:staff", SEED_STAFF);
  const [payments, setPayments] = useLS("sms:payments", SEED_PAYMENTS);
  const [timetables, setTimetables] = useLS("sms:timetables", SEED_TT);
  const [stuAttAll, setStuAttAll] = useLS("sms:stuAtt", {});
  const [staffAttAll, setStaffAttAll] = useLS("sms:staffAtt", {});
  const [attDate, setAttDate] = useState(todayISO());
  const [nf, setNf] = useState({ title: "", body: "" });
  const [sf, setSf] = useState({ name: "", cls: "Playgroup", sec: "A", guardian: "", phone: "", fee: 4e3 });
  const [stf, setStf] = useState({ name: "", role: "Teacher", subject: "", phone: "", salary: 4e4 });
  const [clsFilter, setClsFilter] = useState("All");
  const [attCls, setAttCls] = useState("All");
  const [payFor, setPayFor] = useState(null);
  const [payAmt, setPayAmt] = useState(0);
  useEffect(() => {
    if (CLOUD.user && CLOUD.user.cloud) cloudPushAttendance(stuAttAll);
  }, [stuAttAll]);
  useEffect(() => {
    if (CLOUD.user && CLOUD.user.cloud) cloudPushStaff(staff);
  }, [staff]);
  const linkParent = async (st) => {
    const em = prompt("Parent's email (they must have created a Family portal account first):");
    if (!em) return;
    const err = await cloudLinkParent(st, em);
    if (err) toast(err, "\u26A0\uFE0F");
    else toast("Linked! " + em + " can now see " + st.name + " in the Family portal", "\u{1F46A}");
  };
  const [payMethod, setPayMethod] = useState("Cash");
  const [ttClass, setTtClass] = useState("Nursery");
  const [ttSec, setTtSec] = useState("A");
  const [photoMenu, setPhotoMenu] = useState(null);
  const [stuQ, setStuQ] = useState("");
  const [repMonth, setRepMonth] = useState(todayISO().slice(0, 7));
  const setPhoto = (kind, id, data) => {
    const upd = (p) => p.map((x) => x.id === id ? { ...x, photo: data } : x);
    if (kind === "student") setStudents(upd);
    else setStaff(upd);
    toast(data ? "Photo saved" : "Photo removed", data ? "\u{1F4F7}" : "\u{1F5D1}\uFE0F");
  };
  const avatarClick = (kind, rec) => {
    if (rec.photo) setPhotoMenu({ kind, rec });
    else pickPhoto((d) => setPhoto(kind, rec.id, d));
  };
  const idCard = (s) => {
    const w = window.open("", "_blank", "width=430,height=640");
    if (!w) return;
    const av = s.photo ? `<img src="${s.photo}" style="width:92px;height:92px;border-radius:50%;object-fit:cover;border:3px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,.3)">` : `<div style="width:92px;height:92px;border-radius:50%;background:#1a4a8a;color:#fff;display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:800;border:3px solid #fff">${initials(s.name)}</div>`;
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>ID Card \u2014 ${s.name}</title>
    <style>body{font-family:-apple-system,Segoe UI,Arial,sans-serif;background:#eef1f6;display:flex;flex-direction:column;align-items:center;padding:26px;margin:0}
    .card{width:320px;border-radius:18px;overflow:hidden;background:#fff;box-shadow:0 14px 40px rgba(0,0,0,.22)}
    .top{background:linear-gradient(135deg,#0f3460,#1a4a8a);color:#fff;padding:20px;text-align:center}
    .top .sch{font-size:16px;font-weight:800}.top .sub{font-size:10px;opacity:.75;letter-spacing:1.5px;text-transform:uppercase;margin-top:2px}
    .ph{display:flex;justify-content:center;margin:16px 0 6px}
    .nm{text-align:center;font-size:19px;font-weight:800;color:#0f3460;margin:12px 16px 2px}
    .cl{text-align:center;font-size:13px;color:#e94560;font-weight:800;margin-bottom:12px}
    .rows{padding:0 22px 18px}
    .r{display:flex;justify-content:space-between;font-size:12.5px;padding:7px 0;border-bottom:1px dashed #e2e6f0}
    .r span{color:#78809a}.r b{color:#17203a}
    .ft{background:#f3f6fc;text-align:center;font-size:10px;color:#9aa3b8;padding:9px;letter-spacing:.5px}
    .btn{display:block;width:320px;padding:11px;background:#0f3460;color:#fff;border:none;border-radius:9px;font-size:14px;font-weight:700;margin-top:18px;cursor:pointer}
    @media print{body{background:#fff}.btn{display:none}}</style></head><body>
    <div class="card">
      <div class="top"><div class="sch">${schoolName}</div><div class="sub">Student Identity Card</div></div>
      <div class="ph">${av}</div>
      <div class="nm">${s.name}</div><div class="cl">Class ${s.cls} \xB7 Section ${s.sec}</div>
      <div class="rows">
        <div class="r"><span>Roll No</span><b>${s.roll}</b></div>
        <div class="r"><span>Guardian</span><b>${s.guardian || "\u2014"}</b></div>
        <div class="r"><span>Contact</span><b>${s.phone || "\u2014"}</b></div>
        <div class="r"><span>Session</span><b>2026\u201327</b></div>
      </div>
      <div class="ft">AzharEd \xB7 Azhar Publishers \xB7 Book Factory</div>
    </div>
    <button class="btn" onclick="window.print()">Print / Save as PDF</button>
    </body></html>`);
    w.document.close();
  };
  const importCSV = () => {
    const inp = document.createElement("input");
    inp.type = "file";
    inp.accept = ".csv,text/csv";
    inp.onchange = () => {
      const f = inp.files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = () => {
        const counters = {};
        students.forEach((s) => {
          const k = s.cls + "-" + s.sec;
          counters[k] = Math.max(counters[k] || 0, s.roll);
        });
        const out = [];
        String(r.result).split(/\r?\n/).forEach((line) => {
          const c = line.split(",").map((x) => x.trim().replace(/^"|"$/g, ""));
          if (!c[0] || /^name$/i.test(c[0])) return;
          const cls = TT_CLASSES.indexOf(c[1]) >= 0 ? c[1] : "Playgroup", sec = TT_SECTIONS.indexOf(c[2]) >= 0 ? c[2] : "A";
          const k = cls + "-" + sec;
          counters[k] = (counters[k] || 0) + 1;
          out.push({ id: Date.now() + out.length, name: c[0], cls, sec, roll: counters[k], guardian: c[3] || "", phone: c[4] || "", fee: +c[5] || 0, paid: 0 });
        });
        if (out.length) {
          setStudents((p) => [...p, ...out]);
          toast(out.length + " students imported", "\u{1F4E5}");
        } else toast("No rows found. Columns: Name, Class, Section, Guardian, Phone, Fee", "\u26A0\uFE0F");
      };
      r.readAsText(f);
    };
    inp.click();
  };
  const dueOf = (s) => s.fee - s.paid;
  const statusOf = (s) => s.paid >= s.fee ? "Paid" : s.paid > 0 ? "Partial" : "Pending";
  const collected = students.reduce((a, s) => a + s.paid, 0);
  const outstanding = students.reduce((a, s) => a + dueOf(s), 0);
  const classes = ["All", ...Array.from(new Set(students.map((s) => s.cls)))];
  const pillCls = (st) => ({ Paid: "paid", Pending: "pending", Partial: "partial", Present: "present", Absent: "absent", Leave: "leave" })[st] || "pending";
  const stuAtt = stuAttAll[attDate] || {};
  const staffAtt = staffAttAll[attDate] || {};
  const markStuAtt = (id, st) => {
    setStuAttAll((p) => ({ ...p, [attDate]: { ...p[attDate] || {}, [id]: st } }));
  };
  const markStaffAtt = (id, st) => {
    setStaffAttAll((p) => ({ ...p, [attDate]: { ...p[attDate] || {}, [id]: st } }));
  };
  const markAllStu = (st) => {
    setStuAttAll((p) => ({ ...p, [attDate]: Object.fromEntries(students.map((s) => [s.id, st])) }));
    toast("All marked " + st);
  };
  const monthPct = (all, id) => {
    const mm = attDate.slice(0, 7);
    let p = 0, t2 = 0;
    Object.keys(all).forEach((d) => {
      if (d.slice(0, 7) === mm && all[d][id] != null) {
        t2++;
        if (all[d][id] === "Present") p++;
      }
    });
    return t2 ? Math.round(p / t2 * 100) + "% (" + p + "/" + t2 + ")" : "\u2014";
  };
  const staffPresent = staff.filter((s) => (staffAtt[s.id] || "Present") === "Present").length;
  const openPay = (s) => {
    setPayFor(s);
    setPayAmt(dueOf(s));
    setPayMethod("Cash");
  };
  const confirmPay = () => {
    const amt = Math.max(0, Math.min(Number(payAmt) || 0, dueOf(payFor)));
    if (amt <= 0) {
      setPayFor(null);
      return;
    }
    setStudents((p) => p.map((s) => s.id === payFor.id ? { ...s, paid: s.paid + amt } : s));
    setPayments((p) => [{ id: Date.now(), student: payFor.name, cls: payFor.cls, amount: amt, method: payMethod, date: niceDate(todayISO()) }, ...p]);
    cloudPushPayment(payFor.id, amt);
    setPayFor(null);
    toast("Payment recorded \u2014 " + rupee(amt), "\u{1F4B0}");
  };
  const feeReminder = (s) => {
    const link = waLink(s.phone, `Dear ${s.guardian || "Parent"}, this is a friendly reminder from ${schoolName} that ${rupee(dueOf(s))} in fees is outstanding for ${s.name} (${s.cls} ${s.sec}). Kindly clear the dues at your earliest convenience. Thank you! \u2014 ${schoolName}`);
    if (link) {
      window.open(link, "_blank");
    } else toast("No phone number saved for " + s.name, "\u26A0\uFE0F");
  };
  const addStudent = () => {
    if (!sf.name.trim()) return;
    const cnt = students.filter((s) => s.cls === sf.cls && s.sec === sf.sec).length + 1;
    setStudents((p) => [...p, { id: Date.now(), name: sf.name.trim(), cls: sf.cls, sec: sf.sec, roll: cnt, guardian: sf.guardian, phone: sf.phone, fee: +sf.fee || 0, paid: 0 }]);
    setSf({ name: "", cls: "Playgroup", sec: "A", guardian: "", phone: "", fee: 4e3 });
    toast("Student enrolled", "\u{1F392}");
  };
  const addStaff = () => {
    if (!stf.name.trim()) return;
    setStaff((p) => [...p, { id: Date.now(), name: stf.name.trim(), role: stf.role, subject: stf.subject || "\u2014", phone: stf.phone, salary: +stf.salary || 0 }]);
    setStf({ name: "", role: "Teacher", subject: "", phone: "", salary: 4e4 });
    toast("Staff member added", "\u{1F469}\u200D\u{1F3EB}");
  };
  const removeStudent = (id) => {
    setStudents((p) => p.filter((s) => s.id !== id));
    toast("Student removed", "\u{1F5D1}\uFE0F");
  };
  const removeStaff = (id) => {
    setStaff((p) => p.filter((s) => s.id !== id));
    toast("Staff removed", "\u{1F5D1}\uFE0F");
  };
  const removeNotice = (id) => setNotices((p) => p.filter((n) => n.id !== id));
  const addNotice = () => {
    if (!nf.title.trim()) return;
    setNotices((p) => [{ id: Date.now(), date: niceDate(todayISO()), title: nf.title.trim(), body: nf.body.trim() }, ...p]);
    setNf({ title: "", body: "" });
    toast("Notice published", "\u{1F4E2}");
  };
  const shareNotice = (n) => {
    const msg = `\u{1F4E2} *${n.title}* \u2014 ${schoolName}

${n.body}

(${n.date})`;
    window.open("https://wa.me/?text=" + encodeURIComponent(msg), "_blank");
  };
  const ttKey = ttClass + "-" + ttSec;
  const grid = timetables[ttKey] || genTimetable(ttClass);
  const updateCell = (d, p, v) => setTimetables((prev) => {
    const g = (prev[ttKey] || genTimetable(ttClass)).map((r) => [...r]);
    g[d][p] = v;
    return { ...prev, [ttKey]: g };
  });
  const printTT = () => printHTML(
    "Timetable " + ttClass + " " + ttSec,
    `<h1>${schoolName}</h1><div class="sub">Class Timetable \u2014 ${ttClass} \xB7 Section ${ttSec}</div>
     <table><tr><th>Day</th>${TT_TIMES.map((t2) => `<th>${t2}</th>`).join("")}</tr>
     ${TT_DAYS.map((d, di) => `<tr><td><b>${d}</b></td>${grid[di].map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</table>`
  );
  const printAtt = () => {
    const shown2 = students.filter((s) => attCls === "All" || s.cls === attCls);
    printHTML(
      "Attendance " + attDate,
      `<h1>${schoolName}</h1><div class="sub">Student Attendance \u2014 ${niceDate(attDate)}${attCls !== "All" ? " \xB7 Class " + attCls : ""}</div>
     <table><tr><th>Name</th><th>Class</th><th>Roll</th><th>Status</th></tr>
     ${shown2.map((s) => `<tr><td>${s.name}</td><td>${s.cls} ${s.sec}</td><td>${s.roll}</td><td>${stuAtt[s.id] || "Present"}</td></tr>`).join("")}</table>`
    );
  };
  const exportStudents = () => downloadCSV(
    "Students_" + todayISO() + ".csv",
    [
      ["Name", "Class", "Section", "Roll", "Guardian", "Phone", "Monthly Fee", "Paid", "Due", "Status"],
      ...students.map((s) => [s.name, s.cls, s.sec, s.roll, s.guardian, s.phone, s.fee, s.paid, dueOf(s), statusOf(s)])
    ]
  );
  const exportFees = () => downloadCSV(
    "Fee_Register_" + todayISO() + ".csv",
    [["Student", "Class", "Fee", "Paid", "Due", "Status"], ...students.map((s) => [s.name, s.cls + " " + s.sec, s.fee, s.paid, dueOf(s), statusOf(s)])]
  );
  const voucherCSS = `<style>.v{border:1.5px solid #99a;border-radius:10px;padding:14px 18px;margin-bottom:16px;page-break-inside:avoid}
       .vh{display:flex;justify-content:space-between;border-bottom:2px solid #0f3460;padding-bottom:6px;margin-bottom:10px;font-size:13px}
       .vh span{color:#e94560;font-weight:800;font-size:11px}
       .v table td{border:none;padding:3px 10px 3px 0;font-size:12px}
       .v table td:nth-child(odd){color:#889}
       .amt{background:#fdecec;border-radius:8px;padding:8px 14px;font-size:13.5px;margin-top:6px}
       .vf{font-size:9.5px;color:#99a;margin-top:8px}</style>`;
  const voucherBlock = (s) => {
    const month = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    const esc = (x) => String(x == null ? "" : x).replace(/</g, "&lt;");
    const due = dueOf(s), amt = due > 0 ? due : s.fee, lbl = due > 0 ? "due by the 10th" : "advance for next month";
    return `<div class="v">
      <div class="vh"><b>${esc(schoolName)}</b><span>FEE VOUCHER \xB7 ${month}</span></div>
      <table><tr><td>Student</td><td><b>${esc(s.name)}</b></td><td>Class</td><td><b>${esc(s.cls)} ${esc(s.sec)}</b></td></tr>
      <tr><td>Roll No</td><td>${s.roll}</td><td>Guardian</td><td>${esc(s.guardian || "\u2014")}</td></tr>
      <tr><td>Monthly fee</td><td>${rupee(s.fee)}</td><td>Paid</td><td>${rupee(s.paid)}</td></tr></table>
      <div class="amt">Amount payable&nbsp; <b>${rupee(amt)}</b> &nbsp;\xB7 ${lbl}</div>
      <div class="vf">Pay at the school office \xB7 Cash / Bank transfer / JazzCash / EasyPaisa \xB7 Receipt is always issued</div>
    </div>`;
  };
  const printVoucher = (s) => {
    const month = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    printHTML("Fee voucher \u2014 " + s.name, voucherCSS + voucherBlock(s));
    toast("Voucher ready for " + s.name + " \u{1F9FE}");
  };
  const printVouchers = () => {
    const due = students.filter((s) => dueOf(s) > 0);
    if (!due.length) {
      toast("No outstanding dues \u2014 nothing to print \u{1F389}");
      return;
    }
    const month = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    const esc = (x) => String(x == null ? "" : x).replace(/</g, "&lt;");
    const v = (s) => `<div class="v">
      <div class="vh"><b>${esc(schoolName)}</b><span>FEE VOUCHER \xB7 ${month}</span></div>
      <table><tr><td>Student</td><td><b>${esc(s.name)}</b></td><td>Class</td><td><b>${esc(s.cls)} ${esc(s.sec)}</b></td></tr>
      <tr><td>Roll No</td><td>${s.roll}</td><td>Guardian</td><td>${esc(s.guardian || "\u2014")}</td></tr>
      <tr><td>Monthly fee</td><td>${rupee(s.fee)}</td><td>Paid</td><td>${rupee(s.paid)}</td></tr></table>
      <div class="amt">Amount payable&nbsp; <b>${rupee(dueOf(s))}</b> &nbsp;\xB7 due by the 10th</div>
      <div class="vf">Pay at the school office \xB7 Cash / Bank transfer / JazzCash / EasyPaisa \xB7 Receipt is always issued</div>
    </div>`;
    printHTML(
      "Fee vouchers " + month,
      `<h1>${esc(schoolName)}</h1><div class="sub">Fee Vouchers \u2014 ${month} \xB7 ${due.length} students with dues</div>
       ${voucherCSS}${due.map(voucherBlock).join("")}`
    );
    toast(due.length + " vouchers ready \u{1F9FE}");
  };
  const printReceipt = (p) => {
    const amt = Number(p.amount).toLocaleString("en-PK");
    const w = window.open("", "_blank", "width=440,height=680");
    if (!w) return;
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Receipt AZ-` + String(p.id).slice(-6) + `</title>
    <style>body{font-family:-apple-system,BlinkMacSystemFont,Arial,sans-serif;color:#1a1a2e;padding:30px;max-width:390px;margin:0 auto}
    .h{text-align:center;border-bottom:3px solid #0f3460;padding-bottom:14px;margin-bottom:18px}
    .h h1{font-size:21px;color:#0f3460;margin:0}.h .s{color:#e94560;font-weight:800;font-size:13px;margin-top:4px}.h p{margin:6px 0 0;font-size:11px;color:#999}
    .row{display:flex;justify-content:space-between;font-size:13px;padding:8px 0;border-bottom:1px dashed #dde1ec}
    .row span{color:#667}.amt{background:#e3f4ea;border-radius:10px;padding:14px;text-align:center;margin:18px 0}
    .amt .l{font-size:12px;color:#1e7e45;font-weight:700}.amt .v{font-size:26px;font-weight:900;color:#1e7e45;margin-top:4px}
    .sign{display:flex;justify-content:space-between;margin-top:34px;font-size:11px;color:#889}
    .sign div{border-top:1px solid #333;padding-top:6px;width:45%;text-align:center}
    .f{text-align:center;font-size:11px;color:#aaa;margin-top:22px}
    .btn{display:block;width:100%;padding:11px;background:#0f3460;color:#fff;border:none;border-radius:9px;font-size:14px;font-weight:700;margin-top:18px;cursor:pointer}
    @media print{.btn{display:none}}</style></head><body>
    <div class="h"><h1>${schoolName}</h1><div class="s">FEE PAYMENT RECEIPT</div><p>Powered by AzharEd \xB7 Book Factory</p></div>
    <div class="row"><span>Receipt No.</span><b>AZ-` + String(p.id).slice(-6) + `</b></div>
    <div class="row"><span>Date</span><b>` + p.date + `</b></div>
    <div class="row"><span>Student</span><b>` + p.student + `</b></div>
    <div class="row"><span>Class</span><b>` + p.cls + `</b></div>
    <div class="row"><span>Payment Method</span><b>` + p.method + `</b></div>
    <div class="amt"><div class="l">Amount Received</div><div class="v">Rs ` + amt + `</div></div>
    <div class="sign"><div>Received By</div><div>Parent / Guardian</div></div>
    <div class="f">Please retain this receipt for your records.</div>
    <button class="btn" onclick="window.print()">Print / Save as PDF</button>
    </body></html>`);
    w.document.close();
  };
  const shown = students.filter((s) => (clsFilter === "All" || s.cls === clsFilter) && (!stuQ.trim() || (s.name + " " + (s.guardian || "")).toLowerCase().includes(stuQ.toLowerCase().trim())));
  const stuShown = students.filter((s) => attCls === "All" || s.cls === attCls);
  const chart = [...FEE_HISTORY, ["Jul", Math.round(collected / 1e3)]];
  const barMax = Math.max(...chart.map((x) => x[1]), 1);
  const tabs = [["overview", "\u{1F4CA}", "Overview"], ["students", "\u{1F392}", "Students"], ["staff", "\u{1F469}\u200D\u{1F3EB}", "Staff"], ["fees", "\u{1F4B0}", "Fees"], ["attendance", "\u{1F5D3}\uFE0F", "Student Attendance"], ["staffatt", "\u{1F9D1}\u200D\u{1F3EB}", "Staff Attendance"], ["timetable", "\u{1F4C5}", "Timetable"], ["notices", "\u{1F4E2}", "Notices"], ["reports", "\u{1F4C4}", "Reports"]];
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "page-head" }, /* @__PURE__ */ React.createElement("h2", null, "\u{1F3EB} School Management"), /* @__PURE__ */ React.createElement("p", null, schoolName, " \xB7 fees, attendance, students & staff \u2014 everything saves automatically on this device.")), /* @__PURE__ */ React.createElement("div", { className: "sms-tabs" }, tabs.map(([id, em, l]) => /* @__PURE__ */ React.createElement("div", { key: id, className: "sms-tab" + (tab === id ? " active" : ""), onClick: () => setTab(id) }, em, " ", t(l)))), tab === "overview" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "kpi-grid" }, /* @__PURE__ */ React.createElement("div", { className: "kpi" }, /* @__PURE__ */ React.createElement("div", { className: "ic" }, "\u{1F392}"), /* @__PURE__ */ React.createElement("div", { className: "v" }, students.length), /* @__PURE__ */ React.createElement("div", { className: "l" }, "Students enrolled")), /* @__PURE__ */ React.createElement("div", { className: "kpi" }, /* @__PURE__ */ React.createElement("div", { className: "ic" }, "\u{1F469}\u200D\u{1F3EB}"), /* @__PURE__ */ React.createElement("div", { className: "v" }, staff.length), /* @__PURE__ */ React.createElement("div", { className: "l" }, "Staff members")), /* @__PURE__ */ React.createElement("div", { className: "kpi green" }, /* @__PURE__ */ React.createElement("div", { className: "ic" }, "\u{1F4B0}"), /* @__PURE__ */ React.createElement("div", { className: "v" }, rupee(collected)), /* @__PURE__ */ React.createElement("div", { className: "l" }, "Fees collected (Jul)")), /* @__PURE__ */ React.createElement("div", { className: "kpi red" }, /* @__PURE__ */ React.createElement("div", { className: "ic" }, "\u26A0\uFE0F"), /* @__PURE__ */ React.createElement("div", { className: "v" }, rupee(outstanding)), /* @__PURE__ */ React.createElement("div", { className: "l" }, "Outstanding dues")), /* @__PURE__ */ React.createElement("div", { className: "kpi gold" }, /* @__PURE__ */ React.createElement("div", { className: "ic" }, "\u2705"), /* @__PURE__ */ React.createElement("div", { className: "v" }, staffPresent, "/", staff.length), /* @__PURE__ */ React.createElement("div", { className: "l" }, "Staff present today")), /* @__PURE__ */ React.createElement("div", { className: "kpi" }, /* @__PURE__ */ React.createElement("div", { className: "ic" }, "\u{1F4E2}"), /* @__PURE__ */ React.createElement("div", { className: "v" }, notices.length), /* @__PURE__ */ React.createElement("div", { className: "l" }, "Active notices"))), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("h3", null, "Fee collection \u2014 last 6 months (Rs \u2019000)"), /* @__PURE__ */ React.createElement("div", { className: "ring-row" }, chart.map(([m, v], i) => /* @__PURE__ */ React.createElement("div", { className: "ring-item", key: i }, /* @__PURE__ */ React.createElement(Ring, { pct: v / barMax * 100, size: 64, stroke: 6, label: v + "k", color: i === chart.length - 1 ? "var(--gold)" : "var(--green)" }), /* @__PURE__ */ React.createElement("div", { className: "bar-lbl" }, m, i === chart.length - 1 ? " \xB7 now" : "")))), /* @__PURE__ */ React.createElement("p", { className: "hint", style: { textAlign: "center", marginTop: 4 } }, "Each ring is that month's collection relative to the best month.")), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("h3", null, "Recent notices"), notices.slice(0, 3).map((n) => /* @__PURE__ */ React.createElement("div", { key: n.id, className: "notice-item" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("b", null, n.title), /* @__PURE__ */ React.createElement("div", { className: "nd" }, n.body)), /* @__PURE__ */ React.createElement("span", { className: "nt" }, n.date))))), tab === "students" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("details", { className: "disc", style: { marginBottom: 0, border: "none" }, open: false }, /* @__PURE__ */ React.createElement("summary", { style: { padding: "0 0 4px", fontSize: 15 } }, "\u{1F392} Enroll a student"), /* @__PURE__ */ React.createElement("div", { className: "disc-b", style: { padding: "12px 0 0" } }, /* @__PURE__ */ React.createElement("div", { className: "form-row", style: { display: "grid", gridTemplateColumns: "1.3fr .8fr .5fr 1.1fr 1fr .8fr auto", gap: 10, alignItems: "end" } }, /* @__PURE__ */ React.createElement("div", { className: "field", style: { margin: 0 } }, /* @__PURE__ */ React.createElement("label", null, "Name"), /* @__PURE__ */ React.createElement("input", { value: sf.name, onChange: (e) => setSf({ ...sf, name: e.target.value }) })), /* @__PURE__ */ React.createElement("div", { className: "field", style: { margin: 0 } }, /* @__PURE__ */ React.createElement("label", null, "Class"), /* @__PURE__ */ React.createElement("select", { value: sf.cls, onChange: (e) => setSf({ ...sf, cls: e.target.value }) }, TT_CLASSES.map((c) => /* @__PURE__ */ React.createElement("option", { key: c, value: c }, c)))), /* @__PURE__ */ React.createElement("div", { className: "field", style: { margin: 0 } }, /* @__PURE__ */ React.createElement("label", null, "Sec"), /* @__PURE__ */ React.createElement("select", { value: sf.sec, onChange: (e) => setSf({ ...sf, sec: e.target.value }) }, TT_SECTIONS.map((c) => /* @__PURE__ */ React.createElement("option", { key: c }, c)))), /* @__PURE__ */ React.createElement("div", { className: "field", style: { margin: 0 } }, /* @__PURE__ */ React.createElement("label", null, "Guardian"), /* @__PURE__ */ React.createElement("input", { value: sf.guardian, onChange: (e) => setSf({ ...sf, guardian: e.target.value }) })), /* @__PURE__ */ React.createElement("div", { className: "field", style: { margin: 0 } }, /* @__PURE__ */ React.createElement("label", null, "Phone (03xx\u2026)"), /* @__PURE__ */ React.createElement("input", { value: sf.phone, onChange: (e) => setSf({ ...sf, phone: e.target.value }) })), /* @__PURE__ */ React.createElement("div", { className: "field", style: { margin: 0 } }, /* @__PURE__ */ React.createElement("label", null, "Monthly Fee"), /* @__PURE__ */ React.createElement("input", { type: "number", value: sf.fee, onChange: (e) => setSf({ ...sf, fee: e.target.value }) })), /* @__PURE__ */ React.createElement("button", { className: "btn btn-navy", onClick: addStudent }, "Enroll"))))), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-flex" }, /* @__PURE__ */ React.createElement("h3", null, "Students \xB7 ", shown.length), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("input", { className: "date-inp", style: { fontWeight: 600, minWidth: 150 }, placeholder: "\u{1F50D} Search students\u2026", value: stuQ, onChange: (e) => setStuQ(e.target.value) }), /* @__PURE__ */ React.createElement("div", { className: "filter-bar", style: { margin: 0 } }, classes.map((c) => /* @__PURE__ */ React.createElement("span", { key: c, className: "fchip" + (clsFilter === c ? " active" : ""), onClick: () => setClsFilter(c) }, c))), /* @__PURE__ */ React.createElement("button", { className: "mini-btn ghost", onClick: importCSV, title: "Import students from a CSV file (Name, Class, Section, Guardian, Phone, Fee)" }, "\u{1F4E4} Import CSV"), /* @__PURE__ */ React.createElement("button", { className: "mini-btn ghost", onClick: exportStudents }, "\u{1F4E5} CSV"))), /* @__PURE__ */ React.createElement("table", { className: "gtable" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Name"), /* @__PURE__ */ React.createElement("th", null, "Class"), /* @__PURE__ */ React.createElement("th", null, "Roll"), /* @__PURE__ */ React.createElement("th", null, "Guardian"), /* @__PURE__ */ React.createElement("th", null, "Phone"), /* @__PURE__ */ React.createElement("th", null, "Monthly Fee"), /* @__PURE__ */ React.createElement("th", null, "Fee Status"), /* @__PURE__ */ React.createElement("th", null))), /* @__PURE__ */ React.createElement("tbody", null, shown.map((s) => /* @__PURE__ */ React.createElement("tr", { key: s.id }, /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { className: "tbl-name" }, /* @__PURE__ */ React.createElement("button", { className: "av-btn", title: s.photo ? "Change or remove photo" : "Add photo", onClick: () => avatarClick("student", s) }, /* @__PURE__ */ React.createElement(Avatar, { photo: s.photo, name: s.name })), s.name)), /* @__PURE__ */ React.createElement("td", null, s.cls, " ", s.sec), /* @__PURE__ */ React.createElement("td", null, s.roll), /* @__PURE__ */ React.createElement("td", null, s.guardian), /* @__PURE__ */ React.createElement("td", null, s.phone), /* @__PURE__ */ React.createElement("td", null, rupee(s.fee)), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { className: "pill " + pillCls(statusOf(s)) }, statusOf(s))), /* @__PURE__ */ React.createElement("td", { style: { whiteSpace: "nowrap" } }, /* @__PURE__ */ React.createElement("button", { className: "mini-btn ghost", title: "Print ID card", onClick: () => idCard(s) }, "\u{1FAAA}"), " ", CLOUD.user && CLOUD.user.cloud && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("button", { className: "mini-btn ghost", title: "Link a parent account (Family portal)", onClick: () => linkParent(s) }, "\u{1F46A}"), " "), /* @__PURE__ */ React.createElement("button", { className: "del-btn", onClick: () => removeStudent(s.id), title: "Remove student" }, "\u2715")))))), /* @__PURE__ */ React.createElement("p", { className: "hint" }, "\u{1F4F7} Click any student's picture to add a photo (auto-compressed) \xB7 \u{1FAAA} prints an ID card \xB7 \u{1F4E4} imports many students at once from a CSV file."))), tab === "staff" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("details", { className: "disc", style: { marginBottom: 0, border: "none" } }, /* @__PURE__ */ React.createElement("summary", { style: { padding: "0 0 4px", fontSize: 15 } }, "\u{1F9D1}\u200D\u{1F3EB} Add a staff member"), /* @__PURE__ */ React.createElement("div", { className: "disc-b", style: { padding: "12px 0 0" } }, /* @__PURE__ */ React.createElement("div", { className: "form-row", style: { display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr .9fr auto", gap: 10, alignItems: "end" } }, /* @__PURE__ */ React.createElement("div", { className: "field", style: { margin: 0 } }, /* @__PURE__ */ React.createElement("label", null, "Name"), /* @__PURE__ */ React.createElement("input", { value: stf.name, onChange: (e) => setStf({ ...stf, name: e.target.value }) })), /* @__PURE__ */ React.createElement("div", { className: "field", style: { margin: 0 } }, /* @__PURE__ */ React.createElement("label", null, "Role"), /* @__PURE__ */ React.createElement("select", { value: stf.role, onChange: (e) => setStf({ ...stf, role: e.target.value }) }, ["Teacher", "Admin", "Support"].map((r) => /* @__PURE__ */ React.createElement("option", { key: r }, r)))), /* @__PURE__ */ React.createElement("div", { className: "field", style: { margin: 0 } }, /* @__PURE__ */ React.createElement("label", null, "Subject"), /* @__PURE__ */ React.createElement("input", { value: stf.subject, onChange: (e) => setStf({ ...stf, subject: e.target.value }) })), /* @__PURE__ */ React.createElement("div", { className: "field", style: { margin: 0 } }, /* @__PURE__ */ React.createElement("label", null, "Phone"), /* @__PURE__ */ React.createElement("input", { value: stf.phone, onChange: (e) => setStf({ ...stf, phone: e.target.value }) })), /* @__PURE__ */ React.createElement("div", { className: "field", style: { margin: 0 } }, /* @__PURE__ */ React.createElement("label", null, "Salary"), /* @__PURE__ */ React.createElement("input", { type: "number", value: stf.salary, onChange: (e) => setStf({ ...stf, salary: e.target.value }) })), /* @__PURE__ */ React.createElement("button", { className: "btn btn-navy", onClick: addStaff }, "Add"))))), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("h3", null, "Staff & teachers \xB7 ", staff.length), /* @__PURE__ */ React.createElement("table", { className: "gtable" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Name"), /* @__PURE__ */ React.createElement("th", null, "Role"), /* @__PURE__ */ React.createElement("th", null, "Subject"), /* @__PURE__ */ React.createElement("th", null, "Phone"), /* @__PURE__ */ React.createElement("th", null, "Salary"), /* @__PURE__ */ React.createElement("th", null, "Today"), /* @__PURE__ */ React.createElement("th", null))), /* @__PURE__ */ React.createElement("tbody", null, staff.map((s) => {
    const st = staffAtt[s.id] || "Present";
    return /* @__PURE__ */ React.createElement("tr", { key: s.id }, /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { className: "tbl-name" }, /* @__PURE__ */ React.createElement("button", { className: "av-btn", title: s.photo ? "Change or remove photo" : "Add photo", onClick: () => avatarClick("staff", s) }, /* @__PURE__ */ React.createElement(Avatar, { photo: s.photo, name: s.name, bg: "#b23048" })), s.name)), /* @__PURE__ */ React.createElement("td", null, s.role), /* @__PURE__ */ React.createElement("td", null, s.subject), /* @__PURE__ */ React.createElement("td", null, s.phone), /* @__PURE__ */ React.createElement("td", null, rupee(s.salary)), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { className: "pill " + pillCls(st) }, st)), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("button", { className: "del-btn", onClick: () => removeStaff(s.id), title: "Remove staff" }, "\u2715")));
  }))))), tab === "fees" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "kpi-grid" }, /* @__PURE__ */ React.createElement("div", { className: "kpi green" }, /* @__PURE__ */ React.createElement("div", { className: "stat-flex" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "ic" }, "\u{1F4B0}"), /* @__PURE__ */ React.createElement("div", { className: "v" }, rupee(collected)), /* @__PURE__ */ React.createElement("div", { className: "l" }, "Collected this month")), /* @__PURE__ */ React.createElement(Ring, { pct: collected + outstanding ? collected / (collected + outstanding) * 100 : 0, size: 52 }))), /* @__PURE__ */ React.createElement("div", { className: "kpi red" }, /* @__PURE__ */ React.createElement("div", { className: "ic" }, "\u26A0\uFE0F"), /* @__PURE__ */ React.createElement("div", { className: "v" }, rupee(outstanding)), /* @__PURE__ */ React.createElement("div", { className: "l" }, "Outstanding")), /* @__PURE__ */ React.createElement("div", { className: "kpi gold" }, /* @__PURE__ */ React.createElement("div", { className: "ic" }, "\u{1F465}"), /* @__PURE__ */ React.createElement("div", { className: "v" }, students.filter((s) => statusOf(s) !== "Paid").length), /* @__PURE__ */ React.createElement("div", { className: "l" }, "Students with dues"))), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-flex" }, /* @__PURE__ */ React.createElement("h3", null, "Fee register"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { className: "mini-btn ghost", onClick: printVouchers }, "\u{1F9FE} Print fee vouchers"), /* @__PURE__ */ React.createElement("button", { className: "mini-btn ghost", onClick: exportFees }, "\u{1F4E5} CSV"))), /* @__PURE__ */ React.createElement("table", { className: "gtable" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Student"), /* @__PURE__ */ React.createElement("th", null, "Class"), /* @__PURE__ */ React.createElement("th", null, "Monthly Fee"), /* @__PURE__ */ React.createElement("th", null, "Paid"), /* @__PURE__ */ React.createElement("th", null, "Due"), /* @__PURE__ */ React.createElement("th", null, "Status"), /* @__PURE__ */ React.createElement("th", null))), /* @__PURE__ */ React.createElement("tbody", null, students.map((s) => /* @__PURE__ */ React.createElement("tr", { key: s.id }, /* @__PURE__ */ React.createElement("td", null, s.name), /* @__PURE__ */ React.createElement("td", null, s.cls), /* @__PURE__ */ React.createElement("td", null, rupee(s.fee)), /* @__PURE__ */ React.createElement("td", null, rupee(s.paid)), /* @__PURE__ */ React.createElement("td", null, rupee(dueOf(s))), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { className: "pill " + pillCls(statusOf(s)) }, statusOf(s))), /* @__PURE__ */ React.createElement("td", { style: { whiteSpace: "nowrap" } }, /* @__PURE__ */ React.createElement("button", { className: "mini-btn ghost", title: "Print this student's fee voucher", onClick: () => printVoucher(s) }, "\u{1F9FE}"), " ", statusOf(s) !== "Paid" && /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("button", { className: "mini-btn", onClick: () => openPay(s) }, "Record payment"), " ", /* @__PURE__ */ React.createElement("button", { className: "mini-btn wa", title: "Send WhatsApp fee reminder", onClick: () => feeReminder(s) }, "\u{1F4AC} Remind"))))))), /* @__PURE__ */ React.createElement("p", { className: "hint" }, "\u{1F9FE} prints that one student's voucher \xB7 \u{1F4AC} Remind opens WhatsApp with a ready-made fee reminder to the guardian.")), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("h3", null, "Recent payments \xB7 ", payments.length), /* @__PURE__ */ React.createElement("table", { className: "gtable" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Date"), /* @__PURE__ */ React.createElement("th", null, "Student"), /* @__PURE__ */ React.createElement("th", null, "Class"), /* @__PURE__ */ React.createElement("th", null, "Method"), /* @__PURE__ */ React.createElement("th", null, "Amount"), /* @__PURE__ */ React.createElement("th", null))), /* @__PURE__ */ React.createElement("tbody", null, payments.map((p) => /* @__PURE__ */ React.createElement("tr", { key: p.id }, /* @__PURE__ */ React.createElement("td", null, p.date), /* @__PURE__ */ React.createElement("td", null, p.student), /* @__PURE__ */ React.createElement("td", null, p.cls), /* @__PURE__ */ React.createElement("td", null, p.method), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("b", { style: { color: "#2ba55f" } }, rupee(p.amount))), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("button", { className: "mini-btn ghost", onClick: () => printReceipt(p) }, "\u{1F9FE} Receipt")))))))), tab === "attendance" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "kpi-grid" }, /* @__PURE__ */ React.createElement("div", { className: "kpi green" }, /* @__PURE__ */ React.createElement("div", { className: "stat-flex" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "ic" }, "\u2705"), /* @__PURE__ */ React.createElement("div", { className: "v" }, stuShown.filter((s) => (stuAtt[s.id] || "Present") === "Present").length), /* @__PURE__ */ React.createElement("div", { className: "l" }, "Present")), /* @__PURE__ */ React.createElement(Ring, { pct: stuShown.length ? stuShown.filter((s) => (stuAtt[s.id] || "Present") === "Present").length / stuShown.length * 100 : 0, size: 52 }))), /* @__PURE__ */ React.createElement("div", { className: "kpi red" }, /* @__PURE__ */ React.createElement("div", { className: "ic" }, "\u274C"), /* @__PURE__ */ React.createElement("div", { className: "v" }, stuShown.filter((s) => (stuAtt[s.id] || "Present") === "Absent").length), /* @__PURE__ */ React.createElement("div", { className: "l" }, "Absent")), /* @__PURE__ */ React.createElement("div", { className: "kpi gold" }, /* @__PURE__ */ React.createElement("div", { className: "ic" }, "\u{1F334}"), /* @__PURE__ */ React.createElement("div", { className: "v" }, stuShown.filter((s) => (stuAtt[s.id] || "Present") === "Leave").length), /* @__PURE__ */ React.createElement("div", { className: "l" }, "On leave"))), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-flex" }, /* @__PURE__ */ React.createElement("h3", null, "Student attendance"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("input", { type: "date", className: "date-inp", value: attDate, max: todayISO(), onChange: (e) => setAttDate(e.target.value) }), /* @__PURE__ */ React.createElement("div", { className: "filter-bar", style: { margin: 0 } }, classes.map((c) => /* @__PURE__ */ React.createElement("span", { key: c, className: "fchip" + (attCls === c ? " active" : ""), onClick: () => setAttCls(c) }, c))))), /* @__PURE__ */ React.createElement("div", { className: "quick-add" }, /* @__PURE__ */ React.createElement("button", { className: "mini-btn ghost", onClick: () => markAllStu("Present") }, "\u2705 Mark all present"), /* @__PURE__ */ React.createElement("button", { className: "mini-btn ghost", onClick: printAtt }, "\u{1F5A8}\uFE0F Print sheet")), /* @__PURE__ */ React.createElement("table", { className: "gtable" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Name"), /* @__PURE__ */ React.createElement("th", null, "Class"), /* @__PURE__ */ React.createElement("th", null, "Roll"), /* @__PURE__ */ React.createElement("th", null, "Mark"), /* @__PURE__ */ React.createElement("th", null, "This month"))), /* @__PURE__ */ React.createElement("tbody", null, stuShown.map((s) => {
    const st = stuAtt[s.id] || "Present";
    return /* @__PURE__ */ React.createElement("tr", { key: s.id }, /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { className: "tbl-name" }, /* @__PURE__ */ React.createElement(Avatar, { photo: s.photo, name: s.name, size: 26 }), s.name)), /* @__PURE__ */ React.createElement("td", null, s.cls, " ", s.sec), /* @__PURE__ */ React.createElement("td", null, s.roll), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { className: "att-btns" }, ["Present", "Absent", "Leave"].map((x) => /* @__PURE__ */ React.createElement("button", { key: x, className: "att-b" + (st === x ? " on-" + x.toLowerCase() : ""), onClick: () => markStuAtt(s.id, x) }, x[0])))), /* @__PURE__ */ React.createElement("td", null, monthPct(stuAttAll, s.id)));
  }))), /* @__PURE__ */ React.createElement("p", { className: "hint" }, "Tap P / A / L to mark each student. Change the date to view or edit past days \u2014 every day is saved separately."))), tab === "staffatt" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "kpi-grid" }, /* @__PURE__ */ React.createElement("div", { className: "kpi green" }, /* @__PURE__ */ React.createElement("div", { className: "stat-flex" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "ic" }, "\u2705"), /* @__PURE__ */ React.createElement("div", { className: "v" }, staffPresent), /* @__PURE__ */ React.createElement("div", { className: "l" }, "Present")), /* @__PURE__ */ React.createElement(Ring, { pct: staff.length ? staffPresent / staff.length * 100 : 0, size: 52 }))), /* @__PURE__ */ React.createElement("div", { className: "kpi red" }, /* @__PURE__ */ React.createElement("div", { className: "ic" }, "\u274C"), /* @__PURE__ */ React.createElement("div", { className: "v" }, staff.filter((s) => (staffAtt[s.id] || "Present") === "Absent").length), /* @__PURE__ */ React.createElement("div", { className: "l" }, "Absent")), /* @__PURE__ */ React.createElement("div", { className: "kpi gold" }, /* @__PURE__ */ React.createElement("div", { className: "ic" }, "\u{1F334}"), /* @__PURE__ */ React.createElement("div", { className: "v" }, staff.filter((s) => (staffAtt[s.id] || "Present") === "Leave").length), /* @__PURE__ */ React.createElement("div", { className: "l" }, "On leave"))), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-flex" }, /* @__PURE__ */ React.createElement("h3", null, "Teacher & staff attendance"), /* @__PURE__ */ React.createElement("input", { type: "date", className: "date-inp", value: attDate, max: todayISO(), onChange: (e) => setAttDate(e.target.value) })), /* @__PURE__ */ React.createElement("table", { className: "gtable" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Name"), /* @__PURE__ */ React.createElement("th", null, "Role"), /* @__PURE__ */ React.createElement("th", null, "Subject"), /* @__PURE__ */ React.createElement("th", null, "Mark"), /* @__PURE__ */ React.createElement("th", null, "This month"))), /* @__PURE__ */ React.createElement("tbody", null, staff.map((s) => {
    const st = staffAtt[s.id] || "Present";
    return /* @__PURE__ */ React.createElement("tr", { key: s.id }, /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { className: "tbl-name" }, /* @__PURE__ */ React.createElement(Avatar, { photo: s.photo, name: s.name, size: 26, bg: "#b23048" }), s.name)), /* @__PURE__ */ React.createElement("td", null, s.role), /* @__PURE__ */ React.createElement("td", null, s.subject), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { className: "att-btns" }, ["Present", "Absent", "Leave"].map((x) => /* @__PURE__ */ React.createElement("button", { key: x, className: "att-b" + (st === x ? " on-" + x.toLowerCase() : ""), onClick: () => markStaffAtt(s.id, x) }, x[0])))), /* @__PURE__ */ React.createElement("td", null, monthPct(staffAttAll, s.id)));
  }))), /* @__PURE__ */ React.createElement("p", { className: "hint" }, "Tap P / A / L to mark attendance for the selected date."))), tab === "timetable" && /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-flex" }, /* @__PURE__ */ React.createElement("h3", null, "Class timetables"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("select", { className: "tt-sel", value: ttClass, onChange: (e) => setTtClass(e.target.value) }, TT_CLASSES.map((c) => /* @__PURE__ */ React.createElement("option", { key: c, value: c }, c))), /* @__PURE__ */ React.createElement("select", { className: "tt-sel", value: ttSec, onChange: (e) => setTtSec(e.target.value) }, TT_SECTIONS.map((s) => /* @__PURE__ */ React.createElement("option", { key: s, value: s }, "Section ", s))), /* @__PURE__ */ React.createElement("button", { className: "mini-btn ghost", onClick: printTT }, "\u{1F5A8}\uFE0F Print"))), /* @__PURE__ */ React.createElement("p", { className: "hint", style: { marginTop: 0, marginBottom: 14 } }, "Showing ", /* @__PURE__ */ React.createElement("b", null, ttClass, " \xB7 Section ", ttSec), ". Every slot is a dropdown with all ", isEarly(ttClass) ? "early-years" : "Class " + ttClass, " subjects \u2014 swap any period to any subject, changes save automatically."), (() => {
    const pool = isEarly(ttClass) ? EY_SUBJECTS : PR_SUBJECTS;
    return /* @__PURE__ */ React.createElement("table", { className: "gtable tt-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Day"), TT_TIMES.map((t2) => /* @__PURE__ */ React.createElement("th", { key: t2 }, t2)))), /* @__PURE__ */ React.createElement("tbody", null, TT_DAYS.map((day, d) => /* @__PURE__ */ React.createElement("tr", { key: day }, /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("b", null, day)), TT_TIMES.map((t2, p) => {
      const v = grid[d][p];
      return /* @__PURE__ */ React.createElement("td", { key: p }, /* @__PURE__ */ React.createElement("select", { className: "tt-cell", value: v, onChange: (e) => updateCell(d, p, e.target.value) }, v && pool.indexOf(v) < 0 && v !== "Break" && v !== "\u2014" && /* @__PURE__ */ React.createElement("option", { value: v }, v), pool.map((s) => /* @__PURE__ */ React.createElement("option", { key: s, value: s }, s)), /* @__PURE__ */ React.createElement("option", { value: "Break" }, "Break"), /* @__PURE__ */ React.createElement("option", { value: "\u2014" }, "\u2014 free \u2014")));
    })))));
  })()), tab === "notices" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("h3", null, "Post a notice"), /* @__PURE__ */ React.createElement("div", { className: "field", style: { marginBottom: 8 } }, /* @__PURE__ */ React.createElement("label", null, "Title"), /* @__PURE__ */ React.createElement("input", { value: nf.title, onChange: (e) => setNf({ ...nf, title: e.target.value }) })), /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", null, "Message"), /* @__PURE__ */ React.createElement("input", { value: nf.body, onChange: (e) => setNf({ ...nf, body: e.target.value }) })), /* @__PURE__ */ React.createElement("button", { className: "btn btn-navy", onClick: addNotice }, "Publish notice")), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("h3", null, "All notices \xB7 ", notices.length), notices.map((n) => /* @__PURE__ */ React.createElement("div", { key: n.id, className: "notice-item" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("b", null, n.title), /* @__PURE__ */ React.createElement("div", { className: "nd" }, n.body)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, /* @__PURE__ */ React.createElement("span", { className: "nt" }, n.date), /* @__PURE__ */ React.createElement("button", { className: "mini-btn wa", title: "Share on WhatsApp", onClick: () => shareNotice(n) }, "\u{1F4AC}"), /* @__PURE__ */ React.createElement("button", { className: "del-btn", onClick: () => removeNotice(n.id), title: "Remove notice" }, "\u2715")))))), tab === "reports" && (() => {
    const mDays = Object.keys(stuAttAll).filter((d) => d.slice(0, 7) === repMonth).sort();
    const staffDays = Object.keys(staffAttAll).filter((d) => d.slice(0, 7) === repMonth).sort();
    const cnt = (all, days, id) => {
      let P = 0, A = 0, L = 0;
      days.forEach((d) => {
        const st = all[d][id];
        if (st === "Present") P++;
        else if (st === "Absent") A++;
        else if (st === "Leave") L++;
      });
      return { P, A, L, T: P + A + L };
    };
    const monthName = (/* @__PURE__ */ new Date(repMonth + "-15")).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    const defaulters = students.filter((s) => dueOf(s) > 0);
    const esc = (x) => String(x).replace(/</g, "&lt;");
    const printAttMonth = () => printHTML(
      "Attendance " + repMonth,
      `<h1>${esc(schoolName)}</h1><div class="sub">Student Attendance Register \u2014 ${monthName} (${mDays.length} marked days)</div>
         <table><tr><th>Student</th><th>Class</th><th>Present</th><th>Absent</th><th>Leave</th><th>%</th></tr>
         ${students.map((s) => {
        const c = cnt(stuAttAll, mDays, s.id);
        return `<tr><td>${esc(s.name)}</td><td>${s.cls} ${s.sec}</td><td>${c.P}</td><td>${c.A}</td><td>${c.L}</td><td>${c.T ? Math.round(c.P / c.T * 100) + "%" : "\u2014"}</td></tr>`;
      }).join("")}</table>`
    );
    const printStaffMonth = () => printHTML(
      "Staff Attendance " + repMonth,
      `<h1>${esc(schoolName)}</h1><div class="sub">Staff Attendance Register \u2014 ${monthName} (${staffDays.length} marked days)</div>
         <table><tr><th>Name</th><th>Role</th><th>Present</th><th>Absent</th><th>Leave</th><th>%</th></tr>
         ${staff.map((s) => {
        const c = cnt(staffAttAll, staffDays, s.id);
        return `<tr><td>${esc(s.name)}</td><td>${s.role}</td><td>${c.P}</td><td>${c.A}</td><td>${c.L}</td><td>${c.T ? Math.round(c.P / c.T * 100) + "%" : "\u2014"}</td></tr>`;
      }).join("")}</table>`
    );
    const printFeeReport = () => printHTML(
      "Fee Report " + repMonth,
      `<h1>${esc(schoolName)}</h1><div class="sub">Fee Report \u2014 ${monthName}</div>
         <p style="font-size:13.5px;margin:12px 0"><b>Collected:</b> ${rupee(collected)} &nbsp;\xB7&nbsp; <b>Outstanding:</b> ${rupee(outstanding)} &nbsp;\xB7&nbsp; <b>Students with dues:</b> ${defaulters.length}</p>
         <h1 style="font-size:15px;margin-top:8px">Defaulter List</h1>
         <table><tr><th>Student</th><th>Class</th><th>Guardian</th><th>Phone</th><th>Due</th></tr>
         ${defaulters.map((s) => `<tr><td>${esc(s.name)}</td><td>${s.cls} ${s.sec}</td><td>${esc(s.guardian || "\u2014")}</td><td>${esc(s.phone || "\u2014")}</td><td>${rupee(dueOf(s))}</td></tr>`).join("")}</table>`
    );
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "card-flex", style: { marginBottom: 16 } }, /* @__PURE__ */ React.createElement("h3", { style: { marginBottom: 0, color: "var(--brand)", fontSize: 15, fontWeight: 800 } }, "Monthly reports"), /* @__PURE__ */ React.createElement("input", { type: "month", className: "date-inp", value: repMonth, max: todayISO().slice(0, 7), onChange: (e) => setRepMonth(e.target.value) })), /* @__PURE__ */ React.createElement("div", { className: "kpi-grid" }, /* @__PURE__ */ React.createElement("div", { className: "kpi" }, /* @__PURE__ */ React.createElement("div", { className: "ic" }, "\u{1F5D3}\uFE0F"), /* @__PURE__ */ React.createElement("div", { className: "v" }, mDays.length), /* @__PURE__ */ React.createElement("div", { className: "l" }, "Days attendance marked")), /* @__PURE__ */ React.createElement("div", { className: "kpi green" }, /* @__PURE__ */ React.createElement("div", { className: "ic" }, "\u{1F4B0}"), /* @__PURE__ */ React.createElement("div", { className: "v" }, rupee(collected)), /* @__PURE__ */ React.createElement("div", { className: "l" }, "Collected (current)")), /* @__PURE__ */ React.createElement("div", { className: "kpi red" }, /* @__PURE__ */ React.createElement("div", { className: "ic" }, "\u26A0\uFE0F"), /* @__PURE__ */ React.createElement("div", { className: "v" }, defaulters.length), /* @__PURE__ */ React.createElement("div", { className: "l" }, "Fee defaulters"))), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("h3", null, "\u{1F5A8}\uFE0F One-click printable reports \u2014 ", monthName), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-navy", onClick: printAttMonth }, "\u{1F5D3}\uFE0F Student attendance register"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-outline", onClick: printStaffMonth }, "\u{1F9D1}\u200D\u{1F3EB} Staff attendance register"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-outline", onClick: printFeeReport }, "\u{1F4B0} Fee report + defaulter list")), /* @__PURE__ */ React.createElement("p", { className: "hint" }, "Registers count every day you marked attendance in ", monthName, ". The fee report prints the current register with the full defaulter list for follow-up calls.")), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("h3", null, "Student attendance summary \xB7 ", monthName), /* @__PURE__ */ React.createElement("table", { className: "gtable" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Student"), /* @__PURE__ */ React.createElement("th", null, "Class"), /* @__PURE__ */ React.createElement("th", null, "P"), /* @__PURE__ */ React.createElement("th", null, "A"), /* @__PURE__ */ React.createElement("th", null, "L"), /* @__PURE__ */ React.createElement("th", null, "%"))), /* @__PURE__ */ React.createElement("tbody", null, students.map((s) => {
      const c = cnt(stuAttAll, mDays, s.id);
      return /* @__PURE__ */ React.createElement("tr", { key: s.id }, /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { className: "tbl-name" }, /* @__PURE__ */ React.createElement(Avatar, { photo: s.photo, name: s.name, size: 24 }), s.name)), /* @__PURE__ */ React.createElement("td", null, s.cls, " ", s.sec), /* @__PURE__ */ React.createElement("td", null, c.P), /* @__PURE__ */ React.createElement("td", null, c.A), /* @__PURE__ */ React.createElement("td", null, c.L), /* @__PURE__ */ React.createElement("td", null, c.T ? Math.round(c.P / c.T * 100) + "%" : "\u2014"));
    })))));
  })(), photoMenu && /* @__PURE__ */ React.createElement("div", { className: "overlay", onClick: () => setPhotoMenu(null) }, /* @__PURE__ */ React.createElement("div", { className: "modal", style: { maxWidth: 340, padding: "26px 24px", textAlign: "center" }, onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "center", marginBottom: 10 } }, /* @__PURE__ */ React.createElement(Avatar, { photo: photoMenu.rec.photo, name: photoMenu.rec.name, size: 84 })), /* @__PURE__ */ React.createElement("h3", { style: { color: "var(--brand)", fontSize: 16 } }, photoMenu.rec.name), /* @__PURE__ */ React.createElement("div", { className: "photo-menu" }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-navy", onClick: () => {
    const m = photoMenu;
    setPhotoMenu(null);
    pickPhoto((d) => setPhoto(m.kind, m.rec.id, d));
  } }, "\u{1F4F7} Change photo"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-danger", onClick: () => {
    setPhoto(photoMenu.kind, photoMenu.rec.id, null);
    setPhotoMenu(null);
  } }, "\u{1F5D1}\uFE0F Remove"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-outline", onClick: () => setPhotoMenu(null) }, "Cancel")))), payFor && /* @__PURE__ */ React.createElement("div", { className: "overlay", onClick: () => setPayFor(null) }, /* @__PURE__ */ React.createElement("div", { className: "modal", style: { maxWidth: 430 }, onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement("div", { className: "modal-top" }, /* @__PURE__ */ React.createElement("div", { className: "modal-hero", style: { background: "linear-gradient(135deg,#0f3460,#1a4a8a)", height: 100 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", null, "Record Fee Payment"), /* @__PURE__ */ React.createElement("p", null, payFor.name, " \xB7 ", payFor.cls, " ", payFor.sec))), /* @__PURE__ */ React.createElement("button", { className: "modal-x", onClick: () => setPayFor(null) }, "\u2715")), /* @__PURE__ */ React.createElement("div", { className: "modal-body" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 16, color: "var(--muted)" } }, /* @__PURE__ */ React.createElement("span", null, "Monthly fee: ", /* @__PURE__ */ React.createElement("b", null, rupee(payFor.fee))), /* @__PURE__ */ React.createElement("span", null, "Outstanding: ", /* @__PURE__ */ React.createElement("b", { style: { color: "var(--red)" } }, rupee(dueOf(payFor))))), /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", null, "Amount received (Rs)"), /* @__PURE__ */ React.createElement("input", { type: "number", autoFocus: true, value: payAmt, onChange: (e) => setPayAmt(e.target.value) })), /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", null, "Payment method"), /* @__PURE__ */ React.createElement("select", { value: payMethod, onChange: (e) => setPayMethod(e.target.value) }, ["Cash", "Bank Transfer", "JazzCash", "EasyPaisa", "Cheque"].map((m) => /* @__PURE__ */ React.createElement("option", { key: m }, m)))), /* @__PURE__ */ React.createElement("button", { className: "btn-primary", onClick: confirmPay }, "Save payment"), /* @__PURE__ */ React.createElement("p", { className: "hint", style: { textAlign: "center" } }, "Amount is capped at the outstanding balance.")))));
}
function AdoptionCard({ user }) {
  const enabled = !!(SB && user && user.cloud && user.role === "admin");
  const [sel, setSel] = useState(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (enabled) SB.from("school_books").select("book_id").then(({ data }) => setSel((data || []).map((r) => r.book_id)));
  }, [enabled]);
  if (!enabled) return null;
  if (sel === null) return /* @__PURE__ */ React.createElement("div", { className: "card", style: { maxWidth: 560 } }, /* @__PURE__ */ React.createElement("h3", null, "\u{1F4DA} Licensed titles"), /* @__PURE__ */ React.createElement("p", { className: "hint" }, "Loading\u2026"));
  const groups = {};
  ALL_BOOKS.forEach((b) => {
    (groups[b.series] = groups[b.series] || []).push(b);
  });
  const toggle = (id) => setSel((x) => x.indexOf(id) >= 0 ? x.filter((y) => y !== id) : [...x, id]);
  const setSeries = (sn, on) => setSel((x) => {
    const ids = groups[sn].map((b) => b.id);
    const rest = x.filter((y) => ids.indexOf(y) < 0);
    return on ? [...rest, ...ids] : rest;
  });
  const save = async () => {
    setBusy(true);
    try {
      await SB.from("school_books").delete().eq("school_id", user.school_id);
      if (sel.length) await SB.from("school_books").insert(sel.map((id) => ({ school_id: user.school_id, book_id: id })));
      applyAdoption(sel);
      toast(sel.length ? sel.length + " titles licensed \u2014 the whole app now shows only these" : "No selection \u2014 full catalogue restored", "\u{1F4DA}");
    } catch (e) {
      toast("Could not save \u2014 check your connection", "\u26A0\uFE0F");
    }
    setBusy(false);
  };
  return /* @__PURE__ */ React.createElement("div", { className: "card", style: { maxWidth: 560 } }, /* @__PURE__ */ React.createElement("h3", null, "\u{1F4DA} Licensed titles for this school"), /* @__PURE__ */ React.createElement("p", { className: "hint", style: { marginTop: 2, marginBottom: 10 } }, "Tick only the titles this school has adopted \u2014 the Book Library, Focus Mode and Paper Generator will show just those, for every teacher. Leave ", /* @__PURE__ */ React.createElement("b", null, "all unticked"), " to give the full catalogue."), /* @__PURE__ */ React.createElement("div", { style: { maxHeight: 300, overflowY: "auto", border: "1px solid var(--border)", borderRadius: 10, padding: "8px 12px" } }, Object.keys(groups).map((sn) => /* @__PURE__ */ React.createElement("div", { key: sn, style: { marginBottom: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 13, margin: "6px 0" } }, sn === "Alfatah" ? "Al-Fatah" : sn, /* @__PURE__ */ React.createElement("button", { className: "link-btn", onClick: () => setSeries(sn, true) }, "all"), /* @__PURE__ */ React.createElement("button", { className: "link-btn", onClick: () => setSeries(sn, false) }, "none")), groups[sn].map((b) => /* @__PURE__ */ React.createElement("label", { key: b.id, style: { display: "flex", gap: 8, alignItems: "center", fontSize: 12.5, padding: "3px 0", cursor: "pointer" } }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: sel.indexOf(b.id) >= 0, onChange: () => toggle(b.id) }), /* @__PURE__ */ React.createElement("span", null, b.title, " ", /* @__PURE__ */ React.createElement("span", { style: { color: "var(--muted)" } }, "\xB7 ", b.level))))))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, alignItems: "center", marginTop: 12 } }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-navy", onClick: save, disabled: busy }, busy ? "Saving\u2026" : "\u{1F4BE} Save licensed titles"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, fontWeight: 800, color: "var(--muted)" } }, sel.length ? sel.length + " of " + ALL_BOOKS.length + " selected" : "full catalogue")));
}
function Profile({ user, theme, setTheme, schoolName, setSchoolName }) {
  const fileRef = useRef(null);
  const doImport = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    importBackup(f, (ok) => {
      if (ok) {
        toast("Backup restored \u2014 reloading", "\u{1F4BE}");
        setTimeout(() => location.reload(), 900);
      } else toast("That file isn't a valid AzharEd backup", "\u26A0\uFE0F");
    });
    e.target.value = "";
  };
  const resetAll = () => {
    if (!confirm("Reset ALL saved data on this device (gradebook, fees, attendance, favourites\u2026)? This cannot be undone.")) return;
    LS.keys().forEach((k) => LS.del(k));
    location.reload();
  };
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "page-head" }, /* @__PURE__ */ React.createElement("h2", null, "\u{1F464} Profile & Settings")), /* @__PURE__ */ React.createElement("div", { className: "card", style: { maxWidth: 560 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 14, marginBottom: 16 } }, /* @__PURE__ */ React.createElement("div", { className: "avatar", style: { width: 54, height: 54, fontSize: 18, background: user.role === "admin" ? "#e94560" : "#00a884" } }, initials(user.name)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 800, fontSize: 17, color: "var(--brand)" } }, user.name), /* @__PURE__ */ React.createElement("div", { style: { color: "var(--muted)", fontSize: 13, textTransform: "capitalize" } }, user.role, " \xB7 ", schoolName))), /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", null, "Email"), /* @__PURE__ */ React.createElement("input", { defaultValue: user.email, readOnly: true })), /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", null, "School name (used on receipts, report cards & printouts)"), /* @__PURE__ */ React.createElement("input", { value: schoolName, onChange: (e) => setSchoolName(e.target.value) }))), /* @__PURE__ */ React.createElement(AdoptionCard, { user }), /* @__PURE__ */ React.createElement("div", { className: "card", style: { maxWidth: 560 } }, /* @__PURE__ */ React.createElement("h3", null, "\u2699\uFE0F Appearance"), /* @__PURE__ */ React.createElement("div", { className: "setting-row" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "st" }, "\u{1F319} Dark mode"), /* @__PURE__ */ React.createElement("div", { className: "sd" }, "Easier on the eyes in dim classrooms \u2014 your choice is remembered.")), /* @__PURE__ */ React.createElement("div", { className: "switch" + (theme === "dark" ? " on" : ""), onClick: () => setTheme(theme === "dark" ? "light" : "dark") }, /* @__PURE__ */ React.createElement("div", { className: "knob" })))), /* @__PURE__ */ React.createElement("div", { className: "card", style: { maxWidth: 560 } }, /* @__PURE__ */ React.createElement("h3", null, "\u{1F4E6} Storage on this device"), (() => {
    const used = storageBytes(), cap = 5 * 1024 * 1024, pctUsed = Math.min(100, used / cap * 100);
    const stu = LS.get("sms:students", []), stf = LS.get("sms:staff", []);
    const photos = [...stu, ...stf].filter((x) => x.photo).length;
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "stat-flex" }, /* @__PURE__ */ React.createElement(Ring, { pct: pctUsed, size: 64, stroke: 6, label: pctUsed < 1 ? "<1%" : Math.round(pctUsed) + "%" }), /* @__PURE__ */ React.createElement("p", { style: { flex: 1, fontSize: 12.5, color: "var(--muted)", lineHeight: 1.6 } }, /* @__PURE__ */ React.createElement("b", { style: { color: "var(--text)" } }, (used / 1024).toFixed(0), " KB used"), " of ~5,000 KB available", /* @__PURE__ */ React.createElement("br", null), stu.length, " students \xB7 ", stf.length, " staff \xB7 ", photos, " photos")), /* @__PURE__ */ React.createElement("p", { className: "hint" }, "Records are tiny \u2014 there's room for ", /* @__PURE__ */ React.createElement("b", null, "thousands of students and staff"), ". Photos are auto-compressed to roughly 8 KB each, so around ", /* @__PURE__ */ React.createElement("b", null, "500+ people with photos"), " fit comfortably. If the bar ever fills up, download a backup and remove unused photos."));
  })()), /* @__PURE__ */ React.createElement("div", { className: "card", style: { maxWidth: 560 } }, /* @__PURE__ */ React.createElement("h3", null, "\u{1F4BE} Your data"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 12.5, color: "var(--muted)", marginBottom: 14, lineHeight: 1.6 } }, "Gradebook marks, fees, attendance, timetables, favourites and progress are saved in this browser on this device. Download a backup regularly, and restore it on any other device to move your data across."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-navy", onClick: exportBackup }, "\u2B07\uFE0F Download backup"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-outline", onClick: () => fileRef.current.click() }, "\u2B06\uFE0F Restore backup"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-danger", onClick: resetAll }, "\u{1F5D1}\uFE0F Reset all data"), /* @__PURE__ */ React.createElement("input", { ref: fileRef, type: "file", accept: "application/json", style: { display: "none" }, onChange: doImport }))));
}
function App() {
  const [user, setUser] = useLS("session", null);
  const [, __force] = useState(0);
  useEffect(() => {
    if (SB && !user) {
      cloudProfile().then((p) => {
        if (p && p.role !== "parent") setUser(p);
      }).catch(() => {
      });
    }
  }, []);
  useEffect(() => {
    CLOUD.user = user;
  }, [user]);
  const signOut = () => {
    if (SB && user && user.cloud) SB.auth.signOut().catch(() => {
    });
    setUser(null);
  };
  const [page, setPage] = useState("dashboard");
  const [navOpen, setNavOpen] = useState(false);
  const [theme, setTheme] = useLS("theme", "light");
  const [searchOpen, setSearchOpen] = useState(false);
  const [appBook, setAppBook] = useState(null);
  const [focusBook, setFocusBook] = useState(null);
  const [rcPrefill, setRcPrefill] = useState(null);
  const [favs, setFavs] = useLS("favs", []);
  const [students, setStudents] = useLS("sms:students", SEED_STUDENTS);
  useEffect(() => {
    if (user && user.cloud) {
      Promise.all([cloudPullGradebook(), cloudPullAll()]).then(([gb, all]) => {
        if (all && all.students) setStudents(all.students);
        if (all) {
          applyAdoption(all.adopted);
          __force((x) => x + 1);
        }
        if (gb || all) toast("\u2601 Synced with the school database", "\u2705");
      });
    }
  }, [user && user.cloud]);
  useEffect(() => {
    if (user && user.cloud) cloudPushStudents(students);
  }, [students]);
  const [notices, setNotices] = useLS("sms:notices", SEED_NOTICES);
  const [schoolName, setSchoolName] = useLS("schoolName", "Azhar Model School");
  const [lang, setLang] = useLS("lang", "en");
  LANGV = lang;
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  useEffect(() => {
    document.documentElement.lang = lang === "ur" ? "ur" : "en";
  }, [lang]);
  useEffect(() => {
    const h = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);
  if (!user) return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(Auth, { onLogin: (u) => {
    setUser(u);
    setPage("dashboard");
    toast("Welcome, " + u.name.split(" ").slice(-1) + "!", "\u{1F44B}");
  } }), /* @__PURE__ */ React.createElement(Toasts, null));
  const go = (p) => {
    setPage(p);
    setNavOpen(false);
    if (p !== "reportcards") setRcPrefill(null);
  };
  const goReport = (data) => {
    setRcPrefill(data);
    setPage("reportcards");
    toast("Report card pre-filled for " + data.student, "\u{1F9FE}");
  };
  const nav = [
    { section: "Main" },
    { id: "dashboard", label: "Dashboard", icon: "\u{1F3E0}" },
    { id: "library", label: "Book Library", icon: "\u{1F4DA}" },
    { section: "Teaching" },
    { id: "papergen", label: "Paper Generator", icon: "\u{1F4DD}" },
    { id: "planner", label: "Lesson Planner", icon: "\u{1F5D3}\uFE0F" },
    { id: "diary", label: "Homework Diary", icon: "\u{1F4D4}" },
    { id: "certs", label: "Certificates", icon: "\u{1F3C5}" },
    { id: "training", label: "Teacher Training", icon: "\u{1F393}" },
    { id: "gradebook", label: "Class Gradebook", icon: "\u{1F4CA}" },
    { id: "reportcards", label: "Report Cards", icon: "\u{1F9FE}" },
    ...user.role === "admin" ? [{ section: "Administration" }, { id: "admin", label: "School Management", icon: "\u{1F3EB}" }] : [],
    { section: "Account" },
    { id: "profile", label: "Profile & Settings", icon: "\u{1F464}" }
  ];
  const titles = { dashboard: "Dashboard", library: "Book Library", papergen: "Paper Generator", planner: "Lesson Planner", diary: "Homework Diary", certs: "Certificates", training: "Teacher Training", gradebook: "Class Gradebook", reportcards: "Report Cards", admin: "School Management", profile: "Profile & Settings" };
  const render = () => ({
    dashboard: /* @__PURE__ */ React.createElement(Dashboard, { user, go, openBook: setAppBook, notices }),
    library: /* @__PURE__ */ React.createElement(Library, { openBook: setAppBook, favs, setFavs, onFocus: setFocusBook }),
    papergen: /* @__PURE__ */ React.createElement(PaperGen, { schoolName, openBook: setAppBook }),
    planner: /* @__PURE__ */ React.createElement(Planner, { schoolName, openBook: setAppBook }),
    diary: /* @__PURE__ */ React.createElement(Diary, { schoolName }),
    certs: /* @__PURE__ */ React.createElement(Certificates, { students, schoolName }),
    training: /* @__PURE__ */ React.createElement(Training, { user }),
    gradebook: /* @__PURE__ */ React.createElement(Gradebook, { students, goReport, user }),
    reportcards: /* @__PURE__ */ React.createElement(ReportCard, { prefill: rcPrefill, students }),
    admin: /* @__PURE__ */ React.createElement(AdminSMS, { students, setStudents, notices, setNotices, schoolName }),
    profile: /* @__PURE__ */ React.createElement(Profile, { user, theme, setTheme, schoolName, setSchoolName })
  })[page] || /* @__PURE__ */ React.createElement(Dashboard, { user, go, openBook: setAppBook, notices });
  return /* @__PURE__ */ React.createElement("div", { className: "shell" }, /* @__PURE__ */ React.createElement("div", { className: "sb-backdrop" + (navOpen ? " show" : ""), onClick: () => setNavOpen(false) }), /* @__PURE__ */ React.createElement("div", { className: "sb" + (navOpen ? " open" : "") }, /* @__PURE__ */ React.createElement("div", { className: "sb-logo" }, /* @__PURE__ */ React.createElement("img", { src: LOGO_AZHAR, alt: "Azhar Publishers" }), /* @__PURE__ */ React.createElement("div", { className: "mark" }, "MAKTA", /* @__PURE__ */ React.createElement("span", null, "B"), " ", /* @__PURE__ */ React.createElement("span", { style: { color: "var(--gold)", fontSize: 16 } }, "\u0645\u06A9\u062A\u0628")), /* @__PURE__ */ React.createElement("p", null, "Azhar Publishers \xB7 Book Factory")), /* @__PURE__ */ React.createElement("nav", { className: "sb-nav" }, nav.map((it, i) => it.section ? /* @__PURE__ */ React.createElement("div", { key: i, className: "sb-sec" }, t(it.section)) : /* @__PURE__ */ React.createElement("div", { key: it.id, className: "sb-item" + (page === it.id ? " active" : ""), onClick: () => go(it.id) }, /* @__PURE__ */ React.createElement("span", { className: "si" }, it.icon), t(it.label)))), /* @__PURE__ */ React.createElement("div", { className: "sb-foot" }, /* @__PURE__ */ React.createElement("div", { className: "sb-user" }, /* @__PURE__ */ React.createElement("div", { className: "avatar", style: { background: user.role === "admin" ? "#e94560" : "#00a884" } }, initials(user.name)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "name" }, user.name), /* @__PURE__ */ React.createElement("div", { className: "role" }, user.role))), /* @__PURE__ */ React.createElement("div", { className: "sb-logout", onClick: signOut }, "\u21A9 ", t("Sign out")))), /* @__PURE__ */ React.createElement("div", { className: "content-area" }, /* @__PURE__ */ React.createElement("div", { className: "topbar" }, /* @__PURE__ */ React.createElement("div", { className: "topbar-left" }, /* @__PURE__ */ React.createElement("button", { className: "hamburger", onClick: () => setNavOpen((o) => !o), "aria-label": "Menu" }, "\u2630"), /* @__PURE__ */ React.createElement("h1", null, t(titles[page]))), /* @__PURE__ */ React.createElement("div", { className: "topbar-right" }, /* @__PURE__ */ React.createElement("div", { className: "searchbox", onClick: () => setSearchOpen(true) }, "\u{1F50D} ", /* @__PURE__ */ React.createElement("span", null, t("Search books, papers\u2026")), /* @__PURE__ */ React.createElement("kbd", null, "Ctrl K")), /* @__PURE__ */ React.createElement("button", { className: "icon-btn", style: { width: "auto", padding: "0 10px", fontSize: 12, fontWeight: 800 }, title: "\u0627\u0631\u062F\u0648 / English", onClick: () => setLang(lang === "ur" ? "en" : "ur") }, lang === "ur" ? "EN" : "\u0627\u0631\u062F\u0648"), /* @__PURE__ */ React.createElement("button", { className: "icon-btn", title: "Toggle dark mode", onClick: () => setTheme(theme === "dark" ? "light" : "dark") }, theme === "dark" ? "\u2600\uFE0F" : "\u{1F319}"), /* @__PURE__ */ React.createElement("span", { className: "role-badge" }, t(user.role)))), /* @__PURE__ */ React.createElement("div", { className: "main" }, render())), appBook && /* @__PURE__ */ React.createElement(BookModal, { book: appBook, onClose: () => setAppBook(null), favs, setFavs, onFocus: setFocusBook }), focusBook && /* @__PURE__ */ React.createElement(FocusMode, { book: focusBook, onClose: () => setFocusBook(null) }), searchOpen && /* @__PURE__ */ React.createElement(SearchModal, { onClose: () => setSearchOpen(false), onOpenBook: (b) => setAppBook(b), go }), /* @__PURE__ */ React.createElement(Toasts, null));
}
ReactDOM.createRoot(document.getElementById("root")).render(/* @__PURE__ */ React.createElement(App, null));
