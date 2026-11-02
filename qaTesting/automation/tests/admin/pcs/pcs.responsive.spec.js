/*
 * pcsAdmin — UI RESPONSIVE
 * Readiness/actions reuse the PCs POM. Geometry/evidence use the responsive POM.
 * The test data intercepts every API request; opening/cancelling cannot write to SQL.
 */
const {test, expect, screens} = require('../../../fixtures/responsive.fixture');

for (const screen of screens) {
    test.describe(`${screen.name} ${screen.width}x${screen.height}`, () => {
        test.use({viewport: {width: screen.width, height: screen.height}, hasTouch: screen.touch, isMobile: screen.touch});

        /* TYPE: Happy path / Edge case. WHAT: Fit board and each editor.
         * TEST DATA: Free/rented/faulty PCs, duration inputs, and transfer targets.
         * EXPECTED: Controls fit and can be reached; opening/cancelling causes no writes. */
        test('RESP-PCS-01: board, registration, duration, and transfer controls fit (UI Responsive)', {tag: ['@responsive', '@happy-path', '@edge-case']}, async ({page, ui}) => {
            await page.goto('/');
            await ui.home.waitForReady();
            await ui.layout.navigate('PCs');
            await ui.pcs.waitForReady();
            await ui.audit('PC board');
            // The longest valid booking can overflow its own tile even when
            // the outer page still fits. Measure the timer tile independently.
            await ui.audit('Long rental timer tile', ui.pcs.pcTile('RESP-ISSUE-01'));
            // A phone already overflowing cannot establish usable touch editors.
            // Keep this failed; leave later controls unverified at this size.
            if (screen.width < 500 && ui.failures.length) expect(ui.failures, 'PC board overflows before form interaction; later controls are not verified.').toEqual([]);
            await ui.layout.activate(ui.pcs.addpc);
            await ui.pcs.fillPcName('RESP-DRAFT');
            await ui.audit('Add PC form', ui.pcs.addPcForm);
            await ui.control('Add PC input', ui.pcs.pcName);
            await ui.control('Add PC submit', ui.pcs.submitAddPc);
            await ui.layout.activate(ui.pcs.cancelAddPc);
            for (const [name, mode] of [['RESP-FREE-01', 'start'], ['RESP-RENTED-01', 'extend']]) {
                const tile = ui.pcs.pcTile(name);
                await ui.layout.activate(tile.getByRole('button', {name: mode === 'start' ? 'Start rental' : 'Extend', exact: true}));
                await ui.pcs.fillDuration(name, mode, {hours: 1, minutes: 2, seconds: 3});
                await ui.audit(`${mode} picker`, tile);
                for (const part of ['hours', 'minutes', 'seconds']) await ui.control(`${mode} ${part}`, ui.pcs.durationField(name, mode, part));
                await ui.control(`${mode} confirmation`, tile.getByRole('button', {name: mode === 'start' ? 'Start' : 'Add', exact: true}));
                await ui.layout.activate(tile.getByRole('button', {name: 'Cancel', exact: true}));
            }
            await ui.layout.activate(ui.pcs.pcTile('RESP-ISSUE-01').getByRole('button', {name: 'Transfer', exact: true}));
            await expect(ui.pcs.transferTargets).toHaveCount(1);
            await ui.audit('Transfer destinations', ui.pcs.pcTile('RESP-ISSUE-01'));
            await ui.control('Transfer destination', ui.pcs.transferTargets.first());
            await ui.layout.activate(ui.pcs.pcTile('RESP-ISSUE-01').getByRole('button', {name: 'Cancel', exact: true}));
            expect(ui.writes).toEqual([]);
            expect(ui.failures, 'PC controls must fit and be usable without horizontal scrolling.').toEqual([]);
        });

        /* TYPE: Error path. WHAT: Fit data/validation errors and recovery controls.
         * TEST DATA: Failed inventory, zero duration, empty/duplicate PC names.
         * EXPECTED: Present errors fit. Missing registration feedback is annotated
         * as unverified message-layout coverage, separately from layout failures.
         * The real backend suite owns rejection and feedback PASS/FAIL results. */
        test('RESP-PCS-02: PC data and form errors fit (UI Responsive)', {tag: ['@responsive', '@error-path']}, async ({page, ui}) => {
            ui.failRead('/api/pcs');
            await page.goto('/pcs');
            await expect(ui.layout.errorHeading).toBeVisible();
            await ui.audit('PC data error');
            if (screen.width < 500 && ui.failures.length) expect(ui.failures, 'PC error screen overflows; phone form checks remain unverified.').toEqual([]);
            ui.failRead('');
            await page.reload();
            await ui.pcs.waitForReady();
            for (const [name, mode] of [['RESP-FREE-01', 'start'], ['RESP-RENTED-01', 'extend']]) {
                const tile = ui.pcs.pcTile(name);
                await ui.layout.activate(tile.getByRole('button', {name: mode === 'start' ? 'Start rental' : 'Extend', exact: true}));
                await ui.pcs.fillDuration(name, mode, {hours: 0, minutes: 0, seconds: 0});
                await ui.layout.activate(tile.getByRole('button', {name: mode === 'start' ? 'Start' : 'Add', exact: true}));
                await expect(tile.getByRole('alert')).toBeVisible();
                await ui.audit(`${mode} invalid duration error`, tile);
                await ui.layout.activate(tile.getByRole('button', {name: 'Cancel', exact: true}));
            }
            for (const name of ['', '   ', 'RESP-FREE-01']) {
                await ui.pcs.openAddPc();
                await ui.pcs.fillPcName(name);
                const response = name.trim() ? page.waitForResponse(r => r.request().method() === 'POST' && new URL(r.url()).pathname === '/api/pcs') : null;
                await ui.layout.activate(ui.pcs.submitAddPc);
                if (response) expect((await response).status()).toBe(400);
                // A missing message cannot be measured for responsive wrapping.
                // This is already tracked by BUG-001/002/003 in the Excel report.
                try { await ui.pcs.addPcError.waitFor({state: 'visible', timeout: 1000}); }
                catch { ui.missing(`Registration feedback absent for ${name === '' ? 'empty' : name.trim() ? 'duplicate' : 'spaces-only'} name (existing BUG-001/002/003)`); }
                await ui.audit('Registration validation form', ui.pcs.addPcForm);
                await ui.pcs.cancelPcRegistration();
            }
            expect(ui.failures, 'The displayed errors and forms must fit the screen; absent-message layout is annotated separately.').toEqual([]);
        });

        /* TYPE: Edge case. WHAT: Fit long names/lists and preserve open editors.
         * TEST DATA: 40 PCs, a valid 50-character name, and many transfer targets.
         * EXPECTED: Names fit their tiles, vertical scrolling reaches the final
         * target/cancel, resizing preserves entered values, and no writes occur.
         * Native phone keyboard coverage remains manual, not simulated here. */
        test('RESP-PCS-03: long names, long transfers, and resize fit (UI Responsive)', {tag: ['@responsive', '@edge-case']}, async ({page, ui}) => {
            ui.setData('long');
            await page.goto('/pcs');
            await ui.pcs.waitForReady();
            await ui.audit('Long PC name', ui.pcs.pcTile(ui.longName));
            await ui.pcs.openTransfer('RESP-ISSUE-01');
            expect(await ui.pcs.transferTargets.count()).toBeGreaterThan(10);
            await ui.audit('Long transfer destination list', ui.pcs.pcTile('RESP-ISSUE-01'));
            // Preserve the measured failure instead of forcing a touch outside
            // the device viewport and pretending the remaining resize steps ran.
            if (ui.failures.length) expect(ui.failures, 'Long names/list overflow; later resize steps are not verified.').toEqual([]);
            await ui.control('Last transfer target', ui.pcs.transferTargets.last());
            await ui.control('Transfer cancel', ui.pcs.pcTile('RESP-ISSUE-01').getByRole('button', {name: 'Cancel', exact: true}));
            await ui.pcs.cancelRentalPicker('RESP-ISSUE-01');
            await ui.pcs.openStartPicker('RESP-FREE-01');
            await ui.pcs.fillDuration('RESP-FREE-01', 'start', {minutes: 2});
            await page.setViewportSize({width: screen.height, height: screen.width});
            await expect(ui.pcs.durationField('RESP-FREE-01', 'start', 'minutes')).toHaveValue('2');
            await ui.audit('Open picker after resize', ui.pcs.pcTile('RESP-FREE-01'));
            expect(ui.writes).toEqual([]);
            expect(ui.failures, 'Long content must remain inside its tile and screen.').toEqual([]);
        });
    });
}
