# -*- coding: utf-8 -*-
"""Generate Excel catalog from 三端统计指标口径说明."""
from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter

OUT = Path(__file__).with_name("三端统计指标口径说明.xlsx")

HEADER_FILL = PatternFill("solid", fgColor="1E5ABB")
HEADER_FONT = Font(color="FFFFFF", bold=True, size=11)
WRAP = Alignment(wrap_text=True, vertical="top")
THIN = Border(
    left=Side(style="thin", color="D0D7DE"),
    right=Side(style="thin", color="D0D7DE"),
    top=Side(style="thin", color="D0D7DE"),
    bottom=Side(style="thin", color="D0D7DE"),
)
ALT = PatternFill("solid", fgColor="F6F8FA")
WARN = PatternFill("solid", fgColor="FFF8C5")


def style_header(ws, ncols):
    for col in range(1, ncols + 1):
        cell = ws.cell(1, col)
        cell.fill = HEADER_FILL
        cell.font = HEADER_FONT
        cell.alignment = Alignment(wrap_text=True, vertical="center", horizontal="center")
        cell.border = THIN
    ws.freeze_panes = "A2"
    ws.auto_filter.ref = f"A1:{get_column_letter(ncols)}1"


def write_sheet(ws, headers, rows, widths=None):
    for i, h in enumerate(headers, 1):
        ws.cell(1, i, h)
    style_header(ws, len(headers))
    for r_idx, row in enumerate(rows, 2):
        for c_idx, val in enumerate(row, 1):
            cell = ws.cell(r_idx, c_idx, val)
            cell.alignment = WRAP
            cell.border = THIN
            if r_idx % 2 == 0:
                cell.fill = ALT
            if isinstance(val, str) and "待产品确认" in val:
                cell.fill = WARN
    if widths:
        for i, w in enumerate(widths, 1):
            ws.column_dimensions[get_column_letter(i)].width = w
    else:
        for i in range(1, len(headers) + 1):
            ws.column_dimensions[get_column_letter(i)].width = 18
    ws.row_dimensions[1].height = 28


METRIC_HEADERS = [
    "端",
    "模块",
    "页面",
    "路由/入口",
    "代码路径",
    "指标名称",
    "单位",
    "计算规则（代码口径）",
    "数据来源",
    "备注/待确认",
]

