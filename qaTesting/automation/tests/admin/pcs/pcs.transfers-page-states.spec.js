/*
 * pcsAdmin — 6. Transfers, bill notifications, refresh, loading, and errors
 * All writes use the disposable backend. Page actions use the PCs/sidebar POMs.
 * API arrangement is used only to prepare the specific no-target/notification data.
 * Scenario types: Happy path = valid flow; Error path = expected rejection/failure;
 * Edge case = boundary/unusual state. TYPE comments and report tags describe the
 * scenario; pass/fail is a separate result. Filter with --grep @happy-path,
 * --grep @error-path, or --grep @edge-case.
 */
const {test, expect} = require('../../../fixtures/pcs.fixture');
const {clockSeconds} = require('./pcs.data');
test.use({timezoneId: 'Asia/Manila'});

test.describe('pcsAdmin — 6. Transfers', () => {
    for (const source of ['PCS-ISSUE-RENTED', 'PCS-UNRESPONSIVE-RENTED']) {
        /*
         * TYPE: Happy path / Edge case
         * WHAT: Offer only legal transfer destinations from a faulty rented PC.
         * TEST DATA: Free and idle Issue targets, plus occupied and Unresponsive PCs.
         * EXPECTED: Only the three idle Free PCs and idle Issue PC appear; source/occupied/faulty-unusable PCs do not. */
        test(`PCS-15: lists only eligible destinations from ${source} [Happy path / Edge case]`, {tag: ['@happy-path', '@edge-case']}, async ({page, adminPages}) => {
            const {pcs} = adminPages;
            await page.goto('/pcs');
            await pcs.waitForReady();
            await pcs.openTransfer(source);
            expect((await pcs.readTransferTargets(source)).sort()).toEqual([
                'PCS-FREE-01', 'PCS-FREE-010', 'PCS-FREE-REPAIR', 'PCS-ISSUE-IDLE',
            ].sort());
        });

        for (const target of ['PCS-FREE-01', 'PCS-ISSUE-IDLE']) {
            /*
             * TYPE: Happy path / Edge case
             * WHAT: Move one rental from the named faulty PC to a legal destination.
             * TEST DATA: Both Issue/Unresponsive sources and Free/Issue targets are covered separately.
             * EXPECTED: Same rental/clock/charges, one transfer, no bill, source fault retained, and target visibly Rented. */
            test(`PCS-16: transfers ${source} to ${target} without resetting time or charges [Happy path / Edge case]`, {tag: ['@happy-path', '@edge-case']}, async ({page, adminPages, shop}) => {
                const {pcs} = adminPages;
                const before = await shop.rentalFor(source);
                const total = (await shop.rentals()).length;
                await page.goto('/pcs');
                await pcs.waitForReady();
                const remaining = clockSeconds(await pcs.readRemainingTime(source));
                await pcs.transferRental(source, target);
                const after = await shop.rentalFor(target);
                expect(await shop.rentalFor(source)).toBeUndefined();
                expect(after.id).toBe(before.id);
                expect(after.startedAt).toBe(before.startedAt);
                expect(after.blockStartedAt).toBe(before.blockStartedAt);
                expect(after.blockSeconds).toBe(before.blockSeconds);
                expect(after.segments).toEqual(before.segments);
                expect(after.transfers).toHaveLength(before.transfers.length + 1);
                expect(await shop.rentals()).toHaveLength(total);
                expect(await shop.payments()).toHaveLength(0);
                const carried = clockSeconds(await pcs.readRemainingTime(target));
                expect(carried).toBeGreaterThanOrEqual(remaining - 10);
                expect(carried).toBeLessThanOrEqual(remaining + 1);
                expect(await pcs.readStatus(source)).toBe(source.includes('UNRESPONSIVE') ? 'Unresponsive' : 'Issue');
                expect(await pcs.readStatus(target)).toBe('Rented');
            });
        }
    }

    /*
     * TYPE: Edge case
     * WHAT: Cancel an open transfer without changing the customer's rental.
     * TEST DATA: PCS-ISSUE-RENTED has eligible destinations.
     * EXPECTED: Picker closes; inventory, rental, and transfer records remain unchanged. */
    test('PCS-17: cancelling Transfer leaves the rental on its source PC [Edge case]', {tag: '@edge-case'}, async ({page, adminPages, shop}) => {
        const {pcs} = adminPages;
        const before = {pcs: await shop.pcs(), rentals: await shop.rentals()};
        await page.goto('/pcs');
        await pcs.waitForReady();
        await pcs.openTransfer('PCS-ISSUE-RENTED');
        await pcs.cancelRentalPicker('PCS-ISSUE-RENTED');
        expect(await shop.pcs()).toEqual(before.pcs);
        expect(await shop.rentals()).toEqual(before.rentals);
    });

    /*
     * TYPE: Edge case
     * WHAT: Explain when no legal transfer destination is available.
     * TEST DATA: Mark every idle Free/Issue PC Unresponsive before opening the page.
     * EXPECTED: No-target message, no destination buttons, and the rental remains on its source. */
    test('PCS-17: shows the no-target message when all destinations are unavailable [Edge case]', {tag: '@edge-case'}, async ({page, adminPages, shop}) => {
        const {pcs} = adminPages;
        const occupied = new Set((await shop.rentals()).map((rental) => rental.pcId));
        for (const pc of await shop.pcs()) {
            if (!occupied.has(pc.id) && ['free', 'issue'].includes(pc.status)) {
                await shop.arrange(`/pcs/${pc.id}/status`, {status: 'unresponsive'}, 'PATCH');
            }
        }
        const before = await shop.rentalFor('PCS-ISSUE-RENTED');
        await page.goto('/pcs');
        await pcs.waitForReady();
        await pcs.openTransfer('PCS-ISSUE-RENTED');
        await expect(pcs.pcTile('PCS-ISSUE-RENTED').getByText('No other PC is free right now.', {exact: true})).toBeVisible();
        expect(await pcs.readTransferTargets('PCS-ISSUE-RENTED')).toEqual([]);
        expect(await shop.rentalFor('PCS-ISSUE-RENTED')).toEqual(before);
    });
});

