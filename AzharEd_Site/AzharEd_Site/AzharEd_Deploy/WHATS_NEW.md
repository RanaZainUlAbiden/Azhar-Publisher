# AzharEd 2.0 — What's new (July 2026)

The platform got a full redesign and feature upgrade. Your old version is saved as
`_backup_index_v1.html` — nothing was lost.

## The big one: everything now SAVES

Before, every mark, fee, student and attendance tick vanished when you refreshed the page.
Now everything is saved automatically in the browser on that device:

- Gradebook marks, students and subjects (per class + section + term)
- Fees, payments, students, staff, notices, timetables
- Attendance — now stored **per date**, with a date picker and monthly % per student/teacher
- Report card contents, favourites, reading progress, dark-mode choice, your login session

**Backup & move devices:** Profile & Settings → *Download backup* gives one file with all
data; *Restore backup* loads it on any other laptop.

## New features

| Area | What's new |
|---|---|
| 🔍 Search | Press **Ctrl+K** (or click the search box) — instantly search all 20 books, 140 papers, flipbooks, decks and pages |
| 🏠 Dashboard | "Continue where you left off", favourite books, live notices, real usage stats |
| 📚 Library | Search + sort, ⭐ favourites, progress bar per book, ✓ ticks on every paper you've opened, "Mark all done" |
| 📊 Gradebook | Real classes (PG–5, sections A–D, 3 terms), add/remove subjects, **import students from School Management**, CSV export, class average KPIs |
| 🧾 Report cards | One click from the Gradebook pre-fills the card with the student's marks; student picker; auto-saves |
| 💰 Fees | **💬 WhatsApp fee reminders** to guardians (ready-made message), CSV export, receipts as before |
| 🗓️ Attendance | Per-date history, mark-all-present, printable attendance sheet, monthly percentages |
| 📅 Timetable | Saves edits, printable per class/section |
| 📢 Notices | Share any notice to WhatsApp with one tap |
| 🎓 Training | Paste a YouTube link on any topic → thumbnail + built-in player; admins can add topics |
| 🌙 Design | New typography, dark mode, animations, toasts, better mobile layout |
| ⚙️ Settings | School name (used on receipts/report cards/printouts), backup/restore/reset |

## Automation: adding new books is now automatic

Drop new files into the class folders (following the same naming pattern), then run:

```
python3 tools/rebuild_content_data.py
```

It rescans every folder and rebuilds `content_data.js` — new books, papers, decks,
flipbooks and covers appear on the site by themselves. Use `--check` for a dry run.

## Update 2 (same day)

- **📷 Photos** — click any student or staff picture in School Management to add a photo
  (auto-compressed to ~8 KB); click again to change or remove. Photos appear in the
  gradebook, attendance, report cards and printable **🪪 student ID cards**.
- **⭕ Progress rings** — dashboard, library cards, book pages, gradebook class average,
  fee collection and attendance now show rings instead of bars.
- **Class-appropriate subjects** — Classes One–Five get Urdu, Islamiat, General Knowledge,
  Maths, Science, Social Studies, Computer, Nazra Quran… while Playgroup/Nursery/Prep keep
  early-years subjects. Applies to gradebook defaults, one-tap subject suggestion chips,
  and timetable cell dropdowns.
- **📤 CSV student import** — bulk-add students from a spreadsheet (Name, Class, Section,
  Guardian, Phone, Fee), plus a student search box.
- **📦 Storage meter** (Profile & Settings) — shows exactly how much device storage is used.
  Capacity: thousands of students/staff without photos; roughly 500+ with photos.

## Update 3 — six new features (July 8)

- **📝 Paper Generator — tailored to your books.** 954 questions were extracted from the
  actual pages of your 18 interactive books. Pick a book, set the page range you've taught
  ("pages 1–20"), and print a randomized test built from those exact pages — with an
  optional answer key showing page references. Classes 1–5 use a general subject bank
  until their books are added. Your 140 ready-made PDF papers are untouched and linked
  on the same page. Add your own questions per book too.
  (Rebuild the bank after adding interactives: `python3 tools/build_question_bank.py`)
- **🗓️ Lesson Planner.** Week-by-week plan per subject per class ("Week 3: Counting book
  p. 12–15"), copy-last-week, printable, with one-tap access to that class's books.
- **📄 Monthly Reports** (School Management → Reports): printable student & staff
  attendance registers for any month, plus a fee report with defaulter list.
- **🌐 Urdu toggle.** اردو button in the top bar switches menus and headings to Urdu.
- **📱 Install as an app (PWA).** Once hosted online, the site can be installed on
  phones/tablets and keeps working offline (books cached after first open).
- **🖨️ Bulk report cards.** Report Cards → "Print whole class" prints every student's
  card from a gradebook sheet in one go, photos included.

## Notes

- Data is per-browser-per-device (no server yet). For real multi-school logins a
  developer adds a backend — see `DEVELOPER_HANDOFF`.
- The old `AzharEd_Deploy.zip` files are outdated; re-zip this folder (or drag the
  folder itself onto Netlify Drop) when deploying.
