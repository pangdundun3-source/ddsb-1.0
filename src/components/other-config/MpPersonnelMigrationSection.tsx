import React, { useEffect, useRef, useState } from 'react';
import {
  MpMigrationConfig,
  MpMigrationTask,
  MpPersonnelMigrationItem,
  WechatMpConfig,
} from '../../types';
import { useMpPersonnelMigrationViewModel } from '../../viewmodels/useMpPersonnelMigrationViewModel';

export const mockMigrationPersonnel: MpPersonnelMigrationItem[] = [
  {
    id: 'p-1',
    name: '张建国',
    phone: '138****9201',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    department: '新闻采编一部',
    role: '首席采编员',
    sourceOpenId: 'oZ4_ddsb_918237192',
    sourceMp: '点点速报 (平台统配)',
    targetMp: '随州融媒发布 (官方服务号)',
    targetOpenId: 'oZ4_szmt_881920194',
    status: 'completed',
    matchedVia: 'union_id',
    migratedTime: '2026-08-28 10:14:22',
    inheritedDraftsCount: 24,
    inheritedPoints: 1280,
    remindCount: 1,
    lastRemindTime: '2026-08-28 10:00:00',
  },
  {
    id: 'p-2',
    name: '李雅婷',
    phone: '139****1182',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    department: '时政融媒组',
    role: '责任编辑',
    sourceOpenId: 'oZ4_ddsb_771928310',
    sourceMp: '点点速报 (平台统配)',
    targetMp: '随州融媒发布 (官方服务号)',
    targetOpenId: 'oZ4_szmt_772910381',
    status: 'completed',
    matchedVia: 'union_id',
    migratedTime: '2026-08-28 10:18:05',
    inheritedDraftsCount: 38,
    inheritedPoints: 2150,
    remindCount: 1,
    lastRemindTime: '2026-08-28 10:00:00',
  },
  {
    id: 'p-3',
    name: '王少华',
    phone: '137****6631',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
    department: '民生舆情部',
    role: '采编组长',
    sourceOpenId: 'oZ4_ddsb_119283745',
    sourceMp: '点点速报 (平台统配)',
    targetMp: '随州融媒发布 (官方服务号)',
    targetOpenId: 'oZ4_szmt_551829031',
    status: 'completed',
    matchedVia: 'sms_invite',
    migratedTime: '2026-08-28 11:05:40',
    inheritedDraftsCount: 15,
    inheritedPoints: 890,
    remindCount: 1,
    lastRemindTime: '2026-08-28 10:00:00',
  },
  {
    id: 'p-4',
    name: '陈思敏',
    phone: '136****5519',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    department: '新媒体运营中心',
    role: '运营编辑',
    sourceOpenId: 'oZ4_ddsb_441829301',
    sourceMp: '点点速报 (平台统配)',
    targetMp: '随州融媒发布 (官方服务号)',
    status: 'pending_scan',
    inheritedDraftsCount: 19,
    inheritedPoints: 940,
    remindCount: 2,
    lastRemindTime: '2026-08-29 09:30:00',
  },
  {
    id: 'p-5',
    name: '赵子轩',
    phone: '135****4428',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    department: '短视频制作组',
    role: '视频编导',
    sourceOpenId: 'oZ4_ddsb_662819034',
    sourceMp: '点点速报 (平台统配)',
    targetMp: '随州融媒发布 (官方服务号)',
    status: 'pending_scan',
    inheritedDraftsCount: 9,
    inheritedPoints: 460,
    remindCount: 2,
    lastRemindTime: '2026-08-29 09:30:00',
  },
  {
    id: 'p-6',
    name: '孙晓雨',
    phone: '139****8820',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    department: '审核把关办公室',
    role: '二级审稿员',
    sourceOpenId: 'oZ4_ddsb_882910394',
    sourceMp: '点点速报 (平台统配)',
    targetMp: '随州融媒发布 (官方服务号)',
    status: 'not_started',
    inheritedDraftsCount: 42,
    inheritedPoints: 3100,
    remindCount: 0,
  },
];

export const mockMigrationTasks: MpMigrationTask[] = [
  {
    id: 'TASK-20260828-01',
    taskBatchNo: 'BATCH-20260828-01',
    taskName: '【随州融媒】全员公众号换绑跨号迁移任务',
    sourceMpName: '点点速报 (平台统配)',
    targetMpName: '随州融媒发布 (官方服务号)',
    totalPersonnel: 6,
    completedCount: 3,
    pendingCount: 2,
    failedCount: 0,
    channels: ['wechat_card', 'sms', 'qr_poster'],
    status: 'in_progress',
    createdAt: '2026-08-28 10:00:00',
    operator: '系统管理员 (廖伟)',
    progressPercentage: 50,
    remark: '全员定向推送换绑卡片与短信提醒',
  },
];

