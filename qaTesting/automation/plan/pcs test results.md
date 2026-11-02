# Admin PCs Test Results

**User:** Admin / Owner (`pcsAdmin`)  
**Result:** 101 checks executed, 91 passed, 10 failed, 0 skipped.
**Environment:** Chromium using installed Chrome, Asia/Manila browser time zone,
real PHP API and a new disposable SQL Server database.

Each test starts from a reset ten-PC dataset. The test database and temporary
servers were cleaned up after execution. The working shop database was not used
for test mutations. Existing Home workflow compatibility: **3 tests passed**.

## Validation and feedback outcomes

| Check type | Passed | Failed |
| --- | ---: | ---: |
| Invalid-input rejection / saved-state validation | 20 | 0 |
| Error-message feedback | 16 | 4 |
| Remaining board, workflow, state, and data-error checks | 55 | 6 |

Rejecting invalid input is a successful validation result. The four feedback
failures mean missing explanations, not accepted invalid inputs. BUG-001–003 and
BUG-006 remain open for feedback. Correct acceptance/rejection at edge boundaries
is also a passing result. All previous expectations remain checked independently.
The count increased from 81 to 101 because 20 scenarios now have two separate results.

## Four application issues to review

| Issue | Failing cases | What happened | Cause found in current code |
| --- | --- | --- | --- |
| Registration feedback is missing | PCS-04 (2), PCS-05 (1) | Empty/whitespace/duplicate names do not produce the visible form error. No duplicate PC was created. | `client/src/pages/PCs.jsx`: AddPcForm reads the Promise returned by onAdd without awaiting it, so result.error is unavailable. |
| Repair shows a busy PC as Free | PCS-06 (2) | Repair/Resolve leaves the same active rental running but changes the PC from Issue/Unresponsive to Free. Expected working status is Rented. | `server/api/pcs/repair.php`: fault states are always assigned free without checking for an active rental. |
| Rejected extension has no visible feedback | PCS-13 (1) | Extending 23h 59m by 2 minutes is correctly rejected and saved data stays unchanged, but the picker closes without the error. | `client/src/components/PcTile.jsx`: extension callbacks do not await or display the asynchronous failure returned by the provider. |
| Transfer destination status stays stale | PCS-16 (4) | Rental ID, timestamps, segments, charges, and carried time are preserved; destination still displays its old Free/Issue status until refresh. | `client/src/context/RentalProvider.jsx`: transfer refreshes rentals but does not refresh the shared PC list. |

Application fixes remain pending. Validation checkboxes are checked when rejection passes;
missing-message feedback checkboxes remain unchecked. Repair/transfer state failures also remain active.

## Results by checklist item

| Checklist item | Passed | Failed | Result |
| --- | ---: | ---: | --- |
| PCS-01 | 1 | 0 | Passed |
| PCS-02 | 1 | 0 | Passed |
| PCS-03 | 1 | 0 | Passed |
| PCS-04 | 2 | 2 | Feedback issue |
| PCS-05 | 1 | 1 | Feedback issue |
| PCS-06 | 4 | 2 | State issue |
| PCS-07 | 8 | 0 | Passed |
| PCS-08 | 6 | 0 | Passed |
| PCS-09 | 3 | 0 | Passed |
| PCS-10 | 16 | 0 | Passed |
| PCS-11 | 2 | 0 | Passed |
| PCS-12 | 7 | 0 | Passed |
| PCS-13 | 18 | 1 | Feedback issue |
| PCS-14 | 2 | 0 | Passed |
| PCS-18 | 3 | 0 | Passed |
| PCS-15 | 2 | 0 | Passed |
| PCS-16 | 0 | 4 | State issue |
| PCS-17 | 2 | 0 | Passed |
| PCS-19 | 3 | 0 | Passed |
| PCS-20 | 1 | 0 | Passed |
| Loading | 4 | 0 | Passed |
| Errors | 4 | 0 | Passed |

PCS-04/05 now show passing rejection checks next to failing feedback checks.
PCS-10 has eight passing validation and eight passing feedback checks.
PCS-13 has nine passing rejection checks, eight passing feedback checks, one
passing exact-cap acceptance, and one failed cap-feedback check.

## Test organization

- `tests/admin/pcs/pcs.registration-status.spec.js`: board, Add PC, status, repair, and buttons.
- `tests/admin/pcs/pcs.rentals.spec.js`: presets, custom inputs, invalid inputs, cancel, extend, and stop.
- `tests/admin/pcs/pcs.transfers-page-states.spec.js`: transfer targets/moves, notifications, refresh, loading, and failures.
- `tests/admin/pcs/pcs.data.js`: readable shared input cases.

Every test has WHAT / TEST DATA / EXPECTED comments. The initial test run exposed
two test issues that were corrected before this final run: real tile selection
now excludes skeleton placeholders, and extension countdown checks wait for the
next display tick using polling rather than a fixed sleep.

## Run again

From `qaTesting/automation`, set `UI_BROWSER_CHANNEL=chrome` and run:

```powershell
npm run test:pcs
```

Set `PHP_BIN` to your installed `php.exe` if PHP is not on PATH. The runner also
needs SQL Server create/drop permission, the existing root connection settings,
and `database/schema.sql`. It generates its own Admin account.

Machine-readable evidence: [final Playwright results](../../artifacts/pcs-latest-results.json).

Filter outcomes with `npm run test:pcs -- --grep @validation` or `--grep @feedback`.
