# MAKTAB مکتب — Developer Build

Conventional split of the MAKTAB flagship app (the single-file version lives in `../Maktab/`
and remains the one the owner uses day-to-day; both are generated from the same source).

## Structure

| File | What it is |
|---|---|
| `index.html` | Clean shell — loads fonts, React 18 UMD (CDN), the shared content manifests, `styles.css`, `app.js` |
| `styles.css` | Full stylesheet (extracted; CSS custom properties, light + dark themes via `[data-theme]`) |
| `src/app.jsx` | **The source.** All components, ~2,000 lines of JSX |
| `app.js` | Compiled output actually loaded by the browser — never edit by hand |
| `tools/pro_tests.js` | jsdom test suite (55 checks) |

## The finished product (what we are building towards)

One platform, four layers:

1. **Azhar Publishers Console** (to build — the priority task): publisher-only panel
   listing every school with its licensed titles, subscription status and renewal date.
   Backing table `school_books` already exists with RLS; today the title picker sits in
   the school admin's Settings as a stopgap — move it behind a new `publisher` role.
2. **One cloud database** (live): accounts/roles, students, staff, attendance, fees,
   gradebook, planner, notices, parent–child links, per-school licences. Every school
   walled off by RLS; parents locked to their own children.
3. **Three apps** (live): **Teach** (teachers/admins — library, Focus Mode, paper
   generator, gradebook, school management), **Family** (parents — own child's marks,
   attendance, fees), **One** (classroom canvas — still offline/localStorage).
4. **Content engine** (live): drop a book folder in, run two scripts, the whole
   platform gains the book — cover, flipbook, interactive, deck, auto-extracted exam
   questions.

Remaining for "finished": publisher console · content licensing gate (signed URLs) ·
payment collection (optional) · conflict-safe sync queue · security review · mobile pass.

## How it works right now (current state, 2026-07-15)

- Visitor opens the site → landing page → **Maktab_Cloud** → sign-in screen.
- Cloud sign-in checks Supabase auth; profile row gives role + school. Parents are
  bounced to the Family portal and vice-versa (role guards on both apps).
- On login the app pulls: gradebook sheets, students, staff, last-70-days attendance,
  fee payments, licensed-title list → written into localStorage (the offline cache) →
  UI renders from it. `applyAdoption()` filters the global BOOKS list.
- Every edit writes localStorage instantly (offline-safe) and pushes to Supabase with
  a ~1.5s debounce. Students map local ids → cloud uuids via a `cid` field.
- Admins link parents: Students table 👪 → email lookup in `profiles` → row in
  `parent_children`. Parent portal reads are RLS-scoped — no client-side filtering.
- No internet / no Supabase config → app runs exactly as the old offline demo.

## Sample-content bundle for handover

The owner may hand over a trimmed bundle (code + 2–3 sample books instead of the full
48-book catalogue). `make_sample_bundle.py` in this folder builds it — see its header.
The app makes zero assumptions about catalogue size; the content pipeline regenerates
manifests for whatever books are present.

## Build

No bundler config, one command:

```bash
npx esbuild src/app.jsx --loader:.jsx=jsx --outfile=app.js
```

(Or `--minify` for production.) Babel-standalone is gone in this build — JSX is precompiled,
so first paint is faster than the single-file version.

## Run

This folder must sit **next to `AzharEd_Deploy/`** — all book content (flipbooks,
interactives, decks, covers, `content_data.js`, `question_bank.js`) is served from there via
the `BASE` constant near the top of `src/app.jsx`:

```js
const BASE = "../AzharEd_Deploy/";
```

Point that anywhere (CDN, S3 bucket, `/content/`) when restructuring for the server.

## Tests

```bash
npm i esbuild react@18.2.0 react-dom@18.2.0 jsdom     # once
npx esbuild src/app.jsx --loader:.jsx=jsx --outfile=/tmp/pro.compiled.js
node tools/pro_tests.js
```

## Content pipeline (do not hand-edit the manifests)

- `AzharEd_Deploy/tools/rebuild_content_data.py` → regenerates `content_data.js` from the
  book folders (48 books, 3 series, levels Playgroup→Class 5)
- `AzharEd_Deploy/tools/build_question_bank.py` → regenerates `question_bank.js`
  (1,246 printable questions parsed from the interactives; two formats — `const META = {…}`
  page-keyed, `const ACT = […]` chapter-keyed)

## Database (LIVE — Supabase)

The database exists: Supabase project **Maktab** (`gfefjykpytjanvikdsed`, AWS Tokyo),
owned by the Azhar Publishers Supabase account. 12 tables + RLS applied —
see `schema_v1.sql` (the applied migration) and `supabase_config.js` (project URL +
publishable key; browser-safe, RLS-guarded). Auth flow already wired in `src/app.jsx`:
cloud sign-in via `SB.auth.signInWithPassword` with profile lookup, demo/offline
fallback when Supabase is unreachable. A DB trigger auto-creates a `profiles` row for
each new auth user (first ever user becomes admin).

**Developer access:** ask the owner to invite you from the Supabase dashboard —
Organization → Team → Invite member. Do not share account passwords.

**Wired and working (2026-07-15):** gradebook sync · students (insert/upsert/archive with
cid uuid mapping) · staff · attendance (last-7-days upsert) · fee payments (insert on receive) ·
full pull-on-login (`cloudPullAll`) · parent linking (👪 button on each student row, matches
`profiles.email`, writes `parent_children`) · **Family portal cloud mode**
(`AzharEd_Family_Portal/index.html`: parent sign-up/sign-in, RLS-scoped children +
attendance + fees + gradebook marks).

**Also wired:** per-school title adoption — `school_books` table; admin picks licensed titles in Profile & Settings; `applyAdoption()` filters the global `BOOKS` list so library/paper-gen/focus-mode all follow. Empty selection = full catalogue.

**Still to do:** content licensing gate (move flipbooks behind signed URLs / Storage),
conflict-safe sync queue (current: debounced last-write-wins), security review before scale.

## State / the original database job

There is deliberately **no backend**: every register, gradebook and setting is
`localStorage` under the `azhared2:` namespace (shared keys documented in
`../MAKTAB_DEVELOPER_HANDOFF.md`, §3), with a user-facing JSON backup/restore
(format v3, §3). Your job, per the handoff doc §5: multi-tenant Postgres (Supabase
recommended), roles `admin | teacher | parent`, localStorage becomes the offline cache with
a sync queue, auth becomes the license gate for the book content, and the Family portal
switches from shared-storage reads to API reads. The localStorage shapes map ~1:1 to tables.

*Contact: azharpublisherbookfactory@gmail.com*
