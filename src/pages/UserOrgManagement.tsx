import React, { useEffect, useState } from 'react';
import { PageId } from '../types';
import { OrgManagement } from './OrgManagement';
import { RolePermission } from './RolePermission';
import { SystemAccountManagement } from './SystemAccountManagement';
import { PersonnelGroupManagement } from './PersonnelGroupManagement';
import {
  parseUserOrgModule,
  useUserOrgSharedState,
  type UserOrgModule
} from '../data/userOrgShared';

interface UserOrgManagementProps {
  initialModule?: UserOrgModule | string;
  onNavigatePage?: (page: PageId, extraModule?: string) => void;
  orgList?: unknown;
  onAddOrg?: unknown;
  onUpdateOrg?: unknown;
  onDeleteOrg?: unknown;
}

const moduleList: Array<{ id: UserOrgModule; label: string; desc: string }> = [
  {
    id: 'account',
    label: '系统账号管理',
    desc: '维护全量系统账号，绑定所属机构、角色与人员分组'
  },
  {
    id: 'org',
    label: '组织机构设置',
    desc: '支持多层级无限树节点架构，人员仅归属单一机构节点'
  },
  {
    id: 'role',
    label: '角色权限设置',
    desc: '管理系统内的角色以及权限分配，默认角色不可修改，自定义/临时角色支持编辑与配置'
  },
  {
    id: 'group',
    label: '人员分组管理',
    desc: '按业务专班管理分组，并从在册账号中选派成员'
  }
];

export const UserOrgManagement: React.FC<UserOrgManagementProps> = ({
  initialModule = 'account',
  onNavigatePage,
  orgList,
  onAddOrg,
  onUpdateOrg,
  onDeleteOrg
}) => {
  const shared = useUserOrgSharedState();
  const [activeModule, setActiveModule] = useState<UserOrgModule>(parseUserOrgModule(initialModule));

  useEffect(() => {
    if (initialModule) {
      setActiveModule(parseUserOrgModule(initialModule));
    }
  }, [initialModule]);

  const currentModule = moduleList.find(mod => mod.id === activeModule) || moduleList[0];

  const switchModule = (moduleId: UserOrgModule) => {
    setActiveModule(moduleId);
    onNavigatePage?.('user-org-management', moduleId);
  };

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-xl font-bold text-gray-800 tracking-tight whitespace-nowrap">用户与组织管理</h2>
        <p className="text-xs text-gray-400 mt-0.5 truncate" title={currentModule.desc}>
          {currentModule.desc}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden min-h-[680px] flex">
        <aside className="w-[168px] shrink-0 border-r border-slate-100 bg-slate-50/60 p-2.5 space-y-1">
          {moduleList.map(mod => {
            const isActive = activeModule === mod.id;
            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => switchModule(mod.id)}
                className={`w-full text-left whitespace-nowrap px-3 py-2.5 rounded-lg relative text-[13px] transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#F0F5FF] text-[#1E5ABB] font-bold'
                    : 'text-slate-600 font-medium hover:text-[#1E5ABB] hover:bg-white/80'
                }`}
              >
                {isActive && (
                  <span className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-[#1E5ABB] rounded-full" />
                )}
                <span className="pl-2">{mod.label}</span>
              </button>
            );
          })}
        </aside>

        <div className="flex-1 min-w-0">
          {activeModule === 'account' && <SystemAccountManagement shared={shared} />}
          {activeModule === 'org' && (
            <OrgManagement
              embedded
              shared={shared}
              orgList={orgList}
              onNavigate={onNavigatePage}
              onAddOrg={onAddOrg}
              onUpdateOrg={onUpdateOrg}
              onDeleteOrg={onDeleteOrg}
            />
          )}
          {activeModule === 'role' && <RolePermission embedded />}
          {activeModule === 'group' && <PersonnelGroupManagement shared={shared} />}
        </div>
      </div>
    </div>
  );
};
