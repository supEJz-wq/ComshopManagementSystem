/*
 * pcsAdmin — 3. Rental start, validation, extensions, and stopping
 * Every case receives fresh PCs/rentals from pcs.fixture; no case relies on another.
 * Browser time zone matches the shop's Asia/Manila time zone.
 * Scenario types: Happy path = valid flow; Error path = expected rejection/failure;
 * Edge case = boundary/unusual state. TYPE comments and report tags describe the
 * scenario; pass/fail is a separate result. Filter with --grep @happy-path,
 * --grep @error-path, or --grep @edge-case.
 */
const {test, expect} = require('../../../fixtures/pcs.fixture');
const {presets, invalidDurations, clockSeconds} = require('./pcs.data');
test.use({timezoneId: 'Asia/Manila'});

test.describe('pcsAdmin — 3. Start a rental', () => {
    for (const preset of presets) {
        /*
         * TYPE: Happy path
         * WHAT: Start a rental with the preset named in the test title.
         * TEST DATA: Idle PCS-FREE-01; all six approved presets are tested separately.
         * EXPECTED: One new rental has the exact duration, appears on Rentals, and survives refresh. */
        test(`PCS-08: starts and saves the ${preset.label} preset [Happy path]`, {tag: '@happy-path'}, async ({page, adminPages, shop}) => {
            const {pcs, rentals, sidebar} = adminPages;
            const before = await shop.rentals();
            await page.goto('/pcs');
            await pcs.waitForReady();
            const started = await pcs.startRentalPreset('PCS-FREE-01', preset.label);
            expect(started.rental.blockSeconds).toBe(preset.seconds);
            expect(await pcs.readStatus('PCS-FREE-01')).toBe('Rented');
            expect(clockSeconds(await pcs.readBlockTime('PCS-FREE-01'))).toBe(preset.seconds);
            expect(await shop.rentals()).toHaveLength(before.length + 1);
            await sidebar.clickrentals();
            await rentals.waitForReady();
            await expect(rentals.rentalRow('PCS-FREE-01')).toHaveCount(1);
            await page.reload();
            await rentals.waitForReady();
            expect((await shop.rentalFor('PCS-FREE-01')).id).toBe(started.rental.id);
            await expect(rentals.rentalRow('PCS-FREE-01')).toHaveCount(1);
        });
    }

    for (const duration of [
        {label: 'the minimum one minute', value: {minutes: 1}, seconds: 60,
            type: 'Happy path / Edge case', tags: ['@happy-path', '@edge-case']},
        {label: 'mixed hours, minutes, and seconds', value: {hours: 1, minutes: 2, seconds: 3}, seconds: 3723,
            type: 'Happy path', tags: ['@happy-path']},
        {label: 'exactly 24 hours', value: {hours: 24}, seconds: 86400,
            type: 'Happy path / Edge case', tags: ['@happy-path', '@edge-case']},
    ]) {
        /*
         * TYPE: Happy path; minimum/maximum variants also Edge case (see duration.type)
         * WHAT: Accept the valid custom duration named in the test title.
         * TEST DATA: An idle Free PC and the explicit boundary/mixed input above.
         * EXPECTED: The saved rental and its displayed block both match the requested seconds. */
        test(`PCS-09: accepts ${duration.label} [${duration.type}]`, {tag: duration.tags}, async ({page, adminPages, shop}) => {
            const {pcs} = adminPages;
            await page.goto('/pcs');
            await pcs.waitForReady();
            await pcs.startRentalCustom('PCS-FREE-01', duration.value);
            expect((await shop.rentalFor('PCS-FREE-01')).blockSeconds).toBe(duration.seconds);
            expect(clockSeconds(await pcs.readBlockTime('PCS-FREE-01'))).toBe(duration.seconds);
            expect(await pcs.readStatus('PCS-FREE-010')).toBe('Free');
        });
    }

    for (const invalid of invalidDurations) {
        /*
         * TYPE: Error path / Edge case
         * WHAT: Reject the invalid start duration named in the title.
         * TEST DATA: See pcs.data.js for the input and browser/application validation layer.
         * EXPECTED: Visible validation (or an invalid number field); no rental or status change. */
        test(`PCS-10: rejects ${invalid.label} [Error path / Edge case]`, {tag: ['@error-path', '@edge-case']}, async ({page, adminPages, shop}) => {
            const {pcs} = adminPages;
            const before = await shop.rentals();
            await page.goto('/pcs');
            await pcs.waitForReady();
            await pcs.openStartPicker('PCS-FREE-01');
            await pcs.fillDuration('PCS-FREE-01', 'start', invalid.value);
            await pcs.pcTile('PCS-FREE-01').getByRole('button', {name: 'Start', exact: true}).click();
            if (invalid.nativePart) {
                expect(await pcs.durationField('PCS-FREE-01', 'start', invalid.nativePart)
                    .evaluate((input) => input.checkValidity())).toBe(false);
            } else {
                await expect(pcs.pcTile('PCS-FREE-01').getByRole('alert')).toHaveText(invalid.error);
            }
            expect(await shop.rentals()).toEqual(before);
            expect(await pcs.readStatus('PCS-FREE-01')).toBe('Free');
        });
    }

    for (const mode of ['start', 'extend']) {
        /*
         * TYPE: Happy path / Edge case
         * WHAT: Cancel a filled duration picker without changing server state.
         * TEST DATA: Start uses PCS-FREE-01; Extend uses PCS-RENTED-01.
         * EXPECTED: Picker closes, inventory and rental records remain identical. */
        test(`PCS-11: cancels the ${mode} picker without a mutation [Happy path / Edge case]`, {tag: ['@happy-path', '@edge-case']}, async ({page, adminPages, shop}) => {
            const {pcs} = adminPages;
            const before = {pcs: await shop.pcs(), rentals: await shop.rentals()};
            const name = mode === 'start' ? 'PCS-FREE-01' : 'PCS-RENTED-01';
            await page.goto('/pcs');
            await pcs.waitForReady();
            if (mode === 'start') await pcs.openStartPicker(name);
            else await pcs.openExtendPicker(name);
            await pcs.fillDuration(name, mode, {minutes: 2});
            await pcs.cancelRentalPicker(name);
            expect(await shop.pcs()).toEqual(before.pcs);
            expect(await shop.rentals()).toEqual(before.rentals);
        });
    }
});

