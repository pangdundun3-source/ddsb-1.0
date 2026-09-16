import { useState } from 'react';
import type { FormEvent } from 'react';
import { CustomWechatMpItem, WechatMpConfig, WechatMpMode } from '../types';
import { formatDateTime } from '../shared/date';

export const defaultCustomMps: CustomWechatMpItem[] = [
  {
    id: 'mp-custom-1',
    mpName: '随州融媒发布 (官方服务号)',
    wechatAccount: 'suizhou_mt_news',
    appId: 'wx78a9103c84df12a9',
    appSecret: '9e3c048b64e5912a7f01c84139281e05',
    originalId: 'gh_88392104bf71',
    authStatus: 'authorized',
    isBound: true,
    boundTime: '2026-08-28 09:30:00',
    createdAt: '2026-08-27 15:20:00',
    remark: '随州市融媒体中心官方认证微信服务号（已开通发稿与模板通知接口）',
  },
  {
    id: 'mp-custom-2',
    mpName: '随州微发布 (政务备用号)',
    wechatAccount: 'suizhou_gov_fb',
    appId: 'wx9921048b7123aa66',
    appSecret: 'a1b2c3d4e5f678901234567890abcdef',
    originalId: 'gh_7729103841aa',
    authStatus: 'authorized',
    isBound: false,
    createdAt: '2026-08-30 11:00:00',
    remark: '网信办公众号备用通道（可随时点击换绑启用）',
  },
];

interface TestResults {
  tested: boolean;
  accessToken: boolean;
  templateMsg: boolean;
  menuApi: boolean;
  userSync: boolean;
  testedAt: string;
  errorMsg?: string;
}

export type BindTargetType = CustomWechatMpItem | 'platform_default';

interface UseWechatMpConfigViewModelOptions {
  institutionName: string;
  config: WechatMpConfig;
  defaultConfig: WechatMpConfig;
  onChangeConfig: (newConfig: WechatMpConfig) => void;
  showToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
  onNavigateToMigration?: () => void;
  onBindStarted?: () => void;
  onBindCancelled?: () => void;
  onBindSucceeded?: (boundToCustom: boolean) => void;
}

