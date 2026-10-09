const ASSIGN_KEY = 'ddsb_warehouse_record_map';
/** 旧版单仓库存储中表示“已移出”的值，读取时视为不属于任何仓库。 */
const LEGACY_REMOVED = '__removed__';

/** 记录 ID → 所属仓库 ID 列表。空数组表示已被移出所有仓库，不再自动分配。 */
export type WarehouseAssignment = Record<string, string[]>;

const readMap = (): WarehouseAssignment => {
  try {
    const raw = localStorage.getItem(ASSIGN_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, string | string[]>;
    if (!parsed || typeof parsed !== 'object') return {};
    const map: WarehouseAssignment = {};
    Object.entries(parsed).forEach(([key, value]) => {
      if (Array.isArray(value)) map[key] = value.filter((id) => typeof id === 'string');
      else if (value === LEGACY_REMOVED) map[key] = [];
      else if (typeof value === 'string') map[key] = [value];
    });
    return map;
  } catch {
    return {};
  }
};

const writeMap = (map: WarehouseAssignment) => {
  try {
    localStorage.setItem(ASSIGN_KEY, JSON.stringify(map));
  } catch {
    // Ignore storage failures.
  }
};

const updateRecords = (recordIds: number[], update: (current: string[]) => string[]) => {
  const map = readMap();
  recordIds.forEach((id) => {
    const key = String(id);
    map[key] = Array.from(new Set(update(map[key] ?? [])));
  });
  writeMap(map);
};

export const isInWarehouse = (assignment: WarehouseAssignment, recordId: number, warehouseId: string) =>
  (assignment[String(recordId)] ?? []).includes(warehouseId);

/** 加入仓库：保留已有归属，一条数据可同时属于多个仓库。 */
export const addRecordsToWarehouses = (recordIds: number[], warehouseIds: string[]) =>
  updateRecords(recordIds, (current) => [...current, ...warehouseIds]);

/** 迁移：从来源仓库移到目标仓库，其他仓库的归属不变。 */
export const moveRecordsBetweenWarehouses = (recordIds: number[], fromId: string, toId: string) =>
  updateRecords(recordIds, (current) => [...current.filter((id) => id !== fromId), toId]);

/** 移出指定仓库，其他仓库的归属不变。 */
export const removeRecordsFromWarehouse = (recordIds: number[], warehouseId: string) =>
  updateRecords(recordIds, (current) => current.filter((id) => id !== warehouseId));

/** 把不良信息稳定分到已有仓库。已分配的保持不动，新仓库默认没有历史数据。 */
export const resolveLibraryAssignments = (recordIds: number[], warehouseIds: string[]): WarehouseAssignment => {
  const stored = readMap();
  const valid = new Set(warehouseIds);
  const next: WarehouseAssignment = {};
  if (warehouseIds.length === 0) return next;

  let changed = false;
  for (const id of recordIds) {
    const key = String(id);
    const current = stored[key];
    if (current) {
      const kept = current.filter((wid) => valid.has(wid));
      if (kept.length > 0 || current.length === 0) {
        next[key] = kept;
        continue;
      }
    }
    next[key] = [warehouseIds[Math.abs(id) % warehouseIds.length]];
    changed = true;
  }

  if (changed) writeMap({ ...stored, ...next });

  return next;
};
