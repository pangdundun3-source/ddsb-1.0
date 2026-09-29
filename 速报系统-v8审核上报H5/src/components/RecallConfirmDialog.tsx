import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface RecallConfirmDialogProps {
  title: string;
  message: string;
  cancelLabel?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export const RecallConfirmDialog: React.FC<RecallConfirmDialogProps> = ({
  title,
  message,
  cancelLabel = '取消',
  confirmLabel = '确认撤回',
  onCancel,
  onConfirm,
}) => {
  return (
    <div className="absolute inset-0 z-[60] bg-slate-900/55 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white w-[calc(100%-2rem)] max-w-[22rem] rounded-3xl p-3.5 border border-slate-200 shadow-2xl space-y-3 animate-in zoom-in-95 duration-200">
        <div className="flex items-start space-x-2 rounded-2xl bg-amber-50 border border-amber-200 p-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
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
            className="py-3 px-4 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.99]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
