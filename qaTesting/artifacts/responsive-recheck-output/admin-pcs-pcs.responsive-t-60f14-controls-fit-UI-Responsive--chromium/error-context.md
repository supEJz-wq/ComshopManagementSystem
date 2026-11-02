# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin\pcs\pcs.responsive.spec.js >> tablet-portrait 768x1024 >> RESP-PCS-01: board, registration, duration, and transfer controls fit (UI Responsive)
- Location: tests\admin\pcs\pcs.responsive.spec.js:15:9

# Error details

```
Error: PC controls must fit and be usable without horizontal scrolling.

expect(received).toEqual(expected) // deep equality

- Expected  -  1
+ Received  + 32

- Array []
+ Array [
+   Object {
+     "clipped": Array [],
+     "container": Object {
+       "left": 264,
+       "right": 496,
+       "width": 232,
+     },
+     "containerClientWidth": 227,
+     "containerContentWidth": 241,
+     "documentWidth": 768,
+     "innerWidth": 768,
+     "phase": "Long rental timer tile",
+     "sidebarWidth": 240,
+     "viewport": 768,
+   },
+   Object {
+     "clipped": Array [],
+     "container": Object {
+       "left": 264,
+       "right": 496,
+       "width": 232,
+     },
+     "containerClientWidth": 227,
+     "containerContentWidth": 241,
+     "documentWidth": 768,
+     "innerWidth": 768,
+     "phase": "Transfer destinations",
+     "sidebarWidth": 240,
+     "viewport": 768,
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
        - generic [ref=e27]:
          - generic [ref=e28]:
            - heading "PCs" [level=2] [ref=e29]
            - paragraph [ref=e30]: 4 computers. Names cannot be changed or removed once added.
          - button "Add PC" [ref=e32]
        - generic [ref=e33]:
          - generic [ref=e34]: Free
          - generic [ref=e38]: Rented
          - generic [ref=e42]: Issue
          - generic [ref=e46]: Unresponsive
        - generic [ref=e50]:
          - generic [ref=e51]:
            - generic [ref=e52]: RESP-FREE-01
            - generic [ref=e53]: Free
            - generic [ref=e59]:
              - button "Start rental" [ref=e60]
              - button "Mark issue" [ref=e61]
              - button "Mark unresponsive" [ref=e62]
          - generic [ref=e63]:
            - generic [ref=e64]: RESP-RENTED-01
            - generic [ref=e65]: Rented
            - generic [ref=e71]:
              - paragraph [ref=e73]: 24:59
              - paragraph [ref=e74]:
                - generic [ref=e75]: 30:00
                - generic [ref=e76]: block
            - generic [ref=e77]:
              - button "Stop rental" [ref=e78]
              - button "Extend" [ref=e79]
              - button "Mark issue" [ref=e80]
              - button "Mark unresponsive" [ref=e81]
          - generic [ref=e82]:
            - generic [ref=e83]: RESP-ISSUE-01
            - generic [ref=e84]: Issue
            - generic [ref=e90]:
              - paragraph [ref=e92]: 23:53:59
              - paragraph [ref=e93]:
                - generic [ref=e94]: 23:59:00
                - generic [ref=e95]: block
            - generic [ref=e96]:
              - button "Stop rental" [ref=e97]
              - button "Extend" [ref=e98]
              - button "Transfer" [ref=e99]
              - button "Resolve" [ref=e100]
              - button "Mark unresponsive" [ref=e101]
          - generic [ref=e102]:
            - generic [ref=e103]: RESP-OFFLINE-01
            - generic [ref=e104]: Unresponsive
            - button "Repair" [ref=e111]
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
> 48  |             expect(ui.failures, 'PC controls must fit and be usable without horizontal scrolling.').toEqual([]);
      |                                                                                                     ^ Error: PC controls must fit and be usable without horizontal scrolling.
  49  |         });
  50  | 
  51  |         /* TYPE: Error path. WHAT: Fit data/validation errors and recovery controls.
  52  |          * TEST DATA: Failed inventory, zero duration, empty/duplicate PC names.
  53  |          * EXPECTED: Visible errors fit; missing known registration feedback is
  54  |          * recorded as an existing functional issue, not a new responsive defect. */
  55  |         test('RESP-PCS-02: PC data and form errors fit (UI Responsive)', {tag: ['@responsive', '@error-path']}, async ({page, ui}) => {
  56  |             ui.failRead('/api/pcs');
  57  |             await page.goto('/pcs');
  58  |             await expect(ui.layout.errorHeading).toBeVisible();
  59  |             await ui.audit('PC data error');
  60  |             if (screen.width < 500 && ui.failures.length) expect(ui.failures, 'PC error screen overflows; phone form checks remain unverified.').toEqual([]);
  61  |             ui.failRead('');
  62  |             await page.reload();
  63  |             await ui.pcs.waitForReady();
  64  |             for (const [name, mode] of [['RESP-FREE-01', 'start'], ['RESP-RENTED-01', 'extend']]) {
  65  |                 const tile = ui.pcs.pcTile(name);
  66  |                 await ui.layout.activate(tile.getByRole('button', {name: mode === 'start' ? 'Start rental' : 'Extend', exact: true}));
  67  |                 await ui.pcs.fillDuration(name, mode, {hours: 0, minutes: 0, seconds: 0});
  68  |                 await ui.layout.activate(tile.getByRole('button', {name: mode === 'start' ? 'Start' : 'Add', exact: true}));
  69  |                 await expect(tile.getByRole('alert')).toBeVisible();
  70  |                 await ui.audit(`${mode} invalid duration error`, tile);
  71  |                 await ui.layout.activate(tile.getByRole('button', {name: 'Cancel', exact: true}));
  72  |             }
  73  |             for (const name of ['', '   ', 'RESP-FREE-01']) {
  74  |                 await ui.pcs.openAddPc();
  75  |                 await ui.pcs.fillPcName(name);
  76  |                 const response = name.trim() ? page.waitForResponse(r => r.request().method() === 'POST' && new URL(r.url()).pathname === '/api/pcs') : null;
  77  |                 await ui.layout.activate(ui.pcs.submitAddPc);
  78  |                 if (response) expect((await response).status()).toBe(400);
  79  |                 // A missing message cannot be measured for responsive wrapping.
  80  |                 // This is already tracked by BUG-001/002/003 in the Excel report.
  81  |                 try { await ui.pcs.addPcError.waitFor({state: 'visible', timeout: 1000}); }
  82  |                 catch { ui.missing(`Registration feedback absent for ${name === '' ? 'empty' : name.trim() ? 'duplicate' : 'spaces-only'} name (existing BUG-001/002/003)`); }
  83  |                 await ui.audit('Registration validation form', ui.pcs.addPcForm);
  84  |                 await ui.pcs.cancelPcRegistration();
  85  |             }
  86  |             expect(ui.failures, 'Errors must be displayed and fit the screen.').toEqual([]);
  87  |         });
  88  | 
  89  |         /* TYPE: Edge case. WHAT: Fit long names/lists and preserve open editors.
  90  |          * TEST DATA: 40 PCs, a valid 50-character name, and many transfer targets.
  91  |          * EXPECTED: Names fit their tiles, vertical scrolling reaches the final
  92  |          * target/cancel, resizing preserves entered values, and no writes occur.
  93  |          * Native phone keyboard coverage remains manual, not simulated here. */
  94  |         test('RESP-PCS-03: long names, long transfers, and resize fit (UI Responsive)', {tag: ['@responsive', '@edge-case']}, async ({page, ui}) => {
  95  |             ui.setData('long');
  96  |             await page.goto('/pcs');
  97  |             await ui.pcs.waitForReady();
  98  |             await ui.audit('Long PC name', ui.pcs.pcTile(ui.longName));
  99  |             await ui.pcs.openTransfer('RESP-ISSUE-01');
  100 |             expect(await ui.pcs.transferTargets.count()).toBeGreaterThan(10);
  101 |             await ui.audit('Long transfer destination list', ui.pcs.pcTile('RESP-ISSUE-01'));
  102 |             // Preserve the measured failure instead of forcing a touch outside
  103 |             // the device viewport and pretending the remaining resize steps ran.
  104 |             if (ui.failures.length) expect(ui.failures, 'Long names/list overflow; later resize steps are not verified.').toEqual([]);
  105 |             await ui.control('Last transfer target', ui.pcs.transferTargets.last());
  106 |             await ui.control('Transfer cancel', ui.pcs.pcTile('RESP-ISSUE-01').getByRole('button', {name: 'Cancel', exact: true}));
  107 |             await ui.pcs.cancelRentalPicker('RESP-ISSUE-01');
  108 |             await ui.pcs.openStartPicker('RESP-FREE-01');
  109 |             await ui.pcs.fillDuration('RESP-FREE-01', 'start', {minutes: 2});
  110 |             await page.setViewportSize({width: screen.height, height: screen.width});
  111 |             await expect(ui.pcs.durationField('RESP-FREE-01', 'start', 'minutes')).toHaveValue('2');
  112 |             await ui.audit('Open picker after resize', ui.pcs.pcTile('RESP-FREE-01'));
  113 |             expect(ui.writes).toEqual([]);
  114 |             expect(ui.failures, 'Long content must remain inside its tile and screen.').toEqual([]);
  115 |         });
  116 |     });
  117 | }
  118 | 
```