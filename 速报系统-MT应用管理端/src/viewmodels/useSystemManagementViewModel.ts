import { useEffect, useState } from 'react';
import { SystemSubModule } from '../types';
import { adminShellStorage } from '../services/adminShellStorage';

export const useSystemManagementViewModel = (initialSubTab?: SystemSubModule) => {
  const [activeSubTab, setActiveSubTab] = useState<SystemSubModule>(() => {
    const tab = initialSubTab || adminShellStorage.readSystemSubTab();
    return tab === 'accounts' ? 'logs' : tab;
  });

  useEffect(() => {
    if (initialSubTab && initialSubTab !== activeSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [activeSubTab, initialSubTab]);

  const handleSwitchTab = (tab: SystemSubModule) => {
    setActiveSubTab(tab);
    adminShellStorage.saveSystemSubTab(tab);
  };

  return {
    state: { activeSubTab },
    actions: { handleSwitchTab },
  };
};
