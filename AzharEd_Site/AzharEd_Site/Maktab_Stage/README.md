# MAKTAB مکتب — a cinematic reimagining

Same 28 books. Entirely different soul. Nothing else was touched — this folder only
*reads* content from `AzharEd_Deploy` next to it.

**Open it:** double-click `index.html` (Chrome). Press `/` anytime to search.

## The idea

AzharEd is a desk. AzharEd One is a classroom. **MAKTAB is a stage.**

It's designed for the way these books are actually used — projected on a classroom
wall — so it borrows its language from cinema and streaming, not from office software:

- **A dark theatre.** Deep ink-blue void, glowing covers, amber and cyan light.
  Book covers look stunning on a projector against black.
- **A rotating hero.** One featured book fills the screen at a time — blurred cover as
  the backdrop, big title, one gold button: **▶ Teach this now.**
- **Shelf rails.** Netflix-style rows you glide along: *Fresh off the press* (the eight
  newest books), *Playgroup / Nursery / Prep shelves*, and *Quiz-ready*. Hover a cover
  and it lifts and glows.
- **🎬 Focus Mode — the heart of it.** Any book becomes a full-screen lesson stage:
  four giant launch tiles (Flipbook / Interactive / Slides / Quick quiz) and a built-in
  **lesson timer** — pick 10/20/30/40 minutes, a cyan ring counts down, turns rose in
  the final minute, and the room pulses when time's up. Made to sit on the projector
  for the whole period.
- **⚡ Quick quiz, theatre-sized.** Three questions from the book's real pages, rendered
  huge for the whole class to answer together.
- **✦ Spotlight.** Press `/` — one giant centered search across every book and paper.
- Small touches: live clock, Urdu flourishes (مکتب, shelf names in Gulzar script),
  "welcome back" remembering the last book on stage.

## 🗂 Office — plain names, same style

The top-bar **Office** button opens the management side (dark theme, but everyday words
so office staff feel at home):

- **📋 Attendance** — class pills, date picker, tap each child's circle for P / A / L,
  one-tap "Mark all present", tap a name to edit or remove, tap a pink badge to receive
  a fee payment (receipt prints), enroll inline.
- **💰 Fees** — collected / outstanding totals, one row per family with dues: print their
  voucher or send a WhatsApp reminder; all-vouchers button too.
- **🧾 Gradebook** — per-class, per-term grid saving to the **shared gradebook** (same one
  AzharEd, AzharEd One and the Family portal read). Print class report cards.
- **🏅 Certificates** — pick a child and an award (Star of the Week, Best Handwriting…),
  optional reason, print an A4 landscape certificate with signature lines.
- **📇 Student Register** — every student in the school in one table (guardian, phone,
  fee, paid, due); tap a row to edit; printable.
- **🧑‍🏫 Staff Register** — table with P/A/L marking, this-month attendance %, add/remove.
- **📢 Noticeboard** — post, WhatsApp-share, delete.
- **🖨️ Printables** — monthly attendance registers and the fee/defaulter report.

The Office shares the same register storage as AzharEd One and the Family portal —
mark Ahmed absent here and his parent's app shows it.

## 🎓 Teacher training

A rail on the main screen: six training topics as wide video cards. Tap **🔗 LINK** on a
card to paste a YouTube link (shared with AzharEd's Training page — link it once, it
appears in both); tap the card to watch in a built-in player.

Tech: one `index.html`, vanilla JS, zero dependencies, works offline from a folder.
Tests: `tools/maktab_tests.js` (22 checks).
