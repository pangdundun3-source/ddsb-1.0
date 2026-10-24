import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, ChevronRight } from 'lucide-react';
import {
  getOrgById,
  getOrgChildrenOf,
  getOrgFullPath,
  INITIAL_ORG_NODES,
  type OrgNode
} from '../data/externalOrgTree';

export interface OrgFilterSelectProps {
  /** 选中的机构节点 id；null/空 = 全部 */
  value: string | null;
  onChange: (orgId: string | null) => void;
  orgNodes?: OrgNode[];
  /** 未选中时展示文案 */
  allLabel?: string;
  title?: string;
  className?: string;
  triggerClassName?: string;
}

/**
 * 筛选栏用机构下拉：数据取自外部联系人组织树，默认「全部」，支持逐级下钻；
 * 选中某节点表示筛选该节点及其子级。
 */
export const OrgFilterSelect: React.FC<OrgFilterSelectProps> = ({
  value,
  onChange,
  orgNodes = INITIAL_ORG_NODES,
  allLabel = '全部组织节点',
  title = '组织节点',
  className = '',
  triggerClassName = ''
}) => {
  const [open, setOpen] = useState(false);
  const [drillPath, setDrillPath] = useState<string[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    if (value) {
      const path: string[] = [];
      let current = getOrgById(orgNodes, value);
      while (current) {
        path.unshift(current.id);
        current = current.parentId ? getOrgById(orgNodes, current.parentId) : undefined;
      }
      setDrillPath(path);
    } else {
      setDrillPath([]);
    }
  }, [open, value, orgNodes]);

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

  const displayText = value ? getOrgFullPath(orgNodes, value) || allLabel : allLabel;
  const previewPath = drillPath.length ? getOrgFullPath(orgNodes, drillPath[drillPath.length - 1]) : '';

  const pickAll = () => {
    setDrillPath([]);
    onChange(null);
    setOpen(false);
  };

  const pickNode = (level: number, id: string) => {
    const next = [...drillPath.slice(0, level), id];
    setDrillPath(next);
    onChange(id);
    if (getOrgChildrenOf(orgNodes, id).length === 0) setOpen(false);
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        title={title}
        className={`flex items-center justify-between gap-1.5 h-[34px] min-w-[160px] max-w-[240px] px-2.5 rounded-lg border border-gray-300 bg-white text-xs text-gray-700 shadow-2xs hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/15 focus:border-[#1E5ABB] cursor-pointer ${triggerClassName}`}
      >
        <span className="truncate">{displayText}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-40 mt-1 left-0 min-w-full max-w-[min(720px,calc(100vw-96px))] bg-white border border-gray-200 rounded-lg overflow-hidden shadow-xl">
          <div className="px-2 py-1.5 border-b border-gray-100">
            <button
              type="button"
              onClick={pickAll}
              className={`w-full h-8 px-2 flex items-center gap-1.5 text-left text-xs rounded hover:bg-blue-50 cursor-pointer ${
                !value ? 'bg-blue-50 text-[#1E5ABB] font-bold' : 'text-gray-700'
              }`}
            >
              {!value && <Check className="w-3 h-3 shrink-0" />}
              <span>{allLabel}</span>
            </button>
          </div>
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
              {previewPath
                ? `已选：${previewPath}（含下级）`
                : '默认全部；选择后可向右下钻子机构'}
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
