# server — Phase 10 Backend

Plain PHP REST API for CyberShopOS. Talks to Microsoft SQL Server, authenticates
with PHP sessions.

## Stack

| Layer | Choice |
| --- | --- |
| Language | PHP 8.4, plain PHP — no framework, no Composer |
| Database | Microsoft SQL Server, database `comshop` |
| Driver | `pdo_sqlsrv` (already bundled with the WinGet PHP build) |
| Auth | PHP `$_SESSION` cookie |
| API style | REST, JSON in and out |

## Setup

### 1. Schema

Run `../database/schema.sql` in SSMS against the `comshop` database. It is safe
to re-run — it drops and recreates the tables.

### 2. Seed data

Run `../database/seed.sql` in the same database. It creates the two accounts,
the demo PC list, and one active rental on PC-02.

> **Re-running `seed.sql` resets both demo passwords.** Once the owner sets a
> real password, do not run it again.

Demo credentials:

| Username | Password | Role |
| --- | --- | --- |
| `admin` | `admin123` | Admin |
| `cashier` | `cashier123` | Cashier |

### 3. Connection

Credentials are **not** in the code. Copy the template and fill it in:

```powershell
copy .env.example .env
```

Then edit `.env` at the project root:

```ini
DB_SERVER=YOUR-MACHINE-NAME-OR-localhost
DB_DATABASE=comshop
DB_USERNAME=
DB_PASSWORD=
```

Leave `DB_USERNAME` and `DB_PASSWORD` blank for Windows Authentication — PHP
connects as the logged-in Windows account and no password exists anywhere in the
project. Set both only if you use SQL Server Authentication.

`.env` is gitignored. `.env.example` is committed so this stays discoverable.

### 4. Run

```powershell
cd server
php -S localhost:8000 router.php
```

`router.php` is what makes the clean `/api/...` paths work on the built-in
server. Without it you would have to request `/api/auth/me.php`.

## Verifying it works

```powershell
curl.exe -i http://localhost:8000/api/auth/me
```

Expected: HTTP 401 with `{"ok":false,"error":"Not signed in."}`

Then log in and keep the cookie:

```powershell
curl.exe -c cookies.txt -X POST http://localhost:8000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"username\":\"cashier\",\"password\":\"cashier123\"}'

curl.exe -b cookies.txt http://localhost:8000/api/pcs
```

## Endpoints

All paths are relative to `http://localhost:8000`.

### Auth

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | public | `{username, password}` → sets the session cookie |
| POST | `/api/auth/logout` | session | Destroys the session |
| GET | `/api/auth/me` | session | Current user |
| POST | `/api/auth/reset-password` | Admin | `{newPassword}` — resets the Cashier, signs the Admin out |
| POST | `/api/auth/deactivate` | Admin | `{active}` — deactivate / reactivate the Cashier |

### PCs

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/api/pcs` | session | All PCs |
| POST | `/api/pcs` | Admin | `{name}` — unique name, starts `free` |
| PATCH | `/api/pcs/:id/status` | session | `{status}` — transitions validated |
| POST | `/api/pcs/repair` | session | `{id}` — clears `needsRepair` |

### Rentals

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/api/rentals/active` | session | Active rentals with segments and transfers |
| POST | `/api/rentals/start` | session | `{pcId, seconds}` |
| POST | `/api/rentals/stop` | session | `{pcId}` → returns the bill |
| POST | `/api/rentals/extend` | session | `{pcId, seconds}` |
| POST | `/api/rentals/transfer` | session | `{fromPcId, toPcId}` |
| GET | `/api/rentals/targets?fromPcId=` | session | Eligible destinations |

### Payments

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/api/payments` | session | All bills |
| GET | `/api/payments/unsettled` | session | Oldest first |
| GET | `/api/payments/settled` | session | Newest first |
| POST | `/api/payments/settle` | session | `{id, cashReceived}` |
| POST | `/api/payments/refund` | session | `{paymentId, kind, amount, reason}` |

### Revenue

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/api/revenue?period=` | session | `today` · `month` · `year` · `all` · a year number. Returns the figures **and** the bills and refunds inside that period, each bill already netted of its refunds |
| GET | `/api/revenue/net-for-bill?paymentId=` | session | `{refunded, net}` |

### Analytics

All Admin-only.

| Method | Path |
| --- | --- |
| GET | `/api/analytics/collected-by-day?period=` |
| GET | `/api/analytics/collected-by-month` |
| GET | `/api/analytics/collected-by-year` |
| GET | `/api/analytics/collected-by-hour?period=` |
| GET | `/api/analytics/best-hour?period=` |
| GET | `/api/analytics/best-month` |
| GET | `/api/analytics/collected-by-cashier?period=` |

## Rules that live on the server

The server is the enforcement point, not the UI:

- Only two roles: `Admin` and `Cashier`.
- An underpayment cannot be recorded — a bill settles in full or not at all.
- A refund requires a **settled** bill, a non-empty reason, and is capped at the
  amount paid. `₱0` is allowed and records a non-monetary adjustment.
- Refunds append to `dbo.refunds`. `dbo.payments` amounts are never rewritten
  after settlement (Business Rule 10).
- A transfer changes only the PC. `started_at`, `block_seconds`,
  `block_started_at` and the segments are untouched, which is *why* it cannot
  create a charge (Rule 6).
- Revenue is **cash basis** — a bill counts on `settled_at`, not when the rental
  ended.
- `collected` and `stillOwed` are returned separately and are never summed
  (Decision 64).

## Layout

```text
server/
├── router.php            development-server routing for clean /api paths
├── config/
│   ├── database.php      PDO connection
│   ├── env.php           reads .env — no secrets in the source
│   ├── cors.php          allows the Vite dev origin
│   ├── app.php           app-wide constants
│   └── helpers.php       pricing constants + wholeNumber()
├── middleware/
│   ├── session.php       requireAuth() / requireAdmin() / destroySession()
│   └── admin.php         thin alias for requireAdmin()
├── tools/                CLI only — never served over HTTP
│   ├── backup.php        take a full .bak
│   ├── restore.php       list / restore backups
│   ├── update.php        backup -> apply -> verify -> report
│   ├── db-admin.php      shared maintenance helpers
│   ├── apply-migration.php  quick .sql apply — no backup, no verify
│   └── apply-seed.php       quick seed — no backup, no verify
└── api/
    ├── index.php         front controller: method + path + auth gate
    ├── auth/  pcs/  rentals/  payments/  revenue/  analytics/
```

`middleware/admin.php` is a thin alias kept for readability; the real gate is
`requireAdmin()` in `middleware/session.php`.

`tools/apply-migration.php` and `tools/apply-seed.php` skip the backup and the
verification that `tools/update.php` performs. They exist for quick local
iteration only — the safe path is `php server/tools/update.php`.

## Known limitations

- `middleware/admin.php` duplicates nothing but its own name — prefer
  `requireAdmin()` directly.
- `payments/settle.php` rejects a JSON float for `cashReceived` (for example
  `20.0`) because the guard requires a real integer. The frontend sends an
  integer, so this is not hit in practice.
- Period boundaries are computed in PHP's timezone while the database stores
  `DATETIME2`. They agree on this machine because both are local, but a machine
  or server in a different timezone would need them reconciled.
