import { useMemo, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import {
  Institution,
  InstitutionBusinessRules,
  MpMigrationConfig,
  OtherBusinessConfig,
  WechatMpConfig,
} from '../types';
import { adminShellStorage } from '../services/adminShellStorage';

export type OtherConfigSubNavKey = 'wechat_mp' | 'mp_migration';

interface UseOtherBusinessConfigViewModelOptions {
  institution?: Institution | null;
  rules: InstitutionBusinessRules;
  setRules: Dispatch<SetStateAction<InstitutionBusinessRules>>;
  onSaveRules: (rules: InstitutionBusinessRules) => void;
  defaultOtherBusinessConfig: OtherBusinessConfig;
  onShowToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
}

export const useOtherBusinessConfigViewModel = ({
  institution,
  rules,
  setRules,
  onSaveRules,
  defaultOtherBusinessConfig,
  onShowToast,
}: UseOtherBusinessConfigViewModelOptions) => {
  const [activeSubTab, setActiveSubTab] = useState<OtherConfigSubNavKey>(() =>
    adminShellStorage.readOtherConfigSubTab()
  );
  const [showHelpGuide, setShowHelpGuide] = useState(false);

  const otherConfig = useMemo<OtherBusinessConfig>(
    () => ({
      ...defaultOtherBusinessConfig,
      ...(rules.otherConfig || {}),
    }),
    [defaultOtherBusinessConfig, rules.otherConfig]
  );

  const handleSubTabChange = (key: OtherConfigSubNavKey) => {
    setActiveSubTab(key);
    adminShellStorage.saveOtherConfigSubTab(key);
  };

  const saveOtherConfig = (nextOtherConfig: OtherBusinessConfig) => {
    const updated = { ...rules, otherConfig: nextOtherConfig };
    setRules(updated);
    onSaveRules(updated);
  };

  const handleUpdateWechatMp = (wechatMp: WechatMpConfig) => {
    saveOtherConfig({ ...otherConfig, wechatMp });
  };

  const handleUpdateMigration = (migration: MpMigrationConfig) => {
    saveOtherConfig({ ...otherConfig, migration });
  };

  return {
    state: {
      activeSubTab,
      showHelpGuide,
      otherConfig,
      institutionName: institution?.name || '随州市网信中心',
    },
    actions: {
      setShowHelpGuide,
      handleSubTabChange,
      handleUpdateWechatMp,
      handleUpdateMigration,
      showToast: onShowToast,
    },
  };
};
