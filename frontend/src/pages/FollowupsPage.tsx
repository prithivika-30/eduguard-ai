import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Minus,
  Edit,
  X,
  ExternalLink,
} from 'lucide-react';
import { api } from '../services/api';
import { Followup } from '../types';

interface FollowupsPageProps {
  onNavigate: (path: string) => void;
}

export const FollowupsPage: React.FC<FollowupsPageProps> = ({ onNavigate }) => {
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusTab, setStatusTab] = useState<string>('All');

  // Outcome Modal State
  const [activeFollowup, setActiveFollowup] = useState<Followup | null>(null);
  const [outcomeNotes, setOutcomeNotes] = useState<string>('');
  const [riskChange, setRiskChange] = useState<'Improved' | 'No Change' | 'Worsened'>('Improved');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchFollowups = async () => {
    setIsLoading(true);
    try {
      const data = await api.getFollowups({
        status: statusTab !== 'All' ? statusTab : '',
      });
      setFollowups(data);
    } catch (err) {
      console.error('Failed to load followups', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowups();
  }, [statusTab]);

  const handleOpenOutcomeModal = (f: Followup) => {
    setActiveFollowup(f);
    setOutcomeNotes(f.outcome_notes || '');
    setRiskChange(f.risk_change_observed || 'Improved');
  };

  const handleSaveOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFollowup) return;
    setIsSubmitting(true);
    try {
      await api.updateFollowup(activeFollowup.id, {
        status: 'Completed',
        outcome_notes: outcomeNotes,
        risk_change_observed: riskChange,
      });
      setActiveFollowup(null);
      fetchFollowups();
    } catch (err) {
      console.error('Failed to update followup outcome', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CalendarCheck size={20} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Intervention Follow-up & Outcome Tracking
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Record scheduled check-ins, assess qualitative responses, and document observed risk shifts.
          </p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {['All', 'Due Today', 'Overdue', 'Upcoming', 'Completed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusTab(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              statusTab === tab
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Followups List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading follow-up checkpoints...
          </div>
        ) : followups.length === 0 ? (
          <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
            No follow-up check-ins match the selected status filter.
          </div>
        ) : (
          followups.map((f) => {
            const isCompleted = f.status === 'Completed';
            const isDueToday = f.status === 'Due Today';
            const isOverdue = f.status === 'Overdue';

            return (
              <div
                key={f.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                        isCompleted
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : isDueToday
                          ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                          : isOverdue
                          ? 'bg-rose-950 text-rose-300 border-rose-800'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {f.status}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Scheduled: {f.scheduled_date}
                    </span>
                    <span className="text-xs font-bold text-slate-100">
                      {f.student_name} ({f.student_code})
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 font-medium">
                    Intervention: <span className="text-slate-200">{f.intervention_title || 'General Check-in'}</span>
                  </div>

                  {f.outcome_notes && (
                    <p className="text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60 leading-relaxed">
                      <strong>Recorded Outcome: </strong>
                      {f.outcome_notes}
                    </p>
                  )}

                  {f.risk_change_observed && (
                    <div className="flex items-center gap-2 text-xs pt-0.5">
                      <span className="text-slate-400 text-[11px]">Observed Risk Trajectory:</span>
                      <span
                        className={`font-semibold inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border ${
                          f.risk_change_observed === 'Improved'
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                            : f.risk_change_observed === 'Worsened'
                            ? 'bg-rose-950 text-rose-400 border-rose-800'
                            : 'bg-amber-950 text-amber-400 border-amber-800'
                        }`}
                      >
                        {f.risk_change_observed === 'Improved' && <TrendingDown size={12} />}
                        {f.risk_change_observed === 'Worsened' && <TrendingUp size={12} />}
                        {f.risk_change_observed === 'No Change' && <Minus size={12} />}
                        <span>{f.risk_change_observed}</span>
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenOutcomeModal(f)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white text-xs font-medium transition-colors"
                  >
                    <Edit size={13} />
                    <span>{isCompleted ? 'Edit Outcome' : 'Log Outcome'}</span>
                  </button>

                  <button
                    onClick={() => onNavigate(`/students/${f.student_id}`)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs transition-colors"
                    title="Open Student Profile"
                  >
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Log Outcome Modal */}
      {activeFollowup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">
                  Record Follow-up Outcome & Risk Shift
                </h3>
                <p className="text-xs text-slate-400">
                  {activeFollowup.student_name} ({activeFollowup.student_code})
                </p>
              </div>
              <button
                onClick={() => setActiveFollowup(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveOutcome} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">
                  Observed Trajectory / Risk Change *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Improved', label: 'Improved', color: 'emerald' },
                    { id: 'No Change', label: 'No Change', color: 'amber' },
                    { id: 'Worsened', label: 'Worsened', color: 'rose' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setRiskChange(opt.id as any)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        riskChange === opt.id
                          ? opt.id === 'Improved'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-700 font-bold'
                            : opt.id === 'Worsened'
                            ? 'bg-rose-950 text-rose-300 border-rose-700 font-bold'
                            : 'bg-amber-950 text-amber-300 border-amber-700 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">
                  Qualitative Outcome Notes & Recommendations *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Record summary of discussion with student, attendance verification, homework check, or next steps..."
                  value={outcomeNotes}
                  onChange={(e) => setOutcomeNotes(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveFollowup(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-lg"
                >
                  Save Outcome Checkpoint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