# 端 → 模块 → 页面 → 指标
metrics = [
    # 客户管理端 · 首页
    ["V8客户管理端", "首页", "工作台首页", "#/home", "src/pages/Home.tsx", "待我审核", "件", "auditStatus === '待审核' 的报送数", "列表计算", ""],
    ["V8客户管理端", "首页", "工作台首页", "#/home", "src/pages/Home.tsx", "已驳回待重报", "件", "auditStatus ∈ {被驳回, 已驳回}", "列表计算", ""],
    ["V8客户管理端", "首页", "工作台首页", "#/home", "src/pages/Home.tsx", "已采纳待转办", "件", "auditStatus === '待转办'", "列表计算", ""],
    ["V8客户管理端", "首页", "工作台首页", "#/home", "src/pages/Home.tsx", "今日上报", "件", "组织矩阵各行 todaySubmitted 求和", "硬编码矩阵 subOrgMatrixRaw", "【待产品确认】今日按自然日还是业务日；是否改实时聚合"],
    ["V8客户管理端", "首页", "组织节点运行矩阵", "#/home", "src/pages/Home.tsx", "今日上报", "件", "字段 todaySubmitted", "硬编码", ""],
    ["V8客户管理端", "首页", "组织节点运行矩阵", "#/home", "src/pages/Home.tsx", "待审核", "件", "字段 pendingAudit", "硬编码", ""],
    ["V8客户管理端", "首页", "组织节点运行矩阵", "#/home", "src/pages/Home.tsx", "审核中", "件", "字段 auditing", "硬编码", ""],
    ["V8客户管理端", "首页", "组织节点运行矩阵", "#/home", "src/pages/Home.tsx", "驳回待重报", "件", "字段 rejectedResend", "硬编码", ""],
    ["V8客户管理端", "首页", "组织节点运行矩阵", "#/home", "src/pages/Home.tsx", "人员参与", "人", "reporterActive+auditorActive 合并为 活跃/在册", "硬编码字符串拼接", ""],
    ["V8客户管理端", "首页", "组织节点运行矩阵", "#/home", "src/pages/Home.tsx", "平均审核耗时", "分", "字段 avgMinutes；展示可格式化为分/时", "硬编码", ""],
    # 客户 · 报送
    ["V8客户管理端", "报送统计", "报送待办工作台", "#/report-summary", "src/pages/ReportSummary.tsx", "待办驳回（卡片主数）", "件", "todoCount = rejectedCount（仅当前驳回存量）", "列表计算", "【待产品确认】是否应改为 待审核+审核中+被驳回（与PC/H5一致）"],
    ["V8客户管理端", "报送统计", "报送待办工作台", "#/report-summary", "src/pages/ReportSummary.tsx", "累计上报", "件", "totalCount = reports.length", "列表计算", "全量"],
    ["V8客户管理端", "报送统计", "报送待办工作台", "#/report-summary", "src/pages/ReportSummary.tsx", "整体采纳率", "%", "round(adopted/total*100)；adopted=已采纳|已通过", "列表计算（全量）", "【待产品确认】与PC/H5近7日不一致"],
    ["V8客户管理端", "报送统计", "报送待办工作台", "#/report-summary", "src/pages/ReportSummary.tsx", "首审直通率", "%", "firstTimePassCount=total-rejectedCount；rate=round(count/total*100)", "列表计算（当前驳回存量近似）", "【待产品确认】非真实无驳回轨迹"],
    ["V8客户管理端", "报送统计", "报送待办工作台", "#/report-summary", "src/pages/ReportSummary.tsx", "首发/重复件数", "件", "resolveIdentification 后疑似+正式首发/重复合计", "列表计算", "辅助展示"],
    # 客户 · 审核 KPI
    ["V8客户管理端", "审核统计", "我的审核 KPI", "#/report-audit", "src/pages/ReportAudit.tsx", "审核待办", "件", "当前 待审核 件数（存量）", "列表计算（存量）", ""],
    ["V8客户管理端", "审核统计", "我的审核 KPI", "#/report-audit", "src/pages/ReportAudit.tsx", "累计处理", "件", "近7日已处理：通过类或驳回类，且 auditTime|submitTime 在窗口", "近7日窗口", "通过类=已通过|已转办|已采纳；驳回类=被驳回|已驳回"],
    ["V8客户管理端", "审核统计", "我的审核 KPI", "#/report-audit", "src/pages/ReportAudit.tsx", "通过处理/驳回处理", "件", "近7日 handled 再拆分", "近7日窗口", "副文案"],
    ["V8客户管理端", "审核统计", "我的审核 KPI", "#/report-audit", "src/pages/ReportAudit.tsx", "审核处理率", "%", "round(近7日已处理/近7日到达*100)；到达=submitTime 在窗口", "近7日窗口", "口径A：到达/已处理"],
    ["V8客户管理端", "审核统计", "我的审核 KPI", "#/report-audit", "src/pages/ReportAudit.tsx", "平均响应", "分/时/天", "近7日 mean(auditTime-arrivedAt)；arrivedAt=getAuditArrivedAt，异常回退 submitTime", "近7日窗口", ""],
    # 客户 · 审核大盘
    ["V8客户管理端", "审核统计", "审核统计大盘", "#/audit-statistics", "src/pages/AuditStatistics.tsx + utils/statsTrend.ts", "趋势·累计处理", "次", "序列字段 audited（合成）", "合成趋势", "buildTrendSeries"],
    ["V8客户管理端", "审核统计", "审核统计大盘", "#/audit-statistics", "src/pages/AuditStatistics.tsx + utils/statsTrend.ts", "趋势·通过处理", "次", "序列 passed", "合成趋势", ""],
    ["V8客户管理端", "审核统计", "审核统计大盘", "#/audit-statistics", "src/pages/AuditStatistics.tsx + utils/statsTrend.ts", "趋势·驳回处理", "次", "序列 rejected", "合成趋势", ""],
    ["V8客户管理端", "审核统计", "审核统计大盘", "#/audit-statistics", "src/pages/AuditStatistics.tsx + utils/statsTrend.ts", "趋势·审核处理率", "%", "序列 processRate", "合成趋势", ""],
    ["V8客户管理端", "审核统计", "审核统计大盘", "#/audit-statistics", "src/pages/AuditStatistics.tsx + utils/statsTrend.ts", "趋势·平均审核耗时", "分", "序列 avgTime", "合成趋势", ""],
    ["V8客户管理端", "审核统计", "审核统计大盘", "#/audit-statistics", "src/pages/AuditStatistics.tsx", "环图中心·累计处理", "次", "metricsData.auditor 周期切片；按审核动作计次可重复", "硬编码", "【待产品确认】动作计次 vs 按件计次"],
    ["V8客户管理端", "审核统计", "审核统计大盘", "#/audit-statistics", "src/pages/AuditStatistics.tsx", "环图·通过/驳回/待办处理", "次", "metricsData 硬编码分布", "硬编码", ""],
    ["V8客户管理端", "审核统计", "审核统计大盘", "#/audit-statistics", "src/pages/AuditStatistics.tsx", "平均审核耗时（卡片）", "分等", "metricsData 硬编码 + 展示格式化", "硬编码", ""],
    ["V8客户管理端", "审核统计", "审核统计大盘", "#/audit-statistics", "src/pages/AuditStatistics.tsx", "审核处理率（卡片）", "%", "metricsData 硬编码", "硬编码", ""],
    ["V8客户管理端", "审核统计", "审核统计大盘", "#/audit-statistics", "src/pages/AuditStatistics.tsx", "全域对标表", "多列", "累计报送量、整体通过率、平均响应时效、综合总分等", "硬编码表格", ""],
    # 客户 · 统计管理
    ["V8客户管理端", "统计管理", "统计管理与效能分析", "#/statistics", "src/pages/StatisticsReference.tsx", "趋势·累计报送量", "件", "字段 total（合成）", "合成趋势", "周期：日/周/月/季/年"],
    ["V8客户管理端", "统计管理", "统计管理与效能分析", "#/statistics", "src/pages/StatisticsReference.tsx", "趋势·累计采纳量", "件", "字段 passed（≈total*passRate）", "合成趋势", ""],
    ["V8客户管理端", "统计管理", "统计管理与效能分析", "#/statistics", "src/pages/StatisticsReference.tsx", "趋势·驳回整改量", "件", "字段 rejected", "合成趋势", ""],
    ["V8客户管理端", "统计管理", "统计管理与效能分析", "#/statistics", "src/pages/StatisticsReference.tsx", "趋势·首审直通率", "%", "字段 directRate", "合成趋势", ""],
    ["V8客户管理端", "统计管理", "统计管理与效能分析", "#/statistics", "src/pages/StatisticsReference.tsx", "趋势·整体采纳率", "%", "字段 passRate", "合成趋势", ""],
    ["V8客户管理端", "统计管理", "统计管理与效能分析", "#/statistics", "src/pages/StatisticsReference.tsx", "趋势·审核处理率", "%", "字段 processRate", "合成趋势", ""],
    ["V8客户管理端", "统计管理", "统计管理与效能分析", "#/statistics", "src/pages/StatisticsReference.tsx", "趋势·转办闭环率", "%", "字段 closedRate", "合成趋势", "【待产品确认】正式定义=办结/转办"],
    ["V8客户管理端", "统计管理", "统计管理与效能分析", "#/statistics", "src/pages/StatisticsReference.tsx", "趋势·平均审核耗时", "分", "字段 avgTime", "合成趋势", ""],
    ["V8客户管理端", "统计管理", "统计管理与效能分析", "#/statistics", "src/pages/StatisticsReference.tsx", "面板·整体采纳率/首审直通率", "%", "avg(各趋势点 passRate/directRate)", "合成趋势聚合", "网格员报送统计面板"],
    ["V8客户管理端", "统计管理", "统计管理与效能分析", "#/statistics", "src/pages/StatisticsReference.tsx", "面板·在册网格员", "人", "reporterCount 演示常量", "硬编码/演示", ""],
    ["V8客户管理端", "统计管理", "统计管理与效能分析", "#/statistics", "src/pages/StatisticsReference.tsx", "面板·人均累计报送量", "件", "sum(total)/max(reporterCount,1)", "合成趋势聚合", ""],
    ["V8客户管理端", "统计管理", "统计管理与效能分析", "#/statistics", "src/pages/StatisticsReference.tsx", "面板·平均审核耗时/审核处理率", "分/%", "趋势点算术平均", "合成趋势聚合", "审核员审核统计面板"],
    ["V8客户管理端", "统计管理", "统计管理与效能分析", "#/statistics", "src/pages/StatisticsReference.tsx", "面板·在册审核员", "人", "auditorCount", "硬编码/演示", ""],
    ["V8客户管理端", "统计管理", "统计管理与效能分析", "#/statistics", "src/pages/StatisticsReference.tsx", "面板·人均负荷", "次", "auditTotal/max(auditorCount,1)", "环图合计派生", ""],
    ["V8客户管理端", "统计管理", "统计管理与效能分析", "#/statistics", "src/pages/StatisticsReference.tsx", "环图·报送侧", "件", "reportDonutBase × periodFactor(=periodDays/7) × scopeFactor；扇区：采纳/审核中/待审核/被驳回", "硬编码基准×缩放", ""],
    ["V8客户管理端", "统计管理", "统计管理与效能分析", "#/statistics", "src/pages/StatisticsReference.tsx", "环图·审核侧", "次", "auditDonutBase 同样缩放；通过/驳回/待办；审核动作计次", "硬编码基准×缩放", "【待产品确认】动作计次"],
    # 客户 · 考核
    ["V8客户管理端", "考核管理", "组织节点/群组考核", "#/evaluation", "src/pages/EvaluationReference.tsx", "人员参与", "人/%", "参与人数表；参与率=参与/staff*100", "硬编码演示表", "EVAL_PERIOD_DAYS=30"],
    ["V8客户管理端", "考核管理", "组织节点/群组考核", "#/evaluation", "src/pages/EvaluationReference.tsx", "累计报送量", "件", "表字段 total", "硬编码", ""],
    ["V8客户管理端", "考核管理", "组织节点/群组考核", "#/evaluation", "src/pages/EvaluationReference.tsx", "累计采纳量", "件", "adopted；拆首发/重复/其他：other≈8%，剩余按 hint 比例", "硬编码+派生", ""],
    ["V8客户管理端", "考核管理", "组织节点/群组考核", "#/evaluation", "src/pages/EvaluationReference.tsx", "首审直通率", "%", "表字段 directRate", "硬编码", ""],
    ["V8客户管理端", "考核管理", "组织节点/群组考核", "#/evaluation", "src/pages/EvaluationReference.tsx", "整体采纳率", "%", "表字段 passRate", "硬编码", ""],
    ["V8客户管理端", "考核管理", "组织节点/群组考核", "#/evaluation", "src/pages/EvaluationReference.tsx", "平均审核耗时", "分", "表字段 avgTime", "硬编码", ""],
    ["V8客户管理端", "考核管理", "组织节点/群组考核", "#/evaluation", "src/pages/EvaluationReference.tsx", "转办闭环率", "%", "closedRate；导出转办量≈total*15%，办结=transfer*closedRate/100", "硬编码+反推", "【待产品确认】正式公式"],
    ["V8客户管理端", "考核管理", "组织节点/群组考核", "#/evaluation", "src/pages/EvaluationReference.tsx", "审核处理率（派生）", "%", "(adopted+rejected)/total*100", "派生", ""],
    ["V8客户管理端", "考核管理", "组织节点/群组考核", "#/evaluation", "src/pages/EvaluationReference.tsx", "综合得分", "分", "表字段 score（组织行硬编码）", "硬编码", "【待产品确认】与人员得分模型统一"],
    ["V8客户管理端", "考核管理", "组织节点/群组考核", "#/evaluation", "src/pages/EvaluationReference.tsx", "等级", "—", "≥95卓越；≥92优秀；≥88良好；否则合格", "规则派生", ""],
    ["V8客户管理端", "考核管理", "人员考核·网格员", "#/evaluation", "src/pages/EvaluationReference.tsx", "综合得分", "分", "score=round1(adoptedCount*avgScore)；total/directRate/passRate 由 seeded 生成", "算法生成", ""],
    ["V8客户管理端", "考核管理", "人员考核·审核员", "#/evaluation", "src/pages/EvaluationReference.tsx", "审核处理量/处理率/响应/均分", "多", "auditorRecords seeded 生成", "算法生成", ""],
    # PC
    ["审核上报PC", "首页", "首页", "#/home", "src/pages/Home.tsx", "统计KPI卡", "—", "无独立计算大卡；快捷入口到报送/审核统计", "无", "本端无独立统计管理/考核管理"],
    ["审核上报PC", "报送统计", "报送待办工作台", "#/report-summary", "src/pages/ReportSummary.tsx", "报送待办", "件", "待审核+审核中+被驳回/已驳回", "列表计算（存量）", ""],
    ["审核上报PC", "报送统计", "报送待办工作台", "#/report-summary", "src/pages/ReportSummary.tsx", "累计采纳量", "件", "近7日 submitTime 窗口内 已采纳|已通过", "近7日窗口", ""],
    ["审核上报PC", "报送统计", "报送待办工作台", "#/report-summary", "src/pages/ReportSummary.tsx", "整体采纳率", "%", "近7日 采纳/近7日上报总数", "近7日窗口", ""],
    ["审核上报PC", "报送统计", "报送待办工作台", "#/report-summary", "src/pages/ReportSummary.tsx", "首审直通率", "%", "近7日 (总数-驳回存量)/总数", "近7日窗口", "【待产品确认】驳回存量近似"],
    ["审核上报PC", "报送统计", "报送待办工作台", "#/report-summary", "src/pages/ReportSummary.tsx", "采纳拆分·首发/重复/其他", "件", "有标签用标签；否则约70%/22%/剩余", "派生展示", ""],
    ["审核上报PC", "报送统计", "报送统计大盘", "#/report-statistics", "src/pages/Statistics.tsx(scope=submit)", "趋势系列", "多", "累计报送/采纳/驳回整改/首审直通/整体采纳", "合成趋势", "同 buildTrendSeries"],
    ["审核上报PC", "报送统计", "报送统计大盘", "#/report-statistics", "src/pages/Statistics.tsx(scope=submit)", "环图", "件", "采纳/审核中/待审核/被驳回", "硬编码 metricsData", ""],
    ["审核上报PC", "报送统计", "报送统计大盘", "#/report-statistics", "src/pages/Statistics.tsx(scope=submit)", "卡片·采纳率/直通率/总分/均分", "多", "metricsData 硬编码", "硬编码", ""],
    ["审核上报PC", "审核统计", "我的审核 KPI", "#/report-audit", "src/pages/ReportAudit.tsx", "审核待办/累计处理/处理率/平均响应", "多", "与客户管理端同类：存量待办+近7日处理/处理率/响应", "近7日窗口+存量", "到达用上报时间，完成用审核时间"],
    ["审核上报PC", "审核统计", "审核统计大盘", "#/audit-statistics", "src/pages/AuditStatistics.tsx", "趋势/环图/卡片/对标表", "多", "同客户管理端审核大盘", "合成趋势+硬编码", ""],
    ["审核上报PC", "掌上壳统计", "H5MobilePortal·我的", "PC内嵌", "src/components/H5MobilePortal.tsx", "报送总量", "件", "reports.length", "列表计算", "非独立H5工程"],
    ["审核上报PC", "掌上壳统计", "H5MobilePortal·我的", "PC内嵌", "src/components/H5MobilePortal.tsx", "采纳通过", "件", "passedCount", "列表计算", ""],
    ["审核上报PC", "掌上壳统计", "H5MobilePortal·我的", "PC内嵌", "src/components/H5MobilePortal.tsx", "驳回量（报送）", "件", "写死 2", "硬编码", ""],
    ["审核上报PC", "掌上壳统计", "H5MobilePortal·我的", "PC内嵌", "src/components/H5MobilePortal.tsx", "审核总量", "件", "auditRecords.length + pendingCount", "列表计算", ""],
    ["审核上报PC", "掌上壳统计", "H5MobilePortal·我的", "PC内嵌", "src/components/H5MobilePortal.tsx", "打分通过", "件", "action==='审核通过'", "列表计算", ""],
    ["审核上报PC", "掌上壳统计", "H5MobilePortal·我的", "PC内嵌", "src/components/H5MobilePortal.tsx", "驳回量（审核）", "件", "action==='驳回上报'", "列表计算", ""],
    ["审核上报PC", "掌上壳统计", "H5MobilePortal·我的", "PC内嵌", "src/components/H5MobilePortal.tsx", "合并审核", "件", "写死 3", "硬编码", ""],
    ["审核上报PC", "统计管理", "—", "—", "—", "本端无", "—", "无独立统计管理菜单", "本端无", ""],
    ["审核上报PC", "考核管理", "—", "—", "—", "本端无", "—", "无独立考核管理菜单", "本端无", ""],
    # H5
    ["审核上报H5", "首页", "DashboardView", "Tab 首页", "src/components/DashboardView.tsx", "统计KPI", "—", "无（模板选择+通知）", "无", ""],
    ["审核上报H5", "报送统计", "报送顶栏KPI", "Tab 报送", "src/components/ReportView.tsx", "报送待办", "件", "非转办：pending_audit+auditing+rejected", "列表计算（存量）", "对齐PC ReportSummary"],
    ["审核上报H5", "报送统计", "报送顶栏KPI", "Tab 报送", "src/components/ReportView.tsx", "累计采纳量", "件", "近7日 createTime 窗口内 status==approved", "近7日窗口", ""],
    ["审核上报H5", "报送统计", "报送顶栏KPI", "Tab 报送", "src/components/ReportView.tsx", "整体采纳率", "%", "近7日 approved/近7日总数", "近7日窗口", ""],
    ["审核上报H5", "报送统计", "报送顶栏KPI", "Tab 报送", "src/components/ReportView.tsx", "首审直通率", "%", "近7日 (总数-rejected)/总数", "近7日窗口", "【待产品确认】驳回存量近似"],
    ["审核上报H5", "报送统计", "报送顶栏KPI", "Tab 报送", "src/components/ReportView.tsx", "采纳拆分", "件", "标识tag；否则70%/22%/剩余", "派生", ""],
    ["审核上报H5", "审核统计", "审核顶栏KPI", "Tab 审核", "src/components/AuditView.tsx", "审核待办", "件", "status===pending_audit", "列表计算（存量）", ""],
    ["审核上报H5", "审核统计", "审核顶栏KPI", "Tab 审核", "src/components/AuditView.tsx", "累计处理", "件", "近7日 approved|rejected 且 updateTime|createTime 在窗口", "近7日窗口", ""],
    ["审核上报H5", "审核统计", "审核顶栏KPI", "Tab 审核", "src/components/AuditView.tsx", "审核处理率", "%", "近7日已处理/近7日到达；到达=createTime在窗口", "近7日窗口", "口径A"],
    ["审核上报H5", "审核统计", "审核顶栏KPI", "Tab 审核", "src/components/AuditView.tsx", "平均响应", "分等", "近7日 mean(updateTime-createTime)", "近7日窗口", "首审以createTime为上一环节提交"],
    ["审核上报H5", "统计管理(我的)", "ProfileView·报送块", "Tab 我的", "src/components/ProfileView.tsx", "累计上报", "件", "周期内报送件数", "列表计算（周期过滤）", "今日/近7/30/90/自定义"],
    ["审核上报H5", "统计管理(我的)", "ProfileView·报送块", "Tab 我的", "src/components/ProfileView.tsx", "累计采纳量", "件", "approved", "列表计算", ""],
    ["审核上报H5", "统计管理(我的)", "ProfileView·报送块", "Tab 我的", "src/components/ProfileView.tsx", "审核中/待审核/被驳回", "件", "对应 status", "列表计算", ""],
    ["审核上报H5", "统计管理(我的)", "ProfileView·报送块", "Tab 我的", "src/components/ProfileView.tsx", "整体采纳率", "%", "approved/累计上报*100", "列表计算", ""],
    ["审核上报H5", "统计管理(我的)", "ProfileView·报送块", "Tab 我的", "src/components/ProfileView.tsx", "首审直通率", "%", "(累计上报-被驳回)/累计上报*100", "列表计算", ""],
    ["审核上报H5", "统计管理(我的)", "ProfileView·报送块", "Tab 我的", "src/components/ProfileView.tsx", "平均得分", "分", "有score>0采纳件均值；无分默认按95参与", "列表计算", ""],
    ["审核上报H5", "统计管理(我的)", "ProfileView·报送块", "Tab 我的", "src/components/ProfileView.tsx", "综合总分", "分", "2380历史底分+本期采纳分合计；无上报为0", "硬编码底分+列表", "【待产品确认】2380生产如何取"],
    ["审核上报H5", "统计管理(我的)", "ProfileView·审核块", "Tab 我的", "src/components/ProfileView.tsx", "累计处理", "次", "通过+驳回（approved+rejected）", "列表计算", "动作计次注释"],
    ["审核上报H5", "统计管理(我的)", "ProfileView·审核块", "Tab 我的", "src/components/ProfileView.tsx", "通过/驳回/待办处理", "次", "待办=pending_audit|auditing", "列表计算", ""],
    ["审核上报H5", "统计管理(我的)", "ProfileView·审核块", "Tab 我的", "src/components/ProfileView.tsx", "审核处理率", "%", "(通过+驳回)/(通过+驳回+待办)*100", "列表计算", "口径B；【待产品确认】与AuditView口径A统一"],
    ["审核上报H5", "统计管理(我的)", "ProfileView·审核块", "Tab 我的", "src/components/ProfileView.tsx", "平均审核耗时", "分", "已处理件 mean(updateTime-createTime)", "列表计算", ""],
    ["审核上报H5", "考核管理", "—", "—", "—", "本端无", "—", "无独立考核页面", "本端无", ""],
]

