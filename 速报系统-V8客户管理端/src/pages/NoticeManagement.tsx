import React, { useState, useMemo } from 'react';
import {
  PageId,
  NoticeItem,
  NoticeCategory,
  NoticePriority,
  NoticeStatus,
  NewNoticeFormData,
  Attachment
} from '../types';

import {
  getStoredNotices,
  saveStoredNotices,
  createNoticeItem
} from '../services/noticeService';
import { AttachmentPreviewModal } from '../components/AttachmentPreviewModal';
import { NoticeRecipientSelector } from '../components/NoticeRecipientSelector';
import { NoticeReadStatusTracker } from '../components/NoticeReadStatusTracker';
import {
  NOTICE_AVAILABLE_ORGS,
  getDefaultPersonnelForOrgs
} from '../data/noticeRecipients';
import {
  Megaphone,
  Plus,
  Search,
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
  ChevronLeft,
  Filter,
  LayoutGrid,
  List,
  Share2,
  Paperclip,
  BellRing,
  HelpCircle,
  ArrowLeft,
  ExternalLink,
  ChevronDown,
  Info,
  CheckSquare,
  Square,
  Upload,
  FileSpreadsheet,
  Image as ImageIcon
} from 'lucide-react';

interface NoticeManagementProps {
  onNavigate: (page: PageId) => void;
  currentUser?: string;
  currentOrg?: string;
}

const AVAILABLE_ORGS = NOTICE_AVAILABLE_ORGS;

