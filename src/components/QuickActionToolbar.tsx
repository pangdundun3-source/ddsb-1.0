import React from 'react';
import { TerminalId } from '../types';
import { Layers, Monitor, Smartphone, LayoutGrid, Server, Sparkles, SlidersHorizontal } from 'lucide-react';

interface QuickActionToolbarProps {
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
  totalTerminals: number;
  filteredCount: number;
}

export const QuickActionToolbar: React.FC<QuickActionToolbarProps> = ({
  activeCategory,
  onCategoryChange,
  totalTerminals,
  filteredCount,
}) => {
  const categories = [
    { id: 'all', label: '全部端入口', count: totalTerminals, icon: Layers },
    { id: 'business', label: '客户与商务运营', count: 1, icon: Monitor },
    { id: 'field', label: '现场移动作业', count: 1, icon: Smartphone },
    { id: 'audit', label: '集中风控审核', count: 1, icon: LayoutGrid },
    { id: 'ops', label: '底层系统运维', count: 1, icon: Server },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 shrink-0 transition-all border ${
                isActive
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs font-semibold'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                isActive 
                  ? 'bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-900' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 shrink-0">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>支持四端无缝单点登录 SSO 协同</span>
        </span>
      </div>
    </div>
  );
};
