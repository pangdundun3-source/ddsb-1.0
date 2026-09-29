import { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardHome } from './components/DashboardHome';
import { InstitutionManagement } from './components/InstitutionManagement';
import { GlobalConfig } from './components/GlobalConfig';
import { OperationsMonitoring } from './components/OperationsMonitoring';
import { SystemManagement } from './components/SystemManagement';
import { InstitutionDetailPage } from './components/InstitutionDetailPage';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { WechatQrLogin } from './components/WechatQrLogin';
import { MtPortalWorkspace } from './components/MtPortalWorkspace';
import { LogoutConfirmModal } from './components/LogoutConfirmModal';
import { useAppEntryViewModel } from './viewmodels/useAppEntryViewModel';
import { useAdminShellViewModel } from './viewmodels/useAdminShellViewModel';

export default function App() {
  const {
    isAuthenticated,
    activeView,
    loginPhase,
    qrRevision,
    actions: entryActions,
  } = useAppEntryViewModel();
  const { state, actions } = useAdminShellViewModel();
  const {
    activeTab,
    systemSubTab,
    isCreatingInstitution,
    isEditingInstitution,
    institutions,
    expiringInstitutions,
    auditLogs,
    deletingInstitution,
    toastMessage,
    activeDetailInstitution,
  } = state;
  const {
    showToast,
    handleTabChange,
    handleSystemSubTabChange,
    handleEditModeChange,
    openInstitutionDetail,
    handleCloseInstitutionDetail,
    handleOpenAddInstitution,
    handleCloseAddInstitution,
    handleToggleStatus,
    handleProvisionInstitution,
    handleSaveInstitution,
    handleConfirmDelete,
    handleSelectExpiringInstitution,
    setDeletingInstitution,
  } = actions;

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    entryActions.handleLogout();
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  if (!isAuthenticated) {
    return (
      <WechatQrLogin
        loginPhase={loginPhase}
        qrRevision={qrRevision}
        onRefreshQr={entryActions.refreshQr}
        onSimulateScan={entryActions.simulateScan}
      />
    );
  }

  // 1:1 MT Management System Application Portal Workspace
  if (activeView === 'portal') {
    return (
      <>
        <MtPortalWorkspace
          onEnterDiandian={entryActions.enterOperationInterface}
          onLogout={() => setShowLogoutConfirm(true)}
        />
        <LogoutConfirmModal
          isOpen={showLogoutConfirm}
          onConfirm={handleConfirmLogout}
          onCancel={handleCancelLogout}
        />
      </>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#f5f7fa] flex flex-col font-sans">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#1890ff] text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2 text-sm animate-bounce">
          <span className="material-symbols-outlined text-[20px]">
            info
          </span>
          {toastMessage}
        </div>
      )}

      {/* Top Header Bar */}
      <Header
        onLogout={() => {
          setShowLogoutConfirm(true);
        }}
      />

      {/* Main Container Layout */}
      <div className="flex w-full flex-1 pt-[74px]">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          systemSubTab={systemSubTab}
          setSystemSubTab={handleSystemSubTabChange}
        />

        {/* Right Content Body */}
        <main className="flex-1 bg-[#f5f7fa] overflow-y-auto overflow-x-auto min-h-[calc(100vh-74px)]">
          {/* If create mode is open, show the full Add Institution Page */}
          {isCreatingInstitution ? (
            <InstitutionDetailPage
              isCreateMode={true}
              onBack={handleCloseAddInstitution}
              onSave={handleSaveInstitution}
              auditLogs={auditLogs}
            />
          ) : (activeTab === 'institutions' && activeDetailInstitution) ? (
            /* If secondary institution detail page is open */
            <InstitutionDetailPage
              key={`inst-${activeDetailInstitution.id}-${isEditingInstitution ? 'edit' : 'detail'}`}
              institution={activeDetailInstitution}
              isCreateMode={false}
              initialIsEditing={isEditingInstitution}
              onEditModeChange={handleEditModeChange}
              onBack={handleCloseInstitutionDetail}
              onSave={handleSaveInstitution}
              onDelete={(inst) => setDeletingInstitution(inst)}
              onToggleStatus={handleToggleStatus}
              auditLogs={auditLogs}
            />
          ) : (
            <>
              {activeTab === 'home' && (
                <DashboardHome
                  expiringInstitutions={expiringInstitutions}
                  onSelectInstitution={handleSelectExpiringInstitution}
                  setActiveTab={handleTabChange}
                />
              )}

              {activeTab === 'institutions' && (
                <InstitutionManagement
                  institutions={institutions}
                  onAddClick={handleOpenAddInstitution}
                  onEditClick={(inst) => {
                    openInstitutionDetail(inst.id, true);
                  }}
                  onDetailClick={(inst) => {
                    openInstitutionDetail(inst.id, false);
                  }}
                  onDeleteClick={(inst) => setDeletingInstitution(inst)}
                  onToggleStatus={handleToggleStatus}
                  onProvisionInstitution={handleProvisionInstitution}
                />
              )}

              {activeTab === 'config' && <GlobalConfig onShowToast={showToast} />}

              {activeTab === 'monitoring' && <OperationsMonitoring />}

              {activeTab === 'system' && (
                <SystemManagement
                  auditLogs={auditLogs}
                  initialSubTab={systemSubTab}
                  onSubTabChange={handleSystemSubTabChange}
                  onShowToast={showToast}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        institution={deletingInstitution}
        onClose={() => setDeletingInstitution(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Logout Confirm Modal (1:1 with prompt screenshot) */}
      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
      />
    </div>
  );
}
