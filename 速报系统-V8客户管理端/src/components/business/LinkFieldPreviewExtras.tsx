import React from 'react';
import { Camera, Sparkles } from 'lucide-react';
import {
  type LinkFieldFeature,
  hasLinkAiExtract,
  linkExtractTierLabel,
  resolveLinkExtractTier
} from '../../shared/linkFieldFeatures';

type FieldLike = { linkFeatures?: LinkFieldFeature[] | string[] | null };

/** 填报端形态预览：统一「提取」按钮；档位名称展示在标题旁 */
export const LinkAiExtractPreviewBar: React.FC<{ field: FieldLike }> = ({ field }) => {
  if (!hasLinkAiExtract(field)) return null;
  const tier = resolveLinkExtractTier(field.linkFeatures);
  const tierLabel = linkExtractTierLabel(tier);
  return (
    <div className="rounded-lg border border-violet-100 bg-violet-50/70 px-3 py-2 flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <Sparkles className="w-3.5 h-3.5 shrink-0 text-violet-700" />
          <span className="text-[12px] font-bold text-violet-800 shrink-0">AI 提取</span>
          {tierLabel && (
            <span className="truncate text-[10px] text-violet-500 font-medium">
              {tierLabel}
            </span>
          )}
        </div>
        <p className="text-[11px] text-violet-600/90 mt-0.5 pl-5">
          根据链接自动提取标题、描述等信息并回填表单
        </p>
      </div>
      <button
        type="button"
        className="shrink-0 px-3 py-1.5 rounded-lg border border-violet-300 bg-white text-violet-700 text-xs font-bold inline-flex items-center gap-1 cursor-default"
      >
        <Sparkles className="w-3.5 h-3.5" />
        提取
      </button>
    </div>
  );
};

export const LinkScreenshotPreviewButton: React.FC = () => (
  <button
    type="button"
    className="shrink-0 px-3 py-2 rounded-lg border border-[#1E5ABB] text-[#1E5ABB] bg-white text-xs font-medium inline-flex items-center gap-1 cursor-default"
  >
    <Camera className="w-3.5 h-3.5" />
    截图
  </button>
);
