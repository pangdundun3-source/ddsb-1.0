import React from 'react';
import { AlertCircle, Check, Clock, FileEdit, History } from 'lucide-react';
import { ReportItem, TimelineNode } from '../types';
import { getOrganizationPathText } from './OrgPathDisplay';

type FlowCardState = 'completed' | 'current' | 'pending' | 'rejected';

interface FlowPerson {
  name: string;
  org?: string;
  time?: string;
}

interface FlowCard {
  operator: string;
  /** 显式多人；未传时从 operator 解析（支持顿号分隔多人） */
  people?: FlowPerson[];
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

const AVATAR_COLORS = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-violet-500', 'bg-rose-500', 'bg-cyan-600'];

const isSpecialOperatorLabel = (name: string) =>
  /流程结束|等待|审核员$|未开始/.test(name) || name.includes('等待上报');

const parseSinglePerson = (chunk: string): FlowPerson => {
  const parts = chunk.split(/\s*·\s*/).map(part => part.trim()).filter(Boolean);
  if (parts.length === 0) return { name: chunk };
  const name = parts[0];
  let org: string | undefined;
  let time: string | undefined;
  parts.slice(1).forEach(part => {
    if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(part) || /^\d{1,2}:\d{2}/.test(part)) {
      time = part;
    } else {
      org = org ? `${org} · ${part}` : part;
    }
  });
  return { name, org, time };
};

const parseOperatorPeople = (operator: string): FlowPerson[] => {
  if (!operator.trim()) return [];
  return operator
    .split(/[、；;]/)
    .map(chunk => chunk.trim())
    .filter(Boolean)
    .map(parseSinglePerson);
};

const getCardPeople = (card: FlowCard): FlowPerson[] =>
  card.people?.length ? card.people : parseOperatorPeople(card.operator);

const PersonAvatar: React.FC<{ name: string }> = ({ name }) => {
  const color = AVATAR_COLORS[Math.abs(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];
  return (
    <span
      className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${color}`}
      title={name}
    >
      {name.slice(0, 1)}
    </span>
  );
};

const PersonListDisplay: React.FC<{
  people: FlowPerson[];
  mode: 'pending' | 'done';
}> = ({ people, mode }) => {
  if (people.length === 0) return <span className="text-gray-400">—</span>;
  return (
    <div className={`flex min-w-0 flex-1 ${mode === 'pending' ? 'flex-wrap items-center gap-x-3 gap-y-1.5' : 'flex-col gap-1.5'}`}>
      {people.map((person, index) => {
        if (isSpecialOperatorLabel(person.name)) {
          return (
            <span key={`${person.name}-${index}`} className="truncate text-gray-700 font-medium">
              {[person.name, person.org, person.time].filter(Boolean).join(' · ')}
            </span>
          );
        }
        if (mode === 'pending') {
          return (
            <span key={`${person.name}-${index}`} className="inline-flex items-center gap-1.5 max-w-full">
              <PersonAvatar name={person.name} />
              <span className="truncate text-gray-800 font-medium">{person.name}</span>
            </span>
          );
        }
        return (
          <span key={`${person.name}-${index}`} className="inline-flex items-center gap-1.5 min-w-0 max-w-full">
            <PersonAvatar name={person.name} />
            <span className="truncate text-gray-700">
              <span className="font-medium text-gray-800">{person.name}</span>
              {person.org ? <span className="text-gray-500"> · {person.org}</span> : null}
              {person.time ? <span className="text-gray-400"> · {person.time}</span> : null}
            </span>
          </span>
        );
      })}
    </div>
  );
};

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
        cards: [{
          operator: '王主任 · 市委宣传部舆情科、李审核 · 市委宣传部舆情科',
          people: [
            { name: '王主任', org: '市委宣传部舆情科' },
            { name: '李审核', org: '市委宣传部舆情科' }
          ],
          statusText: '待审核',
          state: 'current'
        }]
      },
      {
        title: '审核处理',
        state: 'pending',
        cards: [{
          operator: '李明 · 市网信办复核组、周复核 · 市网信办复核组',
          people: [
            { name: '李明', org: '市网信办复核组' },
            { name: '周复核', org: '市网信办复核组' }
          ],
          statusText: '等待处理',
          state: 'pending'
        }]
      },
      {
        title: '审核处理',
        state: 'pending',
        cards: [{
          operator: '赵宁 · 市网信办终审组、陈终审 · 市网信办终审组',
          people: [
            { name: '赵宁', org: '市网信办终审组' },
            { name: '陈终审', org: '市网信办终审组' }
          ],
          statusText: '等待处理',
          state: 'pending'
        }]
      },
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
        cards: [{
          operator: '李明 · 市网信办复核组、周复核 · 市网信办复核组',
          people: [
            { name: '李明', org: '市网信办复核组' },
            { name: '周复核', org: '市网信办复核组' }
          ],
          statusText: '等待处理',
          state: 'pending'
        }]
      },
      {
        title: '审核处理',
        state: 'pending',
        cards: [{
          operator: '赵宁 · 市网信办终审组、陈终审 · 市网信办终审组',
          people: [
            { name: '赵宁', org: '市网信办终审组' },
            { name: '陈终审', org: '市网信办终审组' }
          ],
          statusText: '等待处理',
          state: 'pending'
        }]
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
        cards: [{
          operator: '李明 · 市网信办复核组、周复核 · 市网信办复核组',
          people: [
            { name: '李明', org: '市网信办复核组' },
            { name: '周复核', org: '市网信办复核组' }
          ],
          statusText: '审核中',
          state: 'current'
        }]
      },
      {
        title: '审核处理',
        state: 'pending',
        cards: [{
          operator: '赵宁 · 市网信办终审组、陈终审 · 市网信办终审组',
          people: [
            { name: '赵宁', org: '市网信办终审组' },
            { name: '陈终审', org: '市网信办终审组' }
          ],
          statusText: '等待处理',
          state: 'pending'
        }]
      },
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
  headerNote,
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
        {headerNote ? (
          <span className="text-[11px] font-normal text-gray-400">{headerNote}</span>
        ) : null}
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
                  const people = getCardPeople(card);
                  const isPendingLike =
                    card.state === 'pending' ||
                    card.state === 'current' ||
                    card.statusText === '等待处理' ||
                    card.statusText === '待审核' ||
                    card.statusText === '审核中';
                  const personMode: 'pending' | 'done' =
                    isPendingLike && card.state !== 'rejected' && card.state !== 'completed' ? 'pending' : 'done';
                  const useCompactCard =
                    card.state === 'pending' ||
                    (report.auditStatus === '审核中' && card.state === 'current' && !card.score);

                  return useCompactCard ? (
                    <div
                      key={`${card.operator}-${cardIndex}`}
                      className="bg-[#F8FAFC] border border-[#EDF2F7] rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs gap-2"
                    >
                      <PersonListDisplay people={people} mode={personMode} />
                      {!(step.title === '结束' && card.statusText === '等待结论') && (
                        <span className={`text-gray-400 font-medium text-xs shrink-0 ${card.state === 'current' ? 'text-gray-500' : ''}`}>{card.statusText}</span>
                      )}
                    </div>
                  ) : (
                    <div
                      key={`${card.operator}-${cardIndex}`}
                      className={`${compact ? 'px-3 py-2' : 'p-3'} space-y-2 rounded-xl border border-[#EDF2F7] bg-[#F8FAFC]`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <PersonListDisplay people={people} mode={personMode} />
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
