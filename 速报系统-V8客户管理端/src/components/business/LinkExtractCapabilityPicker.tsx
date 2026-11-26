import React from 'react';
import {
  LINK_FIELD_FEATURE_OPTIONS,
  type LinkFieldFeature,
  type ValueAddedProvisionLike,
  getLinkVipFeatureDisabledHint,
  hasLinkFieldFeature,
  isLinkFeatureProvisioned,
  normalizeLinkFieldFeatures,
  toggleLinkConfigFeature,
} from '../../shared/linkFieldFeatures';

type Props = {
  linkFeatures?: LinkFieldFeature[] | string[] | null;
  valueAddedItems?: ValueAddedProvisionLike[] | null;
  onChange: (next: LinkFieldFeature[]) => void;
  compact?: boolean;
};

const VIP_OPTIONS = LINK_FIELD_FEATURE_OPTIONS.filter((o) => o.id !== 'screenshot');

/**
 * 链接「配置」：
 * - 链接截图 与 VIP 组互斥
 * - VIP（文本提取 / 图片OCR提取 / 多模态提取）可多选
 * - 再点已选项可取消 → 纯链接
 */
export const LinkExtractCapabilityPicker: React.FC<Props> = ({
  linkFeatures,
  valueAddedItems,
  onChange,
  compact = false,
}) => {
  const selected = normalizeLinkFieldFeatures(linkFeatures);
  const shotActive = hasLinkFieldFeature({ linkFeatures: selected }, 'screenshot');
  const labelCls = compact ? 'text-[10px]' : 'text-[11px]';
  const tabCls = compact ? 'text-[10px] px-1.5 py-1' : 'text-[11px] px-2 py-1';

  const applyToggle = (feature: LinkFieldFeature) => {
    onChange(toggleLinkConfigFeature(selected, feature));
  };

  const pillClass = (active: boolean, available: boolean) =>
    `min-w-max inline-flex items-center justify-center gap-0.5 rounded-md ${tabCls} font-medium whitespace-nowrap transition-colors ${
      !available && !active
        ? 'text-gray-400 cursor-not-allowed'
        : active
          ? 'bg-violet-600 text-white shadow-2xs cursor-pointer'
          : 'text-gray-600 hover:bg-white/90 cursor-pointer'
    }`;

  return (
    <div className="flex items-center gap-2 min-w-0 w-full">
      <span className={`shrink-0 font-medium text-violet-700 ${labelCls}`}>配置</span>
      <div
        className="flex flex-1 min-w-0 items-stretch gap-0 p-0.5 rounded-lg bg-violet-50/80 border border-violet-100 overflow-x-auto"
        aria-label="链接配置"
      >
        <button
          type="button"
          aria-pressed={shotActive}
          title={shotActive ? '链接截图（再点取消）' : '链接截图'}
          onClick={() => applyToggle('screenshot')}
          className={pillClass(shotActive, true)}
        >
          链接截图
        </button>

        <span className="w-px self-stretch bg-violet-200 mx-0.5 my-0.5 shrink-0" aria-hidden />

        {VIP_OPTIONS.map((opt) => {
          const active = hasLinkFieldFeature({ linkFeatures: selected }, opt.id);
          const available = isLinkFeatureProvisioned(opt.id, valueAddedItems);
          const disabledHint = available ? '' : getLinkVipFeatureDisabledHint(opt.id);
          const canClick = available || active;

          return (
            <button
              key={opt.id}
              type="button"
              aria-pressed={active}
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
                applyToggle(opt.id);
              }}
              className={pillClass(active, available)}
            >
              <span>{opt.label}</span>
              <span
                className={`shrink-0 text-[8px] font-bold leading-none ${
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
