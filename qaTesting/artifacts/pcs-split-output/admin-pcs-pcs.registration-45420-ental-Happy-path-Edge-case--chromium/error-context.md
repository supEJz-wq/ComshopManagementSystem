# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin\pcs\pcs.registration-status.spec.js >> pcsAdmin — 2. Status and repairs >> PCS-06: repairing PCS-ISSUE-RENTED restores Rented without ending its rental [Happy path / Edge case]
- Location: tests\admin\pcs\pcs.registration-status.spec.js:180:9

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "Rented"
Received: "Free"
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
        - time [ref=e23]: 7:28 PM
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
              - button "Resolve" [ref=e117]
              - button "Mark unresponsive" [ref=e118]
          - generic [ref=e119]:
            - generic [ref=e120]: PCS-ISSUE-RENTED
            - generic [ref=e121]: Free
            - generic [ref=e127]:
              - paragraph [ref=e129]: 30:00
              - paragraph [ref=e130]:
                - generic [ref=e131]: 30:00
                - generic [ref=e132]: block
            - generic [ref=e133]:
              - button "Stop rental" [ref=e134]
              - button "Extend" [ref=e135]
              - button "Mark issue" [ref=e136]
              - button "Mark unresponsive" [ref=e137]
          - generic [ref=e138]:
            - generic [ref=e139]: PCS-RENTED-01
            - generic [ref=e140]: Rented
            - generic [ref=e146]:
              - paragraph [ref=e148]: 30:00
              - paragraph [ref=e149]:
                - generic [ref=e150]: 30:00
                - generic [ref=e151]: block
            - generic [ref=e152]:
              - button "Stop rental" [ref=e153]
              - button "Extend" [ref=e154]
              - button "Mark issue" [ref=e155]
              - button "Mark unresponsive" [ref=e156]
          - generic [ref=e157]:
            - generic [ref=e158]: PCS-RENTED-REPAIR
            - generic [ref=e159]:
              - generic [ref=e160]: Rented
              - generic [ref=e165]: needs repair
            - generic [ref=e166]:
              - paragraph [ref=e168]: 30:00
              - paragraph [ref=e169]:
                - generic [ref=e170]: 30:00
                - generic [ref=e171]: block
            - generic [ref=e172]:
              - button "Stop rental" [ref=e173]
              - button "Extend" [ref=e174]
              - button "Repair" [ref=e175]
              - button "Mark issue" [ref=e176]
              - button "Mark unresponsive" [ref=e177]
          - generic [ref=e178]:
            - generic [ref=e179]: PCS-UNRESPONSIVE-IDLE
            - generic [ref=e180]: Unresponsive
            - button "Repair" [ref=e187]
          - generic [ref=e188]:
            - generic [ref=e189]: PCS-UNRESPONSIVE-RENTED
            - generic [ref=e190]: Unresponsive
            - generic [ref=e196]:
              - paragraph [ref=e198]: 30:00
              - paragraph [ref=e199]:
                - generic [ref=e200]: 30:00
                - generic [ref=e201]: block
            - generic [ref=e202]:
              - button "Stop rental" [ref=e203]
              - button "Extend" [ref=e204]
              - button "Transfer" [ref=e205]
              - button "Repair" [ref=e206]
