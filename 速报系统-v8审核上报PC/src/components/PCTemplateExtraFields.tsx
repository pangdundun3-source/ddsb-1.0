import React, { useEffect, useState } from 'react';
import {
  Camera,
  Check,
  ChevronDown,
  Info,
  Link as LinkIcon,
  Loader2,
  RefreshCw,
  Trash2,
  X,
} from 'lucide-react';
import { TemplateExtraField, TemplateFieldValue } from '../types';

interface PCTemplateExtraFieldsProps {
  fields: TemplateExtraField[];
  values: Record<string, TemplateFieldValue>;
  errors: Record<string, boolean>;
  onChange: (fieldId: string, value: TemplateFieldValue) => void;
}

type LinkShotState = {
  status: 'loading' | 'done' | 'empty' | 'invalid';
  url: string;
  shotAt?: string;
};

const asString = (value: TemplateFieldValue | undefined) =>
  typeof value === 'string' ? value : '';

const asNumber = (value: TemplateFieldValue | undefined) =>
  typeof value === 'number' ? value : '';

const asStringList = (value: TemplateFieldValue | undefined) =>
  Array.isArray(value) ? value : [];

export const isValidLink = (value: string) => {
  try {
    const parsed = new URL(value.trim());
    return /^https?:$/.test(parsed.protocol) && Boolean(parsed.hostname);
  } catch {
    return false;
  }
};

const hasValue = (field: TemplateExtraField, value: TemplateFieldValue | undefined) => {
  if (field.type === 'static_text') return true;
  if (field.type === 'checkbox' || field.type === 'multi_select' || field.type === 'attachment') {
    return asStringList(value).length > 0;
  }
  if (field.type === 'number') return typeof value === 'number' && Number.isFinite(value);
  return Boolean(String(value ?? '').trim());
};

export const getFieldError = (
  field: TemplateExtraField,
  value: TemplateFieldValue | undefined
) => {
  if (field.required && !hasValue(field, value)) return `请填写${field.label}`;
  if (field.type === 'link' && String(value ?? '').trim() && !isValidLink(String(value))) {
    return '请输入正确的网址，需以 http:// 或 https:// 开头';
  }
  return null;
};

export const createInitialTemplateValues = (fields: TemplateExtraField[]) =>
  Object.fromEntries(
    fields
      .filter((field) => field.type !== 'static_text' && field.type !== 'attachment')
      .map((field) => {
        if (field.defaultValue !== undefined) return [field.id, field.defaultValue];
        if (field.type === 'checkbox' || field.type === 'multi_select') return [field.id, []];
        return [field.id, field.type === 'number' ? null : ''];
      })
  ) as Record<string, TemplateFieldValue>;

const fieldBorder = (hasError: boolean) =>
  hasError ? 'border-rose-400 focus:ring-rose-200' : 'border-gray-300 focus:ring-[#1E5ABB]/20';

const FieldError: React.FC<{ message: string }> = ({ message }) => (
  <p className="text-[11px] text-rose-500 mt-1">{message}</p>
);