export const NoticeManagement: React.FC<NoticeManagementProps> = ({
  onNavigate,
  currentUser = '张三',
  currentOrg = '台中市网信办'
}) => {
  // Master data
  const [notices, setNotices] = useState<NoticeItem[]>(() => getStoredNotices());

  // Page View state: 'list' (列表) | 'detail' (详情查看) | 'form' (新增/编辑操作)
  const [pageView, setPageView] = useState<'list' | 'detail' | 'form'>('list');
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formTab, setFormTab] = useState<'edit' | 'preview'>('edit');
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);
  const [sourceBeforeEdit, setSourceBeforeEdit] = useState<'list' | 'detail'>('list');

  // List filters & view states
  const [activeTab, setActiveTab] = useState<'all' | 'mine' | 'draft'>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Attachment preview & deletion modal
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);
  const [deleteConfirmNotice, setDeleteConfirmNotice] = useState<NoticeItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // File upload ref & drag-drop state
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const contentTextareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Form State with Linked Personnel
  const initialDefaultOrgs = ['台中市网信办', '西屯区宣传部', '北屯区宣传部', '南屯区宣传部'];
  const [formData, setFormData] = useState<NewNoticeFormData>({
    title: '',
    category: '工作提示',
    priority: '普通',
    scope: '全网信系统',
    targetOrgs: initialDefaultOrgs,
    targetPersonnelIds: getDefaultPersonnelForOrgs(initialDefaultOrgs),
    primaryPersonnelIds: [],
    isPinned: false,
    requireConfirm: false,
    expireTime: '',
    summary: '',
    content: '',
    attachments: []
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Insert text at current cursor / selection position in content textarea
  const handleInsertAtCursor = (textToInsert: string) => {
    const textarea = contentTextareaRef.current;
    if (!textarea) {
      setFormData((prev) => ({
        ...prev,
        content: prev.content ? `${prev.content}\n\n${textToInsert}` : textToInsert
      }));
      return;
    }

    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? textarea.value.length;
    const currentVal = formData.content;

    const before = currentVal.substring(0, start);
    const after = currentVal.substring(end);
    const newContent = `${before}${textToInsert}${after}`;

    setFormData((prev) => ({
      ...prev,
      content: newContent
    }));

    setTimeout(() => {
      if (contentTextareaRef.current) {
        contentTextareaRef.current.focus();
        const newPos = start + textToInsert.length;
        contentTextareaRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
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
    const urgent = notices.filter(
      (n) => (n.priority === '紧急' || n.priority === '特急') && n.status === '已发布'
    ).length;
    const drafts = notices.filter((n) => n.status === '草稿').length;
    const confirmNeeded = notices.filter((n) => n.requireConfirm && n.status === '已发布').length;

    let totalRead = 0;
    let totalTarget = 0;
    notices
      .filter((n) => n.status === '已发布')
      .forEach((n) => {
        totalRead += n.readCount;
        totalTarget += n.totalTargetCount;
      });
    const avgReadRate =
      totalTarget > 0 ? ((totalRead / totalTarget) * 100).toFixed(1) : '92.4';

    return { total, published, urgent, drafts, confirmNeeded, avgReadRate };
  }, [notices]);

  // Filtered notice items
  const filteredNotices = useMemo(() => {
    return notices
      .filter((item) => {
        // Tab Filter
        if (activeTab === 'mine' && !item.publisher.includes(currentUser) && !item.publishOrg.includes(currentOrg)) {
          return false;
        }
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
        return new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime();
      });
  }, [notices, activeTab, selectedCategory, selectedPriority, selectedStatus, searchKeyword, currentUser, currentOrg]);

  // Navigation handlers
  const handleOpenDetail = (notice: NoticeItem) => {
    setSelectedNotice(notice);
    setPageView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartCreate = () => {
    setFormMode('create');
    setSourceBeforeEdit('list');
    setFormTab('edit');
    setSelectedNotice(null);
    const defaultCreateOrgs = ['台中市网信办', '西屯区宣传部', '北屯区宣传部', '南屯区宣传部', '市公安局网安支队', '市应急管理局'];
    setFormData({
      title: '',
      category: '工作提示',
      priority: '普通',
      scope: '全网信系统',
      targetOrgs: defaultCreateOrgs,
      targetPersonnelIds: getDefaultPersonnelForOrgs(defaultCreateOrgs),
      primaryPersonnelIds: [],
      isPinned: false,
      requireConfirm: false,
      expireTime: '',
      summary: '',
      content: '',
      attachments: []
    });
    setPageView('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartEdit = (notice: NoticeItem, from: 'list' | 'detail' = 'list') => {
    if (notice.status === '已发布') {
      showToast('已发布的公告不支持直接编辑，如需修改请先撤回公文');
      return;
    }
    setSelectedNotice(notice);
    setFormMode('edit');
    setSourceBeforeEdit(from);
    setFormTab('edit');
    const orgs = notice.targetOrgs || [];
    setFormData({
      title: notice.title,
      category: notice.category,
      priority: notice.priority,
      scope: notice.scope,
      targetOrgs: orgs,
      targetPersonnelIds: notice.targetPersonnelIds || getDefaultPersonnelForOrgs(orgs),
      primaryPersonnelIds: notice.primaryPersonnelIds || [],
      isPinned: notice.isPinned,
      requireConfirm: notice.requireConfirm || false,
      expireTime: notice.expireTime || '',
      summary: notice.summary || '',
      content: notice.content,
      attachments: notice.attachments || []
    });
    setPageView('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setPageView('list');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromForm = () => {
    if (sourceBeforeEdit === 'detail' && selectedNotice) {
      setPageView('detail');
    } else {
      setPageView('list');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Next / Previous notice switcher in Detail View
  const { prevNotice, nextNotice } = useMemo(() => {
    if (!selectedNotice) return { prevNotice: null, nextNotice: null };
    const currentIndex = filteredNotices.findIndex((n) => n.id === selectedNotice.id);
    if (currentIndex === -1) return { prevNotice: null, nextNotice: null };
    return {
      prevNotice: currentIndex > 0 ? filteredNotices[currentIndex - 1] : null,
      nextNotice: currentIndex < filteredNotices.length - 1 ? filteredNotices[currentIndex + 1] : null
    };
  }, [selectedNotice, filteredNotices]);



  // Save / Submit Notice (Form Detail View)
  const handleSaveNotice = (isDraft: boolean = false) => {
    if (!formData.title.trim()) {
      showToast('请输入公文或公告标题');
      return;
    }
    if (!formData.content.trim()) {
      showToast('请输入公文正文内容');
      return;
    }

    if (formMode === 'edit' && selectedNotice) {
      // Update existing
      const updatedItem: NoticeItem = {
        ...selectedNotice,
        title: formData.title.trim(),
        category: formData.category,
        priority: formData.priority,
        scope: formData.scope,
        targetOrgs: formData.targetOrgs.length > 0 ? formData.targetOrgs : ['全网信系统各单位'],
        targetPersonnelIds: formData.targetPersonnelIds || [],
        primaryPersonnelIds: formData.primaryPersonnelIds || [],
        isPinned: formData.isPinned,
        requireConfirm: formData.requireConfirm,
        expireTime: formData.expireTime,
        summary: formData.summary || formData.content.slice(0, 90) + '...',
        content: formData.content.trim(),
        attachments: formData.attachments || [],
        status: isDraft ? '草稿' : '已发布'
      };

      const updatedList = notices.map((item) =>
        item.id === selectedNotice.id ? updatedItem : item
      );
      updateNoticesState(updatedList);
      setSelectedNotice(updatedItem);
      showToast(isDraft ? '草稿已保存' : '公告已成功更新并同步发布');
      setPageView('detail');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Create new
      const newNotice = createNoticeItem(
        formData,
        `${currentUser} (管理员)`,
        currentOrg,
        isDraft
      );
      updateNoticesState([newNotice, ...notices]);
      setSelectedNotice(newNotice);
      showToast(isDraft ? '已存入草稿箱' : '🎉 公告发布成功并已实时同步至全网各接入终端');
      setPageView('detail');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleRecall = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = notices.map((n) =>
      n.id === id ? { ...n, status: '已撤回' as NoticeStatus } : n
    );
    updateNoticesState(updated);
    const target = updated.find((n) => n.id === id);
    if (selectedNotice && selectedNotice.id === id && target) {
      setSelectedNotice(target);
    }
    showToast('公文已撤回，各单位接收端将停止展示');
  };

  const handleDelete = (id: string) => {
    const updated = notices.filter((n) => n.id !== id);
    updateNoticesState(updated);
    setDeleteConfirmNotice(null);
    if (pageView === 'detail') {
      setPageView('list');
      setSelectedNotice(null);
    }
    showToast('公文公告已彻底删除');
  };

  const handleConfirmRead = (notice: NoticeItem) => {
    const updated = notices.map((n) => {
      if (n.id === notice.id) {
        const now = new Date();
        const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
          now.getDate()
        ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
          now.getMinutes()
        ).padStart(2, '0')}`;
        const existingReaders = n.readers || [];
        const isAlreadyRead = existingReaders.some((r) => r.name === currentUser);
        const newReaders = isAlreadyRead
          ? existingReaders.map((r) =>
              r.name === currentUser ? { ...r, confirmed: true, readTime: timeStr } : r
            )
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
    if (updatedTarget) setSelectedNotice(updatedTarget);
    showToast('✓ 签收回执确认成功，已记录您的单位查阅日志');
  };

  // Helper metadata styling for Attachments (PDF, Word, Excel, Image)
  const getAttachmentMeta = (att: Attachment) => {
    const lowerName = att.name.toLowerCase();
    const type = att.type;

    if (type === 'pdf' || lowerName.endsWith('.pdf')) {
      return {
        icon: <FileText className="w-4 h-4 text-rose-600 shrink-0" />,
        badge: (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
            PDF
          </span>
        ),
        formatName: 'PDF文档',
        cardBg: 'bg-rose-50/20 border-rose-200/80 hover:border-rose-300'
      };
    }
    if (type === 'word' || lowerName.endsWith('.doc') || lowerName.endsWith('.docx')) {
      return {
        icon: <FileText className="w-4 h-4 text-blue-600 shrink-0" />,
        badge: (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
            Word
          </span>
        ),
        formatName: 'Word公文',
        cardBg: 'bg-blue-50/20 border-blue-200/80 hover:border-blue-300'
      };
    }
    if (type === 'excel' || lowerName.endsWith('.xls') || lowerName.endsWith('.xlsx') || lowerName.endsWith('.csv')) {
      return {
        icon: <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />,
        badge: (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            Excel
          </span>
        ),
        formatName: 'Excel表格',
        cardBg: 'bg-emerald-50/20 border-emerald-200/80 hover:border-emerald-300'
      };
    }
    if (type === 'image' || ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'].some((ext) => lowerName.endsWith(ext))) {
      return {
        icon: <ImageIcon className="w-4 h-4 text-purple-600 shrink-0" />,
        badge: (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
            图片
          </span>
        ),
        formatName: '图表图片',
        cardBg: 'bg-purple-50/20 border-purple-200/80 hover:border-purple-300'
      };
    }
    return {
      icon: <FileText className="w-4 h-4 text-slate-600 shrink-0" />,
      badge: (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
          公文
        </span>
      ),
      formatName: '附件文件',
      cardBg: 'bg-slate-50 border-slate-200 hover:border-slate-300'
    };
  };

  // Upload handler for files (PDF, Word, Excel, Image)
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newAttachments: Attachment[] = [];

    Array.from(files).forEach((file) => {
      const name = file.name;
      const lowerName = name.toLowerCase();
      let type: 'image' | 'pdf' | 'word' | 'excel' | 'link' | string = 'link';

      if (lowerName.endsWith('.pdf')) {
        type = 'pdf';
      } else if (lowerName.endsWith('.doc') || lowerName.endsWith('.docx')) {
        type = 'word';
      } else if (lowerName.endsWith('.xls') || lowerName.endsWith('.xlsx') || lowerName.endsWith('.csv')) {
        type = 'excel';
      } else if (['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'].some((ext) => lowerName.endsWith(ext))) {
        type = 'image';
      }

      const sizeStr =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.max(1, Math.round(file.size / 1024))} KB`;

      let url: string | undefined = undefined;
      try {
        url = URL.createObjectURL(file);
      } catch {
        // fallback
      }

      newAttachments.push({
        id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name,
        size: sizeStr,
        type,
        url,
        thumbnailUrl: type === 'image' ? url : undefined
      });
    });

    setFormData((prev) => ({
      ...prev,
      attachments: [...(prev.attachments || []), ...newAttachments]
    }));

    showToast(`✓ 已成功上传 ${newAttachments.length} 个附件（支持PDF/Excel/Word/图片）`);
  };

  const handleAddSampleAttachment = (format: 'pdf' | 'word' | 'excel' | 'image') => {
    const timestamp = Date.now().toString().slice(-4);
    let newAtt: Attachment;
    switch (format) {
      case 'pdf':
        newAtt = {
          id: `att-${Date.now()}-pdf`,
          name: `政务网络舆情处置规范与速报机制指导手册_${timestamp}.pdf`,
          size: '2.4 MB',
          type: 'pdf'
        };
        break;
      case 'word':
        newAtt = {
          id: `att-${Date.now()}-doc`,
          name: `全网信系统应急联络责任清单与值班排班表_${timestamp}.docx`,
          size: '1.2 MB',
          type: 'word'
        };
        break;
      case 'excel':
        newAtt = {
          id: `att-${Date.now()}-xls`,
          name: `各区县网络安全隐患排查台账汇总表_${timestamp}.xlsx`,
          size: '860 KB',
          type: 'excel'
        };
        break;
      case 'image':
        newAtt = {
          id: `att-${Date.now()}-img`,
          name: `实地巡查监测研判分析走势图_${timestamp}.png`,
          size: '1.8 MB',
          type: 'image',
          thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&auto=format&fit=crop'
        };
        break;
    }
    setFormData((prev) => ({
      ...prev,
      attachments: [...(prev.attachments || []), newAtt]
    }));
    showToast(`已载入示例附件：${newAtt.name}`);
  };

  const handleRemoveAttachment = (attId: string) => {
    setFormData((prev) => ({
      ...prev,
      attachments: (prev.attachments || []).filter((a) => a.id !== attId)
    }));
  };

  // Helper styles for Category & Priority badges
  const getCategoryBadge = (category: NoticeCategory) => {
    switch (category) {
      case '紧急通知':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center space-x-1">
            <Flame className="w-3 h-3 text-rose-600" />
            <span>紧急通知</span>
          </span>
        );
      case '业务通报':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center space-x-1">
            <FileText className="w-3 h-3 text-blue-600" />
            <span>业务通报</span>
          </span>
        );
      case '工作提示':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center space-x-1">
            <BellRing className="w-3 h-3 text-amber-600" />
            <span>工作提示</span>
          </span>
        );
      case '政策下达':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>政策下达</span>
          </span>
        );
      case '系统通知':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center space-x-1">
            <Layers className="w-3 h-3 text-indigo-600" />
            <span>系统通知</span>
          </span>
        );
      case '考核公示':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center space-x-1">
            <Award className="w-3 h-3 text-purple-600" />
            <span>考核公示</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            {category}
          </span>
        );
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

  // =========================================================================
  // VIEW 1: NOTICE FORM OPERATION DETAIL PAGE (起草/编辑公告详情操作页)
  // =========================================================================
  if (pageView === 'form') {
    const isEdit = formMode === 'edit';
    return (
      <div className="space-y-5 animate-in fade-in duration-150">
        {/* Toast */}
        {toastMessage && (
          <div className="fixed top-4 right-4 z-50 bg-[#1E5ABB] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-bold flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
            <span>✓</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Attachment preview */}
        {previewAttachment && (
          <AttachmentPreviewModal
            isOpen={true}
            onClose={() => setPreviewAttachment(null)}
            attachment={previewAttachment}
          />
        )}

        {/* Breadcrumb & Navigation Top Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBackFromForm}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer flex items-center justify-center shrink-0"
              title="返回"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <span>系统管理</span>
                <span>/</span>
                <button
                  onClick={handleBackToList}
                  className="text-slate-600 hover:text-[#1E5ABB] transition-colors cursor-pointer"
                >
                  公告管理
                </button>
                <span>/</span>
                <span className="text-[#1E5ABB] font-bold">
                  {isEdit ? '编辑公文公告详情' : '起草新公文公告'}
                </span>
              </div>
            </div>
          </div>

          {/* Actions in Header */}
          <div className="flex items-center space-x-2.5 w-full md:w-auto justify-end flex-wrap gap-y-2">
            <button
              type="button"
              onClick={handleBackFromForm}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer flex items-center space-x-1.5"
            >
              <span>取消返回</span>
            </button>

            <button
              type="button"
              onClick={() => handleSaveNotice(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer flex items-center space-x-1.5"
            >
              <span>存为草稿</span>
            </button>

            <button
              type="button"
              onClick={() => handleSaveNotice(false)}
              className="px-4.5 py-2 bg-[#1E5ABB] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center space-x-1.5 active:scale-98"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isEdit ? '保存公文更改' : '立即正式发布'}</span>
            </button>
          </div>
        </div>

        {/* ==================== FORM MODE ==================== */}
        {formTab === 'edit' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left 7 Cols: Main Form Inputs */}
            <div className="lg:col-span-7 space-y-5">

              {/* Title & Classification */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <h2 className="text-sm font-bold text-slate-800 flex items-center space-x-2 border-b border-slate-100 pb-3">
                  <FileText className="w-4 h-4 text-[#1E5ABB]" />
                  <span>公文基础要素</span>
                </h2>

                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span className="flex items-center space-x-1">
                      <span className="text-rose-500">*</span>
                      <span>公文 / 公告标题</span>
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      {formData.title.length}/100 字
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="例如：关于做好近期重点时期网络舆情全天候值班值守与即时报送工作的通知"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    maxLength={100}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/20 focus:border-[#1E5ABB] transition-all"
                  />
                </div>

                {/* Category & Priority */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                      <span className="text-rose-500">*</span>
                      <span>公文分类</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value as NoticeCategory })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/20 focus:border-[#1E5ABB]"
                    >
                      <option value="工作提示">💡 工作提示</option>
                      <option value="紧急通知">🚨 紧急通知</option>
                      <option value="业务通报">📊 业务通报</option>
                      <option value="政策下达">📜 政策下达</option>
                      <option value="系统通知">⚙️ 系统通知</option>
                      <option value="考核公示">🏆 考核公示</option>
                    </select>
                  </div>

                  {/* Priority */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 flex items-center space-x-1">
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
              </div>

              {/* Main Content Area */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                    <FileCheck className="w-4 h-4 text-[#1E5ABB]" />
                    <span>公文正文内容</span>
                    <span className="text-rose-500">*</span>
                  </h2>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleInsertAtCursor(
                          '一、提高思想认识，坚决落实责任\n二、强化巡查监测，做到突发速报\n三、加强协同联动，提升处置效能'
                        )
                      }
                      className="text-xs text-[#1E5ABB] hover:underline cursor-pointer flex items-center space-x-1"
                    >
                      <span>+ 插入标准三段式段落</span>
                    </button>
                    <span className="text-slate-200">|</span>
                    <button
                      type="button"
                      onClick={() =>
                        handleInsertAtCursor(
                          '1. 明确责任人员，实行24小时带班制度；\n2. 发现重大紧急线索，须在15分钟内完成速报初报；\n3. 定期报送处置动态，严防次生衍生风险。'
                        )
                      }
                      className="text-xs text-[#1E5ABB] hover:underline cursor-pointer flex items-center space-x-1"
                    >
                      <span>+ 插入工作要求条目</span>
                    </button>
                  </div>
                </div>

                <textarea
                  ref={contentTextareaRef}
                  rows={13}
                  placeholder="请输入公文正式行文内容，遵循政务公文格式，支持空行分段与条目规范..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/20 focus:border-[#1E5ABB] font-sans"
                />

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>支持政务公文红头排版与自动生成落款公章</span>
                  <span>已输入 {formData.content.length} 字符</span>
                </div>
              </div>

              {/* Attachments Section with Multi-format File Upload & Drag-Drop */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                {/* Hidden File Input for Real File Upload */}
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.webp"
                  onChange={(e) => {
                    handleFileUpload(e.target.files);
                    e.target.value = '';
                  }}
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <Paperclip className="w-4 h-4 text-[#1E5ABB]" />
                    <h2 className="text-sm font-bold text-slate-800">公文附件管理</h2>
                    <span className="text-xs text-slate-400">
                      ({formData.attachments?.length || 0} 个附件)
                    </span>
                  </div>

                  <div className="flex items-center flex-wrap gap-2">
                    {/* Quick Demo Templates */}
                    <div className="flex items-center space-x-1 bg-slate-100/80 p-0.5 rounded-lg text-[11px] text-slate-600">
                      <span className="px-1.5 text-slate-400 text-[10px]">示例:</span>
                      <button
                        type="button"
                        onClick={() => handleAddSampleAttachment('pdf')}
                        className="px-1.5 py-0.5 hover:bg-white hover:text-rose-600 rounded text-[10px] font-medium transition-colors cursor-pointer"
                        title="添加PDF公文手册示范"
                      >
                        +PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddSampleAttachment('word')}
                        className="px-1.5 py-0.5 hover:bg-white hover:text-blue-600 rounded text-[10px] font-medium transition-colors cursor-pointer"
                        title="添加Word公文示范"
                      >
                        +Word
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddSampleAttachment('excel')}
                        className="px-1.5 py-0.5 hover:bg-white hover:text-emerald-600 rounded text-[10px] font-medium transition-colors cursor-pointer"
                        title="添加Excel台账示范"
                      >
                        +Excel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddSampleAttachment('image')}
                        className="px-1.5 py-0.5 hover:bg-white hover:text-purple-600 rounded text-[10px] font-medium transition-colors cursor-pointer"
                        title="添加图表图片示范"
                      >
                        +图片
                      </button>
                    </div>

                    {/* Primary Real Upload Button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-1.5 bg-[#1E5ABB] hover:bg-[#184896] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer active:scale-98"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>上传附件</span>
                    </button>
                  </div>
                </div>

                {/* Attachment List / Drop Area */}
                {formData.attachments && formData.attachments.length > 0 ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {formData.attachments.map((att) => {
                        const meta = getAttachmentMeta(att);
                        return (
                          <div
                            key={att.id}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${meta.cardBg}`}
                          >
                            <div className="flex items-center space-x-2.5 truncate min-w-0 pr-2">
                              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/80 shrink-0 flex items-center justify-center shadow-2xs overflow-hidden">
                                {att.type === 'image' && att.thumbnailUrl ? (
                                  <img src={att.thumbnailUrl} alt={att.name} className="w-full h-full object-cover" />
                                ) : (
                                  meta.icon
                                )}
                              </div>
                              <div className="truncate min-w-0">
                                <div className="flex items-center space-x-1.5">
                                  {meta.badge}
                                  <span className="font-bold text-xs text-slate-800 truncate" title={att.name}>
                                    {att.name}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                  {att.size} · {meta.formatName}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => setPreviewAttachment(att)}
                                className="p-1.5 text-slate-400 hover:text-[#1E5ABB] hover:bg-white rounded-lg transition-colors cursor-pointer"
                                title="在线预览附件"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveAttachment(att.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                                title="删除附件"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Compact secondary drop / click zone */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingOver(true);
                      }}
                      onDragLeave={() => setIsDraggingOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingOver(false);
                        handleFileUpload(e.dataTransfer.files);
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      className={`py-3 px-4 rounded-xl border border-dashed text-center text-xs transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                        isDraggingOver
                          ? 'border-[#1E5ABB] bg-blue-50/70 text-[#1E5ABB] ring-2 ring-blue-500/20'
                          : 'border-slate-300 text-slate-500 hover:border-[#1E5ABB]/60 hover:bg-slate-50/70'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5 text-[#1E5ABB]" />
                      <span>点击或将本地文件拖拽至此处继续上传附件</span>
                    </div>
                  </div>
                ) : (
                  /* Full Drag-and-Drop Empty Zone */
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingOver(true);
                    }}
                    onDragLeave={() => setIsDraggingOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingOver(false);
                      handleFileUpload(e.dataTransfer.files);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`py-8 px-6 text-center border-2 border-dashed rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center space-y-2 group ${
                      isDraggingOver
                        ? 'border-[#1E5ABB] bg-blue-50/80 ring-2 ring-[#1E5ABB]/30 text-[#1E5ABB]'
                        : 'border-slate-300 hover:border-[#1E5ABB] hover:bg-slate-50/80 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center space-x-2 text-slate-400 group-hover:text-[#1E5ABB] transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                        <FileSpreadsheet className="w-4 h-4" />
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-800 group-hover:text-[#1E5ABB] transition-colors">
                        点击上传 或 将公文附件拖拽至此处
                      </p>
                      <p className="text-[11px] text-slate-400">
                        全面支持 PDF公文手册、Word文档 (.doc/.docx)、Excel表格 (.xls/.xlsx)、图片佐证 (.png/.jpg) 等格式
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right 5 Cols: Recipient Organization & Personnel Selector */}
            <div className="lg:col-span-5 space-y-5">
              <NoticeRecipientSelector
                targetOrgs={formData.targetOrgs}
                targetPersonnelIds={formData.targetPersonnelIds || []}
                primaryPersonnelIds={formData.primaryPersonnelIds || []}
                onChange={(newOrgs, newPersonnelIds) => {
                  setFormData((prev) => ({
                    ...prev,
                    targetOrgs: newOrgs,
                    targetPersonnelIds: newPersonnelIds
                  }));
                }}
                onPrimaryChange={(newPrimaryIds) => {
                  setFormData((prev) => ({
                    ...prev,
                    primaryPersonnelIds: newPrimaryIds
                  }));
                }}
              />
            </div>
          </div>
        )}

        {/* ==================== RED HEADER LIVE PREVIEW MODE ==================== */}
        {formTab === 'preview' && (
          <div className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200/80 shadow-xs max-w-4xl mx-auto space-y-6">
            {/* Top preview control banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between text-xs text-amber-900">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-amber-600 shrink-0" />
                <span>当前处于【红头公文排版实时预览模式】，展示受众端打开时的真实公文呈现效果。</span>
              </div>
              <button
                type="button"
                onClick={() => setFormTab('edit')}
                className="px-3 py-1 bg-white hover:bg-amber-100 text-amber-800 font-bold rounded-lg border border-amber-300 transition-colors cursor-pointer"
              >
                返回继续编辑表单
              </button>
            </div>

            {/* Red Header Official Document Container */}
            <div className="p-6 sm:p-10 border border-slate-200 rounded-2xl bg-white shadow-xs space-y-6">
              {/* Official Red Header Top */}
              <div className="border-b-2 border-red-600 pb-5 text-center relative">
                <h3 className="text-red-600 font-serif font-black text-xl sm:text-2xl tracking-[0.25em] uppercase">
                  中共台中市委网络安全和信息化委员会办公室
                </h3>
                <h4 className="text-red-600 font-serif font-bold text-lg sm:text-xl tracking-[0.2em] mt-1.5">
                  台 中 市 互 联 网 信 息 办 公 室
                </h4>
                <div className="mt-5 text-xs text-slate-500 font-serif flex items-center justify-between px-2">
                  <span>台中网信发〔2026〕第 {selectedNotice ? selectedNotice.id.slice(-3) : '预发'} 号</span>
                  <div className="flex items-center space-x-2">
                    {getPriorityBadge(formData.priority)}
                    {getCategoryBadge(formData.category)}
                  </div>
                  <span>签发人：张建国</span>
                </div>
              </div>

              {/* Title Section */}
              <div className="text-center py-2 space-y-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  {formData.title || '（公文标题预览）'}
                </h1>
                <div className="text-xs text-slate-500 flex items-center justify-center space-x-3 pt-1 flex-wrap">
                  <span>发文单位：{currentOrg}</span>
                  <span>·</span>
                  <span>送达范围：{formData.scope}</span>
                  <span>·</span>
                  <span>受众单位：共 {formData.targetOrgs.length} 家</span>
                  <span>·</span>
                  <span className="text-[#1E5ABB] font-bold">联动人员：共 {formData.targetPersonnelIds?.length || 0} 人</span>
                </div>
              </div>

              {/* Target Orgs Callout */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                <div>
                  <span className="font-bold text-slate-900">主送单位：</span>
                  <span>{formData.targetOrgs.length > 0 ? formData.targetOrgs.join('、') : '全网信系统各接入单位'}</span>
                </div>
                {formData.targetPersonnelIds && formData.targetPersonnelIds.length > 0 && (
                  <div className="text-slate-600 text-[11px] pt-0.5 flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5 text-[#1E5ABB] shrink-0" />
                    <span>已联动指定接收责任人员共 <strong className="text-slate-900">{formData.targetPersonnelIds.length}</strong> 名</span>
                  </div>
                )}
              </div>

              {/* Document Content */}
              <div className="text-slate-800 text-sm leading-relaxed space-y-4 font-sans whitespace-pre-wrap px-1">
                {formData.content || '（此处为公文正文内容预览...）'}
              </div>

              {/* Official Seal Simulation */}
              <div className="flex justify-end pt-8 pr-6">
                <div className="text-right space-y-1 relative">
                  <div className="font-bold text-slate-900 text-sm">{currentOrg}</div>
                  <div className="text-xs text-slate-500 font-mono">
                    {new Date().toISOString().split('T')[0]}
                  </div>

                  {/* Simulated Official Seal Stamp */}
                  <div className="absolute -top-4 right-0 w-28 h-28 rounded-full border-2 border-red-500/70 text-red-500/70 flex flex-col items-center justify-center pointer-events-none rotate-[-12deg] select-none shadow-xs">
                    <span className="text-[10px] font-bold text-center px-2">台中市互联网信息办公室</span>
                    <span className="text-sm">★</span>
                    <span className="text-[9px] font-serif">电子公文专用章</span>
                  </div>
                </div>
              </div>

              {/* Attachments preview pill */}
              {formData.attachments && formData.attachments.length > 0 && (
                <div className="pt-6 border-t border-slate-200 space-y-2">
                  <h4 className="font-bold text-xs text-slate-800 flex items-center space-x-1.5">
                    <Paperclip className="w-4 h-4 text-[#1E5ABB]" />
                    <span>附件清单 ({formData.attachments.length} 个)</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {formData.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs"
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="truncate">{att.name}</span>
                        </div>
                        <span className="text-slate-400 font-mono text-[11px] shrink-0 ml-2">
                          {att.size}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions in Preview */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setFormTab('edit')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                ← 返回继续修改表单
              </button>

              <div className="flex items-center space-x-2.5">
                <button
                  type="button"
                  onClick={handleBackFromForm}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer"
                >
                  取消返回
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveNotice(true)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  存为草稿
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveNotice(false)}
                  className="px-5 py-2 bg-[#1E5ABB] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center space-x-1.5 active:scale-98"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isEdit ? '确认无误，保存公文更改' : '确认无误，立即正式发布'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: NOTICE VIEW DETAIL PAGE (公告公文详情查看操作页)
  // =========================================================================
  if (pageView === 'detail' && selectedNotice) {
    const readPercentage =
      selectedNotice.totalTargetCount > 0
        ? Math.min(100, Math.round((selectedNotice.readCount / selectedNotice.totalTargetCount) * 100))
        : 0;

    const isCurrentConfirmed =
      selectedNotice.readers?.some((r) => r.name === currentUser && r.confirmed) || false;

    return (
      <div className="space-y-5 animate-in fade-in duration-150">
        {/* Toast */}
        {toastMessage && (
          <div className="fixed top-4 right-4 z-50 bg-[#1E5ABB] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-bold flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
            <span>✓</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Attachment preview modal */}
        {previewAttachment && (
          <AttachmentPreviewModal
            isOpen={true}
            onClose={() => setPreviewAttachment(null)}
            attachment={previewAttachment}
          />
        )}

        {/* Top Breadcrumb & Action Toolbar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Breadcrumb & Title */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBackToList}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer flex items-center justify-center shrink-0"
              title="返回列表"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <span>系统管理</span>
              <span>/</span>
              <button
                onClick={handleBackToList}
                className="text-slate-600 hover:text-[#1E5ABB] transition-colors cursor-pointer"
              >
                公告管理
              </button>
              <span>/</span>
              <span className="text-[#1E5ABB] font-bold">公告详情</span>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center space-x-2 w-full md:w-auto justify-end flex-wrap gap-y-2">
            {/* Prev / Next Notice */}
            <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                disabled={!prevNotice}
                onClick={() => prevNotice && handleOpenDetail(prevNotice)}
                className={`p-1.5 rounded-lg transition-colors flex items-center space-x-0.5 ${
                  prevNotice
                    ? 'hover:bg-white text-slate-700 cursor-pointer'
                    : 'text-slate-300 cursor-not-allowed'
                }`}
                title="上一篇公文"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">上一篇</span>
              </button>
              <button
                type="button"
                disabled={!nextNotice}
                onClick={() => nextNotice && handleOpenDetail(nextNotice)}
                className={`p-1.5 rounded-lg transition-colors flex items-center space-x-0.5 ${
                  nextNotice
                    ? 'hover:bg-white text-slate-700 cursor-pointer'
                    : 'text-slate-300 cursor-not-allowed'
                }`}
                title="下一篇公文"
              >
                <span className="hidden sm:inline">下一篇</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {selectedNotice.status !== '已发布' && (
              <button
                onClick={() => handleStartEdit(selectedNotice, 'detail')}
                className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center space-x-1.5"
              >
                <Edit className="w-3.5 h-3.5 text-blue-600" />
                <span>编辑公文</span>
              </button>
            )}

            {selectedNotice.status === '已发布' && (
              <button
                onClick={(e) => handleRecall(selectedNotice.id, e)}
                className="px-3.5 py-2 bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-700 border border-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center space-x-1.5"
                title="撤回该公告"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                <span>撤回</span>
              </button>
            )}

            <button
              onClick={() => setDeleteConfirmNotice(selectedNotice)}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
              title="删除公文"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Content Layout: Left 7 Cols (Document) + Right 5 Cols (Read/Receipt tracking, matching selector layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Main Document Content Body */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200/80 shadow-xs space-y-6">
              {/* Title Section */}
              <div className="text-center py-2 space-y-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-relaxed text-center">
                  <span>{selectedNotice.title}</span>
                  <span className="inline-flex items-center space-x-1.5 ml-2.5 align-middle font-normal whitespace-nowrap">
                    {getCategoryBadge(selectedNotice.category)}
                    {getPriorityBadge(selectedNotice.priority)}
                    {selectedNotice.status === '草稿' && (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-md border border-slate-300">
                        草稿箱
                      </span>
                    )}
                    {selectedNotice.status === '已撤回' && (
                      <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[11px] font-bold rounded-md border border-rose-200">
                        已撤回
                      </span>
                    )}
                  </span>
                </h1>

                <div className="text-xs text-slate-500 flex items-center justify-center space-x-4 pt-1 flex-wrap">
                  <span>发布单位：{selectedNotice.publishOrg}</span>
                  <span>·</span>
                  <span>发布时间：{selectedNotice.publishTime}</span>
                </div>
              </div>

              {/* Document Body & Right-aligned Signature */}
              {(() => {
                const content = selectedNotice.content;
                const signatureRegex = /\n\n([\u4e00-\u9fa5\w\s·（）()]+)\s*\n\s*(\d{4}年\d{1,2}月\d{1,2}日|\d{4}-\d{2}-\d{2})\s*$/;
                const match = content.match(signatureRegex);
                const bodyText = match ? content.slice(0, match.index).trim() : content;
                const signatureOrg = match
                  ? match[1].trim()
                  : selectedNotice.publishOrg === '台中市网信办'
                  ? '台中市互联网信息办公室'
                  : selectedNotice.publishOrg;

                return (
                  <>
                    <div className="text-slate-800 text-sm leading-relaxed space-y-4 font-sans whitespace-pre-wrap px-1">
                      {bodyText}
                    </div>

                    {/* Ending Publisher / Date Info (Right-Aligned, non-bold, time to minute) */}
                    <div className="flex justify-end pt-8 pr-4 sm:pr-6">
                      <div className="text-right space-y-1">
                        <div className="text-slate-800 text-sm">
                          {signatureOrg}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          {selectedNotice.publishTime}
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}

              {/* Official Attachments Download List */}
              {selectedNotice.attachments && selectedNotice.attachments.length > 0 && (
                <div className="pt-6 border-t border-slate-200 space-y-3">
                  <h4 className="font-bold text-xs text-slate-800 flex items-center space-x-2">
                    <Paperclip className="w-4 h-4 text-[#1E5ABB]" />
                    <span>公文附件下载与查阅 ({selectedNotice.attachments.length})</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedNotice.attachments.map((att) => {
                      const meta = getAttachmentMeta(att);
                      return (
                        <div
                          key={att.id}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${meta.cardBg}`}
                        >
                          <div className="flex items-center space-x-2.5 truncate min-w-0 pr-2">
                            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/80 shrink-0 flex items-center justify-center shadow-2xs overflow-hidden">
                              {att.type === 'image' && att.thumbnailUrl ? (
                                <img src={att.thumbnailUrl} alt={att.name} className="w-full h-full object-cover" />
                              ) : (
                                meta.icon
                              )}
                            </div>
                            <div className="truncate min-w-0">
                              <div className="flex items-center space-x-1.5">
                                {meta.badge}
                                <span className="font-bold text-xs text-slate-800 truncate" title={att.name}>
                                  {att.name}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                {att.size} · {meta.formatName}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                            <button
                              type="button"
                              onClick={() => setPreviewAttachment(att)}
                              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200 transition-colors shadow-2xs cursor-pointer flex items-center space-x-1"
                            >
                              <Eye className="w-3 h-3" />
                              <span>预览</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => showToast(`已开始下载附件：${att.name}`)}
                              className="px-2.5 py-1 bg-[#1E5ABB] hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors shadow-2xs cursor-pointer flex items-center space-x-1"
                            >
                              <Download className="w-3 h-3" />
                              <span>下载</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right 5 Cols: Redesigned Readers Tracking & Sign-off Operations (Matching NoticeRecipientSelector aesthetic) */}
          <div className="lg:col-span-5 space-y-5">
            <NoticeReadStatusTracker
              notice={selectedNotice}
              currentUser={currentUser}
              currentOrg={currentOrg}
              onConfirmRead={handleConfirmRead}
              showToast={showToast}
            />
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: NOTICE MANAGEMENT MASTER LIST (公告管理列表主视图)
  // =========================================================================
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
            <h1 className="text-xl font-black text-slate-800 tracking-tight">公告管理</h1>
          </div>
        </div>

        {/* Right Actions: 发布新公告 Button leads to Form Detail View */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          <button
            onClick={handleStartCreate}
            className="flex items-center space-x-2 px-4 py-2.5 bg-[#1E5ABB] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer hover:shadow-lg active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>起草发布新公告</span>
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
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-[#1E5ABB] shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="公文列表视图"
            >
              <List className="w-3.5 h-3.5" />
              <span>列表</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                viewMode === 'cards' ? 'bg-white text-[#1E5ABB] shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="卡片流视图"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>卡片</span>
            </button>
          </div>
        </div>

        {/* Filter Controls: Merged in one row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Keyword Search */}
          <div className="relative flex-1 min-w-[200px]">
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
          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-xs text-slate-500 shrink-0 font-medium">分类：</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/20 focus:border-[#1E5ABB] transition-all min-w-[110px]"
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
          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-xs text-slate-500 shrink-0 font-medium">级别：</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/20 focus:border-[#1E5ABB] transition-all min-w-[110px]"
            >
              <option value="all">全部优先级</option>
              <option value="特急">特急</option>
              <option value="紧急">紧急</option>
              <option value="重要">重要</option>
              <option value="普通">普通</option>
            </select>
          </div>

          {/* Actions: 查询 和 重置 */}
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
          <h3 className="text-base font-bold text-slate-700">暂无匹配的公告记录</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            没有找到符合当前筛选条件的公文或通知，您可以尝试调整筛选条件或点击右上角起草发布新公告。
          </p>
          <button
            onClick={handleResetFilters}
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
                onClick={() => handleOpenDetail(notice)}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-[#1E5ABB]/50 transition-all duration-200 hover:shadow-md cursor-pointer relative group flex flex-col justify-between"
              >
                <div>
                  {/* Top Badges & Meta */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      {getCategoryBadge(notice.category)}
                      {getPriorityBadge(notice.priority)}
                      {notice.scope && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-medium rounded-md border border-slate-200/80">
                          {notice.scope} ({notice.totalTargetCount}人)
                        </span>
                      )}
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

                {/* Card Footer */}
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
                      {notice.status !== '已发布' && (
                        <button
                          onClick={() => handleStartEdit(notice, 'list')}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="编辑公文详情"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      )}

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
                        onClick={() => setDeleteConfirmNotice(notice)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="删除公告"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleOpenDetail(notice)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-[#1E5ABB] text-slate-700 hover:text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1 ml-1"
                      >
                        <span>查看详情</span>
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
                  <th className="py-3.5 px-4 w-48 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredNotices.map((notice, idx) => {
                  return (
                    <tr
                      key={notice.id}
                      onClick={() => handleOpenDetail(notice)}
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
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium border border-slate-200/60 inline-flex items-center space-x-1">
                          <span>{notice.scope}</span>
                          <span className="text-slate-500 font-mono font-normal">({notice.totalTargetCount}人)</span>
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-800">{notice.publishOrg}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-800">{notice.publisher}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{notice.publishTime}</div>
                      </td>
                      <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleOpenDetail(notice)}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-[#1E5ABB] text-[#1E5ABB] hover:text-white rounded text-[11px] font-bold transition-colors cursor-pointer flex items-center space-x-1"
                            title="查看详情"
                          >
                            <Eye className="w-3 h-3" />
                            <span>详情</span>
                          </button>
                          {notice.status !== '已发布' && (
                            <button
                              onClick={() => handleStartEdit(notice, 'list')}
                              className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                              title="编辑公文详情"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}
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
                            onClick={() => setDeleteConfirmNotice(notice)}
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

          {/* Table Summary Footer */}
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white max-w-sm w-full rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">确认删除该公告？</h3>
              <p className="text-xs text-slate-500 mt-1">
                删除公文「{deleteConfirmNotice.title}」后信息将彻底移除，该操作不可撤销。
              </p>
            </div>
            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setDeleteConfirmNotice(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmNotice.id)}
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
