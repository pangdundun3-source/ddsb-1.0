import React, { useState } from 'react';
import { CustomWechatMpItem, WechatMpConfig } from '../../types';
import {
  BindTargetType,
  defaultCustomMps,
  useWechatMpConfigViewModel,
} from '../../viewmodels/useWechatMpConfigViewModel';

export const defaultWechatMpConfig: WechatMpConfig = {
  mode: 'custom_official',
  mpName: '随州融媒发布 (官方服务号)',
  wechatAccount: 'suizhou_mt_news',
  originalId: 'gh_88392104bf71',
  appId: 'wx78a9103c84df12a9',
  appSecret: '9e3c048b64e5912a7f01c84139281e05',
  serverUrl: 'https://api.subao-mt.gov.cn/wechat/gateway/inst-suizhou-01',
  token: 'SubaoMtSuizhouToken2026',
  encodingAesKey: 'k8d9F73jK19LmNPqRstUVwXyzABcDEfgHIJKLMN2026',
  encryptMode: 'secure',
  authStatus: 'authorized',
  lastVerifyTime: '2026-08-30 22:15:30',
  qrCodeUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80',
  templates: {
    warningTemplateId: 'OPENTM417283910_SUBAO_ALERT_01',
    dispatchTemplateId: 'OPENTM409182374_TASK_DISPATCH_02',
    reviewCompleteTemplateId: 'OPENTM418291034_AUDIT_NOTIFY_03',
    dailyReportTemplateId: 'OPENTM401928371_DAILY_DIGEST_04',
  },
  jsSafeDomains: ['subao-mt.gov.cn', 'm.suizhou.gov.cn', 'app.suizhou-news.cn'],
  ipWhitelist: '120.79.182.55, 114.116.240.89, 139.198.12.30',
  remark: '随州市融媒体中心官方认证微信服务号（已开通发稿与模板通知接口）',
  customMps: defaultCustomMps,
  activeCustomMpId: 'mp-custom-1',
  sourceMpName: '点点速报 (平台统配)',
  lastBoundTime: '2026-08-28 09:30:00',
  isCustomBound: true,
};

/** access=仅接入建档；switch=仅切换通道；all=两者都可 */
export type WechatMpWizardPhase = 'access' | 'switch' | 'all';

interface WechatMpConfigSectionProps {
  institutionName: string;
  config: WechatMpConfig;
  onChangeConfig: (newConfig: WechatMpConfig) => void;
  showToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
  onNavigateToMigration?: () => void;
  layout?: 'full' | 'guide' | 'drawer';
  /** 向导阶段：拆开「录入」与「切换发稿通道」 */
  wizardPhase?: WechatMpWizardPhase;
  onBindStarted?: () => void;
  onBindCancelled?: () => void;
  onBindSucceeded?: (boundToCustom: boolean) => void;
}

