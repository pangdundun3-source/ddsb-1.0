import React, { useState, useMemo } from 'react';
import {
  MpMigrationConfig,
  WechatMpConfig,
  WechatMpMode,
  GlobalMpControlConfig,
  GlobalMpMigrationMethods,
  GlobalMpRebindConditions,
} from '../../types';
import {
  Building2,
  Smartphone,
  MessageSquare,
  Sparkles,
  QrCode,
  Lock,
  Unlock,
  Save,
  CheckCircle2,
  Users,
  ArrowRightLeft,
  Send,
  ShieldCheck,
  RotateCcw,
  Info,
} from 'lucide-react';

export const defaultRebindConditions: GlobalMpRebindConditions = {
  requireServiceAccount: true,
  requireAuthorizedApi: true,
  requireSameOpenPlatform: true,
  allowRevertToPlatform: true,
  singleActiveCustomMp: true,
};

export const defaultGlobalMpControlConfig: GlobalMpControlConfig = {
  allowDefaultPlatformMp: true,
  allowCustomOfficialMp: true,
  defaultPreferredMode: 'platform_default',
  platformMpAppId: 'wx1182736450918234',
  platformOpenPlatformSubject: '点点速报融媒开放平台 (全网统管主体)',
  rebindConditions: { ...defaultRebindConditions },
  migrationMethods: {
    autoUnionId: {
      enabled: true,
      title: 'UnionID 自动静默匹配',
      description: '同开放平台主体下关注新号后后台自动映射，用户完全无感',
      requireSameOpenPlatform: true,
    },
    wechatCard: {
      enabled: true,
      title: '微信服务通知卡片推送',
      description: '由原公众号向人员推送换绑通知卡片，点击一键关注新号',
      templateTitle: '【账号迁移】请确认换绑至单位新公众号',
      pushFrequencyLimit: 1,
    },
    smsVerify: {
      enabled: true,
      title: '短信验证码安全换绑',
      description: '向人员登记手机号发送动态验证码与专属换绑链接，用于离线兜底',
      codeExpireMinutes: 10,
      smsSignature: '【点点速报】',
    },
    workspaceQr: {
      enabled: false,
      title: '工作台登录扫码核身',
      description: '采编人员登录 PC/移动端采编后台时弹窗引导微信扫码核身',
      forceOnLogin: false,
    },
  },
  dataInheritance: {
    inheritDrafts: true,
    inheritAuditLogs: true,
    inheritPoints: true,
    inheritRoles: true,
  },
  migrationGracePeriodDays: 30,
  maxDailyRemindCount: 1,
  updatedAt: '2026-09-05 10:00:00',
  updatedBy: '超级系统管理员',
};

type GlobalStage = 1 | 2 | 3;

const STAGE_TABS: { step: GlobalStage; label: string; hint: string; institutionAlign: string }[] = [
  { step: 1, label: '平台接入与授权', hint: '准入方式与母版服务号', institutionAlign: '对齐机构：录入公众号' },
  { step: 2, label: '换绑生效条件', hint: '通道切换门槛与回绑', institutionAlign: '对齐机构：确认换绑' },
  { step: 3, label: '人员迁移通路', hint: '跨号通知与数据继承', institutionAlign: '对齐机构：人员迁移' },
];

interface FormSnapshot {
  allowDefaultPlatformMp: boolean;
  allowCustomOfficialMp: boolean;
  platformMpAppId: string;
  platformOpenPlatformSubject: string;
  rebindConditions: GlobalMpRebindConditions;
  migrationMethods: GlobalMpMigrationMethods;
  dataInheritance: GlobalMpControlConfig['dataInheritance'];
  migrationGracePeriodDays: number;
  maxDailyRemindCount: number;
  broadcastScope: 'all' | 'new_only';
}

interface GlobalOtherConfigDefaultsSectionProps {
  mpConfig?: WechatMpConfig;
  migrationConfig?: MpMigrationConfig;
  globalMpControl?: GlobalMpControlConfig;
  onSaveMpDefaults?: (config: WechatMpConfig) => void;
  onSaveMigrationDefaults?: (config: MpMigrationConfig) => void;
  onSaveGlobalControl?: (
    control: GlobalMpControlConfig,
    mpConfig?: WechatMpConfig,
    migration?: MpMigrationConfig
  ) => void;
  showToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
}

