/*
 * pcsAdmin — 1. Board, registration, status, and repairs
 * Run: npm run test:pcs. Each test starts from the isolated ten-PC dataset.
 * POM methods perform actions; this file owns expectations and scenario explanations.
 * Scenario types: Happy path = valid flow; Error path = expected rejection/failure;
 * Edge case = boundary/unusual state. TYPE comments and report tags describe the
 * scenario; pass/fail is a separate result. Filter with --grep @happy-path,
 * --grep @error-path, or --grep @edge-case.
 */
const {test, expect} = require('../../../fixtures/pcs.fixture');
const {pcNames} = require('./pcs.data');
test.use({timezoneId: 'Asia/Manila'});

test.describe('pcsAdmin — 1. Board and registration', () => {
    /*
     * TYPE: Happy path
     * WHAT: Verify the board's inventory, legend, and PC names.
     * TEST DATA: Ten PCs covering Free/Rented/Issue/Unresponsive and repair flags.
     * EXPECTED: Header, total, all legend labels, and one tile per exact name agree with the API. */
    test('PCS-01: displays the correct inventory, statuses, and legend [Happy path]', {tag: '@happy-path'}, async ({page, adminPages, shop}) => {
        const {pcs} = adminPages;
        const inventory = await shop.pcs();
        await page.goto('/pcs');
        await pcs.waitForReady();
        expect(await pcs.readComputerTotal()).toBe(10);
        expect((await pcs.readPcNames()).sort()).toEqual([...pcNames].sort());
        for (const label of ['Free', 'Rented', 'Issue', 'Unresponsive']) {
            await expect(pcs.legend.getByText(label, {exact: true})).toBeVisible();
        }
        for (const pc of inventory) {
            await expect(pcs.pcTile(pc.name)).toHaveCount(1);
            expect((await pcs.readStatus(pc.name)).toLowerCase()).toBe(pc.status);
            await expect(pcs.pcTile(pc.name).getByRole('button', {name: /rename|delete|remove/i})).toHaveCount(0);
        }
    });

    /*
     * TYPE: Happy path / Edge case
     * WHAT: Open and cancel registration without creating a PC.
     * TEST DATA: Type a new PC name into Add PC, then cancel.
     * EXPECTED: Fields/buttons appear, cancel closes the form, and inventory is unchanged. */
    test('PCS-02: cancels Add PC without changing inventory [Happy path / Edge case]', {tag: ['@happy-path', '@edge-case']}, async ({page, adminPages, shop}) => {
        const {pcs} = adminPages;
        const before = await shop.pcs();
        await page.goto('/pcs');
        await pcs.waitForReady();
        await pcs.openAddPc();
        await expect(pcs.pcName).toBeVisible();
        await expect(pcs.submitAddPc).toBeVisible();
        await expect(pcs.cancelAddPc).toBeVisible();
        await pcs.fillPcName('PCS-CANCELLED');
        await pcs.cancelPcRegistration();
        expect(await shop.pcs()).toEqual(before);
        expect(await pcs.readComputerTotal()).toBe(before.length);
    });

    /*
     * TYPE: Happy path / Edge case
     * WHAT: Register a valid new PC and verify saved state after refresh.
     * TEST DATA: A unique name with surrounding spaces.
     * EXPECTED: One trimmed Free PC is created, total increases once, and refresh creates no duplicate. */
    test('PCS-03: registers one new Free PC and preserves it after refresh [Happy path / Edge case]', {tag: ['@happy-path', '@edge-case']}, async ({page, adminPages, shop}) => {
        const {pcs} = adminPages;
        await page.goto('/pcs');
        await pcs.waitForReady();
        const before = await pcs.readComputerTotal();
        await pcs.registerPc('  PCS-NEW-01  ');
        expect(await pcs.readStatus('PCS-NEW-01')).toBe('Free');
        expect(await pcs.readComputerTotal()).toBe(before + 1);
        await page.reload();
        await pcs.waitForReady();
        await expect(pcs.pcTile('PCS-NEW-01')).toHaveCount(1);
        expect((await shop.pcs()).filter((pc) => pc.name === 'PCS-NEW-01')).toHaveLength(1);
        expect(await pcs.readComputerTotal()).toBe(before + 1);
    });

    for (const name of ['', '   ']) {
        /*
         * TYPE: Error path / Edge case
         * WHAT: Reject a missing PC name with helpful feedback.
         * TEST DATA: The test title identifies empty or whitespace-only input.
         * EXPECTED: A visible name error and no new inventory record. */
        test(`PCS-04: rejects ${name === '' ? 'an empty' : 'a whitespace-only'} PC name [Error path / Edge case]`, {tag: ['@error-path', '@edge-case']}, async ({page, adminPages, shop}) => {
            const {pcs} = adminPages;
            const before = await shop.pcs();
            await page.goto('/pcs');
            await pcs.waitForReady();
            await pcs.openAddPc();
            await pcs.fillPcName(name);
            await pcs.submitAddPc.click();
            expect(await shop.pcs()).toEqual(before);
            await expect(pcs.addPcError).toHaveText('Enter a name for the PC.');
        });
    }

    /*
     * TYPE: Error path
     * WHAT: Reject an already registered name without hiding the reason.
     * TEST DATA: Submit the existing PCS-FREE-01 name.
     * EXPECTED: API rejection appears in the form, and exactly one copy of the PC remains. */
    test('PCS-05: shows duplicate-name feedback without adding another PC [Error path]', {tag: '@error-path'}, async ({page, adminPages, shop}) => {
        const {pcs} = adminPages;
        await page.goto('/pcs');
        await pcs.waitForReady();
        await pcs.openAddPc();
        await pcs.fillPcName('PCS-FREE-01');
        const rejected = page.waitForResponse((response) => response.request().method() === 'POST'
            && new URL(response.url()).pathname === '/api/pcs');
        await pcs.submitAddPc.click();
        expect((await rejected).status()).toBe(400);
        expect((await shop.pcs()).filter((pc) => pc.name === 'PCS-FREE-01')).toHaveLength(1);
        await expect(pcs.addPcError).toHaveText('PCS-FREE-01 already exists.');
    });
});

