import React from 'react';
import { InstitutionBusinessRulesTab } from './InstitutionBusinessRulesTab';
import { InstitutionBusinessRules } from '../types';
import { useGlobalConfigViewModel } from '../viewmodels/useGlobalConfigViewModel';

interface GlobalConfigProps {
  onShowToast?: (msg: string, type?: 'success' | 'warning' | 'info') => void;
}

export const GlobalConfig: React.FC<GlobalConfigProps> = ({ onShowToast }) => {
  const { state, actions } = useGlobalConfigViewModel(onShowToast);
  const {
    activeGlobalTab,
    internalToast,
    noticeDays,
    maxTrialDays,
    autoDisableExpired,
    savedSuccess,
  } = state;
  const {
    setActiveGlobalTab,
    setNoticeDays,
    setMaxTrialDays,
    setAutoDisableExpired,
    handleSaveSystemPolicy,
    handleSaveGlobalRules,
    showToast,
  } = actions;

  return (
    <div className="p-6 flex-1 flex flex-col gap-4 min-w-[1024px] w-full">
      {internalToast && (
        <div
          className={`fixed top-4 right-4 z-50 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2 text-sm transition-all ${
            internalToast.type === 'success'
              ? 'bg-[#52c41a]'
              : internalToast.type === 'warning'
                ? 'bg-[#faad14]'
                : 'bg-[#1890ff]'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {internalToast.type === 'success'
              ? 'check_circle'
              : internalToast.type === 'warning'
                ? 'warning'
                : 'info'}
          </span>
          {internalToast.message}
        </div>
      )}

      <div className="bg-white rounded border border-gray-100 p-4 shadow-[0_2px_8px_0_rgba(0,0,0,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center text-[#666666]">
            <span className="material-symbols-outlined text-[20px] mr-2 text-[#1890ff]">
              tune
            </span>
            <span className="text-[16px] font-medium text-[#333333]">
              平台全局配置中心
            </span>
            <span className="text-xs text-[#888888] ml-3 hidden md:inline-block">
              集中管控全平台业务规则母版（模板、打分、字典、考核、工作流）及全局运维策略
            </span>
          </div>

          <div className="flex items-center p-1 bg-gray-100/90 rounded border border-gray-200/80 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveGlobalTab('business_rules')}
              className={`px-4 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeGlobalTab === 'business_rules'
                  ? 'bg-white text-[#1890ff] shadow-sm font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">public</span>
              <span>全平台业务规则总库</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveGlobalTab('system_policy')}
              className={`px-4 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeGlobalTab === 'system_policy'
                  ? 'bg-white text-[#1890ff] shadow-sm font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                settings_system_daydream
              </span>
              <span>系统运维与策略</span>
            </button>
          </div>
        </div>
      </div>

      {activeGlobalTab === 'business_rules' && (
        <div className="w-full">
          <InstitutionBusinessRulesTab
            isGlobalScope={true}
            onSaveRules={handleSaveGlobalRules}
            showToast={showToast}
          />
        </div>
      )}

      {activeGlobalTab === 'system_policy' && (
        <div className="bg-white rounded border border-gray-100 p-6 shadow-[0_2px_8px_0_rgba(0,0,0,0.04)]">
          <div className="flex items-center pb-4 mb-6 border-b border-gray-100">
            <span className="material-symbols-outlined text-[20px] text-[#1890ff] mr-2">
              admin_panel_settings
            </span>
            <div>
              <h2 className="text-base font-bold text-gray-900">平台系统运维参数与全局策略</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                配置机构服务生命周期与到期自动关停策略
              </p>
            </div>
          </div>

          {savedSuccess && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-xs flex items-center">
              <span className="material-symbols-outlined mr-2 text-[18px]">check_circle</span>
              全局策略已成功保存更新！
            </div>
          )}

          <form onSubmit={handleSaveSystemPolicy} className="space-y-6 max-w-3xl">
            <div className="grid grid-cols-3 gap-4 items-center">
              <label className="text-xs font-semibold text-gray-700">到期预警天数 (天)</label>
              <div className="col-span-2">
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={noticeDays}
                  onChange={(e) => setNoticeDays(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1890ff] bg-white"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  当机构服务到期剩余天数小于或等于该值时，系统会在首页及运维面板提醒。
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 items-center">
              <label className="text-xs font-semibold text-gray-700">试用机构默认天数 (天)</label>
              <div className="col-span-2">
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={maxTrialDays}
                  onChange={(e) => setMaxTrialDays(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1890ff] bg-white"
                />
                <p className="text-[11px] text-gray-400 mt-1">新建试用机构时自动初始化的服务天数。</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 items-center">
              <label className="text-xs font-semibold text-gray-700">到期自动关停机构</label>
              <div className="col-span-2 flex items-center">
                <button
                  type="button"
                  onClick={() => setAutoDisableExpired(!autoDisableExpired)}
                  className={`relative inline-flex h-[22px] w-[46px] items-center rounded-full transition-colors focus:outline-none cursor-pointer select-none px-[3px] ${
                    autoDisableExpired ? 'bg-[#1890ff]' : 'bg-[#bfbfbf]'
                  }`}
                >
                  <span className={`text-[11px] font-normal text-white leading-none transition-all duration-200 ${autoDisableExpired ? 'pl-1.5 mr-auto' : 'pr-1.5 ml-auto'}`}>
                    {autoDisableExpired ? '启' : '停'}
                  </span>
                  <span className={`absolute top-[2.5px] h-[17px] w-[17px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-all duration-200 ${autoDisableExpired ? 'right-[2.5px]' : 'left-[2.5px]'}`} />
                </button>
                <span className="text-xs text-gray-500 ml-3">
                  {autoDisableExpired ? '已开启 (服务到期后自动停用接口与服务)' : '已关闭'}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                className="bg-[#1890ff] text-white px-6 py-2 rounded-lg text-xs font-semibold hover:bg-blue-600 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[17px]">save</span>
                <span>保存策略配置</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
