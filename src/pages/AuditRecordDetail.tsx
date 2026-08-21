import React from 'react';
import { AuditRecordItem, PageId, ReportItem, TimelineNode } from '../types';
import {
  CheckCircle2,
  ChevronRight,
  CircleX,
  Clock,
  FileText,
  History,
  Info,
  Star,
} from 'lucide-react';

interface AuditRecordDetailProps {
  record: AuditRecordItem | null;
  allReports: ReportItem[];
  onNavigate: (page: PageId) => void;
}

type FlowTone = 'done' | 'current' | 'rejected' | 'waiting';

interface FlowRecord {
  actor: string;
  organization?: string;
  time?: string;
  status?: string;
  tone: FlowTone;
  reason?: string;
}

interface FlowGroup {
  title: string;
  tone: FlowTone;
  records: FlowRecord[];
}

export const AuditRecordDetail: React.FC<AuditRecordDetailProps> = ({
  record,
  allReports,
  onNavigate
}) => {
  if (!record) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>未选择审核记录，请返回审核记录列表。</p>
        <button
          type="button"
          onClick={() => onNavigate('audit-records')}
          className="mt-4 px-4 py-2 bg-[#1E5ABB] text-white rounded text-xs cursor-pointer"
        >
          返回审核记录
        </button>
      </div>
    );
  }

  const relatedReport = allReports.find(
    (report) => report.id === record.reportId || report.title === record.title
  );
  const isPassed = record.auditResult === '已通过';
  const score = record.score ?? relatedReport?.score;
  const scoreText =
    score === undefined || score === '--'
      ? '--'
      : `${score}`.includes('分')
        ? `${score}`
        : `${score}分`;
  const rejectedNode = relatedReport?.timeline?.find(
    (node) => node.status === 'rejected' || node.title.includes('驳回')
  );
  const resultDescription = isPassed
    ? scoreText
    : record.rejectReason ||
      record.rejectDetail ||
      rejectedNode?.note ||
      rejectedNode?.operator ||
      '信息不完整，请补充相关证明材料后重新提交。';
  const detail = relatedReport?.detailContent || {
    summary: '暂无完整上报详情，可从审核记录列表返回后选择关联速报查看。',
    coreDemands: '暂无核心诉求信息。',
    publicOpinionTrend: '暂无舆情态势信息。',
    recommendations: ['暂无建议举措。']
  };
  const submitTime = relatedReport?.submitTime || record.auditTime;
  const reportAuthor = relatedReport?.author || record.auditor;
  const reportOrganization = relatedReport?.organization || record.organization;
  const submitOperator = `${reportAuthor} · ${reportOrganization}`;
  const timeline = relatedReport?.timeline || [];
  const auditStatus = relatedReport?.auditStatus || (isPassed ? '已通过' : '被驳回');
  const isRejectedFlow = auditStatus === '被驳回' || record.auditResult === '被驳回';
  const isPending = auditStatus === '待审核';
  const isInReview = auditStatus === '审核中';
  const isCompleted =
    isPassed || auditStatus === '已通过' || auditStatus === '待转办' || auditStatus === '已转办';
  const flowScoreText = scoreText === '--' ? '' : ` · ${scoreText}`;
  const submitTimelineNodes = timeline.filter((node) => node.title.includes('提交上报'));
  const approvedAuditNode = timeline.find(
    (node: TimelineNode) =>
      node.status === 'completed' &&
      (node.title.includes('主任审核') || node.title.includes('一级审核') || node.title.includes('总部审核'))
  );
  const rejectedAuditNode = timeline.find(
    (node: TimelineNode) => node.status === 'rejected' || node.title.includes('驳回')
  );
  const firstAuditTime = relatedReport?.auditTime || approvedAuditNode?.time || rejectedAuditNode?.time || record.auditTime;
  const secondAuditTime = approvedAuditNode?.time || relatedReport?.auditTime || record.auditTime;
  const thirdAuditTime =
    timeline.find((node: TimelineNode) => node.title.includes('终审') || node.title.includes('三级审核'))?.time ||
    relatedReport?.auditTime ||
    record.auditTime;

  const submitRecords: FlowRecord[] = submitTimelineNodes.length
    ? submitTimelineNodes.map((node) => ({
        actor: node.operator.replace('·', ' · '),
        time: node.time || submitTime,
        status: '已提交',
        tone: 'done' as const
      }))
    : [
        {
          actor: submitOperator,
          time: submitTime,
          status: '已提交',
          tone: 'done'
        }
      ];

  const firstAuditRecords: FlowRecord[] = (() => {
    if (isRejectedFlow) {
      return [
        {
          actor: `${record.auditor} · ${record.organization}`,
          time: rejectedAuditNode?.time || record.auditTime,
          status: '已驳回',
          tone: 'rejected',
          reason: resultDescription
        }
      ];
    }

    if (isPending) {
      return [
        {
          actor: `${record.auditor} · ${record.organization}`,
          organization: record.organization,
          status: '待审核',
          tone: 'current'
        }
      ];
    }

    return [
      {
        actor: `${record.auditor} · ${record.organization}`,
        time: firstAuditTime,
        status: `已通过${flowScoreText}`,
        tone: 'done'
      }
    ];
  })();

  const secondAuditRecords: FlowRecord[] = [
    {
      actor: '复核员 · 市网信办复核组',
      organization: '市网信办复核组',
      time: isCompleted ? secondAuditTime : undefined,
      status: isCompleted ? `已通过${flowScoreText}` : isInReview ? '待审核' : '等待处理',
      tone: isCompleted ? 'done' : isInReview ? 'current' : 'waiting'
    }
  ];

  const thirdAuditRecords: FlowRecord[] = [
    {
      actor: '终审员 · 市网信办终审组',
      organization: '市网信办终审组',
      time: isCompleted ? thirdAuditTime : undefined,
      status: isCompleted ? `已通过${flowScoreText}` : '等待处理',
      tone: isCompleted ? 'done' : 'waiting'
    }
  ];

  const endRecords: FlowRecord[] = [
    {
      actor: '流程结束',
      status: isCompleted ? '已完成' : undefined,
      tone: isCompleted ? 'done' : 'waiting'
    }
  ];

  const reviewFlow: FlowGroup[] = [
    { title: '提交上报', tone: 'done', records: submitRecords },
    {
      title: '审核处理',
      tone: isRejectedFlow ? 'rejected' : isPending ? 'current' : 'done',
      records: firstAuditRecords
    },
    {
      title: '审核处理',
      tone: isCompleted ? 'done' : isInReview ? 'current' : 'waiting',
      records: secondAuditRecords
    },
    {
      title: '审核处理',
      tone: isCompleted ? 'done' : 'waiting',
      records: thirdAuditRecords
    },
    { title: '结束', tone: isCompleted ? 'done' : 'waiting', records: endRecords }
  ];

  const statusStampClass = isPassed ? 'border-emerald-500/75 text-emerald-600' : 'border-rose-500/75 text-rose-600';

  const getFlowBadgeClass = (tone: FlowTone) => {
    if (tone === 'done') return 'text-emerald-600';
    if (tone === 'rejected') return 'px-1.5 py-0.5 rounded border border-red-200 bg-red-50 text-red-600';
    if (tone === 'current') return 'px-1.5 py-0.5 rounded border border-amber-200 bg-amber-50 text-amber-700';
    return 'text-gray-400';
  };

  const getFlowActorText = (flowRecord: FlowRecord) => {
    if (flowRecord.tone === 'done' || flowRecord.tone === 'rejected') return flowRecord.actor;
    return flowRecord.organization || flowRecord.actor.split('·').map((part) => part.trim()).pop() || flowRecord.actor;
  };

  return (
    <div className="space-y-4">
      <div className="flex w-full items-center space-x-1.5 rounded-lg border border-gray-200 bg-white px-5 py-3 text-xs text-gray-500 shadow-2xs">
        <button onClick={() => onNavigate('audit-records')} className="hover:text-[#1E5ABB] cursor-pointer">
          审核管理
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
        <button onClick={() => onNavigate('audit-records')} className="hover:text-[#1E5ABB] cursor-pointer">
          审核记录
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
        <span className="text-gray-800 font-bold">审核详情</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="relative bg-white rounded-lg p-5 border border-gray-200/80 shadow-2xs space-y-4">
            <div className={`absolute top-2.5 right-4 w-[112px] h-[84px] rotate-[-14deg] opacity-85 pointer-events-none ${statusStampClass}`}>
              <div className="absolute left-5 top-0 w-[74px] h-[74px] rounded-full border-[3px] border-current" />
              <div className="absolute left-[27px] top-[8px] w-[58px] h-[58px] rounded-full border border-current" />
              <Star className="absolute left-[27px] top-[21px] w-3 h-3 fill-current" />
              <Star className="absolute left-[48px] top-[8px] w-3 h-3 fill-current" />
              <Star className="absolute left-[69px] top-[21px] w-3 h-3 fill-current" />
              <Star className="absolute left-[35px] top-[48px] w-3 h-3 fill-current" />
              <Star className="absolute left-[62px] top-[48px] w-3 h-3 fill-current" />
              <div className="absolute inset-x-0 top-[25px] h-[39px] rounded-md border-[3px] border-current bg-white/90 flex items-center justify-center">
                <span className="text-xl font-extrabold leading-none">{isPassed ? '已通过' : '已驳回'}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 border-b border-gray-100 pb-3 pr-28">
              <Info className="w-4 h-4 text-[#1E5ABB]" />
              <h3 className="text-sm font-bold text-gray-800">基本信息</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 text-xs text-gray-600">
              <div className="space-y-1">
                <span className="text-gray-400 block">事件标题</span>
                <span className="font-semibold text-gray-900 leading-snug">{record.title}</span>
              </div>
              <div className="space-y-1">
                <span className="text-gray-400 block">上报时间</span>
                <span className="font-mono text-gray-700 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span>{submitTime}</span>
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-gray-400 block">上报人</span>
                <span className="font-medium text-gray-800 flex items-center space-x-1.5">
                  <span className="w-5 h-5 bg-gray-200 text-gray-600 rounded-full inline-flex items-center justify-center text-[10px] font-bold">
                    {reportAuthor.slice(0, 1)}
                  </span>
                  <span>{reportAuthor} · {reportOrganization}</span>
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-gray-400 block">所属机构</span>
                <span className="font-medium text-gray-800">{reportOrganization}</span>
              </div>
              <div className="space-y-1">
                <span className="text-gray-400 block">分值</span>
                <span className="font-mono font-bold text-gray-900">{score ?? '--'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 border border-gray-200/80 shadow-2xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
              <FileText className="w-4 h-4 text-[#1E5ABB]" />
              <h3 className="text-sm font-bold text-gray-800">上报内容</h3>
            </div>

            <div className="space-y-4 text-xs text-gray-700 leading-relaxed">
              <div className="bg-gray-50/70 p-3.5 rounded border border-gray-100 text-gray-800">
                {detail.summary}
              </div>
              <div className="space-y-1">
                <p className="font-bold text-gray-800">【核心诉求】</p>
                <p className="text-gray-600 leading-relaxed">{detail.coreDemands}</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-gray-800">【舆情态势】</p>
                <p className="text-gray-600 leading-relaxed">{detail.publicOpinionTrend}</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-gray-800">【建议举措】</p>
                <div className="space-y-1 text-gray-600">
                  {detail.recommendations.map((rec, index) => (
                    <p key={index}>{rec}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-lg p-5 border border-gray-200/80 shadow-2xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
              {isPassed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <CircleX className="w-4 h-4 text-rose-600" />
              )}
              <h3 className="text-sm font-bold text-gray-800">审核结论</h3>
            </div>

            <div className={`rounded-md p-3 text-xs border ${isPassed ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
              <p className="font-bold mb-1">{isPassed ? '审核通过' : '审核驳回'}</p>
              <p className="leading-relaxed">{isPassed ? `本次审核评分为 ${resultDescription}。` : resultDescription}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 border border-gray-200/80 shadow-2xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
              <History className="w-4 h-4 text-[#1E5ABB]" />
              <h3 className="text-sm font-bold text-gray-800">流转状态</h3>
            </div>

            <div className="space-y-0 text-xs">
              {reviewFlow.map((item, index) => (
                <div key={`${item.title}-${index}`} className="relative flex gap-3 pb-4 last:pb-0">
                  {index < reviewFlow.length - 1 && (
                    <div className="absolute left-[7px] top-4 bottom-0 w-px bg-gray-200" />
                  )}
                  <div className="relative z-10 mt-0.5 h-4 w-4 shrink-0 rounded-full bg-white flex items-center justify-center">
                    {item.tone === 'done' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    {item.tone === 'current' && <span className="h-3 w-3 rounded-full border-2 border-orange-500 bg-orange-100" />}
                    {item.tone === 'rejected' && <CircleX className="w-4 h-4 text-red-500" />}
                    {item.tone === 'waiting' && <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className={item.tone === 'waiting' ? 'font-bold text-gray-400' : 'font-bold text-gray-900'}>{item.title}</div>
                    {item.records.map((flowRecord, recordIndex) => (
                      <div key={`${item.title}-${index}-${recordIndex}`} className="rounded-xl border border-gray-100 bg-white px-2.5 py-2 shadow-[0_1px_0_rgba(15,23,42,0.02)]">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] text-gray-500 truncate">
                            {getFlowActorText(flowRecord)}{flowRecord.time ? ` · ${flowRecord.time}` : ''}
                          </span>
                          {flowRecord.status && (
                            <span className={`text-[11px] font-bold shrink-0 ${getFlowBadgeClass(flowRecord.tone)}`}>
                              {flowRecord.status}
                            </span>
                          )}
                        </div>
                        {flowRecord.reason && (
                          <div className="mt-2 rounded-md border border-red-200 bg-red-50 px-2 py-1.5 text-[11px] leading-relaxed text-red-700">
                            <span className="font-bold">驳回原因：</span>
                            <span>{flowRecord.reason}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
