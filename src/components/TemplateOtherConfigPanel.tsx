import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Save,
  RotateCcw,
  Check,
  Award,
  GitFork,
  ExternalLink,
  Clock,
  UserCheck,
  Smartphone,
  ShieldCheck,
  CreditCard,
  Users,
  Info
} from 'lucide-react';

export interface TemplateOtherConfigData {
  relatedScoreRuleId?: string;
  scoreTiming?: 'first_audit' | 'final_audit';
  syncToPerformance?: boolean;
  relatedFlowId?: string;
  verifyPhone?: boolean;
  verifyIdCard?: boolean;
  verifyBankCard?: boolean;
  adaptedRoles?: string[];
  [key: string]: any;
}

interface ScoreLevelItem {
  id: string;
  levelName: string;
  score: number;
  description?: string;
}

export interface ScoreRuleItem {
  id: string;
  name: string;
  totalScore?: number;
  levelCount?: number;
  status?: string;
  description?: string;
  scoreLevels?: ScoreLevelItem[];
  relatedTemplateId?: string;
  relatedTemplateName?: string;
}

export interface AuditNodeItem {
  id: string;
  nodeName: string;
  approverRole: string;
  timeLimitMinutes?: number;
  assigneeSource?: string;
  rejectStrategy?: string;
}

export interface AuditFlowItem {
  id: string;
  name: string;
  status?: string;
  description?: string;
  flowDepth?: number;
  orgApplyMode?: string;
  ownerMissingStrategy?: string;
  ownerMissingFallbackRole?: string;
  auditNodes?: AuditNodeItem[];
  relatedTemplateId?: string;
  relatedTemplateName?: string;
}

interface TemplateOtherConfigPanelProps {
  template: {
    id: string;
    name: string;
    description?: string;
    status: '启用' | '停用';
    templateType?: '报送' | '激活';
    isDefault?: boolean;
    updateTime?: string;
    relatedScoreRuleId?: string;
    scoreTiming?: 'first_audit' | 'final_audit';
    syncToPerformance?: boolean;
    relatedFlowId?: string;
    verifyPhone?: boolean;
    verifyIdCard?: boolean;
    verifyBankCard?: boolean;
    adaptedRoles?: string[];
    fields?: any[];
    [key: string]: any;
  };
  scoreRules?: ScoreRuleItem[];
  auditFlows?: AuditFlowItem[];
  onSave: (updatedConfig: Partial<TemplateOtherConfigData>) => void;
  onNavigateToModule?: (moduleId: string) => void;
}

const DEFAULT_SCORE_RULES: ScoreRuleItem[] = [
  {
    id: '201',
    name: '标准五级百分制打分规则组',
    totalScore: 100,
    levelCount: 5,
    scoreLevels: [
      { id: 'sl_1', levelName: '一等（特优）', score: 100 },
      { id: 'sl_2', levelName: '二等（优秀）', score: 90 },
      { id: 'sl_3', levelName: '三等（良好）', score: 80 },
      { id: 'sl_4', levelName: '四等（合格）', score: 70 },
      { id: 'sl_5', levelName: '五等（基本）', score: 60 }
    ]
  },
  {
    id: '202',
    name: '精简三级考核打分规则组',
    totalScore: 10,
    levelCount: 3,
    scoreLevels: [
      { id: 'sl_201', levelName: '一级（优秀）', score: 10 },
      { id: 'sl_202', levelName: '二级（良好）', score: 8 },
      { id: 'sl_203', levelName: '三级（合格）', score: 6 }
    ]
  },
  {
    id: '203',
    name: '四级专项引导打分组',
    totalScore: 50,
    levelCount: 4,
    scoreLevels: [
      { id: 'sl_301', levelName: 'A级（特级）', score: 50 },
      { id: 'sl_302', levelName: 'B级（高级）', score: 40 },
      { id: 'sl_303', levelName: 'C级（中级）', score: 30 },
      { id: 'sl_304', levelName: 'D级（初级）', score: 20 }
    ]
  }
];

