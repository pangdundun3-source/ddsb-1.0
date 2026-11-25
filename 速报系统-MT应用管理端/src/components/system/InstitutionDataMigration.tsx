import React, { useMemo, useState } from 'react';

/** 机构数据迁移 · 整体状态（与参考系统对齐） */
export const ORG_MIGRATION_STATUS_OPTIONS = [
  '待启动',
  '节点同步中',
  '节点同步成功',
  '节点同步失败',
  '群组同步中',
  '群组同步成功',
  '群组同步失败',
  '人员同步中',
  '人员同步成功',
  '人员同步失败',
  '待人工确认',
  '已完成',
] as const;

export type OrgMigrationStatus = (typeof ORG_MIGRATION_STATUS_OPTIONS)[number];

export type OrgMigrationTask = {
  id: string;
  taskNo: string;
  taskName: string;
  sourceOrgName: string;
  targetOrgName: string;
  status: OrgMigrationStatus;
  orgSynced: number;
  orgTotal: number;
  groupSynced: number;
  groupTotal: number;
  staffSynced: number;
  staffTotal: number;
  creator: string;
  createTime: string;
  completeTime: string;
};

const SOURCE_ORG_OPTIONS = [
  '点点速豹-随州市网信办',
  '点点速豹-台中市网信办',
  '点点速豹-牡丹江东宁市网信办',
  '点点速豹-襄阳市网信办',
];

const TARGET_ORG_OPTIONS = [
  '随州市网信中心（随州市网络安全应急指挥中心）',
  '台中市网信办',
  '牡丹江东宁市网信办',
  '襄阳市网信办',
];

const INITIAL_TASKS: OrgMigrationTask[] = [
  {
    id: 'mig_1',
    taskNo: 'T20261119003',
    taskName: '随州市网信组织人员全量迁移',
    sourceOrgName: '点点速豹-随州市网信办',
    targetOrgName: '随州市网信中心（随州市网络安全应急指挥中心）',
    status: '已完成',
    orgSynced: 118,
    orgTotal: 118,
    groupSynced: 3,
    groupTotal: 3,
    staffSynced: 742,
    staffTotal: 742,
    creator: '廖伟',
    createTime: '2026-11-19 19:12:08',
    completeTime: '2026-11-19 20:40:16',
  },
  {
    id: 'mig_2',
    taskNo: 'T20261119002',
    taskName: '台中市网信组织架构迁移',
    sourceOrgName: '点点速豹-台中市网信办',
    targetOrgName: '台中市网信办',
    status: '已完成',
    orgSynced: 56,
    orgTotal: 56,
    groupSynced: 2,
    groupTotal: 2,
    staffSynced: 318,
    staffTotal: 318,
    creator: '张工',
    createTime: '2026-11-19 18:05:22',
    completeTime: '2026-11-19 19:57:41',
  },
];

const statusBadgeClass = (status: OrgMigrationStatus) => {
  if (status === '已完成' || status.includes('成功')) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
  if (status.includes('失败')) {
    return 'bg-red-50 text-red-600 border-red-200';
  }
  if (status.includes('同步中')) {
    return 'bg-blue-50 text-blue-600 border-blue-200';
  }
  if (status === '待人工确认') {
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }
  return 'bg-gray-50 text-gray-600 border-gray-200';
};

const statusIcon = (status: OrgMigrationStatus) => {
  if (status === '已完成' || status.includes('成功')) return 'check_circle';
  if (status.includes('失败')) return 'error';
  if (status.includes('同步中')) return 'sync';
  if (status === '待人工确认') return 'pending';
  return 'schedule';
};

interface InstitutionDataMigrationProps {
  onShowToast?: (msg: string) => void;
}

