/*
 * ADMIN PCs TEST SETUP
 *
 * Run with npm run test:pcs. Before EVERY test, reset only the runner-owned
 * disposable database, then let admin.fixture sign in and provide the POMs.
 * shop exposes real API reads and setup helpers; page actions stay in the POM.
 */
const {spawnSync} = require('node:child_process');
const path = require('node:path');
const {test: base, expect} = require('./admin.fixture');

const test = base.extend({
    resetPcsData: [async ({}, use, testInfo) => {
        if (process.env.AUTOMATION_SUITE !== 'pcs' || testInfo.config.workers !== 1) {
            throw new Error('Use npm run test:pcs with one worker so each test owns its reset.');
        }
        const result = spawnSync(process.env.PHP_BIN || 'php', [path.join(__dirname, '../utils/homeTestDatabase.php'), 'reset'], {
            windowsHide: true, encoding: 'utf8',
            input: JSON.stringify({
                suite: 'pcs', directory: process.env.AUTOMATION_DIRECTORY,
                database: process.env.HOME_FLOW_DATABASE,
                username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD,
            }),
        });
        if (result.error || result.status !== 0) {
            throw new Error(`PCs test data reset failed: ${result.error?.message || result.stderr || result.stdout}`);
        }
        await use();
    }, {auto: true}],

    shop: async ({page, adminPages}, use) => {
        // Requiring adminPages ensures the API reads share its authenticated session.
        void adminPages;
        async function read(route) {
            const response = await page.request.get(`/api${route}`);
            const data = await response.json();
            if (!response.ok() || data.ok !== true) throw new Error(data.error || `Could not read ${route}`);
            return data;
        }
        await use({
            pcs: async () => (await read('/pcs')).pcs,
            rentals: async () => (await read('/rentals/active')).rentals,
            payments: async () => (await read('/payments')).payments,
            rentalFor: async (name) => {
                const pc = (await read('/pcs')).pcs.find((candidate) => candidate.name === name);
                return (await read('/rentals/active')).rentals.find((rental) => rental.pcId === pc?.id);
            },
            // Backend-only arrangement for notification/no-target scenarios.
            // The test still exercises its named action through the page object.
            arrange: async (route, body, method = 'POST') => {
                const response = await page.request.fetch(`/api${route}`, {method, data: body});
                const data = await response.json();
                if (!response.ok() || data.ok !== true) throw new Error(data.error || `Setup failed: ${route}`);
                return data;
            },
        });
    },
});

module.exports = {test, expect};
