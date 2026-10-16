import React, { useMemo, useState } from 'react';
import { ChevronRight, Copy, Download, History, KeyRound, Link2, MessageCircle, QrCode, Search, Users, X } from 'lucide-react';
import type { OrgNode } from './OrgManagement';
import { EXTERNAL_APP, formatPersonOrgPaths, getInviteJoinedMembers, type InviteCode } from '../data/userOrgShared';
import { maskPhone } from '../components/PersonAccountDisplay';
import { InviteQrCode, downloadQrCardImage } from '../components/InviteQrCode';
import { buildShareInviteLink } from '../components/ShareInvitePanel';

type InviteStatus = '未使用' | '已使用' | '已过期';
type ChannelFilter = 'all' | 'activation_code' | 'official_account' | 'qrcode' | 'link';

type ValidityTab = 'all' | 'active' | 'activated' | 'expired';

const STATUS_TABS: Array<{ id: ValidityTab; label: string }> = [
  { id: 'all', label: '全部' },
  { id: 'active', label: '生效中' },
  { id: 'activated', label: '已激活' },
  { id: 'expired', label: '已过期' }
];

const isInviteExpired = (item: InviteCode) =>
  !!item.expiresAt && new Date(item.expiresAt).getTime() <= Date.now();

const resolveTab = (item: InviteCode): Exclude<ValidityTab, 'all'> => {
  if (item.status === '已使用') return 'activated';
  return isInviteExpired(item) ? 'expired' : 'active';
};

const CHANNEL_OPTIONS: Array<{ id: ChannelFilter; label: string }> = [
  { id: 'all', label: '全部方式' },
  { id: 'qrcode', label: '二维码邀请' },
  { id: 'link', label: '链接邀请' },
  { id: 'activation_code', label: '激活码邀请' },
  { id: 'official_account', label: '公众号邀请' }
];

