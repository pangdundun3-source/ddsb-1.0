import React from 'react';
import { AlertCircle, Check, Clock, FileEdit, History } from 'lucide-react';
import { ReportItem, TimelineNode } from '../types';
import { getOrganizationPathText } from './OrgPathDisplay';

type FlowCardState = 'completed' | 'current' | 'pending' | 'rejected';

interface FlowCard {
  operator: string;
  statusText: string;
  state: FlowCardState;
  score?: number | string;
  note?: string;
}

interface FlowStep {
  groupKey?: string;
  title: string;
  state: FlowCardState;
  cards: FlowCard[];
}

interface AuditFlowTimelineProps {
  report: ReportItem;
  compact?: boolean;
  headerNote?: string;
  rejectedLabel?: string;
  myRejectedNode?: {
    auditor: string;
    org?: string;
    time?: string;
    comment?: string;
  } | null;
}

const formatSubmitter = (report: ReportItem) =>
  `${report.author} · ${getOrganizationPathText(report.organization)} · ${report.submitTime}`;

const getAggregatedStepState = (cards: FlowCard[]): FlowCardState => {
  const latestCard = cards[cards.length - 1];
  return latestCard?.state || 'pending';
};

const buildFromTimeline = (timeline: TimelineNode[], rejectedLabel: string) => {
  const grouped: FlowStep[] = [];
  timeline.forEach((node) => {
    const title = node.title.includes('提交') ? '提交上报' : node.title.includes('结束') ? '结束' : '审核处理';
    const operatorKey = node.operator.replace(/\s*·\s*/g, '·').trim();
    const groupKey =
      title === '提交上报'
        ? 'submit'
        : title === '结束'
          ? 'end'
          : `audit:${operatorKey}`;
    const statusText =
      node.status === 'completed'
        ? node.title.includes('提交')
          ? '已提交'
          : title === '结束'
            ? node.note?.includes('采纳')
              ? '已采纳'
              : node.note || '已结束'
            : '已通过'
        : node.status === 'rejected'
          ? rejectedLabel
          : node.status === 'current'
            ? node.note || '处理中'
            : node.note || '等待处理';
    const existing = grouped.find((item) => item.groupKey === groupKey);
    const step = existing || { groupKey, title, state: node.status, cards: [] };
    step.cards.push({
      operator: title === '结束' ? '流程结束' : node.time ? `${node.operator} · ${node.time}` : node.operator,
      statusText,
      state: node.status,
      score: node.score,
      note: node.note
    });
    step.state = getAggregatedStepState(step.cards);
    if (!existing) grouped.push(step);
  });
  return grouped;
};

