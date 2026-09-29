import React, { useState } from 'react';
import { Environment, UserProfile, TerminalId } from '../types';
import { USERS_MOCK } from '../data/portalData';
import { 
  Zap, 
  Server, 
  ChevronDown, 
  Search, 
  ArrowLeft, 
  Sparkles, 
  HelpCircle,
  Activity,
  Layers
} from 'lucide-react';

interface PortalHeaderProps {
  currentEnv: Environment;
  onEnvChange: (env: Environment) => void;
  currentUser: UserProfile;
  onUserChange: (user: UserProfile) => void;
  activeTerminalId: TerminalId | null;
  onBackToPortal: () => void;
  onOpenHelp: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const PortalHeader: React.FC<PortalHeaderProps> = ({
  currentEnv,
  onEnvChange,
  currentUser,
  onUserChange,
  activeTerminalId,
  onBackToPortal,
  onOpenHelp,
  searchQuery,
  onSearchChange,
}) => {
  const [showEnvDropdown, setShowEnvDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const envMap: Record<Environment, { label: string; tag: string; color: string }> = {
    prod: { label: '生产环境 (PRD)', tag: '生产', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-300 dark:border-emerald-700' },
    staging: { label: '预发环境 (STG)', tag: '预发', color: 'bg-blue-500/10 text-blue-600 border-blue-300 dark:border-blue-700' },
    test: { label: '仿真测试 (TEST)', tag: '测试', color: 'bg-amber-500/10 text-amber-600 border-amber-300 dark:border-amber-700' },
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left: Brand / Return Breadcrumb */}
          <div className="flex items-center gap-4 shrink-0">
            {activeTerminalId ? (
              <button
                onClick={onBackToPortal}
                className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-medium transition-all shadow-xs border border-slate-200 dark:border-slate-700"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span>返回四端门户</span>
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-md shadow-blue-500/20">
                  <Zap className="w-5 h-5 fill-current" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-bold text-base text-slate-900 dark:text-white tracking-tight">
                      速报协同系统
                    </h1>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                      统一门户
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    FlashReport Unified Matrix Hub · 四端协同互联
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Center: Search & Filter (shown on portal hub) */}
          {!activeTerminalId && (
            <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="搜索端名称、业务功能（如: 客户建档、双屏审核、扫码...）"
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all outline-none"
                />
                {searchQuery && (
                  <button 
                    onClick={() => onSearchChange('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    清除
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Right: Environment, Cluster Health, User Switcher, Guide */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Latency / Service health */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/70 dark:bg-slate-800/50 text-[11px] text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800">
              <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span>集群 18ms</span>
            </div>

            {/* Environment Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowEnvDropdown(!showEnvDropdown)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all ${envMap[currentEnv].color}`}
              >
                <Server className="w-3.5 h-3.5" />
                <span>{envMap[currentEnv].tag}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {showEnvDropdown && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setShowEnvDropdown(false)}
                >
                  <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    切换部署网络集群
                  </div>
                  {(['prod', 'staging', 'test'] as Environment[]).map((env) => (
                    <button
                      key={env}
                      onClick={() => {
                        onEnvChange(env);
                        setShowEnvDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/70 ${
                        currentEnv === env ? 'font-semibold text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{envMap[env].label}</span>
                      {currentEnv === env && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Help / Guide button */}
            <button
              onClick={onOpenHelp}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="四端协同架构与操作指引"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* User Profile Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                />
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight truncate max-w-[90px]">
                    {currentUser.roleName.split(' ')[0]}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserDropdown && (
                <div 
                  className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setShowUserDropdown(false)}
                >
                  <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      当前登录身份与权限
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {currentUser.department}
                    </div>
                  </div>

                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    快速切换模拟角色 (测试各端权限)
                  </div>

                  <div className="space-y-1 px-1.5">
                    {USERS_MOCK.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          onUserChange(u);
                          setShowUserDropdown(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center gap-2.5 transition-colors ${
                          currentUser.id === u.id
                            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-6 h-6 rounded-md object-cover"
                        />
                        <div className="flex-1 truncate">
                          <div className="font-medium text-xs">{u.name}</div>
                          <div className="text-[10px] text-slate-400 truncate">{u.roleName}</div>
                        </div>
                        {currentUser.id === u.id && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-600 text-white">当前</span>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="mt-2 pt-2 px-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>统一单点登录 SSO 保护</span>
                    <span className="flex items-center gap-1 text-emerald-500 font-medium">
                      <Sparkles className="w-3 h-3" /> 已加密
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
