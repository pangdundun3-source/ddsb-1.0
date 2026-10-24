import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Database, LayoutList, Pencil, Plus, Power, Trash2 } from 'lucide-react';
import type { PageId, ReportItem } from '../types';
import {
  isWarehouseEnabled,
  loadWarehouses,
  saveWarehouses,
  upsertWarehouse,
  type WarehouseFormValues,
  type WarehouseItem,
  type WarehouseShareScope
} from '../data/warehouses';
import { isInWarehouse, resolveLibraryAssignments } from '../data/warehouseAssignments';
import { WarehouseEditorModal } from '../components/WarehouseEditorModal';
import { NegativeInfoLibrary } from './NegativeInfoLibrary';

export const ACTIVE_WAREHOUSE_KEY = 'ddsb_data_warehouse_active';

type GroupKey = WarehouseShareScope;

const GROUPS: { key: GroupKey; label: string }[] = [
  { key: '全机构可见', label: '全机构可见' },
  { key: '指定人员可见', label: '指定人员可见' },
  { key: '仅本人可见', label: '仅本人可见' }
];

interface DataWarehouseProps {
  negativeList: ReportItem[];
  onSelectNegative: (item: ReportItem) => void;
  onNavigate: (page: PageId) => void;
}

export const DataWarehouse: React.FC<DataWarehouseProps> = ({
  negativeList,
  onSelectNegative,
  onNavigate
}) => {
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>(loadWarehouses);
  const [activeId, setActiveId] = useState<string>(() => {
    try {
      return localStorage.getItem(ACTIVE_WAREHOUSE_KEY) || '';
    } catch {
      return '';
    }
  });
  const [collapsed, setCollapsed] = useState<GroupKey[]>([]);
  const [editor, setEditor] = useState<null | { item: WarehouseItem | null }>(null);
  const [deleteTarget, setDeleteTarget] = useState<WarehouseItem | null>(null);
  const [assignmentVersion, setAssignmentVersion] = useState(0);
  const [notice, setNotice] = useState('');

  const activeWarehouse = warehouses.find((item) => item.id === activeId) ?? warehouses[0] ?? null;

  useEffect(() => {
    if (!activeWarehouse) return;
    try {
      localStorage.setItem(ACTIVE_WAREHOUSE_KEY, activeWarehouse.id);
    } catch {
      // Ignore storage failures.
    }
  }, [activeWarehouse]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 2400);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const assignment = useMemo(
    () => resolveLibraryAssignments(negativeList.map((item) => item.id), warehouses.map((item) => item.id)),
    [negativeList, warehouses, assignmentVersion]
  );
  const countOf = (id: string) => negativeList.filter((item) => isInWarehouse(assignment, item.id, id)).length;

  const persist = (next: WarehouseItem[]) => {
    setWarehouses(next);
    saveWarehouses(next);
  };

  const submitEditor = (values: WarehouseFormValues) => {
    const editing = editor?.item ?? null;
    const next = upsertWarehouse(warehouses, values, editing);
    persist(next);
    if (!editing) setActiveId(next[0].id);
    setNotice(editing ? '仓库已更新' : '仓库已创建');
    setEditor(null);
  };

  const deleteBlockReason = (item: WarehouseItem) => {
    if (countOf(item.id) > 0) return '仓库内有数据，不能删除';
    if (warehouses.length <= 1) return '至少保留一个仓库';
    return '';
  };

  const confirmDelete = () => {
    if (!deleteTarget || deleteBlockReason(deleteTarget)) return;
    const next = warehouses.filter((item) => item.id !== deleteTarget.id);
    persist(next);
    if (activeWarehouse?.id === deleteTarget.id) setActiveId(next[0]?.id ?? '');
    setDeleteTarget(null);
    setNotice('仓库已删除');
  };

  const toggleEnabled = (item: WarehouseItem) => {
    const enabled = !isWarehouseEnabled(item);
    persist(warehouses.map((entry) => (entry.id === item.id ? { ...entry, enabled } : entry)));
    setNotice(enabled ? `「${item.name}」已启用` : `「${item.name}」已停用`);
  };

  const toggleGroup = (key: GroupKey) =>
    setCollapsed((prev) => (prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]));

  return (
    <div className="flex flex-col lg:flex-row items-start gap-5">
      {notice && (
        <div className="fixed top-4 right-4 z-[60] bg-[#1E5ABB] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-bold">
          {notice}
        </div>
      )}

      <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col lg:max-h-[calc(100vh-180px)]">
        <div className="px-4 pt-4 pb-3 border-b border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">数据仓库</h2>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                title="查看全部仓库"
                aria-label="查看全部仓库"
                onClick={() => onNavigate('data-warehouse-manage')}
                className="w-7 h-7 rounded-full border border-gray-200 text-gray-500 hover:text-[#1E5ABB] hover:border-blue-200 hover:bg-blue-50 inline-flex items-center justify-center cursor-pointer"
              >
                <LayoutList className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setEditor({ item: null })}
                className="px-2.5 py-1 rounded-full bg-[#1E5ABB] hover:bg-[#184996] text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                新建
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
          {GROUPS.map((group) => {
            const scoped = warehouses.filter((item) => item.shareScope === group.key);
            const items = [...scoped.filter(isWarehouseEnabled), ...scoped.filter((item) => !isWarehouseEnabled(item))];
            const open = !collapsed.includes(group.key);
            return (
              <div key={group.key}>
                <button
                  type="button"
                  onClick={() => toggleGroup(group.key)}
                  className="w-full flex items-center gap-1.5 px-2 py-2 text-[13px] font-bold text-gray-800 hover:bg-slate-50 rounded-lg cursor-pointer"
                >
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? '' : '-rotate-90'}`} />
                  <span>{group.label}</span>
                  <span className="text-gray-400 font-mono font-normal">({items.length})</span>
                </button>
                {open && (
                  <div className="space-y-0.5 pb-1">
                    {items.length === 0 && <p className="pl-7 py-1.5 text-[11px] text-gray-400">暂无仓库</p>}
                    {items.map((item) => {
                      const active = item.id === activeWarehouse?.id;
                      const count = countOf(item.id);
                      const blockReason = deleteBlockReason(item);
                      const enabled = isWarehouseEnabled(item);
                      return (
                        <div
                          key={item.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setActiveId(item.id)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') setActiveId(item.id);
                          }}
                          className={`group relative ml-2 pl-3 pr-2 py-2 rounded-lg cursor-pointer flex items-start gap-2 transition-colors ${
                            active ? 'bg-blue-50 text-[#1E5ABB]' : 'text-gray-700 hover:bg-slate-50'
                          } ${enabled ? '' : 'opacity-60'}`}
                        >
                          {active && <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#1E5ABB]" />}
                          <Database className={`w-4 h-4 mt-0.5 shrink-0 ${enabled ? 'text-[#1E5ABB]' : 'text-gray-300'}`} />
                          <span className="min-w-0 flex-1">
                            <span
                              className={`block text-xs truncate ${active ? 'font-bold' : 'font-medium'} ${enabled ? '' : 'text-gray-400'}`}
                              title={item.name}
                            >
                              {item.name}
                            </span>
                            <span className="block text-[11px] text-gray-400 truncate mt-0.5">{item.remark || '暂无说明'}</span>
                          </span>
                          <span className="shrink-0 mt-0.5 text-[10px] text-gray-400 group-hover:hidden">
                            <span className={`font-mono font-semibold ${enabled ? 'text-gray-600' : 'text-gray-400'}`}>{count}</span> 条
                          </span>
                          <span className="shrink-0 items-center gap-0.5 hidden group-hover:flex">
                            <button
                              type="button"
                              title={enabled ? '停用仓库' : '启用仓库'}
                              onClick={(event) => {
                                event.stopPropagation();
                                toggleEnabled(item);
                              }}
                              className={`w-6 h-6 rounded inline-flex items-center justify-center hover:bg-white cursor-pointer ${
                                enabled ? 'text-emerald-500 hover:text-amber-600' : 'text-gray-400 hover:text-emerald-600'
                              }`}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              title="编辑仓库"
                              onClick={(event) => {
                                event.stopPropagation();
                                setEditor({ item });
                              }}
                              className="w-6 h-6 rounded inline-flex items-center justify-center text-gray-400 hover:text-[#1E5ABB] hover:bg-white cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              title={blockReason || '删除仓库'}
                              disabled={Boolean(blockReason)}
                              onClick={(event) => {
                                event.stopPropagation();
                                setDeleteTarget(item);
                              }}
                              className="w-6 h-6 rounded inline-flex items-center justify-center text-gray-400 hover:text-rose-600 hover:bg-white cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-gray-400 disabled:hover:bg-transparent"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      <div className="flex-1 min-w-0 w-full">
        {activeWarehouse ? (
          <NegativeInfoLibrary
            negativeList={negativeList}
            onSelectNegative={onSelectNegative}
            onNavigate={onNavigate}
            embedded={{
              warehouseId: activeWarehouse.id,
              warehouses,
              assignmentVersion,
              detailPage: 'data-warehouse-detail',
              onRecordsMoved: () => setAssignmentVersion((value) => value + 1)
            }}
          />
        ) : (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 py-20 text-center text-sm text-gray-400">
            暂无数据仓库，请先在左侧新建
          </div>
        )}
      </div>

      {editor && (
        <WarehouseEditorModal
          initial={editor.item}
          existing={warehouses}
          onClose={() => setEditor(null)}
          onSubmit={submitEditor}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 flex items-center justify-center p-4" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-5 space-y-4" onClick={(event) => event.stopPropagation()}>
            <h3 className="text-sm font-bold text-gray-900">删除仓库</h3>
            <p className="text-xs text-gray-600 leading-relaxed">确认删除空仓库「{deleteTarget.name}」？删除后不可恢复。</p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setDeleteTarget(null)} className="px-3 py-1.5 rounded-lg bg-gray-100 text-xs font-semibold cursor-pointer">
                取消
              </button>
              <button type="button" onClick={confirmDelete} className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer">
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
