# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin\pcs\pcs.registration-status.spec.js >> pcsAdmin — 1. Board and registration >> PCS-05: feedback shows the duplicate-name error [Error path]
- Location: tests\admin\pcs\pcs.registration-status.spec.js:109:5

# Error details

```
Error: Feedback issue: duplicate rejection must have a visible reason.

expect(locator).toHaveText(expected) failed

Locator: locator('form').filter({ has: getByRole('textbox', { name: 'PC name', exact: true }) }).getByRole('alert')
Expected: "PCS-FREE-01 already exists."
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Feedback issue: duplicate rejection must have a visible reason. locator('form').filter({ has: getByRole('textbox', { name: 'PC name', exact: true }) }).getByRole('alert') with timeout 5000ms
  - waiting for locator('form').filter({ has: getByRole('textbox', { name: 'PC name', exact: true }) }).getByRole('alert')

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
  - time: 7:28 PM
  - text: Today
- main:
  - heading "PCs" [level=2]
  - paragraph: 10 computers. Names cannot be changed or removed once added.
  - text: PC name
  - textbox "PC name":
    - /placeholder: PC-09
    - text: PCS-FREE-01
  - button "Add PC"
  - button "Cancel"
  - text: Free Rented Issue Unresponsive PCS-CAP-RENTED Rented
  - paragraph: 23:58:55
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
  - paragraph: 29:55
  - paragraph: 30:00 block
  - button "Stop rental"
  - button "Extend"
  - button "Transfer"
  - button "Resolve"
  - button "Mark unresponsive"
  - text: PCS-RENTED-01 Rented
  - paragraph: 29:55
  - paragraph: 30:00 block
  - button "Stop rental"
  - button "Extend"
  - button "Mark issue"
  - button "Mark unresponsive"
  - text: PCS-RENTED-REPAIR Rented needs repair
  - paragraph: 29:55
  - paragraph: 30:00 block
  - button "Stop rental"
  - button "Extend"
  - button "Repair"
  - button "Mark issue"
  - button "Mark unresponsive"
  - text: PCS-UNRESPONSIVE-IDLE Unresponsive
  - button "Repair"
  - text: PCS-UNRESPONSIVE-RENTED Unresponsive
  - paragraph: 29:55
  - paragraph: 30:00 block
  - button "Stop rental"
  - button "Extend"
  - button "Transfer"
  - button "Repair"
```

# Test source

```ts
  25  |         expect(await pcs.readComputerTotal()).toBe(10);
  26  |         expect((await pcs.readPcNames()).sort()).toEqual([...pcNames].sort());
  27  |         for (const label of ['Free', 'Rented', 'Issue', 'Unresponsive']) {
  28  |             await expect(pcs.legend.getByText(label, {exact: true})).toBeVisible();
  29  |         }
  30  |         for (const pc of inventory) {
  31  |             await expect(pcs.pcTile(pc.name)).toHaveCount(1);
  32  |             expect((await pcs.readStatus(pc.name)).toLowerCase()).toBe(pc.status);
  33  |             await expect(pcs.pcTile(pc.name).getByRole('button', {name: /rename|delete|remove/i})).toHaveCount(0);
  34  |         }
  35  |     });
  36  | 
  37  |     /*
  38  |      * TYPE: Happy path / Edge case
  39  |      * WHAT: Open and cancel registration without creating a PC.
  40  |      * TEST DATA: Type a new PC name into Add PC, then cancel.
  41  |      * EXPECTED: Fields/buttons appear, cancel closes the form, and inventory is unchanged. */
  42  |     test('PCS-02: cancels Add PC without changing inventory [Happy path / Edge case]', {tag: ['@happy-path', '@edge-case']}, async ({page, adminPages, shop}) => {
  43  |         const {pcs} = adminPages;
  44  |         const before = await shop.pcs();
  45  |         await page.goto('/pcs');
  46  |         await pcs.waitForReady();
  47  |         await pcs.openAddPc();
  48  |         await expect(pcs.pcName).toBeVisible();
  49  |         await expect(pcs.submitAddPc).toBeVisible();
  50  |         await expect(pcs.cancelAddPc).toBeVisible();
  51  |         await pcs.fillPcName('PCS-CANCELLED');
  52  |         await pcs.cancelPcRegistration();
  53  |         expect(await shop.pcs()).toEqual(before);
  54  |         expect(await pcs.readComputerTotal()).toBe(before.length);
  55  |     });
  56  | 
  57  |     /*
  58  |      * TYPE: Happy path / Edge case
  59  |      * WHAT: Register a valid new PC and verify saved state after refresh.
  60  |      * TEST DATA: A unique name with surrounding spaces.
  61  |      * EXPECTED: One trimmed Free PC is created, total increases once, and refresh creates no duplicate. */
  62  |     test('PCS-03: registers one new Free PC and preserves it after refresh [Happy path / Edge case]', {tag: ['@happy-path', '@edge-case']}, async ({page, adminPages, shop}) => {
  63  |         const {pcs} = adminPages;
  64  |         await page.goto('/pcs');
  65  |         await pcs.waitForReady();
  66  |         const before = await pcs.readComputerTotal();
  67  |         await pcs.registerPc('  PCS-NEW-01  ');
  68  |         expect(await pcs.readStatus('PCS-NEW-01')).toBe('Free');
  69  |         expect(await pcs.readComputerTotal()).toBe(before + 1);
  70  |         await page.reload();
  71  |         await pcs.waitForReady();
  72  |         await expect(pcs.pcTile('PCS-NEW-01')).toHaveCount(1);
  73  |         expect((await shop.pcs()).filter((pc) => pc.name === 'PCS-NEW-01')).toHaveLength(1);
  74  |         expect(await pcs.readComputerTotal()).toBe(before + 1);
  75  |     });
  76  | 
  77  |     for (const name of ['', '   ']) for (const check of ['validation', 'feedback']) {
  78  |         /*
  79  |          * TYPE: Error path / Edge case
  80  |          * WHAT: Report rejected input separately from its error-message feedback.
  81  |          * TEST DATA: The test title identifies empty or whitespace-only input.
  82  |          * EXPECTED: Validation PASSES when no PC is created and the form stays open.
  83  |          * Feedback PASSES only when the expected error appears; a missing message
  84  |          * must not imply that the empty name was accepted. */
  85  |         test(`PCS-04: ${check} ${check === 'validation' ? 'rejects' : 'shows an error for'} ${name === '' ? 'an empty' : 'a whitespace-only'} PC name [Error path / Edge case]`, {tag: ['@error-path', '@edge-case', `@${check}`]}, async ({page, adminPages, shop}) => {
  86  |             const {pcs} = adminPages;
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
> 125 |             await expect(pcs.addPcError, 'Feedback issue: duplicate rejection must have a visible reason.').toHaveText('PCS-FREE-01 already exists.');
      |                                                                                                             ^ Error: Feedback issue: duplicate rejection must have a visible reason.
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
  187 |             expect(await pcs.readStatus(name)).toBe('Rented');
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