const DEFAULT_AUDIT_FLOWS: AuditFlowItem[] = [
  {
    id: '601',
    name: '标准二级复核流程',
    flowDepth: 2,
    ownerMissingStrategy: 'fallback_role',
    ownerMissingFallbackRole: '机构管理员',
    auditNodes: [
      { id: 'an1', nodeName: '一级基础初审', approverRole: '初审员', timeLimitMinutes: 15 },
      { id: 'an2', nodeName: '二级研判复核', approverRole: '归属机构负责人', timeLimitMinutes: 30 }
    ]
  },
  {
    id: '602',
    name: '突发事件三级特快签发流程',
    flowDepth: 3,
    ownerMissingStrategy: 'block_submit',
    auditNodes: [
      { id: 'an201', nodeName: '初审快速响应', approverRole: '值班员', timeLimitMinutes: 10 },
      { id: 'an202', nodeName: '专报会商审核', approverRole: '舆情专员', timeLimitMinutes: 20 },
      { id: 'an203', nodeName: '指挥中心签发', approverRole: '归属机构负责人', timeLimitMinutes: 30 }
    ]
  },
  {
    id: '603',
    name: '一级极速直审归档通道',
    flowDepth: 1,
    ownerMissingStrategy: 'skip_to_next',
    auditNodes: [
      { id: 'an301', nodeName: '直审归档岗', approverRole: '指定审核员', timeLimitMinutes: 5 }
    ]
  }
];

const AVAILABLE_ACTIVATION_ROLES = [
  {
    id: '上报员',
    name: '上报员',
    description: '负责基层信息、舆情线索、专项数据等一线填报与提报',
    color: 'blue'
  },
  {
    id: '审核员',
    name: '审核员',
    description: '负责信息初审研判、逐级复核与终审评分流转',
    color: 'purple'
  }
];

