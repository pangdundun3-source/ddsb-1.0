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

import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { NewReportModal } from './components/NewReportModal';

import { Home } from './pages/Home';
import { ReportSummary } from './pages/ReportSummary';
import { ReportDetail } from './pages/ReportDetail';
import { ReportAudit } from './pages/ReportAudit';
import { AuditDetail } from './pages/AuditDetail';
import { AuditRecords } from './pages/AuditRecords';
import { AuditRecordDetail } from './pages/AuditRecordDetail';
import { NegativeInfoLibrary } from './pages/NegativeInfoLibrary';
import { NegativeDetail } from './pages/NegativeDetail';
import { Statistics } from './pages/Statistics';
import { Evaluation } from './pages/Evaluation';
import { OrgManagement } from './pages/OrgManagement';
import { RolePermission } from './pages/RolePermission';
import { BusinessConfig } from './pages/BusinessConfig';
import { SystemLogs } from './pages/SystemLogs';

const SYSTEM_LOGS_VIEW_VERSION = 'system-logs-filter-risk-clean-20260814';

export default function App() {
  const [activePage, setActivePage] = useState<PageId>(() => {
    try {
      const saved = localStorage.getItem('ddsb_active_page');
      return (saved as PageId) || 'org-management';
    } catch {
      return 'org-management';
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
  const [selectedAudit, setSelectedAudit] = useState<ReportItem | null>(
    initialAuditPending[0] || null
  );
  const [selectedNegative, setSelectedNegative] = useState<ReportItem | null>(
    reports.find((r) => r.auditStatus === '待转办') || reports[0]
  );
  const [selectedAuditRecord, setSelectedAuditRecord] = useState<AuditRecordItem | null>(
    auditRecords[0] || null
  );

  // New Report Modal State
  const [isNewReportModalOpen, setIsNewReportModalOpen] = useState(false);

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
    setReports(reports.filter((r) => r.id !== id));
    showToast('已成功删除该记录');
  };

  // Handler: Approve Audit
  const handleApproveAudit = (id: number, score: number, isBatch = false) => {
    const now = new Date().toLocaleString('zh-CN', { hour12: false });

    if (isBatch && selectedAudit?.matchUrl) {
      // Batch approve all matching items
      setReports((prev) =>
        prev.map((item) => {
          if (item.matchUrl === selectedAudit.matchUrl || item.id === id) {
            return { ...item, auditStatus: '待转办' };
          }
          return item;
        })
      );
      showToast('已成功批量审核通过 5 条相关报送！');
    } else {
      // Single approve
      setReports((prev) =>
        prev.map((item) => (item.id === id ? { ...item, auditStatus: '已通过' } : item))
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

  // Handler: Reject Audit
  const handleRejectAudit = (id: number, reason: string, detail: string) => {
    const now = new Date().toLocaleString('zh-CN', { hour12: false });

    setReports((prev) =>
      prev.map((item) => (item.id === id ? { ...item, auditStatus: '被驳回' } : item))
    );

    const target = reports.find((r) => r.id === id);
    if (target) {
      const newAuditRecord: AuditRecordItem = {
        id: Date.now(),
        reportId: target.id,
        title: target.title,
        organization: target.organization,
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

    showToast('已驳回该速报上报');
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
      <Header onNewReportClick={() => setIsNewReportModalOpen(true)} currentUser="张三" />

      {/* Navigation Bar */}
      <Navbar activePage={activePage} onNavigate={handleNavigate} />

      {/* Main Content View Container */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-5">
        {activePage === 'home' && (
          <Home
            reports={reports}
            orgs={orgs}
            onNavigate={handleNavigate}
            onSelectReport={(r) => setSelectedReport(r)}
            onSelectAudit={(r) => setSelectedAudit(r)}
            currentUser="张三"
          />
        )}

        {activePage === 'report-summary' && (
          <ReportSummary
            reports={reports}
            onSelectReport={(r) => setSelectedReport(r)}
            onDeleteReport={handleDeleteReport}
            onNavigate={handleNavigate}
          />
        )}

        {activePage === 'report-detail' && (
          <ReportDetail report={selectedReport} onNavigate={handleNavigate} />
        )}

        {activePage === 'report-audit' && (
          <ReportAudit
            auditPendingList={reports.filter((r) => r.auditStatus === '待审核')}
            onSelectAudit={(r) => setSelectedAudit(r)}
            onDeleteReport={handleDeleteReport}
            onNavigate={handleNavigate}
          />
        )}

        {activePage === 'audit-detail' && (
          <AuditDetail
            report={selectedAudit}
            onApprove={handleApproveAudit}
            onReject={handleRejectAudit}
            onNavigate={handleNavigate}
          />
        )}

        {activePage === 'audit-records' && (
          <AuditRecords
            records={auditRecords}
            allReports={reports}
            onSelectAuditRecord={(record) => setSelectedAuditRecord(record)}
            onNavigate={handleNavigate}
          />
        )}

        {activePage === 'audit-record-detail' && (
          <AuditRecordDetail
            record={selectedAuditRecord}
            allReports={reports}
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

        {activePage === 'statistics' && <Statistics onNavigate={handleNavigate} />}

        {activePage === 'evaluation' && (
          <Evaluation evaluationList={initialEvaluations} onNavigate={handleNavigate} />
        )}

        {activePage === 'org-management' && (
          <OrgManagement
            orgList={orgs}
            onNavigate={handleNavigate}
            onAddOrg={handleAddOrg}
            onUpdateOrg={handleUpdateOrg}
            onDeleteOrg={handleDeleteOrg}
          />
        )}

        {activePage === 'role-permission' && <RolePermission />}

        {activePage === 'business-config' && <BusinessConfig initialModule={businessConfigInitialModule} />}

        {activePage === 'system-logs' && <SystemLogs key={SYSTEM_LOGS_VIEW_VERSION} logs={logs} />}
      </main>

      {/* Global New Report Creation Modal */}
      <NewReportModal
        isOpen={isNewReportModalOpen}
        onClose={() => setIsNewReportModalOpen(false)}
        onSubmit={handleCreateReport}
      />

      {/* Persistent Footer */}
      <Footer />
    </div>
  );
}
