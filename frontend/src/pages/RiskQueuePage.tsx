import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Clock,
  ArrowRight,
  Plus,
  Filter,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { Student } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';

interface RiskQueuePageProps {
  onNavigate: (path: string) => void;
}

export const RiskQueuePage: React.FC<RiskQueuePageProps> = ({ onNavigate }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [stageFilter, setStageFilter] = useState<string>('All');

  const fetchQueue = async () => {
    setIsLoading(true);
    try {
      const data = await api.getStudents({
        risk: 'High',
        stage: stageFilter,
        sort_by: 'risk_score',
        sort_order: 'desc',
      });
      setStudents(data);
    } catch (err) {
      console.error('Failed to load risk queue', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [stageFilter]);

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
              <AlertTriangle size={20} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              High-Risk Priority Intervention Queue
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Triage list prioritized by model risk probability, low attendance rates, and overdue check-ins.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Stages</option>
            <option value="Undergraduate">Undergraduate</option>
            <option value="Higher Secondary">Higher Secondary</option>
            <option value="School">School</option>
          </select>
        </div>
      </div>

      {/* Queue Cards */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading prioritized queue...
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
            No high-risk students currently require urgent intervention in the selected cohort.
          </div>
        ) : (
          students.map((s, idx) => {
            const m = s.latest_metrics;
            const p = s.latest_prediction;
            const topFactor = p?.contributing_factors?.[0];

            return (
              <div
                key={s.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-rose-900/60 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg group"
              >
                {/* Student Info */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-rose-950 text-rose-400 text-[11px] font-bold flex items-center justify-center border border-rose-800">
                      #{idx + 1}
                    </span>
                    <h3 className="font-bold text-slate-100 text-sm group-hover:text-rose-300 transition-colors">
                      {s.first_name} {s.last_name}
                    </h3>
                    <span className="text-xs font-mono px-2 py-0.2 rounded bg-slate-800 text-slate-300">
                      {s.student_id}
                    </span>
                    <span className="text-xs px-2 py-0.2 rounded bg-slate-800 text-slate-400">
                      {s.stage} • {s.department}
                    </span>
                  </div>

                  {/* Primary Warning Factor */}
                  {topFactor && (
                    <div className="flex items-center gap-2 text-xs text-slate-300 pt-1">
                      <span className="text-[11px] font-medium text-rose-400">Top Factor:</span>
                      <span className="text-slate-400">{topFactor.description}</span>
                    </div>
                  )}

                  {/* Indicators Quick Bar */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1 font-mono">
                    <span>Attendance: <strong className="text-rose-400">{m?.attendance_rate}%</strong></span>
                    <span>Avg Grade: <strong className="text-slate-200">{m?.average_score}%</strong></span>
                    <span>Exam: <strong className="text-slate-200">{m?.recent_exam_score}%</strong></span>
                    <span>LMS: <strong className="text-slate-200">{m?.engagement_score}/100</strong></span>
                    <span>Backlogs: <strong className="text-rose-400">{m?.previous_failures}</strong></span>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                  <RiskBadge
                    level={p?.risk_level || 'High'}
                    score={p?.risk_score}
                    size="md"
                  />

                  <button
                    onClick={() => onNavigate(`/students/${s.id}`)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white text-xs font-medium transition-colors"
                  >
                    <span>Triage Profile</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
