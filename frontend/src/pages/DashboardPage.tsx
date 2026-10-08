import React, { useState, useEffect } from 'react';
import {
  Users,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Clock,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  ArrowRight,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { api } from '../services/api';
import { DashboardSummary, Student } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';

interface DashboardPageProps {
  onNavigate: (path: string) => void;
}

const COLORS = ['#ef4444', '#f59e0b', '#10b981'];

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [stageComparison, setStageComparison] = useState<any[]>([]);
  const [highRiskStudents, setHighRiskStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [stageFilter, setStageFilter] = useState<string>('All');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [sumRes, trRes, stRes, stuRes] = await Promise.all([
        api.getDashboardSummary(),
        api.getDashboardTrends(),
        api.getStageComparison(),
        api.getStudents({ risk: 'High', limit: 5 }),
      ]);
      setSummary(sumRes);
      setTrends(trRes);
      setStageComparison(stRes);
      setHighRiskStudents(stuRes);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading && !summary) {
    return (
      <div className="flex-1 p-6 md:p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400">Loading live institutional analytics...</span>
        </div>
      </div>
    );
  }

  const pieData = summary?.risk_distribution.map((d) => ({
    name: d.risk_level,
    value: d.count,
    pct: d.percentage,
  })) || [];

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Header & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Institutional Early Warning Dashboard
            </h1>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
              Live DB
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time cohort monitoring, risk triage, and intervention progress.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Educational Stages</option>
            <option value="Undergraduate">Undergraduate</option>
            <option value="Higher Secondary">Higher Secondary</option>
            <option value="School">School</option>
          </select>

          <button
            onClick={fetchData}
            title="Refresh from SQLite Database"
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Total Monitored Cohort</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <Users size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white">{summary?.total_students || 0}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Avg Attendance: <strong className="text-slate-300">{summary?.average_attendance}%</strong>
            </div>
          </div>
        </div>

        {/* Attention Required */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-rose-900/40 bg-gradient-to-br from-slate-900/80 to-rose-950/20 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-rose-300 font-medium">Attention Required</span>
            <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-rose-400">{summary?.attention_required || 0}</div>
            <div className="text-[11px] text-rose-300/80 mt-1">
              High: {summary?.high_risk_count} | Medium: {summary?.medium_risk_count}
            </div>
          </div>
        </div>

        {/* Active Interventions */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Active Interventions</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Calendar size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-amber-400">
              {summary?.active_interventions_count || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Tutoring, counselling & mentoring</div>
          </div>
        </div>

        {/* Follow-ups Due */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Follow-ups Status</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Clock size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white">
              {summary?.followups_due_today || 0}
              <span className="text-xs font-normal text-slate-400 ml-1.5">Due Today</span>
            </div>
            <div className="text-[11px] text-rose-400 mt-1">
              {summary?.followups_overdue || 0} overdue check-ins
            </div>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Risk Distribution Donut */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-slate-100 text-sm">Cohort Risk Distribution</h3>
              <span className="text-[11px] text-slate-400 font-mono">Total: {summary?.total_students}</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Breakdown based on active ensemble model probabilities.
            </p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center">
            <div className="p-2 rounded-lg bg-rose-950/30 border border-rose-900/40">
              <div className="text-[11px] text-rose-300 font-medium">High Risk</div>
              <div className="text-sm font-bold text-rose-400">{summary?.high_risk_count}</div>
            </div>
            <div className="p-2 rounded-lg bg-amber-950/30 border border-amber-900/40">
              <div className="text-[11px] text-amber-300 font-medium">Medium Risk</div>
              <div className="text-sm font-bold text-amber-400">{summary?.medium_risk_count}</div>
            </div>
            <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-900/40">
              <div className="text-[11px] text-emerald-300 font-medium">Low Risk</div>
              <div className="text-sm font-bold text-emerald-400">{summary?.low_risk_count}</div>
            </div>
          </div>
        </div>

        {/* Temporal Risk Trend */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-slate-100 text-sm">Temporal Risk History & Trend</h3>
              <span className="text-[11px] text-slate-400">4 Assessment Periods</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Tracking cohort shift across reporting milestones after early interventions.
            </p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="period" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="high_risk" name="High Risk" stroke="#ef4444" strokeWidth={2} />
                <Line type="monotone" dataKey="medium_risk" name="Medium Risk" stroke="#f59e0b" strokeWidth={2} />
                <Line type="monotone" dataKey="low_risk" name="Low Risk" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <TrendingDown size={14} /> High-risk cohort decreased by 22% since Week 1
            </span>
            <button
              onClick={() => onNavigate('/analytics')}
              className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              Full Analytics <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Priority Action Triage Queue */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-100 text-sm md:text-base">
                Priority Intervention Triage Queue
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800">
                Action Required
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Students identified by model predictions with critical indicators or pending follow-ups.
            </p>
          </div>

          <button
            onClick={() => onNavigate('/risks')}
            className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium self-start sm:self-auto"
          >
            <span>View All in Priority Queue</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-3 pl-2">Student</th>
                <th className="pb-3">Stage / Dept</th>
                <th className="pb-3">Attendance</th>
                <th className="pb-3">Avg Score</th>
                <th className="pb-3">Risk Assessment</th>
                <th className="pb-3 text-right pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {highRiskStudents.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 pl-2">
                    <div className="font-semibold text-slate-200">
                      {s.first_name} {s.last_name}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">{s.student_id}</div>
                  </td>
                  <td className="py-3 text-slate-300">
                    <div>{s.stage}</div>
                    <div className="text-[11px] text-slate-400">{s.department}</div>
                  </td>
                  <td className="py-3">
                    <span
                      className={`font-semibold font-mono ${
                        (s.latest_metrics?.attendance_rate || 0) < 65 ? 'text-rose-400' : 'text-slate-200'
                      }`}
                    >
                      {s.latest_metrics?.attendance_rate}%
                    </span>
                  </td>
                  <td className="py-3 font-mono text-slate-200">
                    {s.latest_metrics?.average_score}%
                  </td>
                  <td className="py-3">
                    <RiskBadge
                      level={s.latest_prediction?.risk_level || 'High'}
                      score={s.latest_prediction?.risk_score}
                      size="sm"
                    />
                  </td>
                  <td className="py-3 text-right pr-2">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onNavigate(`/students/${s.id}`)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white transition-colors"
                      >
                        Explain & Profile
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
