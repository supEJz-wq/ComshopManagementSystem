/*
 * ADMIN PCs PAGE OBJECT
 *
 * Locators and methods are grouped by page area: registration, status/repair,
 * duration pickers, and transfers. Specs own expected results and test data.
 * Always select a PC by its exact name before using a repeated button.
 */
class pcsPageAdmin{
    constructor(page){
        this.page = page;
        this.main = page.getByRole('main');
        this.summary = this.main.getByText(/^\d+ computers?\. Names cannot/);
        this.errorHeading = this.main.getByRole('heading', {name: 'Could not load this screen', exact: true});
        // Only the legend has all status labels in a flex row with gap-3.
        this.legend = this.main.locator('div.flex.flex-wrap.gap-3').filter({
            has: page.getByText('Unresponsive', {exact: true}),
        });
        this.loading = page.getByRole('status', {name: 'Loading computers', exact: true});

        this.heading = page.getByRole('heading', {name: 'PCs', exact: true});
        this.billsnotif = page.getByRole('button', {name: /^\d+ bills? ·/});
        this.addpc = page.getByRole('button', {name: 'Add PC', exact: true});

        // Add PC form.
        this.pcName = page.getByRole('textbox', {name: 'PC name', exact: true});
        this.addPcForm = page.locator('form').filter({has: this.pcName});
        this.submitAddPc = this.addPcForm.getByRole('button', {name: 'Add PC', exact: true});
        this.cancelAddPc = this.addPcForm.getByRole('button', {name: 'Cancel', exact: true});
        this.addPcError = this.addPcForm.getByRole('alert');

        // Loading placeholders share border-l-4, but only real tiles own a name span.
        // These match multiple PCs. Select a tile by its exact name in your functions.
        this.pcTiles = page.locator('main div.border-l-4').filter({
            has: page.locator(':scope > span.font-semibold'),
        });
        this.pcNames = this.pcTiles.locator(':scope > span');
        this.pcStatus = this.pcTiles.getByText(/^(Free|Rented|Issue|Unresponsive)$/);
        this.needsRepair = this.pcTiles.getByText('needs repair', {exact: true});
        this.startRentalButton = this.pcTiles.getByRole('button', {name: 'Start rental', exact: true});
        this.stopRentalButton = this.pcTiles.getByRole('button', {name: 'Stop rental', exact: true});
        this.extend = this.pcTiles.getByRole('button', {name: 'Extend', exact: true});
        this.transfer = this.pcTiles.getByRole('button', {name: 'Transfer', exact: true});
        this.markIssueButton = this.pcTiles.getByRole('button', {name: 'Mark issue', exact: true});
        this.markUnresponsiveButton = this.pcTiles.getByRole('button', {name: 'Mark unresponsive', exact: true});
        this.resolve = this.pcTiles.getByRole('button', {name: 'Resolve', exact: true});
        this.repairButton = this.pcTiles.getByRole('button', {name: 'Repair', exact: true});

        // Start and extend duration controls, scoped to PC tiles because IDs repeat.
        this.startPresets = this.pcTiles.getByRole('button', {name: /^(30 min|[12356] hr)$/});
        this.startHours = this.pcTiles.locator('[id="custom-start-hours"]');
        this.startMinutes = this.pcTiles.locator('[id="custom-start-minutes"]');
        this.startSeconds = this.pcTiles.locator('[id="custom-start-seconds"]');
        this.confirmStart = this.pcTiles.getByRole('button', {name: 'Start', exact: true});
        this.extendPresets = this.pcTiles.getByRole('button', {name: /^\+(30 min|[12356] hr)$/});
        this.extendHours = this.pcTiles.locator('[id="custom-extend-hours"]');
        this.extendMinutes = this.pcTiles.locator('[id="custom-extend-minutes"]');
        this.extendSeconds = this.pcTiles.locator('[id="custom-extend-seconds"]');
        this.confirmExtend = this.pcTiles.getByRole('button', {name: 'Add', exact: true});
        this.cancelPicker = this.pcTiles.getByRole('button', {name: 'Cancel', exact: true});
        this.pickerError = this.pcTiles.getByRole('alert');

        // Transfer destination buttons contain the destination PC's name.
        this.transferPanel = this.pcTiles.locator('div.rounded-panel').filter({
            has: page.getByText('Move to another PC', {exact: true})
        });
        this.transferTargets = this.transferPanel.getByRole('button').filter({hasNotText: /^Cancel$/});
    }

