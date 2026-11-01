/*
 * Run real Admin checks in a disposable environment.
 * Default: Home workflows. --suite=pcs: the Admin PCs suite.
 * Lifecycle: create test DB -> copied PHP API + Vite -> tests -> stop -> clean up.
 * Uses the installed PHP/SQL Server and existing client dependencies.
 * The working .env, server process, database, and frontend are not reconfigured.
 */
const fs = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const {randomBytes} = require('node:crypto');
const {pathToFileURL} = require('node:url');
const {spawn, spawnSync} = require('node:child_process');

const automationDir = path.resolve(__dirname, '..');
const projectDir = path.resolve(automationDir, '../..');
const temporaryParent = path.join(automationDir, '.temp');
const php = process.env.PHP_BIN || 'php';
const suiteOption = process.argv.slice(2).find((arg) => arg.startsWith('--suite='));
const suite = suiteOption ? suiteOption.slice('--suite='.length) : 'home';
if (!['home', 'pcs'].includes(suite)) throw new Error('Supported suites: home, pcs.');
const testArgs = process.argv.slice(2).filter((arg) => arg !== suiteOption);

/** Reserve an available localhost port for a test-only server. */
async function availablePort() {
    const server = net.createServer();
    await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', resolve);
    });
    const port = server.address().port;
    await new Promise((resolve) => server.close(resolve));
    return port;
}

/** Start a hidden child process; keep a short log for startup failures. */
function startServer(command, args, cwd) {
    const child = spawn(command, args, {cwd, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe']});
    child.log = '';
    child.on('error', (error) => { child.log += error.message; });
    for (const stream of [child.stdout, child.stderr]) {
        stream.on('data', (data) => { child.log = (child.log + data).slice(-12000); });
    }
    return child;
}

/** Wait for a test server to answer, failing promptly if its process exits. */
async function waitForServer(child, url, expectedStatus) {
    for (let attempt = 0; attempt < 100; attempt++) {
        if (child.exitCode !== null || child.signalCode || child.pid === undefined) {
            throw new Error(`Test server failed to start: ${child.log}`);
        }
        try {
            const response = await fetch(url, {signal: AbortSignal.timeout(1000)});
            await response.arrayBuffer();
            if (response.status === expectedStatus) return;
        } catch { /* The server may still be starting. */ }
        await new Promise((resolve) => setTimeout(resolve, 200));
    }
    throw new Error(`Test server did not become ready: ${url}\n${child.log}`);
}

/** Stop only a process started by this runner before releasing its database. */
async function stopServer(child) {
    if (!child || child.exitCode !== null || child.signalCode || !child.pid) return;
    const stopped = new Promise((resolve) => child.once('exit', resolve));
    child.kill();
    await stopped;
}

async function main() {
    fs.mkdirSync(temporaryParent, {recursive: true});
    const directory = fs.mkdtempSync(path.join(temporaryParent, 'home-flow-'));
    const settings = {
        directory,
        suite,
        database: `comshop_automation_${randomBytes(8).toString('hex')}`,
        username: 'home-test-admin',
        password: randomBytes(24).toString('hex'),
    };
    const databaseTool = path.join(__dirname, 'homeTestDatabase.php');
    const marker = path.join(directory, '.automation-database.json');
    let api;
    let frontend;

    // Credentials go over stdin to the helper and are never printed in a command.
    function databaseAction(action) {
        const result = spawnSync(php, [databaseTool, action], {
            cwd: projectDir, windowsHide: true, encoding: 'utf8', input: JSON.stringify(settings),
        });
        if (result.error) throw result.error;
        if (result.status !== 0) throw new Error(`Test database ${action} failed:\n${result.stderr}\n${result.stdout}`);
        process.stdout.write(result.stdout);
    }

    try {
        fs.cpSync(path.join(projectDir, 'server'), path.join(directory, 'server'), {recursive: true});
        databaseAction('create');
        const apiPort = await availablePort();
        const frontendPort = await availablePort();
        const apiURL = `http://127.0.0.1:${apiPort}`;
        const frontendURL = `http://127.0.0.1:${frontendPort}`;
        api = startServer(php, ['-S', `127.0.0.1:${apiPort}`, 'router.php'], path.join(directory, 'server'));
        await waitForServer(api, `${apiURL}/api/auth/me`, 401);

        // Reuse the real Vite config/plugins; only the isolated API target differs.
        const configPath = path.join(directory, 'vite.config.mjs');
        const sourceConfig = pathToFileURL(path.join(projectDir, 'client/vite.config.js')).href;
        fs.writeFileSync(configPath, `import config from ${JSON.stringify(sourceConfig)};\n` +
            `export default {...config, server: {...config.server, proxy: {'/api': {target: ${JSON.stringify(apiURL)}, changeOrigin: true}}}};\n`);
        frontend = startServer(process.execPath, [
            path.join(projectDir, 'client/node_modules/vite/bin/vite.js'),
            '--config', configPath, '--host', '127.0.0.1', '--port', String(frontendPort), '--strictPort',
        ], path.join(projectDir, 'client'));
        await waitForServer(frontend, frontendURL, 200);

        const testProcess = spawn(process.execPath, [
            path.join(automationDir, 'node_modules/@playwright/test/cli.js'),
            'test', suite === 'pcs' ? 'tests/admin/pcs' : 'tests/admin/home/home.flow.spec.js',
            '--project=chromium', '--workers=1',
            ...testArgs,
        ], {
            cwd: automationDir, windowsHide: true, stdio: 'inherit',
            // A failed isolated run must finish so its servers/database can be cleaned up.
            env: {...process.env, PLAYWRIGHT_HTML_OPEN: process.env.PLAYWRIGHT_HTML_OPEN || 'never',
                UI_BASE_URL: frontendURL,
                ADMIN_USERNAME: settings.username, ADMIN_PASSWORD: settings.password,
                HOME_FLOW_DATABASE: settings.database,
                AUTOMATION_DIRECTORY: directory, AUTOMATION_SUITE: suite, PHP_BIN: php},
        });
        process.exitCode = await new Promise((resolve, reject) => {
            testProcess.once('error', reject);
            testProcess.once('exit', (code) => resolve(code ?? 1));
        });
    } finally {
        await stopServer(frontend);
        await stopServer(api);
        if (fs.existsSync(marker)) databaseAction('drop');

        // Verify the absolute deletion target is this runner's workspace temp folder.
        const resolved = fs.realpathSync(directory);
        const allowed = fs.realpathSync(temporaryParent) + path.sep;
        if (!resolved.toLowerCase().startsWith(allowed.toLowerCase())
            || !path.basename(resolved).startsWith('home-flow-')) {
            throw new Error('Refusing to remove a directory outside the Home test temporary folder.');
        }
        fs.rmSync(resolved, {recursive: true, force: true});
    }
}

main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
});
