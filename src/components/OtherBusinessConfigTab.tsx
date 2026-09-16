import React, { useEffect, useState } from 'react';
import {
  Institution,
  InstitutionBusinessRules,
  OtherBusinessConfig,
} from '../types';
import { useOtherBusinessConfigViewModel } from '../viewmodels/useOtherBusinessConfigViewModel';
import {
  WechatMpConfigSection,
  defaultWechatMpConfig,
} from './other-config/WechatMpConfigSection';
import {
  MpPersonnelMigrationSection,
  mockMigrationPersonnel,
  mockMigrationTasks,
} from './other-config/MpPersonnelMigrationSection';
import { defaultQuotaHistory } from './other-config/QrQuotaSection';
import { defaultGlobalMpControlConfig } from './other-config/GlobalOtherConfigDefaultsSection';

export const defaultOtherBusinessConfig: OtherBusinessConfig = {
  qrUsage: {
    totalLimit: 50,
    usedCount: 18,
    warningThreshold: 10,
    allowSelfApply: true,
    historyRecords: defaultQuotaHistory,
  },
  wechatMp: defaultWechatMpConfig,
  migration: {
    enableAutoUnionIdSync: true,
    enableSmsNotify: true,
    enableWechatCardNotify: true,
    personnelList: mockMigrationPersonnel,
    taskHistory: mockMigrationTasks,
  },
  globalMpControl: defaultGlobalMpControlConfig,
};

type GuideStep = 1 | 2 | 3;

const GUIDE_STEPS: { step: GuideStep; label: string; hint: string }[] = [
  { step: 1, label: '录入公众号', hint: '仅保存参数，尚未切换通道' },
  { step: 2, label: '切换发稿通道', hint: '执行通道换绑后正式生效' },
  { step: 3, label: '人员换绑', hint: '通知采编关注新号并继承资产' },
];

interface OtherBusinessConfigTabProps {
  institution?: Institution | null;
  rules: InstitutionBusinessRules;
  setRules: React.Dispatch<React.SetStateAction<InstitutionBusinessRules>>;
  onSaveRules: (rules: InstitutionBusinessRules) => void;
  showToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
}