const STATUS_STYLES: Record<InviteStatus, { label: string; className: string; dot: string }> = {
  已使用: { label: '已激活', className: 'border-emerald-200 bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  未使用: { label: '待激活', className: 'border-blue-200 bg-blue-50 text-[#1E5ABB]', dot: 'bg-[#1E5ABB]' },
  已过期: { label: '已过期', className: 'border-slate-200 bg-slate-50 text-slate-500', dot: 'bg-slate-400' }
};

const resolveStatus = (item: InviteCode): InviteStatus => {
  if (item.status === '已使用') return '已使用';
  if (item.expiresAt && new Date(item.expiresAt).getTime() <= Date.now()) return '已过期';
  return '未使用';
};

const resolveChannel = (item: InviteCode): Exclude<ChannelFilter, 'all'> =>
  item.channel || (item.sentToFollowerId ? 'official_account' : 'activation_code');

const formatTime = (value?: string) => (value ? value.replace('T', ' ') : '—');

interface InviteRecordModalProps {
  inviteCodes: InviteCode[];
  orgNodes: OrgNode[];
  onClose: () => void;
  onCopy: (text: string, message: string) => void;
}

export const InviteRecordModal: React.FC<InviteRecordModalProps> = ({ inviteCodes, orgNodes, onClose, onCopy }) => {
  const [statusTab, setStatusTab] = useState<ValidityTab>('all');
  const [channel, setChannel] = useState<ChannelFilter>('all');
  const [keyword, setKeyword] = useState('');
  const [memberInvite, setMemberInvite] = useState<InviteCode | null>(null);
  const [memberKeyword, setMemberKeyword] = useState('');
  const [viewInvite, setViewInvite] = useState<InviteCode | null>(null);

  const joinedMembers = useMemo(() => {
    if (!memberInvite) return [];
    const kw = memberKeyword.trim().toLowerCase();
    return getInviteJoinedMembers(memberInvite).filter(
      (member) => !kw || member.name.toLowerCase().includes(kw) || member.phone.includes(kw)
    );
  }, [memberInvite, memberKeyword]);

  const openMembers = (item: InviteCode) => {
    setMemberKeyword('');
    setMemberInvite(item);
  };

  const counts = useMemo(() => {
    const result: Record<ValidityTab, number> = { all: inviteCodes.length, active: 0, activated: 0, expired: 0 };
    inviteCodes.forEach((item) => {
      result[resolveTab(item)] += 1;
    });
    return result;
  }, [inviteCodes]);

  const records = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return [...inviteCodes]
      .filter((item) => statusTab === 'all' || resolveTab(item) === statusTab)
      .filter((item) => channel === 'all' || resolveChannel(item) === channel)
      .filter((item) => {
        if (!kw) return true;
        return [item.code, item.batchName, item.usedByName, item.usedByPhone, item.sentToName, item.sentToWechat]
          .filter(Boolean)
          .some((text) => String(text).toLowerCase().includes(kw));
      })
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  }, [inviteCodes, statusTab, channel, keyword]);

  const activationRate = counts.all ? Math.round((counts.activated / counts.all) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[88vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#1E5ABB]" />
            <div>
              <h3 className="text-sm font-bold text-gray-900">邀请记录</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                共邀请 {counts.all} 人次，已激活 {counts.activated} 人，激活率 {activationRate}%
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusTab(tab.id)}
                className={`px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                  statusTab === tab.id ? 'bg-white text-[#1E5ABB] font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
                <span className="ml-1 font-mono text-[11px] opacity-70">{counts[tab.id]}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value as ChannelFilter)}
              className="h-8 px-2 border border-gray-200 rounded text-xs bg-white focus:outline-none focus:border-[#1E5ABB]"
            >
              {CHANNEL_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="激活码 / 批次 / 邀请对象"
                className="h-8 w-56 pl-8 pr-2 border border-gray-200 rounded text-xs focus:outline-none focus:border-[#1E5ABB]"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto px-5 py-3">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-y border-slate-200">
                <th className="py-2.5 px-3 text-center w-12 whitespace-nowrap">序号</th>
                <th className="py-2.5 px-3 whitespace-nowrap">邀请方式</th>
                <th className="py-2.5 px-3 whitespace-nowrap">激活码 / 批次</th>
                <th className="py-2.5 px-3 whitespace-nowrap">所属机构 / 角色</th>
                <th className="py-2.5 px-3 whitespace-nowrap">邀请对象 / 激活人</th>
                <th className="py-2.5 px-3 whitespace-nowrap">邀请时间</th>
                <th className="py-2.5 px-3 whitespace-nowrap">有效期至</th>
                <th className="py-2.5 px-3 whitespace-nowrap">状态</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-center sticky right-0 bg-slate-50 shadow-[-6px_0_8px_-6px_rgba(15,23,42,0.15)]">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400">
                    暂无匹配的邀请记录
                  </td>
                </tr>
              ) : (
                records.map((item, index) => {
                  const status = resolveStatus(item);
                  const statusStyle = STATUS_STYLES[status];
                  const recordChannel = resolveChannel(item);
                  const isOfficial = recordChannel === 'official_account';
                  const isLink = recordChannel === 'link';
                  const isQr = recordChannel === 'qrcode' || isLink;
                  const target = isQr
                    ? `已${isLink ? '通过链接' : '扫码'}加入 ${item.scannedCount || 0} / ${item.qrLimit || 0} 人`
                    : item.usedByName
                    ? `${item.usedByName}${item.usedByPhone ? `（${maskPhone(item.usedByPhone)}）` : ''}`
                    : item.sentToName
                      ? `${item.sentToName}${item.sentToWechat ? `（微信：${item.sentToWechat}）` : ''}`
                      : '';
                  return (
                    <tr key={item.id} className="hover:bg-blue-50/20">
                      <td className="py-2.5 px-3 text-center text-gray-400 font-mono">{index + 1}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {isLink ? (
                          <span className="inline-flex items-center gap-1 text-sky-700">
                            <Link2 className="w-3.5 h-3.5" />
                            链接邀请
                          </span>
                        ) : isQr ? (
                          <span className="inline-flex items-center gap-1 text-violet-700">
                            <QrCode className="w-3.5 h-3.5" />
                            二维码邀请
                          </span>
                        ) : isOfficial ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700">
                            <MessageCircle className="w-3.5 h-3.5" />
                            公众号邀请
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[#1E5ABB]">
                            <KeyRound className="w-3.5 h-3.5" />
                            激活码邀请
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <span className="font-mono font-bold text-gray-800">{item.code}</span>
                          {status === '未使用' && !isQr && (
                            <button
                              type="button"
                              title="复制激活码"
                              onClick={() => onCopy(item.code, '激活码已复制')}
                              className="w-5 h-5 rounded text-gray-400 hover:text-[#1E5ABB] flex items-center justify-center cursor-pointer"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-400 mt-0.5">{item.batchName}</div>
                      </td>
                      <td className="py-2.5 px-3 max-w-[220px]">
                        <div className="truncate" title={formatPersonOrgPaths(orgNodes, item.orgIds)}>
                          {formatPersonOrgPaths(orgNodes, item.orgIds)}
                        </div>
                        <div className="text-[11px] text-gray-400 mt-0.5">{(item.roles || []).join('、') || '—'}</div>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {isQr ? (
                          <button
                            type="button"
                            disabled={!item.scannedCount}
                            onClick={() => openMembers(item)}
                            title={item.scannedCount ? '查看已激活人员' : '暂无人员加入'}
                            className="inline-flex items-center gap-0.5 text-[#1E5ABB] hover:underline disabled:text-gray-400 disabled:no-underline cursor-pointer disabled:cursor-default"
                          >
                            {target}
                            {!!item.scannedCount && <ChevronRight className="w-3.5 h-3.5" />}
                          </button>
                        ) : target ? (
                          <span className={item.usedByName ? 'font-medium text-gray-800' : 'text-gray-600'}>{target}</span>
                        ) : (
                          <span className="text-gray-300">未指定</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-mono text-gray-500">{formatTime(item.createdAt)}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-mono text-gray-500">{formatTime(item.expiresAt)}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-bold ${statusStyle.className}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                          {isQr && status === '未使用' ? '生效中' : statusStyle.label}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-center sticky right-0 bg-white shadow-[-6px_0_8px_-6px_rgba(15,23,42,0.15)]">
                        <button
                          type="button"
                          onClick={() => setViewInvite(item)}
                          className="inline-flex items-center gap-1 text-[#1E5ABB] hover:underline cursor-pointer"
                        >
                          {isLink ? (
                            <Link2 className="w-3.5 h-3.5" />
                          ) : isQr ? (
                            <QrCode className="w-3.5 h-3.5" />
                          ) : (
                            <KeyRound className="w-3.5 h-3.5" />
                          )}
                          {isLink ? '查看链接' : isQr ? '查看二维码' : '查看激活码'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
          <span>共 {records.length} 条记录</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded border border-gray-200 text-gray-600 text-xs hover:bg-gray-50 cursor-pointer"
          >
            关闭
          </button>
        </div>
      </div>

      {memberInvite && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4"
          onClick={(e) => {
            e.stopPropagation();
            setMemberInvite(null);
          }}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <Users className="w-4 h-4 text-[#1E5ABB] shrink-0" />
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-gray-900">
                    已激活人员
                    <span className="ml-1.5 font-mono text-[#1E5ABB]">
                      {memberInvite.scannedCount || 0} / {memberInvite.qrLimit || 0}
                    </span>
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                    {memberInvite.batchName} · {memberInvite.code} · 加入至
                    {formatPersonOrgPaths(orgNodes, memberInvite.orgIds) || '—'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMemberInvite(null)}
                className="w-7 h-7 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
              <span className="text-[11px] text-gray-400">按加入时间倒序</span>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  value={memberKeyword}
                  onChange={(e) => setMemberKeyword(e.target.value)}
                  placeholder="姓名 / 手机号"
                  className="h-8 w-48 pl-8 pr-2 border border-gray-200 rounded text-xs focus:outline-none focus:border-[#1E5ABB]"
                />
              </div>
            </div>

            <div className="flex-1 overflow-auto px-5 py-3">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-y border-slate-200">
                    <th className="py-2.5 px-3 text-center w-12 whitespace-nowrap">序号</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">姓名</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">手机号</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">激活时间</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {joinedMembers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-gray-400">
                        暂无匹配的人员
                      </td>
                    </tr>
                  ) : (
                    joinedMembers.map((member, index) => (
                      <tr key={member.id} className="hover:bg-blue-50/20">
                        <td className="py-2.5 px-3 text-center text-gray-400 font-mono">{index + 1}</td>
                        <td className="py-2.5 px-3 font-medium text-gray-800 whitespace-nowrap">{member.name}</td>
                        <td className="py-2.5 px-3 font-mono text-gray-600 whitespace-nowrap">{maskPhone(member.phone)}</td>
                        <td className="py-2.5 px-3 font-mono text-gray-500 whitespace-nowrap">{member.joinedAt}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-bold border-emerald-200 bg-emerald-50 text-emerald-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            已激活
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
              <span>共 {joinedMembers.length} 人</span>
              <button
                type="button"
                onClick={() => setMemberInvite(null)}
                className="px-4 py-1.5 rounded border border-gray-200 text-gray-600 text-xs hover:bg-gray-50 cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {viewInvite && (() => {
        const viewChannel = resolveChannel(viewInvite);
        const viewIsLink = viewChannel === 'link';
        const viewIsQr = viewChannel === 'qrcode';
        const expired = isInviteExpired(viewInvite);
        const used = resolveStatus(viewInvite) === '已使用';
        const orgName = formatPersonOrgPaths(orgNodes, viewInvite.orgIds) || '—';
        const shareLink = buildShareInviteLink(viewIsLink ? 'link' : 'qrcode', viewInvite.code);
        const title = viewIsLink ? '邀请链接' : viewIsQr ? '邀请二维码' : '激活码';
        return (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4"
            onClick={(e) => {
              e.stopPropagation();
              setViewInvite(null);
            }}
          >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-gray-900">{title}</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                    {viewInvite.batchName} · {viewInvite.code}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewInvite(null)}
                  className="w-7 h-7 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 flex flex-col items-center">
                <div className="text-sm font-bold text-gray-900 text-center">{orgName}</div>
                <div className="mt-1 text-[11px] text-gray-400 text-center">
                  {viewIsQr
                    ? `微信扫码关注「${EXTERNAL_APP.officialAccount}」· 自动加入并绑定`
                    : viewIsLink
                      ? `点击链接关注「${EXTERNAL_APP.officialAccount}」· 自动加入并绑定`
                      : `关注「${EXTERNAL_APP.officialAccount}」后输入激活码完成激活`}
                </div>

                <div className={`relative mt-4 ${expired || used ? 'opacity-40 grayscale' : ''}`}>
                  {viewIsQr ? (
                    <InviteQrCode value={shareLink} size={180} />
                  ) : viewIsLink ? (
                    <div className="w-[280px] rounded-lg border border-dashed border-[#1E5ABB]/40 bg-[#F4F8FE] px-3 py-4 text-center">
                      <Link2 className="w-6 h-6 mx-auto text-[#1E5ABB]" />
                      <div className="mt-2 font-mono text-[12px] text-[#1E5ABB] break-all">{shareLink}</div>
                    </div>
                  ) : (
                    <div className="w-[280px] rounded-lg border border-dashed border-[#1E5ABB]/40 bg-[#F4F8FE] px-3 py-5 text-center">
                      <KeyRound className="w-6 h-6 mx-auto text-[#1E5ABB]" />
                      <div className="mt-2 font-mono text-xl font-bold tracking-wider text-[#1E5ABB]">{viewInvite.code}</div>
                    </div>
                  )}
                </div>
                {(expired || used) && (
                  <div className="mt-2 text-[11px] font-bold text-slate-500">
                    {used ? '该激活码已被使用' : `该${title}已过期，无法继续使用`}
                  </div>
                )}

                <div className="mt-3 text-[11px] text-gray-500 text-center space-y-0.5">
                  <div>
                    角色：<span className="font-bold text-gray-800">{(viewInvite.roles || []).join('、') || '—'}</span>
                    {(viewIsQr || viewIsLink) && (
                      <>
                        　上限：<span className="font-bold text-gray-800">{viewInvite.qrLimit || 0}</span> 人
                      </>
                    )}
                  </div>
                  <div>有效期至：{formatTime(viewInvite.expiresAt)}</div>
                </div>

                <div className={`mt-4 w-full grid gap-2 ${viewIsQr ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {viewIsQr && (
                    <button
                      type="button"
                      onClick={() =>
                        downloadQrCardImage({
                          value: shareLink,
                          title: orgName,
                          subtitle: `微信扫码关注「${EXTERNAL_APP.officialAccount}」· 自动加入并绑定`,
                          lines: [
                            `角色：${(viewInvite.roles || []).join('、')}　上限人数：${viewInvite.qrLimit || 0} 人`,
                            `截止：${formatTime(viewInvite.expiresAt)}`
                          ],
                          fileName: `${orgName}-邀请二维码.png`
                        })
                      }
                      className="h-8 rounded border border-gray-200 text-gray-700 text-xs hover:border-[#1E5ABB] hover:text-[#1E5ABB] font-bold inline-flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      下载图片
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      viewIsQr || viewIsLink
                        ? onCopy(shareLink, '邀请链接已复制')
                        : onCopy(viewInvite.code, '激活码已复制')
                    }
                    className="h-8 rounded bg-[#1E5ABB] text-white text-xs hover:bg-[#134092] font-bold inline-flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {viewIsQr || viewIsLink ? '复制链接' : '复制激活码'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