pending = [
    ["整体采纳率/首审直通率窗口", "客户#/report-summary为全量，PC/H5工作台为近7日", "是否统一近7日；客户是否改正"],
    ["首审直通真实口径", "原型用「总数−当前驳回存量」近似", "是否改为「首次审核通过且历史无驳回」事件口径"],
    ["审核处理率口径", "口径A=已处理/到达；口径B=已处理/(已处理+待办)", "Profile用B，AuditView/我的审核用A，需统一"],
    ["采纳集合", "部分页含已转办", "是否含已转办；已采纳终态如何入库"],
    ["报送待办卡片", "客户卡片主数仅驳回，PC/H5为三者之和", "客户是否改为待审核+审核中+被驳回"],
    ["大盘数据源", "合成趋势+硬编码metricsData", "上线是否全面接数仓/明细聚合"],
    ["审核动作计次", "大盘环图按动作可重复计", "动作计次 vs 按件计次以哪套为准"],
    ["转办闭环率", "考核用total*15%反推", "正式公式：办结转办数/转办发起数"],
    ["综合得分权重", "组织硬编码score；人员=采纳件数×均分；雷达仅为展示", "权重模型是否统一"],
    ["H5综合总分底分", "写死2380", "生产历史底分如何取"],
    ["首页组织矩阵", "硬编码subOrgMatrixRaw", "是否改为按组织实时聚合；今日定义"],
]

