import { useMemo, useState } from 'react';
import {
  MpMigrationConfig,
  MpMigrationStatus,
  MpMigrationTask,
  MpPersonnelMigrationItem,
  WechatMpConfig,
} from '../types';
import { formatDateTime } from '../shared/date';

interface UseMpPersonnelMigrationViewModelOptions {
  institutionName: string;
  mpConfig?: WechatMpConfig;
  migrationConfig?: MpMigrationConfig;
  defaultPersonnel: MpPersonnelMigrationItem[];
  defaultTasks: MpMigrationTask[];
  onChangeMigration: (newConfig: MpMigrationConfig) => void;
  showToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
  onNavigateToMpConfig?: () => void;
}

export const useMpPersonnelMigrationViewModel = ({
  institutionName,
  mpConfig,
  migrationConfig,
  defaultPersonnel,
  defaultTasks,
  onChangeMigration,
  showToast,
  onNavigateToMpConfig,
}: UseMpPersonnelMigrationViewModelOptions) => {
  const [personnelList, setPersonnelList] = useState(
    migrationConfig?.personnelList || defaultPersonnel
  );
  const [tasks, setTasks] = useState(migrationConfig?.taskHistory || defaultTasks);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | MpMigrationStatus>('all');
  const [showTaskDrawer, setShowTaskDrawer] = useState(false);
  const [showPrincipleHelp, setShowPrincipleHelp] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [selectedPersonForQr, setSelectedPersonForQr] =
    useState<MpPersonnelMigrationItem | null>(null);

  // 迁移确认弹窗（明确从哪个公众号迁移到哪个公众号）
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalType, setConfirmModalType] = useState<'all' | 'single'>('all');
  const [targetPersonToMigrate, setTargetPersonToMigrate] =
    useState<MpPersonnelMigrationItem | null>(null);

  // 人工确认二次弹窗
  const [showManualConfirmModal, setShowManualConfirmModal] = useState(false);
  const [manualConfirmTarget, setManualConfirmTarget] =
    useState<MpPersonnelMigrationItem | null>(null);

  // 核心业务属性：源公众号与目标公众号
  const sourceMpName = mpConfig?.sourceMpName || '点点速报 (平台统配)';
  const targetMpName = mpConfig?.mpName || '随州融媒发布 (官方服务号)';

  // 核心规则判断：只有换绑至自有公众号后才能操作迁移人员
  // 如果当前是平台默认号且未换绑自有号，则处于未换绑锁定状态
  const isCustomBound =
    mpConfig?.isCustomBound !== undefined
      ? mpConfig.isCustomBound
      : mpConfig?.mode === 'custom_official';

  const useWechatCardNotify = migrationConfig?.enableWechatCardNotify ?? true;
  const useSmsNotify = migrationConfig?.enableSmsNotify ?? true;
  const channels: MpMigrationTask['channels'] = [
    ...(useWechatCardNotify ? (['wechat_card'] as const) : []),
    ...(useSmsNotify ? (['sms'] as const) : []),
    'qr_poster' as const,
  ];
  const channelText =
    [
      useWechatCardNotify ? '微信换绑卡片' : null,
      useSmsNotify ? '短信提醒' : null,
    ]
      .filter(Boolean)
      .join('、') || '扫码换绑';

  const totalCount = personnelList.length;
  const completedCount = personnelList.filter((person) => person.status === 'completed').length;
  const pendingCount = personnelList.filter(
    (person) => person.status === 'pending_scan' || person.status === 'migrating'
  ).length;
  const notStartedCount = personnelList.filter((person) => person.status === 'not_started').length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredList = useMemo(
    () =>
      personnelList.filter((person) => {
        const matchesSearch =
          !searchQuery ||
          person.name.includes(searchQuery) ||
          person.department.includes(searchQuery) ||
          person.phone.includes(searchQuery);
        const matchesStatus = statusFilter === 'all' || person.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [personnelList, searchQuery, statusFilter]
  );

  const persistMigration = (
    nextPersonnelList: MpPersonnelMigrationItem[],
    nextTasks = tasks
  ) => {
    setPersonnelList(nextPersonnelList);
    setTasks(nextTasks);
    onChangeMigration({
      enableAutoUnionIdSync: migrationConfig?.enableAutoUnionIdSync ?? true,
      enableSmsNotify: migrationConfig?.enableSmsNotify ?? true,
      enableWechatCardNotify: migrationConfig?.enableWechatCardNotify ?? true,
      personnelList: nextPersonnelList,
      taskHistory: nextTasks,
    });
  };

  // 打开全员换绑确认弹窗
  const openConfirmModalForAll = () => {
    if (!isCustomBound) {
      showToast('当前未完成自有公众号换绑，无法发起人员迁移！请先完成换绑。', 'warning');
      return;
    }
    setConfirmModalType('all');
    setTargetPersonToMigrate(null);
    setShowConfirmModal(true);
  };

  // 打开单个人员换绑确认弹窗
  const openConfirmModalForSingle = (person: MpPersonnelMigrationItem) => {
    if (!isCustomBound) {
      showToast('当前未完成自有公众号换绑，无法发起人员迁移！请先完成换绑。', 'warning');
      return;
    }
    setConfirmModalType('single');
    setTargetPersonToMigrate(person);
    setShowConfirmModal(true);
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setTargetPersonToMigrate(null);
  };

  // 确认后执行换绑迁移任务
  const handleExecuteConfirmedMigration = () => {
    setIsLaunching(true);
    const now = formatDateTime();

    window.setTimeout(() => {
      setIsLaunching(false);
      setShowConfirmModal(false);

      if (confirmModalType === 'single' && targetPersonToMigrate) {
        // 单个下发
        const updated = personnelList.map((person) =>
          person.id === targetPersonToMigrate.id
            ? {
                ...person,
                status: 'pending_scan' as const,
                sourceMp: sourceMpName,
                targetMp: targetMpName,
                remindCount: person.remindCount + 1,
                lastRemindTime: now,
              }
            : person
        );
        persistMigration(updated);
        showToast(
          `已向【${targetPersonToMigrate.name}】下发从【${sourceMpName}】迁移至【${targetMpName}】的换绑提醒！`,
          'success'
        );
      } else {
        // 全员下发
        const newTask: MpMigrationTask = {
          id: `TASK-${Date.now()}`,
          taskBatchNo: `BATCH-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-01`,
          taskName: `【${institutionName}】全员一键换绑迁移（${sourceMpName} → ${targetMpName}）`,
          sourceMpName,
          targetMpName,
          totalPersonnel: totalCount,
          completedCount,
          pendingCount: totalCount - completedCount,
          failedCount: 0,
          channels,
          status: 'in_progress',
          createdAt: now,
          operator: '当前管理员',
          progressPercentage: completionRate,
          remark: `全员${channelText}定向推送`,
        };
        const updatedList = personnelList.map((person) => ({
          ...person,
          sourceMp: sourceMpName,
          targetMp: targetMpName,
          status: person.status === 'completed' ? ('completed' as const) : ('pending_scan' as const),
          remindCount: person.status === 'completed' ? person.remindCount : person.remindCount + 1,
          lastRemindTime: now,
        }));
        const updatedTasks = [newTask, ...tasks];
        persistMigration(updatedList, updatedTasks);
        showToast(
          `已确认发起全员换绑迁移：从【${sourceMpName}】迁移至【${targetMpName}】，共通知 ${totalCount} 位采编成员！`,
          'success'
        );
      }
    }, 600);
  };

  const handleManualConfirmMigration = (id: string, name: string) => {
    const updated = personnelList.map((person) =>
      person.id === id
        ? {
            ...person,
            status: 'completed' as const,
            targetOpenId: `oZ4_manual_${Date.now().toString().slice(-8)}`,
            migratedTime: formatDateTime(),
            matchedVia: 'manual' as const,
          }
        : person
    );
    persistMigration(updated);
    setShowManualConfirmModal(false);
    setManualConfirmTarget(null);
    showToast(`已人工确认完成【${name}】的换绑！`, 'success');
  };

  const openManualConfirmModal = (person: MpPersonnelMigrationItem) => {
    setManualConfirmTarget(person);
    setShowManualConfirmModal(true);
  };

  const closeManualConfirmModal = () => {
    setShowManualConfirmModal(false);
    setManualConfirmTarget(null);
  };

  const confirmManualMigration = () => {
    if (!manualConfirmTarget) return;
    handleManualConfirmMigration(manualConfirmTarget.id, manualConfirmTarget.name);
  };

  return {
    state: {
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
      notStartedCount,
      completionRate,
      filteredList,
    },
    actions: {
      setSearchQuery,
      setStatusFilter,
      setShowTaskDrawer,
      setShowPrincipleHelp,
      openConfirmModalForAll,
      openConfirmModalForSingle,
      closeConfirmModal,
      handleExecuteConfirmedMigration,
      setSelectedPersonForQr,
      handleManualConfirmMigration,
      openManualConfirmModal,
      closeManualConfirmModal,
      confirmManualMigration,
      onNavigateToMpConfig,
    },
  };
};
