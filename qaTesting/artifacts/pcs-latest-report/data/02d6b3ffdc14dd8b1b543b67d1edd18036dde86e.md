# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin\pcs\pcs.rentals.spec.js >> pcsAdmin — 4. Extend a rental >> PCS-13: feedback shows the error for an extension exceeding 24 hours booked [Error path / Edge case]
- Location: tests\admin\pcs\pcs.rentals.spec.js:195:5

# Error details

```
Error: Feedback issue: the cap rejection must be explained.

expect(locator).toHaveText(expected) failed

Locator: locator('main div.border-l-4').filter({ has: locator(':scope > span.font-semibold') }).filter({ has: locator(':scope > span').filter({ hasText: /^PCS-CAP-RENTED$/ }) }).getByRole('alert')
Expected: "A rental cannot be longer than 24 hours."
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Feedback issue: the cap rejection must be explained. locator('main div.border-l-4').filter({ has: locator(':scope > span.font-semibold') }).filter({ has: locator(':scope > span').filter({ hasText: /^PCS-CAP-RENTED$/ }) }).getByRole('alert') with timeout 5000ms
  - waiting for locator('main div.border-l-4').filter({ has: locator(':scope > span.font-semibold') }).filter({ has: locator(':scope > span').filter({ hasText: /^PCS-CAP-RENTED$/ }) }).getByRole('alert')

```

```yaml
- complementary:
  - paragraph: CyberShopOS
  - paragraph: Admin / Owner
  - navigation:
    - link "Home":
      - /url: /
    - link "PCs":
      - /url: /pcs
    - link "Rentals":
      - /url: /rentals
    - link "Payments":
      - /url: /payments
    - link "Revenue":
      - /url: /revenue
    - link "Analytics":
      - /url: /analytics
    - link "Accounts":
      - /url: /accounts
  - paragraph: home-test-admin
  - button "Sign out"
- banner:
  - paragraph: Computer Shop Management System
  - time: 7:29 PM
  - text: Today
- main:
  - heading "PCs" [level=2]
  - paragraph: 10 computers. Names cannot be changed or removed once added.
  - button "Add PC"
  - text: Free Rented Issue Unresponsive PCS-CAP-RENTED Rented
  - paragraph: 23:58:56
  - paragraph: 23:59:00 block
  - button "Stop rental"
  - button "Extend"
  - button "Mark issue"
  - button "Mark unresponsive"
  - text: PCS-FREE-01 Free
  - button "Start rental"
  - button "Mark issue"
  - button "Mark unresponsive"
  - text: PCS-FREE-010 Free
  - button "Start rental"
  - button "Mark issue"
  - button "Mark unresponsive"
  - text: PCS-FREE-REPAIR Free needs repair
  - button "Start rental"
  - button "Repair"
  - button "Mark issue"
  - button "Mark unresponsive"
  - text: PCS-ISSUE-IDLE Issue
  - button "Resolve"
  - button "Mark unresponsive"
  - text: PCS-ISSUE-RENTED Issue
  - paragraph: 29:56
  - paragraph: 30:00 block
  - button "Stop rental"
  - button "Extend"
  - button "Transfer"
  - button "Resolve"
  - button "Mark unresponsive"
  - text: PCS-RENTED-01 Rented
  - paragraph: 29:56
  - paragraph: 30:00 block
  - button "Stop rental"
  - button "Extend"
  - button "Mark issue"
  - button "Mark unresponsive"
  - text: PCS-RENTED-REPAIR Rented needs repair
  - paragraph: 29:56
  - paragraph: 30:00 block
  - button "Stop rental"
  - button "Extend"
  - button "Repair"
  - button "Mark issue"
  - button "Mark unresponsive"
  - text: PCS-UNRESPONSIVE-IDLE Unresponsive
  - button "Repair"
  - text: PCS-UNRESPONSIVE-RENTED Unresponsive
  - paragraph: 29:56
  - paragraph: 30:00 block
  - button "Stop rental"
  - button "Extend"
  - button "Transfer"
  - button "Repair"
```

