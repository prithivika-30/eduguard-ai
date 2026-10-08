import React from 'react';
import {
  LayoutDashboard,
  AlertTriangle,
  Users,
  SlidersHorizontal,
  ClipboardList,
  CalendarCheck,
  BarChart3,
  Database,
  Cpu,
  FileSpreadsheet,
  Settings,
  HelpCircle,
  Home,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate }) => {
  const { role } = useAuth();

  const navItems = [
    { name: 'Home / Hero', path: '/', icon: Home, roles: ['admin', 'educator', 'counsellor', 'viewer'] },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'educator', 'counsellor', 'viewer'] },
    { name: 'Priority Risk Queue', path: '/risks', icon: AlertTriangle, roles: ['admin', 'educator', 'counsellor'] },
    { name: 'Students Roster', path: '/students', icon: Users, roles: ['admin', 'educator', 'counsellor', 'viewer'] },
    { name: 'What-If Simulator', path: '/what-if', icon: SlidersHorizontal, roles: ['admin', 'educator', 'counsellor'] },
    { name: 'Interventions', path: '/interventions', icon: ClipboardList, roles: ['admin', 'educator', 'counsellor'] },
    { name: 'Follow-ups Due', path: '/follow-up', icon: CalendarCheck, roles: ['admin', 'educator', 'counsellor'] },
    { name: 'Cohort Analytics', path: '/analytics', icon: BarChart3, roles: ['admin', 'educator', 'counsellor', 'viewer'] },
    { name: 'Data Validation', path: '/data', icon: Database, roles: ['admin', 'educator'] },
    { name: 'ML Models & XAI', path: '/models', icon: Cpu, roles: ['admin'] },
    { name: 'Reports & Export', path: '/reports', icon: FileSpreadsheet, roles: ['admin', 'educator', 'counsellor', 'viewer'] },
    { name: 'Settings & Audits', path: '/settings', icon: Settings, roles: ['admin'] },
    { name: 'Responsible AI & Help', path: '/help', icon: HelpCircle, roles: ['admin', 'educator', 'counsellor', 'viewer'] },
  ];

  return (
    <aside className="w-64 bg-slate-950/90 border-r border-slate-800/80 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 flex-1 space-y-1 overflow-y-auto">
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
          Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
          const isAllowed = role ? item.roles.includes(role) : true;

          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              disabled={!isAllowed}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : isAllowed
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                  : 'text-slate-600 opacity-40 cursor-not-allowed border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  size={16}
                  className={isActive ? 'text-indigo-400' : isAllowed ? 'text-slate-400' : 'text-slate-600'}
                />
                <span>{item.name}</span>
              </div>

              {!isAllowed && (
                <span className="text-[9px] px-1 py-0.2 rounded bg-slate-900 text-slate-500 border border-slate-800">
                  Restricted
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Ethical AI banner at footer of sidebar */}
      <div className="p-3.5 m-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
        <div className="font-semibold text-slate-300 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Responsible AI Notice
        </div>
        <p className="text-[10px] leading-relaxed text-slate-400">
          Predictions are decision-support signals only. Never used to penalize students.
        </p>
      </div>
    </aside>
  );
};
