import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { SUITE_APPS, staticAppsDir } from './suite-apps.mjs';

const isWin = process.platform === 'win32';
const only = process.argv.slice(2);
const targets = only.length ? SUITE_APPS.filter((app) => only.includes(app.id)) : SUITE_APPS;

if (only.length && targets.length !== only.length) {
  const known = SUITE_APPS.map((app) => app.id).join(', ');
  console.error(`Unknown app id in: ${only.join(', ')}. Known ids: ${known}`);
  process.exit(1);
}

function npm(args, cwd) {
  const result = spawnSync(
    isWin ? 'cmd.exe' : 'npm',
    isWin ? ['/d', '/s', '/c', 'npm', ...args] : args,
    { cwd, stdio: 'inherit' },
  );
  if (result.status !== 0) {
    throw new Error(`npm ${args.join(' ')} failed in ${cwd}`);
  }
}

mkdirSync(staticAppsDir, { recursive: true });

for (const app of targets) {
  const outDir = path.join(staticAppsDir, app.id);
  console.log(`\n[${app.name}] building into public/apps/${app.id}/`);

  if (!existsSync(path.join(app.dir, 'node_modules'))) {
    npm(['install', '--no-audit', '--no-fund'], app.dir);
  }
  npm(['run', 'build', '--', '--outDir', outDir, '--emptyOutDir'], app.dir);
}

const manifest = {
  builtAt: new Date().toISOString(),
  apps: SUITE_APPS
    .filter((app) => existsSync(path.join(staticAppsDir, app.id, 'index.html')))
    .map((app) => app.id),
};
writeFileSync(path.join(staticAppsDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`\nStatic apps ready: ${manifest.apps.join(', ')}`);
