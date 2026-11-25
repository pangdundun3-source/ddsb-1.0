import fs from 'node:fs';
import path from 'node:path';

/**
 * 本地 suite：应用端 PUT / 客户管理端 GET 全局模板清单
 * 存文件，避免跨端口 localStorage / 大 cookie 问题
 */
export function suiteGlobalTemplateSyncPlugin(rootDir) {
  const storeDir = path.join(rootDir, '.suite-sync');
  const storeFile = path.join(storeDir, 'global-templates.json');

  const ensureStore = () => {
    if (!fs.existsSync(storeDir)) fs.mkdirSync(storeDir, { recursive: true });
  };

  const readBody = (request) =>
    new Promise((resolve, reject) => {
      const chunks = [];
      request.on('data', (chunk) => chunks.push(chunk));
      request.on('end', () => {
        try {
          const raw = Buffer.concat(chunks).toString('utf8');
          resolve(raw ? JSON.parse(raw) : null);
        } catch (error) {
          reject(error);
        }
      });
      request.on('error', reject);
    });

  const sendJson = (response, status, payload) => {
    response.statusCode = status;
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.end(JSON.stringify(payload));
  };

  return {
    name: 'suite-global-template-sync',
    configureServer(server) {
      server.middlewares.use('/api/suite-sync/global-templates', async (request, response, next) => {
        try {
          if (request.method === 'OPTIONS') {
            sendJson(response, 204, {});
            return;
          }

          if (request.method === 'GET') {
            ensureStore();
            if (!fs.existsSync(storeFile)) {
              sendJson(response, 200, { items: [], updatedAt: null });
              return;
            }
            const raw = fs.readFileSync(storeFile, 'utf8');
            let parsed = { items: [] };
            try {
              parsed = JSON.parse(raw);
            } catch {
              parsed = { items: [] };
            }
            sendJson(response, 200, {
              items: Array.isArray(parsed.items) ? parsed.items : [],
              updatedAt: parsed.updatedAt || null,
            });
            return;
          }

          if (request.method === 'PUT') {
            const body = await readBody(request);
            const items = Array.isArray(body?.items) ? body.items : Array.isArray(body) ? body : [];
            ensureStore();
            const payload = { items, updatedAt: new Date().toISOString() };
            fs.writeFileSync(storeFile, JSON.stringify(payload), 'utf8');
            sendJson(response, 200, payload);
            return;
          }

          next();
        } catch (error) {
          sendJson(response, 500, { error: String(error?.message || error) });
        }
      });
    },
  };
}
