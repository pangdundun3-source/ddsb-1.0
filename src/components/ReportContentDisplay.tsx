import React from 'react';
import { Attachment, ReportItem } from '../types';
import { ReportDetailCard } from './ReportDetailCard';

interface ReportContentDisplayProps {
  report: ReportItem;
  allReports?: ReportItem[];
  matchUrl?: string;
  onPreviewAttachment?: (attachment: Attachment) => void;
}

export const ReportContentDisplay: React.FC<ReportContentDisplayProps> = ({
  report,
  allReports = [],
  matchUrl,
  onPreviewAttachment,
}) => {
  return (
    <ReportDetailCard
      report={report}
      allReports={allReports}
      matchUrl={matchUrl}
      onPreviewAttachment={onPreviewAttachment}
    />
  );
};
