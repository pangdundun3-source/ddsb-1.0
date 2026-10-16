import React, { useEffect, useMemo, useState } from 'react';
import { confirmDialog } from '../common/ConfirmDialog';
import {
  ArrowDown,
  ArrowUp,
  Braces,
  Brackets,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  Code,
  Copy,
  Database,
  EllipsisVertical,
  FileText,
  Folder,
  FolderOpen,
  FolderPlus,
  GitBranch,
  ListChecks,
  ListTree,
  Lock,
  Pencil,
  Plus,
  Save,
  Search,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Tag,
  Trash2,
  X,
} from 'lucide-react';

const STORAGE_KEY = 'mt_global_dict_registry';
const PATH_PREFIX = 'V8-P-10/register-tree';
const CATEGORY_CODE_PATTERN = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$/;
const ITEM_KEY_PATTERN = /^[a-z][a-z0-9_]*$/;

interface DictCategory {
  id: string;
  name: string;
  code: string;
  parentId: string | null;
  sort: number;
  remark: string;
  protected?: boolean;
}

type ValueType = 'text' | 'options' | 'json';
type TextMode = 'single' | 'multi';

interface DictOption {
  label: string;
  value: string;
}

interface DictItem {
  id: string;
  categoryId: string;
  label: string;
  key: string;
  valueType: ValueType;
  textMode: TextMode;
  textValue: string;
  options: DictOption[];
  defaultOption: string;
  jsonValue: string;
  remark: string;
  sort: number;
  preventDelete: boolean;
}

interface RegistryData {
  categories: DictCategory[];
  items: DictItem[];
}

type TypeFilter = 'all' | 'text' | 'text_single' | 'text_multi' | 'options' | 'json';

const TYPE_FILTERS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: '全部配置类型' },
  { value: 'text', label: '普通文本 (全部)' },
  { value: 'text_single', label: '普通文本 (单行)' },
  { value: 'text_multi', label: '普通文本 (多行)' },
  { value: 'options', label: '选项列表' },
  { value: 'json', label: 'JSON 结构' },
];

const VALUE_TYPE_TABS: { value: ValueType; label: string; mode: string; icon: React.ElementType }[] = [
  { value: 'text', label: '普通文本', mode: '普通文本模式', icon: FileText },
  { value: 'options', label: '选项列表', mode: '选项列表模式', icon: ListChecks },
  { value: 'json', label: 'JSON', mode: 'JSON结构模式', icon: Code },
];

const OPTION_PRESETS: { label: string; options: DictOption[] }[] = [
  { label: '启用 / 禁用', options: [{ label: '启用', value: 'enabled' }, { label: '禁用', value: 'disabled' }] },
  { label: '是 / 否', options: [{ label: '是', value: 'yes' }, { label: '否', value: 'no' }] },
  { label: '开启 / 关闭', options: [{ label: '开启', value: 'on' }, { label: '关闭', value: 'off' }] },
  {
    label: '高 / 中 / 低',
    options: [
      { label: '高', value: 'high' },
      { label: '中', value: 'medium' },
      { label: '低', value: 'low' },
    ],
  },
];

const DEFAULT_DATA: RegistryData = {
  categories: [
    {
      id: 'cat_ddsb',
      name: '点点速报 - 清朗净网鉴谣速报系统',
      code: 'ddsb',
      parentId: null,
      sort: 1,
      remark: '速报系统全局参数根节点，承载平台级通用配置。',
      protected: true,
    },
    {
      id: 'cat_rumor',
      name: '鉴谣核查与速报通报',
      code: 'ddsb.rumor',
      parentId: 'cat_ddsb',
      sort: 1,
      remark: '涉谣线索核验库、快速辟谣通稿模版及广播通道',
      protected: true,
    },
    {
      id: 'cat_rumor_channel',
      name: '辟谣通报极速发布渠道',
      code: 'ddsb.rumor.channel',
      parentId: 'cat_rumor',
      sort: 1,
      remark: '辟谣通报对外发布的渠道开关与默认参数。',
    },
  ],
  items: [
    {
      id: 'item_system_name',
      categoryId: 'cat_ddsb',
      label: '平台系统全称',
      key: 'system_name',
      valueType: 'text',
      textMode: 'single',
      textValue: '点点速报 - 清朗净网鉴谣速报系统',
      options: [],
      defaultOption: '',
      jsonValue: '',
      remark: '登录页、页眉与导出文件抬头展示的系统全称。',
      sort: 1,
      preventDelete: true,
    },
    {
      id: 'item_alert_threshold',
      categoryId: 'cat_ddsb',
      label: '预警置信度',
      key: 'alert_threshold',
      valueType: 'options',
      textMode: 'single',
      textValue: '',
      options: OPTION_PRESETS[3].options,
      defaultOption: 'medium',
      jsonValue: '',
      remark: '舆情预警触发的默认置信度档位。',
      sort: 2,
      preventDelete: false,
    },
    {
      id: 'item_channel_wechat',
      categoryId: 'cat_rumor_channel',
      label: '公众号推送开关',
      key: 'wechat_push',
      valueType: 'options',
      textMode: 'single',
      textValue: '',
      options: OPTION_PRESETS[2].options,
      defaultOption: 'on',
      jsonValue: '',
      remark: '辟谣通报发布后是否同步推送至机构公众号。',
      sort: 1,
      preventDelete: false,
    },
    {
      id: 'item_channel_config',
      categoryId: 'cat_rumor_channel',
      label: '发布渠道参数',
      key: 'channel_config',
      valueType: 'json',
      textMode: 'single',
      textValue: '',
      options: [],
      defaultOption: '',
      jsonValue: '{\n  "retry": 3,\n  "timeout_ms": 5000\n}',
      remark: '渠道调用的重试次数与超时时间。',
      sort: 2,
      preventDelete: false,
    },
  ],
};

const readData = (): RegistryData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as RegistryData;
      if (Array.isArray(parsed.categories) && Array.isArray(parsed.items)) return parsed;
    }
  } catch {
    // Ignore malformed storage and fall back to defaults.
  }
  return DEFAULT_DATA;
};

