import React, { useState } from 'react';
import { PageId, ReportItem, AuditRecordItem, OrgItem, LogItem } from './types';
import {
  initialReports,
  initialAuditPending,
  initialAuditRecords,
  initialEvaluations,
  initialOrgs,
  initialLogs
} from './data/mockData';

import { Header, AVAILABLE_ORGS, OrgAccount } from './components/Header';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { NewReportModal } from './components/NewReportModal';
import { H5MobilePortal } from './components/H5MobilePortal';

import { Home } from './pages/Home';
import { ReportSummary } from './pages/ReportSummary';
import { ReportRecords } from './pages/ReportRecords';
import { ReportDetail } from './pages/ReportDetail';
import { ReportAudit } from './pages/ReportAudit';
import { AuditDetail } from './pages/AuditDetail';
import { AuditRecords } from './pages/AuditRecords';
import { NegativeInfoLibrary } from './pages/NegativeInfoLibrary';
import { NegativeDetail } from './pages/NegativeDetail';
import { Statistics } from './pages/Statistics';
import { Evaluation } from './pages/Evaluation';
import { PersonalInfo } from './pages/PersonalInfo';
import { OrgManagement } from './pages/OrgManagement';
import { RolePermission } from './pages/RolePermission';
import { BusinessConfig } from './pages/BusinessConfig';
import { SystemLogs } from './pages/SystemLogs';

