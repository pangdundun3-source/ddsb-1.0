import React, { useState } from 'react';
import { CalendarClock, CircleHelp, Layers, Send, UserPlus, X } from 'lucide-react';
import { ReportItem } from '../types';
import { Receiver, ReceiverAvatar, ReceiverPickerModal } from './ReceiverPickerModal';

type DirectiveRequirement = '限时回执' | '回执' | '仅阅读';

interface DirectiveTemplate {
  id: string;
  name: string;
  requirement: DirectiveRequirement;
  buildContent: (report: ReportItem) => string;
}

const summaryOf = (report: ReportItem) =>
  (report.detailContent?.summary || report.title).replace(/[。.！!；;，,\s]+$/, '');

const DIRECTIVE_TEMPLATES: DirectiveTemplate[] = [
  {
    id: 'general-deadline',
    name: '通用舆情处置模板-限时回执',
    requirement: '限时回执',
    buildContent: (r) =>
      `关于【${r.title}】的下发内容：${summaryOf(r)}。请接收单位立即核实情况，按要求开展处置，并在限定时间内反馈处置结果。`
  },
  {
    id: 'general-receipt',
    name: '通用舆情处置模板-回执',
    requirement: '回执',
    buildContent: (r) =>
      `关于【${r.title}】的下发内容：${summaryOf(r)}。请接收单位核实相关情况并做好处置，处置完成后回执说明。`
  },
  {
    id: 'general-read',
    name: '通用舆情处置模板-仅阅读',
    requirement: '仅阅读',
    buildContent: (r) =>
      `关于【${r.title}】的通报：${summaryOf(r)}。现予以通报，请各单位知悉并加强同类问题的日常监测。`
  },
  {
    id: 'wording-deadline',
    name: '通用错误表述模板-限时回执',
    requirement: '限时回执',
    buildContent: (r) =>
      `关于【${r.title}】的下发内容：经核查发现相关内容存在不规范表述，请接收单位对照规范逐项整改，并在限定时间内反馈整改情况。`
  },
  {
    id: 'rumor-receipt',
    name: '不实信息核查模板-回执',
    requirement: '回执',
    buildContent: (r) =>
      `关于【${r.title}】的下发内容：${summaryOf(r)}。请接收单位尽快核查信息真实性，必要时发布权威澄清，并回执核查结论。`
  },
  {
    id: 'supervise-deadline',
    name: '重点事项督办模板-限时回执',
    requirement: '限时回执',
    buildContent: (r) =>
      `关于【${r.title}】的督办内容：该事项已列入重点督办，请接收单位主要负责同志亲自研究部署，在限定时间内报送处置进展。`
  }
];

const REQUIREMENTS: DirectiveRequirement[] = ['限时回执', '回执', '仅阅读'];

const REQUIREMENT_TAG: Record<DirectiveRequirement, string> = {
  限时回执: 'bg-rose-50 text-rose-600 border-rose-200',
  回执: 'bg-amber-50 text-amber-600 border-amber-200',
  仅阅读: 'bg-slate-100 text-slate-600 border-slate-200'
};

const TITLE_MAX = 100;
const REMARK_MAX = 200;
const CONTENT_MAX = 500;