test.describe('pcsAdmin — 7. Bills and refresh', () => {
    for (const count of [0, 1, 2]) {
        /*
         * TYPE: Edge case
         * WHAT: Display the unsettled bill notification with the correct count and total.
         * TEST DATA: No bills, or stop one/two prepared 30-minute rentals through setup API calls.
         * EXPECTED: Hidden at zero; otherwise correct bill/bills wording, peso total, and Payments navigation. */
        test(`PCS-19: handles ${count} unsettled ${count === 1 ? 'bill' : 'bills'} [Edge case]`, {tag: '@edge-case'}, async ({page, adminPages, shop}) => {
            const {pcs} = adminPages;
            for (const name of ['PCS-RENTED-01', 'PCS-RENTED-REPAIR'].slice(0, count)) {
                const pc = (await shop.pcs()).find((candidate) => candidate.name === name);
                await shop.arrange('/rentals/stop', {pcId: pc.id});
            }
            await page.goto('/pcs');
            await pcs.waitForReady();
            if (count === 0) {
                await expect(pcs.billsnotif).toHaveCount(0);
            } else {
                await expect(pcs.billsnotif).toHaveText(`${count} ${count === 1 ? 'bill' : 'bills'} · ₱${count * 10}`);
                await pcs.billsnotif.click();
                await expect(page).toHaveURL(/\/payments$/);
            }
        });
    }

    /*
     * TYPE: Happy path / Edge case
     * WHAT: Check that refresh preserves each saved PC/rental action without repeating it.
     * TEST DATA: Register -> flag -> repair -> start -> extend -> flag/transfer -> stop.
     * EXPECTED: API records remain identical across each reload and rendered statuses match saved PC state. */
    test('PCS-20: registration, status, repair, rental, extension, transfer, and bill survive refresh [Happy path / Edge case]', {tag: ['@happy-path', '@edge-case']}, async ({page, adminPages, shop}) => {
        const {pcs, sidebar} = adminPages;

        // Capture saved records, reload, and compare the same records plus the visible board.
        async function verifyRefresh() {
            const before = {pcs: await shop.pcs(), rentals: await shop.rentals(), payments: await shop.payments()};
            await page.reload();
            await pcs.waitForReady();
            expect(await shop.pcs()).toEqual(before.pcs);
            expect(await shop.rentals()).toEqual(before.rentals);
            expect(await shop.payments()).toEqual(before.payments);
            expect(await pcs.readComputerTotal()).toBe(before.pcs.length);
            for (const pc of before.pcs) {
                expect((await pcs.readStatus(pc.name)).toLowerCase()).toBe(pc.status);
            }
        }

        await page.goto('/pcs');
        await pcs.waitForReady();
        await test.step('Register once, then refresh', async () => {
            await pcs.registerPc('PCS-REFRESH-NEW');
            await verifyRefresh();
        });
        await test.step('Mark Issue and resolve it, refreshing after each action', async () => {
            await pcs.markIssue('PCS-FREE-01');
            await verifyRefresh();
            await pcs.resolveIssue('PCS-FREE-01');
            await verifyRefresh();
        });
        await test.step('Start and extend the same rental, refreshing after each action', async () => {
            await pcs.startRentalPreset('PCS-FREE-01', '30 min');
            await verifyRefresh();
            await pcs.extendRentalPreset('PCS-FREE-01', '30 min');
            // Wait for the provider's follow-up read before deliberately reloading.
            await expect.poll(async () => clockSeconds(await pcs.readBlockTime('PCS-FREE-01'))).toBeGreaterThan(3500);
            await verifyRefresh();
        });
        await test.step('Flag, transfer, and refresh without a second transfer', async () => {
            await pcs.markIssue('PCS-FREE-01');
            await pcs.transferRental('PCS-FREE-01', 'PCS-FREE-010');
            await verifyRefresh();
        });
        await test.step('Stop once and refresh without creating another bill', async () => {
            await pcs.stopRental('PCS-FREE-010');
            await sidebar.clickpcs();
            await pcs.waitForReady();
            await verifyRefresh();
            expect(await shop.payments()).toHaveLength(1);
        });
    });
});

