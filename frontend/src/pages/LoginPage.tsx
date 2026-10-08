import React, { useState } from 'react';
import {
  Shield,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Sparkles,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import { useAuth, DEMO_CREDENTIALS } from '../context/AuthContext';
import { UserRole } from '../types';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { login, quickLoginAs, isLoading } = useAuth();
  const [email, setEmail] = useState('admin@eduguard.edu');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate');
    }
  };

  const handleQuickLogin = async (role: UserRole) => {
    setError(null);
    try {
      await quickLoginAs(role);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Quick login failed');
    }
  };

  return (
    <div className="flex-1 bg-slate-950 flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left column: Role Quick-Login for Judges */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Shield size={18} />
            </div>
            <span className="font-bold text-lg text-white">EduGuard AI</span>
          </div>

          <h2 className="text-2xl font-bold text-white tracking-tight">
            Role-Based Access
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Select a demo role below to test role-specific views, permission boundaries, and audit logging.
          </p>

          <div className="space-y-2.5 pt-2">
            {(['admin', 'educator', 'counsellor', 'viewer'] as UserRole[]).map((r) => {
              const creds = DEMO_CREDENTIALS[r];
              return (
                <div
                  key={r}
                  onClick={() => handleQuickLogin(r)}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/80 hover:bg-slate-800/60 transition-all cursor-pointer group flex items-start justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
                        {creds.title}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {r}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{creds.desc}</p>
                    <div className="text-[10px] font-mono text-slate-400 mt-1">
                      {creds.email}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="shrink-0 p-1.5 rounded-lg bg-slate-800 group-hover:bg-indigo-600 text-slate-400 group-hover:text-white transition-all ml-2"
                  >
                    <ArrowRight size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Interactive Form */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white">Institutional Sign In</h3>
            <p className="text-xs text-slate-400">
              Sign in with institutional credentials to access your dashboard.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@eduguard.edu"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={15} />
                  <span>Authenticate & Open Dashboard</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <p className="text-[11px] text-slate-400">
              Demo dataset loaded with synthetic records. Not real student personally identifiable information (PII).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