test.describe('pcsAdmin — 4. Extend a rental', () => {
    for (const addition of [...presets, {label: 'custom 2 min 3 sec', seconds: 123, custom: {minutes: 2, seconds: 3}}]) {
        /*
         * TYPE: Happy path
         * WHAT: Add the named preset/custom duration to the same active rental.
         * TEST DATA: PCS-RENTED-01 has a fresh 30-minute rental.
         * EXPECTED: Exactly one segment is added; countdown rises within a 10-second allowance; no extra rental. */
        test(`PCS-12: extends an active rental by ${addition.label} [Happy path]`, {tag: '@happy-path'}, async ({page, adminPages, shop}) => {
            const {pcs} = adminPages;
            const before = await shop.rentalFor('PCS-RENTED-01');
            const count = (await shop.rentals()).length;
            await page.goto('/pcs');
            await pcs.waitForReady();
            const remaining = clockSeconds(await pcs.readRemainingTime('PCS-RENTED-01'));
            const response = addition.custom
                ? await pcs.extendRentalCustom('PCS-RENTED-01', addition.custom)
                : await pcs.extendRentalPreset('PCS-RENTED-01', addition.label);
            await expect.poll(async () => clockSeconds(await pcs.readBlockTime('PCS-RENTED-01')))
                .toBe(response.rental.blockSeconds);
            const after = await shop.rentalFor('PCS-RENTED-01');
            expect(after.id).toBe(before.id);
            expect(after.startedAt).toBe(before.startedAt);
            expect(after.segments).toHaveLength(before.segments.length + 1);
            expect(after.segments.at(-1).seconds).toBe(addition.seconds);
            expect(await shop.rentals()).toHaveLength(count);
            // The display uses a one-second tick. Wait for that tick to catch up
            // with the saved extension rather than reading the previous frame.
            await expect.poll(async () => clockSeconds(await pcs.readRemainingTime('PCS-RENTED-01')))
                .toBeGreaterThanOrEqual(remaining + addition.seconds - 10);
            const updated = clockSeconds(await pcs.readRemainingTime('PCS-RENTED-01'));
            expect(updated).toBeLessThanOrEqual(remaining + addition.seconds + 1);
        });
    }

    for (const invalid of invalidDurations) {
        /*
         * TYPE: Error path / Edge case
         * WHAT: Reject an invalid custom extension before changing the rental.
         * TEST DATA: The invalid input named in the title on PCS-RENTED-01.
         * EXPECTED: Browser/application feedback and the same stored rental/segments. */
        test(`PCS-13: rejects an extension of ${invalid.label} [Error path / Edge case]`, {tag: ['@error-path', '@edge-case']}, async ({page, adminPages, shop}) => {
            const {pcs} = adminPages;
            const before = await shop.rentalFor('PCS-RENTED-01');
            await page.goto('/pcs');
            await pcs.waitForReady();
            await pcs.openExtendPicker('PCS-RENTED-01');
            await pcs.fillDuration('PCS-RENTED-01', 'extend', invalid.value);
            await pcs.pcTile('PCS-RENTED-01').getByRole('button', {name: 'Add', exact: true}).click();
            if (invalid.nativePart) {
                expect(await pcs.durationField('PCS-RENTED-01', 'extend', invalid.nativePart)
                    .evaluate((input) => input.checkValidity())).toBe(false);
            } else {
                await expect(pcs.pcTile('PCS-RENTED-01').getByRole('alert')).toHaveText(invalid.error);
            }
            expect(await shop.rentalFor('PCS-RENTED-01')).toEqual(before);
        });
    }

    /*
     * TYPE: Happy path / Edge case
     * WHAT: Allow an extension that reaches exactly the total booked-time cap.
     * TEST DATA: PCS-CAP-RENTED has 23h 59m booked; add 1 minute.
     * EXPECTED: The booked segments total exactly 24 hours on the same rental. */
    test('PCS-13: accepts an extension reaching exactly 24 hours booked [Happy path / Edge case]', {tag: ['@happy-path', '@edge-case']}, async ({page, adminPages, shop}) => {
        await page.goto('/pcs');
        await adminPages.pcs.waitForReady();
        await adminPages.pcs.extendRentalCustom('PCS-CAP-RENTED', {minutes: 1});
        const rental = await shop.rentalFor('PCS-CAP-RENTED');
        expect(rental.segments.reduce((sum, piece) => sum + piece.seconds, 0)).toBe(86400);
    });

    /*
     * TYPE: Error path / Edge case
     * WHAT: Reject an otherwise valid extension that exceeds total booked time.
     * TEST DATA: PCS-CAP-RENTED has 23h 59m booked; add 2 minutes.
     * EXPECTED: Server rejects it, rental is unchanged, and the picker displays the rejection. */
    test('PCS-13: shows feedback when an extension exceeds 24 hours booked [Error path / Edge case]', {tag: ['@error-path', '@edge-case']}, async ({page, adminPages, shop}) => {
        const {pcs} = adminPages;
        const before = await shop.rentalFor('PCS-CAP-RENTED');
        await page.goto('/pcs');
        await pcs.waitForReady();
        await pcs.openExtendPicker('PCS-CAP-RENTED');
        await pcs.fillDuration('PCS-CAP-RENTED', 'extend', {minutes: 2});
        const rejected = page.waitForResponse((response) => response.request().method() === 'POST'
            && new URL(response.url()).pathname === '/api/rentals/extend');
        await pcs.pcTile('PCS-CAP-RENTED').getByRole('button', {name: 'Add', exact: true}).click();
        expect((await rejected).status()).toBe(400);
        expect(await shop.rentalFor('PCS-CAP-RENTED')).toEqual(before);
        await expect(pcs.pcTile('PCS-CAP-RENTED').getByRole('alert')).toHaveText('A rental cannot be longer than 24 hours.');
    });
});