test.describe('pcsAdmin — 8. Loading and errors', () => {
    for (const source of [
        {label: 'PC inventory', pathname: '/api/pcs'},
        {label: 'active rentals', pathname: '/api/rentals/active'},
        {label: 'payments', pathname: '/api/payments'},
        {label: 'refunds required by payments', pathname: '/api/payments/refunds'},
    ]) {
        /*
         * TYPE: Edge case
         * WHAT: Keep loading visible while the named required data source is delayed.
         * TEST DATA: Hold one real response until loading has been checked.
         * EXPECTED: Loading without PC tiles, then the ten-PC board after release. */
        test(`PCs loading: waits for ${source.label} [Edge case]`, {tag: '@edge-case'}, async ({page, adminPages}) => {
            const {pcs} = adminPages;
            let release;
            const gate = new Promise((resolve) => { release = resolve; });
            await page.route(`**${source.pathname}`, async (route) => {
                await gate;
                await route.continue();
            });
            try {
                await page.goto('/pcs');
                await expect(pcs.loading).toBeVisible();
                await expect(pcs.pcTiles).toHaveCount(0);
            } finally {
                release();
            }
            await pcs.waitForReady();
            expect(await pcs.readComputerTotal()).toBe(10);
        });

        /*
         * TYPE: Error path
         * WHAT: Display a useful error instead of an empty inventory when a read fails.
         * TEST DATA: The named browser API request returns HTTP 500 with a known message.
         * EXPECTED: Error heading/message appear; loading and PC tiles disappear. */
        test(`PCs errors: reports failed ${source.label} [Error path]`, {tag: '@error-path'}, async ({page, adminPages}) => {
            const {pcs} = adminPages;
            await page.route(`**${source.pathname}`, (route) => route.fulfill({
                status: 500, json: {ok: false, error: 'PCs test: required data unavailable.'},
            }));
            await page.goto('/pcs');
            await expect(pcs.errorHeading).toBeVisible();
            await expect(pcs.main.getByText('PCs test: required data unavailable.', {exact: true})).toBeVisible();
            await expect(pcs.loading).toHaveCount(0);
            await expect(pcs.pcTiles).toHaveCount(0);
        });
    }
});
