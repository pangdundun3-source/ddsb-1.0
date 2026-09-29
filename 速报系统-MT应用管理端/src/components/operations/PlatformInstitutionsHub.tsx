import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Building2, Users, Send, Zap } from 'lucide-react';
import {
  OrgTreeNode,
  mockPlatformOrgTreeData,
} from './monitoringData';
import { usePlatformInstitutionsHubViewModel } from '../../viewmodels/usePlatformInstitutionsHubViewModel';

interface PlatformInstitutionsHubProps {
  onSelectInstitution: (institution: OrgTreeNode) => void;
}

export const PlatformInstitutionsHub: React.FC<PlatformInstitutionsHubProps> = ({
  onSelectInstitution,
}) => {
  const { state, actions } = usePlatformInstitutionsHubViewModel();
  const {
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
  } = state;
  const {
    setSearchQuery,
    setSelectedIndustry,
    setSelectedStatusType,
    setSelectedHealth,
    setSortBy,
    setViewMode,
    handleRefresh,
  } = actions;

  // ECharts Option: Top Institutions Activity & Review Volume
  const topInstitutionsChartOption = useMemo(() => {
    const top6 = [...mockPlatformOrgTreeData]
      .sort((a, b) => b.todayReports - a.todayReports)
      .slice(0, 6);

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderColor: '#e2e8f0',
        textStyle: { color: '#1e293b', fontSize: 12 },
      },
      legend: {
        data: ['今日上报量', '今日审核办结', '待审核堆积'],
        right: '2%',
        top: '2%',
        icon: 'roundRect',
        textStyle: { color: '#64748b', fontSize: 11 },
      },
      grid: {
        left: '2%',
        right: '3%',
        top: '16%',
        bottom: '6%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: top6.map((i) => (i.name.length > 8 ? i.name.slice(0, 8) + '...' : i.name)),
        axisLine: { lineStyle: { color: '#cbd5e1' } },
        axisLabel: { color: '#475569', fontSize: 11, interval: 0 },
      },
      yAxis: {
        type: 'value',
        name: '数量 (件)',
        nameTextStyle: { color: '#94a3b8', fontSize: 10 },
        splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } },
        axisLabel: { color: '#64748b', fontSize: 11 },
      },
      series: [
        {
          name: '今日上报量',
          type: 'bar',
          barWidth: 14,
          data: top6.map((i) => i.todayReports),
          itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] },
        },
        {
          name: '今日审核办结',
          type: 'bar',
          barWidth: 14,
          data: top6.map((i) => i.reviewedToday),
          itemStyle: { color: '#10b981', borderRadius: [4, 4, 0, 0] },
        },
        {
          name: '待审核堆积',
          type: 'bar',
          barWidth: 14,
          data: top6.map((i) => i.pendingReview),
          itemStyle: { color: '#f59e0b', borderRadius: [4, 4, 0, 0] },
        },
      ],
    };
  }, []);

  // ECharts Option: Industry Distribution
  const industryDistributionChartOption = useMemo(() => {
    const industryCounts: Record<string, number> = {};
    mockPlatformOrgTreeData.forEach((i) => {
      industryCounts[i.industry] = (industryCounts[i.industry] || 0) + i.todayReports;
    });

    const data = Object.entries(industryCounts).map(([name, value]) => ({
      name,
      value,
    }));

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
          name: '行业上报分布',
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
          data,
        },
      ],
    };
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* ========================================== */}
      {/* Header Banner: Title & Global Actions */}
      {/* ========================================== */}
      <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              全网运行总枢纽
            </span>
            <span className="text-xs text-gray-400">· 实时数据监控</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            全平台机构运营监控中心
          </h1>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
          <button
            id="refresh_platform_ops_btn"
            onClick={handleRefresh}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-xs font-medium transition-all shadow-2xs active:scale-95 cursor-pointer"
          >
            <svg
              className={`w-3.5 h-3.5 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`}
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
            <span>{isRefreshing ? '刷新中...' : '刷新数据'}</span>
          </button>
        </div>
      </div>

      {/* ========================================== */}
      {/* 4 Global Statistical Cards */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: 全网签约接入机构 */}
        <div className="bg-white rounded-xl border border-gray-200/90 p-5 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">全网签约接入机构</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1890ff] flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5 mb-5">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-gray-900">28</span>
              <span className="text-xs text-gray-500 font-medium">家客户机构</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3.5 border-t border-gray-100 text-xs text-gray-500">
            <div>
              正式 <span className="font-bold text-gray-900 ml-0.5">21 家</span>
            </div>
            <div className="w-px h-3 bg-gray-200" />
            <div>
              试用 <span className="font-bold text-gray-900 ml-0.5">7 家</span>
            </div>
          </div>
        </div>

        {/* Card 2: 全网在岗人员 */}
        <div className="bg-white rounded-xl border border-gray-200/90 p-5 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">全网在岗人员</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5 mb-5">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-gray-900">610</span>
              <span className="text-xs text-gray-500 font-medium">人 (今日活跃 433)</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3.5 border-t border-gray-100 text-xs text-gray-500">
            <div>
              全网活跃度 <span className="font-bold text-emerald-600 ml-0.5">71.0%</span>
            </div>
            <div className="w-px h-3 bg-gray-200" />
            <div>
              较上期环比 <span className="font-bold text-emerald-600 ml-0.5">+8.6%</span>
            </div>
          </div>
        </div>

        {/* Card 3: 今日全网报送流通量 */}
        <div className="bg-white rounded-xl border border-gray-200/90 p-5 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">今日全网报送流通量</span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Send className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5 mb-5">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-gray-900">1226</span>
              <span className="text-xs text-gray-500 font-medium">件 (已采纳 1028)</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3.5 border-t border-gray-100 text-xs text-gray-500">
            <div>
              待审积压 <span className="font-bold text-amber-600 ml-0.5">67 件</span>
            </div>
            <div className="w-px h-3 bg-gray-200" />
            <div>
              人均报送 <span className="font-bold text-[#1890ff] ml-0.5">2.0 件</span>
            </div>
          </div>
        </div>

        {/* Card 4: 全网激活码使用率 */}
        <div className="bg-white rounded-xl border border-gray-200/90 p-5 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">全网激活码使用率</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5 mb-5">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-gray-900">58.8%</span>
              <span className="text-xs text-gray-500 font-medium">(224,720 / 382,000)</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3.5 border-t border-gray-100 text-xs text-gray-500">
            <div>
              已激活账号 <span className="font-bold text-gray-900 ml-0.5">224,720</span>
            </div>
            <div className="w-px h-3 bg-gray-200" />
            <div>
              剩余待激活码 <span className="font-bold text-emerald-600 ml-0.5">157,280</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* Platform Level Charts: Top 6 & Industries */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 bg-blue-600 rounded-full" />
              <h2 className="text-sm font-bold text-gray-900">全网各重点机构运营活跃度对比 TOP 6</h2>
            </div>
            <span className="text-xs text-gray-400">实时上报与审核流转量</span>
          </div>
          <div className="h-[220px]">
            <ReactECharts
              option={topInstitutionsChartOption}
              style={{ height: '100%', width: '100%' }}
              opts={{ renderer: 'svg' }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 bg-indigo-600 rounded-full" />
              <h2 className="text-sm font-bold text-gray-900">行业分类上报占比分布</h2>
            </div>
            <span className="text-xs text-gray-400">各领域工单权重</span>
          </div>
          <div className="h-[220px]">
            <ReactECharts
              option={industryDistributionChartOption}
              style={{ height: '100%', width: '100%' }}
              opts={{ renderer: 'svg' }}
            />
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* Search, Filters & View Mode Selector */}
      {/* ========================================== */}
      <div className="bg-white rounded-2xl border border-gray-200/90 p-4 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <svg
              className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              id="inst_search_input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索机构名称、机构编码、负责人姓名或地域..."
              className="w-full pl-9.5 pr-4 py-2 bg-gray-50/80 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-800 placeholder-gray-400 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Industry Filter */}
            <select
              id="industry_filter_select"
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              aria-label="行业属性筛选"
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="ALL">全部行业属性</option>
              {industries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>

            {/* Status Type Filter */}
            <select
              id="status_type_filter_select"
              value={selectedStatusType}
              onChange={(e) => setSelectedStatusType(e.target.value)}
              aria-label="服务状态筛选"
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="ALL">全部服务状态</option>
              <option value="正式">正式机构</option>
              <option value="试用">试用机构</option>
            </select>

            {/* Sort Filter */}
            <select
              id="sort_by_select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="排序维度"
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="todayReports">按今日上报量降序</option>
              <option value="personnel">按在岗人员降序</option>
              <option value="pending">按待审积压降序</option>
              <option value="quota">按激活码使用率降序</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
          <div>
            共检索到 <span className="font-bold text-gray-900">{filteredInstitutions.length}</span>{' '}
            家机构
            {searchQuery && (
              <span className="ml-1 text-blue-600">（匹配关键词: "{searchQuery}"）</span>
            )}
          </div>
          <div className="text-gray-400">点击任意机构行或「进入监控」即可下钻对应机构</div>
        </div>
      </div>

      {/* ========================================== */}
      {/* Institutions View: TABLE (Detailed List) */}
      {/* ========================================== */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold select-none">
              <tr>
                <th className="py-3.5 px-4">机构名称 / 签约类型</th>
                <th className="py-3.5 px-3">所属行业</th>
                <th className="py-3.5 px-3">地域 / 负责人</th>
                <th className="py-3.5 px-3 text-center">在岗人员 (活跃度)</th>
                <th className="py-3.5 px-3 text-center">激活码使用率 (已用/总额)</th>
                <th className="py-3.5 px-3 text-center">今日上报 (已采纳)</th>
                <th className="py-3.5 px-3 text-center">待审积压</th>
                <th className="py-3.5 px-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredInstitutions.map((inst) => {
                const quotaPercent = Math.round((inst.qrUsed / inst.qrLimit) * 100);
                const activityRate = Math.round(
                  (inst.activePersonnel / (inst.totalPersonnel || 1)) * 100
                );
                const remainingCodes = Math.max(0, inst.qrLimit - inst.qrUsed);

                return (
                  <tr
                    key={inst.id}
                    onClick={() => onSelectInstitution(inst)}
                    className="hover:bg-blue-50/30 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-gray-900 hover:text-blue-600 transition-colors">
                          {inst.name}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 ${
                            inst.statusType === '正式'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {inst.statusType}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] font-medium">
                        {inst.industry}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="text-gray-800 font-medium">{inst.leader}</div>
                      <div className="text-[10px] text-gray-400">{inst.region}</div>
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono">
                      <div className="font-bold text-indigo-700 text-xs">
                        {inst.totalPersonnel} 人
                      </div>
                      <div className="text-[10px] text-gray-400">
                        活跃 {inst.activePersonnel} ({activityRate}%)
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono">
                      <div className="font-bold text-amber-600 text-xs">{quotaPercent}%</div>
                      <div className="text-[10px] text-gray-400">
                        {inst.qrUsed} / {inst.qrLimit} (余{remainingCodes})
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono">
                      <div className="font-bold text-blue-600 text-xs">
                        {inst.todayReports} 件
                      </div>
                      <div className="text-[10px] text-gray-400">
                        已采纳 {inst.reviewedToday} 件
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                          inst.pendingReview > 5
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {inst.pendingReview} 件
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectInstitution(inst);
                        }}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-semibold transition-all cursor-pointer shadow-2xs"
                      >
                        进入监控 ➔
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
