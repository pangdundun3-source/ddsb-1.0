import React, { useState } from 'react';
import { Institution, AuditLog } from '../types';
import { ChangeAuthorizationModal } from './ChangeAuthorizationModal';
import { BusinessRuleNavKey, InstitutionBusinessRulesTab } from './InstitutionBusinessRulesTab';
import { OtherBusinessConfigTab } from './OtherBusinessConfigTab';
import { InstitutionUserManagement } from './InstitutionUserManagement';
import { InstitutionRoleManagement } from './InstitutionRoleManagement';
import { InstitutionOrgStructure } from './InstitutionOrgStructure';
import { ExternalUserSystemConfig } from './ExternalUserSystemConfig';
import { CopyIconButton } from './common/CopyIconButton';
import {
  AVAILABLE_ROLES,
  FORMAL_DURATION_PRESETS,
  INSTITUTION_DETAIL_TABS,
  REGION_OPTIONS,
  TRIAL_DURATION_PRESETS,
  useInstitutionDetailViewModel,
} from '../viewmodels/useInstitutionDetailViewModel';
import { getInstitutionProfile } from '../viewmodels/useInstitutionListViewModel';
import { getTodayStr } from '../shared/date';

const daysUntil = (endDate: string) => {
  const today = new Date(getTodayStr()).getTime();
  return Math.ceil((new Date(endDate).getTime() - today) / (1000 * 60 * 60 * 24));
};

