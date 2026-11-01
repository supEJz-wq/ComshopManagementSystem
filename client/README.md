# client — React frontend

The React frontend for CyberShopOS.

**The full run guide is at [`../README.md`](../README.md)** — how to set up the
database and verify everything works. To open the website after setup, follow
the two-terminal steps below.

## How to open the website

Complete the [first-time setup](../README.md#2-first-time-setup) first, including
the database, root `.env` file, and `npm install` in the `client` folder. Make
sure SQL Server is running, then open two PowerShell terminals.

### Terminal 1 — start the backend

```powershell
cd C:\Users\Administrator\Desktop\comshop\server
php -S localhost:8000 router.php
```

Leave this terminal running.

### Terminal 2 — start the frontend

```powershell
cd C:\Users\Administrator\Desktop\comshop\client
npm run dev
```

Leave this terminal running too. If the project is in a different location,
adjust the paths in both terminals.

### Open the website in your browser

Open [http://localhost:5173](http://localhost:5173). If Vite shows a different
local address in Terminal 2, use that address instead.

Sign in with `admin` / `admin123` or `cashier` / `cashier123` if the demo data
has been loaded and the passwords have not been changed.

Keep both terminals open while using the website. To stop it, press `Ctrl+C`
in each terminal.

## Commands

Run from this directory:

```sh
npm install     install dependencies
npm run dev     dev server at http://localhost:5173
npm run build   production build to dist/
npm run lint    oxlint
npm run preview serve the production build
```

`npm run dev` must be running alongside the API — see the steps above.

## It needs the backend

This app no longer stores anything itself. It talks to the PHP API started in
Terminal 1.

`vite.config.js` proxies `/api` to `localhost:8000`, so the browser only ever
calls its own origin. That keeps the session cookie working under `SameSite=Lax`
and means CORS never applies in development.

## The two files that matter most

| File | Responsibility |
| --- | --- |
| `src/api.js` | The **only** place the frontend calls the backend. Base URL, credentials, JSON, errors. |
| `src/normalize.js` | Translates the API's `snake_case` into the `camelCase` the screens use. One mapping, one place. |

Nothing else should call `fetch` directly. If a new screen needs the API, it
goes through `api.js` and returns already-normalised data.

## Layout

```text
src/
├── main.jsx                    React root + BrowserRouter + all providers
├── App.jsx                     Route table + auth / admin-only guards
├── api.js                      fetch wrapper — the only API caller
├── normalize.js                API shape -> screen shape
├── index.css                   Tailwind entry + @theme static state tokens
│
├── context/                    State, each backed by the API
│   ├── auth.js                 Auth context object + useAuth hook
│   ├── AuthProvider.jsx        login / logout / reset password / deactivate
│   ├── pcContext.js            PC context object + usePcs hook
│   ├── PcProvider.jsx          PC list, registration, status, repair
│   ├── rentalContext.js        Rental context object + useRentals hook
│   ├── RentalProvider.jsx      1s display tick + start/stop/extend/transfer
│   ├── transactionContext.js   Transaction context + useTransactions hook
│   └── TransactionProvider.jsx bills, settlement, refunds
│
├── data/                       Display + domain rules, NO mock data
│   ├── pcs.js                  PC_STATUS, ALLOWED_TRANSITIONS
│   ├── pricing.js              rate, ₱100 promo, rounding, formatting
│   ├── rentals.js              display timer math, warning tiers, periods
│   ├── refunds.js              refund figures, net amount
│   └── revenue.js              period/list helpers
│
├── components/                 Shared UI
│   ├── AppShell.jsx            layout: sidebar + header + main
│   ├── Sidebar.jsx             role-aware navigation + sign out
│   ├── PcTile.jsx              one PC: state, timer, actions
│   ├── pcStatus.jsx            STATUS_VISUALS + TILE_ACTIONS
│   ├── RentalTimer.jsx         rolling display timer + warning chip
│   ├── TransferPicker.jsx      eligible transfer destinations
│   ├── Pager.jsx               shared pagination
│   ├── DataState.jsx           the shared API-failure card
│   ├── skeletons.jsx           auth loading status + content skeletons per page
│   └── AnalyticsCharts.jsx     Recharts panels (admin only)
│
└── pages/                      Route views
    ├── Home.jsx                landing: role + live counts
    ├── Login.jsx               login
    ├── Accounts.jsx            admin-only: reset / deactivate / reactivate
    ├── PCs.jsx                 the Status Board
    ├── Rentals.jsx             active rentals, soonest-ending first
    ├── Payments.jsx            unsettled + settled bills, refunds, net
    ├── Refunds.jsx             refund / adjustment panel
    ├── Revenue.jsx             revenue + transaction history
    └── Analytics.jsx           admin-only analytics
```

## Loading and failure

Every screen has both, and they look different on purpose.

**Loading** keeps the thin top line in `index.html`. The initial session check
uses a plain background with no centered logo, message or panel. Once the user
is known, the sidebar and header stay visible and usable while static gray
content skeletons from `components/skeletons.jsx` stand in for Home, PCs,
Rentals, Payments, Revenue and Analytics. Accounts is ready with the auth
response, so it needs no extra skeleton stage.

Skeleton headers follow the real cards' spacing and text wrapping. Row/tile
counts are illustrative, not inventory or transaction counts. The page content
fades in over 200ms when ready; the shell and boot layer use 240ms transitions.
There is no artificial minimum wait or skeleton shimmer. Reduced-motion
preferences disable the top-line animation and all reveal transitions.
Loading status remains available to screen readers; decorative placeholders
have no interactive controls.
PCs waits for computers, rentals and bills together; Rentals waits for both
computers and rentals. Errors replace loading with the existing failure card.
No page content or session is cached in the browser.

With both local servers running and the documented demo accounts available,
run `node qaTesting/automation/check-refresh.cjs` from the repository root.
This checks every accessible page for both roles, delays each startup stage
to verify stable navigation, skeleton header geometry, fades, redirects and
failures. Set `UI_VIEWPORT_WIDTH=782` to run the same checks at laptop width.
Screenshots are saved under `qaTesting/artifacts/refresh-ui/`.

**Failure** is one card in `components/DataState.jsx`, shared by every screen,
naming the error and how to check the API.

## What lives where

The split matters and is easy to get wrong.

**The server owns the truth.** Billing, pricing, refunds, permissions and
revenue are decided in PHP against the database. The browser cannot change any of
them — a doctored request is refused server-side.

**The client owns presentation.** The countdown display, the warning chips, the
day grouping, the peso formatting. These are cosmetic and stay here.

`blockSeconds` / `blockStartedAt` drive the **display**; `startedAt` on the server
drives the **bill**. The display rolls and never shows 0:00; the bill is real
elapsed time. That separation is why a page refresh cannot give away free time.

## Conventions

```text
Components / views   .jsx
Config               .js
Styling              Tailwind utility classes only
Layout               AppShell wraps every route
Routing              routes declared in src/App.jsx
State colors         src/index.css @theme tokens — never raw color names
Data face            machine-read numbers use font-data, never font-mono
```

## Where the figures come from

The server owns every number that is money. `/api/revenue` returns the period's
figures **and** the bills and refunds inside that period — each bill already
netted of its refunds — and the seven `/api/analytics/*` endpoints return the
chart series. The screens display what they are told; they do not recompute.

`src/data/revenue.js` holds only the period vocabulary (which periods the
screen offers, and to which role) and `formatRef`. The calculators that used
to live there were deleted in Phase 11, when the same rule was living in two
places and the two were free to disagree.

The period rule itself — what "this month" covers, and which bills fall inside
it — is the server's. A Cashier who asks the API for any period other than
Today is answered with Today, and the analytics endpoints refuse a non-Admin
outright. The screen narrows the choice; the server closes the door.

**One duplication remains**, and it is deliberate for now: the refund panel on
the Payments screen previews its own refund ceiling using `src/data/refunds.js`.
The server enforces the cap when the refund is recorded, so that number is a
preview rather than a second source of truth.
