# Put AzharEd online (free, ~10 minutes)

This `AzharEd_Deploy` folder is **self-contained** — the app plus all its content. It's ready to host as-is. You do NOT email `index.html` on its own; that never works (your friend saw the code because a lone HTML file has no content and opens in a text editor).

## Easiest: Netlify Drop (no account needed to try)

1. Go to **https://app.netlify.com/drop** in your browser.
2. Drag the whole **`AzharEd_Deploy`** folder onto the page (or drag `AzharEd_Deploy.zip`).
3. Wait for the upload (it's ~320 MB, so a few minutes on a decent connection).
4. Netlify gives you a link like `https://your-name.netlify.app` — that link works on **any laptop**, no install.
5. To keep the link permanently, create a free Netlify account when prompted and click **Keep this site**.

## Alternatives

- **Cloudflare Pages** (pages.cloudflare.com) — free, similar drag-and-drop after a free sign-up.
- **GitHub Pages** — free; upload this folder to a repo and enable Pages (a bit more technical).

## Just want it on another laptop without internet?

Copy the entire **`AzharEd_Deploy`** folder (USB, AirDrop, or Google Drive), then on the other laptop open `index.html` by right-clicking → **Open With → Chrome / Safari**. It must be the whole folder, not just `index.html`.

## Good to know

- **Login is a demo only.** Anyone with the link can sign in with the demo accounts (`teacher@azhar.edu / teacher123`). Real per-school logins come when your developer adds a backend — see `DEVELOPER_HANDOFF` in the AzharEd Platform folder.
- **Anyone with the link can view it.** Don't share it wider than you intend.
- **Teach decks now open as PDF** in the browser; flipbooks, interactives and exam papers open in a new tab.
