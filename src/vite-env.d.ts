/// <reference types="vite/client" />

declare module 'virtual:terminal-docs' {
  const bundle: {
    docs: Array<{ terminalId: string; name: string; content: string; updatedAt: string }>;
    syncState: Record<string, Record<string, { requestedAt?: string; lastSyncedAt?: string }>>;
  };
  export default bundle;
}
