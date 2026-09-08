import React, { useState, useMemo } from 'react';
import { PageId, NoticeItem, NoticeCategory, NoticePriority, NoticeStatus, NewNoticeFormData, Attachment } from '../types';
import { PRESET_NOTICE_TEMPLATES } from '../data/mockNotices';
import { getStoredNotices, saveStoredNotices, createNoticeItem } from '../services/noticeService';
import {
  Megaphone,
  Plus,
  Search,
  Pin,
  Flame,
  AlertCircle,
  FileText,
  CheckCircle2,
  Clock,
  Send,
  Eye,
  Edit,
  Trash2,
  RotateCcw,
  Sparkles,
  Download,
  Users,
  Building2,
  ShieldAlert,
  ShieldCheck,
  Award,
  Layers,
  FileCheck,
  Check,
  X,
  Printer,
  ChevronRight,
  Filter,
  LayoutGrid,
  List,
  Calendar,
  Share2,
  Paperclip,
  Bookmark,
  BellRing,
  HelpCircle
} from 'lucide-react';

interface NoticeManagementProps {
  onNavigate: (page: PageId) => void;
  currentUser?: string;
  currentOrg?: string;
}

const AVAILABLE_ORGS = [
  '广域传媒主机构',
  '台中市网信办',
  '中共台中市委宣传部',
  '西屯区宣传部',
  '北屯区宣传部',
  '南屯区宣传部',
  '东湖区宣传处',
  '高新区管委会舆情室',
  '市公安局网安支队',
  '市应急管理局',
  '市卫健委宣传处',
  '市教育局宣教科',
  '市融媒体中心'
];

