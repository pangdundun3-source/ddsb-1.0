import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Copy, Download, History, KeyRound, Link2, QrCode, RefreshCw, X } from 'lucide-react';
import type { OrgNode, PersonnelItem } from '../pages/OrgManagement';
import {
  ACCOUNT_ROLE_OPTIONS,
  getOrgInviteRoles,
  buildOrgHeadcount,
  buildOrgIdPath,
  formatPersonOrgPaths,
  generateActivationCode,
  getOrgNodeRemainingSeats,
  ORG_MAX_USER_COUNT,
  type InviteCode,
  type PersonnelGroup
} from '../data/userOrgShared';
import { maskPhone } from './PersonAccountDisplay';
import { MultiSelectDropdown } from './FormControls';
import { OrgCascadeSelect } from './OrgCascadeSelect';
import { ShareInvitePanel, type InviteValidityPresetId } from './ShareInvitePanel';

const INVITE_VALIDITY_OPTIONS: Array<{ id: InviteValidityPresetId; label: string; hours: number }> = [
  { id: '24h', label: '24小时', hours: 24 },
  { id: '3d', label: '3天', hours: 72 },
  { id: '7d', label: '7天', hours: 168 }
];

type InviteListFilter = 'all' | '待激活' | '已激活' | '已失效';
type InviteMode = 'qrcode' | 'code' | 'link';

const INVITE_MODE_TABS: Array<{ id: InviteMode; label: string; desc: string }> = [
  { id: 'qrcode', label: '二维码邀请', desc: '线下面对面扫码 / 微信群公开加入' },
  { id: 'code', label: '激活码邀请', desc: '发放专属激活码 / 一码一人' },
  { id: 'link', label: '链接邀请', desc: '复制邀请链接 / 发送到微信群或私聊' }
];

const INVITE_MODE_STORAGE_KEY = 'v8_invite_mode';

const readStoredInviteMode = (): InviteMode => {
  const saved = localStorage.getItem(INVITE_MODE_STORAGE_KEY);
  return saved === 'qrcode' || saved === 'link' ? saved : 'code';
};

const padTime = (value: number) => String(value).padStart(2, '0');
const toLocalDateTimeValue = (date: Date) =>
  `${date.getFullYear()}-${padTime(date.getMonth() + 1)}-${padTime(date.getDate())}T${padTime(date.getHours())}:${padTime(date.getMinutes())}`;
const addHoursLocal = (hours: number) => toLocalDateTimeValue(new Date(Date.now() + hours * 3600 * 1000));
const formatDateTimeLabel = (value: string) => (value ? value.replace('T', ' ') : '—');
const formatYmd = (date: Date) => `${date.getFullYear()}${padTime(date.getMonth() + 1)}${padTime(date.getDate())}`;
const defaultInviteBatchName = (existing: InviteCode[] = []) => {
  const base = `邀请批次-${formatYmd(new Date())}`;
  const used = new Set(existing.map((item) => (item.batchName || '').trim()).filter(Boolean));
  let maxSuffix = 0;
  const suffixRe = new RegExp(`^${base}-(\\d{2})$`);
  for (const name of used) {
    const match = name.match(suffixRe);
    if (match) maxSuffix = Math.max(maxSuffix, Number(match[1]));
  }
  for (let n = Math.max(1, maxSuffix + 1); n <= 99; n += 1) {
    const candidate = `${base}-${padTime(n)}`;
    if (!used.has(candidate)) return candidate;
  }
  const now = new Date();
  return `${base}-${padTime(now.getHours())}${padTime(now.getMinutes())}`;
};

export const resolveInviteStatus = (item: InviteCode) => {
  if (item.status === '已使用') return '已激活' as const;
  if (
    item.status === '已过期' ||
    !!item.invalidatedAt ||
    (!!item.expiresAt && new Date(item.expiresAt).getTime() <= Date.now())
  ) {
    return '已失效' as const;
  }
  return '待激活' as const;
};

interface InviteUserModalProps {
  orgNodes: OrgNode[];
  groups?: PersonnelGroup[];
  inviteCodes: InviteCode[];
  setInviteCodes: React.Dispatch<React.SetStateAction<InviteCode[]>>;
  activatedCount: number;
  /** 用于计算组织节点剩余可用额度 */
  personnelList?: PersonnelItem[];
  /** 预先定位的组织节点，邀请加入后归属该节点 */
  initialOrgId?: string;
  onClose: () => void;
  onToast: (message: string) => void;
  onOpenRecords: () => void;
}