    // PAGE READINESS AND PC SELECTION

    /** Wait for the loaded PCs board before selecting a tile. @returns {Promise<void>} */
    async waitForReady() {
        await this.heading.waitFor({state: 'visible'});
        await this.loading.waitFor({state: 'hidden'});
    }

    /**
     * Locate the tile whose own name exactly matches pcName.
     * Only direct name spans count, so a transfer destination cannot select another tile.
     * @param {string} pcName - Exact PC name, including spaces/capitalization.
     * @returns {import('@playwright/test').Locator}
     */
    pcTile(pcName) {
        const escaped = pcName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return this.pcTiles.filter({
            has: this.page.locator(':scope > span').filter({hasText: new RegExp(`^${escaped}$`)}),
        });
    }

    /** Read the status on one loaded PC tile. @returns {Promise<string>} */
    async readStatus(pcName) {
        return this.pcTile(pcName).getByText(/^(Free|Rented|Issue|Unresponsive)$/).innerText();
    }

    /** Read the computer total in the loaded board header. @returns {Promise<number>} */
    async readComputerTotal() {
        return Number((await this.summary.innerText()).match(/^(\d+)/)[1]);
    }

    /** Read the visible PC names; each tile has one direct name span. @returns {Promise<string[]>} */
    async readPcNames() {
        return (await this.pcNames.allTextContents()).map((name) => name.trim());
    }

    /** Read the countdown text, identified by the timer's leading-none paragraph. @returns {Promise<string>} */
    async readRemainingTime(pcName) {
        return this.pcTile(pcName).locator('p.leading-none').innerText();
    }

    /** Read the duration beside the word block, not the changing countdown. @returns {Promise<string>} */
    async readBlockTime(pcName) {
        return this.pcTile(pcName).locator('p').filter({hasText: /block$/}).locator('span.font-data').innerText();
    }

    // PC REGISTRATION — separate steps support invalid/cancel cases without waiting for a write.

    /** Open the Add PC form. @returns {Promise<void>} */
    async openAddPc() {
        await this.addpc.click();
        await this.pcName.waitFor({state: 'visible'});
    }

    /** Enter a proposed name, including invalid values for validation tests. @returns {Promise<void>} */
    async fillPcName(name) {
        await this.pcName.fill(name);
    }

    /** Close registration without submitting it. @returns {Promise<void>} */
    async cancelPcRegistration() {
        await this.cancelAddPc.click();
        await this.addPcForm.waitFor({state: 'hidden'});
    }

    /** Register a valid unique name and wait for its tile. @returns {Promise<object>} */
    async registerPc(name) {
        await this.openAddPc();
        await this.fillPcName(name);
        const data = await this._clickForApi(this.submitAddPc, 'POST', /^\/api\/pcs$/);
        await this.pcTile(name.trim()).waitFor({state: 'visible'});
        return data;
    }

    // STATUS ACTIONS — the selected PC's list refresh must finish before returning.

    /**
     * Mark an available PC as Issue and wait for its updated tile.
     * @param {string} pcName - Exact name of a PC offering Mark issue.
     * @returns {Promise<void>}
     */
    async markIssue(pcName) {
        const tile = this.pcTile(pcName);
        await this._clickForApi(tile.getByRole('button', {name: 'Mark issue', exact: true}),
            'PATCH', /^\/api\/pcs\/\d+\/status$/);
        await tile.getByText('Issue', {exact: true}).waitFor({state: 'visible'});
    }