export const TemplateOtherConfigPanel: React.FC<TemplateOtherConfigPanelProps> = ({
  template,
  scoreRules = DEFAULT_SCORE_RULES,
  auditFlows = DEFAULT_AUDIT_FLOWS,
  onSave,
  onNavigateToModule
}) => {
  const isActivationTemplate = template.templateType === '激活';

  // 1. Report template state (Score rules & Audit flows)
  const [activeTab, setActiveTab] = useState<'score' | 'flow'>('score');

  const initialScoreRuleId = template.relatedScoreRuleId || (
    template.id === '3' ? '202' : '201'
  );
  const initialFlowId = template.relatedFlowId || (
    template.id === '3' ? '602' : '601'
  );

  const [selectedScoreRuleId, setSelectedScoreRuleId] = useState<string>(initialScoreRuleId);
  const [scoreTiming, setScoreTiming] = useState<'first_audit' | 'final_audit'>(
    template.scoreTiming || 'final_audit'
  );
  const [syncToPerformance, setSyncToPerformance] = useState<boolean>(
    template.syncToPerformance ?? true
  );
  const [selectedFlowId, setSelectedFlowId] = useState<string>(initialFlowId);

  // 2. Activation template state (Verification switches & Role adaptation)
  const [verifyPhone, setVerifyPhone] = useState<boolean>(template.verifyPhone ?? true);
  const [verifyIdCard, setVerifyIdCard] = useState<boolean>(template.verifyIdCard ?? true);
  const [verifyBankCard, setVerifyBankCard] = useState<boolean>(template.verifyBankCard ?? false);
  const [adaptedRoles, setAdaptedRoles] = useState<string[]>(
    template.adaptedRoles && template.adaptedRoles.length > 0
      ? template.adaptedRoles
      : ['上报员', '审核员']
  );

  const [isDirty, setIsDirty] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const nextScoreRuleId = template.relatedScoreRuleId || (
      template.id === '3' ? '202' : '201'
    );
    const nextFlowId = template.relatedFlowId || (
      template.id === '3' ? '602' : '601'
    );
    setSelectedScoreRuleId(nextScoreRuleId);
    setScoreTiming(template.scoreTiming || 'final_audit');
    setSyncToPerformance(template.syncToPerformance ?? true);
    setSelectedFlowId(nextFlowId);

    // Activation template values
    setVerifyPhone(template.verifyPhone ?? true);
    setVerifyIdCard(template.verifyIdCard ?? true);
    setVerifyBankCard(template.verifyBankCard ?? false);
    setAdaptedRoles(
      template.adaptedRoles && template.adaptedRoles.length > 0
        ? template.adaptedRoles
        : ['上报员', '审核员']
    );

    setIsDirty(false);
    setSavedSuccess(false);
  }, [
    template.id,
    template.templateType,
    template.relatedScoreRuleId,
    template.relatedFlowId,
    template.scoreTiming,
    template.syncToPerformance,
    template.verifyPhone,
    template.verifyIdCard,
    template.verifyBankCard,
    template.adaptedRoles
  ]);

  const activeScoreRule = scoreRules.find(r => r.id === selectedScoreRuleId);
  const activeFlow = auditFlows.find(f => f.id === selectedFlowId);

  const handleSave = () => {
    if (isActivationTemplate) {
      onSave({
        verifyPhone,
        verifyIdCard,
        verifyBankCard,
        adaptedRoles
      });
    } else {
      onSave({
        relatedScoreRuleId: selectedScoreRuleId,
        scoreTiming,
        syncToPerformance,
        relatedFlowId: selectedFlowId
      });
    }
    setIsDirty(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleReset = () => {
    if (isActivationTemplate) {
      setVerifyPhone(template.verifyPhone ?? true);
      setVerifyIdCard(template.verifyIdCard ?? true);
      setVerifyBankCard(template.verifyBankCard ?? false);
      setAdaptedRoles(
        template.adaptedRoles && template.adaptedRoles.length > 0
          ? template.adaptedRoles
          : ['上报员', '审核员']
      );
    } else {
      const nextScoreRuleId = template.relatedScoreRuleId || (
        template.id === '3' ? '202' : '201'
      );
      const nextFlowId = template.relatedFlowId || (
        template.id === '3' ? '602' : '601'
      );
      setSelectedScoreRuleId(nextScoreRuleId);
      setScoreTiming(template.scoreTiming || 'final_audit');
      setSyncToPerformance(template.syncToPerformance ?? true);
      setSelectedFlowId(nextFlowId);
    }
    setIsDirty(false);
  };

  const toggleAdaptedRole = (roleName: string) => {
    setAdaptedRoles(prev => {
      let next: string[];
      if (prev.includes(roleName)) {
        next = prev.filter(r => r !== roleName);
      } else {
        next = [...prev, roleName];
      }
      // Ensure at least one role is retained
      if (next.length === 0) {
        next = [roleName];
      }
      return next;
    });
    setIsDirty(true);
    setSavedSuccess(false);
  };

  return (
    <div className="flex flex-col min-h-0 bg-white">
      {/* 1. Header */}
      <div className="h-12 px-4 bg-gray-50/70 border-b border-gray-200 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Sliders className="w-3.5 h-3.5 text-[#1E5ABB]" />
          <span className="font-bold text-xs text-gray-800 shrink-0">其他业务配置</span>
          {isActivationTemplate && (
            <span className="px-1.5 py-0.2 text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 rounded">
              激活模板
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isDirty && (
            <button
              type="button"
              onClick={handleReset}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded cursor-pointer transition-colors"
              title="撤销未保存修改"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            className={`px-2.5 py-1 text-xs font-bold rounded flex items-center gap-1 cursor-pointer transition-colors shadow-2xs ${
              savedSuccess
                ? 'bg-emerald-600 text-white'
                : isDirty
                  ? 'bg-[#1E5ABB] hover:bg-[#134092] text-white ring-2 ring-[#1E5ABB]/20'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {savedSuccess ? (
              <>
                <Check className="w-3 h-3" />
                <span>已保存</span>
              </>
            ) : (
              <>
                <Save className="w-3 h-3" />
                <span>保存配置</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Activation Template View: Verification Switches & Adapted Roles */}
      {isActivationTemplate ? (
        <div className="p-4 overflow-y-auto max-h-[750px] space-y-4 text-xs">
          {/* Section A: Verification Switches */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 pb-1 border-b border-gray-100">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>验证规则开关</span>
              <span className="text-[10px] text-gray-400 font-normal ml-auto">
                控制激活时的实名核验项
              </span>
            </div>

            <div className="space-y-2">
              {/* 1. Phone Number Verification Switch */}
              <div
                onClick={() => {
                  setVerifyPhone(!verifyPhone);
                  setIsDirty(true);
                  setSavedSuccess(false);
                }}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  verifyPhone
                    ? 'bg-emerald-50/40 border-emerald-200/80 shadow-2xs'
                    : 'bg-gray-50/60 border-gray-200 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        verifyPhone
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-gray-900 text-xs">手机号码验证开关</span>
                        <span
                          className={`px-1.5 py-0.2 text-[9px] font-bold rounded ${
                            verifyPhone
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {verifyPhone ? '已开启' : '已关闭'}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                        开启后，用户在激活时需填写 11 位有效手机号码并进行校验
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setVerifyPhone(!verifyPhone);
                      setIsDirty(true);
                      setSavedSuccess(false);
                    }}
                    className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer shrink-0 mt-1 ${
                      verifyPhone ? 'bg-emerald-500 justify-end' : 'bg-gray-300 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full shadow-xs" />
                  </button>
                </div>
              </div>

              {/* 2. ID Card Verification Switch */}
              <div
                onClick={() => {
                  setVerifyIdCard(!verifyIdCard);
                  setIsDirty(true);
                  setSavedSuccess(false);
                }}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  verifyIdCard
                    ? 'bg-blue-50/40 border-blue-200/80 shadow-2xs'
                    : 'bg-gray-50/60 border-gray-200 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        verifyIdCard
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-gray-900 text-xs">身份证号码验证开关</span>
                        <span
                          className={`px-1.5 py-0.2 text-[9px] font-bold rounded ${
                            verifyIdCard
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {verifyIdCard ? '已开启' : '已关闭'}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                        开启后，需验证中国二代居民身份证 18 位格式与校验码，确保实名身份真实有效
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setVerifyIdCard(!verifyIdCard);
                      setIsDirty(true);
                      setSavedSuccess(false);
                    }}
                    className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer shrink-0 mt-1 ${
                      verifyIdCard ? 'bg-blue-600 justify-end' : 'bg-gray-300 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full shadow-xs" />
                  </button>
                </div>
              </div>

              {/* 3. Bank Card Verification Switch */}
              <div
                onClick={() => {
                  setVerifyBankCard(!verifyBankCard);
                  setIsDirty(true);
                  setSavedSuccess(false);
                }}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  verifyBankCard
                    ? 'bg-amber-50/40 border-amber-200/80 shadow-2xs'
                    : 'bg-gray-50/60 border-gray-200 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        verifyBankCard
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-gray-900 text-xs">银行卡号验证开关</span>
                        <span
                          className={`px-1.5 py-0.2 text-[9px] font-bold rounded ${
                            verifyBankCard
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {verifyBankCard ? '已开启' : '已关闭'}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                        开启后，需输入银联 16-19 位卡号并校验卡号合法性，用于补贴/稿酬结算认证
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setVerifyBankCard(!verifyBankCard);
                      setIsDirty(true);
                      setSavedSuccess(false);
                    }}
                    className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer shrink-0 mt-1 ${
                      verifyBankCard ? 'bg-amber-500 justify-end' : 'bg-gray-300 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full shadow-xs" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section B: Adapted Personnel Roles Configuration */}
          <div className="space-y-2.5 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between pb-1 border-b border-gray-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                <Users className="w-3.5 h-3.5 text-purple-600" />
                <span>适配激活人员角色</span>
              </div>
              <span className="text-[10px] text-gray-400">
                已选 {adaptedRoles.length} 个角色
              </span>
            </div>

            <p className="text-[11px] text-gray-500 leading-tight">
              指定使用此激活模板进行账号核验与注册的人员角色类型（支持多选）：
            </p>

            <div className="grid grid-cols-1 gap-2">
              {AVAILABLE_ACTIVATION_ROLES.map(role => {
                const isSelected = adaptedRoles.includes(role.id);
                return (
                  <div
                    key={role.id}
                    onClick={() => toggleAdaptedRole(role.id)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      isSelected
                        ? role.id === '上报员'
                          ? 'bg-blue-50/50 border-blue-300 ring-1 ring-blue-400/20'
                          : 'bg-purple-50/50 border-purple-300 ring-1 ring-purple-400/20'
                        : 'bg-gray-50/40 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isSelected
                            ? role.id === '上报员'
                              ? 'bg-[#1E5ABB] text-white'
                              : 'bg-purple-600 text-white'
                            : 'border border-gray-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-gray-900">{role.name}</span>
                          <span
                            className={`px-1.5 py-0.2 text-[9px] font-bold rounded ${
                              role.id === '上报员'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {role.id === '上报员' ? '业务填报岗' : '审核把关岗'}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                          {role.description}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-bold shrink-0 mt-0.5 ${
                        isSelected
                          ? role.id === '上报员'
                            ? 'text-blue-700'
                            : 'text-purple-700'
                          : 'text-gray-400'
                      }`}
                    >
                      {isSelected ? '已适配' : '未选择'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section C: Summary Note */}
          <div className="p-3 bg-purple-50/40 rounded-lg border border-purple-100/80 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-800">
              <Info className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>激活流程生效说明</span>
            </div>
            <p className="text-[10px] text-purple-700 leading-relaxed">
              当前激活模板专门用于新人员注册激活、身份核验与角色分配。所配置的验证开关与角色范围将直接应用于移动端/网页端的实名激活界面。
            </p>
          </div>
        </div>
      ) : (
        /* 3. Report Template View: Scoring Rule & Audit Flow (Unchanged for 报送 templates) */
        <>
          {/* Horizontal Segment Switcher */}
          <div className="px-4 py-2.5 bg-gray-50/40 border-b border-gray-100 shrink-0">
            <div className="grid grid-cols-2 p-0.5 bg-gray-200/70 rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveTab('score')}
                className={`py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'score'
                    ? 'bg-white text-amber-700 font-bold shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>规则打分</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('flow')}
                className={`py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'flow'
                    ? 'bg-white text-purple-700 font-bold shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <GitFork className="w-3.5 h-3.5" />
                <span>审核流程</span>
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-4 overflow-y-auto max-h-[750px] text-xs">
            {activeTab === 'score' ? (
              /* Tab 1: 规则打分关联 */
              <div className="space-y-4">
                {/* Rule Selector */}
                <div>
                  <label className="block text-[11px] text-gray-600 font-medium mb-1">
                    关联打分规则
                  </label>
                  <select
                    value={selectedScoreRuleId}
                    onChange={e => {
                      setSelectedScoreRuleId(e.target.value);
                      setIsDirty(true);
                      setSavedSuccess(false);
                    }}
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-white font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                  >
                    <option value="none">不关联评分规则 (免评分)</option>
                    {scoreRules.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name} {r.totalScore ? `(${r.totalScore}分)` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rule Detail */}
                {activeScoreRule ? (
                  <div className="p-3 bg-amber-50/30 rounded-lg border border-amber-100 space-y-3">
                    {/* Meta Summary */}
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-gray-800">{activeScoreRule.name}</span>
                      <span className="font-mono font-bold text-amber-700">
                        满分 {activeScoreRule.totalScore || 100} 分
                      </span>
                    </div>

                    {/* Score Level Badges */}
                    {activeScoreRule.scoreLevels && activeScoreRule.scoreLevels.length > 0 && (
                      <div>
                        <div className="text-[10px] text-gray-400 mb-1.5 font-medium">分级得分标准</div>
                        <div className="flex flex-wrap gap-1.5">
                          {activeScoreRule.scoreLevels.map(sl => (
                            <span
                              key={sl.id}
                              className="px-2 py-0.5 bg-white border border-amber-200/80 rounded text-[11px] text-gray-700"
                            >
                              {sl.levelName}: <strong className="font-mono text-amber-800">{sl.score}分</strong>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Timing & Sync Options */}
                    <div className="pt-2 border-t border-amber-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 text-[11px]">打分时机</span>
                        <div className="inline-flex p-0.5 bg-white rounded border border-gray-200 text-[10px]">
                          <button
                            type="button"
                            onClick={() => {
                              setScoreTiming('first_audit');
                              setIsDirty(true);
                              setSavedSuccess(false);
                            }}
                            className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                              scoreTiming === 'first_audit'
                                ? 'bg-amber-100 text-amber-900 font-bold'
                                : 'text-gray-500 hover:text-gray-800'
                            }`}
                          >
                            初审打分
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setScoreTiming('final_audit');
                              setIsDirty(true);
                              setSavedSuccess(false);
                            }}
                            className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                              scoreTiming === 'final_audit'
                                ? 'bg-amber-100 text-amber-900 font-bold'
                                : 'text-gray-500 hover:text-gray-800'
                            }`}
                          >
                            终审打分
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 text-[11px]">计入考核绩效</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSyncToPerformance(!syncToPerformance);
                            setIsDirty(true);
                            setSavedSuccess(false);
                          }}
                          className={`w-7 h-4 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                            syncToPerformance ? 'bg-amber-500 justify-end' : 'bg-gray-300 justify-start'
                          }`}
                        >
                          <div className="w-3 h-3 bg-white rounded-full shadow-xs" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-gray-400 text-xs bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                    当前模板免评分，审核过程无需打分
                  </div>
                )}

                {/* Quick jump link */}
                {onNavigateToModule && (
                  <button
                    type="button"
                    onClick={() => onNavigateToModule('audit_score')}
                    className="w-full text-center py-1 text-[11px] text-[#1E5ABB] hover:underline inline-flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>管理打分规则库</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            ) : (
              /* Tab 2: 审核流程关联 */
              <div className="space-y-4">
                {/* Flow Selector */}
                <div>
                  <label className="block text-[11px] text-gray-600 font-medium mb-1">
                    关联审核流程
                  </label>
                  <select
                    value={selectedFlowId}
                    onChange={e => {
                      setSelectedFlowId(e.target.value);
                      setIsDirty(true);
                      setSavedSuccess(false);
                    }}
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-white font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                  >
                    <option value="none">免审批流程 (直接入库)</option>
                    {auditFlows.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.flowDepth || f.auditNodes?.length || 1}级)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Flow Node Timeline */}
                {activeFlow ? (
                  <div className="p-3 bg-purple-50/30 rounded-lg border border-purple-100 space-y-3">
                    <div className="text-[10px] text-gray-400 font-medium">审批节点链路</div>

                    {/* Node List */}
                    <div className="space-y-1.5">
                      {activeFlow.auditNodes?.map((node, idx) => (
                        <div
                          key={node.id}
                          className="p-2 bg-white rounded border border-purple-100/90 text-xs flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-4 h-4 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span className="font-medium text-gray-800 truncate">{node.nodeName}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded text-[10px] font-medium flex items-center gap-0.5">
                              <UserCheck className="w-2.5 h-2.5" />
                              {node.approverRole}
                            </span>
                            {node.timeLimitMinutes && (
                              <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5" />
                                {node.timeLimitMinutes}m
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer Note */}
                    <div className="pt-2 border-t border-purple-100 flex items-center justify-between text-[10px] text-gray-400">
                      <span>
                        兜底: {activeFlow.ownerMissingStrategy === 'fallback_role' ? `转${activeFlow.ownerMissingFallbackRole || '机构管理员'}` : '直转上级'}
                      </span>
                      <span>全辖机构适用</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-gray-400 text-xs bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                    当前模板免审批，提报提交后直接入库归档
                  </div>
                )}

                {/* Quick jump link */}
                {onNavigateToModule && (
                  <button
                    type="button"
                    onClick={() => onNavigateToModule('audit_flow')}
                    className="w-full text-center py-1 text-[11px] text-[#1E5ABB] hover:underline inline-flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>管理审核流程模型</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
