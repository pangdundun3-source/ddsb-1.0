import React, { useState } from 'react';
import { ControlNoticeTip } from '../business/ControlNoticeTip';
import { confirmDialog } from '../common/ConfirmDialog';

type InviteRole = 'common' | 'reporter' | 'auditor';

const ROLE_TABS: { id: InviteRole; label: string; code: string; builtIn: boolean }[] = [
  { id: 'common', label: '通用默认', code: 'DEFAULT', builtIn: false },
  { id: 'reporter', label: '网格员', code: 'ROLE_EXT_REPORTER', builtIn: true },
  { id: 'auditor', label: '审核员', code: 'ROLE_EXT_AUDITOR', builtIn: true },
];

interface InviteField {
  id: string;
  name: string;
  key: string;
  preset: boolean;
  enabled: boolean;
  required: boolean;
  verifyCode?: boolean;
  dictOptions?: string[];
  placeholder?: string;
  regex?: string;
}

type InviteFieldsByRole = Record<InviteRole, InviteField[]>;

type InviteMethod = 'code' | 'qrcode' | 'link';

const INVITE_METHODS: { id: InviteMethod; label: string; desc: string; icon: string; iconClass: string }[] = [
  { id: 'code', label: '激活码', desc: '8~12 位加密激活码，适合短信与线下发放', icon: 'key', iconClass: 'bg-amber-50 text-amber-600' },
  { id: 'qrcode', label: '动态二维码', desc: '公众号关注二维码，扫码即完成入驻', icon: 'qr_code_2', iconClass: 'bg-emerald-50 text-emerald-600' },
  { id: 'link', label: '邀请链接', desc: 'H5 入驻长短链，便于分享与投放', icon: 'link', iconClass: 'bg-sky-50 text-sky-600' },
];

interface InviteConfig {
  fields: InviteFieldsByRole;
  methods: InviteMethod[];
  batchInvite: boolean;
}

const LOCKED_FIELD_IDS = new Set(['real_name', 'phone_number']);
const POLITICAL_OPTIONS = ['群众', '中共党员', '中共预备党员', '共青团员', '民主党派', '无党派人士', '其他'];

const REGEX_PRESETS: { label: string; pattern: string }[] = [
  { label: '中文姓名', pattern: '^[\\u4e00-\\u9fa5·]{2,20}$' },
  { label: '手机号', pattern: '^1[3-9]\\d{9}$' },
  { label: '身份证号', pattern: '^\\d{17}[\\dXx]$' },
  { label: '邮箱', pattern: '^[\\w.+-]+@[\\w-]+(\\.[\\w-]+)+$' },
  { label: '纯数字', pattern: '^\\d+$' },
  { label: '数字长度', pattern: '^\\d{6}$' },
  { label: '字母数字', pattern: '^[A-Za-z0-9]+$' },
  { label: '统一社会信用代码', pattern: '^[0-9A-HJ-NPQRTUWXY]{2}\\d{6}[0-9A-HJ-NPQRTUWXY]{10}$' },
];

const getRegexLabel = (pattern?: string) => REGEX_PRESETS.find((item) => item.pattern === pattern)?.label;

const buildPresetFields = (role: InviteRole): InviteField[] => [
  { id: 'real_name', name: '姓名', key: 'real_name', preset: true, enabled: true, required: true },
  { id: 'phone_number', name: '手机', key: 'phone_number', preset: true, enabled: true, required: true, verifyCode: true },
  { id: 'id_card_no', name: '身份证', key: 'id_card_no', preset: true, enabled: true, required: role === 'auditor' },
  { id: 'political_status', name: '政治面貌', key: 'political_status', preset: true, enabled: true, required: false, dictOptions: POLITICAL_OPTIONS },
  { id: 'job_title', name: '职务', key: 'job_title', preset: true, enabled: true, required: role === 'auditor' },
];

const buildDefaults = (): InviteConfig => ({
  fields: {
    common: buildPresetFields('common'),
    reporter: buildPresetFields('reporter'),
    auditor: buildPresetFields('auditor'),
  },
  methods: INVITE_METHODS.map((method) => method.id),
  batchInvite: true,
});

