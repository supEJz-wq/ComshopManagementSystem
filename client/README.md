# CyberShopOS

Computer Shop Management System.

Working name only — the official project name is **Not decided**.

A system for a computer shop to manage PC rentals, manual cash payments,
rental sessions, PC transfers, refunds, revenue, and transaction history.

## Project documentation

The project plan lives in `../projectplan/` and is the source of truth.

| Document | Responsibility |
| --- | --- |
| `../projectplan/projectplan.md` | WHAT the project is |
| `../projectplan/phase.md` | WHAT is built, IN WHAT ORDER |
| `../projectplan/flowchart.md` | HOW the system works |
| `../projectplan/project-structure.md` | WHERE files and folders are organized |
| `../rules.md` | Project rules — followed throughout every phase |

Read `../projectplan/projectplan.md` before contributing.

## Current status

```text
Phase 0  Development Environment & Project Setup   7/8  (0.8 open — git init)
Phase 1  Authentication / User Roles (UI)               owner-verified
Phase 2  PC Management (UI)                             owner-verified
Phase 3  Rental Management (UI)                         owner-verified
Phase 4  Manual Cash Payment (UI)                       owner-verified
Phase 5  PC Transfer (UI)                               owner-verified
Phase 6  Refund & Rental Adjustment (UI)                  owner-verified
Phase 7  Revenue & Transaction History (UI)                not started
```

