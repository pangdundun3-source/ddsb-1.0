import { ActiveTab, DetailTab, SystemSubModule } from '../types';

const STORAGE_KEYS = {
  activeTab: 'admin_active_tab',
  systemSubTab: 'admin_system_sub_tab',
  selectedInstitutionId: 'admin_selected_inst_id',
  isEditingInstitution: 'admin_is_editing_inst',
  isCreatingInstitution: 'admin_is_creating_inst',
  institutionDetailTab: 'admin_inst_detail_active_tab',
  otherConfigSubTab: 'admin_other_config_sub_tab',
} as const;

const activeTabs: ActiveTab[] = ['home', 'institutions', 'config', 'monitoring', 'system'];
const systemSubTabs: SystemSubModule[] = ['accounts', 'logs'];

const read = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const write = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Local storage can be disabled in private or restricted browser contexts.
  }
};

const remove = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch {
    // Local storage can be disabled in private or restricted browser contexts.
  }
};

export const adminShellStorage = {
  readActiveTab: (): ActiveTab => {
    const saved = read(STORAGE_KEYS.activeTab);
    return activeTabs.includes(saved as ActiveTab) ? (saved as ActiveTab) : 'config';
  },

  saveActiveTab: (tab: ActiveTab) => write(STORAGE_KEYS.activeTab, tab),

  readSystemSubTab: (): SystemSubModule => {
    const saved = read(STORAGE_KEYS.systemSubTab);
    return systemSubTabs.includes(saved as SystemSubModule) ? (saved as SystemSubModule) : 'accounts';
  },

  saveSystemSubTab: (tab: SystemSubModule) => write(STORAGE_KEYS.systemSubTab, tab),

  readSelectedInstitutionId: (): number | null => {
    const saved = read(STORAGE_KEYS.selectedInstitutionId);
    if (!saved || saved === 'none' || saved === 'null') return 1;

    const parsed = Number(saved);
    return Number.isFinite(parsed) ? parsed : 1;
  },

  saveSelectedInstitutionId: (id: number | null) => {
    if (id === null) {
      write(STORAGE_KEYS.selectedInstitutionId, 'none');
      return;
    }

    write(STORAGE_KEYS.selectedInstitutionId, String(id));
  },

  readIsEditingInstitution: () => {
    const saved = read(STORAGE_KEYS.isEditingInstitution);
    if (saved === null) return true;
    return saved === 'true';
  },

  saveIsEditingInstitution: (isEditing: boolean) => {
    if (isEditing) {
      write(STORAGE_KEYS.isEditingInstitution, 'true');
      return;
    }

    remove(STORAGE_KEYS.isEditingInstitution);
  },

  readIsCreatingInstitution: () => read(STORAGE_KEYS.isCreatingInstitution) === 'true',

  saveIsCreatingInstitution: (isCreating: boolean) =>
    write(STORAGE_KEYS.isCreatingInstitution, String(isCreating)),

  readInstitutionDetailTab: (): DetailTab => {
    const saved = read(STORAGE_KEYS.institutionDetailTab);
    const validTabs: DetailTab[] = [
      'basic',
      'business_rules',
      'templates',
      'scoring',
      'dictionary',
      'workflow',
      'value_added',
      'qr_code',
      'other',
    ];
    if (saved && validTabs.includes(saved as DetailTab)) {
      if (['templates', 'scoring', 'dictionary', 'workflow', 'value_added', 'qr_code', 'other'].includes(saved)) {
        return 'business_rules';
      }
      return saved as DetailTab;
    }
    return 'business_rules';
  },

  saveInstitutionDetailTab: (tab: DetailTab) =>
    write(STORAGE_KEYS.institutionDetailTab, tab),

  readOtherConfigSubTab: (): 'wechat_mp' | 'mp_migration' => {
    const saved = read(STORAGE_KEYS.otherConfigSubTab);
    return saved === 'mp_migration' ? 'mp_migration' : 'wechat_mp';
  },

  saveOtherConfigSubTab: (tab: 'wechat_mp' | 'mp_migration') =>
    write(STORAGE_KEYS.otherConfigSubTab, tab),
};
