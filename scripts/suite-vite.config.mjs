import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import {defineConfig} from 'vite';

const appRoot = process.env.SUITE_APP_DIR;
const cacheDir = process.env.SUITE_CACHE_DIR;

if (!appRoot || !cacheDir) {
  throw new Error('SUITE_APP_DIR and SUITE_CACHE_DIR are required');
}

/** Lets the portal follow the embedded app's hash route across ports (keep the type in sync with FRAME_HASH_MESSAGE) */
const frameHashBridge = {
  name: 'suite-frame-hash-bridge',
  transformIndexHtml() {
    return [
      {
        tag: 'script',
        injectTo: 'head',
        children: `if (window.parent !== window) {
  var postSuiteHash = function () { window.parent.postMessage({ type: 'suite:hash-change', hash: window.location.hash }, '*'); };
  ['pushState', 'replaceState'].forEach(function (method) {
    var original = window.history[method];
    window.history[method] = function () {
      var result = original.apply(this, arguments);
      postSuiteHash();
      return result;
    };
  });
  window.addEventListener('hashchange', postSuiteHash);
  window.addEventListener('load', postSuiteHash);
  postSuiteHash();
}`,
      },
    ];
  },
};

export default defineConfig({
  root: appRoot,
  cacheDir,
  base: './',
  plugins: [react(), tailwindcss(), frameHashBridge],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      '@': appRoot,
    },
  },
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
});