const InstitutionSummaryBar: React.FC<{
  institution: Institution;
  onCopy: (label: string, value: string) => void;
  onOpenService: () => void;
  onChangeAuth: () => void;
  onRevoke: () => void;
}> = ({ institution, onCopy, onOpenService, onChangeAuth, onRevoke }) => {
  const profile = getInstitutionProfile(institution);
  const running = institution.daysRemaining > 0;
  const remaining = running ? institution.daysRemaining : Math.min(daysUntil(institution.endDate), 0);

  return (
    <div className="flex items-start justify-between gap-6 -mt-2 pb-4 border-b border-gray-100">
      <div className="min-w-0 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-xl font-bold text-gray-900">{institution.name}</h2>
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-500">
            客户ID：<span className="font-mono text-gray-700">{profile.customerCode}</span>
            <CopyIconButton onClick={() => onCopy('客户ID', profile.customerCode)} title="复制客户ID" />
          </span>
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${
              institution.status === '正式'
                ? 'bg-violet-50 text-violet-600 border-violet-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            {institution.status}版
          </span>
          {running ? (
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              已开通运行中
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border border-amber-200 bg-amber-50 text-amber-600 font-medium">
              <span className="material-symbols-outlined text-[12px]">schedule</span>
              已到期
            </span>
          )}
        </div>
        <div className="text-xs text-gray-600">{profile.fullName}</div>
        <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
          <span className="inline-flex items-center gap-1">
            统一社会信用代码：<span className="font-mono font-medium text-gray-800">{profile.creditCode}</span>
            <CopyIconButton onClick={() => onCopy('统一社会信用代码', profile.creditCode)} title="复制信用代码" />
          </span>
          <span className="text-gray-300">•</span>
          <span>
            统计单元：<span className="font-medium text-gray-800">{profile.unitName}</span>
          </span>
          <span className="text-gray-300">•</span>
          <span>
            负责销售：<span className="font-medium text-gray-800">{institution.salesName}</span>
          </span>
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-4 border border-[#dbe4f0] bg-[#f7f9fc] rounded-md px-4 py-2.5">
        <div className="text-right">
          <div className="text-xs text-gray-500 flex items-center justify-end gap-1">
            综合服务有效期
            <span className="relative group/tip inline-flex">
              <span className="material-symbols-outlined text-[15px] text-[#1890ff] cursor-help">help</span>
              <span className="pointer-events-none absolute right-0 bottom-full mb-2 w-[400px] rounded-md bg-[#1c2536] px-4 py-3 text-left text-[13px] leading-6 text-white shadow-xl opacity-0 group-hover/tip:opacity-100 transition-opacity z-30">
                系统依据机构下最后到期的应用，确定机构登录 V8 系统的最终时效；但不影响单应用登录权限，用户能否登录应用以该应用自身配置的到期时间为准。
              </span>
            </span>
          </div>
          <div className="mt-1 font-mono">
            <span className={`text-sm font-bold ${running ? 'text-gray-800' : 'text-rose-600'}`}>{institution.endDate}</span>
            <span className={`ml-1 text-xs ${running ? 'text-gray-400' : 'text-rose-400'}`}>({remaining}天)</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenService}
          title="配置服务有效期"
          aria-label="配置服务有效期"
          className={`w-9 h-9 rounded-md border flex items-center justify-center cursor-pointer transition-colors ${
            running
              ? 'border-[#bcd3f2] bg-[#eaf2fd] text-[#1890ff] hover:bg-[#dcebfc]'
              : 'border-rose-200 bg-rose-50 text-rose-500 hover:bg-rose-100'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">calendar_month</span>
        </button>
        <span className="w-px h-9 bg-[#dbe4f0]" />
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={onChangeAuth}
            className="text-sm font-bold text-[#1E3A6B] hover:text-[#1890ff] cursor-pointer"
          >
            变更授权
          </button>
          <button
            type="button"
            onClick={onRevoke}
            className="text-[11px] text-gray-400 hover:text-rose-500 cursor-pointer"
          >
            设为未开通
          </button>
        </div>
      </div>
    </div>
  );
};

interface InstitutionDetailPageProps {
  institution?: Institution | null;
  isCreateMode?: boolean;
  initialIsEditing?: boolean;
  onEditModeChange?: (editing: boolean) => void;
  onBack: () => void;
  onSave: (updatedData: Partial<Institution>) => void;
  onDelete?: (inst: Institution) => void;
  onRevoke?: (inst: Institution) => void;
  onToggleStatus?: (id: number) => void;
  auditLogs?: AuditLog[];
}

export const InstitutionDetailPage: React.FC<InstitutionDetailPageProps> = ({
  institution,
  isCreateMode = false,
  initialIsEditing = false,
  onEditModeChange,
  onBack,
  onSave,
  onDelete,
  onRevoke,
  onToggleStatus,
}) => {
  const [showChangeAuth, setShowChangeAuth] = useState(false);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const { state, actions, refs, derived } = useInstitutionDetailViewModel({
    institution,
    isCreateMode,
    initialIsEditing,
    onEditModeChange,
    onSave,
  });
  const {
    isEditing,
    isProvisioning,
    showHistoryModal,
    toastMsg,
    personnelList,
    isSyncingPersonnel,
    roleModalTarget,
    editPersonnelName,
    selectedRoleForEdit,
    searchDropdownOpen,
    formData,
    detailTab,
    isBasicInfoEditing,
    provisionForm,
    provisionHistory,
    mockPersonnel,
    filteredCandidates,
    daysTotal,
    daysRemaining,
    isExpired,
  } = state;
  const {
    setIsEditing,
    setIsProvisioning,
    setShowHistoryModal,
    setEditPersonnelName,
    setSelectedRoleForEdit,
    setSearchDropdownOpen,
    setFormData,
    setDetailTab,
    setIsBasicInfoEditing,
    setProvisionForm,
    setRoleModalTarget,
    handleSyncFromMT,
    handleOpenRoleModal,
    handleSaveRole,
    handleQuickDuration,
    handleSwitchServiceMode,
    handleModalQuickDuration,
    handleModalSwitchStatus,
    handleSelectMTCandidate,
    handleSubmitForm,
    handleConfirmProvision,
    handleOpenProvisionModal,
    handleDetailTabChange,
    showToast,
  } = actions;
  const { searchInputRef } = refs;
  const { calculateDays, calculateRemainingDays } = derived;

  return (
    <div className="min-h-full bg-white p-6 flex flex-col gap-6 text-gray-800 relative pb-20">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed top-5 right-5 z-50 text-white px-4 py-2.5 rounded shadow-lg flex items-center gap-2 text-sm animate-bounce ${
            toastMsg.type === 'warning' ? 'bg-orange-500' : 'bg-[#1890ff]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {toastMsg.type === 'warning' ? 'warning' : 'check_circle'}
          </span>
          {toastMsg.text}
        </div>
      )}

      {/* Top Header Bar & Breadcrumb */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center text-sm font-semibold text-gray-700 hover:text-[#1890ff] transition-colors cursor-pointer bg-gray-50 hover:bg-blue-50 px-3 py-1.5 rounded border border-gray-200"
          >
            <span className="material-symbols-outlined text-[18px] mr-1">
              arrow_back
            </span>
            返回列表
          </button>

          <div className="flex items-center text-sm">
            <span
              onClick={onBack}
              className="text-gray-500 hover:text-[#1890ff] cursor-pointer transition-colors"
            >
              机构管理
            </span>
            <span className="mx-2 text-gray-300">/</span>
            <span className="font-bold text-gray-900">
              {isCreateMode ? '新增机构' : isEditing ? '编辑机构' : '机构详情'}
            </span>
          </div>
        </div>
      </div>

      {!isCreateMode && institution && (
        <InstitutionSummaryBar
          institution={institution}
          onCopy={(label, value) => {
            navigator.clipboard?.writeText(value);
            showToast(`已复制${label}：${value}`);
          }}
          onOpenService={handleOpenProvisionModal}
          onChangeAuth={() => setShowChangeAuth(true)}
          onRevoke={() => setShowRevokeConfirm(true)}
        />
      )}

      {showChangeAuth && institution && (
        <ChangeAuthorizationModal
          institution={institution}
          onClose={() => setShowChangeAuth(false)}
          onConfirm={({ status, startDate, endDate, daysRemaining }) => {
            onSave({ id: institution.id, status, startDate, endDate, daysRemaining });
            setShowChangeAuth(false);
          }}
        />
      )}

      {showRevokeConfirm && institution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" onClick={() => setShowRevokeConfirm(false)}>
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">warning</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">确认将机构设为未开通？</h3>
                <p className="text-xs text-gray-500 mt-1.5 leading-5">
                  「{institution.name}」将立即失去「点点速报 - 清朗净网鉴谣速报系统」的访问权限，并从已开通列表中移除；后续可在「开通机构」中重新授权。
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowRevokeConfirm(false)}
                className="px-4 py-2 text-sm font-bold text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowRevokeConfirm(false);
                  onRevoke?.(institution);
                }}
                className="px-4 py-2 text-sm font-bold text-white bg-rose-500 rounded-md hover:bg-rose-600 cursor-pointer"
              >
                确认设为未开通
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs Switcher (Only shown in Detail/Edit mode, hidden in Create mode) */}
      {!isCreateMode && (
        <div className="flex items-center gap-2 sm:gap-4 border-b border-gray-200 text-sm font-medium -mt-2 overflow-x-auto no-scrollbar">
          {INSTITUTION_DETAIL_TABS.map((tab) => {
            const isActive = detailTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  handleDetailTabChange(tab.key);
                }}
                className={`pb-3.5 px-1.5 flex items-center gap-1.5 cursor-pointer transition-all border-b-2 font-semibold whitespace-nowrap text-xs sm:text-sm ${
                  isActive
                    ? 'border-[#1890ff] text-[#1890ff]'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {detailTab === 'org_structure' && (
        <InstitutionOrgStructure institutionName={institution?.name || ''} />
      )}

      {/* Tab 1: 机构用户管理 */}
      {detailTab === 'basic' && (
        <>
          <InstitutionUserManagement institutionName={institution?.name || ''} showToast={showToast} />
        </>
      )}

      {detailTab === 'org_roles' && (
        <InstitutionRoleManagement institutionName={institution?.name || ''} showToast={showToast} />
      )}

      {/* Tab 3: 其他业务配置 (Other Business Rules & Configurations) - Left Sub-Nav Layout */}
      {detailTab === 'external_users' && (
        <ExternalUserSystemConfig
          institutionId={institution?.id}
          institutionName={institution?.name || ''}
          showToast={showToast}
        />
      )}

      {detailTab !== 'basic' &&
        detailTab !== 'org_roles' &&
        detailTab !== 'org_structure' &&
        detailTab !== 'external_users' && (
        <InstitutionBusinessRulesTab
          key={institution?.id || 'rules'}
          institution={institution}
          isCreateMode={isCreateMode}
          isGlobalScope={false}
          hideSubNav={false}
          onSaveRules={(newRules) => {
            onSave({ businessRules: newRules });
            showToast('机构专属业务规则已成功保存并实时生效！');
          }}
          showToast={showToast}
        />
      )}

      {/* Modal 1: Provisioning Modal / Drawer */}
      {isProvisioning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 animate-scale-in">
            {/* Modal Header */}
            <div className="bg-[#f8fafd] px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#1890ff] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">
                    bolt
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <span>开通服务</span>
                    <span className="text-xs font-normal text-gray-500">
                      ({formData.name || '随州市网信中心'})
                    </span>
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsProvisioning(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1 rounded-md hover:bg-gray-100"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Form Content */}
            <div className="p-6 space-y-4 text-sm">
              {/* Service Type - Matches Create Mode */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
                  <span>服务模式</span>
                  <span className="text-red-500 font-bold">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    onClick={() => handleModalSwitchStatus('试用')}
                    className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      provisionForm.status === '试用'
                        ? 'border-[#d97724] bg-[#fffaf0] text-[#d97724] ring-2 ring-[#d97724]/20 shadow-xs'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px]">
                        hourglass_top
                      </span>
                      <div className="font-bold text-sm">试用</div>
                    </div>
                    <input
                      type="radio"
                      name="prov_status"
                      checked={provisionForm.status === '试用'}
                      onChange={() => {}}
                      className="accent-[#d97724]"
                    />
                  </label>

                  <label
                    onClick={() => handleModalSwitchStatus('正式')}
                    className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      provisionForm.status === '正式'
                        ? 'border-[#1890ff] bg-blue-50 text-[#1890ff] ring-2 ring-[#1890ff]/20 shadow-xs'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px]">
                        verified
                      </span>
                      <div className="font-bold text-sm">正式</div>
                    </div>
                    <input
                      type="radio"
                      name="prov_status"
                      checked={provisionForm.status === '正式'}
                      onChange={() => {}}
                      className="accent-[#1890ff]"
                    />
                  </label>
                </div>
              </div>

              {/* Service Time Range - Matches Create Mode */}
              <div className="grid grid-cols-2 gap-3">
                {/* Start Date */}
                <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs">
                  <div className="text-gray-700 text-xs font-medium mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <span>服务生效日期</span>
                      <span className="text-red-500 font-bold">*</span>
                    </span>
                    <span className="material-symbols-outlined text-[15px] text-gray-400">
                      calendar_today
                    </span>
                  </div>
                  <input
                    type="date"
                    value={provisionForm.startDate}
                    onChange={(e) => setProvisionForm({ ...provisionForm, startDate: e.target.value })}
                    className="w-full border border-gray-200 hover:border-[#1890ff] focus:border-[#1890ff] rounded px-2.5 py-1.5 text-xs font-mono text-gray-800 focus:outline-none transition-colors"
                  />
                </div>

                {/* End Date */}
                <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs">
                  <div className="text-gray-700 text-xs font-medium mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <span>服务到期日期</span>
                      <span className="text-red-500 font-bold">*</span>
                    </span>
                    <span className="material-symbols-outlined text-[15px] text-gray-400">
                      event_busy
                    </span>
                  </div>
                  <input
                    type="date"
                    value={provisionForm.endDate}
                    onChange={(e) => setProvisionForm({ ...provisionForm, endDate: e.target.value })}
                    className="w-full border border-gray-200 hover:border-[#1890ff] focus:border-[#1890ff] rounded px-2.5 py-1.5 text-xs font-mono text-gray-800 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Quick Presets - Matches Create Mode */}
              <div className="space-y-1.5 pt-1">
                <div className="text-xs text-gray-500 font-medium flex items-center">
                  <span className="material-symbols-outlined text-[15px] mr-1 text-[#1890ff]">
                    bolt
                  </span>
                  快捷设置时长
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {(provisionForm.status === '试用' ? TRIAL_DURATION_PRESETS : FORMAL_DURATION_PRESETS).map((preset) => {
                    const modalDays = calculateDays(provisionForm.startDate, provisionForm.endDate);
                    const isSelected = modalDays === preset.days;
                    return (
                      <button
                        key={preset.days}
                        type="button"
                        onClick={() => handleModalQuickDuration(preset.days, provisionForm.status)}
                        className={`text-xs px-3 py-1 rounded border transition-all cursor-pointer font-medium flex items-center gap-1 ${
                          isSelected
                            ? provisionForm.status === '试用'
                              ? 'border-[#d97724] bg-[#fffaf0] text-[#d97724] ring-1 ring-[#d97724]/20 shadow-2xs font-semibold'
                              : 'border-[#1890ff] bg-blue-50 text-[#1890ff] ring-1 ring-[#1890ff]/20 shadow-2xs font-semibold'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900'
                        }`}
                      >
                        {isSelected && (
                          <span className="material-symbols-outlined text-[13px]">check</span>
                        )}
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Service Duration Calculation Display - Matches Create Mode */}
              <div className="bg-[#f8faff] border border-[#d6e4ff] rounded-lg p-3.5 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-[#1890ff] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">
                      timer
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600 font-medium">服务有效时长</span>
                      <span className="text-[10px] text-gray-400 bg-white px-1.5 py-0.2 rounded border border-gray-200">
                        自动核算
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1 mt-0.5 text-gray-800">
                      <span className="text-xs font-medium text-gray-600">剩</span>
                      <span className={`text-xl font-bold font-mono ${calculateRemainingDays(provisionForm.endDate) <= 0 ? 'text-red-500' : calculateRemainingDays(provisionForm.endDate) <= 7 ? 'text-orange-500' : 'text-[#1890ff]'}`}>
                        {calculateRemainingDays(provisionForm.endDate)}
                      </span>
                      <span className="text-xs font-medium text-gray-600">天</span>
                      <span className="text-gray-300 mx-1">/</span>
                      <span className="text-xs font-medium text-gray-500">共</span>
                      <span className="text-sm font-bold font-mono text-gray-700">
                        {calculateDays(provisionForm.startDate, provisionForm.endDate)}
                      </span>
                      <span className="text-xs font-medium text-gray-500">天</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-xs px-2.5 py-1 rounded font-medium border inline-flex items-center gap-1 ${
                      calculateRemainingDays(provisionForm.endDate) <= 0
                        ? 'bg-red-50 text-red-600 border-red-200'
                        : calculateRemainingDays(provisionForm.endDate) <= 7
                        ? 'bg-orange-50 text-orange-600 border-orange-200'
                        : 'bg-green-50 text-green-600 border-green-200'
                    }`}
                  >
                    {calculateRemainingDays(provisionForm.endDate) <= 0
                      ? '已到期'
                      : calculateRemainingDays(provisionForm.endDate) <= 7
                      ? '即将到期'
                      : '期限充足'}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-3.5 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsProvisioning(false)}
                className="px-4 py-1.5 rounded text-sm text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmProvision}
                className="px-5 py-1.5 rounded text-sm font-medium bg-[#1890ff] text-white hover:bg-blue-600 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">check</span>
                <span>确认生效</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Provision History Modal / Activation Records */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden border border-gray-200 animate-scale-in flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="bg-[#f8fafd] px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#1890ff] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">
                    history
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-gray-900">开通记录</h3>
                    <span className="text-xs text-gray-500 font-normal">
                      ({formData.name || '随州市网信中心'})
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1 rounded-md hover:bg-gray-100"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Top Stat Banner */}
            <div className="bg-[#f0f5ff] border-b border-blue-100 px-6 py-3 grid grid-cols-3 gap-4 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-blue-600 text-[18px]">
                  verified
                </span>
                <div>
                  <span className="text-gray-500 block text-[11px]">当前服务状态</span>
                  <span className="font-bold text-gray-900">
                    {formData.status}服务（生效中）
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 border-l border-blue-200/60 pl-4">
                <span className="material-symbols-outlined text-blue-600 text-[18px]">
                  date_range
                </span>
                <div>
                  <span className="text-gray-500 block text-[11px]">当前授权周期</span>
                  <span className="font-medium text-gray-900 font-mono">
                    {formData.startDate} ~ {formData.endDate}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 border-l border-blue-200/60 pl-4">
                <span className="material-symbols-outlined text-blue-600 text-[18px]">
                  history_toggle_off
                </span>
                <div>
                  <span className="text-gray-500 block text-[11px]">累计开通/变更次数</span>
                  <span className="font-bold text-[#1890ff] font-mono">
                    {provisionHistory.length} 次
                  </span>
                </div>
              </div>
            </div>

            {/* History Table */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="border border-gray-200 rounded-lg overflow-hidden overflow-x-auto shadow-2xs">
                <table className="w-full text-xs text-left whitespace-nowrap min-w-[700px]">
                  <thead>
                    <tr className="bg-[#f9fafc] text-gray-700 border-b border-gray-200 font-medium">
                      <th className="py-3 px-4 w-14 text-center">序号</th>
                      <th className="py-3 px-4">开通类型</th>
                      <th className="py-3 px-4">服务有效区间</th>
                      <th className="py-3 px-4">授权时长</th>
                      <th className="py-3 px-4">经办/操作人</th>
                      <th className="py-3 px-4">操作时间</th>
                      <th className="py-3 px-4">状态</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {provisionHistory.map((h, idx) => (
                      <tr key={h.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-3 px-4 text-gray-400 font-mono text-center">{idx + 1}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded text-[11px] font-medium border inline-flex items-center gap-1 ${
                              h.type === '正式'
                                ? 'bg-blue-50 text-[#1890ff] border-blue-200'
                                : 'bg-orange-50 text-[#d97724] border-orange-200'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[13px]">
                              {h.type === '正式' ? 'verified' : 'hourglass_top'}
                            </span>
                            {h.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs font-medium text-gray-800">
                          {h.startDate} 至 {h.endDate}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-gray-600 font-medium">
                          {calculateDays(h.startDate, h.endDate)} 天
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-800">
                          {h.operator}
                        </td>
                        <td className="py-3 px-4 text-gray-500 font-mono text-xs">
                          {h.time}
                        </td>
                        <td className="py-3 px-4">
                          {h.status === '生效中' ? (
                            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                              生效中
                            </span>
                          ) : (
                            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200 inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                              已到期
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-3.5 border-t border-gray-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => showToast('已成功导出该机构的服务开通记录台账凭证！')}
                className="text-xs text-gray-600 hover:text-[#1890ff] flex items-center gap-1.5 transition-colors cursor-pointer border border-gray-300 bg-white hover:bg-gray-50 px-3 py-1.5 rounded"
              >
                <span className="material-symbols-outlined text-[16px]">
                  download
                </span>
                <span>导出开通记录</span>
              </button>

              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="px-5 py-1.5 rounded text-sm bg-[#1890ff] text-white hover:bg-blue-600 transition-colors cursor-pointer shadow-xs font-medium"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Role Configuration Modal for Synced Personnel */}
      {roleModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 animate-scale-in">
            {/* Modal Header */}
            <div className="bg-[#f8fafd] px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#1890ff]">
                <span className="material-symbols-outlined text-[22px]">manage_accounts</span>
                <h3 className="text-base font-bold text-gray-900">配置人员管理角色</h3>
              </div>
              <button
                type="button"
                onClick={() => setRoleModalTarget(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-4 text-sm">
              {/* Personnel Summary Card */}
              <div className="bg-blue-50/50 rounded-lg p-3.5 border border-blue-100/80 flex items-center gap-3">
                {roleModalTarget.avatar ? (
                  <img
                    src={roleModalTarget.avatar}
                    alt={roleModalTarget.nickname}
                    className="w-11 h-11 rounded object-cover border border-blue-200"
                  />
                ) : (
                  <div className="w-11 h-11 rounded bg-[#1890ff] text-white flex items-center justify-center font-bold text-sm">
                    微
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-sm">{roleModalTarget.nickname}</span>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-3 mt-1 font-mono">
                    <span>关注公众号: 康奈点点速报</span>
                    <span>关注时间: {roleModalTarget.followTime || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Personnel Name Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  真实姓名 (选填):
                </label>
                <input
                  type="text"
                  value={editPersonnelName}
                  onChange={(e) => setEditPersonnelName(e.target.value)}
                  placeholder="输入该人员的真实姓名，如：王科长"
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-xs focus:outline-none focus:border-[#1890ff]"
                />
              </div>

              {/* Role Selection List */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700">
                  选择分配系统权限角色:
                </label>
                <div className="space-y-2">
                  {AVAILABLE_ROLES.map((role) => {
                    const isSelected = selectedRoleForEdit === role.key;
                    return (
                      <div
                        key={role.key}
                        onClick={() => setSelectedRoleForEdit(role.key)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
                          isSelected
                            ? 'border-[#1890ff] bg-blue-50/60 ring-1 ring-[#1890ff]/20'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                        }`}
                      >
                        <div className="mt-0.5">
                          <input
                            type="radio"
                            name="roleSelection"
                            checked={isSelected}
                            onChange={() => setSelectedRoleForEdit(role.key)}
                            className="text-[#1890ff] focus:ring-[#1890ff] cursor-pointer"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-gray-900">{role.label}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${role.color}`}>
                              {role.key}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5 leading-normal">{role.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-3.5 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setRoleModalTarget(null)}
                className="px-4 py-1.5 rounded text-sm text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveRole}
                className="px-5 py-1.5 rounded text-sm font-medium bg-[#1890ff] text-white hover:bg-blue-600 transition-colors shadow-xs cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[18px]">check</span>
                确认配置角色
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
