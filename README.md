# CyberShopOS — Run Guide

Computer shop management system: PC rentals, cash payments, transfers, refunds,
revenue and transaction history.

Working name only — the official project name is **not decided**.

- **Frontend** React 19 + Vite 8 + Tailwind CSS 4 (`client/`)
- **Backend** Plain PHP 8.4 REST API, session auth (`server/`)
- **Database** Microsoft SQL Server (`comshop`)

---

## 1. What you need

| Requirement | Version | Check with |
| --- | --- | --- |
| Node.js | 20+ | `node -v` |
| npm | 10+ | `npm -v` |
| PHP | 8.4 | `php -v` |
| SQL Server | 2019+ | — |
| PHP `pdo_sqlsrv` extension | 5.13+ | `php -m \| findstr sqlsrv` |

If `php -m` shows nothing for `sqlsrv`, see [Troubleshooting](#7-troubleshooting).

---

## 2. First-time setup

### 2.1 Create the database

In **SQL Server Management Studio**, connect to your server, then:

```sql
CREATE DATABASE comshop;
```

### 2.2 Create the tables

Open `database/schema.sql` in SSMS, make sure the **database dropdown at the top
of the query window says `comshop`**, then press **F5**.

The script is **non-destructive** — it never drops a table, so it is safe to
re-run. It creates anything missing, adds any missing column, and refreshes the
revenue view.

### 2.3 Load the demo data

Same process with `database/seed.sql`. It creates the two accounts, a demo PC
list, and one active rental.

> **Re-running `seed.sql` resets both passwords to the demo ones.** Once a real
> password is set, use `php server/tools/update.php` instead of `--seed`.

### 2.4 Create your `.env`

```powershell
copy .env.example .env
```

Then edit `.env` at the project root:

```ini
DB_SERVER=YOUR-MACHINE-NAME
DB_DATABASE=comshop
DB_USERNAME=
DB_PASSWORD=
```

Leave the username and password **blank** for Windows Authentication — PHP
connects as the logged-in Windows account and no password exists anywhere in the
project.

`.env` is gitignored. `.env.example` is committed.

### 2.5 Install frontend dependencies

```powershell
cd client
npm install
cd ..
```

---

## 3. Running it

You need **two terminals**.

### Terminal 1 — the API

```powershell
cd C:\Users\Administrator\Desktop\comshop\server
php -S localhost:8000 router.php
```

### Terminal 2 — the frontend

```powershell
cd C:\Users\Administrator\Desktop\comshop\client
npm run dev
```

### Open

```
http://localhost:5173
```

Sign in with the demo credentials:

| Username | Password | Role |
| --- | --- | --- |
| `admin` | `admin123` | Admin / Owner |
| `cashier` | `cashier123` | Cashier |

---

## 4. Verifying it works

| Check | Expected |
| --- | --- |
| `http://localhost:5173` | the login screen |
| `http://localhost:8000/api/auth/me` | `{"ok":false,"error":"Not signed in."}` |
| `http://localhost:5173/api/auth/me` | same — proves the Vite proxy forwards to PHP |

```powershell
# Both servers running?
curl.exe -s -o NUL -w "vite  %{http_code}`n" http://localhost:5173/
curl.exe -s -o NUL -w "php   %{http_code}`n" http://localhost:8000/api/auth/me
```

`000` means that server is not running.

---

## 5. Making a database change — the safe way

**Always in this order.**

```powershell
cd C:\Users\Administrator\Desktop\comshop

php server/tools/backup.php        # 1. back up FIRST
php server/tools/update.php --seed # 2. apply + verify
```

Step 2 prints:

```text
4. VERIFY
---------
Shape        complete      <- nothing missing
Data         intact        <- no rows lost
Money        unchanged     <- no amount altered
```

`update.php` takes a backup itself before it changes anything, and refuses to
continue if that backup fails.

### If something goes wrong

```powershell
php server/tools/restore.php                                          # list backups
php server/tools/restore.php comshop-2026-10-16_200412.bak --yes      # roll back to one
```

> A restore **replaces** the database with the backup's contents. It is not a
> merge and has no undo. `--yes` is required so it never happens by accident.

### Adding a new column or table

Do not edit `schema.sql` — an existing database skips the guarded `CREATE`, so
your edit would do nothing. Write a migration instead:

```powershell
notepad database\migrations\001_add_something.sql
```

```sql
-- ADD only. Never DROP. Guarded so running twice is harmless.
IF COL_LENGTH('dbo.pcs', 'location') IS NULL
BEGIN
    ALTER TABLE dbo.pcs ADD location NVARCHAR(50) NULL;
    PRINT 'Added pcs.location';
END
```

```powershell
php server/tools/update.php --file=database/migrations/001_add_something.sql
```

Full rules, including the safe order for a `NOT NULL` column, are in
[`database/README.md`](database/README.md).

---

## 6. Layout

```text
comshop/
├── README.md              this file
├── rules.md               project rules
├── .env                   credentials — gitignored, never commit
├── .env.example           template — committed
├── .gitignore
│
├── client/                React frontend
│   ├── index.html         entry HTML + the boot skeleton (pre-paint)
│   ├── src/
│   │   ├── api.js         the ONLY place the frontend calls the API
│   │   ├── normalize.js   API snake_case -> screen camelCase, one place
│   │   ├── context/       Auth, PC, Rental, Transaction providers
│   │   ├── data/          domain rules (display timing, pricing, refunds, revenue)
│   │   ├── components/    shared UI
│   │   └── pages/         route views
│   └── vite.config.js     dev server + /api proxy to :8000
│
├── server/                PHP backend
│   ├── router.php         dev-server routing
│   ├── api/index.php      front controller: method + path + auth gate
│   ├── api/               one file per endpoint
│   ├── config/            database.php, env.php, app.php, cors.php, helpers.php
│   ├── middleware/        session.php, admin.php
│   └── tools/             CLI only, never served over HTTP
│       ├── backup.php     take a backup
│       ├── restore.php    list / restore backups
│       ├── update.php     backup -> apply -> verify -> report
│       ├── db-admin.php   shared maintenance helpers
│       ├── apply-migration.php  quick .sql apply, no backup or verify
│       └── apply-seed.php       quick seed, no backup or verify
│
├── database/              NOT committed — gitignored
│   ├── schema.sql         tables, guarded and non-destructive
│   ├── seed.sql           demo data, idempotent
│   ├── migrations/        one file per schema change
│   └── README.md          how to write a migration safely
│
├── backups/               NOT committed — full database dumps
└── projectplan/           NOT committed — business documentation
```

---

## 7. Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| `could not find driver` | `pdo_sqlsrv` not loaded | `php -m \| findstr sqlsrv`; check `extension=pdo_sqlsrv` in `php.ini` |
| `SQLSTATE[IM002] Invalid keyword 'Trusted_Connection'` | wrong DSN keyword | already fixed — Windows Auth needs no DSN keyword |
| `Error Locating Server/Instance` | wrong `DB_SERVER` | check the name in SSMS; a default instance has **no** `\SQLEXPRESS` |
| `Access denied for user` | SQL Auth mismatch | check `DB_USERNAME` / `DB_PASSWORD` in `.env` |
| Vite 404 on `/api/...` | proxy not running | start `php -S localhost:8000 router.php` |
| Browser 404 at `/api/auth/me` | used the `.php` path | clean paths need `router.php` |
| `Invalid column name` from a `.sql` file | non-ASCII in a string literal | keep `.sql` **ASCII-only** — an em dash or `₱` breaks through the driver |
| Restore fails, "database in use" | `php -S` still connected | stop the API, restore, start it again |

---

## 8. Current status

```text
Phase 0   Environment & setup                      done
Phase 1   Authentication / user roles (UI)         done, owner-verified
Phase 2   PC management (UI)                       done, owner-verified
Phase 3   Rental management (UI)                   done, owner-verified
Phase 4   Manual cash payment (UI)                 done, owner-verified
Phase 5   PC transfer (UI)                         done, owner-verified
Phase 6   Refund & rental adjustment (UI)          done, owner-verified
Phase 7   Revenue & transaction history (UI)       done, owner-verified
Phase 8   Admin monitoring & analytics (UI)        done, owner-verified
Phase 9   Database (MSSQL)                         done
Phase 10  Backend & API (PHP)                      done
Phase 11  Frontend-backend integration             done
Phase 12  Final integration & verification        not started
```

**Done in Phase 11:** the four context providers call the API, the Vite proxy
forwards `/api` to PHP, credentials moved to `.env`, the mock account, PC and
rental data was deleted, the demo-accounts notice was removed from the login
screen, and every screen has a loading state and an error state. Loading is a
per-screen skeleton shaped like that screen, so a refresh fills in instead of
re-framing; `client/index.html` paints a matching shell before the bundle
loads.

**The revenue figures now come from the server.** `/api/revenue` returns the
period's figures *and* the bills and refunds inside that period, each bill
already netted of its refunds; the Analytics screen reads the seven
`/api/analytics/*` endpoints. The calculators that used to live in
`client/src/data/revenue.js` were deleted — the same rule in two places is
how they eventually disagree.

**Still open in Phase 12:** verification of every feature, rule and workflow,
and two decisions that are still **Not decided** — the testing toolchain
(12.9) and deployment / hosting (12.10).

---

## 9. Git

Version control was set up on request and the repository is **local only — it has
never been pushed**.

```powershell
git status                    # review BEFORE committing
git add .
git commit -m "message"
git push -u origin main       # you run this, not the assistant
```

`.gitignore` excludes `.env`, `backups/`, `database/`, `projectplan/`,
`.agents/` and `.opencode/`. See the comments in that file for why.