const buildFallbackTimeline = (
  report: ReportItem,
  rejectedLabel: string,
  myRejectedNode?: AuditFlowTimelineProps['myRejectedNode']
): FlowStep[] => {
  const score = report.score && report.score !== '--' ? report.score : undefined;
  const rejectText = report.rejectReason || '信息不完整。请补充政策原文链接和群众反馈截图后重新提交。';
  const submitStep: FlowStep = {
    title: report.auditStatus === '草稿' ? '草稿保存' : '提交上报',
    state: report.auditStatus === '草稿' ? 'current' : 'completed',
    cards: [
      {
        operator: report.auditStatus === '草稿' ? `${report.author} · ${getOrganizationPathText(report.organization)}` : formatSubmitter(report),
        statusText: report.auditStatus === '草稿' ? '草稿' : '已提交',
        state: report.auditStatus === '草稿' ? 'current' : 'completed',
        note: report.auditStatus === '草稿' ? '尚未提交送审，可继续编辑完善。' : undefined
      }
    ]
  };

  if (report.auditStatus === '草稿') {
    return [
      submitStep,
      { title: '提交上报', state: 'pending', cards: [{ operator: '等待上报员提交', statusText: '等待提交', state: 'pending' }] },
      { title: '审核处理', state: 'pending', cards: [{ operator: '审核员', statusText: '等待处理', state: 'pending' }] },
      { title: '结束', state: 'pending', cards: [{ operator: '流程结束', statusText: '未开始', state: 'pending' }] }
    ];
  }

  if (report.auditStatus === '待审核') {
    return [
      submitStep,
      {
        title: '审核处理',
        state: 'current',
        cards: [{ operator: '王主任 · 市委宣传部舆情科', statusText: '待审核', state: 'current' }]
      },
      { title: '审核处理', state: 'pending', cards: [{ operator: '李明 · 市网信办复核组', statusText: '等待处理', state: 'pending' }] },
      { title: '审核处理', state: 'pending', cards: [{ operator: '赵宁 · 市网信办终审组', statusText: '等待处理', state: 'pending' }] },
      { title: '结束', state: 'pending', cards: [{ operator: '流程结束', statusText: '等待结论', state: 'pending' }] }
    ];
  }

  if (report.auditStatus === '被驳回' || report.auditStatus === '已驳回') {
    return [
      submitStep,
      {
        title: '审核处理',
        state: 'rejected',
        cards: [{
          operator: myRejectedNode
            ? `${myRejectedNode.auditor} · ${myRejectedNode.org || report.organization || '—'} · ${myRejectedNode.time || report.auditTime || '—'}`
            : `王主任 · 市委宣传部舆情科 · ${report.auditTime || '2026-08-12 16:30'}`,
          statusText: rejectedLabel,
          state: 'rejected',
          note: myRejectedNode?.comment || rejectText
        }]
      },
      {
        title: '审核处理',
        state: 'pending',
        cards: [{ operator: '李明 · 市网信办复核组', statusText: '等待处理', state: 'pending' }]
      },
      {
        title: '审核处理',
        state: 'pending',
        cards: [{ operator: '赵宁 · 市网信办终审组', statusText: '等待处理', state: 'pending' }]
      },
      {
        title: '结束',
        state: 'pending',
        cards: [{ operator: '流程结束', statusText: '等待结论', state: 'pending' }]
      }
    ];
  }

  if (report.auditStatus === '审核中') {
    return [
      submitStep,
      {
        title: '审核处理',
        state: 'completed',
        cards: [{
          operator: `王主任 · 市委宣传部舆情科 · ${report.auditTime || '2026-08-12 16:30'}`,
          statusText: '已通过',
          state: 'completed'
        }]
      },
      {
        title: '审核处理',
        state: 'current',
        cards: [{ operator: '李明 · 市网信办复核组', statusText: '审核中', state: 'current' }]
      },
      { title: '审核处理', state: 'pending', cards: [{ operator: '赵宁 · 市网信办终审组', statusText: '等待处理', state: 'pending' }] },
      { title: '结束', state: 'pending', cards: [{ operator: '流程结束', statusText: '等待结论', state: 'pending' }] }
    ];
  }

  const endStatus =
    report.auditStatus === '已转办'
      ? '已转办'
      : report.auditStatus === '待转办'
        ? '待转办'
        : report.auditStatus === '已通过'
          ? '待采纳'
          : '已采纳';

  return [
    {
      ...submitStep,
      cards: report.rejectReason
        ? [
            submitStep.cards[0],
            {
              operator: `${report.author} · ${getOrganizationPathText(report.organization)} · 2026-08-12 17:15`,
              statusText: '已提交',
              state: 'completed'
            }
          ]
        : submitStep.cards
    },
    {
      title: '审核处理',
      state: 'completed',
      cards: [
        ...(report.rejectReason
          ? [{
              operator: '王主任 · 市委宣传部舆情科 · 2026-08-12 16:30',
              statusText: rejectedLabel,
              state: 'rejected' as const,
              note: report.rejectReason
            }]
          : []),
        {
          operator: `王主任 · 市委宣传部舆情科 · ${report.auditTime || '2026-08-12 18:00'}`,
          statusText: '已通过',
          state: 'completed'
        }
      ]
    },
    {
      title: '审核处理',
      state: 'completed',
      cards: [{ operator: '李明 · 市网信办复核组 · 2026-08-12 18:00', statusText: '已通过', state: 'completed' }]
    },
    {
      title: '审核处理',
      state: 'completed',
      cards: [{ operator: '赵宁 · 市网信办终审组 · 2026-08-12 18:00', statusText: '已通过', state: 'completed', score }]
    },
    {
      title: '结束',
      state: report.auditStatus === '已通过' ? 'current' : 'completed',
      cards: [{
        operator: report.auditStatus === '已转办' ? `流程结束 · ${report.transferTime || '2026-08-12 19:00'}` : '流程结束',
        statusText: endStatus,
        state: report.auditStatus === '已通过' ? 'current' : 'completed',
        note: report.auditStatus === '待转办' ? '已进入不良信息库，等待责任单位转办。' : undefined
      }]
    }
  ];
};

