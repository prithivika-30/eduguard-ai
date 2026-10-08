import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Shield,
  Sliders,
  History,
  Save,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { api } from '../services/api';
import { InstitutionSettings, AuditLog } from '../types';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user, role } = useAuth();
  const isAdmin = role === 'admin';

  const [settings, setSettings] = useState<InstitutionSettings | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Form states
  const [instName, setInstName] = useState<string>('');
  const [term, setTerm] = useState<string>('');
  const [highThreshold, setHighThreshold] = useState<number>(0.70);
  const [medThreshold, setMedThreshold] = useState<number>(0.40);
  const [retentionDays, setRetentionDays] = useState<number>(365);

  const fetchSettingsAndAudits = async () => {
    setIsLoading(true);
    try {
      const s = await api.getSettings();
      setSettings(s);
      setInstName(s.institution_name);
      setTerm(s.academic_term);
      setHighThreshold(s.high_risk_threshold);
      setMedThreshold(s.medium_risk_threshold);
      setRetentionDays(s.data_retention_days);

      if (isAdmin) {
        const logs = await api.getAuditLogs();
        setAuditLogs(logs);
      }
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsAndAudits();
  }, [isAdmin]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(null);
    try {
      const updated = await api.updateSettings({
        institution_name: instName,
        academic_term: term,
        high_risk_threshold: highThreshold,
        medium_risk_threshold: medThreshold,
        data_retention_days: retentionDays,
      });
      setSettings(updated);
      setSaveSuccess('Institution settings and risk thresholds saved successfully.');
      if (isAdmin) {
        const logs = await api.getAuditLogs();
        setAuditLogs(logs);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update settings');
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <SettingsIcon size={20} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Institutional Settings & Governance
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Configure risk decision thresholds, institution metadata, and review administrative audit logs.
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>{saveSuccess}</span>
          </div>
          <button onClick={() => setSaveSuccess(null)} className="text-emerald-400 hover:text-white">
            Dismiss
          </button>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
        <div>
          <h3 className="font-semibold text-slate-100 text-sm mb-1">
            Institutional Configuration
          </h3>
          <p className="text-xs text-slate-400">
            Metadata associated with reporting cohorts and academic calendar.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 mb-1">Institution Name</label>
            <input
              disabled={!isAdmin}
              value={instName}
              onChange={(e) => setInstName(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Active Academic Term</label>
            <input
              disabled={!isAdmin}
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Configurable Risk Thresholds */}
        <div className="pt-4 border-t border-slate-800 space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <Sliders size={16} className="text-cyan-400" />
              <h3 className="font-semibold text-slate-100 text-sm">
                Configurable Risk Probability Thresholds
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              "Risk thresholds are configurable and require institutional validation."
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-slate-200">High Risk Cutoff Threshold</span>
                <span className="font-mono font-bold text-rose-400 text-sm">
                  {(highThreshold * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0.50"
                max="0.90"
                step="0.01"
                disabled={!isAdmin}
                value={highThreshold}
                onChange={(e) => setHighThreshold(Number(e.target.value))}
                className="w-full accent-rose-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 block">
                Model probabilities at or above this value trigger high-risk alerts and priority queue placement.
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-slate-200">Medium Risk Cutoff Threshold</span>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  {(medThreshold * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0.20"
                max="0.60"
                step="0.01"
                disabled={!isAdmin}
                value={medThreshold}
                onChange={(e) => setMedThreshold(Number(e.target.value))}
                className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 block">
                Model probabilities between Medium and High cutoffs are categorized as Medium Risk.
              </span>
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="flex justify-end pt-3 border-t border-slate-800">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg transition-colors"
            >
              <Save size={14} />
              <span>Save Configuration</span>
            </button>
          </div>
        )}
      </form>

      {/* Admin Audit Trail */}
      {isAdmin && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <History size={16} className="text-slate-400" />
            <h3 className="font-semibold text-slate-100 text-sm">System Audit Trail</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium">
                  <th className="pb-3 pl-2">Timestamp</th>
                  <th className="pb-3">User</th>
                  <th className="pb-3">Action</th>
                  <th className="pb-3">Entity Type</th>
                  <th className="pb-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 pl-2 font-mono text-[11px] text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 text-slate-300 font-mono text-[11px]">
                      {log.user_email}
                    </td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-300">{log.entity_type}</td>
                    <td className="py-2.5 text-slate-400 max-w-xs truncate">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