# Test source

```ts
  110 |             expect(await shop.rentals()).toEqual(before.rentals);
  111 |         });
  112 |     }
  113 | });
  114 | 
  115 | test.describe('pcsAdmin — 4. Extend a rental', () => {
  116 |     for (const addition of [...presets, {label: 'custom 2 min 3 sec', seconds: 123, custom: {minutes: 2, seconds: 3}}]) {
  117 |         /*
  118 |          * TYPE: Happy path
  119 |          * WHAT: Add the named preset/custom duration to the same active rental.
  120 |          * TEST DATA: PCS-RENTED-01 has a fresh 30-minute rental.
  121 |          * EXPECTED: Exactly one segment is added; countdown rises within a 10-second allowance; no extra rental. */
  122 |         test(`PCS-12: extends an active rental by ${addition.label} [Happy path]`, {tag: '@happy-path'}, async ({page, adminPages, shop}) => {
  123 |             const {pcs} = adminPages;
  124 |             const before = await shop.rentalFor('PCS-RENTED-01');
  125 |             const count = (await shop.rentals()).length;
  126 |             await page.goto('/pcs');
  127 |             await pcs.waitForReady();
  128 |             const remaining = clockSeconds(await pcs.readRemainingTime('PCS-RENTED-01'));
  129 |             const response = addition.custom
  130 |                 ? await pcs.extendRentalCustom('PCS-RENTED-01', addition.custom)
  131 |                 : await pcs.extendRentalPreset('PCS-RENTED-01', addition.label);
  132 |             await expect.poll(async () => clockSeconds(await pcs.readBlockTime('PCS-RENTED-01')))
  133 |                 .toBe(response.rental.blockSeconds);
  134 |             const after = await shop.rentalFor('PCS-RENTED-01');
  135 |             expect(after.id).toBe(before.id);
  136 |             expect(after.startedAt).toBe(before.startedAt);
  137 |             expect(after.segments).toHaveLength(before.segments.length + 1);
  138 |             expect(after.segments.at(-1).seconds).toBe(addition.seconds);
  139 |             expect(await shop.rentals()).toHaveLength(count);
  140 |             // The display uses a one-second tick. Wait for that tick to catch up
  141 |             // with the saved extension rather than reading the previous frame.
  142 |             await expect.poll(async () => clockSeconds(await pcs.readRemainingTime('PCS-RENTED-01')))
  143 |                 .toBeGreaterThanOrEqual(remaining + addition.seconds - 10);
  144 |             const updated = clockSeconds(await pcs.readRemainingTime('PCS-RENTED-01'));
  145 |             expect(updated).toBeLessThanOrEqual(remaining + addition.seconds + 1);
  146 |         });
  147 |     }
  148 | 
  149 |     for (const invalid of invalidDurations) for (const check of ['validation', 'feedback']) {
  150 |         /*
  151 |          * TYPE: Error path / Edge case
  152 |          * WHAT: Reject an invalid custom extension before changing the rental.
  153 |          * TEST DATA: The invalid input named in the title on PCS-RENTED-01.
  154 |          * EXPECTED: Validation PASSES when stored rental/segments stay unchanged.
  155 |          * Feedback separately requires the browser/application rejection message. */
  156 |         test(`PCS-13: ${check} ${check === 'validation' ? 'rejects' : 'explains rejection of'} an extension of ${invalid.label} [Error path / Edge case]`, {tag: ['@error-path', '@edge-case', `@${check}`]}, async ({page, adminPages, shop}) => {
  157 |             const {pcs} = adminPages;
  158 |             const before = await shop.rentalFor('PCS-RENTED-01');
  159 |             await page.goto('/pcs');
  160 |             await pcs.waitForReady();
  161 |             await pcs.openExtendPicker('PCS-RENTED-01');
  162 |             await pcs.fillDuration('PCS-RENTED-01', 'extend', invalid.value);
  163 |             await pcs.pcTile('PCS-RENTED-01').getByRole('button', {name: 'Add', exact: true}).click();
  164 |             if (check === 'validation') {
  165 |                 expect(await shop.rentalFor('PCS-RENTED-01'), 'Invalid duration must not extend the rental.').toEqual(before);
  166 |             } else if (invalid.nativePart) {
  167 |                 expect(await pcs.durationField('PCS-RENTED-01', 'extend', invalid.nativePart)
  168 |                     .evaluate((input) => input.validationMessage.trim().length), 'Native feedback must explain the rejected value.').toBeGreaterThan(0);
  169 |             } else {
  170 |                 await expect(pcs.pcTile('PCS-RENTED-01').getByRole('alert')).toHaveText(invalid.error);
  171 |             }
  172 |         });
  173 |     }
  174 | 
  175 |     /*
  176 |      * TYPE: Happy path / Edge case
  177 |      * WHAT: Allow an extension that reaches exactly the total booked-time cap.
  178 |      * TEST DATA: PCS-CAP-RENTED has 23h 59m booked; add 1 minute.
  179 |      * EXPECTED: The booked segments total exactly 24 hours on the same rental. */
  180 |     test('PCS-13: accepts an extension reaching exactly 24 hours booked [Happy path / Edge case]', {tag: ['@happy-path', '@edge-case']}, async ({page, adminPages, shop}) => {
  181 |         await page.goto('/pcs');
  182 |         await adminPages.pcs.waitForReady();
  183 |         await adminPages.pcs.extendRentalCustom('PCS-CAP-RENTED', {minutes: 1});
  184 |         const rental = await shop.rentalFor('PCS-CAP-RENTED');
  185 |         expect(rental.segments.reduce((sum, piece) => sum + piece.seconds, 0)).toBe(86400);
  186 |     });
  187 | 
  188 |     for (const check of ['validation', 'feedback']) {
  189 |     /*
  190 |      * TYPE: Error path / Edge case
  191 |      * WHAT: Reject an otherwise valid extension that exceeds total booked time.
  192 |      * TEST DATA: PCS-CAP-RENTED has 23h 59m booked; add 2 minutes.
  193 |      * EXPECTED: Validation PASSES for HTTP 400 and the unchanged rental.
  194 |      * Feedback separately requires the visible total-booked-time error. */
  195 |     test(`PCS-13: ${check} ${check === 'validation' ? 'rejects an extension exceeding 24 hours booked' : 'shows the error for an extension exceeding 24 hours booked'} [Error path / Edge case]`, {tag: ['@error-path', '@edge-case', `@${check}`]}, async ({page, adminPages, shop}) => {
  196 |         const {pcs} = adminPages;
  197 |         const before = await shop.rentalFor('PCS-CAP-RENTED');
  198 |         await page.goto('/pcs');
  199 |         await pcs.waitForReady();
  200 |         await pcs.openExtendPicker('PCS-CAP-RENTED');
  201 |         await pcs.fillDuration('PCS-CAP-RENTED', 'extend', {minutes: 2});
  202 |         const rejected = page.waitForResponse((response) => response.request().method() === 'POST'
  203 |             && new URL(response.url()).pathname === '/api/rentals/extend');
  204 |         await pcs.pcTile('PCS-CAP-RENTED').getByRole('button', {name: 'Add', exact: true}).click();
  205 |         const response = await rejected;
  206 |         if (check === 'validation') {
  207 |             expect(response.status(), 'Rejecting a duration over the cap is the expected result.').toBe(400);
  208 |             expect(await shop.rentalFor('PCS-CAP-RENTED')).toEqual(before);
  209 |         } else {
> 210 |             await expect(pcs.pcTile('PCS-CAP-RENTED').getByRole('alert'), 'Feedback issue: the cap rejection must be explained.').toHaveText('A rental cannot be longer than 24 hours.');
      |                                                                                                                                   ^ Error: Feedback issue: the cap rejection must be explained.
  211 |         }
  212 |     });
  213 |     }
  214 | });
  215 | 
  216 | test.describe('pcsAdmin — 5. Faults and stopping', () => {
  217 |     for (const action of ['markIssue', 'markUnresponsive']) {
  218 |         /*
  219 |          * TYPE: Happy path / Edge case
  220 |          * WHAT: Flag a rented PC without stranding its customer's rental.
  221 |          * TEST DATA: PCS-RENTED-01; the title identifies the fault action.
  222 |          * EXPECTED: Same rental/timestamps/segments; Stop, Extend, and Transfer stay available. */
  223 |         test(`PCS-14: ${action} preserves the rental and recovery actions [Happy path / Edge case]`, {tag: ['@happy-path', '@edge-case']}, async ({page, adminPages, shop}) => {
  224 |             const {pcs} = adminPages;
  225 |             const before = await shop.rentalFor('PCS-RENTED-01');
  226 |             await page.goto('/pcs');
  227 |             await pcs.waitForReady();
  228 |             await pcs[action]('PCS-RENTED-01');
  229 |             expect(await shop.rentalFor('PCS-RENTED-01')).toEqual(before);
  230 |             for (const name of ['Stop rental', 'Extend', 'Transfer']) {
  231 |                 await expect(pcs.pcTile('PCS-RENTED-01').getByRole('button', {name, exact: true})).toBeVisible();
  232 |             }
  233 |         });
  234 |     }
  235 | 
  236 |     for (const scenario of [
  237 |         {name: 'PCS-RENTED-01', status: 'Rented', after: 'Free',
  238 |             type: 'Happy path', tags: ['@happy-path']},
  239 |         {name: 'PCS-ISSUE-RENTED', status: 'Issue', after: 'Issue',
  240 |             type: 'Happy path / Edge case', tags: ['@happy-path', '@edge-case']},
  241 |         {name: 'PCS-UNRESPONSIVE-RENTED', status: 'Unresponsive', after: 'Unresponsive',
  242 |             type: 'Happy path / Edge case', tags: ['@happy-path', '@edge-case']},
  243 |     ]) {
  244 |         /*
  245 |          * TYPE: Happy path; faulty-PC variants also Edge case (see scenario.type)
  246 |          * WHAT: Stop a healthy or faulty rental and check the payment handoff.
  247 |          * TEST DATA: The named PC has an active 30-minute booking; no bills exist yet.
  248 |          * EXPECTED: One unsettled bill, no active rental on that PC, Payments opens, and fault state is preserved. */
  249 |         test(`PCS-18: stopping a ${scenario.status} PC creates one bill and leaves it ${scenario.after} [${scenario.type}]`, {tag: scenario.tags}, async ({page, adminPages, shop}) => {
  250 |             const {pcs, sidebar} = adminPages;
  251 |             const before = await shop.rentalFor(scenario.name);
  252 |             await page.goto('/pcs');
  253 |             await pcs.waitForReady();
  254 |             await pcs.stopRental(scenario.name);
  255 |             await expect(page).toHaveURL(/\/payments$/);
  256 |             expect(await shop.rentalFor(scenario.name)).toBeUndefined();
  257 |             const bills = await shop.payments();
  258 |             expect(bills).toHaveLength(1);
  259 |             expect(bills[0].rental_id).toBe(before.id);
  260 |             expect(bills[0].is_settled).toBe(false);
  261 |             await sidebar.clickpcs();
  262 |             await pcs.waitForReady();
  263 |             expect(await pcs.readStatus(scenario.name)).toBe(scenario.after);
  264 |         });
  265 |     }
  266 | });
  267 | 
```