function mergeControl(
  base: GlobalMpControlConfig,
  patch?: Partial<GlobalMpControlConfig> | null
): GlobalMpControlConfig {
  return {
    ...base,
    ...(patch || {}),
    migrationMethods: {
      ...base.migrationMethods,
      ...(patch?.migrationMethods || {}),
      autoUnionId: { ...base.migrationMethods.autoUnionId, ...(patch?.migrationMethods?.autoUnionId || {}) },
      wechatCard: { ...base.migrationMethods.wechatCard, ...(patch?.migrationMethods?.wechatCard || {}) },
      smsVerify: { ...base.migrationMethods.smsVerify, ...(patch?.migrationMethods?.smsVerify || {}) },
      workspaceQr: { ...base.migrationMethods.workspaceQr, ...(patch?.migrationMethods?.workspaceQr || {}) },
    },
    dataInheritance: {
      ...base.dataInheritance,
      ...(patch?.dataInheritance || {}),
    },
    rebindConditions: {
      ...defaultRebindConditions,
      ...(base.rebindConditions || {}),
      ...(patch?.rebindConditions || {}),
      singleActiveCustomMp: true,
    },
  };
}

export const GlobalOtherConfigDefaultsSection: React.FC<
  GlobalOtherConfigDefaultsSectionProps