const writeData = (data: RegistryData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage may be unavailable in private or restricted browser contexts.
  }
};

const buildPath = (code: string, key?: string) =>
  `${PATH_PREFIX}/${code.split('.').join('/')}${key !== undefined ? `/${key || '<item_key>'}` : ''}`;

const isValidJson = (text: string) => {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
};

const copyText = (text: string) => {
  navigator.clipboard?.writeText(text).catch(() => undefined);
};

const genId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

const describeValue = (item: DictItem) => {
  if (item.valueType === 'options') {
    const def = item.options.find((option) => option.value === item.defaultOption);
    return `${item.options.map((option) => option.label).join(' / ')}${def ? `（默认：${def.label}）` : ''}`;
  }
  if (item.valueType === 'json') return item.jsonValue.replace(/\s+/g, ' ');
  return item.textValue || '—';
};

const typeBadge = (item: DictItem) => {
  if (item.valueType === 'options') return { text: '选项列表', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  if (item.valueType === 'json') return { text: 'JSON', cls: 'bg-violet-50 text-violet-700 border-violet-200' };
  return {
    text: item.textMode === 'multi' ? '多行文本' : '单行文本',
    cls: 'bg-blue-50 text-[#1E3A6B] border-blue-200',
  };
};

const inputClass =
  'w-full h-10 px-3 bg-[#f7f9fc] border border-[#e1e7f0] rounded text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-[#1890ff] focus:ring-1 focus:ring-[#1890ff]';

/* ------------------------------------------------------------------ */
/* Modal shell                                                         */
/* ------------------------------------------------------------------ */

const ModalShell: React.FC<{
  title: string;
  icon: React.ElementType;
  width: string;
  onClose: () => void;
  footer: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon: Icon, width, onClose, footer, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" onClick={onClose}>
    <div
      role="dialog"
      aria-modal="true"
      className={`w-full ${width} bg-white rounded-md shadow-2xl overflow-hidden flex flex-col max-h-[92vh]`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-6 py-4 bg-[#1E3A6B] text-white shrink-0">
        <div className="flex items-center gap-2.5">
          <Icon className="w-5 h-5 text-blue-200" strokeWidth={1.75} />
          <h3 className="text-base font-bold">{title}</h3>
        </div>
        <button type="button" onClick={onClose} className="text-white/70 hover:text-white cursor-pointer" aria-label="关闭">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">{children}</div>
      <div className="mx-6 py-4 border-t border-gray-100 flex justify-end gap-3 shrink-0">{footer}</div>
    </div>
  </div>
);

const FieldLabel: React.FC<{ children: React.ReactNode; required?: boolean; extra?: React.ReactNode }> = ({
  children,
  required,
  extra,
}) => (
  <div className="flex items-center justify-between mb-2">
    <label className="text-sm font-bold text-gray-800">
      {children}
      {required && <span className="ml-0.5">*</span>}
    </label>
    {extra}
  </div>
);

/* ------------------------------------------------------------------ */
/* Category modal                                                      */
/* ------------------------------------------------------------------ */

interface CategoryDraft {
  id?: string;
  name: string;
  code: string;
  parentId: string | null;
  sort: number;
  remark: string;
}

const CategoryModal: React.FC<{
  draft: CategoryDraft;
  categories: DictCategory[];
  onClose: () => void;
  onSave: (draft: CategoryDraft) => string | null;
}> = ({ draft: initial, categories, onClose, onSave }) => {
  const [draft, setDraft] = useState(initial);
  const [error, setError] = useState('');
  const isEdit = Boolean(initial.id);

  const blockedIds = useMemo(() => {
    if (!initial.id) return new Set<string>();
    const ids = new Set<string>([initial.id]);
    let added = true;
    while (added) {
      added = false;
      categories.forEach((cat) => {
        if (cat.parentId && ids.has(cat.parentId) && !ids.has(cat.id)) {
          ids.add(cat.id);
          added = true;
        }
      });
    }
    return ids;
  }, [categories, initial.id]);

  const parentOptions = useMemo(() => {
    const result: { id: string; label: string }[] = [];
    const walk = (parentId: string | null, depth: number) => {
      categories
        .filter((cat) => cat.parentId === parentId)
        .sort((a, b) => a.sort - b.sort)
        .forEach((cat) => {
          if (blockedIds.has(cat.id)) return;
          result.push({ id: cat.id, label: `${'　'.repeat(depth)}${cat.name}` });
          walk(cat.id, depth + 1);
        });
    };
    walk(null, 0);
    return result;
  }, [blockedIds, categories]);

  const submit = () => {
    const message = onSave({ ...draft, name: draft.name.trim(), code: draft.code.trim(), remark: draft.remark.trim() });
    if (message) setError(message);
  };

  return (
    <ModalShell
      title={isEdit ? '编辑字典分类 (dict_category)' : '新增字典分类 (dict_category)'}
      icon={ListTree}
      width="max-w-[580px]"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-gray-700 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer"
          >
            取消
          </button>
          <button
            type="button"
            onClick={submit}
            className="px-6 py-2.5 text-sm font-bold text-white bg-[#1E3A6B] rounded hover:bg-[#162d54] cursor-pointer"
          >
            确认保存分类
          </button>
        </>
      }
    >
      <div>
        <FieldLabel required>分类显示名称</FieldLabel>
        <input
          autoFocus
          value={draft.name}
          maxLength={40}
          onChange={(e) => {
            setDraft({ ...draft, name: e.target.value });
            setError('');
          }}
          placeholder="例如：界面全局配置、视频AI识别标签"
          className={inputClass}
        />
      </div>
      <div>
        <FieldLabel required>分类唯一编码 (category_code)</FieldLabel>
        <input
          value={draft.code}
          maxLength={80}
          onChange={(e) => {
            setDraft({ ...draft, code: e.target.value.toLowerCase() });
            setError('');
          }}
          placeholder="例如：system.ui、video.ai.recognize"
          className={`${inputClass} font-mono`}
        />
        <p className="text-xs text-[#5b7bb0] mt-1.5">建议使用英文小写加点分格式</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel>父级分类</FieldLabel>
          <select
            value={draft.parentId ?? ''}
            onChange={(e) => setDraft({ ...draft, parentId: e.target.value || null })}
            className={`${inputClass} font-bold cursor-pointer`}
          >
            <option value="">（顶级分类）</option>
            {parentOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <FieldLabel>显示排序号</FieldLabel>
          <input
            type="number"
            min={1}
            value={draft.sort}
            onChange={(e) => setDraft({ ...draft, sort: Math.max(1, Number(e.target.value) || 1) })}
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <FieldLabel>业务用途说明</FieldLabel>
        <textarea
          value={draft.remark}
          maxLength={200}
          rows={3}
          onChange={(e) => setDraft({ ...draft, remark: e.target.value })}
          placeholder="说明该分类归属的系统模块与业务范围..."
          className={`${inputClass} h-auto py-2.5 resize-none`}
        />
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-rose-600">
          <CircleAlert className="w-3.5 h-3.5" />
          {error}
        </p>
      )}
    </ModalShell>
  );
};

/* ------------------------------------------------------------------ */
/* Item modal                                                          */
/* ------------------------------------------------------------------ */

type ItemDraft = Omit<DictItem, 'id'> & { id?: string };

const ItemModal: React.FC<{
  draft: ItemDraft;
  category: DictCategory;
  onClose: () => void;
  onSave: (draft: ItemDraft) => string | null;
  onCopy: (label: string, value: string) => void;
}> = ({ draft: initial, category, onClose, onSave, onCopy }) => {
  const [draft, setDraft] = useState(initial);
  const [error, setError] = useState('');
  const isEdit = Boolean(initial.id);
  const fullPath = buildPath(category.code, draft.key);
  const jsonValid = draft.jsonValue.trim() === '' || isValidJson(draft.jsonValue);
  const modeLabel = VALUE_TYPE_TABS.find((tab) => tab.value === draft.valueType)?.mode;

  const patch = (next: Partial<ItemDraft>) => {
    setDraft((prev) => ({ ...prev, ...next }));
    setError('');
  };

  const updateOption = (index: number, next: Partial<DictOption>) => {
    const options = draft.options.map((option, i) => (i === index ? { ...option, ...next } : option));
    const prevValue = draft.options[index].value;
    patch({
      options,
      defaultOption: next.value !== undefined && draft.defaultOption === prevValue ? next.value : draft.defaultOption,
    });
  };

  const moveOption = (index: number, offset: number) => {
    const target = index + offset;
    if (target < 0 || target >= draft.options.length) return;
    const options = [...draft.options];
    [options[index], options[target]] = [options[target], options[index]];
    patch({ options });
  };

  const removeOption = (index: number) => {
    const removed = draft.options[index];
    const options = draft.options.filter((_, i) => i !== index);
    patch({
      options,
      defaultOption: removed.value === draft.defaultOption ? options[0]?.value ?? '' : draft.defaultOption,
    });
  };

  const addOption = () => {
    let n = draft.options.length + 1;
    while (draft.options.some((option) => option.value === `opt_${n}`)) n += 1;
    const options = [...draft.options, { label: `选项${n}`, value: `opt_${n}` }];
    patch({ options, defaultOption: draft.defaultOption || options[0].value });
  };

  const beautifyJson = () => {
    if (!isValidJson(draft.jsonValue)) return;
    patch({ jsonValue: JSON.stringify(JSON.parse(draft.jsonValue), null, 2) });
  };

  const submit = () => {
    const message = onSave({ ...draft, label: draft.label.trim(), key: draft.key.trim(), remark: draft.remark.trim() });
    if (message) setError(message);
  };

  return (
    <ModalShell
      title={isEdit ? '编辑配置项 (dict_item)' : '新建配置项 (dict_item)'}
      icon={SlidersHorizontal}
      width="max-w-[860px]"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-gray-700 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer"
          >
            取消
          </button>
          <button
            type="button"
            onClick={submit}
            className="px-8 py-2.5 text-sm font-bold text-white bg-[#1E3A6B] rounded hover:bg-[#162d54] cursor-pointer"
          >
            确认保存配置项
          </button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-5">
        <div>
          <FieldLabel required>中文显示名称 (item_label)</FieldLabel>
          <input
            autoFocus
            value={draft.label}
            maxLength={40}
            onChange={(e) => patch({ label: e.target.value })}
            placeholder="例如：平台系统全称、预警置信度"
            className={inputClass}
          />
        </div>
        <div>
          <FieldLabel required extra={<span className="text-xs font-bold text-[#1890ff]">同级分类下唯一</span>}>
            程序读取的 Key (item_key)
          </FieldLabel>
          <input
            value={draft.key}
            maxLength={60}
            onChange={(e) => patch({ key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
            placeholder="例如：system_name、alert_threshold"
            className={`${inputClass} font-mono`}
          />
          <p className="text-xs text-gray-400 mt-1.5">仅允许英文小写与下划线</p>
        </div>
      </div>

      <div>
        <FieldLabel
          extra={<span className="text-xs text-gray-400">随程序读取 Key 实时同步变化</span>}
        >
          完整路径
          <span className="ml-2 text-[11px] font-normal text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">只读</span>
        </FieldLabel>
        <div className="flex items-center gap-2.5">
          <div className="flex-1 h-10 px-3 flex items-center justify-between gap-2 bg-[#f1f5fb] border border-[#e1e7f0] rounded font-mono text-sm text-[#1E3A6B] min-w-0">
            <span className="truncate">{fullPath}</span>
            <Lock className="w-4 h-4 text-gray-400 shrink-0" />
          </div>
          <button
            type="button"
            onClick={() => onCopy('完整路径', fullPath)}
            className="h-10 px-4 inline-flex items-center gap-1.5 text-sm font-bold text-gray-700 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer shrink-0"
          >
            <Copy className="w-4 h-4" />
            复制路径
          </button>
        </div>
      </div>

      <div className="rounded border border-[#dbe4f0] bg-[#f7f9fc] p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <SlidersHorizontal className="w-5 h-5 text-[#1E3A6B] shrink-0" />
            <span className="text-base font-bold text-gray-900">值配置 *</span>
            <span className="text-xs text-gray-500 truncate">配置该参数的值形态与初始值，自动优化前后端交互与读取</span>
          </div>
          <span className="shrink-0 text-xs font-bold text-[#1890ff] bg-blue-50 border border-blue-200 rounded-full px-3 py-1">
            {modeLabel}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1 p-1 bg-[#e6ebf3] rounded">
          {VALUE_TYPE_TABS.map((tab) => {
            const active = draft.valueType === tab.value;
            const Icon = tab.icon;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  const next: Partial<ItemDraft> = { valueType: tab.value };
                  if (tab.value === 'options' && draft.options.length === 0) {
                    next.options = [
                      { label: '选项一', value: 'opt_1' },
                      { label: '选项二', value: 'opt_2' },
                    ];
                    next.defaultOption = 'opt_1';
                  }
                  if (tab.value === 'json' && !draft.jsonValue.trim()) {
                    next.jsonValue = '{\n  "key": "value"\n}';
                  }
                  patch(next);
                }}
                className={`h-10 inline-flex items-center justify-center gap-2 text-sm font-bold rounded-sm cursor-pointer transition-colors ${
                  active ? 'bg-white text-[#1E3A6B] shadow-sm border border-[#dbe4f0]' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {draft.valueType === 'text' && (
          <div className="space-y-3">
            <div className="inline-flex p-0.5 bg-[#e6ebf3] rounded-sm">
              {(['single', 'multi'] as TextMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => patch({ textMode: mode })}
                  className={`px-4 py-1.5 text-sm font-bold rounded-sm cursor-pointer ${
                    draft.textMode === mode ? 'bg-white text-[#1890ff] shadow-sm' : 'text-gray-600'
                  }`}
                >
                  {mode === 'single' ? '单行文本' : '多行长文本'}
                </button>
              ))}
            </div>
            <div>
              <FieldLabel>配置默认文本值</FieldLabel>
              {draft.textMode === 'single' ? (
                <input
                  value={draft.textValue}
                  onChange={(e) => patch({ textValue: e.target.value })}
                  placeholder="请输入默认文本配置值，例如：指令流转、https://...、utf-8"
                  className={`${inputClass} bg-white`}
                />
              ) : (
                <textarea
                  value={draft.textValue}
                  rows={4}
                  onChange={(e) => patch({ textValue: e.target.value })}
                  placeholder="请输入默认的多行文本配置值..."
                  className={`${inputClass} bg-white h-auto py-2.5`}
                />
              )}
            </div>
          </div>
        )}

        {draft.valueType === 'options' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap px-3 py-2.5 rounded border border-blue-100 bg-blue-50/60">
              <span className="text-xs font-bold text-[#1E3A6B]">常用模版一键套用：</span>
              {OPTION_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => patch({ options: preset.options, defaultOption: preset.options[0].value })}
                  className="px-2.5 py-1 text-xs font-bold text-[#1E3A6B] bg-white border border-[#c9d6ea] rounded-sm hover:border-[#1890ff] hover:text-[#1890ff] cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="border border-[#dbe4f0] rounded bg-white overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#f4f7fb] text-xs font-bold text-gray-600 border-b border-[#dbe4f0]">
                    <th className="px-4 py-2.5 text-left">显示名称 (Label) *</th>
                    <th className="px-4 py-2.5 text-left">选项值 (Value) *</th>
                    <th className="px-4 py-2.5 text-center w-28">默认选中</th>
                    <th className="px-4 py-2.5 text-center w-28">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {draft.options.map((option, index) => {
                    const isDefault = draft.defaultOption === option.value;
                    return (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="px-4 py-2">
                          <input
                            value={option.label}
                            onChange={(e) => updateOption(index, { label: e.target.value })}
                            className="w-full h-8 px-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-[#1890ff]"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            value={option.value}
                            onChange={(e) => updateOption(index, { value: e.target.value.replace(/\s/g, '') })}
                            className="w-full h-8 px-2.5 border border-gray-200 rounded-sm text-sm font-mono text-[#1890ff] focus:outline-none focus:border-[#1890ff]"
                          />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => patch({ defaultOption: option.value })}
                            className={`inline-flex items-center gap-1.5 text-xs cursor-pointer ${
                              isDefault ? 'text-[#1890ff] font-bold' : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            <span
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                isDefault ? 'border-[#1890ff]' : 'border-gray-400'
                              }`}
                            >
                              {isDefault && <span className="w-2 h-2 rounded-full bg-[#1890ff]" />}
                            </span>
                            {isDefault ? '默认' : '设默认'}
                          </button>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center justify-center gap-2 text-gray-400">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => moveOption(index, -1)}
                              className="hover:text-gray-700 disabled:text-gray-200 cursor-pointer disabled:cursor-not-allowed"
                              aria-label="上移"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              disabled={index === draft.options.length - 1}
                              onClick={() => moveOption(index, 1)}
                              className="hover:text-gray-700 disabled:text-gray-200 cursor-pointer disabled:cursor-not-allowed"
                              aria-label="下移"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              disabled={draft.options.length <= 1}
                              onClick={() => removeOption(index)}
                              className="hover:text-rose-500 disabled:text-gray-200 cursor-pointer disabled:cursor-not-allowed"
                              aria-label="删除"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="flex items-center justify-between px-4 py-3 bg-[#fafbfd]">
                <button
                  type="button"
                  onClick={addOption}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-bold text-[#1E3A6B] bg-white border border-gray-200 rounded-sm hover:border-[#1890ff] cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  添加选项
                </button>
                <span className="text-xs text-gray-500">
                  共 {draft.options.length} 个可用选项，默认选中值：
                  <span className="font-mono font-bold text-gray-800">{draft.defaultOption || '—'}</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {draft.valueType === 'json' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              {jsonValid ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-sm">
                  <CircleCheck className="w-4 h-4" />
                  JSON 格式合法
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-sm">
                  <CircleAlert className="w-4 h-4" />
                  JSON 格式错误
                </span>
              )}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={beautifyJson}
                  disabled={!jsonValid}
                  className="h-8 px-3 inline-flex items-center gap-1.5 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-sm hover:bg-gray-50 disabled:text-gray-300 cursor-pointer disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-4 h-4 text-[#1890ff]" />
                  一键美化
                </button>
                <button
                  type="button"
                  onClick={() => patch({ jsonValue: '{\n  \n}' })}
                  title="重置为对象"
                  className="w-8 h-8 inline-flex items-center justify-center text-gray-700 bg-white border border-gray-200 rounded-sm hover:bg-gray-50 cursor-pointer"
                >
                  <Braces className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => patch({ jsonValue: '[\n  \n]' })}
                  title="重置为数组"
                  className="w-8 h-8 inline-flex items-center justify-center text-gray-700 bg-white border border-gray-200 rounded-sm hover:bg-gray-50 cursor-pointer"
                >
                  <Brackets className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="border border-[#dbe4f0] rounded overflow-hidden bg-white">
              <div className="flex items-center justify-between px-4 py-2 bg-[#f4f7fb] border-b border-[#dbe4f0] text-xs font-mono text-gray-500">
                <span>JSON 编辑器 (UTF-8)</span>
                <span>字符数：{draft.jsonValue.length}</span>
              </div>
              <textarea
                value={draft.jsonValue}
                rows={7}
                spellCheck={false}
                onChange={(e) => patch({ jsonValue: e.target.value })}
                className="w-full px-4 py-3 font-mono text-sm text-gray-800 focus:outline-none resize-y"
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-[1fr_180px] gap-5">
        <div>
          <FieldLabel>业务用途说明 (remark)</FieldLabel>
          <input
            value={draft.remark}
            maxLength={120}
            onChange={(e) => patch({ remark: e.target.value })}
            placeholder="输入此配置项的业务用途与前后端读取规范..."
            className={inputClass}
          />
        </div>
        <div>
          <FieldLabel>显示排序号 (sort)</FieldLabel>
          <input
            type="number"
            min={1}
            value={draft.sort}
            onChange={(e) => patch({ sort: Math.max(1, Number(e.target.value) || 1) })}
            className={inputClass}
          />
        </div>
      </div>

      <label className="flex items-center justify-between gap-4 px-4 py-3.5 rounded border border-amber-200 bg-amber-50/60 cursor-pointer select-none">
        <span className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={draft.preventDelete}
            onChange={() => patch({ preventDelete: !draft.preventDelete })}
            className="w-5 h-5 accent-[#1E3A6B] cursor-pointer"
          />
          <Shield className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-bold text-gray-800">禁止删除 (prevent_delete)</span>
        </span>
        <span className="text-xs text-amber-700">勾选后该配置项删除按钮变灰禁用，防止误删造成系统崩溃</span>
      </label>

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-rose-600">
          <CircleAlert className="w-3.5 h-3.5" />
          {error}
        </p>
      )}
    </ModalShell>
  );
};

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

interface Props {
  showToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
  headerExtra?: React.ReactNode;
}

export const DictRegistryConfig: React.FC<Props> = ({ showToast, headerExtra }) => {
  const [data, setData] = useState<RegistryData>(readData);
  const [selectedId, setSelectedId] = useState<string>(() => data.categories.find((c) => c.code === 'ddsb.rumor')?.id ?? data.categories[0]?.id ?? '');
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(data.categories.map((c) => c.id)));
  const [treeKeyword, setTreeKeyword] = useState('');
  const [itemKeyword, setItemKeyword] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [menuId, setMenuId] = useState<string | null>(null);
  const [categoryDraft, setCategoryDraft] = useState<CategoryDraft | null>(null);
  const [itemDraft, setItemDraft] = useState<ItemDraft | null>(null);

  useEffect(() => {
    if (!menuId) return;
    const close = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest('[data-dict-menu]')) setMenuId(null);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuId]);

  const commit = (next: RegistryData) => {
    setData(next);
    writeData(next);
  };

  const categoryById = useMemo(() => new Map(data.categories.map((cat) => [cat.id, cat])), [data.categories]);
  const childrenOf = (parentId: string | null) =>
    data.categories.filter((cat) => cat.parentId === parentId).sort((a, b) => a.sort - b.sort);

  const selected = categoryById.get(selectedId) ?? data.categories[0];

  const breadcrumb = useMemo(() => {
    const chain: DictCategory[] = [];
    let cursor: DictCategory | undefined = selected;
    while (cursor) {
      chain.unshift(cursor);
      cursor = cursor.parentId ? categoryById.get(cursor.parentId) : undefined;
    }
    return chain;
  }, [categoryById, selected]);

  const visibleIds = useMemo(() => {
    const q = treeKeyword.trim().toLowerCase();
    if (!q) return null;
    const ids = new Set<string>();
    data.categories.forEach((cat) => {
      if (cat.name.toLowerCase().includes(q) || cat.code.toLowerCase().includes(q)) {
        let cursor: DictCategory | undefined = cat;
        while (cursor) {
          ids.add(cursor.id);
          cursor = cursor.parentId ? categoryById.get(cursor.parentId) : undefined;
        }
      }
    });
    return ids;
  }, [categoryById, data.categories, treeKeyword]);

  const categoryItems = useMemo(
    () => data.items.filter((item) => item.categoryId === selected?.id).sort((a, b) => a.sort - b.sort),
    [data.items, selected?.id]
  );

  const filteredItems = useMemo(() => {
    const q = itemKeyword.trim().toLowerCase();
    return categoryItems.filter((item) => {
      if (q && !item.key.toLowerCase().includes(q) && !item.label.toLowerCase().includes(q) && !item.remark.toLowerCase().includes(q)) {
        return false;
      }
      if (typeFilter === 'text') return item.valueType === 'text';
      if (typeFilter === 'text_single') return item.valueType === 'text' && item.textMode === 'single';
      if (typeFilter === 'text_multi') return item.valueType === 'text' && item.textMode === 'multi';
      if (typeFilter === 'options') return item.valueType === 'options';
      if (typeFilter === 'json') return item.valueType === 'json';
      return true;
    });
  }, [categoryItems, itemKeyword, typeFilter]);

  const handleCopy = (label: string, value: string) => {
    copyText(value);
    showToast(`已复制${label}：${value}`, 'success');
  };

  const openCreateCategory = (parent: DictCategory | null) => {
    setMenuId(null);
    setCategoryDraft({
      name: '',
      code: parent ? `${parent.code}.` : '',
      parentId: parent?.id ?? null,
      sort: childrenOf(parent?.id ?? null).length + 1,
      remark: '',
    });
  };

  const openEditCategory = (cat: DictCategory) => {
    setMenuId(null);
    setCategoryDraft({ id: cat.id, name: cat.name, code: cat.code, parentId: cat.parentId, sort: cat.sort, remark: cat.remark });
  };

  const saveCategory = (draft: CategoryDraft): string | null => {
    if (!draft.name) return '请填写分类显示名称';
    if (!draft.code) return '请填写分类唯一编码';
    if (!CATEGORY_CODE_PATTERN.test(draft.code)) return '编码仅支持英文小写、数字、下划线，以点分隔';
    if (data.categories.some((cat) => cat.code === draft.code && cat.id !== draft.id)) return '分类编码已存在';

    if (draft.id) {
      commit({
        ...data,
        categories: data.categories.map((cat) =>
          cat.id === draft.id
            ? { ...cat, name: draft.name, code: draft.code, parentId: draft.parentId, sort: draft.sort, remark: draft.remark }
            : cat
        ),
      });
      showToast(`分类「${draft.name}」已更新`, 'success');
    } else {
      const id = genId('cat');
      commit({
        ...data,
        categories: [
          ...data.categories,
          { id, name: draft.name, code: draft.code, parentId: draft.parentId, sort: draft.sort, remark: draft.remark },
        ],
      });
      setExpanded((prev) => new Set(prev).add(draft.parentId ?? id).add(id));
      setSelectedId(id);
      showToast(`已新增分类「${draft.name}」`, 'success');
    }
    setCategoryDraft(null);
    return null;
  };

  const deleteCategory = async (cat: DictCategory) => {
    setMenuId(null);
    const count = data.items.filter((item) => item.categoryId === cat.id).length;
    const ok = await confirmDialog(`确定删除分类「${cat.name}」吗？${count ? `其下 ${count} 个配置项将一并删除。` : ''}`, {
      title: '删除分类',
      okText: '确认删除',
      danger: true,
    });
    if (!ok) return;
    commit({
      categories: data.categories.filter((c) => c.id !== cat.id),
      items: data.items.filter((item) => item.categoryId !== cat.id),
    });
    if (selectedId === cat.id) setSelectedId(cat.parentId ?? data.categories[0]?.id ?? '');
    showToast(`分类「${cat.name}」已删除`, 'success');
  };

  const openCreateItem = () => {
    if (!selected) return;
    setItemDraft({
      categoryId: selected.id,
      label: '',
      key: '',
      valueType: 'text',
      textMode: 'single',
      textValue: '',
      options: [],
      defaultOption: '',
      jsonValue: '',
      remark: '',
      sort: categoryItems.length + 1,
      preventDelete: false,
    });
  };

  const saveItem = (draft: ItemDraft): string | null => {
    if (!draft.label) return '请填写中文显示名称';
    if (!draft.key) return '请填写程序读取的 Key';
    if (!ITEM_KEY_PATTERN.test(draft.key)) return 'Key 需以英文小写字母开头，仅包含小写字母、数字与下划线';
    if (data.items.some((item) => item.categoryId === draft.categoryId && item.key === draft.key && item.id !== draft.id)) {
      return '同级分类下已存在相同的 Key';
    }
    if (draft.valueType === 'options') {
      if (draft.options.length === 0) return '请至少添加一个选项';
      if (draft.options.some((option) => !option.label.trim() || !option.value.trim())) return '选项的显示名称与选项值均不能为空';
      if (new Set(draft.options.map((option) => option.value)).size !== draft.options.length) return '选项值不能重复';
    }
    if (draft.valueType === 'json' && !isValidJson(draft.jsonValue)) return 'JSON 格式不合法，请修正后再保存';

    const item: DictItem = { ...draft, id: draft.id ?? genId('item') };
    commit({
      ...data,
      items: draft.id ? data.items.map((it) => (it.id === draft.id ? item : it)) : [...data.items, item],
    });
    showToast(draft.id ? `配置项「${draft.label}」已更新` : `已新建配置项「${draft.label}」`, 'success');
    setItemDraft(null);
    return null;
  };

  const deleteItem = async (item: DictItem) => {
    if (item.preventDelete) return;
    const ok = await confirmDialog(`确定删除配置项「${item.label}」(${item.key}) 吗？`, {
      title: '删除配置项',
      okText: '确认删除',
      danger: true,
    });
    if (!ok) return;
    commit({ ...data, items: data.items.filter((it) => it.id !== item.id) });
    showToast(`配置项「${item.label}」已删除`, 'success');
  };

  const handleSaveAndRefresh = () => {
    writeData(data);
    showToast('字典配置已保存，并已通知各端刷新缓存', 'success');
  };

  const toggleExpand = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const renderNode = (cat: DictCategory, depth: number): React.ReactNode => {
    if (visibleIds && !visibleIds.has(cat.id)) return null;
    const children = childrenOf(cat.id);
    const hasChildren = children.length > 0;
    const isOpen = visibleIds ? true : expanded.has(cat.id);
    const isSelected = cat.id === selected?.id;
    const isRoot = cat.parentId === null;
    const deleteBlockedReason = cat.protected ? '系统保护中' : hasChildren ? '含下级分类' : '';
    const NodeIcon = isRoot ? Database : hasChildren ? (isOpen ? FolderOpen : Folder) : Tag;

    return (
      <div key={cat.id}>
        <div
          className={`group relative flex items-center gap-1.5 pr-2 py-2 cursor-pointer transition-colors ${
            isSelected ? 'bg-[#eaf2fd] text-[#1E3A6B]' : 'hover:bg-gray-50 text-gray-700'
          }`}
          style={{ paddingLeft: 10 + depth * 18 }}
          onClick={() => setSelectedId(cat.id)}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (hasChildren) toggleExpand(cat.id);
            }}
            className={`w-4 h-4 flex items-center justify-center shrink-0 text-gray-400 ${hasChildren ? 'cursor-pointer' : 'invisible'}`}
            aria-label={isOpen ? '收起' : '展开'}
          >
            {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
          <NodeIcon
            className={`w-4 h-4 shrink-0 ${isRoot ? 'text-amber-500' : hasChildren ? 'text-[#1890ff]' : 'text-gray-400'}`}
            strokeWidth={1.75}
          />
          <span className={`flex-1 min-w-0 truncate text-[13px] ${isRoot || isSelected ? 'font-bold' : ''}`} title={cat.name}>
            {cat.name}
          </span>
          <button
            type="button"
            data-dict-menu
            onClick={(e) => {
              e.stopPropagation();
              setMenuId(menuId === cat.id ? null : cat.id);
            }}
            className={`w-6 h-6 shrink-0 flex items-center justify-center rounded text-gray-500 hover:bg-white hover:text-gray-800 cursor-pointer ${
              menuId === cat.id ? 'opacity-100 bg-white' : isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
            aria-label="分类操作"
          >
            <EllipsisVertical className="w-4 h-4" />
          </button>

          {menuId === cat.id && (
            <div
              data-dict-menu
              onClick={(e) => e.stopPropagation()}
              className="absolute left-full top-0 ml-1 z-40 w-64 bg-white rounded-md border border-gray-200 shadow-xl py-1 cursor-default"
            >
              <div className="px-4 py-2.5 border-b border-gray-100">
                <div className="flex items-center gap-2 text-sm font-bold text-[#1E3A6B]">
                  <ListTree className="w-4 h-4 text-[#1890ff]" />
                  <span className="truncate">{cat.name}</span>
                </div>
                <div className="text-xs font-mono text-gray-400 mt-0.5 pl-6">{cat.code}</div>
              </div>
              <div className="py-1 border-b border-gray-100">
                <button type="button" onClick={() => openCreateCategory(cat)} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm font-bold text-gray-800 hover:bg-gray-50 cursor-pointer">
                  <FolderPlus className="w-4 h-4 text-[#1890ff]" />
                  新增下级分类 (下行节点)
                </button>
                <button
                  type="button"
                  onClick={() => openCreateCategory(cat.parentId ? categoryById.get(cat.parentId) ?? null : null)}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm font-bold text-gray-800 hover:bg-gray-50 cursor-pointer"
                >
                  <GitBranch className="w-4 h-4 text-emerald-600" />
                  新增同级分类
                </button>
              </div>
              <div className="py-1 border-b border-gray-100">
                <button type="button" onClick={() => openEditCategory(cat)} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm font-bold text-gray-800 hover:bg-gray-50 cursor-pointer">
                  <Pencil className="w-4 h-4 text-amber-500" />
                  编辑分类信息
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuId(null);
                    handleCopy('程序读取路径', buildPath(cat.code));
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  <Copy className="w-4 h-4 text-gray-500" />
                  复制程序读取路径
                </button>
              </div>
              <div className="py-1">
                <button
                  type="button"
                  disabled={Boolean(deleteBlockedReason)}
                  onClick={() => deleteCategory(cat)}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 cursor-pointer disabled:text-gray-300 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                >
                  {deleteBlockedReason ? <Lock className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                  删除分类{deleteBlockedReason ? ` (${deleteBlockedReason})` : ''}
                </button>
              </div>
            </div>
          )}
        </div>
        {hasChildren && isOpen && children.map((child) => renderNode(child, depth + 1))}
      </div>
    );
  };

  const roots = childrenOf(null);

  return (
    <div className="bg-white rounded-lg border border-gray-200/80 shadow-2xs flex min-h-[560px]">
      {/* 左侧分类树 */}
      <aside className="w-[290px] shrink-0 border-r border-gray-100 flex flex-col">
        <div className="px-4 pt-4 pb-3 space-y-3 border-b border-gray-100">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-[13px] font-bold text-gray-900 whitespace-nowrap">
              <ListTree className="w-4 h-4 text-[#1890ff] shrink-0" />
              字典分类目录 (Categories)
            </div>
            <div className="flex items-center text-xs text-gray-500 whitespace-nowrap shrink-0">
              <button type="button" onClick={() => setExpanded(new Set(data.categories.map((c) => c.id)))} className="px-1.5 hover:text-[#1890ff] cursor-pointer">
                展开
              </button>
              <span className="w-px h-3 bg-gray-200" />
              <button type="button" onClick={() => setExpanded(new Set())} className="px-1.5 hover:text-[#1890ff] cursor-pointer">
                折叠
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                value={treeKeyword}
                onChange={(e) => setTreeKeyword(e.target.value)}
                placeholder="搜索分类名称/编码..."
                className="w-full h-8 pl-8 pr-2 border border-gray-200 rounded-sm text-xs focus:outline-none focus:border-[#1890ff]"
              />
            </div>
            <button
              type="button"
              onClick={() => openCreateCategory(selected ?? null)}
              title="新增下级分类"
              className="w-8 h-8 shrink-0 flex items-center justify-center bg-[#1E3A6B] text-white rounded-sm hover:bg-[#162d54] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 py-2">
          {roots.map((root) => renderNode(root, 0))}
          {visibleIds && visibleIds.size === 0 && <p className="px-4 py-6 text-center text-xs text-gray-400">未找到匹配的分类</p>}
        </div>
      </aside>

      {/* 右侧配置项 */}
      <section className="flex-1 min-w-0 flex flex-col">
        {selected ? (
          <>
            <div className="px-5 pt-4 pb-4 space-y-3 border-b border-gray-100">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 min-w-0 flex-wrap">
                  {breadcrumb.map((cat, index) => (
                    <React.Fragment key={cat.id}>
                      {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-300" />}
                      <button
                        type="button"
                        onClick={() => setSelectedId(cat.id)}
                        className={`cursor-pointer hover:text-[#1890ff] ${index === breadcrumb.length - 1 ? 'font-bold text-gray-900' : ''}`}
                      >
                        {cat.name}
                      </button>
                    </React.Fragment>
                  ))}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {headerExtra}
                  <button
                    type="button"
                    onClick={handleSaveAndRefresh}
                    className="h-8 px-3.5 inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 rounded-sm hover:bg-emerald-700 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    保存并刷新缓存
                  </button>
                  <button
                    type="button"
                    onClick={openCreateItem}
                    className="h-8 px-3.5 inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#1E3A6B] rounded-sm hover:bg-[#162d54] cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    新建配置项 (dict_item)
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 px-3 py-2.5 bg-[#f7f9fc] border border-gray-100 rounded-sm text-xs">
                <span className="text-gray-500 truncate">说明：{selected.remark || '—'}</span>
                <span className="shrink-0 text-gray-700 font-bold">
                  本节点下共有 <span className="text-[#1890ff]">{categoryItems.length}</span> 项参数
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    value={itemKeyword}
                    onChange={(e) => setItemKeyword(e.target.value)}
                    placeholder="按配置KEY (item_key)、中文名称或说明快速检索..."
                    className="w-full h-8 pl-8 pr-2 border border-gray-200 rounded-sm text-xs focus:outline-none focus:border-[#1890ff]"
                  />
                </div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
                  className="h-8 w-36 px-2 border border-gray-200 rounded-sm text-xs font-bold text-gray-700 focus:outline-none focus:border-[#1890ff] cursor-pointer"
                >
                  {TYPE_FILTERS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {filteredItems.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16 text-center">
                <span className="w-11 h-11 flex items-center justify-center rounded bg-[#eef2f8]">
                  <SlidersHorizontal className="w-5 h-5 text-gray-500" />
                </span>
                <div className="text-sm font-bold text-gray-900">当前分类下暂无匹配的配置项</div>
                <p className="text-xs text-gray-500 max-w-[300px] leading-5">
                  您可以点击右上角「新建配置项」，为此分类注册全新的业务参数或环境变量。
                </p>
                <button
                  type="button"
                  onClick={openCreateItem}
                  className="mt-1 px-4 py-2 text-xs font-bold text-white bg-[#1E3A6B] rounded-sm hover:bg-[#162d54] cursor-pointer"
                >
                  + 新增第一条配置项
                </button>
              </div>
            ) : (
              <div className="p-5">
                <div className="border border-gray-100 rounded overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50/80 text-gray-500 border-b border-gray-200 text-left">
                        <th className="px-4 py-2.5 w-12">#</th>
                        <th className="px-3 py-2.5 w-52">配置项</th>
                        <th className="px-3 py-2.5 w-24">值类型</th>
                        <th className="px-3 py-2.5">默认值</th>
                        <th className="px-3 py-2.5 w-56">业务用途说明</th>
                        <th className="px-4 py-2.5 w-32 text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((item, index) => {
                        const badge = typeBadge(item);
                        return (
                          <tr key={item.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 align-top">
                            <td className="px-4 py-3 text-gray-400">{index + 1}</td>
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[13px] font-bold text-gray-800">{item.label}</span>
                                {item.preventDelete && <Shield className="w-3.5 h-3.5 text-amber-500" aria-label="禁止删除" />}
                              </div>
                              <div className="font-mono text-[11px] text-gray-400 mt-1">{item.key}</div>
                            </td>
                            <td className="px-3 py-3">
                              <span className={`inline-block px-1.5 py-0.5 rounded-sm border text-[11px] ${badge.cls}`}>{badge.text}</span>
                            </td>
                            <td className="px-3 py-3 text-gray-600">
                              <div className={`line-clamp-2 break-all ${item.valueType === 'json' ? 'font-mono text-[11px]' : ''}`}>
                                {describeValue(item)}
                              </div>
                            </td>
                            <td className="px-3 py-3 text-gray-500">
                              <div className="line-clamp-2">{item.remark || '—'}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-3 font-bold">
                                <button type="button" onClick={() => setItemDraft({ ...item })} className="text-[#1890ff] hover:text-blue-700 cursor-pointer">
                                  编辑
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleCopy('完整路径', buildPath(selected.code, item.key))}
                                  className="text-gray-500 hover:text-gray-800 cursor-pointer"
                                  title={buildPath(selected.code, item.key)}
                                >
                                  路径
                                </button>
                                <button
                                  type="button"
                                  disabled={item.preventDelete}
                                  onClick={() => deleteItem(item)}
                                  title={item.preventDelete ? '已开启禁止删除' : undefined}
                                  className="text-gray-400 hover:text-rose-600 cursor-pointer disabled:text-gray-200 disabled:cursor-not-allowed"
                                >
                                  删除
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-400">请先在左侧新增字典分类</div>
        )}
      </section>

      {categoryDraft && (
        <CategoryModal draft={categoryDraft} categories={data.categories} onClose={() => setCategoryDraft(null)} onSave={saveCategory} />
      )}
      {itemDraft && selected && (
        <ItemModal
          draft={itemDraft}
          category={categoryById.get(itemDraft.categoryId) ?? selected}
          onClose={() => setItemDraft(null)}
          onSave={saveItem}
          onCopy={handleCopy}
        />
      )}
    </div>
  );
};
