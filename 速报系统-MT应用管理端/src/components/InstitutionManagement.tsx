import React, { useEffect, useState } from 'react';
import { Institution } from '../types';
import {
  AppStatusFilter,
  FORMAL_DURATION_PRESETS,
  TRIAL_DURATION_PRESETS,
  VersionAuthFilter,
  getInstitutionProfile,
  useInstitutionListViewModel,
} from '../viewmodels/useInstitutionListViewModel';
import { AuthorizeFormResult, AuthorizeInstitutionModal } from './AuthorizeInstitutionModal';

interface InstitutionManagementProps {
  institutions: Institution[];
  autoOpenAuthorize?: boolean;
  onAuthorizeClosed?: () => void;
  onAuthorizeInstitution: (data: AuthorizeFormResult) => void;
  onDetailClick: (institution: Institution) => void;
  onProvisionInstitution?: (
    id: number,
    provisionData: {
      status: '正式' | '试用';
      startDate: string;
      endDate: string;
      daysRemaining: number;
    }
  ) => void;
}

interface ProfilePopover {
  institution: Institution;
  left: number;
  top: number;
}

const inputClass =
  'w-full h-9 border border-gray-200 rounded-md px-3 text-sm bg-white focus:outline-none focus:border-[#1E3A6B] focus:ring-1 focus:ring-[#1E3A6B] placeholder-gray-400';

