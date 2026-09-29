import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import http from 'node:http';
import {fileURLToPath} from 'node:url';
import path from 'path';
import {defineConfig} from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

type TerminalStatus = 'online' | 'offline' | 'not-started';

const terminalStatusPorts = {
  'v8-client': 3001,
  'v8-audit-h5': 3003,
  'v8-audit-pc': 3002,
  'mt-app': 3004,
} as const;

function probeTerminal(port: number): Promise<TerminalStatus> {
  return new Promise((resolve) => {
    let settled = false;
    const settle = (status: TerminalStatus) => {
      if (!settled) {
        settled = true;
        resolve(status);
      }
    };

    const request = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path: '/',
        method: 'GET',
        timeout: 1500,
      },
      (response) => {
        response.resume();
        const statusCode = response.statusCode ?? 0;
        settle(statusCode >= 200 && statusCode < 400 ? 'online' : 'offline');
      },
    );

    request.setTimeout(1500, () => {
      request.destroy();
      settle('offline');
    });

    request.on('error', (error: NodeJS.ErrnoException) => {
      settle(error.code === 'ECONNREFUSED' ? 'not-started' : 'offline');
    });

    request.end();
  });
}

export default defineConfig(() => {
  return {
    base: './',
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'terminal-status-api',
        configureServer(server) {
          server.middlewares.use('/api/terminal-status', async (_request, response) => {
            const terminals = Object.fromEntries(
              await Promise.all(
                Object.entries(terminalStatusPorts).map(async ([id, port]) => [
                  id,
                  await probeTerminal(port),
                ]),
              ),
            );

            response.statusCode = 200;
            response.setHeader('Cache-Control', 'no-store');
            response.setHeader('Content-Type', 'application/json; charset=utf-8');
            response.end(JSON.stringify({ terminals, updatedAt: new Date().toISOString() }));
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
