# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin\home\home.responsive.spec.js >> phone-small 360x800 >> RESP-HOME-02: Home data errors fit (UI Responsive)
- Location: tests\admin\home\home.responsive.spec.js:30:9

# Error details

```
Error: Error messages must fit without horizontal scrolling.

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
+     "phase": "Home error /api/pcs",
+     "sidebarWidth": 240,
+     "viewport": 360,
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
+     "phase": "Home error /api/rentals/active",
+     "sidebarWidth": 240,
+     "viewport": 360,
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
  2  |  * homeAdmin — UI RESPONSIVE
  3  |  * Run: npm run test:responsive. Every case states its scenario and screen size.
  4  |  * Checks use the real React page and controlled API responses, with no DB writes.
  5  |  */
  6  | const {test, expect, screens} = require('../../../fixtures/responsive.fixture');
  7  | 
  8  | for (const screen of screens) {
  9  |     test.describe(`${screen.name} ${screen.width}x${screen.height}`, () => {
  10 |         test.use({viewport: {width: screen.width, height: screen.height}, hasTouch: screen.touch, isMobile: screen.touch});
  11 | 
  12 |         /* TYPE: Happy path / Edge case. WHAT: Fit Home and use navigation.
  13 |          * TEST DATA: Known inventory and rentals at this screen size.
  14 |          * EXPECTED: Summary/tiles fit; touch or mouse navigation reaches Home. */
  15 |         test('RESP-HOME-01: Home summary and navigation fit (UI Responsive)', {tag: ['@responsive', '@happy-path', '@edge-case']}, async ({page, ui}) => {
  16 |             await page.goto('/pcs');
  17 |             await ui.pcs.waitForReady();
  18 |             await ui.layout.navigate('Home');
  19 |             await ui.home.waitForReady();
  20 |             expect(await ui.home.readComputerTotal()).toBe(4);
  21 |             for (const tile of [ui.home.freeTile, ui.home.rentedTile, ui.home.issueTile, ui.home.unresponsiveTile]) await expect(tile).toBeVisible();
  22 |             await ui.audit('Home summary');
  23 |             await ui.control('Home navigation link', ui.layout.sidebar.getByRole('link', {name: 'Home', exact: true}));
  24 |             expect(ui.failures, 'Home must fit the requested screen width.').toEqual([]);
  25 |         });
  26 | 
  27 |         /* TYPE: Error path. WHAT: Fit required-data errors at each screen size.
  28 |          * TEST DATA: Failed PCs then failed rentals, with a full explanatory error.
  29 |          * EXPECTED: Error text is present, wraps, and stays inside the screen. */
  30 |         test('RESP-HOME-02: Home data errors fit (UI Responsive)', {tag: ['@responsive', '@error-path']}, async ({page, ui}) => {
  31 |             for (const endpoint of ['/api/pcs', '/api/rentals/active']) {
  32 |                 ui.failRead(endpoint);
  33 |                 await page.goto('/');
  34 |                 await expect(ui.layout.errorHeading).toBeVisible();
  35 |                 await expect(ui.layout.main.getByText(ui.errorText, {exact: true})).toBeVisible();
  36 |                 await ui.audit(`Home error ${endpoint}`);
  37 |             }
> 38 |             expect(ui.failures, 'Error messages must fit without horizontal scrolling.').toEqual([]);
     |                                                                                          ^ Error: Error messages must fit without horizontal scrolling.
  39 |         });
  40 | 
  41 |         /* TYPE: Edge case. WHAT: Resize empty and large Home counts.
  42 |          * TEST DATA: Zero PCs, then 4000 PCs with 1000 in each state.
  43 |          * EXPECTED: Tiles fit after orientation/size changes and counts persist. */
  44 |         test('RESP-HOME-03: empty and large counts survive resizing (UI Responsive)', {tag: ['@responsive', '@edge-case']}, async ({page, ui}) => {
  45 |             for (const mode of ['empty', 'large']) {
  46 |                 ui.setData(mode);
  47 |                 await page.goto('/');
  48 |                 await ui.home.waitForReady();
  49 |                 const total = mode === 'empty' ? 0 : 4000;
  50 |                 expect(await ui.home.readComputerTotal()).toBe(total);
  51 |                 await ui.audit(`Home ${mode} initial`);
  52 |                 await page.setViewportSize({width: screen.height, height: screen.width});
  53 |                 expect(await ui.home.readComputerTotal()).toBe(total);
  54 |                 await ui.audit(`Home ${mode} rotated`);
  55 |                 await page.setViewportSize({width: screen.width, height: screen.height});
  56 |             }
  57 |             expect(ui.failures, 'Home must reflow without resetting counts.').toEqual([]);
  58 |         });
  59 |     });
  60 | }
  61 | 
```