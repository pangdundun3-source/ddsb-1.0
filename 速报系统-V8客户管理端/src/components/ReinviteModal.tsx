import React, { useState } from 'react';
import { Send, X } from 'lucide-react';
import type { OrgNode, PersonnelItem } from '../pages/OrgManagement';
import {
  ACCOUNT_ROLE_OPTIONS,
  buildOrgIdPath,
  generateActivationCode,
  getDeepestOrgId,
  type InviteCode,
  type OfficialAccountFollower
} from '../data/userOrgShared';
import { getPersonAvatarUrl } from './PersonAccountDisplay';
import { OrgCascadeSelect } from './OrgCascadeSelect';

const pad = (value: number) => String(value).padStart(2, '0');
const toLocalDateTime = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
const formatYmd = (date: Date) => `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;

interface ReinviteModalProps {
  target?: PersonnelItem;
  follower?: OfficialAccountFollower;
  orgNodes: OrgNode[];
  inviteCodes: InviteCode[];
  setInviteCodes: React.Dispatch<React.SetStateAction<InviteCode[]>>;
  setPersonnelList: React.Dispatch<React.SetStateAction<PersonnelItem[]>>;
  onClose: () => void;
  onSuccess: (message: string) => void;
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
  const [name, setName] = useState(target?.realName ?? follower?.nickname ?? '');
  const [phone, setPhone] = useState(target?.phone ?? follower?.phone ?? '');
  const [orgPath, setOrgPath] = useState<string[]>(() =>
    target ? buildOrgIdPath(orgNodes, getDeepestOrgId(orgNodes, target.orgIds, target.primaryOrgId)) : []
  );
  const [role, setRole] = useState(target?.roles?.[0] || '上报员');
  const nickname = target ? target.nickname || target.realName : follower?.nickname || '';
  const idPrefix = target ? 'reinvite' : 'oa';
  const [error, setError] = useState('');

  const handleConfirm = () => {
    const realName = name.trim();
    const mobile = phone.trim();
    const leafOrgId = orgPath[orgPath.length - 1];
    const message = !realName
      ? '请填写真实姓名'
      : !/^1\d{10}$/.test(mobile)
        ? '请填写11位手机号码'
        : !leafOrgId
          ? '请选择所属机构'
          : !role
            ? '请选择所属角色'
            : '';
    if (message) {
      setError(message);
      return;
    }

    const existing = new Set(inviteCodes.map((row) => row.code));
    let code = generateActivationCode();
    while (existing.has(code)) code = generateActivationCode();
    const now = new Date();
    const createdAt = toLocalDateTime(now);
    const record: InviteCode = {
      id: `${idPrefix}-${now.getTime()}`,
      code,
      batchId: `batch-${idPrefix}-${now.getTime()}`,
      batchName: `${target ? '重新邀请' : '公众号主动邀请'}-${formatYmd(now)}`,
      orgIds: [leafOrgId],
      roles: [role],
      expiresAt: toLocalDateTime(new Date(now.getTime() + 168 * 3600 * 1000)),
      createdAt,
      status: '未使用',
      channel: 'official_account',
      sentToName: realName,
      sentToWechat: target ? target.wechat : follower?.wechatAlias,
      sentToPhone: mobile,
      sentToFollowerId: follower?.id
    };
    setInviteCodes((prev) => [record, ...prev]);
    if (!target) {
      onSuccess(`已向【${realName}】发送微信邀请，7天内激活有效`);
      onClose();
      return;
    }
    setPersonnelList((prev) =>
      prev.map((row) =>
        row.id === target.id
          ? { ...row, realName, phone: mobile, orgIds: [leafOrgId], primaryOrgId: leafOrgId, roles: [role], reinvitedAt: createdAt }
          : row
      )
    );
    onSuccess(`已向【${realName}】发送微信重新邀请，7天内激活有效`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[560px] text-xs" onClick={(event) => event.stopPropagation()}>
        <div className="px-4 py-3 flex items-center justify-between gap-2 border-b border-gray-100">
          <div className="flex items-center gap-1.5 font-bold text-gray-800 text-sm">
            <Send className="w-4 h-4 text-[#1E5ABB]" />
            邀请资料补充表单
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 space-y-3.5">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-3 flex items-center gap-3">
            {target ? (
              <img
                src={getPersonAvatarUrl(target)}
                alt={target.realName}
                className="w-10 h-10 rounded-full object-cover shrink-0 bg-slate-100"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#6366F1] text-white text-sm font-bold flex items-center justify-center shrink-0">
                {nickname.slice(0, 1) || '?'}
              </div>
            )}
            <div className="min-w-0">
              <div className="text-xs font-bold text-gray-800">微信昵称：{nickname}</div>
              <div className="mt-0.5 text-[11px] text-emerald-700">
                {target
                  ? '该账号已解绑微信，确认后将通过公众号重新发送邀请，用户激活后恢复登录'
                  : '通过机构排查：未在编，允许邀请'}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">真实姓名 *</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="请填写真实姓名"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">手机号码 *</label>
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value.replace(/\D/g, '').slice(0, 11))}
              placeholder="请输入手机号（如：13812345678）"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <OrgCascadeSelect
              orgNodes={orgNodes}
              path={orgPath}
              onChange={(path) => setOrgPath(path.filter(Boolean))}
              label="所属机构 *"
              hideHint
            />
            <div>
              <label className="block text-gray-700 font-medium mb-1">所属角色 *</label>
              <select
                value={role}
                onChange={(event) => setRole(event.target.value)}
                className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
              >
                <option value="">请选择角色</option>
                {ACCOUNT_ROLE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {error && <div className="px-3 py-2 rounded-lg bg-rose-50 border border-rose-100 text-rose-600">{error}</div>}
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full h-10 rounded-lg bg-[#1E5ABB] text-white font-bold hover:bg-[#134092] cursor-pointer inline-flex items-center justify-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            确认邀请
          </button>
        </div>
      </div>
    </div>
  );
};
