import React from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Shield,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ReportsPage: React.FC = () => {
  const { role } = useAuth();
  const isViewer = role === 'viewer';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <FileSpreadsheet size={20} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Institutional Reports & Data Export
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Export compliant audit-ready CSV records or produce printable institutional briefs.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs transition-colors self-start sm:self-auto"
        >
          <Printer size={14} />
          <span>Print Summary Brief</span>
        </button>
      </div>

      {isViewer && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200 flex items-center gap-2">
          <Lock size={15} className="text-amber-400 shrink-0" />
          <span>
            <strong>Viewer Role Notice:</strong> Personal student contact identifiers (emails) are masked in exported files to preserve privacy compliance.
          </span>
        </div>
      )}

      {/* Export Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student Risk Roster */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 w-fit">
              <FileSpreadsheet size={22} />
            </div>
            <h3 className="text-base font-bold text-white">Student Risk Assessment Roster</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Complete tabular export containing student identifiers, educational stage, attendance rates, coursework grades, and active model dropout risk predictions.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Format: UTF-8 CSV</span>
            <a
              href={api.getStudentsCsvUrl()}
              download
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg transition-colors"
            >
              <Download size={14} />
              <span>Download Student Roster</span>
            </a>
          </div>
        </div>

        {/* Interventions & Outcomes */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit">
              <CheckCircle2 size={22} />
            </div>
            <h3 className="text-base font-bold text-white">Interventions & Follow-up Tracking</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Full registry of created action plans, support categories (Academic, Mentoring, Counselling), assigned faculty members, scheduled due dates, and logged outcomes.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Format: UTF-8 CSV</span>
            <a
              href={api.getInterventionsCsvUrl()}
              download
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-lg transition-colors"
            >
              <Download size={14} />
              <span>Download Interventions Log</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
