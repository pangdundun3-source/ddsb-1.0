import { SpeedReport, IdentificationTag } from '../types';

export interface IdentificationInfo {
  tag: IdentificationTag;
  label: string;
  shortLabel: string;
  isOfficial: boolean; // 是否为终审采纳后的正式定标
  badgeClass: string;
  textClass: string;
  bgClass: string;
  borderClass: string;
  dotColor: string;
  summaryTitle: string;
  submitterTip: string; // 普通提交人简化提示
  auditorTip: string;   // 审核员专业查重提示
}

export const IDENTIFICATION_CONFIG: Record<IdentificationTag, IdentificationInfo> = {
  suspected_first: {
    tag: 'suspected_first',
    label: '疑似首发',
    shortLabel: '疑似首发',
    isOfficial: false,
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    textClass: 'text-blue-700',
    bgClass: 'bg-blue-50',
    borderClass: 'border-blue-200',
    dotColor: 'bg-blue-500',
    summaryTitle: '系统预判：疑似首发',
    submitterTip: '经系统初筛比对，暂未发现重复记录，属网格首发线索。',
    auditorTip: '比对范围：不良信息库 + 待审件 + 审核中数据。未命中高相似事件，建议按首发常规流程审核。',
  },
  suspected_repeat: {
    tag: 'suspected_repeat',
    label: '疑似重复',
    shortLabel: '疑似重复',
    isOfficial: false,
    badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',
    textClass: 'text-orange-700',
    bgClass: 'bg-orange-50',
    borderClass: 'border-orange-200',
    dotColor: 'bg-orange-500',
    summaryTitle: '系统预判：疑似重复',
    submitterTip: '系统检测到同区域或同主题已有在审事件，已为您关联比对。',
    auditorTip: '系统快判命中相似标题、地点或存证链接。请审核员重点人工核对时间先后及要素重合度。',
  },
  identifying: {
    tag: 'identifying',
    label: '识别中',
    shortLabel: '识别中',
    isOfficial: false,
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    textClass: 'text-purple-700',
    bgClass: 'bg-purple-50',
    borderClass: 'border-purple-200',
    dotColor: 'bg-purple-500',
    summaryTitle: '系统快判：正在识别',
    submitterTip: '系统正在比对全网不良信息库及待审数据，请稍候查看。',
    auditorTip: '正在异步提取多模态特征指纹与关键词比对，预计数秒后完成预判。',
  },
  official_first: {
    tag: 'official_first',
    label: '首发',
    shortLabel: '首发',
    isOfficial: true,
    badgeClass: 'bg-blue-600 text-white border-blue-600 font-medium shadow-2xs',
    textClass: 'text-blue-700',
    bgClass: 'bg-blue-50',
    borderClass: 'border-blue-300',
    dotColor: 'bg-blue-600',
    summaryTitle: '正式定标：首发',
    submitterTip: '已通过终审采纳并正式定标为首发，已归档入库。',
    auditorTip: '已完成终审定标，正式写入不良信息库，作为后续比对的首发基准件。',
  },
  official_repeat: {
    tag: 'official_repeat',
    label: '重复',
    shortLabel: '重复',
    isOfficial: true,
    badgeClass: 'bg-orange-500 text-white border-orange-500 font-medium shadow-2xs',
    textClass: 'text-orange-700',
    bgClass: 'bg-orange-50',
    borderClass: 'border-orange-300',
    dotColor: 'bg-orange-500',
    summaryTitle: '正式定标：重复',
    submitterTip: '已通过审核采纳并正式定标为重复（已合并关联）。',
    auditorTip: '已完成终审定标，确认为同源重复，已关联首发主件归档。',
  },
};

/**
 * 提交后立刻做预判：系统自动比对不良信息库和待审件+审核中的数据
 * 产生预判结果：疑似首发、疑似重复、识别中
 */
export function calculatePreJudgment(
  report: Partial<SpeedReport>,
  existingReports: SpeedReport[]
): { tag: IdentificationTag; reason: string } {
  // 如果是草稿，不打标
  if (report.status === 'draft') {
    return { tag: 'suspected_first', reason: '' };
  }

  const title = (report.title || '').trim().toLowerCase();
  const address = (report.address || '').trim().toLowerCase();
  const link = (report.matchedLink || '').trim().toLowerCase();
  const currentId = report.id;

  // 找匹配的在审件或已入库件
  const potentialDuplicates = existingReports.filter((other) => {
    if (other.id === currentId) return false;
    if (other.status === 'draft') return false;

    // 1. 同一个 matchedLink 链接匹配
    if (link && other.matchedLink && other.matchedLink.trim().toLowerCase() === link) {
      return true;
    }

    // 2. 同一个地点且标题有关键词重合
    if (address && other.address && other.address.trim().toLowerCase() === address) {
      return true;
    }

    // 3. 标题高相似度判断（关键词重叠）
    if (title && other.title) {
      const otherTitle = other.title.toLowerCase();
      if (title.includes(otherTitle) || otherTitle.includes(title)) {
        return true;
      }
      // 检查突发词、停水、维权、管网等核心词
      const keywords = ['停水', '维权', '横幅', '管网', '沉降', '夜市', '虚假宣传', '危化品', '谣言'];
      for (const kw of keywords) {
        if (title.includes(kw) && otherTitle.includes(kw)) {
          return true;
        }
      }
    }

    return false;
  });

  if (potentialDuplicates.length > 0) {
    const matched = potentialDuplicates[0];
    const matchType = (link && matched.matchedLink === link)
      ? '存证链接一致'
      : (address && matched.address === address)
      ? '发生地点完全重合'
      : '标题关键词高度相似';
    return {
      tag: 'suspected_repeat',
      reason: `比对发现与在审件《${matched.title}》(${matched.authorDept}) ${matchType}，系统自动预判为疑似重复。`,
    };
  }

  return {
    tag: 'suspected_first',
    reason: '比对不良信息库与全部待审及审核中数据，未检索到相同或高相似度件，预判为疑似首发。',
  };
}

/**
 * 最后一轮审核通过（采纳）时才正式定标并入库
 * 结果定成：首发报送 或 重复报送
 */
export function resolveOfficialTag(currentTag?: IdentificationTag): IdentificationTag {
  if (currentTag === 'suspected_repeat') {
    return 'official_repeat';
  }
  return 'official_first';
}