export const NoticeManagement: React.FC<NoticeManagementProps> = ({
  onNavigate,
  currentUser = '张三',
  currentOrg = '台中市网信办'
}) => {
  // State
  const [notices, setNotices] = useState<NoticeItem[]>(() => getStoredNotices());
  const [activeTab, setActiveTab] = useState<'all' | 'mine' | 'draft'>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modals
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<NoticeItem | null>(null);
  const [viewingNotice, setViewingNotice] = useState<NoticeItem | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<NewNoticeFormData>({
    title: '',
    category: '工作提示',
    priority: '普通',
    scope: '全网信系统',
    targetOrgs: ['台中市网信办', '西屯区宣传部', '北屯区宣传部', '南屯区宣传部'],
    isPinned: false,
    requireConfirm: false,
    expireTime: '',
    summary: '',
    content: '',
    attachments: []
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync to localStorage
  const updateNoticesState = (newNotices: NoticeItem[]) => {
    setNotices(newNotices);
    saveStoredNotices(newNotices);
  };

  const handleResetFilters = () => {
    setSearchKeyword('');
    setSelectedCategory('all');
    setSelectedPriority('all');
    setSelectedStatus('all');
  };

  // Stat metrics calculation
  const stats = useMemo(() => {
    const total = notices.length;
    const published = notices.filter((n) => n.status === '已发布').length;
    const pinned = notices.filter((n) => n.isPinned && n.status === '已发布').length;
    const urgent = notices.filter((n) => (n.priority === '紧急' || n.priority === '特急') && n.status === '已发布').length;
    const drafts = notices.filter((n) => n.status === '草稿').length;
    const confirmNeeded = notices.filter((n) => n.requireConfirm && n.status === '已发布').length;

    let totalRead = 0;
    let totalTarget = 0;
    notices.filter((n) => n.status === '已发布').forEach((n) => {
      totalRead += n.readCount;
      totalTarget += n.totalTargetCount;
    });
    const avgReadRate = totalTarget > 0 ? ((totalRead / totalTarget) * 100).toFixed(1) : '92.4';

    return { total, published, pinned, urgent, drafts, confirmNeeded, avgReadRate };
  }, [notices]);

  // Filtering notices
  const filteredNotices = useMemo(() => {
    return notices
      .filter((item) => {
        // Tab Filter
        if (activeTab === 'urgent' && !(item.priority === '紧急' || item.priority === '特急' || item.isPinned)) return false;
        if (activeTab === 'mine' && !item.publisher.includes(currentUser) && !item.publishOrg.includes(currentOrg)) return false;
        if (activeTab === 'confirm' && (!item.requireConfirm || item.status !== '已发布')) return false;
        if (activeTab === 'draft' && item.status !== '草稿') return false;
        if (activeTab !== 'draft' && item.status === '草稿' && activeTab !== 'mine') return false;

        // Category Filter
        if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;

        // Priority Filter
        if (selectedPriority !== 'all' && item.priority !== selectedPriority) return false;

        // Status Filter
        if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;

        // Keyword search
        if (searchKeyword.trim()) {
          const kw = searchKeyword.trim().toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(kw);
          const matchContent = item.content.toLowerCase().includes(kw);
          const matchPublisher = item.publisher.toLowerCase().includes(kw);
          const matchOrg = item.publishOrg.toLowerCase().includes(kw);
          const matchCategory = item.category.toLowerCase().includes(kw);
          return matchTitle || matchContent || matchPublisher || matchOrg || matchCategory;
        }

        return true;
      })
      .sort((a, b) => {
        // Pinned first, then by publish time descending
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime();
      });
  }, [notices, activeTab, selectedCategory, selectedPriority, selectedStatus, searchKeyword, currentUser, currentOrg]);

  // Actions
  const handleOpenPublishModal = (editTarget?: NoticeItem) => {
    if (editTarget) {
      setEditingNotice(editTarget);
      setFormData({
        title: editTarget.title,
        category: editTarget.category,
        priority: editTarget.priority,
        scope: editTarget.scope,
        targetOrgs: editTarget.targetOrgs || [],
        isPinned: editTarget.isPinned,
        requireConfirm: editTarget.requireConfirm || false,
        expireTime: editTarget.expireTime || '',
        summary: editTarget.summary || '',
        content: editTarget.content,
        attachments: editTarget.attachments || []
      });
    } else {
      setEditingNotice(null);
      setFormData({
        title: '',
        category: '工作提示',
        priority: '普通',
        scope: '全网信系统',
        targetOrgs: ['台中市网信办', '西屯区宣传部', '北屯区宣传部', '南屯区宣传部'],
        isPinned: false,
        requireConfirm: false,
        expireTime: '',
        summary: '',
        content: '',
        attachments: []
      });
    }
    setIsPublishModalOpen(true);
  };

  const handleApplyPresetTemplate = (templateId: string) => {
    const tpl = PRESET_NOTICE_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;
    setFormData((prev) => ({
      ...prev,
      title: tpl.title,
      category: tpl.category as NoticeCategory,
      priority: tpl.priority as NoticePriority,
      scope: tpl.scope,
      targetOrgs: tpl.targetOrgs,
      summary: tpl.summary,
      content: tpl.content,
      isPinned: tpl.isPinned,
      requireConfirm: tpl.requireConfirm
    }));
    showToast(`已成功载入模版「${tpl.name}」`);
  };

  const handleSaveNotice = (isDraft: boolean = false) => {
    if (!formData.title.trim()) {
      showToast('请输入公告标题');
      return;
    }
    if (!formData.content.trim()) {
      showToast('请输入公告正文内容');
      return;
    }

    if (editingNotice) {
      // Update existing
      const updatedList = notices.map((item) => {
        if (item.id === editingNotice.id) {
          return {
            ...item,
            title: formData.title.trim(),
            category: formData.category,
            priority: formData.priority,
            scope: formData.scope,
            targetOrgs: formData.targetOrgs,
            isPinned: formData.isPinned,
            requireConfirm: formData.requireConfirm,
            expireTime: formData.expireTime,
            summary: formData.summary || formData.content.slice(0, 90) + '...',
            content: formData.content.trim(),
            attachments: formData.attachments || [],
            status: isDraft ? '草稿' : '已发布'
          };
        }
        return item;
      });
      updateNoticesState(updatedList);
      showToast(isDraft ? '草稿已保存' : '公告已成功更新发布');
    } else {
      // Create new
      const newNotice = createNoticeItem(formData, `${currentUser} (管理员)`, currentOrg, isDraft);
      updateNoticesState([newNotice, ...notices]);
      showToast(isDraft ? '已存入草稿箱' : '🎉 公告发布成功并已实时同步至全网各接入终端');
    }

    setIsPublishModalOpen(false);
    setEditingNotice(null);
  };

  const handleTogglePin = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = notices.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n));
    updateNoticesState(updated);
    const target = notices.find((n) => n.id === id);
    showToast(target?.isPinned ? '已取消置顶' : '📌 已将该公告置顶显示');
  };

  const handleRecall = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = notices.map((n) => (n.id === id ? { ...n, status: '已撤回' as NoticeStatus } : n));
    updateNoticesState(updated);
    showToast('公告已撤回，受众端将不再展示');
  };

  const handleDelete = (id: string) => {
    const updated = notices.filter((n) => n.id !== id);
    updateNoticesState(updated);
    setDeleteConfirmId(null);
    showToast('公告已删除');
  };

  const handleConfirmRead = (notice: NoticeItem) => {
    const updated = notices.map((n) => {
      if (n.id === notice.id) {
        const now = new Date();
        const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const existingReaders = n.readers || [];
        const isAlreadyRead = existingReaders.some((r) => r.name === currentUser);
        const newReaders = isAlreadyRead
          ? existingReaders.map((r) => (r.name === currentUser ? { ...r, confirmed: true, readTime: timeStr } : r))
          : [...existingReaders, { name: currentUser, org: currentOrg, readTime: timeStr, confirmed: true }];

        return {
          ...n,
          readCount: isAlreadyRead ? n.readCount : n.readCount + 1,
          confirmCount: (n.confirmCount || 0) + 1,
          readers: newReaders
        };
      }
      return n;
    });
    updateNoticesState(updated);
    const updatedTarget = updated.find((n) => n.id === notice.id);
    if (updatedTarget) setViewingNotice(updatedTarget);
    showToast('✓ 签收回执确认成功，已记录您的阅读日志');
  };

  const handleAddSampleAttachment = (type: 'pdf' | 'image') => {
    const newAtt: Attachment = {
      id: `att-${Date.now()}`,
      name: type === 'pdf' ? `政务网络舆情处置规范指导手册_${Date.now().toString().slice(-4)}.pdf` : `现场核查证据图表_${Date.now().toString().slice(-4)}.png`,
      size: type === 'pdf' ? '2.4 MB' : '1.8 MB',
      type: type
    };
    setFormData((prev) => ({
      ...prev,
      attachments: [...(prev.attachments || []), newAtt]
    }));
    showToast('已添加公文附件');
  };

  const handleRemoveAttachment = (attId: string) => {
    setFormData((prev) => ({
      ...prev,
      attachments: (prev.attachments || []).filter((a) => a.id !== attId)
    }));
  };

  // Helper styles for Category & Priority
  const getCategoryBadge = (category: NoticeCategory) => {
    switch (category) {
      case '紧急通知':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center space-x-1"><Flame className="w-3 h-3 text-rose-600" /><span>紧急通知</span></span>;
      case '业务通报':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center space-x-1"><FileText className="w-3 h-3 text-blue-600" /><span>业务通报</span></span>;
      case '工作提示':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center space-x-1"><BellRing className="w-3 h-3 text-amber-600" /><span>工作提示</span></span>;
      case '政策下达':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1"><ShieldCheck className="w-3 h-3 text-emerald-600" /><span>政策下达</span></span>;
      case '系统通知':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center space-x-1"><Layers className="w-3 h-3 text-indigo-600" /><span>系统通知</span></span>;
      case '考核公示':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center space-x-1"><Award className="w-3 h-3 text-purple-600" /><span>考核公示</span></span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">{category}</span>;
    }
  };

  const getPriorityBadge = (priority: NoticePriority) => {
    switch (priority) {
      case '特急':
        return <span className="px-2 py-0.5 bg-red-600 text-white text-[11px] font-extrabold rounded-md shadow-2xs">特急</span>;
      case '紧急':
        return <span className="px-2 py-0.5 bg-rose-500 text-white text-[11px] font-bold rounded-md">紧急</span>;
      case '重要':
        return <span className="px-2 py-0.5 bg-amber-500 text-white text-[11px] font-bold rounded-md">重要</span>;
      default:
        return <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-medium rounded-md border border-slate-200">普通</span>;
    }
  };

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#1E5ABB] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-bold flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner & Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1E5ABB] to-blue-500 text-white flex items-center justify-center shadow-md shrink-0">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-black text-slate-800 tracking-tight">公告管理</h1>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          <button
            onClick={() => handleOpenPublishModal()}
            className="flex items-center space-x-2 px-4 py-2.5 bg-[#1E5ABB] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer hover:shadow-lg active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>发布新公告</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3.5">
        {/* Tabs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[#1E5ABB] text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              全部公告
            </button>
            <button
              onClick={() => setActiveTab('mine')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'mine'
                  ? 'bg-[#1E5ABB] text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              我发布的
            </button>
            <button
              onClick={() => setActiveTab('draft')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'draft'
                  ? 'bg-slate-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              草稿箱 ({stats.drafts})
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all flex items-center space-x-1 ${
                viewMode === 'table' ? 'bg-white text-[#1E5ABB] shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="公文列表视图"
            >
              <List className="w-3.5 h-3.5" />
              <span>列表</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all flex items-center space-x-1 ${
                viewMode === 'cards' ? 'bg-white text-[#1E5ABB] shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="卡片流视图"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>卡片</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1">
            {/* Keyword Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜索公告标题、正文、发布人、受众..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/20 focus:border-[#1E5ABB] transition-all"
              />
              {searchKeyword && (
                <button
                  onClick={() => setSearchKeyword('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 shrink-0 font-medium">分类：</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/20 focus:border-[#1E5ABB] transition-all"
              >
                <option value="all">全部分类</option>
                <option value="紧急通知">紧急通知</option>
                <option value="业务通报">业务通报</option>
                <option value="工作提示">工作提示</option>
                <option value="政策下达">政策下达</option>
                <option value="系统通知">系统通知</option>
                <option value="考核公示">考核公示</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 shrink-0 font-medium">级别：</span>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/20 focus:border-[#1E5ABB] transition-all"
              >
                <option value="all">全部优先级</option>
                <option value="特急">特急</option>
                <option value="紧急">紧急</option>
                <option value="重要">重要</option>
                <option value="普通">普通</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 shrink-0 font-medium">状态：</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/20 focus:border-[#1E5ABB] transition-all"
              >
                <option value="all">全部状态</option>
                <option value="已发布">已发布</option>
                <option value="草稿">草稿箱</option>
                <option value="已撤回">已撤回</option>
              </select>
            </div>
          </div>

          {/* Action Buttons: 查询 和 重置条件 */}
          <div className="flex items-center space-x-2 shrink-0 justify-end">
            <button
              onClick={() => {}}
              className="px-4 py-2 bg-[#1E5ABB] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer flex items-center space-x-1.5 active:scale-98"
            >
              <Search className="w-3.5 h-3.5" />
              <span>查询</span>
            </button>
            <button
              onClick={handleResetFilters}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all cursor-pointer flex items-center space-x-1.5 active:scale-98"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重置条件</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notice List Section */}
      {filteredNotices.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-700">暂无匹配的历史公告</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            没有找到符合当前筛选条件的公文或通知，您可以尝试调整筛选条件或新建发布公告。
          </p>
          <button
            onClick={() => {
              setActiveTab('all');
              setSelectedCategory('all');
              setSelectedPriority('all');
              setSelectedStatus('all');
              setSearchKeyword('');
            }}
            className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            重置筛选条件
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotices.map((notice) => {
            const readPercentage =
              notice.totalTargetCount > 0
                ? Math.min(100, Math.round((notice.readCount / notice.totalTargetCount) * 100))
                : 0;

            return (
              <div
                key={notice.id}
                onClick={() => setViewingNotice(notice)}
                className={`bg-white rounded-2xl p-5 border transition-all duration-200 hover:shadow-md cursor-pointer relative group flex flex-col justify-between ${
                  notice.isPinned
                    ? 'border-amber-300/80 bg-gradient-to-br from-amber-50/20 via-white to-white ring-1 ring-amber-400/20'
                    : 'border-slate-200/90 hover:border-[#1E5ABB]/50'
                }`}
              >
                <div>
                  {/* Top Badges & Meta */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      {notice.isPinned && (
                        <span className="px-2 py-0.5 bg-amber-500 text-white text-[11px] font-extrabold rounded-md flex items-center space-x-1 shadow-2xs">
                          <Pin className="w-3 h-3" />
                          <span>置顶</span>
                        </span>
                      )}
                      {getCategoryBadge(notice.category)}
                      {getPriorityBadge(notice.priority)}
                      {notice.requireConfirm && (
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[11px] font-bold rounded-md border border-indigo-200 flex items-center space-x-1">
                          <FileCheck className="w-3 h-3" />
                          <span>需签收</span>
                        </span>
                      )}
                      {notice.status === '草稿' && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-md border border-slate-300">
                          草稿
                        </span>
                      )}
                      {notice.status === '已撤回' && (
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[11px] font-bold rounded-md border border-rose-200">
                          已撤回
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] font-mono text-slate-400 shrink-0">
                      {notice.id}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-[#1E5ABB] transition-colors line-clamp-2 leading-snug">
                    {notice.title}
                  </h3>

                  {/* Summary */}
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {notice.summary || notice.content}
                  </p>

                  {/* Attachments preview pill if any */}
                  {notice.attachments && notice.attachments.length > 0 && (
                    <div className="mt-3 flex items-center space-x-1.5 text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/80 w-fit">
                      <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                      <span>包含 {notice.attachments.length} 个公文附件 ({notice.attachments[0].name.slice(0, 20)}...)</span>
                    </div>
                  )}
                </div>

                {/* Card Footer: Metadata & Progress */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-slate-700">{notice.publishOrg}</span>
                      <span className="text-slate-300">·</span>
                      <span>{notice.publisher.split(' ')[0]}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-slate-400 text-[11px]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{notice.publishTime}</span>
                    </div>
                  </div>

                  {/* Read Rate Bar & Quick Actions */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 max-w-[200px]">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                        <span>查阅进度</span>
                        <span className="font-bold text-slate-700">
                          {notice.readCount}/{notice.totalTargetCount} ({readPercentage}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            readPercentage > 80
                              ? 'bg-emerald-500'
                              : readPercentage > 50
                              ? 'bg-blue-500'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${readPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Quick Button Group */}
                    <div className="flex items-center space-x-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleTogglePin(notice.id, e)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          notice.isPinned
                            ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                        }`}
                        title={notice.isPinned ? '取消置顶' : '置顶展示'}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleOpenPublishModal(notice)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        title="编辑公文"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      {notice.status === '已发布' && (
                        <button
                          onClick={(e) => handleRecall(notice.id, e)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                          title="撤回公告"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => setDeleteConfirmId(notice.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="删除公告"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setViewingNotice(notice)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-[#1E5ABB] text-slate-700 hover:text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1 ml-1"
                      >
                        <span>查阅</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/90 text-slate-600 text-xs font-bold border-b border-slate-200">
                  <th className="py-3.5 px-4 w-14 text-center">序号</th>
                  <th className="py-3.5 px-4 w-32">分类 / 级别</th>
                  <th className="py-3.5 px-4">公告公文标题与摘要</th>
                  <th className="py-3.5 px-4 w-36">受众范围</th>
                  <th className="py-3.5 px-4 w-36">签发单位</th>
                  <th className="py-3.5 px-4 w-40">发布人/发布时间</th>
                  <th className="py-3.5 px-4 w-24 text-center">状态</th>
                  <th className="py-3.5 px-4 w-44 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredNotices.map((notice, idx) => {
                  return (
                    <tr
                      key={notice.id}
                      onClick={() => setViewingNotice(notice)}
                      className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                    >
                      <td className="py-4 px-4 text-center text-slate-400 font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col space-y-1.5 items-start">
                          <div className="flex items-center space-x-1">
                            {getCategoryBadge(notice.category)}
                          </div>
                          <div>{getPriorityBadge(notice.priority)}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <span className="font-bold text-slate-900 group-hover:text-[#1E5ABB] transition-colors text-[13px] line-clamp-1">
                            {notice.title}
                          </span>
                          {notice.attachments && notice.attachments.length > 0 && (
                            <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded flex items-center space-x-0.5 shrink-0 border border-slate-200">
                              <Paperclip className="w-2.5 h-2.5 text-slate-400" />
                              <span>{notice.attachments.length}个附件</span>
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 mt-1 leading-relaxed">
                          {notice.summary || notice.content}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium border border-slate-200/60 inline-block">
                          {notice.scope}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-800">{notice.publishOrg}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-800">{notice.author}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{notice.publishTime}</div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {notice.status === '已发布' && (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-full border border-emerald-200">
                            已发布
                          </span>
                        )}
                        {notice.status === '草稿' && (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-full border border-slate-300">
                            草稿箱
                          </span>
                        )}
                        {notice.status === '已撤回' && (
                          <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[11px] font-bold rounded-full border border-rose-200">
                            已撤回
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => setViewingNotice(notice)}
                            className="px-2 py-1 bg-blue-50 hover:bg-[#1E5ABB] text-[#1E5ABB] hover:text-white rounded text-[11px] font-bold transition-colors cursor-pointer flex items-center space-x-0.5"
                            title="查阅红头公文"
                          >
                            <Eye className="w-3 h-3" />
                            <span>查阅</span>
                          </button>
                          <button
                            onClick={() => handleOpenPublishModal(notice)}
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                            title="编辑公文"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleTogglePin(notice.id, e)}
                            className={`p-1 rounded transition-colors cursor-pointer ${
                              notice.isPinned
                                ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                                : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                            }`}
                            title={notice.isPinned ? '取消置顶' : '置顶'}
                          >
                            <Pin className="w-3.5 h-3.5" />
                          </button>
                          {notice.status === '已发布' && (
                            <button
                              onClick={(e) => handleRecall(notice.id, e)}
                              className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors cursor-pointer"
                              title="撤回公告"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteConfirmId(notice.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="删除公文"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Pagination / Summary Footer */}
          <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              共检索到 <span className="font-bold text-slate-800">{filteredNotices.length}</span> 篇公文公告记录
              {filteredNotices.length < notices.length && (
                <span className="text-slate-400 ml-1">（总计 {notices.length} 篇）</span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] text-slate-400">第 1 / 1 页</span>
              <button disabled className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-slate-300 cursor-not-allowed">
                上一页
              </button>
              <button className="px-2.5 py-1 bg-[#1E5ABB] text-white font-bold rounded-md shadow-2xs">
                1
              </button>
              <button disabled className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-slate-300 cursor-not-allowed">
                下一页
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PUBLISH / EDIT ANNOUNCEMENT MODAL */}
      {/* ========================================================= */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-[#1E5ABB] to-blue-700 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Megaphone className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold">
                    {editingNotice ? '编辑公文公告' : '起草并发布新公文公告'}
                  </h2>
                  <p className="text-[11px] text-white/80">
                    发文单位：{currentOrg} · 起草操作员：{currentUser}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsPublishModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
              {/* Title Field */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 flex items-center justify-between">
                  <span className="flex items-center space-x-1">
                    <span className="text-rose-500">*</span>
                    <span>公文 / 公告标题</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    {formData.title.length}/80 字
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="例如：关于做好近期重点时期网络舆情全天候值班值守与即时报送工作的通知"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  maxLength={80}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/20 focus:border-[#1E5ABB] transition-all"
                />
              </div>

              {/* Category & Priority Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category Selection */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 flex items-center space-x-1">
                    <span className="text-rose-500">*</span>
                    <span>公文分类</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as NoticeCategory })
                    }
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/20 focus:border-[#1E5ABB]"
                  >
                    <option value="紧急通知">🚨 紧急通知</option>
                    <option value="业务通报">📊 业务通报</option>
                    <option value="工作提示">💡 工作提示</option>
                    <option value="政策下达">📜 政策下达</option>
                    <option value="系统通知">⚙️ 系统通知</option>
                    <option value="考核公示">🏆 考核公示</option>
                  </select>
                </div>

                {/* Priority Selection */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 flex items-center space-x-1">
                    <span className="text-rose-500">*</span>
                    <span>紧急程度</span>
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['普通', '重要', '紧急', '特急'] as NoticePriority[]).map((prio) => (
                      <button
                        key={prio}
                        type="button"
                        onClick={() => setFormData({ ...formData, priority: prio })}
                        className={`py-2 text-center rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          formData.priority === prio
                            ? prio === '特急'
                              ? 'bg-red-600 text-white border-red-600 shadow-2xs'
                              : prio === '紧急'
                              ? 'bg-rose-500 text-white border-rose-500 shadow-2xs'
                              : prio === '重要'
                              ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                              : 'bg-[#1E5ABB] text-white border-[#1E5ABB] shadow-2xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {prio}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Scope & Target Orgs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center space-x-1">
                    <span className="text-rose-500">*</span>
                    <span>接收范围与指定单位</span>
                  </label>
                  <div className="flex items-center space-x-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          scope: '全网信系统',
                          targetOrgs: AVAILABLE_ORGS
                        })
                      }
                      className="text-[#1E5ABB] hover:underline cursor-pointer"
                    >
                      全选全部单位
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          scope: '各区县宣传部',
                          targetOrgs: ['西屯区宣传部', '北屯区宣传部', '南屯区宣传部', '东湖区宣传处']
                        })
                      }
                      className="text-[#1E5ABB] hover:underline cursor-pointer"
                    >
                      仅区县网信
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AVAILABLE_ORGS.map((org) => {
                    const isChecked = formData.targetOrgs.includes(org);
                    return (
                      <label
                        key={org}
                        className={`flex items-center space-x-2 p-1.5 rounded-lg text-xs cursor-pointer select-none transition-colors ${
                          isChecked ? 'bg-blue-50/80 text-[#1E5ABB] font-bold' : 'hover:bg-slate-100 text-slate-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                targetOrgs: [...formData.targetOrgs, org]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                targetOrgs: formData.targetOrgs.filter((o) => o !== org)
                              });
                            }
                          }}
                          className="rounded text-[#1E5ABB] focus:ring-blue-500"
                        />
                        <span className="truncate">{org}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Summary Field */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800">
                  <span>摘要导语 (可选)</span>
                </label>
                <input
                  type="text"
                  placeholder="提炼该公文的核心指令要点或工作要求..."
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/20 focus:border-[#1E5ABB]"
                />
              </div>

              {/* Main Content Area */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center space-x-1">
                    <span className="text-rose-500">*</span>
                    <span>公文正文内容</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          content:
                            prev.content +
                            '\n\n一、提高思想认识，严格落实责任\n二、强化巡查监测，做到突发速报\n三、加强协同联动，提升处置效能'
                        }))
                      }
                      className="text-[11px] text-[#1E5ABB] hover:underline cursor-pointer"
                    >
                      + 插入公文分段段落
                    </button>
                  </div>
                </div>
                <textarea
                  rows={8}
                  placeholder="请输入公文正文内容，支持公文标准行文规范..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/20 focus:border-[#1E5ABB] font-mono"
                />
              </div>

              {/* Attachments Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center space-x-1">
                    <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                    <span>公文附件管理</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleAddSampleAttachment('pdf')}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      + 模拟添加PDF公文
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddSampleAttachment('image')}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      + 添加图表证据
                    </button>
                  </div>
                </div>

                {formData.attachments && formData.attachments.length > 0 ? (
                  <div className="space-y-1.5">
                    {formData.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl border border-slate-200"
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="font-medium text-slate-800 truncate">{att.name}</span>
                          <span className="text-[11px] text-slate-400 font-mono">({att.size})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(att.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                    暂未附加文件，支持拖拽 PDF、DOCX、PNG 等公文附件
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsPublishModalOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
                >
                  取消
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleSaveNotice(true)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  存为草稿
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveNotice(false)}
                  className="px-5 py-2 bg-[#1E5ABB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>立即正式发布</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* OFFICIAL NOTICE DETAIL & RED-HEADER DOCUMENT MODAL */}
      {/* ========================================================= */}
      {viewingNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Control Header */}
            <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span className="font-bold text-xs">政务公文与通知查阅中枢</span>
                </div>
                <span className="text-slate-400 font-mono text-xs">
                  [{viewingNotice.id}]
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors cursor-pointer"
                  title="打印公文"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>打印公文</span>
                </button>
                <button
                  onClick={() => setViewingNotice(null)}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Document Body (Red Header Layout) */}
            <div className="p-8 overflow-y-auto space-y-6">
              {/* Formal Red Header Document Style Banner */}
              <div className="border-b-2 border-red-600 pb-6 text-center relative">
                <h3 className="text-red-600 font-serif font-black text-2xl tracking-[0.25em] uppercase">
                  中共台中市委网络安全和信息化委员会办公室
                </h3>
                <h4 className="text-red-600 font-serif font-bold text-xl tracking-[0.2em] mt-1">
                  台 中 市 互 联 网 信 息 办 公 室
                </h4>
                <div className="mt-4 text-xs text-slate-500 font-serif flex items-center justify-between px-2">
                  <span>台中网信发〔2026〕第 {viewingNotice.id.slice(-3)} 号</span>
                  <div className="flex items-center space-x-2">
                    {getPriorityBadge(viewingNotice.priority)}
                    {getCategoryBadge(viewingNotice.category)}
                  </div>
                  <span>签发人：张建国</span>
                </div>
              </div>

              {/* Title Section */}
              <div className="text-center py-2 space-y-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  {viewingNotice.title}
                </h1>
                <div className="text-xs text-slate-500 flex items-center justify-center space-x-4 pt-1">
                  <span>发布单位：{viewingNotice.publishOrg}</span>
                  <span>·</span>
                  <span>发布时间：{viewingNotice.publishTime}</span>
                  <span>·</span>
                  <span>送达范围：{viewingNotice.scope}</span>
                </div>
              </div>

              {/* Target Scope Callout */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700">
                <span className="font-bold text-slate-900">主送单位：</span>
                <span>{viewingNotice.targetOrgs ? viewingNotice.targetOrgs.join('、') : '全网信系统直属各单位、各区县委宣传部'}</span>
              </div>

              {/* Content Paragraphs */}
              <div className="text-slate-800 text-sm leading-relaxed space-y-4 font-sans whitespace-pre-wrap px-1">
                {viewingNotice.content}
              </div>

              {/* Official Seal / Ending Stamp Simulation */}
              <div className="flex justify-end pt-6 pr-6">
                <div className="text-right space-y-1 relative">
                  <div className="font-bold text-slate-900 text-sm">{viewingNotice.publishOrg}</div>
                  <div className="text-xs text-slate-500 font-mono">{viewingNotice.publishTime.split(' ')[0]}</div>

                  {/* Simulated Official Seal Stamp */}
                  <div className="absolute -top-4 right-0 w-28 h-28 rounded-full border-2 border-red-500/70 text-red-500/70 flex flex-col items-center justify-center pointer-events-none rotate-[-12deg] select-none shadow-xs">
                    <span className="text-[10px] font-bold text-center px-2">台中市互联网信息办公室</span>
                    <span className="text-sm">★</span>
                    <span className="text-[9px] font-serif">电子公文专用章</span>
                  </div>
                </div>
              </div>

              {/* Attachments Section */}
              {viewingNotice.attachments && viewingNotice.attachments.length > 0 && (
                <div className="pt-6 border-t border-slate-200 space-y-2.5">
                  <h4 className="font-bold text-xs text-slate-800 flex items-center space-x-2">
                    <Paperclip className="w-4 h-4 text-[#1E5ABB]" />
                    <span>公文附件下载 ({viewingNotice.attachments.length})</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {viewingNotice.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between p-3 bg-slate-50 hover:bg-blue-50/60 rounded-xl border border-slate-200 transition-colors"
                      >
                        <div className="flex items-center space-x-2.5 truncate">
                          <FileText className="w-4 h-4 text-[#1E5ABB] shrink-0" />
                          <div className="truncate">
                            <div className="font-bold text-xs text-slate-800 truncate">{att.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{att.size}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => showToast(`已开始下载附件：${att.name}`)}
                          className="px-2.5 py-1 bg-white hover:bg-[#1E5ABB] text-slate-700 hover:text-white rounded-lg text-xs font-medium border border-slate-200 transition-colors shadow-2xs shrink-0 cursor-pointer flex items-center space-x-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>下载</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Readers & Acknowledgment Status Panel */}
              <div className="pt-6 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-800 flex items-center space-x-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span>单位查阅与签收记录</span>
                  </h4>
                  <span className="text-xs font-bold text-slate-600">
                    已阅 {viewingNotice.readCount} 人 / 目标 {viewingNotice.totalTargetCount} 人
                    {viewingNotice.requireConfirm && ` (已确认签收 ${viewingNotice.confirmCount || 0} 份)`}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center space-x-2 text-xs text-slate-600">
                    <span className="font-bold text-slate-800">最新签收记录：</span>
                    {viewingNotice.readers && viewingNotice.readers.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {viewingNotice.readers.map((r, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-white text-slate-700 rounded-md border border-slate-200 text-[11px] flex items-center space-x-1"
                          >
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>{r.org} · {r.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">({r.readTime.split(' ')[1]})</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400">正在等待各接入单位操作员签收...</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleTogglePin(viewingNotice.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center space-x-1 ${
                    viewingNotice.isPinned
                      ? 'bg-amber-50 text-amber-700 border-amber-300'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Pin className="w-3.5 h-3.5" />
                  <span>{viewingNotice.isPinned ? '取消置顶' : '置顶展示'}</span>
                </button>
              </div>

              <div className="flex items-center space-x-3">
                {viewingNotice.requireConfirm && (
                  <button
                    onClick={() => handleConfirmRead(viewingNotice)}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center space-x-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>确认签收已阅公文</span>
                  </button>
                )}
                <button
                  onClick={() => setViewingNotice(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DELETE CONFIRMATION DIALOG */}
      {/* ========================================================= */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white max-w-sm w-full rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">确认删除该公告？</h3>
              <p className="text-xs text-slate-500 mt-1">
                删除后该公告信息将从历史归档中彻底移除，该操作不可撤销。
              </p>
            </div>
            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-md"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