export const OtherBusinessConfigTab: React.FC<OtherBusinessConfigTabProps> = ({
  institution,
  rules,
  setRules,
  onSaveRules,
  showToast,
}) => {
  const { state, actions } = useOtherBusinessConfigViewModel({
    institution,
    rules,
    setRules,
    onSaveRules,
    defaultOtherBusinessConfig,
    onShowToast: showToast,
  });
  const { otherConfig } = state;
  const { handleUpdateWechatMp, handleUpdateMigration } = actions;

  const isCustomBound =
    otherConfig.wechatMp?.mode === 'custom_official' &&
    Boolean(otherConfig.wechatMp?.isCustomBound);

  // 未完成自有号换绑时，实际发稿通道仍为平台默认号
  const currentMpName = isCustomBound
    ? otherConfig.wechatMp?.mpName || '随州融媒发布 (官方服务号)'
    : '点点速报 (平台统配)';

  const sourceMpName =
    otherConfig.wechatMp?.sourceMpName || '点点速报 (平台统配)';
  const lastBoundTime = otherConfig.wechatMp?.lastBoundTime;

  const [guideStep, setGuideStep] = useState<GuideStep>(1);
  const [showSwitchDrawer, setShowSwitchDrawer] = useState(false);
  const [highlightMigrate, setHighlightMigrate] = useState(false);
  const [showGuideHelp, setShowGuideHelp] = useState(false);

  // 预览热更新后保持停留在「机构详情 → 公众号换绑」
  useEffect(() => {
    try {
      localStorage.setItem('admin_active_tab', 'institutions');
      localStorage.setItem('admin_selected_inst_id', String(institution?.id || 1));
      localStorage.setItem('admin_inst_detail_active_tab', 'business_rules');
      localStorage.setItem('admin_business_rule_active_subnav', 'other');
      localStorage.setItem('admin_is_editing_inst', 'true');
    } catch {
      // ignore storage failures
    }
  }, [institution?.id]);

  // 从已换绑切回未换绑时，重置引导步
  useEffect(() => {
    if (!isCustomBound) {
      setGuideStep(1);
      setShowSwitchDrawer(false);
      setHighlightMigrate(false);
    }
  }, [isCustomBound]);

  const handleBindStarted = () => setGuideStep(2);

  const handleBindCancelled = () => setGuideStep(1);

  const handleBindSucceeded = (boundToCustom: boolean) => {
    if (boundToCustom) {
      setGuideStep(3);
      setHighlightMigrate(true);
      setShowSwitchDrawer(false);
      window.setTimeout(() => setHighlightMigrate(false), 4000);
    } else {
      setGuideStep(1);
    }
  };

  // —— 引导态（未完成自有号换绑）——
  if (!isCustomBound) {
    return (
      <div className="space-y-4 text-gray-800">
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-2xs p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#1890ff]">
                  sync_alt
                </span>
                公众号换绑引导
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                当前发稿通道【{currentMpName}】。先完成「通道换绑」至自有号，再向采编发起「人员换绑」。
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowGuideHelp((v) => !v)}
              className="text-xs text-gray-500 hover:text-[#1890ff] flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-[15px]">help_outline</span>
              {showGuideHelp ? '收起指引' : '查看指引'}
            </button>
          </div>

          {showGuideHelp && (
            <div className="mb-4 p-3 rounded-lg bg-blue-50/70 border border-blue-100 text-[11px] text-gray-600 leading-relaxed space-y-1">
              <p>
                <strong>第 1 步 · 录入：</strong>仅保存自有服务号参数，不会改变发稿通道。
              </p>
              <p>
                <strong>第 2 步 · 通道换绑：</strong>点击「切换通道」确认后，发稿与模板消息立即切到新号。
              </p>
              <p>
                <strong>第 3 步 · 人员换绑：</strong>向采编发送换绑通知，扫码关注即可继承稿件与积分。
              </p>
            </div>
          )}

          {/* 步骤条 */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:items-center">
            {GUIDE_STEPS.map((item, index) => {
              const active = guideStep === item.step;
              const done = guideStep > item.step;
              return (
                <React.Fragment key={item.step}>
                  <div
                    className={`flex items-center gap-2.5 flex-1 min-w-0 rounded-lg px-3 py-2.5 border transition-colors ${
                      active
                        ? 'bg-blue-50 border-blue-200'
                        : done
                          ? 'bg-emerald-50/60 border-emerald-200/70'
                          : 'bg-gray-50 border-gray-200/70'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        active
                          ? 'bg-[#1890ff] text-white'
                          : done
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white text-gray-400 border border-gray-200'
                      }`}
                    >
                      {done ? (
                        <span className="material-symbols-outlined text-[16px]">check</span>
                      ) : (
                        item.step
                      )}
                    </div>
                    <div className="min-w-0">
                      <div
                        className={`text-xs font-bold truncate ${
                          active ? 'text-[#1890ff]' : done ? 'text-emerald-800' : 'text-gray-600'
                        }`}
                      >
                        {item.label}
                      </div>
                      <div className="text-[10px] text-gray-400 truncate">{item.hint}</div>
                    </div>
                  </div>
                  {index < GUIDE_STEPS.length - 1 && (
                    <div className="hidden sm:flex items-center px-1.5 text-gray-300">
                      <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {guideStep <= 2 && (
          <WechatMpConfigSection
            institutionName={institution?.name || '随州市网信中心'}
            config={otherConfig.wechatMp || defaultWechatMpConfig}
            onChangeConfig={handleUpdateWechatMp}
            showToast={showToast}
            layout="guide"
            onBindStarted={handleBindStarted}
            onBindCancelled={handleBindCancelled}
            onBindSucceeded={handleBindSucceeded}
          />
        )}

        {guideStep === 3 && (
          <MpPersonnelMigrationSection
            institutionName={institution?.name || '随州市网信中心'}
            mpConfig={otherConfig.wechatMp}
            migrationConfig={otherConfig.migration}
            onChangeMigration={handleUpdateMigration}
            showToast={showToast}
            layout="wizard"
            highlightMigrate
            onNavigateToMpConfig={() => setGuideStep(1)}
          />
        )}
      </div>
    );
  }

  // —— 日常态（已完成自有号换绑）——
  return (
    <div className="space-y-4 text-gray-800">
      {/* 顶栏总览：当前发稿通道 + 切换公众号入口 */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-2xs px-4 py-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-[#07c160] text-white flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">chat</span>
          </div>
          <div className="min-w-0">
            <div className="text-[11px] text-gray-500 font-medium mb-0.5">当前发稿通道</div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-bold text-gray-900 truncate">{currentMpName}</h2>
              <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                生效中
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              通道换绑：{sourceMpName}
              <span className="mx-1 text-gray-300">→</span>
              {currentMpName}
              {lastBoundTime ? ` · ${lastBoundTime}` : ''}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:items-end gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setShowSwitchDrawer(true)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white text-gray-800 hover:bg-gray-50 border border-gray-300 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
            切换公众号
          </button>
          <span className="text-[10px] text-gray-400">录入或通道换绑 · 不影响人员名单</span>
        </div>
      </div>

      <MpPersonnelMigrationSection
        institutionName={institution?.name || '随州市网信中心'}
        mpConfig={otherConfig.wechatMp}
        migrationConfig={otherConfig.migration}
        onChangeMigration={handleUpdateMigration}
        showToast={showToast}
        layout="daily"
        highlightMigrate={highlightMigrate}
        onNavigateToMpConfig={() => setShowSwitchDrawer(true)}
      />

      {/* 切换公众号抽屉 */}
      {showSwitchDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 animate-fade-in">
          <button
            type="button"
            aria-label="关闭抽屉"
            className="flex-1 cursor-pointer border-0 bg-transparent"
            onClick={() => setShowSwitchDrawer(false)}
          />
          <div className="w-full max-w-xl h-full bg-white shadow-2xl border-l border-gray-200 flex flex-col animate-scale-up">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 shrink-0">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-[#1890ff]">
                    sync_alt
                  </span>
                  切换公众号（通道换绑）
                </h3>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  切换发稿通道至其他自有号；回退平台默认号将关闭人员换绑
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSwitchDrawer(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <WechatMpConfigSection
                institutionName={institution?.name || '随州市网信中心'}
                config={otherConfig.wechatMp || defaultWechatMpConfig}
                onChangeConfig={handleUpdateWechatMp}
                showToast={showToast}
                layout="drawer"
                onBindSucceeded={(boundToCustom) => {
                  handleBindSucceeded(boundToCustom);
                  if (boundToCustom) {
                    setShowSwitchDrawer(false);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
