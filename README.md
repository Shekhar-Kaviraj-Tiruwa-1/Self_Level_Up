# Shek — Level Up v3.1

Editable dashboard for Solo‑Leveling style growth: dailies, weeklies, bosses, weight tracker, job tracks, **editable Rank‑A goals**, and a top **countdown** to your first milestone (default: 6 months + 1 day).

## Run locally
```bash
npm install
npm run dev
```

## Deploy to GitHub Pages (via Actions)

1. Create a **new GitHub repo** (any name). Push this project.
2. Go to **Settings → Pages**:
   - **Source**: "GitHub Actions".
3. Commit the workflow below (already included at `.github/workflows/deploy.yml`).

The workflow builds the site, uploads the artifact, and deploys to Pages. It also sets the correct base path automatically using your repo name (so Vite assets resolve at `https://<username>.github.io/<repo>/`).

If you use a **custom domain** or a **user/organization site** (`<username>.github.io`), you can set `BASE_PATH` to `/` in the workflow.

## Notes
- All data is stored in `localStorage`. Use the Settings page (v3) to export/import JSON if you need backups.
- Countdown can be edited (title and ISO date). Default is **now + 6 months + 1 day**.
- Rank‑A criteria can be **added/edited/deleted**.

Enjoy leveling!
