import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface DialogOptions {
  title?: string;
  okText?: string;
  cancelText?: string;
  /** 删除、清空等不可逆操作：确定按钮显示为红色 */
  danger?: boolean;
}

interface DialogRequest extends DialogOptions {
  id: number;
  kind: 'confirm' | 'alert';
  content: React.ReactNode;
  resolve: (ok: boolean) => void;
}

let nextId = 0;
let pushRequest: ((request: DialogRequest) => void) | null = null;

const open = (kind: DialogRequest['kind'], content: React.ReactNode, options: DialogOptions = {}) =>
  new Promise<boolean>(resolve => {
    if (!pushRequest) {
      resolve(kind === 'alert');
      return;
    }
    pushRequest({ ...options, id: ++nextId, kind, content, resolve });
  });

/** 系统样式的二次确认弹窗，替代 window.confirm */
export const confirmDialog = (content: React.ReactNode, options?: DialogOptions) => open('confirm', content, options);

/** 系统样式的提示弹窗，替代 window.alert */
export const alertDialog = (content: React.ReactNode, options?: DialogOptions) =>
  open('alert', content, options).then(() => undefined);

export const ConfirmDialogHost: React.FC = () => {
  const [queue, setQueue] = useState<DialogRequest[]>([]);
  const current = queue[0];

  useEffect(() => {
    pushRequest = request => setQueue(prev => [...prev, request]);
    return () => {
      pushRequest = null;
    };
  }, []);

  const close = (ok: boolean) => {
    if (!current) return;
    current.resolve(ok);
    setQueue(prev => prev.slice(1));
  };

  useEffect(() => {
    if (!current) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(current.kind === 'alert');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!current) return null;
  const isAlert = current.kind === 'alert';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 backdrop-blur-[0.5px] p-4 animate-fade-in"
      onClick={() => close(isAlert)}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        className="bg-white rounded-[6px] shadow-[0_6px_16px_0_rgba(0,0,0,0.08),0_3px_6px_-4px_rgba(0,0,0,0.12),0_9px_28px_8px_rgba(0,0,0,0.05)] w-[420px] max-w-[90vw] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <h3 className="text-[16px] font-medium text-[#262626] leading-none">{current.title ?? '提示'}</h3>
          <button
            type="button"
            onClick={() => close(isAlert)}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 -mr-1 rounded cursor-pointer"
            title="关闭"
          >
            <X className="w-[15px] h-[15px] stroke-[1.8]" />
          </button>
        </div>

        <div className="px-6 py-4 flex items-start gap-3">
          <div
            className={`w-[22px] h-[22px] rounded-full shrink-0 flex items-center justify-center ${
              current.danger ? 'bg-[#ff4d4f]' : 'bg-[#faad14]'
            }`}
          >
            <span className="text-white font-bold text-[14px] leading-none select-none">!</span>
          </div>
          <div className="text-[14px] text-[#434343] leading-[22px] break-words min-w-0">{current.content}</div>
        </div>

        <div className="px-6 pt-3 pb-5 flex items-center justify-end gap-2.5">
          {!isAlert && (
            <button
              type="button"
              onClick={() => close(false)}
              className="px-4 py-1.5 rounded-[4px] border border-[#d9d9d9] bg-white text-[#595959] text-[14px] hover:text-[#1677ff] hover:border-[#1677ff] transition-all cursor-pointer"
            >
              {current.cancelText ?? '取消'}
            </button>
          )}
          <button
            type="button"
            autoFocus
            onClick={() => close(true)}
            className={`px-4 py-1.5 rounded-[4px] text-white text-[14px] transition-all cursor-pointer outline-none ${
              current.danger ? 'bg-[#ff4d4f] hover:bg-[#ff7875]' : 'bg-[#1677ff] hover:bg-[#4096ff]'
            }`}
          >
            {current.okText ?? (isAlert ? '知道了' : '确定')}
          </button>
        </div>
      </div>
    </div>
  );
};
