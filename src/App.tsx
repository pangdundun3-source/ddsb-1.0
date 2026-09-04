import React from 'react';
import { useAppViewModel } from './viewmodels/useAppViewModel';

import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { NewReportModal } from './components/NewReportModal';

import { Home } from './pages/Home';
import { ReportSummary } from './pages/ReportSummary';
import { ReportRecords } from './pages/ReportRecords';
import { ReportDetail } from './pages/ReportDetail';
import { ReportAudit } from './pages/ReportAudit';
import { AuditDetail } from './pages/AuditDetail';
import { AuditRecords } from './pages/AuditRecords';
import { AuditRecordDetail } from './pages/AuditRecordDetail';
import { NegativeInfoLibrary } from './pages/NegativeInfoLibrary';
import { NegativeDetail } from './pages/NegativeDetail';
import { Statistics } from './pages/Statistics';
import { StatisticsReference } from './pages/StatisticsReference';
import { Evaluation } from './pages/Evaluation';
import { EvaluationReference } from './pages/EvaluationReference';
import { OrgManagement } from './pages/OrgManagement';
import { RolePermission } from './pages/RolePermission';
import { BusinessConfig } from './pages/BusinessConfig';
import { SystemLogs } from './pages/SystemLogs';

const SYSTEM_LOGS_VIEW_VERSION = 'system-logs-filter-risk-clean-20260814';

export default function App() {
  const viewModel = useAppViewModel();
  const {
    activePage,
    businessConfigInitialModule,
    reports,
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
    openNewReportModal,
    openEditReportModal,
    closeNewReportModal,
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
  } = viewModel;

  return (
    <div className="min-h-screen flex flex-col bg-[#F0F4F8] text-gray-800 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#1E5ABB] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-bold flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <Header currentUser="张三" />

      <Navbar
        activePage={activePage}
        reportDetailSourcePage={reportDetailSourcePage}
        onNavigate={handleNavigate}
      />

      <main className="flex-1 max-w-[1920px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-5">
        {activePage === 'home' && (
          <Home
            reports={reports}
            orgs={orgs}
            onNavigate={handleNavigate}
            onSelectReport={setSelectedReport}
            onSelectAudit={setSelectedAudit}
            currentUser="张三"
          />
        )}

        {activePage === 'report-summary' && (
          <ReportSummary
            reports={reports}
            onSelectReport={(report) => {
              setSelectedReport(report);
              setReportDetailSourcePage('report-summary');
            }}
            onDeleteReport={handleDeleteReport}
            onWithdrawReport={handleWithdrawReport}
            onOpenEditReport={openEditReportModal}
            onOpenNewReport={openNewReportModal}
            onNavigate={handleNavigate}
          />
        )}

        {activePage === 'report-records' && (
          <ReportRecords
            reports={reports}
            currentUser="张三"
            currentOrg={{ name: '台中市网信办', role: '超级管理员' }}
            onSelectReport={(report) => {
              setSelectedReport(report);
              setReportDetailSourcePage('report-records');
            }}
            onDeleteReport={handleDeleteReport}
            onWithdrawReport={handleWithdrawReport}
            onOpenEditReport={openEditReportModal}
            onOpenNewReport={openNewReportModal}
            onNavigate={handleNavigate}
          />
        )}

        {activePage === 'report-detail' && (
          <ReportDetail
            report={selectedReport}
            sourcePage={reportDetailSourcePage}
            onNavigate={handleNavigate}
            onWithdrawReport={handleWithdrawReport}
            onOpenEditReport={openEditReportModal}
            onDeleteReport={handleDeleteReport}
          />
        )}

        {activePage === 'report-audit' && (
          <ReportAudit
            auditPendingList={reports.filter((report) => report.auditStatus === '待审核')}
            allReports={reports}
            onSelectAudit={setSelectedAudit}
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
            onSelectAuditRecord={setSelectedAuditRecord}
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
            negativeList={reports.filter((report) =>
              report.auditStatus === '待转办' ||
              report.auditStatus === '已转办' ||
              report.auditStatus === '已通过'
            )}
            onSelectNegative={setSelectedNegative}
            onTransferSubmit={handleTransferSubmit}
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

        {activePage === 'statistics' && <StatisticsReference onNavigate={handleNavigate} />}

        {activePage === 'evaluation' && <EvaluationReference onNavigate={handleNavigate} />}

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
        {activePage === 'business-config' && (
          <BusinessConfig initialModule={businessConfigInitialModule} />
        )}
        {activePage === 'system-logs' && (
          <SystemLogs key={SYSTEM_LOGS_VIEW_VERSION} logs={logs} />
        )}
      </main>

      <NewReportModal
        isOpen={isNewReportModalOpen}
        onClose={closeNewReportModal}
        editingReport={editingReport}
        onSubmit={handleCreateReport}
        onUpdate={handleResubmitReport}
      />

      <Footer />
    </div>
  );
}
