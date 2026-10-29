import React, { useEffect, useState } from 'react';
import { PageId } from '../types';
import { OrgManagement } from './OrgManagement';
import { RolePermission } from './RolePermission';
import { SystemAccountManagement } from './SystemAccountManagement';
import { PersonnelGroupManagement } from './PersonnelGroupManagement';
import { InviteRecords } from './InviteRecords';
import {
  parseUserOrgModule,
  useUserOrgSharedState,
  type UserOrgModule
} from '../data/userOrgShared';

interface UserOrgManagementProps {
  initialModule?: UserOrgModule | string;
  onNavigatePage?: (page: PageId, extraModule?: string) => void;
  currentOrg?: string;
  orgList?: unknown;
  onAddOrg?: unknown;
  onUpdateOrg?: unknown;
  onDeleteOrg?: unknown;
}

const moduleList: Array<{ id: UserOrgModule; label: string; desc: string }> = [
  {
    id: 'account',
    label: '用户管理',
    desc: '统一管理用户信息、所属组织与角色配置。'
  },
  {
    id: 'org',
    label: '组织节点管理',
    desc: '维护协作组织的层级结构、负责人信息与组内成员，成员来自用户管理'
  },
  {
    id: 'role',
    label: '角色管理',
    desc: '统一管理角色信息与功能权限配置。'
  },
  {
    id: 'group',
    label: '用户群组管理',
    desc: '按业务专班管理用户群组，并从在册账号中选派成员'
  },
  {
    id: 'invite',
    label: '激活码管理',
    desc: '集中查看已发放的邀请码，按待激活、已激活、已失效分类管理，并支持查看凭证与失效释放名额'
  }
];

export const UserOrgManagement: React.FC<UserOrgManagementProps> = ({
  initialModule = 'account',
  onNavigatePage,
  currentOrg,
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

  const switchModule = (moduleId: UserOrgModule) => {
    setActiveModule(moduleId);
    onNavigatePage?.('user-org-management', moduleId);
  };
  const activeModuleMeta = moduleList.find((module) => module.id === activeModule) || moduleList[0];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-800 tracking-tight whitespace-nowrap">
          {activeModuleMeta.label}
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">{activeModuleMeta.desc}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 items-start">
        <aside className="w-full lg:w-[148px] shrink-0 sticky top-4">
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-2 space-y-1">
            {moduleList.map((mod) => {
              const isActive = activeModule === mod.id;
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => switchModule(mod.id)}
                  className={`w-full text-left pl-4 pr-2 py-2.5 rounded-lg relative flex items-center transition-all duration-150 cursor-pointer text-sm whitespace-nowrap ${
                    isActive
                      ? 'bg-[#F0F5FF] text-[#1E5ABB] font-bold'
                      : 'text-slate-700 font-normal hover:text-[#1E5ABB] hover:bg-slate-50'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-1.5 top-2 bottom-2 w-1 bg-[#1E5ABB] rounded-full" />
                  )}
                  <span>{mod.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="flex-1 min-w-0 w-full">
          {activeModule === 'account' ? (
            <SystemAccountManagement
              shared={shared}
              currentOrg={currentOrg}
              onOpenInviteRecords={() => switchModule('invite')}
            />
          ) : (
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden min-h-[620px]">
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
              {activeModule === 'invite' && <InviteRecords shared={shared} />}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