export default function App() {
  const [currentOrg, setCurrentOrg] = useState<OrgAccount>(() => {
    try {
      const savedOrgId = localStorage.getItem('ddsb_current_org_id');
      const found = AVAILABLE_ORGS.find((o) => o.id === savedOrgId);
      return found || AVAILABLE_ORGS[0];
    } catch {
      return AVAILABLE_ORGS[0];
    }
  });

  const handleSwitchOrg = (org: OrgAccount) => {
    setCurrentOrg(org);
    try {
      localStorage.setItem('ddsb_current_org_id', org.id);
    } catch {
      // ignore
    }
  };

  const [activePage, setActivePage] = useState<PageId>(() => {
    try {
      const saved = localStorage.getItem('ddsb_active_page');
      return (saved as PageId) || 'home';
    } catch {
      return 'home';
    }
  });
  const [businessConfigInitialModule, setBusinessConfigInitialModule] = useState<string>('report_template');

  const handleNavigate = (page: PageId, extraModule?: string) => {
    setActivePage(page);
    try {
      localStorage.setItem('ddsb_active_page', page);
    } catch {
      // ignore
    }
    if (extraModule && page === 'business-config') {
      setBusinessConfigInitialModule(extraModule);
    }
  };

  // Core Data States
  const [reports, setReports] = useState<ReportItem[]>([
    ...initialAuditPending,
    ...initialReports
  ]);
  const [auditRecords, setAuditRecords] = useState<AuditRecordItem[]>(initialAuditRecords);
  const [orgs, setOrgs] = useState<OrgItem[]>(initialOrgs);
  const [logs, setLogs] = useState<LogItem[]>(initialLogs);

  // Selected Item States for Details
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(reports[0] || initialAuditPending[0]);
  const [reportDetailSourcePage, setReportDetailSourcePage] = useState<PageId>('report-summary');
  const [selectedAudit, setSelectedAudit] = useState<ReportItem | null>(
    initialAuditPending[0] || null
  );
  const [selectedNegative, setSelectedNegative] = useState<ReportItem | null>(
    reports.find((r) => r.auditStatus === '待转办') || reports[0]
  );

  // New Report Modal State
  const [isNewReportModalOpen, setIsNewReportModalOpen] = useState(false);
  const [newReportTemplate, setNewReportTemplate] = useState<any>(null);
  const [isH5MobileOpen, setIsH5MobileOpen] = useState(false);

  const handleOpenNewReport = (templateData?: any) => {
    setNewReportTemplate(templateData || null);
    setIsNewReportModalOpen(true);
  };

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Handler: Create New Report
  const handleCreateReport = (newReportData: Omit<ReportItem, 'id' | 'auditStatus'>) => {
    const newId = Date.now();
    const createdItem: ReportItem = {
      ...newReportData,
      id: newId,
      auditStatus: '待审核'
    };

    setReports([createdItem, ...reports]);

    // Append log
    const newLog: LogItem = {
      id: Date.now(),
      operator: newReportData.author,
      organization: newReportData.organization,
      actionType: '提交速报',
      details: `创建并提交了速报《${newReportData.title}》`,
      timestamp: new Date().toLocaleString('zh-CN', { hour12: false }),
      ipAddress: '192.168.1.108'
    };
    setLogs([newLog, ...logs]);

    showToast('新速报提交成功，已进入待审核队列！');
  };

  // Handler: Delete Report
  const handleDeleteReport = (id: number) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    showToast('已成功删除该记录');
  };

  // Handler: Withdraw Report to Draft
  const handleWithdrawReport = (id: number) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, auditStatus: '草稿' } : r))
    );
    if (selectedReport && selectedReport.id === id) {
      setSelectedReport({ ...selectedReport, auditStatus: '草稿' });
    }
    showToast('已成功撤回报送，已转为草稿状态');
  };

  // Handler: Resubmit / Save Report
  const handleResubmitReport = (updatedReport: ReportItem) => {
    const now = new Date().toLocaleString('zh-CN', { hour12: false });
    const isNew = !reports.some((r) => r.id === updatedReport.id);

    if (isNew) {
      setReports([updatedReport, ...reports]);
    } else {
      setReports((prev) =>
        prev.map((r) =>
          r.id === updatedReport.id
            ? { ...updatedReport, auditStatus: '待审核', submitTime: now, rejectReason: undefined }
            : r
        )
      );
    }

    if (selectedReport && selectedReport.id === updatedReport.id) {
      setSelectedReport({ ...updatedReport, auditStatus: '待审核', submitTime: now, rejectReason: undefined });
    }

    showToast('速报已成功提交送审！');
  };

  // Handler: Approve Audit
  const handleApproveAudit = (id: number, score: number, isBatch = false) => {
    const now = new Date().toLocaleString('zh-CN', { hour12: false });

    if (isBatch && selectedAudit?.matchUrl) {
      // Batch approve all matching items
      setReports((prev) =>
        prev.map((item) => {
          if (item.matchUrl === selectedAudit.matchUrl || item.id === id) {
            return { ...item, auditStatus: '已通过', score };
          }
          return item;
        })
      );
      showToast(`已成功批量审核通过同源速报（评分: ${score}分）！`);
    } else {
      // Single approve
      setReports((prev) =>
        prev.map((item) => (item.id === id ? { ...item, auditStatus: '已通过', score } : item))
      );
      showToast(`已审核通过速报（评分: ${score}分）`);
    }

    // Add Audit Record
    const target = reports.find((r) => r.id === id);
    if (target) {
      const newAuditRecord: AuditRecordItem = {
        id: Date.now(),
        reportId: target.id,
        title: target.title,
        organization: target.organization,
        submitter: target.author,
        submitTime: target.submitTime,
        auditor: '王主任',
        auditResult: '已通过',
        auditTime: now,
        score
      };
      setAuditRecords([newAuditRecord, ...auditRecords]);

      // Add System Log
      const newLog: LogItem = {
        id: Date.now(),
        operator: '王主任',
        organization: '市委宣传部舆情科',
        actionType: '审核速报',
        details: `审核通过了速报《${target.title}》，给予 ${score} 分`,
        timestamp: now,
        ipAddress: '192.168.1.12'
      };
      setLogs([newLog, ...logs]);
    }
  };

  // Handler: Batch Approve
  const handleBatchApprove = (ids: number[], score: number) => {
    const now = new Date().toLocaleString('zh-CN', { hour12: false });
    setReports((prev) =>
      prev.map((item) => (ids.includes(item.id) ? { ...item, auditStatus: '已通过', score } : item))
    );

    const newAuditRecords: AuditRecordItem[] = ids.map((id, index) => {
      const target = reports.find((r) => r.id === id);
      return {
        id: Date.now() + index,
        reportId: id,
        title: target?.title || '批量速报',
        organization: target?.organization || '下级网格单位',
        submitter: target?.author || '网格员',
        submitTime: target?.submitTime || now,
        auditor: '王主任',
        auditResult: '已通过',
        auditTime: now,
        score
      };
    });
    setAuditRecords([...newAuditRecords, ...auditRecords]);

    const newLog: LogItem = {
      id: Date.now(),
      operator: '王主任',
      organization: '市委宣传部舆情科',
      actionType: '批量审核速报',
      details: `批量审核通过了 ${ids.length} 条同源速报，统一赋予 ${score} 分`,
      timestamp: now,
      ipAddress: '192.168.1.12'
    };
    setLogs([newLog, ...logs]);
    showToast(`已成功批量审核通过 ${ids.length} 条速报！`);
  };

  // Handler: Reject Audit
  const handleRejectAudit = (id: number, reason: string, detail: string) => {
    const now = new Date().toLocaleString('zh-CN', { hour12: false });

    setReports((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, auditStatus: '被驳回', rejectReason: `${reason}${detail ? ` (${detail})` : ''}` }
          : item
      )
    );

    const target = reports.find((r) => r.id === id);
    if (target) {
      const newAuditRecord: AuditRecordItem = {
        id: Date.now(),
        reportId: target.id,
        title: target.title,
        organization: target.organization,
        submitter: target.author,
        submitTime: target.submitTime,
        auditor: '王主任',
        auditResult: '被驳回',
        auditTime: now,
        rejectReason: reason,
        rejectDetail: detail
      };
      setAuditRecords([newAuditRecord, ...auditRecords]);

      const newLog: LogItem = {
        id: Date.now(),
        operator: '王主任',
        organization: '市委宣传部舆情科',
        actionType: '驳回速报',
        details: `驳回了速报《${target.title}》，原因: ${reason}`,
        timestamp: now,
        ipAddress: '192.168.1.12'
      };
      setLogs([newLog, ...logs]);
    }

    showToast(`速报已驳回: ${reason}`);
  };

  // Handler: Batch Reject
  const handleBatchReject = (ids: number[], reason: string, detail: string) => {
    const now = new Date().toLocaleString('zh-CN', { hour12: false });
    const fullReason = `${reason}${detail ? ` (${detail})` : ''}`;

    setReports((prev) =>
      prev.map((item) =>
        ids.includes(item.id)
          ? { ...item, auditStatus: '被驳回', rejectReason: fullReason }
          : item
      )
    );

    const newAuditRecords: AuditRecordItem[] = ids.map((id, index) => {
      const target = reports.find((r) => r.id === id);
      return {
        id: Date.now() + index,
        reportId: id,
        title: target?.title || '批量速报',
        organization: target?.organization || '下级网格单位',
        submitter: target?.author || '网格员',
        submitTime: target?.submitTime || now,
        auditor: '王主任',
        auditResult: '被驳回',
        auditTime: now,
        rejectReason: reason,
        rejectDetail: detail
      };
    });
    setAuditRecords([...newAuditRecords, ...auditRecords]);

    const newLog: LogItem = {
      id: Date.now(),
      operator: '王主任',
      organization: '市委宣传部舆情科',
      actionType: '批量驳回速报',
      details: `批量驳回了 ${ids.length} 条同源速报，原因: ${reason}`,
      timestamp: now,
      ipAddress: '192.168.1.12'
    };
    setLogs([newLog, ...logs]);
    showToast(`已成功批量驳回 ${ids.length} 条同源速报！`);
  };

  // Handler: Transfer Submission
  const handleTransferSubmit = (id: number, opinion: string) => {
    const now = new Date().toLocaleString('zh-CN', { hour12: false });

    setReports((prev) =>
      prev.map((item) => (item.id === id ? { ...item, auditStatus: '已转办' } : item))
    );

    const target = reports.find((r) => r.id === id);
    if (target) {
      const newLog: LogItem = {
        id: Date.now(),
        operator: '张三',
        organization: '市委宣传部舆情科',
        actionType: '转办速报',
        details: `提交了速报《${target.title}》的转办申请，意见: ${opinion || '无'}`,
        timestamp: now,
        ipAddress: '192.168.1.108'
      };
      setLogs([newLog, ...logs]);
    }

    showToast('速报转办意见已提交！');
  };

  // Org handlers
  const handleAddOrg = (orgData: Omit<OrgItem, 'id'>) => {
    const newOrg: OrgItem = { ...orgData, id: Date.now() };
    setOrgs([...orgs, newOrg]);
    showToast('机构添加成功！');
  };

  const handleUpdateOrg = (updatedOrg: OrgItem) => {
    setOrgs(orgs.map((o) => (o.id === updatedOrg.id ? updatedOrg : o)));
    showToast('机构信息已更新');
  };

  const handleDeleteOrg = (id: number) => {
    setOrgs(orgs.filter((o) => o.id !== id));
    showToast('已删除机构');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F0F4F8] text-gray-800 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#1E5ABB] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-bold flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Persistent Header */}
      <Header
        onNewReportClick={() => handleOpenNewReport(null)}
        currentUser="张三"
        currentOrg={currentOrg}
        onSwitchOrg={handleSwitchOrg}
        onNavigate={handleNavigate}
      />

      {/* Navigation Bar */}
      <Navbar
        activePage={activePage}
        reportDetailSourcePage={reportDetailSourcePage}
        onNavigate={handleNavigate}
      />

      {/* Main Content View Container */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-5">
        {activePage === 'home' && (
          <Home
            reports={reports}
            orgs={orgs}
            onNavigate={handleNavigate}
            onSelectReport={(r) => setSelectedReport(r)}
            onSelectAudit={(r) => setSelectedAudit(r)}
            onOpenNewReport={handleOpenNewReport}
            currentUser="张三"
            currentRoleTitle={currentOrg.role}
          />
        )}

        {activePage === 'report-summary' && (
          <ReportSummary
            reports={reports}
            onSelectReport={(r) => {
              setSelectedReport(r);
              setReportDetailSourcePage('report-summary');
            }}
            onDeleteReport={handleDeleteReport}
            onWithdrawReport={handleWithdrawReport}
            onResubmitReport={handleResubmitReport}
            onOpenNewReport={handleOpenNewReport}
            onNavigate={handleNavigate}
          />
        )}

        {activePage === 'report-records' && (
          <ReportRecords
            reports={reports}
            currentUser="张三"
            currentOrg={currentOrg}
            onSelectReport={(r) => {
              setSelectedReport(r);
              setReportDetailSourcePage('report-records');
            }}
            onDeleteReport={handleDeleteReport}
            onWithdrawReport={handleWithdrawReport}
            onResubmitReport={handleResubmitReport}
            onOpenNewReport={handleOpenNewReport}
            onNavigate={handleNavigate}
          />
        )}

        {activePage === 'report-detail' && (
          <ReportDetail
            report={selectedReport}
            sourcePage={reportDetailSourcePage}
            onNavigate={handleNavigate}
            onWithdrawReport={handleWithdrawReport}
            onResubmitReport={handleResubmitReport}
            onDeleteReport={handleDeleteReport}
          />
        )}

        {activePage === 'report-audit' && (
          <ReportAudit
            auditPendingList={reports.filter((r) => r.auditStatus === '待审核')}
            allReports={reports}
            onSelectAudit={(r) => setSelectedAudit(r)}
            onApproveAudit={handleApproveAudit}
            onRejectAudit={handleRejectAudit}
            onBatchApprove={handleBatchApprove}
            onBatchReject={handleBatchReject}
            onDeleteReport={handleDeleteReport}
            onNavigate={handleNavigate}
          />
        )}

        {activePage === 'audit-detail' && (
          <AuditDetail
            report={selectedAudit}
            allReports={reports}
            onApprove={handleApproveAudit}
            onReject={handleRejectAudit}
            onNavigate={handleNavigate}
          />
        )}

        {activePage === 'audit-records' && (
          <AuditRecords
            records={auditRecords}
            allReports={reports}
            onSelectReport={(r) => {
              setSelectedReport(r);
              setReportDetailSourcePage('audit-records');
            }}
            onNavigate={handleNavigate}
          />
        )}

        {activePage === 'negative-info' && (
          <NegativeInfoLibrary
            negativeList={reports.filter((r) => r.auditStatus === '待转办' || r.auditStatus === '已转办' || r.auditStatus === '已通过')}
            onSelectNegative={(r) => setSelectedNegative(r)}
            onNavigate={handleNavigate}
          />
        )}

        {activePage === 'negative-detail' && (
          <NegativeDetail
            report={selectedNegative}
            onTransferSubmit={handleTransferSubmit}
            onNavigate={handleNavigate}
          />
        )}

        {activePage === 'statistics' && <Statistics />}

        {activePage === 'evaluation' && (
          <Evaluation evaluationList={initialEvaluations} onNavigate={handleNavigate} />
        )}

        {activePage === 'personal-info' && (
          <PersonalInfo onNavigate={handleNavigate} currentUser="张三" />
        )}

        {activePage === 'org-management' && (
          <OrgManagement
            orgList={orgs}
            onAddOrg={handleAddOrg}
            onUpdateOrg={handleUpdateOrg}
            onDeleteOrg={handleDeleteOrg}
          />
        )}

        {activePage === 'role-permission' && <RolePermission />}

        {activePage === 'business-config' && <BusinessConfig initialModule={businessConfigInitialModule} />}

        {activePage === 'system-logs' && <SystemLogs logs={logs} />}
      </main>

      {/* Global New Report Creation Modal */}
      <NewReportModal
        isOpen={isNewReportModalOpen}
        onClose={() => {
          setIsNewReportModalOpen(false);
          setNewReportTemplate(null);
        }}
        initialTemplate={newReportTemplate}
        onSubmit={handleCreateReport}
      />

      {/* Global H5 Mobile Portal Modal/Simulator */}
      <H5MobilePortal
        isOpen={isH5MobileOpen}
        onClose={() => setIsH5MobileOpen(false)}
        reports={reports}
        auditRecords={auditRecords}
        orgs={orgs}
        currentUser="张三"
        onCreateReport={handleCreateReport}
        onApproveAudit={handleApproveAudit}
        onRejectAudit={handleRejectAudit}
        onTransferSubmit={handleTransferSubmit}
      />

      {/* Persistent Footer */}
      <Footer />
    </div>
  );
}
