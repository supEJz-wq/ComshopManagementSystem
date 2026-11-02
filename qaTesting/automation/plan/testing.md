# Testing

Checklists are organized by **page**, then **Good path**, **Bad path**, and **Edge case path**.
All pages below are for the **Admin / Owner** user.

**Status key:** `[x]` = the stated check passed. `[ ]` with **FAILED** = the expected outcome was not met.
`[ ]` with **PLANNED/PENDING** = not tested yet. **PARTIAL** = the executed checks passed but a named part could not be verified.

## How success and failure work

- **Validation PASSED:** Invalid input was rejected and saved data did not change.
- **Validation FAILED:** Invalid input was accepted or caused an invalid saved change.
- **Feedback PASSED:** The expected application or native browser error explanation is available.
- **Feedback FAILED:** The expected message is missing or incorrect. This does not mean the invalid input was accepted.
- **Edge case PASSED:** Actual behavior matches the stated boundary expectation. A valid minimum/maximum is accepted, an invalid value is rejected, or an empty state displays correctly.
- **UI Responsive PASSED:** The elements actually checked fit the screen. If a message is absent, its layout is **not verified**, rather than assumed to fit.

**Example:** Empty PC name = **Validation PASSED / Feedback FAILED** when creation is blocked but the error is missing.
One minute accepted and 59 seconds rejected are both successful boundary checks. A supported long name escaping its tile is still a UI layout failure.
Bad paths and edge cases are scenario types; acceptance or rejection alone never determines PASS/FAIL.

Each case appears once. Invalid input and failed requests go under **Bad path**.
Other boundary or unusual-state checks go under **Edge case path**, including cases also tagged as happy paths.
The existing spec tags remain `@happy-path`, `@error-path`, and `@edge-case`; filtered test totals can overlap.

**Responsive UI coverage: EXECUTED, with failures.** The seven-size Chrome matrix
ran 63 cases: **33 layout checks passed, 30 failed, no skips**. Five layout passes have registration-message layout **PARTIAL / not verified**. Four responsive issues were
confirmed again in an independent four-case recheck and added to the existing Excel report.
The 116 functional checks and 63 responsive checks are reported separately. Twenty invalid-input scenarios now have independent validation and feedback results.

**Tested screen sizes (width × height in CSS pixels):** phones 360 × 800 and
390 × 844; tablets 768 × 1024 and 1024 × 768; laptop 1366 × 768; desktop
1920 × 1080; phone landscape 844 × 390. Browser emulation checks layout and
touch interactions; results must state the browser and screen size actually tested.

## Find a page

