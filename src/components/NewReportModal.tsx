import React, { useState, useEffect } from 'react';
import {
  X,
  UploadCloud,
  Link as LinkIcon,
  FileText,
  Save,
  Clock,
  Trash2,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Zap,
  ShieldAlert,
  HelpCircle,
  BookOpen,
  Check,
  Info,
  SlidersHorizontal,
  MapPin,
  Eye,
  FileSpreadsheet,
  Plus
} from 'lucide-react';
import { ReportItem, DraftReport, Attachment } from '../types';
import { AttachmentPreviewModal } from './AttachmentPreviewModal';

export interface ReportTemplateDef {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  iconName: 'zap' | 'file-text' | 'shield' | 'help' | 'book';
  description: string;
  recommendedFor: string;
  defaultSource: string;
  defaultRegion: string;
  defaultInfoType: string;
  defaultTitle: string;
  summaryTemplate: string;
  demandsTemplate: string;
  recommendationsTemplate: string;
}

export const PRESET_TEMPLATES: ReportTemplateDef[] = [
  {
    id: 'emergency',
    name: '突发事件急报模板',
    badge: '紧急快报',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    iconName: 'zap',
    description: '适用于自然灾害、安全事故、公共卫生及突发社会治安事件的紧急快速报送',
    recommendedFor: '第一发现人 / 网格员 / 应急指挥',
    defaultSource: '网格巡查',
    defaultRegion: '西屯区',
    defaultInfoType: '突发事件',
    defaultTitle: '【紧急】关于某路段突发管网故障抢修进展的快报',
    summaryTemplate: `【突发时间】：${new Date().toLocaleDateString('zh-CN')} ${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}\n【事发精准地点】：西屯区XX路与XX街交叉口\n【事件简述】：现场因市政施工突发管网渗漏，造成路面局部积水并影响早高峰通行。\n【伤亡及损失情况】：现场无人员伤亡，周边已设立安全警戒线。\n【当前处置进展】：抢修工程车辆及应急处置组已进场作业，正在进行分流抢修。`,
    demandsTemplate: '周边居民及过往车主高度关注积水排除与恢复通行的预计时间。',
    recommendationsTemplate: '1. 联动交警支队实施临时交通分流与道路交通疏导。\n2. 属地融媒体中心通过微信公众号发布临时通行提示，回应群众关切。'
  },
  {
    id: 'standard',
    name: '标准图文报送模板',
    badge: '常用推荐',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    iconName: 'file-text',
    description: '适用于日常综合舆情、社情民意核查及一般性事件的标准图文规范上报',
    recommendedFor: '各区县信息员 / 直属部门报送员',
    defaultSource: '群众举报',
    defaultRegion: '西屯区',
    defaultInfoType: '舆情动态',
    defaultTitle: '关于某社区居民集中反映公共设施老化问题的舆情动态',
    summaryTemplate: `一、基本事实概述：\n近期多名市民在社交平台及微信群反映西屯区部分老旧住宅楼公共排污管道破损老化问题。\n\n二、网络舆情发酵态势：\n目前主要在社区业主群内传播讨论，暂无大规模负面舆情外溢。\n\n三、部门初步核实：\n属地街道与物业管理处已完成现场踏勘与登记。`,
    demandsTemplate: '业主普遍希望明确排污管网彻底维修翻新的时间节点与出资方案。',
    recommendationsTemplate: '1. 建议街道城管科联合物业召开现场业主代表沟通会。\n2. 在单元宣传栏公示维修进度与联系人电话。'
  },
  {
    id: 'livelihood',
    name: '民生诉求保障模板',
    badge: '民生专报',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    iconName: 'help',
    description: '针对教育、医疗、物业纠纷、交通出行等民生急难愁盼诉求的专项分析上报',
    recommendedFor: '12345热线对接 / 综合服务专员',
    defaultSource: '热线12345',
    defaultRegion: '北屯区',
    defaultInfoType: '民生诉求',
    defaultTitle: '关于某小区业主反映物业擅自调高公摊费用的诉求专报',
    summaryTemplate: `一、诉求来源与规模：\n12345热线近3日内累计收到相关工单12件，涉及业主超过50户。\n\n二、诉求核心事实：\n业主反映物业管理处未履行公示与表决程序，直接在月度物业费账单中增列地下车库公共能耗费用。\n\n三、初步调解情况：\n社区居委会已介入搭建沟通平台，督促物业做好账目核算。`,
    demandsTemplate: '业主诉求要求暂缓收费、退回多扣费用，并公开公摊电量明细台账。',
    recommendationsTemplate: '1. 建议住建局物业监管科指导街道综治办介入监督。\n2. 督促物业公司严格按《物业管理条例》进行账务核算与公示。'
  },
  {
    id: 'rumor',
    name: '网络辟谣与核查模板',
    badge: '辟谣专报',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    iconName: 'shield',
    description: '针对短视频、微信群恶意摆拍、造谣传谣及虚假宣传的信息取证与官方辟谣',
    recommendedFor: '网信网安 / 辟谣专班',
    defaultSource: '社交媒体',
    defaultRegion: '全市',
    defaultInfoType: '网络谣言',
    defaultTitle: '关于短视频平台流传“某地突发重大事故”不实视频的核查与辟谣建议',
    summaryTemplate: `【谣言核查情况】：\n1. 传播源头：抖音/快手个别账号发布标注为“本地突发大火”的短视频，引发部分网民点赞转发。\n2. 权威核实：经向市应急管理局及消防救援支队核实，当日全市无此类险情，视频实为外省数年前旧闻拼接剪辑。\n3. 危害评估：评论区存在误导性言论，容易引发公众恐慌。`,
    demandsTemplate: '广大网民期待官方查明真相，澄清事实，并对恶意造谣账号依法处置。',
    recommendationsTemplate: '1. 联合公安网安部门依法对首发账号及恶意推流者进行溯源固定证据。\n2. 由市网信办联合网警巡查执法账号发布权威辟谣声明。\n3. 协调各大平台对相关不实违规短视频进行限流与下架标记。'
  },
  {
    id: 'policy',
    name: '政策解读反馈模板',
    badge: '政策调研',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconName: 'book',
    description: '用于重大政策法规或惠民措施发布后，跟踪社会反响、焦点疑问与释疑引导',
    recommendedFor: '宣传部 / 政策研究室',
    defaultSource: '新闻网站',
    defaultRegion: '全市',
    defaultInfoType: '政策解读',
    defaultTitle: '关于《新一轮老旧小区改造补贴政策》发布后的社会反响与舆情专报',
    summaryTemplate: `一、政策发布背景与传播面：\n自政策正式公布以来，各级主流媒体及政务发布平台累计转载报道30余篇次。\n\n二、各方反馈焦点：\n1. 赞成声音占比约70%，普遍认可政府改善人居环境的普惠举措。\n2. 关切焦点集中在加装电梯出资比例及低楼层采光补偿指导标准（占比22%）。\n3. 申报具体流程及办理时效咨询占8%。`,
    demandsTemplate: '希望出台更加细致的实操指引和问答手册（Q&A）。',
    recommendationsTemplate: '1. 组织专家和政策起草人开展线上“一图读懂”宣传解读。\n2. 设置区级政策咨询专窗，专人专岗解答群众疑惑。'
  }
];