> = ({
  mpConfig,
  migrationConfig,
  globalMpControl,
  onSaveMpDefaults,
  onSaveMigrationDefaults,
  onSaveGlobalControl,
  showToast,
}) => {
  const [activeStage, setActiveStage] = useState<GlobalStage>(1);

  const initialControl: GlobalMpControlConfig = useMemo(() => {
    try {
      const saved = localStorage.getItem('mt_global_mp_control_config');
      if (saved) {
        return mergeControl(defaultGlobalMpControlConfig, JSON.parse(saved));
      }
    } catch {
      // ignore
    }
    return mergeControl(defaultGlobalMpControlConfig, globalMpControl);
  }, [globalMpControl]);

  const [allowDefaultPlatformMp, setAllowDefaultPlatformMp] = useState(
    initialControl.allowDefaultPlatformMp ?? true
  );
  const [allowCustomOfficialMp, setAllowCustomOfficialMp] = useState(
    initialControl.allowCustomOfficialMp ?? true
  );
  const [platformMpAppId, setPlatformMpAppId] = useState(
    initialControl.platformMpAppId || defaultGlobalMpControlConfig.platformMpAppId || ''
  );
  const [platformOpenPlatformSubject, setPlatformOpenPlatformSubject] = useState(
    initialControl.platformOpenPlatformSubject ||
      defaultGlobalMpControlConfig.platformOpenPlatformSubject ||
      ''
  );
  const [rebindConditions, setRebindConditions] = useState<GlobalMpRebindConditions>(
    initialControl.rebindConditions || defaultRebindConditions
  );
  const [migrationMethods, setMigrationMethods] = useState<GlobalMpMigrationMethods>(
    initialControl.migrationMethods
  );
  const [dataInheritance, setDataInheritance] = useState(initialControl.dataInheritance);
  const [migrationGracePeriodDays, setMigrationGracePeriodDays] = useState(
    initialControl.migrationGracePeriodDays || 30
  );
  const [maxDailyRemindCount, setMaxDailyRemindCount] = useState(
    initialControl.maxDailyRemindCount || 1
  );
  const [broadcastScope, setBroadcastScope] = useState<'all' | 'new_only'>('all');
  const [isSaving, setIsSaving] = useState(false);
  const [savedTime, setSavedTime] = useState<string | null>(initialControl.updatedAt || null);

  const [savedBaseline, setSavedBaseline] = useState<FormSnapshot>(() => ({
    allowDefaultPlatformMp: initialControl.allowDefaultPlatformMp ?? true,
    allowCustomOfficialMp: initialControl.allowCustomOfficialMp ?? true,
    platformMpAppId: initialControl.platformMpAppId || defaultGlobalMpControlConfig.platformMpAppId || '',
    platformOpenPlatformSubject:
      initialControl.platformOpenPlatformSubject ||
      defaultGlobalMpControlConfig.platformOpenPlatformSubject ||
      '',
    rebindConditions: initialControl.rebindConditions || defaultRebindConditions,
    migrationMethods: initialControl.migrationMethods,
    dataInheritance: initialControl.dataInheritance,
    migrationGracePeriodDays: initialControl.migrationGracePeriodDays || 30,
    maxDailyRemindCount: initialControl.maxDailyRemindCount || 1,
    broadcastScope: 'all',
  }));

  const currentSnapshot: FormSnapshot = useMemo(
    () => ({
      allowDefaultPlatformMp,
      allowCustomOfficialMp,
      platformMpAppId,
      platformOpenPlatformSubject,
      rebindConditions,
      migrationMethods,
      dataInheritance,
      migrationGracePeriodDays,
      maxDailyRemindCount,
      broadcastScope,
    }),
    [
      allowDefaultPlatformMp,
      allowCustomOfficialMp,
      platformMpAppId,
      platformOpenPlatformSubject,
      rebindConditions,
      migrationMethods,
      dataInheritance,
      migrationGracePeriodDays,
      maxDailyRemindCount,
      broadcastScope,
    ]
  );

  const isDirty = useMemo(
    () => JSON.stringify(currentSnapshot) !== JSON.stringify(savedBaseline),
    [currentSnapshot, savedBaseline]
  );

  const dirtyDetails = useMemo(() => {
    if (!isDirty) return [];
    const diffs: string[] = [];
    if (
      currentSnapshot.allowDefaultPlatformMp !== savedBaseline.allowDefaultPlatformMp ||
      currentSnapshot.allowCustomOfficialMp !== savedBaseline.allowCustomOfficialMp
    ) {
      diffs.push('接入权限');
    }
    if (
      currentSnapshot.platformMpAppId !== savedBaseline.platformMpAppId ||
      currentSnapshot.platformOpenPlatformSubject !== savedBaseline.platformOpenPlatformSubject
    ) {
      diffs.push('母版授权');
    }
    if (
      JSON.stringify(currentSnapshot.rebindConditions) !==
      JSON.stringify(savedBaseline.rebindConditions)
    ) {
      diffs.push('换绑条件');
    }
    if (
      JSON.stringify(currentSnapshot.migrationMethods) !==
      JSON.stringify(savedBaseline.migrationMethods)
    ) {
      diffs.push('迁移通路');
    }
    if (
      JSON.stringify(currentSnapshot.dataInheritance) !==
        JSON.stringify(savedBaseline.dataInheritance) ||
      currentSnapshot.migrationGracePeriodDays !== savedBaseline.migrationGracePeriodDays ||
      currentSnapshot.maxDailyRemindCount !== savedBaseline.maxDailyRemindCount
    ) {
      diffs.push('继承与宽限期');
    }
    if (currentSnapshot.broadcastScope !== savedBaseline.broadcastScope) {
      diffs.push('下发范围');
    }
    return diffs;
  }, [isDirty, currentSnapshot, savedBaseline]);

  const effectivePreferredMode: WechatMpMode = useMemo(() => {
    if (!allowCustomOfficialMp) return 'platform_default';
    if (!allowDefaultPlatformMp) return 'custom_official';
    return 'platform_default';
  }, [allowCustomOfficialMp, allowDefaultPlatformMp]);

  const activeMethodsCount = [
    migrationMethods?.autoUnionId,
    migrationMethods?.wechatCard,
    migrationMethods?.smsVerify,
    migrationMethods?.workspaceQr,
  ].filter((m) => Boolean(m?.enabled)).length;

  const policyStatusLabel = allowDefaultPlatformMp && allowCustomOfficialMp
    ? '双模可选'
    : !allowCustomOfficialMp
      ? '仅平台统配'
      : '仅自有服务号';

  const handleTogglePlatformMp = () => {
    if (allowDefaultPlatformMp && !allowCustomOfficialMp) {
      showToast('至少需要保留一种公众号使用方式开启', 'warning');
      return;
    }
    setAllowDefaultPlatformMp(!allowDefaultPlatformMp);
  };

  const handleToggleCustomMp = () => {
    if (allowCustomOfficialMp && !allowDefaultPlatformMp) {
      showToast('至少需要保留一种公众号使用方式开启', 'warning');
      return;
    }
    setAllowCustomOfficialMp(!allowCustomOfficialMp);
  };

  const handleToggleRebindCondition = (key: keyof GlobalMpRebindConditions) => {
    if (key === 'singleActiveCustomMp') return;
    setRebindConditions((prev) => ({
      ...prev,
      [key]: !prev[key],
      singleActiveCustomMp: true,
    }));
  };

  const handleToggleMigrationMethod = (key: keyof GlobalMpMigrationMethods) => {
    if (!allowCustomOfficialMp) {
      showToast('请先在「平台接入与授权」中开启机构自有公众号', 'warning');
      setActiveStage(1);
      return;
    }

    if (key === 'autoUnionId' && !migrationMethods.autoUnionId?.enabled) {
      if (rebindConditions.requireSameOpenPlatform && !platformOpenPlatformSubject.trim()) {
        showToast('启用 UnionID 静默匹配前，请先填写微信开放平台主体', 'warning');
        setActiveStage(1);
        return;
      }
    }

    setMigrationMethods((prev) => {
      const current = prev[key] || defaultGlobalMpControlConfig.migrationMethods[key];
      const nextEnabled = !current.enabled;
      if (key === 'autoUnionId' && nextEnabled) {
        return {
          ...prev,
          autoUnionId: {
            ...current,
            enabled: true,
            requireSameOpenPlatform: true,
          },
        };
      }
      return {
        ...prev,
        [key]: { ...current, enabled: nextEnabled },
      };
    });
  };

  const handleUpdateMethodParam = (
    key: keyof GlobalMpMigrationMethods,
    field: string,
    value: unknown
  ) => {
    setMigrationMethods((prev) => {
      const current = prev[key] || defaultGlobalMpControlConfig.migrationMethods[key];
      return {
        ...prev,
        [key]: { ...current, [field]: value },
      };
    });
  };

  const handleToggleInheritance = (key: keyof typeof dataInheritance) => {
    setDataInheritance((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleRevertChanges = () => {
    setAllowDefaultPlatformMp(savedBaseline.allowDefaultPlatformMp);
    setAllowCustomOfficialMp(savedBaseline.allowCustomOfficialMp);
    setPlatformMpAppId(savedBaseline.platformMpAppId);
    setPlatformOpenPlatformSubject(savedBaseline.platformOpenPlatformSubject);
    setRebindConditions(savedBaseline.rebindConditions);
    setMigrationMethods(savedBaseline.migrationMethods);
    setDataInheritance(savedBaseline.dataInheritance);
    setMigrationGracePeriodDays(savedBaseline.migrationGracePeriodDays);
    setMaxDailyRemindCount(savedBaseline.maxDailyRemindCount);
    setBroadcastScope(savedBaseline.broadcastScope);
    showToast('已撤销未保存修改，恢复至上次下发生效配置', 'info');
  };

  const handleResetDefaults = () => {
    const d = defaultGlobalMpControlConfig;
    setAllowDefaultPlatformMp(d.allowDefaultPlatformMp);
    setAllowCustomOfficialMp(d.allowCustomOfficialMp);
    setPlatformMpAppId(d.platformMpAppId || '');
    setPlatformOpenPlatformSubject(d.platformOpenPlatformSubject || '');
    setRebindConditions({ ...defaultRebindConditions });
    setMigrationMethods(d.migrationMethods);
    setDataInheritance(d.dataInheritance);
    setMigrationGracePeriodDays(d.migrationGracePeriodDays);
    setMaxDailyRemindCount(d.maxDailyRemindCount);
    showToast('已载入全平台推荐规则，请点击「保存并下发规则」确认生效', 'info');
  };

  const handleSaveAll = () => {
    if (!allowDefaultPlatformMp && !allowCustomOfficialMp) {
      showToast('至少需要保留一种公众号使用方式开启', 'warning');
      setActiveStage(1);
      return;
    }

    if (allowDefaultPlatformMp && !platformMpAppId.trim()) {
      showToast('请填写平台统配「点点速报」母版 AppID', 'warning');
      setActiveStage(1);
      return;
    }

    if (allowCustomOfficialMp && !platformOpenPlatformSubject.trim()) {
      showToast('允许自有公众号时，须配置微信开放平台主体（UnionID / 授权绑定前提）', 'warning');
      setActiveStage(1);
      return;
    }

    if (allowCustomOfficialMp && activeMethodsCount === 0) {
      showToast('已允许机构使用自有公众号，请至少启用一种人员换绑通道', 'warning');
      setActiveStage(3);
      return;
    }

    if (
      allowCustomOfficialMp &&
      migrationMethods.autoUnionId?.enabled &&
      rebindConditions.requireSameOpenPlatform &&
      !platformOpenPlatformSubject.trim()
    ) {
      showToast('UnionID 通道已开启，请补全开放平台主体', 'warning');
      setActiveStage(1);
      return;
    }

    setIsSaving(true);
    const now = new Date();
    const nowStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const newControl: GlobalMpControlConfig = {
      allowDefaultPlatformMp,
      allowCustomOfficialMp,
      defaultPreferredMode: effectivePreferredMode,
      platformMpAppId: platformMpAppId.trim(),
      platformOpenPlatformSubject: platformOpenPlatformSubject.trim(),
      rebindConditions: { ...rebindConditions, singleActiveCustomMp: true },
      migrationMethods: {
        ...migrationMethods,
        autoUnionId: {
          ...migrationMethods.autoUnionId,
          requireSameOpenPlatform:
            migrationMethods.autoUnionId?.enabled
              ? true
              : migrationMethods.autoUnionId?.requireSameOpenPlatform,
        },
      },
      dataInheritance,
      migrationGracePeriodDays,
      maxDailyRemindCount,
      updatedAt: nowStr,
      updatedBy: '超级系统管理员',
    };

    try {
      localStorage.setItem('mt_global_mp_control_config', JSON.stringify(newControl));
    } catch {
      // ignore
    }

    if (onSaveGlobalControl) {
      onSaveGlobalControl(newControl, mpConfig, migrationConfig);
    } else {
      if (onSaveMpDefaults && mpConfig) {
        onSaveMpDefaults({ ...mpConfig, mode: effectivePreferredMode });
      }
      if (onSaveMigrationDefaults && migrationConfig) {
        onSaveMigrationDefaults({
          ...migrationConfig,
          enableAutoUnionIdSync: Boolean(migrationMethods?.autoUnionId?.enabled),
          enableSmsNotify: Boolean(migrationMethods?.smsVerify?.enabled),
          enableWechatCardNotify: Boolean(migrationMethods?.wechatCard?.enabled),
        });
      }
    }

    setTimeout(() => {
      setIsSaving(false);
      setSavedTime(nowStr);
      setSavedBaseline(currentSnapshot);
      showToast(
        broadcastScope === 'all'
          ? '全平台公众号换绑三阶段规则已保存并下发至全网在运行机构'
          : '全平台规则已保存（仅对后续新建机构生效）',
        'success'
      );
    }, 400);
  };

  return (
    <div className="space-y-4 text-gray-800 pb-10" id="global-mp-rebinding-root">
      {/* 顶部：标题 + 保存 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#1890ff] flex items-center justify-center shrink-0">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-bold text-gray-900">全平台公众号接入与换绑规则</h2>
              {isDirty ? (
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  未保存变更（{dirtyDetails.length}项）
                </span>
              ) : savedTime ? (
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  已下发生效（{savedTime.slice(11, 16)}）
                </span>
              ) : null}
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5 truncate">
              按机构侧「录入 → 换绑 → 人员迁移」三阶段配置全网规则，贴合微信服务号授权与开放平台流程
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {isDirty && (
            <button
              type="button"
              onClick={handleRevertChanges}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              撤销
            </button>
          )}
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer"
          >
            恢复推荐
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
              isDirty
                ? 'bg-[#1890ff] hover:bg-[#096dd9] text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            {isSaving ? (
              <Save className="w-3.5 h-3.5 animate-spin" />
            ) : isDirty ? (
              <Send className="w-3.5 h-3.5" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            )}
            <span>{isSaving ? '下发中...' : isDirty ? '保存并下发规则' : '已保存'}</span>
          </button>
        </div>
      </div>

      {/* 与机构三步对照的阶段条 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-gray-600">
            <Info className="w-3.5 h-3.5 text-[#1890ff]" />
            <span>
              当前策略：
              <strong className="text-gray-900 ml-1">{policyStatusLabel}</strong>
              <span className="text-gray-400 mx-1.5">·</span>
              新建机构默认：
              <strong className="text-gray-900 ml-1">
                {effectivePreferredMode === 'platform_default' ? '点点速报（平台）' : '机构自有服务号'}
              </strong>
              <span className="text-gray-400 mx-1.5">·</span>
              迁移通路：
              <strong className="text-emerald-700 ml-1">{activeMethodsCount}/4</strong>
            </span>
          </div>
          <span className="text-[10px] text-gray-400">机构详情「公众号换绑」将按此规则执行</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:items-center">
          {STAGE_TABS.map((item, index) => {
            const active = activeStage === item.step;
            return (
              <React.Fragment key={item.step}>
                <button
                  type="button"
                  onClick={() => setActiveStage(item.step)}
                  className={`flex items-center gap-2.5 flex-1 min-w-0 rounded-lg px-3 py-2.5 border text-left transition-colors cursor-pointer ${
                    active
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-gray-50 border-gray-200/70 hover:border-gray-300'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      active ? 'bg-[#1890ff] text-white' : 'bg-white text-gray-400 border border-gray-200'
                    }`}
                  >
                    {item.step}
                  </div>
                  <div className="min-w-0">
                    <div className={`text-xs font-bold truncate ${active ? 'text-[#1890ff]' : 'text-gray-700'}`}>
                      {item.label}
                    </div>
                    <div className="text-[10px] text-gray-400 truncate">{item.institutionAlign}</div>
                  </div>
                </button>
                {index < STAGE_TABS.length - 1 && (
                  <div className="hidden sm:flex items-center px-1.5 text-gray-300">
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ========== 阶段 1：平台接入与授权 ========== */}
      {activeStage === 1 && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 gap-3 flex-wrap">
              <div>
                <h3 className="text-sm font-bold text-gray-900">1. 全平台公众号接入权限</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  决定机构能否录入自有服务号；对应机构引导第 1 步「录入公众号」的准入前提
                </p>
              </div>
              <div className="text-xs px-2.5 py-1 rounded-md bg-gray-50 border border-gray-200 text-gray-700 flex items-center gap-1.5">
                {allowDefaultPlatformMp && allowCustomOfficialMp ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <Unlock className="w-3.5 h-3.5" />
                    双模可选
                  </span>
                ) : !allowCustomOfficialMp ? (
                  <span className="text-[#1890ff] font-bold flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" />
                    统配管控
                  </span>
                ) : (
                  <span className="text-amber-600 font-bold flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    自备管控
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                  allowDefaultPlatformMp ? 'border-blue-200 bg-blue-50/20' : 'border-gray-200 bg-gray-50/50'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-900">使用机构默认的「点点速报」</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-[#1890ff] font-bold">
                      平台统配
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">免去机构自主认证对接，发稿与模板消息走平台母版服务号</p>
                </div>
                <button
                  type="button"
                  onClick={handleTogglePlatformMp}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                    allowDefaultPlatformMp ? 'bg-[#1890ff]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-2xs transform transition-transform ${
                      allowDefaultPlatformMp ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                  allowCustomOfficialMp ? 'border-emerald-200 bg-emerald-50/20' : 'border-gray-200 bg-gray-50/50'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-900">支持使用机构自有的公众号</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">
                      独立品牌
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">机构可录入自有认证服务号并执行换绑，开启人员迁移</p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleCustomMp}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                    allowCustomOfficialMp ? 'bg-emerald-600' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-2xs transform transition-transform ${
                      allowCustomOfficialMp ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-bold text-gray-900">2. 平台母版服务号与开放平台主体</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  对应微信公众平台「开发 → 基本配置」与开放平台「绑定公众号」；同主体是 UnionID 静默匹配的前提
                </p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-[#1890ff] font-bold border border-blue-200">
                母版全局生效
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  统一开发者 AppID
                  {allowDefaultPlatformMp && <span className="text-red-500 ml-0.5">*</span>}
                </label>
                <input
                  type="text"
                  value={platformMpAppId}
                  onChange={(e) => setPlatformMpAppId(e.target.value)}
                  disabled={!allowDefaultPlatformMp}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] disabled:bg-gray-50 disabled:text-gray-400"
                  placeholder="wx..."
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  微信开放平台 OpenPlatform 主体
                  {allowCustomOfficialMp && <span className="text-red-500 ml-0.5">*</span>}
                </label>
                <input
                  type="text"
                  value={platformOpenPlatformSubject}
                  onChange={(e) => setPlatformOpenPlatformSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                  placeholder="例如：点点速报融媒开放平台"
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-100 text-[11px] text-amber-900 leading-relaxed">
              微信侧实际流程：机构自有号须在开放平台绑定到同一主体后，用户关注新号才能拿到同一 UnionID；未同主体时只能走模板卡片 / 短信 / 扫码人工核身。
            </div>
          </div>
        </div>
      )}

      {/* ========== 阶段 2：换绑生效条件 ========== */}
      {activeStage === 2 && (
        <div className="space-y-4">
          {!allowCustomOfficialMp && (
            <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-600 flex items-start gap-2">
              <Lock className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <div>
                当前为「统配管控」，机构不可录入自有号，换绑生效条件暂备用。如需开放，请先回到阶段 1 开启「支持使用机构自有的公众号」。
                <button
                  type="button"
                  onClick={() => setActiveStage(1)}
                  className="ml-1 text-[#1890ff] font-bold cursor-pointer hover:underline"
                >
                  前往阶段 1
                </button>
              </div>
            </div>
          )}

          <div
            className={`bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-4 ${
              !allowCustomOfficialMp ? 'opacity-60 pointer-events-none' : ''
            }`}
          >
            <div className="pb-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">1. 执行换绑前的生效门槛</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">
                对齐机构侧「执行换绑 → 确认换绑生效」；满足条件后发稿与模板通知立即切到目标号
              </p>
            </div>

            <div className="space-y-2.5">
              {(
                [
                  {
                    key: 'requireServiceAccount' as const,
                    title: '必须是认证微信服务号',
                    desc: '订阅号不具备客服消息与多数模板能力，不能作为发稿/通知通道',
                  },
                  {
                    key: 'requireAuthorizedApi' as const,
                    title: '须完成开发者配置与接口授权连通',
                    desc: 'AppID/Secret、服务器 URL、Token、EncodingAESKey 校验通过后方可换绑',
                  },
                  {
                    key: 'requireSameOpenPlatform' as const,
                    title: '须挂载至平台同一开放平台主体',
                    desc: '与阶段 1 主体一致，方可启用 UnionID 静默匹配；否则仅允许主动通知通路',
                  },
                  {
                    key: 'allowRevertToPlatform' as const,
                    title: '允许「换绑回平台默认号」',
                    desc: '与机构日常态「切换公众号」抽屉中的回绑操作一致；关闭后机构不可退回点点速报',
                  },
                ] as const
              ).map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-4 p-3.5 rounded-xl border border-gray-200 hover:bg-gray-50/60"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-gray-900">{item.title}</div>
                    <p className="text-[11px] text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleRebindCondition(item.key)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                      rebindConditions[item.key] ? 'bg-[#1890ff]' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-2xs transform transition-transform ${
                        rebindConditions[item.key] ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              ))}

              <div className="flex items-center justify-between gap-4 p-3.5 rounded-xl border border-blue-100 bg-blue-50/40">
                <div className="min-w-0 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#1890ff] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-gray-900">同时仅允许 1 个自有号生效</div>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      与机构侧一致：新增号默认为「待换绑」，须显式执行换绑；当前生效号不可删除直至换绑至其他号
                    </p>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-1 rounded bg-white border border-blue-200 text-[#1890ff] font-bold shrink-0">
                  强制策略
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs">
            <h3 className="text-sm font-bold text-gray-900 mb-3">2. 与机构操作对照</h3>
            <ol className="space-y-2 text-xs text-gray-600">
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-[10px] font-bold shrink-0">
                  1
                </span>
                <span>机构录入自有服务号（AppID / 原始 ID 等）→ 状态为「待换绑」</span>
              </li>
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-[10px] font-bold shrink-0">
                  2
                </span>
                <span>
                  点击「执行换绑」并确认 → 满足上方门槛后通道立即切换，可发起人员迁移
                </span>
              </li>
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-[10px] font-bold shrink-0">
                  3
                </span>
                <span>
                  日常态可通过「切换公众号」换绑其他自有号
                  {rebindConditions.allowRevertToPlatform ? '，或换绑回平台默认号' : '（回绑平台已关闭）'}
                </span>
              </li>
            </ol>
          </div>
        </div>
      )}

      {/* ========== 阶段 3：人员迁移通路 ========== */}
      {activeStage === 3 && (
        <div className="space-y-4">
          {!allowCustomOfficialMp && (
            <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-600 flex items-start gap-2">
              <Users className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <div>
                未开放自有公众号时，人员跨号迁移不适用。机构侧亦会在未完成自有号换绑前锁定「发起全员换绑」。
              </div>
            </div>
          )}

          <div
            className={`bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-4 ${
              !allowCustomOfficialMp ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  1. 人员换绑迁移通路
                  <span className="text-xs text-gray-500 font-normal ml-2">
                    已开启 <strong className="text-emerald-600">{activeMethodsCount}</strong> / 4
                  </span>
                </h3>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  对齐机构「发起全员换绑 / 发送换绑 / 专属码」；优先无感，卡片与短信作主动触达，扫码兜底
                </p>
              </div>
            </div>

            <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
              {/* UnionID */}
              <div className="p-4 flex items-center justify-between gap-4 hover:bg-gray-50/60">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1890ff] flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-gray-900">UnionID 自动静默匹配</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-[#1890ff] font-bold">
                        首选 · 无感
                      </span>
                      {rebindConditions.requireSameOpenPlatform && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
                          依赖同开放平台主体
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      用户关注新号后，后台用 UnionID 自动对账 OpenID，无需重复登记（微信开放平台能力）
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleMigrationMethod('autoUnionId')}
                  disabled={!allowCustomOfficialMp}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 disabled:opacity-40 ${
                    migrationMethods?.autoUnionId?.enabled ? 'bg-[#1890ff]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-2xs transform transition-transform ${
                      migrationMethods?.autoUnionId?.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* 服务通知卡片 */}
              <div className="p-4 flex items-center justify-between gap-4 hover:bg-gray-50/60 flex-wrap sm:flex-nowrap">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-gray-900">微信服务通知卡片推送</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">
                        原号触达
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      由<strong>原公众号</strong>向在册人员推送迁移模板/订阅通知，点击后引导关注新号完成对账（受微信模板频次限制）
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-auto">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span>每日频次</span>
                    <select
                      value={migrationMethods?.wechatCard?.pushFrequencyLimit ?? 1}
                      onChange={(e) =>
                        handleUpdateMethodParam('wechatCard', 'pushFrequencyLimit', Number(e.target.value))
                      }
                      disabled={!allowCustomOfficialMp}
                      className="border border-gray-200 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:border-[#1890ff]"
                    >
                      <option value={1}>1 次/天（推荐）</option>
                      <option value={2}>2 次/天</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleMigrationMethod('wechatCard')}
                    disabled={!allowCustomOfficialMp}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 disabled:opacity-40 ${
                      migrationMethods?.wechatCard?.enabled ? 'bg-emerald-600' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-2xs transform transition-transform ${
                        migrationMethods?.wechatCard?.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* 短信 */}
              <div className="p-4 flex items-center justify-between gap-4 hover:bg-gray-50/60 flex-wrap sm:flex-nowrap">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-gray-900">短信验证码安全换绑</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-bold">
                        离线兜底
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      覆盖已取关原号、换机或微信离线人员；短链 + 验证码核身后绑定新号 OpenID
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-auto">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span>验证码时效</span>
                    <select
                      value={migrationMethods?.smsVerify?.codeExpireMinutes ?? 10}
                      onChange={(e) =>
                        handleUpdateMethodParam('smsVerify', 'codeExpireMinutes', Number(e.target.value))
                      }
                      disabled={!allowCustomOfficialMp}
                      className="border border-gray-200 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:border-[#1890ff]"
                    >
                      <option value={10}>10 分钟</option>
                      <option value={30}>30 分钟</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleMigrationMethod('smsVerify')}
                    disabled={!allowCustomOfficialMp}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 disabled:opacity-40 ${
                      migrationMethods?.smsVerify?.enabled ? 'bg-amber-600' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-2xs transform transition-transform ${
                        migrationMethods?.smsVerify?.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* 工作台扫码 */}
              <div className="p-4 flex items-center justify-between gap-4 hover:bg-gray-50/60">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 mt-0.5">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-gray-900">工作台登录扫码核身</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 font-bold">
                        采编后台
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      登录 PC/移动端采编后台时弹窗引导扫码（对应机构「专属换绑码」），完成新号权限绑定
                    </p>
                    {migrationMethods?.workspaceQr?.enabled && (
                      <label className="mt-2 flex items-center gap-2 text-[11px] text-gray-600 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={Boolean(migrationMethods?.workspaceQr?.forceOnLogin)}
                          onChange={() =>
                            handleUpdateMethodParam(
                              'workspaceQr',
                              'forceOnLogin',
                              !migrationMethods?.workspaceQr?.forceOnLogin
                            )
                          }
                          className="rounded text-[#1890ff] focus:ring-0"
                        />
                        登录时强制完成换绑后方可进入工作台
                      </label>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleMigrationMethod('workspaceQr')}
                  disabled={!allowCustomOfficialMp}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 disabled:opacity-40 ${
                    migrationMethods?.workspaceQr?.enabled ? 'bg-violet-600' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-2xs transform transition-transform ${
                      migrationMethods?.workspaceQr?.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div
            className={`bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-4 ${
              !allowCustomOfficialMp ? 'opacity-60 pointer-events-none' : ''
            }`}
          >
            <div className="pb-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">2. 数据无损继承与宽限保护期</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">
                与机构引导说明一致：扫码关注完成后稿件、审签、积分、角色可无损结转
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50/80 border border-gray-100 text-xs">
                  <div>
                    <span className="font-bold text-gray-800 block">迁移过渡宽限期</span>
                    <span className="text-[11px] text-gray-500">期内原号可只读接收，防止断档</span>
                  </div>
                  <select
                    value={migrationGracePeriodDays}
                    onChange={(e) => setMigrationGracePeriodDays(Number(e.target.value))}
                    className="border border-gray-300 rounded-md px-2.5 py-1 text-xs bg-white font-bold focus:outline-none focus:border-[#1890ff]"
                  >
                    <option value={15}>15 天</option>
                    <option value={30}>30 天（推荐）</option>
                    <option value={60}>60 天</option>
                    <option value={90}>90 天</option>
                  </select>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50/80 border border-gray-100 text-xs">
                  <div>
                    <span className="font-bold text-gray-800 block">未换绑人员每日提醒上限</span>
                    <span className="text-[11px] text-gray-500">与微信模板防打扰策略对齐</span>
                  </div>
                  <select
                    value={maxDailyRemindCount}
                    onChange={(e) => setMaxDailyRemindCount(Number(e.target.value))}
                    className="border border-gray-300 rounded-md px-2.5 py-1 text-xs bg-white font-bold focus:outline-none focus:border-[#1890ff]"
                  >
                    <option value={1}>1 次/天（推荐）</option>
                    <option value={2}>2 次/天</option>
                    <option value={3}>3 次/天</option>
                  </select>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-gray-50/80 border border-gray-100 space-y-2.5 text-xs">
                <span className="font-bold text-gray-800 block">换绑人员数据结转范围</span>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { key: 'inheritDrafts' as const, label: '历史稿件与统计' },
                      { key: 'inheritAuditLogs' as const, label: '审签留痕与评语' },
                      { key: 'inheritPoints' as const, label: '积分排名与绩效' },
                      { key: 'inheritRoles' as const, label: '部门权限与角色' },
                    ] as const
                  ).map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center gap-2 p-2 rounded bg-white border border-gray-200 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={dataInheritance[item.key]}
                        onChange={() => handleToggleInheritance(item.key)}
                        className="rounded text-[#1890ff] focus:ring-0"
                      />
                      <span className="text-gray-700 font-medium">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 下发范围 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="font-bold text-gray-800">下发生效策略范围：</span>
            <label className="flex items-center gap-1.5 cursor-pointer select-none px-2.5 py-1 rounded-md border border-gray-200 hover:bg-gray-50">
              <input
                type="radio"
                name="bottomBroadcastScope"
                value="all"
                checked={broadcastScope === 'all'}
                onChange={() => setBroadcastScope('all')}
                className="accent-[#1890ff]"
              />
              <span className="text-gray-900 font-bold">实时应用至全网在运行机构</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer select-none px-2.5 py-1 rounded-md border border-gray-200 hover:bg-gray-50">
              <input
                type="radio"
                name="bottomBroadcastScope"
                value="new_only"
                checked={broadcastScope === 'new_only'}
                onChange={() => setBroadcastScope('new_only')}
                className="accent-[#1890ff]"
              />
              <span className="text-gray-600">仅对后续新建机构生效</span>
            </label>
          </div>
          <p className="text-[11px] text-gray-400">
            保存后更新全局母版策略；机构详情「公众号换绑」按三阶段规则校验准入、换绑门槛与迁移通路
          </p>
        </div>
      </div>
    </div>
  );
};
