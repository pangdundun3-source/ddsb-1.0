import React from 'react';
import { ReportItem } from '../types';
import { MatchedClusterPanel } from './MatchedClusterPanel';
import { AuditDecisionConsole } from './AuditDecisionConsole';

interface AuditActionBatchPanelProps {
  report: ReportItem;
  allCluster: ReportItem[];
  matchUrl: string;
  selectedBatchIds: number[];
  setSelectedBatchIds: React.Dispatch<React.SetStateAction<number[]>>;
  scoreMap: Record<number, number>;
  handleSetScore: (reportId: number, score: number) => void;
  identMap: Record<number, '首发' | '重复'>;
  handleSetIdent: (reportId: number, ident: '首发' | '重复') => void;
  selectedScore: number;
  toggleBatchSelect: (id: number) => void;
  handleSmartMatchDetermine: () => void;
  smartMatchNotice: string | null;
  setSmartMatchNotice: (val: string | null) => void;
  applyScorePreset: (preset: 'stepped' | 'all5' | 'all3') => void;
  handleOneClickApproveAll?: () => void;
  handleSubmitAudit: () => void;
  auditMode: 'pass' | 'reject';
  setAuditMode: (mode: 'pass' | 'reject') => void;
  rejectReason: string;
  setRejectReason: (reason: string) => void;
  rejectDetail: string;
  setRejectDetail: (detail: string) => void;
  onInspectReport: (report: ReportItem) => void;
}

export const AuditActionBatchPanel: React.FC<AuditActionBatchPanelProps> = ({
  report,
  allCluster,
  matchUrl,
  selectedBatchIds,
  setSelectedBatchIds,
  scoreMap,
  handleSetScore,
  identMap,
  handleSetIdent,
  selectedScore,
  toggleBatchSelect,
  handleSmartMatchDetermine,
  smartMatchNotice,
  setSmartMatchNotice,
  applyScorePreset,
  handleSubmitAudit,
  auditMode,
  setAuditMode,
  rejectReason,
  setRejectReason,
  rejectDetail,
  setRejectDetail,
  onInspectReport,
}) => {
  return (
    <div className="space-y-4">
      <MatchedClusterPanel
        report={report}
        allCluster={allCluster}
        matchUrl={matchUrl}
        selectedBatchIds={selectedBatchIds}
        setSelectedBatchIds={setSelectedBatchIds}
        scoreMap={scoreMap}
        handleSetScore={handleSetScore}
        identMap={identMap}
        handleSetIdent={handleSetIdent}
        selectedScore={selectedScore}
        toggleBatchSelect={toggleBatchSelect}
        handleSmartMatchDetermine={handleSmartMatchDetermine}
        smartMatchNotice={smartMatchNotice}
        setSmartMatchNotice={setSmartMatchNotice}
        applyScorePreset={applyScorePreset}
        onInspectReport={onInspectReport}
      />

      <AuditDecisionConsole
        report={report}
        allCluster={allCluster}
        selectedBatchIds={selectedBatchIds}
        scoreMap={scoreMap}
        identMap={identMap}
        auditMode={auditMode}
        setAuditMode={setAuditMode}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        rejectDetail={rejectDetail}
        setRejectDetail={setRejectDetail}
        handleSubmitAudit={handleSubmitAudit}
      />
    </div>
  );
};
