import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  X,
  UploadCloud,
  Link as LinkIcon,
  FileText,
  Save,
  Clock,
  Trash2,
  CheckCircle2,
  Sparkles,
  Zap,
  ShieldAlert,
  HelpCircle,
  BookOpen,
  Check,
  SlidersHorizontal,
  MapPin,
  Eye,
  FileSpreadsheet,
  Plus
} from 'lucide-react';
import {
  Attachment,
  NewReportFormData,
  DraftReport,
  ReportTemplateDef,
  ReportTemplateInput,
  ReportItem
} from '../types';
import { PRESET_REPORT_TEMPLATES as PRESET_TEMPLATES } from '../data/mockData';
import { AttachmentPreviewModal } from './AttachmentPreviewModal';
import {
  loadDrafts,
  removeDraft,
  REPORT_DRAFT_STORAGE_KEY,
  upsertDraft
} from '../services/reportDraftStorage';

const DEFAULT_ATTACHMENTS: Attachment[] = [
  {
    id: 'att-upload-1',
    name: '现场突发情况反馈核实材料.jpg',
    size: '2.4 MB',
    type: 'image',
    thumbnailUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop'
  },
  {
    id: 'att-upload-2',
    name: '突发事件舆情监测研判专报(第一期).pdf',
    size: '4.8 MB',
    type: 'pdf'
  }
];

interface NewReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newReport: NewReportFormData) => void;
  initialTemplate?: ReportTemplateInput | null;
  editingReport?: ReportItem | null;
  onUpdate?: (report: ReportItem) => void;
}

