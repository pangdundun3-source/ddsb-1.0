import type { NotificationItem, NotificationType } from '../types';

export const NOTIFICATION_TYPE_META: Record<NotificationType, { label: string; tone: string; actionText: string }> = {
  platform_notice: { label: '平台公告', tone: 'text-[#7E22CE] bg-[#F3E8FF]', actionText: '查看公告' },
  audit_pending: { label: '待审核', tone: 'text-[#B45309] bg-[#FEF3C7]', actionText: '进入审核' },
  audit_approved: { label: '审核通过', tone: 'text-[#047857] bg-[#ECFDF5]', actionText: '查看速报' },
  audit_rejected: { label: '审核驳回', tone: 'text-[#BE123C] bg-[#FFF1F2]', actionText: '查看速报' }
};

/** 已读消息只保留近三个月 */
export const READ_RETENTION_DAYS = 90;

export const isWithinRetention = (item: NotificationItem, now = Date.now()) => {
  const stamp = Date.parse((item.readAt || item.time).replace(' ', 'T'));
  if (Number.isNaN(stamp)) return true;
  return now - stamp <= READ_RETENTION_DAYS * 24 * 60 * 60 * 1000;
};

export const NOTIFICATIONS_STORAGE_KEY = 'ddsb_pc_notifications_v1';

/** 与消息时间一致的 YYYY-MM-DD HH:mm（本地时间），便于排序和截取 */
export const formatNotificationTime = (date = new Date()) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'platform_notice',
    title: '深化突发舆情“即报即审”与首发定标机制通知',
    content: '全面推行“1小时内初审、同源同地址线索首发标记”制度，请各网格员与审核员按规范及时填报核验。',
    time: '2026-08-13 10:00',
    isUnread: true,
    announcementContent:
      '为进一步提升网络综合治理效能与基层舆情响应敏捷度，平台现全面推行突发舆情“1小时内初审响应、同源同地址线索首发智能比对定标”机制。\n\n一、初审时限要求：各直属网信部门与镇街网格员上报线索后，值班审核员须在1小时内完成首轮真实性核验与研判分类。\n二、首发定标机制：依托速豹自研智能去重比对算法，对全网首报同类风险线索的基层网格单位打上“疑似首发/首发件”权威标记，并在季度考核评价中给予积分倾斜与表扬。\n三、规范核验流程：请各级网格员严格对照事实要素、源头链接和核实凭证，确保舆情信息查证详实、链条闭环。'
  },
  {
    id: 'notif-2',
    type: 'audit_pending',
    title: '台中市秋季旅游推广媒体传播分析',
    content: '李四，台中市网信办提交，系统初判为疑似重复',
    time: '2026-08-13 09:30',
    isUnread: true,
    relatedReportId: 102
  },
  {
    id: 'notif-3',
    type: 'audit_approved',
    title: '智慧停车 App 升级引发市民集中反馈',
    content: '终审采纳，评分 95 分（首发件）',
    time: '2026-08-12 18:00',
    isUnread: true
  },
  {
    id: 'notif-4',
    type: 'audit_pending',
    title: '南屯区老旧小区改造政策解读及反馈收集',
    content: '赵六，台中市网信办提交，系统初判为疑似首发',
    time: '2026-08-12 14:20',
    isUnread: true,
    relatedReportId: 104
  },
  {
    id: 'notif-5',
    type: 'audit_rejected',
    title: '老旧小区改造政策解读及反馈收集',
    content: '驳回原因：信息不完整。请补充政策原文链接和群众反馈截图后重新提交。',
    contentHighlight: true,
    time: '2026-08-12 11:10',
    isUnread: false,
    readAt: '2026-08-12 11:32'
  },
  {
    id: 'notif-6',
    type: 'platform_notice',
    title: '“点点速报”网格员专属激活与角色配置指引',
    content: '系统已上线专属激活码通道，录入专属码可一键代入单位与角色信息，请基层网格员按指引完成实名激活。',
    time: '2026-08-12 09:00',
    isUnread: false,
    readAt: '2026-08-12 09:15',
    announcementContent:
      '系统已上线专属激活码通道。\n\n一、激活方式：网格员在登录页选择“激活账号”，录入单位下发的专属激活码，即可自动带入所属单位与角色信息。\n二、实名要求：激活时需完成手机号验证与实名信息填写。\n三、问题反馈：激活过程中遇到问题，请联系所属单位管理员或市大数据中心。'
  },
  {
    id: 'notif-7',
    type: 'audit_pending',
    title: '某短视频平台涉及虚假宣传的群众举报核查',
    content: '孙七，台中市网信办提交，系统正在比对首发/重复状态',
    time: '2026-08-11 15:55',
    isUnread: false,
    readAt: '2026-08-11 16:20',
    relatedReportId: 105
  },
  {
    id: 'notif-8',
    type: 'audit_approved',
    title: '全市防汛排涝工作舆情监测快报',
    content: '终审采纳，评分 90 分（首发件）',
    time: '2026-08-10 17:30',
    isUnread: false,
    readAt: '2026-08-10 18:02'
  },
  {
    id: 'notif-9',
    type: 'audit_rejected',
    title: '食品安全周宣传活动效果评估',
    content: '驳回原因：佐证不足。需补充现场活动照片与宣传物料投放记录等佐证材料。',
    contentHighlight: true,
    time: '2026-08-08 10:00',
    isUnread: false,
    readAt: '2026-08-08 10:41'
  },
  {
    id: 'notif-10',
    type: 'platform_notice',
    title: '关于汛期舆情值班值守安排的通知',
    content: '7月20日至8月31日实行汛期24小时值班制度，请各单位落实值班人员并保持通讯畅通。',
    time: '2026-07-18 09:00',
    isUnread: false,
    readAt: '2026-07-18 09:30',
    announcementContent:
      '7月20日至8月31日实行汛期24小时值班制度。\n\n一、各单位须安排专人值班，值班期间保持通讯畅通。\n二、遇突发汛情舆情，须在30分钟内通过速报系统首报。\n三、值班表请于7月19日前报送市委网信办。'
  }
];
