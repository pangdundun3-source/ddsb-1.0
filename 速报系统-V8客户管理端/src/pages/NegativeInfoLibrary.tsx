import React, { useEffect, useMemo, useState } from 'react';
import { ReportItem, PageId } from '../types';
import { ChevronRight, Database, Search, RotateCcw, X, Pencil, Trash2, Plus, Globe, Users, Lock, Inbox, Clock, ArrowRightLeft, LogOut, FileText, Send } from 'lucide-react';
import {
  isWarehouseEnabled,
  loadWarehouses,
  saveWarehouses,
  upsertWarehouse,
  type WarehouseCategory,
  type WarehouseFormValues,
  type WarehouseItem,
  type WarehouseShareScope
} from '../data/warehouses';
import { WAREHOUSE_CATEGORIES, WarehouseEditorModal } from '../components/WarehouseEditorModal';
import {
  isInWarehouse,
  moveRecordsBetweenWarehouses,
  removeRecordsFromWarehouse,
  resolveLibraryAssignments,
} from '../data/warehouseAssignments';
import { PaginationBar } from '../components/PaginationBar';
import { OrgPathDisplay, getOrganizationPathText } from '../components/OrgPathDisplay';
import { IdentificationBadge } from '../components/IdentificationBadge';
import { resolveIdentification } from '../services/identificationService';
import { TransferDirectiveModal } from '../components/TransferDirectiveModal';

const SHARE_ICON: Record<WarehouseShareScope, React.ElementType> = {
  全机构可见: Globe,
  指定人员可见: Users,
  仅本人可见: Lock
};

const CATEGORY_STYLE: Record<WarehouseCategory, string> = {
  舆情类: 'bg-blue-50 text-[#1E5ABB] border-blue-100',
  融媒体类: 'bg-violet-50 text-violet-600 border-violet-100',
  境外类: 'bg-amber-50 text-amber-700 border-amber-100'
};

export interface EmbeddedWarehouseScope {
  warehouseId: string;
  warehouses: WarehouseItem[];
  assignmentVersion: number;
  detailPage: PageId;
  onRecordsMoved: () => void;
}

interface NegativeInfoLibraryProps {
  negativeList: ReportItem[];
  onSelectNegative: (item: ReportItem) => void;
  onTransferSubmit?: (id: number, opinion: string) => void;
  onNavigate: (page: PageId) => void;
  embedded?: EmbeddedWarehouseScope;
}