test.describe('pcsAdmin — 2. Status and repairs', () => {
    for (const scenario of [
        {action: 'Issue and Resolve', change: 'markIssue', restore: 'resolveIssue', status: 'Issue'},
        {action: 'Unresponsive and Repair', change: 'markUnresponsive', restore: 'repairPc', status: 'Unresponsive'},
    ]) {
        /*
         * TYPE: Happy path / Edge case
         * WHAT: Flag and restore only the selected idle PC.
         * TEST DATA: PCS-FREE-01 beside similarly named PCS-FREE-010.
         * EXPECTED: The selected PC changes status and returns to Free with its repair flag cleared. */
        test(`PCS-06: ${scenario.action} updates only the exact named PC [Happy path / Edge case]`, {tag: ['@happy-path', '@edge-case']}, async ({page, adminPages, shop}) => {
            const {pcs} = adminPages;
            await page.goto('/pcs');
            await pcs.waitForReady();
            await pcs[scenario.change]('PCS-FREE-01');
            expect(await pcs.readStatus('PCS-FREE-01')).toBe(scenario.status);
            expect(await pcs.readStatus('PCS-FREE-010')).toBe('Free');
            await pcs[scenario.restore]('PCS-FREE-01');
            expect(await pcs.readStatus('PCS-FREE-01')).toBe('Free');
            expect((await shop.pcs()).find((pc) => pc.name === 'PCS-FREE-01').needsRepair).toBe(false);
        });
    }

    for (const name of ['PCS-FREE-REPAIR', 'PCS-RENTED-REPAIR']) {
        /*
         * TYPE: Happy path / Edge case
         * WHAT: Clear a known repair flag while preserving its PC/rental state.
         * TEST DATA: A working Free or Rented PC with needsRepair already set.
         * EXPECTED: Badge disappears; status and the active rental record stay unchanged. */
        test(`PCS-06: Repair preserves the working state of ${name} [Happy path / Edge case]`, {tag: ['@happy-path', '@edge-case']}, async ({page, adminPages, shop}) => {
            const {pcs} = adminPages;
            const before = await shop.rentalFor(name);
            await page.goto('/pcs');
            await pcs.waitForReady();
            const status = await pcs.readStatus(name);
            await expect(pcs.pcTile(name).getByText('needs repair', {exact: true})).toBeVisible();
            await pcs.repairPc(name);
            expect(await pcs.readStatus(name)).toBe(status);
            await expect(pcs.pcTile(name).getByText('needs repair', {exact: true})).toHaveCount(0);
            expect(await shop.rentalFor(name)).toEqual(before);
        });
    }

    for (const name of ['PCS-ISSUE-RENTED', 'PCS-UNRESPONSIVE-RENTED']) {
        /*
         * TYPE: Happy path / Edge case
         * WHAT: Repair a faulty PC whose customer's rental is still active.
         * TEST DATA: The named Issue/Unresponsive PC already has a rental.
         * EXPECTED: Working status becomes Rented, repair flag clears, and the same rental continues. */
        test(`PCS-06: repairing ${name} restores Rented without ending its rental [Happy path / Edge case]`, {tag: ['@happy-path', '@edge-case']}, async ({page, adminPages, shop}) => {
            const {pcs} = adminPages;
            const before = await shop.rentalFor(name);
            await page.goto('/pcs');
            await pcs.waitForReady();
            await pcs.repairPc(name);
            expect(await shop.rentalFor(name)).toEqual(before);
            expect(await pcs.readStatus(name)).toBe('Rented');
        });
    }

    for (const scenario of [
        {name: 'PCS-FREE-01', buttons: ['Start rental', 'Mark issue', 'Mark unresponsive']},
        {name: 'PCS-RENTED-01', buttons: ['Stop rental', 'Extend', 'Mark issue', 'Mark unresponsive']},
        {name: 'PCS-ISSUE-IDLE', buttons: ['Resolve', 'Mark unresponsive']},
        {name: 'PCS-UNRESPONSIVE-IDLE', buttons: ['Repair']},
        {name: 'PCS-ISSUE-RENTED', buttons: ['Stop rental', 'Extend', 'Transfer', 'Resolve', 'Mark unresponsive']},
        {name: 'PCS-UNRESPONSIVE-RENTED', buttons: ['Stop rental', 'Extend', 'Transfer', 'Repair']},
        {name: 'PCS-FREE-REPAIR', buttons: ['Start rental', 'Repair', 'Mark issue', 'Mark unresponsive']},
        {name: 'PCS-RENTED-REPAIR', buttons: ['Stop rental', 'Extend', 'Repair', 'Mark issue', 'Mark unresponsive']},
    ]) {
        /*
         * TYPE: Edge case
         * WHAT: Check which actions are available for the named PC state.
         * TEST DATA: The scenario lists the exact buttons allowed for that seeded PC.
         * EXPECTED: All listed buttons appear and no other tile action is offered. */
        test(`PCS-07: offers the correct actions on ${scenario.name} [Edge case]`, {tag: '@edge-case'}, async ({page, adminPages}) => {
            const {pcs} = adminPages;
            await page.goto('/pcs');
            await pcs.waitForReady();
            const labels = (await pcs.pcTile(scenario.name).getByRole('button').allTextContents()).map((text) => text.trim());
            expect(labels.sort()).toEqual([...scenario.buttons].sort());
        });
    }
});
