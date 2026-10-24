import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRightLeft, Database, Globe, Lock, Plus, RotateCcw, Search, Users, X } from 'lucide-react';
import type { PageId, ReportItem } from '../types';
import {
  isWarehouseEnabled,
  loadWarehouses,
  saveWarehouses,
  upsertWarehouse,
  warehouseNowText,
  type WarehouseFormValues,
  type WarehouseItem,
  type WarehouseShareScope
} from '../data/warehouses';
import { isInWarehouse, moveRecordsBetweenWarehouses, resolveLibraryAssignments } from '../data/warehouseAssignments';
import { WarehouseEditorModal } from '../components/WarehouseEditorModal';
import { PaginationBar } from '../components/PaginationBar';
import { ACTIVE_WAREHOUSE_KEY } from './DataWarehouse';

const SHARE_ICON: Record<WarehouseShareScope, React.ElementType> = {
  全机构可见: Globe,
  指定人员可见: Users,
  仅本人可见: Lock
};

type StatusFilter = '全部' | '启用' | '停用';

interface DataWarehouseManageProps {
  negativeList: ReportItem[];
  onNavigate: (page: PageId) => void;
}

export const DataWarehouseManage: React.FC<DataWarehouseManageProps> = ({ negativeList, onNavigate }) => {
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>(loadWarehouses);
  const [keywordInput, setKeywordInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [scopeFilter, setScopeFilter] = useState<WarehouseShareScope | '全部'>('全部');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('全部');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editor, setEditor] = useState<null | { item: WarehouseItem | null }>(null);
  const [deleteTarget, setDeleteTarget] = useState<WarehouseItem | null>(null);
  const [notice, setNotice] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [migrateOpen, setMigrateOpen] = useState(false);
  const [migrateTargetId, setMigrateTargetId] = useState('');
  const [assignmentVersion, setAssignmentVersion] = useState(0);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 2400);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const assignment = useMemo(
    () => resolveLibraryAssignments(negativeList.map((item) => item.id), warehouses.map((item) => item.id)),
    [negativeList, warehouses, assignmentVersion]
  );
  const recordIdsOf = (id: string) => negativeList.filter((item) => isInWarehouse(assignment, item.id, id)).map((item) => item.id);
  const countOf = (id: string) => recordIdsOf(id).length;

  const persist = (next: WarehouseItem[]) => {
    setWarehouses(next);
    saveWarehouses(next);
  };

  const q = keyword.trim().toLowerCase();
  const filtered = warehouses.filter((item) => {
    if (q && !item.name.toLowerCase().includes(q) && !item.remark.toLowerCase().includes(q)) return false;
    if (scopeFilter !== '全部' && item.shareScope !== scopeFilter) return false;
    if (statusFilter === '启用' && !isWarehouseEnabled(item)) return false;
    if (statusFilter === '停用' && isWarehouseEnabled(item)) return false;
    return true;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const rows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const enabledCount = warehouses.filter(isWarehouseEnabled).length;
  const totalData = negativeList.filter((item) => warehouses.some((w) => isInWarehouse(assignment, item.id, w.id))).length;

  const backToWarehouse = (warehouseId?: string) => {
    if (warehouseId) {
      try {
        localStorage.setItem(ACTIVE_WAREHOUSE_KEY, warehouseId);
      } catch {
        // Ignore storage failures.
      }
    }
    onNavigate('data-warehouse');
  };

  const resetFilters = () => {
    setKeywordInput('');
    setKeyword('');
    setScopeFilter('全部');
    setStatusFilter('全部');
    setPage(1);
  };

  const submitEditor = (values: WarehouseFormValues) => {
    const editing = editor?.item ?? null;
    persist(upsertWarehouse(warehouses, values, editing));
    setNotice(editing ? '仓库已更新' : '仓库已创建');
    setEditor(null);
  };

  const toggleEnabled = (item: WarehouseItem) => {
    const enabled = !isWarehouseEnabled(item);
    persist(warehouses.map((entry) => (entry.id === item.id ? { ...entry, enabled } : entry)));
    setNotice(enabled ? `「${item.name}」已启用` : `「${item.name}」已停用`);
  };

  const deleteBlockReason = (item: WarehouseItem) => {
    if (countOf(item.id) > 0) return '仓库内有数据，不能删除';
    if (warehouses.length <= 1) return '至少保留一个仓库';
    return '';
  };

  const confirmDelete = () => {
    if (!deleteTarget || deleteBlockReason(deleteTarget)) return;
    persist(warehouses.filter((item) => item.id !== deleteTarget.id));
    setSelectedIds((prev) => prev.filter((id) => id !== deleteTarget.id));
    setDeleteTarget(null);
    setNotice('仓库已删除');
  };

  const pageIds = rows.map((item) => item.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));
  const togglePage = () =>
    setSelectedIds((prev) =>
      allPageSelected ? prev.filter((id) => !pageIds.includes(id)) : Array.from(new Set([...prev, ...pageIds]))
    );
  const toggleRow = (id: string) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));

  const selectedWarehouses = warehouses.filter((item) => selectedIds.includes(item.id));
  const migrateRecordIds = Array.from(new Set(selectedWarehouses.flatMap((item) => recordIdsOf(item.id))));
  const migrateTargets = warehouses.filter((item) => !selectedIds.includes(item.id) && isWarehouseEnabled(item));

  const openMigrate = () => {
    setMigrateTargetId('');
    setMigrateOpen(true);
  };

  const confirmMigrate = () => {
    const target = warehouses.find((item) => item.id === migrateTargetId);
    if (!target || migrateRecordIds.length === 0) return;
    selectedWarehouses.forEach((item) => moveRecordsBetweenWarehouses(recordIdsOf(item.id), item.id, target.id));
    persist(warehouses.map((item) => (item.id === target.id ? { ...item, updatedAt: warehouseNowText() } : item)));
    setAssignmentVersion((value) => value + 1);
    setNotice(`已将 ${migrateRecordIds.length} 条数据迁移到「${target.name}」`);
    setSelectedIds([]);
    setMigrateOpen(false);
  };

  const filterSelect =
    'px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/15 focus:border-[#1E5ABB] cursor-pointer';

  const stats = [
    { label: '仓库总数', value: warehouses.length, tone: 'text-gray-900' },
    { label: '启用中', value: enabledCount, tone: 'text-emerald-600' },
    { label: '已停用', value: warehouses.length - enabledCount, tone: 'text-gray-400' },
    { label: '数据总量', value: totalData, tone: 'text-[#1E5ABB]' }
  ];

  return (
    <div className="space-y-4">
      {notice && (
        <div className="fixed top-4 right-4 z-[60] bg-[#1E5ABB] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-bold">
          {notice}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs px-5 py-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => backToWarehouse()}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:text-[#1E5ABB] hover:border-blue-200 hover:bg-blue-50/50 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          返回数据仓库
        </button>
        <span className="w-px h-5 bg-gray-200" />
        <div className="min-w-0">
          <h2 className="text-base font-bold text-gray-900">仓库管理</h2>
          <p className="text-[11px] text-gray-400 mt-0.5">查看全部数据仓库，统一维护名称、可见范围和启用状态</p>
        </div>
        <button
          type="button"
          onClick={() => setEditor({ item: null })}
          className="ml-auto px-3 py-1.5 rounded-lg bg-[#1E5ABB] hover:bg-[#184996] text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          新建仓库
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs px-5 py-4">
            <p className="text-xs text-gray-500">{stat.label}</p>
            <p className={`text-2xl font-bold font-mono mt-1 ${stat.tone}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 flex flex-wrap items-center gap-2 text-xs border-b border-gray-100">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
            <input
              value={keywordInput}
              onChange={(event) => setKeywordInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  setKeyword(keywordInput);
                  setPage(1);
                }
              }}
              placeholder="搜索仓库名称或说明"
              className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/15 focus:border-[#1E5ABB]"
            />
          </div>
          <select
            value={scopeFilter}
            onChange={(event) => {
              setScopeFilter(event.target.value as WarehouseShareScope | '全部');
              setPage(1);
            }}
            aria-label="可见范围"
            className={filterSelect}
          >
            <option value="全部">全部可见范围</option>
            <option value="全机构可见">全机构可见</option>
            <option value="指定人员可见">指定人员可见</option>
            <option value="仅本人可见">仅本人可见</option>
          </select>
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as StatusFilter);
              setPage(1);
            }}
            aria-label="状态"
            className={filterSelect}
          >
            <option value="全部">全部状态</option>
            <option value="启用">启用</option>
            <option value="停用">停用</option>
          </select>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setKeyword(keywordInput);
                setPage(1);
              }}
              className="px-3 py-1.5 rounded-lg bg-[#1E5ABB] hover:bg-[#184A9C] text-white font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              查询
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              重置
            </button>
            <button
              type="button"
              onClick={openMigrate}
              disabled={selectedIds.length === 0}
              title={selectedIds.length === 0 ? '请先勾选要迁出数据的仓库' : ''}
              className="px-3 py-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 font-semibold inline-flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-amber-50"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              批量迁移数据
              {selectedIds.length > 0 && <span className="font-mono">({selectedIds.length})</span>}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50/80 text-gray-500 border-b border-gray-100">
                <th className="py-2.5 pl-4 w-8">
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={togglePage}
                    aria-label="全选本页"
                    className="accent-[#1E5ABB] cursor-pointer"
                  />
                </th>
                <th className="py-2.5 px-4 font-semibold w-14">序号</th>
                <th className="py-2.5 px-4 font-semibold min-w-[220px]">仓库名称</th>
                <th className="py-2.5 px-4 font-semibold">主分类</th>
                <th className="py-2.5 px-4 font-semibold">可见范围</th>
                <th className="py-2.5 px-4 font-semibold text-center">数据量</th>
                <th className="py-2.5 px-4 font-semibold">状态</th>
                <th className="py-2.5 px-4 font-semibold">创建人</th>
                <th className="py-2.5 px-4 font-semibold">更新时间</th>
                <th className="py-2.5 px-4 font-semibold text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-14 text-center text-gray-400">
                    暂无符合条件的仓库
                  </td>
                </tr>
              )}
              {rows.map((item, index) => {
                const enabled = isWarehouseEnabled(item);
                const ShareIcon = SHARE_ICON[item.shareScope];
                const blockReason = deleteBlockReason(item);
                return (
                  <tr
                    key={item.id}
                    className={`${selectedIds.includes(item.id) ? 'bg-blue-50/40' : 'hover:bg-gray-50/70'} ${enabled ? '' : 'text-gray-400'}`}
                  >
                    <td className="py-3 pl-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleRow(item.id)}
                        aria-label={`选择${item.name}`}
                        className="accent-[#1E5ABB] cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-400">{(safePage - 1) * pageSize + index + 1}</td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => backToWarehouse(item.id)}
                        className="flex items-start gap-2 text-left cursor-pointer group"
                      >
                        <Database className={`w-4 h-4 mt-0.5 shrink-0 ${enabled ? 'text-[#1E5ABB]' : 'text-gray-300'}`} />
                        <span className="min-w-0">
                          <span className={`block font-semibold group-hover:text-[#1E5ABB] ${enabled ? 'text-gray-900' : 'text-gray-400'}`}>
                            {item.name}
                          </span>
                          <span className="block text-[11px] text-gray-400 truncate max-w-[260px]">{item.remark || '暂无说明'}</span>
                        </span>
                      </button>
                    </td>
                    <td className="py-3 px-4">{item.category}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 whitespace-nowrap">
                        <ShareIcon className="w-3.5 h-3.5 text-gray-400" />
                        {item.shareScope}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold">{countOf(item.id)}</td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={enabled}
                        onClick={() => toggleEnabled(item)}
                        title={enabled ? '点击停用' : '点击启用'}
                        className="inline-flex items-center gap-2 cursor-pointer"
                      >
                        <span className={`relative w-8 h-4.5 rounded-full transition-colors ${enabled ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                          <span
                            className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-all ${enabled ? 'left-4' : 'left-0.5'}`}
                          />
                        </span>
                        <span className={enabled ? 'text-emerald-600 font-semibold' : 'text-gray-400'}>{enabled ? '启用' : '停用'}</span>
                      </button>
                    </td>
                    <td className="py-3 px-4">{item.creator}</td>
                    <td className="py-3 px-4 font-mono text-gray-400 whitespace-nowrap">{item.updatedAt}</td>
                    <td className="py-3 px-4 text-center whitespace-nowrap space-x-3">
                      <button type="button" onClick={() => setEditor({ item })} className="text-[#1E5ABB] hover:underline font-semibold cursor-pointer">
                        编辑
                      </button>
                      <button
                        type="button"
                        title={blockReason || '删除仓库'}
                        disabled={Boolean(blockReason)}
                        onClick={() => setDeleteTarget(item)}
                        className="text-rose-500 hover:underline cursor-pointer disabled:text-gray-300 disabled:no-underline disabled:cursor-not-allowed"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="border-t border-gray-100">
          <PaginationBar
            total={filtered.length}
            page={safePage}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        </div>
      </div>

      {editor && (
        <WarehouseEditorModal initial={editor.item} existing={warehouses} onClose={() => setEditor(null)} onSubmit={submitEditor} />
      )}

      {migrateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 flex items-center justify-center p-4" onClick={() => setMigrateOpen(false)}>
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between px-5 pt-5">
              <h3 className="text-sm font-bold text-gray-900">批量迁移数据</h3>
              <button type="button" onClick={() => setMigrateOpen(false)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-4 text-xs">
              <div>
                <p className="font-semibold text-gray-700 mb-1.5">迁出仓库（{selectedWarehouses.length}）</p>
                <div className="rounded-lg border border-gray-200 divide-y divide-gray-100 max-h-36 overflow-y-auto">
                  {selectedWarehouses.map((item) => (
                    <div key={item.id} className="px-3 py-2 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 min-w-0">
                        <Database className="w-3.5 h-3.5 text-[#1E5ABB] shrink-0" />
                        <span className="truncate text-gray-800">{item.name}</span>
                      </span>
                      <span className="shrink-0 text-gray-500">
                        <span className="font-mono font-semibold text-gray-800">{countOf(item.id)}</span> 条
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1.5">迁移至</label>
                <select
                  value={migrateTargetId}
                  onChange={(event) => setMigrateTargetId(event.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/15 focus:border-[#1E5ABB]"
                >
                  <option value="">请选择目标仓库</option>
                  {migrateTargets.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}（{countOf(item.id)} 条）
                    </option>
                  ))}
                </select>
              </div>
              {migrateRecordIds.length === 0 && <p className="text-amber-600">所选仓库暂无数据，无需迁移。</p>}
            </div>
            <div className="flex items-center justify-between gap-2 px-5 pb-5">
              <span className="text-xs text-gray-500">
                共迁移 <span className="font-mono font-bold text-[#1E5ABB]">{migrateRecordIds.length}</span> 条数据
              </span>
              <div className="flex gap-2">
                <button type="button" onClick={() => setMigrateOpen(false)} className="px-3 py-1.5 rounded-lg bg-gray-100 text-xs font-semibold cursor-pointer">
                  取消
                </button>
                <button
                  type="button"
                  onClick={confirmMigrate}
                  disabled={!migrateTargetId || migrateRecordIds.length === 0}
                  className="px-3 py-1.5 rounded-lg bg-[#1E5ABB] hover:bg-[#184996] text-white text-xs font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  确认迁移
                </button>
              </div>
            </div>
          </div>
        </div>
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