test.describe('pcsAdmin — 5. Faults and stopping', () => {
    for (const action of ['markIssue', 'markUnresponsive']) {
        /*
         * TYPE: Happy path / Edge case
         * WHAT: Flag a rented PC without stranding its customer's rental.
         * TEST DATA: PCS-RENTED-01; the title identifies the fault action.
         * EXPECTED: Same rental/timestamps/segments; Stop, Extend, and Transfer stay available. */
        test(`PCS-14: ${action} preserves the rental and recovery actions [Happy path / Edge case]`, {tag: ['@happy-path', '@edge-case']}, async ({page, adminPages, shop}) => {
            const {pcs} = adminPages;
            const before = await shop.rentalFor('PCS-RENTED-01');
            await page.goto('/pcs');
            await pcs.waitForReady();
            await pcs[action]('PCS-RENTED-01');
            expect(await shop.rentalFor('PCS-RENTED-01')).toEqual(before);
            for (const name of ['Stop rental', 'Extend', 'Transfer']) {
                await expect(pcs.pcTile('PCS-RENTED-01').getByRole('button', {name, exact: true})).toBeVisible();
            }
        });
    }

    for (const scenario of [
        {name: 'PCS-RENTED-01', status: 'Rented', after: 'Free',
            type: 'Happy path', tags: ['@happy-path']},
        {name: 'PCS-ISSUE-RENTED', status: 'Issue', after: 'Issue',
            type: 'Happy path / Edge case', tags: ['@happy-path', '@edge-case']},
        {name: 'PCS-UNRESPONSIVE-RENTED', status: 'Unresponsive', after: 'Unresponsive',
            type: 'Happy path / Edge case', tags: ['@happy-path', '@edge-case']},
    ]) {
        /*
         * TYPE: Happy path; faulty-PC variants also Edge case (see scenario.type)
         * WHAT: Stop a healthy or faulty rental and check the payment handoff.
         * TEST DATA: The named PC has an active 30-minute booking; no bills exist yet.
         * EXPECTED: One unsettled bill, no active rental on that PC, Payments opens, and fault state is preserved. */
        test(`PCS-18: stopping a ${scenario.status} PC creates one bill and leaves it ${scenario.after} [${scenario.type}]`, {tag: scenario.tags}, async ({page, adminPages, shop}) => {
            const {pcs, sidebar} = adminPages;
            const before = await shop.rentalFor(scenario.name);
            await page.goto('/pcs');
            await pcs.waitForReady();
            await pcs.stopRental(scenario.name);
            await expect(page).toHaveURL(/\/payments$/);
            expect(await shop.rentalFor(scenario.name)).toBeUndefined();
            const bills = await shop.payments();
            expect(bills).toHaveLength(1);
            expect(bills[0].rental_id).toBe(before.id);
            expect(bills[0].is_settled).toBe(false);
            await sidebar.clickpcs();
            await pcs.waitForReady();
            expect(await pcs.readStatus(scenario.name)).toBe(scenario.after);
        });
    }
});
