# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin\rentals\rentals.responsive.spec.js >> phone 390x844 >> RESP-RENT-02: Rentals errors fit (UI Responsive)
- Location: tests\admin\rentals\rentals.responsive.spec.js:33:9

# Error details

```
Error: Rentals errors must fit the screen.

expect(received).toEqual(expected) // deep equality

- Expected  -  1
+ Received  + 32

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
+     "phase": "Rentals error /api/pcs",
+     "sidebarWidth": 240,
+     "viewport": 390,
+   },
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
+     "phase": "Rentals error /api/rentals/active",
+     "sidebarWidth": 240,
+     "viewport": 390,
+   },
+ ]
```

# Page snapshot

```yaml
- generic [ref=f1e3]:
  - complementary [ref=f1e4]:
    - generic [ref=f1e5]:
      - paragraph [ref=f1e6]: CyberShopOS
      - paragraph [ref=f1e7]: Admin / Owner
    - navigation [ref=f1e8]:
      - link "Home" [ref=f1e9] [cursor=pointer]:
        - /url: /
      - link "PCs" [ref=f1e10] [cursor=pointer]:
        - /url: /pcs
      - link "Rentals" [ref=f1e11] [cursor=pointer]:
        - /url: /rentals
      - link "Payments" [ref=f1e12] [cursor=pointer]:
        - /url: /payments
      - link "Revenue" [ref=f1e13] [cursor=pointer]:
        - /url: /revenue
      - link "Analytics" [ref=f1e14] [cursor=pointer]:
        - /url: /analytics
      - link "Accounts" [ref=f1e15] [cursor=pointer]:
        - /url: /accounts
    - generic [ref=f1e16]:
      - paragraph [ref=f1e17]: responsive-admin
      - button "Sign out" [ref=f1e18]
  - generic [ref=f1e19]:
    - banner [ref=f1e20]:
      - paragraph [ref=f1e21]: Computer Shop Management System
      - generic [ref=f1e22]:
        - time [ref=f1e23]: 9:00 AM
        - generic [ref=f1e24]: Today
    - main [ref=f1e25]:
      - generic [ref=f1e26]:
        - heading "Could not load this screen" [level=2] [ref=f1e27]
        - paragraph [ref=f1e28]: The requested test data could not be loaded. Check the connection and try opening this page again.
        - paragraph [ref=f1e29]:
          - text: Is the API running?
          - code [ref=f1e30]: php -S localhost:8000 router.php
```

# Test source

```ts
  1  | /*
  2  |  * rentalsAdmin — UI RESPONSIVE ONLY
  3  |  * This starts the Rentals responsive coverage; the standalone timing/business
  4  |  * suite remains planned. Use controlled data and clock ticks for repeatable UI.
  5  |  */
  6  | const {test, expect, screens} = require('../../../fixtures/responsive.fixture');
  7  | 
  8  | for (const screen of screens) {
  9  |     test.describe(`${screen.name} ${screen.width}x${screen.height}`, () => {
  10 |         test.use({viewport: {width: screen.width, height: screen.height}, hasTouch: screen.touch, isMobile: screen.touch});
  11 | 
  12 |         /* TYPE: Happy path / Edge case. WHAT: Fit rows and navigate by touch/mouse.
  13 |          * TEST DATA: Two active rentals with names, Used time, countdown, and block.
  14 |          * EXPECTED: Every value remains readable and no horizontal page scroll is needed. */
  15 |         test('RESP-RENT-01: rental rows and navigation fit (UI Responsive)', {tag: ['@responsive', '@happy-path', '@edge-case']}, async ({page, ui}) => {
  16 |             await page.goto('/');
  17 |             await ui.home.waitForReady();
  18 |             await ui.layout.navigate('Rentals');
  19 |             await ui.rentals.waitForReady();
  20 |             expect(await ui.rentals.readRentalCount()).toBe(2);
  21 |             for (const name of ['RESP-RENTED-01', 'RESP-ISSUE-01']) {
  22 |                 const row = ui.rentals.rentalRow(name);
  23 |                 await expect(row.getByText(/^Used \d/)).toBeVisible();
  24 |                 await expect(row.getByText('block', {exact: true})).toBeVisible();
  25 |             }
  26 |             await ui.audit('Active rental list');
  27 |             expect(ui.failures, 'Rental names and timers must fit the screen.').toEqual([]);
  28 |         });
  29 | 
  30 |         /* TYPE: Error path. WHAT: Fit both required-data failure states.
  31 |          * TEST DATA: Failed PCs then failed rentals.
  32 |          * EXPECTED: Full error and recovery guidance remain readable at this size. */
  33 |         test('RESP-RENT-02: Rentals errors fit (UI Responsive)', {tag: ['@responsive', '@error-path']}, async ({page, ui}) => {
  34 |             for (const endpoint of ['/api/pcs', '/api/rentals/active']) {
  35 |                 ui.failRead(endpoint);
  36 |                 await page.goto('/rentals');
  37 |                 await expect(ui.layout.errorHeading).toBeVisible();
  38 |                 await expect(ui.layout.main.getByText(ui.errorText, {exact: true})).toBeVisible();
  39 |                 await ui.audit(`Rentals error ${endpoint}`);
  40 |             }
> 41 |             expect(ui.failures, 'Rentals errors must fit the screen.').toEqual([]);
     |                                                                        ^ Error: Rentals errors must fit the screen.
  42 |         });
  43 | 
  44 |         /* TYPE: Edge case. WHAT: Fit empty/long lists and keep clocks running.
  45 |          * TEST DATA: Empty rentals, then 23 rentals, long names and warning/elapsed values.
  46 |          * EXPECTED: Rows fit, the final row is reachable, resizing keeps rows, and
  47 |          * a controlled two-second tick decreases the same displayed countdown. */
  48 |         test('RESP-RENT-03: empty lists, long names, and resizing fit (UI Responsive)', {tag: ['@responsive', '@edge-case']}, async ({page, ui}) => {
  49 |             ui.setData('empty');
  50 |             await page.goto('/rentals');
  51 |             await ui.rentals.waitForReady();
  52 |             await expect(ui.rentals.emptyMessage).toBeVisible();
  53 |             await ui.audit('Empty Rentals');
  54 |             ui.setData('long');
  55 |             await page.reload();
  56 |             await ui.rentals.waitForReady();
  57 |             expect(await ui.rentals.readRentalCount()).toBe(23);
  58 |             await expect(ui.layout.main.getByText('1 min left', {exact: true})).toBeVisible();
  59 |             const row = ui.rentals.rentalRow(ui.longName);
  60 |             await ui.audit('Long rental name and Used time', row);
  61 |             await ui.rentals.rows.last().scrollIntoViewIfNeeded();
  62 |             const timer = ui.rentals.rentalRow('RESP-RENTED-01').locator('p.leading-none');
  63 |             const before = await timer.innerText();
  64 |             await page.setViewportSize({width: screen.height, height: screen.width});
  65 |             expect(await ui.rentals.readRentalCount()).toBe(23);
  66 |             await page.clock.runFor(2000);
  67 |             await expect(timer).not.toHaveText(before);
  68 |             await ui.audit('Rentals after resize');
  69 |             expect(ui.failures, 'Rows must fit after resizing without restarting timers.').toEqual([]);
  70 |         });
  71 |     });
  72 | }
  73 | 
```