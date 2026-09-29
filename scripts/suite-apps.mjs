import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Keep ids and ports in sync with src/data/terminalUrls.ts and vite.config.ts */
export const SUITE_APPS = [
  { id: 'v8-client', name: 'V8客户管理端', dir: path.join(rootDir, '速报系统-V8客户管理端'), port: 3001 },
  { id: 'v8-audit-pc', name: 'V8审核上报PC', dir: path.join(rootDir, '速报系统-v8审核上报PC'), port: 3002 },
  { id: 'v8-audit-h5', name: 'V8审核上报H5', dir: path.join(rootDir, '速报系统-v8审核上报H5'), port: 3003 },
  { id: 'mt-app', name: 'MT应用管理端', dir: path.join(rootDir, '速报系统-MT应用管理端'), port: 3004 },
];

export const staticAppsDir = path.join(rootDir, 'public', 'apps');
