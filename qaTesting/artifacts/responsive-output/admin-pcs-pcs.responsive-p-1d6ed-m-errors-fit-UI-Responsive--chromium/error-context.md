# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin\pcs\pcs.responsive.spec.js >> phone 390x844 >> RESP-PCS-02: PC data and form errors fit (UI Responsive)
- Location: tests\admin\pcs\pcs.responsive.spec.js:56:9

# Error details

```
Error: PC error screen overflows; phone form checks remain unverified.

expect(received).toEqual(expected) // deep equality

- Expected  -  1
+ Received  + 17

- Array []
+ Array [
+   Object {
+     "clipped": Array [],
+     "container": Object {
+       "left": 240,
+       "right": 436.44,
+       "width": 196.44,
+     },
+     "containerClientWidth": 196,
+     "containerContentWidth": 196,
+     "documentWidth": 436,
+     "innerWidth": 436,
+     "phase": "PC data error",
+     "sidebarWidth": 240,
+     "viewport": 390,
+   },
+ ]
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - complementary [ref=e4]:
    - generic [ref=e5]:
      - paragraph [ref=e6]: CyberShopOS
      - paragraph [ref=e7]: Admin / Owner
    - navigation [ref=e8]:
      - link "Home" [ref=e9] [cursor=pointer]:
        - /url: /
      - link "PCs" [ref=e10] [cursor=pointer]:
        - /url: /pcs
      - link "Rentals" [ref=e11] [cursor=pointer]:
        - /url: /rentals
      - link "Payments" [ref=e12] [cursor=pointer]:
        - /url: /payments
      - link "Revenue" [ref=e13] [cursor=pointer]:
        - /url: /revenue
      - link "Analytics" [ref=e14] [cursor=pointer]:
        - /url: /analytics
      - link "Accounts" [ref=e15] [cursor=pointer]:
        - /url: /accounts
    - generic [ref=e16]:
      - paragraph [ref=e17]: responsive-admin
      - button "Sign out" [ref=e18]
  - generic [ref=e19]:
    - banner [ref=e20]:
      - paragraph [ref=e21]: Computer Shop Management System
      - generic [ref=e22]:
        - time [ref=e23]: 9:00 AM
        - generic [ref=e24]: Today
    - main [ref=e25]:
      - generic [ref=e26]:
        - heading "Could not load this screen" [level=2] [ref=e27]
        - paragraph [ref=e28]: The requested test data could not be loaded. Check the connection and try opening this page again.
        - paragraph [ref=e29]:
          - text: Is the API running?
          - code [ref=e30]: php -S localhost:8000 router.php
```

# Test source

