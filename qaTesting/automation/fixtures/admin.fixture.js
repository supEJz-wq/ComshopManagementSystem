/*
 * REAL ADMIN WORKFLOW SETUP
 *
 * The Admin test runner supplies a disposable database, local URL, and generated
 * test account. Direct runs without that environment fail before any mutation.
 * Provides the existing sidebar plus Home/PCs/Rentals page objects to each test.
 */
const {test: base, expect} = require('@playwright/test');
const {homePageAdmin} = require('../pages/admin/homePageAdmin');
const {pcsPageAdmin} = require('../pages/admin/pcsPageAdmin');
const {rentalsPageAdmin} = require('../pages/admin/rentalsPageAdmin');
const {sideBarAdmin} = require('../pages/admin/sideBarAdmin');

const test = base.extend({
    adminPages: async ({page}, use) => {
        if (!/^comshop_automation_[a-f0-9]{16}$/.test(process.env.HOME_FLOW_DATABASE || '')) {
            throw new Error('Use npm run test:home:flow or npm run test:pcs to create an isolated test environment.');
        }
        const response = await page.request.post('/api/auth/login', {
            data: {username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD},
        });
        const session = await response.json();
        if (!response.ok() || session.user?.role !== 'Admin') {
            throw new Error(session.error || 'The test Admin account could not sign in.');
        }
        await use({
            home: new homePageAdmin(page),
            pcs: new pcsPageAdmin(page),
            rentals: new rentalsPageAdmin(page),
            sidebar: new sideBarAdmin(page),
        });
    },
});

module.exports = {test, expect};
