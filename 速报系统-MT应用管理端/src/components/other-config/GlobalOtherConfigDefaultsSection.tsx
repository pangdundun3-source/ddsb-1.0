import React, { useMemo, useState } from 'react';
import {
  MpMigrationConfig,
  WechatMpConfig,
  WechatMpMode,
  GlobalMpControlConfig,
  GlobalMpRebindConditions,
} from '../../types';
import {
  Building2,
  Check,
  CheckCircle2,
  MessageSquare,
  RotateCcw,
  Save,
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
  platformMpName: '点点速报',
  platformMpOriginalId: 'gh_8f3a2c71d9e0',
  platformMpAppSecret: '3f9c2e7a1b8d4c6e9f0a2b4c6d8e0f1a',
  platformMpServerUrl: 'https://api.diandiansubao.com/wechat/callback',
  platformMpToken: 'ddsbToken2026',
  platformMpEncodingAESKey: 'Q7m2Xk9Lp4Vb8Nc1Zr6Ty3Hw5Js0Ga2Df7Ke9Ub4Mi1',
  platformMpEncryptMode: 'safe',
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

const MODE_OPTIONS: {
  value: WechatMpMode;
  title: string;
  tag: string;
  desc: string;
  icon: React.ReactNode;
  tone: string;
}[] = [
  {
    value: 'platform_default',
    title: '使用平台自有公众号',
    tag: '平台统一',
    desc: '全平台机构统一通过平台自有公众号接入，发稿通知、模板消息与人员关注均走该公众号',
    icon: <MessageSquare className="w-4.5 h-4.5" />,
    tone: 'blue',
  },
  {
    value: 'custom_official',
    title: '使用机构专属公众号',
    tag: '机构独立',
    desc: '各机构在机构详情中接入自己的认证服务号，人员关注与消息推送走机构专属公众号',
    icon: <Building2 className="w-4.5 h-4.5" />,
    tone: 'emerald',
  },
];

function formatNow() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(
    now.getMinutes()
  )}:${pad(now.getSeconds())}`;
}

function resolveModes(control: GlobalMpControlConfig): WechatMpMode[] {
  return control.allowCustomOfficialMp ? ['platform_default', 'custom_official'] : ['platform_default'];
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

export const GlobalOtherConfigDefaultsSection: React.FC<GlobalOtherConfigDefaultsSectionProps> = ({
  mpConfig,
  migrationConfig,
  globalMpControl,
  onSaveMpDefaults,
  onSaveGlobalControl,
  showToast,
}) => {
  const initialControl: GlobalMpControlConfig = useMemo(() => {
    try {
      const saved = localStorage.getItem('mt_global_mp_control_config');
      if (saved) return { ...defaultGlobalMpControlConfig, ...JSON.parse(saved) };
    } catch {
      // ignore
    }
    return { ...defaultGlobalMpControlConfig, ...(globalMpControl || {}) };
  }, [globalMpControl]);

  const [modes, setModes] = useState<WechatMpMode[]>(() => resolveModes(initialControl));
  const [savedModes, setSavedModes] = useState<WechatMpMode[]>(() => resolveModes(initialControl));
  const [savedTime, setSavedTime] = useState<string | null>(initialControl.updatedAt || null);
  const [isSaving, setIsSaving] = useState(false);

  const isDirty = useMemo(() => JSON.stringify(modes) !== JSON.stringify(savedModes), [modes, savedModes]);

  const allowPlatform = modes.includes('platform_default');
  const allowCustom = modes.includes('custom_official');
  const preferredMode: WechatMpMode = allowPlatform ? 'platform_default' : 'custom_official';

  const toggleMode = (value: WechatMpMode) => {
    if (value === 'platform_default') {
      showToast('平台自有公众号为必选项，不可取消', 'info');
      return;
    }
    if (modes.includes(value)) {
      setModes(modes.filter((item) => item !== value));
      return;
    }
    setModes(MODE_OPTIONS.map((option) => option.value).filter((item) => item === value || modes.includes(item)));
  };

  const handleRevert = () => {
    setModes(savedModes);
    showToast('已撤销未保存修改', 'info');
  };

  const handleSave = () => {
    setIsSaving(true);
    const nowStr = formatNow();
    const newControl: GlobalMpControlConfig = {
      ...initialControl,
      allowDefaultPlatformMp: allowPlatform,
      allowCustomOfficialMp: allowCustom,
      defaultPreferredMode: preferredMode,
      updatedAt: nowStr,
      updatedBy: '超级系统管理员',
    };

    try {
      localStorage.setItem('mt_global_mp_control_config', JSON.stringify(newControl));
    } catch {
      // ignore
    }

    if (onSaveGlobalControl) {
      onSaveGlobalControl(
        newControl,
        mpConfig ? { ...mpConfig, mode: preferredMode } : undefined,
        migrationConfig
      );
    } else if (onSaveMpDefaults && mpConfig) {
      onSaveMpDefaults({ ...mpConfig, mode: preferredMode });
    }

    setTimeout(() => {
      setIsSaving(false);
      setSavedTime(nowStr);
      setSavedModes(modes);
      showToast('公众号设置已保存并对全平台生效', 'success');
    }, 400);
  };

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#1890ff] focus:border-[#1890ff]';

  return (
    <div className="space-y-4 text-gray-800 pb-10" id="global-mp-settings-root">
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#1890ff] flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-bold text-gray-900">公众号设置</h2>
              {isDirty ? (
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  未保存变更
                </span>
              ) : savedTime ? (
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  已生效（{savedTime}）
                </span>
              ) : null}
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">
              全平台机构统一使用平台自有公众号
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isDirty && (
            <button
              type="button"
              onClick={handleRevert}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              撤销
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !isDirty}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed ${
              isDirty
                ? 'bg-[#1890ff] hover:bg-[#096dd9] text-white shadow-md'
                : 'bg-white text-gray-500 border border-gray-300'
            }`}
          >
            {isSaving ? (
              <Save className="w-3.5 h-3.5 animate-spin" />
            ) : isDirty ? (
              <Save className="w-3.5 h-3.5" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            )}
            <span>{isSaving ? '保存中...' : isDirty ? '保存设置' : '已保存'}</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {MODE_OPTIONS.filter((option) => option.value === 'platform_default').map((option) => {
            const active = modes.includes(option.value);
            const activeStyle =
              option.tone === 'blue'
                ? 'border-[#1890ff] bg-blue-50/40 ring-1 ring-[#1890ff]/30'
                : 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500/30';
            const iconStyle =
              option.tone === 'blue' ? 'bg-blue-100 text-[#1890ff]' : 'bg-emerald-100 text-emerald-700';
            return (
              <button
                key={option.value}
                type="button"
                role="checkbox"
                aria-checked={active}
                aria-disabled={option.value === 'platform_default'}
                onClick={() => toggleMode(option.value)}
                className={`text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${
                  option.value === 'platform_default' ? 'cursor-not-allowed' : 'cursor-pointer'
                } ${
                  active ? activeStyle : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <span
                  className={`mt-0.5 w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center ${
                    active
                      ? option.tone === 'blue'
                        ? 'border-[#1890ff] bg-[#1890ff]'
                        : 'border-emerald-500 bg-emerald-500'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  {active && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconStyle}`}>
                      {option.icon}
                    </span>
                    <span className="text-xs font-bold text-gray-900">{option.title}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${iconStyle}`}>{option.tag}</span>
                    {option.value === 'platform_default' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-red-50 text-red-600 border border-red-200">
                        必选
                      </span>
                    )}
                  </span>
                  <span className="block text-[11px] text-gray-500 mt-2 leading-relaxed">{option.desc}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
