import React, { useCallback, useEffect, useRef } from 'react';
import { docLabel, getDocSyncState, getExternalDocUrl, getTerminalDocs, useTerminalDocs } from '../data/terminalDocs';
import { TerminalDocViewer } from './TerminalDocViewer';

export interface DocsTerminal {
  id: string;
  name: string;
  accent: string;
}

interface TerminalDocsModalProps {
  terminals: DocsTerminal[];
  terminalId: string;
  docName: string;
  onNavigate: (terminalId: string, docName: string) => void;
  onClose: () => void;
}

export function TerminalDocsModal({ terminals, terminalId, docName, onNavigate, onClose }: TerminalDocsModalProps) {
  const bundle = useTerminalDocs();
  const terminal = terminals.find((item) => item.id === terminalId) ?? terminals[0];
  const isDirtyRef = useRef(false);
  const handleDirtyChange = useCallback((dirty: boolean) => {
    isDirtyRef.current = dirty;
  }, []);

  const confirmDiscard = () => !isDirtyRef.current || window.confirm('当前文档有未保存的修改，确定放弃吗？');

  const handleClose = () => {
    if (confirmDiscard()) onClose();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const handleNavigate = (nextTerminalId: string, nextDocName: string) => {
    if (nextTerminalId === terminalId && nextDocName === docName && !getExternalDocUrl(nextTerminalId, nextDocName)) {
      return;
    }
    if (confirmDiscard()) onNavigate(nextTerminalId, nextDocName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-slate-900/60 backdrop-blur-xs" onClick={handleClose}>
      <div
        className="w-full max-w-7xl h-full max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex"
        onClick={(event) => event.stopPropagation()}
      >
        <aside className="w-60 shrink-0 border-r border-slate-100 bg-slate-50/70 flex flex-col">
          <div className="px-4 h-14 flex items-center border-b border-slate-100">
            <span className="text-sm font-bold text-slate-900">文档中心</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {terminals.map((item) => (
              <div key={item.id} className="space-y-1">
                <div className="flex items-center gap-2 px-2 text-xs font-bold text-slate-500">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.accent }} />
                  {item.name}
                </div>
                {getTerminalDocs(bundle, item.id).map((itemDoc) => {
                  const isActive = item.id === terminalId && itemDoc.name === docName;
                  const isPending = !!getDocSyncState(bundle, item.id, itemDoc.name).requestedAt;
                  const isExternal = !!getExternalDocUrl(item.id, itemDoc.name);
                  return (
                    <div
                      key={itemDoc.name}
                      onClick={() => handleNavigate(item.id, itemDoc.name)}
                      className={`flex items-center justify-between gap-2 pl-6 pr-2 py-1.5 rounded-lg cursor-pointer text-xs transition-colors ${
                        isActive ? 'bg-white text-[#1d61d6] font-bold shadow-xs' : 'text-slate-600 hover:bg-white/70'
                      }`}
                      title={isExternal ? '进入原型右侧分栏打开飞书文档' : undefined}
                    >
                      <span className="truncate">
                        {docLabel(itemDoc.name)}
                        {isExternal ? (
                          <span className="ml-1.5 text-[10px] font-normal text-slate-400">飞书</span>
                        ) : (
                          !itemDoc.content.trim() && <span className="ml-1.5 text-[10px] font-normal text-slate-400">待补充</span>
                        )}
                      </span>
                      {isPending && (
                        <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          待同步
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-slate-100 text-[11px] leading-5 text-slate-400">
            点击文档上方「同步」复制指令，粘贴到 Cursor 对话中即可按最新功能更新文档。
          </div>
        </aside>

        <TerminalDocViewer
          variant="modal"
          terminalId={terminalId}
          terminalName={terminal?.name ?? terminalId}
          accent={terminal?.accent ?? '#64748b'}
          docName={docName}
          shareHash={`#/docs/${terminalId}/${encodeURIComponent(docName)}`}
          onClose={onClose}
          onDirtyChange={handleDirtyChange}
        />
      </div>
    </div>
  );
}
