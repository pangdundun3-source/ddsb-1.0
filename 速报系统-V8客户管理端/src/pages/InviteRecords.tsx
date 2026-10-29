import React, { useMemo, useState } from 'react';
import {
  Ban,
  Building2,
  Copy,
  Download,
  FileText,
  KeyRound,
  Link2,
  QrCode,
  RotateCcw,
  Search,
  Users,
  X
} from 'lucide-react';
import {
  EXTERNAL_APP,
  formatPersonOrgPaths,
  getInviteJoinedMembers,
  type InviteCode,
  type UserOrgSharedState
} from '../data/userOrgShared';
import { maskPhone } from '../components/PersonAccountDisplay';
import { InviteQrCode, downloadQrCardImage } from '../components/InviteQrCode';
import { buildShareInviteLink } from '../components/ShareInvitePanel';
import { PaginationBar } from '../components/PaginationBar';

type StatusTab = 'pending' | 'activated' | 'expired';
type ChannelType = 'activation_code' | 'official_account' | 'qrcode' | 'link';

const isInviteExpired = (item: InviteCode) =>
  item.status === '已过期' ||
  !!item.invalidatedAt ||
  (!!item.expiresAt && new Date(item.expiresAt).getTime() <= Date.now() && item.status !== '已使用');

const resolveTab = (item: InviteCode): StatusTab => {
  if (item.status === '已使用') return 'activated';
  if (isInviteExpired(item)) return 'expired';
  return 'pending';
};

const resolveChannel = (item: InviteCode): ChannelType =>
  item.channel || (item.sentToFollowerId ? 'official_account' : 'activation_code');

/** 面向具体人员的单人邀请（含粉丝邀请激活） */
const isSingleInvite = (item: InviteCode) =>
  resolveChannel(item) === 'official_account' || Boolean(item.sentToFollowerId || item.sentToName);

const formatTime = (value?: string) => (value ? value.replace('T', ' ') : '—');

const formatYmd = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
};

/** 根据创建时间与截止时间推断凭证有效期档位 */
const resolveValidityLabel = (createdAt?: string, expiresAt?: string) => {
  if (!createdAt || !expiresAt) return '—';
  const hours = (new Date(expiresAt.replace(' ', 'T')).getTime() - new Date(createdAt.replace(' ', 'T')).getTime()) / 3600000;
  if (!Number.isFinite(hours) || hours <= 0) return '—';
  if (hours <= 36) return '24小时';
  if (hours <= 96) return '3天';
  return '7天';
};

const statusLabelForExport = (item: InviteCode) => {
  const tab = resolveTab(item);
  if (tab === 'activated') return `已激活${item.usedByName ? ` · ${item.usedByName}` : ''}`;
  if (tab === 'expired') return '已失效';
  return '未激活';
};

const ROLE_COLORS = [
  'bg-amber-50 text-amber-800 border-amber-200',
  'bg-sky-50 text-sky-700 border-sky-200',
  'bg-violet-50 text-violet-700 border-violet-200',
  'bg-emerald-50 text-emerald-700 border-emerald-200'
];

interface BatchRow {
  key: string;
  channel: Exclude<ChannelType, 'official_account'>;
  batchName: string;
  createdBy: string;
  createdAt: string;
  expiresAt?: string;
  roles: string[];
  orgIds: string[];
  groupIds: string[];
  total: number;
  activated: number;
  occupied: number;
  status: StatusTab;
  sample: InviteCode;
  codes: InviteCode[];
}

interface InviteRecordsProps {
  shared: Pick<UserOrgSharedState, 'orgNodes' | 'inviteCodes' | 'setInviteCodes' | 'personnelList' | 'groups'>;
}

