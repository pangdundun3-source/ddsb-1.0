import { useMemo, useState } from 'react';
import { mockPlatformOrgTreeData, OrgTreeNode } from '../components/operations/monitoringData';

type SortBy = 'todayReports' | 'personnel' | 'pending' | 'quota' | 'default';
type ViewMode = 'grid' | 'table';

export const usePlatformInstitutionsHubViewModel = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('ALL');
  const [selectedStatusType, setSelectedStatusType] = useState('ALL');
  const [selectedHealth, setSelectedHealth] = useState('ALL');
  const [sortBy, setSortBy] = useState<SortBy>('todayReports');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.setTimeout(() => setIsRefreshing(false), 500);
  };

  const platformStats = useMemo(() => {
    const stats = {
      totalInstitutions: mockPlatformOrgTreeData.length,
      officialCount: mockPlatformOrgTreeData.filter((item) => item.statusType === '正式').length,
      trialCount: mockPlatformOrgTreeData.filter((item) => item.statusType === '试用').length,
      totalSubBranches: 0,
      totalPersonnel: 0,
      activePersonnel: 0,
      totalQrLimit: 0,
      totalQrUsed: 0,
      totalTodayReports: 0,
      totalPendingReview: 0,
      totalReviewedToday: 0,
    };

    const countNodes = (nodes: OrgTreeNode[], isTop = true) => {
      nodes.forEach((node) => {
        if (!isTop) stats.totalSubBranches += 1;
        stats.totalPersonnel += node.totalPersonnel;
        stats.activePersonnel += node.activePersonnel;
        stats.totalQrLimit += node.qrLimit;
        stats.totalQrUsed += node.qrUsed;
        stats.totalTodayReports += node.todayReports;
        stats.totalPendingReview += node.pendingReview;
        stats.totalReviewedToday += node.reviewedToday;
        if (node.children?.length) countNodes(node.children, false);
      });
    };
    countNodes(mockPlatformOrgTreeData);

    return {
      ...stats,
      totalSubBranches: stats.totalSubBranches + 134,
      avgPassRate: 96.4,
      avgReviewSpeed: 11.6,
    };
  }, []);

  const industries = useMemo(
    () => Array.from(new Set(mockPlatformOrgTreeData.map((item) => item.industry))),
    []
  );

  const filteredInstitutions = useMemo(
    () =>
      mockPlatformOrgTreeData
        .filter((institution) => {
          const query = searchQuery.trim().toLowerCase();
          const matchesSearch =
            !query ||
            institution.name.toLowerCase().includes(query) ||
            institution.code.toLowerCase().includes(query) ||
            institution.leader.toLowerCase().includes(query) ||
            institution.region.toLowerCase().includes(query);
          return (
            matchesSearch &&
            (selectedIndustry === 'ALL' || institution.industry === selectedIndustry) &&
            (selectedStatusType === 'ALL' || institution.statusType === selectedStatusType) &&
            (selectedHealth === 'ALL' || institution.healthStatus === selectedHealth)
          );
        })
        .sort((left, right) => {
          if (sortBy === 'todayReports') return right.todayReports - left.todayReports;
          if (sortBy === 'personnel') return right.totalPersonnel - left.totalPersonnel;
          if (sortBy === 'pending') return right.pendingReview - left.pendingReview;
          if (sortBy === 'quota') return right.qrUsed / right.qrLimit - left.qrUsed / left.qrLimit;
          return 0;
        }),
    [searchQuery, selectedIndustry, selectedStatusType, selectedHealth, sortBy]
  );

  return {
    state: {
      searchQuery,
      selectedIndustry,
      selectedStatusType,
      selectedHealth,
      sortBy,
      viewMode,
      isRefreshing,
      platformStats,
      industries,
      filteredInstitutions,
    },
    actions: {
      setSearchQuery,
      setSelectedIndustry,
      setSelectedStatusType,
      setSelectedHealth,
      setSortBy,
      setViewMode,
      handleRefresh,
    },
  };
};
