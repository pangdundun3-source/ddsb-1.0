import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, ChevronRight } from 'lucide-react';
import type { OrgNode } from '../pages/OrgManagement';
import { getOrgChildrenOf, getOrgFullPath } from '../data/userOrgShared';

export const OrgCascadeSelect: React.FC<{
  orgNodes: OrgNode[];
  path: string[];
  onChange: (path: string[]) => void;
  label?: string;
  hideHint?: boolean;
}> = ({ orgNodes, path, onChange, label = '所属机构 *', hideHint = false }) => {
  const [open, setOpen] = useState(false);
  const [drillPath, setDrillPath] = useState<string[]>(path);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setDrillPath(path);
  }, [open, path]);

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const columns = useMemo(() => {
    const next: Array<{ level: number; options: OrgNode[] }> = [
      { level: 0, options: getOrgChildrenOf(orgNodes, null) }
    ];
    drillPath.forEach((id, index) => {
      const children = getOrgChildrenOf(orgNodes, id);
      if (children.length > 0) {
        next.push({ level: index + 1, options: children });
      }
    });
    return next;
  }, [orgNodes, drillPath]);

  const selectedPath = path.length ? getOrgFullPath(orgNodes, path[path.length - 1]) : '';
  const previewPath = drillPath.length ? getOrgFullPath(orgNodes, drillPath[drillPath.length - 1]) : '';

  const pickNode = (level: number, id: string) => {
    const next = [...drillPath.slice(0, level), id];
    setDrillPath(next);
    onChange(next);
    if (getOrgChildrenOf(orgNodes, id).length === 0) setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <div className="flex items-center justify-between mb-1">
        <label className="text-gray-700 font-medium">{label}</label>
        {!hideHint && <span className="text-[10px] text-gray-400">点击后在弹出层中逐级下钻</span>}
      </div>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white text-left flex items-center justify-between gap-2 focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
      >
        <span className={`truncate ${selectedPath ? 'text-gray-800' : 'text-gray-400'}`}>
          {selectedPath || '请选择所属机构'}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-40 mt-1 left-0 min-w-full max-w-[min(720px,calc(100vw-96px))] bg-white border border-gray-200 rounded-lg overflow-hidden shadow-xl">
          <div className="flex max-h-56 overflow-x-auto overflow-y-hidden">
            {columns.map((column) => (
              <div
                key={column.level}
                className="w-44 shrink-0 border-r last:border-r-0 border-gray-200 overflow-y-auto max-h-56"
              >
                {column.options.map((org) => {
                  const hasChildren = getOrgChildrenOf(orgNodes, org.id).length > 0;
                  const isActive = drillPath[column.level] === org.id;
                  return (
                    <button
                      key={org.id}
                      type="button"
                      onClick={() => pickNode(column.level, org.id)}
                      className={`w-full h-8 px-2 flex items-center justify-between gap-2 text-left text-xs hover:bg-blue-50 cursor-pointer ${
                        isActive ? 'bg-blue-50 text-[#1E5ABB] font-bold' : 'text-gray-700'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 min-w-0">
                        {isActive && <Check className="w-3 h-3 shrink-0" />}
                        <span className="truncate">{org.name}</span>
                      </span>
                      {hasChildren && <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-3">
            <span className={`text-[11px] truncate ${previewPath ? 'text-[#1E5ABB] font-medium' : 'text-gray-400'}`}>
              {previewPath || '请先选择一级机构，有下级继续向右展开'}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-2.5 py-1 rounded bg-[#1E5ABB] text-white text-[11px] font-bold hover:bg-[#134092] cursor-pointer shrink-0"
            >
              确定
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
