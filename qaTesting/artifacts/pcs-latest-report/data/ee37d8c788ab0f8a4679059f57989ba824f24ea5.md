# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin\pcs\pcs.transfers-page-states.spec.js >> pcsAdmin — 6. Transfers >> PCS-16: transfers PCS-UNRESPONSIVE-RENTED to PCS-ISSUE-IDLE without resetting time or charges [Happy path / Edge case]
- Location: tests\admin\pcs\pcs.transfers-page-states.spec.js:37:13

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "Rented"
Received: "Issue"
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
      - paragraph [ref=e17]: home-test-admin
      - button "Sign out" [ref=e18]
  - generic [ref=e19]:
    - banner [ref=e20]:
      - paragraph [ref=e21]: Computer Shop Management System
      - generic [ref=e22]:
        - time [ref=e23]: 7:30 PM
        - generic [ref=e24]: Today
    - main [ref=e25]:
      - generic [ref=e26]:
        - generic [ref=e27]:
          - generic [ref=e28]:
            - heading "PCs" [level=2] [ref=e29]
            - paragraph [ref=e30]: 10 computers. Names cannot be changed or removed once added.
          - button "Add PC" [ref=e32]
        - generic [ref=e33]:
          - generic [ref=e34]: Free
          - generic [ref=e38]: Rented
          - generic [ref=e42]: Issue
          - generic [ref=e46]: Unresponsive
        - generic [ref=e50]:
          - generic [ref=e51]:
            - generic [ref=e52]: PCS-CAP-RENTED
            - generic [ref=e53]: Rented
            - generic [ref=e59]:
              - paragraph [ref=e61]: 23:59:00
              - paragraph [ref=e62]:
                - generic [ref=e63]: 23:59:00
                - generic [ref=e64]: block
            - generic [ref=e65]:
              - button "Stop rental" [ref=e66]
              - button "Extend" [ref=e67]
              - button "Mark issue" [ref=e68]
              - button "Mark unresponsive" [ref=e69]
          - generic [ref=e70]:
            - generic [ref=e71]: PCS-FREE-01
            - generic [ref=e72]: Free
            - generic [ref=e78]:
              - button "Start rental" [ref=e79]
              - button "Mark issue" [ref=e80]
              - button "Mark unresponsive" [ref=e81]
          - generic [ref=e82]:
            - generic [ref=e83]: PCS-FREE-010
            - generic [ref=e84]: Free
            - generic [ref=e90]:
              - button "Start rental" [ref=e91]
              - button "Mark issue" [ref=e92]
              - button "Mark unresponsive" [ref=e93]
          - generic [ref=e94]:
            - generic [ref=e95]: PCS-FREE-REPAIR
            - generic [ref=e96]:
              - generic [ref=e97]: Free
              - generic [ref=e102]: needs repair
            - generic [ref=e103]:
              - button "Start rental" [ref=e104]
              - button "Repair" [ref=e105]
              - button "Mark issue" [ref=e106]
              - button "Mark unresponsive" [ref=e107]
          - generic [ref=e108]:
            - generic [ref=e109]: PCS-ISSUE-IDLE
            - generic [ref=e110]: Issue
            - generic [ref=e116]:
              - paragraph [ref=e118]: 30:00
              - paragraph [ref=e119]:
                - generic [ref=e120]: 30:00
                - generic [ref=e121]: block
            - generic [ref=e122]:
              - button "Stop rental" [ref=e123]
              - button "Extend" [ref=e124]
              - button "Transfer" [ref=e125]
              - button "Resolve" [ref=e126]
              - button "Mark unresponsive" [ref=e127]
          - generic [ref=e128]:
            - generic [ref=e129]: PCS-ISSUE-RENTED
            - generic [ref=e130]: Issue
            - generic [ref=e136]:
              - paragraph [ref=e138]: 30:00
              - paragraph [ref=e139]:
                - generic [ref=e140]: 30:00
                - generic [ref=e141]: block
            - generic [ref=e142]:
              - button "Stop rental" [ref=e143]
              - button "Extend" [ref=e144]
              - button "Transfer" [ref=e145]
              - button "Resolve" [ref=e146]
              - button "Mark unresponsive" [ref=e147]
          - generic [ref=e148]:
            - generic [ref=e149]: PCS-RENTED-01
            - generic [ref=e150]: Rented
            - generic [ref=e156]:
              - paragraph [ref=e158]: 30:00
              - paragraph [ref=e159]:
                - generic [ref=e160]: 30:00
                - generic [ref=e161]: block
            - generic [ref=e162]:
              - button "Stop rental" [ref=e163]
              - button "Extend" [ref=e164]
              - button "Mark issue" [ref=e165]
              - button "Mark unresponsive" [ref=e166]
          - generic [ref=e167]:
            - generic [ref=e168]: PCS-RENTED-REPAIR
            - generic [ref=e169]:
              - generic [ref=e170]: Rented
              - generic [ref=e175]: needs repair
            - generic [ref=e176]:
              - paragraph [ref=e178]: 30:00
              - paragraph [ref=e179]:
                - generic [ref=e180]: 30:00
                - generic [ref=e181]: block
            - generic [ref=e182]:
              - button "Stop rental" [ref=e183]
              - button "Extend" [ref=e184]
              - button "Repair" [ref=e185]
              - button "Mark issue" [ref=e186]
              - button "Mark unresponsive" [ref=e187]
          - generic [ref=e188]:
            - generic [ref=e189]: PCS-UNRESPONSIVE-IDLE
            - generic [ref=e190]: Unresponsive
            - button "Repair" [ref=e197]
          - generic [ref=e198]:
            - generic [ref=e199]: PCS-UNRESPONSIVE-RENTED
            - generic [ref=e200]: Unresponsive
            - button "Repair" [ref=e207]
