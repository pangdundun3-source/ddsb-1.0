import React, { useState } from 'react';
import { Copy, Download, Link2, QrCode, RefreshCw } from 'lucide-react';
import type { OrgNode } from '../pages/OrgManagement';
import {
  ACCOUNT_ROLE_OPTIONS,
  EXTERNAL_APP,
  formatPersonOrgPaths,
  type InviteCode
} from '../data/userOrgShared';
import { OrgCascadeSelect } from './OrgCascadeSelect';
import { InviteQrCode, downloadQrCardImage } from './InviteQrCode';

export type ShareInviteMode = 'qrcode' | 'link';

const LIMIT_OPTIONS = [10, 50, 100, 200, 500] as const;
const VALIDITY_OPTIONS = [
  { id: '7d', label: '7天', hours: 168 },
  { id: '30d', label: '30天', hours: 720 },
  { id: '90d', label: '90天', hours: 2160 }
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
  if (item.expiresAt && new Date(item.expiresAt).getTime() <= Date.now()) return '已过期' as const;
  if ((item.scannedCount || 0) >= (item.qrLimit || 0)) return '已满额' as const;
  return '生效中' as const;
};

interface ShareInvitePanelProps {
  mode: ShareInviteMode;
  orgNodes: OrgNode[];
  inviteCodes: InviteCode[];
  setInviteCodes: React.Dispatch<React.SetStateAction<InviteCode[]>>;
  remainingSeats: number;
  initialOrgPath?: string[];
  onToast: (message: string) => void;
  onCopy: (text: string, message: string) => void;
}

/** 邀请弹窗中的「二维码邀请」「链接邀请」：一码/一链多人加入，按上限人数与有效期控制 */
export const ShareInvitePanel: React.FC<ShareInvitePanelProps> = ({
  mode,
  orgNodes,
  inviteCodes,
  setInviteCodes,
  remainingSeats,
  initialOrgPath,
  onToast,
  onCopy
}) => {
  const meta = MODE_META[mode];
  const scopeOrgId = initialOrgPath?.[initialOrgPath.length - 1];
  const records = inviteCodes.filter(
    (item) => item.channel === mode && (!scopeOrgId || (item.orgIds || []).includes(scopeOrgId))
  );
  const [orgPath, setOrgPath] = useState<string[]>(() => initialOrgPath || []);
  const [role, setRole] = useState<string>('上报员');
  const [limit, setLimit] = useState(100);
  const [validity, setValidity] = useState<string>('30d');
  const [expiry, setExpiry] = useState(() => addHours(720));
  const [activeId, setActiveId] = useState<string | null>(() => records[0]?.id || null);
  const active = records.find((item) => item.id === activeId) || null;

  const getOrgName = (item: InviteCode) => {
    const path = formatPersonOrgPaths(orgNodes, item.orgIds);
    return path.split('/').pop()?.trim() || path || '未指定机构';
  };

  const handleGenerate = () => {
    const leafOrgId = orgPath[orgPath.length - 1];
    const message = !leafOrgId
      ? `请选择${meta.label}所属机构`
      : !role
        ? '请选择加入后的角色'
        : !limit || limit < 1
          ? '上限人数需大于 0'
          : limit > remainingSeats
            ? `上限人数超出本机构剩余可用名额（剩余 ${remainingSeats} 人）`
            : !expiry || new Date(expiry).getTime() <= Date.now()
              ? '有效期必须晚于当前时间'
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
      batchName: `${meta.label}邀请-${formatYmd(now)}`,
      orgIds: [leafOrgId],
      roles: [role],
      expiresAt: expiry,
      createdAt: toLocalDateTime(now),
      status: '未使用',
      channel: mode,
      qrLimit: limit,
      scannedCount: 0
    };
    setInviteCodes((prev) => [record, ...prev]);
    setActiveId(record.id);
    onToast(`已生成邀请${meta.label}`);
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

  const copyInviteText = (item: InviteCode) => {
    const link = buildShareInviteLink('link', item.code);
    onCopy(
      `邀请你加入「${getOrgName(item)}」，点击链接关注「${EXTERNAL_APP.officialAccount}」完成激活：${link}（${formatTime(item.expiresAt).slice(0, 10)} 前有效）`,
      '邀请文案已复制'
    );
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
        <OrgCascadeSelect orgNodes={orgNodes} path={orgPath} onChange={(path) => setOrgPath(path.filter(Boolean))} />
        <div>
          <label className="block text-gray-700 font-medium mb-1.5">加入后角色 *</label>
          <div className="flex flex-wrap gap-1.5">
            {ACCOUNT_ROLE_OPTIONS.map((option) => (
              <button key={option} type="button" onClick={() => setRole(option)} className={chip(role === option)}>
                {option}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1.5">上限人数 *</label>
          <div className="flex flex-wrap gap-1.5">
            {LIMIT_OPTIONS.map((count) => (
              <button key={count} type="button" onClick={() => setLimit(count)} className={chip(limit === count)}>
                {count}人
              </button>
            ))}
          </div>
          <input
            type="number"
            min={1}
            value={limit || ''}
            onChange={(event) => setLimit(Math.max(0, Number(event.target.value) || 0))}
            className="mt-1.5 w-full px-3 py-1.5 border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
          />
          <div className="mt-1 text-[11px] text-gray-400">本机构剩余可用名额 {remainingSeats} 人</div>
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1.5">有效期至 *</label>
          <input
            type="datetime-local"
            value={expiry}
            onChange={(event) => {
              setExpiry(event.target.value);
              setValidity('custom');
            }}
            className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
          />
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {VALIDITY_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setValidity(option.id);
                  setExpiry(addHours(option.hours));
                }}
                className={chip(validity === option.id)}
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
              <div className={`mt-4 ${getShareStatus(active) === '生效中' ? '' : 'opacity-40 grayscale'}`}>
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
              <div className="mt-4 w-full grid grid-cols-2 gap-2">
                {mode === 'qrcode' ? (
                  <button
                    type="button"
                    onClick={() => downloadImage(active)}
                    className="h-8 rounded border border-gray-200 text-gray-700 hover:border-[#1E5ABB] hover:text-[#1E5ABB] font-bold inline-flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    下载图片
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => copyInviteText(active)}
                    className="h-8 rounded border border-gray-200 text-gray-700 hover:border-[#1E5ABB] hover:text-[#1E5ABB] font-bold inline-flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    复制邀请文案
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onCopy(buildShareInviteLink(mode, active.code), '邀请链接已复制')}
                  className="h-8 rounded bg-[#1E5ABB] text-white hover:bg-[#134092] font-bold inline-flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  复制链接
                </button>
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
                      <span className="font-bold text-gray-800 truncate">{getOrgName(item)}</span>
                      <span
                        className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded ${
                          status === '生效中'
                            ? 'bg-emerald-50 text-emerald-700'
                            : status === '已满额'
                              ? 'bg-amber-50 text-amber-700'
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
                      <span>至 {formatTime(item.expiresAt).slice(0, 10)}</span>
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
