import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import {
  OrgTreeNode,
  mockPlatformOrgTreeData,
} from './monitoringData';
import { useSingleInstitutionMonitoringViewModel } from '../../viewmodels/useSingleInstitutionMonitoringViewModel';

interface SingleInstitutionMonitoringProps {
  institution: OrgTreeNode;
  onBackToHub: () => void;
  onSwitchInstitution: (inst: OrgTreeNode) => void;
}

export const SingleInstitutionMonitoring: React.FC<SingleInstitutionMonitoringProps> = ({
  institution,
  onBackToHub,
  onSwitchInstitution,
}) => {
  const { state, actions } = useSingleInstitutionMonitoringViewModel(institution);
  const {
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
  } = state;
  const {
    setSelectedSubNodeId,
    setTreeSearchQuery,
    setActiveTab,
    setTimeRange,
    setPersonnelSearch,
    setEventCategoryFilter,
    setEventStatusFilter,
    handleRefresh,
    toggleTreeNode,
  } = actions;

  // ECharts: Hourly Trend Option
  const hourlyTrendChartOption = useMemo(() => {
    const multiplier = activeNode.todayReports > 100 ? 1 : 0.6;
    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderColor: '#e2e8f0',
        textStyle: { color: '#1e293b', fontSize: 12 },
      },
      legend: {
        data: ['上报事件量', '审核办结量', '待审堆积峰值'],
        top: '2%',
        right: '2%',
        icon: 'roundRect',
        textStyle: { color: '#64748b', fontSize: 11 },
      },
      grid: {
        left: '2%',
        right: '3%',
        bottom: '4%',
        top: '18%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
        axisLine: { lineStyle: { color: '#cbd5e1' } },
        axisLabel: { color: '#64748b', fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        name: '件数 (件)',
        nameTextStyle: { color: '#94a3b8', fontSize: 10 },
        splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } },
        axisLabel: { color: '#64748b', fontSize: 11 },
      },
      series: [
        {
          name: '上报事件量',
          type: 'line',
          smooth: true,
          showSymbol: false,
          data: [42, 18, 95, 340, 480, 520, 410, 260].map((v) => Math.round(v * multiplier)),
          itemStyle: { color: '#3b82f6' },
          lineStyle: { width: 3 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(59, 130, 246, 0.35)' },
                { offset: 1, color: 'rgba(59, 130, 246, 0.01)' },
              ],
            },
          },
        },
        {
          name: '审核办结量',
          type: 'line',
          smooth: true,
          showSymbol: false,
          data: [38, 16, 88, 310, 450, 495, 390, 245].map((v) => Math.round(v * multiplier)),
          itemStyle: { color: '#10b981' },
          lineStyle: { width: 3 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
                { offset: 1, color: 'rgba(16, 185, 129, 0.01)' },
              ],
            },
          },
        },
        {
          name: '待审堆积峰值',
          type: 'line',
          smooth: true,
          showSymbol: false,
          data: [4, 2, 7, 30, 30, 25, 20, 15].map((v) => Math.round(v * multiplier)),
          itemStyle: { color: '#f59e0b' },
          lineStyle: { width: 2, type: 'dashed' },
        },
      ],
    };
  }, [activeNode]);

  // ECharts: Report Categories Breakdown
  const categoryPieChartOption = useMemo(() => {
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} 件 ({d}%)',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderColor: '#e2e8f0',
        textStyle: { color: '#1e293b', fontSize: 12 },
      },
      legend: {
        orient: 'vertical',
        right: '2%',
        top: 'center',
        icon: 'circle',
        itemWidth: 8,
        itemHeight: 8,
        textStyle: { color: '#64748b', fontSize: 11 },
      },
      series: [
        {
          name: '事件分类占比',
          type: 'pie',
          radius: ['45%', '72%'],
          center: ['40%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 6,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: { show: false },
          emphasis: {
            label: {
              show: true,
              fontSize: 12,
              fontWeight: 'bold',
              formatter: '{b}\n{d}%',
            },
          },
          data: [
            { value: 45, name: '政务发布', itemStyle: { color: '#3b82f6' } },
            { value: 32, name: '舆情快报', itemStyle: { color: '#6366f1' } },
            { value: 28, name: '网格巡查', itemStyle: { color: '#10b981' } },
            { value: 18, name: '应急速报', itemStyle: { color: '#f59e0b' } },
            { value: 12, name: '不良举报', itemStyle: { color: '#ef4444' } },
            { value: 7, name: '重大事件', itemStyle: { color: '#8b5cf6' } },
          ],
        },
      ],
    };
  }, []);

  // ECharts: Sub-branches Contribution Chart
  const subBranchesRankingOption = useMemo(() => {
    const branches = flatSubBranches.slice(0, 5);
    if (branches.length === 0) {
      branches.push(institution);
    }
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderColor: '#e2e8f0',
        textStyle: { color: '#1e293b', fontSize: 12 },
      },
      grid: {
        left: '3%',
        right: '5%',
        top: '6%',
        bottom: '6%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } },
        axisLabel: { color: '#64748b', fontSize: 11 },
      },
      yAxis: {
        type: 'category',
        data: branches.map((b) => (b.name.length > 8 ? b.name.slice(0, 8) + '...' : b.name)).reverse(),
        axisLine: { lineStyle: { color: '#cbd5e1' } },
        axisLabel: { color: '#475569', fontSize: 11 },
      },
      series: [
        {
          name: '今日上报量',
          type: 'bar',
          barWidth: 12,
          data: branches.map((b) => b.todayReports).reverse(),
          itemStyle: { color: '#3b82f6', borderRadius: [0, 4, 4, 0] },
        },
        {
          name: '办结量',
          type: 'bar',
          barWidth: 12,
          data: branches.map((b) => b.reviewedToday).reverse(),
          itemStyle: { color: '#10b981', borderRadius: [0, 4, 4, 0] },
        },
      ],
    };
  }, [flatSubBranches, institution]);

  // Render Recursive Tree Nodes
  const renderSubTreeNode = (node: OrgTreeNode, depth = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = !!treeExpandedKeys[node.id];
    const isSelected = selectedSubNodeId === node.id;

    return (
      <div key={node.id} className="select-none">
        <div
          onClick={() => setSelectedSubNodeId(node.id)}
          className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all cursor-pointer ${
            isSelected
              ? 'bg-blue-50 text-blue-800 font-semibold border border-blue-200/80 shadow-2xs'
              : 'hover:bg-gray-100/80 text-gray-700'
          }`}
          style={{ paddingLeft: `${depth * 14 + 10}px` }}
        >
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {hasChildren ? (
              <button
                type="button"
                onClick={(e) => toggleTreeNode(node.id, e)}
                className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-700 shrink-0 cursor-pointer"
              >
                <svg
                  className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90 text-blue-600' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <span className="w-4 shrink-0 text-gray-300 text-center">•</span>
            )}

            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                node.healthStatus === 'healthy'
                  ? 'bg-emerald-500'
                  : node.healthStatus === 'busy'
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
            />

            <span className="truncate text-xs font-medium" title={node.name}>
              {node.name}
            </span>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-0.5 mt-0.5">
            {node.children!.map((child) => renderSubTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ========================================== */}
      {/* Top Header: Breadcrumb & Switcher */}
      {/* ========================================== */}
      <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            {/* Breadcrumb & Return Button */}
            <div className="flex items-center gap-2 flex-wrap text-xs text-gray-500">
              <button
                id="back_to_hub_btn"
                onClick={onBackToHub}
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>返回全平台机构列表</span>
              </button>
              <span>/</span>
              <span className="text-gray-400">全平台机构监控大厅</span>
              <span>/</span>
              <span className="font-semibold text-gray-800">{institution.name}</span>
            </div>

            {/* Title & Badges */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                {institution.name}
              </h1>
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                {institution.industry}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-xs font-bold ${
                  institution.statusType === '正式'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {institution.statusType}版
              </span>
            </div>

            {/* Leader & Region */}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>地域：{institution.region}</span>
              <span>·</span>
              <span>负责人：{institution.leader} ({institution.leaderPhone})</span>
              <span>·</span>
              <span className="text-gray-400">正在实时监控该机构及下辖分支</span>
            </div>
          </div>

          {/* Institution Switcher & Time Filter */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Quick Switch Dropdown */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="quick_inst_switcher" className="text-xs text-gray-400">切换机构：</label>
              <select
                id="quick_inst_switcher"
                value={institution.id}
                onChange={(e) => {
                  const target = mockPlatformOrgTreeData.find((i) => i.id === e.target.value);
                  if (target) onSwitchInstitution(target);
                }}
                className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer max-w-[200px] truncate"
              >
                {mockPlatformOrgTreeData.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Range Pills */}
            <div className="flex items-center bg-gray-100 p-0.5 rounded-xl border border-gray-200/80">
              {[
                { id: 'today', label: '今日实时' },
                { id: '7days', label: '近7天' },
                { id: '30days', label: '近30天' },
                { id: 'quarter', label: '本季度' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTimeRange(t.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    timeRange === t.id
                      ? 'bg-white text-blue-600 shadow-2xs font-bold'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleRefresh}
              className="p-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-600 transition-all cursor-pointer"
              title="刷新实时数据"
            >
              <svg
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 6 Metric KPI Cards for Selected Node */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 mt-4 border-t border-gray-100">
          <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/60">
            <div className="text-[11px] font-medium text-blue-800">下辖子分支 / 网格</div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-bold font-mono text-blue-900">
                {activeNodeStats.subBranchesCount}
              </span>
              <span className="text-[10px] text-blue-700">个</span>
            </div>
            <div className="text-[10px] text-blue-600/80 mt-0.5">
              {activeNodeStats.isRoot ? '本机构全部分支' : '当前节点子集'}
            </div>
          </div>

          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/60">
            <div className="text-[11px] font-medium text-indigo-800">在岗采编/审核人员</div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-bold font-mono text-indigo-900">
                {activeNodeStats.totalPersonnel}
              </span>
              <span className="text-[10px] text-indigo-700">人</span>
            </div>
            <div className="text-[10px] text-indigo-600/80 mt-0.5">
              活跃 {activeNodeStats.activePersonnel} 人 (
              {Math.round((activeNodeStats.activePersonnel / activeNodeStats.totalPersonnel) * 100)}%)
            </div>
          </div>

          <div className="p-3 bg-violet-50/50 rounded-xl border border-violet-100/60">
            <div className="text-[11px] font-medium text-violet-800">激活码配额使用</div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-bold font-mono text-violet-900">
                {activeNodeStats.qrUsed}
              </span>
              <span className="text-[10px] text-violet-700">/ {activeNodeStats.qrLimit}</span>
            </div>
            <div className="text-[10px] text-violet-600/80 mt-0.5">
              使用率 {Math.round((activeNodeStats.qrUsed / activeNodeStats.qrLimit) * 100)}%
            </div>
          </div>

          <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/60">
            <div className="text-[11px] font-medium text-emerald-800">今日上报事件量</div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-bold font-mono text-emerald-900">
                {activeNodeStats.todayReports}
              </span>
              <span className="text-[10px] text-emerald-700">件</span>
            </div>
            <div className="text-[10px] text-emerald-600/80 mt-0.5">
              已办结 {activeNodeStats.reviewedToday} 件
            </div>
          </div>

          <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100/60">
            <div className="text-[11px] font-medium text-amber-800">待审核/流转工单</div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-bold font-mono text-amber-900">
                {activeNodeStats.pendingReview}
              </span>
              <span className="text-[10px] text-amber-700">件</span>
            </div>
            <div className="text-[10px] text-amber-600/80 mt-0.5">
              初审/终审进行中
            </div>
          </div>

          <div className="p-3 bg-cyan-50/50 rounded-xl border border-cyan-100/60">
            <div className="text-[11px] font-medium text-cyan-800">审核通过率与时效</div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-bold font-mono text-cyan-900">
                {activeNodeStats.passRate}%
              </span>
            </div>
            <div className="text-[10px] text-cyan-600/80 mt-0.5">
              平均 {activeNodeStats.avgReviewMinutes} 分钟办结
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* Main Content Layout: Tree (Left) + Tabs (Right) */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Organization Tree */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200/90 p-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-blue-600 rounded-full" />
                <h2 className="text-xs font-bold text-gray-900">下属组织架构与网格树</h2>
              </div>
              <button
                onClick={() => setSelectedSubNodeId('ROOT')}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
              >
                重置查看全机构
              </button>
            </div>

            {/* Tree Search */}
            <div className="mt-3 relative">
              <input
                type="text"
                value={treeSearchQuery}
                onChange={(e) => setTreeSearchQuery(e.target.value)}
                placeholder="搜索科室/网格站点..."
                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <svg
                className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Tree Nodes List */}
            <div className="mt-3 space-y-1 max-h-[360px] overflow-y-auto pr-1">
              {renderSubTreeNode(institution, 0)}
            </div>

            <div className="pt-3 mt-3 border-t border-gray-100 text-[11px] text-gray-400 flex items-center justify-between">
              <span>点击树节点可在右侧下钻查看</span>
              <span className="font-mono text-blue-600 truncate max-w-[120px]" title={activeNodeStats.scopeName}>
                {activeNodeStats.scopeName}
              </span>
            </div>
          </div>

          {/* Personnel & Role Tags Card */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-indigo-600 rounded-full" />
                <h3 className="text-xs font-bold text-gray-900">下辖在岗人员与角色标签</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700">
                {relevantPersonnel.length} 人在岗
              </span>
            </div>

            <div className="text-[11px] text-gray-500 flex items-center justify-between">
              <span className="text-gray-400">当前归属：</span>
              <span className="font-semibold text-gray-800 truncate max-w-[180px]" title={activeNode.name}>
                {activeNode.name}
              </span>
            </div>

            {/* Quick Personnel Search */}
            <div className="relative">
              <input
                type="text"
                value={personnelSearch}
                onChange={(e) => setPersonnelSearch(e.target.value)}
                placeholder="搜索姓名、角色、电话..."
                className="w-full pl-7 pr-3 py-1.2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <svg
                className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Personnel Cards Scrollable List */}
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {relevantPersonnel.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  暂无匹配的人员信息
                </div>
              ) : (
                relevantPersonnel.map((p) => {
                  const roleStyle =
                    p.role.includes('负责人') || p.role.includes('主任') || p.role.includes('主管')
                      ? 'bg-purple-50 text-purple-700 border-purple-200/60'
                      : p.role.includes('终审') || p.role.includes('初审') || p.role.includes('审核')
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                      : p.role.includes('采编') || p.role.includes('记者')
                      ? 'bg-blue-50 text-blue-700 border-blue-200/60'
                      : p.role.includes('舆情') || p.role.includes('分析')
                      ? 'bg-amber-50 text-amber-700 border-amber-200/60'
                      : p.role.includes('网格')
                      ? 'bg-rose-50 text-rose-700 border-rose-200/60'
                      : 'bg-cyan-50 text-cyan-700 border-cyan-200/60';

                  return (
                    <div
                      key={p.id}
                      className="p-2.5 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-indigo-100 hover:shadow-2xs transition-all space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${p.avatarColor}`}>
                            {p.name.slice(0, 1)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-gray-900">{p.name}</span>
                              <span className={`px-1.5 py-0.2 rounded text-[10px] font-medium border ${roleStyle}`}>
                                {p.role}
                              </span>
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono">{p.phone}</div>
                          </div>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                            p.status === 'online'
                              ? 'bg-emerald-50 text-emerald-700'
                              : p.status === 'busy'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          <span
                            className={`w-1 h-1 rounded-full ${
                              p.status === 'online'
                                ? 'bg-emerald-500'
                                : p.status === 'busy'
                                ? 'bg-amber-500'
                                : 'bg-gray-400'
                            }`}
                          />
                          {p.status === 'online' ? '在线' : p.status === 'busy' ? '审核中' : '离线'}
                        </span>
                      </div>

                      <div className="text-[10px] text-gray-500 truncate" title={p.subBranchName}>
                        归属：{p.subBranchName}
                      </div>

                      <div className="grid grid-cols-3 gap-1 pt-1 border-t border-gray-100 text-[10px] text-center">
                        <div className="bg-white rounded py-0.5 px-1 border border-gray-100">
                          <span className="text-gray-400 text-[9px]">今日上报 </span>
                          <span className="font-mono font-bold text-blue-600">{p.todayReports}</span>
                        </div>
                        <div className="bg-white rounded py-0.5 px-1 border border-gray-100">
                          <span className="text-gray-400 text-[9px]">审核 </span>
                          <span className="font-mono font-bold text-emerald-600">{p.todayReviewed}</span>
                        </div>
                        <div className="bg-white rounded py-0.5 px-1 border border-gray-100">
                          <span className="text-gray-400 text-[9px]">通过率 </span>
                          <span className="font-mono font-bold text-gray-800">{p.passRate}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Unified Overview & Sub-branches Matrix */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-4">
          {/* Top: 24h Trend Chart */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-blue-600 rounded-full" />
                <h3 className="text-sm font-bold text-gray-900">
                  今日 24 小时事件上报、审核办结与待审峰值时序图
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">
                  当前下钻：<strong className="text-gray-800">{activeNode.name}</strong>
                </span>
                <span className="w-px h-3 bg-gray-200" />
                <span className="text-xs text-blue-600 font-medium">实时刷新</span>
              </div>
            </div>
            <div className="h-[280px]">
              <ReactECharts
                option={hourlyTrendChartOption}
                style={{ height: '100%', width: '100%' }}
                opts={{ renderer: 'svg' }}
              />
            </div>
          </div>

          {/* Bottom: Sub-branches & Grids Matrix */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-blue-600 rounded-full" />
                <h3 className="text-sm font-bold text-gray-900">
                  下辖子级机构与基层网格运行指标矩阵
                </h3>
              </div>
              <span className="text-xs text-gray-400">共 {flatSubBranches.length} 个子级节点</span>
            </div>

            <div className="border border-gray-200/80 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold select-none">
                    <tr>
                      <th className="py-3 px-4">子机构/网格名称</th>
                      <th className="py-3 px-4">行业/属性</th>
                      <th className="py-3 px-4">主管责任人</th>
                      <th className="py-3 px-4 text-center">在岗人员 / 激活码配额</th>
                      <th className="py-3 px-4 text-center">今日上报</th>
                      <th className="py-3 px-4 text-center">待审积压</th>
                      <th className="py-3 px-4 text-center">审核通过率</th>
                      <th className="py-3 px-4 text-center">平均时效</th>
                      <th className="py-3 px-4 text-right">健康评级</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {flatSubBranches.map((sub) => {
                      const isRowSelected = selectedSubNodeId === sub.id;
                      return (
                        <tr
                          key={sub.id}
                          onClick={() => setSelectedSubNodeId(sub.id)}
                          className={`transition-colors cursor-pointer ${
                            isRowSelected
                              ? 'bg-blue-50/80 font-medium'
                              : 'hover:bg-blue-50/30'
                          }`}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {isRowSelected && (
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                              )}
                              <div>
                                <div className={`font-bold ${isRowSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                                  {sub.name}
                                </div>
                                <div className="text-[10px] text-gray-400 font-mono">
                                  {sub.code} · {sub.region}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[11px]">
                              {sub.industry}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-800">{sub.leader}</div>
                            <div className="text-[10px] text-gray-400 font-mono">
                              {sub.leaderPhone}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center font-mono">
                            <span className="font-bold text-gray-900">{sub.totalPersonnel}</span>
                            <span className="text-gray-400 text-[11px]"> / {sub.qrLimit} 码</span>
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-blue-600">
                            {sub.todayReports} 件
                          </td>
                          <td className="py-3 px-4 text-center font-mono">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                                sub.pendingReview > 3
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {sub.pendingReview} 件
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-emerald-600">
                            {sub.passRate}%
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-gray-600">
                            {sub.avgReviewMinutes} 分钟
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                sub.healthStatus === 'healthy'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : sub.healthStatus === 'busy'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  sub.healthStatus === 'healthy'
                                    ? 'bg-emerald-500'
                                    : sub.healthStatus === 'busy'
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                              />
                              {sub.healthStatus === 'healthy'
                                ? '优良运行'
                                : sub.healthStatus === 'busy'
                                ? '待审较多'
                                : '预警关注'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
