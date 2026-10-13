import fs from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import path from 'node:path';
import type { Plugin } from 'vite';

const TERMINAL_IDS = ['v8-client', 'v8-audit-pc', 'v8-audit-h5', 'mt-app'];
const VIRTUAL_ID = 'virtual:terminal-docs';
const RESOLVED_ID = `\0${VIRTUAL_ID}`;
const UPDATE_EVENT = 'terminal-docs:update';
const DOC_NAME_PATTERN = /^[\p{L}\p{N}_-]+$/u;
const SYNC_STATE_FILE = 'sync-state.json';
/** Images live in docs/terminals/<terminal>/assets and are served (dev) or emitted (build) under this URL prefix */
const ASSET_URL_PREFIX = 'terminal-docs';
const ASSET_DIR = 'assets';
const ASSET_FILE_PATTERN = /^[\w-]+\.(png|jpe?g|gif|webp|svg)$/i;
const ASSET_MAX_BYTES = 10 * 1024 * 1024;
const ASSET_MIME: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
};

interface TerminalDocFile {
  terminalId: string;
  name: string;
  content: string;
  updatedAt: string;
}

interface DocSyncState {
  requestedAt?: string;
  lastSyncedAt?: string;
}

type SyncState = Record<string, Record<string, DocSyncState>>;

function readBody(request: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let raw = '';
    request.setEncoding('utf8');
    request.on('data', (chunk: string) => {
      raw += chunk;
    });
    request.on('end', () => {
      try {
        resolve(JSON.parse(raw || '{}'));
      } catch (error) {
        reject(error);
      }
    });
    request.on('error', reject);
  });
}

function sendJson(response: ServerResponse, statusCode: number, data: unknown) {
  response.statusCode = statusCode;
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(data));
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function listAssets(docsDir: string, terminalId: string): string[] {
  const dir = path.join(docsDir, terminalId, ASSET_DIR);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((file) => ASSET_FILE_PATTERN.test(file));
}