    /**
     * Resolve an idle Issue PC back to Free and clear its repair flag.
     * Precondition: this PC has no active rental.
     * @returns {Promise<void>}
     */
    async resolveIssue(pcName) {
        const tile = this.pcTile(pcName);
        await this._clickForApi(tile.getByRole('button', {name: 'Resolve', exact: true}),
            'POST', /^\/api\/pcs\/repair$/);
        await tile.getByText('Free', {exact: true}).waitFor({state: 'visible'});
    }

    /** Mark only the exact named PC Unresponsive. @returns {Promise<void>} */
    async markUnresponsive(pcName) {
        const tile = this.pcTile(pcName);
        await this._clickForApi(tile.getByRole('button', {name: 'Mark unresponsive', exact: true}),
            'PATCH', /^\/api\/pcs\/\d+\/status$/);
        await tile.getByText('Unresponsive', {exact: true}).waitFor({state: 'visible'});
    }

    /**
     * Use the named PC's Repair or Resolve action and wait for its returned status.
     * The spec independently checks whether an active rental was preserved correctly.
     * @returns {Promise<object>}
     */
    async repairPc(pcName) {
        const tile = this.pcTile(pcName);
        const data = await this._clickForApi(tile.getByRole('button', {name: /^(Repair|Resolve)$/}),
            'POST', /^\/api\/pcs\/repair$/);
        const label = {free: 'Free', rented: 'Rented', issue: 'Issue', unresponsive: 'Unresponsive'}[data.pc.status];
        await tile.getByText(label, {exact: true}).waitFor({state: 'visible'});
        return data;
    }

    // DURATION PICKERS — fields repeat between tiles, so always scope by exact PC name.

    /** Open the start picker on an idle Free PC. @returns {Promise<void>} */
    async openStartPicker(pcName) {
        await this.pcTile(pcName).getByRole('button', {name: 'Start rental', exact: true}).click();
    }

    /** Open the extension picker on an active rental. @returns {Promise<void>} */
    async openExtendPicker(pcName) {
        await this.pcTile(pcName).getByRole('button', {name: 'Extend', exact: true}).click();
    }

    /** Locate a start/extend number field inside one tile. @returns {import('@playwright/test').Locator} */
    durationField(pcName, mode, part) {
        return this.pcTile(pcName).locator(`[id="custom-${mode}-${part}"]`);
    }

    /** Fill hours/minutes/seconds; blank or invalid numbers are allowed for validation tests. @returns {Promise<void>} */
    async fillDuration(pcName, mode, duration) {
        for (const part of ['hours', 'minutes', 'seconds']) {
            await this.durationField(pcName, mode, part).fill(String(duration[part] ?? ''));
        }
    }

    /** Cancel the current start/extend/transfer picker without changing the rental. @returns {Promise<void>} */
    async cancelRentalPicker(pcName) {
        await this.pcTile(pcName).getByRole('button', {name: 'Cancel', exact: true}).click();
        await this.pcTile(pcName).locator('div.rounded-panel').waitFor({state: 'hidden'});
    }

    // RENTAL ACTIONS — use the real API; the calling spec checks the resulting counts.

    /**
     * Start one rental on an idle Free PC using a visible preset such as 30 min.
     * Wait for the rental controls to appear; return the API data for independent checks.
     * @returns {Promise<object>} Successful start response, including the rental ID.
     */
    async startRentalPreset(pcName, label) {
        const tile = this.pcTile(pcName);
        await tile.getByRole('button', {name: 'Start rental', exact: true}).click();
        const data = await this._clickForApi(tile.getByRole('button', {name: label, exact: true}),
            'POST', /^\/api\/rentals\/start$/);
        await tile.getByRole('button', {name: 'Stop rental', exact: true}).waitFor({state: 'visible'});
        return data;
    }