export const InstitutionManagement: React.FC<InstitutionManagementProps> = ({
  institutions,
  autoOpenAuthorize,
  onAuthorizeClosed,
  onAuthorizeInstitution,
  onDetailClick,
  onProvisionInstitution,
}) => {
  const { state, actions, derived } = useInstitutionListViewModel({
    institutions,
    onProvisionInstitution,
  });
  const {
    filterName,
    filterManager,
    filterVersion,
    filterAppStatus,
    filterUnit,
    filterCreditCode,
    sortOrder,
    provisioningTarget,
    provisionForm,
    authorizeOpen,
    currentPage,
    pageSize,
    jumpPageInput,
    summary,
    authorizeOptions,
    totalCount,
    totalPages,
    pageData,
  } = state;
  const {
    setFilterName,
    setFilterManager,
    setFilterVersion,
    setFilterAppStatus,
    setFilterUnit,
    setFilterCreditCode,
    toggleSortOrder,
    setProvisionForm,
    setProvisioningTarget,
    setAuthorizeOpen,
    setCurrentPage,
    setPageSize,
    setJumpPageInput,
    handleOpenProvisionModal,
    handleModalSwitchStatus,
    handleModalQuickDuration,
    handleConfirmProvision,
    handleReset,
    handlePageChange,
    handleJumpPage,
    prepareBasicDetail,
  } = actions;
  const { calculateDays } = derived;
  const [profilePopover, setProfilePopover] = useState<ProfilePopover | null>(null);

  useEffect(() => {
    if (autoOpenAuthorize) setAuthorizeOpen(true);
  }, [autoOpenAuthorize, setAuthorizeOpen]);

  useEffect(() => {
    if (!profilePopover) return;
    const close = () => setProfilePopover(null);
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-profile-popover],[data-profile-trigger]')) close();
    };
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [profilePopover]);

  const closeAuthorize = () => {
    setAuthorizeOpen(false);
    if (autoOpenAuthorize) onAuthorizeClosed?.();
  };

  const applyStatusCard = (status: AppStatusFilter) => {
    setFilterAppStatus(status);
    handlePageChange(1);
  };

  const openDetail = (row: Institution) => {
    prepareBasicDetail();
    onDetailClick(row);
  };

  const showProfile = (row: Institution, target: HTMLElement) => {
    if (profilePopover?.institution.id === row.id) return;
    const rect = target.getBoundingClientRect();
    setProfilePopover({ institution: row, left: rect.left + rect.width / 2, top: rect.top - 10 });
  };

  const profile = profilePopover ? getInstitutionProfile(profilePopover.institution) : null;

  return (
    <div className="p-6 flex-1 flex flex-col gap-4 min-w-[1024px]">
      {/* 统计概览 */}
      <div className="grid grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => applyStatusCard('')}
          className={`text-left rounded-lg border px-4 py-3 flex flex-col justify-between transition-all cursor-pointer ${
            filterAppStatus === '' ? 'bg-slate-50/60 border-[#1E3A6B] shadow-[0_0_0_1px_#1E3A6B]' : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-gray-600">
            客户总数
            <span className="material-symbols-outlined text-[16px] text-gray-500">corporate_fare</span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-gray-900 font-mono">{summary.total}</span>
            <span className="text-xs text-gray-500 ml-1">家</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => applyStatusCard('opened')}
          className={`text-left rounded-lg border px-4 py-3 transition-all cursor-pointer bg-emerald-50/30 ${
            filterAppStatus === 'opened' ? 'border-emerald-500 shadow-[0_0_0_1px_#10b981]' : 'border-emerald-100 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-emerald-700">
            已开通数（运行中）
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
          </div>
          <div className="mt-1.5 pb-1.5 border-b border-emerald-100">
            <span className="text-2xl font-bold text-emerald-700 font-mono">{summary.opened}</span>
            <span className="text-xs text-emerald-600 ml-1">家</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 text-[11px]">
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-violet-200 bg-violet-50 text-violet-600">
              <span className="material-symbols-outlined text-[12px]">workspace_premium</span>
              正式：{summary.official} 家
            </span>
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-amber-200 bg-amber-50 text-amber-600">
              <span className="material-symbols-outlined text-[12px]">schedule</span>
              试用：{summary.trial} 家
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => applyStatusCard('expired')}
          className={`text-left rounded-lg border px-4 py-3 flex flex-col justify-between transition-all cursor-pointer bg-amber-50/30 ${
            filterAppStatus === 'expired' ? 'border-amber-500 shadow-[0_0_0_1px_#f59e0b]' : 'border-amber-100 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-amber-700">
            已到期数
            <span className="material-symbols-outlined text-[16px]">schedule</span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-amber-600 font-mono">{summary.expired}</span>
            <span className="text-xs text-amber-600 ml-1">家</span>
          </div>
        </button>
      </div>

      {/* 筛选 */}
      <div className="bg-white rounded-lg border border-gray-200 px-4 py-4">
        <div className="flex items-end gap-3 flex-wrap">
          <label className="block w-[150px]">
            <span className="text-xs text-gray-600 font-medium mb-1.5 block">统计单元</span>
            <input
              value={filterUnit}
              onChange={(e) => setFilterUnit(e.target.value)}
              placeholder="统计单元名称"
              className={inputClass}
            />
          </label>
          <label className="block w-[150px]">
            <span className="text-xs text-gray-600 font-medium mb-1.5 block">客户简称</span>
            <input
              value={filterName}
              onChange={(e) => setFilterName(e.target.value.slice(0, 100))}
              placeholder="客户简称"
              className={inputClass}
            />
          </label>
          <label className="block w-[170px]">
            <span className="text-xs text-gray-600 font-medium mb-1.5 block">统一社会信用代码</span>
            <input
              value={filterCreditCode}
              onChange={(e) => setFilterCreditCode(e.target.value)}
              placeholder="统一社会信用代码"
              className={inputClass}
            />
          </label>
          <label className="block w-[120px]">
            <span className="text-xs text-gray-600 font-medium mb-1.5 block">客户经理</span>
            <input
              value={filterManager}
              onChange={(e) => setFilterManager(e.target.value)}
              placeholder="客户经理名称"
              className={inputClass}
            />
          </label>
          <label className="block w-[170px]">
            <span className="text-xs text-gray-600 font-medium mb-1.5 block">版本授权</span>
            <select
              value={filterVersion}
              onChange={(e) => setFilterVersion(e.target.value as VersionAuthFilter)}
              className={`${inputClass} cursor-pointer`}
            >
              <option value="">全部授权（共{summary.total}家）</option>
              <option value="正式">正式版（共{institutions.filter((i) => i.status === '正式').length}家）</option>
              <option value="试用">试用版（共{institutions.filter((i) => i.status === '试用').length}家）</option>
            </select>
          </label>
          <label className="block w-[110px]">
            <span className="text-xs text-gray-600 font-medium mb-1.5 block">应用状态</span>
            <select
              value={filterAppStatus}
              onChange={(e) => setFilterAppStatus(e.target.value as AppStatusFilter)}
              className={`${inputClass} cursor-pointer`}
            >
              <option value="">全部状态</option>
              <option value="opened">已开通</option>
              <option value="expired">已到期</option>
            </select>
          </label>
          <button
            type="button"
            onClick={() => handlePageChange(1)}
            className="h-9 bg-[#1E3A6B] text-white text-sm font-medium px-4 rounded-md flex items-center gap-1 hover:bg-[#162d54] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">search</span>
            搜索
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="h-9 bg-white border border-gray-200 text-gray-700 text-sm font-medium px-4 rounded-md flex items-center gap-1 hover:border-[#1E3A6B] hover:text-[#1E3A6B] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            重置
          </button>
          <button
            type="button"
            onClick={() => setAuthorizeOpen(true)}
            className="ml-auto h-9 bg-[#1E3A6B] text-white text-sm font-medium px-4 rounded-md flex items-center gap-1 hover:bg-[#162d54] transition-colors shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            开通机构
          </button>
        </div>
      </div>

      {/* 列表 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex-1 flex flex-col justify-between">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-[#f7f8fa] text-gray-600 border-b border-gray-200 text-xs">
                <th className="py-3 px-5 font-medium">客户简称（悬停查看详情）</th>
                <th className="py-3 px-4 font-medium w-[150px]">所属销售</th>
                <th className="py-3 px-4 font-medium w-[110px]">开通版本</th>
                <th className="py-3 px-4 font-medium w-[130px]">授权状态</th>
                <th className="py-3 px-4 font-medium w-[230px]">
                  <button
                    type="button"
                    onClick={toggleSortOrder}
                    className="inline-flex items-center gap-1 cursor-pointer hover:text-[#1E3A6B]"
                    title="按到期时间排序"
                  >
                    服务时间
                    <span className="material-symbols-outlined text-[15px]">
                      {sortOrder === 'asc' ? 'arrow_upward' : sortOrder === 'desc' ? 'arrow_downward' : 'swap_vert'}
                    </span>
                  </button>
                </th>
                <th className="py-3 px-5 font-medium w-[120px] text-right">操作</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-800">
              {pageData.map((row) => {
                const expired = row.daysRemaining <= 0;
                return (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50/70 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <button
                          type="button"
                          onClick={() => openDetail(row)}
                          title={row.name}
                          className="font-bold text-gray-900 hover:text-[#1E3A6B] cursor-pointer text-left truncate max-w-[280px]"
                        >
                          {row.name}
                        </button>
                        <button
                          type="button"
                          data-profile-trigger
                          onMouseEnter={(e) => showProfile(row, e.currentTarget)}
                          onClick={(e) => showProfile(row, e.currentTarget)}
                          className={`material-symbols-outlined shrink-0 text-[17px] cursor-pointer transition-colors ${
                            profilePopover?.institution.id === row.id ? 'text-amber-600' : 'text-amber-500 hover:text-amber-600'
                          }`}
                          title="查看详情档案"
                        >
                          info
                        </button>
                      </div>
                      <div className="text-xs text-gray-400 mt-1 truncate max-w-[300px]">统计单元：{row.unitName || '—'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-gray-700">
                        <span className="material-symbols-outlined text-[16px] text-gray-400">person</span>
                        {row.salesName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block text-xs px-2 py-0.5 rounded border ${
                          row.status === '正式'
                            ? 'bg-violet-50 text-violet-600 border-violet-200'
                            : 'bg-amber-50 text-amber-600 border-amber-200'
                        }`}
                      >
                        {row.status}版
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {expired ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-amber-200 bg-amber-50 text-amber-600">
                          <span className="material-symbols-outlined text-[14px]">schedule</span>
                          已到期
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded border border-emerald-200 bg-emerald-50 text-emerald-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          已开通
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <div className="font-mono text-gray-800 font-medium">
                        {row.startDate} ~ {row.endDate}
                      </div>
                      <div className={`mt-1 ${expired ? 'text-rose-600 font-bold' : 'text-gray-400'}`}>
                        {expired ? '已过期' : `距离到期：${row.daysRemaining} 天`}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="inline-flex items-center gap-3 text-sm font-medium">
                        <button
                          id={`btn-table-detail-${row.id}`}
                          type="button"
                          onClick={() => openDetail(row)}
                          className="text-[#1890ff] hover:text-blue-700 cursor-pointer"
                        >
                          管理
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {pageData.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 text-sm">
                    暂无相关机构数据，请调整筛选条件或点击「开通机构」
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        <div className="p-4 border-t border-gray-100 flex justify-end items-center gap-2.5 text-[#666666] text-sm select-none bg-white">
          <span className="mr-1">共 {totalCount} 条</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
              setJumpPageInput('1');
            }}
            className="border border-gray-300 rounded px-2 h-8 text-sm focus:outline-none focus:border-[#1890ff] cursor-pointer bg-white mr-1"
          >
            <option value={10}>10 条/页</option>
            <option value={20}>20 条/页</option>
            <option value={30}>30 条/页</option>
            <option value={50}>50 条/页</option>
          </select>
          <button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:border-[#1890ff] hover:text-[#1890ff] disabled:opacity-40 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`w-8 h-8 flex items-center justify-center border rounded font-medium cursor-pointer transition-colors ${
                page === currentPage
                  ? 'border-[#1890ff] text-[#1890ff] bg-blue-50'
                  : 'border-gray-300 hover:border-[#1890ff] hover:text-[#1890ff]'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:border-[#1890ff] hover:text-[#1890ff] disabled:opacity-40 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
          <div className="flex items-center ml-2 gap-2">
            <span>跳至</span>
            <input
              type="text"
              value={jumpPageInput}
              onChange={(e) => setJumpPageInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJumpPage()}
              className="w-12 h-8 border border-gray-300 rounded text-center focus:outline-none focus:border-[#1890ff] text-sm"
            />
            <span>页</span>
          </div>
        </div>
      </div>

      {/* 机构详情档案 */}
      {profilePopover && profile && (
        <>
          <div
            data-profile-popover
            className="fixed z-50 w-[280px] -translate-x-1/2 -translate-y-full rounded-lg bg-[#0f1a2e] text-white shadow-2xl border border-white/10"
            style={{ left: profilePopover.left, top: profilePopover.top }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-1.5 text-sm font-bold min-w-0">
                <span className="material-symbols-outlined text-[16px] text-sky-400">apartment</span>
                <span className="truncate">{profilePopover.institution.name} · 详情档案</span>
              </div>
              <button
                type="button"
                onClick={() => setProfilePopover(null)}
                className="text-white/50 hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <dl className="px-4 py-3 space-y-2.5 text-xs">
              {[
                ['机构全称', profile.fullName, 'text-white'],
                ['统一信用代码', profile.creditCode, 'text-white font-mono'],
                ['首次添加时间', profile.createdAt, 'text-white font-mono'],
                ['所在省市区', profile.region, 'text-white'],
                ['机构级别', profile.level, 'text-amber-400'],
                ['统计单元', profile.unitName, 'text-white'],
                ['客户分类', profile.customerClass, 'text-emerald-400'],
                ['客户经理', profile.salesName, 'text-white'],
              ].map(([label, value, tone]) => (
                <div key={label} className="flex items-start justify-between gap-3">
                  <dt className="text-white/50 shrink-0">{label}：</dt>
                  <dd className={`text-right font-medium break-all ${tone}`}>{value}</dd>
                </div>
              ))}
            </dl>
            <div className="flex justify-end px-4 py-2.5 border-t border-white/10">
              <button
                type="button"
                onClick={() => setProfilePopover(null)}
                className="text-xs px-3 py-1 rounded border border-white/20 text-white/80 hover:bg-white/10 cursor-pointer"
              >
                关闭
              </button>
            </div>
            <span className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-3 h-3 rotate-45 bg-[#0f1a2e] border-r border-b border-white/10" />
          </div>
        </>
      )}

      {authorizeOpen && (
        <AuthorizeInstitutionModal
          candidates={authorizeOptions}
          onManage={(id) => {
            const target = institutions.find((item) => item.id === id);
            closeAuthorize();
            if (target) openDetail(target);
          }}
          onClose={closeAuthorize}
          onConfirm={(data) => {
            onAuthorizeInstitution(data);
            closeAuthorize();
          }}
        />
      )}

      {/* 到期机构续期 */}
      {provisioningTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 flex flex-col">
            <div className="bg-[#f8fafd] px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-gray-900">服务续期</h3>
                  <span className="text-xs text-gray-500 truncate max-w-[220px]" title={provisioningTarget.name}>
                    （{provisioningTarget.name}）
                  </span>
                </div>
                <div className="text-[11px] text-amber-600 flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-[13px]">info</span>
                  该机构服务已到期，重新配置授权后恢复运行
                </div>
              </div>
              <button
                type="button"
                onClick={() => setProvisioningTarget(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-gray-700">
              <div className="grid grid-cols-2 gap-3">
                {(['正式', '试用'] as const).map((status) => {
                  const active = provisionForm.status === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => handleModalSwitchStatus(status)}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all text-sm font-bold ${
                        active
                          ? status === '正式'
                            ? 'border-violet-500 bg-violet-50 text-violet-600'
                            : 'border-amber-500 bg-amber-50 text-amber-600'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {status === '正式' ? 'workspace_premium' : 'hourglass_top'}
                      </span>
                      {status}版
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-gray-600 font-medium mb-1.5 block">
                    服务开始日期 <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="date"
                    value={provisionForm.startDate}
                    onChange={(e) => setProvisionForm({ ...provisionForm, startDate: e.target.value })}
                    className="w-full border border-gray-200 focus:border-[#1890ff] rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-gray-600 font-medium mb-1.5 block">
                    服务到期日期 <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="date"
                    value={provisionForm.endDate}
                    onChange={(e) => setProvisionForm({ ...provisionForm, endDate: e.target.value })}
                    className="w-full border border-gray-200 focus:border-[#1890ff] rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none"
                  />
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {(provisionForm.status === '试用' ? TRIAL_DURATION_PRESETS : FORMAL_DURATION_PRESETS).map((preset) => {
                  const isSelected = calculateDays(provisionForm.startDate, provisionForm.endDate) === preset.days;
                  return (
                    <button
                      key={preset.days}
                      type="button"
                      onClick={() => handleModalQuickDuration(preset.days, provisionForm.status)}
                      className={`text-xs px-3 py-1 rounded border cursor-pointer font-medium ${
                        isSelected
                          ? 'border-[#1890ff] bg-blue-50 text-[#1890ff]'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              <div className="bg-[#f8faff] border border-[#d6e4ff] rounded-lg px-4 py-3 text-gray-600">
                服务时长共
                <span className="mx-1 text-sm font-bold font-mono text-[#1890ff]">
                  {calculateDays(provisionForm.startDate, provisionForm.endDate)}
                </span>
                天
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-3.5 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setProvisioningTarget(null)}
                className="px-4 py-1.5 rounded text-sm text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmProvision}
                className="px-5 py-1.5 rounded text-sm font-medium bg-[#1E3A6B] text-white hover:bg-[#162d54] cursor-pointer"
              >
                确认续期
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
