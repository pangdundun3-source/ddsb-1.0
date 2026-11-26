/** 审核驳回原因类型（与 PC / 客户管理端口径一致） */
export const REJECT_TYPE_OPTIONS = [
  { value: '信息不完整', template: '信息不完整。补充说明：' },
  { value: '内容重复/同源', template: '内容重复/同源。补充说明：' },
  { value: '属虚假误报', template: '属虚假误报。补充说明：' },
  { value: '非本辖区职责', template: '非本辖区职责。补充说明：' },
  { value: '佐证不足', template: '佐证不足。补充说明：' },
] as const;

export type RejectTypeValue = (typeof REJECT_TYPE_OPTIONS)[number]['value'];

export const getRejectTemplate = (type: string) =>
  REJECT_TYPE_OPTIONS.find((item) => item.value === type)?.template || `${type}。补充说明：`;

export const buildRejectDetail = (type: string, supplement: string) =>
  `${getRejectTemplate(type)}${supplement.trim()}`.trim();
