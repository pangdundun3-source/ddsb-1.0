import React from 'react';
import { PlatformInstitutionsHub } from './operations/PlatformInstitutionsHub';
import { SingleInstitutionMonitoring } from './operations/SingleInstitutionMonitoring';
import { useOperationsMonitoringViewModel } from '../viewmodels/useOperationsMonitoringViewModel';

export const OperationsMonitoring: React.FC = () => {
  const { state, actions } = useOperationsMonitoringViewModel();
  const { selectedInstitution } = state;
  const { handleSelectInstitution, handleBackToHub, handleSwitchInstitution } = actions;

  return (
    <div className="space-y-6">
      {selectedInstitution ? (
        <SingleInstitutionMonitoring
          institution={selectedInstitution}
          onBackToHub={handleBackToHub}
          onSwitchInstitution={handleSwitchInstitution}
        />
      ) : (
        <PlatformInstitutionsHub onSelectInstitution={handleSelectInstitution} />
      )}
    </div>
  );
};