```

# Test source

```ts
  1   | /*
  2   |  * pcsAdmin — 6. Transfers, bill notifications, refresh, loading, and errors
  3   |  * All writes use the disposable backend. Page actions use the PCs/sidebar POMs.
  4   |  * API arrangement is used only to prepare the specific no-target/notification data.
  5   |  * Scenario types: Happy path = valid flow; Error path = expected rejection/failure;
  6   |  * Edge case = boundary/unusual state. TYPE comments and report tags describe the
  7   |  * scenario; pass/fail is a separate result. Filter with --grep @happy-path,
  8   |  * --grep @error-path, or --grep @edge-case.
  9   |  */
  10  | const {test, expect} = require('../../../fixtures/pcs.fixture');
  11  | const {clockSeconds} = require('./pcs.data');
  12  | test.use({timezoneId: 'Asia/Manila'});
  13  | 
  14  | test.describe('pcsAdmin — 6. Transfers', () => {
  15  |     for (const source of ['PCS-ISSUE-RENTED', 'PCS-UNRESPONSIVE-RENTED']) {
  16  |         /*
  17  |          * TYPE: Happy path / Edge case
  18  |          * WHAT: Offer only legal transfer destinations from a faulty rented PC.
  19  |          * TEST DATA: Free and idle Issue targets, plus occupied and Unresponsive PCs.
  20  |          * EXPECTED: Only the three idle Free PCs and idle Issue PC appear; source/occupied/faulty-unusable PCs do not. */
  21  |         test(`PCS-15: lists only eligible destinations from ${source} [Happy path / Edge case]`, {tag: ['@happy-path', '@edge-case']}, async ({page, adminPages}) => {
  22  |             const {pcs} = adminPages;
  23  |             await page.goto('/pcs');
  24  |             await pcs.waitForReady();
  25  |             await pcs.openTransfer(source);
  26  |             expect((await pcs.readTransferTargets(source)).sort()).toEqual([
  27  |                 'PCS-FREE-01', 'PCS-FREE-010', 'PCS-FREE-REPAIR', 'PCS-ISSUE-IDLE',
  28  |             ].sort());
  29  |         });
  30  | 
  31  |         for (const target of ['PCS-FREE-01', 'PCS-ISSUE-IDLE']) {
  32  |             /*
  33  |              * TYPE: Happy path / Edge case
  34  |              * WHAT: Move one rental from the named faulty PC to a legal destination.
  35  |              * TEST DATA: Both Issue/Unresponsive sources and Free/Issue targets are covered separately.
  36  |              * EXPECTED: Same rental/clock/charges, one transfer, no bill, source fault retained, and target visibly Rented. */
  37  |             test(`PCS-16: transfers ${source} to ${target} without resetting time or charges [Happy path / Edge case]`, {tag: ['@happy-path', '@edge-case']}, async ({page, adminPages, shop}) => {
  38  |                 const {pcs} = adminPages;
  39  |                 const before = await shop.rentalFor(source);
  40  |                 const total = (await shop.rentals()).length;
  41  |                 await page.goto('/pcs');
  42  |                 await pcs.waitForReady();
  43  |                 const remaining = clockSeconds(await pcs.readRemainingTime(source));
  44  |                 await pcs.transferRental(source, target);
  45  |                 const after = await shop.rentalFor(target);
  46  |                 expect(await shop.rentalFor(source)).toBeUndefined();
  47  |                 expect(after.id).toBe(before.id);
  48  |                 expect(after.startedAt).toBe(before.startedAt);
  49  |                 expect(after.blockStartedAt).toBe(before.blockStartedAt);
  50  |                 expect(after.blockSeconds).toBe(before.blockSeconds);
  51  |                 expect(after.segments).toEqual(before.segments);
  52  |                 expect(after.transfers).toHaveLength(before.transfers.length + 1);
  53  |                 expect(await shop.rentals()).toHaveLength(total);
  54  |                 expect(await shop.payments()).toHaveLength(0);
  55  |                 const carried = clockSeconds(await pcs.readRemainingTime(target));
  56  |                 expect(carried).toBeGreaterThanOrEqual(remaining - 10);
  57  |                 expect(carried).toBeLessThanOrEqual(remaining + 1);
  58  |                 expect(await pcs.readStatus(source)).toBe(source.includes('UNRESPONSIVE') ? 'Unresponsive' : 'Issue');
> 59  |                 expect(await pcs.readStatus(target)).toBe('Rented');
      |                                                      ^ Error: expect(received).toBe(expected) // Object.is equality
  60  |             });
  61  |         }
  62  |     }
  63  | 
  64  |     /*
  65  |      * TYPE: Edge case
  66  |      * WHAT: Cancel an open transfer without changing the customer's rental.
  67  |      * TEST DATA: PCS-ISSUE-RENTED has eligible destinations.
  68  |      * EXPECTED: Picker closes; inventory, rental, and transfer records remain unchanged. */
  69  |     test('PCS-17: cancelling Transfer leaves the rental on its source PC [Edge case]', {tag: '@edge-case'}, async ({page, adminPages, shop}) => {
  70  |         const {pcs} = adminPages;
  71  |         const before = {pcs: await shop.pcs(), rentals: await shop.rentals()};
  72  |         await page.goto('/pcs');
  73  |         await pcs.waitForReady();
  74  |         await pcs.openTransfer('PCS-ISSUE-RENTED');
  75  |         await pcs.cancelRentalPicker('PCS-ISSUE-RENTED');
  76  |         expect(await shop.pcs()).toEqual(before.pcs);
  77  |         expect(await shop.rentals()).toEqual(before.rentals);
  78  |     });
  79  | 
  80  |     /*
  81  |      * TYPE: Edge case
  82  |      * WHAT: Explain when no legal transfer destination is available.
  83  |      * TEST DATA: Mark every idle Free/Issue PC Unresponsive before opening the page.
  84  |      * EXPECTED: No-target message, no destination buttons, and the rental remains on its source. */
  85  |     test('PCS-17: shows the no-target message when all destinations are unavailable [Edge case]', {tag: '@edge-case'}, async ({page, adminPages, shop}) => {
  86  |         const {pcs} = adminPages;
  87  |         const occupied = new Set((await shop.rentals()).map((rental) => rental.pcId));
  88  |         for (const pc of await shop.pcs()) {
  89  |             if (!occupied.has(pc.id) && ['free', 'issue'].includes(pc.status)) {
  90  |                 await shop.arrange(`/pcs/${pc.id}/status`, {status: 'unresponsive'}, 'PATCH');
  91  |             }
  92  |         }
  93  |         const before = await shop.rentalFor('PCS-ISSUE-RENTED');
  94  |         await page.goto('/pcs');
  95  |         await pcs.waitForReady();
  96  |         await pcs.openTransfer('PCS-ISSUE-RENTED');
  97  |         await expect(pcs.pcTile('PCS-ISSUE-RENTED').getByText('No other PC is free right now.', {exact: true})).toBeVisible();
  98  |         expect(await pcs.readTransferTargets('PCS-ISSUE-RENTED')).toEqual([]);
  99  |         expect(await shop.rentalFor('PCS-ISSUE-RENTED')).toEqual(before);
  100 |     });
  101 | });
  102 | 
  103 | test.describe('pcsAdmin — 7. Bills and refresh', () => {
  104 |     for (const count of [0, 1, 2]) {
  105 |         /*
  106 |          * TYPE: Edge case
  107 |          * WHAT: Display the unsettled bill notification with the correct count and total.
  108 |          * TEST DATA: No bills, or stop one/two prepared 30-minute rentals through setup API calls.
  109 |          * EXPECTED: Hidden at zero; otherwise correct bill/bills wording, peso total, and Payments navigation. */
  110 |         test(`PCS-19: handles ${count} unsettled ${count === 1 ? 'bill' : 'bills'} [Edge case]`, {tag: '@edge-case'}, async ({page, adminPages, shop}) => {
  111 |             const {pcs} = adminPages;
  112 |             for (const name of ['PCS-RENTED-01', 'PCS-RENTED-REPAIR'].slice(0, count)) {
  113 |                 const pc = (await shop.pcs()).find((candidate) => candidate.name === name);
  114 |                 await shop.arrange('/rentals/stop', {pcId: pc.id});
  115 |             }
  116 |             await page.goto('/pcs');
  117 |             await pcs.waitForReady();
  118 |             if (count === 0) {
  119 |                 await expect(pcs.billsnotif).toHaveCount(0);
  120 |             } else {
  121 |                 await expect(pcs.billsnotif).toHaveText(`${count} ${count === 1 ? 'bill' : 'bills'} · ₱${count * 10}`);
  122 |                 await pcs.billsnotif.click();
  123 |                 await expect(page).toHaveURL(/\/payments$/);
  124 |             }
  125 |         });
  126 |     }
  127 | 
  128 |     /*
  129 |      * TYPE: Happy path / Edge case
  130 |      * WHAT: Check that refresh preserves each saved PC/rental action without repeating it.
  131 |      * TEST DATA: Register -> flag -> repair -> start -> extend -> flag/transfer -> stop.
  132 |      * EXPECTED: API records remain identical across each reload and rendered statuses match saved PC state. */
  133 |     test('PCS-20: registration, status, repair, rental, extension, transfer, and bill survive refresh [Happy path / Edge case]', {tag: ['@happy-path', '@edge-case']}, async ({page, adminPages, shop}) => {
  134 |         const {pcs, sidebar} = adminPages;
  135 | 
  136 |         // Capture saved records, reload, and compare the same records plus the visible board.
  137 |         async function verifyRefresh() {
  138 |             const before = {pcs: await shop.pcs(), rentals: await shop.rentals(), payments: await shop.payments()};
  139 |             await page.reload();
  140 |             await pcs.waitForReady();
  141 |             expect(await shop.pcs()).toEqual(before.pcs);
  142 |             expect(await shop.rentals()).toEqual(before.rentals);
  143 |             expect(await shop.payments()).toEqual(before.payments);
  144 |             expect(await pcs.readComputerTotal()).toBe(before.pcs.length);
  145 |             for (const pc of before.pcs) {
  146 |                 expect((await pcs.readStatus(pc.name)).toLowerCase()).toBe(pc.status);
  147 |             }
  148 |         }
  149 | 
  150 |         await page.goto('/pcs');
  151 |         await pcs.waitForReady();
  152 |         await test.step('Register once, then refresh', async () => {
  153 |             await pcs.registerPc('PCS-REFRESH-NEW');
  154 |             await verifyRefresh();
  155 |         });
  156 |         await test.step('Mark Issue and resolve it, refreshing after each action', async () => {
  157 |             await pcs.markIssue('PCS-FREE-01');
  158 |             await verifyRefresh();
  159 |             await pcs.resolveIssue('PCS-FREE-01');
```