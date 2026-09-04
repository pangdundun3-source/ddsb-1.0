import { useState } from 'react';
import {
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
import { AuditRecordItem, LogItem, NewReportFormData, OrgItem, PageId, ReportItem } from '../types';

export const useAppViewModel = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      const savedAuth = localStorage.getItem('ddsb_is_logged_in');
      return savedAuth === 'true';
    } catch {
      return false;
    }
  });
  const [currentUser, setCurrentUser] = useState<string>(() => {
    try {
      return localStorage.getItem('ddsb_current_user') || '张三';
    } catch {
      return '张三';
    }
  });
  const [activePage, setActivePage] = useState<PageId>(() => {
    try {
      const savedAuth = localStorage.getItem('ddsb_is_logged_in');
      if (savedAuth !== 'true') return 'login';
      const saved = localStorage.getItem('ddsb_active_page');
      return (saved as PageId) || 'portal';
    } catch {
      return 'login';
    }
  });
  const [businessConfigInitialModule, setBusinessConfigInitialModule] = useState('report_template');
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
  const [editingReport, setEditingReport] = useState<ReportItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLogin = (userName: string = '张三 (系统管理员)', targetPage: PageId = 'home') => {
    setIsLoggedIn(true);
    setCurrentUser(userName);
    try {
      localStorage.setItem('ddsb_is_logged_in', 'true');
      localStorage.setItem('ddsb_current_user', userName);
      localStorage.setItem('ddsb_active_page', targetPage);
    } catch {
      // Ignore storage failures
    }
    setActivePage(targetPage);
    showToast(`欢迎登录点点速豹·网络生态治理系统，当前身份：${userName}`);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    try {
      localStorage.setItem('ddsb_is_logged_in', 'false');
      localStorage.setItem('ddsb_active_page', 'login');
    } catch {
      // Ignore storage failures
    }
    setActivePage('login');
    showToast('已安全退出系统');
  };

  const handleNavigate = (page: PageId, extraModule?: string) => {
    if (page === 'login') {
      handleLogout();
      return;
    }
    setActivePage(page);
    try {
      localStorage.setItem('ddsb_active_page', page);
    } catch {
      // Ignore storage failures in restricted browser contexts.
    }
    if (extraModule && page === 'business-config') {
      setBusinessConfigInitialModule(extraModule);
    }
  };

  const handleCreateReport = (newReportData: NewReportFormData) => {
    const createdItem = createSubmittedReport(newReportData);
    setReports((previous) => [createdItem, ...previous]);
    setLogs((previous) => [
      createOperationLog(
        '提交速报',
        `创建并提交了速报《${newReportData.title}》`,
        getNowText(),
        newReportData.author,
        newReportData.organization
      ),
      ...previous
    ]);
    showToast('新速报提交成功，已进入待审核队列！');
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
    const updated = resubmitReport(updatedReport);
    setReports((previous) => {
      const exists = previous.some((report) => report.id === updated.id);
      return exists
        ? previous.map((report) => (report.id === updated.id ? updated : report))
        : [updated, ...previous];
    });
    if (selectedReport?.id === updated.id) setSelectedReport(updated);
    if (selectedAudit?.id === updated.id) setSelectedAudit(updated);
    showToast('速报已成功提交送审！');
  };

  const handleApproveAudit = (id: number, score?: number, isBatch = false) => {
    const target = reports.find((report) => report.id === id);
    if (!target) return;
    const now = getNowText();

    if (isBatch && selectedAudit?.matchUrl) {
      const matchedIds = new Set(
        reports
          .filter((report) => report.matchUrl === selectedAudit.matchUrl || report.id === id)
          .map((report) => report.id)
      );
      setReports((previous) =>
        previous.map((report) => (matchedIds.has(report.id) ? approveReport(report, score, now) : report))
      );
      const selectedUpdate = reports.find((report) => report.id === selectedAudit.id);
      if (selectedUpdate) setSelectedAudit(approveReport(selectedUpdate, score, now));
      showToast(
        `已成功批量审核通过同源速报${score !== undefined ? `（终审评分: ${score}分）` : ''}！`
      );
    } else {
      const updated = approveReport(target, score, now);
      setReports((previous) => previous.map((report) => (report.id === id ? updated : report)));
      if (selectedAudit?.id === id) setSelectedAudit(updated);
      if (selectedReport?.id === id) setSelectedReport(updated);
      showToast(
        `已审核通过速报${
          isFinalAuditStage(target) && score !== undefined ? `（终审评分: ${score}分）` : ''
        }`
      );
    }

    setAuditRecords((previous) => [
      createAuditRecord(
        target,
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
    const target = reports.find((report) => report.id === id);
    if (!target) return;
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
    showToast(`速报已驳回: ${reason}`);
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
    showToast(`已成功批量审核通过 ${ids.length} 条速报！`);
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
    showToast(`已成功批量驳回 ${ids.length} 条速报！`);
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
    editingReport,
    toastMessage,
    setSelectedReport,
    setSelectedAudit,
    setSelectedNegative,
    setSelectedAuditRecord,
    setReportDetailSourcePage,
    openNewReportModal: () => {
      setEditingReport(null);
      setIsNewReportModalOpen(true);
    },
    openEditReportModal: (report: ReportItem) => {
      setEditingReport(report);
      setIsNewReportModalOpen(true);
    },
    closeNewReportModal: () => {
      setIsNewReportModalOpen(false);
      setEditingReport(null);
    },
    isLoggedIn,
    currentUser,
    handleLogin,
    handleLogout,
    handleNavigate,
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
