export type TerminalId = 'v8-client' | 'v8-audit-h5' | 'v8-audit-pc' | 'mt-app';

export type Environment = 'prod' | 'staging' | 'test';

export type UserRole = 'superadmin' | 'auditor' | 'account_manager' | 'ops_director' | 'field_agent';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  roleName: string;
  department: string;
  avatar: string;
  allowedTerminals: TerminalId[];
}

export interface TerminalSubLink {
  id: string;
  title: string;
  description: string;
  iconName: string;
  badge?: string;
}

export interface TerminalItem {
  id: TerminalId;
  code: string;
  title: string;
  englishTitle: string;
  terminalType: 'Web管理台' | '移动端H5' | 'PC特化工作台' | '底层运维台';
  platformIcon: 'monitor' | 'smartphone' | 'layout-grid' | 'server';
  badgeColor: string;
  accentColor: string;
  borderColor: string;
  glowColor: string;
  version: string;
  releaseDate: string;
  description: string;
  targetAudience: string;
  permissionLevel: string;
  status: 'operational' | 'busy' | 'updating';
  statusText: string;
  metrics: {
    todayThroughput: string;
    avgLatency: string;
    onlineUsers: number;
    healthRate: string;
  };
  features: {
    title: string;
    desc: string;
  }[];
  quickLinks: TerminalSubLink[];
  docsUrl?: string;
  h5Url?: string;
}

export interface SystemBroadcast {
  id: string;
  level: 'info' | 'warning' | 'success';
  title: string;
  time: string;
  content: string;
  targetTerminal?: TerminalId | 'all';
}
