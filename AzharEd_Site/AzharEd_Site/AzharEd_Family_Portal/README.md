# AzharEd Family — parent & student portal (viewable demo)

A phone-style app showing what **parents and children** would see, using the same books
and question bank as the teacher platform. Keep this folder next to `AzharEd_Deploy`
(it reads content from there).

**Open it:** double-click `index.html` — best viewed narrow (or in Chrome press F12 →
phone icon to preview as a mobile screen).

## What's in the demo

Tap one of the three demo children to "log in", then use the bottom tabs:

- **🏠 Home** — attendance %, fee status and book count at a glance; today's class
  timetable (so a parent knows what to ask at pick-up); the latest school notice.
- **📚 Learn** — the child's real books with covers; open the flipbook to read together
  or launch the interactive lesson; **⭐ Practice time** gives the child three big
  tap-to-answer questions pulled from their book's actual pages (stars for right answers).
- **🧾 Report** — the term report card as parents would see it: marks, grades, skills
  ratings and the teacher's written note.
- **💰 Fees** — paid/due status with history (one demo child has dues to show that state).
- **📢 Notices** — the school noticeboard.

## How attendance & fees get reflected

Three levels, from demo to fully live:

1. **Demo numbers** — out of the box, each child shows sample attendance/fees
   (from `children.js` or friendly defaults).
2. **🟢 Live link (same browser)** — if AzharEd One (the teacher platform) has been used
   in the same browser, the portal finds the child in the school register **by name +
   class** and shows the real numbers: attendance % is computed from every day the
   teacher marked, and the fee card shows the actual due/paid from the register.
   A green "Live from the school register" badge appears when this kicks in.
   Try it: open AzharEd One → Office → mark Ahmed Ali absent → refresh the portal.
3. **Backend (cross-device)** — for parents on their own phones at home, a developer
   adds the server + database; then step 2 happens across all devices automatically.

## Demo vs live

Everything here is sample data for three fictional children. To go live, a developer
adds a **backend** (server + database): each family gets a private login, and the
attendance, marks and fees entered by teachers in AzharEd appear here automatically —
that's the only missing piece. The screens, flows and content connections are all
already designed and working.

Tests: `tools/family_tests.js` (16 checks). Single file, vanilla JS, no build step.
