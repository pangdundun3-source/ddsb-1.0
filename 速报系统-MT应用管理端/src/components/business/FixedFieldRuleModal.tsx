import React, { useState } from 'react';
import { Info, Plus, RotateCcw, Trash2, X } from 'lucide-react';
import {
  FIXED_FIELD_RULE_MAX,
  TEXT_MAX_LENGTH_DEFAULT,
  TEXT_MAX_LENGTH_LIMIT,
  DETAIL_FIELD_ID,
  TITLE_FIELD_ID,
  TemplateFieldItem,
  isRequiredLockedField,
  isValidMaxLength,
  parseMaxLengthInput,
  switchMaxLength,
  applyFixedFieldRuleToGlobalTemplates,
  countGlobalReportTemplates,
  defaultFixedFieldRule,
  readEffectiveFixedFieldRule,
  writeFixedFieldRule,
  writeInstitutionFixedFieldRule,
} from './TemplateConfigBoard';

const isDefaultFixedField = (id: string) => defaultFixedFieldRule.some(f => f.id === id);

/** 仅上报标题必填锁定；上报内容描述默认必填但可改；两者不可删除，旧规则缺少时按默认位置补回 */
const withDefaultFields = (list: TemplateFieldItem[]): TemplateFieldItem[] => {
  const result = [...list];
  defaultFixedFieldRule.forEach((def, idx) => {
    if (!result.some(f => f.id === def.id)) result.splice(Math.min(idx, result.length), 0, { ...def });
  });
  return result.map(f =>
    f.id === TITLE_FIELD_ID
      ? { ...f, type: 'text' as const, multiline: false, required: true, locked: true }
      : f.id === DETAIL_FIELD_ID
        ? { ...f, type: 'text' as const, multiline: true, locked: true }
        : f
  );
};

interface FixedFieldRuleModalProps {
  /** 传入时为机构级规则：只同步本机构自定义模板，系统默认模板不受影响 */
  institutionId?: string | number;
  customTemplateCount?: number;
  onClose: () => void;
  onSaved: (message: string) => void;
  onAppliedToExisting: (rule: TemplateFieldItem[]) => void;
}

