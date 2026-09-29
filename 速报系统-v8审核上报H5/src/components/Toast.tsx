import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className="absolute inset-0 z-[70] flex items-center justify-center pointer-events-none transition-all duration-300">
      <div className={`max-w-[82%] px-4 py-2.5 rounded-xl shadow-lg flex items-center space-x-2 text-sm font-medium text-white backdrop-blur-md pointer-events-auto ${
        toast.type === 'success' ? 'bg-slate-900/90 border border-slate-700/50' :
        toast.type === 'error' ? 'bg-red-600/90' : 'bg-blue-600/90'
      }`}>
        {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
        {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-300 shrink-0" />}
        {toast.type === 'info' && <Info className="w-4 h-4 text-blue-300 shrink-0" />}
        <span className="leading-snug">{toast.text}</span>
        <button onClick={onClose} className="p-0.5 hover:bg-white/20 rounded-md transition-colors ml-1">
          <X className="w-3.5 h-3.5 opacity-80" />
        </button>
      </div>
    </div>
  );
};