const buildBatchRows = (inviteCodes: InviteCode[]): BatchRow[] => {
  const rows: BatchRow[] = [];
  const codeGroups = new Map<string, InviteCode[]>();

  inviteCodes.forEach((item) => {
    if (isSingleInvite(item)) return;
    const channel = resolveChannel(item);

    if (channel === 'activation_code') {
      const list = codeGroups.get(item.batchId) || [];
      list.push(item);
      codeGroups.set(item.batchId, list);
      return;
    }

    if (channel === 'official_account') return;

    const total = item.qrLimit || Math.max(item.scannedCount || 0, 1);
    const activated = item.scannedCount || (item.status === '已使用' ? 1 : 0);
    const status = resolveTab(item);
    const occupied = status === 'expired' ? activated : total;
    rows.push({
      key: item.id,
      channel,
      batchName: item.batchName,
      createdBy: item.createdBy || '系统',
      createdAt: item.createdAt,
      expiresAt: item.expiresAt,
      roles: item.roles || [],
      orgIds: item.orgIds || [],
      groupIds: item.groupIds || [],
      total,
      activated,
      occupied,
      status: status === 'activated' && activated < total ? 'pending' : status,
      sample: item,
      codes: [item]
    });
  });

  codeGroups.forEach((codes, batchId) => {
    const sorted = [...codes].sort((a, b) => a.code.localeCompare(b.code));
    const sample = sorted[0];
    const total = sorted.length;
    const activated = sorted.filter((item) => item.status === '已使用').length;
    const pending = sorted.filter((item) => resolveTab(item) === 'pending').length;
    const expired = sorted.filter((item) => resolveTab(item) === 'expired').length;
    let status: StatusTab = 'pending';
    if (pending === 0 && activated === total) status = 'activated';
    else if (pending === 0 && expired > 0) status = 'expired';
    const occupied = status === 'expired' ? activated : total;
    rows.push({
      key: batchId,
      channel: 'activation_code',
      batchName: sample.batchName,
      createdBy: sample.createdBy || '系统',
      createdAt: sample.createdAt,
      expiresAt: sample.expiresAt,
      roles: sample.roles || [],
      orgIds: sample.orgIds || [],
      groupIds: sample.groupIds || [],
      total,
      activated,
      occupied,
      status,
      sample,
      codes: sorted
    });
  });

  return rows.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
};

