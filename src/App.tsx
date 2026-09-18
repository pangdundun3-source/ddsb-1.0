import React, { useState } from 'react';
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
import { NoticeManagement } from './pages/NoticeManagement';
import { UserOrgManagement } from './pages/UserOrgManagement';
import { parseUserOrgModule } from './data/userOrgShared';
import { BusinessConfig } from './pages/BusinessConfig';
import { SystemLogs } from './pages/SystemLogs';
import { Login } from './pages/Login';
import { PortalHome } from './pages/PortalHome';

const SYSTEM_LOGS_VIEW_VERSION = 'system-logs-filter-risk-clean-20260814';

export default function App() {
  const viewModel = useAppViewModel();
  const {
    activePage,
    isLoggedIn,
    currentUser,
    handleLogin,
    handleLogout,
    businessConfigInitialModule,
    userOrgInitialModule,
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

  // Global synchronization between 点点速豹 and 正管用网络生态治理平台
  const [currentOrg, setCurrentOrg] = useState<string>(() => {
    try {
      return localStorage.getItem('ddsb_current_org') || '台中市网信办';
    } catch {
      return '台中市网信办';
    }
  });

  const [userName, setUserName] = useState<string>(() => {
    try {
      return localStorage.getItem('ddsb_user_name') || '. w .';
    } catch {
      return '. w .';
    }
  });

  const [userPhone, setUserPhone] = useState<string>(() => {
    try {
      return localStorage.getItem('ddsb_user_phone') || '178****9573';
    } catch {
      return '178****9573';
    }
  });

  const [portalTab, setPortalTab] = useState<'grid' | 'profile' | 'notifications' | 'org-users' | 'org-apps'>('grid');

  const handleSwitchOrg = (newOrg: string) => {
    setCurrentOrg(newOrg);
    try {
      localStorage.setItem('ddsb_current_org', newOrg);
    } catch {}
  };

  const handleUpdateUserName = (newName: string) => {
    setUserName(newName);
    try {
      localStorage.setItem('ddsb_user_name', newName);
    } catch {}
  };

  const handleUpdateUserPhone = (newPhone: string) => {
    setUserPhone(newPhone);
    try {
      localStorage.setItem('ddsb_user_phone', newPhone);
    } catch {}
  };

  const handleNavigateToProfile = () => {
    setPortalTab('profile');
    handleNavigate('portal');
  };

  // Show 1:1 Login Homepage if user is not logged in or activePage is 'login'
  if (!isLoggedIn || activePage === 'login') {
    return (
      <div className="min-h-screen w-full font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
        {toastMessage && (
          <div className="fixed top-4 right-4 z-50 bg-[#1E5ABB] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-bold flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
            <span>✓</span>
            <span>{toastMessage}</span>
          </div>
        )}
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  // Show 1:1 Portal Desktop Homepage after login
  if (activePage === 'portal') {
    return (
      <div className="min-h-screen w-full font-sans antialiased selection:bg-amber-100 selection:text-amber-900">
        {toastMessage && (
          <div className="fixed top-4 right-4 z-50 bg-[#1E5ABB] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-bold flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
            <span>✓</span>
            <span>{toastMessage}</span>
          </div>
        )}
        <PortalHome
          currentUser={currentUser}
          reports={reports}
          onNavigate={handleNavigate}
          onSelectReport={setSelectedReport}
          onLogout={handleLogout}
          currentOrg={currentOrg}
          onSwitchOrg={handleSwitchOrg}
          userName={userName}
          onUpdateUserName={handleUpdateUserName}
          userPhone={userPhone}
          onUpdateUserPhone={handleUpdateUserPhone}
          initialTab={portalTab}
          onTabChange={setPortalTab}
        />
      </div>
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
        currentUser={currentUser}
        userName={userName}
        currentOrg={currentOrg}
        onSwitchOrg={handleSwitchOrg}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
        onNavigateToProfile={handleNavigateToProfile}
        reports={reports}
        onSelectReport={setSelectedReport}
        onSelectAudit={setSelectedAudit}
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
            onSelectReport={setSelectedReport}
            onSelectAudit={setSelectedAudit}
            currentUser="张三"
          />
        )}

        {(activePage === 'report-summary' || (activePage === 'report-detail' && reportDetailSourcePage === 'report-summary')) && (
          <>
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
            {activePage === 'report-detail' && reportDetailSourcePage === 'report-summary' && (
              <ReportDetail
                report={selectedReport}
                sourcePage="report-summary"
                onNavigate={handleNavigate}
                onWithdrawReport={handleWithdrawReport}
                onOpenEditReport={openEditReportModal}
                onDeleteReport={handleDeleteReport}
              />
            )}
          </>
        )}

        {(activePage === 'report-records' || (activePage === 'report-detail' && reportDetailSourcePage === 'report-records')) && (
          <>
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
            {activePage === 'report-detail' && reportDetailSourcePage === 'report-records' && (
              <ReportDetail
                report={selectedReport}
                sourcePage="report-records"
                onNavigate={handleNavigate}
                onWithdrawReport={handleWithdrawReport}
                onOpenEditReport={openEditReportModal}
                onDeleteReport={handleDeleteReport}
              />
            )}
          </>
        )}

        {(activePage === 'report-audit' || activePage === 'audit-detail') && (
          <>
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
            {activePage === 'audit-detail' && (
              <AuditDetail
                report={selectedAudit}
                allReports={reports}
                onApprove={handleApproveAudit}
                onReject={handleRejectAudit}
                onNavigate={handleNavigate}
              />
            )}
          </>
        )}

        {(activePage === 'audit-records' || activePage === 'audit-record-detail') && (
          <>
            <AuditRecords
              records={auditRecords}
              allReports={reports}
              onSelectAuditRecord={setSelectedAuditRecord}
              onNavigate={handleNavigate}
            />
            {activePage === 'audit-record-detail' && (
              <AuditRecordDetail
                record={selectedAuditRecord}
                allReports={reports}
                sourcePage="audit-records"
                onNavigate={handleNavigate}
                onWithdrawReport={handleWithdrawReport}
                onResubmitReport={handleResubmitReport}
                onDeleteReport={handleDeleteReport}
              />
            )}
          </>
        )}

        {(activePage === 'negative-info' || activePage === 'negative-detail') && (
          <>
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
            {activePage === 'negative-detail' && (
              <NegativeDetail
                report={selectedNegative}
                onTransferSubmit={handleTransferSubmit}
                onNavigate={handleNavigate}
              />
            )}
          </>
        )}

        {activePage === 'statistics' && <StatisticsReference onNavigate={handleNavigate} />}

        {activePage === 'evaluation' && <EvaluationReference onNavigate={handleNavigate} />}

        {activePage === 'notice-management' && (
          <NoticeManagement
            onNavigate={handleNavigate}
            currentUser={userName || currentUser}
            currentOrg={currentOrg}
          />
        )}

        {(activePage === 'user-org-management' ||
          activePage === 'org-management' ||
          activePage === 'role-permission') && (
          <UserOrgManagement
            key="user-org-management"
            initialModule={
              activePage === 'role-permission'
                ? 'role'
                : activePage === 'org-management'
                ? 'org'
                : parseUserOrgModule(userOrgInitialModule)
            }
            onNavigatePage={handleNavigate}
            orgList={orgs}
            onAddOrg={handleAddOrg}
            onUpdateOrg={handleUpdateOrg}
            onDeleteOrg={handleDeleteOrg}
          />
        )}
        {(activePage === 'business-config' ||
          activePage === 'template-management' ||
          activePage === 'audit-flow-config' ||
          activePage === 'audit-score-config' ||
          activePage === 'dict-management' ||
          activePage === 'value-added-services') && (
          <BusinessConfig
            key="business-config"
            initialModule={
              activePage === 'template-management'
                ? 'report_template'
                : activePage === 'audit-flow-config'
                ? 'audit_flow'
                : activePage === 'audit-score-config'
                ? 'audit_score'
                : activePage === 'dict-management'
                ? 'data_dict'
                : activePage === 'value-added-services'
                ? 'value_added'
                : businessConfigInitialModule || 'report_template'
            }
            onNavigatePage={handleNavigate}
          />
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
