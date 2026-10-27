import React, { useState } from 'react';
import { Download, Link2, QrCode, RefreshCw } from 'lucide-react';
import type { OrgNode } from '../pages/OrgManagement';
import {
  ACCOUNT_ROLE_OPTIONS,
  EXTERNAL_APP,
  formatPersonOrgPaths,
  type InviteCode,
  type PersonnelGroup
} from '../data/userOrgShared';
import { MultiSelectDropdown } from './FormControls';
import { OrgCascadeSelect } from './OrgCascadeSelect';
import { InviteQrCode, downloadQrCardImage } from './InviteQrCode';

export type ShareInviteMode = 'qrcode' | 'link';

const VALIDITY_OPTIONS = [
  { id: '24h', label: '24小时', hours: 24 },
  { id: '3d', label: '3天', hours: 72 },
  { id: '7d', label: '7天', hours: 168 }
] as const;

const pad = (value: number) => String(value).padStart(2, '0');
const toLocalDateTime = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
const addHours = (hours: number) => toLocalDateTime(new Date(Date.now() + hours * 3600 * 1000));
const formatYmd = (date: Date) => `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
const formatTime = (value?: string) => (value ? value.replace('T', ' ') : '—');

const MODE_META: Record<ShareInviteMode, { prefix: string; label: string; joinVerb: string; path: string }> = {
  qrcode: { prefix: 'QR', label: '二维码', joinVerb: '扫码', path: 'qr' },
  link: { prefix: 'LK', label: '链接', joinVerb: '点击链接', path: 'link' }
};

export const buildShareInviteLink = (mode: ShareInviteMode, code: string) =>
  `https://subao.cn/invite/${MODE_META[mode].path}/${code}`;

const getShareStatus = (item: InviteCode) => {
  const expired =
    item.status === '已过期' ||
    !!item.invalidatedAt ||
    (!!item.expiresAt && new Date(item.expiresAt).getTime() <= Date.now() && item.status !== '已使用');
  if (expired) return '已失效' as const;
  const limit = item.qrLimit || 0;
  const used = item.scannedCount || 0;
  if (item.status === '已使用' || (limit > 0 && used >= limit)) return '已激活' as const;
  return '待激活' as const;
};

export type InviteValidityPresetId = (typeof VALIDITY_OPTIONS)[number]['id'];

interface ShareInvitePanelProps {
  mode: ShareInviteMode;
  orgNodes: OrgNode[];
  groups?: PersonnelGroup[];
  inviteCodes: InviteCode[];
  setInviteCodes: React.Dispatch<React.SetStateAction<InviteCode[]>>;
  remainingSeats: number;
  /** 选中组织节点后展示的可用额度提示 */
  quotaTip?: string;
  /** 与激活码模式共用的左侧配置 */
  orgPath: string[];
  onOrgPathChange: (path: string[]) => void;
  roles: string[];
  onRolesChange: (roles: string[]) => void;
  groupIds?: string[];
  onGroupIdsChange?: (groupIds: string[]) => void;
  batchName: string;
  onBatchNameChange: (name: string) => void;
  limit: number;
  onLimitChange: (limit: number) => void;
  validityId: InviteValidityPresetId;
  onValidityIdChange: (id: InviteValidityPresetId) => void;
  onToast: (message: string) => void;
  onCopy: (text: string, message: string) => void;
  /** 生成成功后回调（用于重置左侧表单） */
  onGenerated?: (created: InviteCode[]) => void;
}

