import React from 'react';
import { X } from 'lucide-react';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * 1:1 还原截图的退出账号确认弹窗
 */
export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-[0.5px] p-4 animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-[6px] shadow-[0_6px_16px_0_rgba(0,0,0,0.08),0_3px_6px_-4px_rgba(0,0,0,0.12),0_9px_28px_8px_rgba(0,0,0,0.05)] w-[410px] max-w-[90vw] overflow-hidden select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部标题栏: 标题 "提示" + 右上角关闭叉号 */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <h3 className="text-[16px] font-normal text-[#262626] leading-none tracking-normal">
            提示
          </h3>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 -mr-1 rounded cursor-pointer"
            title="关闭"
          >
            <X className="w-[15px] h-[15px] stroke-[1.8]" />
          </button>
        </div>

        {/* 内容区: 橙黄色感叹号圆圈图标 + "确实是否退出当前账号？" */}
        <div className="px-6 py-4 flex items-center gap-3">
          {/* 橙黄色实心感叹号圆圈 (1:1 截图) */}
          <div className="w-[22px] h-[22px] rounded-full bg-[#faad14] flex-shrink-0 flex items-center justify-center shadow-xs">
            <span className="text-white font-bold text-[14px] leading-none select-none font-sans">
              !
            </span>
          </div>
          <p className="text-[14px] text-[#434343] font-normal leading-relaxed">
            确实是否退出当前账号？
          </p>
        </div>

        {/* 底部按钮栏: 右对齐 取消 / 确定 */}
        <div className="px-6 pt-3 pb-5 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-1.5 rounded-[4px] border border-[#d9d9d9] bg-white text-[#595959] text-[14px] hover:text-[#1677ff] hover:border-[#1677ff] active:bg-gray-50 transition-all cursor-pointer shadow-2xs font-normal"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-1.5 rounded-[4px] bg-[#1677ff] hover:bg-[#4096ff] active:bg-[#0958d9] text-white text-[14px] font-normal transition-all cursor-pointer shadow-[0_2px_0_rgba(5,145,255,0.1)] outline-none"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
};