const readStored = (storageKey: string, fallbackKey?: string): InviteConfig => {
  const defaults = buildDefaults();
  for (const key of [storageKey, fallbackKey]) {
    if (!key) continue;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as Partial<InviteConfig> & Partial<InviteFieldsByRole>;
      // 兼容早期仅保存字段（{ reporter, auditor }）的结构
      const fields: Partial<InviteFieldsByRole> | null =
        parsed.fields || (parsed.reporter && parsed.auditor ? { reporter: parsed.reporter, auditor: parsed.auditor } : null);
      if (!fields || !Array.isArray(fields.reporter) || !Array.isArray(fields.auditor)) continue;
      if (!Array.isArray(fields.common)) fields.common = defaults.fields.common;
      const methods = Array.isArray(parsed.methods)
        ? parsed.methods.filter((id): id is InviteMethod => INVITE_METHODS.some((method) => method.id === id))
        : defaults.methods;
      return {
        fields: fields as InviteFieldsByRole,
        methods: methods.length > 0 ? methods : defaults.methods,
        batchInvite: typeof parsed.batchInvite === 'boolean' ? parsed.batchInvite : defaults.batchInvite,
      };
    } catch {
      // Ignore malformed storage and fall back to defaults.
    }
  }
  return defaults;
};

const isValidRegex = (pattern: string) => {
  try {
    new RegExp(pattern);
    return true;
  } catch {
    return false;
  }
};

interface FieldDraft {
  name: string;
  placeholder: string;
  regex: string;
  enabled: boolean;
  required: boolean;
}

const EMPTY_DRAFT: FieldDraft = { name: '', placeholder: '', regex: '', enabled: true, required: false };

interface Props {
  storageKey: string;
  fallbackStorageKey?: string;
  isGlobalScope?: boolean;
  flat?: boolean;
  showToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
}

