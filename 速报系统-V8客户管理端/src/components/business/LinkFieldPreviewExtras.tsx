import React from 'react';
import { Camera, Sparkles } from 'lucide-react';
import {
  type LinkFieldFeature,
  enabledLinkExtractLabels,
  hasLinkAiExtract,
} from '../../shared/linkFieldFeatures';

type FieldLike = { linkFeatures?: LinkFieldFeature[] | string[] | null };

/** 功能配置含 VIP 能力时：链接旁「AI识别」按钮 */
export const LinkAiExtractPreviewButton: React.FC<{ field?: FieldLike }> = ({ field }) => {
  const tip = field ? enabledLinkExtractLabels(field).join('、') : '';
  return (
    <button
      type="button"
      title={tip || 'AI识别'}
      className="shrink-0 px-3 py-2 rounded-lg border border-violet-300 text-violet-700 bg-white text-xs font-bold inline-flex items-center gap-1 cursor-default"
    >
      <Sparkles className="w-3.5 h-3.5" />
      AI识别
    </button>
  );
};

/** @deprecated 请用 LinkAiExtractPreviewButton；保留以免旧引用报错 */
export const LinkAiExtractPreviewBar: React.FC<{ field: FieldLike }> = ({ field }) => {
  if (!hasLinkAiExtract(field)) return null;
  return (
    <div className="flex justify-end">
      <LinkAiExtractPreviewButton field={field} />
    </div>
  );
};

/** 功能配置为「链接截图」时：链接旁仍显示「截图」按钮 */
export const LinkScreenshotPreviewButton: React.FC = () => (
  <button
    type="button"
    className="shrink-0 px-3 py-2 rounded-lg border border-[#1E5ABB] text-[#1E5ABB] bg-white text-xs font-medium inline-flex items-center gap-1 cursor-default"
  >
    <Camera className="w-3.5 h-3.5" />
    截图
  </button>
);
