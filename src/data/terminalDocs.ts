import { useSyncExternalStore } from 'react';
import initialBundle from 'virtual:terminal-docs';

export interface TerminalDoc {
  terminalId: string;
  name: string;
  content: string;
  updatedAt: string;
}

export interface DocSyncState {
  requestedAt?: string;
  lastSyncedAt?: string;
}

export type DocsSyncState = Record<string, Record<string, DocSyncState>>;

export interface TerminalDocsBundle {
  docs: TerminalDoc[];
  syncState: DocsSyncState;
}

const DOC_ORDER: string[] = [];
const DOC_LABELS: Record<string, string> = { CHANGELOG: '更新记录' };

/** Whether this doc name appears in the portal UI (homepage chips, panel tabs, docs modal) */
export function isPortalDoc(name: string): boolean {
  return DOC_ORDER.includes(name);
}

/** Saving writes to docs/terminals through the dev server; static builds are read-only */
export const DOCS_EDITABLE = import.meta.env.DEV;

let currentBundle: TerminalDocsBundle = initialBundle;
const listeners = new Set<() => void>();

function setBundle(next: TerminalDocsBundle) {
  currentBundle = next;
  listeners.forEach((listener) => listener());
}

if (import.meta.hot) {
  import.meta.hot.on('terminal-docs:update', (next: TerminalDocsBundle) => setBundle(next));
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useTerminalDocs(): TerminalDocsBundle {
  return useSyncExternalStore(subscribe, () => currentBundle);
}

export function docLabel(name: string): string {
  return DOC_LABELS[name] ?? name;
}

export function getTerminalDocs(bundle: TerminalDocsBundle, terminalId: string): TerminalDoc[] {
  return DOC_ORDER.flatMap((name) =>
    bundle.docs.filter((doc) => doc.terminalId === terminalId && doc.name === name),
  );
}

export function getDocSyncState(bundle: TerminalDocsBundle, terminalId: string, name: string): DocSyncState {
  return bundle.syncState[terminalId]?.[name] ?? {};
}

/** Instruction pasted into the Cursor chat; the docs sync rule keys off the 「同步文档：」 prefix */
export function buildSyncInstruction(terminalName: string, terminalId: string, name: string): string {
  return `同步文档：${terminalName} 的${docLabel(name)}（docs/terminals/${terminalId}/${name}.md）`;
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) {
    throw new Error(data.error ?? '保存失败');
  }
  return data;
}

export async function saveTerminalDoc(terminalId: string, name: string, content: string) {
  const { updatedAt = new Date().toISOString() } = await postJson<{ updatedAt?: string }>('./api/docs/save', {
    terminalId,
    name,
    content,
  });
  setBundle({
    ...currentBundle,
    docs: currentBundle.docs.map((doc) =>
      doc.terminalId === terminalId && doc.name === name ? { ...doc, content, updatedAt } : doc,
    ),
  });
}

export async function updateSyncRequest(terminalId: string, name: string, action: 'request' | 'cancel') {
  const { syncState } = await postJson<{ syncState: DocsSyncState }>('./api/docs/sync-request', {
    terminalId,
    name,
    action,
  });
  setBundle({ ...currentBundle, syncState });
}

/** Doc images are stored as `assets/<file>` relative to the doc and served under `terminal-docs/<terminal>/` */
const assetBase = (terminalId: string) => `terminal-docs/${terminalId}/`;

export function resolveDocAssetUrl(terminalId: string, src: string): string {
  return src.startsWith('assets/') ? `${assetBase(terminalId)}${src}` : src;
}

export function toEditorMarkdown(terminalId: string, markdown: string): string {
  return markdown.replace(/\]\(assets\//g, `](${assetBase(terminalId)}assets/`);
}

export function fromEditorMarkdown(terminalId: string, markdown: string): string {
  return markdown.split(`](${assetBase(terminalId)}assets/`).join('](assets/');
}

function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('读取图片失败'));
    reader.readAsDataURL(file);
  });
}

export async function uploadDocAsset(terminalId: string, file: Blob): Promise<string> {
  const extension = (file.type.split('/')[1] ?? '').replace('jpeg', 'jpg').replace('svg+xml', 'svg');
  const data = (await readAsDataUrl(file)).split(',')[1] ?? '';
  const { path } = await postJson<{ path: string }>('./api/docs/upload', { terminalId, extension, data });
  return path;
}

/** Lines that link PRD modules to the prototype; meaningless once the doc leaves the portal */
const PORTAL_ONLY_LINE = /^\s*(?:[-*]\s*)?(?:\*\*)?对应(?:页面|代码)(?:\*\*)?\s*[:：]/;

export function stripPortalOnlyLines(markdown: string): string {
  return markdown
    .split(/\r?\n/)
    .filter((line) => !PORTAL_ONLY_LINE.test(line))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Exports a standalone .md (e.g. for Feishu import): local images are inlined since `assets/` does not travel with the file */
export async function exportMarkdownFile(options: { terminalId: string; markdown: string; fileName: string }) {
  let markdown = stripPortalOnlyLines(options.markdown);
  const assetPaths = new Set([...markdown.matchAll(/\]\((assets\/[^)\s]+)\)/g)].map((match) => match[1]));
  for (const assetPath of assetPaths) {
    try {
      const response = await fetch(resolveDocAssetUrl(options.terminalId, assetPath));
      if (!response.ok) continue;
      markdown = markdown.split(`](${assetPath})`).join(`](${await readAsDataUrl(await response.blob())})`);
    } catch {
      // Keep the relative path when an image cannot be read
    }
  }
  downloadBlob(new Blob([markdown], { type: 'text/markdown;charset=utf-8' }), options.fileName);
}
