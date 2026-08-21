import React, { useState } from 'react';
import { ReportItem, PageId, Attachment } from '../types';
import {
  Info,
  FileText,
  Paperclip,
  Clock,
  ChevronRight,
  Send,
  ExternalLink,
  FileSpreadsheet,
  Share2,
  Eye,
  Download
} from 'lucide-react';
import { AttachmentPreviewModal } from '../components/AttachmentPreviewModal';

interface NegativeDetailProps {
  report: ReportItem | null;
  onTransferSubmit: (id: number, opinion: string) => void;
  onNavigate: (page: PageId) => void;
}

export const NegativeDetail: React.FC<NegativeDetailProps> = ({
  report,
  onTransferSubmit,
  onNavigate
}) => {
  const [transferOpinion, setTransferOpinion] = useState('');
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);

  if (!report) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>未选择不良信息记录。</p>
        <button
          onClick={() => onNavigate('negative-info')}
          className="mt-4 px-4 py-2 bg-[#1E5ABB] text-white rounded text-xs"
        >
          返回不良信息库
        </button>
      </div>
    );
  }

  const handleTransfer = () => {
    onTransferSubmit(report.id, transferOpinion);
    onNavigate('negative-info');
  };

  const detail = report.detailContent || {
    summary: '今日（10月24日）上午8时许，多名网民在微博、微信群反映XX区XX街道辖区内多个大型居民小区突发停水。经初步核查，受影响范围包括阳光花园、明月居等5个小区，涉及居民约3万人。',
    coreDemands: '网民普遍反映未接到停水通知，早高峰期间停水严重影响正常生活，部分网民情绪急躁，质疑供水部门应急处置能力。',
    publicOpinionTrend: '目前相关话题在本地区微博同城榜排名呈上升趋势，阅读量已突破10万。暂未发现大规模聚集性负面言论，但个别自媒体账号开始发布未经证实的“管道大面积破裂需要停水数日”的言论。',
    recommendations: [
      '1. 建议区政府立即协调水务集团查明停水原因，并明确预计恢复供水时间。',
      '2. 通过官方渠道（微博、微信公众号）紧急发布停水情况说明，澄清不实传言。',
      '3. 若短时间内无法恢复，建议安排应急送水车前往受影响小区，保障居民基本用水需求。'
    ]
  };

  const attachments = report.attachments || [
    { id: 'a1', name: '微博截图1.png', size: '1.2 MB', type: 'image', thumbnailUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=200&auto=format&fit=crop' },
    { id: 'a2', name: '微信群截图.jpg', size: '850 KB', type: 'image', thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop' },
    { id: 'a3', name: '应急预案初稿.pdf', size: '2.4 MB', type: 'pdf' },
    { id: 'a4', name: '相关舆情专题网页', size: '网址', type: 'link', url: 'https://news.example.com/topic-water' }
  ];

  return (
    <div className="space-y-4">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-1.5 text-xs text-gray-500">
        <button onClick={() => onNavigate('negative-info')} className="hover:text-[#1E5ABB] cursor-pointer">
          报送管理
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
        <button onClick={() => onNavigate('negative-info')} className="hover:text-[#1E5ABB] cursor-pointer">
          不良信息库
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
        <span className="text-gray-800 font-bold">详情</span>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* 基本信息 Card */}
          <div className="bg-white rounded-lg p-5 border border-gray-200/80 shadow-2xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
              <Info className="w-4 h-4 text-[#1E5ABB]" />
              <h3 className="text-sm font-bold text-gray-800">基本信息</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 text-xs text-gray-600">
              <div className="space-y-1">
                <span className="text-gray-400 block">事件标题</span>
                <span className="font-medium text-gray-900">{report.title}</span>
              </div>
              <div className="space-y-1">
                <span className="text-gray-400 block">上报时间</span>
                <span className="font-mono text-gray-700 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span>{report.submitTime}</span>
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-gray-400 block">事件来源</span>
                <span className="inline-block px-2 py-0.5 rounded text-[11px] bg-blue-50 text-blue-600 font-medium border border-blue-100">
                  {report.source}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-gray-400 block">涉及区域</span>
                <span className="font-medium text-gray-800">{report.region}</span>
              </div>
              <div className="space-y-1">
                <span className="text-gray-400 block">信息类型</span>
                <span className="inline-block px-2 py-0.5 rounded text-[11px] bg-purple-50 text-purple-600 font-medium border border-purple-100">
                  {report.infoType}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-gray-400 block">上报人</span>
                <span className="font-medium text-gray-800">
                  <span className="w-5 h-5 bg-gray-200 rounded-full inline-flex items-center justify-center text-[10px] mr-1 text-gray-600 font-bold">张</span>
                  {report.author} · {report.organization}
                </span>
              </div>
              <div className="space-y-1 md:col-span-2">
                <span className="text-gray-400 block">所属机构</span>
                <span className="font-medium text-gray-800">{report.organization}</span>
              </div>
            </div>
          </div>

          {/* 上报详情 */}
          <div className="bg-white rounded-lg p-5 border border-gray-200/80 shadow-2xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
              <FileText className="w-4 h-4 text-[#1E5ABB]" />
              <h3 className="text-sm font-bold text-gray-800">上报详情</h3>
            </div>

            <div className="space-y-4 text-xs text-gray-700 leading-relaxed">
              <p className="bg-gray-50/60 p-3 rounded border border-gray-100">{detail.summary}</p>

              <div>
                <p className="font-bold text-gray-800 mb-1">【核心诉求】</p>
                <p className="text-gray-600 pl-1">{detail.coreDemands}</p>
              </div>

              <div>
                <p className="font-bold text-gray-800 mb-1">【舆情态势】</p>
                <p className="text-gray-600 pl-1">{detail.publicOpinionTrend}</p>
              </div>

              <div>
                <p className="font-bold text-gray-800 mb-1">【建议举措】</p>
                <ul className="space-y-1 text-gray-600 pl-1">
                  {detail.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 附件清单 */}
          <div className="bg-white rounded-lg p-5 border border-gray-200/80 shadow-2xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
              <Paperclip className="w-4 h-4 text-[#1E5ABB]" />
              <h3 className="text-sm font-bold text-gray-800">附件清单</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50/50 hover:border-blue-400 hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  {att.type === 'image' ? (
                    <div
                      className="w-full h-24 bg-gray-100 overflow-hidden relative flex items-center justify-center cursor-pointer group"
                      onClick={() => setPreviewAttachment(att)}
                      title="点击预览图片"
                    >
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                        <span className="px-2.5 py-0.5 bg-black/70 text-white rounded-full text-[11px] font-medium flex items-center space-x-1 backdrop-blur-xs">
                          <Eye className="w-3 h-3" />
                          <span>预览</span>
                        </span>
                      </div>
                      <img
                        src={att.thumbnailUrl || 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=200&auto=format&fit=crop'}
                        alt={att.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  ) : att.type === 'pdf' || att.name.toLowerCase().endsWith('.pdf') ? (
                    <div
                      className="w-full h-24 bg-rose-50/50 flex flex-col items-center justify-center text-rose-600 relative p-3 cursor-pointer group border-b border-gray-100"
                      onClick={() => setPreviewAttachment(att)}
                      title="点击在线预览 PDF"
                    >
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                        <span className="px-2.5 py-0.5 bg-black/70 text-white rounded-full text-[11px] font-medium flex items-center space-x-1 backdrop-blur-xs">
                          <Eye className="w-3 h-3" />
                          <span>阅读</span>
                        </span>
                      </div>
                      <FileText className="w-8 h-8 text-rose-500 group-hover:scale-110 transition-transform" />
                    </div>
                  ) : (
                    <div
                      className="w-full h-24 bg-blue-50/50 flex flex-col items-center justify-center text-[#1E5ABB] relative p-3 cursor-pointer group border-b border-gray-100"
                      onClick={() => setPreviewAttachment(att)}
                      title="点击在线预览表格"
                    >
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                        <span className="px-2.5 py-0.5 bg-black/70 text-white rounded-full text-[11px] font-medium flex items-center space-x-1 backdrop-blur-xs">
                          <Eye className="w-3 h-3" />
                          <span>查看</span>
                        </span>
                      </div>
                      <FileSpreadsheet className="w-8 h-8 text-[#1E5ABB] group-hover:scale-110 transition-transform" />
                    </div>
                  )}

                  <div className="p-2.5 bg-white border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                    <div className="min-w-0 pr-2">
                      <p className="font-medium text-gray-800 truncate">{att.name}</p>
                      <p className="text-[10px] text-gray-400">{att.size}</p>
                    </div>
                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPreviewAttachment(att)}
                        className="text-[#1E5ABB] hover:underline cursor-pointer flex items-center space-x-0.5 font-medium"
                      >
                        <Eye className="w-3 h-3" />
                        <span>预览</span>
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        type="button"
                        onClick={() => alert(`正在下载附件：${att.name}`)}
                        className="text-gray-500 hover:text-[#1E5ABB] hover:underline cursor-pointer flex items-center space-x-0.5 font-medium"
                      >
                        <Download className="w-3 h-3" />
                        <span>下载</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* 转办操作 Card */}
          <div className="bg-white rounded-lg p-5 border border-gray-200/80 shadow-2xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
              <Share2 className="w-4 h-4 text-[#1E5ABB]" />
              <h3 className="text-sm font-bold text-gray-800">转办操作</h3>
            </div>

            {/* Status Header */}
            <div className="bg-gray-100 rounded p-3 text-xs text-gray-600 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <div>
                <p className="font-bold text-gray-800">待转办</p>
                <p className="text-gray-500 text-[11px] mt-0.5">请填写转办意见并提交</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block text-gray-600 font-medium">转办意见</label>
              <textarea
                rows={4}
                value={transferOpinion}
                onChange={(e) => setTransferOpinion(e.target.value)}
                placeholder="请输入转办意见..."
                className="w-full px-3 py-2 border border-gray-300 rounded text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
              />

              <button
                onClick={handleTransfer}
                className="w-full py-2.5 bg-[#1E5ABB] hover:bg-[#134092] text-white font-bold text-xs rounded shadow-2xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>提交转办</span>
              </button>
            </div>
          </div>

          {/* 流转状态 Card */}
          <div className="bg-white rounded-lg p-5 border border-gray-200/80 shadow-2xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
              <Clock className="w-4 h-4 text-[#1E5ABB]" />
              <h3 className="text-sm font-bold text-gray-800">流转状态</h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</div>
                <div>
                  <p className="font-bold text-gray-800">提交上报</p>
                  <p className="text-gray-400 text-[11px]">张三 · 市委宣传部舆情科 · 2023-10-24 09:30</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</div>
                <div>
                  <p className="font-bold text-gray-800">主任审核</p>
                  <p className="text-gray-400 text-[11px]">王主任 · 市委宣传部舆情科 · 2023-10-24 10:15</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✕</div>
                <div className="bg-red-50/80 p-2 rounded border border-red-100 w-full">
                  <p className="font-bold text-red-700">总部驳回</p>
                  <p className="text-red-600 text-[11px] mt-0.5">内容描述不详，请补充相关证明材料</p>
                  <p className="text-gray-400 text-[10px] mt-1 font-mono">2023-10-24 14:00</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</div>
                <div>
                  <p className="font-bold text-gray-800">提交上报（重新提交）</p>
                  <p className="text-gray-400 text-[11px]">张三 · 市委宣传部舆情科 · 2023-10-24 15:30</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</div>
                <div>
                  <p className="font-bold text-gray-800">主任审核</p>
                  <p className="text-gray-400 text-[11px]">王主任 · 市委宣传部舆情科 · 2023-10-24 16:10</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</div>
                <div>
                  <p className="font-bold text-gray-800">总部审核</p>
                  <p className="text-gray-400 text-[11px]">总部审核组 · 2023-10-24 17:00</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">◉</div>
                <div>
                  <p className="font-bold text-gray-800">转办</p>
                  <p className="text-gray-400 text-[11px]">处理中 · 2023-10-24 17:30</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rich Attachment Preview Modal */}
      <AttachmentPreviewModal
        isOpen={!!previewAttachment}
        onClose={() => setPreviewAttachment(null)}
        attachment={previewAttachment}
        attachments={attachments}
        onSelectAttachment={(att) => setPreviewAttachment(att)}
      />
    </div>
  );
};
