# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin\pcs\pcs.registration-status.spec.js >> pcsAdmin — 1. Board and registration >> PCS-05: shows duplicate-name feedback without adding another PC
- Location: tests\admin\pcs\pcs.registration-status.spec.js:87:5

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator: locator('form').filter({ has: getByRole('textbox', { name: 'PC name', exact: true }) }).getByRole('alert')
Expected: "PCS-FREE-01 already exists."
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toHaveText" locator('form').filter({ has: getByRole('textbox', { name: 'PC name', exact: true }) }).getByRole('alert') with timeout 5000ms
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
  - time: 11:19 PM
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
  1   | /*
  2   |  * pcsAdmin — 1. Board, registration, status, and repairs
  3   |  * Run: npm run test:pcs. Each test starts from the isolated ten-PC dataset.
  4   |  * POM methods perform actions; this file owns expectations and scenario explanations.
  5   |  */
  6   | const {test, expect} = require('../../../fixtures/pcs.fixture');
  7   | const {pcNames} = require('./pcs.data');
  8   | test.use({timezoneId: 'Asia/Manila'});
  9   | 
  10  | test.describe('pcsAdmin — 1. Board and registration', () => {
  11  |     /* WHAT: Verify the board's inventory, legend, and PC names.
  12  |      * TEST DATA: Ten PCs covering Free/Rented/Issue/Unresponsive and repair flags.
  13  |      * EXPECTED: Header, total, all legend labels, and one tile per exact name agree with the API. */
  14  |     test('PCS-01: displays the correct inventory, statuses, and legend', async ({page, adminPages, shop}) => {
  15  |         const {pcs} = adminPages;
  16  |         const inventory = await shop.pcs();
  17  |         await page.goto('/pcs');
  18  |         await pcs.waitForReady();
  19  |         expect(await pcs.readComputerTotal()).toBe(10);
  20  |         expect((await pcs.readPcNames()).sort()).toEqual([...pcNames].sort());
  21  |         for (const label of ['Free', 'Rented', 'Issue', 'Unresponsive']) {
  22  |             await expect(pcs.legend.getByText(label, {exact: true})).toBeVisible();
  23  |         }
  24  |         for (const pc of inventory) {
  25  |             await expect(pcs.pcTile(pc.name)).toHaveCount(1);
  26  |             expect((await pcs.readStatus(pc.name)).toLowerCase()).toBe(pc.status);
  27  |             await expect(pcs.pcTile(pc.name).getByRole('button', {name: /rename|delete|remove/i})).toHaveCount(0);
  28  |         }
  29  |     });
  30  | 
  31  |     /* WHAT: Open and cancel registration without creating a PC.
  32  |      * TEST DATA: Type a new PC name into Add PC, then cancel.
  33  |      * EXPECTED: Fields/buttons appear, cancel closes the form, and inventory is unchanged. */
  34  |     test('PCS-02: cancels Add PC without changing inventory', async ({page, adminPages, shop}) => {
  35  |         const {pcs} = adminPages;
  36  |         const before = await shop.pcs();
  37  |         await page.goto('/pcs');
  38  |         await pcs.waitForReady();
  39  |         await pcs.openAddPc();
  40  |         await expect(pcs.pcName).toBeVisible();
  41  |         await expect(pcs.submitAddPc).toBeVisible();
  42  |         await expect(pcs.cancelAddPc).toBeVisible();
  43  |         await pcs.fillPcName('PCS-CANCELLED');
  44  |         await pcs.cancelPcRegistration();
  45  |         expect(await shop.pcs()).toEqual(before);
  46  |         expect(await pcs.readComputerTotal()).toBe(before.length);
  47  |     });
  48  | 
  49  |     /* WHAT: Register a valid new PC and verify saved state after refresh.
  50  |      * TEST DATA: A unique name with surrounding spaces.
  51  |      * EXPECTED: One trimmed Free PC is created, total increases once, and refresh creates no duplicate. */
  52  |     test('PCS-03: registers one new Free PC and preserves it after refresh', async ({page, adminPages, shop}) => {
  53  |         const {pcs} = adminPages;
  54  |         await page.goto('/pcs');
  55  |         await pcs.waitForReady();
  56  |         const before = await pcs.readComputerTotal();
  57  |         await pcs.registerPc('  PCS-NEW-01  ');
  58  |         expect(await pcs.readStatus('PCS-NEW-01')).toBe('Free');
  59  |         expect(await pcs.readComputerTotal()).toBe(before + 1);
  60  |         await page.reload();
  61  |         await pcs.waitForReady();
  62  |         await expect(pcs.pcTile('PCS-NEW-01')).toHaveCount(1);
  63  |         expect((await shop.pcs()).filter((pc) => pc.name === 'PCS-NEW-01')).toHaveLength(1);
  64  |         expect(await pcs.readComputerTotal()).toBe(before + 1);
  65  |     });
  66  | 
  67  |     for (const name of ['', '   ']) {
  68  |         /* WHAT: Reject a missing PC name with helpful feedback.
  69  |          * TEST DATA: The test title identifies empty or whitespace-only input.
  70  |          * EXPECTED: A visible name error and no new inventory record. */
  71  |         test(`PCS-04: rejects ${name === '' ? 'an empty' : 'a whitespace-only'} PC name`, async ({page, adminPages, shop}) => {
  72  |             const {pcs} = adminPages;
  73  |             const before = await shop.pcs();
  74  |             await page.goto('/pcs');
  75  |             await pcs.waitForReady();
  76  |             await pcs.openAddPc();
  77  |             await pcs.fillPcName(name);
  78  |             await pcs.submitAddPc.click();
  79  |             expect(await shop.pcs()).toEqual(before);
  80  |             await expect(pcs.addPcError).toHaveText('Enter a name for the PC.');
  81  |         });
  82  |     }
  83  | 
  84  |     /* WHAT: Reject an already registered name without hiding the reason.
  85  |      * TEST DATA: Submit the existing PCS-FREE-01 name.
  86  |      * EXPECTED: API rejection appears in the form, and exactly one copy of the PC remains. */
  87  |     test('PCS-05: shows duplicate-name feedback without adding another PC', async ({page, adminPages, shop}) => {
  88  |         const {pcs} = adminPages;
  89  |         await page.goto('/pcs');
  90  |         await pcs.waitForReady();
  91  |         await pcs.openAddPc();
  92  |         await pcs.fillPcName('PCS-FREE-01');
  93  |         const rejected = page.waitForResponse((response) => response.request().method() === 'POST'
  94  |             && new URL(response.url()).pathname === '/api/pcs');
  95  |         await pcs.submitAddPc.click();
  96  |         expect((await rejected).status()).toBe(400);
  97  |         expect((await shop.pcs()).filter((pc) => pc.name === 'PCS-FREE-01')).toHaveLength(1);
> 98  |         await expect(pcs.addPcError).toHaveText('PCS-FREE-01 already exists.');
      |                                      ^ Error: expect(locator).toHaveText(expected) failed
  99  |     });
  100 | });
  101 | 
  102 | test.describe('pcsAdmin — 2. Status and repairs', () => {
  103 |     for (const scenario of [
  104 |         {action: 'Issue and Resolve', change: 'markIssue', restore: 'resolveIssue', status: 'Issue'},
  105 |         {action: 'Unresponsive and Repair', change: 'markUnresponsive', restore: 'repairPc', status: 'Unresponsive'},
  106 |     ]) {
  107 |         /* WHAT: Flag and restore only the selected idle PC.
  108 |          * TEST DATA: PCS-FREE-01 beside similarly named PCS-FREE-010.
  109 |          * EXPECTED: The selected PC changes status and returns to Free with its repair flag cleared. */
  110 |         test(`PCS-06: ${scenario.action} updates only the exact named PC`, async ({page, adminPages, shop}) => {
  111 |             const {pcs} = adminPages;
  112 |             await page.goto('/pcs');
  113 |             await pcs.waitForReady();
  114 |             await pcs[scenario.change]('PCS-FREE-01');
  115 |             expect(await pcs.readStatus('PCS-FREE-01')).toBe(scenario.status);
  116 |             expect(await pcs.readStatus('PCS-FREE-010')).toBe('Free');
  117 |             await pcs[scenario.restore]('PCS-FREE-01');
  118 |             expect(await pcs.readStatus('PCS-FREE-01')).toBe('Free');
  119 |             expect((await shop.pcs()).find((pc) => pc.name === 'PCS-FREE-01').needsRepair).toBe(false);
  120 |         });
  121 |     }
  122 | 
  123 |     for (const name of ['PCS-FREE-REPAIR', 'PCS-RENTED-REPAIR']) {
  124 |         /* WHAT: Clear a known repair flag while preserving its PC/rental state.
  125 |          * TEST DATA: A working Free or Rented PC with needsRepair already set.
  126 |          * EXPECTED: Badge disappears; status and the active rental record stay unchanged. */
  127 |         test(`PCS-06: Repair preserves the working state of ${name}`, async ({page, adminPages, shop}) => {
  128 |             const {pcs} = adminPages;
  129 |             const before = await shop.rentalFor(name);
  130 |             await page.goto('/pcs');
  131 |             await pcs.waitForReady();
  132 |             const status = await pcs.readStatus(name);
  133 |             await expect(pcs.pcTile(name).getByText('needs repair', {exact: true})).toBeVisible();
  134 |             await pcs.repairPc(name);
  135 |             expect(await pcs.readStatus(name)).toBe(status);
  136 |             await expect(pcs.pcTile(name).getByText('needs repair', {exact: true})).toHaveCount(0);
  137 |             expect(await shop.rentalFor(name)).toEqual(before);
  138 |         });
  139 |     }
  140 | 
  141 |     for (const name of ['PCS-ISSUE-RENTED', 'PCS-UNRESPONSIVE-RENTED']) {
  142 |         /* WHAT: Repair a faulty PC whose customer's rental is still active.
  143 |          * TEST DATA: The named Issue/Unresponsive PC already has a rental.
  144 |          * EXPECTED: Working status becomes Rented, repair flag clears, and the same rental continues. */
  145 |         test(`PCS-06: repairing ${name} restores Rented without ending its rental`, async ({page, adminPages, shop}) => {
  146 |             const {pcs} = adminPages;
  147 |             const before = await shop.rentalFor(name);
  148 |             await page.goto('/pcs');
  149 |             await pcs.waitForReady();
  150 |             await pcs.repairPc(name);
  151 |             expect(await shop.rentalFor(name)).toEqual(before);
  152 |             expect(await pcs.readStatus(name)).toBe('Rented');
  153 |         });
  154 |     }
  155 | 
  156 |     for (const scenario of [
  157 |         {name: 'PCS-FREE-01', buttons: ['Start rental', 'Mark issue', 'Mark unresponsive']},
  158 |         {name: 'PCS-RENTED-01', buttons: ['Stop rental', 'Extend', 'Mark issue', 'Mark unresponsive']},
  159 |         {name: 'PCS-ISSUE-IDLE', buttons: ['Resolve', 'Mark unresponsive']},
  160 |         {name: 'PCS-UNRESPONSIVE-IDLE', buttons: ['Repair']},
  161 |         {name: 'PCS-ISSUE-RENTED', buttons: ['Stop rental', 'Extend', 'Transfer', 'Resolve', 'Mark unresponsive']},
  162 |         {name: 'PCS-UNRESPONSIVE-RENTED', buttons: ['Stop rental', 'Extend', 'Transfer', 'Repair']},
  163 |         {name: 'PCS-FREE-REPAIR', buttons: ['Start rental', 'Repair', 'Mark issue', 'Mark unresponsive']},
  164 |         {name: 'PCS-RENTED-REPAIR', buttons: ['Stop rental', 'Extend', 'Repair', 'Mark issue', 'Mark unresponsive']},
  165 |     ]) {
  166 |         /* WHAT: Check which actions are available for the named PC state.
  167 |          * TEST DATA: The scenario lists the exact buttons allowed for that seeded PC.
  168 |          * EXPECTED: All listed buttons appear and no other tile action is offered. */
  169 |         test(`PCS-07: offers the correct actions on ${scenario.name}`, async ({page, adminPages}) => {
  170 |             const {pcs} = adminPages;
  171 |             await page.goto('/pcs');
  172 |             await pcs.waitForReady();
  173 |             const labels = (await pcs.pcTile(scenario.name).getByRole('button').allTextContents()).map((text) => text.trim());
  174 |             expect(labels.sort()).toEqual([...scenario.buttons].sort());
  175 |         });
  176 |     }
  177 | });
  178 | 
```