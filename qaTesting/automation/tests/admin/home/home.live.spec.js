/*
 * ADMIN HOME — real backend check
 *
 * Requires the frontend, PHP API, database, and a working Admin test account.
 * Set ADMIN_USERNAME and ADMIN_PASSWORD in the terminal before running this file.
 * This test reads shop data; it does not change PCs, rentals, or bills.
 * Scenario types: Happy path = valid flow; Error path = expected rejection/failure;
 * Edge case = boundary/unusual state. TYPE comments and report tags describe the
 * scenario; pass/fail is a separate result. Filter with --grep @happy-path,
 * --grep @error-path, or --grep @edge-case.
 */
const {test, expect} = require('@playwright/test');
const {homePageAdmin} = require('../../../pages/admin/homePageAdmin');

test.describe('Admin Home — 5. Live backend', () => {
    /*
     * TYPE: Happy path / Edge case
     * WHAT: Check real Admin sign-in and compare every Home count with backend data.
     * TEST DATA: Current PCs/rentals returned to Home by the running PHP API.
     * EXPECTED: All four status counts and both totals match on opening and refresh.
     */
    test('Home live: Admin counts match the backend before and after refresh [Happy path / Edge case]', {tag: ['@happy-path', '@edge-case']}, async ({page}) => {
        const username = process.env.ADMIN_USERNAME;
        const password = process.env.ADMIN_PASSWORD;
        await test.step('Sign in with the configured Admin test account', async () => {
            expect(Boolean(username && password), 'Set ADMIN_USERNAME and ADMIN_PASSWORD for the live Home test.').toBe(true);

            // page.request shares the browser context's session cookies; sign-in is setup only.
            const login = await page.request.post('/api/auth/login', {data: {username, password}});
            expect(login.ok(), 'The configured Admin account must sign in successfully.').toBe(true);
            const session = await login.json();
            expect(session.user.role).toBe('Admin');
        });

        const home = new homePageAdmin(page);
        for (const refresh of [false, true]) {
            const stepName = refresh
                ? 'Refresh Home and compare all six counts again'
                : 'Open Home and compare all six counts';

            await test.step(stepName, async () => {
                // Capture the SAME responses used by Home so concurrent shop changes do not
                // make a separate API snapshot disagree with what the browser received.
                const pcsResponse = page.waitForResponse((response) => new URL(response.url()).pathname === '/api/pcs');
                const rentalsResponse = page.waitForResponse((response) => new URL(response.url()).pathname === '/api/rentals/active');
                if (refresh) await page.reload();
                else await page.goto('/');

                const [pcResult, rentalResult] = await Promise.all([pcsResponse, rentalsResponse]);
                expect(pcResult.ok()).toBe(true);
                expect(rentalResult.ok()).toBe(true);
                const {pcs} = await pcResult.json();
                const {rentals} = await rentalResult.json();
                await home.waitForReady();

                await expect(page.getByRole('complementary').getByText('Admin / Owner', {exact: true})).toBeVisible();
                expect(await home.readFree()).toBe(pcs.filter((pc) => pc.status === 'free').length);
                expect(await home.readRented()).toBe(pcs.filter((pc) => pc.status === 'rented').length);
                expect(await home.readIssue()).toBe(pcs.filter((pc) => pc.status === 'issue').length);
                expect(await home.readUnresponsive()).toBe(pcs.filter((pc) => pc.status === 'unresponsive').length);
                expect(await home.readComputerTotal()).toBe(pcs.length);
                expect(await home.readActiveRentalTotal()).toBe(rentals.length);
            });
        }
    });
});
