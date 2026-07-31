# MAKTAB — two files missing from the earlier handover

Contents:
1. `index.html` — the platform FRONT PAGE ("one platform · two doors": Maktab
   Teach + Maktab Family). Goes at the ROOT of `AzharEd_Site/`, alongside the
   `Maktab/`, `Maktab_Cloud/`, `AzharEd_Family_Portal/` folders. Plain HTML/CSS.

2. `AzharEd_Family_Portal/` — the Maktab Family (parent/student) portal:
   attendance, fees, report cards, home practice; Supabase login, RLS-scoped to
   each parent's own children.

## IMPORTANT — rename two files back
Gmail blocks `.js` attachments, so two files were renamed to get past the filter.
After unzipping, rename them back:
- `AzharEd_Family_Portal/children.js.txt`        →  `children.js`
- `AzharEd_Family_Portal/supabase_config.js.txt` →  `supabase_config.js`

## Security note
`supabase_config.js` holds only the PUBLISHABLE (anon) key — safe to ship in the
browser; Row-Level Security enforces access. The SERVICE-ROLE key is NOT here and
must never be committed; take DB access via the Supabase dashboard invite
(Maktab project → Members).

Placement recap: `index.html` at the root of `AzharEd_Site/`; the
`AzharEd_Family_Portal/` folder alongside the other app folders you already have.
No build step — re-deploying `AzharEd_Site` to Netlify makes the front page live.
