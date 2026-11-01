// Run with both local servers up: node qaTesting/automation/check-refresh.cjs
// Uses the documented local demo accounts and only reads application data.
const { chromium, expect } = require('@playwright/test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs/promises');
const baseURL = process.env.UI_BASE_URL || 'http://localhost:5173';
const output = path.resolve(__dirname, '../artifacts/refresh-ui');
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };

async function main() {
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    for (const role of ['admin', 'cashier']) {
      const context = await browser.newContext({ baseURL, viewport: { width: Number(process.env.UI_VIEWPORT_WIDTH || 1280), height: 800 } });
      const login = await context.request.post('/api/auth/login', { data: { username: role, password: `${role}123` } });
      assert.equal(login.ok(), true, `${role} demo login failed`);
      const pages = role === 'admin'
        ? ['/', '/pcs', '/rentals', '/payments', '/revenue', '/analytics', '/accounts']
        : ['/', '/pcs', '/rentals', '/payments', '/revenue'];
      for (const routePath of pages) {
        const page = await context.newPage();
        const failures = [];
        page.on('pageerror', error => failures.push(error.message));
        const modules = deferred(), auth = deferred(), data = deferred();
        await page.route('**/src/main.jsx', async route => { await modules.promise; await route.continue(); });
        await page.route('**/api/**', async route => {
          const pathname = new URL(route.request().url()).pathname;
          if (pathname === '/api/auth/me') await auth.promise;
          else if (!pathname.startsWith('/api/auth/')) await data.promise;
          await route.continue();
        });
        await page.goto(routePath, { waitUntil: 'commit' });
        const overlay = await page.locator('.app-boot').elementHandle();
        const loader = page.getByRole('status');
        await expect(loader).toBeVisible();
        const before = await page.locator('.app-loading-track').boundingBox();
        assert.equal(before.y, 0, 'Loading line must stay at the top');
        await expect(page.locator('.app-loading-copy, .app-loading-brand, .app-loading-message')).toHaveCount(0);
        const authRequest = page.waitForRequest('**/api/auth/me');
        modules.resolve();
        await authRequest;
        await expect(loader).toHaveText('Loading your workspace…');
        await expect(page.locator('.app-boot')).toHaveCSS('opacity', '1');
        assert.deepEqual(await page.locator('.app-loading-track').boundingBox(), before, 'HTML → auth loading shifted');
        const dataRequest = page.waitForRequest(request => /\/api\/(pcs|payments|rentals|revenue|analytics)/.test(request.url()));
        auth.resolve();
        await dataRequest;
        let shellBounds, headerBounds, headingBounds;
        if (routePath !== '/accounts') {
          await expect(page.locator('.page-skeleton')).toBeVisible();
          assert.deepEqual(await page.locator('.app-loading-track').boundingBox(), before, 'Auth → page loading shifted');
          await expect(page.getByRole('link', { name: 'Home', exact: true })).toBeVisible();
          await expect(page.locator('.app-boot')).toHaveCSS('pointer-events', 'none');
          shellBounds = await page.locator('aside').boundingBox();
          headerBounds = await page.locator('.app-shell header').boundingBox();
          headingBounds = await page.locator('main .page-skeleton > .contents > div').first().boundingBox();
          await expect(page.locator('.page-skeleton button, .page-skeleton input, .page-skeleton select')).toHaveCount(0);
          assert.equal(await page.locator('.page-skeleton').evaluate(el => getComputedStyle(el).animationName), 'none');
          await expect(page.locator('.app-boot')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
        }
        if (role === 'admin' && ['/pcs', '/payments'].includes(routePath)) await page.screenshot({ path: path.join(output, `${routePath.slice(1)}-skeleton.png`) });
        data.resolve();
        await expect(loader).toHaveCount(0, { timeout: 20000 });
        await expect(page.locator('.app-boot')).toBeHidden();
        assert.equal(await overlay.evaluate(el => el === document.querySelector('.app-boot')), true, 'Loading overlay was remounted');
        await expect(page.locator('main')).not.toBeEmpty();
        if (shellBounds) {
          const readySidebar = await page.locator('aside').boundingBox();
          assert.deepEqual({ x: readySidebar.x, y: readySidebar.y, width: readySidebar.width }, { x: shellBounds.x, y: shellBounds.y, width: shellBounds.width }, 'Sidebar moved');
          assert.deepEqual(await page.locator('.app-shell header').boundingBox(), headerBounds, 'Header moved');
          const readyHeading = await page.locator('main > div > div').first().boundingBox();
          assert.deepEqual(readyHeading, headingBounds, 'Skeleton header changed size or position');
        }
        await expect(page.locator('aside')).toContainText(role === 'admin' ? 'Admin / Owner' : 'Cashier');
        assert.equal(await page.locator('.app-shell').evaluate(el => getComputedStyle(el).visibility), 'visible');
        assert.equal(new URL(page.url()).pathname, routePath, 'Refresh redirected to the wrong page');
        if (role === 'admin' && routePath === '/pcs') await page.screenshot({ path: path.join(output, 'pcs-after.png') });
        assert.deepEqual(failures, []);
        console.log(`PASS ${role} ${routePath}: HTML → auth → data → ready`);
        await page.close();
      }
      if (role === 'admin') {
        const page = await context.newPage();
        await page.addInitScript(() => {
          window.refreshMotion = [];
          document.addEventListener('transitionrun', event => {
            if (event.target.matches('.app-boot')) window.refreshMotion.push(`overlay:${event.propertyName}`);
          });
          document.addEventListener('animationstart', event => {
            if (event.target.matches('.app-shell')) window.refreshMotion.push(`page:${event.animationName}`);
          });
        });
        await page.setViewportSize({ width: 782, height: 892 });
        await page.goto('/pcs');
        await expect(page.getByRole('status')).toHaveCount(0);
        await expect(page.getByRole('heading', { name: 'PCs', exact: true })).toBeVisible();
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
        await page.screenshot({ path: path.join(output, 'pcs-small-after.png') });
        console.log('PASS small laptop PCs layout');
        await expect(page.locator('.app-boot')).toBeHidden();
        const motion = await page.evaluate(() => window.refreshMotion);
        assert.ok(motion.includes('overlay:opacity'), 'Loading overlay did not crossfade');
        assert.ok(motion.includes('page:app-reveal'), 'Ready page did not fade in');
        console.log('PASS overlay crossfade and page reveal');
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.reload();
        await expect(page.getByRole('status')).toHaveCount(0);
        assert.equal(await page.locator('.app-shell').evaluate(el => getComputedStyle(el).animationName), 'none');
        assert.equal(await page.locator('.app-loading-track').evaluate(el => getComputedStyle(el, '::after').animationName), 'none');
        assert.ok(await page.locator('.app-boot').evaluate(el => parseFloat(getComputedStyle(el).transitionDuration) <= 0.001));
        console.log('PASS reduced motion skips indicator animation and crossfade');
        await page.route('**/api/rentals/active', route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'Refresh test: rental data unavailable' }) }));
        await page.reload();
        await expect(page.getByRole('heading', { name: 'Could not load this screen' })).toBeVisible();
        await expect(page.getByRole('status')).toHaveCount(0);
        console.log('PASS page data failure exits loading and shows error');
        await page.close();
      }
      if (role === 'cashier') {
        const page = await context.newPage();
        await page.goto('/accounts');
        await expect(page).toHaveURL(`${baseURL}/`);
        await expect(page.getByRole('status')).toHaveCount(0);
        console.log('PASS cashier admin-only redirect');
        await page.close();
      }
      await context.close();
    }
    const context = await browser.newContext({ baseURL });
    const page = await context.newPage();
    await page.goto('/pcs');
    await expect(page).toHaveURL(`${baseURL}/login`);
    await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
    console.log('PASS signed-out refresh → login');
    await page.route('**/api/auth/me', route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'Refresh test: server unavailable' }) }));
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Cannot reach the server' })).toBeVisible();
    await expect(page.getByRole('status')).toHaveCount(0);
    console.log('PASS auth failure exits loading and shows error');
    await context.close();
  } finally {
    await browser.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
