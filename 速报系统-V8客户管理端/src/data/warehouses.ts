export type WarehouseCategory = '舆情类' | '融媒体类' | '境外类';
export type WarehouseShareScope = '全机构可见' | '指定人员可见' | '仅本人可见';

export interface WarehouseItem {
  id: string;
  name: string;
  category: WarehouseCategory;
  remark: string;
  apps: string[];
  shareScope: WarehouseShareScope;
  members: string[];
  dataCount: number;
  creator: string;
  updatedAt: string;
  favorited: boolean;
  /** 缺省视为启用，兼容本地已存的旧数据。 */
  enabled?: boolean;
}

export const isWarehouseEnabled = (item: WarehouseItem) => item.enabled !== false;

export const WAREHOUSE_STORAGE_KEY = 'ddsb_warehouses';

export const seedWarehouses = (): WarehouseItem[] => [
  {
    id: 'wh-1',
    name: '舆情报告素材库',
    category: '舆情类',
    remark: '汇集已审核通过的舆情报告素材，供全机构查阅。',
    apps: ['全平台（全域）'],
    shareScope: '全机构可见',
    members: [],
    dataCount: 6,
    creator: '齐杰',
    updatedAt: '2026-09-30 17:48:36',
    favorited: true
  },
  {
    id: 'wh-2',
    name: '宝岛欢度国庆正向库',
    category: '舆情类',
    remark: '国庆期间正向传播素材。',
    apps: ['全平台（全域）'],
    shareScope: '全机构可见',
    members: [],
    dataCount: 45,
    creator: '乐乐',
    updatedAt: '2026-09-30 11:51:32',
    favorited: true
  },
  {
    id: 'wh-3',
    name: '和平统一预警库',
    category: '舆情类',
    remark: '涉和平统一议题的预警线索。',
    apps: ['全平台（全域）'],
    shareScope: '全机构可见',
    members: [],
    dataCount: 28,
    creator: '乐乐',
    updatedAt: '2026-09-30 09:54:41',
    favorited: true
  },
  {
    id: 'wh-4',
    name: '两岸一家亲正向数据库',
    category: '舆情类',
    remark: '两岸交流正向信息归档。',
    apps: ['全平台（全域）'],
    shareScope: '全机构可见',
    members: [],
    dataCount: 16,
    creator: '乐乐',
    updatedAt: '2026-09-29 22:20:10',
    favorited: true
  },
  {
    id: 'wh-5',
    name: '一国两制正向数据库',
    category: '舆情类',
    remark: '一国两制相关正向素材。',
    apps: ['全平台（全域）'],
    shareScope: '全机构可见',
    members: [],
    dataCount: 6,
    creator: '乐乐',
    updatedAt: '2026-09-29 21:01:12',
    favorited: true,
    enabled: false
  }
];

export const saveWarehouses = (list: WarehouseItem[]) => {
  try {
    localStorage.setItem(WAREHOUSE_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Ignore storage failures.
  }
};

export const warehouseNowText = () => {
  const date = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

export interface WarehouseFormValues {
  name: string;
  category: WarehouseCategory;
  remark: string;
  shareScope: WarehouseShareScope;
  members: string[];
}

/** 编辑时更新原仓库，新建时插到列表最前面。 */
export const upsertWarehouse = (
  list: WarehouseItem[],
  values: WarehouseFormValues,
  editing?: WarehouseItem | null
): WarehouseItem[] => {
  if (editing) {
    return list.map((item) => (item.id === editing.id ? { ...item, ...values, updatedAt: warehouseNowText() } : item));
  }
  return [
    {
      id: `wh-${Date.now()}`,
      ...values,
      apps: ['全平台（全域）'],
      dataCount: 0,
      creator: '齐杰',
      updatedAt: warehouseNowText(),
      favorited: false,
      enabled: true
    },
    ...list
  ];
};

export const loadWarehouses = (): WarehouseItem[] => {
  try {
    const raw = localStorage.getItem(WAREHOUSE_STORAGE_KEY);
    if (!raw) return seedWarehouses();
    const parsed = JSON.parse(raw) as WarehouseItem[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : seedWarehouses();
  } catch {
    return seedWarehouses();
  }
};