```

# Test source

```ts
  87  |             const before = await shop.pcs();
  88  |             await page.goto('/pcs');
  89  |             await pcs.waitForReady();
  90  |             await pcs.openAddPc();
  91  |             await pcs.fillPcName(name);
  92  |             await pcs.submitAddPc.click();
  93  |             if (check === 'validation') {
  94  |                 expect(await shop.pcs(), 'Rejected input must not create any PC.').toEqual(before);
  95  |                 await expect(pcs.addPcForm, 'Invalid input must not complete registration.').toBeVisible();
  96  |             } else {
  97  |                 await expect(pcs.addPcError, 'Feedback issue: rejection must explain the missing name.').toHaveText('Enter a name for the PC.');
  98  |             }
  99  |         });
  100 |     }
  101 | 
  102 |     for (const check of ['validation', 'feedback']) {
  103 |     /*
  104 |      * TYPE: Error path
  105 |      * WHAT: Report duplicate rejection separately from its visible message.
  106 |      * TEST DATA: Submit the existing PCS-FREE-01 name.
  107 |      * EXPECTED: Validation PASSES for HTTP 400 and unchanged inventory.
  108 |      * Feedback is a separate result requiring the duplicate-name message. */
  109 |     test(`PCS-05: ${check} ${check === 'validation' ? 'rejects an existing PC name without creating a PC' : 'shows the duplicate-name error'} [Error path]`, {tag: ['@error-path', `@${check}`]}, async ({page, adminPages, shop}) => {
  110 |         const {pcs} = adminPages;
  111 |         const before = await shop.pcs();
  112 |         await page.goto('/pcs');
  113 |         await pcs.waitForReady();
  114 |         await pcs.openAddPc();
  115 |         await pcs.fillPcName('PCS-FREE-01');
  116 |         const rejected = page.waitForResponse((response) => response.request().method() === 'POST'
  117 |             && new URL(response.url()).pathname === '/api/pcs');
  118 |         await pcs.submitAddPc.click();
  119 |         const response = await rejected;
  120 |         if (check === 'validation') {
  121 |             expect(response.status(), 'A valid rejection is a successful bad-path check.').toBe(400);
  122 |             expect(await shop.pcs()).toEqual(before);
  123 |             await expect(pcs.addPcForm).toBeVisible();
  124 |         } else {
  125 |             await expect(pcs.addPcError, 'Feedback issue: duplicate rejection must have a visible reason.').toHaveText('PCS-FREE-01 already exists.');
  126 |         }
  127 |     });
  128 |     }
  129 | });
  130 | 
  131 | test.describe('pcsAdmin — 2. Status and repairs', () => {
  132 |     for (const scenario of [
  133 |         {action: 'Issue and Resolve', change: 'markIssue', restore: 'resolveIssue', status: 'Issue'},
  134 |         {action: 'Unresponsive and Repair', change: 'markUnresponsive', restore: 'repairPc', status: 'Unresponsive'},
  135 |     ]) {
  136 |         /*
  137 |          * TYPE: Happy path / Edge case
  138 |          * WHAT: Flag and restore only the selected idle PC.
  139 |          * TEST DATA: PCS-FREE-01 beside similarly named PCS-FREE-010.
  140 |          * EXPECTED: The selected PC changes status and returns to Free with its repair flag cleared. */
  141 |         test(`PCS-06: ${scenario.action} updates only the exact named PC [Happy path / Edge case]`, {tag: ['@happy-path', '@edge-case']}, async ({page, adminPages, shop}) => {
  142 |             const {pcs} = adminPages;
  143 |             await page.goto('/pcs');
  144 |             await pcs.waitForReady();
  145 |             await pcs[scenario.change]('PCS-FREE-01');
  146 |             expect(await pcs.readStatus('PCS-FREE-01')).toBe(scenario.status);
  147 |             expect(await pcs.readStatus('PCS-FREE-010')).toBe('Free');
  148 |             await pcs[scenario.restore]('PCS-FREE-01');
  149 |             expect(await pcs.readStatus('PCS-FREE-01')).toBe('Free');
  150 |             expect((await shop.pcs()).find((pc) => pc.name === 'PCS-FREE-01').needsRepair).toBe(false);
  151 |         });
  152 |     }
  153 | 
  154 |     for (const name of ['PCS-FREE-REPAIR', 'PCS-RENTED-REPAIR']) {
  155 |         /*
  156 |          * TYPE: Happy path / Edge case
  157 |          * WHAT: Clear a known repair flag while preserving its PC/rental state.
  158 |          * TEST DATA: A working Free or Rented PC with needsRepair already set.
  159 |          * EXPECTED: Badge disappears; status and the active rental record stay unchanged. */
  160 |         test(`PCS-06: Repair preserves the working state of ${name} [Happy path / Edge case]`, {tag: ['@happy-path', '@edge-case']}, async ({page, adminPages, shop}) => {
  161 |             const {pcs} = adminPages;
  162 |             const before = await shop.rentalFor(name);
  163 |             await page.goto('/pcs');
  164 |             await pcs.waitForReady();
  165 |             const status = await pcs.readStatus(name);
  166 |             await expect(pcs.pcTile(name).getByText('needs repair', {exact: true})).toBeVisible();
  167 |             await pcs.repairPc(name);
  168 |             expect(await pcs.readStatus(name)).toBe(status);
  169 |             await expect(pcs.pcTile(name).getByText('needs repair', {exact: true})).toHaveCount(0);
  170 |             expect(await shop.rentalFor(name)).toEqual(before);
  171 |         });
  172 |     }
  173 | 
  174 |     for (const name of ['PCS-ISSUE-RENTED', 'PCS-UNRESPONSIVE-RENTED']) {
  175 |         /*
  176 |          * TYPE: Happy path / Edge case
  177 |          * WHAT: Repair a faulty PC whose customer's rental is still active.
  178 |          * TEST DATA: The named Issue/Unresponsive PC already has a rental.
  179 |          * EXPECTED: Working status becomes Rented, repair flag clears, and the same rental continues. */
  180 |         test(`PCS-06: repairing ${name} restores Rented without ending its rental [Happy path / Edge case]`, {tag: ['@happy-path', '@edge-case']}, async ({page, adminPages, shop}) => {
  181 |             const {pcs} = adminPages;
  182 |             const before = await shop.rentalFor(name);
  183 |             await page.goto('/pcs');
  184 |             await pcs.waitForReady();
  185 |             await pcs.repairPc(name);
  186 |             expect(await shop.rentalFor(name)).toEqual(before);
> 187 |             expect(await pcs.readStatus(name)).toBe('Rented');
      |                                                ^ Error: expect(received).toBe(expected) // Object.is equality
  188 |         });
  189 |     }
  190 | 
  191 |     for (const scenario of [
  192 |         {name: 'PCS-FREE-01', buttons: ['Start rental', 'Mark issue', 'Mark unresponsive']},
  193 |         {name: 'PCS-RENTED-01', buttons: ['Stop rental', 'Extend', 'Mark issue', 'Mark unresponsive']},
  194 |         {name: 'PCS-ISSUE-IDLE', buttons: ['Resolve', 'Mark unresponsive']},
  195 |         {name: 'PCS-UNRESPONSIVE-IDLE', buttons: ['Repair']},
  196 |         {name: 'PCS-ISSUE-RENTED', buttons: ['Stop rental', 'Extend', 'Transfer', 'Resolve', 'Mark unresponsive']},
  197 |         {name: 'PCS-UNRESPONSIVE-RENTED', buttons: ['Stop rental', 'Extend', 'Transfer', 'Repair']},
  198 |         {name: 'PCS-FREE-REPAIR', buttons: ['Start rental', 'Repair', 'Mark issue', 'Mark unresponsive']},
  199 |         {name: 'PCS-RENTED-REPAIR', buttons: ['Stop rental', 'Extend', 'Repair', 'Mark issue', 'Mark unresponsive']},
  200 |     ]) {
  201 |         /*
  202 |          * TYPE: Edge case
  203 |          * WHAT: Check which actions are available for the named PC state.
  204 |          * TEST DATA: The scenario lists the exact buttons allowed for that seeded PC.
  205 |          * EXPECTED: All listed buttons appear and no other tile action is offered. */
  206 |         test(`PCS-07: offers the correct actions on ${scenario.name} [Edge case]`, {tag: '@edge-case'}, async ({page, adminPages}) => {
  207 |             const {pcs} = adminPages;
  208 |             await page.goto('/pcs');
  209 |             await pcs.waitForReady();
  210 |             const labels = (await pcs.pcTile(scenario.name).getByRole('button').allTextContents()).map((text) => text.trim());
  211 |             expect(labels.sort()).toEqual([...scenario.buttons].sort());
  212 |         });
  213 |     }
  214 | });
  215 | 
```