export const InstitutionDataMigration: React.FC<InstitutionDataMigrationProps> = ({
  onShowToast,
}) => {
  const [tasks, setTasks] = useState<OrgMigrationTask[]>(INITIAL_TASKS);
  const [draftTaskQuery, setDraftTaskQuery] = useState('');
  const [draftSourceOrg, setDraftSourceOrg] = useState('');
  const [draftTargetOrg, setDraftTargetOrg] = useState('');
  const [draftStatus, setDraftStatus] = useState<'all' | OrgMigrationStatus>('all');
  const [taskQuery, setTaskQuery] = useState('');
  const [sourceOrg, setSourceOrg] = useState('');
  const [targetOrg, setTargetOrg] = useState('');
  const [status, setStatus] = useState<'all' | OrgMigrationStatus>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [jumpPageInput, setJumpPageInput] = useState('1');
  const [createOpen, setCreateOpen] = useState(false);
  const [formSource, setFormSource] = useState('');
  const [formTarget, setFormTarget] = useState('');
  const [formTaskName, setFormTaskName] = useState('');
  const [sourceSuggestOpen, setSourceSuggestOpen] = useState(false);
  const [targetSuggestOpen, setTargetSuggestOpen] = useState(false);
  const [detailTask, setDetailTask] = useState<OrgMigrationTask | null>(null);

  const notify = (msg: string) => onShowToast?.(msg);

  const filtered = useMemo(() => {
    const q = taskQuery.trim().toLowerCase();
    return tasks.filter((item) => {
      if (q && !item.taskNo.toLowerCase().includes(q) && !item.taskName.toLowerCase().includes(q)) {
        return false;
      }
      if (sourceOrg.trim() && !item.sourceOrgName.includes(sourceOrg.trim())) return false;
      if (targetOrg.trim() && !item.targetOrgName.includes(targetOrg.trim())) return false;
      if (status !== 'all' && item.status !== status) return false;
      return true;
    });
  }, [tasks, taskQuery, sourceOrg, targetOrg, status]);

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const page = Math.min(currentPage, totalPages);
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleQuery = () => {
    setTaskQuery(draftTaskQuery);
    setSourceOrg(draftSourceOrg);
    setTargetOrg(draftTargetOrg);
    setStatus(draftStatus);
    setCurrentPage(1);
    setJumpPageInput('1');
  };

  const handleReset = () => {
    setDraftTaskQuery('');
    setDraftSourceOrg('');
    setDraftTargetOrg('');
    setDraftStatus('all');
    setTaskQuery('');
    setSourceOrg('');
    setTargetOrg('');
    setStatus('all');
    setCurrentPage(1);
    setJumpPageInput('1');
  };

  const filteredSourceOptions = SOURCE_ORG_OPTIONS.filter((name) =>
    !formSource.trim() ? true : name.includes(formSource.trim())
  );
  const filteredTargetOptions = TARGET_ORG_OPTIONS.filter((name) =>
    !formTarget.trim() ? true : name.includes(formTarget.trim())
  );

  const handleCreate = () => {
    if (!formSource.trim()) {
      notify('请选择点点速豹系统机构名称');
      return;
    }
    if (!formTarget.trim()) {
      notify('请选择MT系统机构名称');
      return;
    }
    if (!formTaskName.trim()) {
      notify('请输入任务名称');
      return;
    }
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
    const taskNo = `T${stamp}${String(tasks.length + 1).padStart(3, '0')}`;
    const createTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const next: OrgMigrationTask = {
      id: `mig_${Date.now()}`,
      taskNo,
      taskName: formTaskName.trim(),
      sourceOrgName: formSource.trim(),
      targetOrgName: formTarget.trim(),
      status: '待启动',
      orgSynced: 0,
      orgTotal: 0,
      groupSynced: 0,
      groupTotal: 0,
      staffSynced: 0,
      staffTotal: 0,
      creator: '当前管理员',
      createTime,
      completeTime: '—',
    };
    setTasks((prev) => [next, ...prev]);
    setCreateOpen(false);
    setFormSource('');
    setFormTarget('');
    setFormTaskName('');
    setCurrentPage(1);
    notify('迁移任务已创建');
  };

  const handleSyncAction = (task: OrgMigrationTask, kind: '组织' | '群组' | '人员') => {
    notify(`已触发「${task.taskName}」${kind}同步`);
  };

  const handleJumpPage = () => {
    const n = Number(jumpPageInput);
    if (!Number.isFinite(n) || n < 1) {
      setJumpPageInput(String(page));
      return;
    }
    const next = Math.min(totalPages, Math.floor(n));
    setCurrentPage(next);
    setJumpPageInput(String(next));
  };

  return (
    <div className="p-6 flex flex-col gap-4 min-w-[1024px]">
      <div className="bg-white rounded-lg border border-gray-100 p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-900">机构迁移</h2>
          <span className="text-xs text-gray-400 border-l border-gray-200 pl-3 hidden sm:inline">
            将点点速豹系统机构的组织、群组与人员同步至 MT 系统机构
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-[0_1px_3px_0_rgba(0,0,0,0.03)]">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 min-w-[200px] flex-1">
            <span className="text-xs text-gray-500">任务检索</span>
            <input
              value={draftTaskQuery}
              onChange={(e) => setDraftTaskQuery(e.target.value)}
              placeholder="搜索任务编号 / 任务名称..."
              className="h-9 px-3 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#1890ff] focus:ring-1 focus:ring-[#1890ff]"
            />
          </label>
          <label className="flex flex-col gap-1 min-w-[200px] flex-1">
            <span className="text-xs text-gray-500">点点速豹机构</span>
            <input
              value={draftSourceOrg}
              onChange={(e) => setDraftSourceOrg(e.target.value)}
              placeholder="请输入点点速豹系统机构名称"
              className="h-9 px-3 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#1890ff] focus:ring-1 focus:ring-[#1890ff]"
            />
          </label>
          <label className="flex flex-col gap-1 min-w-[200px] flex-1">
            <span className="text-xs text-gray-500">MT系统机构</span>
            <input
              value={draftTargetOrg}
              onChange={(e) => setDraftTargetOrg(e.target.value)}
              placeholder="请输入MT系统机构名称"
              className="h-9 px-3 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#1890ff] focus:ring-1 focus:ring-[#1890ff]"
            />
          </label>
          <label className="flex flex-col gap-1 min-w-[160px]">
            <span className="text-xs text-gray-500">整体状态</span>
            <select
              value={draftStatus}
              onChange={(e) =>
                setDraftStatus(e.target.value as 'all' | OrgMigrationStatus)
              }
              className="h-9 px-2.5 border border-gray-200 rounded-md text-sm bg-white focus:outline-none focus:border-[#1890ff] cursor-pointer"
            >
              <option value="all">全部状态</option>
              {ORG_MIGRATION_STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-center gap-2 pb-0.5">
            <button
              type="button"
              onClick={handleQuery}
              className="h-9 px-4 inline-flex items-center gap-1.5 rounded-md bg-[#1890ff] text-white text-sm font-medium hover:bg-blue-600 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">search</span>
              查询
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="h-9 px-4 inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white text-gray-600 text-sm hover:bg-gray-50 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              重置
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 shadow-[0_1px_3px_0_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-end">
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="h-9 px-4 inline-flex items-center gap-1.5 rounded-md bg-[#1890ff] text-white text-sm font-medium hover:bg-blue-600 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            新建迁移任务
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[1280px]">
            <thead>
              <tr className="bg-[#f0f7ff] text-gray-600 border-b border-gray-200">
                <th className="py-3 px-3 font-medium whitespace-nowrap">任务信息</th>
                <th className="py-3 px-3 font-medium whitespace-nowrap">点点速豹系统机构名称</th>
                <th className="py-3 px-3 font-medium whitespace-nowrap">MT系统机构名称</th>
                <th className="py-3 px-3 font-medium whitespace-nowrap">整体状态</th>
                <th className="py-3 px-3 font-medium whitespace-nowrap">同步组织数量</th>
                <th className="py-3 px-3 font-medium whitespace-nowrap">同步群组数量</th>
                <th className="py-3 px-3 font-medium whitespace-nowrap">同步人员数量</th>
                <th className="py-3 px-3 font-medium whitespace-nowrap">创建人</th>
                <th className="py-3 px-3 font-medium whitespace-nowrap">创建时间</th>
                <th className="py-3 px-3 font-medium whitespace-nowrap">完成时间</th>
                <th className="py-3 px-3 font-medium whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody>
              {pageData.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-16 text-center text-gray-400">
                    暂无迁移任务
                  </td>
                </tr>
              ) : (
                pageData.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="py-3 px-3 align-top">
                      <div className="font-medium text-gray-900 text-[13px] leading-snug">
                        {item.taskName}
                      </div>
                      <button
                        type="button"
                        onClick={() => setDetailTask(item)}
                        className="text-[11px] text-[#1890ff] mt-0.5 hover:underline cursor-pointer"
                        title="查看迁移任务详情"
                      >
                        编号: {item.taskNo}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-gray-700 align-top max-w-[180px]">
                      {item.sourceOrgName}
                    </td>
                    <td className="py-3 px-3 text-gray-700 align-top max-w-[200px]">
                      <span className="inline-flex items-start gap-1.5">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#1890ff] shrink-0" />
                        <span>{item.targetOrgName}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 align-top">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-medium ${statusBadgeClass(item.status)}`}
                      >
                        <span className="material-symbols-outlined text-[13px]">
                          {statusIcon(item.status)}
                        </span>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-700 tabular-nums align-top">
                      {item.orgSynced} / {item.orgTotal}
                    </td>
                    <td className="py-3 px-3 text-gray-700 tabular-nums align-top">
                      {item.groupSynced} / {item.groupTotal}
                    </td>
                    <td className="py-3 px-3 text-gray-700 tabular-nums align-top">
                      {item.staffSynced} / {item.staffTotal}
                    </td>
                    <td className="py-3 px-3 text-gray-700 align-top">{item.creator}</td>
                    <td className="py-3 px-3 text-gray-500 whitespace-nowrap align-top">
                      {item.createTime}
                    </td>
                    <td className="py-3 px-3 text-gray-500 whitespace-nowrap align-top">
                      {item.completeTime}
                    </td>
                    <td className="py-3 px-3 align-middle whitespace-nowrap">
                      <div className="inline-flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleSyncAction(item, '组织')}
                          className="inline-flex items-center gap-0.5 text-[#1890ff] hover:text-blue-700 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">play_circle</span>
                          组织同步
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSyncAction(item, '群组')}
                          className="inline-flex items-center gap-0.5 text-[#1890ff] hover:text-blue-700 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">play_circle</span>
                          群组同步
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSyncAction(item, '人员')}
                          className="inline-flex items-center gap-0.5 text-[#1890ff] hover:text-blue-700 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">play_circle</span>
                          人员同步
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-gray-100 flex flex-wrap items-center justify-end gap-3 text-xs text-gray-500">
          <span>共 {totalCount} 条</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => {
                const next = Math.max(1, page - 1);
                setCurrentPage(next);
                setJumpPageInput(String(next));
              }}
              className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center disabled:opacity-40 hover:bg-gray-50 cursor-pointer disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>
            <span className="min-w-[28px] h-7 px-2 rounded border border-[#1890ff] text-[#1890ff] flex items-center justify-center font-medium">
              {page}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => {
                const next = Math.min(totalPages, page + 1);
                setCurrentPage(next);
                setJumpPageInput(String(next));
              }}
              className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center disabled:opacity-40 hover:bg-gray-50 cursor-pointer disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
              setJumpPageInput('1');
            }}
            className="h-7 px-2 border border-gray-200 rounded bg-white cursor-pointer"
          >
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}条/页
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1">
            <span>前往</span>
            <input
              value={jumpPageInput}
              onChange={(e) => setJumpPageInput(e.target.value.replace(/[^\d]/g, ''))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleJumpPage();
              }}
              className="w-10 h-7 border border-gray-200 rounded text-center focus:outline-none focus:border-[#1890ff]"
            />
            <span>页</span>
          </div>
        </div>
      </div>

      {detailTask && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6"
          onClick={() => setDetailTask(null)}
        >
          <div
            className="w-full max-w-[720px] bg-white rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base font-bold text-gray-900">迁移任务详情</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-[#1890ff] text-[11px] font-medium border border-blue-100">
                    {detailTask.taskNo}
                  </span>
                </div>
                <div className="text-[13px] text-gray-600 mt-1 truncate">{detailTask.taskName}</div>
              </div>
              <button
                type="button"
                onClick={() => setDetailTask(null)}
                className="w-7 h-7 rounded flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <div>
                  <div className="text-[11px] text-gray-400 mb-0.5">
                    任务编号 <span className="text-gray-300">(taskNo)</span>
                  </div>
                  <div className="text-gray-800 font-medium">{detailTask.taskNo}</div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-400 mb-0.5">
                    整体状态 <span className="text-gray-300">(mainStatus)</span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-medium ${statusBadgeClass(detailTask.status)}`}
                  >
                    <span className="material-symbols-outlined text-[13px]">
                      {statusIcon(detailTask.status)}
                    </span>
                    {detailTask.status}
                  </span>
                </div>
                <div>
                  <div className="text-[11px] text-gray-400 mb-0.5">
                    点点速豹机构名称 <span className="text-gray-300">(oldAgencyName)</span>
                  </div>
                  <div className="text-gray-800">{detailTask.sourceOrgName}</div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-400 mb-0.5">
                    MT系统机构名称 <span className="text-gray-300">(mtOrgName)</span>
                  </div>
                  <div className="text-gray-800">{detailTask.targetOrgName}</div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-400 mb-0.5">
                    创建人 <span className="text-gray-300">(creatorName)</span>
                  </div>
                  <div className="text-gray-800">{detailTask.creator}</div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-400 mb-0.5">
                    创建时间 <span className="text-gray-300">(createTime)</span>
                  </div>
                  <div className="text-gray-800">{detailTask.createTime}</div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-[11px] text-gray-400 mb-0.5">
                    完成时间 <span className="text-gray-300">(finishTime)</span>
                  </div>
                  <div className="text-gray-800">{detailTask.completeTime}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100">
                <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-3 text-center">
                  <div className="text-[11px] text-gray-500 mb-1">同步组织数量</div>
                  <div className="text-sm font-bold text-gray-900 tabular-nums">
                    {detailTask.orgSynced} / {detailTask.orgTotal}
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-3 text-center">
                  <div className="text-[11px] text-gray-500 mb-1">同步群组数量</div>
                  <div className="text-sm font-bold text-gray-900 tabular-nums">
                    {detailTask.groupSynced} / {detailTask.groupTotal}
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-3 text-center">
                  <div className="text-[11px] text-gray-500 mb-1">同步人员数量</div>
                  <div className="text-sm font-bold text-gray-900 tabular-nums">
                    {detailTask.staffSynced} / {detailTask.staffTotal}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setDetailTask(null)}
                className="h-8 px-5 bg-[#1890ff] hover:bg-blue-600 rounded text-xs font-bold text-white cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {createOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6"
          onClick={() => setCreateOpen(false)}
        >
          <div
            className="w-full max-w-[520px] bg-white rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-3">
              <div>
                <div className="text-base font-bold text-gray-900">新建机构迁移任务</div>
                <div className="text-[12px] text-gray-400 mt-1 leading-relaxed">
                  配置源系统至目标系统的组织、群组及人员标签同步策略
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="w-7 h-7 rounded flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="relative">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  点点速豹系统机构名称 <span className="text-red-500">*</span>
                </label>
                <input
                  value={formSource}
                  onChange={(e) => {
                    setFormSource(e.target.value);
                    setSourceSuggestOpen(true);
                  }}
                  onFocus={() => setSourceSuggestOpen(true)}
                  onBlur={() => window.setTimeout(() => setSourceSuggestOpen(false), 150)}
                  placeholder="输入名称搜索"
                  className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#1890ff]"
                />
                {sourceSuggestOpen && filteredSourceOptions.length > 0 && (
                  <div className="absolute z-10 left-0 right-0 mt-1 max-h-40 overflow-auto bg-white border border-gray-200 rounded-md shadow-lg">
                    {filteredSourceOptions.map((name) => (
                      <button
                        key={name}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setFormSource(name);
                          setSourceSuggestOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  MT系统机构名称 <span className="text-red-500">*</span>
                </label>
                <input
                  value={formTarget}
                  onChange={(e) => {
                    setFormTarget(e.target.value);
                    setTargetSuggestOpen(true);
                  }}
                  onFocus={() => setTargetSuggestOpen(true)}
                  onBlur={() => window.setTimeout(() => setTargetSuggestOpen(false), 150)}
                  placeholder="输入名称搜索"
                  className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#1890ff]"
                />
                {targetSuggestOpen && filteredTargetOptions.length > 0 && (
                  <div className="absolute z-10 left-0 right-0 mt-1 max-h-40 overflow-auto bg-white border border-gray-200 rounded-md shadow-lg">
                    {filteredTargetOptions.map((name) => (
                      <button
                        key={name}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setFormTarget(name);
                          setTargetSuggestOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  任务名称 <span className="text-red-500">*</span>
                </label>
                <input
                  value={formTaskName}
                  onChange={(e) => setFormTaskName(e.target.value)}
                  placeholder="请输入任务名称"
                  className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#1890ff]"
                />
              </div>
            </div>

            <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="h-8 px-4 border border-gray-200 rounded text-xs text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleCreate}
                className="h-8 px-4 bg-[#1890ff] hover:bg-blue-600 rounded text-xs font-bold text-white cursor-pointer"
              >
                确认创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
