/*
 * ADMIN HOME TESTS — controlled test data
 *
 * This file checks Home using prepared API responses. It makes no database writes.
 * Real sign-in and backend data are checked separately in home.live.spec.js.
 *
 * Read in this order:
 *   1. Display and counts
 *   2. Empty and singular states
 *   3. Refresh
 *   4. Loading and errors
 *
 * Every test explains WHAT it checks, its TEST DATA, and the EXPECTED result.
 * Scenario types: Happy path = valid flow; Error path = expected rejection/failure;
 * Edge case = boundary/unusual state. TYPE comments and report tags describe the
 * scenario; pass/fail is a separate result. Filter with --grep @happy-path,
 * --grep @error-path, or --grep @edge-case.
 */
const {test, expect} = require('../../../fixtures/home.fixture');

// SHARED TEST DATA
// Free = 1, Rented = 2, Issue = 3, Unresponsive = 4; total = 10 computers.
// Different values expose readers accidentally pointing at the wrong tile.
const pcs = [
    'free',
    'rented', 'rented',
    'issue', 'issue', 'issue',
    'unresponsive', 'unresponsive', 'unresponsive', 'unresponsive',
].map((status, index) => ({
    id: index + 1,
    name: `TEST-PC-${index + 1}`,
    status,
    needsRepair: ['issue', 'unresponsive'].includes(status),
}));

// PC 4 is flagged Issue but retains its rental: three rentals, only two Rented PCs.
const rentals = [2, 3, 4].map((pcId) => ({
    id: pcId,
    pcId,
    blockSeconds: 1800,
    status: 'active',
    startedAt: '2026-11-01T08:00:00+08:00',
    blockStartedAt: '2026-11-01T08:00:00+08:00',
    segments: [],
    transfers: [],
}));

// Default data for this file; the small-inventory cases below override it.
test.use({homeData: {pcs, rentals}});

test.describe('Admin Home — 1. Display and counts', () => {
    /*
     * TYPE: Happy path
     * WHAT: Check the Admin Home screen and all four status counts.
     * TEST DATA: 10 PCs with status counts 1 / 2 / 3 / 4 and 3 active rentals.
     * EXPECTED: Admin / Owner, Right now, the summary, and the correct tile values.
     */
    test('HOME-01/02: shows the loaded Admin Home and each correct status count [Happy path]', {tag: '@happy-path'}, async ({page, home}) => {
        await page.goto('/');
        await home.waitForReady();

        await expect(page.getByRole('complementary').getByText('Admin / Owner', {exact: true})).toBeVisible();
        await expect(home.heading).toBeVisible();
        await expect(home.totals).toHaveText('10 computers · 3 active rentals');
        expect(await home.readFree()).toBe(1);
        expect(await home.readRented()).toBe(2);
        expect(await home.readIssue()).toBe(3);
        expect(await home.readUnresponsive()).toBe(4);
    });

    /*
     * TYPE: Happy path
     * WHAT: Check that every PC is counted once across the four status tiles.
     * TEST DATA: The 10-PC inventory, divided into four different statuses.
     * EXPECTED: Each count is a whole number >= 0; their sum equals the computer total.
     */
    test('HOME-03: status counts are valid numbers and add up to the computer total [Happy path]', {tag: '@happy-path'}, async ({page, home}) => {
        await page.goto('/');
        await home.waitForReady();

        const counts = await Promise.all([
            home.readFree(), home.readRented(), home.readIssue(), home.readUnresponsive(),
        ]);
        for (const count of counts) {
            expect(Number.isInteger(count)).toBe(true);
            expect(count).toBeGreaterThanOrEqual(0);
        }
        expect(counts.reduce((sum, count) => sum + count, 0)).toBe(await home.readComputerTotal());
    });

    /*
     * TYPE: Happy path / Edge case
     * WHAT: Check that active rentals include a rental on a faulty PC.
     * TEST DATA: 2 Rented PCs plus 1 Issue PC that still has an active rental.
     * EXPECTED: 3 active rentals, even though the Rented tile shows only 2.
     */
    test('HOME-04: active rentals include rentals on faulty PCs [Happy path / Edge case]', {tag: ['@happy-path', '@edge-case']}, async ({page, home}) => {
        await page.goto('/');
        await home.waitForReady();

        expect(await home.readComputerTotal()).toBe(10);
        expect(await home.readActiveRentalTotal()).toBe(3);
        expect(await home.readActiveRentalTotal()).not.toBe(await home.readRented());
    });

});