- [adminHomepage](#adminhomepage)
- [adminPCspage](#adminpcspage)
- [adminRentalspage](#adminrentalspage)
- [Admin setup and navigation](#admin-setup-and-navigation)
- [Responsive results by screen](#responsive-results-by-screen)
- [Known PCs issues](#known-pcs-issues)
- [Run the tests](#run-the-tests)
- [Files and reports](#files-and-reports)

## Latest recorded results

| Page | Group | Passed | Failed | Status |
| --- | --- | ---: | ---: | --- |
| Admin Home | `homeAdmin` | 15 | 0 | Functional suite complete; responsive failures recorded below |
| Admin PCs | `pcsAdmin` | 91 | 10 | Functional and responsive issues remain |
| Admin Rentals | `rentalsAdmin` | — | — | Timing/business suite planned; responsive suite executed |

**Functional total:** 116 checks, 106 passed, 10 failed, no skips. Home retains its 15 passing checks; the rerun PCs suite has 101 checks.
Functional results are preserved from their last run. Responsive results were recorded in the new seven-size run.
The navigation checklist references existing sign-in coverage and planned checks; it adds no executed cases.

## Responsive results by screen

| Chrome screen profile (CSS pixels) | Layout passed | Layout failed | Of passes, message layout partial |
| --- | ---: | ---: | ---: |
| phone-small 360x800 | 0 | 9 | 0 |
| phone 390x844 | 0 | 9 | 0 |
| tablet-portrait 768x1024 | 6 | 3 | 1 |
| tablet-landscape 1024x768 | 6 | 3 | 1 |
| laptop 1366x768 | 7 | 2 | 1 |
| desktop 1920x1080 | 8 | 1 | 1 |
| phone-landscape 844x390 | 6 | 3 | 1 |

**Responsive total:** 63 checks, 33 passed and 30 failed. The partial column is a
subset of passing executed layout checks, not additional tests. The five cases
with missing registration feedback explicitly leave that message's wrapping unverified.
They no longer count missing functional feedback as a responsive layout failure.
Some phone/editor and long-name resize steps stop at an earlier failure and remain unverified.
These are Chrome-emulated screens; physical-device keyboards and Safari/Firefox remain unverified.

See [responsive results and evidence](responsive%20test%20results.md).

## adminHomepage

**User:** Admin / Owner. **Group:** `homeAdmin`. **Functional result:** 15 passed.

**Specs:** [home.spec.js](../tests/admin/home/home.spec.js) (11 UI cases),
[home.live.spec.js](../tests/admin/home/home.live.spec.js) (1 live backend case),
[home.flow.spec.js](../tests/admin/home/home.flow.spec.js) (3 workflow cases).
**Responsive spec:** [home.responsive.spec.js](../tests/admin/home/home.responsive.spec.js) (21 screen cases).

### Good path (happy path)

- [x] **HOME-01/02:** Show Admin identity, Right now heading, summary, and the correct Free/Rented/Issue/Unresponsive counts using distinct values. (UI)
- [x] **HOME-03:** Status counts are whole numbers >= 0 and sum to the computer total. (UI)
- [x] **HOME-06:** Start/stop a rental; Home and Rentals update, counts restore, and stopping creates exactly one unsettled bill and opens Payments. (Workflow)
- [ ] **RESP-HOME-01 — FAILED (5 passed, 2 failed):** At every planned screen size, verify that headings, summary totals, and all four status tiles remain readable, with no overlap or unintended horizontal page scrolling. On touch layouts, open navigation, select Home, and verify that the content is reachable. (UI Responsive)
  - [ ] **phone-small 360x800 — FAILED.** BUG-011: phone layout overflow.
  - [ ] **phone 390x844 — FAILED.** BUG-011: phone layout overflow.
  - [x] **tablet-portrait 768x1024 — PASSED.**
  - [x] **tablet-landscape 1024x768 — PASSED.**
  - [x] **laptop 1366x768 — PASSED.**
  - [x] **desktop 1920x1080 — PASSED.**
  - [x] **phone-landscape 844x390 — PASSED.**

### Bad path (error path)

- [x] **Error / PCs:** Show the required-data error when the PC list fails. (UI)
- [x] **Error / Rentals:** Show the required-data error when active rentals fail. (UI)
- [ ] **RESP-HOME-02 — FAILED (5 passed, 2 failed):** At phone and tablet sizes, simulate failed PC/rental reads. Verify that the full error message and any recovery controls fit the screen and remain usable. (UI Responsive)
  - [ ] **phone-small 360x800 — FAILED.** BUG-011: phone layout overflow.
  - [ ] **phone 390x844 — FAILED.** BUG-011: phone layout overflow.
  - [x] **tablet-portrait 768x1024 — PASSED.**
  - [x] **tablet-landscape 1024x768 — PASSED.**
  - [x] **laptop 1366x768 — PASSED.**
  - [x] **desktop 1920x1080 — PASSED.**
  - [x] **phone-landscape 844x390 — PASSED.**

### Edge case path

- [x] **HOME-04:** Include an active rental on a faulty PC in the rental total. (UI)
- [x] **HOME-07 / Empty inventory:** All status values and both totals show zero. (UI)
- [x] **HOME-07 / One idle PC:** Show 1 computer, 0 active rentals, and Free = 1. (UI)
- [x] **HOME-07 / One rented PC:** Show 1 computer, 1 active rental, and Rented = 1. (UI)
- [x] **Refresh:** Reload Home and retain the correct prepared counts. (UI)
- [x] **Loading / PCs:** Wait for the PC list before showing counts. (UI)
- [x] **Loading / Rentals:** Wait for active rentals before showing counts. (UI)
- [x] **Live Home:** Sign in as Admin; all four status counts and both totals match the actual API responses before and after refresh. (Live backend)
- [x] **HOME-04:** Home rental total matches the displayed Rentals list, including a faulty PC with an active rental. (Workflow)
- [x] **HOME-05:** Mark an exact PC Issue and resolve it; Home counts update and restore, totals remain unchanged, and a similarly named PC is unaffected. (Workflow)
- [ ] **RESP-HOME-03 — FAILED (4 passed, 3 failed):** Resize between phone portrait, landscape, tablet, and desktop with zero and large counts. Verify that the tiles reflow, values remain readable, and resizing does not reset the displayed data or hide navigation. (UI Responsive)
  - [ ] **phone-small 360x800 — FAILED.** BUG-011: phone layout overflow.
  - [ ] **phone 390x844 — FAILED.** BUG-011: phone layout overflow.
  - [x] **tablet-portrait 768x1024 — PASSED.**
  - [x] **tablet-landscape 1024x768 — PASSED.**
  - [x] **laptop 1366x768 — PASSED.**
  - [x] **desktop 1920x1080 — PASSED.**
  - [ ] **phone-landscape 844x390 — FAILED.** BUG-011: phone layout overflow.

## adminPCspage

**User:** Admin / Owner. **Group:** `pcsAdmin`. **Result:** 91 passed, 10 failed out of 101.
Each test starts with fresh isolated records.

**Specs:** [pcs.registration-status.spec.js](../tests/admin/pcs/pcs.registration-status.spec.js),
[pcs.rentals.spec.js](../tests/admin/pcs/pcs.rentals.spec.js),
[pcs.transfers-page-states.spec.js](../tests/admin/pcs/pcs.transfers-page-states.spec.js).
**Responsive spec:** [pcs.responsive.spec.js](../tests/admin/pcs/pcs.responsive.spec.js) (21 screen cases).

### Good path (happy path)

- [x] **PCS-01 — Board inventory, names, statuses, and legend** — 1 passed.
- [x] **PCS-08:** starts and saves the 30 min preset.
- [x] **PCS-08:** starts and saves the 1 hr preset.
- [x] **PCS-08:** starts and saves the 2 hr preset.
- [x] **PCS-08:** starts and saves the 3 hr preset.
- [x] **PCS-08:** starts and saves the 5 hr preset.
- [x] **PCS-08:** starts and saves the 6 hr preset.
- [x] **PCS-09:** accepts mixed hours, minutes, and seconds.
- [x] **PCS-12:** extends an active rental by 30 min.
- [x] **PCS-12:** extends an active rental by 1 hr.
- [x] **PCS-12:** extends an active rental by 2 hr.
- [x] **PCS-12:** extends an active rental by 3 hr.
- [x] **PCS-12:** extends an active rental by 5 hr.
- [x] **PCS-12:** extends an active rental by 6 hr.
- [x] **PCS-12:** extends an active rental by custom 2 min 3 sec.
- [x] **PCS-18:** stopping a Rented PC creates one bill and leaves it Free.
- [ ] **RESP-PCS-01 — FAILED (3 passed, 4 failed):** At every planned screen size, verify that PC tiles reflow and names, statuses, countdowns, and action buttons remain readable and reachable. On touch layouts, use Add PC, the duration pickers, and Transfer without clipped fields, covered controls, or unintended horizontal page scrolling. (UI Responsive)
  - [ ] **phone-small 360x800 — FAILED.** BUG-011/014: phone overflow and timer outside its tile; later editors unverified.
  - [ ] **phone 390x844 — FAILED.** BUG-011/014: phone overflow and timer outside its tile; later editors unverified.
  - [ ] **tablet-portrait 768x1024 — FAILED.** BUG-014: long countdown extends outside its tile.
  - [ ] **tablet-landscape 1024x768 — FAILED.** BUG-014: long countdown extends outside its tile.
  - [x] **laptop 1366x768 — PASSED.**
  - [x] **desktop 1920x1080 — PASSED.**
  - [x] **phone-landscape 844x390 — PASSED.**

### Bad path (error path)

Validation and feedback below are independent checks. Invalid input being rejected
is a successful validation result; missing feedback remains a separate open bug.

- [x] **PCS-04 / Validation — PASSED:** rejects an empty PC name.
- [ ] **PCS-04 / Feedback — FAILED:** shows an error for an empty PC name.
- [x] **PCS-04 / Validation — PASSED:** rejects a whitespace-only PC name.
- [ ] **PCS-04 / Feedback — FAILED:** shows an error for a whitespace-only PC name.
- [x] **PCS-05 / Validation — PASSED:** rejects an existing PC name without creating a PC.
- [ ] **PCS-05 / Feedback — FAILED:** shows the duplicate-name error.
- [x] **PCS-10 / Validation — PASSED:** rejects blank duration.
- [x] **PCS-10 / Feedback — PASSED:** explains rejection of blank duration.
- [x] **PCS-10 / Validation — PASSED:** rejects all-zero duration.
- [x] **PCS-10 / Feedback — PASSED:** explains rejection of all-zero duration.
- [x] **PCS-10 / Validation — PASSED:** rejects 59 seconds.
- [x] **PCS-10 / Feedback — PASSED:** explains rejection of 59 seconds.
- [x] **PCS-10 / Validation — PASSED:** rejects negative hours.
- [x] **PCS-10 / Feedback — PASSED:** explains rejection of negative hours.
- [x] **PCS-10 / Validation — PASSED:** rejects fractional minutes.
- [x] **PCS-10 / Feedback — PASSED:** explains rejection of fractional minutes.
- [x] **PCS-10 / Validation — PASSED:** rejects 60 minutes in the minutes field.
- [x] **PCS-10 / Feedback — PASSED:** explains rejection of 60 minutes in the minutes field.
- [x] **PCS-10 / Validation — PASSED:** rejects 60 seconds in the seconds field.
- [x] **PCS-10 / Feedback — PASSED:** explains rejection of 60 seconds in the seconds field.
- [x] **PCS-10 / Validation — PASSED:** rejects 24 hours plus one second.
- [x] **PCS-10 / Feedback — PASSED:** explains rejection of 24 hours plus one second.
- [x] **PCS-13 / Validation — PASSED:** rejects an extension of blank duration.
- [x] **PCS-13 / Feedback — PASSED:** explains rejection of an extension of blank duration.
- [x] **PCS-13 / Validation — PASSED:** rejects an extension of all-zero duration.
- [x] **PCS-13 / Feedback — PASSED:** explains rejection of an extension of all-zero duration.
- [x] **PCS-13 / Validation — PASSED:** rejects an extension of 59 seconds.
- [x] **PCS-13 / Feedback — PASSED:** explains rejection of an extension of 59 seconds.
- [x] **PCS-13 / Validation — PASSED:** rejects an extension of negative hours.
- [x] **PCS-13 / Feedback — PASSED:** explains rejection of an extension of negative hours.
- [x] **PCS-13 / Validation — PASSED:** rejects an extension of fractional minutes.
- [x] **PCS-13 / Feedback — PASSED:** explains rejection of an extension of fractional minutes.
- [x] **PCS-13 / Validation — PASSED:** rejects an extension of 60 minutes in the minutes field.
- [x] **PCS-13 / Feedback — PASSED:** explains rejection of an extension of 60 minutes in the minutes field.
- [x] **PCS-13 / Validation — PASSED:** rejects an extension of 60 seconds in the seconds field.
- [x] **PCS-13 / Feedback — PASSED:** explains rejection of an extension of 60 seconds in the seconds field.
- [x] **PCS-13 / Validation — PASSED:** rejects an extension of 24 hours plus one second.
- [x] **PCS-13 / Feedback — PASSED:** explains rejection of an extension of 24 hours plus one second.
- [x] **PCS-13 / Validation — PASSED:** rejects an extension exceeding 24 hours booked.
- [ ] **PCS-13 / Feedback — FAILED:** shows the error for an extension exceeding 24 hours booked.
- [x] **API error display — PASSED:** PCs errors: reports failed PC inventory.
- [x] **API error display — PASSED:** PCs errors: reports failed active rentals.
- [x] **API error display — PASSED:** PCs errors: reports failed payments.
- [x] **API error display — PASSED:** PCs errors: reports failed refunds required by payments.

- [ ] **RESP-PCS-02 — 5 layout passes / 2 layout failures; message layout PARTIAL:** Check present data/duration errors and forms. Missing registration messages are covered by the separate functional feedback checks. (UI Responsive)
  - [ ] **phone-small 360x800 — FAILED (layout).** BUG-011: phone error screen overflows; later form checks not verified.
  - [ ] **phone 390x844 — FAILED (layout).** BUG-011: phone error screen overflows; later form checks not verified.
  - [ ] **tablet-portrait 768x1024 — PARTIAL.** Executed layout checks PASSED; registration-message layout not verified because feedback is missing (BUG-001/002/003).
  - [ ] **tablet-landscape 1024x768 — PARTIAL.** Executed layout checks PASSED; registration-message layout not verified because feedback is missing (BUG-001/002/003).
  - [ ] **laptop 1366x768 — PARTIAL.** Executed layout checks PASSED; registration-message layout not verified because feedback is missing (BUG-001/002/003).
  - [ ] **desktop 1920x1080 — PARTIAL.** Executed layout checks PASSED; registration-message layout not verified because feedback is missing (BUG-001/002/003).
  - [ ] **phone-landscape 844x390 — PARTIAL.** Executed layout checks PASSED; registration-message layout not verified because feedback is missing (BUG-001/002/003).

### Edge case path

- [x] **PCS-02 — Open and cancel Add PC** — 1 passed.
- [x] **PCS-03 — Register a unique PC and refresh** — 1 passed.
- [x] **PCS-06:** Issue and Resolve updates only the exact named PC.
- [x] **PCS-06:** Unresponsive and Repair updates only the exact named PC.
- [x] **PCS-06:** Repair preserves the working state of PCS-FREE-REPAIR.
- [x] **PCS-06:** Repair preserves the working state of PCS-RENTED-REPAIR.
- [ ] **PCS-06:** repairing PCS-ISSUE-RENTED restores Rented without ending its rental — **FAILED**.
- [ ] **PCS-06:** repairing PCS-UNRESPONSIVE-RENTED restores Rented without ending its rental — **FAILED**.
- [x] **PCS-07:** offers the correct actions on PCS-FREE-01.
- [x] **PCS-07:** offers the correct actions on PCS-RENTED-01.
- [x] **PCS-07:** offers the correct actions on PCS-ISSUE-IDLE.
- [x] **PCS-07:** offers the correct actions on PCS-UNRESPONSIVE-IDLE.
- [x] **PCS-07:** offers the correct actions on PCS-ISSUE-RENTED.
- [x] **PCS-07:** offers the correct actions on PCS-UNRESPONSIVE-RENTED.
- [x] **PCS-07:** offers the correct actions on PCS-FREE-REPAIR.
- [x] **PCS-07:** offers the correct actions on PCS-RENTED-REPAIR.
- [x] **PCS-09:** accepts the minimum one minute.
- [x] **PCS-09:** accepts exactly 24 hours.
- [x] **PCS-11:** cancels the start picker without a mutation.
- [x] **PCS-11:** cancels the extend picker without a mutation.
- [x] **PCS-13:** accepts an extension reaching exactly 24 hours booked.
- [x] **PCS-14:** markIssue preserves the rental and recovery actions.
- [x] **PCS-14:** markUnresponsive preserves the rental and recovery actions.
- [x] **PCS-18:** stopping a Issue PC creates one bill and leaves it Issue.
- [x] **PCS-18:** stopping a Unresponsive PC creates one bill and leaves it Unresponsive.
- [x] **PCS-15:** lists only eligible destinations from PCS-ISSUE-RENTED.
- [x] **PCS-15:** lists only eligible destinations from PCS-UNRESPONSIVE-RENTED.
- [ ] **PCS-16:** transfers PCS-ISSUE-RENTED to PCS-FREE-01 without resetting time or charges — **FAILED**.
- [ ] **PCS-16:** transfers PCS-ISSUE-RENTED to PCS-ISSUE-IDLE without resetting time or charges — **FAILED**.
- [ ] **PCS-16:** transfers PCS-UNRESPONSIVE-RENTED to PCS-FREE-01 without resetting time or charges — **FAILED**.
- [ ] **PCS-16:** transfers PCS-UNRESPONSIVE-RENTED to PCS-ISSUE-IDLE without resetting time or charges — **FAILED**.
- [x] **PCS-17:** cancelling Transfer leaves the rental on its source PC.
- [x] **PCS-17:** shows the no-target message when all destinations are unavailable.
- [x] **PCS-19:** handles 0 unsettled bills.
- [x] **PCS-19:** handles 1 unsettled bill.
- [x] **PCS-19:** handles 2 unsettled bills.
- [x] **PCS-20 — Saved actions survive refresh without duplicate records** — 1 passed.
- [x] **Loading:** waits for PC inventory.
- [x] **Loading:** waits for active rentals.
- [x] **Loading:** waits for payments.
- [x] **Loading:** waits for refunds required by payments.
- [ ] **RESP-PCS-03 — FAILED (0 passed, 7 failed):** Use long PC names and many tiles/transfer destinations, then switch portrait/landscape and resize while a picker is open. Verify that content remains reachable, a long destination list can scroll, and resizing neither submits an action nor creates duplicate records. Native phone keyboard coverage is tracked separately below. (UI Responsive)
  - [ ] **phone-small 360x800 — FAILED.** BUG-012: valid long name escapes its tile; subsequent resize steps not completed.
  - [ ] **phone 390x844 — FAILED.** BUG-012: valid long name escapes its tile; subsequent resize steps not completed.
  - [ ] **tablet-portrait 768x1024 — FAILED.** BUG-012: valid long name escapes its tile; subsequent resize steps not completed.
  - [ ] **tablet-landscape 1024x768 — FAILED.** BUG-012: valid long name escapes its tile; subsequent resize steps not completed.
  - [ ] **laptop 1366x768 — FAILED.** BUG-012: valid long name escapes its tile; subsequent resize steps not completed.
  - [ ] **desktop 1920x1080 — FAILED.** BUG-012: valid long name escapes its tile; subsequent resize steps not completed.
  - [ ] **phone-landscape 844x390 — FAILED.** BUG-012: valid long name escapes its tile; subsequent resize steps not completed.

- [ ] **Manual phone keyboard — PENDING:** On a physical phone, focus PC name and duration fields with the on-screen keyboard open. Verify that input, submit, and cancel remain reachable. Browser viewport emulation does not verify this. (UI Responsive)

## adminRentalspage

**User:** Admin / Owner. **Group:** `rentalsAdmin`.
**Status:** Standalone timing/business tests are **PLANNED**. The responsive suite
now exists in [tests/admin/rentals](../tests/admin/rentals/rentals.responsive.spec.js).
Existing Home and PCs workflows already check rental names, counts, and refresh behavior.
The planned cases below are not recorded failures. Use controlled clocks/data for warning thresholds and block boundaries.

### Good path (happy path)

- [ ] **RENT-02:** Open Rentals with known active rentals. **Expected:** Each active rental has one row with its correct PC name; stopped rentals are absent. **PLANNED**.
- [ ] **RENT-03:** Read a known row. **Expected:** Remaining countdown, Used elapsed time, and block duration are present and independently identifiable. **PLANNED**.
- [ ] **RENT-05:** Provide rentals with distinct remaining times away from wrap boundaries. **Expected:** Rows are ordered by soonest remaining time, not PC name, booking length, or creation order. **PLANNED**.
- [ ] **RENT-06:** Start, extend, transfer, and stop via the PCs POM, returning to Rentals after each relevant action. **Expected:** The row is added, time increases, destination name changes, and the row disappears respectively. **PLANNED**.
- [ ] **RESP-RENT-01 — FAILED (5 passed, 2 failed):** At every planned screen size, verify that the heading, PC names, countdowns, Used time, and block durations remain readable without overlap or unintended horizontal page scrolling. Verify that touch navigation can reach Rentals. (UI Responsive)
  - [ ] **phone-small 360x800 — FAILED.** BUG-011: phone page/error layout overflow.
  - [ ] **phone 390x844 — FAILED.** BUG-011: phone page/error layout overflow.
  - [x] **tablet-portrait 768x1024 — PASSED.**
  - [x] **tablet-landscape 1024x768 — PASSED.**
  - [x] **laptop 1366x768 — PASSED.**
  - [x] **desktop 1920x1080 — PASSED.**
  - [x] **phone-landscape 844x390 — PASSED.**

### Bad path (error path)

- [ ] **Errors:** Failed reads show a useful error instead of an empty rental list. **PLANNED**.
- [ ] **RESP-RENT-02 — FAILED (5 passed, 2 failed):** At phone and tablet sizes, fail required data reads. Verify that the full error message and any recovery controls fit the screen and remain usable. (UI Responsive)
  - [ ] **phone-small 360x800 — FAILED.** BUG-011: phone page/error layout overflow.
  - [ ] **phone 390x844 — FAILED.** BUG-011: phone page/error layout overflow.
  - [x] **tablet-portrait 768x1024 — PASSED.**
  - [x] **tablet-landscape 1024x768 — PASSED.**
  - [x] **laptop 1366x768 — PASSED.**
  - [x] **desktop 1920x1080 — PASSED.**
  - [x] **phone-landscape 844x390 — PASSED.**

### Edge case path

- [ ] **RENT-01:** Open Rentals with no active rentals in the test dataset. **Expected:** Active rentals heading and No active rentals. message appear; no rental rows appear. **PLANNED**.
- [ ] **RENT-04:** Observe a running rental across controlled clock ticks. **Expected:** Remaining time decreases while Used time increases. Allow a small elapsed-time tolerance for live checks. **PLANNED**.
- [ ] **RENT-07:** Refresh the Rentals page. **Expected:** Active rentals persist; elapsed time continues rather than restarting. **PLANNED**.
- [ ] **RENT-08:** Use controlled timestamps around the 10-, 5-, and 1-minute warning thresholds. **Expected:** Correct warning label appears for each threshold and no warning appears above 10 minutes. **PLANNED**.
- [ ] **RENT-09:** Advance a controlled display clock across a block boundary. **Expected:** Countdown rolls into another display block without showing 0:00; Used time continues and the rental remains active. **PLANNED**.
- [ ] **Loading:** Delay required reads, then show the actual Rentals page. **PLANNED**.
- [ ] **RESP-RENT-03 — FAILED (1 passed, 6 failed):** Check empty and long rental lists, long PC names, warning labels, and long elapsed times while switching portrait/landscape and resizing. Verify that rows wrap cleanly, the list scrolls, and countdowns continue without restarting. (UI Responsive)
  - [ ] **phone-small 360x800 — FAILED.** BUG-013 and/or BUG-011: overflow with a long name or after resizing to phone width.
  - [ ] **phone 390x844 — FAILED.** BUG-013 and/or BUG-011: overflow with a long name or after resizing to phone width.
  - [ ] **tablet-portrait 768x1024 — FAILED.** BUG-013 and/or BUG-011: overflow with a long name or after resizing to phone width.
  - [ ] **tablet-landscape 1024x768 — FAILED.** BUG-013 and/or BUG-011: overflow with a long name or after resizing to phone width.
  - [ ] **laptop 1366x768 — FAILED.** BUG-013 and/or BUG-011: overflow with a long name or after resizing to phone width.
  - [x] **desktop 1920x1080 — PASSED.**
  - [ ] **phone-landscape 844x390 — FAILED.** BUG-013 and/or BUG-011: overflow with a long name or after resizing to phone width.

## Admin setup and navigation

**User:** Admin / Owner. **Group:** `adminNavigation`.

### Good path (happy path)

- [x] **ADMIN-01:** Real Admin sign-in opens authenticated Home and shows Admin / Owner.
- [ ] **ADMIN-02 — PLANNED:** Dedicated sidebar navigation checks for Home, PCs, and Rentals, including correct route, heading, and selected navigation state.

### Bad path (error path)

No separate navigation cases are currently planned in this category.

### Edge case path

- [ ] **ADMIN-03 — PLANNED:** Consolidated authenticated refresh checks for all three routes in the standalone navigation suite. Individual refresh checks already exist in the Home and PCs test files.

## Known PCs issues

- [ ] **Registration feedback — validation PASSED / feedback FAILED:** Empty, whitespace-only, and duplicate names
  have no visible form error. Affects PCS-04/05: **3 failures**.
- [ ] **Repair with an active rental:** Faulty PCs become Free while their rental
  continues; expected working status is Rented. Affects PCS-06: **2 failures**.
- [ ] **Extension rejection feedback — validation PASSED / feedback FAILED:** The server rejects total booked time
  over 24 hours, but the picker closes without its error. Affects PCS-13: **1 failure**.
- [ ] **Transfer status:** Destination keeps its old Free/Issue label until
  refresh despite a successful move. Affects PCS-16: **4 failures**.

Reproduce a suspected issue again and check whether it comes from the website or the test.
Add it to the existing [automation bug report](../bug%20report/automatoin%20bug%20report.xlsx)
only after confirming it consistently reproduces. Update an existing entry instead of adding a duplicate.

See [PCs test results](pcs%20test%20results.md) for evidence and the identified causes.

## Confirmed responsive issues

- [ ] **BUG-011:** Fixed-width sidebar leaves Home, PCs, and Rentals too narrow on 360/390 px phone screens.
- [ ] **BUG-012:** A valid 50-character PC name extends outside its PC tile.
- [ ] **BUG-013:** The same long name makes the Rentals page wider than a 768 px tablet.
- [ ] **BUG-014:** A two-digit-hour countdown extends outside its PC tile at tablet widths.

Each issue failed in the full matrix and an independent recheck. The Excel report
has one new entry per issue, rather than one duplicate entry for each screen.
See [responsive results](responsive%20test%20results.md) for screenshots and measurements.

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
- **Responsive UI:** `npm run test:responsive` — starts/stops its own frontend; all
  API calls use prepared responses and no PHP/SQL connection is required.
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
npm run test:pcs -- --grep '@validation'
npm run test:pcs -- --grep '@feedback'
```

The same filter works with `test:home:live` and `test:home:flow`; their usual setup
requirements still apply. Multi-tag tests appear in both matching filters, so
filtered totals overlap. The six functional files contain 116 independently reported checks. The three responsive files add 63 cases
under their separate configuration; `npm run test:responsive -- --grep RESP-HOME-01` filters them.

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
- [Responsive report](../../artifacts/responsive-report/index.html) and [raw results](../../artifacts/responsive-results.json).
- [Responsive recheck](../../artifacts/responsive-recheck-results.json) — four independently repeated failures.
- [Latest Home results](../../artifacts/home-latest-results.json) — all 15 Home cases.
- [Latest PCs results](../../artifacts/pcs-latest-results.json) — all 101 independently reported PCs checks.
- [Automation bug report](../bug%20report/automatoin%20bug%20report.xlsx) — confirmed issues and their reproduction steps.

Cashier, complete login validation, Payments, Refunds, Revenue, Analytics, and
Accounts suites remain outside the current first scope; detailed cases are not yet planned.

Update this checklist when cases are added, rerun, fixed, or moved.
