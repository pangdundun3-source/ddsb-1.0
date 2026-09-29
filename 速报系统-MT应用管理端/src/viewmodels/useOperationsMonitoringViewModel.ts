import { useEffect, useMemo, useState } from 'react';
import {
  mockPlatformOrgTreeData,
  OrgTreeNode,
} from '../components/operations/monitoringData';

const STORAGE_KEY = 'admin_ops_selected_inst_id';

export const useOperationsMonitoringViewModel = () => {
  const [selectedInstId, setSelectedInstId] = useState<string | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved && saved !== 'null' ? saved : null;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, selectedInstId || 'null');
  }, [selectedInstId]);

  const selectedInstitution = useMemo(
    () =>
      selectedInstId
        ? mockPlatformOrgTreeData.find((institution) => institution.id === selectedInstId) || null
        : null,
    [selectedInstId]
  );

  const handleSelectInstitution = (institution: OrgTreeNode) => {
    setSelectedInstId(institution.id);
  };

  const handleBackToHub = () => setSelectedInstId(null);

  return {
    state: { selectedInstitution },
    actions: {
      handleSelectInstitution,
      handleBackToHub,
      handleSwitchInstitution: handleSelectInstitution,
    },
  };
};
