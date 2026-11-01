/*
 * HOME TEST SETUP
 *
 * homeData supplies the prepared PCs and rentals for a test.
 * home installs the prepared API responses and provides the Home page object.
 * Tests still open the page themselves, so loading/error tests can set up first.
 * Real sign-in and database data are checked separately in home.live.spec.js.
 */
const {test: base, expect} = require('@playwright/test');
const {homePageAdmin} = require('../pages/admin/homePageAdmin');

const test = base.extend({
    // Each test can provide its own inventory/rentals without changing the database.
    homeData: [{pcs: [], rentals: []}, {option: true}],

    home: async ({page, homeData}, use) => {
        const responses = {
            // Session responses let the app display its Admin navigation.
            '/api/auth/me': {ok: true, user: {id: 1, username: 'test-admin', role: 'Admin', active: true}},
            '/api/auth/cashier': {ok: true, cashier: null},
            // Home uses these two lists to build its counts.
            '/api/pcs': {ok: true, pcs: homeData.pcs},
            '/api/rentals/active': {ok: true, rentals: homeData.rentals},
            // Shared app providers request these even when Home displays no bills.
            '/api/payments': {ok: true, payments: []},
            '/api/payments/refunds': {ok: true, refunds: []},
        };

        // Fail unexpected API calls locally instead of allowing them to reach PHP.
        await page.route('**/api/**', async (route) => {
            const pathname = new URL(route.request().url()).pathname;
            const response = responses[pathname];
            const supported = route.request().method() === 'GET' && response !== undefined;
            await route.fulfill({
                status: supported ? 200 : 501,
                json: supported ? response : {ok: false, error: `Unexpected Home test request: ${pathname}`},
            });
        });

        await use(new homePageAdmin(page));
    },
});

module.exports = {test, expect};
