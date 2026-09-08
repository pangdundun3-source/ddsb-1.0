import React from 'react';
import { initialEvaluations } from './data/mockData';
import { useAppViewModel } from './viewmodels/useAppViewModel';

import { Header } from './components/Header';
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
import { AuditRecordDetail } from './pages/AuditRecordDetail';
import { NegativeInfoLibrary } from './pages/NegativeInfoLibrary';
import { NegativeDetail } from './pages/NegativeDetail';
import { Statistics } from './pages/Statistics';
import { Evaluation } from './pages/Evaluation';
import { PersonalInfo } from './pages/PersonalInfo';
import { OrgManagement } from './pages/OrgManagement';
import { RolePermission } from './pages/RolePermission';
import { BusinessConfig } from './pages/BusinessConfig';
import { SystemLogs } from './pages/SystemLogs';
import { Login } from './pages/Login';

const SYSTEM_LOGS_VIEW_VERSION = 'system-logs-filter-risk-clean-20260814';

export default function App() {
  const viewModel = useAppViewModel();
  const {
    activePage,
    currentOrg,
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
    newReportTemplate,
    editingReport,
    isH5MobileOpen,
    toastMessage,
    setSelectedReport,
    setSelectedAudit,
    setSelectedNegative,
    setSelectedAuditRecord,
    setReportDetailSourcePage,
    openNewReportModal,
    openEditReportModal,
    closeNewReportModal,
    handleOpenNewReport,
    handleSwitchOrg,
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
    handleDeleteOrg,
    setIsH5MobileOpen
  } = viewModel;

  if (activePage === 'login') {
    return (
      <Login
        onLoginSuccess={() => handleNavigate('home')}
        onNavigate={handleNavigate}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F0F4F8] text-gray-800 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#1E5ABB] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-bold flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <Header
        onNewReportClick={() => handleOpenNewReport(null)}
        currentUser="张三"
        currentOrg={currentOrg}
        onSwitchOrg={handleSwitchOrg}
        onNavigate={handleNavigate}
      />

      <Navbar
        activePage={activePage}
        reportDetailSourcePage={reportDetailSourcePage}
        onNavigate={handleNavigate}
      />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {activePage === 'home' && (
          <Home
            reports={reports}
            orgs={orgs}
            onNavigate={handleNavigate}
            onSelectReport={(report) => {
              setSelectedReport(report);
              setReportDetailSourcePage('report-summary');
            }}
            onSelectAudit={setSelectedAudit}
            currentUser="张三"
            currentRoleTitle={currentOrg.role}
            onOpenNewReport={handleOpenNewReport}
            onOpenEditReport={openEditReportModal}
            onDeleteReport={handleDeleteReport}
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
            onOpenNewReport={handleOpenNewReport}
            onNavigate={handleNavigate}
          />
        )}

        {activePage === 'report-records' && (
          <ReportRecords
            reports={reports}
            currentUser="张三"
            currentOrg={currentOrg}
            onSelectReport={(report) => {
              setSelectedReport(report);
              setReportDetailSourcePage('report-records');
            }}
            onDeleteReport={handleDeleteReport}
            onWithdrawReport={handleWithdrawReport}
            onOpenEditReport={openEditReportModal}
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
        initialTemplate={newReportTemplate}
        editingReport={editingReport}
        onSubmit={handleCreateReport}
        onUpdate={handleResubmitReport}
      />

      <H5MobilePortal
        isOpen={isH5MobileOpen}
        onClose={() => setIsH5MobileOpen(false)}
        reports={reports}
        auditRecords={auditRecords}
        orgs={orgs}
        currentUser="张三"
        onCreateReport={handleCreateReport}
        onApproveAudit={handleApproveAudit}
        onBatchApprove={handleBatchApprove}
        onRejectAudit={handleRejectAudit}
        onTransferSubmit={handleTransferSubmit}
      />

      <Footer />
    </div>
  );
}
