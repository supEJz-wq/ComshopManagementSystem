/*
 * homeAdmin — UI RESPONSIVE
 * Run: npm run test:responsive. Every case states its scenario and screen size.
 * Checks use the real React page and controlled API responses, with no DB writes.
 */
const {test, expect, screens} = require('../../../fixtures/responsive.fixture');

for (const screen of screens) {
    test.describe(`${screen.name} ${screen.width}x${screen.height}`, () => {
        test.use({viewport: {width: screen.width, height: screen.height}, hasTouch: screen.touch, isMobile: screen.touch});

        /* TYPE: Happy path / Edge case. WHAT: Fit Home and use navigation.
         * TEST DATA: Known inventory and rentals at this screen size.
         * EXPECTED: Summary/tiles fit; touch or mouse navigation reaches Home. */
        test('RESP-HOME-01: Home summary and navigation fit (UI Responsive)', {tag: ['@responsive', '@happy-path', '@edge-case']}, async ({page, ui}) => {
            await page.goto('/pcs');
            await ui.pcs.waitForReady();
            await ui.layout.navigate('Home');
            await ui.home.waitForReady();
            expect(await ui.home.readComputerTotal()).toBe(4);
            for (const tile of [ui.home.freeTile, ui.home.rentedTile, ui.home.issueTile, ui.home.unresponsiveTile]) await expect(tile).toBeVisible();
            await ui.audit('Home summary');
            await ui.control('Home navigation link', ui.layout.sidebar.getByRole('link', {name: 'Home', exact: true}));
            expect(ui.failures, 'Home must fit the requested screen width.').toEqual([]);
        });

        /* TYPE: Error path. WHAT: Fit required-data errors at each screen size.
         * TEST DATA: Failed PCs then failed rentals, with a full explanatory error.
         * EXPECTED: Error text is present, wraps, and stays inside the screen. */
        test('RESP-HOME-02: Home data errors fit (UI Responsive)', {tag: ['@responsive', '@error-path']}, async ({page, ui}) => {
            for (const endpoint of ['/api/pcs', '/api/rentals/active']) {
                ui.failRead(endpoint);
                await page.goto('/');
                await expect(ui.layout.errorHeading).toBeVisible();
                await expect(ui.layout.main.getByText(ui.errorText, {exact: true})).toBeVisible();
                await ui.audit(`Home error ${endpoint}`);
            }
            expect(ui.failures, 'Error messages must fit without horizontal scrolling.').toEqual([]);
        });

        /* TYPE: Edge case. WHAT: Resize empty and large Home counts.
         * TEST DATA: Zero PCs, then 4000 PCs with 1000 in each state.
         * EXPECTED: Tiles fit after orientation/size changes and counts persist. */
        test('RESP-HOME-03: empty and large counts survive resizing (UI Responsive)', {tag: ['@responsive', '@edge-case']}, async ({page, ui}) => {
            for (const mode of ['empty', 'large']) {
                ui.setData(mode);
                await page.goto('/');
                await ui.home.waitForReady();
                const total = mode === 'empty' ? 0 : 4000;
                expect(await ui.home.readComputerTotal()).toBe(total);
                await ui.audit(`Home ${mode} initial`);
                await page.setViewportSize({width: screen.height, height: screen.width});
                expect(await ui.home.readComputerTotal()).toBe(total);
                await ui.audit(`Home ${mode} rotated`);
                await page.setViewportSize({width: screen.width, height: screen.height});
            }
            expect(ui.failures, 'Home must reflow without resetting counts.').toEqual([]);
        });
    });
}
