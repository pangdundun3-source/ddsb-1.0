import React from 'react';
import { AuditLog, SystemSubModule } from '../types';
import { AccountManagement } from './system/AccountManagement';
import { SystemLogs } from './system/SystemLogs';
import { useSystemManagementViewModel } from '../viewmodels/useSystemManagementViewModel';

interface SystemManagementProps {
  auditLogs?: AuditLog[];
  initialSubTab?: SystemSubModule;
  onSubTabChange?: (subTab: SystemSubModule) => void;
  onShowToast?: (msg: string) => void;
}

export const SystemManagement: React.FC<SystemManagementProps> = ({
  initialSubTab,
  onSubTabChange,
  onShowToast,
}) => {
  const { state, actions } = useSystemManagementViewModel(initialSubTab);
  const { activeSubTab } = state;
  const { handleSwitchTab } = actions;

  return (
    <div className="p-6 flex flex-col gap-6 min-w-[1024px]">
      {/* Top Header Card with Breadcrumb */}
      <div className="bg-white rounded-lg border border-gray-100 p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1.5 font-medium">
            <span className="flex items-center gap-1 text-gray-600">
              <span className="material-symbols-outlined text-[16px] text-[#1890ff]">
                dvr
              </span>
              系统管理
            </span>
            <span>/</span>
            <span className="text-gray-900 font-semibold">
              {activeSubTab === 'accounts' ? '账号管理' : '系统日志'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-900">
              {activeSubTab === 'accounts'
                ? '平台管理员与权限管理'
                : '安全审计与系统运行日志'}
            </h2>
            <span className="text-xs text-gray-400 border-l border-gray-200 pl-3 hidden sm:inline">
              {activeSubTab === 'accounts'
                ? '管理全网运维、配置及商务管理人员的访问控制与数据权限'
                : '遵循等保三级合规标准，记录管理员操作轨迹、安全风控与调度状态'}
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Module Content Page */}
      {activeSubTab === 'accounts' ? (
        <AccountManagement onShowToast={onShowToast} />
      ) : (
        <SystemLogs onShowToast={onShowToast} />
      )}
    </div>
  );
};
