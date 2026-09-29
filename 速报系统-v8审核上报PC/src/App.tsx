import React from 'react';
import { CheckCircle2, XCircle, Info } from 'lucide-react';
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
    toastInfo,
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
      {(toastInfo || toastMessage) && (
        <div
          id="global-toast-notification"
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none animate-in fade-in slide-in-from-top-4 duration-200"
        >
          <div
            className={`pointer-events-auto min-w-[320px] max-w-[540px] px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-3 text-sm border backdrop-blur-md transition-all ${
              toastInfo?.type === 'reject'
                ? 'bg-rose-600 text-white border-rose-500 shadow-rose-950/25'
                : toastInfo?.type === 'error'
                ? 'bg-red-600 text-white border-red-500 shadow-red-950/25'
                : toastInfo?.type === 'info'
                ? 'bg-[#1E5ABB] text-white border-blue-500 shadow-blue-950/25'
                : 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-950/25'
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              {toastInfo?.type === 'reject' ? (
                <XCircle className="w-5 h-5 text-white" />
              ) : toastInfo?.type === 'info' ? (
                <Info className="w-5 h-5 text-white" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="flex flex-col flex-1 min-w-0 pr-1">
              <span className="text-xs font-bold leading-tight tracking-wide">
                {toastInfo?.type === 'reject'
                  ? '审核驳回提示'
                  : toastInfo?.type === 'info'
                  ? '系统提示'
                  : '操作成功'}
              </span>
              <span className="text-xs text-white/95 font-medium leading-snug break-words mt-0.5">
                {toastInfo?.message || toastMessage}
              </span>
            </div>
          </div>
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

        {(activePage === 'report-audit' || activePage === 'audit-detail') && (
          <ReportAudit
            auditPendingList={reports.filter((report) => report.auditStatus === '待审核')}
            allReports={reports}
            initialDrawerReport={activePage === 'audit-detail' ? selectedAudit : null}
            onSelectAudit={setSelectedAudit}
            onApproveAudit={handleApproveAudit}
            onRejectAudit={handleRejectAudit}
            onBatchApprove={handleBatchApprove}
            onBatchReject={handleBatchReject}
            onDeleteReport={handleDeleteReport}
            onNavigate={handleNavigate}
          />
        )}

        {(activePage === 'audit-records' || activePage === 'audit-record-detail') && (
          <AuditRecords
            records={auditRecords}
            allReports={reports}
            initialDrawerRecord={activePage === 'audit-record-detail' ? (selectedAuditRecord || auditRecords[0] || null) : null}
            onSelectAuditRecord={setSelectedAuditRecord}
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