dictionary = [
    ["todo_report", "报送待办", "待审核+审核中+驳回待重报", "客户#/report-summary卡片主数仅用驳回"],
    ["todo_audit", "审核待办", "当前待我审（通常=待审核）", "一致居多"],
    ["adopted_cnt", "累计采纳量", "终态∈{已采纳,已通过,已转办?} 且时间落在统计周期", "是否含已转办【待产品确认】"],
    ["adopt_rate", "整体采纳率", "adopted_cnt / submitted_cnt", "窗口：工作台近7日 vs 大盘可选周期；客户工作台全量"],
    ["first_pass_rate", "首审直通率", "建议：周期内首次审核通过且历史无驳回 / 周期上报数", "原型用总数−当前驳回存量近似"],
    ["audit_process_rate", "审核处理率", "建议A：周期已处理/周期到达；建议B：已处理/(已处理+待办)", "Profile用B，AuditView/我的审核用A"],
    ["avg_audit_response", "平均审核响应/耗时", "mean(本环节完成时间 − 到达本环节时间)", "H5用create→update；客户用arrivedAt→auditTime"],
    ["transfer_closed_rate", "转办闭环率", "办结转办数 / 转办发起数", "考核里用total*15%反推，非正式"],
    ["audit_action_cnt", "累计处理（动作）", "审核动作流水条数（通过+驳回，可多人）", "大盘注释采用；件维度需另指标"],
]

