# MAKTAB مکتب — the flagship platform

**Everything, combined.** The complete teacher & school platform (every feature of AzharEd)
plus the show-stopping teaching tools from MAKTAB. Keep this folder next to
`AzharEd_Deploy` — it reads the books, covers and question bank from there.

**Open it:** double-click `index.html`. Same demo logins as AzharEd
(`teacher@azhar.edu / teacher123`, `admin@azhar.edu / admin123`).

## Everything from AzharEd

Book Library, book-tailored Paper Generator, Lesson Planner, Homework Diary,
Certificates, Teacher Training, Class Gradebook, Report Cards (single + whole class),
full School Management (students with photos & ID cards, staff, fees with vouchers &
WhatsApp reminders, per-date attendance, timetables, notices, monthly reports),
Urdu toggle, dark mode, Ctrl+K search, backups. All data saves automatically and is
**shared with AzharEd** — same storage, same gradebook, same register.

## Imported from MAKTAB

- **🎬 Focus Mode** — from any book (library hero or the book page), enter a full-screen
  dark lesson stage: four giant launch tiles (Flipbook / Interactive / Slides / Quick
  quiz) and a lesson timer — 10/20/30/40 minutes, cyan countdown ring that turns rose in
  the last minute. Built for the projector.
- **⚡ Big-screen quiz** — three theatre-sized questions from the book's real pages,
  right inside Focus Mode.
- **🎞 Library hero** — a rotating featured book atop the Book Library with its cover as
  a cinematic backdrop and one gold button: *Teach this now*.

The idea: office software by day, cinema when the projector turns on — in one app.

Tech: single `index.html` (React UMD), no build step. Tests: `tools/pro_tests.js` (55 checks).
