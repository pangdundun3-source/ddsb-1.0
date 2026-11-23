import React, { useMemo, useState } from 'react';
import { ArrowLeft, ClipboardPaste, Link2, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { REPORT_TEMPLATES } from '../data/mockData';
import { isTemplateBlockedByExternalAudit } from '../shared/valueAddedAccess';
import { SpeedReport, TemplateType, UserProfile } from '../types';
import {
  LINK_ANALYZING_TEXT,
  LinkMultimodalSuccess,
  extractHttpUrl,
  parseLinkMultimodal,
} from '../utils/linkMultimodalMock';
import { matchTemplateByClue } from '../utils/quickReportChat';

type Step = 'input' | 'analyzing' | 'preview' | 'failed';

interface LinkMultimodalReportPanelProps {
  user: UserProfile;
  onClose: () => void;
  onConfirm: (payload: Partial<SpeedReport>) => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onFallbackNormal: () => void;
}

const selectableTemplates = () =>
  REPORT_TEMPLATES.filter((tpl) => !isTemplateBlockedByExternalAudit(tpl.requiresExternalAudit));

export const LinkMultimodalReportPanel: React.FC<LinkMultimodalReportPanelProps> = ({
  user,
  onClose,
  onConfirm,
  onToast,
  onFallbackNormal,
}) => {
  const templates = useMemo(() => selectableTemplates(), []);
  const [step, setStep] = useState<Step>('input');
  const [linkInput, setLinkInput] = useState('');
  const [failReason, setFailReason] = useState('');
  const [parsed, setParsed] = useState<LinkMultimodalSuccess | null>(null);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [district, setDistrict] = useState('');
  const [timeText, setTimeText] = useState('');
  const [link, setLink] = useState('');
  const [templateId, setTemplateId] = useState<TemplateType>(
    (templates[0]?.id as TemplateType) || '突发事件速报模板'
  );
  const [matchReason, setMatchReason] = useState('');
  const [matchIsDefault, setMatchIsDefault] = useState(false);

  const runExtract = (raw: string) => {
    const url = extractHttpUrl(raw.trim());
    if (!url) {
      onToast('请输入以 http/https 开头的有效链接', 'error');
      return;
    }
    setStep('analyzing');
    setFailReason('');
    window.setTimeout(() => {
      const result = parseLinkMultimodal(url);
      if (!result.ok) {
        setFailReason(result.reason);
        setStep('failed');
        return;
      }
      const matched = matchTemplateByClue(
        {
          title: result.title,
          summary: result.summary,
          district: result.district,
          timeText: result.timeText,
          link: result.link,
          raw: `${result.title}\n${result.summary}`,
        },
        { org: user.department }
      );
      setParsed(result);
      setTitle(result.title);
      setSummary(result.summary);
      setDistrict(result.district || '');
      setTimeText(result.timeText);
      setLink(result.link);
      setTemplateId(matched.template.id);
      setMatchReason(matched.reason);
      setMatchIsDefault(matched.isDefault);
      setStep('preview');
    }, 900);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text?.trim()) {
        onToast('剪贴板为空', 'info');
        return;
      }
      setLinkInput(text.trim());
      onToast('已粘贴', 'success');
    } catch {
      onToast('无法读取剪贴板，请手动粘贴', 'info');
    }
  };

  const handleConfirm = () => {
    if (!title.trim()) {
      onToast('请填写报送标题后再继续', 'error');
      return;
    }
    const tpl = templates.find((t) => t.id === templateId) || templates[0] || REPORT_TEMPLATES[0];
    const stamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const districtValue = district.trim() || '全市';
    onConfirm({
      id: `rep_link_${Date.now()}`,
      title: title.trim(),
      summary: summary.trim() || title.trim(),
      coreDemand: summary.trim() || title.trim(),
      matchedLink: link.trim(),
      district: districtValue,
      address: district.trim(),
      source: tpl.defaultSource,
      type: tpl.defaultType,
      templateId: tpl.id,
      author: user.name,
      authorDept: user.department,
      gridNo: user.gridCode || '',
      sentimentTrend: '',
      disposalAdvice: '',
      createTime: stamp,
      updateTime: stamp,
      tags: ['链接多模态', tpl.defaultType, user.department].filter(Boolean),
      templateFieldValues: timeText
        ? {
            incident_date: timeText.slice(0, 10),
            appeal_date: timeText.slice(0, 10),
          }
        : undefined,
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f5f7fb] overflow-hidden">
      <div className="shrink-0 px-3 py-2.5 bg-white border-b border-slate-200 flex items-center gap-2">
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600"
          aria-label="返回首页"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold text-slate-900 truncate">链接多模态上报</h2>
          <p className="text-[10px] text-slate-500 truncate">粘贴链接 → 自动提取 → 匹配模板 → 去完善</p>
        </div>
        <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
          智能提取
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {step === 'input' && (
          <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3 shadow-2xs">
            <div className="flex items-start gap-2">
              <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 shrink-0">
                <Link2 className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">粘贴原文链接</h3>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  支持微信、抖音、快手、微博等公开链接。系统将提取标题、描述、属地等，并按内容自动匹配业务模板（可改选）。
                </p>
              </div>
            </div>
            <textarea
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
              rows={4}
              placeholder="https://..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void handlePaste()}
                className="flex-1 h-10 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 active:bg-slate-50"
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
                粘贴
              </button>
              <button
                type="button"
                onClick={() => runExtract(linkInput)}
                className="flex-[1.4] h-10 rounded-xl bg-violet-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 active:bg-violet-700"
              >
                <Wand2 className="w-3.5 h-3.5" />
                开始提取
              </button>
            </div>
          </div>
        )}

        {step === 'analyzing' && (
          <div className="rounded-2xl bg-white border border-slate-200 p-8 flex flex-col items-center justify-center gap-3 shadow-2xs">
            <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
            <p className="text-sm font-semibold text-slate-800">{LINK_ANALYZING_TEXT}</p>
            <p className="text-[11px] text-slate-500">提取完成后将自动匹配业务模板</p>
          </div>
        )}

        {step === 'failed' && (
          <div className="rounded-2xl bg-white border border-rose-200 p-4 space-y-3 shadow-2xs">
            <h3 className="text-sm font-bold text-rose-700">提取失败</h3>
            <p className="text-[12px] text-slate-600 whitespace-pre-line leading-relaxed">{failReason}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep('input')}
                className="flex-1 h-10 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
              >
                重试
              </button>
              <button
                type="button"
                onClick={onFallbackNormal}
                className="flex-1 h-10 rounded-xl bg-slate-800 text-white text-xs font-bold"
              >
                改走普通上报
              </button>
            </div>
          </div>
        )}

        {step === 'preview' && parsed && (
          <div className="space-y-3">
            <div className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 p-3.5 text-white shadow-md">
              <div className="flex items-center gap-1.5 text-[11px] text-white/85">
                <Sparkles className="w-3.5 h-3.5" />
                已从 {parsed.sourceHost} 提取，请核对后去完善上报
              </div>
              <p className="text-[11px] mt-1.5 text-white/90 leading-relaxed">
                匹配模板：{templates.find((t) => t.id === templateId)?.name || templateId}
                {matchIsDefault ? '（默认匹配）' : ''}
              </p>
              {matchReason && (
                <p className="text-[10px] mt-0.5 text-white/75">匹配说明：{matchReason}</p>
              )}
            </div>

            <div className="rounded-2xl bg-white border border-slate-200 p-3.5 space-y-3 shadow-2xs">
              <label className="block space-y-1">
                <span className="text-[11px] font-bold text-slate-600">相关链接</span>
                <input
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-[12px] text-slate-800 font-mono"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-[11px] font-bold text-slate-600">报送标题</span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-[13px] text-slate-800"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-[11px] font-bold text-slate-600">报送描述</span>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-[13px] text-slate-800"
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block space-y-1">
                  <span className="text-[11px] font-bold text-slate-600">涉事属地</span>
                  <input
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="可空"
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-[13px] text-slate-800"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-[11px] font-bold text-slate-600">信息发布时间</span>
                  <input
                    value={timeText}
                    onChange={(e) => setTimeText(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-[12px] text-slate-800"
                  />
                </label>
              </div>
              <label className="block space-y-1">
                <span className="text-[11px] font-bold text-slate-600">业务模板（可改选）</span>
                <select
                  value={templateId}
                  onChange={(e) => {
                    setTemplateId(e.target.value as TemplateType);
                    setMatchReason('用户手动更换模板');
                    setMatchIsDefault(false);
                  }}
                  className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-[13px] text-slate-800 bg-white"
                >
                  {templates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.extraFields.some((field) => field.type === 'link')
                        ? `${tpl.name} · AI`
                        : tpl.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex gap-2 pb-2">
              <button
                type="button"
                onClick={() => setStep('input')}
                className="flex-1 h-11 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700"
              >
                重新提取
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-[1.6] h-11 rounded-xl bg-violet-600 text-white text-xs font-bold active:bg-violet-700"
              >
                去完善并上报
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