**Transfers (Phase 5, approved):** when a rented PC is flagged issue or
unresponsive, the customer can be moved. **No additional charge is ever
created** — the billing clock, the display block and the priced pieces are all
left untouched, so the bill cannot move. Both Admin and Cashier may transfer.
A destination may be `free` or flagged `issue` (the plan calls issue "still
usable"), never `unresponsive`, and never a PC that already has a rental. The
source PC goes free only if it was not flagged broken, and every bill keeps
the full chain — `moved PC-08 → PC-15`.

**A PC has three fields** (Phase 5): name, status, and `needsRepair`.
`status` is what the machine is doing right now; `needsRepair` is whether it
has a known problem. They are separate because a transfer can land a customer
on a PC flagged `issue` — the status becomes `rented`, and when that rental
ends the PC goes back to `free`. Without the flag, a machine with a sticky
key would silently rejoin the available pool. A working PC with a known
fault shows a **`needs repair`** badge and offers **Repair**, which clears
the fault without disturbing a running rental.

Phases 0–3 follow the **Frontend First** approach, so every screen reads from
temporary local data (`localStorage`) and mock modules. There is no real
authentication, no API, and no database yet. All of that arrives in
Phases 9–11, when the mock sources are removed.

**Refunds (Phase 6, approved):** a refund is the charge rule run backwards —
`amount paid − (time used, rounded up to 30-min blocks × ₱10)`. So a ₱20
one-hour rental used for 15 minutes refunds **₱10**: 15 minutes consumed a
whole block, and that block is worth ₱10. The 30-minute cliff applies in
reverse — at exactly 30:00 one block is still unused, at 30:01 none is. A
**full** refund is the cashier's own judgement. Refunds need a **paid** bill
and a **reason**, can be recorded more than once, and can never total more
than was paid. A **₱0** entry is allowed and simply records that something
happened — that is how a rental adjustment is captured. Refunds are stored as
their own records, so a bill is never edited.

**Current state:** Phases 0–6 are complete and owner-verified. Phase 7 is next
and nothing blocks it.

**The Payments screen** groups **paid** bills by day — Today, Yesterday, then
dates — newest first, with a total per day. **Unpaid** bills stay flat and
**oldest first**, because grouping would bury the bill most likely to be
forgotten inside a day heading; the two lists sort in opposite directions on
purpose. A three-way **All / Unpaid / Paid** toggle shows live counts, the
screen opens on Unpaid whenever anything is outstanding, the outstanding total
sits in the always-visible header, and the search box matches **PC name**
case-insensitively.

**Next action for a contributor:** Phase 7 — Revenue & Transaction History.

**Pricing (Phase 4, approved):** ₲20 per hour, charged as ₱10 per 30-minute
block, always rounded **up** to the next `:00` or `:30`. A booking or a single
extension of exactly **6 hours costs ₱100** — the promo applies per piece, so
6 hours then +6 hours is ₱200 while 12 hours booked straight is ₱240. A rental
is capped at 24 hours. Whole pesos only, never centavos. All of it lives in
`src/data/pricing.js`.

**Durations** are held in **seconds**. They are entered as hours / minutes /
seconds (hours 0–24, minutes 0–59, seconds 0–59), so a 7-hour rental is not
typed as 420 and a 2-minute emergency rental can be recorded honestly. Shortest
bookable is 60 seconds.

**Payments are settled in full or not at all.** An underpayment is refused and
the bill stays unsettled — forgiving part of a bill on purpose is a rental
adjustment with a recorded reason, which is Phase 6. The Payments screen shows
the total outstanding, orders unsettled bills **oldest first** with a waiting
age, and carries each bill's date, clock span and transfer chain.

**Next action for a contributor:** do not start Phase 6 until the owner
approves it and supplies the partial-refund rule.
## Demo accounts

The two mock accounts, shown in the login screen while testing:

```text
admin    / admin123      Admin / Owner
cashier  / cashier123    Cashier
```

> Passwords are plaintext in `src/data/accounts.js`. This is a Phase 1
> placeholder, not a pattern to carry forward. Both this file and the demo
> notice on the login screen are removed in Phase 11.

## Stack

```text
React 19        JavaScript (JSX)
Vite 8          build tooling + dev server
Tailwind CSS 4  styling, utility classes only
react-router-dom 7   routing
oxlint          linting
PHP 8.4         backend — not started (Phase 10)
```

Database: **Not decided**.
API architecture: **Not decided**.

## Commands

Run from this directory:

```sh
npm install     install dependencies
npm run dev     dev server at http://localhost:5173
npm run build   production build to dist/
npm run lint    oxlint
npm run preview serve the production build
```

## Conventions

```text
Components / views   .jsx
Config               .js
Styling              Tailwind utility classes only
Layout               AppShell wraps every route
Routing              routes declared in src/App.jsx
State colors         src/index.css @theme tokens — never raw color names
```

## Development approach

**Frontend First.** The frontend UI is built before the backend/API/database
are connected. Feature screens in this app read from temporary local data
until Phase 11 replaces them with real API calls.

## Directory layout

```text
src/
├── main.jsx                    React root + BrowserRouter + all providers
├── App.jsx                     Route table + auth / admin-only guards
├── index.css                   Tailwind entry + @theme static state tokens
│
├── context/                    State + behaviour
│   ├── auth.js                 Auth context object + useAuth hook
│   ├── AuthProvider.jsx        Login, logout, password reset, activate
│   ├── pcContext.js            PC context object + usePcs hook
│   ├── PcProvider.jsx          PC list, registration, status transitions
│   ├── rentalContext.js        Rental context object + useRentals hook
│   ├── RentalProvider.jsx      1s tick, start / stop / extend / transfer, 24h cap
│   ├── transactionContext.js   Transaction context + useTransactions hook
│   └── TransactionProvider.jsx Bills on stop, cash, change, settlement
│
├── data/                       Domain rules + temporary mock data
│   ├── accounts.js             MOCK — two accounts, plaintext (Phase 11)
│   ├── pcs.js                  MOCK + PC_STATUS, ALLOWED_TRANSITIONS
│   ├── pricing.js              Rate, ₱100 promo, rounding, bill calculation
│   ├── refunds.js              Refund block rule, hard cap, net
│   └── rentals.js              Time math, warning tiers, MOCK rental
│
├── components/                 Shared UI
│   ├── AppShell.jsx            Layout: sidebar + header + main
│   ├── Sidebar.jsx             Role-aware navigation + sign out
│   ├── PcTile.jsx              One PC: state, timer, start/stop/extend/transfer
│   ├── pcStatus.jsx            STATUS_VISUALS + TILE_ACTIONS
│   ├── RentalTimer.jsx         Rolling display timer + warning chip
│   └── TransferPicker.jsx      Eligible transfer destinations
│
└── pages/                      Route views
    ├── Home.jsx                Landing: role + live PC/rental counts
    ├── Login.jsx               Login screen
    ├── Accounts.jsx            Admin-only: reset / deactivate / reactivate
    ├── PCs.jsx                 The Status Board
    ├── Payments.jsx            Unsettled + settled bills, refunds, net
    ├── Refunds.jsx             Refund / adjustment panel
    └── Rentals.jsx             Active rentals, soonest-ending first
```

`App.css` and `assets/` are unused Vite starter leftovers, retained by owner
decision (Decision 23) and referenced by nothing.

## Local storage keys

All state is mock persistence under the `cybershopos.` prefix and is replaced
by real API calls in Phase 11:

```text
cybershopos.accounts   the two accounts
cybershopos.session    current session id
cybershopos.pcs        PC list
cybershopos.rentals    active rentals
cybershopos.transactions  bills and payments
cybershopos.refunds      refund and adjustment records (separate, by design)
```

To reset the prototype to its seeded state, clear site data for
`localhost:5173` in the browser.
