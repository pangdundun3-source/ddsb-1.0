import React, { useState, useEffect, useRef } from 'react';
import { SpeedReport, ReportTemplate, UserProfile, ReportStatus, ReportType, ReportSource, IdentificationTag, TemplateFieldValue } from '../types';
import { REPORT_TEMPLATES, DISTRICT_OPTIONS, TYPE_OPTIONS, SOURCE_OPTIONS } from '../data/mockData';
import { Plus, Save, Send, ChevronRight, X, Sparkles, Filter, Link, FileText, Trash2, CheckCircle2, Clock, AlertCircle, PencilLine, Search, Camera, Loader2, RefreshCw } from 'lucide-react';
import { BackNavigationBar } from './BackNavigationBar';
import { IdentificationBadge } from './IdentificationBadge';
import { RecallConfirmDialog } from './RecallConfirmDialog';
import { getAuditAssignmentStatus, getAuditBlockTip } from '../utils/submitGuard';
import { calculatePreJudgment } from '../utils/identification';
import {
  TemplateExtraFields,
  createInitialTemplateFieldValues,
  getTemplateFieldDomId,
  getTemplateFieldError,
} from './TemplateExtraFields';

interface ReportViewProps {
  reports: SpeedReport[];
  user: UserProfile;
  onSaveReport: (report: Partial<SpeedReport>, isSubmit: boolean) => void;
  onDeleteReport: (id: string) => void;
  onRecallReport?: (id: string) => void;
  onSelectReport: (report: SpeedReport) => void;
  onToast: (msg: string) => void;
  onEditReport?: (report: SpeedReport) => void;
  initialEditReport?: SpeedReport | null;
  isCreatingNew?: boolean;
  initialTemplateId?: string | null;
  showAllStatuses?: boolean;
  onFormModeChange?: (isFormMode: boolean) => void;
  onCloseForm?: () => void;
}

const TRANSFER_STATUSES = new Set<ReportStatus>(['pending_transfer', 'transferred']);

const isTransferRelatedReport = (report: SpeedReport) =>
  TRANSFER_STATUSES.has(report.status) || Boolean(report.transferredDept);

