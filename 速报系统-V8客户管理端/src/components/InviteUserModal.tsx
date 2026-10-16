import React, { useEffect, useState } from 'react';
import { Copy, Download, History, KeyRound, Link2, QrCode, RefreshCw, X } from 'lucide-react';
import type { OrgNode } from '../pages/OrgManagement';
import {
  ACCOUNT_ROLE_OPTIONS,
  buildOrgIdPath,
  EXTERNAL_APP,
  formatPersonOrgPaths,
  generateActivationCode,
  ORG_MAX_USER_COUNT,
  type InviteCode
} from '../data/userOrgShared';
import { maskPhone } from './PersonAccountDisplay';
import { OrgCascadeSelect } from './OrgCascadeSelect';
import { ShareInvitePanel } from './ShareInvitePanel';
import { Field, MultiSelectDropdown } from './FormControls';

const INVITE_VALIDITY_OPTIONS = [
  { id: '1d', label: '24小时', hours: 24 },
  { id: '7d', label: '7天', hours: 168 },
  { id: '30d', label: '30天', hours: 720 },
  { id: 'custom', label: '自定义' }
] as const;

type InviteValidityId = (typeof INVITE_VALIDITY_OPTIONS)[number]['id'];
type InviteListFilter = 'all' | '未使用' | '已使用' | '已过期';
type InviteMode = 'qrcode' | 'code' | 'link';

const INVITE_COUNT_OPTIONS = [1, 5, 10, 20, 50] as const;

