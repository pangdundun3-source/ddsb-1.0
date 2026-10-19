import { ActiveTab, SystemSubModule } from '../types';

export type AppRouteType =
  | 'login'
  | 'portal'
  | 'home'
  | 'institutions'
  | 'institutions_create'
  | 'institutions_detail'
  | 'institutions_edit'
  | 'config'
  | 'org_config'
  | 'monitoring'
  | 'system_accounts'
  | 'system_logs';

/** 全局 / 机构业务配置二级页签（与 InstitutionBusinessRulesTab 导航 key 对齐） */
export type ConfigModuleKey =
  | 'templates'
  | 'workflow'
  | 'scoring'
  | 'value_added'
  | 'dictionary'
  | 'invite_fields'
  | 'role_permission'
  | 'qr_code'
  | 'other';

export interface RouteState {
  routeType: AppRouteType;
  activeTab: ActiveTab;
  systemSubTab: SystemSubModule;
  selectedInstitutionId: number | null;
  isCreatingInstitution: boolean;
  isEditingInstitution: boolean;
  isAuthenticated: boolean;
  activeView: 'portal' | 'operation';
  /** 业务配置二级导航，如 templates / workflow */
  configModule?: ConfigModuleKey | null;
}

const CONFIG_MODULE_ALIASES: Record<string, ConfigModuleKey> = {
  templates: 'templates',
  template: 'templates',
  report_template: 'templates',
  workflow: 'workflow',
  audit_flow: 'workflow',
  scoring: 'scoring',
  audit_score: 'scoring',
  value_added: 'value_added',
  dictionary: 'dictionary',
  data_dict: 'dictionary',
  invite_fields: 'invite_fields',
  invite: 'invite_fields',
  role_permission: 'role_permission',
  qr_code: 'qr_code',
  other: 'other',
};

