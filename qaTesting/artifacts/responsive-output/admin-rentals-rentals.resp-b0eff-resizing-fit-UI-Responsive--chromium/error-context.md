# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin\rentals\rentals.responsive.spec.js >> laptop 1366x768 >> RESP-RENT-03: empty lists, long names, and resizing fit (UI Responsive)
- Location: tests\admin\rentals\rentals.responsive.spec.js:48:9

# Error details

```
Error: Rows must fit after resizing without restarting timers.

expect(received).toEqual(expected) // deep equality

- Expected  -  1
+ Received  + 17

- Array []
+ Array [
+   Object {
+     "clipped": Array [],
+     "container": Object {
+       "left": 240,
+       "right": 786.77,
+       "width": 546.77,
+     },
+     "containerClientWidth": 547,
+     "containerContentWidth": 547,
+     "documentWidth": 787,
+     "innerWidth": 768,
+     "phase": "Rentals after resize",
+     "sidebarWidth": 240,
+     "viewport": 768,
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
        - generic [ref=f1e27]:
          - heading "Active rentals" [level=2] [ref=f1e28]
          - paragraph [ref=f1e29]: Soonest ending first. The timer is the block display; the time used is what Phase 4 bills.
        - generic [ref=f1e30]:
          - generic [ref=f1e31]:
            - generic [ref=f1e32]:
              - paragraph [ref=f1e33]: RESP-ISSUE-01
              - paragraph [ref=f1e34]: Used 29:12
            - generic [ref=f1e35]:
              - generic [ref=f1e36]:
                - paragraph [ref=f1e37]: 0:48
                - generic [ref=f1e38]: 1 min left
              - paragraph [ref=f1e39]:
                - generic [ref=f1e40]: 30:00
                - generic [ref=f1e41]: block
          - generic [ref=f1e42]:
            - generic [ref=f1e43]:
              - paragraph [ref=f1e44]: RESP-PC-LONGNAMELONGNAMELONGNAMELONGNAMELONGNAMEXX
              - paragraph [ref=f1e45]: Used 83:20:02
            - generic [ref=f1e46]:
              - generic [ref=f1e47]:
                - paragraph [ref=f1e48]: 9:58
                - generic [ref=f1e49]: 10 min left
              - paragraph [ref=f1e50]:
                - generic [ref=f1e51]: 30:00
                - generic [ref=f1e52]: block
          - generic [ref=f1e53]:
            - generic [ref=f1e54]:
              - paragraph [ref=f1e55]: RESP-RENTED-01
              - paragraph [ref=f1e56]: Used 5:02
            - generic [ref=f1e57]:
              - paragraph [ref=f1e59]: 24:58
              - paragraph [ref=f1e60]:
                - generic [ref=f1e61]: 30:00
                - generic [ref=f1e62]: block
          - generic [ref=f1e63]:
            - generic [ref=f1e64]:
              - paragraph [ref=f1e65]: RESP-LIST-06
              - paragraph [ref=f1e66]: Used 5:02
            - generic [ref=f1e67]:
              - paragraph [ref=f1e69]: 24:58
              - paragraph [ref=f1e70]:
                - generic [ref=f1e71]: 30:00
                - generic [ref=f1e72]: block
          - generic [ref=f1e73]:
            - generic [ref=f1e74]:
              - paragraph [ref=f1e75]: RESP-LIST-07
              - paragraph [ref=f1e76]: Used 5:02
            - generic [ref=f1e77]:
              - paragraph [ref=f1e79]: 24:58
              - paragraph [ref=f1e80]:
                - generic [ref=f1e81]: 30:00
                - generic [ref=f1e82]: block
          - generic [ref=f1e83]:
            - generic [ref=f1e84]:
              - paragraph [ref=f1e85]: RESP-LIST-08
              - paragraph [ref=f1e86]: Used 5:02
            - generic [ref=f1e87]:
              - paragraph [ref=f1e89]: 24:58
              - paragraph [ref=f1e90]:
                - generic [ref=f1e91]: 30:00
                - generic [ref=f1e92]: block
          - generic [ref=f1e93]:
            - generic [ref=f1e94]:
              - paragraph [ref=f1e95]: RESP-LIST-09
              - paragraph [ref=f1e96]: Used 5:02
            - generic [ref=f1e97]:
              - paragraph [ref=f1e99]: 24:58
              - paragraph [ref=f1e100]:
                - generic [ref=f1e101]: 30:00
                - generic [ref=f1e102]: block
          - generic [ref=f1e103]:
            - generic [ref=f1e104]:
              - paragraph [ref=f1e105]: RESP-LIST-10
              - paragraph [ref=f1e106]: Used 5:02
            - generic [ref=f1e107]:
              - paragraph [ref=f1e109]: 24:58
              - paragraph [ref=f1e110]:
                - generic [ref=f1e111]: 30:00
                - generic [ref=f1e112]: block
          - generic [ref=f1e113]:
            - generic [ref=f1e114]:
              - paragraph [ref=f1e115]: RESP-LIST-11
              - paragraph [ref=f1e116]: Used 5:02
            - generic [ref=f1e117]:
              - paragraph [ref=f1e119]: 24:58
              - paragraph [ref=f1e120]:
                - generic [ref=f1e121]: 30:00
                - generic [ref=f1e122]: block
          - generic [ref=f1e123]:
            - generic [ref=f1e124]:
              - paragraph [ref=f1e125]: RESP-LIST-12
              - paragraph [ref=f1e126]: Used 5:02
            - generic [ref=f1e127]:
              - paragraph [ref=f1e129]: 24:58
              - paragraph [ref=f1e130]:
                - generic [ref=f1e131]: 30:00
                - generic [ref=f1e132]: block
          - generic [ref=f1e133]:
            - generic [ref=f1e134]:
              - paragraph [ref=f1e135]: RESP-LIST-13
              - paragraph [ref=f1e136]: Used 5:02
            - generic [ref=f1e137]:
              - paragraph [ref=f1e139]: 24:58
              - paragraph [ref=f1e140]:
                - generic [ref=f1e141]: 30:00
                - generic [ref=f1e142]: block
          - generic [ref=f1e143]:
            - generic [ref=f1e144]:
              - paragraph [ref=f1e145]: RESP-LIST-14
              - paragraph [ref=f1e146]: Used 5:02
            - generic [ref=f1e147]:
              - paragraph [ref=f1e149]: 24:58
              - paragraph [ref=f1e150]:
                - generic [ref=f1e151]: 30:00
                - generic [ref=f1e152]: block
          - generic [ref=f1e153]:
            - generic [ref=f1e154]:
              - paragraph [ref=f1e155]: RESP-LIST-15
              - paragraph [ref=f1e156]: Used 5:02
            - generic [ref=f1e157]:
              - paragraph [ref=f1e159]: 24:58
              - paragraph [ref=f1e160]:
                - generic [ref=f1e161]: 30:00
                - generic [ref=f1e162]: block
          - generic [ref=f1e163]:
            - generic [ref=f1e164]:
              - paragraph [ref=f1e165]: RESP-LIST-16
              - paragraph [ref=f1e166]: Used 5:02
            - generic [ref=f1e167]:
              - paragraph [ref=f1e169]: 24:58
              - paragraph [ref=f1e170]:
                - generic [ref=f1e171]: 30:00
                - generic [ref=f1e172]: block
          - generic [ref=f1e173]:
            - generic [ref=f1e174]:
              - paragraph [ref=f1e175]: RESP-LIST-17
              - paragraph [ref=f1e176]: Used 5:02
            - generic [ref=f1e177]:
              - paragraph [ref=f1e179]: 24:58
              - paragraph [ref=f1e180]:
                - generic [ref=f1e181]: 30:00
                - generic [ref=f1e182]: block
          - generic [ref=f1e183]:
            - generic [ref=f1e184]:
              - paragraph [ref=f1e185]: RESP-LIST-18
              - paragraph [ref=f1e186]: Used 5:02
            - generic [ref=f1e187]:
              - paragraph [ref=f1e189]: 24:58
              - paragraph [ref=f1e190]:
                - generic [ref=f1e191]: 30:00
                - generic [ref=f1e192]: block
          - generic [ref=f1e193]:
            - generic [ref=f1e194]:
              - paragraph [ref=f1e195]: RESP-LIST-19
              - paragraph [ref=f1e196]: Used 5:02
            - generic [ref=f1e197]:
              - paragraph [ref=f1e199]: 24:58
              - paragraph [ref=f1e200]:
                - generic [ref=f1e201]: 30:00
                - generic [ref=f1e202]: block
          - generic [ref=f1e203]:
            - generic [ref=f1e204]:
              - paragraph [ref=f1e205]: RESP-LIST-20
              - paragraph [ref=f1e206]: Used 5:02
            - generic [ref=f1e207]:
              - paragraph [ref=f1e209]: 24:58
              - paragraph [ref=f1e210]:
                - generic [ref=f1e211]: 30:00
                - generic [ref=f1e212]: block
          - generic [ref=f1e213]:
            - generic [ref=f1e214]:
              - paragraph [ref=f1e215]: RESP-LIST-21
              - paragraph [ref=f1e216]: Used 5:02
            - generic [ref=f1e217]:
              - paragraph [ref=f1e219]: 24:58
              - paragraph [ref=f1e220]:
                - generic [ref=f1e221]: 30:00
                - generic [ref=f1e222]: block
          - generic [ref=f1e223]:
            - generic [ref=f1e224]:
              - paragraph [ref=f1e225]: RESP-LIST-22
              - paragraph [ref=f1e226]: Used 5:02
            - generic [ref=f1e227]:
              - paragraph [ref=f1e229]: 24:58
              - paragraph [ref=f1e230]:
                - generic [ref=f1e231]: 30:00
                - generic [ref=f1e232]: block
          - generic [ref=f1e233]:
            - generic [ref=f1e234]:
              - paragraph [ref=f1e235]: RESP-LIST-23
              - paragraph [ref=f1e236]: Used 5:02
            - generic [ref=f1e237]:
              - paragraph [ref=f1e239]: 24:58
              - paragraph [ref=f1e240]:
                - generic [ref=f1e241]: 30:00
                - generic [ref=f1e242]: block
          - generic [ref=f1e243]:
            - generic [ref=f1e244]:
              - paragraph [ref=f1e245]: RESP-LIST-24
              - paragraph [ref=f1e246]: Used 5:02
            - generic [ref=f1e247]:
              - paragraph [ref=f1e249]: 24:58
              - paragraph [ref=f1e250]:
                - generic [ref=f1e251]: 30:00
                - generic [ref=f1e252]: block
          - generic [ref=f1e253]:
            - generic [ref=f1e254]:
              - paragraph [ref=f1e255]: RESP-LIST-25
              - paragraph [ref=f1e256]: Used 5:02
            - generic [ref=f1e257]:
              - paragraph [ref=f1e259]: 24:58
              - paragraph [ref=f1e260]:
                - generic [ref=f1e261]: 30:00
                - generic [ref=f1e262]: block
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
  41 |             expect(ui.failures, 'Rentals errors must fit the screen.').toEqual([]);
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
> 69 |             expect(ui.failures, 'Rows must fit after resizing without restarting timers.').toEqual([]);
     |                                                                                            ^ Error: Rows must fit after resizing without restarting timers.
  70 |         });
  71 |     });
  72 | }
  73 | 
```