export const PCTemplateExtraFields: React.FC<PCTemplateExtraFieldsProps> = ({
  fields,
  values,
  errors,
  onChange,
}) => {
  const visibleFields = fields.filter(
    (field) => field.type !== 'attachment' && field.type !== 'static_text'
  );
  const [openMultiSelectId, setOpenMultiSelectId] = useState<string | null>(null);
  const [linkShots, setLinkShots] = useState<Record<string, LinkShotState>>({});
  const [linkShotViewer, setLinkShotViewer] = useState<{ url: string; shotAt?: string } | null>(null);

  useEffect(() => {
    if (!openMultiSelectId) return;
    const closeOutside = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (!target?.closest(`[data-pc-multi-select="${openMultiSelectId}"]`)) {
        setOpenMultiSelectId(null);
      }
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [openMultiSelectId]);

  if (visibleFields.length === 0) return null;

  const captureLink = (fieldId: string, rawUrl: string) => {
    const url = rawUrl.trim();
    if (!url) {
      setLinkShots((prev) => ({ ...prev, [fieldId]: { status: 'empty', url: '' } }));
      return;
    }
    if (!isValidLink(url)) {
      setLinkShots((prev) => ({ ...prev, [fieldId]: { status: 'invalid', url } }));
      return;
    }
    setLinkShots((prev) => ({ ...prev, [fieldId]: { status: 'loading', url } }));
    window.setTimeout(() => {
      const now = new Date();
      const pad = (value: number) => String(value).padStart(2, '0');
      const shotAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
      setLinkShots((prev) => {
        if (prev[fieldId]?.url !== url) return prev;
        return { ...prev, [fieldId]: { status: 'done', url, shotAt } };
      });
    }, 700);
  };

  return (
    <>
      <div className="space-y-3">
        {visibleFields.map((field) => {
          const value = values[field.id];
          const hasError = Boolean(errors[field.id]);
          const errorMessage = hasError ? getFieldError(field, value) : null;
          const listValue = asStringList(value);
          const selectedLabels = (field.options || [])
            .filter((option) => listValue.includes(option.value))
            .map((option) => option.label);
          const visibleLabels = selectedLabels.slice(0, 3);
          const overflowCount = selectedLabels.length - visibleLabels.length;
          const linkShot = linkShots[field.id];

          if (field.type === 'static_text') {
            return (
              <div key={field.id} className="flex items-start gap-2 rounded-lg border border-blue-100 bg-white px-3 py-2 text-[11px] text-blue-700">
                <Info className="w-3.5 h-3.5 mt-px shrink-0" />
                <span>{field.content}</span>
              </div>
            );
          }

          return (
            <div key={field.id} id={`pc-template-field-${field.id}`}>
              <label className="block text-gray-700 font-bold mb-1">
                {field.label}
                {field.required && <span className="text-rose-500 ml-0.5">*</span>}
              </label>

              {field.type === 'number' && (
                <input
                  type="number"
                  value={asNumber(value)}
                  min={field.min}
                  max={field.max}
                  placeholder={field.placeholder}
                  onChange={(event) =>
                    onChange(field.id, event.target.value === '' ? null : Number(event.target.value))
                  }
                  className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 ${fieldBorder(hasError)}`}
                />
              )}

              {field.type === 'date' && (
                <input
                  type="date"
                  value={asString(value)}
                  onChange={(event) => onChange(field.id, event.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 ${fieldBorder(hasError)}`}
                />
              )}

              {field.type === 'radio' && (
                <div className="flex flex-wrap gap-2">
                  {(field.options || []).map((option) => {
                    const checked = asString(value) === option.value;
                    return (
                      <label
                        key={option.value}
                        className={`px-3 py-1.5 rounded-lg border cursor-pointer text-xs ${
                          checked
                            ? 'border-[#1E5ABB] bg-blue-50 text-[#1E5ABB] font-bold'
                            : 'border-gray-300 bg-white text-gray-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name={field.id}
                          checked={checked}
                          onChange={() => onChange(field.id, option.value)}
                          className="sr-only"
                        />
                        {option.label}
                      </label>
                    );
                  })}
                </div>
              )}

              {field.type === 'checkbox' && (
                <div className="grid grid-cols-2 gap-2">
                  {(field.options || []).map((option) => {
                    const checked = listValue.includes(option.value);
                    return (
                      <label
                        key={option.value}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-xs ${
                          checked ? 'border-[#1E5ABB] bg-blue-50 text-[#1E5ABB]' : 'border-gray-300 bg-white text-gray-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            onChange(
                              field.id,
                              checked
                                ? listValue.filter((item) => item !== option.value)
                                : [...listValue, option.value]
                            )
                          }
                          className="sr-only"
                        />
                        <span className={`w-4 h-4 rounded border flex items-center justify-center ${checked ? 'bg-[#1E5ABB] border-[#1E5ABB] text-white' : 'bg-white border-gray-300'}`}>
                          {checked && <Check className="w-3 h-3" />}
                        </span>
                        {option.label}
                      </label>
                    );
                  })}
                </div>
              )}

              {field.type === 'select' && (
                <select
                  value={asString(value)}
                  onChange={(event) => onChange(field.id, event.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 bg-white ${fieldBorder(hasError)}`}
                >
                  <option value="">{field.placeholder || '请选择'}</option>
                  {(field.options || []).map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              )}

              {field.type === 'multi_select' && (
                <div className="relative" data-pc-multi-select={field.id}>
                  <button
                    type="button"
                    aria-expanded={openMultiSelectId === field.id}
                    onClick={() =>
                      setOpenMultiSelectId((current) => (current === field.id ? null : field.id))
                    }
                    className={`w-full px-3 py-2 border rounded-lg bg-white flex items-center justify-between gap-2 text-left text-xs ${fieldBorder(hasError)}`}
                  >
                    <span className="min-w-0 flex items-center gap-1">
                      {selectedLabels.length > 0 ? (
                        <>
                          <span className="truncate text-gray-700">{visibleLabels.join('、')}</span>
                          {overflowCount > 0 && (
                            <span className="shrink-0 px-1.5 py-0.5 rounded bg-blue-100 text-[10px] font-semibold text-blue-700">
                              +{overflowCount}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-400">{field.placeholder || '请选择（可多选）'}</span>
                      )}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 shrink-0 ${openMultiSelectId === field.id ? 'rotate-180' : ''}`} />
                  </button>
                  {openMultiSelectId === field.id && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-40 rounded-lg border border-gray-200 bg-white shadow-xl p-1.5">
                      {(field.options || []).map((option) => {
                        const checked = listValue.includes(option.value);
                        return (
                          <label
                            key={option.value}
                            className={`flex items-center gap-2 rounded px-2 py-1.5 cursor-pointer text-xs ${
                              checked ? 'bg-blue-50 text-[#1E5ABB]' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                onChange(
                                  field.id,
                                  checked
                                    ? listValue.filter((item) => item !== option.value)
                                    : [...listValue, option.value]
                                )
                              }
                              className="sr-only"
                            />
                            <span className={`w-4 h-4 rounded border flex items-center justify-center ${checked ? 'bg-[#1E5ABB] border-[#1E5ABB] text-white' : 'bg-white border-gray-300'}`}>
                              {checked && <Check className="w-3 h-3" />}
                            </span>
                            {option.label}
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {field.type === 'link' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <LinkIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="url"
                        value={asString(value)}
                        placeholder={field.placeholder || 'https://...'}
                        onChange={(event) => {
                          onChange(field.id, event.target.value);
                          setLinkShots((prev) => {
                            const next = { ...prev };
                            delete next[field.id];
                            return next;
                          });
                        }}
                        className={`w-full pl-8 pr-3 py-2 border rounded-lg text-xs font-mono focus:outline-none focus:ring-2 ${fieldBorder(hasError)}`}
                      />
                    </div>
                    {linkShot?.status !== 'done' && (
                      <button
                        type="button"
                        disabled={linkShot?.status === 'loading'}
                        onClick={() => captureLink(field.id, asString(value))}
                        className="px-3 py-2 border border-blue-200 rounded-lg text-blue-700 text-xs font-semibold flex items-center gap-1 bg-white hover:bg-blue-50 disabled:text-gray-400"
                      >
                        {linkShot?.status === 'loading' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                        {linkShot?.status === 'loading' ? '截图中' : '截图'}
                      </button>
                    )}
                  </div>

                  {linkShot?.status === 'empty' && <p className="text-[11px] text-amber-600">请先输入链接再截图</p>}
                  {linkShot?.status === 'invalid' && <p className="text-[11px] text-rose-500">网址格式不正确，请修改后重试</p>}
                  {linkShot?.status === 'done' && (
                    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-2">
                      <button
                        type="button"
                        onClick={() => setLinkShotViewer({ url: linkShot.url, shotAt: linkShot.shotAt })}
                        className="w-24 h-14 rounded border border-gray-200 bg-white overflow-hidden"
                      >
                        <div className="h-2.5 bg-gray-100 border-b border-gray-200" />
                        <div className="p-2 space-y-1">
                          <div className="h-1.5 w-3/4 bg-gray-300 rounded" />
                          <div className="h-1 w-1/2 bg-gray-200 rounded" />
                          <div className="h-4 bg-blue-50 rounded" />
                        </div>
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] text-emerald-600 font-medium">已截取原文 · {linkShot.shotAt}</div>
                        <div className="flex gap-3 mt-1 text-[11px]">
                          <button type="button" onClick={() => captureLink(field.id, linkShot.url)} className="text-blue-600 flex items-center gap-0.5">
                            <RefreshCw className="w-3 h-3" />重新截图
                          </button>
                          <button
                            type="button"
                            onClick={() => setLinkShots((prev) => {
                              const next = { ...prev };
                              delete next[field.id];
                              return next;
                            })}
                            className="text-gray-500 flex items-center gap-0.5"
                          >
                            <Trash2 className="w-3 h-3" />删除
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {errorMessage && <FieldError message={errorMessage} />}
            </div>
          );
        })}
      </div>

      {linkShotViewer && (
        <div className="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center p-4" onClick={() => setLinkShotViewer(null)}>
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden" onClick={(event) => event.stopPropagation()}>
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-gray-800">原文截图</div>
                <div className="text-[11px] text-gray-400">{linkShotViewer.url}</div>
              </div>
              <button type="button" onClick={() => setLinkShotViewer(null)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 bg-gray-50">
              <div className="h-[360px] bg-white border border-gray-200 rounded-lg p-6 space-y-4">
                <div className="h-5 w-4/5 rounded bg-gray-700" />
                <div className="h-2.5 w-1/2 rounded bg-gray-300" />
                <div className="h-40 rounded-lg bg-blue-100" />
                <div className="h-2 rounded bg-gray-200" />
                <div className="h-2 w-4/5 rounded bg-gray-200" />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
