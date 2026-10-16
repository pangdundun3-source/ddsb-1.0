export type ClientEditMap = Record<string, boolean>;
export type ClientEditApplyScope = 'new_only' | 'all';

const GLOBAL_DEFAULTS_KEY = 'mt_global_client_edit_defaults';
const institutionKey = (institutionId: string | number) => `mt_inst_client_edit_${institutionId}`;

const readMap = (key: string): ClientEditMap => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

export const readGlobalClientEditDefaults = (): ClientEditMap => readMap(GLOBAL_DEFAULTS_KEY);

export const readInstitutionClientEdit = (institutionId: string | number): ClientEditMap =>
  readMap(institutionKey(institutionId));

export const writeInstitutionClientEdit = (institutionId: string | number, map: ClientEditMap) => {
  localStorage.setItem(institutionKey(institutionId), JSON.stringify(map));
};

/** 机构未单独设置时沿用平台全局默认值，全局也未设置时默认允许编辑 */
export const resolveClientEditEnabled = (institutionMap: ClientEditMap, moduleKey: string): boolean =>
  institutionMap[moduleKey] ?? readGlobalClientEditDefaults()[moduleKey] ?? true;

/**
 * 修改全局默认值。
 * - new_only：已创建机构未单独设置的模块写入旧默认值，保持现状；仅后续新增机构使用新默认值
 * - all：已创建机构该模块统一改为新值
 */
export const updateGlobalClientEditDefault = (
  moduleKey: string,
  value: boolean,
  scope: ClientEditApplyScope,
  existingInstitutionIds: Array<string | number>,
) => {
  const defaults = readGlobalClientEditDefaults();
  const previous = defaults[moduleKey] ?? true;
  existingInstitutionIds.forEach((id) => {
    const map = readInstitutionClientEdit(id);
    if (scope === 'all') {
      map[moduleKey] = value;
    } else if (map[moduleKey] === undefined) {
      map[moduleKey] = previous;
    }
    writeInstitutionClientEdit(id, map);
  });
  localStorage.setItem(GLOBAL_DEFAULTS_KEY, JSON.stringify({ ...defaults, [moduleKey]: value }));
};