interface NewReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newReport: Partial<ReportItem>) => void;
  initialTemplate?: {
    title?: string;
    source?: string;
    region?: string;
    infoType?: string;
    occurAddress?: string;
    summary?: string;
    demands?: string;
    recommendations?: string;
  } | null;
}

export const NewReportModal: React.FC<NewReportModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialTemplate
}) => {
  // Selected Template ID
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('standard');

  // Form Field States
  const [title, setTitle] = useState('');
  const [source, setSource] = useState('群众举报');
  const [region, setRegion] = useState('西屯区');
  const [occurAddress, setOccurAddress] = useState('');
  const [infoType, setInfoType] = useState('突发事件');
  const [author, setAuthor] = useState('张三');
  const [organization, setOrganization] = useState('台中市网信办');
  const [summary, setSummary] = useState('');
  const [demands, setDemands] = useState('');
  const [recommendations, setRecommendations] = useState('');

  // Draft States
  const [drafts, setDrafts] = useState<DraftReport[]>([]);
  const [showDraftBox, setShowDraftBox] = useState(false);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  // Attachments State
  const [attachments, setAttachments] = useState<Attachment[]>([
    {
      id: 'att-upload-1',
      name: '现场突发情况反馈核实材料.jpg',
      size: '2.4 MB',
      type: 'image',
      thumbnailUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop'
    },
    {
      id: 'att-upload-2',
      name: '突发事件舆情监测研判专报(第一期).pdf',
      size: '4.8 MB',
      type: 'pdf'
    }
  ]);
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);

  // Apply a template definition to the form fields
  const applyTemplate = (template: ReportTemplateDef, forceOverride = true) => {
    setSelectedTemplateId(template.id);
    if (forceOverride) {
      if (template.defaultTitle) setTitle(template.defaultTitle);
      if (template.defaultSource) setSource(template.defaultSource);
      if (template.defaultRegion) setRegion(template.defaultRegion);
      if (template.defaultInfoType) setInfoType(template.defaultInfoType);
      setSummary(template.summaryTemplate);
      setDemands(template.demandsTemplate);
      setRecommendations(template.recommendationsTemplate);
    } else {
      // Only fill if empty
      if (!title && template.defaultTitle) setTitle(template.defaultTitle);
      if (!summary && template.summaryTemplate) setSummary(template.summaryTemplate);
      if (!demands && template.demandsTemplate) setDemands(template.demandsTemplate);
      if (!recommendations && template.recommendationsTemplate) setRecommendations(template.recommendationsTemplate);
      setSource(template.defaultSource);
      setRegion(template.defaultRegion);
      setInfoType(template.defaultInfoType);
    }
    triggerToast(`已切换至【${template.name}】`);
  };

  // Load drafts or initial template on mount / open
  useEffect(() => {
    if (isOpen) {
      if (initialTemplate) {
        setTitle(initialTemplate.title || '');
        if (initialTemplate.source) setSource(initialTemplate.source);
        if (initialTemplate.region) setRegion(initialTemplate.region);
        if (initialTemplate.occurAddress) setOccurAddress(initialTemplate.occurAddress);
        if (initialTemplate.infoType) setInfoType(initialTemplate.infoType);
        if (initialTemplate.summary) setSummary(initialTemplate.summary);
        if (initialTemplate.demands) setDemands(initialTemplate.demands);
        if (initialTemplate.recommendations) setRecommendations(initialTemplate.recommendations);
      } else {
        // If no initial template, load default standard template
        const defaultTpl = PRESET_TEMPLATES.find((t) => t.id === 'standard') || PRESET_TEMPLATES[0];
        setSelectedTemplateId(defaultTpl.id);
        setTitle(defaultTpl.defaultTitle);
        setSource(defaultTpl.defaultSource);
        setRegion(defaultTpl.defaultRegion);
        setInfoType(defaultTpl.defaultInfoType);
        setSummary(defaultTpl.summaryTemplate);
        setDemands(defaultTpl.demandsTemplate);
        setRecommendations(defaultTpl.recommendationsTemplate);
      }

      try {
        const saved = localStorage.getItem('ddsb_report_drafts');
        if (saved) {
          setDrafts(JSON.parse(saved));
        }
      } catch (e) {
        // ignore
      }
    }
  }, [isOpen, initialTemplate]);

  const triggerToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 2500);
  };

  // Save current form as draft
  const handleSaveDraft = () => {
    if (!title.trim() && !summary.trim() && !demands.trim()) {
      triggerToast('请至少填写标题或摘要内容再保存草稿');
      return;
    }

    const draftId = activeDraftId || `draft-${Date.now()}`;
    const newDraft: DraftReport = {
      id: draftId,
      title: title.trim() || '未命名草稿',
      source,
      region,
      infoType,
      author,
      organization,
      summary,
      demands,
      recommendations,
      saveTime: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    const updated = [newDraft, ...drafts.filter((d) => d.id !== draftId)];
    setDrafts(updated);
    setActiveDraftId(draftId);
    try {
      localStorage.setItem('ddsb_report_drafts', JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
    triggerToast('草稿保存成功！随时可在草稿箱中恢复');
  };

  // Load selected draft
  const handleLoadDraft = (draft: DraftReport) => {
    setTitle(draft.title === '未命名草稿' ? '' : draft.title);
    setSource(draft.source || '群众举报');
    setRegion(draft.region || '西屯区');
    setInfoType(draft.infoType || '突发事件');
    setAuthor(draft.author || '张三');
    setOrganization(draft.organization || '台中市网信办');
    setSummary(draft.summary || '');
    setDemands(draft.demands || '');
    setRecommendations(draft.recommendations || '');
    setActiveDraftId(draft.id);
    setShowDraftBox(false);
    triggerToast(`已成功恢复草稿: "${draft.title}"`);
  };

  // Delete draft
  const handleDeleteDraft = (draftId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = drafts.filter((d) => d.id !== draftId);
    setDrafts(updated);
    if (activeDraftId === draftId) {
      setActiveDraftId(null);
    }
    try {
      localStorage.setItem('ddsb_report_drafts', JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
    triggerToast('草稿已删除');
  };

  if (!isOpen) return null;

  const currentTemplate = PRESET_TEMPLATES.find((t) => t.id === selectedTemplateId) || PRESET_TEMPLATES[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title,
      source,
      region,
      occurAddress: occurAddress || `${region}相关涉事区域`,
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
      attachments: attachments.length > 0 ? attachments : [
        { id: 'att-1', name: '速报凭证材料.jpg', size: '1.5 MB', type: 'image' }
      ],
      timeline: [
        { title: '提交上报', operator: `${author}·${organization}`, time: new Date().toISOString().replace('T', ' ').substring(0, 16), status: 'completed' },
        { title: '初审研判', operator: '市委宣传部舆情科', time: '待审核', status: 'current', note: '待审核' },
        { title: '终审签批', operator: '市网信办领导', status: 'pending' },
        { title: '办结归档', operator: '系统归档', status: 'pending' }
      ]
    });

    // If submitted from a draft, remove it from drafts
    if (activeDraftId) {
      const updated = drafts.filter((d) => d.id !== activeDraftId);
      setDrafts(updated);
      try {
        localStorage.setItem('ddsb_report_drafts', JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
    }

    // Reset fields
    setTitle('');
    setSummary('');
    setDemands('');
    setRecommendations('');
    setOccurAddress('');
    setActiveDraftId(null);
    onClose();
  };

  const renderTemplateIcon = (iconName: ReportTemplateDef['iconName']) => {
    switch (iconName) {
      case 'zap':
        return <Zap className="w-4 h-4 text-rose-600" />;
      case 'file-text':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'help':
        return <HelpCircle className="w-4 h-4 text-amber-600" />;
      case 'shield':
        return <ShieldAlert className="w-4 h-4 text-purple-600" />;
      case 'book':
        return <BookOpen className="w-4 h-4 text-emerald-600" />;
      default:
        return <FileText className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col border border-gray-200 overflow-hidden relative">
        {/* Toast Notice */}
        {toastNotice && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900/95 text-white text-xs px-4 py-2 rounded-full shadow-2xl flex items-center space-x-2 animate-in fade-in zoom-in-95">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastNotice}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-gray-200/90 bg-gradient-to-r from-blue-900 via-[#1E5ABB] to-blue-800 text-white shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold tracking-tight">新建速报上报</h2>
                <span className="text-[11px] bg-white/20 text-white px-2 py-0.5 rounded-full font-medium border border-white/30">
                  支持多套智能模板
                </span>
              </div>
              <p className="text-[11px] text-blue-100/80">根据业务场景快速套用标准化上报格式</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Draft Box Button */}
            <button
              type="button"
              onClick={() => setShowDraftBox(!showDraftBox)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-all flex items-center space-x-1.5 font-medium cursor-pointer ${
                showDraftBox
                  ? 'bg-amber-400 text-blue-950 border-amber-300 shadow-sm font-bold'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>草稿箱</span>
              {drafts.length > 0 && (
                <span className="ml-1 bg-amber-400 text-blue-900 text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">
                  {drafts.length}
                </span>
              )}
            </button>

            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/15 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Draft List Panel Drawer */}
        {showDraftBox && (
          <div className="bg-blue-50/90 border-b border-blue-200 p-4 animate-in slide-in-from-top-2 shrink-0">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-xs text-blue-900 flex items-center space-x-1">
                <FileText className="w-3.5 h-3.5 text-blue-700" />
                <span>草稿箱列表 ({drafts.length})</span>
              </span>
              <span className="text-[11px] text-blue-600">点击任意草稿一键恢复编辑</span>
            </div>

            {drafts.length === 0 ? (
              <div className="text-center py-4 bg-white rounded-lg border border-blue-100 text-xs text-gray-500">
                草稿箱暂无内容。填写过程中可点击底部的“存为草稿”随时暂存。
              </div>
            ) : (
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {drafts.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => handleLoadDraft(d)}
                    className={`p-2.5 bg-white hover:bg-blue-50/60 rounded-lg border transition-all cursor-pointer flex justify-between items-center shadow-2xs ${
                      activeDraftId === d.id ? 'border-[#1E5ABB] ring-2 ring-blue-200' : 'border-blue-100'
                    }`}
                  >
                    <div className="truncate mr-3">
                      <p className="font-bold text-xs text-gray-800 truncate">{d.title}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        保存时间: {d.saveTime} · {d.source} · {d.infoType}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleLoadDraft(d)}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#1E5ABB] text-[11px] font-bold rounded-md"
                      >
                        恢复
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteDraft(d.id, e)}
                        className="p-1 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-md"
                        title="删除草稿"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* SECTION 1: 模板选择器 (Template Selection Header Bar) */}
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 p-4 rounded-xl border border-blue-100/80 shadow-2xs" id="template-selection-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="p-1 rounded-md bg-[#1E5ABB] text-white">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs font-bold text-gray-800">选择报送模板</span>
                <span className="text-[11px] text-gray-500">点击模板一键套用标准结构与样例</span>
              </div>
            </div>

            {/* Quick Template Chips Carousel/Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {PRESET_TEMPLATES.map((tpl) => {
                const isSelected = selectedTemplateId === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => applyTemplate(tpl, true)}
                    className={`p-2.5 rounded-lg border text-left transition-all relative flex flex-col justify-between cursor-pointer group ${
                      isSelected
                        ? 'bg-white border-[#1E5ABB] shadow-md ring-2 ring-blue-100'
                        : 'bg-white/80 hover:bg-white border-gray-200/80 hover:border-blue-200 shadow-2xs'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#1E5ABB] text-white rounded-full flex items-center justify-center shadow-xs">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                    <div>
                      <div className="flex items-center space-x-1.5 mb-1">
                        {renderTemplateIcon(tpl.iconName)}
                        <span className={`text-[11px] font-bold truncate ${isSelected ? 'text-[#1E5ABB]' : 'text-gray-700'}`}>
                          {tpl.name.replace('模板', '')}
                        </span>
                      </div>
                      <span className={`inline-block text-[9px] px-1.5 py-0.2 rounded border font-semibold ${tpl.badgeColor}`}>
                        {tpl.badge}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Template Description & Restore Hint */}
            <div className="mt-3 pt-3 border-t border-blue-100/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-start space-x-2">
                <Info className="w-3.5 h-3.5 text-[#1E5ABB] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-gray-800">当前模板：{currentTemplate.name}</span>
                  <span className="text-gray-500 ml-1.5">（{currentTemplate.description}）</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => applyTemplate(currentTemplate, true)}
                  className="text-[11px] text-[#1E5ABB] hover:underline font-semibold flex items-center space-x-1 bg-white px-2.5 py-1 rounded border border-blue-200 hover:bg-blue-50/50 cursor-pointer shadow-2xs"
                  title="重新按当前模板填充格式框架"
                >
                  <RotateCcw className="w-3 h-3 text-blue-600" />
                  <span>重置当前模板内容</span>
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 2: 报送核心表单 (Main Form) */}
          <form onSubmit={handleSubmit} id="new-report-form" className="space-y-4 text-xs">
            {/* Title */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-gray-700 font-bold flex items-center space-x-1">
                  <span>事件标题</span>
                  <span className="text-rose-500 font-bold">*</span>
                </label>
                <span className="text-[10px] text-gray-400">建议包含地点、事件核心要素及性质</span>
              </div>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="请输入清晰的速报事件标题（如：关于某社区突发停水事件的舆情上报）"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/20 focus:border-[#1E5ABB] text-xs transition-all font-medium text-gray-900 bg-white"
              />
            </div>

            {/* 4-Field Row: Source, Region, Occur Address, InfoType */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-gray-700 font-bold mb-1">事件来源</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] bg-white text-xs text-gray-800"
                >
                  <option value="群众举报">群众举报</option>
                  <option value="网格巡查">网格巡查</option>
                  <option value="热线12345">热线12345</option>
                  <option value="社交媒体">社交媒体</option>
                  <option value="新闻网站">新闻网站</option>
                  <option value="政府官网">政府官网</option>
                  <option value="内部系统">内部系统</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">涉及区域</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] bg-white text-xs text-gray-800"
                >
                  <option value="西屯区">西屯区</option>
                  <option value="西坝区">西坝区</option>
                  <option value="北屯区">北屯区</option>
                  <option value="南屯区">南屯区</option>
                  <option value="南坝区">南坝区</option>
                  <option value="全市">全市范围</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">信息类型</label>
                <select
                  value={infoType}
                  onChange={(e) => setInfoType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] bg-white text-xs text-gray-800"
                >
                  <option value="突发事件">突发事件</option>
                  <option value="舆情动态">舆情动态</option>
                  <option value="民生诉求">民生诉求</option>
                  <option value="网络谣言">网络谣言</option>
                  <option value="政策解读">政策解读</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1 flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-gray-500" />
                  <span>发生地址 (选填)</span>
                </label>
                <input
                  type="text"
                  value={occurAddress}
                  onChange={(e) => setOccurAddress(e.target.value)}
                  placeholder="如：西屯路38号小区"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] text-xs text-gray-800"
                />
              </div>
            </div>

            {/* Author & Organization Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50/80 p-3 rounded-lg border border-gray-200">
              <div>
                <label className="block text-gray-600 font-semibold mb-1">上报人员</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] bg-white text-xs"
                />
              </div>
              <div>
                <label className="block text-gray-600 font-semibold mb-1">所属机构 / 部门</label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] bg-white text-xs"
                />
              </div>
            </div>

            {/* Summary */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-gray-700 font-bold flex items-center space-x-1">
                  <span>速报内容详情 / 事件经过</span>
                  <span className="text-rose-500 font-bold">*</span>
                </label>
                <span className="text-[10px] text-gray-400">支持直接根据模板编辑或粘贴</span>
              </div>
              <textarea
                rows={4}
                required
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="请输入详细的事件背景、发生经过、现场核实情况及当前处置动态..."
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/20 focus:border-[#1E5ABB] text-xs leading-relaxed text-gray-900 bg-white"
              />
            </div>

            {/* Demands */}
            <div>
              <label className="block text-gray-700 font-bold mb-1">核心诉求 / 争议焦点</label>
              <input
                type="text"
                value={demands}
                onChange={(e) => setDemands(e.target.value)}
                placeholder="简明概括群众核心诉求、网民关注焦点或社会影响..."
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] text-xs text-gray-800 bg-white"
              />
            </div>

            {/* Recommendations */}
            <div>
              <label className="block text-gray-700 font-bold mb-1">建议处置举措 (每行一条建议)</label>
              <textarea
                rows={2}
                value={recommendations}
                onChange={(e) => setRecommendations(e.target.value)}
                placeholder="1. 立即协调相关主管部门实地核查处置...&#10;2. 官方渠道统一答复口径，防范负面炒作..."
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] text-xs leading-relaxed text-gray-800 bg-white"
              />
            </div>

            {/* Attachment upload & preview */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-gray-700 font-bold">上传证据附件 (图片 / PDF / 现场截图)</label>
                <span className="text-[11px] text-gray-400">已添加 {attachments.length} 个附件</span>
              </div>

              {/* Upload Drop Area */}
              <div
                onClick={() => {
                  const sampleNames = [
                    { name: '社区应急网格巡查核实记录表.pdf', type: 'pdf', size: '3.2 MB' },
                    { name: '涉事小区现场排查照片_02.jpg', type: 'image', size: '1.8 MB', thumbnailUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop' },
                    { name: '停水停电影响住户统计明细表.xlsx', type: 'sheet', size: '920 KB' }
                  ];
                  const randomSample = sampleNames[attachments.length % sampleNames.length];
                  const newAtt: Attachment = {
                    id: `att-upload-${Date.now()}`,
                    name: randomSample.name,
                    size: randomSample.size,
                    type: randomSample.type as any,
                    thumbnailUrl: randomSample.thumbnailUrl
                  };
                  setAttachments([...attachments, newAtt]);
                  triggerToast(`已添加附件: ${newAtt.name}`);
                }}
                className="border-2 border-dashed border-gray-300 hover:border-[#1E5ABB] hover:bg-blue-50/20 rounded-xl p-4 text-center transition-all cursor-pointer bg-gray-50/60 group"
              >
                <UploadCloud className="w-7 h-7 text-gray-400 group-hover:text-[#1E5ABB] mx-auto mb-1 transition-colors" />
                <p className="text-gray-700 font-semibold text-xs group-hover:text-[#1E5ABB]">点击选择或拖拽文件至此处上传 (点击添加示例附件)</p>
                <p className="text-gray-400 text-[10px] mt-0.5">支持 PNG, JPG, PDF, XLSX, DOCX (单个文件最大 20MB)</p>
              </div>

              {/* Uploaded Attachments List */}
              {attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="text-[11px] font-bold text-gray-500 flex items-center justify-between">
                    <span>已选佐证附件列表：</span>
                    <span className="text-[10px] text-gray-400 font-normal">点击“预览”可即时查看内容</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between p-2.5 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-xs transition-all text-xs"
                      >
                        <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                            {att.type === 'image' ? (
                              <img src={att.thumbnailUrl} alt={att.name} className="w-full h-full object-cover" />
                            ) : att.type === 'pdf' ? (
                              <FileText className="w-4 h-4 text-rose-500" />
                            ) : (
                              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 truncate text-[11px]">{att.name}</p>
                            <p className="text-[10px] text-gray-400">{att.size}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewAttachment(att);
                            }}
                            className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-[#1E5ABB] rounded text-[11px] font-bold flex items-center space-x-1 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>预览</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAttachments(attachments.filter((a) => a.id !== att.id));
                              triggerToast(`已移除附件: ${att.name}`);
                            }}
                            className="p-1 text-gray-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                            title="移除此附件"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Modal Sticky Footer */}
        <div className="px-6 py-3.5 border-t border-gray-200 bg-gray-50/90 flex justify-between items-center shrink-0">
          {/* Draft Action Button */}
          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Save className="w-3.5 h-3.5 text-amber-700" />
            <span>存为草稿</span>
          </button>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-semibold text-xs cursor-pointer transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              form="new-report-form"
              className="px-6 py-2 bg-[#1E5ABB] hover:bg-[#134092] text-white rounded-lg font-bold text-xs shadow-md transition-all cursor-pointer active:scale-98 flex items-center space-x-1.5"
            >
              <span>提交审核</span>
            </button>
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