const getStepIconClass = (state: FlowCardState) => {
  if (state === 'rejected') return 'border-[#E11D48] text-[#E11D48]';
  if (state === 'current') return 'border-[#F59E0B] text-[#F59E0B]';
  if (state === 'completed') return 'border-[#10B981] text-[#10B981]';
  return 'border-[#CBD5E1] text-[#CBD5E1]';
};

const getStatusClass = (state: FlowCardState) => {
  if (state === 'rejected') return 'text-[#E11D48]';
  if (state === 'current') return 'text-[#D97706]';
  if (state === 'completed') return 'text-[#059669]';
  return 'text-gray-400';
};

export const AuditFlowTimeline: React.FC<AuditFlowTimelineProps> = ({
  report,
  compact = false,
  headerNote = '完整审核链路',
  rejectedLabel = '被驳回',
  myRejectedNode = null
}) => {
  const steps =
    report.timeline && report.timeline.length > 0
      ? buildFromTimeline(report.timeline, rejectedLabel)
      : buildFallbackTimeline(report, rejectedLabel, myRejectedNode);

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-2xs">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center space-x-2">
          <History className="h-4 w-4 text-[#2563EB]" />
          <h3 className="text-sm font-bold text-gray-900">流转状态</h3>
        </div>
        <span className="text-[11px] font-normal text-gray-400">{headerNote}</span>
      </div>

      <div className="relative pt-4 text-xs">
        {steps.map((step, stepIndex) => {
          const isLast = stepIndex === steps.length - 1;
          return (
            <div key={`${step.title}-${stepIndex}`} className={`relative pl-6 ${isLast ? '' : 'pb-4'}`}>
              {!isLast && <div className="absolute left-[7px] top-4.5 bottom-0 w-[1.5px] bg-[#E2E8F0]" />}
              <div className={`absolute left-0 top-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 bg-white ${getStepIconClass(step.state)}`}>
                {step.state === 'pending' ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#CBD5E1]" />
                ) : step.state === 'rejected' ? (
                  <AlertCircle className="h-2.5 w-2.5 stroke-[2.5]" />
                ) : step.state === 'current' ? (
                  <Clock className="h-2.5 w-2.5 stroke-[2.5]" />
                ) : (
                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                )}
              </div>

              <div className="space-y-2">
                <div className="font-bold text-gray-900">{step.title}</div>
                {step.cards.map((card, cardIndex) => {
                  const useCompactCard =
                    card.state === 'pending' ||
                    (report.auditStatus === '审核中' && card.state === 'current' && !card.score);

                  return useCompactCard ? (
                    <div
                      key={`${card.operator}-${cardIndex}`}
                      className="bg-[#F8FAFC] border border-[#EDF2F7] rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs gap-2"
                    >
                      <span className="text-gray-700 font-medium truncate">{card.operator}</span>
                      {!(step.title === '结束' && card.statusText === '等待结论') && (
                        <span className={`text-gray-400 font-medium text-xs shrink-0 ${card.state === 'current' ? 'text-gray-500' : ''}`}>{card.statusText}</span>
                      )}
                    </div>
                  ) : (
                    <div
                      key={`${card.operator}-${cardIndex}`}
                      className={`${compact ? 'px-3 py-2' : 'p-3'} space-y-2 rounded-xl border border-[#EDF2F7] bg-[#F8FAFC]`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-gray-700">{card.operator}</span>
                        {!(step.title === '结束' && card.statusText === '等待结论') && (
                          <span className={`shrink-0 font-bold ${getStatusClass(card.state)}`}>{card.statusText}</span>
                        )}
                      </div>
                      {card.note && card.state !== 'completed' && (
                        <div className={`rounded-lg border p-2.5 leading-relaxed ${card.state === 'rejected' ? 'border-[#FFE4E6] bg-[#FFF1F2] text-[#BE123C]' : 'border-amber-100 bg-amber-50 text-amber-700'}`}>
                          <strong>{card.state === 'rejected' ? '驳回原因：' : '处理说明：'}</strong>{card.note}
                        </div>
                      )}
                      {card.score !== undefined && (
                        <div className="rounded-lg border border-[#DCFCE7] bg-[#F0FDF4] px-3 py-2 font-mono font-bold text-[#15803D]">
                          评分：{card.score}分
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
