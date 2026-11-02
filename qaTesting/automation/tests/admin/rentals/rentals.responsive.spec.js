/*
 * rentalsAdmin — UI RESPONSIVE ONLY
 * This starts the Rentals responsive coverage; the standalone timing/business
 * suite remains planned. Use controlled data and clock ticks for repeatable UI.
 */
const {test, expect, screens} = require('../../../fixtures/responsive.fixture');

for (const screen of screens) {
    test.describe(`${screen.name} ${screen.width}x${screen.height}`, () => {
        test.use({viewport: {width: screen.width, height: screen.height}, hasTouch: screen.touch, isMobile: screen.touch});

        /* TYPE: Happy path / Edge case. WHAT: Fit rows and navigate by touch/mouse.
         * TEST DATA: Two active rentals with names, Used time, countdown, and block.
         * EXPECTED: Every value remains readable and no horizontal page scroll is needed. */
        test('RESP-RENT-01: rental rows and navigation fit (UI Responsive)', {tag: ['@responsive', '@happy-path', '@edge-case']}, async ({page, ui}) => {
            await page.goto('/');
            await ui.home.waitForReady();
            await ui.layout.navigate('Rentals');
            await ui.rentals.waitForReady();
            expect(await ui.rentals.readRentalCount()).toBe(2);
            for (const name of ['RESP-RENTED-01', 'RESP-ISSUE-01']) {
                const row = ui.rentals.rentalRow(name);
                await expect(row.getByText(/^Used \d/)).toBeVisible();
                await expect(row.getByText('block', {exact: true})).toBeVisible();
            }
            await ui.audit('Active rental list');
            expect(ui.failures, 'Rental names and timers must fit the screen.').toEqual([]);
        });

        /* TYPE: Error path. WHAT: Fit both required-data failure states.
         * TEST DATA: Failed PCs then failed rentals.
         * EXPECTED: Full error and recovery guidance remain readable at this size. */
        test('RESP-RENT-02: Rentals errors fit (UI Responsive)', {tag: ['@responsive', '@error-path']}, async ({page, ui}) => {
            for (const endpoint of ['/api/pcs', '/api/rentals/active']) {
                ui.failRead(endpoint);
                await page.goto('/rentals');
                await expect(ui.layout.errorHeading).toBeVisible();
                await expect(ui.layout.main.getByText(ui.errorText, {exact: true})).toBeVisible();
                await ui.audit(`Rentals error ${endpoint}`);
            }
            expect(ui.failures, 'Rentals errors must fit the screen.').toEqual([]);
        });

        /* TYPE: Edge case. WHAT: Fit empty/long lists and keep clocks running.
         * TEST DATA: Empty rentals, then 23 rentals, long names and warning/elapsed values.
         * EXPECTED: Rows fit, the final row is reachable, resizing keeps rows, and
         * a controlled two-second tick decreases the same displayed countdown. */
        test('RESP-RENT-03: empty lists, long names, and resizing fit (UI Responsive)', {tag: ['@responsive', '@edge-case']}, async ({page, ui}) => {
            ui.setData('empty');
            await page.goto('/rentals');
            await ui.rentals.waitForReady();
            await expect(ui.rentals.emptyMessage).toBeVisible();
            await ui.audit('Empty Rentals');
            ui.setData('long');
            await page.reload();
            await ui.rentals.waitForReady();
            expect(await ui.rentals.readRentalCount()).toBe(23);
            await expect(ui.layout.main.getByText('1 min left', {exact: true})).toBeVisible();
            const row = ui.rentals.rentalRow(ui.longName);
            await ui.audit('Long rental name and Used time', row);
            await ui.rentals.rows.last().scrollIntoViewIfNeeded();
            const timer = ui.rentals.rentalRow('RESP-RENTED-01').locator('p.leading-none');
            const before = await timer.innerText();
            await page.setViewportSize({width: screen.height, height: screen.width});
            expect(await ui.rentals.readRentalCount()).toBe(23);
            await page.clock.runFor(2000);
            await expect(timer).not.toHaveText(before);
            await ui.audit('Rentals after resize');
            expect(ui.failures, 'Rows must fit after resizing without restarting timers.').toEqual([]);
        });
    });
}
