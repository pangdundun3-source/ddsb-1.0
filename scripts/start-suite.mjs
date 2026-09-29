import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { SUITE_APPS, rootDir } from './suite-apps.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const isWin = process.platform === 'win32';
const suiteViteConfig = path.join(scriptDir, 'suite-vite.config.mjs');

const apps = [
  {
    name: '点点速豹门户',
    dir: rootDir,
    port: 3000,
    args: ['run', 'dev:portal', '--', '--configLoader=runner'],
  },
  ...SUITE_APPS.map((app) => ({
    name: app.name,
    dir: app.dir,
    port: app.port,
    args: ['run', 'dev', '--', '--config', suiteViteConfig, '--configLoader=runner'],
  })),
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

  if (app.dir !== rootDir && !existsSync(path.join(app.dir, 'node_modules'))) {
    console.log(`[${app.name}] skipped: dependencies not installed, the portal serves public/apps instead`);
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
  child.on('error', () => {
    console.log(`[点点速豹门户] no system browser available, open ${portalUrl} manually`);
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
