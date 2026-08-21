import React, { useState } from 'react';
import { ReportItem, PageId } from '../types';
import { Calendar, Check, Layers, Link as LinkIcon, ListChecks, Send, X } from 'lucide-react';

interface ReportAuditProps {
  auditPendingList: ReportItem[];
  onSelectAudit: (report: ReportItem) => void;
  onDeleteReport: (id: number) => void;
  onNavigate: (page: PageId) => void;
}

export const ReportAudit: React.FC<ReportAuditProps> = ({
  auditPendingList,
  onSelectAudit,
  onDeleteReport,
  onNavigate
}) => {
  const [keyword, setKeyword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [organization, setOrganization] = useState('全部');
  const [showBatchMatch, setShowBatchMatch] = useState(false);
  const [activeBatchGroup, setActiveBatchGroup] = useState<{ link: string; items: ReportItem[] } | null>(null);
  const [batchAuditMode, setBatchAuditMode] = useState<'pass' | 'reject'>('pass');
  const [batchScore, setBatchScore] = useState<number>(5);
  const [batchRejectReason, setBatchRejectReason] = useState('信息不完整');
  const [batchRejectDetail, setBatchRejectDetail] = useState('');
  const [batchToastMessage, setBatchToastMessage] = useState('');
  const organizationOptions = Array.from(new Set(auditPendingList.map((item) => item.organization)));

  const filtered = auditPendingList.filter((item) => {
    if (keyword && !item.title.toLowerCase().includes(keyword.toLowerCase())) return false;
    if (organization !== '全部' && item.organization !== organization) return false;
    return true;
  });
  const sameLinkGroups = Object.values(
    filtered.reduce<Record<string, ReportItem[]>>((groups, item) => {
      if (!item.matchUrl) return groups;
      groups[item.matchUrl] = [...(groups[item.matchUrl] || []), item];
      return groups;
    }, {})
  )
    .filter((items) => items.length > 1)
    .map((items) => ({
      link: items[0].matchUrl || '',
      items
    }));
  const batchMatchedIds = new Set(
    showBatchMatch ? sameLinkGroups.flatMap((group) => group.items.map((item) => item.id)) : []
  );
  const tableRows = showBatchMatch
    ? filtered.filter((item) => !batchMatchedIds.has(item.id))
    : filtered;
  const getStatusLabel = (status: ReportItem['auditStatus']) => {
    switch (status) {
      case '被驳回':
        return '已驳回';
      case '待审核':
        return '待审核';
      case '审核中':
        return '审核中';
      case '已通过':
      case '待转办':
      case '已转办':
        return '已完成';
      default:
        return status;
    }
  };
  const getStatusBadgeClass = (status: ReportItem['auditStatus']) => {
    const label = getStatusLabel(status);
    if (label === '待审核') return 'bg-amber-100 text-amber-700 border-amber-200';
    if (label === '已驳回') return 'bg-rose-100 text-rose-600 border-rose-200';
    if (label === '审核中') return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const handleReset = () => {
    setKeyword('');
    setStartDate('');
    setEndDate('');
    setOrganization('全部');
  };
  const openBatchAudit = (group: { link: string; items: ReportItem[] }) => {
    setActiveBatchGroup(group);
    setBatchAuditMode('pass');
    setBatchScore(5);
    setBatchRejectReason('信息不完整');
    setBatchRejectDetail('');
  };
  const closeBatchAudit = () => {
    setActiveBatchGroup(null);
  };
  const handleSubmitBatchAudit = () => {
    const count = activeBatchGroup?.items.length || 0;
    setBatchToastMessage(
      batchAuditMode === 'pass'
        ? `已成功批量审核通过 ${count} 条报送`
        : `已成功批量驳回 ${count} 条报送`
    );
    closeBatchAudit();
    window.setTimeout(() => setBatchToastMessage(''), 2600);
  };
  const canSubmitBatchAudit = batchAuditMode === 'pass' || batchRejectDetail.trim().length >= 6;

  return (
    <div className="space-y-4">
      {/* Page Title Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">报送审核</h2>
        <p className="text-xs text-gray-400 mt-1">展示本机构的所有待审核上报信息</p>
      </div>

      {/* Filter Card */}
      <div className="bg-white rounded-lg p-5 border border-gray-200/80 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-gray-600 mb-1 font-medium">事件标题</label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="标题关键字"
              className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] text-gray-700 bg-white"
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-1 font-medium">上报时间</label>
            <div className="flex items-center space-x-1">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="年/月/日"
                  className="w-full pl-2 pr-5 py-1.5 border border-gray-300 rounded text-[11px] text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                />
                <Calendar className="w-3 h-3 text-gray-400 absolute right-1.5 top-2.5 pointer-events-none" />
              </div>
              <span className="text-gray-400">-</span>
              <div className="relative flex-1">
                <input
                  type="text"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="年/月/日"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-[11px] text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-gray-600 mb-1 font-medium">所属机构</label>
            <select
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
            >
              <option value="全部">全部</option>
              {organizationOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

        </div>

        <div className="flex flex-col gap-2 pt-1 border-t border-gray-100 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            disabled={filtered.length === 0}
            onClick={() => setShowBatchMatch((prev) => !prev)}
            className={`inline-flex items-center justify-center gap-1.5 rounded px-4 py-1.5 text-xs font-medium text-white shadow-2xs transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer ${
              showBatchMatch
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {showBatchMatch ? <X className="h-3.5 w-3.5" /> : <ListChecks className="h-3.5 w-3.5" />}
            <span>{showBatchMatch ? '取消匹配' : '批量匹配'}</span>
          </button>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              className="px-5 py-1.5 bg-[#1E5ABB] hover:bg-[#134092] text-white text-xs font-medium rounded shadow-2xs transition-colors flex items-center justify-center cursor-pointer"
            >
              <span>查询</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium rounded border border-gray-200/80 transition-colors flex items-center justify-center cursor-pointer"
            >
              <span>重置</span>
            </button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg border border-gray-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold">
                <th className="py-3 px-4 w-12 text-center">序号</th>
                <th className="py-3 px-4 min-w-[220px]">事件标题</th>
                <th className="py-3 px-4 min-w-[260px]">内容描述</th>
                <th className="py-3 px-4">上报人员</th>
                <th className="py-3 px-4">所属机构</th>
                <th className="py-3 px-4">上报时间</th>
                <th className="py-3 px-4 text-center">状态</th>
                <th className="py-3 px-4 text-center">分值</th>
                <th className="py-3 px-4 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {showBatchMatch && sameLinkGroups.length === 0 && (
                <tr>
                  <td colSpan={9} className="bg-amber-50/60 px-4 py-4 text-center text-xs text-amber-700">
                    暂未匹配到相同链接的上报数据
                  </td>
                </tr>
              )}

              {showBatchMatch && sameLinkGroups.map((group) => (
                <React.Fragment key={group.link}>
                  <tr className="bg-amber-50/80">
                    <td colSpan={9} className="px-4 py-3">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="min-w-0 flex items-start gap-2">
                          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white">
                            <LinkIcon className="h-3 w-3" />
                          </div>
                          <div className="min-w-0 flex items-center gap-2">
                            <span className="shrink-0 text-sm font-bold text-gray-800">相同的上报链接</span>
                            <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                              {group.items.length} 条关联
                            </span>
                            <span className="min-w-0 truncate text-[11px] text-amber-700">链接：{group.link}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => openBatchAudit(group)}
                          className="inline-flex items-center justify-center gap-1 rounded-full bg-orange-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-2xs hover:bg-orange-700 cursor-pointer"
                        >
                          <Layers className="h-3 w-3" />
                          <span>批量审核</span>
                        </button>
                      </div>
                    </td>
                  </tr>

                  {group.items.map((item, index) => (
                    <tr key={item.id} className="bg-amber-50/20 hover:bg-amber-50/50 transition-colors">
                      <td className="py-3.5 px-4 text-center text-amber-600 font-mono">{index + 1}</td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => {
                            onSelectAudit(item);
                            onNavigate('audit-detail');
                          }}
                          className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-left cursor-pointer"
                        >
                          {item.title}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">
                        <div className="max-w-[320px] truncate" title={item.detailContent?.summary || '暂无内容描述'}>
                          {item.detailContent?.summary || '暂无内容描述'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-800 font-medium">{item.author}</td>
                      <td className="py-3.5 px-4 text-gray-600">{item.organization}</td>
                      <td className="py-3.5 px-4 font-mono text-gray-500 whitespace-nowrap">{item.submitTime}</td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getStatusBadgeClass(item.auditStatus)}`}>
                          {getStatusLabel(item.auditStatus)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-gray-700 font-mono">
                        {item.score ?? '--'}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="text-[11px] font-bold text-amber-700">已匹配</span>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}

              {showBatchMatch && sameLinkGroups.length > 0 && tableRows.length > 0 && (
                <tr>
                  <td colSpan={9} className="bg-gray-50 px-4 py-2 text-[11px] font-bold text-gray-500">
                    其他待审核报送
                  </td>
                </tr>
              )}

              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-400">
                    暂无待审核的上报信息
                  </td>
                </tr>
              ) : (
                tableRows.map((item, index) => (
                  <tr key={item.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="py-3.5 px-4 text-center text-gray-400 font-mono">{index + 1}</td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => {
                          onSelectAudit(item);
                          onNavigate('audit-detail');
                        }}
                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-left cursor-pointer"
                      >
                        {item.title}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">
                      <div className="max-w-[320px] truncate" title={item.detailContent?.summary || '暂无内容描述'}>
                        {item.detailContent?.summary || '暂无内容描述'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-800 font-medium">{item.author}</td>
                    <td className="py-3.5 px-4 text-gray-600">{item.organization}</td>
                    <td className="py-3.5 px-4 font-mono text-gray-500 whitespace-nowrap">{item.submitTime}</td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getStatusBadgeClass(item.auditStatus)}`}>
                        {getStatusLabel(item.auditStatus)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-gray-700 font-mono">
                      {item.score ?? '--'}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap space-x-2">
                      <button
                        onClick={() => {
                          onSelectAudit(item);
                          onNavigate('audit-detail');
                        }}
                        className="text-[#1E5ABB] hover:underline font-bold cursor-pointer"
                      >
                        审核
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={() => {
                          if (confirm(`确定要删除此条待审核速报《${item.title}》吗？`)) {
                            onDeleteReport(item.id);
                          }
                        }}
                        className="text-rose-600 hover:underline cursor-pointer"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div>共 {filtered.length} 条记录</div>
          <div className="flex items-center space-x-2">
            <button className="px-2 py-1 border border-gray-200 rounded bg-white hover:bg-gray-50 text-gray-400 cursor-not-allowed" disabled>
              &lt;
            </button>
            <span className="px-2.5 py-1 bg-[#1E5ABB] text-white rounded font-bold">1</span>
            <button className="px-2 py-1 border border-gray-200 rounded bg-white hover:bg-gray-50 text-gray-600 cursor-pointer">
              &gt;
            </button>
            <span className="ml-2 text-gray-400">跳转至</span>
            <input type="text" defaultValue="1" className="w-9 px-1.5 py-0.5 border border-gray-300 rounded text-center text-gray-700" />
          </div>
        </div>
      </div>

      {activeBatchGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-gray-900">批量审核</h3>
                <p className="mt-1 truncate text-[11px] text-gray-500">
                  相同链接：{activeBatchGroup.link}，共 {activeBatchGroup.items.length} 条
                </p>
              </div>
              <button
                type="button"
                onClick={closeBatchAudit}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
              <div className="rounded-lg border border-gray-200">
                <div className="border-b border-gray-100 bg-gray-50 px-3 py-2 text-xs font-bold text-gray-700">
                  本次批量审核数据
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-500">
                        <th className="px-3 py-2 w-12 text-center">序号</th>
                        <th className="px-3 py-2">事件标题</th>
                        <th className="px-3 py-2">上报人员</th>
                        <th className="px-3 py-2">所属机构</th>
                        <th className="px-3 py-2">上报时间</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {activeBatchGroup.items.map((item, index) => (
                        <tr key={item.id}>
                          <td className="px-3 py-2.5 text-center font-mono text-gray-400">{index + 1}</td>
                          <td className="px-3 py-2.5 font-medium text-gray-800">{item.title}</td>
                          <td className="px-3 py-2.5 text-gray-600">{item.author}</td>
                          <td className="px-3 py-2.5 text-gray-600">{item.organization}</td>
                          <td className="px-3 py-2.5 font-mono text-gray-500 whitespace-nowrap">{item.submitTime}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4 space-y-3 rounded-lg border border-gray-200 p-4">
                <div>
                  <label className="mb-2 block text-xs font-medium text-gray-600">审核结论</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setBatchAuditMode('pass')}
                      className={`rounded-lg border px-3 py-2.5 text-left transition-all cursor-pointer ${
                        batchAuditMode === 'pass'
                          ? 'border-emerald-300 bg-emerald-50'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex h-4 w-4 items-center justify-center rounded-full border ${
                            batchAuditMode === 'pass'
                              ? 'border-emerald-500 bg-emerald-500 text-white'
                              : 'border-gray-300 text-transparent'
                          }`}
                        >
                          <Check className="h-3 w-3" />
                        </span>
                        <span className={`text-xs font-bold ${batchAuditMode === 'pass' ? 'text-emerald-700' : 'text-gray-700'}`}>
                          批量审核通过
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBatchAuditMode('reject')}
                      className={`rounded-lg border px-3 py-2.5 text-left transition-all cursor-pointer ${
                        batchAuditMode === 'reject'
                          ? 'border-rose-300 bg-rose-50'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex h-4 w-4 items-center justify-center rounded-full border ${
                            batchAuditMode === 'reject'
                              ? 'border-rose-500 bg-rose-500 text-white'
                              : 'border-gray-300 text-transparent'
                          }`}
                        >
                          <X className="h-3 w-3" />
                        </span>
                        <span className={`text-xs font-bold ${batchAuditMode === 'reject' ? 'text-rose-700' : 'text-gray-700'}`}>
                          批量驳回
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {batchAuditMode === 'pass' ? (
                  <div className="space-y-2 text-xs">
                    <label className="block font-medium text-gray-600">评分</label>
                    <div className="flex flex-wrap gap-2">
                      {[5, 3, 1, 0.5, 0].map((score) => (
                        <button
                          key={score}
                          type="button"
                          onClick={() => setBatchScore(score)}
                          className={`rounded-full px-3 py-1 font-bold transition-all cursor-pointer ${
                            batchScore === score
                              ? 'bg-[#1E5ABB] text-white'
                              : 'border border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {score}分
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 text-xs md:grid-cols-2">
                    <div>
                      <label className="mb-1 block font-medium text-gray-600">驳回原因</label>
                      <select
                        value={batchRejectReason}
                        onChange={(e) => setBatchRejectReason(e.target.value)}
                        className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                      >
                        <option value="信息不完整">信息不完整</option>
                        <option value="属虚假误报">属虚假误报</option>
                        <option value="重复上报">重复上报</option>
                        <option value="不符合退回标准">不符合退回标准</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block font-medium text-gray-600">详细说明</label>
                      <textarea
                        rows={3}
                        value={batchRejectDetail}
                        onChange={(e) => setBatchRejectDetail(e.target.value)}
                        placeholder="请输入具体的驳回理由，至少 6 个字..."
                        className="w-full rounded border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                      />
                      <p className={`mt-1 text-[11px] ${batchRejectDetail.trim().length >= 6 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {batchRejectDetail.trim().length >= 6 ? '说明已满足提交要求' : '驳回说明至少 6 个字'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-3">
              <button
                type="button"
                onClick={closeBatchAudit}
                className="rounded border border-gray-200 bg-white px-4 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSubmitBatchAudit}
                disabled={!canSubmitBatchAudit}
                className="inline-flex items-center gap-1.5 rounded bg-[#1E5ABB] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#134092] disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{batchAuditMode === 'pass' ? '确认批量审核通过' : '确认批量驳回'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {batchToastMessage && (
        <div className="fixed left-1/2 top-20 z-[60] -translate-x-1/2 rounded-full bg-slate-800 px-4 py-2 text-xs font-medium text-white shadow-lg">
          {batchToastMessage}
        </div>
      )}
    </div>
  );
};