export const InviteFieldsConfigSection: React.FC<Props> = ({
  storageKey,
  fallbackStorageKey,
  isGlobalScope = false,
  flat = false,
  showToast,
}) => {
  const [initialConfig] = useState<InviteConfig>(() => readStored(storageKey, fallbackStorageKey));
  const [fieldsByRole, setFieldsByRole] = useState<InviteFieldsByRole>(initialConfig.fields);
  const [methods, setMethods] = useState<InviteMethod[]>(initialConfig.methods);
  const [batchInvite, setBatchInvite] = useState(initialConfig.batchInvite);
  const [modalFieldId, setModalFieldId] = useState<string | null>(null);
  const [draft, setDraft] = useState<FieldDraft>(EMPTY_DRAFT);
  const [nameError, setNameError] = useState('');
  const [dirty, setDirty] = useState(false);

  const [activeRole, setActiveRole] = useState<InviteRole>('common');
  const activeTab = ROLE_TABS.find((tab) => tab.id === activeRole) ?? ROLE_TABS[0];
  const fields = fieldsByRole[activeRole];
  const isCreating = modalFieldId === 'new';
  const regexInvalid = draft.regex.trim() !== '' && !isValidRegex(draft.regex.trim());

  const commit = (updater: (list: InviteField[]) => InviteField[]) => {
    setFieldsByRole((prev) => ({ ...prev, [activeRole]: updater(prev[activeRole]) }));
    setDirty(true);
  };

  const updateField = (id: string, patch: Partial<InviteField>) =>
    commit((list) =>
      list.map((field) => {
        if (field.id !== id) return field;
        const next = { ...field, ...patch };
        if (!next.enabled) next.required = false;
        return next;
      })
    );

  const openCreate = () => {
    setModalFieldId('new');
    setDraft(EMPTY_DRAFT);
    setNameError('');
  };

  const openEdit = (field: InviteField) => {
    setModalFieldId(field.id);
    setDraft({
      name: field.name,
      placeholder: field.placeholder || '',
      regex: field.regex || '',
      enabled: field.enabled,
      required: field.required,
    });
    setNameError('');
  };

  const closeModal = () => setModalFieldId(null);

  const submitModal = () => {
    const name = draft.name.trim();
    if (!name) return setNameError('请填写字段名称');
    if (fields.some((field) => field.name === name && field.id !== modalFieldId)) return setNameError('字段名称已存在');
    if (regexInvalid) return;

    const payload = {
      name,
      placeholder: draft.placeholder.trim(),
      regex: draft.regex.trim(),
      enabled: draft.enabled,
      required: draft.enabled && draft.required,
    };
    if (isCreating) {
      const nextIndex = fields.filter((field) => !field.preset).length + 1;
      let key = `custom_field_${nextIndex}`;
      while (fields.some((field) => field.key === key)) key = `${key}_1`;
      commit((list) => [...list, { id: `custom_${Date.now()}`, key, preset: false, ...payload }]);
      showToast(`已新增自定义字段「${name}」`, 'success');
    } else {
      commit((list) => list.map((field) => (field.id === modalFieldId ? { ...field, ...payload } : field)));
    }
    closeModal();
  };

  const removeField = async (field: InviteField) => {
    if (!(await confirmDialog(`确定删除自定义字段「${field.name}」吗？`, { title: '删除字段', okText: '确认删除', danger: true }))) return;
    commit((list) => list.filter((item) => item.id !== field.id));
  };

  const toggleMethod = (id: InviteMethod) => {
    if (methods.includes(id)) {
      if (methods.length === 1) {
        showToast('至少开放一种邀请方式', 'warning');
        return;
      }
      setMethods(methods.filter((item) => item !== id));
    } else {
      setMethods(INVITE_METHODS.map((method) => method.id).filter((item) => item === id || methods.includes(item)));
    }
    setDirty(true);
  };

  const handleSave = () => {
    const config: InviteConfig = { fields: fieldsByRole, methods, batchInvite };
    try {
      localStorage.setItem(storageKey, JSON.stringify(config));
    } catch {
      // Storage may be unavailable in private or restricted browser contexts.
    }
    setDirty(false);
    showToast(isGlobalScope ? '全平台专属邀请默认配置已保存' : '机构专属邀请配置已保存并实时生效', 'success');
  };

  const handleReset = async () => {
    if (
      !(await confirmDialog('确定恢复为默认专属邀请配置吗？邀请方式、批量邀请与自定义字段都将重置。', {
        title: '恢复默认',
        okText: '确认恢复',
      }))
    )
      return;
    const defaults = buildDefaults();
    setFieldsByRole(defaults.fields);
    setMethods(defaults.methods);
    setBatchInvite(defaults.batchInvite);
    setDirty(true);
  };

  const renderCheckbox = (checked: boolean, locked: boolean, onChange: () => void, label: string, tone: 'navy' | 'amber') => (
    <label
      title={locked ? '基础字段，固定开启' : undefined}
      className={`inline-flex items-center gap-2 text-xs select-none ${locked ? 'cursor-not-allowed' : 'cursor-pointer'} ${
        !checked && locked ? 'text-gray-300' : 'text-gray-600'
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        readOnly={locked}
        disabled={locked && !checked}
        onChange={locked ? undefined : onChange}
        className={`w-3.5 h-3.5 rounded ${tone === 'amber' ? 'accent-amber-600' : 'accent-[#1E3A6B]'} ${locked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      />
      <span>{label}</span>
    </label>
  );

  const inputClass =
    'w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#1890ff] focus:border-[#1890ff] bg-white placeholder:text-gray-400';

  const renderExtension = (field: InviteField) => {
    if (field.verifyCode !== undefined) {
      return (
        <label className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded border border-blue-200 bg-blue-50/60 text-[#1E3A6B] text-xs cursor-pointer select-none">
          <input
            type="checkbox"
            checked={field.verifyCode}
            onChange={() => updateField(field.id, { verifyCode: !field.verifyCode })}
            className="w-3.5 h-3.5 rounded accent-[#1E3A6B] cursor-pointer"
          />
          <span>验证码校验</span>
        </label>
      );
    }
    if (field.dictOptions) return <span className="text-gray-500">字典：{field.dictOptions.join(' / ')}</span>;
    if (field.regex || field.placeholder) {
      const regexLabel = getRegexLabel(field.regex);
      return (
        <div className="space-y-1 text-gray-500">
          {field.regex && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span>正则：</span>
              {regexLabel && (
                <span className="text-[11px] px-1.5 py-0.5 rounded border border-blue-100 bg-blue-50 text-[#1890ff]">{regexLabel}</span>
              )}
              <code className="font-mono text-[11px] text-gray-700 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">{field.regex}</code>
            </div>
          )}
          {field.placeholder && <div className="text-[11px] text-gray-400">提示：{field.placeholder}</div>}
        </div>
      );
    }
    return <span className="text-gray-300">—</span>;
  };

  return (
    <div className={flat ? 'space-y-5' : 'bg-white p-6 rounded-lg border border-gray-200/80 shadow-2xs space-y-5'}>
      {isGlobalScope && (
        <div className="flex items-center gap-1.5 pb-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-800">平台专属邀请配置</h3>
          <ControlNoticeTip
            title="全平台专属邀请母版管控提示"
            content="此处配置的邀请方式、批量邀请能力与邀请注册字段将作为默认母版同步至全平台所有机构。机构开通后默认沿用本配置；如需差异化，可在机构详情「外部用户体系配置 → 专属邀请方式配置」中单独调整。此处取消的邀请方式，机构端将不再提供。"
          />
        </div>
      )}
      <div className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h4 className="text-base font-bold text-gray-900">专属邀请方式</h4>
            <p className="text-xs text-gray-500 mt-1">
              {isGlobalScope
                ? '勾选全平台机构可用的邀请途径，取消后机构端不再提供该方式，至少保留一种'
                : '勾选开通机构可用的邀请途径，至少保留一种'}
            </p>
          </div>
          <span className="text-xs text-gray-500 shrink-0">
            已启用 <span className="font-bold text-gray-800">{methods.length} / {INVITE_METHODS.length}</span>
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {INVITE_METHODS.map((method) => {
            const checked = methods.includes(method.id);
            return (
              <button
                key={method.id}
                type="button"
                role="checkbox"
                aria-checked={checked}
                onClick={() => toggleMethod(method.id)}
                className={`relative flex items-center gap-3 pl-4 pr-10 py-4 text-left rounded-sm border border-l-4 transition-all cursor-pointer ${
                  checked
                    ? 'border-[#1E3A6B]/70 border-l-[#1E3A6B] bg-white'
                    : 'border-gray-200 border-l-gray-200 bg-gray-50/60 hover:border-gray-300'
                }`}
              >
                <span
                  className={`w-9 h-9 shrink-0 flex items-center justify-center rounded ${
                    checked ? method.iconClass : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{method.icon}</span>
                </span>
                <span className="min-w-0">
                  <span className={`block text-[13px] font-bold ${checked ? 'text-gray-900' : 'text-gray-500'}`}>{method.label}</span>
                  <span className="block text-xs text-gray-500 mt-0.5">{method.desc}</span>
                </span>
                <span
                  className={`absolute top-3 right-3 w-[18px] h-[18px] rounded-sm flex items-center justify-center border ${
                    checked ? 'bg-[#1E3A6B] border-[#1E3A6B]' : 'bg-white border-gray-300'
                  }`}
                >
                  {checked && <span className="material-symbols-outlined text-[14px] text-white font-bold">check</span>}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="py-4 border-y border-gray-100 flex items-center justify-between gap-4">
        <div>
          <h4 className="text-[13px] font-bold text-gray-900">批量邀请</h4>
          <p className="text-xs text-gray-500 mt-0.5">开启后，机构可批量生成邀请凭证，批量邀请用户激活账号</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={batchInvite}
          onClick={() => {
            setBatchInvite(!batchInvite);
            setDirty(true);
          }}
          className="inline-flex items-center gap-2.5 cursor-pointer shrink-0"
        >
          <span className={`text-sm font-bold ${batchInvite ? 'text-gray-800' : 'text-gray-400'}`}>{batchInvite ? '已开启' : '已关闭'}</span>
          <span className={`w-11 h-6 rounded-full p-0.5 flex transition-colors ${batchInvite ? 'bg-[#1E3A6B] justify-end' : 'bg-gray-300 justify-start'}`}>
            <span className="w-5 h-5 rounded-full bg-white shadow" />
          </span>
        </button>
      </div>

      <div className="flex items-end justify-between gap-3">
        <div>
          <h4 className="text-base font-bold text-gray-900">邀请注册字段</h4>
          <p className="text-xs text-gray-500 mt-1">
            配置邀请时注册需填写的内容；可控制是否填写、是否必填；手机支持验证码校验；自定义字段为文本并可配置正则
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-bold text-white bg-[#1E3A6B] rounded-sm hover:bg-[#162c52] cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          新增自定义字段
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {ROLE_TABS.map((tab) => {
          const active = tab.id === activeRole;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveRole(tab.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-sm border cursor-pointer transition-colors ${
                active
                  ? 'bg-[#1E3A6B] border-[#1E3A6B] text-white'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-[#1E3A6B]/50'
              }`}
            >
              {tab.label}
              {tab.builtIn && (
                <span
                  className={`text-[11px] font-medium px-1.5 py-0.5 rounded-sm border ${
                    active ? 'bg-white/15 border-white/20 text-white' : 'bg-blue-50 border-blue-100 text-[#1890ff]'
                  }`}
                >
                  内置
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="overflow-x-auto border border-gray-100 rounded-lg">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-gray-50/80 text-gray-500 border-b border-gray-200 font-medium">
              <th className="px-5 py-3 w-14">#</th>
              <th className="px-3 py-3 w-44">字段名称</th>
              <th className="px-3 py-3 w-28">是否填写</th>
              <th className="px-3 py-3 w-28">是否必填</th>
              <th className="px-3 py-3">扩展配置</th>
              <th className="px-5 py-3 w-28 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field, index) => {
              const locked = LOCKED_FIELD_IDS.has(field.id);
              return (
                <tr key={field.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50">
                  <td className="px-5 py-4 text-gray-400">{index + 1}</td>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800 text-[13px]">{field.name}</span>
                      <span
                        className={`text-[11px] px-1.5 py-0.5 rounded border ${
                          field.preset ? 'bg-blue-50 text-[#1890ff] border-blue-100' : 'bg-violet-50 text-violet-600 border-violet-100'
                        }`}
                      >
                        {field.preset ? '预置' : '自定义'}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-400 font-mono mt-1">{field.key}</div>
                  </td>
                  <td className="px-3 py-4">
                    {renderCheckbox(field.enabled, locked, () => updateField(field.id, { enabled: !field.enabled }), '填写', 'navy')}
                  </td>
                  <td className="px-3 py-4">
                    {renderCheckbox(
                      field.required,
                      locked || !field.enabled,
                      () => updateField(field.id, { required: !field.required }),
                      field.required ? '必填' : '选填',
                      'amber'
                    )}
                  </td>
                  <td className="px-3 py-4">{renderExtension(field)}</td>
                  <td className="px-5 py-4">
                    {field.preset ? (
                      <div className="text-right text-gray-300">—</div>
                    ) : (
                      <div className="flex items-center justify-end gap-3 text-xs font-bold">
                        <button type="button" onClick={() => openEdit(field)} className="text-[#1890ff] hover:text-blue-700 cursor-pointer">
                          编辑
                        </button>
                        <button type="button" onClick={() => removeField(field)} className="text-gray-400 hover:text-red-600 cursor-pointer">
                          删除
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
        {dirty && <span className="mr-auto text-xs text-amber-600">有未保存的修改</span>}
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-1.5 text-xs font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer"
        >
          恢复默认
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty}
          className="px-5 py-1.5 text-xs font-bold text-white bg-[#1E3A6B] rounded hover:bg-[#162c52] disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
        >
          保存配置
        </button>
      </div>

      {modalFieldId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={closeModal}>
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-[560px] bg-white rounded-lg shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 bg-slate-50 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-600">
                  <span className="material-symbols-outlined text-[18px]">{isCreating ? 'add' : 'edit'}</span>
                </span>
                <h4 className="text-base font-bold text-gray-900">{isCreating ? '新增自定义字段' : '编辑自定义字段'}</h4>
              </div>
              <button type="button" onClick={closeModal} className="text-gray-400 hover:text-gray-600 cursor-pointer" aria-label="关闭">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <p className="text-xs text-gray-500">自定义字段固定为文本填写，可配置正则规则用于注册时校验</p>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1.5">所属角色</label>
                <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded border border-gray-100 bg-slate-50">
                  <span className="text-sm font-bold text-gray-800">{activeTab.label}</span>
                  <span className="text-xs font-mono text-gray-400">{activeTab.code}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1.5">
                  字段名称 <span className="text-red-500">*</span>
                </label>
                <input
                  autoFocus
                  value={draft.name}
                  maxLength={20}
                  onChange={(e) => {
                    setDraft((prev) => ({ ...prev, name: e.target.value }));
                    setNameError('');
                  }}
                  placeholder="如：紧急联系人"
                  className={`${inputClass} ${nameError ? 'border-red-400' : ''}`}
                />
                {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1.5">提示文字</label>
                <input
                  value={draft.placeholder}
                  maxLength={40}
                  onChange={(e) => setDraft((prev) => ({ ...prev, placeholder: e.target.value }))}
                  placeholder="注册页输入框提示"
                  className={inputClass}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-bold text-gray-800">正则规则</label>
                  <span className="text-xs text-gray-400">选填 · 点击推荐一键填入</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {REGEX_PRESETS.map((preset) => {
                    const isActive = draft.regex === preset.pattern;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        title={preset.pattern}
                        onClick={() => setDraft((prev) => ({ ...prev, regex: isActive ? '' : preset.pattern }))}
                        className={`px-2.5 py-1 text-xs rounded border cursor-pointer transition-colors ${
                          isActive
                            ? 'border-[#1890ff] bg-blue-50 text-[#1890ff] font-bold'
                            : 'border-gray-200 text-gray-600 hover:border-[#1890ff] hover:text-[#1890ff]'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
                <input
                  value={draft.regex}
                  onChange={(e) => setDraft((prev) => ({ ...prev, regex: e.target.value }))}
                  placeholder="也可自行输入正则，留空则不做格式校验"
                  className={`${inputClass} font-mono ${regexInvalid ? 'border-red-400' : ''}`}
                />
                <p className={`text-xs mt-1 ${regexInvalid ? 'text-red-500' : 'text-gray-400'}`}>
                  {regexInvalid ? '正则写法有误，请修正后再保存' : '写法错误将无法保存；再次点击同一推荐可清空'}
                </p>
              </div>

              <div className="flex items-center gap-6 px-4 py-3 rounded bg-slate-50 border border-gray-100">
                <label className="inline-flex items-center gap-2 text-sm font-bold text-gray-800 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={draft.enabled}
                    onChange={() =>
                      setDraft((prev) => ({ ...prev, enabled: !prev.enabled, required: prev.enabled ? false : prev.required }))
                    }
                    className="w-4 h-4 rounded accent-[#1890ff] cursor-pointer"
                  />
                  是否填写
                </label>
                <label
                  className={`inline-flex items-center gap-2 text-sm font-bold select-none ${
                    draft.enabled ? 'text-gray-800 cursor-pointer' : 'text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={draft.required}
                    disabled={!draft.enabled}
                    onChange={() => setDraft((prev) => ({ ...prev, required: !prev.required }))}
                    className="w-4 h-4 rounded accent-[#1890ff] cursor-pointer disabled:cursor-not-allowed"
                  />
                  是否必填
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100">
              <button
                type="button"
                onClick={closeModal}
                className="px-5 py-2 text-sm font-bold text-gray-700 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={submitModal}
                disabled={regexInvalid}
                className="px-6 py-2 text-sm font-bold text-white bg-[#1890ff] rounded hover:bg-[#1677d9] disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
              >
                {isCreating ? '确认添加' : '保存修改'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
