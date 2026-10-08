import React from 'react';
import {
  HelpCircle,
  Shield,
  HeartHandshake,
  AlertTriangle,
  Sparkles,
  BookOpen,
  Lock,
} from 'lucide-react';

export const HelpPage: React.FC = () => {
  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 space-y-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <HelpCircle size={20} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Responsible AI Framework & System Guide
          </h1>
        </div>
        <p className="text-xs text-slate-400">
          Principles, explainability methodology, privacy safeguards, and ethical boundaries for EduGuard AI.
        </p>
      </div>

      {/* Mandatory Core Ethical Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-purple-950/40 border border-indigo-700/60 shadow-xl space-y-2">
        <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
          <HeartHandshake size={18} />
          <span>Core Ethical Commitment: Decision-Support Only</span>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed">
          "EduGuard AI provides decision-support signals. A risk prediction is not a final judgement about a student and must always be reviewed by an authorized educator or counsellor. The system is designed strictly for proactive assistance and early support. It must <strong>never</strong> be used to automatically punish, exclude, deny institutional services, or permanently label students."
        </p>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Multi-Factor Risk Prediction */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
            <Sparkles size={16} />
            <span>How Risk is Computed</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The system fits ensemble machine learning algorithms (Gradient Boosting, Random Forest, Decision Tree, Logistic Regression) on verified academic indicators including attendance rate, cumulative score, recent exam shifts, assignment completion, LMS engagement, and course backlogs. Risk scores represent statistical probabilities, not moral or academic destiny.
          </p>
        </div>

        {/* Explainability and Non-Causality */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
            <AlertTriangle size={16} />
            <span>Explainability & Non-Causality</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Feature importances and factor weights reveal <em>statistical associations</em> relative to cohort benchmarks. <strong>Feature importance does not prove causality.</strong> Low attendance often correlates with elevated risk, but an educator must investigate underlying personal, health, or familial factors before deciding an action.
          </p>
        </div>

        {/* What-If Simulator Guidance */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <BookOpen size={16} />
            <span>What-If Scenario Simulation</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The What-If Simulator provides educators with exploratory scenario modeling. It computes model probability responses to hypothetical improvements (e.g. +15% attendance). It is clearly labeled as a <em>scenario estimate — not a guarantee of outcome</em>.
          </p>
        </div>

        {/* Privacy & Role-Based Access */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <Lock size={16} />
            <span>Data Privacy & Role Separation</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            EduGuard enforces strict RBAC boundaries. Executive and governing board viewers receive aggregated institutional analytics with student contact information automatically masked. Audit logs trace every prediction, data import, model activation, and intervention change.
          </p>
        </div>
      </div>

      {/* Synthetic Dataset Notice */}
      <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
        <span>Demo dataset — synthetic data for demonstration. Not real student records.</span>
        <span className="font-mono text-[11px] text-slate-400">EduGuard AI v1.0.0</span>
      </div>
    </div>
  );
};
