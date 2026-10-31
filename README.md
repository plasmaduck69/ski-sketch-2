# Layup Lab

A site for designing DIY skis: a physics engine for the layup, plus everything from the
planning Google Sheet (materials and picks, build rating, ski models, profiles, press, edge
tuning, sources). Same UI as the hosted Layup Lab, with a real backend: accounts with sign-in,
saved projects and picks in a database (Postgres when hosted, SQLite on your own computer), and a
server-side optimizer that checks every layup combination.

## Run it

You need Node.js 22.13 or newer (it uses the SQLite built into Node, so there's nothing native to compile). Node may print a one-line "SQLite is an experimental feature" warning; that's expected.

```bash
npm install
npm run dev        # http://localhost:3000
```

Open it and you'll land on the sign-in page: type your email and press **Continue** (it signs you in or creates your account), or choose **Try it without an account** to use it as a guest. The first account
also takes over any builds saved before sign-in existed. Builds are private to each account.
To stop strangers creating accounts on a public deployment, set `ALLOW_SIGNUPS=false` once
your own account exists.

`npm run dev`, `npm run build` and `npm test` first run `scripts/sync-ui.mjs`, which builds the
lab page from `ui/lab.html` and copies `lib/engine.js` and the logo into `public/lab/`.

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run build` then `npm start` | Production build and server |
| `npm test` | Physics checks, reference-weight calibration, optimizer and database tests |
| `npm run sync-ui` | Rebuild `public/lab/` by hand |

## What's where

```
lib/engine.js          The physics engine. Pure JavaScript, no DOM: runs in the browser and on the server.
lib/engine.d.ts        Types for the engine, used by the TypeScript API routes.
lib/sheet-data.js      Everything from the planning sheet: 26 materials with picks, notes and 1–5
                       ratings; 13 ski models; profiles; press options; edge tuning; sources.
lib/sheet.js           The sheet's Build Rating math (checks, synergy, performance, model similarity),
                       ported and tested against the sheet's own numbers; picks → physics design.
lib/sheet-ui.js        The sheet tabs in the UI.
lib/db.ts              Users, sessions, projects, workbooks and failed sign-ins. Postgres when
                       DATABASE_URL is set (the hosted site), otherwise SQLite via node:sqlite
                       (data/ski-layup-lab.db). The only file that touches the database.
lib/auth.ts            Passwords (scrypt), session cookies, same-site checks, failed-login throttle.
app/login              Sign-in / create-account page.
app/lab/route.ts       Serves the lab page to signed-in users; everyone else is sent to /login.
app/api/auth           signup, login, logout, me.
app/api/workbook       GET / PUT the signed-in user's picks, notes, edited ratings and rating settings.
lib/http.ts            JSON parsing with a size limit, build validation, error responses.
app/api/analyze        POST a build → full physics results. All API routes below need a signed-in user.
app/api/builds         GET list; /api/builds/:id GET, PUT (create or replace), DELETE. Each row is a
                       project: { kind: "project", iterations: [...] }, one iteration per save.
app/api/optimize       POST a build and goal → best layups. Exhaustive by default on the server.
ui/lab.html            The UI. This exact file is also the hosted Claude artifact.
ui/icon.svg            Crossed skis and mountain logo (also app/icon.svg).
scripts/sync-ui.mjs    Wraps ui/lab.html in a page shell (generated/lab-page.ts) that sets
                       window.SKI_LAB_CONFIG = { api: "/api", user } when served.
test/                  node:test suites. db-suite.mjs runs the same storage checks on SQLite and on
                       Postgres (PGlite, a real Postgres in memory), so both databases behave the same.
```

When `window.SKI_LAB_CONFIG.api` is set, the UI saves builds through the API instead of
browser storage, and the optimizer runs on the server and checks every combination
(about 5,000 layups, roughly 5–7 seconds) instead of the quicker in-browser search.

## Accounts and security

- Passwords are hashed with scrypt and a random salt; they're never stored or logged.
- Signing in sets an HttpOnly, SameSite=Lax session cookie (Secure over HTTPS) that lasts 30 days.
  Only a SHA-256 hash of the session token is stored, so a copy of the database can't be used to sign in.
- Requests that change data are rejected if they come from another site.
- After 8 wrong passwords for one email from one address, sign-in pauses for 15 minutes.
- Every build row has an `owner`; one account can't read, change or delete another's builds.

Not included yet: password reset by email and "sign in with Google". Both need an email or
OAuth provider; add them in `lib/auth.ts` when you deploy.

## API

```http
POST /api/analyze     { "build": {...}, "units": "metric" | "us" }
POST /api/optimize    { "build": {...}, "goal": "performance" | "racing" | "park" | "east" | "soft" | "mixed" | "allday",
                        "lock": ["core","thickness","laminate","metal","sidewall"], "maxWeight177": 2200,
                        "units": "us", "thorough": true }
POST /api/auth/signup  { "email": "...", "password": "..." }
POST /api/auth/login   { "email": "...", "password": "..." }
POST /api/auth/logout
GET  /api/auth/me
GET  /api/builds
GET  /api/builds/:id
PUT  /api/builds/:id  { "kind": "project", "name": "...", "createdAt": 0, "updatedAt": 0,
                        "iterations": [{ "id": "i1", "n": 1, "label": "v1", "note": "", "star": false,
                                         "savedAt": 0, "basedOn": null, "build": {...}, "summary": {...} }] }
                      (rows saved before projects, { "name", "build", "summary" }, still work)
DELETE /api/builds/:id
GET  /api/workbook
PUT  /api/workbook   { "workbook": { "picks": {...}, "notes": {...}, "ratings": {...}, "settings": {...} } }
```

A build is the same JSON the UI shows under "Build file (JSON)". Missing fields are filled in
from the default build, so older saved builds keep working.

## How the engine works

The ski is cut into 241 cross-sections. Each one gets its width from the sidecut circle and its
core thickness from the taper, then the full stack of layers. Bending stiffness (EI) uses the
transformed-section method; torsional stiffness (GJ) uses each layer's shear modulus and its
distance from the neutral axis. Fabrics go from areal weight to cured thickness and stiffness with
micromechanics (rule of mixtures, Halpin–Tsai) and classical lamination theory. Whole-ski numbers:
three-point flex between the camber contact points, first vibration mode (Rayleigh method),
damping from modal strain energy plus a constrained-layer term for the rubber strip, and the energy
stored bending the running length into a 15 m carve.

Six production skis are modeled from published dimensions and construction, with the underfoot
core thickness solved so the modeled weight matches the published weight (`tuneToWeight`). Their
results set the 1–5 attribute ranges. If you change a reference layup, run `npm test`: it checks
that every reference still matches its published weight within 1.5%.

Material values are textbook averages (USDA Wood Handbook, manufacturer data); real wood varies
about ±20%. Use the numbers to compare designs, not as exact predictions. Damping is the least
certain output. Weighing and flex-testing your own finished ski is the best way to calibrate it.

## Putting it online (Vercel + Neon, both free)

1. Put this folder in a GitHub repo.
2. At [vercel.com/new](https://vercel.com/new), sign in with GitHub, pick the repo and press
   **Deploy**. Vercel detects Next.js; no settings to change.
3. In the new Vercel project, open **Storage**, create a **Neon** database (the Free plan is
   enough), and **Connect** it to the project. That adds `DATABASE_URL`.
4. Open **Deployments**, and on the latest one choose **Redeploy** so it picks up the database.

The site is then live at `https://<project>.vercel.app`, and every push to the repo redeploys it.
Tables are created on first use. Until step 4, the sign-in page says the database isn't
connected yet instead of failing.

| Setting (Vercel → Settings → Environment Variables) | Effect |
| --- | --- |
| `DATABASE_URL` | Postgres connection string. Set by the Neon connection; `POSTGRES_URL` also works. |
| `ALLOW_SIGNUPS=false` | Only existing accounts can sign in. Set it once your own account exists if the site is just for you. |
| `DATABASE_POOL_MAX` | Connections per server instance (default 3). |

Other hosts: anything that runs Node 22.13+ works. With a persistent disk (Render, Fly.io,
Railway, a VPS) you can skip Postgres and set `SKI_DB_PATH` to a file on that disk instead.
The exhaustive optimizer takes 5–7 seconds; `maxDuration` on that route is set to 60.

## Next steps

- **Password reset and Google sign-in.** Need an email service or OAuth app; see `lib/auth.ts`.
- **Parallel optimizer.** Split the exhaustive search across `worker_threads` to cut it to a second or two,
  or widen the search space (tip and tail core thickness, fabric weights, camber).
- **Port the UI to React** one panel at a time. The engine and API don't change.
- **Calibrate with your own ski.** Add a measured weight and flex test as a seventh reference.
