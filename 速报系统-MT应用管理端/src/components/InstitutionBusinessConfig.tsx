import React, { useEffect, useMemo, useState } from 'react';
import type { Institution } from '../types';
import { InstitutionBusinessRulesTab } from './InstitutionBusinessRulesTab';

const SELECTED_STORAGE_KEY = 'mt_org_config_selected_institution';
const STATUS_TAB_STORAGE_KEY = 'mt_org_config_status_tab';

type StatusTab = 'opened' | 'expired';

const STATUS_TABS: Array<{ id: StatusTab; label: string }> = [
  { id: 'opened', label: '已开通' },
  { id: 'expired', label: '已到期' },
];

const isExpired = (institution: Institution) => institution.daysRemaining <= 0;

const readStatusTab = (): StatusTab => {
  try {
    return localStorage.getItem(STATUS_TAB_STORAGE_KEY) === 'expired' ? 'expired' : 'opened';
  } catch {
    return 'opened';
  }
};

const readSelectedId = () => {
  try {
    const saved = Number(localStorage.getItem(SELECTED_STORAGE_KEY));
    return Number.isFinite(saved) && saved > 0 ? saved : null;
  } catch {
    return null;
  }
};

interface InstitutionBusinessConfigProps {
  institutions: Institution[];
  onSave: (data: Partial<Institution>) => void;
  onShowToast?: (msg: string) => void;
}

export const InstitutionBusinessConfig: React.FC<InstitutionBusinessConfigProps> = ({
  institutions,
  onSave,
  onShowToast,
}) => {
  const [keyword, setKeyword] = useState('');
  const [statusTab, setStatusTab] = useState<StatusTab>(readStatusTab);
  const [selectedId, setSelectedId] = useState<number | null>(() => readSelectedId() ?? institutions[0]?.id ?? null);

  const statusCounts = useMemo(() => {
    const expired = institutions.filter(isExpired).length;
    return { opened: institutions.length - expired, expired };
  }, [institutions]);

  const visibleInstitutions = useMemo(() => {
    const kw = keyword.trim();
    return institutions
      .filter((item) => isExpired(item) === (statusTab === 'expired'))
      .filter((item) => !kw || item.name.includes(kw));
  }, [institutions, keyword, statusTab]);

  const changeStatusTab = (tab: StatusTab) => {
    setStatusTab(tab);
    const selected = institutions.find((item) => item.id === selectedId);
    if (!selected || isExpired(selected) !== (tab === 'expired')) {
      setSelectedId(institutions.find((item) => isExpired(item) === (tab === 'expired'))?.id ?? null);
    }
    try {
      localStorage.setItem(STATUS_TAB_STORAGE_KEY, tab);
    } catch {
      // Local storage can be disabled in private or restricted browser contexts.
    }
  };
  const selectedInstitution = institutions.find((item) => item.id === selectedId) ?? null;

  useEffect(() => {
    if (selectedId === null) return;
    try {
      localStorage.setItem(SELECTED_STORAGE_KEY, String(selectedId));
    } catch {
      // Local storage can be disabled in private or restricted browser contexts.
    }
  }, [selectedId]);

  return (
    <div className="p-6 flex-1 flex flex-col gap-4 min-w-[1024px] w-full">
      <div className="bg-white rounded border border-gray-100 p-4 shadow-[0_2px_8px_0_rgba(0,0,0,0.04)]">
        <div className="flex items-center text-[#666666]">
          <span className="material-symbols-outlined text-[20px] mr-2 text-[#1890ff]">domain</span>
          <span className="text-[16px] font-medium text-[#333333]">机构业务配置</span>
          <span className="text-xs text-[#888888] ml-3 hidden md:inline-block">
            按机构单独配置模板、审核流程、打分规则、增值业务与数据字典
          </span>
        </div>
      </div>

      <div className="flex gap-4 items-start">
        <aside className="w-[200px] shrink-0 bg-white rounded-lg border border-gray-100 shadow-[0_2px_8px_0_rgba(0,0,0,0.04)] flex flex-col h-[calc(100vh-74px-140px)] min-h-[420px] sticky top-6">
          <div className="flex border-b border-gray-100 px-3">
            {STATUS_TABS.map((tab) => {
              const active = statusTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => changeStatusTab(tab.id)}
                  className={`flex-1 py-2.5 text-[13px] font-medium border-b-2 -mb-px cursor-pointer transition-colors ${
                    active ? 'border-[#1890ff] text-[#1890ff]' : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tab.label}
                  <span className="ml-1 font-mono text-[11px] opacity-70">{statusCounts[tab.id]}</span>
                </button>
              );
            })}
          </div>
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <span className="material-symbols-outlined text-[16px] text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2">
                search
              </span>
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜索机构名称"
                className="w-full h-8 pl-8 pr-2 border border-gray-200 rounded text-[13px] focus:outline-none focus:border-[#1890ff]"
              />
            </div>          </div>
          <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-0.5">
            {visibleInstitutions.length === 0 ? (
              <div className="py-10 text-center text-xs text-gray-400">未找到匹配的机构</div>
            ) : (
              visibleInstitutions.map((institution) => {
                const active = institution.id === selectedId;
                return (
                  <button
                    key={institution.id}
                    type="button"
                    title={institution.name}
                    onClick={() => setSelectedId(institution.id)}
                    className={`w-full flex items-center gap-1.5 px-3 py-2 text-left text-[13px] rounded cursor-pointer ${
                      active ? 'bg-[#e6f4ff] text-[#1890ff] font-bold' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex-1 min-w-0 truncate">{institution.name}</span>
                    <span
                      className={`shrink-0 text-[10px] leading-4 px-1 rounded border font-normal ${
                        institution.status === '正式'
                          ? 'bg-violet-50 text-violet-600 border-violet-200'
                          : 'bg-amber-50 text-amber-600 border-amber-200'
                      }`}
                    >
                      {institution.status}版
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <div className="flex-1 min-w-0 min-h-[480px] bg-white rounded-lg border border-gray-100 shadow-[0_2px_8px_0_rgba(0,0,0,0.04)] p-5">
          {selectedInstitution ? (
            <InstitutionBusinessRulesTab
              key={selectedInstitution.id}
              institution={selectedInstitution}
              isGlobalScope={false}
              navPosition="top"
              onSaveRules={(newRules) => onSave({ id: selectedInstitution.id, businessRules: newRules })}
              showToast={(msg) => onShowToast?.(msg)}
            />
          ) : (
            <div className="h-full min-h-[440px] flex items-center justify-center text-sm text-gray-400">请选择左侧机构</div>
          )}
        </div>
      </div>
    </div>
  );
};
