import React, { useMemo, useState } from 'react';
import { Copy, History, KeyRound, Link2, MessageCircle, QrCode, Search, X } from 'lucide-react';
import type { OrgNode } from './OrgManagement';
import { formatPersonOrgPaths, type InviteCode } from '../data/userOrgShared';
import { maskPhone } from '../components/PersonAccountDisplay';

type InviteStatus = '未使用' | '已使用' | '已过期';
type ChannelFilter = 'all' | 'activation_code' | 'official_account' | 'qrcode' | 'link';

const STATUS_TABS: Array<{ id: 'all' | InviteStatus; label: string }> = [
  { id: 'all', label: '全部' },
  { id: '已使用', label: '已激活' },
  { id: '未使用', label: '待激活' },
  { id: '已过期', label: '已过期' }
];

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
  const [statusTab, setStatusTab] = useState<'all' | InviteStatus>('all');
  const [channel, setChannel] = useState<ChannelFilter>('all');
  const [keyword, setKeyword] = useState('');

  const counts = useMemo(() => {
    const result: Record<'all' | InviteStatus, number> = { all: inviteCodes.length, 未使用: 0, 已使用: 0, 已过期: 0 };
    inviteCodes.forEach((item) => {
      result[resolveStatus(item)] += 1;
    });
    return result;
  }, [inviteCodes]);

  const records = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return [...inviteCodes]
      .filter((item) => statusTab === 'all' || resolveStatus(item) === statusTab)
      .filter((item) => channel === 'all' || resolveChannel(item) === channel)
      .filter((item) => {
        if (!kw) return true;
        return [item.code, item.batchName, item.usedByName, item.usedByPhone, item.sentToName, item.sentToWechat]
          .filter(Boolean)
          .some((text) => String(text).toLowerCase().includes(kw));
      })
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  }, [inviteCodes, statusTab, channel, keyword]);

  const activationRate = counts.all ? Math.round((counts.已使用 / counts.all) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[88vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#1E5ABB]" />
            <div>
              <h3 className="text-sm font-bold text-gray-900">邀请记录</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                共邀请 {counts.all} 人次，已激活 {counts.已使用} 人，激活率 {activationRate}%
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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
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
                        {target ? (
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
    </div>
  );
};
