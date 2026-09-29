import React from 'react';
import { Institution, AuditLog } from '../types';
import { BusinessRuleNavKey, InstitutionBusinessRulesTab } from './InstitutionBusinessRulesTab';
import { OtherBusinessConfigTab } from './OtherBusinessConfigTab';
import {
  AVAILABLE_ROLES,
  FORMAL_DURATION_PRESETS,
  INSTITUTION_DETAIL_TABS,
  REGION_OPTIONS,
  TRIAL_DURATION_PRESETS,
  useInstitutionDetailViewModel,
} from '../viewmodels/useInstitutionDetailViewModel';

interface InstitutionDetailPageProps {
  institution?: Institution | null;
  isCreateMode?: boolean;
  initialIsEditing?: boolean;
  onEditModeChange?: (editing: boolean) => void;
  onBack: () => void;
  onSave: (updatedData: Partial<Institution>) => void;
  onDelete?: (inst: Institution) => void;
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
  onToggleStatus,
}) => {
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

        {/* Action Buttons in Header */}
        <div className="flex items-center gap-3"></div>
      </div>

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

      {/* Tab 1: 基础信息与服务 (Basic Info, Service Config, Personnel) */}
      {detailTab === 'basic' && (
        <>
          {/* Section 1: 基本信息 (Basic Information) - Exactly matching user screenshot */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="w-[3px] h-[16px] bg-[#1890ff] rounded-xs mr-2 inline-block"></span>
                <h3 className="text-sm font-bold text-gray-900">基本信息</h3>
              </div>

              {/* Dedicated Edit Controls for Basic Information */}
              {!isCreateMode && !isEditing && (
                <div>
                  {!isBasicInfoEditing ? (
                    <button
                      id="btn-edit-basic-info"
                      type="button"
                      onClick={() => setIsBasicInfoEditing(true)}
                      className="text-xs text-[#1890ff] hover:text-blue-700 bg-blue-50/70 hover:bg-blue-100/80 border border-blue-200 px-2.5 py-1 rounded flex items-center gap-1 font-medium transition-colors cursor-pointer"
                      title="单独编辑机构基本信息"
                    >
                      <span className="material-symbols-outlined text-[15px]">edit</span>
                      <span>编辑</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        id="btn-cancel-basic-info"
                        type="button"
                        onClick={() => {
                          if (institution) {
                            setFormData((prev) => ({
                              ...prev,
                              name: institution.name || '',
                              shortName: institution.name || '',
                              category: institution.category || '一类',
                              industry: institution.industry || '网信部门',
                              location: institution.location || '湖北/随州市',
                              salesName: institution.salesName || '廖伟',
                              salesPhone: institution.salesPhone || '189****4954',
                              systemName: institution.systemName || '融媒体速报系统',
                            }));
                          }
                          setIsBasicInfoEditing(false);
                        }}
                        className="text-xs text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 px-2.5 py-1 rounded transition-colors cursor-pointer"
                      >
                        取消
                      </button>
                      <button
                        id="btn-save-basic-info"
                        type="button"
                        onClick={() => {
                          if (!formData.name.trim()) {
                            showToast('【基本信息】请输入或选择机构名称', 'warning');
                            return;
                          }
                          if (!formData.location.trim()) {
                            showToast('【基本信息】请选择所在地区', 'warning');
                            return;
                          }
                          onSave({
                            name: formData.name.trim(),
                            category: formData.category,
                            industry: formData.industry,
                            location: formData.location,
                            salesName: formData.salesName,
                            salesPhone: formData.salesPhone,
                            systemName: formData.systemName,
                          });
                          setIsBasicInfoEditing(false);
                          showToast('机构基本信息已成功更新！');
                        }}
                        className="text-xs text-white bg-[#1890ff] hover:bg-blue-600 px-3 py-1 rounded font-medium flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[15px]">check</span>
                        <span>保存</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {isEditing || isCreateMode || isBasicInfoEditing ? (
          <div className="bg-white py-2">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-5">
              {/* Row 1, Col 1: * 机构名称 (Searchable / Selectable input) */}
              <div className="flex items-center gap-3">
                <label className="w-20 shrink-0 text-right text-gray-700 text-sm font-normal flex items-center justify-end">
                  <span className="text-red-500 mr-1">*</span>机构名称
                </label>
                <div className="flex-1 relative" ref={searchInputRef}>
                  <input
                    type="text"
                    value={formData.name}
                    onFocus={() => setSearchDropdownOpen(true)}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({
                        ...formData,
                        name: val,
                        shortName: formData.shortName ? formData.shortName : val,
                      });
                      setSearchDropdownOpen(true);
                    }}
                    placeholder="请选择机构，支持输入内容检索"
                    className="w-full border border-gray-200 hover:border-[#1890ff] focus:border-[#1890ff] rounded px-3 py-1.5 text-sm bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none transition-colors"
                  />

                  {/* Autocomplete / Selection Dropdown */}
                  {searchDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-30 max-h-56 overflow-y-auto divide-y divide-gray-100">
                      <div className="px-3 py-1.5 bg-gray-50 text-[11px] text-gray-400 font-medium flex items-center justify-between">
                        <span>可从MT系统同步的机构</span>
                        <span>点击自动填充</span>
                      </div>
                      {filteredCandidates.length > 0 ? (
                        filteredCandidates.map((cand, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleSelectMTCandidate(cand)}
                            className="px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer flex flex-col gap-0.5 transition-colors"
                          >
                            <div className="font-medium text-gray-800 flex items-center justify-between">
                              <span>{cand.name}</span>
                              <span className="text-[10px] text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded">
                                {cand.category}
                              </span>
                            </div>
                            <div className="text-gray-400 text-[11px] flex items-center gap-3">
                              <span>简称: {cand.shortName}</span>
                              <span>地区: {cand.location}</span>
                              <span>销售: {cand.salesName}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-3 text-xs text-gray-400 text-center">
                          未在MT系统找到匹配项，可直接作为新机构名称保存
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 1, Col 2: 机构简称 (从MT系统同步) */}
              <div className="flex items-center gap-3">
                <label className="w-20 shrink-0 text-right text-gray-700 text-sm font-normal">
                  机构简称
                </label>
                <div className="flex-1">
                  <input
                    type="text"
                    value={formData.shortName}
                    onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                    placeholder="从MT系统同步"
                    className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm bg-[#f8f9fc] text-gray-700 placeholder:text-gray-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 1, Col 3: 机构类别 (从MT系统同步) */}
              <div className="flex items-center gap-3">
                <label className="w-20 shrink-0 text-right text-gray-700 text-sm font-normal">
                  机构类别
                </label>
                <div className="flex-1">
                  <input
                    type="text"
                    value={formData.category ? `${formData.category}${formData.industry ? ' / ' + formData.industry : ''}` : ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="从MT系统同步"
                    className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm bg-[#f8f9fc] text-gray-700 placeholder:text-gray-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 2, Col 1: * 所在地区 (Dropdown) */}
              <div className="flex items-center gap-3">
                <label className="w-20 shrink-0 text-right text-gray-700 text-sm font-normal flex items-center justify-end">
                  <span className="text-red-500 mr-1">*</span>所在地区
                </label>
                <div className="flex-1 relative">
                  <select
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full appearance-none border border-gray-200 hover:border-[#1890ff] focus:border-[#1890ff] rounded px-3 py-1.5 text-sm bg-white text-gray-800 focus:outline-none transition-colors cursor-pointer pr-8"
                  >
                    <option value="" disabled>
                      请选择所在地区
                    </option>
                    {REGION_OPTIONS.map((reg) => (
                      <option key={reg} value={reg}>
                        {reg}
                      </option>
                    ))}
                    {formData.location && !REGION_OPTIONS.includes(formData.location) && (
                      <option value={formData.location}>{formData.location}</option>
                    )}
                  </select>
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 flex items-center">
                    <span className="material-symbols-outlined text-[18px]">
                      keyboard_arrow_down
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 2, Col 2: 销售人员 (从MT系统同步) */}
              <div className="flex items-center gap-3">
                <label className="w-20 shrink-0 text-right text-gray-700 text-sm font-normal">
                  销售人员
                </label>
                <div className="flex-1">
                  <input
                    type="text"
                    value={formData.salesName}
                    onChange={(e) => setFormData({ ...formData, salesName: e.target.value })}
                    placeholder="从MT系统同步"
                    className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm bg-[#f8f9fc] text-gray-700 placeholder:text-gray-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 2, Col 3: 销售电话 (从MT系统同步) */}
              <div className="flex items-center gap-3">
                <label className="w-20 shrink-0 text-right text-gray-700 text-sm font-normal">
                  销售电话
                </label>
                <div className="flex-1">
                  <input
                    type="text"
                    value={formData.salesPhone}
                    onChange={(e) => setFormData({ ...formData, salesPhone: e.target.value })}
                    placeholder="从MT系统同步"
                    className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm bg-[#f8f9fc] text-gray-700 placeholder:text-gray-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 3, Col 1: 系统名称 (with 0 / 50 character limit suffix) */}
              <div className="flex items-center gap-3">
                <label className="w-20 shrink-0 text-right text-gray-700 text-sm font-normal">
                  系统名称
                </label>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    maxLength={50}
                    value={formData.systemName}
                    onChange={(e) => setFormData({ ...formData, systemName: e.target.value })}
                    placeholder="客户端系统名称，不填默认为机构简称"
                    className="w-full border border-gray-200 hover:border-[#1890ff] focus:border-[#1890ff] rounded pl-3 pr-14 py-1.5 text-sm bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none transition-colors"
                  />
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none select-none">
                    {formData.systemName?.length || 0} / 50
                  </div>
                </div>
              </div>

              {/* Row 3, Col 2: Empty space for 3-column layout */}
              <div className="hidden lg:block"></div>

              {/* Row 3, Col 3: Empty space for 3-column layout */}
              <div className="hidden lg:block"></div>
            </div>
          </div>
        ) : (
          /* View Mode (Readonly details) - Exactly matching user screenshot */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-8 lg:gap-x-16 text-sm text-gray-900 py-1">
            {/* Row 1 */}
            <div className="flex items-center gap-3.5">
              <span className="text-gray-900 font-normal shrink-0">机构名称</span>
              <span className="text-gray-800 font-normal">{formData.name || '-'}</span>
            </div>
            <div className="flex items-center gap-3.5">
              <span className="text-gray-900 font-normal shrink-0">机构简称</span>
              <span className="text-gray-800 font-normal">{formData.shortName || formData.name || '-'}</span>
            </div>
            <div className="flex items-center gap-3.5">
              <span className="text-gray-900 font-normal shrink-0">机构类别</span>
              <span className="text-gray-800 font-normal">
                {formData.category
                  ? `${formData.category}${formData.industry ? ': ' + formData.industry : ''}`
                  : '-'}
              </span>
            </div>

            {/* Row 2 */}
            <div className="flex items-center gap-3.5">
              <span className="text-gray-900 font-normal shrink-0">所在地区</span>
              <span className="text-gray-800 font-normal">{formData.location || '-'}</span>
            </div>
            <div className="flex items-center gap-3.5">
              <span className="text-gray-900 font-normal shrink-0">销售人员</span>
              <span className="text-gray-800 font-normal">{formData.salesName || '-'}</span>
            </div>
            <div className="flex items-center gap-3.5">
              <span className="text-gray-900 font-normal shrink-0">销售电话</span>
              <span className="text-gray-800 font-normal">{formData.salesPhone || '-'}</span>
            </div>

            {/* Row 3 */}
            <div className="flex items-center gap-3.5">
              <span className="text-gray-900 font-normal shrink-0">系统名称</span>
              <span className="text-gray-800 font-normal">{formData.systemName || '-'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Section 2: 功能开通与服务配置 (Feature Provisioning & Service Configuration - Required) */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="w-[3px] h-[16px] bg-[#1890ff] rounded-xs mr-2 inline-block"></span>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <span>配置服务</span>
              {(isEditing || isCreateMode) && (
                <>
                  <span className="text-red-500 font-bold text-xs">*</span>
                  <span className="text-[11px] font-normal text-gray-400 ml-1">
                    (必填项：须选定服务模式并设定有效服务周期)
                  </span>
                </>
              )}
            </h3>
          </div>
        </div>

        {/* Provisioning Control Box */}
        <div
          className={`rounded-lg p-5 shadow-2xs space-y-4 transition-colors ${
            isExpired && !isEditing && !isCreateMode
              ? 'bg-[#fffafb]'
              : 'bg-[#f8faff]'
          }`}
        >
          <div
            className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 ${
              isExpired && !isEditing && !isCreateMode
                ? 'border-red-100'
                : 'border-blue-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center ${
                  isExpired && !isEditing && !isCreateMode
                    ? 'bg-red-100 text-red-600 border border-red-200'
                    : formData.status === '正式'
                    ? 'bg-blue-100 text-[#1890ff]'
                    : 'bg-orange-100 text-[#d97724]'
                }`}
              >
                <span className="material-symbols-outlined text-[26px]">
                  {isExpired && !isEditing && !isCreateMode
                    ? 'event_busy'
                    : formData.status === '正式'
                    ? 'verified'
                    : 'hourglass_top'}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-base font-bold text-gray-900">
                    {isExpired && !isEditing && !isCreateMode
                      ? `${formData.status}服务已到期`
                      : formData.status === '正式'
                      ? '正式服务开通中'
                      : '试用服务开通中'}
                  </h4>
                  {isExpired && !isEditing && !isCreateMode && (
                    <span className="text-xs text-[#d46b08] bg-[#fff7e6] border border-[#ffd591] px-2.5 py-0.5 rounded flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-[#fa8c16]">
                        warning
                      </span>
                      <span>已于 {formData.endDate} 到期，系统功能已暂停</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side: Service Mode Selector + 开通记录 Button */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Service Mode Selector in Create Mode / Edit Mode */}
              {(isCreateMode || isEditing) && (
                <div className="flex gap-2">
                  <button
                    id="btn-switch-service-trial"
                    type="button"
                    onClick={() => handleSwitchServiceMode('试用')}
                    className={`px-3.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                      formData.status === '试用'
                        ? 'border-[#d97724] bg-[#fffaf0] text-[#d97724] shadow-xs ring-2 ring-[#d97724]/20'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      hourglass_top
                    </span>
                    试用
                  </button>

                  <button
                    id="btn-switch-service-formal"
                    type="button"
                    onClick={() => handleSwitchServiceMode('正式')}
                    className={`px-3.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                      formData.status === '正式'
                        ? 'border-[#1890ff] bg-blue-50 text-[#1890ff] shadow-xs ring-2 ring-[#1890ff]/20'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      verified
                    </span>
                    正式
                  </button>
                </div>
              )}

              {/* Right Side in View Mode: 开通记录 + 开通服务 Buttons */}
              {!isCreateMode && !isEditing && (
                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* 开通记录 Button */}
                  <button
                    id="btn-box-activation-history"
                    type="button"
                    onClick={() => setShowHistoryModal(true)}
                    className="px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-[#1890ff]/50 bg-white text-[#1890ff] hover:bg-blue-50 hover:border-[#1890ff] shadow-2xs"
                    title="查看该机构的全部开通与变更记录"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      history
                    </span>
                    <span>开通记录</span>
                    {provisionHistory.length > 0 && (
                      <span className="bg-blue-100 text-[#1890ff] text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono">
                        {provisionHistory.length}
                      </span>
                    )}
                  </button>

                  {/* 开通功能 Button */}
                  <button
                    id="btn-box-open-provision"
                    type="button"
                    onClick={handleOpenProvisionModal}
                    className="px-3.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer bg-[#1890ff] text-white hover:bg-blue-600 shadow-xs border border-transparent active:scale-98"
                    title="为该机构办理开通或续期授权"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      bolt
                    </span>
                    <span>开通服务</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Date Range & Durations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Start Date */}
            <div className="bg-white p-3.5 rounded-md border border-gray-200 shadow-2xs">
              <div className="text-gray-700 font-medium mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <span>服务生效日期</span>
                  <span className="text-red-500 font-bold">*</span>
                </span>
                <span className="material-symbols-outlined text-[16px] text-gray-400">
                  calendar_today
                </span>
              </div>
              {isCreateMode || isEditing ? (
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full border border-gray-200 hover:border-[#1890ff] focus:border-[#1890ff] rounded px-3 py-1.5 text-sm font-mono text-gray-800 focus:outline-none transition-colors"
                />
              ) : (
                <div className="text-gray-800 font-medium font-mono text-sm">
                  {formData.startDate}
                </div>
              )}
            </div>

            {/* End Date */}
            <div className="bg-white p-3.5 rounded-md border border-gray-200 shadow-2xs">
              <div className="text-gray-700 font-medium mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <span>服务到期日期</span>
                  <span className="text-red-500 font-bold">*</span>
                </span>
                <span className="material-symbols-outlined text-[16px] text-gray-400">
                  event_busy
                </span>
              </div>
              {isCreateMode || isEditing ? (
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full border border-gray-200 hover:border-[#1890ff] focus:border-[#1890ff] rounded px-3 py-1.5 text-sm font-mono text-gray-800 focus:outline-none transition-colors"
                />
              ) : (
                <div className="text-gray-800 font-medium font-mono text-sm">
                  {formData.endDate}
                </div>
              )}
            </div>

            {/* Days Total Display */}
            <div className="bg-white p-3.5 rounded-md border border-gray-200 shadow-2xs flex flex-col justify-between">
              <div className="text-gray-500 font-medium mb-1 flex items-center justify-between">
                <span>服务有效时长</span>
                <span className="text-xs text-gray-400">自动核算</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-baseline gap-1 text-gray-800">
                  <span className="text-xs font-medium text-gray-600">剩</span>
                  <span className={`text-xl font-bold font-mono ${daysRemaining <= 0 ? 'text-red-500' : daysRemaining <= 7 ? 'text-orange-500' : 'text-[#1890ff]'}`}>
                    {daysRemaining}
                  </span>
                  <span className="text-xs font-medium text-gray-600">天</span>
                  <span className="text-gray-300 mx-1">/</span>
                  <span className="text-xs font-medium text-gray-500">共</span>
                  <span className="text-sm font-bold font-mono text-gray-700">
                    {daysTotal}
                  </span>
                  <span className="text-xs font-medium text-gray-500">天</span>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded font-medium ${
                    daysRemaining <= 0
                      ? 'bg-red-50 text-red-600 border border-red-200'
                      : daysRemaining <= 7
                      ? 'bg-red-50 text-red-600 border border-red-200'
                      : daysRemaining <= 30
                      ? 'bg-orange-50 text-orange-600 border border-orange-200'
                      : 'bg-green-50 text-green-600 border border-green-200'
                  }`}
                >
                  {daysRemaining <= 0 ? '已到期' : daysRemaining <= 7 ? '即将到期' : '期限充足'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Preset Buttons (Shown in Edit & Create Modes) - Unified Styles & Mode Linked */}
          {(isCreateMode || isEditing) && (
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-blue-100/60 mt-2">
              <span className="text-xs text-gray-500 font-medium flex items-center">
                <span className="material-symbols-outlined text-[15px] mr-1 text-[#1890ff]">
                  bolt
                </span>
                快捷设置时长:
              </span>

              {/* Show unified buttons based on current active service mode (Trial vs Formal) */}
              {(formData.status === '试用' ? TRIAL_DURATION_PRESETS : FORMAL_DURATION_PRESETS).map((preset) => {
                const isSelected = daysTotal === preset.days;
                return (
                  <button
                    key={preset.days}
                    type="button"
                    onClick={() => handleQuickDuration(preset.days, formData.status)}
                    className={`text-xs px-3 py-1 rounded border transition-all cursor-pointer font-medium flex items-center gap-1 ${
                      isSelected
                        ? formData.status === '试用'
                          ? 'border-[#d97724] bg-[#fffaf0] text-[#d97724] ring-1 ring-[#d97724]/20 shadow-2xs font-semibold'
                          : 'border-[#1890ff] bg-blue-50 text-[#1890ff] ring-1 ring-[#1890ff]/20 shadow-2xs font-semibold'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900'
                    }`}
                  >
                    {isSelected && (
                      <span className="material-symbols-outlined text-[13px]">
                        check
                      </span>
                    )}
                    {preset.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Section 3: 人员管理 (Personnel Management) - Exactly matched to user reference image */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="w-[3px] h-[16px] bg-[#1890ff] rounded-xs mr-2 inline-block"></span>
            <h3 className="text-sm font-bold text-gray-900">人员管理</h3>
          </div>

          {/* Sync Button on Top-Right */}
          <button
            type="button"
            onClick={handleSyncFromMT}
            disabled={isSyncingPersonnel}
            className="border border-[#1890ff] text-[#1890ff] hover:bg-blue-50 px-3.5 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[16px] ${isSyncingPersonnel ? 'animate-spin' : ''}`}>
              sync
            </span>
            从MT同步人员
          </button>
        </div>

        {/* Personnel Table or Clean Empty State */}
        <div className="rounded-xs overflow-hidden bg-white">
          <table className="w-full text-left text-xs border-collapse table-fixed">
            <colgroup>
              <col className="w-14" />
              <col className="w-24" />
              <col className="w-32" />
              <col className="w-24" />
              <col className="w-28" />
              <col className="w-40" />
              <col className="w-40" />
              <col className="w-40" />
              <col className="w-20" />
              <col className="w-24" />
            </colgroup>
            <thead>
              <tr className="bg-[#f2f6fc] text-gray-700 border-b border-gray-200 font-normal">
                <th className="py-3 px-4 font-normal">序号</th>
                <th className="py-3 px-4 font-normal">微信头像</th>
                <th className="py-3 px-4 font-normal">微信昵称</th>
                <th className="py-3 px-4 font-normal">姓名</th>
                <th className="py-3 px-4 font-normal">角色</th>
                <th className="py-3 px-4 font-normal">关注时间</th>
                <th className="py-3 px-4 font-normal">配置时间</th>
                <th className="py-3 px-4 font-normal">最后登录时间</th>
                <th className="py-3 px-4 font-normal text-center">状态</th>
                <th className="py-3 px-4 font-normal text-center">操作</th>
              </tr>
            </thead>
            {personnelList.length > 0 ? (
              <tbody className="text-gray-700 divide-y divide-gray-100">
                {personnelList.map((person, index) => {
                  const isConfigured = Boolean(person.role);
                  return (
                    <tr key={person.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-gray-500">{index + 1}</td>
                      <td className="py-3.5 px-4">
                        {person.avatar ? (
                          <img
                            src={person.avatar}
                            alt={person.nickname || '微信头像'}
                            className="w-8 h-8 rounded object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded bg-blue-50 text-[#1890ff] flex items-center justify-center font-bold text-xs">
                            {person.name ? person.name.slice(0, 1) : '微'}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-gray-800 truncate">{person.nickname || '-'}</td>
                      <td className="py-3.5 px-4 text-gray-800">{person.name || ''}</td>
                      <td className="py-3.5 px-4">
                        {isConfigured ? (
                          <span className="text-xs text-gray-800 font-medium">{person.role}</span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 font-mono text-[11px]">{person.followTime || '-'}</td>
                      <td className="py-3.5 px-4 text-gray-500 font-mono text-[11px]">{person.configTime || ''}</td>
                      <td className="py-3.5 px-4 text-gray-500 font-mono text-[11px]">{person.lastLoginTime || ''}</td>
                      <td className="py-3.5 px-4 text-center">
                        {isConfigured ? (
                          <span className="text-xs font-medium text-green-600">
                            已配置
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-[#ff4d4f]">
                            未配置
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenRoleModal(person)}
                          className={`font-normal text-xs cursor-pointer transition-colors px-2.5 py-1 rounded inline-block ${
                            isConfigured
                              ? 'text-[#1890ff] hover:underline'
                              : 'text-[#1890ff] border border-[#1890ff] hover:bg-blue-50 shadow-2xs font-medium'
                          }`}
                        >
                          {isConfigured ? '修改配置' : '立即配置'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            ) : null}
          </table>

          {/* Empty State exactly matching the uploaded screenshot */}
          {personnelList.length === 0 && (
            <div className="py-28 flex flex-col items-center justify-center text-center">
              {/* Cute puppy document box illustration */}
              <div className="w-24 h-24 mb-3 relative flex items-center justify-center">
                <svg viewBox="0 0 120 120" className="w-20 h-20" fill="none">
                  {/* Background folder box */}
                  <rect x="25" y="45" width="70" height="55" rx="8" fill="#dce6f5" />
                  <rect x="20" y="55" width="80" height="48" rx="8" fill="#e8effa" />
                  <path d="M30 55L45 42H75L90 55" fill="#cddcf2" />
                  {/* Paper sheets inside */}
                  <rect x="32" y="25" width="56" height="40" rx="4" fill="#ffffff" stroke="#c0d4ed" strokeWidth="2" />
                  {/* Cute puppy face in paper */}
                  <circle cx="60" cy="40" r="14" fill="#ffffff" stroke="#cbd7ea" strokeWidth="1.5" />
                  <ellipse cx="50" cy="33" rx="3.5" ry="5" fill="#333333" />
                  <ellipse cx="70" cy="33" rx="3.5" ry="5" fill="#333333" />
                  <circle cx="56" cy="38" r="1.8" fill="#333333" />
                  <circle cx="64" cy="38" r="1.8" fill="#333333" />
                  <ellipse cx="60" cy="43" rx="2.5" ry="1.8" fill="#1890ff" />
                  {/* Box front flap with circle logo */}
                  <rect x="20" y="60" width="80" height="42" rx="6" fill="#f0f4fb" />
                  <circle cx="60" cy="80" r="8" fill="#ffffff" stroke="#d5e3f7" strokeWidth="2" />
                  <circle cx="60" cy="80" r="3" fill="#1890ff" />
                </svg>
              </div>
              <p className="text-xs text-gray-400 font-normal select-none">抱歉！暂无数据</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Sticky Action Footer in Create Mode or Edit Mode */}
      {(isCreateMode || isEditing) && (
        <div className="fixed bottom-0 right-0 left-52 bg-white/95 backdrop-blur-sm border-t border-gray-200 px-8 py-3.5 flex items-center justify-between z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#1890ff]">
              corporate_fare
            </span>
            <span>
              {isCreateMode
                ? `正在创建机构：${formData.name || '未命名新机构'}`
                : `正在编辑机构：${formData.name}`}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="border border-gray-300 text-gray-700 px-5 py-2 rounded text-sm hover:bg-gray-50 transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSubmitForm}
              className="bg-[#1890ff] text-white px-6 py-2 rounded text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">
                check
              </span>
              {isCreateMode ? '确认创建并开通服务' : '保存更新配置'}
            </button>
          </div>
        </div>
      )}
        </>
      )}

      {/* Tab 2: 其他业务配置 (Other Business Rules & Configurations) - Left Sub-Nav Layout */}
      {detailTab !== 'basic' && (
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
