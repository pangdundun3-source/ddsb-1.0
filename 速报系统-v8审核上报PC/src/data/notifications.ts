import type { NotificationItem, NotificationType } from '../types';

export const NOTIFICATION_TYPE_META: Record<NotificationType, { label: string; tone: string; actionText: string }> = {
  platform_notice: { label: '平台公告', tone: 'text-[#7E22CE] bg-[#F3E8FF]', actionText: '查看公告' },
  audit_pending: { label: '待审核', tone: 'text-[#B45309] bg-[#FEF3C7]', actionText: '进入审核' },
  audit_approved: { label: '审核通过', tone: 'text-[#047857] bg-[#ECFDF5]', actionText: '查看速报' },
  audit_rejected: { label: '审核驳回', tone: 'text-[#BE123C] bg-[#FFF1F2]', actionText: '查看速报' }
};

/** 已读消息仅展示近 1 年 */
export const READ_RETENTION_DAYS = 365;

export const isWithinRetention = (item: NotificationItem, now = Date.now()) => {
  // 与列表归类一致：按发布时间判断是否在近 1 年内展示
  const stamp = Date.parse(item.time.replace(' ', 'T'));
  if (Number.isNaN(stamp)) return true;
  return now - stamp <= READ_RETENTION_DAYS * 24 * 60 * 60 * 1000;
};

/** 实验数据：原型阶段每次刷新都从 INITIAL 恢复，不持久化已读状态 */
export const NOTIFICATIONS_SEED_VERSION = 4;
export const NOTIFICATIONS_STORAGE_KEY = 'ddsb_pc_notifications_v4';

