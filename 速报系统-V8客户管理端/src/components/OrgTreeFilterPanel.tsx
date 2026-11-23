import React, { useMemo, useState } from 'react';
import { Building2, ChevronDown, ChevronRight, Layers } from 'lucide-react';
import type { OrgNode } from '../pages/OrgManagement';
import { getOrgChildrenOf, INITIAL_ORG_NODES } from '../data/userOrgShared';

export interface OrgTreeFilterPanelProps {
  value: string | null;
  onChange: (orgId: string | null) => void;
  orgNodes?: OrgNode[];
  /** 面板展示的机构根名称 */
  rootOrgName?: string;
  className?: string;
  /** sidebar：右侧竖栏；embedded：嵌在筛选区下方通栏 */
  variant?: 'sidebar' | 'embedded';
}

/**
 * 机构树筛选：默认展开，支持展开/收起。
 */
export const OrgTreeFilterPanel: React.FC<OrgTreeFilterPanelProps> = ({
  value,
  onChange,
  orgNodes = INITIAL_ORG_NODES,
  rootOrgName = '台中市网信办',
  className = '',
  variant = 'sidebar',
}) => {
  /** 标题显示机构名；树体直接展示全部组织节点，不再重复挂「台中市网信办」根行 */
  const treeRoots = useMemo(() => getOrgChildrenOf(orgNodes, null), [orgNodes]);

  const expandableIds = useMemo(() => {
    const ids: string[] = [];
    const walk = (node: OrgNode) => {
      const children = getOrgChildrenOf(orgNodes, node.id);
      if (children.length > 0) {
        ids.push(node.id);
        children.forEach(walk);
      }
    };
    treeRoots.forEach(walk);
    return ids;
  }, [orgNodes, treeRoots]);

  /** 空数组 = 全部展开 */
  const [collapsedIds, setCollapsedIds] = useState<string[]>([]);
  const allExpanded = collapsedIds.length === 0;

  const toggleCollapse = (id: string) => {
    setCollapsedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const renderNode = (node: OrgNode, depth: number): React.ReactNode => {
    const children = getOrgChildrenOf(orgNodes, node.id);
    const hasChildren = children.length > 0;
    const isCollapsed = collapsedIds.includes(node.id);
    const isSelected = value === node.id;

    return (
      <div key={node.id}>
        <div
          className={`group flex items-center gap-0.5 h-8 pr-2 rounded-md cursor-pointer ${
            isSelected ? 'bg-blue-50 text-[#1E5ABB] font-semibold' : 'text-slate-700 hover:bg-slate-50'
          }`}
          style={{ paddingLeft: 4 + depth * 14 }}
          onClick={() => onChange(isSelected ? null : node.id)}
        >
          {hasChildren ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                toggleCollapse(node.id);
              }}
              className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer shrink-0"
              title={isCollapsed ? '展开' : '收起'}
            >
              {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <span className="w-5 shrink-0" />
          )}
          {depth === 0 ? (
            <Building2 className="w-3.5 h-3.5 shrink-0 text-[#1E5ABB]" />
          ) : (
            <Layers className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#1E5ABB]' : 'text-slate-400'}`} />
          )}
          <span className="flex-1 min-w-0 truncate text-xs ml-1">{node.name}</span>
        </div>
        {hasChildren && !isCollapsed && children.map((child) => renderNode(child, depth + 1))}
      </div>
    );
  };

  const shellClass =
    variant === 'embedded'
      ? `w-full rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col max-h-56 ${className}`
      : `w-[260px] shrink-0 rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col min-h-[420px] max-h-[calc(100vh-220px)] sticky top-4 ${className}`;

  return (
    <aside className={shellClass}>
      <div className="px-3 pt-2.5 pb-2 flex items-center justify-between gap-2 border-b border-slate-100">
        <span className="text-xs font-bold text-slate-800 truncate" title={rootOrgName}>
          {rootOrgName}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setCollapsedIds([])}
            disabled={allExpanded}
            className="h-6 px-2 rounded border border-slate-200 bg-white text-[11px] text-slate-600 hover:bg-slate-50 cursor-pointer disabled:cursor-default disabled:opacity-40"
          >
            展开
          </button>
          <button
            type="button"
            onClick={() => setCollapsedIds(expandableIds)}
            disabled={!allExpanded && collapsedIds.length === expandableIds.length}
            className="h-6 px-2 rounded border border-slate-200 bg-white text-[11px] text-slate-600 hover:bg-slate-50 cursor-pointer disabled:cursor-default disabled:opacity-40"
          >
            收起
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-2 py-2">
        {treeRoots.map((node) => renderNode(node, 0))}
      </div>

      {variant !== 'embedded' && (
        <div className="px-3 py-2 border-t border-slate-100 text-[10px] text-slate-400">
          点选节点后点击「查询」生效；含下级
        </div>
      )}
    </aside>
  );
};
