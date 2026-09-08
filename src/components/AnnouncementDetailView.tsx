import React from 'react';
import { AppNotification } from '../types';
import { BackNavigationBar } from './BackNavigationBar';
import {
  Megaphone,
  Building2,
} from 'lucide-react';

interface AnnouncementDetailViewProps {
  announcement: AppNotification;
  onClose: () => void;
  onToast?: (msg: string) => void;
}

export const AnnouncementDetailView: React.FC<AnnouncementDetailViewProps> = ({
  announcement,
  onClose,
}) => {
  // Rich official announcement contents for realistic government communication
  const getAnnouncementDetails = (id: string) => {
    if (id === 'notif_announcement_001' || announcement.title.includes('即报即审')) {
      return {
        docNo: '网信通〔2026〕08号',
        department: '中共台中市委网络安全和信息化委员会办公室',
        sections: [
          {
            title: '一、 指导思想与工作目标',
            content:
              '为进一步提升全市网络突发事件与民生诉求舆情早发现、早报告、早处置能力，深化新一代“点点速报”微端应用，决定在全市网格化治理体系中全面推行“即报即审”与“同源首发定标”机制。',
          },
          {
            title: '二、 核心工作规范',
            points: [
              '【1小时时限承诺】：基层网格员提交速报后，市委网信办与属地宣传科须在1小时内完成初审与线索核定。',
              '【同源同地址首发标记】：系统自动比对发生地址、发生网格及传播链接，首位上报并核实有效的线索赋予“首发件”标识及积分奖励。',
              '【重复件去重与合并】：后续上报相同事件的件数自动关联归档，避免多头流转与基层重复处置。',
            ],
          },
          {
            title: '三、 纪律与督导考核',
            content:
              '各网格站需加强值班值守，严禁瞒报、迟报、漏报。月度将统计各单位首发率与转办办结率并予以全市政务通报。',
          },
        ],
      };
    }

    if (id === 'notif_announcement_002' || announcement.title.includes('激活')) {
      return {
        docNo: '数治函〔2026〕15号',
        department: '台中市大数据发展管理局 · 城市大脑运营中心',
        sections: [
          {
            title: '一、 专属激活码功能说明',
            content:
              '为保障政务数据安全与实名规范流转，“点点速报”移动端已上线网格员专属激活码核验通道。录入各区下发的8位专属码，系统将自动关联您的所在行政区、所属单位、网格片区及业务角色。',
          },
          {
            title: '二、 操作指引与权限说明',
            points: [
              '进入【我的】->【激活上报信息】或通过专属H5通道录入激活码。',
              '录入成功后即时生效，无需重复填报组织架构与联系方式。',
              '如遇转岗或辖区调整，请联系所属区大数据中心后台重新派发更新码。',
            ],
          },
          {
            title: '三、 技术支持咨询',
            content:
              '激活遇到技术异常或信息不符，请致电政务技术热线：0571-88990123（工作日 08:30-17:30）。',
          },
        ],
      };
    }

    return {
      docNo: '通告〔2026〕通用号',
      department: announcement.publisher || '台中市委网信办',
      sections: [
        {
          title: '公告内容详情',
          content: announcement.content,
        },
      ],
    };
  };

  const detailData = getAnnouncementDetails(announcement.id);

  return (
    <div className="absolute inset-0 z-40 bg-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
      {/* Scrollable Container */}
      <div className="p-3 overflow-y-auto space-y-3 flex-1 text-xs">
        <BackNavigationBar onBack={onClose} label="返回上一级" />

        {/* Header Official Banner */}
        <div className="bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 text-white rounded-2xl p-4 shadow-md space-y-2.5 relative overflow-hidden">
          {/* Subtle Background Pattern */}
          <div className="absolute -right-4 -bottom-4 opacity-10 text-white pointer-events-none">
            <Megaphone className="w-32 h-32" />
          </div>

          <div className="flex items-center justify-between relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-100 border border-blue-400/30 text-[10px] font-bold">
              <Megaphone className="w-3 h-3 text-blue-200" />
              <span>官方公告通知</span>
            </div>
          </div>

          <h1 className="text-sm font-bold leading-snug text-white tracking-wide relative z-10">
            {announcement.title}
          </h1>
        </div>

        {/* Announcement Document Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-4">
          {/* Structured Document Body */}
          <div className="space-y-3.5 text-slate-700 text-xs">
            {detailData.sections.map((sec, idx) => (
              <div key={idx} className="space-y-1.5">
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span>{sec.title}</span>
                </h3>

                {sec.content && (
                  <p className="indent-4 leading-relaxed text-slate-600 text-justify">
                    {sec.content}
                  </p>
                )}

                {sec.points && (
                  <div className="space-y-1 pl-1">
                    {sec.points.map((pt, pIdx) => (
                      <div key={pIdx} className="flex items-start gap-1.5 text-slate-600">
                        <span className="text-blue-600 font-bold shrink-0">•</span>
                        <span className="leading-relaxed">{pt}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Official Issuing Footer */}
          <div className="pt-4 border-t border-slate-100 flex flex-col items-end text-right space-y-1 text-slate-500 font-serif">
            <div className="font-bold text-slate-800 text-[11px]">
              {detailData.department}
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              {announcement.time.slice(0, 10)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
