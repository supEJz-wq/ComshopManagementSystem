# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin\home\home.responsive.spec.js >> phone 390x844 >> RESP-HOME-01: Home summary and navigation fit (UI Responsive)
- Location: tests\admin\home\home.responsive.spec.js:15:9

# Error details

```
Error: Home must fit the requested screen width.

expect(received).toEqual(expected) // deep equality

- Expected  -  1
+ Received  + 17

- Array []
+ Array [
+   Object {
+     "clipped": Array [],
+     "container": Object {
+       "left": 240,
+       "right": 394.38,
+       "width": 154.38,
+     },
+     "containerClientWidth": 154,
+     "containerContentWidth": 176,
+     "documentWidth": 417,
+     "innerWidth": 417,
+     "phase": "Home summary",
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
      - link "Home" [active] [ref=e9] [cursor=pointer]:
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
      - generic [ref=e27]:
        - generic [ref=e28]:
          - heading "Right now" [level=3] [ref=e29]
          - paragraph [ref=e30]: 4 computers · 2 active rentals
        - generic [ref=e31]:
          - generic [ref=e32]:
            - generic: Free
            - paragraph: "1"
          - generic [ref=e35]:
            - generic: Rented
            - paragraph: "1"
          - generic [ref=e38]:
            - generic: Issue
            - paragraph: "1"
          - generic [ref=e41]:
            - generic: Unresponsive
            - paragraph: "1"
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
> 24 |             expect(ui.failures, 'Home must fit the requested screen width.').toEqual([]);
     |                                                                              ^ Error: Home must fit the requested screen width.
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
  38 |             expect(ui.failures, 'Error messages must fit without horizontal scrolling.').toEqual([]);
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