    /** Start a valid custom duration on the named Free PC. @returns {Promise<object>} */
    async startRentalCustom(pcName, duration) {
        await this.openStartPicker(pcName);
        await this.fillDuration(pcName, 'start', duration);
        const data = await this._clickForApi(
            this.pcTile(pcName).getByRole('button', {name: 'Start', exact: true}),
            'POST', /^\/api\/rentals\/start$/);
        await this.pcTile(pcName).getByRole('button', {name: 'Stop rental', exact: true}).waitFor({state: 'visible'});
        return data;
    }

    /** Add a visible preset to an active rental. The label excludes the + prefix. @returns {Promise<object>} */
    async extendRentalPreset(pcName, label) {
        await this.openExtendPicker(pcName);
        return this._clickForApi(this.pcTile(pcName).getByRole('button', {name: `+${label}`, exact: true}),
            'POST', /^\/api\/rentals\/extend$/);
    }

    /** Add a valid custom duration to an active rental. @returns {Promise<object>} */
    async extendRentalCustom(pcName, duration) {
        await this.openExtendPicker(pcName);
        await this.fillDuration(pcName, 'extend', duration);
        return this._clickForApi(this.pcTile(pcName).getByRole('button', {name: 'Add', exact: true}),
            'POST', /^\/api\/rentals\/extend$/);
    }

    // TRANSFER PICKER — the destination name belongs to a button inside the source tile.

    /** Open Transfer and wait for the eligible-target lookup to finish. @returns {Promise<void>} */
    async openTransfer(pcName) {
        const tile = this.pcTile(pcName);
        await tile.getByRole('button', {name: 'Transfer', exact: true}).click();
        await tile.getByText('Move to another PC', {exact: true}).waitFor({state: 'visible'});
        await tile.getByText('Checking which PCs are free...', {exact: true}).waitFor({state: 'hidden'});
    }

    /** Read eligible destination PC names from the open source picker. @returns {Promise<string[]>} */
    async readTransferTargets(pcName) {
        return (await this.pcTile(pcName).locator('div.rounded-panel')
            .getByRole('button').filter({hasNotText: /^Cancel$/}).allTextContents()).map((name) => name.trim());
    }

    /** Move a rental to a named target; wait until its source no longer has Stop rental. @returns {Promise<object>} */
    async transferRental(fromPcName, toPcName) {
        await this.openTransfer(fromPcName);
        const data = await this._clickForApi(
            this.pcTile(fromPcName).locator('div.rounded-panel').getByRole('button', {name: toPcName, exact: true}),
            'POST', /^\/api\/rentals\/transfer$/);
        await this.pcTile(fromPcName).getByRole('button', {name: 'Stop rental', exact: true}).waitFor({state: 'hidden'});
        return data;
    }

    /**
     * Stop this PC's active rental, creating an unsettled bill and opening Payments.
     * This does not settle or delete the bill. Use an isolated database for this action.
     * @returns {Promise<object>} Successful stop response, including the new bill.
     */
    async stopRental(pcName) {
        const data = await this._clickForApi(
            this.pcTile(pcName).getByRole('button', {name: 'Stop rental', exact: true}),
            'POST', /^\/api\/rentals\/stop$/);
        await this.page.waitForURL(/\/payments$/);
        return data;
    }

    /**
     * Internal action helper: watch the matching API request before clicking.
     * Reject failed responses instead of allowing a failed action to look successful.
     * @returns {Promise<object>} Parsed successful API response.
     */
    async _clickForApi(button, method, pathname) {
        const pending = this.page.waitForResponse((response) =>
            response.request().method() === method && pathname.test(new URL(response.url()).pathname));
        await button.click();
        const response = await pending;
        const data = await response.json();
        if (!response.ok() || data.ok !== true) {
            throw new Error(data.error || `PC action failed: HTTP ${response.status()}`);
        }
        return data;
    }

}


module.exports = { pcsPageAdmin };
