/**
 * 报送提交前校验：终审节点是否已配置审核人。
 * 原型按机构维护终审审核人名单；空数组表示该机构终审无人。
 * 「民生诉求核查模板」专门用于演示终审无人提示。
 * 可通过 localStorage `h5_org_final_auditors` 覆盖（JSON：{ "机构名": ["审核人"] }）。
 */
const DEFAULT_ORG_FINAL_AUDITORS: Record<string, string[]> = {
  台中市网信办: ['赵宁', '陈终审'],
  西坝区环保局: ['李审核'],
};

/** 用于演示不同审核人缺失场景 */
export const NO_AUDITOR_BLOCK_TEMPLATE_ID = '突发事件速报模板';
export const DEMO_NO_FINAL_AUDITOR_TEMPLATE_ID = '民生诉求核查模板';
export const COMBINED_AUDITOR_MISSING_TEMPLATE_ID = '专项风险线索模板';

/** 组织节点当前审核人名单；未配置表示该节点暂无审核人 */
const DEFAULT_ORG_NODE_AUDITORS: Record<string, string[]> = {
  西坝区环保局: ['王初审'],
};

const DEMO_NO_FINAL_AUDITOR_TEMPLATE_IDS = new Set([
  DEMO_NO_FINAL_AUDITOR_TEMPLATE_ID,
  COMBINED_AUDITOR_MISSING_TEMPLATE_ID,
]);

function readOverrideMap(): Record<string, string[]> | null {
  try {
    const raw = localStorage.getItem('h5_org_final_auditors');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed as Record<string, string[]>;
  } catch {
    return null;
  }
}

/** 返回机构终审审核人名单；未配置或名单为空表示终审无审核人 */
export function getOrgFinalAuditors(orgName: string): string[] {
  const override = readOverrideMap();
  if (override && Object.prototype.hasOwnProperty.call(override, orgName)) {
    const list = override[orgName];
    return Array.isArray(list) ? list.filter((name) => Boolean(String(name || '').trim())) : [];
  }
  const list = DEFAULT_ORG_FINAL_AUDITORS[orgName];
  return Array.isArray(list) ? [...list] : [];
}

export function getOrgNodeAuditors(orgName: string): string[] {
  const list = DEFAULT_ORG_NODE_AUDITORS[orgName];
  return Array.isArray(list) ? [...list] : [];
}

export function hasOrgFinalAuditors(orgName: string, templateId?: string): boolean {
  if (templateId && DEMO_NO_FINAL_AUDITOR_TEMPLATE_IDS.has(templateId)) return false;
  return getOrgFinalAuditors(orgName).length > 0;
}

export const FINAL_AUDITOR_MISSING_TIP = '当前模板需要完成终审，但您所在机构还未配置终审审核人，因此暂时无法提交。请联系组织管理员补充审核人后再试。';

export interface AuditAssignmentStatus {
  missingOrgAuditor: boolean;
  missingFinalAuditor: boolean;
}

export function getAuditAssignmentStatus(orgName: string, templateId?: string): AuditAssignmentStatus {
  if (templateId === NO_AUDITOR_BLOCK_TEMPLATE_ID) {
    return {
      missingOrgAuditor: false,
      missingFinalAuditor: false,
    };
  }
  const requiresOrgAuditor = templateId === COMBINED_AUDITOR_MISSING_TEMPLATE_ID;
  return {
    missingOrgAuditor: requiresOrgAuditor && getOrgNodeAuditors(orgName).length === 0,
    missingFinalAuditor: !hasOrgFinalAuditors(orgName, templateId),
  };
}

export function getAuditBlockTip(status: AuditAssignmentStatus): string | null {
  if (status.missingOrgAuditor && status.missingFinalAuditor) {
    return '当前模板需要完成组织节点审核和终审，但您所在组织节点和机构尚未配置组织节点审核人和终审人，因此暂时无法提交。请联系组织管理员补充组织节点审核人和终审审核人后再试。';
  }
  if (status.missingOrgAuditor) {
    return '当前模板需要完成组织节点审核，但您所在机构尚未配置组织节点审核人，因此暂时无法提交。请联系组织管理员补充审核人后再试。';
  }
  if (status.missingFinalAuditor) {
    return FINAL_AUDITOR_MISSING_TIP;
  }
  return null;
}