/** 与消息时间一致的 YYYY-MM-DD HH:mm（本地时间），便于排序和截取 */
export const formatNotificationTime = (date = new Date()) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  // —— 未读：平台公告 / 待办 / 审核结果 ——
  {
    id: 'notif-u1',
    type: 'platform_notice',
    title: '深化突发舆情“即报即审”与首发定标机制通知',
    content: '全面推行“1小时内初审、同源同地址线索首发标记”制度，请各网格员与审核员按规范及时填报核验。',
    time: '2026-11-10 09:20',
    isUnread: true,
    announcementContent:
      '为进一步提升网络综合治理效能与基层舆情响应敏捷度，平台现全面推行突发舆情“1小时内初审响应、同源同地址线索首发智能比对定标”机制。\n\n一、初审时限要求：各直属网信部门与镇街网格员上报线索后，值班审核员须在1小时内完成首轮真实性核验与研判分类。\n二、首发定标机制：依托速豹自研智能去重比对算法，对全网首报同类风险线索的基层网格单位打上“疑似首发/首发件”权威标记，并在季度考核评价中给予积分倾斜与表扬。\n三、规范核验流程：请各级网格员严格对照事实要素、源头链接和核实凭证，确保舆情信息查证详实、链条闭环。'
  },
  {
    id: 'notif-u2',
    type: 'audit_pending',
    title: '台中市秋季旅游推广媒体传播分析',
    content: '李四，台中市网信办提交，系统初判为疑似重复',
    time: '2026-11-10 08:45',
    isUnread: true,
    relatedReportId: 102,
    originLabel: '疑似重复'
  },
  {
    id: 'notif-u3',
    type: 'audit_pending',
    title: '南屯区老旧小区改造政策解读及反馈收集',
    content: '赵六，台中市网信办提交，系统初判为疑似首发',
    time: '2026-11-09 16:20',
    isUnread: true,
    relatedReportId: 104,
    originLabel: '疑似首发'
  },
  {
    id: 'notif-u4',
    type: 'audit_approved',
    title: '智慧停车 App 升级引发市民集中反馈',
    content: '终审采纳，评分 95 分',
    time: '2026-11-09 14:08',
    isUnread: true,
    originLabel: '首发'
  },
  {
    id: 'notif-u4b',
    type: 'audit_approved',
    title: '东湖区某小区二次供水水质异常投诉核查',
    content: '审核已通过，进入下一审核节点',
    time: '2026-11-09 13:22',
    isUnread: true,
    relatedReportId: 103,
    originLabel: '疑似重复'
  },
  {
    id: 'notif-u5',
    type: 'audit_rejected',
    title: '西坝区主干道施工围挡交通拥堵核查',
    content: '驳回原因：信息不完整。请补充现场照片与拥堵路段示意图后重新提交。',
    contentHighlight: true,
    time: '2026-11-09 11:30',
    isUnread: true,
    originLabel: '疑似首发'
  },
  {
    id: 'notif-u6',
    type: 'platform_notice',
    title: '关于做好重点时段网络舆情值班值守的通知',
    content: '11月中下旬实行加强值班，请各单位落实人员并保持通讯畅通。',
    time: '2026-11-08 10:00',
    isUnread: true,
    announcementContent:
      '11月中下旬实行加强值班制度。\n\n一、各单位须安排专人值班，值班期间保持通讯畅通。\n二、遇突发舆情须在30分钟内通过速报系统首报。\n三、值班表请于11月7日前报送市委网信办。'
  },

  // —— 已读：平台公告 / 待办 / 审核结果 ——
  {
    id: 'notif-r1',
    type: 'audit_pending',
    title: '某短视频平台涉及虚假宣传的群众举报核查',
    content: '孙七，台中市网信办提交，系统正在比对首发/重复状态',
    time: '2026-11-07 15:55',
    isUnread: false,
    readAt: '2026-11-07 16:20',
    relatedReportId: 105,
    originLabel: '疑似首发'
  },
  {
    id: 'notif-r2',
    type: 'platform_notice',
    title: '“点点速报”网格员专属激活与角色配置指引',
    content: '系统已上线专属激活码通道，录入专属码可一键代入单位与角色信息，请基层网格员按指引完成实名激活。',
    time: '2026-11-06 09:00',
    isUnread: false,
    readAt: '2026-11-06 09:15',
    announcementContent:
      '系统已上线专属激活码通道。\n\n一、激活方式：网格员在登录页选择“激活账号”，录入单位下发的专属激活码，即可自动带入所属单位与角色信息。\n二、实名要求：激活时需完成手机号验证与实名信息填写。\n三、问题反馈：激活过程中遇到问题，请联系所属单位管理员或市大数据中心。'
  },
  {
    id: 'notif-r3',
    type: 'audit_approved',
    title: '全市防汛排涝工作舆情监测快报',
    content: '终审采纳，评分 90 分',
    time: '2026-11-05 17:30',
    isUnread: false,
    readAt: '2026-11-05 18:02',
    originLabel: '首发'
  },
  {
    id: 'notif-r4',
    type: 'audit_rejected',
    title: '食品安全周宣传活动效果评估',
    content: '驳回原因：佐证不足。需补充现场活动照片与宣传物料投放记录等佐证材料。',
    contentHighlight: true,
    time: '2026-11-04 10:00',
    isUnread: false,
    readAt: '2026-11-04 10:41',
    originLabel: '疑似重复'
  },
  {
    id: 'notif-r5',
    type: 'audit_pending',
    title: '雨屯区老旧小区改造政策解读及反馈收集',
    content: '相关待办已由值班审核员处理',
    time: '2026-10-28 14:20',
    isUnread: false,
    readAt: '2026-10-28 15:02',
    relatedReportId: 104,
    originLabel: '疑似首发'
  },
  {
    id: 'notif-r6',
    type: 'platform_notice',
    title: '关于汛期舆情值班值守安排的通知',
    content: '7月20日至8月31日实行汛期24小时值班制度，请各单位落实值班人员并保持通讯畅通。',
    time: '2026-07-18 09:00',
    isUnread: false,
    readAt: '2026-07-18 09:30',
    announcementContent:
      '7月20日至8月31日实行汛期24小时值班制度。\n\n一、各单位须安排专人值班，值班期间保持通讯畅通。\n二、遇突发汛情舆情，须在30分钟内通过速报系统首报。\n三、值班表请于7月19日前报送市委网信办。'
  },
  {
    id: 'notif-r7',
    type: 'audit_approved',
    title: '台中市秋季旅游推广媒体传播分析',
    content: '终审采纳，评分 88 分',
    time: '2026-06-22 16:40',
    isUnread: false,
    readAt: '2026-06-22 17:05',
    originLabel: '重复'
  },
  {
    id: 'notif-r8',
    type: 'audit_rejected',
    title: '老旧小区改造政策解读及反馈收集',
    content: '驳回原因：信息不完整。请补充政策原文链接和群众反馈截图后重新提交。',
    contentHighlight: true,
    time: '2026-05-12 11:10',
    isUnread: false,
    readAt: '2026-05-12 11:32',
    originLabel: '疑似首发'
  }
];
