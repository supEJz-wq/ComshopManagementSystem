/*
 * RESPONSIVE UI DATA AND EVIDENCE
 * Every API request is fulfilled locally. Unknown calls fail rather than reaching
 * PHP. These are layout checks, not substitutes for the real backend suites.
 */
const {test: base, expect} = require('@playwright/test');
const {homePageAdmin} = require('../pages/admin/homePageAdmin');
const {pcsPageAdmin} = require('../pages/admin/pcsPageAdmin');
const {rentalsPageAdmin} = require('../pages/admin/rentalsPageAdmin');
const {responsivePageAdmin} = require('../pages/admin/responsivePageAdmin');

// CSS viewport sizes, with touch enabled on phone/tablet profiles only.
const screens = [
    {name: 'phone-small', width: 360, height: 800, touch: true},
    {name: 'phone', width: 390, height: 844, touch: true},
    {name: 'tablet-portrait', width: 768, height: 1024, touch: true},
    {name: 'tablet-landscape', width: 1024, height: 768, touch: true},
    {name: 'laptop', width: 1366, height: 768, touch: false},
    {name: 'desktop', width: 1920, height: 1080, touch: false},
    {name: 'phone-landscape', width: 844, height: 390, touch: true},
];
const now = new Date('2026-11-02T09:00:00+08:00');
// Match the database's NVARCHAR(50) name limit rather than inventing invalid data.
const longName = 'RESP-PC-' + 'LONGNAME'.repeat(5) + 'XX';
function rental(pcId, seconds = 1800, elapsed = 300) {
    const startedAt = new Date(+now - elapsed * 1000).toISOString();
    return {id: pcId, pcId, startedAt, blockStartedAt: startedAt, blockSeconds: seconds,
        status: 'active', segments: [{seconds, amountCharged: 10}], transfers: []};
}
function dataset(mode = 'normal') {
    const pcs = [
        {id: 1, name: 'RESP-FREE-01', status: 'free', needsRepair: false},
        {id: 2, name: 'RESP-RENTED-01', status: 'rented', needsRepair: false},
        {id: 3, name: 'RESP-ISSUE-01', status: 'issue', needsRepair: true},
        {id: 4, name: 'RESP-OFFLINE-01', status: 'unresponsive', needsRepair: true},
    ];
    if (mode === 'empty') return {pcs: [], rentals: []};
    if (mode === 'large') {
        return {pcs: Array.from({length: 4000}, (_, i) => ({id: i + 1, name: `COUNT-${i}`, status: ['free', 'rented', 'issue', 'unresponsive'][i % 4]})), rentals: []};
    }
    if (mode === 'long') {
        for (let i = 5; i <= 40; i++) pcs.push({id: i, name: i === 5 ? longName : `RESP-LIST-${String(i).padStart(2, '0')}`, status: i <= 25 ? 'rented' : 'free', needsRepair: false});
        return {pcs, rentals: [rental(2, 1800, 300), rental(3, 1800, 1750), rental(5, 1800, 300000), ...Array.from({length: 20}, (_, i) => rental(i + 6))]};
    }
    return {pcs, rentals: [rental(2), rental(3, 86340)]};
}

const test = base.extend({
    ui: async ({page}, use, testInfo) => {
        let data = dataset();
        let failedRead = '';
        const unexpected = [];
        const writes = [];
        const errorText = 'The requested test data could not be loaded. Check the connection and try opening this page again.';
        await page.clock.install({time: now});
        await page.route('**/api/**', async route => {
            const request = route.request();
            const url = new URL(request.url());
            const responses = {
                '/api/auth/me': {ok: true, user: {id: 1, username: 'responsive-admin', role: 'Admin', active: true}},
                '/api/auth/cashier': {ok: true, cashier: null},
                '/api/pcs': {ok: true, pcs: data.pcs},
                '/api/rentals/active': {ok: true, rentals: data.rentals},
                '/api/payments': {ok: true, payments: []},
                '/api/payments/refunds': {ok: true, refunds: []},
                '/api/rentals/targets': {ok: true, targets: data.pcs.filter(pc => ['free', 'issue'].includes(pc.status)
                    && !data.rentals.some(item => item.pcId === pc.id) && pc.id !== Number(url.searchParams.get('fromPcId')))},
            };
            if (request.method() === 'GET' && responses[url.pathname]) {
                await route.fulfill({status: failedRead === url.pathname ? 500 : 200,
                    json: failedRead === url.pathname ? {ok: false, error: errorText} : responses[url.pathname]});
                return;
            }
            // Reproduce duplicate-name feedback without creating or changing a PC.
            if (request.method() === 'POST' && url.pathname === '/api/pcs') {
                writes.push({path: url.pathname, body: request.postDataJSON()});
                await route.fulfill({status: 400, json: {ok: false, error: 'RESP-FREE-01 already exists.'}});
                return;
            }
            unexpected.push(`${request.method()} ${url.pathname}`);
            await route.fulfill({status: 501, json: {ok: false, error: 'Unexpected responsive test request'}});
        });
        const layout = new responsivePageAdmin(page);
        const evidence = [];
        const failures = [];
        const feedbackNotVerified = [];
        let screenshots = 0;
        const ui = {
            layout, home: new homePageAdmin(page), pcs: new pcsPageAdmin(page), rentals: new rentalsPageAdmin(page),
            failures, writes, errorText, longName,
            setData: mode => {data = dataset(mode);},
            failRead: endpoint => {failedRead = endpoint;},
            // Save measured geometry and screenshots. Specs make the final assertion
            // after all stages, so one bad screen does not hide the other controls.
            audit: async (phase, container = layout.main) => {
                const metrics = await layout.readLayout(container);
                const fits = metrics.documentWidth <= metrics.viewport + 1
                    && metrics.container.left >= -1 && metrics.container.right <= metrics.viewport + 1
                    && metrics.containerContentWidth <= metrics.containerClientWidth + 1 && metrics.clipped.length === 0;
                evidence.push({phase, fits, ...metrics});
                if (!fits) failures.push({phase, ...metrics});
                if ((!fits && screenshots < 2) || evidence.length === 1) {
                    screenshots++;
                    const name = phase.replace(/[^a-z0-9-]+/gi, '-');
                    // Capture the actual device viewport. Expanding a mobile page
                    // for a full-page image can disturb later touch coordinates.
                    await testInfo.attach(name, {body: await page.screenshot({fullPage: false}), contentType: 'image/png'});
                }
            },
            control: async (name, locator) => {
                const bounds = await layout.readControlBounds(locator);
                if (bounds.left < -1 || bounds.right > page.viewportSize().width + 1 || bounds.width <= 0 || bounds.height <= 0) failures.push({control: name, viewport: page.viewportSize().width, ...bounds});
            },
            // Missing feedback belongs to functional feedback checks. It does
            // not prove a layout failure, and absent text cannot be measured.
            missing: message => {
                feedbackNotVerified.push(message);
                testInfo.annotations.push({type: 'Feedback layout not verified', description: message});
            },
        };
        await use(ui);
        await testInfo.attach('layout-measurements', {body: Buffer.from(JSON.stringify({evidence, writes, unexpected, feedbackNotVerified}, null, 2)), contentType: 'application/json'});
        expect(unexpected, 'No test API call should escape the prepared responsive setup.').toEqual([]);
    },
});

module.exports = {test, expect, screens};