pages = [
    ["V8客户管理端", "首页", "#/home", "pages/Home.tsx"],
    ["V8客户管理端", "报送工作台KPI", "#/report-summary", "pages/ReportSummary.tsx"],
    ["V8客户管理端", "我的审核KPI", "#/report-audit", "pages/ReportAudit.tsx"],
    ["V8客户管理端", "审核统计", "#/audit-statistics", "pages/AuditStatistics.tsx"],
    ["V8客户管理端", "统计管理", "#/statistics", "pages/StatisticsReference.tsx"],
    ["V8客户管理端", "考核管理", "#/evaluation", "pages/EvaluationReference.tsx"],
    ["审核上报PC", "首页", "#/home", "pages/Home.tsx"],
    ["审核上报PC", "报送工作台KPI", "#/report-summary", "pages/ReportSummary.tsx"],
    ["审核上报PC", "报送统计大盘", "#/report-statistics", "pages/Statistics.tsx / 同源"],
    ["审核上报PC", "审核统计", "#/audit-statistics", "pages/AuditStatistics.tsx"],
    ["审核上报PC", "掌上壳统计", "H5MobilePortal 我的", "components/H5MobilePortal.tsx"],
    ["审核上报H5", "首页", "Tab 首页", "components/DashboardView.tsx"],
    ["审核上报H5", "报送KPI", "Tab 报送", "components/ReportView.tsx"],
    ["审核上报H5", "审核KPI", "Tab 审核", "components/AuditView.tsx"],
    ["审核上报H5", "我的统计", "Tab 我的", "components/ProfileView.tsx"],
]