/** 邀请弹窗中的「二维码邀请」「链接邀请」：一码/一链多人加入，按生成数量与有效期控制 */
export const ShareInvitePanel: React.FC<ShareInvitePanelProps> = ({
  mode,
  orgNodes,
  groups = [],
  inviteCodes,
  setInviteCodes,
  remainingSeats,
  quotaTip = '',
  orgPath,
  onOrgPathChange,
  roles,
  onRolesChange,
  groupIds = [],
  onGroupIdsChange,
  batchName,
  onBatchNameChange,
  limit,
  onLimitChange,
  validityId,
  onValidityIdChange,
  onToast,
  onCopy,
  onGenerated
}) => {
  const meta = MODE_META[mode];
  const records = inviteCodes.filter((item) => item.channel === mode);
  const [activeId, setActiveId] = useState<string | null>(() => records[0]?.id || null);
  const active = records.find((item) => item.id === activeId) || null;

  const toggleRole = (option: string) => {
    if (roles.includes(option)) {
      if (roles.length === 1) return;
      onRolesChange(roles.filter((item) => item !== option));
      return;
    }
    onRolesChange([...roles, option]);
  };

  const toggleGroup = (groupId: string) => {
    if (!onGroupIdsChange) return;
    onGroupIdsChange(
      groupIds.includes(groupId) ? groupIds.filter((id) => id !== groupId) : [...groupIds, groupId]
    );
  };

  const getOrgName = (item: InviteCode) => {
    const leafId = [...(item.orgIds || [])].reverse().find((id) => orgNodes.some((node) => node.id === id));
    const nodeName = leafId ? orgNodes.find((node) => node.id === leafId)?.name : undefined;
    if (nodeName) return nodeName;
    const path = formatPersonOrgPaths(orgNodes, item.orgIds || []);
    const leafFromPath = path && path !== '未分配机构' ? path.split('/').pop()?.trim() : '';
    return leafFromPath || item.batchName || '未指定组织节点';
  };

  const handleGenerate = () => {
    const leafOrgId = orgPath[orgPath.length - 1];
    const validity = VALIDITY_OPTIONS.find((item) => item.id === validityId) || VALIDITY_OPTIONS[0];
    const expiresAt = addHours(validity.hours);
    const name = batchName.trim();
    const message = !name
      ? '请填写邀请名称'
      : inviteCodes.some((item) => (item.batchName || '').trim() === name)
        ? '邀请名称已存在，请更换名称'
        : !leafOrgId
          ? '请选择组织节点'
          : groupIds.length === 0
            ? '请至少选择一个用户群组'
            : roles.length === 0
              ? '请至少选择一个加入后角色'
              : !limit || limit < 1
                ? '生成数量需大于 0'
                : remainingSeats <= 0 || limit > remainingSeats
                  ? quotaTip || `本节点剩余可用额度 ${remainingSeats} 人，数量不可超过该额度`
                  : '';
    if (message) {
      onToast(message);
      return;
    }
    const existing = new Set(inviteCodes.map((item) => item.code));
    const now = new Date();
    const makeCode = () => `${meta.prefix}-${now.getFullYear()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    let code = makeCode();
    while (existing.has(code)) code = makeCode();
    const record: InviteCode = {
      id: `${mode}-${now.getTime()}`,
      code,
      batchId: `batch-${mode}-${now.getTime()}`,
      batchName: name,
      orgIds: [leafOrgId],
      roles: [...roles],
      groupIds: groupIds.length ? [...groupIds] : undefined,
      expiresAt,
      createdAt: toLocalDateTime(now),
      status: '未使用',
      channel: mode,
      qrLimit: limit,
      scannedCount: 0
    };
    setInviteCodes((prev) => [record, ...prev]);
    setActiveId(record.id);
    onGenerated?.([record]);
    onToast(`已生成邀请${meta.label}「${name}」`);
  };

  const downloadImage = (item: InviteCode) => {
    downloadQrCardImage({
      value: buildShareInviteLink('qrcode', item.code),
      title: getOrgName(item),
      subtitle: `微信扫码关注「${EXTERNAL_APP.officialAccount}」· 自动加入并绑定`,
      lines: [`角色：${(item.roles || []).join('、')}　上限人数：${item.qrLimit || 0} 人`, `截止：${formatTime(item.expiresAt)}`],
      fileName: `${getOrgName(item)}-邀请二维码.png`
    });
    onToast('二维码图片已下载');
  };

  const ModeIcon = mode === 'qrcode' ? QrCode : Link2;
  const chip = (activeChip: boolean) =>
    `h-7 px-2.5 rounded-full text-[11px] cursor-pointer ${
      activeChip ? 'bg-[#1E5ABB] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-[#1E5ABB]/40'
    }`;

  return (
    <>
      <div className="rounded-lg border border-blue-100 bg-[#F4F8FE] p-4 space-y-3 overflow-visible relative z-20 flex flex-col">
        <div className="flex items-center gap-1.5 text-[#1E5ABB] font-bold">
          <ModeIcon className="w-3.5 h-3.5" />
          {meta.label}设置
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1.5">邀请名称 *</label>
          <input
            value={batchName}
            onChange={(event) => onBatchNameChange(event.target.value)}
            placeholder={`如：${meta.label}邀请-${formatYmd(new Date())}`}
            className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
          />
        </div>
        <OrgCascadeSelect
          orgNodes={orgNodes}
          path={orgPath}
          onChange={(path) => onOrgPathChange(path.filter(Boolean))}
          label="组织节点 *"
          placeholder="请选择用户所在组织节点"
        />
        <MultiSelectDropdown
          label="用户群组 *"
          hint="可多选"
          placeholder="请选择用户群组"
          options={groups.map((group) => ({ id: group.id, label: group.name }))}
          selected={groupIds}
          onToggle={toggleGroup}
        />
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-gray-700 font-medium">加入后角色 *</label>
            <span className="text-[11px] text-gray-400">可多选</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ACCOUNT_ROLE_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => toggleRole(option)}
                className={chip(roles.includes(option))}
              >
                {option}
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
            value={limit || ''}
            onChange={(event) => onLimitChange(Math.max(0, Number(event.target.value) || 0))}
            onBlur={() => {
              if (limit > remainingSeats) {
                onLimitChange(remainingSeats);
                onToast(quotaTip || `本节点剩余可用额度 ${remainingSeats} 人，数量不可超过该额度`);
              }
            }}
            placeholder="请输入生成数量"
            className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
          />
          {quotaTip && <div className="mt-1 text-[11px] text-gray-400">{quotaTip}</div>}
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-gray-700 font-medium">邀请凭证有效期 *</label>
            <span className="text-[11px] text-gray-400">默认 24小时，最长 7天</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {VALIDITY_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onValidityIdChange(option.id)}
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
          onClick={handleGenerate}
          className="mt-auto w-full h-9 rounded bg-[#1E5ABB] text-white font-bold hover:bg-[#134092] cursor-pointer flex items-center justify-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          生成邀请{meta.label}
        </button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white min-h-0 min-w-0 overflow-hidden grid grid-cols-[minmax(0,1fr)_240px]">
        <div className="p-4 flex flex-col items-center justify-center bg-slate-50/60 min-w-0">
          {active ? (
            <div className="w-full max-w-[340px] rounded-xl border border-gray-200 bg-white shadow-sm p-5 flex flex-col items-center">
              <div className="text-sm font-bold text-gray-900 text-center">{getOrgName(active)}</div>
              <div className="mt-1 text-[11px] text-gray-400 text-center">
                {meta.joinVerb}关注「{EXTERNAL_APP.officialAccount}」· 自动加入并绑定
              </div>
              <div className={`mt-4 ${getShareStatus(active) === '待激活' ? '' : 'opacity-40 grayscale'}`}>
                {mode === 'qrcode' ? (
                  <InviteQrCode value={buildShareInviteLink('qrcode', active.code)} size={180} />
                ) : (
                  <div className="w-[260px] rounded-lg border border-dashed border-[#1E5ABB]/40 bg-[#F4F8FE] px-3 py-4 text-center">
                    <Link2 className="w-6 h-6 mx-auto text-[#1E5ABB]" />
                    <div className="mt-2 font-mono text-[12px] text-[#1E5ABB] break-all">
                      {buildShareInviteLink('link', active.code)}
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-3 text-[11px] text-gray-500 text-center space-y-0.5">
                <div>
                  角色：<span className="font-bold text-gray-800">{(active.roles || []).join('、')}</span>　上限：
                  <span className="font-bold text-gray-800">{active.qrLimit || 0}</span> 人
                </div>
                <div>截止：{formatTime(active.expiresAt)}</div>
              </div>
              <div className="mt-4 w-full">
                {mode === 'qrcode' ? (
                  <button
                    type="button"
                    onClick={() => downloadImage(active)}
                    className="w-full h-8 rounded bg-[#1E5ABB] text-white hover:bg-[#134092] font-bold inline-flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    下载图片
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onCopy(buildShareInviteLink(mode, active.code), '邀请链接已复制')}
                    className="w-full h-8 rounded bg-[#1E5ABB] text-white hover:bg-[#134092] font-bold inline-flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    复制链接
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400">
              <ModeIcon className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              在左侧完成设置后生成邀请{meta.label}
            </div>
          )}
        </div>
        <div className="border-l border-gray-100 flex flex-col min-h-0">
          <div className="px-3 py-2.5 border-b border-gray-100 font-bold text-gray-800">
            已生成{meta.label}
            <span className="ml-1 font-normal text-gray-400">({records.length})</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {records.length === 0 ? (
              <div className="py-10 text-center text-gray-400">暂无记录</div>
            ) : (
              records.map((item) => {
                const status = getShareStatus(item);
                const used = item.scannedCount || 0;
                const max = item.qrLimit || 0;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveId(item.id)}
                    className={`w-full text-left rounded-lg border px-2.5 py-2 cursor-pointer ${
                      activeId === item.id ? 'border-[#1E5ABB] bg-[#F4F8FE]' : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-gray-800 truncate" title={item.batchName}>
                        {item.batchName || getOrgName(item)}
                      </span>
                      <span
                        className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded ${
                          status === '待激活'
                            ? 'bg-emerald-50 text-emerald-700'
                            : status === '已激活'
                              ? 'bg-blue-50 text-[#1E5ABB]'
                              : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                    <div className="mt-1 h-1 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-[#1E5ABB]" style={{ width: `${max ? Math.min(100, (used / max) * 100) : 0}%` }} />
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-gray-400">
                      <span>已加入 {used} / {max} 人</span>
                      <span>至 {formatTime(item.expiresAt)}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
};
