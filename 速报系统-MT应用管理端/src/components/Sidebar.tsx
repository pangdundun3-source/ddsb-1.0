import React, { useState } from 'react';
import { ActiveTab, SystemSubModule } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  systemSubTab?: SystemSubModule;
  setSystemSubTab?: (subTab: SystemSubModule) => void;
}

interface SubItem {
  id: string;
  tab: ActiveTab;
  subTab?: SystemSubModule;
  label: string;
  icon: string;
}

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: string;
  subItems?: SubItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  systemSubTab = 'logs',
  setSystemSubTab,
}) => {
  const [isSystemOpen, setIsSystemOpen] = useState(true);

  const navItems: NavItem[] = [
    { id: 'home', label: '首页', icon: 'home' },
    { id: 'institutions', label: '机构管理', icon: 'corporate_fare' },
    {
      id: 'system',
      label: '系统管理',
      icon: 'dvr',
      subItems: [
        { id: 'config', tab: 'config', label: '全局业务配置', icon: 'groups' },
        { id: 'org_config', tab: 'org_config', label: '机构业务配置', icon: 'domain' },
      ],
    },
  ];

  const isItemActive = (item: NavItem) =>
    activeTab === item.id || Boolean(item.subItems?.some((sub) => sub.tab === activeTab));

  const isSubItemActive = (sub: SubItem) =>
    activeTab === sub.tab && (!sub.subTab || systemSubTab === sub.subTab);

  const handleSubItemClick = (sub: SubItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveTab(sub.tab);
    if (sub.subTab && setSystemSubTab) {
      setSystemSubTab(sub.subTab);
    }
  };

  const handleMainItemClick = (item: NavItem) => {
    if (item.subItems) {
      if (isItemActive(item)) {
        setIsSystemOpen(!isSystemOpen);
      } else {
        setIsSystemOpen(true);
        setActiveTab(item.subItems[0].tab);
      }
    } else {
      setActiveTab(item.id);
    }
  };

  return (
    <aside className="w-[213px] min-h-[calc(100vh-74px)] sticky top-[74px] flex flex-col bg-[#f0f5ff] relative z-20 sidebar-bg-pattern border-r border-blue-50 shrink-0 select-none">
      <nav className="flex-1 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = isItemActive(item);
          const hasSub = !!item.subItems;

          return (
            <div key={item.id} className="flex flex-col">
              <button
                onClick={() => handleMainItemClick(item)}
                className={`w-full flex items-center justify-between px-6 py-3 font-medium transition-colors cursor-pointer relative text-left ${
                  isActive
                    ? 'bg-[#e6f4ff] text-[#1890ff]'
                    : 'text-[#666666] hover:bg-[#e6f4ff] hover:text-[#1890ff]'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1890ff]"></div>
                )}
                <div className="flex items-center">
                  <span className="material-symbols-outlined text-[18px] mr-3">
                    {item.icon}
                  </span>
                  <span className="text-[14px]">{item.label}</span>
                </div>
                {hasSub && (
                  <span
                    className={`material-symbols-outlined text-[16px] transition-transform ${
                      isSystemOpen && isActive ? 'rotate-180' : ''
                    } text-gray-400`}
                  >
                    expand_more
                  </span>
                )}
              </button>

              {/* Sub-menu rendering if available */}
              {hasSub && isSystemOpen && (
                <div className="bg-[#e9f1fd]/60 py-1 space-y-0.5">
                  {item.subItems!.map((sub) => {
                    const isSubActive = isSubItemActive(sub);
                    return (
                      <button
                        key={sub.id}
                        onClick={(e) => handleSubItemClick(sub, e)}
                        className={`w-full flex items-center pl-12 pr-4 py-2 text-[13px] font-medium transition-colors cursor-pointer text-left ${
                          isSubActive
                            ? 'text-[#1890ff] font-bold bg-[#dbeafe]/80'
                            : 'text-[#666666] hover:text-[#1890ff] hover:bg-[#e6f4ff]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px] mr-2">
                          {sub.icon}
                        </span>
                        <span>{sub.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};
