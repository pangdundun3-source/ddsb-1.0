import React from 'react';
import { Copy } from 'lucide-react';

interface CopyIconButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  title?: string;
}

export const CopyIconButton: React.FC<CopyIconButtonProps> = ({ onClick, title = '复制' }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    aria-label={title}
    className="inline-flex items-center justify-center w-5 h-5 shrink-0 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
  >
    <Copy className="w-3.5 h-3.5" strokeWidth={1.75} />
  </button>
);
