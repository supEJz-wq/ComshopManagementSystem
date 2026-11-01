# Automation Test Checklist

Use this file to find every implemented or planned test in the current Admin scope.
The design details remain in the [automation plan](automation%20plan.md).

**Status key:** `[x]` = passed in the last recorded verification; `[ ]` = failed
or planned. Failed cases are labelled **FAILED**; planned cases are labelled
**PLANNED**. A parent is checked only when every listed variant passes.
Parameterized test variants are listed under their checklist group.

This document records existing results. Creating it did not rerun the tests.

## Find a test

- [Happy paths, error paths, and edge cases](#scenario-types)
- [Admin setup and navigation](#admin-setup-and-navigation)
- [Admin Home — homeAdmin](#admin-home)
- [Admin PCs — pcsAdmin](#admin-pcs)
- [Admin Rentals — rentalsAdmin](#admin-rentals)
- [Known PCs issues](#known-pcs-issues)
- [Run the tests](#run-the-tests)
- [Files and reports](#files-and-reports)

## Scenario types

- **Happy path:** A user completes a valid, expected action successfully.
  Examples: register a new PC, start a rental, extend time, and stop with one bill.
- **Error path:** Invalid input, a rejected request, or unavailable data is handled
  correctly. Examples: duplicate PC name, invalid duration, and failed API reads.
- **Edge case:** A boundary or less common state behaves correctly. Examples:
  zero/one records, the 1-minute minimum, exactly 24 hours, similar PC names,
  faulty PCs with active rentals, no transfer targets, and refresh without duplicates.

A test can have more than one type. The **type** explains the scenario; the
**checkbox** records its result. An error-path test is checked when the error is
handled correctly. A failed happy-path test remains a happy-path test.

Use Find (`Ctrl+F`) with **Happy path**, **Error path**, or **Edge case** to locate
that scenario type. These labels classify existing/planned cases; they do not
add test executions or change the recorded results.

The six existing spec files now use the same labels in test titles and `TYPE`
comments. Their report tags are `@happy-path`, `@error-path`, and `@edge-case`.
An individual test can carry two tags when it checks both a successful action
and a boundary or unusual state.

## Latest recorded results

- **homeAdmin:** 15 implemented tests passed. Its three real workflow checks
  also passed after the shared PCs testing updates.
- **pcsAdmin:** 81 tests executed: **71 passed, 10 failed**, with no skips.
  The failures map to four application issues.
- **rentalsAdmin:** full standalone suite is **PLANNED**. Name/count/refresh
  coverage already exists inside Home and PCs workflows.

## Admin setup and navigation

**User:** Admin / Owner. **Group:** `adminNavigation`.

- [x] **Happy path** — **ADMIN-01:** Real Admin sign-in opens authenticated Home and shows Admin / Owner.
- [ ] **Happy path** — **ADMIN-02 — PLANNED:** Dedicated sidebar navigation checks for Home, PCs,
  and Rentals, including correct route, heading, and selected navigation state.
- [ ] **Edge case** — **ADMIN-03 — PLANNED:** Consolidated authenticated refresh checks for all
  three routes in the standalone navigation suite. Individual refresh checks
  already exist in the Home and PCs test files.

## Admin Home

**User:** Admin / Owner. **Group:** `homeAdmin`. **Result:** 15 passed.

### Display, counts, and empty states

**File:** [home.spec.js](../tests/admin/home/home.spec.js) — 11 tests.

- [x] **Happy path** — **HOME-01/02:** Show Admin identity, Right now heading, summary, and the
  correct Free/Rented/Issue/Unresponsive counts using distinct values.
- [x] **Happy path** — **HOME-03:** Status counts are whole numbers >= 0 and sum to the computer total.
- [x] **Happy path** / **Edge case** — **HOME-04:** Include an active rental on a faulty PC in the rental total.
- [x] **Edge case** — **HOME-07 / Empty inventory:** All status values and both totals show zero.
- [x] **Edge case** — **HOME-07 / One idle PC:** Show 1 computer, 0 active rentals, and Free = 1.
- [x] **Edge case** — **HOME-07 / One rented PC:** Show 1 computer, 1 active rental, and Rented = 1.
- [x] **Edge case** — **Refresh:** Reload Home and retain the correct prepared counts.
- [x] **Edge case** — **Loading / PCs:** Wait for the PC list before showing counts.
- [x] **Edge case** — **Loading / Rentals:** Wait for active rentals before showing counts.
- [x] **Error path** — **Error / PCs:** Show the required-data error when the PC list fails.
- [x] **Error path** — **Error / Rentals:** Show the required-data error when active rentals fail.

### Real backend comparison

**File:** [home.live.spec.js](../tests/admin/home/home.live.spec.js) — 1 test.

- [x] **Happy path** / **Edge case** — **Live Home:** Sign in as Admin; all four status counts and both totals
  match the actual API responses before and after refresh.

### Real workflows across PCs, Home, and Rentals

**File:** [home.flow.spec.js](../tests/admin/home/home.flow.spec.js) — 3 tests.

- [x] **Happy path** / **Edge case** — **HOME-04:** Home rental total matches the displayed Rentals list, including
  a faulty PC with an active rental.
- [x] **Happy path** / **Edge case** — **HOME-05:** Mark an exact PC Issue and resolve it; Home counts update
  and restore, totals remain unchanged, and a similarly named PC is unaffected.
- [x] **Happy path** — **HOME-06:** Start/stop a rental; Home and Rentals update, counts restore,
  and stopping creates exactly one unsettled bill and opens Payments.

## Admin PCs

**User:** Admin / Owner. **Group:** `pcsAdmin`.
**Result:** 81 executed, 71 passed, 10 failed. Each test uses fresh isolated records.

### Board, registration, status, and repairs

**File:** [pcs.registration-status.spec.js](../tests/admin/pcs/pcs.registration-status.spec.js).

- [x] **Happy path** — **PCS-01 — Board inventory, names, statuses, and legend** — 1 passed.

- [x] **Happy path** / **Edge case** — **PCS-02 — Open and cancel Add PC** — 1 passed.

- [x] **Happy path** / **Edge case** — **PCS-03 — Register a unique PC and refresh** — 1 passed.

- [ ] **Error path** / **Edge case** — **PCS-04 — Reject invalid PC names with visible feedback** — 0 passed, 2 failed.

  - [ ] **Error path** / **Edge case** — rejects an empty PC name — **FAILED**.
  - [ ] **Error path** / **Edge case** — rejects a whitespace-only PC name — **FAILED**.

- [ ] **Error path** — **PCS-05 — Reject an existing name with visible feedback** — 0 passed, 1 failed.
  **Current result: FAILED.** See the known issues below.

- [ ] **Happy path** / **Edge case** — **PCS-06 — Status changes and repairs** — 4 passed, 2 failed.

  - [x] **Happy path** / **Edge case** — Issue and Resolve updates only the exact named PC.
  - [x] **Happy path** / **Edge case** — Unresponsive and Repair updates only the exact named PC.
  - [x] **Happy path** / **Edge case** — Repair preserves the working state of PCS-FREE-REPAIR.
  - [x] **Happy path** / **Edge case** — Repair preserves the working state of PCS-RENTED-REPAIR.
  - [ ] **Happy path** / **Edge case** — repairing PCS-ISSUE-RENTED restores Rented without ending its rental — **FAILED**.
  - [ ] **Happy path** / **Edge case** — repairing PCS-UNRESPONSIVE-RENTED restores Rented without ending its rental — **FAILED**.

- [x] **Edge case** — **PCS-07 — Correct action buttons for each PC state** — 8 passed.

  - [x] **Edge case** — offers the correct actions on PCS-FREE-01.
  - [x] **Edge case** — offers the correct actions on PCS-RENTED-01.
  - [x] **Edge case** — offers the correct actions on PCS-ISSUE-IDLE.
  - [x] **Edge case** — offers the correct actions on PCS-UNRESPONSIVE-IDLE.
  - [x] **Edge case** — offers the correct actions on PCS-ISSUE-RENTED.
  - [x] **Edge case** — offers the correct actions on PCS-UNRESPONSIVE-RENTED.
  - [x] **Edge case** — offers the correct actions on PCS-FREE-REPAIR.
  - [x] **Edge case** — offers the correct actions on PCS-RENTED-REPAIR.

### Rental start, extension, validation, and stopping

**File:** [pcs.rentals.spec.js](../tests/admin/pcs/pcs.rentals.spec.js).

- [x] **Happy path** — **PCS-08 — Start rentals using all approved presets** — 6 passed.

  - [x] **Happy path** — starts and saves the 30 min preset.
  - [x] **Happy path** — starts and saves the 1 hr preset.
  - [x] **Happy path** — starts and saves the 2 hr preset.
  - [x] **Happy path** — starts and saves the 3 hr preset.
  - [x] **Happy path** — starts and saves the 5 hr preset.
  - [x] **Happy path** — starts and saves the 6 hr preset.

- [x] **Happy path** / **Edge case** — **PCS-09 — Accept valid custom durations and boundaries** — 3 passed.

  - [x] **Happy path** / **Edge case** — accepts the minimum one minute.
  - [x] **Happy path** — accepts mixed hours, minutes, and seconds.
  - [x] **Happy path** / **Edge case** — accepts exactly 24 hours.

- [x] **Error path** / **Edge case** — **PCS-10 — Reject invalid start durations** — 8 passed.

  - [x] **Error path** / **Edge case** — rejects blank duration.
  - [x] **Error path** / **Edge case** — rejects all-zero duration.
  - [x] **Error path** / **Edge case** — rejects 59 seconds.
  - [x] **Error path** / **Edge case** — rejects negative hours.
  - [x] **Error path** / **Edge case** — rejects fractional minutes.
  - [x] **Error path** / **Edge case** — rejects 60 minutes in the minutes field.
  - [x] **Error path** / **Edge case** — rejects 60 seconds in the seconds field.
  - [x] **Error path** / **Edge case** — rejects 24 hours plus one second.

- [x] **Happy path** / **Edge case** — **PCS-11 — Cancel start and extension pickers** — 2 passed.

  - [x] **Happy path** / **Edge case** — cancels the start picker without a mutation.
  - [x] **Happy path** / **Edge case** — cancels the extend picker without a mutation.

- [x] **Happy path** — **PCS-12 — Extend the same rental with presets/custom time** — 7 passed.

  - [x] **Happy path** — extends an active rental by 30 min.
  - [x] **Happy path** — extends an active rental by 1 hr.
  - [x] **Happy path** — extends an active rental by 2 hr.
  - [x] **Happy path** — extends an active rental by 3 hr.
  - [x] **Happy path** — extends an active rental by 5 hr.
  - [x] **Happy path** — extends an active rental by 6 hr.
  - [x] **Happy path** — extends an active rental by custom 2 min 3 sec.

- [ ] **Error path** / **Edge case** — **PCS-13 — Validate extensions and the 24-hour booked-time cap** — 9 passed, 1 failed.

  - [x] **Error path** / **Edge case** — rejects an extension of blank duration.
  - [x] **Error path** / **Edge case** — rejects an extension of all-zero duration.
  - [x] **Error path** / **Edge case** — rejects an extension of 59 seconds.
  - [x] **Error path** / **Edge case** — rejects an extension of negative hours.
  - [x] **Error path** / **Edge case** — rejects an extension of fractional minutes.
  - [x] **Error path** / **Edge case** — rejects an extension of 60 minutes in the minutes field.
  - [x] **Error path** / **Edge case** — rejects an extension of 60 seconds in the seconds field.
  - [x] **Error path** / **Edge case** — rejects an extension of 24 hours plus one second.
  - [x] **Happy path** / **Edge case** — accepts an extension reaching exactly 24 hours booked.
  - [ ] **Error path** / **Edge case** — shows feedback when an extension exceeds 24 hours booked — **FAILED**.

- [x] **Happy path** / **Edge case** — **PCS-14 — Flag a rented PC while preserving its rental** — 2 passed.

  - [x] **Happy path** / **Edge case** — markIssue preserves the rental and recovery actions.
  - [x] **Happy path** / **Edge case** — markUnresponsive preserves the rental and recovery actions.

- [x] **Happy path** / **Edge case** — **PCS-18 — Stop healthy/faulty rentals and create one unsettled bill** — 3 passed.

  - [x] **Happy path** — stopping a Rented PC creates one bill and leaves it Free.
  - [x] **Happy path** / **Edge case** — stopping a Issue PC creates one bill and leaves it Issue.
  - [x] **Happy path** / **Edge case** — stopping a Unresponsive PC creates one bill and leaves it Unresponsive.

### Transfers, notifications, refresh, loading, and errors

**File:** [pcs.transfers-page-states.spec.js](../tests/admin/pcs/pcs.transfers-page-states.spec.js).

- [x] **Happy path** / **Edge case** — **PCS-15 — Offer only eligible transfer destinations** — 2 passed.

  - [x] **Happy path** / **Edge case** — lists only eligible destinations from PCS-ISSUE-RENTED.
  - [x] **Happy path** / **Edge case** — lists only eligible destinations from PCS-UNRESPONSIVE-RENTED.

- [ ] **Happy path** / **Edge case** — **PCS-16 — Transfer without resetting time or charges** — 0 passed, 4 failed.

  - [ ] **Happy path** / **Edge case** — transfers PCS-ISSUE-RENTED to PCS-FREE-01 without resetting time or charges — **FAILED**.
  - [ ] **Happy path** / **Edge case** — transfers PCS-ISSUE-RENTED to PCS-ISSUE-IDLE without resetting time or charges — **FAILED**.
  - [ ] **Happy path** / **Edge case** — transfers PCS-UNRESPONSIVE-RENTED to PCS-FREE-01 without resetting time or charges — **FAILED**.
  - [ ] **Happy path** / **Edge case** — transfers PCS-UNRESPONSIVE-RENTED to PCS-ISSUE-IDLE without resetting time or charges — **FAILED**.

- [x] **Edge case** — **PCS-17 — Cancel transfer and handle no available destination** — 2 passed.

  - [x] **Edge case** — cancelling Transfer leaves the rental on its source PC.
  - [x] **Edge case** — shows the no-target message when all destinations are unavailable.

- [x] **Edge case** — **PCS-19 — Unsettled bill count, total, wording, and navigation** — 3 passed.

  - [x] **Edge case** — handles 0 unsettled bills.
  - [x] **Edge case** — handles 1 unsettled bill.
  - [x] **Edge case** — handles 2 unsettled bills.

- [x] **Happy path** / **Edge case** — **PCS-20 — Saved actions survive refresh without duplicate records** — 1 passed.

- [x] **Edge case** — **Loading waits for every required data source** — 4 passed.

  - [x] **Edge case** — waits for PC inventory.
  - [x] **Edge case** — waits for active rentals.
  - [x] **Edge case** — waits for payments.
  - [x] **Edge case** — waits for refunds required by payments.

- [x] **Error path** — **Failed reads show useful errors instead of an empty board** — 4 passed.

  - [x] **Error path** — reports failed PC inventory.
  - [x] **Error path** — reports failed active rentals.
  - [x] **Error path** — reports failed payments.
  - [x] **Error path** — reports failed refunds required by payments.

## Admin Rentals

**User:** Admin / Owner. **Group:** `rentalsAdmin`.
**Status:** Standalone tests are **PLANNED**; no Rentals test folder is created yet.
The page object currently supports named rows and rental counts for existing workflows.

- [ ] **Edge case** — **RENT-01:** Open Rentals with no active rentals in the test dataset.
  **Expected:** Active rentals heading and No active rentals. message appear; no rental rows appear.

- [ ] **Happy path** — **RENT-02:** Open Rentals with known active rentals.
  **Expected:** Each active rental has one row with its correct PC name; stopped rentals are absent.

- [ ] **Happy path** — **RENT-03:** Read a known row.
  **Expected:** Remaining countdown, Used elapsed time, and block duration are present and independently identifiable.

- [ ] **Happy path** / **Edge case** — **RENT-04:** Observe a running rental across controlled clock ticks.
  **Expected:** Remaining time decreases while Used time increases. Allow a small elapsed-time tolerance for live checks.

- [ ] **Happy path** — **RENT-05:** Provide rentals with distinct remaining times away from wrap boundaries.
  **Expected:** Rows are ordered by soonest remaining time, not PC name, booking length, or creation order.

- [ ] **Happy path** — **RENT-06:** Start, extend, transfer, and stop via the PCs POM, returning to Rentals after each relevant action.
  **Expected:** The row is added, time increases, destination name changes, and the row disappears respectively.

- [ ] **Edge case** — **RENT-07:** Refresh the Rentals page.
  **Expected:** Active rentals persist; elapsed time continues rather than restarting.

- [ ] **Edge case** — **RENT-08:** Use controlled timestamps around the 10-, 5-, and 1-minute warning thresholds.
  **Expected:** Correct warning label appears for each threshold and no warning appears above 10 minutes.

- [ ] **Edge case** — **RENT-09:** Advance a controlled display clock across a block boundary.
  **Expected:** Countdown rolls into another display block without showing 0:00; Used time continues and the rental remains active.

- [ ] **Edge case** — **Loading — PLANNED:** Delay required reads, then show the actual Rentals page.
- [ ] **Error path** — **Errors — PLANNED:** Failed reads show a useful error instead of an empty rental list.

The unchecked RENT items above are planned work, not recorded test failures.
Use controlled clock/data cases for warning and block-boundary checks.

## Known PCs issues

- [ ] **Registration feedback:** Empty, whitespace-only, and duplicate names
  have no visible form error. Affects PCS-04/05: **3 failures**.
- [ ] **Repair with an active rental:** Faulty PCs become Free while their rental
  continues; expected working status is Rented. Affects PCS-06: **2 failures**.
- [ ] **Extension rejection feedback:** The server rejects total booked time
  over 24 hours, but the picker closes without its error. Affects PCS-13: **1 failure**.
- [ ] **Transfer status:** Destination keeps its old Free/Issue label until
  refresh despite a successful move. Affects PCS-16: **4 failures**.

See [PCs test results](pcs%20test%20results.md) for evidence and the identified causes.

## Run the tests

Use PowerShell from this automation folder:

```powershell
cd C:\Users\Administrator\Desktop\comshop\qaTesting\automation
$env:UI_BROWSER_CHANNEL = 'chrome'
```

- **Home controlled UI:** `npm run test:home` — start the frontend first.
- **Home read-only backend:** `npm run test:home:live` — start frontend/PHP/SQL Server
  and set the test Admin credentials below.
- **Home real workflows:** `npm run test:home:flow` — starts temporary servers/database.
- **Full Admin PCs suite:** `npm run test:pcs` — starts temporary servers/database
  and resets its own dataset before every test. Known failures currently make it exit unsuccessfully.

### Run one scenario type

Append `-- --grep` with a tag to the existing command. For example:

```powershell
npm run test:home -- --grep '@happy-path'
npm run test:home -- --grep '@error-path'
npm run test:home -- --grep '@edge-case'
npm run test:pcs -- --grep '@happy-path'
npm run test:pcs -- --grep '@error-path'
npm run test:pcs -- --grep '@edge-case'
```

The same filter works with `test:home:live` and `test:home:flow`; their usual setup
requirements still apply. Multi-tag tests appear in both matching filters, so
filtered totals overlap. The six files contain 96 unique cases in total.

### Live Home credentials

For the read-only live Home check:

```powershell
$env:ADMIN_USERNAME = Read-Host 'Test Admin username'
$env:ADMIN_PASSWORD = Read-Host 'Test Admin password' -MaskInput
npm run test:home:live
```

Isolated workflow/PCs runs require client/automation dependencies, PHP with
`pdo_sqlsrv`, SQL Server create/drop permission, the existing local connection
settings, and `database/schema.sql`. Set `PHP_BIN` if PHP is not on PATH.
They generate their own Admin account, use one worker, and remove their test
database and temporary servers when the run finishes. The working database is
not reset. Ordinary Home UI tests use prepared API responses.

## Files and reports

- [Home tests](../tests/admin/home/) and [PCs tests](../tests/admin/pcs/).
- [Home POM](../pages/admin/homePageAdmin.js), [PCs POM](../pages/admin/pcsPageAdmin.js),
  [Rentals POM](../pages/admin/rentalsPageAdmin.js), and [Admin sidebar](../pages/admin/sideBarAdmin.js).
- [Automation plan](automation%20plan.md) — design, responsibilities, and expected behavior.
- [PCs results](pcs%20test%20results.md) — detailed findings and checklist totals.
- [Recorded PCs JSON results](../../artifacts/pcs-results.json) — full 81-test evidence.

Cashier, complete login validation, Payments, Refunds, Revenue, Analytics, and
Accounts suites remain outside the current first scope; detailed cases are not yet planned.

Update this checklist when cases are added, rerun, fixed, or moved.
