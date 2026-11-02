/*
 * ADMIN RESPONSIVE UI PAGE OBJECT
 * Read layout geometry and navigate through the real sidebar.
 * Expectations stay in the specs; no CSS or application state is changed here.
 */
class responsivePageAdmin {
    constructor(page) {
        this.page = page;
        this.main = page.getByRole('main');
        this.sidebar = page.getByRole('complementary');
        this.errorHeading = this.main.getByRole('heading', {name: 'Could not load this screen', exact: true});
    }

    /** Tap for touch profiles; use a normal click for desktop profiles. */
    async activate(locator) {
        if (await this.page.evaluate(() => navigator.maxTouchPoints > 0)) await locator.tap();
        else await locator.click();
    }

    /** Follow the actual navigation link rather than substituting a direct URL. */
    async navigate(label) {
        await this.activate(this.sidebar.getByRole('link', {name: label, exact: true}));
    }

    /**
     * Read widths in CSS pixels after fonts load. Compare with the requested
     * viewport, because mobile overflow can enlarge window.innerWidth itself.
     * Vertical scrolling is allowed; horizontal page overflow is not.
     */
    async readLayout(container = this.main) {
        // Wait for the real startup fade, so screenshots do not capture the
        // temporary overlay as a pale/covered application screen.
        await this.page.locator('.app-boot').waitFor({state: 'hidden'});
        await this.page.evaluate(() => document.fonts.ready);
        const viewport = this.page.viewportSize();
        return container.evaluate((element, viewport) => {
            const rect = element.getBoundingClientRect();
            const sidebar = document.querySelector('aside').getBoundingClientRect();
            const round = value => Math.round(value * 100) / 100;
            const clipped = [...element.querySelectorAll('h2,h3,p,button,span.font-semibold')]
                .filter(node => node.getClientRects().length && node.clientWidth > 0
                    && node.scrollWidth > node.clientWidth + 1)
                .slice(0, 12).map(node => ({
                    text: node.textContent.trim().slice(0, 120),
                    width: node.clientWidth, contentWidth: node.scrollWidth,
                }));
            return {
                viewport: viewport.width,
                documentWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
                innerWidth: window.innerWidth,
                sidebarWidth: round(sidebar.width),
                container: {left: round(rect.left + scrollX), right: round(rect.right + scrollX), width: round(rect.width)},
                containerContentWidth: element.scrollWidth,
                containerClientWidth: element.clientWidth,
                clipped,
            };
        }, viewport);
    }

    /** Read horizontal geometry without triggering a browser auto-scroll/zoom. */
    async readControlBounds(locator) {
        return locator.evaluate((element) => {
            const rect = element.getBoundingClientRect();
            return {left: rect.left + scrollX, right: rect.right + scrollX, width: rect.width, height: rect.height};
        });
    }
}
module.exports = {responsivePageAdmin};
