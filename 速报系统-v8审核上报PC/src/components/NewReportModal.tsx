import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  X,
  UploadCloud,
  Link as LinkIcon,
  FileText,
  Trash2,
  CheckCircle2,
  Sparkles,
  Zap,
  ShieldAlert,
  HelpCircle,
  BookOpen,
  Check,
  SlidersHorizontal,
  Eye,
  Download,
  FileSpreadsheet,
  Plus
} from 'lucide-react';
import {
  Attachment,
  NewReportFormData,
  ReportTemplateDef,
  ReportTemplateInput,
  ReportItem,
  TemplateFieldValue
} from '../types';
import { PRESET_REPORT_TEMPLATES as PRESET_TEMPLATES } from '../data/mockData';
import { getReportAttachments, getReportDetailContent, getRejectReasonText } from '../data/reportContent';
import { AttachmentPreviewModal } from './AttachmentPreviewModal';
import {
  PCTemplateExtraFields,
  createInitialTemplateValues,
  getFieldError
} from './PCTemplateExtraFields';
import {
  getAuditAssignmentStatus,
  getAuditBlockTip
} from '../utils/submitGuard';

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

const MAX_ATTACHMENT_COUNT = 5;
const MAX_ATTACHMENT_SIZE_BYTES = 20 * 1024 * 1024;
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

const formatFileSize = (bytes: number) => {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
};

