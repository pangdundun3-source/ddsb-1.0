import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  CalendarDays,
  Camera,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Info,
  Link as LinkIcon,
  Loader2,
  Paperclip,
  RefreshCw,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { TemplateExtraField, TemplateFieldValue } from '../types';

interface TemplateExtraFieldsProps {
  fields: TemplateExtraField[];
  values: Record<string, TemplateFieldValue>;
  errors: Record<string, boolean>;
  onChange: (fieldId: string, value: TemplateFieldValue) => void;
}

const asString = (value: TemplateFieldValue | undefined) =>
  typeof value === 'string' ? value : '';

const asNumber = (value: TemplateFieldValue | undefined) =>
  typeof value === 'number' ? value : '';

const asStringList = (value: TemplateFieldValue | undefined) =>
  Array.isArray(value) ? value : [];

type LinkShotState = {
  status: 'loading' | 'done' | 'empty' | 'invalid';
  url: string;
  shotAt?: string;
};

interface TemplateDatePickerProps {
  value: string;
  hasError: boolean;
  placeholder?: string;
  onChange: (value: string) => void;
}

const padDatePart = (value: number) => String(value).padStart(2, '0');

const formatDateValue = (year: number, month: number, day: number) =>
  `${year}-${padDatePart(month)}-${padDatePart(day)}`;

const parseDateValue = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
};

