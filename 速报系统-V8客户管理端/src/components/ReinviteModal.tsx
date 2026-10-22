import React, { useState } from 'react';
import { Check, UserPlus, X } from 'lucide-react';
import type { OrgNode, PersonnelItem } from '../pages/OrgManagement';
import {
  ACCOUNT_ROLE_OPTIONS,
  buildOrgIdPath,
  EXTERNAL_APP,
  generateActivationCode,
  getDeepestOrgId,
  getOrgFullPath,
  type InviteChannel,
  type InviteCode,
  type OfficialAccountFollower
} from '../data/userOrgShared';
import { getPersonAvatarUrl } from './PersonAccountDisplay';
import { OrgCascadeSelect } from './OrgCascadeSelect';

const pad = (value: number) => String(value).padStart(2, '0');
const toLocalDateTime = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
const formatYmd = (date: Date) => `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
const formatDateTimeLabel = (value: string) => (value ? value.replace('T', ' ') : '—');

const VALIDITY_OPTIONS = [
  { id: '24h', label: '24 小时', hours: 24 },
  { id: '3d', label: '3 天', hours: 72 },
  { id: '7d', label: '7 天', hours: 168 }
] as const;

type ValidityId = (typeof VALIDITY_OPTIONS)[number]['id'];
type InviteType = 'activation_code' | 'qrcode' | 'link';

const INVITE_TYPE_OPTIONS: Array<{ id: InviteType; label: string; channel: InviteChannel }> = [
  { id: 'activation_code', label: '激活码', channel: 'activation_code' },
  { id: 'qrcode', label: '二维码', channel: 'qrcode' },
  { id: 'link', label: '链接', channel: 'link' }
];

interface ReinviteModalProps {
  target?: PersonnelItem;
  follower?: OfficialAccountFollower;
  orgNodes: OrgNode[];
  inviteCodes: InviteCode[];
  setInviteCodes: React.Dispatch<React.SetStateAction<InviteCode[]>>;
  setPersonnelList: React.Dispatch<React.SetStateAction<PersonnelItem[]>>;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onSwitchToBatch?: () => void;
}

export const ReinviteModal: React.FC<ReinviteModalProps> = ({
  target,
  follower,
  orgNodes,
  inviteCodes,
  setInviteCodes,
  setPersonnelList,
  onClose,
  onSuccess
}) => {
  const rootOrg = orgNodes.find((node) => !node.parentId);
  const institutionName = rootOrg?.name || EXTERNAL_APP.name;
  const realName = (target?.realName ?? follower?.nickname ?? '').trim();
  const mobile = (target?.phone ?? follower?.phone ?? '').trim();
  const nickname = target ? target.nickname || target.realName : follower?.nickname || '';

  const [orgPath, setOrgPath] = useState<string[]>(() =>
    target ? buildOrgIdPath(orgNodes, getDeepestOrgId(orgNodes, target.orgIds, target.primaryOrgId)) : []
  );
  const [roles, setRoles] = useState<string[]>(() =>
    target?.roles?.length ? [...target.roles] : [ACCOUNT_ROLE_OPTIONS[0]]
  );
  const [validityId, setValidityId] = useState<ValidityId>('24h');
  const [inviteType, setInviteType] = useState<InviteType>('activation_code');
  const [error, setError] = useState('');

  const idPrefix = target ? 'reinvite' : 'oa';
  const leafOrgId = orgPath[orgPath.length - 1];
  const orgPathLabel = leafOrgId ? getOrgFullPath(orgNodes, leafOrgId) : '';

  const toggleRole = (role: string) => {
    setRoles((prev) => {
      if (prev.includes(role)) {
        if (prev.length === 1) return prev;
        return prev.filter((item) => item !== role);
      }
      return [...prev, role];
    });
  };

  const handleConfirm = () => {
    const validity = VALIDITY_OPTIONS.find((item) => item.id === validityId) || VALIDITY_OPTIONS[0];
    const typeMeta = INVITE_TYPE_OPTIONS.find((item) => item.id === inviteType) || INVITE_TYPE_OPTIONS[0];
    const message = !leafOrgId
      ? '请选择组织节点'
      : roles.length === 0
        ? '请至少选择一个应用角色'
        : !realName
          ? '缺少被邀请人信息'
          : '';
    if (message) {
      setError(message);
      return;
    }

    const existing = new Set(inviteCodes.map((row) => row.code));
    const now = new Date();
    const createdAt = toLocalDateTime(now);
    const expiresAt = toLocalDateTime(new Date(now.getTime() + validity.hours * 3600 * 1000));
    if (new Date(expiresAt).getTime() <= Date.now()) {
      setError('有效时间必须晚于当前时间');
      return;
    }

    const makeCode = () => {
      if (inviteType === 'qrcode') return `QR-${formatYmd(now)}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
      if (inviteType === 'link') return `LK-${formatYmd(now)}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
      return generateActivationCode();
    };
    let code = makeCode();
    while (existing.has(code)) code = makeCode();

    const typeLabel = typeMeta.label;
    const batchName = `${target ? '重新邀请' : '单人邀请'}-${realName}-${formatYmd(now)}`;
    const record: InviteCode = {
      id: `${idPrefix}-${now.getTime()}`,
      code,
      batchId: `batch-${idPrefix}-${now.getTime()}`,
      batchName,
      orgIds: [leafOrgId],
      roles: [...roles],
      expiresAt,
      createdAt,
      status: '未使用',
      channel: typeMeta.channel,
      createdBy: '管理员',
      sentToName: realName,
      sentToWechat: target ? target.wechat : follower?.wechatAlias,
      sentToPhone: mobile || undefined,
      sentToFollowerId: follower?.id,
      ...(inviteType === 'qrcode' || inviteType === 'link' ? { qrLimit: 1, scannedCount: 0 } : {})
    };

    setInviteCodes((prev) => [record, ...prev]);
    if (target) {
      setPersonnelList((prev) =>
        prev.map((row) =>
          row.id === target.id
            ? {
                ...row,
                realName,
                phone: mobile,
                orgIds: [leafOrgId],
                primaryOrgId: leafOrgId,
                roles: [...roles],
                reinvitedAt: createdAt
              }
            : row
        )
      );
    }
    onSuccess(`已生成单人${typeLabel}邀请【${realName}】，有效期至 ${formatDateTimeLabel(expiresAt)}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/45 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-[560px] max-h-[92vh] flex flex-col text-xs"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="px-5 pt-4 pb-3 flex items-start justify-between gap-3 shrink-0 border-b border-gray-100">
          <div className="flex items-start gap-2.5 min-w-0">
            <span className="w-9 h-9 rounded-md bg-blue-50 text-[#1E5ABB] flex items-center justify-center shrink-0">
              <UserPlus className="w-4.5 h-4.5" />
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-gray-900">单人邀请 · {institutionName}</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                为关注公众号「{EXTERNAL_APP.officialAccount}」的用户生成专属邀请凭证
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3.5 overflow-y-auto">
          {(follower || target) && (
            <div className="rounded-lg border border-emerald-100 bg-emerald-50/70 px-3 py-2.5 flex items-center gap-3">
              {target ? (
                <img
                  src={getPersonAvatarUrl(target)}
                  alt={target.realName}
                  className="w-9 h-9 rounded-full object-cover shrink-0 bg-slate-100"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#6366F1] text-white text-sm font-bold flex items-center justify-center shrink-0">
                  {nickname.slice(0, 1) || '?'}
                </div>
              )}
              <div className="min-w-0">
                <div className="text-xs font-bold text-gray-800">
                  微信昵称：{nickname}
                  {mobile ? <span className="ml-2 font-mono font-medium text-slate-600">{mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}</span> : null}
                </div>
                <div className="mt-0.5 text-[11px] text-emerald-700">
                  {target
                    ? '该账号已解绑微信，确认后将重新发送邀请，用户激活后恢复登录'
                    : '通过机构排查：未在编，允许邀请'}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-800">选择组织节点 *</span>
              <span className="text-gray-400">点击选择组织树</span>
            </div>
            <OrgCascadeSelect
              orgNodes={orgNodes}
              path={orgPath}
              onChange={(path) => setOrgPath(path.filter(Boolean))}
              label=""
              hideHint
              placeholder="请选择用户所在组织节点"
            />
            {orgPathLabel && <div className="text-[11px] text-slate-400 truncate">已选：{orgPathLabel}</div>}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-800">应用对应角色 *</span>
              <span className="text-gray-400">可多选</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {ACCOUNT_ROLE_OPTIONS.map((role) => {
                const checked = roles.includes(role);
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRole(role)}
                    className={`px-3 py-2.5 rounded-md border text-left flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                      checked
                        ? 'border-[#1E5ABB] bg-blue-50/60 font-bold text-[#1E5ABB]'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span>{role}</span>
                    <span
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        checked ? 'border-[#1E5ABB] bg-[#1E5ABB] text-white' : 'border-gray-300 bg-white'
                      }`}
                    >
                      {checked && <Check className="w-3 h-3" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-800">邀请凭证有效期 *</span>
              <span className="text-gray-400">默认 24 小时，最长 7 天</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {VALIDITY_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setValidityId(option.id)}
                  className={`h-9 rounded-md border text-xs font-bold cursor-pointer ${
                    validityId === option.id
                      ? 'border-[#1E5ABB] bg-[#1E5ABB] text-white'
                      : 'border-gray-200 text-gray-600 hover:border-[#1E5ABB]/40'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-800">邀请类型 *</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {INVITE_TYPE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setInviteType(option.id)}
                  className={`h-9 rounded-md border text-xs font-bold cursor-pointer ${
                    inviteType === option.id
                      ? 'border-[#1E5ABB] bg-[#1E5ABB] text-white'
                      : 'border-gray-200 text-gray-600 hover:border-[#1E5ABB]/40'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="px-3 py-2 rounded-lg bg-rose-50 border border-rose-100 text-rose-600">{error}</div>
          )}

          <button
            type="button"
            onClick={handleConfirm}
            className="w-full h-10 rounded-md bg-[#1E5ABB] hover:bg-[#134092] text-white text-sm font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            立即邀请
          </button>
        </div>
      </div>
    </div>
  );
};
