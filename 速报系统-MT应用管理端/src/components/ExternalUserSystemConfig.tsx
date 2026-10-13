import React, { useEffect, useState } from 'react';
import { InviteFieldsConfigSection } from './other-config/InviteFieldsConfigSection';
import { ExternalRoleManagement } from './other-config/ExternalRoleManagement';

interface ExternalUserSystemConfigProps {
  institutionId?: string | number;
  institutionName: string;
  showToast: (msg: string, type?: 'success' | 'warning') => void;
}

type ExternalNavKey = 'user_quota' | 'rules' | 'roles';

const EXTERNAL_NAV_ITEMS: { key: ExternalNavKey; label: string; icon: string }[] = [
  { key: 'user_quota', label: '机构账号与用户规模限制', icon: 'manage_accounts' },
  { key: 'rules', label: '专属邀请方式配置', icon: 'how_to_reg' },
  { key: 'roles', label: '外部角色管理', icon: 'admin_panel_settings' },
];
const isExternalNavKey = (value: string | null): value is ExternalNavKey =>
  EXTERNAL_NAV_ITEMS.some((item) => item.key === value);

const NAV_STORAGE_KEY = 'mt_ext_user_system_nav';

export const ExternalUserSystemConfig: React.FC<ExternalUserSystemConfigProps> = ({
  institutionId,
  institutionName,
  showToast,
}) => {
  const [activeNav, setActiveNav] = useState<ExternalNavKey>(() => {
    const saved = localStorage.getItem(NAV_STORAGE_KEY);
    return isExternalNavKey(saved) ? saved : 'user_quota';
  });

  const changeNav = (key: ExternalNavKey) => {
    setActiveNav(key);
    localStorage.setItem(NAV_STORAGE_KEY, key);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-5 items-start">
      <div className="w-full lg:w-60 shrink-0 bg-white rounded-lg border border-gray-200/80 shadow-2xs overflow-hidden sticky top-4">
        <div className="p-1.5 space-y-1">
          {EXTERNAL_NAV_ITEMS.map((item) => {
            const active = activeNav === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => changeNav(item.key)}
                className={`w-full text-left px-3 py-2.5 rounded-md transition-all cursor-pointer flex items-center gap-2.5 text-sm ${
                  active
                    ? 'bg-blue-50 text-[#1890ff] font-bold shadow-2xs border border-blue-200/80'
                    : 'text-gray-600 border border-transparent hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="material-symbols-outlined text-[20px] shrink-0">{item.icon}</span>
                <span className="leading-5">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 min-w-0 w-full">
        {activeNav === 'user_quota' && <UserQuotaPanel institutionName={institutionName} showToast={showToast} />}
        {activeNav === 'roles' && (
          <ExternalRoleManagement
            key={institutionId ?? 'new'}
            storageKey={`mt_inst_ext_roles_${institutionId ?? 'new'}`}
            showToast={showToast}
          />
        )}
        {activeNav === 'rules' && (
          <InviteFieldsConfigSection
            key={institutionId ?? 'new'}
            storageKey={`mt_inst_invite_fields_${institutionId ?? 'new'}`}
            fallbackStorageKey="mt_global_invite_fields"
            showToast={showToast}
          />
        )}
      </div>
    </div>
  );
};

interface UserQuotaState {
  enabled: boolean;
  limit: number;
}

const DEFAULT_QUOTA: UserQuotaState = { enabled: true, limit: 500 };
const ACTIVATED_EXTERNAL_COUNT = 15;
const quotaStorageKey = (institutionName: string) => `mt_ext_user_quota_${institutionName}`;

const readQuota = (institutionName: string): UserQuotaState => {
  try {
    const raw = localStorage.getItem(quotaStorageKey(institutionName));
    return raw ? { ...DEFAULT_QUOTA, ...JSON.parse(raw) } : DEFAULT_QUOTA;
  } catch {
    return DEFAULT_QUOTA;
  }
};

const UserQuotaPanel: React.FC<ExternalUserSystemConfigProps> = ({ institutionName, showToast }) => {
  const [quota, setQuota] = useState(() => readQuota(institutionName));
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(quota);

  useEffect(() => {
    const next = readQuota(institutionName);
    setQuota(next);
    setDraft(next);
    setEditing(false);
  }, [institutionName]);

  const startEdit = () => {
    setDraft(quota);
    setEditing(true);
  };

  const handleSave = () => {
    if (draft.enabled && (!Number.isInteger(draft.limit) || draft.limit <= 0)) {
      showToast('请输入大于 0 的整数上限', 'warning');
      return;
    }
    if (draft.enabled && draft.limit < ACTIVATED_EXTERNAL_COUNT) {
      showToast(`上限不能低于已激活外部人员数（${ACTIVATED_EXTERNAL_COUNT} 人）`, 'warning');
      return;
    }
    localStorage.setItem(quotaStorageKey(institutionName), JSON.stringify(draft));
    setQuota(draft);
    setEditing(false);
    showToast('外部用户数上限已保存');
  };

  const shown = editing ? draft : quota;
  const remaining = Math.max(0, shown.limit - ACTIVATED_EXTERNAL_COUNT);
  const usage = shown.limit > 0 ? (ACTIVATED_EXTERNAL_COUNT / shown.limit) * 100 : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900">
          <span className="material-symbols-outlined text-[18px] text-gray-600">settings</span>
          机构账号与用户规模限制配置
        </h3>
        {editing ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 text-sm font-bold text-white bg-[#1E3A6B] rounded hover:bg-[#162d54]"
            >
              <span className="material-symbols-outlined text-[17px]">save</span>
              保存
            </button>
            <button
              type="button"
              onClick={() => {
                setDraft(quota);
                setEditing(false);
              }}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
            >
              <span className="material-symbols-outlined text-[17px]">close</span>
              取消
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={startEdit}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 text-sm font-bold text-gray-800 bg-white border border-gray-200 rounded hover:bg-gray-50"
          >
            <span className="material-symbols-outlined text-[17px]">edit</span>
            编辑设置
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="border border-gray-200 rounded-md p-5">
          <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900">
            <span className="material-symbols-outlined text-[18px] text-emerald-600">share</span>
            外部用户数上限
          </h4>
          <p className="mt-3 text-[13px] text-gray-500 leading-6">
            限制该机构通过专属邀请或公共二维码激活的外部网格员、基层协同人员数量上限。
          </p>
          {editing ? (
            <div className="mt-4 flex items-center gap-3">
              <label className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={draft.enabled}
                  onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })}
                  className="w-4 h-4 accent-[#1890ff]"
                />
                开启上限
              </label>
              <input
                type="number"
                min={1}
                value={draft.limit}
                disabled={!draft.enabled}
                onChange={(e) => setDraft({ ...draft, limit: Number(e.target.value) })}
                className="w-24 h-8 px-2.5 text-sm font-mono border border-gray-200 rounded focus:outline-none focus:border-[#1890ff] disabled:bg-gray-50 disabled:text-gray-400"
              />
              <span className="text-sm text-gray-600">人</span>
            </div>
          ) : (
            <p className="mt-4 text-sm text-gray-500">
              {quota.enabled ? (
                <>
                  <span className="text-base font-bold font-mono text-emerald-700">{quota.limit}</span> 人（已开启限制）
                </>
              ) : (
                <span className="font-bold text-gray-700">不限制</span>
              )}
            </p>
          )}
        </div>

        <div className="border border-gray-200 rounded-md p-5">
          <div className="flex items-center justify-between">
            <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <span className="material-symbols-outlined text-[18px] text-gray-600">group</span>
              外部配额使用统计
            </h4>
            <span
              className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${
                shown.enabled
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  : 'text-gray-500 bg-gray-50 border-gray-200'
              }`}
            >
              {shown.enabled ? '受配额管控' : '未限制'}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div>
              <p className="text-xs text-gray-400">已激活外部人员</p>
              <p className="mt-1 text-base font-bold font-mono text-gray-900">
                {ACTIVATED_EXTERNAL_COUNT} <span className="text-xs font-normal text-gray-400">人</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">外部上限配额</p>
              <p className="mt-1 text-base font-bold font-mono text-emerald-700">
                {shown.enabled ? `${shown.limit} 人` : '不限'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">剩余可用名额</p>
              <p className="mt-1 text-base font-bold font-mono text-[#1890ff]">
                {shown.enabled ? `${remaining} 人` : '不限'}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>配额使用率</span>
              <span>{shown.enabled ? `${usage.toFixed(1)}%` : '—'}</span>
            </div>
            <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${usage >= 90 ? 'bg-rose-500' : usage >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: shown.enabled ? `${Math.min(100, Math.max(usage, 1.5))}%` : '0%' }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 px-5 py-4 bg-[#f5f8fc] border border-[#e3ebf5] rounded-md">
        <span className="material-symbols-outlined text-[18px] text-gray-600 shrink-0">info</span>
        <div className="text-[13px] leading-6">
          <p className="font-bold text-gray-800">外部用户规模控制说明：</p>
          <p className="text-gray-600">
            当该客户机构已纳管的外部人员总数达到设定上限时，新协同人员扫描专属邀请二维码或关注专属服务号时将自动提示「外部用户配额已满」，以防止外部人员超额激增；内部人员名额不在此处受限。
          </p>
        </div>
      </div>
    </div>
  );
};