conventions = [
    ["数据来源类型", "列表计算", "对当前内存/mock报送列表按状态过滤后实时算"],
    ["数据来源类型", "近7日窗口", "以列表最新业务日为锚点latest，窗口[latest-6, latest]（含首尾共7天）"],
    ["数据来源类型", "合成趋势", "buildTrendSeries / seeded 伪随机，不是真实业务库"],
    ["数据来源类型", "硬编码", "metricsData / 常量写死，仅演示"],
    ["数据来源类型", "派生展示", "由其他指标拆分（如采纳量拆首发/重复/其他）"],
    ["状态映射", "待审核", "客户/PC: 待审核；H5: pending_audit"],
    ["状态映射", "审核中", "客户/PC: 审核中；H5: auditing"],
    ["状态映射", "已采纳", "客户/PC: 已采纳/已通过/(部分)已转办；H5: approved"],
    ["状态映射", "已驳回", "客户/PC: 被驳回/已驳回；H5: rejected"],
    ["状态映射", "待转办", "客户/PC: 待转办；H5另有转办相关过滤"],
    ["近7日锚点", "latestDateKey", "max(业务日期字段YYYY-MM-DD)；无数据则取今天"],
    ["近7日锚点", "recentStartKey", "latestDateKey - 6天"],
    ["近7日锚点", "inRecentWindow", "recentStartKey ≤ d ≤ latestDateKey"],
    ["合成趋势单点", "buildTrendSeries", "r=seeded(seed); dailyBase=1380+round(r*420)+(index%3)*40; total=max(20,round(dailyBase*spanDays*(0.92+r*0.16))); directRate/passRate/processRate/closedRate/rejected/passed/audited/avgTime/score 见MD"],
    ["口径原则", "—", "以现有前端代码可推断规则为准；无法闭环标【待产品确认】。依据原型代码2026-11-12。"],
]