```ts
  1   | /*
  2   |  * pcsAdmin — UI RESPONSIVE
  3   |  * Readiness/actions reuse the PCs POM. Geometry/evidence use the responsive POM.
  4   |  * The test data intercepts every API request; opening/cancelling cannot write to SQL.
  5   |  */
  6   | const {test, expect, screens} = require('../../../fixtures/responsive.fixture');
  7   | 
  8   | for (const screen of screens) {
  9   |     test.describe(`${screen.name} ${screen.width}x${screen.height}`, () => {
  10  |         test.use({viewport: {width: screen.width, height: screen.height}, hasTouch: screen.touch, isMobile: screen.touch});
  11  | 
  12  |         /* TYPE: Happy path / Edge case. WHAT: Fit board and each editor.
  13  |          * TEST DATA: Free/rented/faulty PCs, duration inputs, and transfer targets.
  14  |          * EXPECTED: Controls fit and can be reached; opening/cancelling causes no writes. */
  15  |         test('RESP-PCS-01: board, registration, duration, and transfer controls fit (UI Responsive)', {tag: ['@responsive', '@happy-path', '@edge-case']}, async ({page, ui}) => {
  16  |             await page.goto('/');
  17  |             await ui.home.waitForReady();
  18  |             await ui.layout.navigate('PCs');
  19  |             await ui.pcs.waitForReady();
  20  |             await ui.audit('PC board');
  21  |             // The longest valid booking can overflow its own tile even when
  22  |             // the outer page still fits. Measure the timer tile independently.
  23  |             await ui.audit('Long rental timer tile', ui.pcs.pcTile('RESP-ISSUE-01'));
  24  |             // A phone already overflowing cannot establish usable touch editors.
  25  |             // Keep this failed; leave later controls unverified at this size.
  26  |             if (screen.width < 500 && ui.failures.length) expect(ui.failures, 'PC board overflows before form interaction; later controls are not verified.').toEqual([]);
  27  |             await ui.layout.activate(ui.pcs.addpc);
  28  |             await ui.pcs.fillPcName('RESP-DRAFT');
  29  |             await ui.audit('Add PC form', ui.pcs.addPcForm);
  30  |             await ui.control('Add PC input', ui.pcs.pcName);
  31  |             await ui.control('Add PC submit', ui.pcs.submitAddPc);
  32  |             await ui.layout.activate(ui.pcs.cancelAddPc);
  33  |             for (const [name, mode] of [['RESP-FREE-01', 'start'], ['RESP-RENTED-01', 'extend']]) {
  34  |                 const tile = ui.pcs.pcTile(name);
  35  |                 await ui.layout.activate(tile.getByRole('button', {name: mode === 'start' ? 'Start rental' : 'Extend', exact: true}));
  36  |                 await ui.pcs.fillDuration(name, mode, {hours: 1, minutes: 2, seconds: 3});
  37  |                 await ui.audit(`${mode} picker`, tile);
  38  |                 for (const part of ['hours', 'minutes', 'seconds']) await ui.control(`${mode} ${part}`, ui.pcs.durationField(name, mode, part));
  39  |                 await ui.control(`${mode} confirmation`, tile.getByRole('button', {name: mode === 'start' ? 'Start' : 'Add', exact: true}));
  40  |                 await ui.layout.activate(tile.getByRole('button', {name: 'Cancel', exact: true}));
  41  |             }
  42  |             await ui.layout.activate(ui.pcs.pcTile('RESP-ISSUE-01').getByRole('button', {name: 'Transfer', exact: true}));
  43  |             await expect(ui.pcs.transferTargets).toHaveCount(1);
  44  |             await ui.audit('Transfer destinations', ui.pcs.pcTile('RESP-ISSUE-01'));
  45  |             await ui.control('Transfer destination', ui.pcs.transferTargets.first());
  46  |             await ui.layout.activate(ui.pcs.pcTile('RESP-ISSUE-01').getByRole('button', {name: 'Cancel', exact: true}));
  47  |             expect(ui.writes).toEqual([]);
  48  |             expect(ui.failures, 'PC controls must fit and be usable without horizontal scrolling.').toEqual([]);
  49  |         });
  50  | 
  51  |         /* TYPE: Error path. WHAT: Fit data/validation errors and recovery controls.
  52  |          * TEST DATA: Failed inventory, zero duration, empty/duplicate PC names.
  53  |          * EXPECTED: Present errors fit. Missing registration feedback is annotated
  54  |          * as unverified message-layout coverage, separately from layout failures.
  55  |          * The real backend suite owns rejection and feedback PASS/FAIL results. */
  56  |         test('RESP-PCS-02: PC data and form errors fit (UI Responsive)', {tag: ['@responsive', '@error-path']}, async ({page, ui}) => {
  57  |             ui.failRead('/api/pcs');
  58  |             await page.goto('/pcs');
  59  |             await expect(ui.layout.errorHeading).toBeVisible();
  60  |             await ui.audit('PC data error');
> 61  |             if (screen.width < 500 && ui.failures.length) expect(ui.failures, 'PC error screen overflows; phone form checks remain unverified.').toEqual([]);
      |                                                                                                                                                  ^ Error: PC error screen overflows; phone form checks remain unverified.
  62  |             ui.failRead('');
  63  |             await page.reload();
  64  |             await ui.pcs.waitForReady();
  65  |             for (const [name, mode] of [['RESP-FREE-01', 'start'], ['RESP-RENTED-01', 'extend']]) {
  66  |                 const tile = ui.pcs.pcTile(name);
  67  |                 await ui.layout.activate(tile.getByRole('button', {name: mode === 'start' ? 'Start rental' : 'Extend', exact: true}));
  68  |                 await ui.pcs.fillDuration(name, mode, {hours: 0, minutes: 0, seconds: 0});
  69  |                 await ui.layout.activate(tile.getByRole('button', {name: mode === 'start' ? 'Start' : 'Add', exact: true}));
  70  |                 await expect(tile.getByRole('alert')).toBeVisible();
  71  |                 await ui.audit(`${mode} invalid duration error`, tile);
  72  |                 await ui.layout.activate(tile.getByRole('button', {name: 'Cancel', exact: true}));
  73  |             }
  74  |             for (const name of ['', '   ', 'RESP-FREE-01']) {
  75  |                 await ui.pcs.openAddPc();
  76  |                 await ui.pcs.fillPcName(name);
  77  |                 const response = name.trim() ? page.waitForResponse(r => r.request().method() === 'POST' && new URL(r.url()).pathname === '/api/pcs') : null;
  78  |                 await ui.layout.activate(ui.pcs.submitAddPc);
  79  |                 if (response) expect((await response).status()).toBe(400);
  80  |                 // A missing message cannot be measured for responsive wrapping.
  81  |                 // This is already tracked by BUG-001/002/003 in the Excel report.
  82  |                 try { await ui.pcs.addPcError.waitFor({state: 'visible', timeout: 1000}); }
  83  |                 catch { ui.missing(`Registration feedback absent for ${name === '' ? 'empty' : name.trim() ? 'duplicate' : 'spaces-only'} name (existing BUG-001/002/003)`); }
  84  |                 await ui.audit('Registration validation form', ui.pcs.addPcForm);
  85  |                 await ui.pcs.cancelPcRegistration();
  86  |             }
  87  |             expect(ui.failures, 'The displayed errors and forms must fit the screen; absent-message layout is annotated separately.').toEqual([]);
  88  |         });
  89  | 
  90  |         /* TYPE: Edge case. WHAT: Fit long names/lists and preserve open editors.
  91  |          * TEST DATA: 40 PCs, a valid 50-character name, and many transfer targets.
  92  |          * EXPECTED: Names fit their tiles, vertical scrolling reaches the final
  93  |          * target/cancel, resizing preserves entered values, and no writes occur.
  94  |          * Native phone keyboard coverage remains manual, not simulated here. */
  95  |         test('RESP-PCS-03: long names, long transfers, and resize fit (UI Responsive)', {tag: ['@responsive', '@edge-case']}, async ({page, ui}) => {
  96  |             ui.setData('long');
  97  |             await page.goto('/pcs');
  98  |             await ui.pcs.waitForReady();
  99  |             await ui.audit('Long PC name', ui.pcs.pcTile(ui.longName));
  100 |             await ui.pcs.openTransfer('RESP-ISSUE-01');
  101 |             expect(await ui.pcs.transferTargets.count()).toBeGreaterThan(10);
  102 |             await ui.audit('Long transfer destination list', ui.pcs.pcTile('RESP-ISSUE-01'));
  103 |             // Preserve the measured failure instead of forcing a touch outside
  104 |             // the device viewport and pretending the remaining resize steps ran.
  105 |             if (ui.failures.length) expect(ui.failures, 'Long names/list overflow; later resize steps are not verified.').toEqual([]);
  106 |             await ui.control('Last transfer target', ui.pcs.transferTargets.last());
  107 |             await ui.control('Transfer cancel', ui.pcs.pcTile('RESP-ISSUE-01').getByRole('button', {name: 'Cancel', exact: true}));
  108 |             await ui.pcs.cancelRentalPicker('RESP-ISSUE-01');
  109 |             await ui.pcs.openStartPicker('RESP-FREE-01');
  110 |             await ui.pcs.fillDuration('RESP-FREE-01', 'start', {minutes: 2});
  111 |             await page.setViewportSize({width: screen.height, height: screen.width});
  112 |             await expect(ui.pcs.durationField('RESP-FREE-01', 'start', 'minutes')).toHaveValue('2');
  113 |             await ui.audit('Open picker after resize', ui.pcs.pcTile('RESP-FREE-01'));
  114 |             expect(ui.writes).toEqual([]);
  115 |             expect(ui.failures, 'Long content must remain inside its tile and screen.').toEqual([]);
  116 |         });
  117 |     });
  118 | }
  119 | 
```