const defaultDeadline = () => {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T20:00`;
};

const inputClass =
  'w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-xs text-gray-800 focus:outline-none focus:bg-white focus:border-[#1E5ABB] focus:ring-2 focus:ring-[#1E5ABB]/15 transition-all';

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center space-x-2 mb-4">
    <span className="w-1 h-4 rounded-full bg-[#1E5ABB]" />
    <h4 className="text-sm font-bold text-gray-900">{children}</h4>
  </div>
);

const FieldLabel: React.FC<{ required?: boolean; counter?: string; children: React.ReactNode }> = ({
  required,
  counter,
  children
}) => (
  <div className="flex items-center justify-between mb-1.5">
    <label className="text-xs font-semibold text-gray-700 flex items-center">
      {required && <span className="text-rose-500 mr-0.5">*</span>}
      {children}
    </label>
    {counter && <span className="text-[11px] font-mono text-slate-400">{counter}</span>}
  </div>
);

interface TransferDirectiveModalProps {
  report: ReportItem;
  onClose: () => void;
  onSubmit: (opinion: string) => void;
}

export const TransferDirectiveModal: React.FC<TransferDirectiveModalProps> = ({ report, onClose, onSubmit }) => {
  const [templateId, setTemplateId] = useState(DIRECTIVE_TEMPLATES[0].id);
  const [title, setTitle] = useState(`[转办排查] ${report.title}`.slice(0, TITLE_MAX));
  const [requirement, setRequirement] = useState<DirectiveRequirement>(DIRECTIVE_TEMPLATES[0].requirement);
  const [deadline, setDeadline] = useState(defaultDeadline);
  const [receivers, setReceivers] = useState<Receiver[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [remark, setRemark] = useState('');
  const [content, setContent] = useState(DIRECTIVE_TEMPLATES[0].buildContent(report).slice(0, CONTENT_MAX));
  const [previewTemplate, setPreviewTemplate] = useState<DirectiveTemplate | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const errors = {
    title: !title.trim(),
    deadline: requirement === '限时回执' && !deadline,
    receivers: receivers.length === 0,
    content: !content.trim()
  };
  const hasError = Object.values(errors).some(Boolean);

  const applyTemplate = (tpl: DirectiveTemplate) => {
    setTemplateId(tpl.id);
    setRequirement(tpl.requirement);
    setContent(tpl.buildContent(report).slice(0, CONTENT_MAX));
  };

  const removeReceiver = (id: string) => setReceivers((prev) => prev.filter((r) => r.id !== id));

  const handleSubmit = () => {
    setSubmitted(true);
    if (hasError) return;
    const parts = [
      `【${requirement}】${title.trim()}`,
      `接收人：${receivers.map((r) => r.name).join('、')}`,
      requirement === '限时回执' ? `限时：${deadline.replace('T', ' ')}` : '',
      `内容：${content.trim()}`,
      remark.trim() ? `备注：${remark.trim()}` : ''
    ].filter(Boolean);
    onSubmit(parts.join('；'));
  };

  const errorText = (show: boolean, text: string) =>
    submitted && show ? <p className="text-[11px] text-rose-500 mt-1">{text}</p> : null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/45 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[86vh] flex flex-col overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-[#1E5ABB] flex items-center justify-center">
              <Send className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-base font-bold text-gray-900">指令下发</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors"
            title="关闭"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 flex min-h-0">
          {/* Templates */}
          <aside className="w-72 shrink-0 border-r border-slate-100 bg-slate-50/40 flex flex-col min-h-0">
            <div className="flex items-center space-x-2 px-5 pt-5 pb-3 text-sm font-bold text-gray-800">
              <Layers className="w-4 h-4 text-[#1E5ABB]" />
              <span>指令模板</span>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2.5">
              {DIRECTIVE_TEMPLATES.map((tpl) => {
                const active = tpl.id === templateId;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => applyTemplate(tpl)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-2 ${
                      active
                        ? 'border-[#1E5ABB] bg-blue-50/70 shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/30'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className={`text-xs font-bold truncate ${active ? 'text-[#1E5ABB]' : 'text-gray-800'}`} title={tpl.name}>
                        {tpl.name}
                      </div>
                      <span className={`inline-block mt-1.5 px-1.5 py-0.5 rounded border text-[10px] font-semibold ${REQUIREMENT_TAG[tpl.requirement]}`}>
                        {tpl.requirement}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewTemplate(tpl);
                      }}
                      className="shrink-0 px-2.5 py-1 rounded-lg border border-blue-200 bg-blue-50 text-[#1E5ABB] hover:bg-blue-100 text-[11px] font-bold cursor-pointer transition-colors"
                    >
                      预览
                    </button>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Form */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">
            <section>
              <SectionTitle>基础信息</SectionTitle>
              <div className="space-y-4">
                <div>
                  <FieldLabel required counter={`${title.length} / ${TITLE_MAX}`}>指令标题</FieldLabel>
                  <input
                    value={title}
                    maxLength={TITLE_MAX}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="请输入指令标题"
                    className={inputClass}
                  />
                  {errorText(errors.title, '请输入指令标题')}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel>
                      指令要求
                      <span title="限时回执：需在限时时间前回执处置结果；回执：处置后回执；仅阅读：无需回执">
                        <CircleHelp className="w-3.5 h-3.5 text-slate-400 ml-1 cursor-help" />
                      </span>
                    </FieldLabel>
                    <div className="grid grid-cols-3 gap-1 p-1 border border-slate-200 rounded-xl bg-white">
                      {REQUIREMENTS.map((req) => (
                        <button
                          key={req}
                          type="button"
                          onClick={() => setRequirement(req)}
                          className={`py-1.5 rounded-lg text-xs transition-all cursor-pointer border ${
                            requirement === req
                              ? 'bg-blue-50 text-[#1E5ABB] border-blue-200 font-bold shadow-2xs'
                              : 'text-slate-600 border-transparent hover:bg-slate-50'
                          }`}
                        >
                          {req}
                        </button>
                      ))}
                    </div>
                  </div>

                  {requirement === '限时回执' && (
                    <div>
                      <FieldLabel required>限时时间</FieldLabel>
                      <div className="relative">
                        <input
                          type="datetime-local"
                          value={deadline}
                          onChange={(e) => setDeadline(e.target.value)}
                          className={`${inputClass} font-mono pr-9`}
                        />
                        <CalendarClock className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                      </div>
                      {errorText(errors.deadline, '请选择限时时间')}
                    </div>
                  )}
                </div>

                <div>
                  <FieldLabel required>接收人</FieldLabel>
                  <div className="flex items-start gap-2">
                    <div
                      onClick={() => receivers.length === 0 && setPickerOpen(true)}
                      className={`${inputClass} flex-1 min-h-[42px] max-h-28 overflow-y-auto flex flex-wrap items-center gap-1.5 py-2 ${
                        receivers.length === 0 ? 'cursor-pointer' : ''
                      }`}
                    >
                      {receivers.length === 0 && <span className="text-slate-400">请选择接收人</span>}
                      {receivers.map((r) => (
                        <span
                          key={r.id}
                          className="inline-flex items-center gap-1.5 pl-1 pr-1 py-0.5 rounded-full bg-white border border-blue-200 text-[11px]"
                          title={`${r.name}（${r.external ? r.sub : `${r.org} · ${r.sub}`}）`}
                        >
                          <ReceiverAvatar receiver={r} size="sm" />
                          <span className="font-bold text-gray-800">{r.name}</span>
                          <button
                            type="button"
                            onClick={() => removeReceiver(r.id)}
                            className="p-0.5 rounded-full text-slate-400 hover:text-rose-500 cursor-pointer"
                            title="移除"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setPickerOpen(true)}
                      className="shrink-0 h-[42px] px-4 rounded-xl bg-[#1E5ABB] hover:bg-[#134092] text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-2xs transition-colors"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>选择</span>
                    </button>
                  </div>
                  {errorText(errors.receivers, '请至少选择一名接收人')}
                </div>

                <div>
                  <FieldLabel counter={`${remark.length} / ${REMARK_MAX}`}>备注</FieldLabel>
                  <textarea
                    rows={2}
                    value={remark}
                    maxLength={REMARK_MAX}
                    onChange={(e) => setRemark(e.target.value)}
                    placeholder="请输入备注"
                    className={`${inputClass} resize-none`}
                  />
                </div>
              </div>
            </section>

            <section>
              <SectionTitle>指令下发内容</SectionTitle>
              <FieldLabel required counter={`${content.length} / ${CONTENT_MAX}`}>详细内容说明</FieldLabel>
              <textarea
                rows={5}
                value={content}
                maxLength={CONTENT_MAX}
                onChange={(e) => setContent(e.target.value)}
                placeholder="请输入指令下发的详细内容"
                className={`${inputClass} leading-relaxed resize-none`}
              />
              {errorText(errors.content, '请输入详细内容说明')}
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-slate-100 bg-white">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-gray-700 text-xs font-bold cursor-pointer transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 rounded-xl bg-[#1E5ABB] hover:bg-[#134092] text-white text-xs font-bold cursor-pointer shadow-2xs transition-colors"
          >
            提交
          </button>
        </div>
      </div>

      {pickerOpen && (
        <ReceiverPickerModal
          value={receivers}
          onClose={() => setPickerOpen(false)}
          onConfirm={(next) => {
            setReceivers(next);
            setPickerOpen(false);
          }}
        />
      )}

      {previewTemplate && (
        <div className="fixed inset-0 z-[70] bg-black/30 flex items-center justify-center p-4" onClick={() => setPreviewTemplate(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-bold text-gray-900 truncate">{previewTemplate.name}</span>
                <span className={`shrink-0 px-1.5 py-0.5 rounded border text-[10px] font-semibold ${REQUIREMENT_TAG[previewTemplate.requirement]}`}>
                  {previewTemplate.requirement}
                </span>
              </div>
              <button onClick={() => setPreviewTemplate(null)} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="px-5 py-4 text-xs text-gray-700 leading-relaxed">{previewTemplate.buildContent(report)}</p>
            <div className="flex justify-end space-x-2 px-5 py-3.5 border-t border-slate-100">
              <button
                onClick={() => setPreviewTemplate(null)}
                className="px-4 py-1.5 rounded-lg border border-slate-200 text-gray-600 text-xs font-bold cursor-pointer hover:bg-slate-50"
              >
                关闭
              </button>
              <button
                onClick={() => {
                  applyTemplate(previewTemplate);
                  setPreviewTemplate(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-[#1E5ABB] hover:bg-[#134092] text-white text-xs font-bold cursor-pointer"
              >
                使用此模板
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