export const WechatMpConfigSection: React.FC<WechatMpConfigSectionProps> = ({
  institutionName,
  config,
  onChangeConfig,
  showToast,
  onNavigateToMigration,
  layout = 'full',
  wizardPhase = 'all',
  onBindStarted,
  onBindCancelled,
  onBindSucceeded,
}) => {
  const { state, actions } = useWechatMpConfigViewModel({
    institutionName,
    config,
    defaultConfig: defaultWechatMpConfig,
    onChangeConfig,
    showToast,
    onNavigateToMigration,
    onBindStarted,
    onBindCancelled,
    onBindSucceeded,
  });

  const {
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
  } = state;

  const {
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
  } = actions;

  // 新增/编辑表单局部状态
  const [formName, setFormName] = useState('');
  const [formAccount, setFormAccount] = useState('');
  const [formAppId, setFormAppId] = useState('');
  const [formAppSecret, setFormAppSecret] = useState('');
  const [formOriginalId, setFormOriginalId] = useState('');
  const [formRemark, setFormRemark] = useState('');

  // 同步编辑数据到弹窗输入
  React.useEffect(() => {
    if (editingMp) {
      setFormName(editingMp.mpName);
      setFormAccount(editingMp.wechatAccount);
      setFormAppId(editingMp.appId);
      setFormAppSecret(editingMp.appSecret || '');
      setFormOriginalId(editingMp.originalId);
      setFormRemark(editingMp.remark || '');
    } else {
      setFormName('');
      setFormAccount('');
      setFormAppId('');
      setFormAppSecret('');
      setFormOriginalId('');
      setFormRemark('');
    }
  }, [editingMp, showAddModal]);

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formAppId.trim() || !formOriginalId.trim()) {
      showToast('请完整填写公众号名称、AppID 及微信原始ID！', 'warning');
      return;
    }
    handleSaveCustomMp({
      mpName: formName.trim(),
      wechatAccount: formAccount.trim() || formName.trim(),
      appId: formAppId.trim(),
      appSecret: formAppSecret.trim() || 'sec_' + Date.now(),
      originalId: formOriginalId.trim(),
      remark: formRemark.trim(),
    });
  };

  const customList = formData.customMps || [];
  const isPlatformDefaultBound = formData.mode === 'platform_default';
  const isCompact = layout === 'guide' || layout === 'drawer';
  const hideAdvanced = layout === 'guide' || layout === 'drawer';
  const isAccessPhase = wizardPhase === 'access';
  const isSwitchPhase = wizardPhase === 'switch';
  const canSwitchChannel = wizardPhase === 'all' || isSwitchPhase;
  const canAddMp = wizardPhase === 'all' || isAccessPhase;

  return (
    <div className="space-y-4 text-gray-800">
      {/* 核心换绑操作区：自有公众号管理 (支持添加多个，仅可启用换绑一个) */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900">
                {isAccessPhase
                  ? '接入公众号（仅建档）'
                  : isSwitchPhase
                    ? '选择目标发稿通道'
                    : layout === 'drawer'
                      ? '可选公众号'
                      : '单位自有公众号'}
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-[#1890ff] font-medium border border-blue-200">
                {isAccessPhase
                  ? '不改变当前发稿通道'
                  : isSwitchPhase
                    ? '确认后立即生效'
                    : '可录入多个 · 仅启用一个'}
              </span>
            </div>
            {!isCompact && (
              <p className="text-xs text-gray-500 mt-0.5">
                新增后需点击「切换通道」完成通道换绑；生效后发稿与模板通知立即切到该号
              </p>
            )}
            {isAccessPhase && (
              <p className="text-xs text-gray-500 mt-0.5">
                本步只保存 AppID / Secret / 原始 ID 等参数并完成诊断，发稿仍走当前通道。
              </p>
            )}
            {isSwitchPhase && (
              <p className="text-xs text-gray-500 mt-0.5">
                选定目标号后点「切换通道」，发稿与模板消息将立即切到该号（人员换绑在下一步）。
              </p>
            )}
            {layout === 'guide' && wizardPhase === 'all' && (
              <p className="text-xs text-gray-500 mt-0.5">
                第 1 步录入参数 → 第 2 步点击「切换通道」正式生效（与人员换绑无关）
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {!isCompact && (
              <button
                type="button"
                onClick={handleRunDiagnostics}
                disabled={isTesting}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200/80 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                <span className={`material-symbols-outlined text-[16px] ${isTesting ? 'animate-spin' : ''}`}>
                  {isTesting ? 'sync' : 'network_check'}
                </span>
                <span>{isTesting ? '检测中...' : '接口连通性检测'}</span>
              </button>
            )}
            {canAddMp && (
              <button
                type="button"
                onClick={openAddModal}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#1890ff] text-white hover:bg-blue-600 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                <span>新增自有公众号</span>
              </button>
            )}
            {isAccessPhase && (
              <button
                type="button"
                onClick={handleRunDiagnostics}
                disabled={isTesting || customList.length === 0}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200/80 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                <span className={`material-symbols-outlined text-[16px] ${isTesting ? 'animate-spin' : ''}`}>
                  {isTesting ? 'sync' : 'network_check'}
                </span>
                <span>{isTesting ? '检测中...' : '诊断接口'}</span>
              </button>
            )}
          </div>
        </div>

        {/* 诊断测试结果通知 */}
        {testResults && (
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-200/80 text-xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-700">连通性报告 ({testResults.testedAt}):</span>
              <span className="text-emerald-700 flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">check_circle</span>
                AccessToken 获取正常
              </span>
              <span className="text-emerald-700 flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">check_circle</span>
                模板消息推送就绪
              </span>
              <span className="text-emerald-700 flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">check_circle</span>
                粉丝与标签同步通过
              </span>
            </div>
          </div>
        )}

        {/* 自有公众号列表 */}
        <div
          className={
            isCompact
              ? 'space-y-2'
              : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'
          }
        >
          {customList.map((item) => {
            const isBound = !isPlatformDefaultBound && item.isBound;
            if (isCompact) {
              return (
                <div
                  key={item.id}
                  className={`rounded-lg px-3 py-2.5 border flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 ${
                    isBound
                      ? 'bg-blue-50/50 border-blue-300 ring-1 ring-blue-200'
                      : 'bg-white border-gray-200/80 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div
                      className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                        isBound ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">chat</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs font-bold text-gray-900 truncate" title={item.mpName}>
                          {item.mpName}
                        </h4>
                        {isBound ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                            生效中
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                            待切换
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono truncate mt-0.5" title={`${item.appId} / ${item.originalId}`}>
                        {item.wechatAccount} · {item.appId}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                    {isBound ? (
                      <span className="text-[11px] text-emerald-700 font-semibold px-2 py-1 bg-emerald-50 rounded border border-emerald-200">
                        使用中
                      </span>
                    ) : canSwitchChannel ? (
                      <button
                        type="button"
                        onClick={() => openBindConfirmModal(item)}
                        className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#1890ff] text-white hover:bg-blue-600 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">sync_alt</span>
                        <span>切换通道</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-amber-700 font-semibold px-2 py-1 bg-amber-50 rounded border border-amber-200">
                        已接入·待切换
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
                      title="编辑参数"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                    </button>
                    {!isBound && canAddMp && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCustomMp(item.id)}
                        className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                        title="删除该自有公众号"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={item.id}
                className={`rounded-lg p-3 border transition-all relative flex flex-col justify-between ${
                  isBound
                    ? 'bg-blue-50/40 border-blue-300 ring-1 ring-blue-300 shadow-xs'
                    : 'bg-white border-gray-200/80 hover:border-gray-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                          isBound ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">chat</span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-gray-900 truncate" title={item.mpName}>
                          {item.mpName}
                        </h4>
                        <div className="text-[10px] text-gray-500 font-mono mt-0.5 truncate">
                          {item.wechatAccount}
                        </div>
                      </div>
                    </div>

                    {isBound ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                        生效中
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                        待切换
                      </span>
                    )}
                  </div>

                  <div className="mt-2 pt-2 border-t border-gray-100 text-[10px] text-gray-500 font-mono truncate" title={item.appId}>
                    AppID {item.appId}
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-gray-100/80 flex items-center justify-between gap-2">
                  <div className="text-[10px] text-gray-400 truncate">
                    {isBound && item.boundTime ? item.boundTime : item.createdAt}
                  </div>

                  <div className="flex items-center gap-1">
                    {isBound ? (
                      <span className="text-[11px] text-emerald-700 font-semibold px-2 py-0.5 bg-emerald-50 rounded border border-emerald-200">
                        使用中
                      </span>
                    ) : canSwitchChannel ? (
                      <button
                        type="button"
                        onClick={() => openBindConfirmModal(item)}
                        className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#1890ff] text-white hover:bg-blue-600 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">sync_alt</span>
                        <span>切换通道</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-amber-700 font-semibold px-2 py-0.5 bg-amber-50 rounded border border-amber-200">
                        已接入
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                      title="编辑参数"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                    </button>

                    {!isBound && canAddMp && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCustomMp(item.id)}
                        className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="删除该自有公众号"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. 平台默认公众号通道（点点速报） */}
      <div className={`bg-white rounded-xl border border-gray-200/80 shadow-2xs ${isCompact ? 'px-3 py-2.5' : 'p-4 sm:p-5'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`rounded-md flex items-center justify-center shrink-0 ${
                isCompact ? 'w-7 h-7' : 'w-10 h-10'
              } ${isPlatformDefaultBound ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}
            >
              <span className={`material-symbols-outlined ${isCompact ? 'text-[16px]' : 'text-[20px]'}`}>
                public
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className={`font-bold text-gray-900 ${isCompact ? 'text-xs' : 'text-sm'}`}>
                  点点速报 (平台统配)
                </h4>
                {isPlatformDefaultBound ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    当前生效
                  </span>
                ) : (
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-normal bg-gray-100 text-gray-500">
                    备用通道
                  </span>
                )}
              </div>
              {!isCompact && (
                <p className="text-xs text-gray-500 mt-0.5">
                  平台统一托管服务号，免去机构自主认证对接
                </p>
              )}
            </div>
          </div>

          <div className="shrink-0 self-end sm:self-auto">
            {isPlatformDefaultBound ? (
              <span className="text-[11px] text-blue-700 font-medium px-2 py-1 bg-blue-50 rounded-md border border-blue-200">
                当前发稿通道
              </span>
            ) : canSwitchChannel ? (
              <button
                type="button"
                onClick={() => openBindConfirmModal('platform_default')}
                className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
                title="回退后将关闭人员换绑能力"
              >
                <span className="material-symbols-outlined text-[14px]">undo</span>
                <span>回退平台默认号</span>
              </button>
            ) : (
              <span className="text-[11px] text-gray-400 px-2 py-1">本步不处理回退</span>
            )}
          </div>
        </div>
      </div>

      {/* 4. 高级接口与模板消息配置（折叠面板） */}
      {!hideAdvanced && (
      <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-2xs">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#1890ff]">settings</span>
            <span className="text-xs font-bold text-gray-900">微信服务号接口核心参数与通知模板</span>
            <span className="text-[11px] text-gray-400 font-normal">
              (开发者Token、EncodingAESKey、JS安全域名与模板消息ID)
            </span>
          </div>
          <span className="material-symbols-outlined text-[18px] text-gray-400">
            {showAdvanced ? 'expand_less' : 'expand_more'}
          </span>
        </button>

        {showAdvanced && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-500 font-medium mb-1">服务器接入 URL (Gateway)</label>
                <input
                  type="text"
                  readOnly
                  value={formData.serverUrl}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 font-mono select-all"
                />
              </div>
              <div>
                <label className="block text-gray-500 font-medium mb-1">令牌 Token</label>
                <input
                  type="text"
                  readOnly
                  value={formData.token}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 font-mono select-all"
                />
              </div>
              <div>
                <label className="block text-gray-500 font-medium mb-1">消息加解密密钥 (EncodingAESKey)</label>
                <input
                  type="text"
                  readOnly
                  value={formData.encodingAesKey}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 font-mono select-all"
                />
              </div>
              <div>
                <label className="block text-gray-500 font-medium mb-1">JS 接口安全域名</label>
                <input
                  type="text"
                  readOnly
                  value={(formData.jsSafeDomains || []).join('; ')}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 font-mono select-all"
                />
              </div>
            </div>

            {/* 模板消息ID */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <h5 className="font-bold text-gray-800 mb-2">已绑定的微信服务号模板消息通道</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600">
                <div className="p-2 rounded bg-gray-50 border border-gray-200/60 flex items-center justify-between">
                  <span>预警速报通知模板</span>
                  <code className="font-mono text-gray-700">{formData.templates.warningTemplateId}</code>
                </div>
                <div className="p-2 rounded bg-gray-50 border border-gray-200/60 flex items-center justify-between">
                  <span>处置流转催办模板</span>
                  <code className="font-mono text-gray-700">{formData.templates.dispatchTemplateId}</code>
                </div>
                <div className="p-2 rounded bg-gray-50 border border-gray-200/60 flex items-center justify-between">
                  <span>审签办结通报模板</span>
                  <code className="font-mono text-gray-700">{formData.templates.reviewCompleteTemplateId}</code>
                </div>
                <div className="p-2 rounded bg-gray-50 border border-gray-200/60 flex items-center justify-between">
                  <span>每日舆情晨报模板</span>
                  <code className="font-mono text-gray-700">{formData.templates.dailyReportTemplateId}</code>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      )}

      {/* 弹窗 1：确认通道换绑 */}
      {showBindConfirmModal && targetToBind && (
        <div className="fixed inset-0 z-[60] bg-black/45 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-5 animate-scale-up space-y-4 text-gray-800">
            {targetToBind === 'platform_default' ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                    <span className="material-symbols-outlined text-[24px]">warning</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">确认回退平台默认号？</h3>
                    <p className="text-xs text-gray-500">发稿通道将切回点点速报，人员换绑将不可用</p>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-medium">当前发稿通道：</span>
                    <span className="font-bold text-gray-800">{currentBoundMpName}</span>
                  </div>
                  <div className="flex items-center justify-center text-amber-600 my-1">
                    <span className="material-symbols-outlined text-[22px]">arrow_downward</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-amber-800 font-bold">回退后通道：</span>
                    <span className="font-bold text-amber-900 text-sm">点点速报 (平台统配)</span>
                  </div>
                </div>

                <div className="text-xs text-amber-900 bg-amber-50/80 p-3 rounded-lg space-y-1 border border-amber-200/80">
                  <p>• 模板消息与发稿推送立即切回平台默认号</p>
                  <p>• 「发起全员换绑 / 发送换绑」将暂时锁定</p>
                  <p>• 已录入的自有公众号仍保留，可随时再次切换通道</p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={closeBindConfirmModal}
                    disabled={isBinding}
                    className="px-4 py-2 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteBind}
                    disabled={isBinding}
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <span className={`material-symbols-outlined text-[16px] ${isBinding ? 'animate-spin' : ''}`}>
                      {isBinding ? 'sync' : 'undo'}
                    </span>
                    <span>{isBinding ? '正在回退...' : '确认回退平台默认号'}</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-[#1890ff] shrink-0">
                    <span className="material-symbols-outlined text-[24px]">sync_alt</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">确认切换发稿通道</h3>
                    <p className="text-xs text-gray-500">通道换绑后，发稿与模板消息立即切至目标号</p>
                  </div>
                </div>

                <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-medium">当前发稿通道：</span>
                    <span className="font-bold text-gray-800">{currentBoundMpName}</span>
                  </div>

                  <div className="flex items-center justify-center text-blue-500 my-1">
                    <span className="material-symbols-outlined text-[22px]">arrow_downward</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-700 font-bold">切换目标：</span>
                    <span className="font-bold text-[#1890ff] text-sm">{targetToBind.mpName}</span>
                  </div>
                </div>

                <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg space-y-1 border border-gray-200/60">
                  <p>• 发稿推送与模板消息将立即切换至目标号</p>
                  <p>• 通道换绑完成后，可向采编发起「全员换绑 / 发送换绑」</p>
                  <p>• 其他已录入公众号仍保留，可随时再切换通道</p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={closeBindConfirmModal}
                    disabled={isBinding}
                    className="px-4 py-2 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteBind}
                    disabled={isBinding}
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-[#1890ff] text-white hover:bg-blue-600 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <span className={`material-symbols-outlined text-[16px] ${isBinding ? 'animate-spin' : ''}`}>
                      {isBinding ? 'sync' : 'check'}
                    </span>
                    <span>{isBinding ? '正在切换...' : '确认切换通道'}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 弹窗 2：新增 / 编辑自有公众号表单 */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] bg-black/45 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-5 animate-scale-up space-y-4 text-gray-800">
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#1890ff] text-[20px]">
                  {editingMp ? 'edit' : 'add_circle'}
                </span>
                <h3 className="text-sm font-bold text-gray-900">
                  {editingMp ? '编辑自有公众号' : '新增单位自有公众号'}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeAddModal}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={onFormSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  公众号名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="例如：随州融媒发布、随州发布"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-[#1890ff]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    微信原始 ID (gh_xxxx) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="例如：gh_88392104bf71"
                    value={formOriginalId}
                    onChange={(e) => setFormOriginalId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-[#1890ff] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    微信号 (选填)
                  </label>
                  <input
                    type="text"
                    placeholder="例如：suizhou_news"
                    value={formAccount}
                    onChange={(e) => setFormAccount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-[#1890ff] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    开发者 AppID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="wx开头的18位ID"
                    value={formAppId}
                    onChange={(e) => setFormAppId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-[#1890ff] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    开发者 AppSecret <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="32位秘钥 (保密输入)"
                    value={formAppSecret}
                    onChange={(e) => setFormAppSecret(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-[#1890ff] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">备注说明 (选填)</label>
                <input
                  type="text"
                  placeholder="例如：市网信办认证主服务号 / 备用发稿通道"
                  value={formRemark}
                  onChange={(e) => setFormRemark(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-[#1890ff]"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200/80 text-[11px] text-blue-800 flex items-start gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#1890ff] shrink-0 mt-0.5">info</span>
                <span>
                  新增后为「待切换」状态，请在列表中点击<strong>【切换通道】</strong>完成通道换绑。
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-[#1890ff] text-white hover:bg-blue-600 transition-all cursor-pointer shadow-2xs"
                >
                  {editingMp ? '保存修改' : '确认新增'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
