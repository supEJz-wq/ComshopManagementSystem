# Automation Plan

For the central test checklist and links to each suite, open [test.md](test.md).

**Status: homeAdmin is complete. The pcsAdmin suite is implemented and has
71 passing / 10 failing checks across four application issues. The full Rentals
test suite is still pending.**

Checklist key: `[x]` = implemented and passed; `[ ]` = pending or currently failing. A parent stays
unchecked until every part is complete. Checked items describe the latest recorded verification.

Go to the test checklists: [Admin](#5-admin-setup-and-navigation-tests),
[Home](#6-home-test-coverage), [PCs](#7-pcs-test-coverage),
[Rentals](#8-rentals-test-coverage), or [Loading and errors](#9-shared-loading-and-failure-checks).

### Test groups and user roles

Every checklist in this plan is for the **Admin / Owner** user. Use these group
labels to identify the page and user together:

| Test group | User role | Page / area | Page object |
| --- | --- | --- | --- |
| `adminNavigation` | Admin / Owner | Sign-in setup and sidebar navigation | `pages/admin/sideBarAdmin.js` |
| `homeAdmin` | Admin / Owner | Home | `pages/admin/homePageAdmin.js` |
| `pcsAdmin` | Admin / Owner | PCs | `pages/admin/pcsPageAdmin.js` |
| `rentalsAdmin` | Admin / Owner | Rentals | `pages/admin/rentalsPageAdmin.js` (Home comparison support implemented) |

## 1. Goal and first scope

Build readable Playwright tests using the Page Object Model (POM), starting with
the **Admin** role in this order: **Home -> PCs -> Rentals**.

This document proposes the file structure, page-object responsibilities, guide
comments, test cases, and implementation order. The user will write the page
functions; the method names below are a proposed guide for that work. The later
instruction to start Home authorized its page-object functions and focused tests.

### Test folder organization

Current Admin tests are grouped by page in `tests/admin/home/` and `tests/admin/pcs/`:

```text
tests/
└── admin/
    ├── home/
    │   ├── home.spec.js
    │   ├── home.live.spec.js
    │   └── home.flow.spec.js
    └── pcs/
        ├── pcs.registration-status.spec.js
        ├── pcs.rentals.spec.js
        ├── pcs.transfers-page-states.spec.js
        └── pcs.data.js
```

Future page folders can be added under `tests/admin/` when their test suites
are started. Home and PCs folders exist; future page folders have not been created.

### Home batch results

- Home tests are grouped by display/counts, empty/singular states, refresh,
  loading/errors, and live backend checks. Each test has WHAT, TEST DATA, and
  EXPECTED comments; scenario names explain each generated case in the report.
- Fixed the Home class/export mismatch and the Issue/Unresponsive readers.
- Added computer/active-rental total readers, singular/plural summary matching,
  readiness/loading/error locators, and specific guide comments.
- Added `fixtures/home.fixture.js` for controlled Home UI responses. It mocks
  the Admin session and is separate from real authentication verification.
- Added `tests/admin/home/home.spec.js`: **11 tests passed** in Chromium using
  installed Chrome. Covers HOME-01/02, HOME-03, the flagged-rental count portion
  of HOME-04, HOME-07, refresh, loading of either required list, and failure of
  either required list.
- Added `tests/admin/home/home.live.spec.js`: **1 test passed** against the running
  PHP backend. Real Admin sign-in and every Home count were verified before and
  after refresh. The check performs no PC, rental, or bill changes.
- Updated the existing Playwright configuration to CommonJS to match the
  automation package, set the local app address, and allow installed Chrome.
- Completed `tests/admin/home/home.flow.spec.js`: **3 real workflow tests passed**
  for HOME-04/05/06. All three also passed twice in a repeatability run.
- Home now has **15 unique passing tests**: 11 controlled UI checks, 1 read-only
  backend check, and 3 workflows against a disposable SQL Server database.
- Added only the PCs status/start/stop actions and Rentals list readers needed
  by Home. PCs results are recorded below; broader Rentals coverage remains pending.
- The workflow exposed stale PC status after start/stop. `RentalProvider.jsx`
  now refreshes the shared PC list as well as rentals so Home updates immediately.
- App build passed. Lint finished with existing warnings and no errors.

### Run the real Home/PCs/Rentals workflows

The workflow runner creates a new database named `comshop_automation_<random>`,
applies the existing schema, seeds four test PCs and a generated Admin account,
and starts a copied PHP API plus a separate Vite server on available local ports.
It stops those servers and removes its database and temporary files after the run,
including a failed test run. The working database and root `.env` are not reset.

From `qaTesting/automation`, use PowerShell:

```powershell
$env:UI_BROWSER_CHANNEL = 'chrome'
npm run test:home:flow
```

Requires Node, client/automation dependencies, PHP with `pdo_sqlsrv`, local SQL
Server access that can create/drop a test database, and `database/schema.sql`.
If PHP is not on PATH, set `PHP_BIN` to the full path of your installed `php.exe`.
The runner reads the existing local database connection settings and generates
its own test login; `ADMIN_USERNAME` and `ADMIN_PASSWORD` are not needed for it.

Each workflow test has WHAT / TEST DATA / EXPECTED comments and uses the POMs.
For the same repeatability check used during verification:

```powershell
npm run test:home:flow -- --repeat-each=2
```

### Run the Home tests

Start the frontend as described in `client/README.md`, then use PowerShell:

```powershell
cd C:\Users\Administrator\Desktop\comshop\qaTesting\automation
$env:UI_BROWSER_CHANNEL = 'chrome'
npm run test:home
```

`test:home` uses controlled API responses and needs the frontend, but not PHP or
SQL Server. It runs Chromium with one worker. Omit `UI_BROWSER_CHANNEL` when
using an already-installed Playwright Chromium browser instead of desktop Chrome.

For the real read-only backend check, start both frontend and PHP, ensure the
database is available, and configure the test Admin credentials in the same terminal:

```powershell
$env:ADMIN_USERNAME = Read-Host 'Test Admin username'
$env:ADMIN_PASSWORD = Read-Host 'Test Admin password' -MaskInput
npm run test:home:live
```

The live test reports a configuration failure if credentials are missing. Its
password is not stored in a source file. Set `UI_BASE_URL` if the frontend uses
an address other than `http://localhost:5173`.

| Area | Included in this plan |
| --- | --- |
| Admin setup | Sign in as Admin, confirm the role, and navigate to the three pages. |
| Home | Status counts, computer total, active rental total, and updates after PC/rental actions. |
| PCs | Registration, status changes, repairs, rental start/extend/stop, and transfers. |
| Rentals | Active rental list, empty state, countdown, used time, ordering, and updates. |
| Payments boundary | After stopping a rental, check the redirect and that an unsettled bill was created. |

Cashier coverage, full login validation, payment settlement, refunds, revenue,
analytics, and account management are outside this first scope.

**Current screen behavior:** Rentals displays active rentals. Start, extend,
stop, and transfer controls are on the PCs page. Rental actions therefore belong
in `pcsPageAdmin.js`; rental-list readers belong in `rentalsPageAdmin.js`.

## 2. Proposed files and responsibilities

Paths below are relative to `qaTesting/automation/`. Files marked proposed do not
exist yet.

| File | Status | Responsibility |
| --- | --- | --- |
| `pages/admin/sideBarAdmin.js` | Existing | Shared Admin navigation and sign out. Reuse it across pages. |
| `pages/admin/homePageAdmin.js` | Implemented | Home locators, specific guide comments, and numeric count/total readers. |
| `pages/admin/pcsPageAdmin.js` | Implemented for PCs tests | Exact-name tiles, registration, status/repair, custom/preset rental actions, transfers, and page-state readers. |
| `pages/admin/rentalsPageAdmin.js` | Home support implemented | Rental row locators and name/count readers. Timer and used-time readers remain planned. |
| `fixtures/admin.fixture.js` | Implemented | Authenticate the generated test Admin and provide Home/PCs/Rentals/sidebar POMs inside the isolated workflow environment. |
| `fixtures/home.fixture.js` | Implemented | Controlled Admin session and startup API data for Home rendering tests. |
| `tests/admin/adminNavigation.spec.js` | Proposed | Verify Admin identity and Home/PCs/Rentals navigation. |
| `tests/admin/home/home.spec.js` | Implemented | Controlled Home coverage listed in the Home batch results above. |
| `tests/admin/home/home.live.spec.js` | Implemented | Real Admin session and read-only backend count comparison across refresh. |
| `tests/admin/home/home.flow.spec.js` | Implemented | HOME-04/05/06 with real PC actions and comparisons across Home/Rentals. |
| `utils/run-home-flow.cjs` | Implemented | Run Home workflows or `--suite=pcs` with a disposable database and test-only servers, then clean up. |
| `utils/homeTestDatabase.php` | Implemented | Create/seed the runner-owned database, reset PCs test records between cases, and remove only that database afterward. |
| `tests/admin/pcs/pcs.registration-status.spec.js` | Implemented | Board, registration, status, repairs, and allowed button sets. |
| `tests/admin/pcs/pcs.rentals.spec.js` | Implemented | Rental start/extend/cancel/validation/fault/stop checks. |
| `tests/admin/pcs/pcs.transfers-page-states.spec.js` | Implemented | Transfers, bill notifications, persistence, loading, and read failures. |
| `tests/admin/pcs/pcs.data.js` | Implemented | Named PCs, duration cases, and display-clock comparison helper. |
| `fixtures/pcs.fixture.js` | Implemented | Reset the disposable PCs dataset before each test, authenticate, and expose API reads/setup helpers. |
| `tests/admin/rentals.spec.js` | Proposed | Rentals cases identified as RENT below. |
| `tests/admin/rentalFlow.spec.js` | Proposed | One cross-page start/extend/transfer/stop scenario. |
| `utils/testData.js` | Proposed | Small shared data helpers, such as unique test PC names. |
| `playwright.config.js` | Existing | Local app address, browser selection, and execution settings. |

Keep the existing simple JavaScript/CommonJS style for page objects. Check the
configuration/spec module format before adding files so the suite loads
consistently. A base page class or additional component classes are not needed
for this first scope.

## 3. POM style guide

1. **Constructor:** store `page` and declare the locators needed by the tests.
   Group them under specific comments: page heading, Add PC form, PC tiles,
   rental duration controls, transfer picker.
2. **Locators:** prefer visible roles, names, and labels. Use exact names where
   partial matches could select another control. Explain any necessary CSS or
   parent-element selector in a comment next to it.
3. **Repeated controls:** select the PC tile or rental row by its exact PC name
   first, then locate the button, field, status, or timer inside that container.
   Avoid `.first()` or `.nth()` to choose a PC; ordering is not its identity.
4. **Methods:** use a clear verb and one purpose. Accept PC names and duration
   values as inputs instead of hardcoding `PC-01` or an inventory count.
5. **Readers:** return numbers for counts, strings for displayed text, and arrays
   for lists. A reader must read its own corresponding tile or row.
6. **Actions:** perform the interaction and wait for its relevant response or
   visible completion. A click alone does not prove a server update succeeded.
7. **Assertions:** keep test expectations in the spec files. Page objects expose
   locators/readers and actions; specs explain the expected result.
8. **Waiting:** wait for screen readiness, relevant responses, or expected UI
   changes. Avoid fixed sleeps and exact countdown comparisons on a live clock.
9. **Errors:** let failures reach the test. Do not turn failed actions into a
   success value or silently choose a different PC.
10. **Reuse:** the fixture handles Admin sign-in, the sidebar handles navigation,
    and each page object owns its page's selectors. Specs should not repeat
    selectors already owned by a page object.

### Proposed method guide

Home and PCs methods below are implemented. Rentals row/name/count readers are
implemented; its remaining time readers are still proposed.

| Page object | Methods | Contract |
| --- | --- | --- |
| Sidebar | Existing navigation methods | Open the requested page; the spec verifies its heading and route. |
| Home | `readFree()`, `readRented()`, `readIssue()`, `readUnresponsive()` | Return the number in the matching status tile. |
| Home | `readComputerTotal()`, `readActiveRentalTotal()` | Parse and return each total independently, including singular labels. |
| PCs | `pcTile(pcName)`, `readStatus(pcName)` | Locate exactly one named tile; return its status text. |
| PCs | `openAddPc()`, `fillPcName(name)`, `registerPc(name)`, `cancelPcRegistration()` | Registration steps; invalid cases use the POM's submit/error locators. |
| PCs | `markIssue(pcName)`, `markUnresponsive(pcName)`, `resolveIssue(pcName)`, `repairPc(pcName)` | Act only on the named tile and wait for completion. |
| PCs | `startRentalPreset(pcName, label)`, `startRentalCustom(pcName, duration)` | Open the start picker, fill/select the duration, and submit. |
| PCs | `extendRentalPreset(pcName, label)`, `extendRentalCustom(pcName, duration)` | Open the extension picker and add time to the named rental. |
| PCs | `cancelRentalPicker(pcName)`, `stopRental(pcName)` | Cancel without mutation, or stop and wait for the Payments redirect. |
| PCs | `openTransfer(pcName)`, `transferRental(fromPcName, toPcName)` | Read eligible destinations or select a destination by its exact name. |
| Rentals | `rentalRow(pcName)`, `readRentalNames()` | Locate one named row or return names in displayed order. |
| Rentals | `readRemainingTime(pcName)`, `readUsedTime(pcName)`, `readBlockTime(pcName)` | Read the three distinct time displays without mixing them. |

Use `{ hours, minutes, seconds }` for custom duration inputs. Distinguish locator
properties from method names, for example `startRentalButton` and
`startRentalPreset()`. Existing locator names can be adjusted during the approved
POM work if a proposed method would otherwise have the same name.

## 4. Required guide comments and specific comments

Every page object should begin with a short file comment explaining its page,
responsibility, and any important boundary. Example for the proposed Rentals POM:

```js
// Admin Rentals page: reads the active rental list and its time displays.
// Rental actions are performed on the PCs page through pcsPageAdmin.
// Specs use the returned values to check the expected results.
```

Use group comments to help find locators. Add a specific comment when a locator
has a scope requirement or depends on the current markup:

```js
// PC tiles: select one tile by its exact PC name before using its controls.
// Buttons such as Extend and Repair are repeated across multiple PCs.

// Custom duration fields: their IDs repeat when multiple pickers are open.
// Locate these fields inside the selected PC tile.

// Sidebar identity: select the Admin / Owner text, not the first paragraph.
// The first sidebar paragraph is the application name.

// Bills notification: the accessible name includes a count and an amount.
// Match both the singular "bill" and plural "bills" label.
```

Each public action or reader needs a brief method comment describing purpose,
inputs, return value where relevant, and an important precondition or side effect.
For example, place this above the user-written stop method:

```js
/**
 * Stop the active rental on the PC with this exact name.
 * Precondition: the selected PC has an active rental.
 * Side effect: creates an unsettled bill and opens Payments.
 * Does not settle the bill. The spec checks the resulting state.
 * @param {string} pcName - Exact visible PC name.
 * @returns {Promise<void>}
 */
```

For a reader:

```js
/**
 * Read the Issue count from the Home Issue tile.
 * Precondition: the Home data has finished loading.
 * @returns {Promise<number>} Displayed Issue count.
 */
```

Specs should have a short scenario comment stating the starting data and what
the test proves. Add comments for unusual timing or data setup. Avoid comments
that merely repeat a line such as `// Click button`.

All six existing spec files now include `TYPE` alongside WHAT / TEST DATA /
EXPECTED, a readable scenario suffix in each test title, and Playwright tags:
`@happy-path`, `@error-path`, and `@edge-case`. Mixed scenarios carry both relevant
tags. Use `-- --grep '@error-path'` (or the other tag) with the existing npm test
commands to filter the report. The scenario type is independent of pass/fail.

## 5. Admin setup and navigation tests

**Test group:** `adminNavigation`  
**User:** Admin / Owner  
**Page object:** `pages/admin/sideBarAdmin.js` for shared navigation. Sign-in is test setup.

- [x] **ADMIN-01:** Sign in with the configured test Admin account.
  **Expected:** Admin / Owner appears in the sidebar and the authenticated Home opens.

- [ ] **ADMIN-02:** Use Home, PCs, and Rentals sidebar links.
  **Expected:** Each opens its correct route and heading; the selected navigation item updates.

- [ ] **ADMIN-03:** Refresh each of the three authenticated routes.
  **Expected:** The session remains active and the requested page loads successfully.

  - [x] Home refresh with a real Admin session.
  - [ ] PCs refresh with a real Admin session.
  - [ ] Rentals refresh with a real Admin session.

Sign-in is a prerequisite here. A separate complete authentication suite is
deferred. Do not hardcode a password into each spec or commit saved sessions.

## 6. Home test coverage

**Test group:** `homeAdmin`  
**User:** Admin / Owner  
**Page object:** `pages/admin/homePageAdmin.js`  
**Tests:** `tests/admin/home/home.spec.js`, `tests/admin/home/home.live.spec.js`,
and `tests/admin/home/home.flow.spec.js`

- [x] **HOME-01:** Open Home after its data loads.
  **Expected:** Right now, computer total, active rental total, and all four status labels appear.

- [x] **HOME-02:** Use a known dataset with distinct status counts.
  **Expected:** Free, Rented, Issue, and Unresponsive each show their own expected number. Distinct values catch a reader using the wrong tile.

- [x] **HOME-03:** Read all four status counts and the total.
  **Expected:** Counts are non-negative integers and their sum equals the computer total.

- [x] **HOME-04:** Compare the active rental total with the known active-rental dataset and Rentals list.
  **Expected:** Totals agree. A flagged PC can retain an active rental, so the Rented status count is not always the active rental count.

  - [x] Compare Home with prepared rental data, including a rental on an Issue PC.
  - [x] Compare Home with real API counts before and after refresh.
  - [x] Compare Home with the displayed Rentals list using its POM and a real backend.

- [x] **HOME-05:** Change a test PC's status on PCs, then navigate to Home.
  **Expected:** The affected status counts reflect the change; the computer total is unchanged.
  **Verified:** Free -> Issue -> Free, unchanged totals, and exact-name selection
  with a similarly named second PC left untouched.

- [x] **HOME-06:** Start and then stop a test rental, checking Home after each action.
  **Expected:** Active rental count increases by one and then returns to its starting value.
  **Verified:** PC status and Home counts update without reload, Rentals adds/removes
  the row, and stopping creates exactly one unsettled bill and opens Payments.

- [x] **HOME-07:** Use controlled datasets with zero, one, and multiple computers/rentals.
  **Expected:** Counts remain correct and singular/plural summary text is handled correctly.

## 7. PCs test coverage

**Test group:** `pcsAdmin`  
**User:** Admin / Owner  
**Page object:** `pages/admin/pcsPageAdmin.js`  
**Tests:** `tests/admin/pcs/pcs.registration-status.spec.js`,
`tests/admin/pcs/pcs.rentals.spec.js`, and
`tests/admin/pcs/pcs.transfers-page-states.spec.js`

**Latest result: 81 tests run — 71 passed, 10 failed.** No tests were skipped.
The failures map to four application issues in registration feedback, active
rental repairs, extension rejection feedback, and immediate transfer status.
See [PCs test results](pcs%20test%20results.md) for the failures and case counts.

Run from `qaTesting/automation` with the same PHP/SQL Server prerequisites
as the Home workflow runner:

```powershell
$env:UI_BROWSER_CHANNEL = 'chrome'
npm run test:pcs
```

The command creates its own servers/database and generated Admin account.
Every test resets only that disposable database to ten known PCs. One worker
is required. The database and temporary server files are removed after the run.

Use a dedicated test dataset. Each checklist item may become multiple focused
tests, such as one test per duration preset or invalid input. Check an item only
after all of its variants pass.

- [x] **PCS-01:** Open PCs with a known inventory.
  **Expected:** Heading, total, legend, named tiles, and their correct status labels appear.

- [x] **PCS-02:** Open Add PC and cancel.
  **Expected:** Name input and submit/cancel controls appear; cancel closes the form without adding a PC.

- [x] **PCS-03:** Add a unique valid test PC name.
  **Expected:** Exactly one new tile appears as Free; the total increases by one and persists after refresh.

- [ ] **PCS-04:** Submit an empty or whitespace-only name.
  **Expected:** Validation prevents creation; inventory and total remain unchanged.
  **Current result:** 2 failures. Creation is prevented, but no visible form error appears.

- [ ] **PCS-05:** Submit an existing PC name.
  **Expected:** Duplicate is rejected with visible feedback; no second PC is created. Confirm exact duplicate/case rules before adding case-variant tests.
  **Current result:** 1 failure. Backend rejects the duplicate, but its error is not shown.

- [ ] **PCS-06:** On a Free PC, mark Issue, resolve it, mark Unresponsive, and repair it in separate cases.
  **Expected:** Each supported action updates the named PC only; resolving/repairing an idle faulty PC restores Free and clears its repair flag.

  - [x] Flag/restore an idle PC and clear repair flags on working Free/Rented PCs (4 checks).
  - [ ] Repair a faulty PC with an active rental back to Rented (2 failures: it becomes Free).

- [x] **PCS-07:** Inspect a Free, Rented, Issue, and Unresponsive PC.
  **Expected:** Available buttons match the state. New rental start is offered only for a Free PC without an active rental; faulty rented PCs retain Stop/Extend and offer Transfer.

- [x] **PCS-08:** Start a rental using each preset: 30 min, 1 hr, 2 hr, 3 hr, 5 hr, 6 hr.
  **Expected:** One active rental is created on the selected PC with the chosen duration. Check its presence on PCs, Rentals, and after refresh.

- [x] **PCS-09:** Start with valid custom duration values, including 1 minute, mixed hour/minute/second values, and exactly 24 hours.
  **Expected:** Each accepted input creates one rental with the requested duration.

- [x] **PCS-10:** Try blank/all-zero, 59 seconds, negative/fractional parts, minutes/seconds above 59, or a total above 24 hours.
  **Expected:** Invalid input is blocked by browser/form validation or a visible application error; no rental is created. Check the appropriate feedback layer for each case.

- [x] **PCS-11:** Open a start/extend picker, enter values, then cancel.
  **Expected:** No rental starts and no extension is added.

- [x] **PCS-12:** Extend an active rental using presets and valid custom duration.
  **Expected:** Remaining display time increases by the extension within a small elapsed-time tolerance; no second rental is created.

- [ ] **PCS-13:** Attempt an invalid extension or extend past 24 hours of total booked time.
  **Expected:** Request is rejected; the existing rental and booked duration remain unchanged. Missing UI error feedback is reported as a defect.

  - [x] Invalid input and exact 24-hour acceptance (9 checks).
  - [ ] Show the server's rejection when total booked time exceeds 24 hours (1 failure).

- [x] **PCS-14:** Mark an actively rented PC Issue or Unresponsive.
  **Expected:** The rental remains active and visible; its Stop/Extend/Transfer controls remain available.

- [x] **PCS-15:** Open Transfer on a flagged rented PC.
  **Expected:** Eligible destinations include idle Free and idle Issue PCs; source, Unresponsive, and occupied PCs are excluded.

- [ ] **PCS-16:** Transfer to an eligible named PC.
  **Expected:** The same rental moves once, the clock continues, and the source retains its fault. Booked segments and charges do not change; use the server rental record to verify values not displayed here.

  - [x] Backend rental, clock, and charges are preserved across the tested transfers.
  - [ ] Immediately display Rented on the destination (4 failures: old Free/Issue status remains).

- [x] **PCS-17:** Cancel Transfer, or open it when no target is eligible.
  **Expected:** Cancel leaves the source unchanged; the no-target message appears when appropriate.

- [x] **PCS-18:** Stop a healthy rental, then separately stop a flagged rental.
  **Expected:** The active rental is removed, one unsettled bill is created, and Payments opens. Healthy PC becomes Free; flagged PC retains its fault.

- [x] **PCS-19:** Use datasets with zero, one, and multiple unsettled bills.
  **Expected:** The notification is absent at zero, uses bill/bills correctly, displays the expected outstanding total, and opens Payments.

- [x] **PCS-20:** Refresh after status, repair, start, extend, transfer, and stop actions.
  **Expected:** Saved state persists. No duplicate registration, rental, extension, transfer, or bill is created by refresh.

## 8. Rentals test coverage

**Test group:** `rentalsAdmin`  
**User:** Admin / Owner  
**Page object:** `pages/admin/rentalsPageAdmin.js` (name/count readers implemented)  
**Planned tests:** `tests/admin/rentals.spec.js`

- [ ] **RENT-01:** Open Rentals with no active rentals in the test dataset.
  **Expected:** Active rentals heading and No active rentals. message appear; no rental rows appear.

- [ ] **RENT-02:** Open Rentals with known active rentals.
  **Expected:** Each active rental has one row with its correct PC name; stopped rentals are absent.

- [ ] **RENT-03:** Read a known row.
  **Expected:** Remaining countdown, Used elapsed time, and block duration are present and independently identifiable.

- [ ] **RENT-04:** Observe a running rental across controlled clock ticks.
  **Expected:** Remaining time decreases while Used time increases. Allow a small elapsed-time tolerance for live checks.

- [ ] **RENT-05:** Provide rentals with distinct remaining times away from wrap boundaries.
  **Expected:** Rows are ordered by soonest remaining time, not PC name, booking length, or creation order.

- [ ] **RENT-06:** Start, extend, transfer, and stop via the PCs POM, returning to Rentals after each relevant action.
  **Expected:** The row is added, time increases, destination name changes, and the row disappears respectively.

- [ ] **RENT-07:** Refresh the Rentals page.
  **Expected:** Active rentals persist; elapsed time continues rather than restarting.

- [ ] **RENT-08:** Use controlled timestamps around the 10-, 5-, and 1-minute warning thresholds.
  **Expected:** Correct warning label appears for each threshold and no warning appears above 10 minutes.

- [ ] **RENT-09:** Advance a controlled display clock across a block boundary.
  **Expected:** Countdown rolls into another display block without showing 0:00; Used time continues and the rental remains active.

Clock-boundary and warning tests should use controlled response data/browser time
rather than waiting many real minutes. Keep them separate from real backend
workflow checks; controlling browser time alone does not control PHP billing time.

## 9. Shared loading and failure checks

### homeAdmin — Home, Admin / Owner — completed

- [x] Delay the PC list: show loading without counts, then the loaded summary.
- [x] Delay the active rental list: show loading without counts, then the loaded summary.
- [x] Fail the PC list: show the error heading/message without misleading zero counts.
- [x] Fail the active rental list: show the error heading/message without misleading zero counts.
- [x] Refresh Home with prepared data: load the correct counts again.

### pcsAdmin — PCs, Admin / Owner — completed

- [x] Delay each required read: inventory, rentals, payments, and payment refunds.
- [x] Fail each required read: show the error heading/message without PC tiles.

### rentalsAdmin — Rentals, Admin / Owner — pending

- [ ] Delay required read responses: show loading, then the actual page.
- [ ] Fail a required read: show Could not load this screen and a useful error message.

Reuse the intent of the existing `check-refresh.cjs` checks. Do not duplicate
its full screenshot/geometry coverage in every new spec.

## 10. Test data and execution proposal

- Run state-changing tests against a dedicated test database. Registration is
  permanent through the current UI, and stopping rentals creates persistent bills.
- Establish an approved dataset/reset procedure before running those tests.
  Cleanup must handle test-created rentals, PCs, transfers, and bills; there is
  no existing PC-delete UI to use as teardown. Do not reset the working database
  or re-seed accounts as an automatic cleanup step.
- Give each test its own known PCs and record their starting state. Use unique
  names for registration tests, but also provide a reset strategy so data does
  not accumulate indefinitely.
- Real workflow cases use real API/database state. Read-only API responses can
  establish independent expected values. Controlled-response tests cover empty,
  loading, failure, and time-boundary states and must be identified as such.
- Propose Chromium first. Run state-changing tests with one worker initially;
  the current configuration enables parallel tests and three browser projects.
  Add cross-browser execution after data isolation and the first suite pass.
- Tests must pass independently and on a repeat run. The cross-page scenario
  keeps its steps in one test rather than depending on earlier specs.
- Capture useful failure evidence: case ID, exact PC name, route, expected and
  actual state, plus the configured Playwright report/trace when available.

## 11. Preparation findings to address during approved implementation

These findings were recorded while planning. Home fixes are marked below;
remaining findings belong to later approved implementation batches.

| File / area | Finding | Planned handling |
| --- | --- | --- |
| `homePageAdmin.js` | Class was named `homrPageAdmin`, but export referred to `homePageAdmin`. | Fixed in the Home batch; module loads and browser tests pass. |
| `homePageAdmin.js` | `readIssue()` and `readUnresponsive()` read `rentedTile`. | Fixed in the Home batch; distinct 1/2/3/4 counts verify each reader. |
| `homePageAdmin.js` | Total locator used `getByText('computers')`. | Fixed in the Home batch; separate numeric readers pass empty, singular, and plural cases. |
| `pcsPageAdmin.js` | `markUnresponsive` contained `getByRo    le`. | Fixed; POM imports and the Home workflows pass. |
| `pcsPageAdmin.js` | Tile action locators match collections. | Implemented exact-name tile selection; tested with HOME-STATUS-PC and HOME-STATUS-PC-10. Broader action methods remain pending. |
| `sideBarAdmin.js` | Role locator selected the brand paragraph. | Fixed to target Admin / Owner specifically. |
| `client/src/pages/PCs.jsx` | Add PC form reads `onAdd(name)` synchronously, but the provider returns a Promise. | Confirmed by 3 failing PCS-04/05 cases; recorded in PCs test results for a separate app-fix batch. |
| Rental start/stop | Rental list updated while the PC list stayed stale. | Reproduced with HOME-06 and fixed by refreshing shared PC data before the rental refresh. Immediate PCs/Home state now passes without a browser reload. |

## 12. Proposed implementation order and review checkpoints

- [x] **Home scope and style:** approve and implement the Home batch with
  organized POM comments and an explanation above every test.
- [x] **Home verification:** pass the 11 controlled tests, 1 live backend test,
  and 3 real workflow tests. Repeat the workflows successfully.
- [ ] **Test data preparation:** agree on the dedicated database and reset
  procedure for the full PCs/Rentals suites.

  - [x] Home workflows: create and remove a disposable database automatically.
  - [x] Add the ten-PC registration/extension/transfer dataset and a reset before each PCs test.
  - [ ] Prepare the additional Rentals list/clock scenarios for its full suite.
- [x] **PCs POM preparation:** add the required actions/readers, address the
  PCs/sidebar blockers, and provide specific guide comments.
- [ ] **Remaining Rentals POM preparation:** add its duration/used-time readers
  for the full Rentals suite.
- [ ] **Admin navigation:** add shared authentication setup and navigation checks
  across Home, PCs, and Rentals; review results before state-changing coverage.
- [ ] **PCs:** finish with all cases passing after the recorded application issues are fixed.

  - [x] Implement and run all 81 cases across PCS-01 through PCS-20 plus loading/errors.
  - [x] Record 71 passing checks and the four issues behind 10 failures.
  - [ ] Fix and recheck registration feedback, active-rental repair status,
    extension-cap feedback, and immediate transfer status.
- [ ] **Rentals:** add list, ordering, time display, and controlled-clock cases.
- [ ] **Cross-page proof:** run one Admin start -> Home count -> Rentals row ->
  extend -> flag/transfer -> stop scenario. Verify the Payments handoff and
  final Home/Rentals state. Run the approved suite again to prove repeatability.

Completion means the approved cases pass, POM functions have useful specific
comments, test data can be restored for another run, and any unresolved product
defects are explicitly recorded. A draft test list is not a completed suite.

## 13. Review decisions

- Is this Home -> PCs -> Rentals coverage the right first scope?
- Are the proposed method names and comment examples clear enough for writing
  the functions?
- Home workflows use a new disposable database per run and remove it afterward.
  PCs now has its dataset and per-test reset. Rentals still needs its additional cases.
- Is Chromium with one worker acceptable for the first implementation batch?

**All homeAdmin checks complete. PCs tests are implemented and run, with four app
issues still needing fixes.** The full Rentals test suite remains a later batch.
