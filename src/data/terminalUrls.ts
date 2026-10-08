export type TerminalId = 'v8-client' | 'v8-audit-pc' | 'v8-audit-h5' | 'mt-app';

/** 'dev' opens the app's own dev server port; 'static' opens its build under public/apps */
export type TerminalMode = 'dev' | 'static';

/** Keep ports in sync with scripts/suite-apps.mjs and vite.config.ts */
const TERMINAL_LINKS: Record<TerminalId, { port: number; hash: string }> = {
  'v8-client': { port: 3001, hash: '#/login' },
  'v8-audit-pc': { port: 3002, hash: '#/login' },
  'v8-audit-h5': { port: 3003, hash: '' },
  'mt-app': { port: 3004, hash: '#/login' },
};

export const STATIC_APPS_MANIFEST = './apps/manifest.json';

/** Message an embedded app posts to ask the portal to switch terminals */
export const OPEN_TERMINAL_MESSAGE = 'suite:open-terminal';

export function getTerminalUrl(id: TerminalId, mode: TerminalMode = 'static', hashOverride?: string): string {
  const { port, hash: defaultHash } = TERMINAL_LINKS[id];
  const hash = hashOverride ?? defaultHash;
  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  if (mode === 'dev' && isLocalhost) {
    return `${window.location.protocol}//${window.location.hostname}:${port}/${hash}`;
  }
  return `./apps/${id}/app.html${hash}`;
}
