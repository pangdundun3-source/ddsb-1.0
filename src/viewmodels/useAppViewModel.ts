import { useEffect, useState } from 'react';
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

const VALID_PAGES: PageId[] = [
  'login',
  'portal',
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
  'notice-management',
  'org-management',
  'template-management',
  'dict-management',
  'value-added-services',
  'role-permission',
  'business-config',
  'system-logs'
];

interface HashRouteInfo {
  page: PageId;
  extraModule?: string;
  id?: number;
  sourcePage?: PageId;
}

const parseHashRoute = (hash: string): HashRouteInfo => {
  const clean = hash.replace(/^#\/?/, '').trim();
  if (!clean) {
    return { page: 'login' };
  }
  const [pathPart, queryPart] = clean.split('?');
  const normalizedPage = pathPart.replace(/^\//, '').trim() as PageId;
  const page = VALID_PAGES.includes(normalizedPage) ? normalizedPage : 'login';

  let extraModule: string | undefined;
  let id: number | undefined;
  let sourcePage: PageId | undefined;

  if (queryPart) {
    const params = new URLSearchParams(queryPart);
    const mod = params.get('module');
    if (mod) extraModule = mod;
    const idVal = params.get('id');
    if (idVal && !isNaN(Number(idVal))) {
      id = Number(idVal);
    }
    const srcVal = params.get('sourcePage') as PageId;
    if (srcVal && VALID_PAGES.includes(srcVal)) {
      sourcePage = srcVal;
    }
  }

  return { page, extraModule, id, sourcePage };
};

const buildHashRoute = (page: PageId, extraModule?: string, id?: number, sourcePage?: PageId): string => {
  let hash = `#/${page}`;
  const params = new URLSearchParams();
  if (extraModule && page === 'business-config') {
    params.set('module', extraModule);
  }
  if (id !== undefined) {
    params.set('id', String(id));
  }
  if (sourcePage && (page === 'report-detail' || page === 'audit-detail')) {
    params.set('sourcePage', sourcePage);
  }
  const qs = params.toString();
  if (qs) {
    hash += `?${qs}`;
  }
  return hash;
};

export const useAppViewModel = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ddsb_is_logged_in') === 'true';
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
    if (typeof window !== 'undefined' && window.location.hash) {
      const parsed = parseHashRoute(window.location.hash);
      return parsed.page;
    }
    try {
      const savedPage = localStorage.getItem('ddsb_active_page') as PageId;
      if (savedPage && VALID_PAGES.includes(savedPage)) {
        return savedPage;
      }
    } catch {}
    return 'login';
  });

  const [businessConfigInitialModule, setBusinessConfigInitialModule] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const parsed = parseHashRoute(window.location.hash);
      if (parsed.extraModule) return parsed.extraModule;
    }
    return 'report_template';
  });

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

  // Hash Route Listening & Synchronization
  useEffect(() => {
    const handleHashChange = () => {
      const currentHash = window.location.hash;
      const route = parseHashRoute(currentHash);

      const loggedIn = (() => {
        try {
          return localStorage.getItem('ddsb_is_logged_in') === 'true';
        } catch {
          return false;
        }
      })();

      if (!loggedIn && route.page !== 'login') {
        const loginHash = buildHashRoute('login');
        if (window.location.hash !== loginHash) {
          window.location.hash = loginHash;
        }
        setActivePage('login');
        return;
      }

      setActivePage(route.page);
      try {
        localStorage.setItem('ddsb_active_page', route.page);
      } catch {}

      if (route.page === 'template-management') {
        setBusinessConfigInitialModule('report_template');
      } else if (route.page === 'dict-management') {
        setBusinessConfigInitialModule('data_dict');
      } else if (route.page === 'value-added-services') {
        setBusinessConfigInitialModule('value_added');
      } else if (route.extraModule && route.page === 'business-config') {
        setBusinessConfigInitialModule(route.extraModule);
      }

      if (route.sourcePage) {
        setReportDetailSourcePage(route.sourcePage);
      }

      if (route.id !== undefined) {
        const foundReport = reports.find((r) => r.id === route.id);
        if (foundReport) {
          if (route.page === 'report-detail') setSelectedReport(foundReport);
          if (route.page === 'audit-detail') setSelectedAudit(foundReport);
          if (route.page === 'negative-detail') setSelectedNegative(foundReport);
        }
      }
    };

    if (typeof window !== 'undefined') {
      const currentHash = window.location.hash;
      if (!currentHash || currentHash === '#' || currentHash === '#/') {
        const loggedIn = (() => {
          try {
            return localStorage.getItem('ddsb_is_logged_in') === 'true';
          } catch {
            return false;
          }
        })();
        const initialPage = loggedIn ? 'home' : 'login';
        window.location.hash = buildHashRoute(initialPage);
        setActivePage(initialPage);
      } else {
        handleHashChange();
      }

      window.addEventListener('hashchange', handleHashChange);
      return () => {
        window.removeEventListener('hashchange', handleHashChange);
      };
    }
  }, [reports]);

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
    const targetHash = buildHashRoute(targetPage);
    if (typeof window !== 'undefined' && window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    }
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
    const targetHash = buildHashRoute('login');
    if (typeof window !== 'undefined' && window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    }
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
    if (page === 'template-management') {
      setBusinessConfigInitialModule('report_template');
    } else if (page === 'dict-management') {
      setBusinessConfigInitialModule('data_dict');
    } else if (page === 'value-added-services') {
      setBusinessConfigInitialModule('value_added');
    } else if (extraModule && page === 'business-config') {
      setBusinessConfigInitialModule(extraModule);
    }
    const targetHash = buildHashRoute(page, extraModule);
    if (typeof window !== 'undefined' && window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    }
  };

  const handleCreateReport = (newReportData: NewReportFormData) => {
    const createdItem = createSubmittedReport(newReportData, Date.now(), getNowText(), reports);
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
    showToast('新速报提交成功，已完成智能比对与预判打标，进入待审核队列！');
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

  const handleApproveAudit = (
    id: number,
    score?: number,
    isBatch = false,
    manualIdentification?: any,
    batchIds?: number[],
    scoreMap?: Record<number, number>,
    identMap?: Record<number, '首发' | '重复'>
  ) => {
    const target = reports.find((report) => report.id === id);
    if (!target) return;
    const now = getNowText();

    if (isBatch) {
      const targetIds =
        batchIds && batchIds.length > 0
          ? Array.from(new Set([...batchIds, id]))
          : Array.from(
              new Set(
                reports
                  .filter(
                    (report) =>
                      (selectedAudit?.matchUrl && report.matchUrl === selectedAudit.matchUrl) ||
                      report.id === id
                  )
                  .map((report) => report.id)
              )
            );

      const updatedMap = new Map<number, ReportItem>();
      const targets = reports.filter((report) => targetIds.includes(report.id));

      targets.forEach((report) => {
        const itemScore = scoreMap?.[report.id] ?? score;
        const itemIdent = identMap?.[report.id] ?? manualIdentification;
        const updated = approveReport(report, itemScore, now, itemIdent);
        updatedMap.set(report.id, updated);
      });

      setReports((previous) =>
        previous.map((report) => (updatedMap.has(report.id) ? updatedMap.get(report.id)! : report))
      );

      if (selectedAudit && updatedMap.has(selectedAudit.id)) {
        setSelectedAudit(updatedMap.get(selectedAudit.id)!);
      }
      if (selectedReport && updatedMap.has(selectedReport.id)) {
        setSelectedReport(updatedMap.get(selectedReport.id)!);
      }

      const newRecords = targets.map((report, idx) => {
        const itemScore = scoreMap?.[report.id] ?? score;
        return {
          ...createAuditRecord(report, '已通过', now, itemScore),
          id: Date.now() + idx
        };
      });
      setAuditRecords((previous) => [...newRecords, ...previous]);

      const newLogs = targets.map((report) => {
        const itemScore = scoreMap?.[report.id] ?? score;
        const itemIdent = identMap?.[report.id] ?? manualIdentification;
        return createOperationLog(
          '批量审核速报',
          `批量审核通过了速报《${report.title}》（认定: ${itemIdent || '已确认'}）${itemScore !== undefined ? `，给予独立打分: ${itemScore}分` : ''}`,
          now
        );
      });
      setLogs((previous) => [...newLogs, ...previous]);

      showToast(`已成功批量审批通过 ${targets.length} 条数据（独立打分与首发/重复认定已生效）！`);
      return;
    } else {
      const itemScore = scoreMap?.[id] ?? score;
      const itemIdent = identMap?.[id] ?? manualIdentification;
      const updated = approveReport(target, itemScore, now, itemIdent);
      setReports((previous) => previous.map((report) => (report.id === id ? updated : report)));
      if (selectedAudit?.id === id) setSelectedAudit(updated);
      if (selectedReport?.id === id) setSelectedReport(updated);
      showToast(
        `已审核通过速报${
          itemScore !== undefined ? `（评分: ${itemScore}分）` : ''
        }`
      );
      setAuditRecords((previous) => [
        createAuditRecord(
          updated,
          '已通过',
          now,
          itemScore !== undefined ? itemScore : undefined
        ),
        ...previous
      ]);
      setLogs((previous) => [
        createOperationLog(
          '审核速报',
          `审核通过了速报《${target.title}》（认定: ${itemIdent || '已确认'}）${
            itemScore !== undefined ? `，给予 ${itemScore} 分` : ''
          }`,
          now
        ),
        ...previous
      ]);
      return;
    }
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

  const handleBatchApprove = (ids: number[], score?: number, scoreMap?: Record<number, number>) => {
    const now = getNowText();
    const targets = reports.filter((report) => ids.includes(report.id));
    const updates = new Map(
      targets.map((report) => {
        const itemScore = scoreMap?.[report.id] ?? score;
        return [report.id, approveReport(report, itemScore, now)];
      })
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
      ...targets.map((target, index) => {
        const itemScore = scoreMap?.[target.id] ?? score;
        return {
          ...createAuditRecord(target, '已通过', now, itemScore),
          id: Date.now() + index
        };
      }),
      ...previous
    ]);
    setLogs((previous) => [
      ...targets.map((target) => {
        const itemScore = scoreMap?.[target.id] ?? score;
        return createOperationLog(
          '批量审核速报',
          `批量审核通过了同省疑似重复速报《${target.title}》${itemScore !== undefined ? `，给予独立打分: ${itemScore}分` : ''}`,
          now
        );
      }),
      ...previous
    ]);
    showToast(`已批量确认通过 ${targets.length} 条速报（差异化打分已生效）！`);
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