export const InviteRecords: React.FC<InviteRecordsProps> = ({ shared }) => {
  const { orgNodes, inviteCodes, setInviteCodes, groups } = shared;
  const [statusTab, setStatusTab] = useState<StatusTab>('pending');
  const [keyword, setKeyword] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [toast, setToast] = useState('');
  const [viewInvite, setViewInvite] = useState<InviteCode | null>(null);
  const [detailRow, setDetailRow] = useState<BatchRow | null>(null);
  const [configRow, setConfigRow] = useState<BatchRow | null>(null);
  const [batchInvite, setBatchInvite] = useState<InviteCode | null>(null);

  const batchRows = useMemo(() => buildBatchRows(inviteCodes), [inviteCodes]);

  const batchCodes = useMemo(() => {
    if (!batchInvite) return [];
    return inviteCodes
      .filter((item) => item.batchId === batchInvite.batchId && resolveChannel(item) === 'activation_code')
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [batchInvite, inviteCodes]);

  const detailMembers = useMemo(() => {
    if (!detailRow) return [];
    const resolveOrgPath = (orgIds?: string[]) => formatPersonOrgPaths(orgNodes, orgIds || []) || '—';
    const resolveGroupNames = (groupIds?: string[]) =>
      (groupIds || [])
        .map((id) => groups.find((group) => group.id === id)?.name || id)
        .filter(Boolean);
    if (detailRow.channel === 'activation_code') {
      return detailRow.codes
        .filter((item) => item.status === '已使用')
        .map((item) => ({
          id: item.id,
          name: item.usedByName || '用户',
          phone: item.usedByPhone || '',
          joinedAt: formatTime(item.usedAt),
          role: (item.roles || detailRow.roles)[0] || '—',
          code: item.code,
          orgPath: resolveOrgPath(item.orgIds?.length ? item.orgIds : detailRow.orgIds),
          groupNames: resolveGroupNames(item.groupIds?.length ? item.groupIds : detailRow.groupIds)
        }));
    }
    return getInviteJoinedMembers(detailRow.sample).map((member) => ({
      id: member.id,
      name: member.name,
      phone: member.phone,
      joinedAt: member.joinedAt,
      role: (detailRow.roles || [])[0] || '—',
      code: undefined as string | undefined,
      orgPath: resolveOrgPath(detailRow.orgIds),
      groupNames: resolveGroupNames(detailRow.groupIds)
    }));
  }, [detailRow, orgNodes, groups]);

  const triggerToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2200);
  };

  const copyText = async (text: string, success: string) => {
    try {
      await navigator.clipboard.writeText(text);
      triggerToast(success);
    } catch {
      triggerToast('复制失败，请手动复制');
    }
  };

  const exportBatchCodes = () => {
    if (!batchInvite || !batchCodes.length) {
      triggerToast('暂无激活码可导出');
      return;
    }
    const header = ['激活码', '状态', '激活时间', '生成时间'];
    const rows = batchCodes.map((item) => {
      const tab = resolveTab(item);
      return [
        item.code,
        statusLabelForExport(item),
        tab === 'activated' ? formatTime(item.usedAt || item.createdAt) : '',
        formatTime(item.createdAt)
      ];
    });
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `激活码_${batchInvite.batchName || '批次'}_${formatYmd(new Date())}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    triggerToast('激活码表格已导出');
  };

  const counts = useMemo(() => {
    const result = { pending: 0, activated: 0, expired: 0 };
    batchRows.forEach((row) => {
      result[row.status] += 1;
    });
    return result;
  }, [batchRows]);

  const filteredBatches = useMemo(() => {
    const kw = appliedKeyword.trim().toLowerCase();
    return batchRows
      .filter((row) => row.status === statusTab)
      .filter((row) => {
        if (!kw) return true;
        const hay = [
          row.batchName,
          row.createdBy,
          ...(row.roles || []),
          formatPersonOrgPaths(orgNodes, row.orgIds),
          formatTime(row.expiresAt)
        ]
          .join(' ')
          .toLowerCase();
        return hay.includes(kw);
      });
  }, [batchRows, statusTab, appliedKeyword, orgNodes]);

  const listLength = filteredBatches.length;
  const totalPages = Math.max(1, Math.ceil(listLength / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedBatches = filteredBatches.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const switchTab = (tab: StatusTab) => {
    setStatusTab(tab);
    setPage(1);
  };

  const handleQuery = () => {
    setAppliedKeyword(keyword);
    setPage(1);
  };

  const handleReset = () => {
    setKeyword('');
    setAppliedKeyword('');
    setPage(1);
  };

  const invalidateBatch = (row: BatchRow, operator = '管理员') => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const ids = new Set(row.codes.map((item) => item.id));
    setInviteCodes((prev) =>
      prev.map((item) =>
        ids.has(item.id) && resolveTab(item) === 'pending'
          ? {
              ...item,
              status: '已过期',
              invalidatedAt: stamp,
              invalidateReason: '管理员手动失效',
              invalidatedBy: operator
            }
          : item
      )
    );
    triggerToast(row.channel === 'activation_code' ? `已失效整批 ${row.codes.length} 个激活码` : '已立即失效该邀请');
  };

  const openChannelAction = (row: BatchRow) => {
    if (row.channel === 'activation_code') {
      setBatchInvite(row.sample);
      return;
    }
    if (row.channel === 'link') {
      copyText(buildShareInviteLink('link', row.sample.code), '批量链接已复制');
      return;
    }
    setViewInvite(row.sample);
  };

  const channelActionLabel = (channel: BatchRow['channel']) => {
    if (channel === 'qrcode') return '查看二维码';
    if (channel === 'link') return '复制链接';
    return '激活码列表';
  };

  const channelLabel = (channel: BatchRow['channel']) => {
    if (channel === 'qrcode') return '批量二维码';
    if (channel === 'link') return '批量链接';
    return '激活码';
  };

  const ChannelIcon = ({ channel }: { channel: 'qrcode' | 'link' | 'activation_code' | ChannelType }) => {
    if (channel === 'qrcode') return <QrCode className="w-3.5 h-3.5 text-sky-600" />;
    if (channel === 'link') return <Link2 className="w-3.5 h-3.5 text-violet-600" />;
    if (channel === 'official_account') return <KeyRound className="w-3.5 h-3.5 text-orange-600" />;
    return <KeyRound className="w-3.5 h-3.5 text-orange-600" />;
  };

  return (
    <div className="h-full min-h-[680px] flex flex-col min-w-0 bg-white relative">
      {toast && (
        <div className="absolute top-3 right-5 z-30 px-3 py-2 rounded-lg bg-[#1E5ABB] text-white text-xs font-bold shadow-sm">
          {toast}
        </div>
      )}

      <div className="px-5 py-3 flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-1">
          {(
            [
              { id: 'pending' as const, label: '待激活' },
              { id: 'activated' as const, label: '已激活' },
              { id: 'expired' as const, label: '已失效' }
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => switchTab(tab.id)}
              className={`h-8 px-2.5 rounded text-xs font-bold cursor-pointer ${
                statusTab === tab.id ? 'bg-[#F0F5FF] text-[#1E5ABB]' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {tab.label} {counts[tab.id]}
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-[240px] max-w-[360px] ml-auto">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleQuery();
            }}
            placeholder="按批次名称 / 组织节点 / 角色搜索"
            className="w-full h-8 pl-8 pr-7 border border-gray-200 rounded-[5px] text-xs focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] bg-white"
          />
          {keyword && (
            <button
              type="button"
              onClick={() => setKeyword('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer"
              title="清空"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleQuery}
            className="h-8 px-4 bg-[#1E5ABB] hover:bg-[#134092] text-white text-xs font-semibold rounded-lg shadow-2xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            查询
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="h-8 px-3 bg-white hover:bg-gray-50 text-gray-500 text-xs font-medium rounded-[5px] border border-gray-200 inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            重置
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto px-5 py-3">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-y border-slate-200">
                <th className="py-2.5 px-3 whitespace-nowrap">邀请名称</th>
                <th className="py-2.5 px-3 whitespace-nowrap">邀请方式</th>
                <th className="py-2.5 px-3 whitespace-nowrap">数量统计</th>
                <th className="py-2.5 px-3 whitespace-nowrap">组织节点</th>
                <th className="py-2.5 px-3 whitespace-nowrap">用户群组</th>
                <th className="py-2.5 px-3 whitespace-nowrap">角色</th>
                <th className="py-2.5 px-3 whitespace-nowrap">邀请凭证有效期</th>
                <th className="py-2.5 px-3 whitespace-nowrap">状态</th>
                <th className="py-2.5 px-3 whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {pagedBatches.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-gray-400">
                    暂无匹配的批量邀请记录
                  </td>
                </tr>
              ) : (
                pagedBatches.map((row) => {
                  const ratio = row.total ? Math.round((row.activated / row.total) * 100) : 0;
                  const orgPath = formatPersonOrgPaths(orgNodes, row.orgIds);
                  const groupNames = row.groupIds
                    .map(groupId => groups.find(group => group.id === groupId)?.name)
                    .filter((name): name is string => Boolean(name));
                  return (
                    <tr key={row.key} className="hover:bg-blue-50/20 align-top">
                      <td className="py-3 px-3 min-w-[160px]">
                        <div className="font-bold text-slate-800">{row.batchName}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          发起人 {row.createdBy} · {formatTime(row.createdAt)}
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 font-bold text-slate-700">
                          <ChannelIcon channel={row.channel} />
                          {channelLabel(row.channel)}
                        </div>
                        <button
                          type="button"
                          onClick={() => openChannelAction(row)}
                          className="mt-1 block text-[11px] text-[#1E5ABB] hover:underline cursor-pointer"
                        >
                          {channelActionLabel(row.channel)}
                        </button>
                      </td>
                      <td className="py-3 px-3 min-w-[140px]">
                        <button
                          type="button"
                          onClick={() => setDetailRow(row)}
                          className="text-left cursor-pointer group"
                          title="查看激活详情"
                        >
                          <div className="font-bold text-slate-800 group-hover:text-[#1E5ABB]">
                            已激活 {row.activated} / {row.total}
                          </div>
                          <div className="mt-1.5 h-1.5 rounded bg-slate-100 overflow-hidden w-28">
                            <div className="h-full rounded bg-[#1E5ABB]" style={{ width: `${Math.min(100, ratio)}%` }} />
                          </div>
                          <div className="mt-1 text-[11px] text-gray-400 group-hover:text-[#1E5ABB]/80">
                            占用名额 {row.occupied}
                          </div>
                        </button>
                      </td>
                      <td className="py-3 px-3 max-w-[180px]">
                        <span className="inline-flex items-start gap-1 text-slate-700">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{orgPath || '—'}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 max-w-[220px]">
                        <div className="flex items-start gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          {groupNames.length ? (
                            <div className="flex flex-wrap gap-1 min-w-0">
                              {groupNames.map(groupName => (
                                <span
                                  key={groupName}
                                  className="inline-flex px-1.5 py-0.5 rounded border border-sky-200 bg-sky-50 text-sky-700 text-[11px] font-semibold"
                                >
                                  {groupName}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {(row.roles.length ? row.roles : ['—']).map((role, index) => (
                            <span
                              key={`${role}-${index}`}
                              className={`inline-flex px-1.5 py-0.5 rounded border text-[11px] font-bold ${ROLE_COLORS[index % ROLE_COLORS.length]}`}
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-medium text-slate-700">
                          {resolveValidityLabel(row.createdAt, row.expiresAt)}
                        </div>
                        <div className="mt-0.5 text-[11px] text-gray-400 font-mono">
                          截止 {formatTime(row.expiresAt)}
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 font-semibold ${
                            row.status === 'pending'
                              ? 'text-emerald-700'
                              : row.status === 'activated'
                                ? 'text-[#1E5ABB]'
                                : 'text-slate-500'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              row.status === 'pending'
                                ? 'bg-emerald-500'
                                : row.status === 'activated'
                                  ? 'bg-[#1E5ABB]'
                                  : 'bg-slate-400'
                            }`}
                          />
                          {row.status === 'pending' ? '待激活' : row.status === 'activated' ? '已激活' : '已失效'}
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex flex-col items-start gap-1">
                          <button
                            type="button"
                            onClick={() => setConfigRow(row)}
                            className="inline-flex items-center gap-1 text-[#1E5ABB] hover:underline cursor-pointer font-semibold"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            详情
                          </button>
                          {row.status === 'pending' && (
                            <button
                              type="button"
                              onClick={() => invalidateBatch(row)}
                              className="inline-flex items-center gap-1 text-rose-600 hover:underline cursor-pointer font-semibold"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              立即失效
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
      </div>

      <div className="bg-gray-50/80 border-t border-gray-100">
        <PaginationBar
          total={listLength}
          page={currentPage}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </div>

      {detailRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setDetailRow(null)}>
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-gray-900">激活详情 · {detailRow.batchName}</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  已激活 {detailRow.activated} / {detailRow.total} · 有效期至 {formatTime(detailRow.expiresAt)}
                </p>
              </div>
              <button type="button" onClick={() => setDetailRow(null)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-auto px-5 py-3">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-y border-slate-200">
                    <th className="py-2 px-3 text-left whitespace-nowrap">姓名</th>
                    <th className="py-2 px-3 text-left whitespace-nowrap">手机号</th>
                    {detailRow.channel === 'activation_code' && (
                      <th className="py-2 px-3 text-left whitespace-nowrap">激活码</th>
                    )}
                    <th className="py-2 px-3 text-left whitespace-nowrap">组织节点</th>
                    <th className="py-2 px-3 text-left whitespace-nowrap">用户群组</th>
                    <th className="py-2 px-3 text-left whitespace-nowrap">角色</th>
                    <th className="py-2 px-3 text-left whitespace-nowrap">激活时间</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {detailMembers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={detailRow.channel === 'activation_code' ? 7 : 6}
                        className="py-10 text-center text-gray-400"
                      >
                        暂无已激活人员
                      </td>
                    </tr>
                  ) : (
                    detailMembers.map((member) => (
                      <tr key={member.id}>
                        <td className="py-2 px-3 font-medium whitespace-nowrap">{member.name}</td>
                        <td className="py-2 px-3 font-mono whitespace-nowrap">
                          {member.phone ? maskPhone(member.phone) : '—'}
                        </td>
                        {detailRow.channel === 'activation_code' && (
                          <td className="py-2 px-3 font-mono text-slate-600 whitespace-nowrap">{member.code || '—'}</td>
                        )}
                        <td className="py-2 px-3 max-w-[180px]">
                          <span className="inline-flex items-start gap-1 text-slate-700">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{member.orgPath}</span>
                          </span>
                        </td>
                        <td className="py-2 px-3 max-w-[180px]">
                          {member.groupNames.length ? (
                            <div className="flex flex-wrap gap-1">
                              {member.groupNames.map((groupName) => (
                                <span
                                  key={groupName}
                                  className="inline-flex px-1.5 py-0.5 rounded border border-sky-200 bg-sky-50 text-sky-700 text-[11px] font-semibold"
                                >
                                  {groupName}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="py-2 px-3">
                          <span className="inline-flex px-1.5 py-0.5 rounded border border-violet-200 bg-violet-50 text-violet-700 text-[11px] font-bold">
                            {member.role}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono text-gray-500 whitespace-nowrap">{member.joinedAt}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {configRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setConfigRow(null)}>
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-gray-900">邀请配置详情</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">创建时填写的参数，仅供查看</p>
              </div>
              <button type="button" onClick={() => setConfigRow(null)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-5 py-4 text-xs space-y-0">
              <div className="rounded-lg border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                {(
                  [
                    { label: '邀请名称', value: configRow.batchName },
                    { label: '邀请方式', value: channelLabel(configRow.channel) },
                    {
                      label: '组织节点',
                      value: formatPersonOrgPaths(orgNodes, configRow.orgIds) || '—'
                    },
                    {
                      label: '用户群组',
                      value:
                        (configRow.groupIds || [])
                          .map((id) => groups.find((group) => group.id === id)?.name || id)
                          .filter(Boolean)
                          .join('、') || '—'
                    },
                    {
                      label: '角色',
                      value: (configRow.roles.length ? configRow.roles : ['—']).join('、')
                    },
                    {
                      label: '生成数量',
                      value: `${configRow.total} 人`
                    },
                    {
                      label: '邀请凭证有效期',
                      value: resolveValidityLabel(configRow.createdAt, configRow.expiresAt)
                    },
                    { label: '发起人', value: configRow.createdBy },
                    { label: '发放时间', value: formatTime(configRow.createdAt) },
                    { label: '截止时间', value: formatTime(configRow.expiresAt) }
                  ] as const
                ).map((row) => (
                  <div key={row.label} className="flex items-start justify-between gap-3 px-3 py-2.5 bg-white">
                    <span className="text-slate-500 shrink-0">{row.label}</span>
                    <span className="font-medium text-slate-800 text-right">{row.value}</span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setConfigRow(null)}
                className="mt-4 w-full h-9 rounded-md bg-[#1E5ABB] text-white text-xs font-bold cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {viewInvite &&
        (() => {
          const channel = resolveChannel(viewInvite);
          const isLink = channel === 'link';
          const isQr = channel === 'qrcode';
          const orgName = formatPersonOrgPaths(orgNodes, viewInvite.orgIds) || '—';
          const shareLink = buildShareInviteLink(isLink ? 'link' : 'qrcode', viewInvite.code);
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setViewInvite(null)}>
              <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">
                      {isQr ? '批量二维码' : '批量链接'}
                    </h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {`${viewInvite.batchName} · 配额 ${viewInvite.qrLimit || 1} · 已激活 ${viewInvite.scannedCount || 0}`}
                    </p>
                  </div>
                  <button type="button" onClick={() => setViewInvite(null)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-5 flex flex-col items-center">
                  {isQr ? (
                    <InviteQrCode value={shareLink} size={180} />
                  ) : (
                    <div className="w-[280px] rounded border border-dashed border-[#1E5ABB]/40 bg-[#F4F8FE] px-3 py-4 text-center">
                      <Link2 className="w-6 h-6 mx-auto text-[#1E5ABB]" />
                      <div className="mt-2 font-mono text-[12px] text-[#1E5ABB] break-all">{shareLink}</div>
                    </div>
                  )}
                  <div className="mt-4 w-full">
                    {isQr ? (
                      <button
                        type="button"
                        onClick={() =>
                          downloadQrCardImage({
                            value: shareLink,
                            title: orgName,
                            subtitle: `微信扫码关注「${EXTERNAL_APP.officialAccount}」`,
                            lines: [`角色：${(viewInvite.roles || []).join('、')}`, `截止：${formatTime(viewInvite.expiresAt)}`],
                            fileName: `${orgName}-邀请二维码.png`
                          })
                        }
                        className="w-full h-8 rounded bg-[#1E5ABB] text-white text-xs font-bold inline-flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        下载图片
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => copyText(shareLink, '邀请链接已复制')}
                        className="w-full h-8 rounded bg-[#1E5ABB] text-white text-xs font-bold inline-flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        复制链接
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      {batchInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setBatchInvite(null)}>
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-gray-900">激活码列表 · {batchInvite.batchName}</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  共 {batchCodes.length} 个 · 已激活 {batchCodes.filter((item) => item.status === '已使用').length} ·
                  有效期至 {formatTime(batchInvite.expiresAt)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={exportBatchCodes}
                  className="h-7 px-2.5 rounded border border-gray-200 text-gray-600 hover:border-[#1E5ABB]/40 hover:text-[#1E5ABB] text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  导出表格
                </button>
                <button
                  type="button"
                  onClick={() =>
                    copyText(
                      batchCodes.map((item) => item.code).join('\n'),
                      `已复制 ${batchCodes.length} 个激活码`
                    )
                  }
                  className="h-7 px-2.5 rounded border border-orange-100 bg-orange-50 text-orange-700 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  一键复制
                </button>
                <button type="button" onClick={() => setBatchInvite(null)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto px-5 py-3">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-y border-slate-200">
                    <th className="py-2 px-3 text-left">激活码</th>
                    <th className="py-2 px-3 text-left">状态</th>
                    <th className="py-2 px-3 text-left">激活时间</th>
                    <th className="py-2 px-3 text-left">生成时间</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {batchCodes.map((item) => {
                    const tab = resolveTab(item);
                    return (
                      <tr key={item.id} className="hover:bg-orange-50/30">
                        <td className="py-2 px-3 font-mono font-bold text-slate-800">
                          <button
                            type="button"
                            onClick={() => copyText(item.code, '激活码已复制')}
                            className="hover:text-[#1E5ABB] cursor-pointer"
                            title="点击复制"
                          >
                            {item.code}
                          </button>
                        </td>
                        <td className="py-2 px-3">
                          {tab === 'activated' ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              已激活 · {item.usedByName || '用户'}
                            </span>
                          ) : tab === 'expired' ? (
                            <span className="inline-flex items-center gap-1 text-slate-500 font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                              已失效
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-slate-500 font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                              未激活
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-mono text-gray-500">
                          {tab === 'activated' ? formatTime(item.usedAt || item.createdAt) : '—'}
                        </td>
                        <td className="py-2 px-3 font-mono text-gray-500">{formatTime(item.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
