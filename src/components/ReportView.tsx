import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { SpeedReport, ReportTemplate, UserProfile, ReportStatus, ReportType, ReportSource, IdentificationTag } from '../types';
import { REPORT_TEMPLATES, DISTRICT_OPTIONS, TYPE_OPTIONS, SOURCE_OPTIONS } from '../data/mockData';
import { Plus, Save, Send, ChevronRight, X, Sparkles, Filter, Link, FileText, Trash2, CheckCircle2, Clock } from 'lucide-react';
import { BackNavigationBar } from './BackNavigationBar';
import { RecallConfirmDialog } from './RecallConfirmDialog';
import { IdentificationBadge } from './IdentificationBadge';
import { calculatePreJudgment } from '../utils/identification';

interface ReportViewProps {
  reports: SpeedReport[];
  user: UserProfile;
  onSaveReport: (report: Partial<SpeedReport>, isSubmit: boolean) => void;
  onDeleteReport: (id: string) => void;
  onRecallReport: (id: string) => void;
  onSelectReport: (report: SpeedReport) => void;
  onToast: (msg: string) => void;
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
  initialEditReport,
  isCreatingNew,
  initialTemplateId,
  showAllStatuses = false,
  onFormModeChange,
  onCloseForm,
}) => {
  const [activeFilter, setActiveFilter] = useState<string>(showAllStatuses ? 'all' : 'draft');
  const [isCreating, setIsCreating] = useState<boolean>(!!initialEditReport || !!isCreatingNew);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate>(REPORT_TEMPLATES[0]);
  const [pendingRecallReport, setPendingRecallReport] = useState<SpeedReport | null>(null);

  // Form state
  const [editingId, setEditingId] = useState<string | null>(initialEditReport?.id || null);
  const [formTitle, setFormTitle] = useState<string>(initialEditReport?.title || REPORT_TEMPLATES[0].titlePlaceholder.replace('例如：', ''));
  const [formAddress, setFormAddress] = useState<string>(initialEditReport?.address || '西坝区实验幼儿园');
  const [formSource, setFormSource] = useState<ReportSource>(initialEditReport?.source || REPORT_TEMPLATES[0].defaultSource);
  const [formDistrict, setFormDistrict] = useState<string>(initialEditReport?.district || '西坝区');
  const [formType, setFormType] = useState<ReportType>(initialEditReport?.type || REPORT_TEMPLATES[0].defaultType);
  const [formSummary, setFormSummary] = useState<string>(initialEditReport?.summary || '家长群中出现关于托育服务收费标准的咨询和争议，正在补充政策依据。');
  const [formCoreDemand, setFormCoreDemand] = useState<string>(initialEditReport?.coreDemand || '明确收费标准、退费规则和服务内容。');
  const [formDisposalAdvice, setFormDisposalAdvice] = useState<string>(initialEditReport?.disposalAdvice || '建议教育部门准备统一答复口径。');
  const [formMatchedLink, setFormMatchedLink] = useState<string>(initialEditReport?.matchedLink || '');
  const getTemplateById = (templateId?: string | null) =>
    REPORT_TEMPLATES.find((tpl) => tpl.id === templateId) ?? REPORT_TEMPLATES[0];

  const filterTabs = showAllStatuses
    ? [
        { key: 'pending', label: '待审核' },
        { key: 'auditing', label: '审核中' },
        { key: 'approved', label: '已采纳' },
        { key: 'rejected', label: '已驳回' },
        { key: 'draft', label: '草稿' },
      ]
    : [{ key: 'draft', label: '草稿' }];
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
    setActiveFilter(showAllStatuses ? 'pending' : 'draft');
  }, [showAllStatuses]);

  useEffect(() => {
    if (initialEditReport) {
      setEditingId(initialEditReport.id);
      setFormTitle(initialEditReport.title);
      setFormAddress(initialEditReport.address);
      setFormSource(initialEditReport.source);
      setFormDistrict(initialEditReport.district);
      setFormType(initialEditReport.type);
      setFormSummary(initialEditReport.summary);
      setFormCoreDemand(initialEditReport.coreDemand);
      setFormDisposalAdvice(initialEditReport.disposalAdvice);
      setFormMatchedLink(initialEditReport.matchedLink || '');
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
    setFormType(tpl.defaultType);
    setFormSource(tpl.defaultSource);
    if (!editingId) {
      setFormTitle(tpl.titlePlaceholder.replace('例如：', ''));
      setFormSummary(tpl.summaryPlaceholder);
      setFormCoreDemand(tpl.coreDemandPlaceholder);
      setFormDisposalAdvice(tpl.advicePlaceholder);
    }
    onToast(`已切换为：${tpl.name}`);
  };

  function handleOpenNewForm() {
    const template = getTemplateById(initialTemplateId);
    setEditingId(null);
    setSelectedTemplate(template);
    setFormTitle(template.titlePlaceholder.replace('例如：', ''));
    setFormAddress('西坝区实验幼儿园');
    setFormSource(template.defaultSource);
    setFormDistrict('西坝区');
    setFormType(template.defaultType);
    setFormSummary(template.summaryPlaceholder);
    setFormCoreDemand(template.coreDemandPlaceholder);
    setFormDisposalAdvice(template.advicePlaceholder);
    setFormMatchedLink('');
    setIsCreating(true);
  }

  const handleSubmitForm = (isSubmit: boolean) => {
    if (!formTitle.trim()) {
      onToast('请输入事件标题');
      return;
    }

    const payload: Partial<SpeedReport> = {
      id: editingId || `rep_${Date.now()}`,
      title: formTitle,
      address: formAddress,
      source: formSource,
      district: formDistrict,
      type: formType,
      summary: formSummary,
      coreDemand: formCoreDemand,
      disposalAdvice: formDisposalAdvice,
      matchedLink: formMatchedLink,
      author: user.name,
      authorDept: user.department,
      gridNo: user.gridCode,
      status: isSubmit ? 'pending_audit' : 'draft',
      updateTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
      createTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
      tags: [formDistrict, formType, user.department],
    };

    if (isSubmit) {
      // 1. 上报环节：用户点击提交后（草稿不算），系统自动比对不良信息库与待审件/审核中数据，立刻打上预判断标识
      const { tag, reason } = calculatePreJudgment(payload, reports);
      payload.identificationTag = tag;
      payload.identificationReason = reason;
      payload.identificationTime = payload.updateTime;
    } else {
      // 草稿不算，不打标
      payload.identificationTag = undefined;
      payload.identificationReason = undefined;
      payload.identificationTime = undefined;
    }

    onSaveReport(payload, isSubmit);
    setIsCreating(false);
    onCloseForm?.();
  };

  const reportTodoCount = reports.filter((r) => r.status === 'draft' || r.status === 'rejected').length;
  const submittedReports = reports.filter((r) => r.status !== 'draft');
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
      case 'draft':
        return reportListItems.filter((r) => r.status === 'draft').length;
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

    if (!showAllStatuses && r.status !== 'draft') return false;
    if (activeFilter === 'draft' && r.status !== 'draft') return false;
    if (activeFilter === 'pending' && r.status !== 'pending_audit') return false;
    if (activeFilter === 'auditing' && r.status !== 'auditing') return false;
    if (activeFilter === 'approved' && r.status !== 'approved') return false;
    if (activeFilter === 'rejected' && r.status !== 'rejected') return false;

    return true;
  });

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'draft':
        return <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">草稿</span>;
      case 'pending_audit':
        return <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[10px] font-bold">待审核</span>;
      case 'auditing':
        return <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-700 text-[10px] font-bold">审核中</span>;
      case 'approved':
        return <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-bold">已采纳</span>;
      case 'rejected':
        return <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 text-[10px] font-bold">已驳回</span>;
      case 'pending_transfer':
      case 'transferred':
        return null;
    }
  };

  const canDeleteReport = (report: SpeedReport) =>
    report.status === 'draft' || report.status === 'rejected';
  const canRecallReport = (report: SpeedReport) => report.status === 'pending_audit';
  const phoneScreen = typeof document !== 'undefined' ? document.getElementById('wechat-phone-screen') : null;
  const recallModalPortalTarget = typeof document !== 'undefined' ? phoneScreen ?? document.body : null;

  const handleConfirmRecall = () => {
    if (!pendingRecallReport) return;
    onRecallReport(pendingRecallReport.id);
    setPendingRecallReport(null);
  };

  const handleReturnToPrevious = () => {
    setIsCreating(false);
    onCloseForm?.();
  };

  const handleReportCardClick = (event: React.MouseEvent<HTMLDivElement>, report: SpeedReport) => {
    const target = event.target as HTMLElement;
    if (target.closest('button, a, input, select, textarea')) return;
    onSelectReport(report);
  };

  return (
    <div className="flex-1 p-3 space-y-3 overflow-y-auto">
      
      {/* Top Header / Mode Switcher */}
      {isCreating ? (
        <div className="absolute inset-0 z-20 bg-slate-100 flex flex-col overflow-hidden">
          {/* Form Content Body (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 pb-24">
            <BackNavigationBar onBack={handleReturnToPrevious} />

            {/* Form Fields Card */}
            <div className="bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-2xs space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  事件标题 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder={selectedTemplate.titlePlaceholder}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

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

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">事件来源</label>
                  <select
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value as ReportSource)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {reportSourceOptions.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">涉及区域</label>
                  <select
                    value={formDistrict}
                    onChange={(e) => setFormDistrict(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {DISTRICT_OPTIONS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">信息类型</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as ReportType)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">内容摘要</label>
                <textarea
                  rows={3}
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  placeholder={selectedTemplate.summaryPlaceholder}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">核心诉求</label>
                <textarea
                  rows={2}
                  value={formCoreDemand}
                  onChange={(e) => setFormCoreDemand(e.target.value)}
                  placeholder={selectedTemplate.coreDemandPlaceholder}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">处置建议</label>
                <textarea
                  rows={2}
                  value={formDisposalAdvice}
                  onChange={(e) => setFormDisposalAdvice(e.target.value)}
                  placeholder={selectedTemplate.advicePlaceholder}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                  <Link className="w-3 h-3 text-slate-400" />
                  <span>匹配网络链接/存证URL（可选）</span>
                </label>
                <input
                  type="url"
                  value={formMatchedLink}
                  onChange={(e) => setFormMatchedLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-[11px]"
                />
              </div>
            </div>
          </div>

          {/* Fixed Bottom Action Bar: 取消, 保存草稿, 提交 */}
          <div className="bg-white border-t border-slate-200 p-3 shrink-0 shadow-lg grid grid-cols-3 gap-2 z-50">
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
              onClick={() => handleSubmitForm(false)}
              className="py-2.5 px-2 bg-slate-200 hover:bg-slate-300 active:scale-95 text-slate-800 font-semibold text-xs rounded-xl flex items-center justify-center space-x-1 transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>保存草稿</span>
            </button>

            <button
              type="button"
              onClick={() => handleSubmitForm(true)}
              className="py-2.5 px-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-xs rounded-xl flex items-center justify-center space-x-1 shadow-sm transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>提交</span>
            </button>
          </div>
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
                  草稿 {reports.filter((r) => r.status === 'draft').length} / 驳回 {reportRejectedTodo}
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

          {/* List of Reports */}
          <div className="space-y-2.5 pb-4">
            {filteredReports.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-200">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                <p className="text-xs">
                  {activeFilter === 'draft' ? '暂无草稿记录' : '暂无匹配的速报记录'}
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
                      {report.status !== 'draft' && report.identificationTag && (
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
                      {canRecallReport(report) && (
                        <button
                          type="button"
                          onPointerDown={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                          onTouchStart={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setPendingRecallReport(report);
                          }}
                          className="-my-1 -mx-1 px-1.5 py-1 text-amber-500 font-medium flex items-center rounded-md hover:bg-amber-50"
                          aria-label="撤回速报"
                          title="撤回"
                        >
                          撤回
                        </button>
                      )}
                      {canDeleteReport(report) && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('确认删除这条速报吗？删除后不可恢复。')) {
                              onDeleteReport(report.id);
                            }
                          }}
                          className="text-red-500 font-medium flex items-center"
                          aria-label="删除速报"
                          title="删除"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
            <p
              className={`text-center transition-all ${
                activeFilter === 'draft'
                  ? 'text-[11px] text-amber-700 bg-amber-50/90 border border-amber-200/80 rounded-xl py-2 px-3 flex items-center justify-center gap-1.5 font-medium shadow-2xs'
                  : 'text-[10px] text-slate-400 py-2'
              }`}
            >
              {activeFilter === 'draft' ? (
                <>
                  <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>草稿数据仅保留3天，请尽快完善提交，到期将自动清空</span>
                </>
              ) : (
                '默认显示近三个月的数据'
              )}
            </p>
          </div>
        </>
      )}

      {pendingRecallReport && recallModalPortalTarget && createPortal(
        <RecallConfirmDialog
          title="确认撤回这条待审核速报？"
          message="撤回后将回到草稿箱，仍可继续修改后重新提交。"
          confirmLabel="确认撤回"
          onCancel={() => setPendingRecallReport(null)}
          onConfirm={handleConfirmRecall}
        />
      , recallModalPortalTarget)}

    </div>
  );
};
