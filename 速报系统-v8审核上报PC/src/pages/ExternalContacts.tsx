import React, { useEffect, useState } from 'react';
import type { PageId } from '../types';
import { ExternalOrgManagement } from './ExternalOrgManagement';
import { InviteRecords } from './InviteRecords';
import { PersonnelGroupManagement } from './PersonnelGroupManagement';
import { RolePermission } from './RolePermission';
import { SystemAccountManagement } from './SystemAccountManagement';
import {
  HOME_ORG_ID,
  parseExternalContactsModule,
  useHomeOrgScopedSharedState,
  type ExternalContactsModule
} from '../data/userOrgShared';

interface ExternalContactsProps {
  initialModule?: string;
  onNavigatePage?: (page: PageId, extraModule?: string) => void;
}

/** 与客户管理端「外部联系人」左侧顺序一致 */
const moduleList: Array<{ id: ExternalContactsModule; label: string }> = [
  { id: 'account', label: '用户管理' },
  { id: 'org', label: '组织节点管理' },
  { id: 'role', label: '角色管理' },
  { id: 'group', label: '用户群组管理' },
  { id: 'invite', label: '激活码管理' }
];

const moduleDesc: Record<ExternalContactsModule, string> = {
  account: '管理本机构节点下的用户账号、角色与关注状态',
  org: '维护本机构组织节点与组内成员',
  role: '查看审核上报端角色与功能权限（系统默认角色不可修改）',
  group: '查看本机构用户群组，支持人员入组与修改分组',
  invite: '集中查看已发放的邀请凭证，按待激活、已激活、已失效分类管理'
};

export const ExternalContacts: React.FC<ExternalContactsProps> = ({
  initialModule,
  onNavigatePage
}) => {
  const shared = useHomeOrgScopedSharedState(HOME_ORG_ID);
  const [activeModule, setActiveModule] = useState<ExternalContactsModule>(
    parseExternalContactsModule(initialModule)
  );

  useEffect(() => {
    if (initialModule) setActiveModule(parseExternalContactsModule(initialModule));
  }, [initialModule]);

  const switchModule = (moduleId: ExternalContactsModule) => {
    setActiveModule(moduleId);
    onNavigatePage?.('external-contacts', moduleId);
  };

  const desc = moduleDesc[activeModule];

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-xl font-bold text-gray-800 tracking-tight whitespace-nowrap">组织管理</h2>
        <p className="text-xs text-gray-400 mt-0.5 truncate" title={desc}>
          {desc}
        </p>
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
              onOpenInviteRecords={() => switchModule('invite')}
            />
          ) : (
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden min-h-[680px]">
              {activeModule === 'org' && (
                <ExternalOrgManagement embedded shared={shared} onNavigate={onNavigatePage} leaderViewOnly />
              )}
              {activeModule === 'role' && <RolePermission embedded />}
              {activeModule === 'group' && <PersonnelGroupManagement shared={shared} previewOnly />}
              {activeModule === 'invite' && <InviteRecords shared={shared} />}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
