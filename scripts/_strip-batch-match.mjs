import fs from 'fs';

function stripPcOrClient(path) {
  let s = fs.readFileSync(path, 'utf8');

  s = s.replace(/\n  Layers,/g, '');
  s = s.replace(/\n  Zap,/g, '');
  s = s.replace(/\n  onBatchApprove\?: \(ids: number\[\], score\?: number\) => void;/g, '');
  s = s.replace(/\n  onBatchReject\?: \(ids: number\[\], reason: string, detail: string\) => void;/g, '');
  s = s.replace(/\n  onBatchApprove,\n  onBatchReject,/g, '');
  s = s.replace(/\n  const \[isBatchMatchActive, setIsBatchMatchActive\] = useState\(false\);/g, '');

  // Remove batch modal state block
  s = s.replace(
    /\n  \/\/ Modal States\n  const \[batchModalGroup, setBatchModalGroup\] = useState<\{ url: string; items: ReportItem\[\] \} \| null>\(null\);\n  const \[batchActionMode, setBatchActionMode\] = useState<'reject' \| 'pass'>\('reject'\);\n  const \[batchRejectReason, setBatchRejectReason\] = useState\('内容重复\/同源'\);\n  const \[batchRejectDetail, setBatchRejectDetail\] = useState\('属于相同来源链接\/同地址重复表达，要素存在遗漏，批量予以驳回。'\);\n  const \[batchScore, setBatchScore\] = useState\(5\);\n/g,
    '\n'
  );

  // Remove cluster calc + openBatchModal + handleExecuteBatchAudit, keep handleReset/pagination
  const clusterMarker = '  // Calculate URL Clusters for Batch Matching';
  const quickMarker = '  const handleExecuteQuickAudit = () => {';
  const clusterIdx = s.indexOf(clusterMarker);
  const quickIdx = s.indexOf(quickMarker);
  if (clusterIdx >= 0 && quickIdx > clusterIdx) {
    // Extract handleReset + pagination that sit between cluster and quick in original —
    // In both files order is: cluster...otherPending, handleReset, pagination, openBatch, handleExecuteBatch, handleExecuteQuick
    const between = s.slice(clusterIdx, quickIdx);
    const resetMatch = between.match(/  const handleReset = \(\) => \{[\s\S]*?\n  \};\n\n  \/\/ Pagination[\s\S]*?const pagedReports = filtered\.slice\([^)]+\);\n\n/);
    const replacement = resetMatch
      ? resetMatch[0]
          .replace(/\n    setIsBatchMatchActive\(false\);/, '')
          .replace(/, isBatchMatchActive/, '')
      : '';
    s = s.slice(0, clusterIdx) + replacement + s.slice(quickIdx);
  }

  // Header subtitle
  s = s.replace('集中处理审核待办、同源批量匹配及审核记录事项', '集中处理审核待办及审核记录事项');

  // KPI 同源待合审 line
  s = s.replace(
    /\n              <span className="text-\[11px\] text-blue-200">\n                同源待合审 <strong className="text-amber-300">\{matchedClusters\.reduce\(\(acc, c\) => acc \+ c\.items\.length, 0\)}<\/strong>\n              <\/span>/g,
    ''
  );

  // Tab click that clears batch
  s = s.replace(
    /onClick=\{\(\) => \{\n                      setActiveTab\(tab\.value\);\n                      if \(tab\.value === '已驳回'\) setIsBatchMatchActive\(false\);\n                    \}\}/g,
    'onClick={() => setActiveTab(tab.value)}'
  );

  // Remove batch match button block (two indent variants)
  s = s.replace(
    /\n            \{activeTab === '待审核' && \(\n              <button[\s\S]*?\{isBatchMatchActive \? '取消匹配' : '批量匹配'\}\n              <\/button>\n            \)\}/g,
    ''
  );

  // Replace cluster list branch with simple paged list
  s = s.replace(
    /\) : isBatchMatchActive && activeTab === '待审核' && matchedClusters\.length > 0 \? \(\n[\s\S]*?\) : \(\n\s*pagedReports\.map\(\(item, index\) => renderAuditRow\(item, \(safePage - 1\) \* pageSize \+ index \+ 1\)\)\n\s*\)\}/g,
    ') : (\n                  pagedReports.map((item, index) => renderAuditRow(item, (safePage - 1) * pageSize + index + 1))\n                )}'
  );

  // Simplify renderAuditRow matched param if still present
  s = s.replace(
    /const renderAuditRow = \(item: ReportItem, seq: number, matched = false\) => \{/,
    'const renderAuditRow = (item: ReportItem, seq: number) => {'
  );
  s = s.replace(
    /key=\{`\$\{matched \? 'cluster' : 'row'\}-\$\{item\.id\}`\} className=\{`px-5 py-3\.5 flex gap-3 transition-colors \$\{matched \? 'hover:bg-amber-50\/40' : 'hover:bg-gray-50\/70'\}`\}/,
    'key={`row-${item.id}`} className="px-5 py-3.5 flex gap-3 transition-colors hover:bg-gray-50/70"'
  );
  s = s.replace(
    /className=\{`w-6 shrink-0 text-center font-mono text-xs mt-0\.5 \$\{matched \? 'text-amber-700\/70' : 'text-gray-400'\}`\}/,
    'className="w-6 shrink-0 text-center font-mono text-xs mt-0.5 text-gray-400"'
  );
  s = s.replace(
    /\n              \{matched && <span className="text-\[#F26522\] font-semibold bg-amber-50 px-1\.5 py-px rounded">已匹配<\/span>\}/g,
    ''
  );

  // Remove batch modal JSX
  const modalStart = s.indexOf('      {/* 6. Batch Audit Modal');
  const modalEnd = s.indexOf('      {/* 7. URL Jump');
  if (modalStart >= 0 && modalEnd > modalStart) {
    s = s.slice(0, modalStart) + s.slice(modalEnd);
  }

  // Clean leftover refs
  if (s.includes('isBatchMatchActive') || s.includes('batchModalGroup') || s.includes('matchedClusters') || s.includes('openBatchModal')) {
    console.warn('leftover refs in', path);
    console.warn('isBatchMatchActive', s.includes('isBatchMatchActive'));
    console.warn('batchModalGroup', s.includes('batchModalGroup'));
    console.warn('matchedClusters', s.includes('matchedClusters'));
    console.warn('openBatchModal', s.includes('openBatchModal'));
  }

  fs.writeFileSync(path, s);
  console.log('updated', path);
}

