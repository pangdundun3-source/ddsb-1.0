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
  | 'monitoring'
  | 'system_accounts'
  | 'system_logs';

export interface RouteState {
  routeType: AppRouteType;
  activeTab: ActiveTab;
  systemSubTab: SystemSubModule;
  selectedInstitutionId: number | null;
  isCreatingInstitution: boolean;
  isEditingInstitution: boolean;
  isAuthenticated: boolean;
  activeView: 'portal' | 'operation';
}

const cleanHash = (hash: string): string => {
  const withoutHash = hash.startsWith('#') ? hash.slice(1) : hash;
  const withoutLeadingSlash = withoutHash.startsWith('/') ? withoutHash.slice(1) : withoutHash;
  // Remove query params or trailing slash
  return withoutLeadingSlash.split('?')[0].replace(/\/+$/, '');
};

export const hashRouter = {
  getRawHash: (): string => {
    if (typeof window === 'undefined') return '';
    return window.location.hash || '';
  },

  parseRoute: (rawHash?: string): Partial<RouteState> => {
    const hash = cleanHash(rawHash !== undefined ? rawHash : (typeof window !== 'undefined' ? window.location.hash : ''));

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

    if (hash === 'home') {
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
      };
    }

    if (hash === 'monitoring') {
      return {
        routeType: 'monitoring',
        activeTab: 'monitoring',
        isAuthenticated: true,
        activeView: 'operation',
        selectedInstitutionId: null,
        isCreatingInstitution: false,
        isEditingInstitution: false,
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

    if (hash === 'system' || hash === 'system/accounts') {
      return {
        routeType: 'system_accounts',
        activeTab: 'system',
        systemSubTab: 'accounts',
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
      return '#/config';
    }

    if (state.activeTab === 'monitoring') {
      return '#/monitoring';
    }

    if (state.activeTab === 'system') {
      return state.systemSubTab === 'logs' ? '#/system/logs' : '#/system/accounts';
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
    const normalized = targetHash.startsWith('#') ? targetHash : `#${targetHash.startsWith('/') ? targetHash : `/${targetHash}`}`;
    if (window.location.hash !== normalized) {
      window.location.hash = normalized;
    }
  },
};