export const useWechatMpConfigViewModel = ({
  institutionName,
  config,
  defaultConfig,
  onChangeConfig,
  showToast,
  onNavigateToMigration,
  onBindStarted,
  onBindCancelled,
  onBindSucceeded,
}: UseWechatMpConfigViewModelOptions) => {
  const [formData, setFormData] = useState<WechatMpConfig>(() => {
    const initial = config || defaultConfig;
    return {
      ...initial,
      customMps: initial.customMps && initial.customMps.length > 0 ? initial.customMps : defaultCustomMps,
      isCustomBound: initial.isCustomBound ?? (initial.mode === 'custom_official'),
      sourceMpName: initial.sourceMpName || '点点速报 (平台统配)',
    };
  });

  const [showSecret, setShowSecret] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);

  // 新增/编辑自有公众号弹窗状态
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMp, setEditingMp] = useState<CustomWechatMpItem | null>(null);

  // 换绑确认弹窗状态
  const [showBindConfirmModal, setShowBindConfirmModal] = useState(false);
  const [targetToBind, setTargetToBind] = useState<BindTargetType | null>(null);
  const [isBinding, setIsBinding] = useState(false);

  // 获取当前绑定的公众号名称
  const currentBoundMpName =
    formData.mode === 'platform_default'
      ? '点点速报 (平台统配)'
      : formData.mpName || '随州融媒发布 (官方服务号)';

  // 打开新增自有公众号弹窗
  const openAddModal = () => {
    setEditingMp(null);
    setShowAddModal(true);
  };

  // 打开编辑自有公众号弹窗
  const openEditModal = (mp: CustomWechatMpItem) => {
    setEditingMp(mp);
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setEditingMp(null);
    setShowAddModal(false);
  };

  // 保存新增或编辑的自有公众号
  // 规则 1：新增自有公众号后需要操作换绑才能正式换绑成功（默认 isBound: false）
  const handleSaveCustomMp = (mpData: {
    mpName: string;
    wechatAccount: string;
    appId: string;
    appSecret: string;
    originalId: string;
    remark?: string;
  }) => {
    const list = formData.customMps || [];
    let updatedList: CustomWechatMpItem[];

    if (editingMp) {
      // 编辑
      updatedList = list.map((item) =>
        item.id === editingMp.id
          ? {
              ...item,
              ...mpData,
            }
          : item
      );
      showToast(`已更新自有公众号【${mpData.mpName}】配置`, 'success');
    } else {
      // 新增：默认未换绑
      const newMp: CustomWechatMpItem = {
        id: `mp-custom-${Date.now()}`,
        mpName: mpData.mpName,
        wechatAccount: mpData.wechatAccount,
        appId: mpData.appId,
        appSecret: mpData.appSecret,
        originalId: mpData.originalId,
        authStatus: 'authorized',
        isBound: false, // 新增后需点击换绑
        createdAt: formatDateTime(),
        remark: mpData.remark || '',
      };
      updatedList = [...list, newMp];
      showToast(`已成功录入自有公众号【${mpData.mpName}】！请点击卡片上的【切换通道】完成通道换绑。`, 'info');
    }

    const updatedConfig: WechatMpConfig = {
      ...formData,
      customMps: updatedList,
    };
    setFormData(updatedConfig);
    onChangeConfig(updatedConfig);
    closeAddModal();
  };

  // 删除未启用的自有公众号
  const handleDeleteCustomMp = (id: string) => {
    const target = (formData.customMps || []).find((m) => m.id === id);
    if (!target) return;
    if (target.isBound) {
      showToast('当前正在生效换绑的公众号不可直接删除，请先换绑至其他公众号！', 'warning');
      return;
    }
    const updatedList = (formData.customMps || []).filter((m) => m.id !== id);
    const updatedConfig = {
      ...formData,
      customMps: updatedList,
    };
    setFormData(updatedConfig);
    onChangeConfig(updatedConfig);
    showToast(`已删除自有公众号【${target.mpName}】`, 'info');
  };

  // 打开换绑确认弹窗
  const openBindConfirmModal = (target: BindTargetType) => {
    setTargetToBind(target);
    setShowBindConfirmModal(true);
    onBindStarted?.();
  };

  const closeBindConfirmModal = () => {
    setTargetToBind(null);
    setShowBindConfirmModal(false);
    onBindCancelled?.();
  };

  // 执行正式换绑
  // 规则 1：必须操作换绑才能正式生效
  // 规则 2：多个自有公众号只能启用换绑一个
  const handleExecuteBind = () => {
    if (!targetToBind) return;
    setIsBinding(true);

    window.setTimeout(() => {
      setIsBinding(false);
      const now = formatDateTime();
      const previousMpName = currentBoundMpName;

      let updatedConfig: WechatMpConfig;

      if (targetToBind === 'platform_default') {
        // 换绑回平台默认号
        const updatedList = (formData.customMps || []).map((m) => ({
          ...m,
          isBound: false,
        }));
        updatedConfig = {
          ...formData,
          mode: 'platform_default',
          mpName: '点点速报 (平台统配)',
          wechatAccount: 'diandian_express',
          originalId: 'gh_ddsb_system_default',
          appId: 'wx_ddsb_platform_std',
          authStatus: 'authorized',
          customMps: updatedList,
          activeCustomMpId: undefined,
          sourceMpName: previousMpName,
          lastBoundTime: now,
          isCustomBound: false, // 切换回平台默认号，人员换绑不可再向自有号迁移
        };
        showToast('已回退为【平台统配·点点速报】！人员换绑已暂时锁定。', 'success');
        onBindSucceeded?.(false);
      } else {
        // 换绑至选定的自有公众号 (多个中仅这一个为 isBound: true)
        const updatedList = (formData.customMps || []).map((m) => ({
          ...m,
          isBound: m.id === targetToBind.id,
          boundTime: m.id === targetToBind.id ? now : m.boundTime,
        }));

        updatedConfig = {
          ...formData,
          mode: 'custom_official',
          mpName: targetToBind.mpName,
          wechatAccount: targetToBind.wechatAccount,
          originalId: targetToBind.originalId,
          appId: targetToBind.appId,
          appSecret: targetToBind.appSecret || formData.appSecret,
          authStatus: 'authorized',
          customMps: updatedList,
          activeCustomMpId: targetToBind.id,
          sourceMpName: previousMpName, // 记录原公众号供人员迁移界面做对比
          lastBoundTime: now,
          isCustomBound: true, // 明确标记已成功换绑为自有公众号，满足人员迁移前置条件
        };
        showToast(
          `通道已切换为【${targetToBind.mpName}】！可立即发起采编人员换绑。`,
          'success'
        );
        onBindSucceeded?.(true);
        onNavigateToMigration?.();
      }

      setFormData(updatedConfig);
      onChangeConfig(updatedConfig);
      setShowBindConfirmModal(false);
      setTargetToBind(null);
    }, 600);
  };

  const handleRunDiagnostics = () => {
    setIsTesting(true);
    showToast('正在检测微信接口连接状态...', 'info');

    window.setTimeout(() => {
      setIsTesting(false);
      const isSuccess =
        formData.mode === 'platform_default' ||
        (Boolean(formData.appId) && Boolean(formData.appSecret));
      setTestResults({
        tested: true,
        accessToken: isSuccess,
        templateMsg: isSuccess,
        menuApi: isSuccess,
        userSync: isSuccess,
        testedAt: new Date().toLocaleTimeString(),
      });

      if (isSuccess) {
        const updated = {
          ...formData,
          authStatus: 'authorized' as const,
          lastVerifyTime: formatDateTime(),
        };
        setFormData(updated);
        onChangeConfig(updated);
        showToast('微信公众号接口连接正常！', 'success');
      } else {
        showToast('检测未通过：请确认 AppID 与 AppSecret 是否填写正确', 'warning');
      }
    }, 600);
  };

  const handleSave = (event: FormEvent) => {
    event.preventDefault();
    onChangeConfig(formData);
    showToast('公众号配置已成功保存！', 'success');
  };

  return {
    state: {
      formData,
      currentBoundMpName,
      showSecret,
      showAdvanced,
      isTesting,
      testResults,
      showQrModal,
      showAddModal,
      editingMp,
      showBindConfirmModal,
      targetToBind,
      isBinding,
    },
    actions: {
      setFormData,
      setShowSecret,
      setShowAdvanced,
      setShowQrModal,
      openAddModal,
      openEditModal,
      closeAddModal,
      handleSaveCustomMp,
      handleDeleteCustomMp,
      openBindConfirmModal,
      closeBindConfirmModal,
      handleExecuteBind,
      handleRunDiagnostics,
      handleSave,
      onNavigateToMigration,
    },
  };
};