const isAllowedAttachment = (file: File) => {
  if (file.type.startsWith('image/')) return true;
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  return allowedAttachmentExtensions.has(extension);
};

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
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    PRESET_TEMPLATES[0]?.id || '突发事件速报模板'
  );

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

  const [toastNotice, setToastNotice] = useState<string | null>(null);
  const [coreFieldErrors, setCoreFieldErrors] = useState({ title: false, summary: false });
  const [extraFieldValues, setExtraFieldValues] = useState<Record<string, TemplateFieldValue>>({});
  const [extraFieldErrors, setExtraFieldErrors] = useState<Record<string, boolean>>({});
  const [submitBlockTip, setSubmitBlockTip] = useState<string | null>(null);

  // Attachments State
  const [attachments, setAttachments] = useState<Attachment[]>(DEFAULT_ATTACHMENTS);
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);
  const [attachmentWarning, setAttachmentWarning] = useState('');

  const addAttachmentFiles = (files: File[]) => {
    const remainingSlots = Math.max(MAX_ATTACHMENT_COUNT - attachments.length, 0);
    const supportedFiles = files.filter(isAllowedAttachment);
    const rejectedTypeCount = files.length - supportedFiles.length;
    const sizeEligibleFiles = supportedFiles.filter(
      (file) => file.size <= MAX_ATTACHMENT_SIZE_BYTES
    );
    const rejectedSizeCount = supportedFiles.length - sizeEligibleFiles.length;
    const acceptedFiles = sizeEligibleFiles.slice(0, remainingSlots);
    const rejectedCount = sizeEligibleFiles.length - acceptedFiles.length;
    const newAttachments: Attachment[] = acceptedFiles.map((file, index) => {
      const isImage = file.type.startsWith('image/');
      const objectUrl = isImage ? URL.createObjectURL(file) : undefined;
      return {
        id: `att-upload-${Date.now()}-${index}`,
        name: file.name,
        size: formatFileSize(file.size),
        type: isImage ? 'image' : file.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'link',
        url: objectUrl,
        thumbnailUrl: objectUrl,
      };
    });
    const warnings = [
      rejectedTypeCount > 0 ? `已忽略${rejectedTypeCount}个不支持的文件类型。` : '',
      rejectedSizeCount > 0
        ? `单个文件不能超过20MB，已忽略${rejectedSizeCount}个超限文件。`
        : '',
      rejectedCount > 0
        ? `最多上传${MAX_ATTACHMENT_COUNT}个文件，已忽略${rejectedCount}个超出数量限制的文件。`
        : '',
    ].filter(Boolean);

    if (newAttachments.length > 0) {
      setAttachments((previous) => [...previous, ...newAttachments]);
    }
    setAttachmentWarning(warnings.join(''));
  };

  const getTemplateById = (templateId?: string) =>
    PRESET_TEMPLATES.find((template) => template.id === templateId) || PRESET_TEMPLATES[0];

  const backfillTemplateValues = (template: ReportTemplateDef, report: ReportItem) => {
    const values = createInitialTemplateValues(template.extraFields);
    const savedValues = report.templateFieldValues || {};
    const reportDate = (report.submitTime || '').slice(0, 10);

    template.extraFields.forEach((field) => {
      if (field.type === 'attachment') {
        values[field.id] = (report.attachments || []).map((attachment) => attachment.name);
        return;
      }
      if (Object.prototype.hasOwnProperty.call(savedValues, field.id)) {
        values[field.id] = savedValues[field.id];
        return;
      }
      const firstOption = field.options?.[0]?.value || '';
      if (field.type === 'date') values[field.id] = reportDate;
      if (field.type === 'number') values[field.id] = 1;
      if (field.type === 'radio' || field.type === 'select') values[field.id] = firstOption;
      if (field.type === 'checkbox' || field.type === 'multi_select') {
        values[field.id] = firstOption ? [firstOption] : [];
      }
      if (field.type === 'link') {
        values[field.id] = report.matchUrl || `https://example.com/reports/${report.id}`;
      }
    });
    return values;
  };

  // Apply a template definition to the form fields
  const applyTemplate = (template: ReportTemplateDef) => {
    setSelectedTemplateId(template.id);
    setExtraFieldValues(createInitialTemplateValues(template.extraFields));
    setExtraFieldErrors({});
    setCoreFieldErrors({ title: false, summary: false });
    setAttachmentWarning('');
    setPreviewAttachment(null);
    setAttachments([]);
    setSubmitBlockTip(null);
    setTitle('');
    setSummary('');
    setDemands('');
    setRecommendations('');
    setOccurAddress('');
    if (!isEditMode) {
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
    setPreviewAttachment(null);
    setSubmitBlockTip(null);
    setCoreFieldErrors({ title: false, summary: false });
    setExtraFieldErrors({});
    setAttachmentWarning('');

    if (editingReport) {
      // Edit mode: prefill from the existing draft / rejected report
      const editTemplate = getTemplateById(editingReport.templateId);
      setSelectedTemplateId(editTemplate.id);
      setTitle(editingReport.title || '');
      setSource(editingReport.source || '群众举报');
      setRegion(editingReport.region || '西屯区');
      setOccurAddress(editingReport.occurAddress || '');
      setInfoType(editingReport.infoType || '突发事件');
      setAuthor(editingReport.author || '张三');
      setOrganization(editingReport.organization || '台中市网信办');
      const detail = getReportDetailContent(editingReport);
      setSummary(detail.summary || '');
      setDemands(detail.coreDemands || '');
      const recommendations = detail.recommendations;
      setRecommendations(
        Array.isArray(recommendations) ? recommendations.join('\n') : recommendations || ''
      );
      setAttachments(getReportAttachments(editingReport));
      setExtraFieldValues(backfillTemplateValues(editTemplate, editingReport));
    } else if (initialTemplate) {
      const initialSelectedTemplate = getTemplateById(initialTemplate.templateId);
      setSelectedTemplateId(initialSelectedTemplate.id);
      setExtraFieldValues(createInitialTemplateValues(initialSelectedTemplate.extraFields));
      setTitle('');
      setSource(initialSelectedTemplate.defaultSource);
      setRegion(initialSelectedTemplate.defaultRegion);
      setOccurAddress('');
      setInfoType(initialSelectedTemplate.defaultInfoType);
      setAuthor('张三');
      setOrganization('台中市网信办');
      setSummary('');
      setDemands('');
      setRecommendations('');
      setAttachments([]);
    } else {
      const defaultTpl = PRESET_TEMPLATES[0];
      setSelectedTemplateId(defaultTpl.id);
      setExtraFieldValues(createInitialTemplateValues(defaultTpl.extraFields));
      setTitle('');
      setSource(defaultTpl.defaultSource);
      setRegion(defaultTpl.defaultRegion);
      setInfoType(defaultTpl.defaultInfoType);
      setOccurAddress('');
      setAuthor('张三');
      setOrganization('台中市网信办');
      setSummary('');
      setDemands('');
      setRecommendations('');
      setAttachments([]);
    }
  }, [isOpen, editingReport, initialTemplate]);

  const triggerToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 2500);
  };

  if (!isOpen) return null;

  const selectedTemplate = getTemplateById(selectedTemplateId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nextCoreErrors = {
      title: !title.trim(),
      summary: !summary.trim(),
    };
    const missingFields = [
      nextCoreErrors.title ? '标题名称' : '',
      nextCoreErrors.summary ? '内容描述' : '',
    ].filter(Boolean);
    setCoreFieldErrors(nextCoreErrors);

    const attachmentField = selectedTemplate.extraFields.find(
      (field) => field.type === 'attachment'
    );
    const templateFieldValues: Record<string, TemplateFieldValue> = {
      ...extraFieldValues,
      ...(attachmentField
        ? { [attachmentField.id]: attachments.map((attachment) => attachment.name) }
        : {})
    };
    const extraErrors: Record<string, boolean> = {};
    const extraIssues = selectedTemplate.extraFields.flatMap((field) => {
      const message = getFieldError(field, templateFieldValues[field.id]);
      if (!message) return [];
      extraErrors[field.id] = true;
      return [{ field, message }];
    });
    setExtraFieldErrors(extraErrors);
    const issueCount = missingFields.length + extraIssues.length;
    if (issueCount > 0) {
      triggerToast(
        missingFields.length > 0
          ? `请完善必填项：${missingFields[0]}${issueCount > 1 ? ` 等 ${issueCount} 项` : ''}`
          : extraIssues[0].message
      );
      window.requestAnimationFrame(() => {
        const firstElementId = missingFields.length > 0
          ? nextCoreErrors.title
            ? 'pc-report-title'
            : 'pc-report-summary'
          : `pc-template-field-${extraIssues[0].field.id}`;
        const fieldElement = document.getElementById(firstElementId);
        fieldElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const focusTarget = fieldElement?.querySelector(
          'input:not(.sr-only), select, textarea, button'
        ) as HTMLElement | null;
        if (fieldElement instanceof HTMLInputElement || fieldElement instanceof HTMLTextAreaElement) {
          fieldElement.focus();
        } else {
          focusTarget?.focus();
        }
      });
      return;
    }

    const blockTip = getAuditBlockTip(
      getAuditAssignmentStatus(organization, selectedTemplate.id)
    );
    if (blockTip) {
      setSubmitBlockTip(blockTip);
      return;
    }

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
          coreDemands: demands || summary || '待审核部门研判处置。',
          publicOpinionTrend:
            editingReport.detailContent?.publicOpinionTrend || '话题关注度一般，总体舆情可控。',
          recommendations: recommendations
            ? recommendations.split('\n').filter((line) => line.trim())
            : ['待审核部门研判处置。']
        },
        attachments,
        templateId: selectedTemplate.id,
        templateName: selectedTemplate.name,
        templateFieldValues
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
        demands: demands || summary,
        recommendations: recommendations || '待审核部门研判处置。',
        attachments,
        templateId: selectedTemplate.id,
        templateName: selectedTemplate.name,
        templateFieldValues
      });
    }

    // Reset fields
    setTitle('');
    setSummary('');
    setDemands('');
    setRecommendations('');
    setOccurAddress('');
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
              <h2 className="text-base font-bold tracking-tight">
                {isEditMode
                  ? editingReport && (editingReport.auditStatus === '被驳回' || editingReport.auditStatus === '已驳回')
                    ? '修改补充并重新提交'
                    : '编辑草稿速报'
                  : '新建速报'}
              </h2>
              {isEditMode && (
                <p className="text-[11px] text-blue-100/80">
                  已自动带入原报送内容，补充修正后重新提交送审
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/15 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Reject Reason Banner (Edit Mode) */}
        {isEditMode && editingReport && (editingReport.auditStatus === '被驳回' || editingReport.auditStatus === '已驳回') && (
          <div className="shrink-0 px-6 py-3 bg-rose-50 border-b border-rose-200 text-xs text-rose-800">
            <p className="font-bold flex items-center space-x-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>原审核驳回意见：</span>
            </p>
            <p className="mt-1 text-rose-700 leading-relaxed">{getRejectReasonText(editingReport)}</p>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* SECTION 1: 模板选择器 (Template Selection Header Bar) */}
          {!isEditMode && (
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 p-4 rounded-xl border border-blue-100/80 shadow-2xs" id="template-selection-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="p-1 rounded-md bg-[#1E5ABB] text-white">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs font-bold text-gray-800">选择报送模板</span>
              </div>
            </div>

            {/* Quick Template Chips Carousel/Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PRESET_TEMPLATES.map((tpl) => {
                const isSelected = selectedTemplateId === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => applyTemplate(tpl)}
                    className={`p-2.5 rounded-lg border text-left transition-all relative cursor-pointer group ${
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
                    <div className="flex items-center space-x-1.5">
                      {renderTemplateIcon(tpl.iconName)}
                      <span className={`text-[11px] font-bold truncate ${isSelected ? 'text-[#1E5ABB]' : 'text-gray-700'}`}>
                        {tpl.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

          </div>
          )}

          {/* SECTION 2: 报送核心表单 (Main Form) */}
          <form onSubmit={handleSubmit} id="new-report-form" className="space-y-4 text-xs">
            {/* Title */}
            <div>
              <div className="mb-1">
                <label className="text-gray-700 font-bold flex items-center space-x-1">
                  <span>标题名称</span>
                  <span className="text-rose-500 font-bold">*</span>
                </label>
              </div>
              <input
                id="pc-report-title"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (coreFieldErrors.title) {
                    setCoreFieldErrors((previous) => ({ ...previous, title: false }));
                  }
                }}
                placeholder="请输入清晰的速报事件标题（如：关于某社区突发停水事件的舆情上报）"
                className={`w-full px-3.5 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-xs transition-all font-medium text-gray-900 bg-white ${
                  coreFieldErrors.title
                    ? 'border-rose-400 focus:ring-rose-200'
                    : 'border-gray-300 focus:ring-[#1E5ABB]/20 focus:border-[#1E5ABB]'
                }`}
              />
              {coreFieldErrors.title && (
                <p className="mt-1 text-[11px] text-rose-500">请填写标题名称</p>
              )}
            </div>

            {/* Summary */}
            <div>
              <div className="mb-1">
                <label className="text-gray-700 font-bold flex items-center space-x-1">
                  <span>内容描述</span>
                  <span className="text-rose-500 font-bold">*</span>
                </label>
              </div>
              <textarea
                id="pc-report-summary"
                rows={4}
                value={summary}
                onChange={(e) => {
                  setSummary(e.target.value);
                  if (coreFieldErrors.summary) {
                    setCoreFieldErrors((previous) => ({ ...previous, summary: false }));
                  }
                }}
                placeholder="请输入详细的事件背景、发生经过、现场核实情况及当前处置动态..."
                className={`w-full px-3.5 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-xs leading-relaxed text-gray-900 bg-white ${
                  coreFieldErrors.summary
                    ? 'border-rose-400 focus:ring-rose-200'
                    : 'border-gray-300 focus:ring-[#1E5ABB]/20 focus:border-[#1E5ABB]'
                }`}
              />
              {coreFieldErrors.summary && (
                <p className="mt-1 text-[11px] text-rose-500">请填写内容描述</p>
              )}
            </div>

            {/* Template-defined fields synced from the H5 report form */}
            <PCTemplateExtraFields
              fields={selectedTemplate.extraFields}
              values={extraFieldValues}
              errors={extraFieldErrors}
              onChange={(fieldId, value) => {
                setExtraFieldValues((previous) => ({ ...previous, [fieldId]: value }));
                if (extraFieldErrors[fieldId]) {
                  setExtraFieldErrors((previous) => ({ ...previous, [fieldId]: false }));
                }
              }}
            />

            {/* Attachment upload & preview */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-gray-700 font-bold">
                  {selectedTemplate.extraFields.find((field) => field.type === 'attachment')?.label ||
                    '上传证据附件'}
                </label>
                <span className="text-[11px] text-gray-400">已添加 {attachments.length} 个附件</span>
              </div>

              {/* Upload Drop Area */}
              <label
                htmlFor="pc-report-attachment-input"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  addAttachmentFiles(Array.from(event.dataTransfer.files));
                }}
                className="block border-2 border-dashed border-gray-300 hover:border-[#1E5ABB] hover:bg-blue-50/20 rounded-xl p-4 text-center transition-all cursor-pointer bg-gray-50/60 group"
              >
                <input
                  id="pc-report-attachment-input"
                  type="file"
                  multiple
                  accept={selectedTemplate.extraFields.find((field) => field.type === 'attachment')?.accept}
                  className="hidden"
                  onChange={(event) => {
                    addAttachmentFiles(Array.from(event.target.files || []));
                    event.currentTarget.value = '';
                  }}
                />
                <UploadCloud className="w-7 h-7 text-gray-400 group-hover:text-[#1E5ABB] mx-auto mb-1 transition-colors" />
                <p className="text-gray-700 font-semibold text-xs group-hover:text-[#1E5ABB]">点击选择或拖拽文件至此处上传</p>
                <p className="text-gray-400 text-[10px] mt-0.5 leading-relaxed text-left sm:text-center">
                  支持图片和常见文档，最多上传5个文件，单个文件不能超过20MB；图片支持预览，附件仅支持下载
                </p>
              </label>

              {/* Uploaded Attachments List */}
              {attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="text-[11px] font-bold text-gray-500 flex items-center justify-between">
                    <span>已选佐证附件列表：</span>
                    <span className="text-[10px] text-gray-400 font-normal">图片可预览，其它附件仅支持下载</span>
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
                          {att.type === 'image' ? (
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
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                triggerToast(`已开始下载：${att.name}`);
                              }}
                              className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-[#1E5ABB] rounded text-[11px] font-bold flex items-center space-x-1 transition-colors cursor-pointer"
                            >
                              <Download className="w-3 h-3" />
                              <span>下载</span>
                            </button>
                          )}
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
              {attachmentWarning && (
                <p className="mt-1.5 text-[10px] text-amber-600">{attachmentWarning}</p>
              )}
            </div>

            {selectedTemplate.extraFields
              .filter((field) => field.type === 'static_text')
              .map((field) => (
                <div
                  key={field.id}
                  className="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50/70 px-3 py-2 text-[11px] text-blue-800"
                >
                  <HelpCircle className="w-3.5 h-3.5 mt-px shrink-0 text-blue-600" />
                  <span>
                    <span>{field.label}：</span>
                    {field.content}
                  </span>
                </div>
              ))}
          </form>
        </div>

        {/* Modal Sticky Footer */}
        <div className="px-6 py-3.5 border-t border-gray-200 bg-gray-50/90 flex justify-end items-center shrink-0">
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

      {submitBlockTip && (
        <div className="fixed inset-0 z-[90] bg-black/55 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">暂时无法提交</h3>
                <p className="text-xs text-gray-600 leading-relaxed mt-1">{submitBlockTip}</p>
              </div>
            </div>
            <div className="px-5 py-3 bg-gray-50 flex justify-end">
              <button
                type="button"
                onClick={() => setSubmitBlockTip(null)}
                className="px-4 py-1.5 rounded-lg bg-[#1E5ABB] text-white text-xs font-semibold"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