test.describe('Admin Home — 2. Empty and singular states', () => {
    // Each named scenario below gets its own data and expected summary wording.
    for (const scenario of [
        {
            label: 'empty inventory',
            purpose: 'shows zero computers, zero rentals, and zero in every tile',
            data: {pcs: [], rentals: []},
            summary: '0 computers · 0 active rentals',
            freeCount: 0,
            rentedCount: 0,
        },
        {
            label: 'one idle computer',
            purpose: 'shows 1 computer, 0 active rentals, and Free = 1',
            data: {pcs: [pcs[0]], rentals: []},
            summary: '1 computer · 0 active rentals',
            freeCount: 1,
            rentedCount: 0,
        },
        {
            label: 'one rented computer',
            purpose: 'shows 1 computer, 1 active rental, and Rented = 1',
            data: {pcs: [pcs[1]], rentals: [rentals[0]]},
            summary: '1 computer · 1 active rental',
            freeCount: 0,
            rentedCount: 1,
        },
    ]) {
        test.describe(`HOME-07: ${scenario.label}`, () => {
            test.use({homeData: scenario.data});

            /*
             * TYPE: Edge case
             * WHAT: Check the empty or one-computer case named in this test group.
             * TEST DATA: See this scenario's data and purpose in the list above.
             * EXPECTED: Exact summary wording and all four status values match.
             */
            test(`${scenario.purpose} [Edge case]`, {tag: '@edge-case'}, async ({page, home}) => {
                await page.goto('/');
                await home.waitForReady();

                await expect(home.totals).toHaveText(scenario.summary);
                expect(await home.readComputerTotal()).toBe(scenario.data.pcs.length);
                expect(await home.readActiveRentalTotal()).toBe(scenario.data.rentals.length);
                expect(await home.readFree()).toBe(scenario.freeCount);
                expect(await home.readRented()).toBe(scenario.rentedCount);
                expect(await home.readIssue()).toBe(0);
                expect(await home.readUnresponsive()).toBe(0);
            });
        });
    }
});

test.describe('Admin Home — 3. Refresh', () => {
    /*
     * TYPE: Edge case
     * WHAT: Check that refreshing Home loads the prepared counts again.
     * TEST DATA: 10 computers and 3 active rentals before and after reload.
     * EXPECTED: Home stays open; summary, Issue = 3, and Unresponsive = 4 remain.
     */
    test('Home refresh: reloads the Admin summary without resetting counts [Edge case]', {tag: '@edge-case'}, async ({page, home}) => {
        await page.goto('/');
        await home.waitForReady();
        await page.reload();
        await home.waitForReady();

        await expect(page).toHaveURL(/\/$/);
        await expect(home.totals).toHaveText('10 computers · 3 active rentals');
        expect(await home.readIssue()).toBe(3);
        expect(await home.readUnresponsive()).toBe(4);
    });
});

test.describe('Admin Home — 4. Loading and errors', () => {
    // Repeat the checks for each required list; Home needs BOTH before showing counts.
    for (const source of [
        {label: 'the PC list', pathname: '/api/pcs'},
        {label: 'the active rental list', pathname: '/api/rentals/active'},
    ]) {
        test.describe(source.label, () => {
            /*
             * TYPE: Edge case
             * WHAT: Check loading while the list named in this group is delayed.
             * TEST DATA: Hold that response while the other list can arrive normally.
             * EXPECTED: Loading appears without counts; release then shows the summary.
             */
            test(`Shows loading while waiting for ${source.label} [Edge case]`, {tag: '@edge-case'}, async ({page, home}) => {
                let release;
                const gate = new Promise((resolve) => { release = resolve; });
                // Hold this list until the loading assertions finish.
                await page.route(`**${source.pathname}`, async (route) => {
                    await gate;
                    await route.fallback();
                });

                try {
                    await page.goto('/');
                    await expect(home.loading).toBeVisible();
                    await expect(home.totals).toHaveCount(0);
                    await expect(home.heading).toHaveCount(0);
                } finally {
                    // Always release pending requests, including when a loading assertion fails.
                    release();
                }

                await home.waitForReady();
                await expect(home.loading).toHaveCount(0);
                await expect(home.totals).toHaveText('10 computers · 3 active rentals');
            });

            /*
             * TYPE: Error path
             * WHAT: Check the error screen when the list named in this group fails.
             * TEST DATA: That API returns HTTP 500 and a known error message.
             * EXPECTED: Error heading/message appear; loading and count content are absent.
             */
            test(`Shows a useful error when ${source.label} cannot load [Error path]`, {tag: '@error-path'}, async ({page, home}) => {
                await page.route(`**${source.pathname}`, (route) => route.fulfill({
                    status: 500,
                    json: {ok: false, error: 'Home test: required data could not be loaded.'},
                }));
                await page.goto('/');

                await expect(home.errorHeading).toBeVisible();
                await expect(home.main.getByText('Home test: required data could not be loaded.', {exact: true})).toBeVisible();
                await expect(home.loading).toHaveCount(0);
                await expect(home.totals).toHaveCount(0);
                await expect(home.freeTile).toHaveCount(0);
            });
        });
    }
});