const parseHashParts = (rawHash: string): { path: string; params: URLSearchParams } => {
  const withoutHash = rawHash.startsWith('#') ? rawHash.slice(1) : rawHash;
  const [pathPart = '', query = ''] = withoutHash.split('?');
  const path = pathPart.replace(/^\//, '').replace(/\/+$/, '');
  return { path, params: new URLSearchParams(query) };
};

export const normalizeConfigModule = (raw?: string | null): ConfigModuleKey | null => {
  if (!raw) return null;
  return CONFIG_MODULE_ALIASES[raw.trim()] ?? null;
};

const cleanHash = (hash: string): string => parseHashParts(hash).path;

const readConfigModuleFromRaw = (rawHash: string, expectedPath: 'config' | 'org-config'): ConfigModuleKey | null => {
  const { path, params } = parseHashParts(rawHash);
  if (path !== expectedPath) return null;
  return normalizeConfigModule(params.get('module'));
};

export const hashRouter = {
  getRawHash: (): string => {
    if (typeof window === 'undefined') return '';
    return window.location.hash || '';
  },

  getConfigModule: (rawHash?: string): ConfigModuleKey | null => {
    const raw = rawHash !== undefined ? rawHash : typeof window !== 'undefined' ? window.location.hash : '';
    const { path } = parseHashParts(raw);
    if (path === 'config' || path === 'org-config') {
      return readConfigModuleFromRaw(raw, path);
    }
    return null;
  },

  parseRoute: (rawHash?: string): Partial<RouteState> => {
    const raw = rawHash !== undefined ? rawHash : typeof window !== 'undefined' ? window.location.hash : '';
    const hash = cleanHash(raw);

    if (!hash) {
      return {
        routeType: 'institutions_detail',
        activeTab: 'institutions',
        selectedInstitutionId: 1,
        isAuthenticated: true,
        activeView: 'operation',
        isCreatingInstitution: false,
        isEditingInstitution: false,
      };
    }

    if (hash === 'login') {
      return {
        routeType: 'login',
        isAuthenticated: false,
        activeView: 'portal',
      };
    }

    if (hash === 'portal') {
      return {
        routeType: 'portal',
        isAuthenticated: true,
        activeView: 'portal',
      };
    }

    if (hash === 'home' || hash === 'monitoring') {
      return {
        routeType: 'home',
        activeTab: 'home',
        isAuthenticated: true,
        activeView: 'operation',
        selectedInstitutionId: null,
        isCreatingInstitution: false,
        isEditingInstitution: false,
      };
    }

    if (hash === 'institutions/create') {
      return {
        routeType: 'institutions_create',
        activeTab: 'institutions',
        isAuthenticated: true,
        activeView: 'operation',
        selectedInstitutionId: null,
        isCreatingInstitution: true,
        isEditingInstitution: true,
      };
    }

    const detailMatch = hash.match(/^institutions\/detail\/(\d+)$/);
    if (detailMatch) {
      const id = Number(detailMatch[1]);
      return {
        routeType: 'institutions_detail',
        activeTab: 'institutions',
        isAuthenticated: true,
        activeView: 'operation',
        selectedInstitutionId: id,
        isCreatingInstitution: false,
        isEditingInstitution: false,
      };
    }

    const editMatch = hash.match(/^institutions\/edit\/(\d+)$/);
    if (editMatch) {
      const id = Number(editMatch[1]);
      return {
        routeType: 'institutions_edit',
        activeTab: 'institutions',
        isAuthenticated: true,
        activeView: 'operation',
        selectedInstitutionId: id,
        isCreatingInstitution: false,
        isEditingInstitution: true,
      };
    }

    if (hash === 'institutions') {
      return {
        routeType: 'institutions',
        activeTab: 'institutions',
        isAuthenticated: true,
        activeView: 'operation',
        selectedInstitutionId: null,
        isCreatingInstitution: false,
        isEditingInstitution: false,
      };
    }

    if (hash === 'config') {
      return {
        routeType: 'config',
        activeTab: 'config',
        isAuthenticated: true,
        activeView: 'operation',
        selectedInstitutionId: null,
        isCreatingInstitution: false,
        isEditingInstitution: false,
        configModule: readConfigModuleFromRaw(raw, 'config'),
      };
    }

    if (hash === 'org-config') {
      return {
        routeType: 'org_config',
        activeTab: 'org_config',
        isAuthenticated: true,
        activeView: 'operation',
        selectedInstitutionId: null,
        isCreatingInstitution: false,
        isEditingInstitution: false,
        configModule: readConfigModuleFromRaw(raw, 'org-config'),
      };
    }

    if (hash === 'system/logs') {
      return {
        routeType: 'system_logs',
        activeTab: 'system',
        systemSubTab: 'logs',
        isAuthenticated: true,
        activeView: 'operation',
        selectedInstitutionId: null,
        isCreatingInstitution: false,
        isEditingInstitution: false,
      };
    }

    // 账号管理导航已下线，旧链接落到系统日志
    if (hash === 'system' || hash === 'system/accounts') {
      return {
        routeType: 'system_logs',
        activeTab: 'system',
        systemSubTab: 'logs',
        isAuthenticated: true,
        activeView: 'operation',
        selectedInstitutionId: null,
        isCreatingInstitution: false,
        isEditingInstitution: false,
      };
    }

    return {};
  },

  buildHash: (state: {
    isAuthenticated?: boolean;
    activeView?: 'portal' | 'operation';
    activeTab?: ActiveTab;
    systemSubTab?: SystemSubModule;
    selectedInstitutionId?: number | null;
    isCreatingInstitution?: boolean;
    isEditingInstitution?: boolean;
    configModule?: ConfigModuleKey | null;
  }): string => {
    if (state.isAuthenticated === false) {
      return '#/login';
    }

    if (state.activeView === 'portal') {
      return '#/portal';
    }

    if (state.activeTab === 'home') {
      return '#/home';
    }

    if (state.activeTab === 'institutions') {
      if (state.isCreatingInstitution) {
        return '#/institutions/create';
      }
      if (state.selectedInstitutionId !== null && state.selectedInstitutionId !== undefined) {
        return state.isEditingInstitution
          ? `#/institutions/edit/${state.selectedInstitutionId}`
          : `#/institutions/detail/${state.selectedInstitutionId}`;
      }
      return '#/institutions';
    }

    if (state.activeTab === 'config') {
      const currentPath =
        typeof window !== 'undefined' ? parseHashParts(window.location.hash).path : '';
      // 显式传入优先；否则仅在当前已是 config 时保留二级 module，避免从其他页切过来带上旧参数
      const keep =
        state.configModule !== undefined
          ? state.configModule
          : currentPath === 'config'
            ? hashRouter.getConfigModule()
            : null;
      return keep ? `#/config?module=${keep}` : '#/config';
    }

    if (state.activeTab === 'org_config') {
      const currentPath =
        typeof window !== 'undefined' ? parseHashParts(window.location.hash).path : '';
      const keep =
        state.configModule !== undefined
          ? state.configModule
          : currentPath === 'org-config'
            ? hashRouter.getConfigModule()
            : null;
      return keep ? `#/org-config?module=${keep}` : '#/org-config';
    }

    if (state.activeTab === 'monitoring') {
      return '#/monitoring';
    }

    if (state.activeTab === 'system') {
      return '#/system/logs';
    }

    return '#/config';
  },

  syncToUrl: (
    state: {
      isAuthenticated?: boolean;
      activeView?: 'portal' | 'operation';
      activeTab?: ActiveTab;
      systemSubTab?: SystemSubModule;
      selectedInstitutionId?: number | null;
      isCreatingInstitution?: boolean;
      isEditingInstitution?: boolean;
      configModule?: ConfigModuleKey | null;
    },
    replace = false
  ) => {
    if (typeof window === 'undefined') return;
    const targetHash = hashRouter.buildHash(state);
    if (window.location.hash !== targetHash) {
      if (replace && window.history && window.history.replaceState) {
        window.history.replaceState(null, '', targetHash);
      } else {
        window.location.hash = targetHash;
      }
    }
  },

  navigate: (targetHash: string) => {
    if (typeof window === 'undefined') return;
    const normalized = targetHash.startsWith('#')
      ? targetHash
      : `#${targetHash.startsWith('/') ? targetHash : `/${targetHash}`}`;
    if (window.location.hash !== normalized) {
      window.location.hash = normalized;
    }
  },

  /** 更新业务配置二级页签（全局 #/config?module=… / 机构 #/org-config?module=…） */
  setConfigModule: (module: ConfigModuleKey, options?: { isGlobalScope?: boolean; replace?: boolean }) => {
    if (typeof window === 'undefined') return;
    const isGlobal = options?.isGlobalScope !== false;
    const base = isGlobal ? 'config' : 'org-config';
    const targetHash = `#/${base}?module=${module}`;
    if (window.location.hash === targetHash) return;
    if (options?.replace && window.history?.replaceState) {
      window.history.replaceState(null, '', targetHash);
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    } else {
      window.location.hash = targetHash;
    }
  },
};