const TemplateDatePicker: React.FC<TemplateDatePickerProps> = ({
  value,
  hasError,
  placeholder,
  onChange,
}) => {
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);
  const today = new Date();
  const parsedValue = parseDateValue(value);
  const [isOpen, setIsOpen] = React.useState(false);
  const [viewYear, setViewYear] = React.useState(parsedValue?.year || today.getFullYear());
  const [viewMonth, setViewMonth] = React.useState(parsedValue?.month || today.getMonth() + 1);

  React.useEffect(() => {
    if (!isOpen) return;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutsidePointer);
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer);
  }, [isOpen]);

  const openCalendar = () => {
    const activeDate = parseDateValue(value) || {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
    };
    setViewYear(activeDate.year);
    setViewMonth(activeDate.month);
    setIsOpen((current) => !current);
  };

  const changeMonth = (offset: number) => {
    const next = new Date(viewYear, viewMonth - 1 + offset, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth() + 1);
  };

  const firstWeekday = (new Date(viewYear, viewMonth - 1, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
  const calendarCells: Array<number | null> = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  const selectDate = (day: number) => {
    onChange(formatDateValue(viewYear, viewMonth, day));
    setIsOpen(false);
  };

  const selectToday = () => {
    const now = new Date();
    onChange(formatDateValue(now.getFullYear(), now.getMonth() + 1, now.getDate()));
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={openCalendar}
        className={`w-full px-3 py-2 rounded-xl border bg-slate-50 flex items-center justify-between gap-2 text-left ${
          hasError ? 'border-rose-400' : 'border-slate-200'
        }`}
      >
        <span className={value ? 'text-slate-800' : 'text-slate-400'}>
          {value || placeholder || '请选择日期'}
        </span>
        <CalendarDays className="w-4 h-4 text-slate-400 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 z-40 rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden">
          <div className="px-2.5 py-2 border-b border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
              aria-label="上一个月"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-800">
              {viewYear}年{viewMonth}月
            </span>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
              aria-label="下一个月"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="p-2">
            <div className="grid grid-cols-7 mb-1">
              {['一', '二', '三', '四', '五', '六', '日'].map((weekday) => (
                <span key={weekday} className="h-6 flex items-center justify-center text-[10px] text-slate-400">
                  {weekday}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-0.5">
              {calendarCells.map((day, index) =>
                day === null ? (
                  <span key={`empty-${index}`} className="h-7" />
                ) : (
                  <button
                    key={day}
                    type="button"
                    onClick={() => selectDate(day)}
                    className={`h-7 rounded-lg text-[11px] flex items-center justify-center ${
                      parsedValue?.year === viewYear &&
                      parsedValue?.month === viewMonth &&
                      parsedValue?.day === day
                        ? 'bg-blue-600 text-white font-bold'
                        : today.getFullYear() === viewYear &&
                            today.getMonth() + 1 === viewMonth &&
                            today.getDate() === day
                          ? 'border border-blue-200 bg-blue-50 text-blue-700 font-semibold'
                          : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {day}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="px-2.5 py-1.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <button type="button" onClick={selectToday} className="text-[11px] text-blue-600 font-medium">
              今天
            </button>
            <button
              type="button"
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className="text-[11px] text-slate-500"
            >
              清除
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const allowedAttachmentExtensions = new Set([
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'ppt',
  'pptx',
  'txt',
  'csv',
  'zip',
  'rar',
]);

const MAX_ATTACHMENT_COUNT = 5;
const MAX_ATTACHMENT_SIZE_BYTES = 20 * 1024 * 1024;

const isAllowedAttachment = (file: File) => {
  if (file.type.startsWith('image/')) return true;
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  return allowedAttachmentExtensions.has(extension);
};

const getUrlHost = (url: string) => {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
};

export const isValidTemplateLink = (value: string) => {
  try {
    const parsed = new URL(value.trim());
    return /^https?:$/.test(parsed.protocol) && Boolean(parsed.hostname);
  } catch {
    return false;
  }
};

export const hasTemplateFieldValue = (
  field: TemplateExtraField,
  value: TemplateFieldValue | undefined
) => {
  if (field.type === 'static_text') return true;
  if (field.type === 'checkbox' || field.type === 'multi_select' || field.type === 'attachment') {
    return asStringList(value).length > 0;
  }
  if (field.type === 'number') return typeof value === 'number' && Number.isFinite(value);
  return Boolean(String(value ?? '').trim());
};

export const getTemplateFieldError = (
  field: TemplateExtraField,
  value: TemplateFieldValue | undefined
) => {
  if (
    field.type === 'attachment' &&
    asStringList(value).length > MAX_ATTACHMENT_COUNT
  ) {
    return `最多上传${MAX_ATTACHMENT_COUNT}个文件`;
  }
  if (field.required && !hasTemplateFieldValue(field, value)) {
    return `请填写${field.label}`;
  }
  if (field.type === 'link' && String(value ?? '').trim() && !isValidTemplateLink(String(value))) {
    return '请输入正确的网址，需以 http:// 或 https:// 开头';
  }
  return null;
};

export const createInitialTemplateFieldValues = (fields: TemplateExtraField[]) =>
  Object.fromEntries(
    fields
      .filter((field) => field.type !== 'static_text')
      .map((field) => {
        if (field.defaultValue !== undefined) return [field.id, field.defaultValue];
        if (field.type === 'checkbox' || field.type === 'multi_select' || field.type === 'attachment') {
          return [field.id, []];
        }
        return [field.id, field.type === 'number' ? null : ''];
      })
  ) as Record<string, TemplateFieldValue>;

const getInputBorderClass = (hasError: boolean) =>
  hasError
    ? 'border-rose-400 focus:ring-rose-200'
    : 'border-slate-200 focus:ring-blue-500';

const FieldLabel: React.FC<{ field: TemplateExtraField }> = ({ field }) => (
  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
    {field.label}
    {field.required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

const ErrorText: React.FC<{ message: string }> = ({ message }) => (
  <p className="text-[11px] text-rose-500 mt-1">{message}</p>
);

export const getTemplateFieldDomId = (fieldId: string) => `template-field-${fieldId}`;

export const TemplateExtraFields: React.FC<TemplateExtraFieldsProps> = ({
  fields,
  values,
  errors,
  onChange,
}) => {
  const [linkShots, setLinkShots] = useState<Record<string, LinkShotState>>({});
  const [linkShotViewer, setLinkShotViewer] = useState<{ url: string; shotAt?: string } | null>(null);
  const [attachmentWarnings, setAttachmentWarnings] = useState<Record<string, string>>({});
  const [openMultiSelectId, setOpenMultiSelectId] = useState<string | null>(null);

  useEffect(() => {
    if (!openMultiSelectId) return;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (!target?.closest(`[data-multi-select-id="${openMultiSelectId}"]`)) {
        setOpenMultiSelectId(null);
      }
    };
    document.addEventListener('pointerdown', closeOnOutsidePointer);
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer);
  }, [openMultiSelectId]);

  if (fields.length === 0) return null;

  const captureLinkShot = (fieldId: string, rawUrl: string) => {
    const url = rawUrl.trim();
    if (!url) {
      setLinkShots((prev) => ({ ...prev, [fieldId]: { status: 'empty', url: '' } }));
      return;
    }
    if (!isValidTemplateLink(url)) {
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
    }, 900);
  };

  return (
    <>
    <div className="pt-1 space-y-3 border-t border-slate-100">
      {fields.map((field) => {
        const value = values[field.id];
        const hasError = Boolean(errors[field.id]);
        const errorMessage = hasError ? getTemplateFieldError(field, value) : null;
        const listValue = asStringList(value);
        const linkShot = linkShots[field.id];
        const attachmentWarning = attachmentWarnings[field.id];

        if (field.type === 'static_text') {
          return (
            <div
              id={getTemplateFieldDomId(field.id)}
              key={field.id}
              className="rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-[11px] text-blue-800"
            >
              <div className="flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 mt-px shrink-0 text-blue-600" />
                <div>
                  <p className="text-blue-700/80 leading-relaxed">
                    <span>{field.label}：</span>
                    {field.content}
                  </p>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div id={getTemplateFieldDomId(field.id)} key={field.id}>
            <FieldLabel field={field} />

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
                className={`w-full px-3 py-2 bg-slate-50 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:bg-white border ${getInputBorderClass(hasError)}`}
              />
            )}

            {field.type === 'date' && (
              <TemplateDatePicker
                value={asString(value)}
                hasError={hasError}
                onChange={(nextValue) => onChange(field.id, nextValue)}
              />
            )}

            {field.type === 'radio' && (
              <div className="grid grid-cols-3 gap-2">
                {(field.options || []).map((option) => {
                  const checked = asString(value) === option.value;
                  return (
                    <label
                      key={option.value}
                      className={`flex items-center justify-center gap-1 rounded-xl border px-2 py-2 text-center cursor-pointer transition-colors ${
                        checked
                          ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                          : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name={field.id}
                        value={option.value}
                        checked={checked}
                        onChange={() => onChange(field.id, option.value)}
                        className="sr-only"
                      />
                      {checked && <Check className="w-3 h-3 shrink-0" />}
                      <span className="truncate">{option.label}</span>
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
                      className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 cursor-pointer transition-colors ${
                        checked
                          ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                          : 'border-slate-200 bg-slate-50 text-slate-600'
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
                      <span
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          checked ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'
                        }`}
                      >
                        {checked && <Check className="w-3 h-3" />}
                      </span>
                      <span className="truncate">{option.label}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {field.type === 'select' && (
              <select
                value={asString(value)}
                onChange={(event) => onChange(field.id, event.target.value)}
                className={`w-full px-3 py-2 bg-slate-50 rounded-xl text-slate-800 focus:outline-none focus:ring-2 border ${getInputBorderClass(hasError)}`}
              >
                <option value="">{field.placeholder || '请选择'}</option>
                {(field.options || []).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}

            {field.type === 'multi_select' && (
              <div
                className="relative"
                data-multi-select-id={field.id}
              >
                <button
                  type="button"
                  aria-expanded={openMultiSelectId === field.id}
                  onClick={() =>
                    setOpenMultiSelectId((current) => (current === field.id ? null : field.id))
                  }
                  className={`w-full px-3 py-2 rounded-xl border bg-slate-50 flex items-center justify-between gap-2 text-left text-slate-700 ${hasError ? 'border-rose-400' : 'border-slate-200'}`}
                >
                  {(() => {
                    const selectedLabels = (field.options || [])
                      .filter((option) => listValue.includes(option.value))
                      .map((option) => option.label);
                    if (selectedLabels.length === 0) {
                      return (
                        <span className="truncate text-slate-400">
                          {field.placeholder || '请选择（可多选）'}
                        </span>
                      );
                    }
                    const visibleLabels = selectedLabels.slice(0, 3);
                    const overflowCount = selectedLabels.length - visibleLabels.length;
                    return (
                      <span className="min-w-0 flex items-center gap-1">
                        <span className="truncate">{visibleLabels.join('、')}</span>
                        {overflowCount > 0 && (
                          <span className="shrink-0 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                            +{overflowCount}
                          </span>
                        )}
                      </span>
                    );
                  })()}
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${
                      openMultiSelectId === field.id ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {openMultiSelectId === field.id && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-40 rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden">
                    <div className="max-h-52 overflow-y-auto p-1.5 space-y-1">
                      {(field.options || []).map((option) => {
                        const checked = listValue.includes(option.value);
                        return (
                          <label
                            key={option.value}
                            className={`flex items-center gap-2 rounded-lg px-2 py-1.5 cursor-pointer ${
                              checked ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
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
                            <span
                              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                checked ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'
                              }`}
                            >
                              {checked && <Check className="w-3 h-3" />}
                            </span>
                            <span className="truncate">{option.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {field.type === 'link' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 min-w-0">
                    <LinkIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="url"
                      value={asString(value)}
                      placeholder={field.placeholder || 'https://...'}
                      onChange={(event) => {
                        onChange(field.id, event.target.value);
                        setLinkShots((prev) => {
                          if (!prev[field.id]) return prev;
                          const next = { ...prev };
                          delete next[field.id];
                          return next;
                        });
                      }}
                      className={`w-full pl-8 pr-3 py-2 bg-slate-50 rounded-xl text-slate-800 font-mono text-[11px] focus:outline-none focus:ring-2 focus:bg-white border ${getInputBorderClass(hasError)}`}
                    />
                  </div>
                  {linkShot?.status !== 'done' && (
                    <button
                      type="button"
                      disabled={linkShot?.status === 'loading'}
                      onClick={() => captureLinkShot(field.id, asString(value))}
                      className="shrink-0 self-stretch px-3 rounded-xl border border-blue-200 bg-white text-blue-700 text-[11px] font-semibold flex items-center gap-1 hover:bg-blue-50 disabled:text-slate-400 disabled:bg-slate-50"
                    >
                      {linkShot?.status === 'loading' ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Camera className="w-3.5 h-3.5" />
                      )}
                      <span>{linkShot?.status === 'loading' ? '截图中' : '截图'}</span>
                    </button>
                  )}
                </div>

                {linkShot?.status === 'empty' && (
                  <p className="flex items-center gap-1 text-[11px] text-amber-600">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>请先输入链接再截图</span>
                  </p>
                )}
                {linkShot?.status === 'invalid' && (
                  <p className="flex items-center gap-1 text-[11px] text-rose-500">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>网址格式不正确，请修改为以 http:// 或 https:// 开头的正确网址</span>
                  </p>
                )}
                {linkShot?.status === 'done' && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setLinkShotViewer({ url: linkShot.url, shotAt: linkShot.shotAt })}
                      className="w-24 h-16 shrink-0 rounded-lg border border-slate-200 bg-white overflow-hidden cursor-zoom-in"
                      title="查看原图"
                    >
                      <div className="h-full flex flex-col">
                        <div className="h-3 bg-slate-100 border-b border-slate-200 px-1.5 flex items-center gap-0.5">
                          <span className="w-1 h-1 rounded-full bg-rose-300" />
                          <span className="w-1 h-1 rounded-full bg-amber-300" />
                          <span className="w-1 h-1 rounded-full bg-emerald-300" />
                        </div>
                        <div className="flex-1 p-2 space-y-1">
                          <div className="h-1.5 w-3/4 rounded bg-slate-300" />
                          <div className="h-1 w-1/2 rounded bg-slate-200" />
                          <div className="h-5 rounded bg-blue-50" />
                        </div>
                      </div>
                    </button>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                        <Check className="w-3.5 h-3.5" />
                        <span>已截取原文</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{getUrlHost(linkShot.url)}</div>
                      <div className="text-[10px] text-slate-400">{linkShot.shotAt}</div>
                      <div className="flex items-center gap-3 text-[11px]">
                        <button
                          type="button"
                          onClick={() => captureLinkShot(field.id, linkShot.url)}
                          className="flex items-center gap-0.5 text-blue-600 hover:underline"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>重新截图</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setLinkShots((prev) => {
                              const next = { ...prev };
                              delete next[field.id];
                              return next;
                            })
                          }
                          className="flex items-center gap-0.5 text-slate-500 hover:text-rose-500"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>删除</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {field.type === 'attachment' && (
              <div className={`rounded-xl border p-2.5 bg-slate-50 ${hasError ? 'border-rose-400' : 'border-slate-200'}`}>
                <input
                  id={`${getTemplateFieldDomId(field.id)}-input`}
                  type="file"
                  accept={field.accept}
                  multiple={field.multiple}
                  className="hidden"
                  onChange={(event) => {
                    const selectedFiles = Array.from(event.target.files || []);
                    const previousFileNames = field.multiple === false ? [] : listValue;
                    const maxFiles = field.multiple === false ? 1 : MAX_ATTACHMENT_COUNT;
                    const remainingSlots = Math.max(maxFiles - previousFileNames.length, 0);
                    const supportedFiles = selectedFiles.filter(isAllowedAttachment);
                    const rejectedTypeCount = selectedFiles.length - supportedFiles.length;
                    const sizeEligibleFiles = supportedFiles.filter(
                      (file) => file.size <= MAX_ATTACHMENT_SIZE_BYTES
                    );
                    const rejectedSizeCount = supportedFiles.length - sizeEligibleFiles.length;
                    const acceptedFiles = sizeEligibleFiles.slice(0, remainingSlots);
                    const rejectedCountCount = sizeEligibleFiles.length - acceptedFiles.length;
                    const nextFileNames = [
                      ...previousFileNames,
                      ...acceptedFiles.map((file) => file.name),
                    ];
                    const warningParts = [
                      rejectedTypeCount > 0
                        ? `已忽略${rejectedTypeCount}个不支持的文件类型。`
                        : '',
                      rejectedSizeCount > 0
                        ? `单个文件不能超过20MB，已忽略${rejectedSizeCount}个超限文件。`
                        : '',
                      rejectedCountCount > 0
                        ? `最多上传${maxFiles}个文件，已忽略${rejectedCountCount}个超出数量限制的文件。`
                        : '',
                    ].filter(Boolean);

                    onChange(field.id, nextFileNames);
                    setAttachmentWarnings((prev) => ({
                      ...prev,
                      [field.id]: warningParts.join(''),
                    }));
                    event.currentTarget.value = '';
                  }}
                />
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor={`${getTemplateFieldDomId(field.id)}-input`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-blue-200 bg-white text-blue-700 font-medium cursor-pointer hover:bg-blue-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>选择文件</span>
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {field.multiple === false
                      ? '单个文件，单个不超过20MB'
                      : '最多5个，单个不超过20MB'}
                  </span>
                </div>
                {listValue.length > 0 ? (
                  <div className="mt-2 space-y-1.5">
                    {listValue.map((fileName, index) => (
                      <div
                        key={`${fileName}-${index}`}
                        className="flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 px-2 py-1.5"
                      >
                        <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="flex-1 min-w-0 truncate text-slate-600">{fileName}</span>
                        <button
                          type="button"
                          onClick={() =>
                            onChange(
                              field.id,
                              listValue.filter((_, itemIndex) => itemIndex !== index)
                            )
                          }
                          className="p-0.5 text-slate-400 hover:text-rose-500 cursor-pointer"
                          title="移除文件"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-[10px] text-slate-400">暂未选择文件</p>
                )}
                {attachmentWarning && (
                  <p className="mt-1.5 text-[10px] text-amber-600">{attachmentWarning}</p>
                )}
              </div>
            )}

            {errorMessage && <ErrorText message={errorMessage} />}
          </div>
        );
      })}
    </div>

    {linkShotViewer && (
      <div
        className="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center p-4"
        onClick={() => setLinkShotViewer(null)}
      >
        <div
          className="w-full max-w-[22rem] bg-white rounded-2xl shadow-2xl overflow-hidden"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="px-3.5 py-3 border-b border-slate-100 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-800">原文截图</div>
              <div className="text-[10px] text-slate-400 truncate">
                {getUrlHost(linkShotViewer.url)} · {linkShotViewer.shotAt}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setLinkShotViewer(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-3 bg-slate-50">
            <div className="h-[300px] rounded-xl border border-slate-200 bg-white overflow-hidden flex flex-col">
              <div className="h-7 bg-slate-100 border-b border-slate-200 px-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-300" />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                <span className="ml-1 flex-1 min-w-0 truncate rounded bg-white px-2 py-0.5 text-[9px] text-slate-400">
                  {linkShotViewer.url}
                </span>
              </div>
              <div className="flex-1 p-5 space-y-3">
                <div className="h-4 w-4/5 rounded bg-slate-700" />
                <div className="h-2.5 w-1/2 rounded bg-slate-300" />
                <div className="h-36 rounded-lg bg-blue-100" />
                <div className="h-2 rounded bg-slate-200" />
                <div className="h-2 w-4/5 rounded bg-slate-200" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};