export const ReportView: React.FC<ReportViewProps> = ({
  reports,
  user,
  onSaveReport,
  onDeleteReport,
  onRecallReport,
  onSelectReport,
  onToast,
  onEditReport,
  initialEditReport,
  isCreatingNew,
  initialTemplateId,
  showAllStatuses = false,
  onFormModeChange,
  onCloseForm,
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('pending');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isCreating, setIsCreating] = useState<boolean>(!!initialEditReport || !!isCreatingNew);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate>(REPORT_TEMPLATES[0]);
  // Form state（新建进入模板时为空，仅用 placeholder 提示，不预填示例内容）
  const [editingId, setEditingId] = useState<string | null>(initialEditReport?.id || null);
  const [formTitle, setFormTitle] = useState<string>(initialEditReport?.title || '');
  const [formAddress, setFormAddress] = useState<string>(initialEditReport?.address || '');
  const [formSource, setFormSource] = useState<ReportSource | ''>(initialEditReport?.source || '');
  const [formDistrict, setFormDistrict] = useState<string>(initialEditReport?.district || '');
  const [formType, setFormType] = useState<ReportType | ''>(initialEditReport?.type || '');
  const [formSummary, setFormSummary] = useState<string>(initialEditReport?.summary || '');
  const [formCoreDemand, setFormCoreDemand] = useState<string>(initialEditReport?.coreDemand || '');
  const [formDisposalAdvice, setFormDisposalAdvice] = useState<string>(initialEditReport?.disposalAdvice || '');
  const [formMatchedLink, setFormMatchedLink] = useState<string>(initialEditReport?.matchedLink || '');
  type LinkShotState = {
    status: 'loading' | 'done' | 'error' | 'empty' | 'invalid';
    url: string;
    shotAt?: string;
    reason?: string;
  };
  const [linkShot, setLinkShot] = useState<LinkShotState | null>(null);
  const [linkShotViewer, setLinkShotViewer] = useState<{ url: string; shotAt?: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const [submitBlockTip, setSubmitBlockTip] = useState<string | null>(null);
  const [extraFieldValues, setExtraFieldValues] = useState<Record<string, TemplateFieldValue>>(
    () => createInitialTemplateFieldValues(REPORT_TEMPLATES[0].extraFields)
  );
  const [extraFieldErrors, setExtraFieldErrors] = useState<Record<string, boolean>>({});
  const getTemplateById = (templateId?: string | null) =>
    REPORT_TEMPLATES.find((tpl) => tpl.id === templateId) ?? REPORT_TEMPLATES[0];
  const resetExtraFields = (template: ReportTemplate) => {
    setExtraFieldValues(createInitialTemplateFieldValues(template.extraFields));
    setExtraFieldErrors({});
  };
  const buildBackfilledTemplateValues = (template: ReportTemplate, report: SpeedReport) => {
    const values = createInitialTemplateFieldValues(template.extraFields);
    const savedValues = report.templateFieldValues || {};
    const reportDate = (report.createTime || report.updateTime || '').slice(0, 10);

    template.extraFields.forEach((field) => {
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
        values[field.id] = report.matchedLink || `https://example.com/reports/${report.id}`;
      }
      if (field.type === 'attachment') values[field.id] = ['佐证材料.pdf'];
    });

    return values;
  };

  const isValidLinkUrl = (value: string) => {
    try {
      const parsed = new URL(value.trim());
      return /^https?:$/.test(parsed.protocol) && /\.[a-z]{2,}$/i.test(parsed.hostname);
    } catch {
      return false;
    }
  };

  const simulateUnreachableReason = (value: string): string | null => {
    try {
      const host = new URL(value.trim()).hostname;
      if (/404/.test(host)) return '页面不存在（404）';
      if (/error/i.test(host)) return '网站服务器错误（500）';
      if (/unreachable/i.test(host) || host.endsWith('.invalid')) return '无法连接到该网站，请求超时';
      return null;
    } catch {
      return '网址无法解析';
    }
  };

  const captureLinkShot = (url: string) => {
    setLinkShot({ status: 'loading', url });
    window.setTimeout(() => {
      setLinkShot((prev) => {
        if (!prev || prev.url !== url) return prev;
        const reason = simulateUnreachableReason(url);
        if (reason) return { status: 'error', url, reason };
        const now = new Date();
        const pad = (n: number) => String(n).padStart(2, '0');
        const shotAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
        return { status: 'done', url, shotAt };
      });
    }, 1200);
  };

  const removeLinkShot = () => setLinkShot(null);

  const renderLinkShotMock = (url: string, large = false) => {
    let host = url;
    try {
      host = new URL(url).hostname;
    } catch {
      /* keep raw */
    }
    return (
      <div className="w-full h-full bg-white flex flex-col overflow-hidden">
        <div className={`flex items-center gap-1 bg-slate-100 border-b border-slate-200 ${large ? 'px-3 py-2' : 'px-1.5 py-1'}`}>
          <span className={`${large ? 'w-2 h-2' : 'w-1 h-1'} rounded-full bg-rose-300`} />
          <span className={`${large ? 'w-2 h-2' : 'w-1 h-1'} rounded-full bg-amber-300`} />
          <span className={`${large ? 'w-2 h-2' : 'w-1 h-1'} rounded-full bg-emerald-300`} />
          <span className={`ml-1 flex-1 truncate bg-white rounded text-slate-400 ${large ? 'text-xs px-2 py-0.5' : 'text-[7px] px-1'}`}>
            {host}
          </span>
        </div>
        <div className={`flex-1 flex flex-col ${large ? 'p-6 gap-3' : 'p-2 gap-1'}`}>
          <div className={`bg-slate-700 rounded-sm ${large ? 'h-4 w-3/4' : 'h-1.5 w-3/4'}`} />
          <div className={`bg-slate-300 rounded-sm ${large ? 'h-2.5 w-1/3' : 'h-1 w-1/3'}`} />
          <div className={`bg-blue-100 rounded-sm ${large ? 'h-40 mt-2' : 'h-6 mt-0.5'}`} />
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`bg-slate-200 rounded-sm ${large ? 'h-2.5' : 'h-1'}`}
              style={{ width: `${[96, 88, 92, 60][i]}%` }}
            />
          ))}
        </div>
      </div>
    );
  };

  const filterTabs = showAllStatuses
    ? [
        { key: 'pending', label: '待审核' },
        { key: 'auditing', label: '审核中' },
        { key: 'rejected', label: '被驳回' },
        { key: 'approved', label: '已采纳' },
      ]
    : [{ key: 'pending', label: '待审核' }];
  const reportSourceOptions = SOURCE_OPTIONS.filter((source) => source !== '部门转办');

  const activeTabRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [activeFilter]);

  useEffect(() => {
    onFormModeChange?.(isCreating);
  }, [isCreating, onFormModeChange]);

  useEffect(() => {
    setActiveFilter('pending');
  }, [showAllStatuses]);

  useEffect(() => {
    if (initialEditReport) {
      const editTemplate = getTemplateById(initialEditReport.templateId || initialTemplateId);
      setEditingId(initialEditReport.id);
      setSelectedTemplate(editTemplate);
      setFormTitle(initialEditReport.title);
      setFormAddress(initialEditReport.address);
      setFormSource(initialEditReport.source);
      setFormDistrict(initialEditReport.district);
      setFormType(initialEditReport.type);
      setFormSummary(initialEditReport.summary);
      setFormCoreDemand(initialEditReport.coreDemand);
      setFormDisposalAdvice(initialEditReport.disposalAdvice);
      setLinkShot(null);
      setLinkShotViewer(null);
      setFieldErrors({});
      setExtraFieldValues(buildBackfilledTemplateValues(editTemplate, initialEditReport));
      setExtraFieldErrors({});
      setSubmitBlockTip(null);
      setIsCreating(true);
    } else if (isCreatingNew) {
      handleOpenNewForm();
    } else {
      setIsCreating(false);
      setEditingId(null);
    }
  }, [initialEditReport, isCreatingNew, initialTemplateId]);

  const applyTemplate = (tpl: ReportTemplate) => {
    setSelectedTemplate(tpl);
    resetExtraFields(tpl);
    // 切换模板只更新占位提示与下拉默认倾向，不写入示例正文
    if (!editingId) {
      setFormTitle('');
      setFormAddress('');
      setFormSummary('');
      setFormCoreDemand('');
      setFormDisposalAdvice('');
      setFormMatchedLink('');
      setFormSource('');
      setFormDistrict('');
      setFormType('');
      setLinkShot(null);
      setFieldErrors({});
    }
    onToast(`已切换为：${tpl.name}`);
  };

  function handleOpenNewForm() {
    const template = getTemplateById(initialTemplateId);
    setEditingId(null);
    setSelectedTemplate(template);
    setFormTitle('');
    setFormAddress('');
    setFormSource('');
    setFormDistrict('');
    setFormType('');
    setFormSummary('');
    setFormCoreDemand('');
    setFormDisposalAdvice('');
    setFormMatchedLink('');
    setLinkShot(null);
    setLinkShotViewer(null);
    setFieldErrors({});
    resetExtraFields(template);
    setSubmitBlockTip(null);
    setIsCreating(true);
  }

  const handleSubmitForm = () => {
    const errors: Record<string, boolean> = {};
    const missing: string[] = [];

    if (!formTitle.trim()) {
      errors.title = true;
      missing.push('标题名称');
    }
    if (!formSummary.trim()) {
      errors.summary = true;
      missing.push('内容描述');
    }

    const extraErrors: Record<string, boolean> = {};
    const extraIssues = selectedTemplate.extraFields.flatMap((field) => {
      const message = getTemplateFieldError(field, extraFieldValues[field.id]);
      if (!message) return [];
      extraErrors[field.id] = true;
      return [{ field, message }];
    });

    setFieldErrors(errors);
    setExtraFieldErrors(extraErrors);
    if (missing.length > 0 || extraIssues.length > 0) {
      onToast(
        missing.length > 0
          ? `请完善必填项：${missing[0]}${missing.length + extraIssues.length > 1 ? ` 等 ${missing.length + extraIssues.length} 项` : ''}`
          : extraIssues[0].message
      );
      if (missing.length === 0 && extraIssues.length > 0) {
        window.requestAnimationFrame(() => {
          const fieldElement = document.getElementById(getTemplateFieldDomId(extraIssues[0].field.id));
          fieldElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const focusTarget = fieldElement?.querySelector(
            'input:not(.sr-only), select, textarea, summary, label[for]'
          ) as HTMLElement | null;
          focusTarget?.focus();
        });
      }
      return;
    }

    // 终审节点必须有审核人，否则阻断提交（民生诉求核查模板用于演示终审无人）
    const auditOrg = user.department || user.subDepartment || '';
    const blockTip = getAuditBlockTip(getAuditAssignmentStatus(auditOrg, selectedTemplate.id));
    if (blockTip) {
      setSubmitBlockTip(blockTip);
      return;
    }

    const templateLink = selectedTemplate.extraFields.find((field) => field.type === 'link');
    const templateLinkValue = templateLink ? extraFieldValues[templateLink.id] : '';
    const payload: Partial<SpeedReport> = {
      id: editingId || `rep_${Date.now()}`,
      title: formTitle,
      address: formAddress,
      source: formSource || selectedTemplate.defaultSource,
      district: formDistrict || '全市',
      type: formType || selectedTemplate.defaultType,
      summary: formSummary,
      coreDemand: formCoreDemand || formSummary,
      disposalAdvice: formDisposalAdvice || '待审核部门研判处置。',
      matchedLink: formMatchedLink || (typeof templateLinkValue === 'string' ? templateLinkValue : ''),
      templateId: selectedTemplate.id,
      templateFieldValues: { ...extraFieldValues },
      author: user.name,
      authorDept: user.department,
      gridNo: user.gridCode,
      status: 'pending_audit',
      updateTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
      createTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
      tags: [formDistrict, formType, user.department],
    };

    // 1. 上报环节：用户点击提交后，系统自动比对不良信息库与待审件/审核中数据，立刻打上预判断标识
    const { tag, reason } = calculatePreJudgment(payload, reports);
    payload.identificationTag = tag;
    payload.identificationReason = reason;
    payload.identificationTime = payload.updateTime;

    onSaveReport(payload, true);
    setLinkShot(null);
    setLinkShotViewer(null);
    setIsCreating(false);
    onCloseForm?.();
  };

  const reportTodoCount = reports.filter((r) => r.status === 'rejected').length;
  const submittedReports = reports;
  const getElapsedMinutes = (report: SpeedReport) => {
    const cTime = new Date(report.createTime.replace(' ', 'T')).getTime();
    const uTime = new Date(report.updateTime.replace(' ', 'T')).getTime();
    if (isNaN(cTime) || isNaN(uTime) || uTime < cTime) return 0;
    return (uTime - cTime) / (1000 * 60);
  };
  const hasRepairTrace = (report: SpeedReport) =>
    Boolean(report.rejectReason) || (report.status === 'approved' && getElapsedMinutes(report) > 60);
  const reportSubmittedTotal = submittedReports.length;
  const reportApproved = submittedReports.filter((r) => r.status === 'approved').length;
  const reportRepairPassed = submittedReports.filter((r) => r.status === 'approved' && hasRepairTrace(r)).length;
  const reportFirstPass = Math.max(reportApproved - reportRepairPassed, 0);
  const reportRejectedTodo = submittedReports.filter((r) => r.status === 'rejected').length;
  const reportPendingAudit = Math.max(
    reportSubmittedTotal - reportFirstPass - reportRepairPassed - reportRejectedTodo,
    0
  );
  const reportFirstCount = submittedReports.filter(
    (r) => r.identificationTag === 'official_first' || (r.status === 'approved' && r.identificationTag !== 'official_repeat')
  ).length;
  const reportRepeatCount = submittedReports.filter(
    (r) => r.identificationTag === 'official_repeat'
  ).length;
  const reportFirstPassRate =
    reportSubmittedTotal > 0 ? Math.round((reportFirstPass / reportSubmittedTotal) * 100) : 0;
  const reportOverallPassRate =
    reportSubmittedTotal > 0 ? Math.round((reportApproved / reportSubmittedTotal) * 100) : 0;
  const reportListItems = reports.filter((r) => !isTransferRelatedReport(r));

  const getFilterTabCount = (key: string) => {
    switch (key) {
      case 'all':
        return reportListItems.length;
      case 'pending':
        return reportListItems.filter((r) => r.status === 'pending_audit').length;
      case 'auditing':
        return reportListItems.filter((r) => r.status === 'auditing').length;
      case 'approved':
        return reportListItems.filter((r) => r.status === 'approved').length;
      case 'rejected':
        return reportListItems.filter((r) => r.status === 'rejected').length;
      default:
        return 0;
    }
  };

  // Filtering reports
  const filteredReports = reports.filter((r) => {
    if (isTransferRelatedReport(r)) return false;

    if (activeFilter === 'pending' && r.status !== 'pending_audit') return false;
    if (activeFilter === 'auditing' && r.status !== 'auditing') return false;
    if (activeFilter === 'approved' && r.status !== 'approved') return false;
    if (activeFilter === 'rejected' && r.status !== 'rejected') return false;

    const normalizedKeyword = searchKeyword.trim().toLowerCase();
    if (
      normalizedKeyword &&
      !r.title.toLowerCase().includes(normalizedKeyword) &&
      !r.summary.toLowerCase().includes(normalizedKeyword)
    ) {
      return false;
    }

    return true;
  });

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'pending_audit':
        return <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[10px] font-bold">待审核</span>;
      case 'auditing':
        return <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-700 text-[10px] font-bold">审核中</span>;
      case 'approved':
        return <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-bold">已采纳</span>;
      case 'rejected':
        return <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 text-[10px] font-bold">被驳回</span>;
      case 'pending_transfer':
      case 'transferred':
        return null;
    }
  };

  const canDeleteReport = (report: SpeedReport) => report.status === 'pending_audit' || report.status === 'rejected';

  const handleReturnToPrevious = () => {
    setIsCreating(false);
    onCloseForm?.();
  };

  const editingReport = editingId ? reports.find((r) => r.id === editingId) ?? initialEditReport ?? null : null;
  const isResubmit = editingReport?.status === 'rejected';
  const editingRejectReason = editingReport?.rejectReason?.replace(/^驳回原因[:：]\s*/, '') || '信息不完整，请补充相关材料后重新提交。';

  const handleReportCardClick = (event: React.MouseEvent<HTMLDivElement>, report: SpeedReport) => {
    const target = event.target as HTMLElement;
    if (target.closest('button, a, input, select, textarea')) return;
    onSelectReport(report);
  };

  return (
    <div className={`relative flex-1 min-h-0 p-3 space-y-3 ${isCreating ? 'overflow-hidden' : 'overflow-y-auto'}`}>
      
      {/* Top Header / Mode Switcher */}
      {isCreating ? (
        <div className="absolute inset-0 z-20 bg-slate-100 grid grid-rows-[minmax(0,1fr)_auto] overflow-hidden">
          {/* Form Content Body (Scrollable) */}
          <div className="min-h-0 overflow-y-auto p-3.5 space-y-3.5 pb-4">
            <BackNavigationBar onBack={handleReturnToPrevious} />

            {isResubmit && (
              <div className="px-3.5 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 shadow-2xs">
                <p className="font-bold flex items-center space-x-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>原审核驳回意见：</span>
                </p>
                <p className="mt-1 text-[11px] text-rose-700 leading-relaxed">{editingRejectReason}</p>
              </div>
            )}

            {/* Form Fields Card */}
            <div className="bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-2xs space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  标题名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => {
                    setFormTitle(e.target.value);
                    if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: false }));
                  }}
                  placeholder={selectedTemplate.titlePlaceholder}
                  className={`w-full px-3 py-2 bg-slate-50 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:bg-white border ${
                    fieldErrors.title ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-blue-500'
                  }`}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-700">
                    内容描述 <span className="text-red-500">*</span>
                  </label>
                  {editingReport && <span className="text-[10px] text-slate-400">已带入上次提交内容，可直接修改补充</span>}
                </div>
                <textarea
                  rows={3}
                  value={formSummary}
                  onChange={(e) => {
                    setFormSummary(e.target.value);
                    if (fieldErrors.summary) setFieldErrors((prev) => ({ ...prev, summary: false }));
                  }}
                  placeholder={selectedTemplate.summaryPlaceholder}
                  className={`w-full px-3 py-2 bg-slate-50 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:bg-white resize-none border ${
                    fieldErrors.summary ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-blue-500'
                  }`}
                />
              </div>

              {false && (
                <>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">发生地址</label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="例如：西坝区阳光花园一期"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  事件来源 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formSource}
                  onChange={(e) => {
                    setFormSource(e.target.value as ReportSource | '');
                    if (fieldErrors.source) setFieldErrors((prev) => ({ ...prev, source: false }));
                  }}
                  className={`w-full px-2.5 py-2 bg-slate-50 rounded-xl text-slate-800 focus:outline-none focus:ring-2 border ${
                    fieldErrors.source ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-blue-500'
                  }`}
                >
                  <option value="">请选择</option>
                  {reportSourceOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  涉及区域 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formDistrict}
                  onChange={(e) => {
                    setFormDistrict(e.target.value);
                    if (fieldErrors.district) setFieldErrors((prev) => ({ ...prev, district: false }));
                  }}
                  className={`w-full px-2.5 py-2 bg-slate-50 rounded-xl text-slate-800 focus:outline-none focus:ring-2 border ${
                    fieldErrors.district ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-blue-500'
                  }`}
                >
                  <option value="">请选择</option>
                  {DISTRICT_OPTIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  信息类型 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formType}
                  onChange={(e) => {
                    setFormType(e.target.value as ReportType | '');
                    if (fieldErrors.type) setFieldErrors((prev) => ({ ...prev, type: false }));
                  }}
                  className={`w-full px-2.5 py-2 bg-slate-50 rounded-xl text-slate-800 focus:outline-none focus:ring-2 border ${
                    fieldErrors.type ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-blue-500'
                  }`}
                >
                  <option value="">请选择</option>
                  {TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  核心诉求 <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={formCoreDemand}
                  onChange={(e) => {
                    setFormCoreDemand(e.target.value);
                    if (fieldErrors.coreDemand) setFieldErrors((prev) => ({ ...prev, coreDemand: false }));
                  }}
                  placeholder={selectedTemplate.coreDemandPlaceholder}
                  className={`w-full px-3 py-2 bg-slate-50 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:bg-white resize-none border ${
                    fieldErrors.coreDemand ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-blue-500'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  处置建议 <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={formDisposalAdvice}
                  onChange={(e) => {
                    setFormDisposalAdvice(e.target.value);
                    if (fieldErrors.disposalAdvice) setFieldErrors((prev) => ({ ...prev, disposalAdvice: false }));
                  }}
                  placeholder={selectedTemplate.advicePlaceholder}
                  className={`w-full px-3 py-2 bg-slate-50 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:bg-white resize-none border ${
                    fieldErrors.disposalAdvice ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-blue-500'
                  }`}
                />
              </div>

              {(() => {
                const linkValue = formMatchedLink.trim();
                const linkValid = linkValue !== '' && isValidLinkUrl(linkValue);
                const linkInvalid = linkValue !== '' && !linkValid;
                return (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                      <Link className="w-3 h-3 text-slate-400" />
                      <span>匹配网络链接/存证URL（可选）</span>
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1 min-w-0">
                          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                            <Link className={`w-3.5 h-3.5 ${linkInvalid ? 'text-rose-400' : 'text-slate-400'}`} />
                          </div>
                          <input
                            type="url"
                            value={formMatchedLink}
                            onChange={(e) => {
                              setFormMatchedLink(e.target.value);
                              removeLinkShot();
                              if (fieldErrors.matchedLink) {
                                setFieldErrors((prev) => ({ ...prev, matchedLink: false }));
                              }
                            }}
                            placeholder="https://..."
                            className={`w-full pl-8 pr-3 py-2 bg-slate-50 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white font-mono text-[11px] transition-colors border ${
                              linkInvalid || fieldErrors.matchedLink
                                ? 'border-rose-300 focus:ring-2 focus:ring-rose-200'
                                : 'border-slate-200 focus:ring-2 focus:ring-blue-500'
                            }`}
                          />
                        </div>
                        {linkShot?.status !== 'done' && (
                          <button
                            type="button"
                            disabled={linkShot?.status === 'loading'}
                            onClick={() => {
                              if (!linkValue) {
                                setLinkShot({ status: 'empty', url: '' });
                                return;
                              }
                              if (linkInvalid) {
                                setLinkShot({ status: 'invalid', url: linkValue });
                                return;
                              }
                              captureLinkShot(linkValue);
                            }}
                            className="shrink-0 self-stretch px-3 flex items-center gap-1 rounded-xl border text-[11px] font-semibold transition-colors cursor-pointer border-blue-600 text-blue-600 bg-white hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300 disabled:bg-slate-50"
                          >
                            {linkShot?.status === 'loading' ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>截图中</span>
                              </>
                            ) : (
                              <>
                                <Camera className="w-3.5 h-3.5" />
                                <span>截图</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {linkInvalid &&
                        (linkShot?.status === 'invalid' ? (
                          <p className="flex items-center gap-1 text-[11px] text-rose-500">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>网址格式不正确，无法截图，请修改为以 http:// 或 https:// 开头的正确网址</span>
                          </p>
                        ) : (
                          <p className="text-[11px] text-rose-500">请输入正确的网址，需以 http:// 或 https:// 开头</p>
                        ))}

                      {linkShot?.status === 'empty' && !linkValue && (
                        <p className="flex items-center gap-1 text-[11px] text-amber-600">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>原文地址为空，请先输入原文链接再截图</span>
                        </p>
                      )}

                      {linkShot?.status === 'error' && (
                        <div className="flex items-start justify-between gap-2 px-2.5 py-2 rounded-xl bg-rose-50 border border-rose-100 text-[11px] text-rose-600">
                          <div className="flex items-start gap-1.5 min-w-0">
                            <AlertCircle className="w-3.5 h-3.5 mt-px shrink-0" />
                            <div className="min-w-0">
                              <div className="font-medium">原文地址不可访问</div>
                              {linkShot.reason && (
                                <div className="truncate text-rose-500/90">访问反馈：{linkShot.reason}</div>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => captureLinkShot(linkValue)}
                            className="shrink-0 font-medium hover:underline cursor-pointer"
                          >
                            重试
                          </button>
                        </div>
                      )}

                      {linkShot?.status === 'done' && (
                        <div className="flex items-start gap-3 p-2 rounded-xl bg-slate-50 border border-slate-200">
                          <button
                            type="button"
                            onClick={() => setLinkShotViewer({ url: linkShot.url, shotAt: linkShot.shotAt })}
                            className="w-28 h-[72px] shrink-0 rounded-md overflow-hidden border border-slate-200 cursor-zoom-in hover:border-blue-600 transition-colors"
                            title="查看原图"
                          >
                            {renderLinkShotMock(linkShot.url)}
                          </button>
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>已截取原文</span>
                            </div>
                            <div className="text-[11px] text-slate-400">{linkShot.shotAt}</div>
                            <div className="flex items-center gap-3 text-[11px]">
                              <button
                                type="button"
                                onClick={() => captureLinkShot(linkShot.url)}
                                className="flex items-center gap-0.5 text-blue-600 hover:underline cursor-pointer"
                              >
                                <RefreshCw className="w-3 h-3" />
                                <span>重新截图</span>
                              </button>
                              <button
                                type="button"
                                onClick={removeLinkShot}
                                className="flex items-center gap-0.5 text-slate-500 hover:text-rose-500 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>删除</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
                </>
              )}

              <TemplateExtraFields
                fields={selectedTemplate.extraFields}
                values={extraFieldValues}
                errors={extraFieldErrors}
                onChange={(fieldId, value) => {
                  setExtraFieldValues((prev) => ({ ...prev, [fieldId]: value }));
                  if (extraFieldErrors[fieldId]) {
                    setExtraFieldErrors((prev) => ({ ...prev, [fieldId]: false }));
                  }
                }}
              />
            </div>
          </div>

          {/* Fixed Bottom Action Bar: 取消, 提交 */}
          <div className="bg-white border-t border-slate-200 px-3 pt-3 pb-[max(0.25rem,env(safe-area-inset-bottom))] shadow-lg grid grid-cols-2 gap-2.5 z-50">
            <button
              type="button"
              onClick={handleReturnToPrevious}
              className="py-2.5 px-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center space-x-1 transition-all cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>取消</span>
            </button>

            <button
              type="button"
              onClick={handleSubmitForm}
              className="py-2.5 px-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-xs rounded-xl flex items-center justify-center space-x-1 shadow-sm transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isResubmit ? '重新提交审核' : '提交审核'}</span>
            </button>
          </div>

          {linkShotViewer && (
            <div
              className="absolute inset-0 z-[70] bg-black/50 flex items-center justify-center p-4"
              onClick={() => setLinkShotViewer(null)}
            >
              <div
                className="w-full max-w-[22rem] bg-white rounded-2xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-3.5 py-3 border-b border-slate-100 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800">原文截图</div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {linkShotViewer.url}
                      {linkShotViewer.shotAt ? ` · ${linkShotViewer.shotAt}` : ''}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLinkShotViewer(null)}
                    className="w-7 h-7 shrink-0 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-3 bg-slate-50">
                  <div className="h-[280px] rounded-xl overflow-hidden border border-slate-200">
                    {renderLinkShotMock(linkShotViewer.url, true)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {submitBlockTip && (
            <RecallConfirmDialog
              title="暂时无法提交"
              message={submitBlockTip}
              cancelLabel="关闭"
              confirmLabel="我知道了"
              variant="warning"
              onCancel={() => setSubmitBlockTip(null)}
              onConfirm={() => setSubmitBlockTip(null)}
            />
          )}
        </div>
      ) : (
        <>
          <div className="rounded-2xl bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-500 p-2.5 space-y-2 overflow-hidden shadow-md shadow-blue-500/20 text-white relative">
            <div className="absolute -right-7 -top-10 w-28 h-28 rounded-full border border-white/20" />
            <div className="absolute right-10 -bottom-12 w-24 h-24 rounded-full bg-white/10" />
            <div className="relative z-10 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                <h2 className="text-xs font-extrabold truncate">【上报员】报送数据统计</h2>
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-[1fr_1.06fr_1fr_1fr] gap-1.5">
              <div className="rounded-xl border border-white/20 bg-white/15 p-2 min-w-0 overflow-hidden">
                <p className="text-[9px] text-cyan-100 font-bold truncate">报送待办</p>
                <p className="text-xl leading-none font-black font-mono text-white mt-1.5">{reportTodoCount}</p>
                <p className="text-[8px] text-cyan-100/80 truncate mt-1.5">
                  驳回待改 {reportRejectedTodo}
                </p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/15 px-1 py-2 min-w-0 overflow-hidden">
                <p className="text-[9px] text-slate-200 font-bold truncate">累计上报</p>
                <p className="text-xl leading-none font-black font-mono text-white mt-1.5">{reportSubmittedTotal}</p>
                <div
                  className="text-[7.5px] tracking-tight text-slate-200 mt-1.5 whitespace-nowrap flex items-center justify-between"
                  title={`首发 ${reportFirstCount} / 重复 ${reportRepeatCount} / 待审 ${reportPendingAudit}`}
                >
                  <span>首发 {reportFirstCount}</span>
                  <span className="text-white/35 text-[7px]">/</span>
                  <span>重复 {reportRepeatCount}</span>
                  <span className="text-white/35 text-[7px]">/</span>
                  <span>待审 {reportPendingAudit}</span>
                </div>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/15 p-2 min-w-0 overflow-hidden">
                <p className="text-[9px] text-emerald-200 font-bold truncate">一次通过率</p>
                <p className="text-xl leading-none font-black font-mono text-emerald-300 mt-1.5">
                  {reportFirstPassRate}%
                </p>
                <p className="text-[8px] text-emerald-100/80 truncate mt-1.5">
                  {reportFirstPass}/{reportSubmittedTotal} 一次过
                </p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/15 p-2 min-w-0 overflow-hidden">
                <p className="text-[9px] text-slate-200 font-bold truncate">整体通过率</p>
                <p className="text-xl leading-none font-black font-mono text-white mt-1.5">
                  {reportOverallPassRate}%
                </p>
                <p className="text-[8px] text-slate-300 truncate mt-1.5">
                  {reportApproved}/{reportSubmittedTotal} 通过
                </p>
              </div>
            </div>
          </div>

          {showAllStatuses && (
            /* Filter Chips Bar with Horizontal Scroll */
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-0.5 scroll-smooth overscroll-x-contain touch-pan-x select-none">
              {filterTabs.map((tab) => {
                const isActive = activeFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    ref={isActive ? (el) => { activeTabRef.current = el; } : null}
                    onClick={() => setActiveFilter(tab.key)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs whitespace-nowrap font-medium transition-all shrink-0 ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80 active:bg-slate-200'
                    }`}
                  >
                    {tab.label} ({getFilterTabCount(tab.key)})
                  </button>
                );
              })}
            </div>
          )}

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索上报标题或描述关键词进行检索"
              aria-label="搜索上报标题或描述关键词"
              className="w-full pl-9 pr-9 py-2.5 bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/15 transition-all shadow-2xs"
            />
            {searchKeyword && (
              <button
                type="button"
                onClick={() => setSearchKeyword('')}
                aria-label="清空搜索"
                title="清空搜索"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* List of Reports */}
          <div className="space-y-2.5 pb-4">
            {filteredReports.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-200">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                <p className="text-xs">
                  暂无匹配的速报记录
                </p>
              </div>
            ) : (
              filteredReports.map((report) => (
                <div
                  key={report.id}
                  onClick={(event) => handleReportCardClick(event, report)}
                  className="bg-white rounded-xl p-3.5 shadow-2xs border border-slate-200 hover:border-blue-300 active:bg-slate-50 transition-all cursor-pointer space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs font-bold text-slate-800 leading-snug line-clamp-2 flex-1">
                      {report.title}
                    </h3>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {report.identificationTag && (
                        <IdentificationBadge tag={report.identificationTag} size="xs" />
                      )}
                      {getStatusBadge(report.status)}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                    {report.summary}
                  </p>

                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-mono">{report.createTime}</span>
                    <div className="flex items-center gap-3">
                      {canDeleteReport(report) && (
                        <button
                          type="button"
                          onPointerDown={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                          onTouchStart={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDeleteTargetId(report.id);
                          }}
                          className="-my-1 -mx-1 px-1.5 py-1 text-red-500 hover:text-red-700 font-medium flex items-center gap-0.5 rounded-md hover:bg-red-50 active:scale-95 transition-all cursor-pointer"
                          aria-label="删除速报"
                          title="删除"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>删除</span>
                        </button>
                      )}
                      {report.status === 'rejected' && onEditReport && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onEditReport(report);
                          }}
                          className="-my-1 -mx-1 px-1.5 py-1 text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-0.5 rounded-md hover:bg-indigo-50 active:scale-95 transition-all cursor-pointer"
                          title="修改补充并重新提交"
                        >
                          <PencilLine className="w-3.5 h-3.5" />
                          <span>编辑</span>
                        </button>
                      )}
                      <span className="text-blue-600 font-medium flex items-center">
                        详情 <ChevronRight className="w-3 h-3 ml-0.5" />
                      </span>
                    </div>
                  </div>

                </div>
              ))
            )}
            <p className="text-center text-[10px] text-slate-400 py-2">
              默认显示近三个月的数据
            </p>
          </div>
        </>
      )}

      {deleteTargetId && (
        <RecallConfirmDialog
          title="确认删除这条速报？"
          message="删除后不可恢复，请谨慎操作。"
          cancelLabel="取消"
          confirmLabel="确认删除"
          variant="danger"
          onCancel={() => setDeleteTargetId(null)}
          onConfirm={() => {
            onDeleteReport(deleteTargetId);
            setDeleteTargetId(null);
          }}
        />
      )}

    </div>
  );
};