interface MpPersonnelMigrationSectionProps {
  institutionName: string;
  mpConfig?: WechatMpConfig;
  migrationConfig?: MpMigrationConfig;
  onChangeMigration: (newConfig: MpMigrationConfig) => void;
  showToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
  onNavigateToMpConfig?: () => void;
  layout?: 'full' | 'daily' | 'wizard';
  highlightMigrate?: boolean;
}

export const MpPersonnelMigrationSection: React.FC<MpPersonnelMigrationSectionProps> = ({
  institutionName,
  mpConfig,
  migrationConfig,
  onChangeMigration,
  showToast,
  onNavigateToMpConfig,
  layout = 'full',
  highlightMigrate = false,
}) => {
  const { state, actions } = useMpPersonnelMigrationViewModel({
    institutionName,
    mpConfig,
    migrationConfig,
    defaultPersonnel: mockMigrationPersonnel,
    defaultTasks: mockMigrationTasks,
    onChangeMigration,
    showToast,
    onNavigateToMpConfig,
  });

  const {
    personnelList,
    tasks,
    searchQuery,
    statusFilter,
    showTaskDrawer,
    showPrincipleHelp,
    showConfirmModal,
    confirmModalType,
    targetPersonToMigrate,
    isLaunching,
    selectedPersonForQr,
    showManualConfirmModal,
    manualConfirmTarget,
    sourceMpName,
    targetMpName,
    isCustomBound,
    channelText,
    totalCount,
    completedCount,
    pendingCount,
    completionRate,
    filteredList,
  } = state;

  const {
    setSearchQuery,
    setStatusFilter,
    setShowTaskDrawer,
    setShowPrincipleHelp,
    openConfirmModalForAll,
    openConfirmModalForSingle,
    closeConfirmModal,
    handleExecuteConfirmedMigration,
    setSelectedPersonForQr,
    openManualConfirmModal,
    closeManualConfirmModal,
    confirmManualMigration,
  } = actions;

  const isSlim = layout === 'daily' || layout === 'wizard';
  const waitingCount =
    pendingCount + personnelList.filter((p) => p.status === 'not_started').length;
  const hasLaunchedTask = tasks.length > 0;
  const preferUrgeCta = isCustomBound && hasLaunchedTask && waitingCount > 0;

  const [openMoreMenuId, setOpenMoreMenuId] = useState<string | null>(null);
  const moreMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!openMoreMenuId) return;
    const onDocClick = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setOpenMoreMenuId(null);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [openMoreMenuId]);

  return (
    <div className="space-y-4 text-gray-800">
      <div className="bg-white rounded-xl border border-gray-200/80 p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3.5 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-gray-900">
                {isSlim ? '采编人员换绑' : '人员换绑迁移通道'}
              </h3>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${
                  isCustomBound
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {isCustomBound
                  ? `进度 ${completedCount}/${totalCount}`
                  : '未完成通道换绑 · 暂未开放'}
              </span>
            </div>
            {isSlim ? (
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                <span className="text-gray-600">{sourceMpName}</span>
                <span className="material-symbols-outlined text-[14px] text-gray-400">arrow_forward</span>
                <span className="text-[#1890ff] font-semibold">{targetMpName}</span>
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-0.5">
                向人员发送换绑提醒；与上方「切换公众号 / 通道换绑」相互独立
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {preferUrgeCta ? (
              <>
                <button
                  type="button"
                  onClick={openConfirmModalForAll}
                  disabled={!isCustomBound || isLaunching}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#1890ff] text-white hover:bg-blue-600 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${
                    highlightMigrate ? 'ring-2 ring-blue-300 ring-offset-2 animate-pulse' : ''
                  }`}
                  title="向仍待换绑的采编再次催办"
                >
                  <span className="material-symbols-outlined text-[16px]">notifications_active</span>
                  <span>催办待换绑 ({waitingCount})</span>
                </button>
                <button
                  type="button"
                  onClick={openConfirmModalForAll}
                  disabled={!isCustomBound || isLaunching}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200/80 transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap disabled:opacity-50"
                  title="再次向全员发送换绑提醒"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  <span>再次全员通知</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={openConfirmModalForAll}
                disabled={!isCustomBound || isLaunching}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#1890ff] text-white hover:bg-blue-600 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${
                  highlightMigrate ? 'ring-2 ring-blue-300 ring-offset-2 animate-pulse' : ''
                }`}
                title={!isCustomBound ? '必须先完成通道换绑，才能发起人员换绑' : '确认后向全员发起人员换绑通知'}
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
                <span>发起全员换绑</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowTaskDrawer(true)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200/80 transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[16px]">history</span>
              <span>记录 ({tasks.length})</span>
            </button>
          </div>
        </div>

        {!isSlim && (
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3 items-center bg-gray-50/70 p-3.5 rounded-xl border border-gray-200/80">
            <div className="md:col-span-3 bg-white p-3.5 rounded-lg border border-gray-200/80 shadow-2xs">
              <span className="text-[11px] px-2 py-0.5 rounded font-bold bg-gray-100 text-gray-600">原公众号</span>
              <div className="flex items-center gap-2.5 mt-2">
                <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">public</span>
                </div>
                <h4 className="text-xs font-bold text-gray-900 truncate">{sourceMpName}</h4>
              </div>
            </div>
            <div className="md:col-span-1 flex flex-col items-center justify-center py-1">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-[#1890ff] flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </div>
            </div>
            <div className="md:col-span-3 bg-white p-3.5 rounded-lg border border-blue-200/80 ring-1 ring-blue-100 shadow-2xs">
              <span className="text-[11px] px-2 py-0.5 rounded font-bold bg-blue-50 text-[#1890ff]">目标公众号</span>
              <div className="flex items-center gap-2.5 mt-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                </div>
                <h4 className="text-xs font-bold text-gray-900 truncate">{targetMpName}</h4>
              </div>
            </div>
          </div>
        )}

        {!isCustomBound && (
          <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[22px] text-amber-600 shrink-0">lock</span>
              <div>
                <h4 className="text-xs font-bold text-amber-950">未完成通道换绑，暂无法发起人员换绑</h4>
                <p className="text-xs text-amber-800 mt-0.5">请先切换发稿通道至自有公众号，确立迁入目标后再操作。</p>
              </div>
            </div>
            {onNavigateToMpConfig && (
              <button
                type="button"
                onClick={onNavigateToMpConfig}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 shadow-2xs flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">sync_alt</span>
                <span>去切换通道</span>
              </button>
            )}
          </div>
        )}

        {preferUrgeCta && (
          <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-100 text-xs text-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#1890ff] shrink-0">campaign</span>
              <span>
                全员通知已下发。当前仍有 <strong>{waitingCount}</strong> 人待换绑，可优先催办，或对单人点「发送换绑」。
              </span>
            </div>
            <button
              type="button"
              onClick={() => setStatusFilter('pending_scan')}
              className="text-[11px] font-semibold text-[#1890ff] hover:underline cursor-pointer shrink-0"
            >
              查看待换绑名单
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-1 min-w-[140px] max-w-xs">
              <span className="font-semibold text-gray-700 shrink-0">进度</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#1890ff] h-full rounded-full transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <span className="font-bold text-[#1890ff] font-mono shrink-0">{completionRate}%</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-emerald-700">已换绑 <strong>{completedCount}</strong></span>
              <span className="text-amber-700">待换绑 <strong>{waitingCount}</strong></span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowPrincipleHelp(!showPrincipleHelp)}
            className="text-gray-500 hover:text-[#1890ff] flex items-center gap-1 font-medium cursor-pointer text-xs shrink-0"
          >
            <span className="material-symbols-outlined text-[14px] text-[#1890ff]">help_outline</span>
            <span>{showPrincipleHelp ? '收起指引' : '查看指引'}</span>
          </button>
        </div>

        {showPrincipleHelp && (
          <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-100 text-xs space-y-1 text-gray-600">
            <p>
              <strong>区分：</strong>「切换公众号」改发稿通道；「全员换绑 / 发送换绑」只通知采编关注新号。
            </p>
            <p>
              <strong>流程：</strong>通道换绑完成 → 全员或单人发送提醒 → 扫码关注后自动结转稿件与积分。
            </p>
            <p>
              <strong>兜底：</strong>
              {sourceMpName} → {targetMpName}；未响应可用行内「更多」中的专属码或人工确认。
            </p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200/80 p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center bg-gray-100/90 p-0.5 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-md font-medium cursor-pointer transition-all ${
                statusFilter === 'all'
                  ? 'bg-white text-gray-900 shadow-2xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              全部 ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('pending_scan')}
              className={`px-3 py-1 rounded-md font-medium cursor-pointer transition-all ${
                statusFilter === 'pending_scan'
                  ? 'bg-white text-amber-700 shadow-2xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              待换绑 ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1 rounded-md font-medium cursor-pointer transition-all ${
                statusFilter === 'completed'
                  ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              已换绑 ({completedCount})
            </button>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-2 text-gray-400 text-[14px]">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索姓名或手机号..."
              className="pl-7 pr-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:border-[#1890ff] w-48"
            />
          </div>
        </div>

        <div className="border border-gray-200/90 rounded-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[620px]">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-medium select-none">
                <tr>
                  <th className="py-2.5 px-3.5">采编人员</th>
                  <th className="py-2.5 px-3.5">部门与角色</th>
                  <th className="py-2.5 px-3.5">继承资产</th>
                  <th className="py-2.5 px-3.5">状态</th>
                  <th className="py-2.5 px-3.5 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400">
                      未找到符合条件的采编人员
                    </td>
                  </tr>
                ) : (
                  filteredList.map((person) => {
                    const isCompleted = person.status === 'completed';
                    const isMenuOpen = openMoreMenuId === person.id;
                    return (
                      <tr key={person.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-2.5 px-3.5">
                          <div className="flex items-center gap-2">
                            <img
                              src={person.avatar}
                              alt={person.name}
                              className="w-7 h-7 rounded-full object-cover border border-gray-200 shrink-0"
                            />
                            <div>
                              <span className="font-bold text-gray-900">{person.name}</span>
                              <span className="text-[11px] text-gray-400 font-mono ml-1.5">{person.phone}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3.5">
                          <span className="text-gray-700 font-medium">{person.department}</span>
                          <span className="text-[11px] text-gray-400 ml-1.5">({person.role})</span>
                        </td>
                        <td className="py-2.5 px-3.5">
                          <span className="text-gray-600 text-[11px]">
                            稿件 <strong>{person.inheritedDraftsCount}</strong> · 积分{' '}
                            <strong>{person.inheritedPoints}</strong>
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5">
                          {isCompleted ? (
                            <span className="text-[11px] font-bold text-emerald-700 inline-flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <span className="material-symbols-outlined text-[13px]">check_circle</span>
                              换绑完成
                            </span>
                          ) : (
                            <div className="inline-flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              <span className="text-[11px] font-semibold text-amber-800 inline-flex items-center gap-0.5">
                                <span className="material-symbols-outlined text-[13px]">schedule</span>
                                {person.status === 'not_started' ? '未开始' : '待扫码'}
                              </span>
                              {person.remindCount > 0 && (
                                <span className="text-[10px] text-amber-600 font-mono">({person.remindCount}次)</span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3.5 text-right">
                          {!isCompleted ? (
                            <div
                              className="relative inline-flex items-center justify-end gap-2"
                              ref={isMenuOpen ? moreMenuRef : undefined}
                            >
                              <button
                                type="button"
                                disabled={!isCustomBound}
                                onClick={() => openConfirmModalForSingle(person)}
                                className="text-xs font-bold text-[#1890ff] hover:underline cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                发送换绑
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenMoreMenuId(isMenuOpen ? null : person.id)
                                }
                                className="inline-flex items-center gap-0.5 text-xs text-gray-500 hover:text-gray-800 cursor-pointer px-1.5 py-0.5 rounded hover:bg-gray-100"
                                aria-expanded={isMenuOpen}
                                aria-haspopup="menu"
                              >
                                <span>更多</span>
                                <span className="material-symbols-outlined text-[14px]">
                                  {isMenuOpen ? 'expand_less' : 'expand_more'}
                                </span>
                              </button>
                              {isMenuOpen && (
                                <div
                                  role="menu"
                                  className="absolute right-0 bottom-full mb-1 z-30 min-w-[132px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                                >
                                  <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                      setOpenMoreMenuId(null);
                                      setSelectedPersonForQr(person);
                                    }}
                                    className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <span className="material-symbols-outlined text-[15px] text-purple-600">
                                      qr_code_2
                                    </span>
                                    专属码
                                  </button>
                                  <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                      setOpenMoreMenuId(null);
                                      openManualConfirmModal(person);
                                    }}
                                    className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <span className="material-symbols-outlined text-[15px] text-emerald-600">
                                      verified
                                    </span>
                                    人工确认
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">已就绪</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-5 animate-scale-up space-y-4 text-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-[#1890ff] shrink-0">
                <span className="material-symbols-outlined text-[24px]">swap_horiz</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {confirmModalType === 'all'
                    ? preferUrgeCta
                      ? '确认催办待换绑人员'
                      : '确认发起全员换绑'
                    : '确认发送换绑提醒'}
                </h3>
                <p className="text-xs text-gray-500">
                  {confirmModalType === 'all'
                    ? preferUrgeCta
                      ? `向待换绑人员 (${waitingCount}人) 再次发送提醒`
                      : `向全员 (${totalCount}人) 发送人员换绑提醒`
                    : `向【${targetPersonToMigrate?.name}】发送换绑提醒`}
                </p>
              </div>
            </div>
            <div className="bg-blue-50/70 border border-blue-200/90 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs bg-white p-2.5 rounded-lg border border-blue-100">
                <span className="text-gray-500 font-medium">从：</span>
                <span className="font-bold text-gray-800">{sourceMpName}</span>
              </div>
              <div className="flex items-center justify-center text-blue-500">
                <span className="material-symbols-outlined text-[20px]">arrow_downward</span>
              </div>
              <div className="flex items-center justify-between text-xs bg-white p-2.5 rounded-lg border border-blue-200">
                <span className="text-blue-700 font-bold">至：</span>
                <span className="font-bold text-[#1890ff] text-sm">{targetMpName}</span>
              </div>
            </div>
            <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg space-y-1 border border-gray-200/60">
              <p>✓ 历史稿件与积分自动结转 · 职务权限保留</p>
              <p className="text-gray-400 text-[11px]">通知渠道：{channelText}</p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={closeConfirmModal}
                disabled={isLaunching}
                className="px-4 py-2 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleExecuteConfirmedMigration}
                disabled={isLaunching}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-[#1890ff] text-white hover:bg-blue-600 cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <span className={`material-symbols-outlined text-[16px] ${isLaunching ? 'animate-spin' : ''}`}>
                  {isLaunching ? 'sync' : 'check'}
                </span>
                <span>
                  {isLaunching
                    ? '正在执行...'
                    : confirmModalType === 'all'
                      ? preferUrgeCta
                        ? '确认催办'
                        : '确认全员换绑'
                      : '确认发送'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showManualConfirmModal && manualConfirmTarget && (
        <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-5 animate-scale-up space-y-4 text-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                <span className="material-symbols-outlined text-[24px]">verified_user</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">确认人工完成换绑？</h3>
                <p className="text-xs text-gray-500">
                  将【{manualConfirmTarget.name}】标记为已换绑至【{targetMpName}】
                </p>
              </div>
            </div>
            <div className="text-xs text-amber-900 bg-amber-50 p-3 rounded-lg space-y-1 border border-amber-200">
              <p>• 请确认该人员已实际关注目标公众号</p>
              <p>• 确认后将结转其稿件与积分，且状态不可轻易回退</p>
              <p>• 优先建议使用「发送换绑」或「专属码」完成真实扫码</p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={closeManualConfirmModal}
                className="px-4 py-2 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={confirmManualMigration}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <span className="material-symbols-outlined text-[16px]">check</span>
                <span>确认人工换绑完成</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedPersonForQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-xs p-5 text-center space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="font-bold text-xs text-gray-900">【{selectedPersonForQr.name}】专属换绑码</span>
              <button
                type="button"
                onClick={() => setSelectedPersonForQr(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 inline-block">
              <div className="w-36 h-36 bg-gradient-to-br from-blue-700 to-indigo-800 rounded-lg flex flex-col items-center justify-center text-white p-2">
                <span className="material-symbols-outlined text-[44px]">qr_code_2</span>
                <span className="text-[10px] font-bold mt-1">{selectedPersonForQr.name} 专属码</span>
                <span className="text-[8px] text-blue-200">扫码关注【{targetMpName}】</span>
              </div>
            </div>
            <p className="text-[11px] text-gray-500">扫码关注新公众号后，系统自动完成身份关联</p>
            <button
              type="button"
              onClick={() => {
                showToast(`已复制【${selectedPersonForQr.name}】专属换绑邀请短链！`);
                setSelectedPersonForQr(null);
              }}
              className="w-full py-2 rounded-lg text-xs font-bold bg-[#1890ff] text-white hover:bg-blue-600 cursor-pointer shadow-2xs"
            >
              复制专属换绑链接
            </button>
          </div>
        </div>
      )}

      {showTaskDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-lg p-5 space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#1890ff]">history</span>
                <span>人员换绑任务记录</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowTaskDrawer(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="space-y-2.5 max-h-80 overflow-y-auto">
              {tasks.map((task) => (
                <div key={task.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-gray-900">
                    <span>{task.taskName}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-[#1890ff] rounded-full font-medium">进行中</span>
                  </div>
                  <div className="text-gray-500 text-[11px]">
                    路线：{task.sourceMpName} ➔ {task.targetMpName}
                  </div>
                  <div className="text-gray-500 text-[11px]">
                    {task.createdAt} · {task.operator} · 进度 {task.completedCount}/{task.totalPersonnel}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-right pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowTaskDrawer(false)}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
