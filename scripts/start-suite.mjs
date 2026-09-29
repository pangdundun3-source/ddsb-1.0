import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const suiteRoot = path.resolve(rootDir, '..');
const isWin = process.platform === 'win32';
const suiteViteConfig = path.join(scriptDir, 'suite-vite.config.mjs');

/** Fixed local ports — keep in sync with each app's package.json and src/data/terminalUrls.ts */
const apps = [
  {
    name: '点点速豹门户',
    dir: rootDir,
    port: 3000,
    args: ['run', 'dev:portal', '--', '--configLoader=runner'],
  },
  {
    name: 'V8客户管理端',
    dir: path.join(suiteRoot, '速报系统-V8客户管理端'),
    port: 3001,
    args: ['run', 'dev', '--', '--config', suiteViteConfig, '--configLoader=runner'],
  },
  {
    name: 'V8审核上报H5',
    dir: path.join(suiteRoot, '速报系统-v8审核上报H5'),
    port: 3003,
    args: ['run', 'dev', '--', '--config', suiteViteConfig, '--configLoader=runner'],
  },
  {
    name: 'V8审核上报PC',
    dir: path.join(suiteRoot, '速报系统-v8审核上报PC'),
    port: 3002,
    args: ['run', 'dev', '--', '--config', suiteViteConfig, '--configLoader=runner'],
  },
  {
    name: 'MT应用管理端',
    dir: path.join(suiteRoot, '速报系统-MT应用管理端'),
    port: 3004,
    args: ['run', 'dev', '--', '--config', suiteViteConfig, '--configLoader=runner'],
  },
];

const running = new Set();
const children = [];

async function isRunning(port) {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/`);
    return res.ok;
  } catch {
    return false;
  }
}

function startApp(app) {
  const env = app.dir === rootDir
    ? process.env
    : {
        ...process.env,
        SUITE_APP_DIR: app.dir,
        SUITE_CACHE_DIR: path.join(rootDir, '.vite-cache', String(app.port)),
      };
  const child = spawn(
    isWin ? 'cmd.exe' : 'npm',
    isWin ? ['/d', '/s', '/c', 'npm', ...app.args] : app.args,
    {
      cwd: app.dir,
      env,
      stdio: 'inherit',
      shell: false,
    },
  );

  children.push(child);
  child.on('exit', (code, signal) => {
    console.log(`[${app.name}] exited${signal ? ` with signal ${signal}` : ` with code ${code}`}`);
  });
}

function stopAll() {
  for (const child of children) {
    if (!child.killed) {
      child.kill();
    }
  }
}

process.on('SIGINT', () => {
  stopAll();
  process.exit(130);
});

process.on('SIGTERM', () => {
  stopAll();
  process.exit(143);
});

for (const app of apps) {
  // eslint-disable-next-line no-await-in-loop
  const alive = await isRunning(app.port);
  if (alive) {
    running.add(app.name);
    console.log(`[${app.name}] already running at http://localhost:${app.port}/`);
    continue;
  }

  console.log(`[${app.name}] starting at http://localhost:${app.port}/`);
  startApp(app);
}

const portalUrl = 'http://localhost:3000/';
const urls = apps.map((app) => `http://localhost:${app.port}/`).join('\n');
console.log('\nSuite URLs:\n' + urls);

if (running.size === apps.length) {
  console.log('\nAll suite apps were already running.');
}

function openPortal() {
  const child = isWin
    ? spawn('cmd.exe', ['/c', 'start', portalUrl], {
        detached: true,
        stdio: 'ignore',
        windowsHide: true,
      })
    : spawn(process.platform === 'darwin' ? 'open' : 'xdg-open', [portalUrl], {
        detached: true,
        stdio: 'ignore',
      });
  child.unref();
}

async function openPortalWhenReady() {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    if (await isRunning(3000)) {
      openPortal();
      console.log(`[点点速豹门户] opened ${portalUrl}`);
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
  console.log(`[点点速豹门户] not ready, skipped opening ${portalUrl}`);
}

void openPortalWhenReady();
