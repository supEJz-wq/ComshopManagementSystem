/*
 * ADMIN HOME PAGE OBJECT
 *
 * Use this file to locate Home elements and read their displayed values.
 * Use home.spec.js / home.live.spec.js to check whether those values are correct.
 *
 * Reading order: locators -> page readiness -> status counts -> summary totals.
 * Call waitForReady() after opening or refreshing Home before reading counts.
 * Count readers return numbers, so tests can compare or add them directly.
 */
class homePageAdmin {
    constructor(page) {
        this.page = page;
        this.main = page.getByRole('main');

        // 1A. Heading and summary: support computer/computers and rental/rentals.
        this.heading = this.main.getByRole('heading', {name: 'Right now', exact: true});
        this.totals = this.main.getByText(/^\d+ computers? · \d+ active rentals?$/);

        // 1B. Status tiles: each exact label is a span directly inside its tile.
        // Its parent contains one numeric paragraph, so no positional .first() is needed.
        this.freeTile = this.main.getByText('Free', {exact: true}).locator('..');
        this.rentedTile = this.main.getByText('Rented', {exact: true}).locator('..');
        this.issueTile = this.main.getByText('Issue', {exact: true}).locator('..');
        this.unresponsiveTile = this.main.getByText('Unresponsive', {exact: true}).locator('..');

        // 1C. Loading and error: neither state should be read as zero counts.
        this.loading = this.main.getByRole('status', {name: 'Loading home', exact: true});
        this.errorHeading = this.main.getByRole('heading', {name: 'Could not load this screen', exact: true});
    }

    // 2. PAGE READINESS — use before reading values.

    /**
     * Wait for the loaded Home summary, which is absent from the skeleton/error screen.
     * @returns {Promise<void>}
     */
    async waitForReady() {
        await this.heading.waitFor({state: 'visible'});
        await this.totals.waitFor({state: 'visible'});
    }

    // 3. STATUS COUNTS — each reader uses its corresponding tile.

    /**
     * Read how many PCs are Free after Home is ready.
     * @returns {Promise<number>} The Free tile's displayed count.
     */
    async readFree() {
        return Number(await this.freeTile.locator('p').innerText());
    }

    /**
     * Read how many PCs have Rented status after Home is ready.
     * @returns {Promise<number>} The Rented tile's displayed count.
     */
    async readRented() {
        return Number(await this.rentedTile.locator('p').innerText());
    }

    /**
     * Read how many PCs have Issue status after Home is ready.
     * @returns {Promise<number>} The Issue tile's own count, not the Rented count.
     */
    async readIssue() {
        return Number(await this.issueTile.locator('p').innerText());
    }

    /**
     * Read how many PCs are Unresponsive after Home is ready.
     * @returns {Promise<number>} The Unresponsive tile's own count.
     */
    async readUnresponsive() {
        return Number(await this.unresponsiveTile.locator('p').innerText());
    }

    // 4. SUMMARY TOTALS — computer count and active rental count are separate values.

    /**
     * Read the computer total at the start of the loaded summary.
     * Example: "10 computers · 3 active rentals" returns 10.
     * @returns {Promise<number>} Total number of computers.
     */
    async readComputerTotal() {
        const summary = await this.totals.innerText();
        return Number(summary.match(/^(\d+) computers?\b/)[1]);
    }

    /**
     * Read the active rental total, which can differ from the Rented PC count.
     * An Issue/Unresponsive PC may still have an active rental.
     * Example: "10 computers · 3 active rentals" returns 3.
     * @returns {Promise<number>} Total number of active rentals after Home is ready.
     */
    async readActiveRentalTotal() {
        const summary = await this.totals.innerText();
        return Number(summary.match(/· (\d+) active rentals?$/)[1]);
    }
}
module.exports = { homePageAdmin };