/** 邀请用户弹窗：二维码 / 激活码 / 链接三种方式，外部用户数据与外部组织管理共用 */
export const InviteUserModal: React.FC<InviteUserModalProps> = ({
  orgNodes,
  groups = [],
  inviteCodes,
  setInviteCodes,
  activatedCount,
  personnelList = [],
  initialOrgId,
  onClose,
  onOpenRecords
}) => {
  const initialOrgPath = buildOrgIdPath(orgNodes, initialOrgId);
  const initialOrgName = initialOrgId ? orgNodes.find((node) => node.id === initialOrgId)?.name : undefined;
  const [inviteMode, setInviteMode] = useState<InviteMode>(readStoredInviteMode);
  const [orgPath, setOrgPath] = useState<string[]>(initialOrgPath);
  const [pRoles, setPRoles] = useState<string[]>(['网格员']);
  const [pGroupIds, setPGroupIds] = useState<string[]>([]);
  const [inviteBatchName, setInviteBatchName] = useState(() => defaultInviteBatchName(inviteCodes));
  const [inviteCount, setInviteCount] = useState(10);
  const [validityId, setValidityId] = useState<InviteValidityPresetId>('24h');
  const [inviteListFilter, setInviteListFilter] = useState<InviteListFilter>('all');
  const [freshCodeIds, setFreshCodeIds] = useState<string[]>([]);
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);
  const [modalToast, setModalToast] = useState('');
  const modalToastTimerRef = useRef<number | null>(null);

  const institutionRemaining = Math.max(0, ORG_MAX_USER_COUNT - activatedCount);
  const selectedLeafOrgId = orgPath[orgPath.length - 1];
  const orgHeadcount = useMemo(
    () => buildOrgHeadcount(orgNodes, personnelList),
    [orgNodes, personnelList]
  );
  const nodeRemainingSeats = selectedLeafOrgId
    ? getOrgNodeRemainingSeats(orgNodes, orgHeadcount, selectedLeafOrgId)
    : null;
  const remainingSeats =
    nodeRemainingSeats !== null
      ? Math.min(institutionRemaining, nodeRemainingSeats)
      : institutionRemaining;
  const quotaTip =
    nodeRemainingSeats !== null
      ? `本节点剩余可用额度 ${nodeRemainingSeats} 人，数量不可超过该额度`
      : `本机构剩余可用额度 ${institutionRemaining} 人，数量不可超过该额度`;

  const showToast = (message: string) => {
    if (modalToastTimerRef.current) {
      window.clearTimeout(modalToastTimerRef.current);
    }
    setModalToast(message);
    modalToastTimerRef.current = window.setTimeout(() => {
      setModalToast('');
      modalToastTimerRef.current = null;
    }, 2600);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(
    () => () => {
      if (modalToastTimerRef.current) window.clearTimeout(modalToastTimerRef.current);
    },
    []
  );

  const copyText = async (text: string, success: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      showToast(success);
    } catch {
      showToast('复制失败，请手动复制');
    }
  };

  const resetLeftPanel = (extraCodes: InviteCode[] = []) => {
    setOrgPath(initialOrgPath);
    setPRoles(['网格员']);
    setPGroupIds([]);
    setInviteBatchName(defaultInviteBatchName([...extraCodes, ...inviteCodes]));
    setInviteCount(10);
    setValidityId('24h');
  };

  const validateLeftPanel = () => {
    const name = inviteBatchName.trim();
    if (!name) return '请填写邀请名称';
    if (inviteCodes.some((item) => (item.batchName || '').trim() === name)) {
      return '邀请名称已存在，请更换名称';
    }
    if (orgPath.length === 0 || !selectedLeafOrgId) return '请选择组织节点';
    if (pRoles.length === 0) return '请至少选择一个加入后角色';
    if (!inviteCount || inviteCount < 1) return '生成数量需大于 0';
    if (remainingSeats <= 0 || inviteCount > remainingSeats) return quotaTip;
    return '';
  };

  const switchInviteMode = (mode: InviteMode) => {
    setInviteMode(mode);
    if (!pRoles.length) setPRoles(['网格员']);
    localStorage.setItem(INVITE_MODE_STORAGE_KEY, mode);
  };

  const toggleRole = (role: string) => {
    setPRoles((prev) => {
      if (prev.includes(role)) {
        if (prev.length === 1) return prev;
        return prev.filter((item) => item !== role);
      }
      return [...prev, role];
    });
  };

  const toggleGroup = (groupId: string) => {
    setPGroupIds((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  const handleGenerateBatch = () => {
    const validity = INVITE_VALIDITY_OPTIONS.find((item) => item.id === validityId) || INVITE_VALIDITY_OPTIONS[0];
    const inviteExpiry = addHoursLocal(validity.hours);
    const error = validateLeftPanel();
    if (error) {
      showToast(error);
      return;
    }

    const batchName = inviteBatchName.trim();
    const existing = new Set(inviteCodes.map((item) => item.code));
    const codes: string[] = [];
    while (codes.length < inviteCount) {
      const next = generateActivationCode();
      if (!existing.has(next)) {
        existing.add(next);
        codes.push(next);
      }
    }

    const now = toLocalDateTimeValue(new Date());
    const batchId = `batch-${Date.now()}`;
    const created: InviteCode[] = codes.map((code, index) => ({
      id: `${batchId}-${index + 1}`,
      code,
      batchId,
      batchName,
      orgIds: selectedLeafOrgId ? [selectedLeafOrgId] : [],
      roles: [...pRoles],
      groupIds: pGroupIds.length ? [...pGroupIds] : undefined,
      expiresAt: inviteExpiry,
      createdAt: now,
      status: '未使用',
      channel: 'activation_code'
    }));

    setInviteCodes((prev) => [...created, ...prev]);
    setFreshCodeIds(created.map((item) => item.id));
    setActiveBatchId(batchId);
    setInviteListFilter('all');
    resetLeftPanel(created);
    showToast(`已生成 ${created.length} 个激活码，有效期至 ${formatDateTimeLabel(inviteExpiry)}`);
  };

  const roleChip = (active: boolean) =>
    `h-7 px-2.5 rounded-full text-[11px] cursor-pointer ${
      active ? 'bg-[#1E5ABB] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-[#1E5ABB]/40'
    }`;

  const codeInviteRecords = inviteCodes.filter(
    (item) =>
      (item.channel === 'activation_code' || (!item.channel && !item.sentToFollowerId)) &&
      item.channel !== 'qrcode' &&
      item.channel !== 'link' &&
      item.channel !== 'official_account' &&
      (!initialOrgId || (item.orgIds || []).includes(initialOrgId))
  );

  const codeBatches = useMemo(() => {
    const groups = new Map<string, InviteCode[]>();
    codeInviteRecords.forEach((item) => {
      const list = groups.get(item.batchId) || [];
      list.push(item);
      groups.set(item.batchId, list);
    });
    return Array.from(groups.entries())
      .map(([batchId, codes]) => {
        const sorted = [...codes].sort((a, b) => a.code.localeCompare(b.code));
        const sample = sorted[0];
        const activated = sorted.filter((item) => resolveInviteStatus(item) === '已激活').length;
        const pending = sorted.filter((item) => resolveInviteStatus(item) === '待激活').length;
        let status: '待激活' | '已激活' | '已失效' = '待激活';
        if (pending === 0 && activated === sorted.length) status = '已激活';
        else if (pending === 0) status = '已失效';
        return {
          batchId,
          codes: sorted,
          sample,
          total: sorted.length,
          activated,
          pending,
          status,
          createdAt: sample.createdAt
        };
      })
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  }, [codeInviteRecords]);

  useEffect(() => {
    if (!codeBatches.length) {
      setActiveBatchId(null);
      return;
    }
    if (!activeBatchId || !codeBatches.some((batch) => batch.batchId === activeBatchId)) {
      setActiveBatchId(codeBatches[0].batchId);
    }
  }, [codeBatches, activeBatchId]);

  const activeBatch = codeBatches.find((batch) => batch.batchId === activeBatchId) || codeBatches[0] || null;
  const activeBatchCodes = activeBatch?.codes || [];
  const unusedInviteCodes = activeBatchCodes.filter((item) => resolveInviteStatus(item) === '待激活');
  const visibleInviteCodes = activeBatchCodes.filter((item) => {
    if (inviteListFilter === 'all') return true;
    return resolveInviteStatus(item) === inviteListFilter;
  });

  const copyUnusedCodes = () => {
    if (!unusedInviteCodes.length) {
      showToast('当前批次没有待激活的激活码');
      return;
    }
    copyText(unusedInviteCodes.map((item) => item.code).join('\n'), `已复制 ${unusedInviteCodes.length} 个待激活激活码`);
  };

  const exportInviteCodes = () => {
    if (!activeBatchCodes.length) {
      showToast('当前批次暂无激活码可导出');
      return;
    }
    const header = ['批次名称', '激活码', '状态', '组织节点', '角色', '有效期至', '使用人', '手机号'];
    const rows = activeBatchCodes.map((item) => [
      item.batchName,
      item.code,
      resolveInviteStatus(item),
      formatPersonOrgPaths(orgNodes, item.orgIds),
      (item.roles || []).join('、'),
      formatDateTimeLabel(item.expiresAt),
      item.usedByName || '',
      item.usedByPhone || ''
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `激活码_${activeBatch?.sample.batchName || inviteBatchName || '批次'}_${formatYmd(new Date())}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast('激活码表格已导出');
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-6xl h-[88vh] max-h-[780px] flex flex-col">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center shrink-0 gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-gray-800">
              邀请用户
              {initialOrgName && <span className="ml-1.5 font-normal text-[#1E5ABB]">至【{initialOrgName}】</span>}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-4 pt-4 grid grid-cols-3 gap-3 shrink-0">
          {INVITE_MODE_TABS.map((tab) => {
            const active = inviteMode === tab.id;
            const Icon = tab.id === 'qrcode' ? QrCode : tab.id === 'code' ? KeyRound : Link2;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => switchInviteMode(tab.id)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                  active
                    ? 'border-[#1E5ABB] bg-[#F4F8FE] shadow-[0_0_0_3px_rgba(30,90,187,0.08)]'
                    : 'border-gray-200 bg-white hover:border-[#1E5ABB]/40 hover:bg-slate-50'
                }`}
              >
                <span
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    active ? 'bg-[#1E5ABB] text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </span>
                <span className="min-w-0">
                  <span className={`block text-[13px] font-bold ${active ? 'text-[#1E5ABB]' : 'text-gray-800'}`}>
                    {tab.label}
                  </span>
                  <span className="block text-[11px] text-gray-400 truncate">{tab.desc}</span>
                </span>
              </button>
            );
          })}
        </div>
        <div className="p-4 min-h-0 flex-1 text-xs overflow-hidden grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-4">
          {inviteMode === 'code' && (
            <div className="rounded-lg border border-blue-100 bg-[#F4F8FE] p-4 space-y-3 overflow-visible relative z-20">
              <div className="flex items-center gap-1.5 text-[#1E5ABB] font-bold">
                <KeyRound className="w-3.5 h-3.5" />
                激活码设置
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1.5">邀请名称 *</label>
                <input
                  value={inviteBatchName}
                  onChange={(event) => setInviteBatchName(event.target.value)}
                  placeholder="如：办公室邀请-20260917"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                />
              </div>
              <OrgCascadeSelect
                orgNodes={orgNodes}
                path={orgPath}
                onChange={(path) => setOrgPath(path.filter(Boolean))}
                label="组织节点 *"
                placeholder="请选择用户所在组织节点"
              />
              <MultiSelectDropdown
                label="用户群组"
                hint="可多选"
                placeholder="-- 暂不归属任何分组 --"
                options={groups.map((group) => ({ id: group.id, label: group.name }))}
                selected={pGroupIds}
                onToggle={toggleGroup}
              />
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-gray-700 font-medium">加入后角色 *</label>
                  <span className="text-[11px] text-gray-400">可多选</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ACCOUNT_ROLE_OPTIONS.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => toggleRole(role)}
                      className={roleChip(pRoles.includes(role))}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1.5">生成数量 *</label>
                <input
                  type="number"
                  min={1}
                  max={Math.max(1, remainingSeats)}
                  value={inviteCount || ''}
                  onChange={(event) => setInviteCount(Math.max(0, Number(event.target.value) || 0))}
                  onBlur={() => {
                    if (inviteCount > remainingSeats) {
                      setInviteCount(remainingSeats);
                      showToast(quotaTip);
                    }
                  }}
                  placeholder="请输入生成数量"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                />
                {selectedLeafOrgId && (
                  <div className="mt-1 text-[11px] text-gray-400">{quotaTip}</div>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-gray-700 font-medium">邀请凭证有效期 *</label>
                  <span className="text-[11px] text-gray-400">默认 24小时，最长 7天</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {INVITE_VALIDITY_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setValidityId(option.id)}
                      className={`h-9 rounded-md border text-xs font-bold cursor-pointer ${
                        validityId === option.id
                          ? 'border-[#1E5ABB] bg-[#1E5ABB] text-white'
                          : 'border-gray-200 text-gray-600 hover:border-[#1E5ABB]/40 bg-white'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={handleGenerateBatch}
                className="w-full h-9 rounded bg-[#1E5ABB] text-white font-bold hover:bg-[#134092] cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                生成激活码
              </button>
            </div>
          )}

          {inviteMode === 'code' ? (
            <div className="rounded-lg border border-gray-200 bg-white min-h-[420px] min-w-0 overflow-hidden grid grid-cols-[minmax(0,1fr)_240px]">
              <div className="flex flex-col min-h-0 min-w-0 border-r border-gray-100">
                <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="font-bold text-gray-800 min-w-0">
                    {activeBatch ? (
                      <>
                        <span className="truncate">{activeBatch.sample.batchName}</span>
                        <span className="ml-1.5 font-normal text-gray-400">
                          （共 {visibleInviteCodes.length} 条
                          {inviteListFilter === 'all' ? `，待激活 ${unusedInviteCodes.length}` : ''}）
                        </span>
                      </>
                    ) : (
                      '激活码列表'
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={copyUnusedCodes}
                      disabled={!unusedInviteCodes.length}
                      className={`h-7 px-2.5 rounded border inline-flex items-center gap-1 font-medium ${
                        unusedInviteCodes.length
                          ? 'border-blue-100 bg-blue-50 text-[#1E5ABB] hover:bg-blue-100 cursor-pointer'
                          : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      <Copy className="w-3 h-3" />
                      一键复制
                    </button>
                    <button
                      type="button"
                      onClick={exportInviteCodes}
                      disabled={!activeBatchCodes.length}
                      className={`h-7 px-2.5 rounded border inline-flex items-center gap-1 ${
                        activeBatchCodes.length
                          ? 'border-gray-200 text-gray-600 hover:border-[#1E5ABB]/40 hover:text-[#1E5ABB] cursor-pointer'
                          : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      <Download className="w-3 h-3" />
                      导出表格
                    </button>
                  </div>
                </div>
                <div className="px-4 py-2 border-b border-gray-50 flex flex-wrap gap-1.5">
                  {([
                    { id: 'all', label: '全部' },
                    { id: '待激活', label: '待激活' },
                    { id: '已激活', label: '已激活' },
                    { id: '已失效', label: '已失效' }
                  ] as const).map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setInviteListFilter(option.id)}
                      className={`h-6 px-2 rounded-full text-[11px] cursor-pointer ${
                        inviteListFilter === option.id
                          ? 'bg-[#1E5ABB] text-white'
                          : 'bg-gray-50 text-gray-500 hover:text-[#1E5ABB]'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <div className="flex-1 overflow-y-auto px-2 py-1">
                  {visibleInviteCodes.length === 0 ? (
                    <div className="h-full min-h-[200px] flex items-center justify-center text-gray-400">
                      {codeBatches.length ? '当前批次暂无匹配激活码' : '尚未生成激活码，请在左侧完成设置后生成'}
                    </div>
                  ) : (
                    visibleInviteCodes.map((item, index) => {
                      const status = resolveInviteStatus(item);
                      const pending = status === '待激活';
                      return (
                        <div
                          key={item.id}
                          className={`flex items-center gap-3 px-2 py-2.5 rounded-lg ${
                            freshCodeIds.includes(item.id) ? 'bg-blue-50/80' : 'hover:bg-slate-50'
                          }`}
                        >
                          <span className="w-5 text-right text-gray-400 shrink-0">{index + 1}.</span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-mono font-bold text-gray-800 tracking-wide">{item.code}</span>
                              {pending ? (
                                <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
                                  待激活
                                </span>
                              ) : status === '已失效' ? (
                                <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">已失效</span>
                              ) : (
                                <span className="text-[11px] text-gray-400 truncate">
                                  已激活
                                  {item.usedByName
                                    ? `：${item.usedByName}${item.usedByPhone ? `（${maskPhone(item.usedByPhone)}）` : ''}`
                                    : ''}
                                </span>
                              )}
                            </div>
                            <div
                              className="mt-0.5 text-[10px] text-gray-400 truncate"
                              title={`${formatPersonOrgPaths(orgNodes, item.orgIds)} · ${(item.roles || []).join('、')} · 至 ${formatDateTimeLabel(item.expiresAt)}`}
                            >
                              {formatPersonOrgPaths(orgNodes, item.orgIds)} · {(item.roles || []).join('、')} · 至{' '}
                              {formatDateTimeLabel(item.expiresAt)}
                            </div>
                          </div>
                          {pending && (
                            <button
                              type="button"
                              title="复制激活码"
                              onClick={() => copyText(item.code, '激活码已复制')}
                              className="w-7 h-7 rounded text-gray-400 hover:text-[#1E5ABB] hover:bg-white flex items-center justify-center cursor-pointer shrink-0"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="px-4 py-3 bg-amber-50/70 border-t border-amber-100 text-[11px] text-amber-800/90 leading-relaxed">
                  激活码规则为一码一人。用户在登录/注册时选择「激活码绑定」，输入任意未过期激活码后，将自动归属该码绑定的机构与角色。
                </div>
              </div>
              <div className="flex flex-col min-h-0 bg-slate-50/40">
                <div className="px-3 py-2.5 border-b border-gray-100 font-bold text-gray-800">
                  已生成激活码
                  <span className="ml-1 font-normal text-gray-400">({codeBatches.length})</span>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                  {codeBatches.length === 0 ? (
                    <div className="py-10 text-center text-gray-400">暂无记录</div>
                  ) : (
                    codeBatches.map((batch) => {
                      const selected = activeBatch?.batchId === batch.batchId;
                      return (
                        <button
                          key={batch.batchId}
                          type="button"
                          onClick={() => {
                            setActiveBatchId(batch.batchId);
                            setInviteListFilter('all');
                          }}
                          className={`w-full text-left rounded-lg border px-2.5 py-2 cursor-pointer ${
                            selected ? 'border-[#1E5ABB] bg-[#F4F8FE]' : 'border-gray-100 bg-white hover:border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-gray-800 truncate">{batch.sample.batchName}</span>
                            <span
                              className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded ${
                                batch.status === '待激活'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : batch.status === '已激活'
                                    ? 'bg-blue-50 text-[#1E5ABB]'
                                    : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {batch.status}
                            </span>
                          </div>
                          <div className="mt-1 h-1 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full bg-[#1E5ABB]"
                              style={{
                                width: `${batch.total ? Math.min(100, (batch.activated / batch.total) * 100) : 0}%`
                              }}
                            />
                          </div>
                          <div className="mt-1 flex items-center justify-between text-[10px] text-gray-400">
                            <span>
                              已激活 {batch.activated} / {batch.total}
                            </span>
                            <span>至 {formatDateTimeLabel(batch.sample.expiresAt)}</span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          ) : (
            <ShareInvitePanel
              key={inviteMode}
              mode={inviteMode}
              orgNodes={orgNodes}
              groups={groups}
              inviteCodes={inviteCodes}
              setInviteCodes={setInviteCodes}
              remainingSeats={remainingSeats}
              quotaTip={selectedLeafOrgId ? quotaTip : ''}
              orgPath={orgPath}
              onOrgPathChange={setOrgPath}
              roles={pRoles}
              onRolesChange={setPRoles}
              groupIds={pGroupIds}
              onGroupIdsChange={setPGroupIds}
              batchName={inviteBatchName}
              onBatchNameChange={setInviteBatchName}
              limit={inviteCount}
              onLimitChange={setInviteCount}
              validityId={validityId}
              onValidityIdChange={setValidityId}
              onToast={showToast}
              onCopy={copyText}
              onGenerated={resetLeftPanel}
            />
          )}
        </div>
        {modalToast && (
          <div className="pointer-events-none absolute left-1/2 top-4 z-[60] -translate-x-1/2 rounded-lg bg-gray-900/95 px-4 py-2.5 text-xs font-medium text-white shadow-xl border border-gray-700">
            {modalToast}
          </div>
        )}
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between gap-2 shrink-0 text-[11px]">
          <button
            type="button"
            onClick={onOpenRecords}
            className="inline-flex items-center gap-1 text-[#1E5ABB] hover:underline cursor-pointer"
          >
            <History className="w-3.5 h-3.5" />
            激活码管理
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 cursor-pointer text-xs"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
