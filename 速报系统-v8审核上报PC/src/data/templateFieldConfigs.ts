import { TemplateExtraField } from '../types';

const coordinationDepartmentOptions = [
  { label: '网信部门', value: 'cyber_admin' },
  { label: '公安部门', value: 'public_security' },
  { label: '应急管理部门', value: 'emergency' },
  { label: '市场监管部门', value: 'market_supervision' },
  { label: '属地街道', value: 'subdistrict' },
];

const attachmentAccept = 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar';

export const REPORT_TEMPLATE_EXTRA_FIELDS: Record<string, TemplateExtraField[]> = {
  突发事件速报模板: [
    {
      id: 'incident_date',
      label: '事件发生日期',
      type: 'date',
      required: true,
    },
    {
      id: 'affected_people',
      label: '现场涉及人数',
      type: 'number',
      required: true,
      placeholder: '请输入人数',
      min: 0,
      max: 100000,
    },
    {
      id: 'emergency_level',
      label: '事件紧急等级',
      type: 'radio',
      required: true,
      options: [
        { label: '一般', value: 'normal' },
        { label: '紧急', value: 'urgent' },
        { label: '特急', value: 'critical' },
      ],
    },
    {
      id: 'spread_channels',
      label: '信息传播渠道',
      type: 'checkbox',
      required: true,
      options: [
        { label: '微信群', value: 'wechat' },
        { label: '短视频平台', value: 'short_video' },
        { label: '新闻媒体', value: 'news' },
        { label: '现场群众', value: 'on_site' },
      ],
    },
    {
      id: 'lead_department',
      label: '主要责任部门',
      type: 'select',
      required: true,
      placeholder: '请选择主要责任部门',
      options: coordinationDepartmentOptions,
    },
    {
      id: 'joint_departments',
      label: '需要联动处置的单位',
      type: 'multi_select',
      required: true,
      options: coordinationDepartmentOptions,
    },
    {
      id: 'authority_link',
      label: '权威信息或现场来源链接',
      type: 'link',
      placeholder: 'https://...',
    },
    {
      id: 'incident_attachments',
      label: '现场照片或处置材料',
      type: 'attachment',
      accept: attachmentAccept,
      multiple: true,
    },
    {
      id: 'incident_notice',
      label: '上报提示',
      type: 'static_text',
      content: '请确保时间、地点、涉及人数和现场情况准确，上传材料应与本次事件直接相关。',
    },
  ],
  民生诉求核查模板: [
    {
      id: 'appeal_date',
      label: '诉求发生日期',
      type: 'date',
      required: true,
    },
    {
      id: 'appeal_urgency',
      label: '诉求紧急程度',
      type: 'radio',
      required: true,
      options: [
        { label: '常规', value: 'normal' },
        { label: '较急', value: 'high' },
        { label: '紧急', value: 'urgent' },
      ],
    },
    {
      id: 'appeal_channels',
      label: '群众反映渠道',
      type: 'checkbox',
      options: [
        { label: '网格走访', value: 'grid_visit' },
        { label: '社区反馈', value: 'community' },
        { label: '热线电话', value: 'hotline' },
        { label: '网络留言', value: 'online_message' },
      ],
    },
    {
      id: 'appeal_owner',
      label: '牵头办理部门',
      type: 'select',
      placeholder: '请选择牵头办理部门',
      options: coordinationDepartmentOptions,
    },
    {
      id: 'appeal_attachments',
      label: '诉求截图或现场材料',
      type: 'attachment',
      accept: attachmentAccept,
      multiple: true,
    },
    {
      id: 'appeal_notice',
      label: '核查提示',
      type: 'static_text',
      content: '请区分个人诉求与共性民生问题，并核实反映人、发生地点和诉求事实。',
    },
  ],
  网络谣言线索模板: [
    {
      id: 'rumor_found_date',
      label: '线索发现日期',
      type: 'date',
      required: true,
    },
    {
      id: 'rumor_platforms',
      label: '传播平台',
      type: 'checkbox',
      required: true,
      options: [
        { label: '微博', value: 'weibo' },
        { label: '短视频平台', value: 'short_video' },
        { label: '贴吧论坛', value: 'forum' },
        { label: '微信群', value: 'wechat' },
      ],
    },
    {
      id: 'rumor_evidence_types',
      label: '证据材料类型',
      type: 'multi_select',
      options: [
        { label: '页面截图', value: 'screenshot' },
        { label: '录屏视频', value: 'screen_record' },
        { label: '账号信息', value: 'account' },
        { label: '传播数据', value: 'spread_data' },
      ],
    },
    {
      id: 'rumor_source_link',
      label: '谣言原文或传播页面',
      type: 'link',
      required: true,
      placeholder: 'https://...',
    },
    {
      id: 'rumor_attachments',
      label: '截图或核实材料',
      type: 'attachment',
      accept: attachmentAccept,
      multiple: true,
    },
    {
      id: 'rumor_notice',
      label: '取证提示',
      type: 'static_text',
      content: '请保留原始链接、传播账号和取证时间，避免编辑原始截图或视频。',
    },
  ],
  专项风险线索模板: [
    {
      id: 'risk_found_date',
      label: '风险发现日期',
      type: 'date',
      required: true,
    },
    {
      id: 'risk_scope_count',
      label: '涉及对象或场所数量',
      type: 'number',
      min: 0,
      placeholder: '请输入数量',
    },
    {
      id: 'risk_level',
      label: '风险等级',
      type: 'radio',
      required: true,
      options: [
        { label: '低风险', value: 'low' },
        { label: '中风险', value: 'medium' },
        { label: '高风险', value: 'high' },
      ],
    },
    {
      id: 'risk_category',
      label: '风险类别',
      type: 'select',
      required: true,
      placeholder: '请选择风险类别',
      options: [
        { label: '公共安全', value: 'public_safety' },
        { label: '生产经营', value: 'business' },
        { label: '生态环境', value: 'environment' },
        { label: '社会稳定', value: 'social_stability' },
      ],
    },
    {
      id: 'risk_source_link',
      label: '风险来源或佐证链接',
      type: 'link',
      placeholder: 'https://...',
    },
    {
      id: 'risk_attachments',
      label: '联合核查材料',
      type: 'attachment',
      accept: attachmentAccept,
      multiple: true,
    },
    {
      id: 'risk_notice',
      label: '核查提示',
      type: 'static_text',
      content: '专项风险事项需同步完成组织节点审核和终审，请确保核查材料完整。',
    },
  ],
};
