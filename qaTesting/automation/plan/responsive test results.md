# Admin Responsive UI Test Results

**Date:** 2026-11-02 (Asia/Manila). **User:** Admin / Owner.
**Result:** 63 cases executed, **33 executed layout checks passed, 30 failed**, no skips.
**Scope:** The real React client in installed Chrome with prepared API responses.
Touch input was enabled for phone/tablet profiles. No shop database was read or changed.
The test frontend was stopped after execution.

## Results by screen

| Screen profile (CSS pixels) | Layout passed | Layout failed | Message layout partial (subset of passes) |
| --- | ---: | ---: | ---: |
| phone-small 360x800 | 0 | 9 | 0 |
| phone 390x844 | 0 | 9 | 0 |
| tablet-portrait 768x1024 | 6 | 3 | 1 |
| tablet-landscape 1024x768 | 6 | 3 | 1 |
| laptop 1366x768 | 7 | 2 | 1 |
| desktop 1920x1080 | 8 | 1 | 1 |
| phone-landscape 844x390 | 6 | 3 | 1 |

## Results by checklist group

| Checklist item | Layout passed | Layout failed |
| --- | ---: | ---: |
| RESP-HOME-01 | 5 | 2 |
| RESP-HOME-02 | 5 | 2 |
| RESP-HOME-03 | 4 | 3 |
| RESP-PCS-01 | 3 | 4 |
| RESP-PCS-02 | 5 | 2 |
| RESP-PCS-03 | 0 | 7 |
| RESP-RENT-01 | 5 | 2 |
| RESP-RENT-02 | 5 | 2 |
| RESP-RENT-03 | 1 | 6 |

Five passing RESP-PCS-02 cases carry **Feedback layout not verified** annotations:
the displayed data/duration errors and forms fit, but the registration message is
absent. Its layout is not claimed as passed. That missing message is a separate
functional feedback failure in BUG-001/002/003, not a geometry failure.
Changing the classification moved the raw responsive count from 28/35 to 33/30;
it did not fix any website issue. Phone and long-name failures still leave later
blocked steps unverified.

## Four consistently reproduced responsive issues

| Bug | Reproduction | Measurement and behavior | Cause in the current layout |
| --- | --- | --- | --- |
| BUG-011 | Open Home at 360 × 800, then repeat at 390 × 844. PCs/Rentals also reproduce phone overflow. | Home is 416 px wide in a 360 px viewport; the sidebar remains 240 px wide and the main content runs off the right edge. | Sidebar has a fixed width with no phone navigation/layout adaptation. |
| BUG-012 | Open PCs with a valid 50-character unbroken PC name at 1920 × 1080. | Tile content is 481 px wide inside a 387 px client width. The name extends into the neighboring area. | PC name text has no wrapping rule for long unbroken names. |
| BUG-013 | Open Rentals with an active rental on that long-name PC at 768 × 1024. | Document width becomes 787 px at a 768 px viewport. | The rental name's minimum content width enlarges the flex row/page. |
| BUG-014 | On PCs at 768 × 1024, show a 23 h 59 min booking with a two-digit-hour countdown. Repeat at 1024 × 768. | Tile content needs 241 px inside 227 px at 768; the timer projects outside the border. Transfer options are not the cause. | The large timer font/minimum width exceeds the narrow tile's available space. |

Each issue failed again in an independent four-case run using the same final test
data and expectations. [Recheck evidence](../../artifacts/responsive-recheck-results.json).
The original 10 Excel entries were preserved; BUG-011–014 add these four issues.

## Screenshots

- [BUG-011: phone page overflow](../../artifacts/responsive-evidence/BUG-011.png)
- [BUG-012: PC name outside its tile](../../artifacts/responsive-evidence/BUG-012.png)
- [BUG-013: long rental name on tablet](../../artifacts/responsive-evidence/BUG-013.png)
- [BUG-014: long timer outside its tile](../../artifacts/responsive-evidence/BUG-014.png)

## Coverage and limits

Checked page geometry, text clipping, sidebar navigation, error states, empty/large
data, Add PC and duration inputs, transfer panels, and resizing. Scenarios that hit
an earlier failure remain failed; downstream checks are not claimed as passed.
The 50-character name respects the SQL column limit. Known registration feedback
failures are kept separate from responsive layout measurements.

These are Chrome browser-emulation results. Physical-device keyboards, Safari,
Firefox, and actual iOS/Android rendering remain unverified. The Rentals responsive
folder is now implemented; its dedicated timing/business suite remains planned.
No application code was fixed during this test run.

The initial investigation corrected test setup before recording the final result:
long names were limited to 50 characters, rented PCs were given matching statuses,
screenshots wait for the startup overlay to disappear, and actual viewport images
are used. A directly owned Vite process ensures cleanup on Windows.

## Run again

From qaTesting/automation:

```powershell
$env:UI_BROWSER_CHANNEL = 'chrome'
npm run test:responsive
```

Use `-- --grep RESP-HOME-01` to run one group. The existing functional
configuration excludes responsive specs so its 116 checks remain a separate suite.

- [HTML report](../../artifacts/responsive-report/index.html)
- [Full results](../../artifacts/responsive-results.json)
- [Measurements and per-screen summary](../../artifacts/responsive-summary.json)
- [Excel bug report](../bug%20report/automatoin%20bug%20report.xlsx)
