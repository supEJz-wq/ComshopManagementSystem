/*
 * homeAdmin — real PCs -> Home -> Rentals workflows
 *
 * Run with npm run test:home:flow. Its temporary database has four known PCs,
 * including one Issue PC with an active rental. The working shop is not modified.
 * Each test explains WHAT, TEST DATA, and EXPECTED, like the other Home tests.
 * Scenario types: Happy path = valid flow; Error path = expected rejection/failure;
 * Edge case = boundary/unusual state. TYPE comments and report tags describe the
 * scenario; pass/fail is a separate result. Filter with --grep @happy-path,
 * --grep @error-path, or --grep @edge-case.
 */
const {test, expect} = require('../../../fixtures/admin.fixture');

test.describe('homeAdmin — PCs and Rentals integration', () => {
    /*
     * TYPE: Happy path / Edge case
     * WHAT: Compare Home's active rental count with the actual Rentals page.
     * TEST DATA: One active rental on HOME-COMPARE-PC, which has Issue status.
     * EXPECTED: Both pages show one rental; its PC name is correct even though
     *           the Home Rented tile shows zero.
     */
    test('HOME-04: Home rental total matches the Rentals list [Happy path / Edge case]', {tag: ['@happy-path', '@edge-case']}, async ({page, adminPages}) => {
        const {home, rentals, sidebar} = adminPages;
        await page.goto('/');
        await home.waitForReady();
        const total = await home.readActiveRentalTotal();
        expect(total).toBe(1);
        expect(await home.readRented()).toBe(0);

        await sidebar.clickrentals();
        await rentals.waitForReady();
        expect(await rentals.readRentalCount()).toBe(total);
        expect(await rentals.readRentalNames()).toEqual(['HOME-COMPARE-PC']);
        await expect(rentals.rentalRow('HOME-COMPARE-PC')).toHaveCount(1);
    });

    /*
     * TYPE: Happy path / Edge case
     * WHAT: Change a PC status on PCs and check the updated Home status counts.
     * TEST DATA: HOME-STATUS-PC starts Free; HOME-STATUS-PC-10 is a different PC.
     * EXPECTED: Free decreases by 1 and Issue increases by 1; computer/rental
     *           totals stay unchanged. Resolve restores the original counts.
     */
    test('HOME-05: Home counts update after marking and resolving a PC issue [Happy path / Edge case]', {tag: ['@happy-path', '@edge-case']}, async ({page, adminPages}) => {
        const {home, pcs, sidebar} = adminPages;
        await page.goto('/');
        await home.waitForReady();
        const before = {
            free: await home.readFree(),
            issue: await home.readIssue(),
            rented: await home.readRented(),
            unresponsive: await home.readUnresponsive(),
            computers: await home.readComputerTotal(),
            rentals: await home.readActiveRentalTotal(),
        };

        await test.step('Mark the exact PC as Issue, then check Home', async () => {
            await sidebar.clickpcs();
            await pcs.waitForReady();
            await pcs.markIssue('HOME-STATUS-PC');
            expect(await pcs.readStatus('HOME-STATUS-PC-10')).toBe('Free');
            await sidebar.clickhome();
            await home.waitForReady();
            expect(await home.readFree()).toBe(before.free - 1);
            expect(await home.readIssue()).toBe(before.issue + 1);
            expect(await home.readRented()).toBe(before.rented);
            expect(await home.readUnresponsive()).toBe(before.unresponsive);
            expect(await home.readComputerTotal()).toBe(before.computers);
            expect(await home.readActiveRentalTotal()).toBe(before.rentals);
        });

        await test.step('Resolve that PC and check the restored Home counts', async () => {
            await sidebar.clickpcs();
            await pcs.waitForReady();
            await pcs.resolveIssue('HOME-STATUS-PC');
            await sidebar.clickhome();
            await home.waitForReady();
            expect(await home.readFree()).toBe(before.free);
            expect(await home.readIssue()).toBe(before.issue);
            expect(await home.readComputerTotal()).toBe(before.computers);
        });
    });

    /*
     * TYPE: Happy path
     * WHAT: Start/stop a rental on PCs and check Home's totals after each action.
     * TEST DATA: HOME-RENTAL-PC starts Free with no rental; use the 30 min preset.
     * EXPECTED: Start adds one active rental and changes Free -> Rented. Stop
     *           removes that rental, restores counts, and creates one unsettled bill.
     */
    test('HOME-06: Home counts update after starting and stopping a rental [Happy path]', {tag: '@happy-path'}, async ({page, adminPages}) => {
        const {home, pcs, rentals, sidebar} = adminPages;
        await page.goto('/');
        await home.waitForReady();
        const before = {
            free: await home.readFree(),
            rented: await home.readRented(),
            active: await home.readActiveRentalTotal(),
            computers: await home.readComputerTotal(),
        };
        const initialBills = await (await page.request.get('/api/payments')).json();
        let started;

        await test.step('Start a rental and check PCs, Home, and Rentals', async () => {
            await sidebar.clickpcs();
            await pcs.waitForReady();
            started = await pcs.startRentalPreset('HOME-RENTAL-PC', '30 min');
            expect(await pcs.readStatus('HOME-RENTAL-PC')).toBe('Rented');

            await sidebar.clickhome();
            await home.waitForReady();
            expect(await home.readActiveRentalTotal()).toBe(before.active + 1);
            expect(await home.readFree()).toBe(before.free - 1);
            expect(await home.readRented()).toBe(before.rented + 1);
            expect(await home.readComputerTotal()).toBe(before.computers);

            await sidebar.clickrentals();
            await rentals.waitForReady();
            expect(await rentals.readRentalCount()).toBe(before.active + 1);
            await expect(rentals.rentalRow('HOME-RENTAL-PC')).toHaveCount(1);
        });

        await test.step('Stop the rental, check its bill, and verify restored counts', async () => {
            await sidebar.clickpcs();
            await pcs.waitForReady();
            const stopped = await pcs.stopRental('HOME-RENTAL-PC');
            expect(stopped.rental.id).toBe(started.rental.id);
            expect(stopped.bill.settled).toBe(false);
            const {payments} = await (await page.request.get('/api/payments')).json();
            expect(payments).toHaveLength(initialBills.payments.length + 1);
            expect(payments.filter((bill) => bill.rental_id === started.rental.id)).toHaveLength(1);

            await sidebar.clickhome();
            await home.waitForReady();
            expect(await home.readActiveRentalTotal()).toBe(before.active);
            expect(await home.readFree()).toBe(before.free);
            expect(await home.readRented()).toBe(before.rented);
            expect(await home.readComputerTotal()).toBe(before.computers);

            await sidebar.clickrentals();
            await rentals.waitForReady();
            expect(await rentals.readRentalCount()).toBe(before.active);
            await expect(rentals.rentalRow('HOME-RENTAL-PC')).toHaveCount(0);
        });
    });
});
