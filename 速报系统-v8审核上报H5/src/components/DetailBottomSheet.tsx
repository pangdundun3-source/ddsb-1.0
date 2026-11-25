import React from 'react';

interface DetailBottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** 面板背景，默认 slate-100 */
  panelClassName?: string;
  zIndexClassName?: string;
}

/**
 * H5 详情页统一容器：遮罩 + 自下向上弹出，占屏高约 90%。
 */
export const DetailBottomSheet: React.FC<DetailBottomSheetProps> = ({
  open,
  onClose,
  children,
  panelClassName = 'bg-slate-100',
  zIndexClassName = 'z-40',
}) => {
  if (!open) return null;

  return (
    <div
      className={`absolute inset-0 ${zIndexClassName} flex flex-col justify-end bg-black/45 backdrop-blur-xs animate-in fade-in duration-200`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        className={`w-full h-[90%] max-h-[90%] rounded-t-2xl ${panelClassName} flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="shrink-0 pt-2 pb-1 flex justify-center" aria-hidden>
          <span className="h-1 w-10 rounded-full bg-slate-300" />
        </div>
        <div className="min-h-0 flex-1 flex flex-col overflow-hidden">{children}</div>
      </div>
    </div>
  );
};
