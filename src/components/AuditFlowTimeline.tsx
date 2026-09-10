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
  hideCardWrapper?: boolean;
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
  const submitOperator =
    report.organization && report.organization.includes('/')
      ? `${report.author} · ${report.organization} · ${report.submitTime}`
      : `${report.author || '李四'} · ${getOrganizationPathText(report.organization) || '广域传媒主机构 / 台中市网信办 / 舆情监测中心'} · ${report.submitTime || '2023-10-23 09:15'}`;

  const submitStep: FlowStep = {
    title: '提交上报',
    state: 'completed',
    cards: [
      {
        operator: submitOperator,
        statusText: '已提交',
        state: 'completed',
        note: undefined
      }
    ]
  };

  if (report.auditStatus === '待审核') {
    return [
      submitStep,
      {
        title: '审核处理',
        state: 'current',
        cards: [{
          operator: '王主任 · 市委宣传部舆情科',
          statusText: '待审核',
          state: 'current'
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
        cards: [{ operator: '流程结束', statusText: '', state: 'pending' }]
      }
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
        cards: [{ operator: '流程结束', statusText: '', state: 'pending' }]
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
          operator: '王主任 · 市委宣传部舆情科',
          statusText: '已通过',
          state: 'completed'
        }]
      },
      {
        title: '审核处理',
        state: 'current',
        cards: [{ operator: '李明 · 市网信办复核组', statusText: '待审核', state: 'current' }]
      },
      { title: '审核处理', state: 'pending', cards: [{ operator: '赵宁 · 市网信办终审组', statusText: '等待处理', state: 'pending' }] },
      { title: '结束', state: 'pending', cards: [{ operator: '流程结束', statusText: '', state: 'pending' }] }
    ];
  }

  // Default standard flow in AuditDetail: 流转到最后一个审核人赵宁，高亮显示为“待审核”
  return [
    submitStep,
    {
      title: '审核处理',
      state: 'completed',
      cards: [{ operator: '王主任 · 市委宣传部舆情科', statusText: '已通过', state: 'completed' }]
    },
    {
      title: '审核处理',
      state: 'completed',
      cards: [{ operator: '李明 · 市网信办复核组', statusText: '已通过', state: 'completed' }]
    },
    {
      title: '审核处理',
      state: 'current',
      cards: [{ operator: '赵宁 · 市网信办终审组', statusText: '待审核', state: 'current' }]
    },
    { title: '结束', state: 'pending', cards: [{ operator: '流程结束', statusText: '', state: 'pending' }] }
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
  hideCardWrapper = false,
  myRejectedNode = null
}) => {
  const steps =
    report.timeline && report.timeline.length > 3
      ? buildFromTimeline(report.timeline, rejectedLabel)
      : buildFallbackTimeline(report, rejectedLabel, myRejectedNode);

  const content = (
    <>
      {!hideCardWrapper && (
        <div className="flex items-center justify-between border-b border-gray-100 pb-3.5">
          <div className="flex items-center space-x-2">
            <History className="h-4 w-4 text-[#1E5ABB]" />
            <h3 className="text-sm font-bold text-gray-900">流转状态</h3>
          </div>
          <span className="text-xs font-normal text-gray-400">{headerNote}</span>
        </div>
      )}

      <div className={`relative ${hideCardWrapper ? 'pt-1' : 'pt-4'} text-xs space-y-4`}>
        {steps.map((step, stepIndex) => {
          const isLast = stepIndex === steps.length - 1;
          return (
            <div key={`${step.title}-${stepIndex}`} className={`relative pl-7 ${isLast ? '' : 'pb-1'}`}>
              {!isLast && (
                <div
                  className="absolute left-[8px] top-5 bottom-0 w-[1.5px] bg-[#E2E8F0]"
                />
              )}
              <div className={`absolute left-0 top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full border bg-white ${getStepIconClass(step.state)}`}>
                {step.state === 'pending' ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#CBD5E1]" />
                ) : step.state === 'rejected' ? (
                  <AlertCircle className="h-3 w-3 stroke-[2.5]" />
                ) : step.state === 'current' ? (
                  <Clock className="h-3 w-3 stroke-[2.5]" />
                ) : (
                  <Check className="h-3 w-3 stroke-[3]" />
                )}
              </div>

              <div className="space-y-1.5">
                <div className="font-bold text-gray-900 text-xs">{step.title}</div>
                {step.cards.map((card, cardIndex) => {
                  const hasComplexNote = card.note && card.state !== 'completed';
                  const hasScore = card.score !== undefined;

                  if (!hasComplexNote && !hasScore) {
                    return (
                      <div
                        key={`${card.operator}-${cardIndex}`}
                        className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl p-3.5 flex items-center justify-between text-xs gap-2"
                      >
                        <span className="text-gray-700 font-medium truncate">{card.operator}</span>
                        {card.statusText && (
                          <span
                            className={`shrink-0 font-bold ${
                              card.state === 'completed'
                                ? 'text-emerald-600'
                                : card.state === 'current'
                                ? 'text-amber-600'
                                : card.state === 'rejected'
                                ? 'text-rose-600'
                                : 'text-gray-400 font-normal'
                            }`}
                          >
                            {card.statusText}
                          </span>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={`${card.operator}-${cardIndex}`}
                      className={`${compact ? 'px-3 py-2' : 'p-3.5'} space-y-2 rounded-xl border border-[#F1F5F9] bg-[#F8FAFC]`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-gray-700 font-medium">{card.operator}</span>
                        {card.statusText && (
                          <span
                            className={`shrink-0 font-bold ${
                              card.state === 'completed'
                                ? 'text-emerald-600'
                                : card.state === 'current'
                                ? 'text-amber-600'
                                : card.state === 'rejected'
                                ? 'text-rose-600'
                                : 'text-gray-400 font-normal'
                            }`}
                          >
                            {card.statusText}
                          </span>
                        )}
                      </div>
                      {card.note && card.state !== 'completed' && (
                        <div className={`rounded-lg border p-2.5 leading-relaxed ${card.state === 'rejected' ? 'border-rose-200 bg-rose-50/80 text-rose-700' : 'border-amber-200 bg-amber-50/80 text-amber-700'}`}>
                          <strong>{card.state === 'rejected' ? '驳回原因：' : '处理说明：'}</strong>{card.note}
                        </div>
                      )}
                      {card.score !== undefined && (
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 font-mono font-bold text-emerald-700">
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
    </>
  );

  if (hideCardWrapper) {
    return content;
  }

  return (
    <div className="rounded-2xl border border-gray-100/90 bg-white p-6 shadow-2xs space-y-4">
      {content}
    </div>
  );
};
