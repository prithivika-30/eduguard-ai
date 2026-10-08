import React, { useState } from 'react';
import {
  Shield,
  Compass,
  Bell,
  LogOut,
  ChevronDown,
  UserCheck,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { useAuth, DEMO_CREDENTIALS } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface NavbarProps {
  onOpenTour: () => void;
  onNavigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenTour, onNavigate }) => {
  const { user, role, logout, quickLoginAs } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, title: 'High-Risk Identified', text: 'STU-2026-101 (Aiden Cruz) reached 84.2% dropout risk estimate', time: '10m ago', unread: true },
    { id: 2, title: 'Follow-up Due Today', text: 'Peer Tutoring check-in scheduled for Aiden Cruz', time: '1h ago', unread: true },
    { id: 3, title: 'Model Active', text: 'Gradient Boosting ensemble trained with 0.892 ROC-AUC', time: '2h ago', unread: false },
  ];

  return (
    <header className="h-16 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div
          onClick={() => onNavigate('/')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Shield size={20} className="stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base md:text-lg tracking-tight text-white">
                EduGuard
              </span>
              <span className="text-xs font-semibold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                AI
              </span>
            </div>
            <p className="hidden md:block text-[10px] text-slate-400 font-medium">
              Early Warning & Intervention
            </p>
          </div>
        </div>
      </div>

      {/* Center Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        <button
          onClick={onOpenTour}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/40 text-indigo-300 hover:text-white hover:border-indigo-400 text-xs font-medium transition-all shadow-sm"
        >
          <Compass size={14} className="text-indigo-400 animate-spin-slow" />
          <span className="hidden sm:inline">Demo Walkthrough</span>
          <span className="sm:hidden">Tour</span>
        </button>

        {/* Quick Role Switcher for Hackathon Judges */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-200 transition-colors"
          >
            <UserCheck size={13} className="text-cyan-400" />
            <span className="capitalize font-medium">
              Role: <strong className="text-white">{role || 'Viewer'}</strong>
            </span>
            <ChevronDown size={13} className="text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 animate-fade-in">
              <div className="px-2 py-1.5 border-b border-slate-800 mb-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Switch Role Persona
                </span>
                <p className="text-[11px] text-slate-400">
                  Switch RBAC view instantly to test role-based permissions.
                </p>
              </div>
              {(['admin', 'educator', 'counsellor', 'viewer'] as UserRole[]).map((r) => {
                const creds = DEMO_CREDENTIALS[r];
                const isActive = role === r;
                return (
                  <button
                    key={r}
                    onClick={() => {
                      quickLoginAs(r);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-start justify-between ${
                      isActive
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-100 capitalize">{creds.title}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">{creds.desc}</div>
                    </div>
                    {isActive && <span className="text-[10px] text-indigo-400 font-bold">Active</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors relative"
          >
            <Bell size={17} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-900" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <span className="text-xs font-semibold text-slate-200">Alerts & Notifications</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800">
                  2 New
                </span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2 rounded-lg text-xs border ${
                      n.unread
                        ? 'bg-slate-800/60 border-slate-700/80'
                        : 'bg-slate-950/40 border-slate-800/40 opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-slate-200">{n.title}</span>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Info / Logout */}
        {user ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="hidden lg:block text-right">
              <div className="text-xs font-semibold text-slate-200 leading-tight">
                {user.full_name}
              </div>
              <div className="text-[10px] text-slate-400 leading-tight">
                {user.email}
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onNavigate('/login')}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};
