import React, { useState } from 'react';
import { X, UploadCloud, Link as LinkIcon } from 'lucide-react';
import { ReportItem } from '../types';

interface NewReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newReport: Partial<ReportItem>) => void;
}

export const NewReportModal: React.FC<NewReportModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [source, setSource] = useState('群众举报');
  const [region, setRegion] = useState('西屯区');
  const [infoType, setInfoType] = useState('突发事件');
  const [author, setAuthor] = useState('张三');
  const [organization, setOrganization] = useState('台中市网信办');
  const [summary, setSummary] = useState('');
  const [demands, setDemands] = useState('');
  const [recommendations, setRecommendations] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title,
      source,
      region,
      infoType,
      author,
      organization,
      submitTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
      auditStatus: '待审核',
      score: '--',
      detailContent: {
        summary: summary || '暂无详细摘要描述。',
        coreDemands: demands || '网民核心诉求正在整理核实中。',
        publicOpinionTrend: '话题关注度一般，总体舆情可控。',
        recommendations: recommendations ? recommendations.split('\n') : ['建议相关责任部门持续监测关注。']
      },
      attachments: [
        { id: 'att-1', name: '速报证据截图.jpg', size: '1.5 MB', type: 'image' }
      ],
      timeline: [
        { title: '提交上报', operator: `${author}·${organization}`, time: new Date().toISOString().replace('T', ' ').substring(0, 16), status: 'completed' },
        { title: '主任审核', operator: '等待审核', status: 'current', note: '待审核' },
        { title: '部门转办', operator: '等待处理', status: 'pending' }
      ]
    });

    // Reset fields
    setTitle('');
    setSummary('');
    setDemands('');
    setRecommendations('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-[#1E5ABB]"></div>
            <h2 className="text-base font-bold text-gray-800">新建速报上报</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              事件标题 <span className="text-blue-600">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请输入清晰的速报事件标题（如：关于某社区突发停水事件的舆情上报）"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">事件来源</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] bg-white"
              >
                <option value="群众举报">群众举报</option>
                <option value="新闻网站">新闻网站</option>
                <option value="社交媒体">社交媒体</option>
                <option value="政府官网">政府官网</option>
                <option value="内部系统">内部系统</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">涉及区域</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] bg-white"
              >
                <option value="西屯区">西屯区</option>
                <option value="全市">全市</option>
                <option value="北屯区">北屯区</option>
                <option value="南屯区">南屯区</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">信息类型</label>
              <select
                value={infoType}
                onChange={(e) => setInfoType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] bg-white"
              >
                <option value="突发事件">突发事件</option>
                <option value="舆情动态">舆情动态</option>
                <option value="政策解读">政策解读</option>
                <option value="民生诉求">民生诉求</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">上报人员</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">所属机构</label>
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">速报内容摘要</label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="请输入事件背景及初步核查情况..."
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">核心诉求 / 舆情焦点</label>
            <input
              type="text"
              value={demands}
              onChange={(e) => setDemands(e.target.value)}
              placeholder="主要诉求或争议焦点..."
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">建议处置举措 (每行一条)</label>
            <textarea
              rows={2}
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              placeholder="1. 立即协调相关部门...&#10;2. 通过官方渠道及时回应..."
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
            />
          </div>

          {/* Attachment upload simulation */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">上传附件 (图片/文档/链接)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#1E5ABB] transition-colors cursor-pointer bg-gray-50">
              <UploadCloud className="w-8 h-8 text-gray-400 mx-auto mb-1" />
              <p className="text-gray-600 font-medium">点击选择或拖拽文件至此处上传</p>
              <p className="text-gray-400 text-[11px] mt-0.5">支持 PNG, JPG, PDF, DOCX (最大 20MB)</p>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-100 font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#1E5ABB] hover:bg-[#134092] text-white rounded font-medium shadow-2xs"
            >
              提交上报
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