export const NewReportModal: React.FC<NewReportModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialTemplate,
  editingReport,
  onUpdate
}) => {
  const isEditMode = !!editingReport;

  // Selected Template ID
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('standard');

  // Form Field States
  const [title, setTitle] = useState('');
  const [source, setSource] = useState('群众举报');
  const [region, setRegion] = useState('西屯区');
  const [occurAddress, setOccurAddress] = useState('');
  const [infoType, setInfoType] = useState('突发事件');
  const [author, setAuthor] = useState('张三');
  const [organization, setOrganization] = useState('台中市网信办');
  const [summary, setSummary] = useState('');
  const [demands, setDemands] = useState('');
  const [recommendations, setRecommendations] = useState('');

  // Draft States
  const [drafts, setDrafts] = useState<DraftReport[]>([]);
  const [showDraftBox, setShowDraftBox] = useState(false);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  // Attachments State
  const [attachments, setAttachments] = useState<Attachment[]>(DEFAULT_ATTACHMENTS);
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);

  // Apply a template definition to the form fields
  const applyTemplate = (template: ReportTemplateDef, forceOverride = true) => {
    setSelectedTemplateId(template.id);
    if (forceOverride) {
      if (template.defaultTitle) setTitle(template.defaultTitle);
      if (template.defaultSource) setSource(template.defaultSource);
      if (template.defaultRegion) setRegion(template.defaultRegion);
      if (template.defaultInfoType) setInfoType(template.defaultInfoType);
      setSummary(template.summaryTemplate);
      setDemands(template.demandsTemplate);
      setRecommendations(template.recommendationsTemplate);
    } else {
      // Only fill if empty
      if (!title && template.defaultTitle) setTitle(template.defaultTitle);
      if (!summary && template.summaryTemplate) setSummary(template.summaryTemplate);
      if (!demands && template.demandsTemplate) setDemands(template.demandsTemplate);
      if (!recommendations && template.recommendationsTemplate) setRecommendations(template.recommendationsTemplate);
      setSource(template.defaultSource);
      setRegion(template.defaultRegion);
      setInfoType(template.defaultInfoType);
    }
    triggerToast(`已切换至【${template.name}】`);
  };

  // Load editing report, initial template, or default template on mount / open
  useEffect(() => {
    if (!isOpen) return;

    // Reset transient panel states on every open
    setShowDraftBox(false);
    setPreviewAttachment(null);
    setActiveDraftId(null);

    if (editingReport) {
      // Edit mode: prefill from the existing draft / rejected report
      setTitle(editingReport.title || '');
      setSource(editingReport.source || '群众举报');
      setRegion(editingReport.region || '西屯区');
      setOccurAddress(editingReport.occurAddress || '');
      setInfoType(editingReport.infoType || '突发事件');
      setAuthor(editingReport.author || '张三');
      setOrganization(editingReport.organization || '台中市网信办');
      setSummary(editingReport.detailContent?.summary || '');
      setDemands(editingReport.detailContent?.coreDemands || '');
      const recommendations = editingReport.detailContent?.recommendations;
      setRecommendations(
        Array.isArray(recommendations) ? recommendations.join('\n') : recommendations || ''
      );
      setAttachments(editingReport.attachments || []);
      setSelectedTemplateId('standard');
    } else if (initialTemplate) {
      setTitle(initialTemplate.title || '');
      if (initialTemplate.source) setSource(initialTemplate.source);
      if (initialTemplate.region) setRegion(initialTemplate.region);
      if (initialTemplate.occurAddress) setOccurAddress(initialTemplate.occurAddress);
      if (initialTemplate.infoType) setInfoType(initialTemplate.infoType);
      if (initialTemplate.summary) setSummary(initialTemplate.summary);
      if (initialTemplate.demands) setDemands(initialTemplate.demands);
      if (initialTemplate.recommendations) setRecommendations(initialTemplate.recommendations);
      setAttachments([...DEFAULT_ATTACHMENTS]);
    } else {
      // If no initial template, load default standard template
      const defaultTpl = PRESET_TEMPLATES.find((t) => t.id === 'standard') || PRESET_TEMPLATES[0];
      setSelectedTemplateId(defaultTpl.id);
      setTitle(defaultTpl.defaultTitle);
      setSource(defaultTpl.defaultSource);
      setRegion(defaultTpl.defaultRegion);
      setInfoType(defaultTpl.defaultInfoType);
      setSummary(defaultTpl.summaryTemplate);
      setDemands(defaultTpl.demandsTemplate);
      setRecommendations(defaultTpl.recommendationsTemplate);
      setAttachments([...DEFAULT_ATTACHMENTS]);
    }

    try {
      setDrafts(loadDrafts(REPORT_DRAFT_STORAGE_KEY));
    } catch (e) {
      // ignore
    }
  }, [isOpen, editingReport, initialTemplate]);

  const triggerToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 2500);
  };

  // Save current form as draft
  const handleSaveDraft = () => {
    if (!title.trim() && !summary.trim() && !demands.trim()) {
      triggerToast('请至少填写标题或摘要内容再保存草稿');
      return;
    }

    const draftId = activeDraftId || `draft-${Date.now()}`;
    const newDraft: DraftReport = {
      id: draftId,
      title: title.trim() || '未命名草稿',
      source,
      region,
      infoType,
      author,
      organization,
      summary,
      demands,
      recommendations,
      saveTime: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    const updated = upsertDraft(newDraft, REPORT_DRAFT_STORAGE_KEY);
    setDrafts(updated);
    setActiveDraftId(draftId);
    triggerToast('草稿保存成功！随时可在草稿箱中恢复');
  };

  // Load selected draft
  const handleLoadDraft = (draft: DraftReport) => {
    setTitle(draft.title === '未命名草稿' ? '' : draft.title);
    setSource(draft.source || '群众举报');
    setRegion(draft.region || '西屯区');
    setInfoType(draft.infoType || '突发事件');
    setAuthor(draft.author || '张三');
    setOrganization(draft.organization || '台中市网信办');
    setSummary(draft.summary || '');
    setDemands(draft.demands || '');
    setRecommendations(draft.recommendations || '');
    setActiveDraftId(draft.id);
    setShowDraftBox(false);
    triggerToast(`已成功恢复草稿: "${draft.title}"`);
  };

  // Delete draft
  const handleDeleteDraft = (draftId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = removeDraft(draftId, REPORT_DRAFT_STORAGE_KEY);
    setDrafts(updated);
    if (activeDraftId === draftId) {
      setActiveDraftId(null);
    }
    triggerToast('草稿已删除');
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (isEditMode && editingReport && onUpdate) {
      onUpdate({
        ...editingReport,
        title,
        source,
        region,
        occurAddress,
        infoType,
        author,
        organization,
        detailContent: {
          ...editingReport.detailContent,
          summary: summary || '暂无详细摘要描述。',
          coreDemands: demands || '',
          publicOpinionTrend:
            editingReport.detailContent?.publicOpinionTrend || '话题关注度一般，总体舆情可控。',
          recommendations: recommendations
            ? recommendations.split('\n').filter((line) => line.trim())
            : []
        },
        attachments
      });
    } else {
      onSubmit({
        title,
        source,
        region,
        occurAddress,
        infoType,
        author,
        organization,
        summary,
        demands,
        recommendations,
        attachments
      });
    }

    // If submitted from a draft, remove it from drafts
    if (activeDraftId) {
      const updated = removeDraft(activeDraftId, REPORT_DRAFT_STORAGE_KEY);
      setDrafts(updated);
    }

    // Reset fields
    setTitle('');
    setSummary('');
    setDemands('');
    setRecommendations('');
    setOccurAddress('');
    setActiveDraftId(null);
    onClose();
  };

  const renderTemplateIcon = (iconName: ReportTemplateDef['iconName']) => {
    switch (iconName) {
      case 'zap':
        return <Zap className="w-4 h-4 text-rose-600" />;
      case 'file-text':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'help':
        return <HelpCircle className="w-4 h-4 text-amber-600" />;
      case 'shield':
        return <ShieldAlert className="w-4 h-4 text-purple-600" />;
      case 'book':
        return <BookOpen className="w-4 h-4 text-emerald-600" />;
      default:
        return <FileText className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col border border-gray-200 overflow-hidden relative">
        {/* Toast Notice */}
        {toastNotice && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900/95 text-white text-xs px-4 py-2 rounded-full shadow-2xl flex items-center space-x-2 animate-in fade-in zoom-in-95">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastNotice}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-gray-200/90 bg-gradient-to-r from-blue-900 via-[#1E5ABB] to-blue-800 text-white shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold tracking-tight">
                  {isEditMode
                    ? editingReport && (editingReport.auditStatus === '被驳回' || editingReport.auditStatus === '已驳回')
                      ? '修改补充并重新提交'
                      : '编辑草稿速报'
                    : '新建速报上报'}
                </h2>
                {!isEditMode && (
                  <span className="text-[11px] bg-white/20 text-white px-2 py-0.5 rounded-full font-medium border border-white/30">
                    支持多套智能模板
                  </span>
                )}
              </div>
              <p className="text-[11px] text-blue-100/80">
                {isEditMode
                  ? '已自动带入原报送内容，补充修正后重新提交送审'
                  : '根据业务场景快速套用标准化上报格式'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Draft Box Button */}
            <button
              type="button"
              onClick={() => setShowDraftBox(!showDraftBox)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-all flex items-center space-x-1.5 font-medium cursor-pointer ${
                showDraftBox
                  ? 'bg-amber-400 text-blue-950 border-amber-300 shadow-sm font-bold'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>草稿箱</span>
              {drafts.length > 0 && (
                <span className="ml-1 bg-amber-400 text-blue-900 text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">
                  {drafts.length}
                </span>
              )}
            </button>

            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/15 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Reject Reason Banner (Edit Mode) */}
        {isEditMode && editingReport?.rejectReason && (
          <div className="shrink-0 px-6 py-3 bg-rose-50 border-b border-rose-200 text-xs text-rose-800">
            <p className="font-bold flex items-center space-x-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>原审核驳回意见：</span>
            </p>
            <p className="mt-1 text-rose-700 leading-relaxed">{editingReport.rejectReason}</p>
          </div>
        )}

        {/* Draft List Panel Drawer */}
        {showDraftBox && (
          <div className="bg-blue-50/90 border-b border-blue-200 p-4 animate-in slide-in-from-top-2 shrink-0">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-xs text-blue-900 flex items-center space-x-1">
                <FileText className="w-3.5 h-3.5 text-blue-700" />
                <span>草稿箱列表 ({drafts.length})</span>
              </span>
              <span className="text-[11px] text-blue-600">点击任意草稿一键恢复编辑</span>
            </div>

            {drafts.length === 0 ? (
              <div className="text-center py-4 bg-white rounded-lg border border-blue-100 text-xs text-gray-500">
                草稿箱暂无内容。填写过程中可点击底部的“存为草稿”随时暂存。
              </div>
            ) : (
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {drafts.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => handleLoadDraft(d)}
                    className={`p-2.5 bg-white hover:bg-blue-50/60 rounded-lg border transition-all cursor-pointer flex justify-between items-center shadow-2xs ${
                      activeDraftId === d.id ? 'border-[#1E5ABB] ring-2 ring-blue-200' : 'border-blue-100'
                    }`}
                  >
                    <div className="truncate mr-3">
                      <p className="font-bold text-xs text-gray-800 truncate">{d.title}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        保存时间: {d.saveTime} · {d.source} · {d.infoType}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleLoadDraft(d)}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#1E5ABB] text-[11px] font-bold rounded-md"
                      >
                        恢复
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteDraft(d.id, e)}
                        className="p-1 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-md"
                        title="删除草稿"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* SECTION 1: 模板选择器 (Template Selection Header Bar) */}
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 p-4 rounded-xl border border-blue-100/80 shadow-2xs" id="template-selection-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="p-1 rounded-md bg-[#1E5ABB] text-white">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs font-bold text-gray-800">选择报送模板</span>
                <span className="text-[11px] text-gray-500">点击模板一键套用标准结构与样例</span>
              </div>
            </div>

            {/* Quick Template Chips Carousel/Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {PRESET_TEMPLATES.map((tpl) => {
                const isSelected = selectedTemplateId === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => applyTemplate(tpl, true)}
                    className={`p-2.5 rounded-lg border text-left transition-all relative flex flex-col justify-between cursor-pointer group ${
                      isSelected
                        ? 'bg-white border-[#1E5ABB] shadow-md ring-2 ring-blue-100'
                        : 'bg-white/80 hover:bg-white border-gray-200/80 hover:border-blue-200 shadow-2xs'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#1E5ABB] text-white rounded-full flex items-center justify-center shadow-xs">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                    <div>
                      <div className="flex items-center space-x-1.5 mb-1">
                        {renderTemplateIcon(tpl.iconName)}
                        <span className={`text-[11px] font-bold truncate ${isSelected ? 'text-[#1E5ABB]' : 'text-gray-700'}`}>
                          {tpl.name.replace('模板', '')}
                        </span>
                      </div>
                      <span className={`inline-block text-[9px] px-1.5 py-0.2 rounded border font-semibold ${tpl.badgeColor}`}>
                        {tpl.badge}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

          </div>

          {/* SECTION 2: 报送核心表单 (Main Form) */}
          <form onSubmit={handleSubmit} id="new-report-form" className="space-y-4 text-xs">
            {/* Title */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-gray-700 font-bold flex items-center space-x-1">
                  <span>事件标题</span>
                  <span className="text-rose-500 font-bold">*</span>
                </label>
                <span className="text-[10px] text-gray-400">建议包含地点、事件核心要素及性质</span>
              </div>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="请输入清晰的速报事件标题（如：关于某社区突发停水事件的舆情上报）"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/20 focus:border-[#1E5ABB] text-xs transition-all font-medium text-gray-900 bg-white"
              />
            </div>

            {/* 4-Field Row: Source, Region, Occur Address, InfoType */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-gray-700 font-bold mb-1">事件来源</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] bg-white text-xs text-gray-800"
                >
                  <option value="群众举报">群众举报</option>
                  <option value="网格巡查">网格巡查</option>
                  <option value="热线12345">热线12345</option>
                  <option value="社交媒体">社交媒体</option>
                  <option value="新闻网站">新闻网站</option>
                  <option value="政府官网">政府官网</option>
                  <option value="内部系统">内部系统</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">涉及区域</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] bg-white text-xs text-gray-800"
                >
                  <option value="西屯区">西屯区</option>
                  <option value="西坝区">西坝区</option>
                  <option value="北屯区">北屯区</option>
                  <option value="南屯区">南屯区</option>
                  <option value="南坝区">南坝区</option>
                  <option value="全市">全市范围</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">信息类型</label>
                <select
                  value={infoType}
                  onChange={(e) => setInfoType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] bg-white text-xs text-gray-800"
                >
                  <option value="突发事件">突发事件</option>
                  <option value="舆情动态">舆情动态</option>
                  <option value="民生诉求">民生诉求</option>
                  <option value="网络谣言">网络谣言</option>
                  <option value="政策解读">政策解读</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1 flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-gray-500" />
                  <span>发生地址 (选填)</span>
                </label>
                <input
                  type="text"
                  value={occurAddress}
                  onChange={(e) => setOccurAddress(e.target.value)}
                  placeholder="如：西屯路38号小区"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] text-xs text-gray-800"
                />
              </div>
            </div>

            {/* Author & Organization Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50/80 p-3 rounded-lg border border-gray-200">
              <div>
                <label className="block text-gray-600 font-semibold mb-1">上报人员</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] bg-white text-xs"
                />
              </div>
              <div>
                <label className="block text-gray-600 font-semibold mb-1">所属机构 / 部门</label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] bg-white text-xs"
                />
              </div>
            </div>

            {/* Summary */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-gray-700 font-bold flex items-center space-x-1">
                  <span>速报内容详情 / 事件经过</span>
                  <span className="text-rose-500 font-bold">*</span>
                </label>
                <span className="text-[10px] text-gray-400">支持直接根据模板编辑或粘贴</span>
              </div>
              <textarea
                rows={4}
                required
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="请输入详细的事件背景、发生经过、现场核实情况及当前处置动态..."
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/20 focus:border-[#1E5ABB] text-xs leading-relaxed text-gray-900 bg-white"
              />
            </div>

            {/* Demands */}
            <div>
              <label className="block text-gray-700 font-bold mb-1">核心诉求 / 争议焦点</label>
              <input
                type="text"
                value={demands}
                onChange={(e) => setDemands(e.target.value)}
                placeholder="简明概括群众核心诉求、网民关注焦点或社会影响..."
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] text-xs text-gray-800 bg-white"
              />
            </div>

            {/* Recommendations */}
            <div>
              <label className="block text-gray-700 font-bold mb-1">建议处置举措 (每行一条建议)</label>
              <textarea
                rows={2}
                value={recommendations}
                onChange={(e) => setRecommendations(e.target.value)}
                placeholder="1. 立即协调相关主管部门实地核查处置...&#10;2. 官方渠道统一答复口径，防范负面炒作..."
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] text-xs leading-relaxed text-gray-800 bg-white"
              />
            </div>

            {/* Attachment upload & preview */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-gray-700 font-bold">上传证据附件 (图片 / PDF / 现场截图)</label>
                <span className="text-[11px] text-gray-400">已添加 {attachments.length} 个附件</span>
              </div>

              {/* Upload Drop Area */}
              <div
                onClick={() => {
                  const sampleNames = [
                    { name: '社区应急网格巡查核实记录表.pdf', type: 'pdf', size: '3.2 MB' },
                    { name: '涉事小区现场排查照片_02.jpg', type: 'image', size: '1.8 MB', thumbnailUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop' },
                    { name: '停水停电影响住户统计明细表.xlsx', type: 'sheet', size: '920 KB' }
                  ];
                  const randomSample = sampleNames[attachments.length % sampleNames.length];
                  const newAtt: Attachment = {
                    id: `att-upload-${Date.now()}`,
                    name: randomSample.name,
                    size: randomSample.size,
                    type: randomSample.type as any,
                    thumbnailUrl: randomSample.thumbnailUrl
                  };
                  setAttachments([...attachments, newAtt]);
                  triggerToast(`已添加附件: ${newAtt.name}`);
                }}
                className="border-2 border-dashed border-gray-300 hover:border-[#1E5ABB] hover:bg-blue-50/20 rounded-xl p-4 text-center transition-all cursor-pointer bg-gray-50/60 group"
              >
                <UploadCloud className="w-7 h-7 text-gray-400 group-hover:text-[#1E5ABB] mx-auto mb-1 transition-colors" />
                <p className="text-gray-700 font-semibold text-xs group-hover:text-[#1E5ABB]">点击选择或拖拽文件至此处上传 (点击添加示例附件)</p>
                <p className="text-gray-400 text-[10px] mt-0.5">支持 PNG, JPG, PDF, XLSX, DOCX (单个文件最大 20MB)</p>
              </div>

              {/* Uploaded Attachments List */}
              {attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="text-[11px] font-bold text-gray-500 flex items-center justify-between">
                    <span>已选佐证附件列表：</span>
                    <span className="text-[10px] text-gray-400 font-normal">点击“预览”可即时查看内容</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between p-2.5 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-xs transition-all text-xs"
                      >
                        <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                            {att.type === 'image' ? (
                              <img src={att.thumbnailUrl} alt={att.name} className="w-full h-full object-cover" />
                            ) : att.type === 'pdf' ? (
                              <FileText className="w-4 h-4 text-rose-500" />
                            ) : (
                              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 truncate text-[11px]">{att.name}</p>
                            <p className="text-[10px] text-gray-400">{att.size}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewAttachment(att);
                            }}
                            className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-[#1E5ABB] rounded text-[11px] font-bold flex items-center space-x-1 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>预览</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAttachments(attachments.filter((a) => a.id !== att.id));
                              triggerToast(`已移除附件: ${att.name}`);
                            }}
                            className="p-1 text-gray-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                            title="移除此附件"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Modal Sticky Footer */}
        <div className="px-6 py-3.5 border-t border-gray-200 bg-gray-50/90 flex justify-between items-center shrink-0">
          {/* Draft Action Button */}
          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Save className="w-3.5 h-3.5 text-amber-700" />
            <span>存为草稿</span>
          </button>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-semibold text-xs cursor-pointer transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              form="new-report-form"
              className="px-6 py-2 bg-[#1E5ABB] hover:bg-[#134092] text-white rounded-lg font-bold text-xs shadow-md transition-all cursor-pointer active:scale-98 flex items-center space-x-1.5"
            >
              <span>提交审核</span>
            </button>
          </div>
        </div>
      </div>

      {/* Rich Attachment Preview Modal */}
      <AttachmentPreviewModal
        isOpen={!!previewAttachment}
        onClose={() => setPreviewAttachment(null)}
        attachment={previewAttachment}
        attachments={attachments}
        onSelectAttachment={(att) => setPreviewAttachment(att)}
      />
    </div>
  );
};