/** Serves docs/terminals as `virtual:terminal-docs`; in dev also exposes save APIs and pushes file changes. */
export function terminalDocsPlugin(docsDir: string): Plugin {
  const syncStatePath = path.join(docsDir, SYNC_STATE_FILE);

  const readSyncState = (): SyncState => {
    try {
      const parsed: unknown = JSON.parse(fs.readFileSync(syncStatePath, 'utf8'));
      return isPlainObject(parsed) ? (parsed as SyncState) : {};
    } catch {
      return {};
    }
  };

  const readBundle = () => {
    const docs: TerminalDocFile[] = [];
    for (const terminalId of TERMINAL_IDS) {
      const dir = path.join(docsDir, terminalId);
      if (!fs.existsSync(dir)) continue;
      for (const file of fs.readdirSync(dir)) {
        if (!file.endsWith('.md')) continue;
        const filePath = path.join(dir, file);
        docs.push({
          terminalId,
          name: file.slice(0, -3),
          content: fs.readFileSync(filePath, 'utf8'),
          updatedAt: fs.statSync(filePath).mtime.toISOString(),
        });
      }
    }

    return { docs, syncState: readSyncState() };
  };

  return {
    name: 'terminal-docs',
    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : undefined;
    },
    load(id) {
      if (id !== RESOLVED_ID) return undefined;
      return `export default ${JSON.stringify(readBundle())};`;
    },
    generateBundle() {
      for (const terminalId of TERMINAL_IDS) {
        for (const file of listAssets(docsDir, terminalId)) {
          this.emitFile({
            type: 'asset',
            fileName: `${ASSET_URL_PREFIX}/${terminalId}/${ASSET_DIR}/${file}`,
            source: fs.readFileSync(path.join(docsDir, terminalId, ASSET_DIR, file)),
          });
        }
      }
    },
    configureServer(server) {
      const normalizedDocsDir = path.resolve(docsDir).toLowerCase();
      const handleFsEvent = (file: string) => {
        if (!path.resolve(file).toLowerCase().startsWith(normalizedDocsDir)) return;
        const module = server.moduleGraph.getModuleById(RESOLVED_ID);
        if (module) server.moduleGraph.invalidateModule(module);
        server.ws.send({ type: 'custom', event: UPDATE_EVENT, data: readBundle() });
      };
      server.watcher.add(docsDir);
      server.watcher.on('change', handleFsEvent);
      server.watcher.on('add', handleFsEvent);
      server.watcher.on('unlink', handleFsEvent);

      server.middlewares.use('/api/docs/save', async (request, response) => {
        if (request.method !== 'POST') {
          sendJson(response, 405, { error: 'Method Not Allowed' });
          return;
        }
        try {
          const { terminalId, name, content } = (await readBody(request)) as Record<string, unknown>;
          if (
            typeof terminalId !== 'string' ||
            !TERMINAL_IDS.includes(terminalId) ||
            typeof name !== 'string' ||
            !DOC_NAME_PATTERN.test(name) ||
            typeof content !== 'string'
          ) {
            sendJson(response, 400, { error: '参数无效' });
            return;
          }
          const dir = path.join(docsDir, terminalId);
          fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(path.join(dir, `${name}.md`), content, 'utf8');
          sendJson(response, 200, { ok: true, updatedAt: new Date().toISOString() });
        } catch {
          sendJson(response, 500, { error: '保存失败' });
        }
      });

      server.middlewares.use('/api/docs/upload', async (request, response) => {
        if (request.method !== 'POST') {
          sendJson(response, 405, { error: 'Method Not Allowed' });
          return;
        }
        try {
          const { terminalId, extension, data } = (await readBody(request)) as Record<string, unknown>;
          const ext = typeof extension === 'string' ? extension.toLowerCase() : '';
          if (
            typeof terminalId !== 'string' ||
            !TERMINAL_IDS.includes(terminalId) ||
            !ASSET_MIME[ext] ||
            typeof data !== 'string'
          ) {
            sendJson(response, 400, { error: '仅支持 png、jpg、gif、webp、svg 图片' });
            return;
          }
          const buffer = Buffer.from(data, 'base64');
          if (buffer.length === 0 || buffer.length > ASSET_MAX_BYTES) {
            sendJson(response, 400, { error: '图片不能超过 10MB' });
            return;
          }
          const stamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
          const file = `${stamp}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
          const dir = path.join(docsDir, terminalId, ASSET_DIR);
          fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(path.join(dir, file), buffer);
          sendJson(response, 200, { ok: true, path: `${ASSET_DIR}/${file}` });
        } catch {
          sendJson(response, 500, { error: '图片上传失败' });
        }
      });

      server.middlewares.use(`/${ASSET_URL_PREFIX}`, (request, response, next) => {
        const [terminalId, dirName, file] = decodeURIComponent((request.url ?? '').split('?')[0]).split('/').filter(Boolean);
        if (!TERMINAL_IDS.includes(terminalId) || dirName !== ASSET_DIR || !file || !ASSET_FILE_PATTERN.test(file)) {
          next();
          return;
        }
        const filePath = path.join(docsDir, terminalId, ASSET_DIR, file);
        if (!fs.existsSync(filePath)) {
          next();
          return;
        }
        response.setHeader('Content-Type', ASSET_MIME[file.split('.').pop()!.toLowerCase()]);
        response.setHeader('Cache-Control', 'no-cache');
        fs.createReadStream(filePath).pipe(response);
      });

      server.middlewares.use('/api/docs/sync-request', async (request, response) => {
        if (request.method !== 'POST') {
          sendJson(response, 405, { error: 'Method Not Allowed' });
          return;
        }
        try {
          const { terminalId, name, action } = (await readBody(request)) as Record<string, unknown>;
          if (
            typeof terminalId !== 'string' ||
            !TERMINAL_IDS.includes(terminalId) ||
            typeof name !== 'string' ||
            !DOC_NAME_PATTERN.test(name) ||
            (action !== 'request' && action !== 'cancel')
          ) {
            sendJson(response, 400, { error: '参数无效' });
            return;
          }
          const syncState = readSyncState();
          const docState: DocSyncState = { ...syncState[terminalId]?.[name] };
          if (action === 'request') {
            docState.requestedAt = new Date().toISOString();
          } else {
            delete docState.requestedAt;
          }
          syncState[terminalId] = { ...syncState[terminalId], [name]: docState };
          fs.mkdirSync(docsDir, { recursive: true });
          fs.writeFileSync(syncStatePath, `${JSON.stringify(syncState, null, 2)}\n`, 'utf8');
          sendJson(response, 200, { ok: true, syncState });
        } catch {
          sendJson(response, 500, { error: '保存失败' });
        }
      });
    },
  };
}