const INVITE_MODE_TABS: Array<{ id: InviteMode; label: string; desc: string }> = [
  { id: 'qrcode', label: '二维码邀请', desc: '线下面对面扫码 / 微信群公开加入' },
  { id: 'code', label: '激活码邀请', desc: '批量发放专属激活码 / 一码一人' },
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
const defaultInviteBatchName = () => `邀请批次-${formatYmd(new Date())}`;

export const resolveInviteStatus = (item: InviteCode) => {
  if (item.status === '已使用') return '已使用' as const;
  if (item.expiresAt && new Date(item.expiresAt).getTime() <= Date.now()) return '已过期' as const;
  return '未使用' as const;
};

interface InviteUserModalProps {
  orgNodes: OrgNode[];
  inviteCodes: InviteCode[];
  setInviteCodes: React.Dispatch<React.SetStateAction<InviteCode[]>>;
  activatedCount: number;
  /** 预先定位的组织节点，邀请加入后归属该节点 */
  initialOrgId?: string;
  onClose: () => void;
  onToast: (message: string) => void;
  onOpenRecords: () => void;
}

/** 邀请用户弹窗：二维码 / 激活码 / 链接三种方式，外部用户数据与外部组织管理共用 */
export const InviteUserModal: React.FC<InviteUserModalProps> = ({
  orgNodes,
  inviteCodes,
  setInviteCodes,
  activatedCount,
  initialOrgId,
  onClose,
  onToast,
  onOpenRecords
}) => {
  const initialOrgPath = buildOrgIdPath(orgNodes, initialOrgId);
  const initialOrgName = initialOrgId ? orgNodes.find((node) => node.id === initialOrgId)?.name : undefined;
  const [inviteMode, setInviteMode] = useState<InviteMode>(readStoredInviteMode);
  const [orgPath, setOrgPath] = useState<string[]>(initialOrgPath);
  const [pRoles, setPRoles] = useState<string[]>(['上报员']);
  const [inviteBatchName, setInviteBatchName] = useState(defaultInviteBatchName);
  const [inviteCount, setInviteCount] = useState(10);
  const [inviteValidity, setInviteValidity] = useState<InviteValidityId>('7d');
  const [inviteExpiry, setInviteExpiry] = useState(() => addHoursLocal(168));
  const [inviteListFilter, setInviteListFilter] = useState<InviteListFilter>('all');
  const [freshCodeIds, setFreshCodeIds] = useState<string[]>([]);

  const remainingSeats = Math.max(0, ORG_MAX_USER_COUNT - activatedCount);
  const selectedLeafOrgId = orgPath[orgPath.length - 1];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const copyText = async (text: string, success: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      onToast(success);
    } catch {
      onToast('复制失败，请手动复制');
    }
  };

  const switchInviteMode = (mode: InviteMode) => {
    setInviteMode(mode);
    if (!pRoles.length) setPRoles(['上报员']);
    localStorage.setItem(INVITE_MODE_STORAGE_KEY, mode);
  };

  const applyValidityPreset = (id: InviteValidityId) => {
    setInviteValidity(id);
    if (id === 'custom') return;
    const option = INVITE_VALIDITY_OPTIONS.find((item) => item.id === id);
    const hours = option && 'hours' in option ? option.hours : 168;
    setInviteExpiry(addHoursLocal(hours));
  };

  const toggleRole = (role: string) => {
    setPRoles((prev) => (prev.includes(role) ? prev.filter((item) => item !== role) : [...prev, role]));
  };

  const handleGenerateBatch = () => {
    if (orgPath.length === 0) {
      onToast('请选择激活码所属机构');
      return;
    }
    if (pRoles.length === 0) {
      onToast('请选择激活码所属角色');
      return;
    }
    if (!inviteExpiry) {
      onToast('请设置激活码有效时间');
      return;
    }
    if (new Date(inviteExpiry).getTime() <= Date.now()) {
      onToast('有效时间必须晚于当前时间');
      return;
    }

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
    const batchName = inviteBatchName.trim() || defaultInviteBatchName();
    const created: InviteCode[] = codes.map((code, index) => ({
      id: `${batchId}-${index + 1}`,
      code,
      batchId,
      batchName,
      orgIds: selectedLeafOrgId ? [selectedLeafOrgId] : [],
      roles: [...pRoles],
      expiresAt: inviteExpiry,
      createdAt: now,
      status: '未使用',
      channel: 'activation_code'
    }));

    setInviteCodes((prev) => [...created, ...prev]);
    setFreshCodeIds(created.map((item) => item.id));
    setInviteListFilter('all');
    onToast(`已生成 ${created.length} 个激活码，有效期至 ${formatDateTimeLabel(inviteExpiry)}`);
  };

  const codeInviteRecords = inviteCodes.filter(
    (item) =>
      item.channel !== 'qrcode' &&
      item.channel !== 'link' &&
      (!initialOrgId || (item.orgIds || []).includes(initialOrgId))
  );
  const unusedInviteCodes = codeInviteRecords.filter((item) => resolveInviteStatus(item) === '未使用');
  const visibleInviteCodes = codeInviteRecords.filter((item) => {
    if (inviteListFilter === 'all') return true;
    return resolveInviteStatus(item) === inviteListFilter;
  });

  const copyUnusedCodes = () => {
    if (!unusedInviteCodes.length) {
      onToast('当前没有未使用的激活码');
      return;
    }
    copyText(unusedInviteCodes.map((item) => item.code).join('\n'), `已复制 ${unusedInviteCodes.length} 个未使用激活码`);
  };

  const exportInviteCodes = () => {
    if (!inviteCodes.length) {
      onToast('暂无激活码可导出');
      return;
    }
    const header = ['批次名称', '激活码', '状态', '所属机构', '角色', '有效期至', '使用人', '手机号'];
    const rows = inviteCodes.map((item) => [
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
    link.download = `激活码_${inviteBatchName || '批次'}_${formatYmd(new Date())}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    onToast('激活码表格已导出');
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[88vh] max-h-[780px] flex flex-col">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center shrink-0 gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-gray-800">
              邀请用户
              {initialOrgName && <span className="ml-1.5 font-normal text-[#1E5ABB]">至【{initialOrgName}】</span>}
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              选择邀请方式，邀请外部人员关注「{EXTERNAL_APP.officialAccount}」并加入
              {initialOrgName ? `「${initialOrgName}」` : '本机构'}
            </p>
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
                激活码批次设置
              </div>
              <OrgCascadeSelect orgNodes={orgNodes} path={orgPath} onChange={(path) => setOrgPath(path.filter(Boolean))} />
              <MultiSelectDropdown
                label="所属角色 *"
                placeholder="请选择激活后归属的角色"
                options={ACCOUNT_ROLE_OPTIONS.map((role) => ({ id: role, label: role }))}
                selected={pRoles}
                onToggle={toggleRole}
              />
              <Field
                label="批次名称"
                value={inviteBatchName}
                onChange={setInviteBatchName}
                placeholder="如：办公室邀请-20260917"
              />
              <div>
                <label className="block text-gray-700 font-medium mb-1.5">单次生成数量</label>
                <div className="flex flex-wrap gap-1.5">
                  {INVITE_COUNT_OPTIONS.map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setInviteCount(count)}
                      className={`h-7 px-2.5 rounded-full text-[11px] cursor-pointer ${
                        inviteCount === count
                          ? 'bg-[#1E5ABB] text-white'
                          : 'bg-white text-gray-600 border border-gray-200 hover:border-[#1E5ABB]/40'
                      }`}
                    >
                      {count}个
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1.5">有效期至 *</label>
                <input
                  type="datetime-local"
                  value={inviteExpiry}
                  onChange={(event) => {
                    setInviteExpiry(event.target.value);
                    setInviteValidity('custom');
                  }}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                />
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {INVITE_VALIDITY_OPTIONS.filter((option) => option.id !== 'custom').map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => applyValidityPreset(option.id)}
                      className={`h-7 px-2.5 rounded-full text-[11px] cursor-pointer ${
                        inviteValidity === option.id
                          ? 'bg-[#1E5ABB] text-white'
                          : 'bg-white text-gray-600 border border-gray-200 hover:border-[#1E5ABB]/40'
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
                生成激活码批次
              </button>
            </div>
          )}

          {inviteMode === 'code' ? (
            <div className="rounded-lg border border-gray-200 bg-white flex flex-col min-h-[420px] min-w-0 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
                <div className="font-bold text-gray-800">
                  激活码列表
                  <span className="ml-1.5 font-normal text-gray-400">
                    （共 {visibleInviteCodes.length} 条
                    {inviteListFilter === 'all' ? `，未使用 ${unusedInviteCodes.length}` : ''}）
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={copyUnusedCodes}
                    className="h-7 px-2.5 rounded border border-blue-100 bg-blue-50 text-[#1E5ABB] font-medium hover:bg-blue-100 cursor-pointer inline-flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    一键复制未用码
                  </button>
                  <button
                    type="button"
                    onClick={exportInviteCodes}
                    className="h-7 px-2.5 rounded border border-gray-200 text-gray-600 hover:border-[#1E5ABB]/40 hover:text-[#1E5ABB] cursor-pointer inline-flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    导出表格
                  </button>
                </div>
              </div>
              <div className="px-4 py-2 border-b border-gray-50 flex flex-wrap gap-1.5">
                {([
                  { id: 'all', label: '全部' },
                  { id: '未使用', label: '未使用' },
                  { id: '已使用', label: '已使用' },
                  { id: '已过期', label: '已过期' }
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
                    尚未生成激活码，请在左侧完成批次设置后生成
                  </div>
                ) : (
                  visibleInviteCodes.map((item, index) => {
                    const status = resolveInviteStatus(item);
                    const unused = status === '未使用';
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
                            {unused ? (
                              <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-[#1E5ABB]">
                                未使用
                              </span>
                            ) : status === '已过期' ? (
                              <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">已过期</span>
                            ) : (
                              <span className="text-[11px] text-gray-400 truncate">
                                已使用
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
                        {unused && (
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
          ) : (
            <ShareInvitePanel
              key={inviteMode}
              mode={inviteMode}
              orgNodes={orgNodes}
              inviteCodes={inviteCodes}
              setInviteCodes={setInviteCodes}
              remainingSeats={remainingSeats}
              initialOrgPath={initialOrgPath}
              onToast={onToast}
              onCopy={copyText}
            />
          )}
        </div>
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between gap-2 shrink-0 text-[11px]">
          <div className="flex items-center gap-3 text-gray-500">
            <span>
              本机构可用名额：已激活 <b className="text-gray-800">{activatedCount}</b> / {ORG_MAX_USER_COUNT} 人，剩余{' '}
              <b className="text-[#1E5ABB]">{remainingSeats}</b> 人
            </span>
            <button
              type="button"
              onClick={onOpenRecords}
              className="inline-flex items-center gap-1 text-[#1E5ABB] hover:underline cursor-pointer"
            >
              <History className="w-3.5 h-3.5" />
              查看邀请记录
            </button>
          </div>
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
