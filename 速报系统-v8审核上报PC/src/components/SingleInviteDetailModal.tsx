import React from 'react';
import { X } from 'lucide-react';
import { formatPersonOrgPaths, type InviteCode } from '../data/userOrgShared';
import type { OrgNode } from '../pages/OrgManagement';
import { maskPhone } from './PersonAccountDisplay';

const formatTime = (value?: string) => (value ? value.replace('T', ' ') : '—');

const isInviteExpired = (item: InviteCode) =>
  item.status === '已过期' ||
  !!item.invalidatedAt ||
  (!!item.expiresAt && new Date(item.expiresAt).getTime() <= Date.now() && item.status !== '已使用');

const resolveTab = (item: InviteCode): 'pending' | 'activated' | 'expired' => {
  if (item.status === '已使用') return 'activated';
  if (isInviteExpired(item)) return 'expired';
  return 'pending';
};

const resolveChannel = (item: InviteCode) =>
  item.channel || (item.sentToFollowerId ? 'official_account' : 'activation_code');

/** 单人邀请方式展示：二维码 / 链接 / 激活码 */
const resolveSingleDisplayChannel = (item: InviteCode): 'qrcode' | 'link' | 'activation_code' => {
  const channel = resolveChannel(item);
  if (channel === 'qrcode') return 'qrcode';
  if (channel === 'link') return 'link';
  return 'activation_code';
};

const singleChannelLabel = (item: InviteCode) => {
  const channel = resolveSingleDisplayChannel(item);
  if (channel === 'qrcode') return '二维码';
  if (channel === 'link') return '链接';
  return '激活码';
};

interface SingleInviteDetailModalProps {
  invite: InviteCode;
  orgNodes: OrgNode[];
  onClose: () => void;
  /** 标题，默认「邀请配置详情」 */
  title?: string;
  /** 副标题 */
  subtitle?: string;
}

/** 用户管理「邀请记录」与激活码管理「单人详情」共用 */
export const SingleInviteDetailModal: React.FC<SingleInviteDetailModalProps> = ({
  invite,
  orgNodes,
  onClose,
  title = '邀请配置详情',
  subtitle = '创建时填写的参数，仅供查看'
}) => {
  const tab = resolveTab(invite);
  const displayChannel = resolveSingleDisplayChannel(invite);
  const statusText = tab === 'activated' ? '已激活' : tab === 'expired' ? '已失效' : '待激活';
  const contact =
    invite.sentToWechat ||
    (invite.sentToPhone
      ? maskPhone(invite.sentToPhone)
      : invite.usedByPhone
        ? maskPhone(invite.usedByPhone)
        : '—');

  const rows: Array<{ label: string; value: string }> = [
    {
      label: '邀请对象',
      value: invite.sentToName || invite.usedByName || '—'
    },
    { label: '联系方式', value: contact },
    { label: '邀请方式', value: singleChannelLabel(invite) },
    ...(displayChannel === 'activation_code' ? [{ label: '激活码', value: invite.code || '—' }] : []),
    {
      label: '组织节点',
      value: formatPersonOrgPaths(orgNodes, invite.orgIds) || '—'
    },
    {
      label: '角色',
      value: (invite.roles?.length ? invite.roles : ['—']).join('、')
    },
    { label: '发放时间', value: formatTime(invite.createdAt) },
    { label: '有效期至', value: formatTime(invite.expiresAt) },
    {
      label: '激活时间',
      value: tab === 'activated' ? formatTime(invite.usedAt || invite.createdAt) : '—'
    },
    { label: '状态', value: statusText },
    { label: '发起人', value: invite.createdBy || '系统' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-gray-900">{title}</h4>
            <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-4 text-xs space-y-0">
          <div className="rounded-lg border border-slate-200 divide-y divide-slate-100 overflow-hidden">
            {rows.map((row) => (
              <div key={row.label} className="flex items-start justify-between gap-3 px-3 py-2.5 bg-white">
                <span className="text-slate-500 shrink-0">{row.label}</span>
                <span className="font-medium text-slate-800 text-right break-all">{row.value}</span>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-4 w-full h-9 rounded-md bg-[#1E5ABB] text-white text-xs font-bold cursor-pointer"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