stripPcOrClient('d:/王飞飞/codex项目集/速豹系统门户1.0/速报系统-v8审核上报PC/src/pages/ReportAudit.tsx');

// H5 AuditView — remove batch match button + groups + modal
{
  const path = 'd:/王飞飞/codex项目集/速豹系统门户1.0/速报系统-v8审核上报H5/src/components/AuditView.tsx';
  let s = fs.readFileSync(path, 'utf8');

  s = s.replace(/\n  const \[showBatchGroups, setShowBatchGroups\] = useState<boolean>\(false\);/, '');

  // Remove batch modal / sheet state
  s = s.replace(
    /\n  \/\/ Batch Audit Modal State\n  const \[batchModalData, setBatchModalData\] = useState<\{[\s\S]*?null>;\n  const \[linkPreviewData, setLinkPreviewData\] = useState<\{[\s\S]*?null>;\n\n  const \[batchSheetMode, setBatchSheetMode\] = useState<'approve' \| 'reject' \| null>\(null\);\n  const \[batchApproveRemarks, setBatchApproveRemarks\] = useState<string>\(''\);\n  const \[batchRejectCategory, setBatchRejectCategory\] = useState<string>\('内容重复\/同源'\);\n  const \[batchRejectDetail, setBatchRejectDetail\] = useState<string>\(\n    '属于相同来源链接\/同地址重复表达，要素存在遗漏，批量予以驳回。'\n  \);\n  const phoneScreen = typeof document !== 'undefined' \? document\.getElementById\('wechat-phone-screen'\) : null;\n  const batchModalPortalTarget = typeof document !== 'undefined' \? phoneScreen \?\? document\.body : null;\n/,
    '\n'
  );

  s = s.replace(/\n    setShowBatchGroups\(false\);/, '');
  s = s.replace(/setShowBatchGroups\(false\);\n                /g, '');

  // Remove grouping + handlers
  const groupStart = s.indexOf('  // Group current visible pending reports by matchedLink or address.');
  const statusStart = s.indexOf('  const getStatusBadge = (report: SpeedReport) => {');
  if (groupStart >= 0 && statusStart > groupStart) {
    s = s.slice(0, groupStart) + s.slice(statusStart);
  }

  const openBatch = s.indexOf('  const handleOpenBatchModal = ');
  const statusBadgeAgain = s.indexOf('  const getStatusBadge');
  // handlers after getStatusBadge
  const submitBatch = s.indexOf('  const handleSubmitBatchAudit = ');
  // find next function after handleSubmitBatchAudit ends - look for return (
  // Better: remove from handleOpenBatchModal through end of handleSubmitBatchAudit
  if (s.includes('  const handleOpenBatchModal = ')) {
    const a = s.indexOf('  const handleOpenBatchModal = ');
    // find next top-level const/function after handleSubmitBatchAudit body
    const afterSubmit = s.indexOf('  const handleSubmitBatchAudit = ');
    if (afterSubmit >= 0) {
      // find closing of handleSubmitBatchAudit - next line starting with `  const ` or `  return`
      const rest = s.slice(afterSubmit);
      const m = rest.match(/\n  (const |return |function )/);
      // skip first match which is handleSubmit itself... find end by brace counting
      let i = afterSubmit + '  const handleSubmitBatchAudit = '.length;
      // find first {
      while (i < s.length && s[i] !== '{') i++;
      let depth = 0;
      for (; i < s.length; i++) {
        if (s[i] === '{') depth++;
        else if (s[i] === '}') {
          depth--;
          if (depth === 0) {
            i++;
            break;
          }
        }
      }
      s = s.slice(0, a) + s.slice(i).replace(/^\n+/, '\n\n');
    }
  }

  // Remove batch match button in search row - replace the flex with search only
  s = s.replace(
    /\n        <button\n          type="button"\n          onClick=\{\(\) => \{\n            if \(showBatchGroups\) \{[\s\S]*?\{showBatchGroups \? '取消匹配' : '批量匹配'\}\n          <\/span>\n        <\/button>/,
    ''
  );

  // Remove showBatchGroups banner section
  s = s.replace(
    /\n      \{\/\* Same Address \/ Same Link Batch Approval Banner \*\/\}\n      \{showBatchGroups && multiReportGroups\.map\(\(\[key, group\], idx\) => \{[\s\S]*?\}\)\}\n/,
    '\n'
  );

  // Remove batch modal portal and keep link preview if any - remove both batch and link preview portals that depend on batchModalPortalTarget
  // Find `{batchModalData && batchModalPortalTarget && createPortal(`
  const batchPortal = s.indexOf('{batchModalData && batchModalPortalTarget && createPortal(');
  if (batchPortal >= 0) {
    // Find matching createPortal close - look for `, batchModalPortalTarget` after
    const marker = ',\n        batchModalPortalTarget\n      )}';
    const end1 = s.indexOf(marker, batchPortal);
    if (end1 >= 0) {
      s = s.slice(0, batchPortal) + s.slice(end1 + marker.length);
    }
  }

  // linkPreviewData portal also uses batchModalPortalTarget - remove if present
  const linkPortal = s.indexOf('{linkPreviewData && batchModalPortalTarget && createPortal(');
  if (linkPortal >= 0) {
    const marker = ',\n        batchModalPortalTarget\n      )}';
    const end1 = s.indexOf(marker, linkPortal);
    if (end1 >= 0) {
      s = s.slice(0, linkPortal) + s.slice(end1 + marker.length);
    }
  }

  // Clean search clear that referenced showBatchGroups
  s = s.replace(
    /onClick=\{\(\) => \{\n                setSearchQuery\(''\);\n                setShowBatchGroups\(false\);\n              \}\}/g,
    "onClick={() => setSearchQuery('')}"
  );

  if (
    s.includes('showBatchGroups') ||
    s.includes('batchModalData') ||
    s.includes('multiReportGroups') ||
    s.includes('handleOpenBatchModal')
  ) {
    console.warn('H5 leftovers:');
    console.warn('showBatchGroups', s.includes('showBatchGroups'));
    console.warn('batchModalData', s.includes('batchModalData'));
    console.warn('multiReportGroups', s.includes('multiReportGroups'));
    console.warn('handleOpenBatchModal', s.includes('handleOpenBatchModal'));
    console.warn('batchModalPortalTarget', s.includes('batchModalPortalTarget'));
    console.warn('linkPreviewData', s.includes('linkPreviewData'));
  }

  fs.writeFileSync(path, s);
  console.log('updated', path);
}