const MiniSwitch: React.FC<{ checked: boolean; disabled?: boolean; onChange: (next: boolean) => void; title?: string }> = ({
  checked,
  disabled,
  onChange,
  title,
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    title={title}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-[18px] w-8 shrink-0 items-center rounded-full transition-colors ${
      checked ? 'bg-[#1890ff]' : 'bg-gray-300'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <span
      className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
        checked ? 'translate-x-4' : 'translate-x-0.5'
      }`}
    />
  </button>
);

export const FixedFieldRuleModal: React.FC<FixedFieldRuleModalProps> = ({
  institutionId,
  customTemplateCount = 0,
  onClose,
  onSaved,
  onAppliedToExisting,
}) => {
  const isInstitution = institutionId !== undefined;
  const [draft, setDraft] = useState<TemplateFieldItem[]>(() =>
    withDefaultFields(readEffectiveFixedFieldRule(institutionId))
  );
  const [error, setError] = useState('');
  const [globalCount] = useState(() => (isInstitution ? 0 : countGlobalReportTemplates()));

  const patchField = (id: string, patch: Partial<TemplateFieldItem>) => {
    setError('');
    setDraft(prev => prev.map(f => (f.id === id ? { ...f, ...patch } : f)));
  };

  const handleAdd = () => {
    if (draft.length >= FIXED_FIELD_RULE_MAX) return;
    setDraft(prev => [
      ...prev,
      {
        id: `fixed_custom_${Date.now()}`,
        name: '',
        type: 'text',
        required: false,
        placeholder: '',
        locked: true,
        multiline: false,
        maxLength: TEXT_MAX_LENGTH_DEFAULT,
      },
    ]);
  };

  const handleReset = () => {
    setError('');
    setDraft(defaultFixedFieldRule.map(f => ({ ...f })));
  };

  const handleSave = () => {
    const names = draft.map(f => f.name.trim());
    if (names.some(n => !n)) {
      setError('请填写所有固定字段的名称');
      return;
    }
    if (new Set(names).size !== names.length) {
      setError('固定字段名称不能重复');
      return;
    }
    if (draft.some(f => !isValidMaxLength(f.maxLength))) {
      setError(`字数上限需为 1–${TEXT_MAX_LENGTH_LIMIT} 的整数，留空表示不限制`);
      return;
    }
    const rule = draft.map(f => ({
      ...f,
      name: f.name.trim(),
      placeholder: (f.placeholder || '').trim(),
      locked: true,
    }));
    if (isInstitution) {
      writeInstitutionFixedFieldRule(institutionId, rule);
      onAppliedToExisting(rule);
      onSaved(`固定字段规则已保存：共 ${rule.length} 个固定字段，已同步本机构 ${customTemplateCount} 个自定义模板`);
    } else {
      writeFixedFieldRule(rule);
      const applied = applyFixedFieldRuleToGlobalTemplates();
      onAppliedToExisting(rule);
      onSaved(`固定字段规则已保存：共 ${rule.length} 个固定字段，已同步 ${applied} 个系统默认模板`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6" onClick={onClose}>
      <div
        className="w-full max-w-[860px] max-h-[88vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-gray-900">固定字段规则</div>
            <div className="text-[11px] text-gray-400 mt-0.5">
              {isInstitution
                ? '控制本机构新建报送模板时自动带入的前置字段，排在所有自定义字段之前'
                : '控制全平台新建报送模板时自动带入的前置字段，排在所有自定义字段之前'}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-blue-50/60 border border-blue-100 text-[12px] text-[#1E5ABB]">
            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>
              默认前两行为锁定的单行 / 多行文本；名称、填报提示、字数上限可改，类型不可改；上报标题必填不可改，上报内容描述必填可改；均不可删除或排序。
            </span>
          </div>

          <div className="grid grid-cols-[28px_minmax(0,1.1fr)_minmax(0,1.4fr)_96px_96px_52px_32px] gap-2 px-2 text-[11px] font-medium text-gray-400">
            <span>序号</span>
            <span>字段名称</span>
            <span>描述（填报提示）</span>
            <span>输入方式</span>
            <span>字数上限</span>
            <span className="text-center">必填</span>
            <span />
          </div>

          <div className="space-y-2">
            {draft.map((field, idx) => {
              const isDefaultField = isDefaultFixedField(field.id);
              return (
                <div
                  key={field.id}
                  className="grid grid-cols-[28px_minmax(0,1.1fr)_minmax(0,1.4fr)_96px_96px_52px_32px] gap-2 items-center px-2 py-2 rounded-lg bg-gray-50"
                >
                  <span className="text-[11px] font-mono text-gray-400">{idx + 1}</span>
                  <input
                    type="text"
                    value={field.name}
                    maxLength={20}
                    onChange={e => patchField(field.id, { name: e.target.value })}
                    placeholder="请输入字段名称"
                    className="w-full h-8 px-2.5 border border-gray-200 rounded-md text-[13px] text-gray-800 bg-white focus:outline-none focus:border-[#1890ff]"
                  />
                  <input
                    type="text"
                    value={field.placeholder || ''}
                    maxLength={40}
                    onChange={e => patchField(field.id, { placeholder: e.target.value })}
                    placeholder="如：请输入上报标题"
                    className="w-full h-8 px-2.5 border border-gray-200 rounded-md text-[13px] text-gray-600 bg-white focus:outline-none focus:border-[#1890ff]"
                  />
                  <select
                    value={field.multiline ? 'multi' : 'single'}
                    disabled={isDefaultField}
                    title={isDefaultField ? '系统默认固定字段的输入方式不可修改' : undefined}
                    onChange={e => {
                      const multiline = e.target.value === 'multi';
                      patchField(field.id, {
                        multiline,
                        maxLength: switchMaxLength(field.maxLength, !!field.multiline, multiline),
                      });
                    }}
                    className="w-full h-8 px-2 border border-gray-200 rounded-md text-[12px] text-gray-700 bg-white focus:outline-none focus:border-[#1890ff] cursor-pointer disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                  >
                    <option value="single">单行文本</option>
                    <option value="multi">多行文本</option>
                  </select>
                  <label
                    className={`w-full h-8 flex items-center gap-1 px-2 border rounded-md text-[12px] text-gray-500 bg-white focus-within:border-[#1890ff] ${
                      isValidMaxLength(field.maxLength) ? 'border-gray-200' : 'border-rose-300'
                    }`}
                    title={`填报内容的最大字数，留空表示不限制（1–${TEXT_MAX_LENGTH_LIMIT}）`}
                  >
                    <input
                      type="number"
                      min={1}
                      max={TEXT_MAX_LENGTH_LIMIT}
                      value={field.maxLength ?? ''}
                      onChange={e => patchField(field.id, { maxLength: parseMaxLengthInput(e.target.value) })}
                      placeholder="不限"
                      className="w-full min-w-0 text-center text-[13px] text-gray-800 bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <span className="shrink-0">字</span>
                  </label>
                  <span className="flex justify-center">
                    <MiniSwitch
                      checked={field.required || isRequiredLockedField(field)}
                      disabled={isRequiredLockedField(field)}
                      title={
                        isRequiredLockedField(field)
                          ? `${field.name || '该字段'}默认必填，不可修改`
                          : undefined
                      }
                      onChange={next => patchField(field.id, { required: next })}
                    />
                  </span>
                  <button
                    type="button"
                    disabled={isDefaultField}
                    title={isDefaultField ? `${field.name || '该字段'}为系统默认固定字段，不可删除` : '删除该固定字段'}
                    onClick={() => setDraft(prev => prev.filter(f => f.id !== field.id))}
                    className="w-7 h-7 rounded flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={draft.length >= FIXED_FIELD_RULE_MAX}
            className="w-full py-2.5 border border-dashed border-blue-300 bg-white/60 hover:bg-blue-50/60 hover:border-[#1890ff] text-[#1E5ABB] rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/60"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>
              添加固定字段（{draft.length}/{FIXED_FIELD_RULE_MAX}）
            </span>
          </button>

          <div className="pt-2">
            <div className="text-xs font-bold text-gray-800 mb-2">生效范围</div>
            {isInstitution ? (
              <ul className="px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-[12px] text-gray-600 leading-5 space-y-1 list-disc pl-7">
                <li>
                  仅影响本机构全部<span className="font-medium text-gray-800">自定义模板</span>（当前 {customTemplateCount}{' '}
                  个报送模板），系统默认模板不受影响。
                </li>
                <li>已提交的上报数据保持不变，之后新增的上报按更新后的模板填写。</li>
              </ul>
            ) : (
              <ul className="px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-[12px] text-gray-600 leading-5 space-y-1 list-disc pl-7">
                <li>
                  仅影响全局创建的<span className="font-medium text-gray-800">系统默认模板</span>（当前 {globalCount}{' '}
                  个报送模板），机构自定义模板不受影响。
                </li>
                <li>使用系统默认模板的机构：已提交的上报数据保持不变，之后新增的上报按更新后的模板填写。</li>
              </ul>
            )}
          </div>
        </div>

        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between gap-3">
          <div className="text-[11px] text-gray-500">
            {error ? <span className="text-red-500">{error}</span> : <span>共 {draft.length} 个固定字段</span>}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="h-8 px-3 rounded text-xs text-gray-500 hover:text-[#1E5ABB] hover:bg-blue-50 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              恢复默认
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-8 px-4 border border-gray-200 rounded text-xs text-gray-600 hover:bg-gray-50 cursor-pointer"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="h-8 px-4 bg-[#1890ff] hover:bg-blue-600 rounded text-xs font-bold text-white cursor-pointer"
            >
              保存规则
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
