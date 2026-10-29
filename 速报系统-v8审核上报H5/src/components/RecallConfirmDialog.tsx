import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface RecallConfirmDialogProps {
  title: string;
  message: string;
  cancelLabel?: string;
  confirmLabel?: string;
  /** warning=撤回提醒；danger=删除确认 */
  variant?: 'warning' | 'danger';
  onCancel: () => void;
  onConfirm: () => void;
}

export const RecallConfirmDialog: React.FC<RecallConfirmDialogProps> = ({
  title,
  message,
  cancelLabel = '取消',
  confirmLabel = '确认撤回',
  variant = 'warning',
  onCancel,
  onConfirm,
}) => {
  const isDanger = variant === 'danger';

  return (
    <div className="absolute inset-0 z-[60] bg-slate-900/55 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white w-[calc(100%-2rem)] max-w-[22rem] rounded-3xl p-3.5 border border-slate-200 shadow-2xl space-y-3 animate-in zoom-in-95 duration-200">
        <div
          className={`flex items-start space-x-2 rounded-2xl p-3 border ${
            isDanger ? 'bg-rose-50 border-rose-200' : 'bg-amber-50 border-amber-200'
          }`}
        >
          <AlertTriangle
            className={`w-4 h-4 shrink-0 mt-0.5 ${isDanger ? 'text-rose-600' : 'text-amber-600'}`}
          />
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-900">{title}</p>
            <p className="text-[11px] leading-relaxed text-slate-600">{message}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`py-3 px-4 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.99] ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800'
                : 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
