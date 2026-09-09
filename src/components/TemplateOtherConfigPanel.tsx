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
  UserCheck
} from 'lucide-react';

export interface TemplateOtherConfigData {
  relatedScoreRuleId: string;
  scoreTiming?: 'first_audit' | 'final_audit';
  syncToPerformance?: boolean;
  relatedFlowId: string;
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

export const TemplateOtherConfigPanel: React.FC<TemplateOtherConfigPanelProps> = ({
  template,
  scoreRules = DEFAULT_SCORE_RULES,
  auditFlows = DEFAULT_AUDIT_FLOWS,
  onSave,
  onNavigateToModule
}) => {
  // Horizontal tab state
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
    setIsDirty(false);
    setSavedSuccess(false);
  }, [template.id, template.relatedScoreRuleId, template.relatedFlowId, template.scoreTiming, template.syncToPerformance]);

  const activeScoreRule = scoreRules.find(r => r.id === selectedScoreRuleId);
  const activeFlow = auditFlows.find(f => f.id === selectedFlowId);

  const handleSave = () => {
    onSave({
      relatedScoreRuleId: selectedScoreRuleId,
      scoreTiming,
      syncToPerformance,
      relatedFlowId: selectedFlowId
    });
    setIsDirty(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleReset = () => {
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
    setIsDirty(false);
  };

  return (
    <div className="flex flex-col min-h-0 bg-white">
      {/* 1. Header */}
      <div className="h-12 px-4 bg-gray-50/70 border-b border-gray-200 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Sliders className="w-3.5 h-3.5 text-[#1E5ABB]" />
          <span className="font-bold text-xs text-gray-800 shrink-0">其他业务配置</span>
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

      {/* 2. Horizontal Segment Switcher */}
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

      {/* 3. Content Area: Clean & Concise */}
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
    </div>
  );
};
