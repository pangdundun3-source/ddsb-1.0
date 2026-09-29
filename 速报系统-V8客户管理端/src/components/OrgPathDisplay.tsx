import React from 'react';

const ORGANIZATION_PATHS: Record<string, string[]> = {
  台中市网信办: ['广域传媒主机构', '台中市网信办', '舆情监测中心'],
  市委网信办: ['广域传媒主机构', '市委网信办', '审核督导组'],
  市委宣传部舆情科: ['广域传媒主机构', '市委宣传部', '舆情科'],
  高新区管委会: ['广域传媒主机构', '高新区管委会', '政务服务中心'],
  高新区管委会党群工作部: ['广域传媒主机构', '高新区管委会', '党群工作部'],
  市卫健委: ['广域传媒主机构', '市卫健委', '医政宣传处'],
  西屯区环保局: ['广域传媒主机构', '西屯区政府', '生态环境分局'],
  市政务服务局: ['广域传媒主机构', '市政务服务局', '热线运行中心'],
  市市场监管局: ['广域传媒主机构', '市市场监管局', '网络监管处'],
  市教育局: ['广域传媒主机构', '市教育局', '校园安全科'],
  市文旅局: ['广域传媒主机构', '市文旅局', '宣传推广处'],
  西屯区教育局: ['广域传媒主机构', '西屯区政府', '区教育局'],
  市公安交警支队: ['广域传媒主机构', '市公安局', '交警支队'],
  北屯区住建局: ['广域传媒主机构', '北屯区政府', '区住建局'],
  台中市交通局: ['广域传媒主机构', '台中市交通局', '运输协调处'],
  台中市消防支队: ['广域传媒主机构', '台中市消防支队', '防火监督科'],
  台中市文化局: ['广域传媒主机构', '台中市文化局', '公共服务科'],
  台中市住建局: ['广域传媒主机构', '台中市住建局', '城市更新科'],
  台中市食药监: ['广域传媒主机构', '台中市食药监', '食品监管处'],
  台中市发改委: ['广域传媒主机构', '台中市发改委', '数字经济处'],
  台中市教育局: ['广域传媒主机构', '台中市教育局', '校园安全科'],
  台中市房管局: ['广域传媒主机构', '台中市房管局', '物业监管科']
};

const inferTeamName = (organization: string) => {
  if (organization.includes('教育')) return '校园舆情联络组';
  if (organization.includes('网信')) return '舆情监测中心';
  if (organization.includes('宣传')) return '融媒联络组';
  if (organization.includes('市场') || organization.includes('食药')) return '市场秩序监管组';
  if (organization.includes('公安') || organization.includes('交警')) return '交通秩序联络组';
  if (organization.includes('住建') || organization.includes('房管')) return '城市建设联络组';
  if (organization.includes('文旅') || organization.includes('文化')) return '文旅宣传联络组';
  return '综合联络组';
};

export const getOrganizationPath = (organization?: string, fallback = '未配置机构') => {
  const value = (organization || fallback).trim();
  if (!value) return [fallback];
  if (ORGANIZATION_PATHS[value]) return ORGANIZATION_PATHS[value];
  if (/[/>＞／]/.test(value)) {
    return value.split(/\s*[/>＞／]\s*/).filter(Boolean);
  }
  return ['广域传媒主机构', value, inferTeamName(value)];
};

export const getOrganizationPathText = (organization?: string, fallback?: string) =>
  getOrganizationPath(organization, fallback).join(' / ');

interface OrgPathDisplayProps {
  organization?: string;
  fallback?: string;
  compact?: boolean;
  className?: string;
}

export const OrgPathDisplay: React.FC<OrgPathDisplayProps> = ({
  organization,
  fallback,
  compact = false,
  className = ''
}) => {
  const path = getOrganizationPath(organization, fallback);
  const fullPath = path.join(' / ');
  const parentPath = path.slice(0, -1).join(' / ');
  const leaf = path[path.length - 1];

  if (compact) {
    return (
      <span className={`block truncate text-[10px] text-gray-400 ${className}`} title={fullPath}>
        {fullPath}
      </span>
    );
  }

  return (
    <div className={`mt-0.5 max-w-full leading-snug ${className}`} title={fullPath}>
      {parentPath && (
        <div className="truncate text-[10px] text-gray-400">
          {parentPath}
        </div>
      )}
      <div className="truncate text-[11px] font-medium text-gray-500">
        {leaf}
      </div>
    </div>
  );
};