export const NegativeInfoLibrary: React.FC<NegativeInfoLibraryProps> = ({
  negativeList,
  onSelectNegative,
  onTransferSubmit,
  onNavigate,
  embedded
}) => {
  const [keyword, setKeyword] = useState('');
  const [timeFilterType, setTimeFilterType] = useState<'submit' | 'auditComplete'>('submit');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [orgFilterType, setOrgFilterType] = useState<'submit' | 'audit'>('submit');
  const [orgFilter, setOrgFilter] = useState('全部');
  const [statusFilter, setStatusFilter] = useState('全部');
  const [identFilter, setIdentFilter] = useState<'全部' | '首发' | '重复'>('全部');
  const [keywordInput, setKeywordInput] = useState('');
  const [transferTarget, setTransferTarget] = useState<ReportItem | null>(null);
  const [warehouses, setWarehouses] = useState(loadWarehouses);
  const [activeWarehouseId, setActiveWarehouseId] = useState<string | null>(null);
  const [warehouseKeyword, setWarehouseKeyword] = useState('');
  const [appliedWarehouseKeyword, setAppliedWarehouseKeyword] = useState('');
  const [warehousePage, setWarehousePage] = useState(1);
  const [warehousePageSize, setWarehousePageSize] = useState(10);
  const [warehouseCategory, setWarehouseCategory] = useState<WarehouseCategory | '全部'>('全部');
  const [warehouseEditor, setWarehouseEditor] = useState<null | { item: WarehouseItem | null }>(null);
  const [deleteWarehouse, setDeleteWarehouse] = useState<WarehouseItem | null>(null);
  const [warehouseNotice, setWarehouseNotice] = useState('');
  const [selectedRecordIds, setSelectedRecordIds] = useState<number[]>([]);
  const [moveRecordIds, setMoveRecordIds] = useState<number[] | null>(null);
  const [moveTargetId, setMoveTargetId] = useState('');
  const [removeRecordIds, setRemoveRecordIds] = useState<number[] | null>(null);

  useEffect(() => {
    if (!warehouseNotice) return;
    const timer = window.setTimeout(() => setWarehouseNotice(''), 2400);
    return () => window.clearTimeout(timer);
  }, [warehouseNotice]);

  useEffect(() => {
    const showWarehouseHome = () => {
      setWarehouses(loadWarehouses());
      setActiveWarehouseId(null);
    };
    window.addEventListener('ddsb-negative-library-home', showWarehouseHome);
    return () => window.removeEventListener('ddsb-negative-library-home', showWarehouseHome);
  }, []);

  const scopeWarehouses = embedded ? embedded.warehouses : warehouses;
  const assignment = useMemo(
    () => resolveLibraryAssignments(negativeList.map((item) => item.id), scopeWarehouses.map((item) => item.id)),
    [negativeList, scopeWarehouses, embedded?.assignmentVersion]
  );
  const activeWarehouse = embedded
    ? scopeWarehouses.find((item) => item.id === embedded.warehouseId) ?? null
    : warehouses.find((item) => item.id === activeWarehouseId) ?? null;

  useEffect(() => {
    if (!embedded) return;
    handleReset();
    setSelectedRecordIds([]);
  }, [embedded?.warehouseId]);
  const scopedList = activeWarehouse
    ? negativeList.filter((item) => isInWarehouse(assignment, item.id, activeWarehouse.id))
    : negativeList;
  const warehouseCountOf = (id: string) =>
    negativeList.filter((item) => isInWarehouse(assignment, item.id, id)).length;

  const getAuditNode = (item: ReportItem) =>
    [...(item.timeline || [])]
      .reverse()
      .find((node) => (node.title.includes('审核') || node.title.includes('审')) && node.status !== 'pending');

  const getAuditor = (item: ReportItem) => {
    const operator = item.auditor || getAuditNode(item)?.operator || '系统审核';
    return operator.split('·')[0].trim();
  };

  const getAuditorOrg = (item: ReportItem) => {
    const operator = item.auditor || getAuditNode(item)?.operator || '';
    const parts = operator.split('·');
    return (parts[1] || '').trim() || '市委宣传部舆情科';
  };

  const getAuditCompleteTime = (item: ReportItem) => item.auditTime || getAuditNode(item)?.time || item.submitTime;

  const getTransferStatus = (item: ReportItem) => (item.auditStatus === '已转办' ? '已转办' : '待转办');

  const submitOrgOptions = Array.from(new Set(scopedList.map((item) => item.organization)));
  const auditOrgOptions = Array.from(new Set(scopedList.map((item) => getAuditorOrg(item))));
  const activeOrgOptions = orgFilterType === 'submit' ? submitOrgOptions : auditOrgOptions;

  const normalizeDate = (value?: string) => {
    const dateText = (value || '').trim();
    if (!dateText || dateText === '--') return '';
    return dateText.replace(/\//g, '-').slice(0, 10);
  };

  const startDateFilter = normalizeDate(startDate);
  const endDateFilter = normalizeDate(endDate);
  const getTimeFilterValue = (item: ReportItem) =>
    timeFilterType === 'submit' ? item.submitTime : getAuditCompleteTime(item);

  const filtered = scopedList.filter((item) => {
    if (keyword) {
      const q = keyword.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchAuthor = (item.author || '').toLowerCase().includes(q);
      const matchAuditor = getAuditor(item).toLowerCase().includes(q);
      const matchOrg = (item.organization || '').toLowerCase().includes(q);
      const matchOrgPath = getOrganizationPathText(item.organization).toLowerCase().includes(q);
      const matchAuditorOrgPath = getOrganizationPathText(getAuditorOrg(item)).toLowerCase().includes(q);
      if (!matchTitle && !matchAuthor && !matchAuditor && !matchOrg && !matchOrgPath && !matchAuditorOrgPath) {
        return false;
      }
    }
    const itemDate = normalizeDate(getTimeFilterValue(item));
    if (startDateFilter && (!itemDate || itemDate < startDateFilter)) return false;
    if (endDateFilter && (!itemDate || itemDate > endDateFilter)) return false;
    if (statusFilter !== '全部' && getTransferStatus(item) !== statusFilter) return false;
    if (orgFilter !== '全部') {
      const itemOrg = orgFilterType === 'submit' ? item.organization : getAuditorOrg(item);
      if (itemOrg !== orgFilter) return false;
    }
    if (identFilter !== '全部') {
      const identStatus = resolveIdentification(item, negativeList).status;
      if (identFilter === '首发' && identStatus !== '首发' && identStatus !== '疑似首发' && identStatus !== '首发报送') {
        return false;
      }
      if (identFilter === '重复' && identStatus !== '重复' && identStatus !== '疑似重复' && identStatus !== '重复报送') {
        return false;
      }
    }
    return true;
  });
  // Pagination (页码管理 + 每页条数设置)
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [keyword, orgFilterType, orgFilter, statusFilter, identFilter, timeFilterType, startDateFilter, endDateFilter, activeWarehouseId]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  // 按审核完成时间倒序，让新入库(含中途驳回演示)记录优先展示
  const sortedByAuditTime = [...filtered].sort((a, b) =>
    (getAuditCompleteTime(b) || '').localeCompare(getAuditCompleteTime(a) || '')
  );
  const displayList = sortedByAuditTime.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleReset = () => {
    setKeyword('');
    setKeywordInput('');
    setTimeFilterType('submit');
    setStartDate('');
    setEndDate('');
    setOrgFilterType('submit');
    setOrgFilter('全部');
    setStatusFilter('全部');
    setIdentFilter('全部');
  };

  const warehouseQuery = appliedWarehouseKeyword.trim().toLowerCase();
  const visibleWarehouses = warehouses.filter((item) => {
    if (warehouseCategory !== '全部' && item.category !== warehouseCategory) return false;
    if (!warehouseQuery) return true;
    return item.name.toLowerCase().includes(warehouseQuery) || item.remark.toLowerCase().includes(warehouseQuery);
  });
  const warehouseTotalPages = Math.max(1, Math.ceil(visibleWarehouses.length / warehousePageSize));
  const safeWarehousePage = Math.min(warehousePage, warehouseTotalPages);
  const warehouseRows = visibleWarehouses.slice(
    (safeWarehousePage - 1) * warehousePageSize,
    safeWarehousePage * warehousePageSize
  );

  const searchWarehouses = () => {
    setAppliedWarehouseKeyword(warehouseKeyword);
    setWarehousePage(1);
  };

  const resetWarehouseSearch = () => {
    setWarehouseKeyword('');
    setAppliedWarehouseKeyword('');
    setWarehouseCategory('全部');
    setWarehousePage(1);
  };

  const pendingCountOf = (id: string) =>
    negativeList.filter((item) => isInWarehouse(assignment, item.id, id) && getTransferStatus(item) === '待转办').length;
  const emptyWarehouseCount = warehouses.filter((item) => warehouseCountOf(item.id) === 0).length;
  const totalPending = negativeList.filter((item) => getTransferStatus(item) === '待转办').length;

  const persistWarehouses = (next: WarehouseItem[]) => {
    setWarehouses(next);
    saveWarehouses(next);
  };

  const submitWarehouse = (values: WarehouseFormValues) => {
    const editing = warehouseEditor?.item ?? null;
    persistWarehouses(upsertWarehouse(warehouses, values, editing));
    setWarehouseNotice(editing ? '仓库已更新' : '仓库已创建');
    setWarehouseEditor(null);
  };

  const deleteBlockReason = (item: WarehouseItem) => {
    if (warehouseCountOf(item.id) > 0) return '仓库内有数据，不能删除';
    if (warehouses.length <= 1) return '至少保留一个仓库';
    return '';
  };

  const confirmDeleteWarehouse = () => {
    if (!deleteWarehouse || deleteBlockReason(deleteWarehouse)) return;
    persistWarehouses(warehouses.filter((item) => item.id !== deleteWarehouse.id));
    setDeleteWarehouse(null);
    setWarehouseNotice('仓库已删除');
  };

  const moveTargets = scopeWarehouses.filter((item) => item.id !== activeWarehouse?.id && isWarehouseEnabled(item));

  const openMoveRecords = (ids: number[]) => {
    if (ids.length === 0) {
      setWarehouseNotice('请先勾选要迁出的数据');
      return;
    }
    setMoveTargetId('');
    setMoveRecordIds(ids);
  };

  const confirmMoveRecords = () => {
    if (!moveRecordIds || !moveTargetId || !activeWarehouse) return;
    const target = scopeWarehouses.find((item) => item.id === moveTargetId);
    moveRecordsBetweenWarehouses(moveRecordIds, activeWarehouse.id, moveTargetId);
    setSelectedRecordIds((prev) => prev.filter((id) => !moveRecordIds.includes(id)));
    setWarehouseNotice(`已将 ${moveRecordIds.length} 条数据迁移至「${target?.name ?? ''}」`);
    setMoveRecordIds(null);
    embedded?.onRecordsMoved();
  };

  const openRemoveRecords = (ids: number[]) => {
    if (ids.length === 0) {
      setWarehouseNotice('请先勾选要移出的数据');
      return;
    }
    setRemoveRecordIds(ids);
  };

  const confirmRemoveRecords = () => {
    if (!removeRecordIds || !activeWarehouse) return;
    removeRecordsFromWarehouse(removeRecordIds, activeWarehouse.id);
    setSelectedRecordIds((prev) => prev.filter((id) => !removeRecordIds.includes(id)));
    setWarehouseNotice(`已将 ${removeRecordIds.length} 条数据移出仓库`);
    setRemoveRecordIds(null);
    embedded?.onRecordsMoved();
  };

  if (!activeWarehouse) {
    const summaryTiles = [
      { label: '数据仓库', value: warehouses.length, unit: '个', icon: Database, tone: 'text-[#1E5ABB] bg-blue-50' },
      { label: '入库数据总量', value: negativeList.length, unit: '条', icon: Inbox, tone: 'text-emerald-600 bg-emerald-50' },
      { label: '待转办', value: totalPending, unit: '条', icon: Clock, tone: 'text-amber-600 bg-amber-50' },
      { label: '空仓库', value: emptyWarehouseCount, unit: '个', icon: Trash2, tone: 'text-gray-500 bg-gray-100' }
    ];

    return (
      <div className="space-y-4">
        {warehouseNotice && (
          <div className="fixed top-4 right-4 z-[60] bg-[#1E5ABB] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-bold">
            {warehouseNotice}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">不良信息库</h2>
            <p className="text-xs text-gray-400 mt-1">按数据仓库归档已审核通过的不良信息，进入仓库查看明细</p>
          </div>
          <button
            type="button"
            onClick={() => setWarehouseEditor({ item: null })}
            className="self-start sm:self-auto px-4 py-2 rounded-lg bg-[#1E5ABB] hover:bg-[#184996] text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            新建仓库
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {summaryTiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <div key={tile.label} className="bg-white rounded-xl border border-gray-200/80 shadow-2xs px-4 py-3.5 flex items-center gap-3">
                <span className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${tile.tone}`}>
                  <Icon className="w-5 h-5" />
                </span>
                <div>
                  <div className="text-[11px] text-gray-500">{tile.label}</div>
                  <div className="text-xl font-bold text-gray-900 font-mono leading-tight">
                    {tile.value}
                    <span className="ml-1 text-xs font-normal text-gray-400">{tile.unit}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-xl border border-gray-200/80 shadow-2xs px-4 py-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            {(['全部', ...WAREHOUSE_CATEGORIES] as const).map((category) => {
              const active = warehouseCategory === category;
              const count =
                category === '全部' ? warehouses.length : warehouses.filter((item) => item.category === category).length;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => {
                    setWarehouseCategory(category);
                    setWarehousePage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    active ? 'bg-[#1E5ABB] text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {category}
                  <span className={`ml-1 font-mono ${active ? 'text-white/80' : 'text-gray-400'}`}>{count}</span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2 lg:w-[420px]">
            <div className="relative flex-1">
              <input
                value={warehouseKeyword}
                onChange={(event) => setWarehouseKeyword(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') searchWarehouses();
                }}
                placeholder="搜索仓库名称、说明"
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/15 focus:border-[#1E5ABB]"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            </div>
            <button
              type="button"
              onClick={searchWarehouses}
              className="px-4 py-2 rounded-lg bg-[#1E5ABB] hover:bg-[#184996] text-white text-xs font-bold cursor-pointer shrink-0"
            >
              查询
            </button>
            <button
              type="button"
              onClick={resetWarehouseSearch}
              className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              重置
            </button>
          </div>
        </div>

        {warehouseRows.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 py-16 text-center text-sm text-gray-400">
            暂无符合条件的仓库
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {warehouseRows.map((item) => {
              const count = warehouseCountOf(item.id);
              const pending = pendingCountOf(item.id);
              const ShareIcon = SHARE_ICON[item.shareScope];
              const blockReason = deleteBlockReason(item);
              const enter = () => {
                handleReset();
                setActiveWarehouseId(item.id);
              };
              return (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  onClick={enter}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') enter();
                  }}
                  className="group bg-white rounded-xl border border-gray-200/80 shadow-2xs hover:border-[#1E5ABB]/60 hover:shadow-md transition-all cursor-pointer flex flex-col"
                >
                  <div className="px-5 pt-4 flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-md border text-[11px] font-semibold ${CATEGORY_STYLE[item.category]}`}>
                        {item.category}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-50 border border-gray-200 text-[11px] text-gray-600">
                        <ShareIcon className="w-3 h-3" />
                        {item.shareScope}
                      </span>
                      {count === 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-gray-100 text-[11px] text-gray-500">空仓库</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        title="编辑仓库"
                        onClick={(event) => {
                          event.stopPropagation();
                          setWarehouseEditor({ item });
                        }}
                        className="w-7 h-7 rounded-md inline-flex items-center justify-center text-gray-400 hover:text-[#1E5ABB] hover:bg-blue-50 cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        title={blockReason || '删除仓库'}
                        disabled={Boolean(blockReason)}
                        onClick={(event) => {
                          event.stopPropagation();
                          setDeleteWarehouse(item);
                        }}
                        className="w-7 h-7 rounded-md inline-flex items-center justify-center text-gray-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="px-5 pt-2.5 pb-4 flex-1">
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-[#1E5ABB] transition-colors">{item.name}</h3>
                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed line-clamp-2 min-h-[2.5rem]">
                      {item.remark || '暂无仓库说明'}
                    </p>
                  </div>

                  <div className="mx-5 border-t border-gray-100 py-3 flex items-end justify-between gap-3">
                    <div className="flex items-end gap-6">
                      <div>
                        <div className="text-[11px] text-gray-400">数据总量</div>
                        <div className="text-2xl font-bold text-[#1E5ABB] font-mono leading-none mt-1">{count}</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-gray-400">待转办</div>
                        <div className={`text-2xl font-bold font-mono leading-none mt-1 ${pending > 0 ? 'text-amber-600' : 'text-gray-300'}`}>
                          {pending}
                        </div>
                      </div>
                    </div>
                    <span className="inline-flex items-center text-xs font-semibold text-[#1E5ABB]">
                      进入仓库
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>

                  <div className="px-5 py-2 bg-gray-50/70 rounded-b-xl border-t border-gray-100 text-[11px] text-gray-400 flex items-center justify-between">
                    <span>创建人：{item.creator}</span>
                    <span className="font-mono">更新于 {item.updatedAt}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200/80">
          <PaginationBar
            total={visibleWarehouses.length}
            page={safeWarehousePage}
            pageSize={warehousePageSize}
            onPageChange={setWarehousePage}
            onPageSizeChange={(size) => {
              setWarehousePageSize(size);
              setWarehousePage(1);
            }}
          />
        </div>

        {warehouseEditor && (
          <WarehouseEditorModal
            initial={warehouseEditor.item}
            existing={warehouses}
            onClose={() => setWarehouseEditor(null)}
            onSubmit={submitWarehouse}
          />
        )}

        {deleteWarehouse && (
          <div className="fixed inset-0 z-50 bg-slate-900/45 flex items-center justify-center p-4" onClick={() => setDeleteWarehouse(null)}>
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-5 space-y-4" onClick={(event) => event.stopPropagation()}>
              <h3 className="text-sm font-bold text-gray-900">删除仓库</h3>
              <p className="text-xs text-gray-600 leading-relaxed">确认删除空仓库「{deleteWarehouse.name}」？删除后不可恢复。</p>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setDeleteWarehouse(null)} className="px-3 py-1.5 rounded-lg bg-gray-100 text-xs font-semibold cursor-pointer">
                  取消
                </button>
                <button type="button" onClick={confirmDeleteWarehouse} className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer">
                  删除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (embedded) {
    const pageRecordIds = displayList.map((item) => item.id);
    const allPageSelected = pageRecordIds.length > 0 && pageRecordIds.every((id) => selectedRecordIds.includes(id));
    const toggleRecordPage = () =>
      setSelectedRecordIds((prev) =>
        allPageSelected ? prev.filter((id) => !pageRecordIds.includes(id)) : Array.from(new Set([...prev, ...pageRecordIds]))
      );
    const toggleRecord = (id: number) =>
      setSelectedRecordIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
    const ShareIcon = SHARE_ICON[activeWarehouse.shareScope];
    const filterSelect =
      'px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/15 focus:border-[#1E5ABB] cursor-pointer';
    const actionLink = 'hover:underline cursor-pointer';
    const ACTION_COLOR = {
      detail: 'text-gray-500 hover:text-gray-800',
      transfer: 'text-[#1E5ABB] hover:text-[#184A9C] font-semibold',
      retransfer: 'text-sky-600 hover:text-sky-700',
      move: 'text-amber-600 hover:text-amber-700',
      remove: 'text-rose-500 hover:text-rose-600'
    };
    const batchLink =
      'inline-flex items-center gap-1 px-2.5 py-1 rounded-md border font-semibold cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed';

    return (
      <div className="space-y-4">
        {warehouseNotice && (
          <div className="fixed top-4 right-4 z-[60] bg-[#1E5ABB] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-bold">
            {warehouseNotice}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs px-5 pt-4 pb-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <span className="w-1 h-4 rounded-full bg-[#1E5ABB] shrink-0" />
            <h2 className="text-base font-bold text-gray-900 truncate">{activeWarehouse.name}</h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-100 text-[11px] text-[#1E5ABB]">
              <ShareIcon className="w-3 h-3" />
              {activeWarehouse.shareScope}
            </span>
            <div className="flex items-center gap-2 text-xs">
              {isWarehouseEnabled(activeWarehouse) ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  运行中
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  已停用
                </span>
              )}
              <span className="text-gray-500">
                共 <span className="font-mono font-bold text-gray-900 text-sm">{scopedList.length}</span> 条数据
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setKeyword(keywordInput.trim());
                }}
                placeholder="请输入事件标题、上报人员、审核人员姓名、机构名称进行检索"
                className="w-full pl-8 pr-7 py-1.5 border border-gray-300 hover:border-gray-400 focus:border-[#1E5ABB] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/15"
              />
              {keywordInput && (
                <button
                  type="button"
                  onClick={() => {
                    setKeywordInput('');
                    setKeyword('');
                  }}
                  className="absolute right-2 top-1.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                  title="清空"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <span className="text-gray-500">报送时间</span>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} aria-label="开始日期" className={`${filterSelect} w-32`} />
            <span className="text-gray-400">-</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} aria-label="结束日期" className={`${filterSelect} w-32`} />
            <select value={orgFilter} onChange={(e) => setOrgFilter(e.target.value)} aria-label="报送机构" className={`${filterSelect} max-w-[180px]`}>
              <option value="全部">全部报送机构</option>
              {activeOrgOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="状态" className={filterSelect}>
              <option value="全部">全部状态</option>
              <option value="待转办">待转办</option>
              <option value="已转办">已转办</option>
            </select>
            <select
              value={identFilter}
              onChange={(e) => setIdentFilter(e.target.value as '全部' | '首发' | '重复')}
              aria-label="识别标识"
              className={filterSelect}
            >
              <option value="全部">全部标识</option>
              <option value="首发">首发</option>
              <option value="重复">重复</option>
            </select>
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => setKeyword(keywordInput.trim())}
                className="px-3 py-1.5 rounded-lg bg-[#1E5ABB] hover:bg-[#184A9C] text-white font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                查询
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                重置
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
        <div className="px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 bg-gray-50/70 border-b border-gray-100 text-xs">
          <label className="inline-flex items-center gap-2 text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={allPageSelected}
              onChange={toggleRecordPage}
              aria-label="全选本页"
              className="accent-[#1E5ABB] cursor-pointer"
            />
            <span>
              共 <strong className="text-[#1E5ABB] font-mono">{filtered.length}</strong> 条不良信息
              <span className="mx-2 text-gray-300">|</span>
              已选 <strong className="text-[#1E5ABB] font-mono">{selectedRecordIds.length}</strong> 条
            </span>
          </label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => openMoveRecords(selectedRecordIds)}
              disabled={moveTargets.length === 0}
              className={`${batchLink} border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              批量迁移
            </button>
            <button
              type="button"
              onClick={() => openRemoveRecords(selectedRecordIds)}
              className={`${batchLink} border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100`}
            >
              <LogOut className="w-3.5 h-3.5" />
              批量移出
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {displayList.length === 0 && <div className="py-16 text-center text-sm text-gray-400">该仓库暂无不良信息</div>}
          {displayList.map((item) => {
            const ident = resolveIdentification(item, negativeList);
            const pending = getTransferStatus(item) === '待转办';
            const checked = selectedRecordIds.includes(item.id);
            const openDetail = () => {
              onSelectNegative(item);
              onNavigate(embedded.detailPage);
            };
            return (
              <div key={item.id} className={`group px-5 py-3.5 flex gap-3 transition-colors ${checked ? 'bg-blue-50/40' : 'hover:bg-gray-50/70'}`}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleRecord(item.id)}
                  aria-label={`选择${item.title}`}
                  className="mt-1 accent-[#1E5ABB] cursor-pointer shrink-0"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`shrink-0 px-1.5 py-px rounded text-[11px] font-medium ${
                          pending ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {getTransferStatus(item)}
                      </span>
                      <button
                        type="button"
                        onClick={openDetail}
                        title={item.title}
                        className="text-sm font-semibold text-gray-900 hover:text-[#1E5ABB] text-left truncate min-w-0 cursor-pointer"
                      >
                        {item.title}
                      </button>
                      <IdentificationBadge status={ident.status} size="xs" className="shrink-0" />
                    </div>
                    <div className="flex items-center gap-3 text-xs shrink-0">
                      <button type="button" onClick={openDetail} className={`${actionLink} ${ACTION_COLOR.detail}`}>详情</button>
                      <button
                        type="button"
                        onClick={() => setTransferTarget(item)}
                        className={`${actionLink} ${pending ? ACTION_COLOR.transfer : ACTION_COLOR.retransfer}`}
                      >
                        {pending ? '转办' : '再次转办'}
                      </button>
                      {moveTargets.length > 0 && (
                        <button type="button" onClick={() => openMoveRecords([item.id])} className={`${actionLink} ${ACTION_COLOR.move}`}>迁移</button>
                      )}
                      <button type="button" onClick={() => openRemoveRecords([item.id])} className={`${actionLink} ${ACTION_COLOR.remove}`}>移出</button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 truncate" title={item.detailContent?.summary || item.title}>
                    {item.detailContent?.summary || '暂无内容描述'}
                  </p>

                  <div className="flex items-center gap-1.5 min-w-0 whitespace-nowrap text-[11px] text-gray-400">
                    <span className="shrink-0 px-1 rounded bg-gray-100 text-gray-500">上报人</span>
                    <span className="shrink-0 text-gray-600">{item.author}</span>
                    <span className="shrink-0 text-gray-300">·</span>
                    <span title={getOrganizationPathText(item.organization)} className="truncate">{item.organization}</span>
                    <span className="shrink-0 text-gray-300">·</span>
                    <span className="shrink-0 font-mono">{item.submitTime}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-gray-100">
          <PaginationBar
            total={filtered.length}
            page={safePage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        </div>
        </div>

        {moveRecordIds && (
          <div className="fixed inset-0 z-50 bg-slate-900/45 flex items-center justify-center p-4" onClick={() => setMoveRecordIds(null)}>
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl" onClick={(event) => event.stopPropagation()}>
              <div className="flex items-start justify-between px-5 pt-5">
                <div>
                  <h3 className="text-base font-bold text-gray-900">迁移仓库</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    将 {moveRecordIds.length} 条数据从「{activeWarehouse.name}」迁移到目标仓库，迁移后原仓库不再保留。
                  </p>
                </div>
                <button type="button" onClick={() => setMoveRecordIds(null)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="px-5 py-4 space-y-2">
                <label className="block text-xs font-bold text-gray-800">迁移至</label>
                <select
                  value={moveTargetId}
                  onChange={(event) => setMoveTargetId(event.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/15 focus:border-[#1E5ABB]"
                >
                  <option value="">请选择目标仓库</option>
                  {moveTargets.map((target) => (
                    <option key={target.id} value={target.id}>
                      {target.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 px-5 pb-5">
                <button type="button" onClick={() => setMoveRecordIds(null)} className="px-4 py-2 rounded-lg bg-gray-100 text-xs font-semibold cursor-pointer">
                  取消
                </button>
                <button
                  type="button"
                  onClick={confirmMoveRecords}
                  disabled={!moveTargetId}
                  className="px-4 py-2 rounded-lg bg-[#1E5ABB] hover:bg-[#184996] text-white text-xs font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  确认迁移
                </button>
              </div>
            </div>
          </div>
        )}

        {removeRecordIds && (
          <div className="fixed inset-0 z-50 bg-slate-900/45 flex items-center justify-center p-4" onClick={() => setRemoveRecordIds(null)}>
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-5 space-y-4" onClick={(event) => event.stopPropagation()}>
              <h3 className="text-sm font-bold text-gray-900">移出仓库</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                确认将 {removeRecordIds.length} 条数据移出「{activeWarehouse.name}」？只移出当前仓库，不影响这些数据在其他仓库中的归属。
              </p>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setRemoveRecordIds(null)} className="px-3 py-1.5 rounded-lg bg-gray-100 text-xs font-semibold cursor-pointer">
                  取消
                </button>
                <button type="button" onClick={confirmRemoveRecords} className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer">
                  确认移出
                </button>
              </div>
            </div>
          </div>
        )}

        {transferTarget && (
          <TransferDirectiveModal
            key={transferTarget.id}
            report={transferTarget}
            onClose={() => setTransferTarget(null)}
            onSubmit={(opinion) => {
              onTransferSubmit?.(transferTarget.id, opinion);
              setTransferTarget(null);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {warehouseNotice && (
        <div className="fixed top-4 right-4 z-[60] bg-[#1E5ABB] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-bold">
          {warehouseNotice}
        </div>
      )}

      <div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
          <button type="button" onClick={() => setActiveWarehouseId(null)} className="hover:text-[#1E5ABB] cursor-pointer">
            不良信息库
          </button>
          <span>/</span>
          <span className="text-gray-800 font-semibold">{activeWarehouse.name}</span>
        </div>
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">{activeWarehouse.name}</h2>
        <p className="text-xs text-gray-400 mt-1">{activeWarehouse.remark || '查看该仓库中的不良信息，可按现有条件筛选'}</p>
      </div>

      {/* Filter Card */}
      <div className="bg-white rounded-lg p-5 border border-gray-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center flex-wrap gap-3 text-xs">
          {/* 检索框 */}
          <div className="flex-1 min-w-[280px]">
            <div className="relative">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="请输入事件标题、上报人员、审核人员姓名、机构名称进行检索"
                className="w-full pl-9 pr-8 py-2 border border-gray-300 hover:border-gray-400 focus:border-[#1E5ABB] rounded-lg text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/15 transition-all shadow-2xs"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
              {keyword && (
                <button
                  type="button"
                  onClick={() => setKeyword('')}
                  className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer"
                  title="清空"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* 时间区间（报送时间 / 审核时间 下拉切换） */}
          <div className="flex items-center space-x-2 shrink-0">
            <select
              value={timeFilterType}
              onChange={(e) => setTimeFilterType(e.target.value as 'submit' | 'auditComplete')}
              aria-label="时间类型"
              className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/15 focus:border-[#1E5ABB] shadow-2xs cursor-pointer"
            >
              <option value="submit">报送时间</option>
              <option value="auditComplete">审核时间</option>
            </select>
            <div className="flex items-center space-x-1.5">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-32 px-2.5 py-2 border border-gray-300 rounded-lg text-xs bg-white text-gray-700 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/15 focus:border-[#1E5ABB]"
              />
              <span className="text-gray-400 font-bold">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-32 px-2.5 py-2 border border-gray-300 rounded-lg text-xs bg-white text-gray-700 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/15 focus:border-[#1E5ABB]"
              />
            </div>
          </div>

          {/* 机构（报送机构 / 审核机构 下拉切换） */}
          <div className="flex items-center space-x-2 shrink-0">
            <select
              value={orgFilterType}
              onChange={(e) => {
                setOrgFilterType(e.target.value as 'submit' | 'audit');
                setOrgFilter('全部');
              }}
              aria-label="机构类型"
              className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/15 focus:border-[#1E5ABB] shadow-2xs cursor-pointer"
            >
              <option value="submit">报送机构</option>
              <option value="audit">审核机构</option>
            </select>
            <select
              value={orgFilter}
              onChange={(e) => setOrgFilter(e.target.value)}
              className="min-w-[150px] max-w-[240px] px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/15 focus:border-[#1E5ABB] shadow-2xs cursor-pointer"
            >
              <option value="全部">全部</option>
              {activeOrgOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* 状态 */}
          <div className="flex items-center space-x-2 shrink-0">
            <label className="text-gray-700 font-semibold whitespace-nowrap shrink-0">状态</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/15 focus:border-[#1E5ABB] shadow-2xs cursor-pointer"
            >
              <option value="全部">全部</option>
              <option value="待转办">待转办</option>
              <option value="已转办">已转办</option>
            </select>
          </div>

          {/* 识别标识 */}
          <div className="flex items-center space-x-2 shrink-0">
            <label className="text-gray-700 font-semibold whitespace-nowrap shrink-0">识别标识</label>
            <select
              value={identFilter}
              onChange={(e) => setIdentFilter(e.target.value as '全部' | '首发' | '重复')}
              className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/15 focus:border-[#1E5ABB] shadow-2xs cursor-pointer"
            >
              <option value="全部">全部</option>
              <option value="首发">首发</option>
              <option value="重复">重复</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
          <div className="text-gray-500 font-medium">
            共查询到 <strong className="text-[#1E5ABB] font-mono">{filtered.length}</strong> 条不良信息
          </div>
          <div className="flex items-center space-x-2">
          <button className="px-4 py-1.5 bg-[#1E5ABB] hover:bg-[#134092] text-white text-xs font-medium rounded shadow-2xs flex items-center space-x-1 cursor-pointer">
            <Search className="w-3.5 h-3.5" />
            <span>查询</span>
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium rounded border border-gray-200 flex items-center space-x-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重置</span>
          </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold">
                <th className="py-3 px-4 w-12 text-center">序号</th>
                <th className="py-3 px-4 min-w-[220px] w-full">事件标题 / 内容描述</th>
                <th className="py-3 px-4 min-w-[160px]">上报人员 / 机构</th>
                <th className="py-3 px-4">报送时间</th>
                <th className="py-3 px-4 min-w-[160px]">审核人员 / 机构</th>
                <th className="py-3 px-4 text-center">状态</th>
                <th className="py-3 px-4">审核时间</th>
                <th className="py-3 px-4 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {displayList.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-gray-400">
                    该仓库暂无不良信息
                  </td>
                </tr>
              )}
              {displayList.map((item, index) => {
                const ident = resolveIdentification(item, negativeList);
                return (
                  <tr key={item.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="py-3 px-4 text-center text-gray-400 font-mono">{(safePage - 1) * pageSize + index + 1}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 w-0 min-w-full">
                        <button
                          onClick={() => {
                            onSelectNegative(item);
                            onNavigate('negative-detail');
                          }}
                          className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-left cursor-pointer truncate min-w-0"
                          title={item.title}
                        >
                          {item.title}
                        </button>
                        <IdentificationBadge status={ident.status} size="xs" showIcon className="shrink-0" />
                      </div>
                      <div className="text-gray-500 text-[11px] truncate leading-relaxed mt-1 w-0 min-w-full" title={item.detailContent?.summary || item.title}>
                        {item.detailContent?.summary || '暂无内容描述'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900 leading-snug">{item.author}</div>
                      <OrgPathDisplay organization={item.organization} className="max-w-[220px]" />
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-500 whitespace-nowrap">{item.submitTime}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900 leading-snug">{getAuditor(item)}</div>
                      <OrgPathDisplay organization={getAuditorOrg(item)} className="max-w-[220px]" />
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {getTransferStatus(item) === '待转办' ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-700 border border-amber-200">
                          待转办
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-blue-100 text-blue-700 border border-blue-200">
                          已转办
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-500 whitespace-nowrap">{getAuditCompleteTime(item)}</td>
                    <td className="py-3 px-4 text-center whitespace-nowrap space-x-2">
                      <button
                        onClick={() => {
                          onSelectNegative(item);
                          onNavigate('negative-detail');
                        }}
                        className="text-[#1E5ABB] hover:underline font-medium cursor-pointer"
                      >
                        详情
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={() => {
                          setTransferTarget(item);
                        }}
                        className="text-[#1E5ABB] hover:underline font-medium cursor-pointer"
                      >
                        {getTransferStatus(item) === '待转办' ? '转办' : '再次转办'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="bg-gray-50/80 border-t border-gray-100">
          <PaginationBar
            total={filtered.length}
            page={safePage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Transfer Modal */}
      {transferTarget && (
        <TransferDirectiveModal
          key={transferTarget.id}
          report={transferTarget}
          onClose={() => setTransferTarget(null)}
          onSubmit={(opinion) => {
            onTransferSubmit?.(transferTarget.id, opinion);
            setTransferTarget(null);
          }}
        />
      )}
    </div>
  );
};
