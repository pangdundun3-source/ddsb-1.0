import React from 'react';
import { InstitutionBusinessRulesTab } from './InstitutionBusinessRulesTab';
import { useGlobalConfigViewModel } from '../viewmodels/useGlobalConfigViewModel';

interface GlobalConfigProps {
  onShowToast?: (msg: string, type?: 'success' | 'warning' | 'info') => void;
}

export const GlobalConfig: React.FC<GlobalConfigProps> = ({ onShowToast }) => {
  const { state, actions } = useGlobalConfigViewModel(onShowToast);
  const { internalToast } = state;
  const { handleSaveGlobalRules, showToast } = actions;

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
        <div className="flex items-center text-[#666666]">
          <span className="material-symbols-outlined text-[20px] mr-2 text-[#1890ff]">tune</span>
          <span className="text-[16px] font-medium text-[#333333]">平台全局配置中心</span>
          <span className="text-xs text-[#888888] ml-3 hidden md:inline-block">
            集中管控全平台业务规则母版（模板、打分、字典、考核、工作流）
          </span>
        </div>
      </div>

      <div className="w-full">
        <InstitutionBusinessRulesTab
          isGlobalScope={true}
          onSaveRules={handleSaveGlobalRules}
          showToast={showToast}
        />
      </div>
    </div>
  );
};
