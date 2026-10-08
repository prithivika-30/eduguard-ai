import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingDown,
  TrendingUp,
  PieChart as PieIcon,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileCheck2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { api } from '../services/api';

export const AnalyticsPage: React.FC = () => {
  const [stageData, setStageData] = useState<any[]>([]);
  const [attData, setAttData] = useState<any[]>([]);
  const [perfData, setPerfData] = useState<any[]>([]);
  const [effectiveness, setEffectiveness] = useState<any | null>(null);
  const [qualitySummary, setQualitySummary] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const [stRes, attRes, perfRes, effRes, qualRes] = await Promise.all([
        api.getStageComparison(),
        api.getAttendanceVsRisk(),
        api.getPerformanceVsRisk(),
        api.getInterventionEffectiveness(),
        api.getDataQualitySummary(),
      ]);
      setStageData(stRes);
      setAttData(attRes);
      setPerfData(perfRes);
      setEffectiveness(effRes);
      setQualitySummary(qualRes);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <BarChart3 size={20} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Institutional Cohort Analytics
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Cross-cohort comparisons, correlation bands, and intervention efficacy metrics.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-colors self-start sm:self-auto"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Top Efficacy Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between shadow-lg">
          <span className="text-xs text-slate-400 font-medium">Intervention Improvement Rate</span>
          <div className="my-2 flex items-center gap-2">
            <TrendingDown size={28} className="text-emerald-400" />
            <div className="text-3xl font-extrabold text-white">
              {effectiveness?.improvement_rate_pct || 0}%
            </div>
          </div>
          <span className="text-[11px] text-emerald-400">
            Follow-ups showing documented risk reduction
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between shadow-lg">
          <span className="text-xs text-slate-400 font-medium">Overall Data Completeness</span>
          <div className="my-2 flex items-center gap-2">
            <FileCheck2 size={28} className="text-cyan-400" />
            <div className="text-3xl font-extrabold text-white">
              {qualitySummary?.data_completeness_pct || 100}%
            </div>
          </div>
          <span className="text-[11px] text-cyan-400">
            Status: {qualitySummary?.overall_status || 'Good'} • 0 missing critical fields
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between shadow-lg">
          <span className="text-xs text-slate-400 font-medium">Monitored Cohort Scale</span>
          <div className="my-2 flex items-center gap-2">
            <Layers size={28} className="text-indigo-400" />
            <div className="text-3xl font-extrabold text-white">
              {qualitySummary?.total_registered_students || 0}
            </div>
          </div>
          <span className="text-[11px] text-slate-400">
            {qualitySummary?.metrics_checkpoints_recorded || 0} total checkpoint assessments
          </span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stage Comparison Chart */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-100 text-sm">Risk by Educational Stage</h3>
              <p className="text-xs text-slate-400">Distribution across School, Higher Secondary, & Undergraduate</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="stage" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="high_risk" name="High Risk" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="medium_risk" name="Medium Risk" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="low_risk" name="Low Risk" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance vs Risk Brackets */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-100 text-sm">Attendance vs Risk Correlation</h3>
              <p className="text-xs text-slate-400">Student count in risk tiers across attendance bands</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="bracket" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="high_risk" name="High Risk" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="medium_risk" name="Medium Risk" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="low_risk" name="Low Risk" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Academic Performance vs Risk Brackets */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-100 text-sm">Coursework Grade vs Risk</h3>
              <p className="text-xs text-slate-400">Correlation between GPA grade brackets and predicted vulnerability</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perfData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="band" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="high_risk" name="High Risk" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="medium_risk" name="Medium Risk" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="low_risk" name="Low Risk" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Intervention Outcomes Distribution */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-100 text-sm">Follow-up Outcome Distribution</h3>
              <p className="text-xs text-slate-400">Documented post-intervention risk changes</p>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {effectiveness?.outcomes && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={effectiveness.outcomes}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="outcome"
                  >
                    {effectiveness.outcomes.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
