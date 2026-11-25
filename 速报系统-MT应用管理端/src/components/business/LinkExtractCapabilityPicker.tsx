import React from 'react';
import {
  LINK_EXTRACT_TIER_OPTIONS,
  type LinkExtractTier,
  type LinkFieldFeature,
  type ValueAddedProvisionLike,
  featuresOfLinkExtractTier,
  getLinkExtractTierDisabledHint,
  isLinkExtractTierAvailable,
  resolveLinkExtractTier
} from '../../shared/linkFieldFeatures';

type Props = {
  linkFeatures?: LinkFieldFeature[] | string[] | null;
  valueAddedItems?: ValueAddedProvisionLike[] | null;
  onChange: (next: LinkFieldFeature[]) => void;
  compact?: boolean;
};

/** 链接「提取能力」三档互斥 Tab：按增值开通态灰显不可用档 */
export const LinkExtractCapabilityPicker: React.FC<Props> = ({
  linkFeatures,
  valueAddedItems,
  onChange,
  compact = false
}) => {
  const selected = resolveLinkExtractTier(linkFeatures);
  const labelCls = compact ? 'text-[10px]' : 'text-[11px]';
  const tabCls = compact ? 'text-[10px] px-1.5 py-1' : 'text-[11px] px-2 py-1';

  const selectTier = (tier: LinkExtractTier) => {
    if (!isLinkExtractTierAvailable(tier, valueAddedItems)) return;
    // 再点已选档位 → 清空（仅截图、不提取）
    if (selected === tier) {
      onChange([]);
      return;
    }
    onChange(featuresOfLinkExtractTier(tier));
  };

  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className={`shrink-0 font-medium text-violet-700 ${labelCls}`}>提取能力</span>
      <div
        className="inline-flex items-stretch gap-0.5 p-0.5 rounded-lg bg-violet-50/80 border border-violet-100 min-w-0 max-w-full overflow-x-auto"
        role="tablist"
        aria-label="链接提取档位"
      >
        {LINK_EXTRACT_TIER_OPTIONS.map((opt) => {
          const available = isLinkExtractTierAvailable(opt.id, valueAddedItems);
          const active = selected === opt.id;
          const disabledHint = available
            ? ''
            : getLinkExtractTierDisabledHint(opt.id, valueAddedItems);
          const canClick = available || active;

          return (
            <button
              key={opt.id}
              type="button"
              role="tab"
              aria-selected={active}
              disabled={!canClick}
              title={
                available
                  ? active
                    ? `${opt.label}（再点取消）`
                    : opt.label
                  : disabledHint || opt.label
              }
              onClick={() => {
                if (!available && !active) return;
                if (!available && active) {
                  onChange([]);
                  return;
                }
                selectTier(opt.id);
              }}
              className={`inline-flex items-center justify-center gap-0.5 rounded-md ${tabCls} font-medium whitespace-nowrap transition-colors ${
                !available && !active
                  ? 'text-gray-400 cursor-not-allowed'
                  : active
                    ? 'bg-violet-600 text-white shadow-2xs cursor-pointer'
                    : 'text-gray-600 hover:bg-white/90 cursor-pointer'
              }`}
            >
              <span>{opt.label}</span>
              <span
                className={`text-[8px] font-bold leading-none ${
                  !available ? 'text-gray-400' : active ? 'text-amber-200' : 'text-amber-600'
                }`}
              >
                VIP
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
