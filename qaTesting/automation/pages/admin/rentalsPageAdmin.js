/*
 * ADMIN RENTALS PAGE OBJECT — Home comparison support
 *
 * Read the loaded active rental list and identify rows by exact PC name.
 * Starting/stopping rentals belongs to pcsPageAdmin because its controls are on PCs.
 */
class rentalsPageAdmin {
    constructor(page) {
        this.page = page;
        this.main = page.getByRole('main');

        // Page states: the empty message is valid only after the heading has loaded.
        this.heading = this.main.getByRole('heading', {name: 'Active rentals', exact: true});
        this.loading = this.main.getByRole('status', {name: 'Loading rentals', exact: true});
        this.emptyMessage = this.main.getByText('No active rentals.', {exact: true});

        // Each rental card contains a Used time paragraph. Header/empty cards do not.
        this.rows = this.main.locator('div.rounded-card').filter({
            has: page.locator('p').filter({hasText: /^Used \d/}),
        });
        this.names = this.rows.locator('p.font-medium');
    }

    /** Wait for the actual Rentals page before counting its rows. @returns {Promise<void>} */
    async waitForReady() {
        await this.heading.waitFor({state: 'visible'});
        await this.loading.waitFor({state: 'hidden'});
    }

    /** Locate the loaded rental row for this exact PC name. @returns {import('@playwright/test').Locator} */
    rentalRow(pcName) {
        return this.rows.filter({has: this.page.getByText(pcName, {exact: true})});
    }

    /** Read the number of displayed rental rows after readiness. @returns {Promise<number>} */
    async readRentalCount() {
        return this.rows.count();
    }

    /** Read PC names in displayed rental order after readiness. @returns {Promise<string[]>} */
    async readRentalNames() {
        return (await this.names.allTextContents()).map((name) => name.trim());
    }
}

module.exports = {rentalsPageAdmin};
