import React, { useEffect, useMemo, useState } from 'react';
import { Lock, RotateCcw, Search, Star, Users, X, Globe, Check, ArrowRightLeft } from 'lucide-react';
import { AppScopeMark } from '../components/AppScopeMark';
import { PaginationBar } from '../components/PaginationBar';
import { WarehouseStaffChip, WarehouseStaffPicker } from '../components/WarehouseStaffPicker';
import { resolveWarehouseStaff } from '../data/warehouseStaff';
import {
  WAREHOUSE_STORAGE_KEY,
  loadWarehouses,
  type WarehouseCategory as MainCategory,
  type WarehouseItem,
  type WarehouseShareScope as ShareScope
} from '../data/warehouses';

type VisibilityCard = 'self' | 'specified' | 'all';

const PLATFORM_APP = '全平台（全域）';
const BUSINESS_APPS = ['点点速豹', '全球眼V8', '新数解舆情', '全网搜', '谛听预警', '河图融媒体'] as const;
const APP_OPTIONS = [PLATFORM_APP, ...BUSINESS_APPS] as const;
const CATEGORY_OPTIONS: MainCategory[] = ['舆情类', '融媒体类', '境外类'];

const ORG_PREVIEW = ['杨美丽', '孟玉玺'];

const nowText = () => {
  const date = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const visibilityOf = (item: WarehouseItem): VisibilityCard => {
  if (item.shareScope === '仅本人可见') return 'self';
  if (item.shareScope === '指定人员可见') return 'specified';
  return 'all';
};

const emptyForm = () => ({
  name: '',
  category: '舆情类' as MainCategory,
  remark: '',
  apps: ['全平台（全域）'] as string[],
  shareScope: '全机构可见' as ShareScope,
  members: [] as string[]
});

export const WarehouseManage: React.FC = () => {
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>(loadWarehouses);
  const [keyword, setKeyword] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [cardFilter, setCardFilter] = useState<VisibilityCard | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [editor, setEditor] = useState<null | { mode: 'create' | 'edit'; id?: string }>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<WarehouseItem | null>(null);
  const [migrateOpen, setMigrateOpen] = useState(false);
  const [migrateTargetId, setMigrateTargetId] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    localStorage.setItem(WAREHOUSE_STORAGE_KEY, JSON.stringify(warehouses));
  }, [warehouses]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 2400);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (!editor) setPickerOpen(false);
  }, [editor]);

  const counts = useMemo(
    () => ({
      self: warehouses.filter((item) => visibilityOf(item) === 'self').length,
      specified: warehouses.filter((item) => visibilityOf(item) === 'specified').length,
      all: warehouses.filter((item) => visibilityOf(item) === 'all').length
    }),
    [warehouses]
  );

  const filtered = useMemo(() => {
    const q = appliedKeyword.trim().toLowerCase();
    return warehouses.filter((item) => {
      if (q && !item.name.toLowerCase().includes(q)) return false;
      if (cardFilter && visibilityOf(item) !== cardFilter) return false;
      return true;
    });
  }, [warehouses, appliedKeyword, cardFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const pageIds = pageRows.map((item) => item.id);
  const allPageChecked = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));

  const selectedItems = warehouses.filter((item) => selectedIds.includes(item.id));
  const migrateTargets = warehouses.filter((item) => !selectedIds.includes(item.id));

  const togglePage = () => {
    setSelectedIds((prev) =>
      allPageChecked ? prev.filter((id) => !pageIds.includes(id)) : Array.from(new Set([...prev, ...pageIds]))
    );
  };

  const toggleRow = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const openCreate = () => {
    setForm(emptyForm());
    setFormError('');
    setEditor({ mode: 'create' });
  };

  const openEdit = (item: WarehouseItem) => {
    setForm({
      name: item.name,
      category: item.category,
      remark: item.remark,
      apps: item.apps,
      shareScope: item.shareScope,
      members: item.members
    });
    setFormError('');
    setEditor({ mode: 'edit', id: item.id });
  };

  const toggleApp = (app: string) => {
    setForm((prev) => {
      if (app === PLATFORM_APP) {
        return { ...prev, apps: [PLATFORM_APP] };
      }
      const current = prev.apps.filter((item) => item !== PLATFORM_APP);
      const next = current.includes(app) ? current.filter((item) => item !== app) : [...current, app];
      return { ...prev, apps: next };
    });
  };

  const removeMember = (id: string) => {
    setForm((prev) => ({ ...prev, members: prev.members.filter((item) => item !== id) }));
  };

  const selectedStaff = form.members.map((item) => resolveWarehouseStaff(item)).filter((item) => item != null);

  const saveWarehouse = () => {
    const name = form.name.trim();
    if (!name) {
      setFormError('请输入数据仓库名称');
      return;
    }
    if (name.length > 15) {
      setFormError('仓库名称最多 15 个字');
      return;
    }
    if (form.apps.length === 0) {
      setFormError('请至少选择一个应用可见范围');
      return;
    }
    if (form.shareScope === '指定人员可见' && form.members.length === 0) {
      setFormError('请选择可见人员');
      return;
    }

    if (editor?.mode === 'edit' && editor.id) {
      setWarehouses((prev) =>
        prev.map((item) =>
          item.id === editor.id
            ? {
                ...item,
                name,
                category: form.category,
                remark: form.remark.trim(),
                apps: form.apps,
                shareScope: form.shareScope,
                members: form.shareScope === '指定人员可见' ? form.members : [],
                updatedAt: nowText()
              }
            : item
        )
      );
      setNotice('仓库已更新');
    } else {
      const created: WarehouseItem = {
        id: `wh-${Date.now()}`,
        name,
        category: form.category,
        remark: form.remark.trim(),
        apps: form.apps,
        shareScope: form.shareScope,
        members: form.shareScope === '指定人员可见' ? form.members : [],
        dataCount: 0,
        creator: '齐杰',
        updatedAt: nowText(),
        favorited: false
      };
      setWarehouses((prev) => [created, ...prev]);
      setNotice('仓库已创建');
    }
    setEditor(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setWarehouses((prev) => prev.filter((item) => item.id !== deleteTarget.id));
    setSelectedIds((prev) => prev.filter((id) => id !== deleteTarget.id));
    setDeleteTarget(null);
    setNotice('仓库已删除');
  };

  const openMigrate = () => {
    if (selectedIds.length === 0) {
      setNotice('请先选择要迁移的仓库');
      return;
    }
    setMigrateTargetId('');
    setMigrateOpen(true);
  };

  const confirmMigrate = () => {
    if (!migrateTargetId) {
      setNotice('请选择目标仓库');
      return;
    }
    const moved = selectedItems.reduce((sum, item) => sum + item.dataCount, 0);
    setWarehouses((prev) =>
      prev.map((item) => {
        if (item.id === migrateTargetId) {
          return { ...item, dataCount: item.dataCount + moved, updatedAt: nowText() };
        }
        if (selectedIds.includes(item.id)) {
          return { ...item, favorited: false, updatedAt: nowText() };
        }
        return item;
      })
    );
    setSelectedIds([]);
    setMigrateOpen(false);
    setNotice(`已迁移 ${moved} 条数据，来源仓库仍保留`);
  };

  const businessApps = form.apps.filter((app) => app !== PLATFORM_APP);
  const appSummary = form.apps.includes(PLATFORM_APP)
    ? '已选 全平台（全域）　业务系统：所有子系统均可见并共享'
    : businessApps.length > 0
      ? `已选 ${businessApps.length} 个业务系统：${businessApps.join('、')}`
      : '尚未选择应用可见范围';

  return (
    <div className="space-y-4">
      {notice && (
        <div className="fixed top-4 right-4 z-[60] bg-[#1E5ABB] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-bold">
          {notice}
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">仓库管理</h2>
        <p className="text-xs text-gray-400 mt-1">统一维护数据仓库分类、可见范围和数据迁移</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(
          [
            { key: 'self' as const, label: '仅自己可见', count: counts.self, icon: Lock },
            { key: 'specified' as const, label: '指定人员可见', count: counts.specified, icon: Users },
            { key: 'all' as const, label: '全员可见', count: counts.all, icon: Star }
          ]
        ).map((card) => {
          const Icon = card.icon;
          const active = cardFilter === card.key;
          return (
            <button
              key={card.key}
              type="button"
              onClick={() => {
                setCardFilter((prev) => (prev === card.key ? null : card.key));
                setPage(1);
              }}
              className={`bg-white rounded-xl border px-5 py-4 flex items-center gap-4 text-left shadow-2xs transition-colors cursor-pointer ${
                active ? 'border-[#1E5ABB] ring-2 ring-[#1E5ABB]/15' : 'border-gray-200/80 hover:border-blue-200'
              }`}
            >
              <span className="w-11 h-11 rounded-full bg-blue-50 text-[#1E5ABB] flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </span>
              <span>
                <span className="block text-xs text-gray-500">{card.label}</span>
                <span className="block text-2xl font-bold text-gray-900 tabular-nums leading-tight mt-0.5">{card.count}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-gray-200/80 shadow-2xs p-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex flex-1 flex-col sm:flex-row sm:items-center gap-2 min-w-0">
            <label className="text-xs font-semibold text-gray-700 shrink-0">仓库名称</label>
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    setAppliedKeyword(keyword);
                    setPage(1);
                  }
                }}
                placeholder="搜索仓库名称"
                className="w-full pl-8 pr-3 py-2 border border-gray-300 hover:border-gray-400 focus:border-[#1E5ABB] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/15"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setAppliedKeyword(keyword);
                setPage(1);
              }}
              className="px-4 py-2 rounded-lg bg-[#1E5ABB] hover:bg-[#184996] text-white text-xs font-bold cursor-pointer"
            >
              查询
            </button>
            <button
              type="button"
              onClick={() => {
                setKeyword('');
                setAppliedKeyword('');
                setCardFilter(null);
                setPage(1);
              }}
              className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              重置
            </button>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="px-4 py-2 rounded-lg bg-[#1E5ABB] hover:bg-[#184996] text-white text-xs font-bold cursor-pointer shrink-0"
          >
            新增分类
          </button>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">
            已选择 <strong className="text-[#1E5ABB] font-mono">{selectedIds.length}</strong> 条
          </span>
          <button
            type="button"
            onClick={openMigrate}
            className="inline-flex items-center gap-1 text-[#1E5ABB] hover:text-[#184996] font-semibold cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            批量迁移数据
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/90 border-y border-gray-200 text-gray-600 font-semibold">
                <th className="py-3 px-3 w-10 text-center">
                  <input type="checkbox" checked={allPageChecked} onChange={togglePage} className="accent-[#1E5ABB] cursor-pointer" />
                </th>
                <th className="py-3 px-3 w-14">序号</th>
                <th className="py-3 px-3 min-w-[160px]">分类名称</th>
                <th className="py-3 px-3">方案类型</th>
                <th className="py-3 px-3 min-w-[180px]">可见人员</th>
                <th className="py-3 px-3 text-center">数据量</th>
                <th className="py-3 px-3">创建人</th>
                <th className="py-3 px-3">更新时间</th>
                <th className="py-3 px-3 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400">
                    暂无仓库
                  </td>
                </tr>
              ) : (
                pageRows.map((item, index) => {
                  const people =
                    item.shareScope === '指定人员可见'
                      ? item.members.map((token) => resolveWarehouseStaff(token)?.name || token)
                      : item.shareScope === '仅本人可见'
                        ? [item.creator]
                        : ORG_PREVIEW;
                  const extra = item.shareScope === '全机构可见' ? 107 : Math.max(0, people.length - 3);
                  return (
                    <tr key={item.id} className="hover:bg-blue-50/30">
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => toggleRow(item.id)}
                          className="accent-[#1E5ABB] cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-3 text-gray-500 font-mono">{(safePage - 1) * pageSize + index + 1}</td>
                      <td className="py-3 px-3 font-semibold text-gray-800">{item.name}</td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-[#1E5ABB] border border-blue-100 font-semibold">
                          <Globe className="w-3 h-3" />
                          {item.shareScope}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center">
                          {people.slice(0, 3).map((name, nameIndex) => (
                            <span
                              key={name}
                              title={name}
                              className={`w-7 h-7 rounded-full border-2 border-white bg-[#1E5ABB] text-white text-[10px] font-bold flex items-center justify-center ${
                                nameIndex > 0 ? '-ml-2' : ''
                              }`}
                            >
                              {name.slice(0, 1)}
                            </span>
                          ))}
                          {extra > 0 && (
                            <span className="ml-1 text-[11px] font-bold text-rose-500">+{extra}</span>
                          )}
                          <span className="ml-2 text-gray-500 truncate">{people.slice(0, 2).join('、')}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-gray-700">{item.dataCount}</td>
                      <td className="py-3 px-3 text-gray-700">{item.creator}</td>
                      <td className="py-3 px-3 font-mono text-gray-500 whitespace-nowrap">{item.updatedAt}</td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <button type="button" onClick={() => openEdit(item)} className="text-[#1E5ABB] hover:underline font-semibold cursor-pointer">
                          编辑
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item)}
                          className="ml-3 text-rose-600 hover:underline font-semibold cursor-pointer"
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

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

      {editor && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 flex items-center justify-center p-4" onClick={() => setEditor(null)}>
          <div
            className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-gray-200"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">{editor.mode === 'create' ? '新建数据仓库' : '编辑数据仓库'}</h3>
              <button type="button" onClick={() => setEditor(null)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-4 text-xs">
              <section>
                <h4 className="font-bold text-gray-800 mb-2 border-l-2 border-[#1E5ABB] pl-2">主分类</h4>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_OPTIONS.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, category }))}
                      className={`px-3 py-1.5 rounded-lg border cursor-pointer ${
                        form.category === category
                          ? 'border-[#1E5ABB] bg-blue-50 text-[#1E5ABB] font-bold'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h4 className="font-bold text-gray-800 mb-2 border-l-2 border-[#1E5ABB] pl-2">数据仓库名称</h4>
                <input
                  value={form.name}
                  maxLength={15}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="请输入数据仓库名称（最多 15 个字）"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/15 focus:border-[#1E5ABB]"
                />
              </section>

              <section>
                <h4 className="font-bold text-gray-800 mb-2 border-l-2 border-[#1E5ABB] pl-2">仓库备注说明</h4>
                <textarea
                  value={form.remark}
                  onChange={(event) => setForm((prev) => ({ ...prev, remark: event.target.value }))}
                  placeholder="请输入仓库备注，以便其他人员清晰理解范畴..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/15 focus:border-[#1E5ABB] resize-none"
                />
              </section>

              <section>
                <h4 className="font-bold text-gray-800 mb-2 border-l-2 border-[#1E5ABB] pl-2">应用可见范围</h4>
                <div className="mb-2 rounded-lg bg-blue-50 text-[#1E5ABB] px-3 py-2">{appSummary}</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {APP_OPTIONS.map((app) => {
                    const active = form.apps.includes(app);
                    return (
                      <button
                        key={app}
                        type="button"
                        onClick={() => toggleApp(app)}
                        className={`px-2 py-2 rounded-lg border text-left cursor-pointer inline-flex items-center justify-between gap-1.5 ${
                          active ? 'border-[#1E5ABB] bg-blue-50 text-[#1E5ABB] font-bold' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="inline-flex items-center gap-1.5 min-w-0">
                          <AppScopeMark name={app} />
                          <span className="truncate">{app}</span>
                        </span>
                        {active && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section>
                <h4 className="font-bold text-gray-800 mb-2 border-l-2 border-[#1E5ABB] pl-2">系统共享授权</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(
                    [
                      { value: '全机构可见' as const, desc: '全机构内人员均可见' },
                      { value: '指定人员可见' as const, desc: '多选本机构人员' },
                      { value: '仅本人可见' as const, desc: '当前仓库仅本人可见' }
                    ]
                  ).map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, shareScope: option.value }))}
                      className={`rounded-xl border px-3 py-3 text-left cursor-pointer ${
                        form.shareScope === option.value
                          ? 'border-[#1E5ABB] bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <span className="flex items-center gap-2 font-bold text-gray-800">
                        <span
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            form.shareScope === option.value ? 'border-[#1E5ABB]' : 'border-gray-300'
                          }`}
                        >
                          {form.shareScope === option.value && <span className="w-2 h-2 rounded-full bg-[#1E5ABB]" />}
                        </span>
                        {option.value}
                      </span>
                      <span className="block text-[11px] text-gray-500 mt-1 pl-5">{option.desc}</span>
                    </button>
                  ))}
                </div>
                {form.shareScope === '指定人员可见' && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <span className="text-gray-700">已选可见人员（{selectedStaff.length}人）：</span>
                      <button
                        type="button"
                        onClick={() => setPickerOpen(true)}
                        className="text-[#1E5ABB] font-bold cursor-pointer hover:underline"
                      >
                        修改人员
                      </button>
                    </div>
                    {selectedStaff.length === 0 ? (
                      <p className="text-gray-400">暂未选择人员，请点击右侧「修改人员」添加可见用户</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {selectedStaff.map((staff) => (
                          <WarehouseStaffChip key={staff.id} staff={staff} onRemove={() => removeMember(staff.id)} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </section>

              {formError && <p className="text-rose-600">{formError}</p>}
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100">
              <button type="button" onClick={() => setEditor(null)} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold cursor-pointer">
                取消
              </button>
              <button type="button" onClick={saveWarehouse} className="px-4 py-2 rounded-lg bg-[#1E5ABB] hover:bg-[#184996] text-white font-bold cursor-pointer">
                确认
              </button>
            </div>
          </div>
        </div>
      )}

      {pickerOpen && (
        <WarehouseStaffPicker
          value={form.members}
          onClose={() => setPickerOpen(false)}
          onConfirm={(ids) => {
            setForm((prev) => ({ ...prev, members: ids }));
            setFormError('');
            setPickerOpen(false);
          }}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 flex items-center justify-center p-4" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-5 space-y-4" onClick={(event) => event.stopPropagation()}>
            <h3 className="text-sm font-bold text-gray-900">删除仓库</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              确认删除「{deleteTarget.name}」？仓库会从列表移除，其中的数据不会自动迁到其他仓库。
            </p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setDeleteTarget(null)} className="px-3 py-1.5 rounded-lg bg-gray-100 text-xs font-semibold cursor-pointer">
                取消
              </button>
              <button type="button" onClick={confirmDelete} className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold cursor-pointer">
                删除
              </button>
            </div>
          </div>
        </div>
      )}

      {migrateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 flex items-center justify-center p-4" onClick={() => setMigrateOpen(false)}>
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between px-5 pt-5">
              <div>
                <h3 className="text-base font-bold text-gray-900">批量迁移数据</h3>
                <p className="text-xs text-gray-500 mt-1">
                  将已选 {selectedIds.length} 个仓库中的数据迁移到目标仓库，原仓库保留。
                </p>
              </div>
              <button type="button" onClick={() => setMigrateOpen(false)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-2">
              <label className="block text-xs font-bold text-gray-800">迁移至</label>
              <select
                value={migrateTargetId}
                onChange={(event) => setMigrateTargetId(event.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/15 focus:border-[#1E5ABB]"
              >
                <option value="">请选择或搜索目标仓库</option>
                {migrateTargets.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                迁移会把所选来源仓库中的数据写入目标仓库，并取消来源仓库收藏。
              </p>
            </div>
            <div className="flex justify-end gap-2 px-5 pb-5">
              <button type="button" onClick={() => setMigrateOpen(false)} className="px-4 py-2 rounded-lg bg-gray-100 text-xs font-semibold cursor-pointer">
                取消
              </button>
              <button type="button" onClick={confirmMigrate} className="px-4 py-2 rounded-lg bg-[#1E5ABB] hover:bg-[#184996] text-white text-xs font-bold cursor-pointer">
                确认迁移
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
