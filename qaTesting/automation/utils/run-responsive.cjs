/*
 * FRONTEND-ONLY RESPONSIVE RUNNER
 * Starts one owned Vite child directly, runs the responsive specs, then stops it.
 * Direct child ownership avoids Windows shell teardown leaving a server open.
 * All API calls are intercepted by responsive.fixture.js, including writes.
 */
const path = require('node:path');
const net = require('node:net');
const {spawn} = require('node:child_process');
const automationDir = path.resolve(__dirname, '..');
const clientDir = path.resolve(automationDir, '../../client');

async function main() {
    const probe = net.createServer();
    await new Promise((resolve, reject) => {
        probe.once('error', reject);
        probe.listen(0, '127.0.0.1', resolve);
    });
    const port = probe.address().port;
    await new Promise(resolve => probe.close(resolve));
    const url = `http://127.0.0.1:${port}`;
    const frontend = spawn(process.execPath, [path.join(clientDir, 'node_modules/vite/bin/vite.js'),
        '--host', '127.0.0.1', '--port', String(port), '--strictPort'],
    {cwd: clientDir, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe']});
    let log = '';
    frontend.on('error', error => { log += error.message; });
    for (const stream of [frontend.stdout, frontend.stderr]) stream.on('data', data => {log = (log + data).slice(-4000);});
    try {
        let ready = false;
        for (let i = 0; i < 100; i++) {
            if (frontend.exitCode !== null || !frontend.pid) throw new Error(`Responsive frontend could not start: ${log}`);
            try {
                const response = await fetch(url, {signal: AbortSignal.timeout(1000)});
                await response.arrayBuffer();
                if (response.ok) {ready = true; break;}
            } catch { /* Wait until this run's server responds. */ }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        if (!ready) throw new Error(`Responsive frontend did not become ready: ${log}`);
        const child = spawn(process.execPath, [path.join(automationDir, 'node_modules/@playwright/test/cli.js'),
            'test', '--config=playwright.responsive.config.js', ...process.argv.slice(2)],
        {cwd: automationDir, windowsHide: true, stdio: 'inherit', env: {...process.env, UI_BASE_URL: url}});
        process.exitCode = await new Promise((resolve, reject) => {
            child.once('error', reject);
            child.once('exit', code => resolve(code ?? 1));
        });
    } finally {
        if (frontend.pid && frontend.exitCode === null && !frontend.signalCode) {
            const stopped = new Promise(resolve => frontend.once('exit', resolve));
            frontend.kill();
            await stopped;
        }
        console.log('Responsive test frontend stopped. No database was used.');
    }
}
main().catch(error => {console.error(error.message); process.exitCode = 1;});
