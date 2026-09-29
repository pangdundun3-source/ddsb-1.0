import { useState, useEffect } from 'react';
import {
  AVAILABLE_ORGS,
  initialAuditPending,
  initialAuditRecords,
  initialLogs,
  initialOrgs,
  initialTemplates,
  initialReports
} from '../data/mockData';
import { isFinalAuditStage } from '../auditStage';
import {
  appendTimeline,
  approveReport,
  createAuditRecord,
  createOperationLog,
  createSubmittedReport,
  getNowText,
  rejectReport,
  resubmitReport,
  transferReport
} from '../services/reportWorkflowService';
import {
  AuditRecordItem,
  LogItem,
  NewReportFormData,
  OrgAccount,
  OrgItem,
  PageId,
  ReportItem,
  ReportTemplateInput
} from '../types';

const VALID_PAGES: PageId[] = [
  'login',
  'home',
  'report-summary',
  'report-records',
  'report-detail',
  'report-audit',
  'audit-detail',
  'audit-records',
  'audit-record-detail',
  'negative-info',
  'negative-detail',
  'statistics',
  'evaluation',
  'personal-info',
  'org-management',
  'role-permission',
  'business-config',
  'system-logs'
];

export function getHashRoute(): { page: PageId; module?: string } | null {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash || '';
  if (!hash || hash === '#' || hash === '#/') return null;

  const rawPath = hash.replace(/^#\/?/, '');
  const [pathPart, queryPart] = rawPath.split('?');
  const pageCandidate = (pathPart?.trim() || '') as PageId;

  let extraModule: string | undefined;
  if (queryPart) {
    const searchParams = new URLSearchParams(queryPart);
    const m = searchParams.get('module');
    if (m) extraModule = m;
  }

  if (VALID_PAGES.includes(pageCandidate)) {
    return { page: pageCandidate, module: extraModule };
  }
  return null;
}

export interface ToastInfo {
  message: string;
  type?: 'success' | 'reject' | 'error' | 'info';
}

export const useAppViewModel = () => {
  const [currentOrg, setCurrentOrg] = useState<OrgAccount>(() => {
    try {
      const savedOrgId = localStorage.getItem('ddsb_current_org_id');
      return AVAILABLE_ORGS.find((org) => org.id === savedOrgId) || AVAILABLE_ORGS[0];
    } catch {
      return AVAILABLE_ORGS[0];
    }
  });

  const [activePage, setActivePage] = useState<PageId>(() => {
    try {
      const hashRoute = getHashRoute();
      if (hashRoute) {
        localStorage.setItem('ddsb_active_page', hashRoute.page);
        return hashRoute.page;
      }
      const savedPage = localStorage.getItem('ddsb_active_page') as PageId | null;
      if (savedPage && VALID_PAGES.includes(savedPage)) {
        return savedPage;
      }
      return 'login';
    } catch {
      return 'login';
    }
  });

  const [businessConfigInitialModule, setBusinessConfigInitialModule] = useState<string>(() => {
    const hashRoute = getHashRoute();
    return hashRoute?.module || 'report_template';
  });

  // Sync hash changes (e.g. browser back/forward, manual address bar edit) with app state
  useEffect(() => {
    const syncFromHash = () => {
      const hashRoute = getHashRoute();
      if (hashRoute) {
        setActivePage((prev) => {
          if (prev !== hashRoute.page) {
            try {
              localStorage.setItem('ddsb_active_page', hashRoute.page);
            } catch {
              // Ignore storage failures
            }
            return hashRoute.page;
          }
          return prev;
        });
        if (hashRoute.module) {
          setBusinessConfigInitialModule(hashRoute.module);
        }
      }
    };

    // Ensure initial hash reflects active page if hash was empty
    const currentHash = window.location.hash;
    if (!currentHash || currentHash === '#' || currentHash === '#/') {
      const targetHash =
        businessConfigInitialModule && activePage === 'business-config'
          ? `#/${activePage}?module=${encodeURIComponent(businessConfigInitialModule)}`
          : `#/${activePage}`;
      window.location.hash = targetHash;
    }

    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  const [reports, setReports] = useState<ReportItem[]>([
    ...initialAuditPending,
    ...initialReports
  ]);
  const reportTemplates = initialTemplates;
  const [auditRecords, setAuditRecords] = useState<AuditRecordItem[]>(initialAuditRecords);
  const [orgs, setOrgs] = useState<OrgItem[]>(initialOrgs);
  const [logs, setLogs] = useState<LogItem[]>(initialLogs);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(
    reports[0] || initialAuditPending[0]
  );
  const [selectedAudit, setSelectedAudit] = useState<ReportItem | null>(
    initialAuditPending[0] || null
  );
  const [selectedNegative, setSelectedNegative] = useState<ReportItem | null>(
    reports.find((report) => report.auditStatus === '待转办') || reports[0]
  );
  const [selectedAuditRecord, setSelectedAuditRecord] = useState<AuditRecordItem | null>(
    auditRecords[0] || null
  );
  const [reportDetailSourcePage, setReportDetailSourcePage] = useState<PageId>('report-summary');
  const [isNewReportModalOpen, setIsNewReportModalOpen] = useState(false);
  const [newReportTemplate, setNewReportTemplate] = useState<ReportTemplateInput | null>(null);
  const [editingReport, setEditingReport] = useState<ReportItem | null>(null);
  const [isH5MobileOpen, setIsH5MobileOpen] = useState(false);
  const [toastInfo, setToastInfo] = useState<ToastInfo | null>(null);

  const showToast = (
    message: string,
    type: 'success' | 'reject' | 'error' | 'info' = 'success'
  ) => {
    const finalType =
      type === 'success' && (message.includes('驳回') || message.includes('删除'))
        ? 'reject'
        : type;
    setToastInfo({ message, type: finalType });
    setTimeout(() => setToastInfo(null), 3500);
  };

  const handleNavigate = (page: PageId, extraModule?: string) => {
    setActivePage(page);
    try {
      localStorage.setItem('ddsb_active_page', page);
    } catch {
      // Ignore storage failures in restricted browser contexts.
    }
    if (extraModule && page === 'business-config') {
      setBusinessConfigInitialModule(extraModule);
    }
    const targetHash =
      extraModule && page === 'business-config'
        ? `#/${page}?module=${encodeURIComponent(extraModule)}`
        : `#/${page}`;
    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    }
  };

  const handleSwitchOrg = (org: OrgAccount) => {
    setCurrentOrg(org);
    try {
      localStorage.setItem('ddsb_current_org_id', org.id);
    } catch {
      // Ignore storage failures in restricted browser contexts.
    }
  };

  const handleCreateReport = (newReportData: NewReportFormData) => {
    const createdItem = createSubmittedReport(newReportData, Date.now(), getNowText(), reports);
    setReports((previous) => [createdItem, ...previous]);
    setLogs((previous) => [
      createOperationLog(
        '提交速报',
        `创建并提交了速报《${newReportData.title}》（智能识别：${createdItem.originLabel || '疑似首发'}）`,
        getNowText(),
        newReportData.author,
        newReportData.organization
      ),
      ...previous
    ]);
    showToast(`新速报提交成功（智能识别：${createdItem.originLabel || '疑似首发'}），已进入待审核队列！`);
  };

  const handleDeleteReport = (id: number) => {
    setReports((previous) => previous.filter((report) => report.id !== id));
    showToast('已成功删除该记录');
  };

  const handleWithdrawReport = (id: number) => {
    const target = reports.find((report) => report.id === id);
    if (!target) return;
    const now = getNowText();
    const updated = appendTimeline(
      { ...target, auditStatus: '草稿' },
      [
        {
          title: '撤回报送',
          operator: `${target.author}·${target.organization}`,
          time: now,
          status: 'current',
          note: '已撤回为草稿，可编辑后重新提交。'
        }
      ]
    );
    setReports((previous) => previous.map((report) => (report.id === id ? updated : report)));
    if (selectedReport?.id === id) setSelectedReport(updated);
    if (selectedAudit?.id === id) setSelectedAudit(updated);
    showToast('已成功撤回报送，已转为草稿状态');
  };

  const handleResubmitReport = (updatedReport: ReportItem) => {
    const updated = resubmitReport(updatedReport, getNowText(), reports);
    setReports((previous) => {
      const exists = previous.some((report) => report.id === updated.id);
      return exists
        ? previous.map((report) => (report.id === updated.id ? updated : report))
        : [updated, ...previous];
    });
    if (selectedReport?.id === updated.id) setSelectedReport(updated);
    if (selectedAudit?.id === updated.id) setSelectedAudit(updated);
    showToast(`速报已成功提交送审（标识为：${updated.originLabel || '疑似首发'}）！`);
  };

  const handleApproveAudit = (id: number, score?: number, isBatch = false) => {
    let target = reports.find((report) => report.id === id);
    if (!target && selectedAudit?.id === id) {
      target = selectedAudit;
    }
    if (!target) {
      showToast('审核通过成功！', 'success');
      return;
    }
    const now = getNowText();

    let finalReportToRecord = target;

    if (isBatch && (selectedAudit?.matchUrl || target.matchUrl)) {
      const matchUrl = selectedAudit?.matchUrl || target.matchUrl;
      const matchedIds = new Set(
        reports
          .filter((report) => report.matchUrl === matchUrl || report.id === id)
          .map((report) => report.id)
      );
      setReports((previous) =>
        previous.map((report) => {
          if (matchedIds.has(report.id)) {
            const updated = approveReport(report, score, now);
            if (report.id === id) finalReportToRecord = updated;
            return updated;
          }
          return report;
        })
      );
      const selectedUpdate = reports.find((report) => report.id === selectedAudit?.id);
      if (selectedUpdate) {
        const updatedSelected = approveReport(selectedUpdate, score, now);
        setSelectedAudit(updatedSelected);
        finalReportToRecord = updatedSelected;
      }
      showToast(
        `批量审核成功！已审核通过同源关联速报${score !== undefined ? `（评分: ${score}分）` : ''}！`,
        'success'
      );
    } else {
      const updated = approveReport(target, score, now);
      finalReportToRecord = updated;
      setReports((previous) => previous.map((report) => (report.id === id ? updated : report)));
      if (selectedAudit?.id === id) setSelectedAudit(updated);
      if (selectedReport?.id === id) setSelectedReport(updated);
      showToast(
        `审核通过成功！速报《${target.title}》已审核通过${
          isFinalAuditStage(target) && score !== undefined ? `（评分: ${score}分）` : ''
        }`,
        'success'
      );
    }

    setAuditRecords((previous) => [
      createAuditRecord(
        finalReportToRecord,
        '已通过',
        now,
        isFinalAuditStage(target) ? score : undefined
      ),
      ...previous
    ]);
    setLogs((previous) => [
      createOperationLog(
        '审核速报',
        `审核通过了速报《${target.title}》${
          isFinalAuditStage(target) && score !== undefined ? `，给予 ${score} 分` : ''
        }`,
        now
      ),
      ...previous
    ]);
  };

  const handleRejectAudit = (id: number, reason: string, detail: string) => {
    let target = reports.find((report) => report.id === id);
    if (!target && selectedAudit?.id === id) {
      target = selectedAudit;
    }
    if (!target) {
      showToast(`审核驳回成功！已驳回速报，原因: ${reason}`, 'reject');
      return;
    }
    const now = getNowText();
    const updated = rejectReport(target, reason, detail, now);
    setReports((previous) => previous.map((report) => (report.id === id ? updated : report)));
    if (selectedAudit?.id === id) setSelectedAudit(updated);
    if (selectedReport?.id === id) setSelectedReport(updated);
    setAuditRecords((previous) => [
      createAuditRecord(target, '被驳回', now, undefined, reason, detail),
      ...previous
    ]);
    setLogs((previous) => [
      createOperationLog(
        '驳回速报',
        `驳回了速报《${target.title}》，原因: ${reason}`,
        now
      ),
      ...previous
    ]);
    showToast(`审核驳回成功！速报《${target.title}》已被驳回，原因: ${reason}`, 'reject');
  };

  const handleBatchApprove = (ids: number[], score?: number) => {
    const now = getNowText();
    const targets = reports.filter((report) => ids.includes(report.id));
    const updates = new Map(
      targets.map((report) => [report.id, approveReport(report, score, now)])
    );
    setReports((previous) =>
      previous.map((report) => updates.get(report.id) || report)
    );
    if (selectedAudit && updates.has(selectedAudit.id)) {
      setSelectedAudit(updates.get(selectedAudit.id)!);
    }
    if (selectedReport && updates.has(selectedReport.id)) {
      setSelectedReport(updates.get(selectedReport.id)!);
    }
    setAuditRecords((previous) => [
      ...targets.map((target, index) => ({
        ...createAuditRecord(
          target,
          '已通过',
          now,
          isFinalAuditStage(target) ? score : undefined
        ),
        id: Date.now() + index
      })),
      ...previous
    ]);
    setLogs((previous) => [
      createOperationLog(
        '批量审核速报',
        `批量审核通过了 ${ids.length} 条同源速报${
          score !== undefined ? `，终审统一赋予 ${score} 分` : ''
        }`,
        now
      ),
      ...previous
    ]);
    showToast(
      `批量审核成功！已成功审核通过 ${ids.length} 条速报${score !== undefined ? `（终审评分: ${score}分）` : ''}！`,
      'success'
    );
  };

  const handleBatchReject = (ids: number[], reason: string, detail: string) => {
    const now = getNowText();
    const targets = reports.filter((report) => ids.includes(report.id));
    const updates = new Map(
      targets.map((report) => [report.id, rejectReport(report, reason, detail, now)])
    );
    setReports((previous) =>
      previous.map((report) => updates.get(report.id) || report)
    );
    if (selectedAudit && updates.has(selectedAudit.id)) {
      setSelectedAudit(updates.get(selectedAudit.id)!);
    }
    if (selectedReport && updates.has(selectedReport.id)) {
      setSelectedReport(updates.get(selectedReport.id)!);
    }
    setAuditRecords((previous) => [
      ...targets.map((target, index) => ({
        ...createAuditRecord(target, '被驳回', now, undefined, reason, detail),
        id: Date.now() + index
      })),
      ...previous
    ]);
    setLogs((previous) => [
      createOperationLog(
        '批量驳回速报',
        `批量驳回了 ${ids.length} 条同源速报，原因: ${reason}`,
        now
      ),
      ...previous
    ]);
    showToast(`批量驳回成功！已成功驳回 ${ids.length} 条速报，原因: ${reason}`, 'reject');
  };

  const handleTransferSubmit = (id: number, opinion: string) => {
    const target = reports.find((report) => report.id === id);
    if (!target) return;
    const now = getNowText();
    const updated = transferReport(target, opinion, now);
    setReports((previous) => previous.map((report) => (report.id === id ? updated : report)));
    if (selectedNegative?.id === id) setSelectedNegative(updated);
    if (selectedReport?.id === id) setSelectedReport(updated);
    setLogs((previous) => [
      createOperationLog(
        '转办速报',
        `提交了速报《${target.title}》的转办申请，意见: ${opinion || '无'}`,
        now,
        '张三',
        '市委宣传部舆情科'
      ),
      ...previous
    ]);
    showToast('速报转办意见已提交！');
  };

  const handleAddOrg = (orgData: Omit<OrgItem, 'id'>) => {
    setOrgs((previous) => [...previous, { ...orgData, id: Date.now() }]);
    showToast('机构添加成功！');
  };

  const handleUpdateOrg = (updatedOrg: OrgItem) => {
    setOrgs((previous) =>
      previous.map((org) => (org.id === updatedOrg.id ? updatedOrg : org))
    );
    showToast('机构信息已更新');
  };

  const handleDeleteOrg = (id: number) => {
    setOrgs((previous) => previous.filter((org) => org.id !== id));
    showToast('已删除机构');
  };

  return {
    activePage,
    currentOrg,
    businessConfigInitialModule,
    reports,
    reportTemplates,
    auditRecords,
    orgs,
    logs,
    selectedReport,
    selectedAudit,
    selectedNegative,
    selectedAuditRecord,
    reportDetailSourcePage,
    isNewReportModalOpen,
    newReportTemplate,
    editingReport,
    isH5MobileOpen,
    toastInfo,
    toastMessage: toastInfo?.message || null,
    showToast,
    setSelectedReport,
    setSelectedAudit,
    setSelectedNegative,
    setSelectedAuditRecord,
    setReportDetailSourcePage,
    setIsH5MobileOpen,
    openNewReportModal: (templateData?: ReportTemplateInput | null) => {
      setEditingReport(null);
      setNewReportTemplate(templateData || null);
      setIsNewReportModalOpen(true);
    },
    handleOpenNewReport: (templateData?: ReportTemplateInput | null) => {
      setEditingReport(null);
      setNewReportTemplate(templateData || null);
      setIsNewReportModalOpen(true);
    },
    openEditReportModal: (report: ReportItem) => {
      setEditingReport(report);
      setNewReportTemplate(null);
      setIsNewReportModalOpen(true);
    },
    closeNewReportModal: () => {
      setIsNewReportModalOpen(false);
      setEditingReport(null);
      setNewReportTemplate(null);
    },
    handleNavigate,
    handleSwitchOrg,
    handleCreateReport,
    handleDeleteReport,
    handleWithdrawReport,
    handleResubmitReport,
    handleApproveAudit,
    handleRejectAudit,
    handleBatchApprove,
    handleBatchReject,
    handleTransferSubmit,
    handleAddOrg,
    handleUpdateOrg,
    handleDeleteOrg
  };
};
