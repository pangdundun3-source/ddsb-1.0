import { useMemo, useState } from 'react';
import type { MouseEvent } from 'react';
import {
  mockPersonnelList,
  mockReportReviewEvents,
  OrgTreeNode,
} from '../components/operations/monitoringData';

type MonitoringTab = 'overview' | 'personnel' | 'pipeline' | 'matrix';
type TimeRange = 'today' | '7days' | '30days' | 'quarter';

export const useSingleInstitutionMonitoringViewModel = (institution: OrgTreeNode) => {
  const [selectedSubNodeId, setSelectedSubNodeId] = useState('ROOT');
  const [treeExpandedKeys, setTreeExpandedKeys] = useState<Record<string, boolean>>({
    [institution.id]: true,
    ...(institution.children?.reduce<Record<string, boolean>>(
      (expanded, child) => ({ ...expanded, [child.id]: true }),
      {}
    ) || {}),
  });
  const [treeSearchQuery, setTreeSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<MonitoringTab>('overview');
  const [timeRange, setTimeRange] = useState<TimeRange>('today');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [personnelSearch, setPersonnelSearch] = useState('');
  const [eventCategoryFilter, setEventCategoryFilter] = useState('ALL');
  const [eventStatusFilter, setEventStatusFilter] = useState('ALL');

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.setTimeout(() => setIsRefreshing(false), 500);
  };

  const toggleTreeNode = (id: string, event: MouseEvent) => {
    event.stopPropagation();
    setTreeExpandedKeys((previous) => ({ ...previous, [id]: !previous[id] }));
  };

  const activeNode = useMemo(() => {
    if (selectedSubNodeId === 'ROOT' || selectedSubNodeId === institution.id) {
      return institution;
    }

    const findNode = (nodes: OrgTreeNode[]): OrgTreeNode | null => {
      for (const node of nodes) {
        if (node.id === selectedSubNodeId) return node;
        if (node.children) {
          const found = findNode(node.children);
          if (found) return found;
        }
      }
      return null;
    };

    return findNode(institution.children || []) || institution;
  }, [institution, selectedSubNodeId]);

  const activeNodeStats = useMemo(() => {
    const countSubBranches = (node: OrgTreeNode): number =>
      (node.children || []).reduce(
        (count, child) => count + 1 + countSubBranches(child),
        0
      );

    return {
      scopeName: activeNode.name,
      isRoot: activeNode.id === institution.id,
      subBranchesCount: countSubBranches(activeNode),
      totalPersonnel: activeNode.totalPersonnel,
      activePersonnel: activeNode.activePersonnel,
      qrLimit: activeNode.qrLimit,
      qrUsed: activeNode.qrUsed,
      todayReports: activeNode.todayReports,
      totalReports: activeNode.totalReports,
      pendingReview: activeNode.pendingReview,
      reviewedToday: activeNode.reviewedToday,
      passRate: activeNode.passRate,
      avgReviewMinutes: activeNode.avgReviewMinutes,
    };
  }, [activeNode, institution]);

  const flatSubBranches = useMemo(() => {
    const branches: OrgTreeNode[] = [];
    const collect = (nodes?: OrgTreeNode[]) => {
      nodes?.forEach((node) => {
        branches.push(node);
        collect(node.children);
      });
    };
    collect(institution.children);
    return branches;
  }, [institution]);

  const relevantPersonnel = useMemo(() => {
    // 1. Filter by institution
    let list = mockPersonnelList.filter(
      (person) =>
        person.institutionId === institution.id ||
        person.institutionName === institution.name ||
        institution.name.includes(person.institutionName)
    );

    if (list.length === 0) {
      list = mockPersonnelList.filter((p) => p.institutionId === 'INST-13');
    }

    // 2. If a specific sub-branch / tree node is selected
    if (selectedSubNodeId !== 'ROOT' && selectedSubNodeId !== institution.id) {
      const nodeName = activeNode.name;
      const subFiltered = list.filter(
        (person) =>
          person.subBranchName.includes(nodeName) ||
          nodeName.includes(person.subBranchName) ||
          person.subBranchName.includes(activeNode.code)
      );

      if (subFiltered.length > 0) {
        list = subFiltered;
      } else {
        // Fallback default personnel for this activeNode
        list = [
          {
            id: `P-${activeNode.id}-01`,
            name: activeNode.leader || '责任主管',
            avatarColor: 'bg-blue-600',
            role: '节点负责人',
            institutionId: institution.id,
            institutionName: institution.name,
            subBranchName: activeNode.name,
            phone: activeNode.leaderPhone || '139****8820',
            todayReports: Math.max(2, Math.round(activeNode.todayReports * 0.3)),
            totalReports: Math.round(activeNode.totalReports * 0.3),
            todayReviewed: Math.round(activeNode.reviewedToday * 0.5),
            passRate: activeNode.passRate,
            avgResponseMins: activeNode.avgReviewMinutes,
            status: 'online',
            lastActive: '刚刚',
          },
          {
            id: `P-${activeNode.id}-02`,
            name: '专职采编员',
            avatarColor: 'bg-indigo-600',
            role: '首席采编员',
            institutionId: institution.id,
            institutionName: institution.name,
            subBranchName: activeNode.name,
            phone: '138****6632',
            todayReports: Math.max(4, Math.round(activeNode.todayReports * 0.5)),
            totalReports: Math.round(activeNode.totalReports * 0.5),
            todayReviewed: 0,
            passRate: 98.2,
            avgResponseMins: 5.5,
            status: 'online',
            lastActive: '2分钟前',
          },
          {
            id: `P-${activeNode.id}-03`,
            name: '网格速报员',
            avatarColor: 'bg-emerald-600',
            role: '专职网格员',
            institutionId: institution.id,
            institutionName: institution.name,
            subBranchName: activeNode.name,
            phone: '150****1123',
            todayReports: Math.max(3, Math.round(activeNode.todayReports * 0.2)),
            totalReports: Math.round(activeNode.totalReports * 0.2),
            todayReviewed: 0,
            passRate: 97.5,
            avgResponseMins: 6.8,
            status: 'busy',
            lastActive: '5分钟前',
          },
        ];
      }
    }

    const query = personnelSearch.trim().toLowerCase();
    if (!query) return list;
    return list.filter(
      (person) =>
        person.name.toLowerCase().includes(query) ||
        person.phone.toLowerCase().includes(query) ||
        person.subBranchName.toLowerCase().includes(query) ||
        person.role.toLowerCase().includes(query)
    );
  }, [institution, activeNode, selectedSubNodeId, personnelSearch]);

  const relevantEvents = useMemo(
    () =>
      mockReportReviewEvents.filter(
        (event) =>
          (eventCategoryFilter === 'ALL' || event.category === eventCategoryFilter) &&
          (eventStatusFilter === 'ALL' || event.status === eventStatusFilter)
      ),
    [eventCategoryFilter, eventStatusFilter]
  );

  return {
    state: {
      selectedSubNodeId,
      treeExpandedKeys,
      treeSearchQuery,
      activeTab,
      timeRange,
      isRefreshing,
      personnelSearch,
      eventCategoryFilter,
      eventStatusFilter,
      activeNode,
      activeNodeStats,
      flatSubBranches,
      relevantPersonnel,
      relevantEvents,
    },
    actions: {
      setSelectedSubNodeId,
      setTreeSearchQuery,
      setActiveTab,
      setTimeRange,
      setPersonnelSearch,
      setEventCategoryFilter,
      setEventStatusFilter,
      handleRefresh,
      toggleTreeNode,
    },
  };
};
