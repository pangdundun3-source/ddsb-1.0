import React, { useState } from 'react';
import { Check } from 'lucide-react';

type InviteRegisterRole = 'reporter' | 'auditor';

const ROLE_TABS: { id: InviteRegisterRole; label: string }[] = [
  { id: 'reporter', label: '上报员' },
  { id: 'auditor', label: '审核员' }
];

interface RegisterField {
  name: string;
  key: string;
  required: boolean;
  verifyCode?: boolean;
  dictOptions?: string[];
}

const POLITICAL_OPTIONS = ['群众', '中共党员', '中共预备党员', '共青团员', '民主党派', '无党派人士', '其他'];

const FIELDS_BY_ROLE: Record<InviteRegisterRole, RegisterField[]> = {
  reporter: [
    { name: '姓名', key: 'real_name', required: true },
    { name: '手机', key: 'phone_number', required: true, verifyCode: true },
    { name: '身份证', key: 'id_card_no', required: false },
    { name: '政治面貌', key: 'political_status', required: false, dictOptions: POLITICAL_OPTIONS },
    { name: '职务', key: 'job_title', required: false }
  ],
  auditor: [
    { name: '姓名', key: 'real_name', required: true },
    { name: '手机', key: 'phone_number', required: true, verifyCode: true },
    { name: '身份证', key: 'id_card_no', required: true },
    { name: '政治面貌', key: 'political_status', required: false, dictOptions: POLITICAL_OPTIONS },
    { name: '职务', key: 'job_title', required: true }
  ]
};

const StaticCheck: React.FC<{ checked: boolean; label: string; tone: 'amber' | 'blue' }> = ({ checked, label, tone }) => {
  const checkedBg = tone === 'amber' ? 'bg-amber-600 border-amber-600' : 'bg-[#1E5ABB] border-[#1E5ABB]';
  return (
    <span className="inline-flex items-center gap-2 text-xs text-gray-600">
      <span className={`w-3.5 h-3.5 rounded-[3px] border flex items-center justify-center ${checked ? checkedBg : 'bg-white border-gray-400'}`}>
        {checked && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3.5} />}
      </span>
      <span>{label}</span>
    </span>
  );
};

export const InviteRegisterFieldsPanel: React.FC = () => {
  const [role, setRole] = useState<InviteRegisterRole>('reporter');
  const fields = FIELDS_BY_ROLE[role];

  return (
    <div className="space-y-3">
      <div className="inline-flex items-center gap-1 p-1 bg-gray-100 border border-gray-200 rounded-lg">
        {ROLE_TABS.map(tab => {
          const isActive = role === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => setRole(tab.id)}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                isActive ? 'bg-white text-[#1E5ABB] shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="overflow-x-auto border border-gray-100 rounded-lg">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-gray-50/80 text-gray-500 border-b border-gray-200 font-medium">
              <th className="px-5 py-3 w-14">#</th>
              <th className="px-3 py-3 w-48">字段名称</th>
              <th className="px-3 py-3 w-28">是否必填</th>
              <th className="px-3 py-3">扩展配置</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field, index) => (
              <tr key={field.key} className="border-b border-gray-100 last:border-b-0">
                <td className="px-5 py-4 text-gray-400">{index + 1}</td>
                <td className="px-3 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800 text-[13px]">{field.name}</span>
                    <span className="text-[11px] px-1.5 py-0.5 rounded border bg-blue-50 text-[#1E5ABB] border-blue-100">预置</span>
                  </div>
                  <div className="text-[11px] text-gray-400 font-mono mt-1">{field.key}</div>
                </td>
                <td className="px-3 py-4">
                  <StaticCheck checked={field.required} label={field.required ? '必填' : '选填'} tone="amber" />
                </td>
                <td className="px-3 py-4">
                  {field.verifyCode !== undefined ? (
                    <span className="inline-flex items-center px-2.5 py-1.5 rounded border border-blue-200 bg-blue-50/60">
                      <StaticCheck checked={field.verifyCode} label="验证码校验" tone="blue" />
                    </span>
                  ) : field.dictOptions ? (
                    <span className="text-gray-500">字典：{field.dictOptions.join(' / ')}</span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