cross = [
    ["整体采纳率", "全量 采纳/总数", "近7日 采纳/近7日总数", "近7日 同PC", "不一致【待产品确认】"],
    ["首审直通率", "全量 (总数-当前驳回)/总数", "近7日 (总数-驳回存量)/总数", "近7日 同PC", "均为驳回存量近似【待产品确认】"],
    ["审核处理率", "我的审核用口径A；大盘硬编码/合成", "同客户我的审核口径A", "AuditView口径A；Profile口径B", "需统一"],
]


def main():
    wb = Workbook()

    ws0 = wb.active
    ws0.title = "说明"
    ws0["A1"] = "三端统计指标口径说明（Excel）"
    ws0["A1"].font = Font(bold=True, size=14, color="1E5ABB")
    ws0["A3"] = "配套 Markdown"
    ws0["B3"] = "docs/design-briefs/三端统计指标口径说明.md"
    ws0["A4"] = "结构"
    ws0["B4"] = "端 → 模块 → 页面 → 指标 + 公式 + 数据来源"
    ws0["A5"] = "工作表"
    ws0["B5"] = "指标明细 | 阅读约定 | 跨端差异 | 指标词典 | 页面索引 | 待产品确认"
    ws0["A7"] = "使用建议"
    ws0["B7"] = "开发优先看「指标明细」与「指标词典」；产品先拍「待产品确认」后再定接口。"
    for r in range(3, 8):
        ws0.cell(r, 1).font = Font(bold=True)
        ws0.cell(r, 2).alignment = WRAP
    ws0.column_dimensions["A"].width = 16
    ws0.column_dimensions["B"].width = 90

    ws1 = wb.create_sheet("指标明细")
    write_sheet(ws1, METRIC_HEADERS, metrics, [14, 14, 22, 18, 42, 28, 8, 55, 18, 40])

    ws2 = wb.create_sheet("阅读约定")
    write_sheet(ws2, ["分类", "项", "说明"], conventions, [16, 22, 80])

    ws3 = wb.create_sheet("跨端差异")
    write_sheet(
        ws3,
        ["指标名", "V8客户管理端", "审核上报PC", "审核上报H5", "说明"],
        cross,
        [16, 36, 36, 36, 36],
    )

    ws4 = wb.create_sheet("指标词典")
    write_sheet(
        ws4,
        ["指标ID", "名称", "建议公式（后端统一）", "原型差异"],
        dictionary,
        [22, 18, 55, 45],
    )

    ws5 = wb.create_sheet("页面索引")
    write_sheet(ws5, ["端", "模块", "路由/入口", "主文件"], pages, [16, 20, 28, 42])

    ws6 = wb.create_sheet("待产品确认")
    write_sheet(ws6, ["议题", "现状（代码）", "需产品拍板"], pending, [22, 50, 50])

    wb.save(OUT)
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()
