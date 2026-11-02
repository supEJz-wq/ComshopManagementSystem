// Responsive UI checks render the real client with intercepted test API data.
// run-responsive.cjs owns the temporary frontend; no PHP or SQL writes are needed.
const {defineConfig} = require('@playwright/test');
const base = require('./playwright.config');

module.exports = defineConfig({
    ...base,
    testMatch: '**/*.responsive.spec.js',
    testIgnore: [],
    workers: 1,
    retries: 0,
    timeout: 60000,
    projects: [base.projects.find((project) => project.name === 'chromium')],
    use: {...base.use, baseURL: process.env.UI_BASE_URL, timezoneId: 'Asia/Manila', actionTimeout: 5000},
    outputDir: '../artifacts/responsive-output',
    reporter: [
        ['line'],
        ['json', {outputFile: '../artifacts/responsive-results.json'}],
        ['html', {outputFolder: '../artifacts/responsive-report', open: 'never'}],
    ],
});
