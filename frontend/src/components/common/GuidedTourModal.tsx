import React from 'react';
import { Compass, CheckCircle2, ArrowRight, X, ShieldAlert, Sparkles } from 'lucide-react';

interface GuidedTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const GuidedTourModal: React.FC<GuidedTourModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  if (!isOpen) return null;

  const tourSteps = [
    {
      num: 1,
      title: 'Dashboard Overview',
      route: '/dashboard',
      desc: 'Inspect real institution-wide risk distribution, stage breakdown, and attention-required count computed from the database.',
      tag: 'Monitoring',
    },
    {
      num: 2,
      title: 'High-Risk Priority Queue',
      route: '/risks',
      desc: 'Triage vulnerable students ranked by model risk probability and overdue check-ins for timely intervention.',
      tag: 'Triage',
    },
    {
      num: 3,
      title: 'Student Profile & XAI Explanations',
      route: '/students/1',
      desc: 'Inspect multi-factor student indicators, confidence metric, and "Why this prediction?" factor importance breakdown.',
      tag: 'Explainability',
    },
    {
      num: 4,
      title: 'Interactive What-If Simulation',
      route: '/what-if',
      desc: 'Simulate scenario impact on risk score by adjusting controllable inputs like attendance or assignment completion.',
      tag: 'Novelty Feature',
    },
    {
      num: 5,
      title: 'Intervention Planning',
      route: '/interventions',
      desc: 'Assign structured support actions (Academic, Attendance, Mentoring, Counselling) with due dates.',
      tag: 'Workflow',
    },
    {
      num: 6,
      title: 'Follow-up & Risk Change Tracking',
      route: '/follow-up',
      desc: 'Log check-in outcomes, evaluate risk change (Improved vs Worsened), and monitor progress over time.',
      tag: 'Loop Closure',
    },
    {
      num: 7,
      title: 'Data Ingestion & Quality Scoring',
      route: '/data',
      desc: 'Validate CSV uploads with automatic data-quality scoring, missing-value rate calculation, and range checks.',
      tag: 'Data Quality',
    },
    {
      num: 8,
      title: 'ML Models & Genuine Metrics',
      route: '/models',
      desc: 'Review 4 candidate algorithms evaluated on holdout test data (Accuracy, Recall, F1, ROC-AUC) and live retraining.',
      tag: 'Real ML',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Compass size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Hackathon Judge Walkthrough Guide
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                  Demo Journey
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Explore the end-to-end explainable early-warning loop step by step.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content list */}
        <div className="p-5 overflow-y-auto space-y-3">
          <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-800/40 text-xs text-indigo-200 flex items-start gap-2">
            <Sparkles size={16} className="text-indigo-400 shrink-0 mt-0.5" />
            <span>
              <strong>Judges:</strong> Every module is fully backed by real REST endpoints, a normalized SQLite database, and active scikit-learn ensemble models. Click any step below to jump directly to it!
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {tourSteps.map((step) => (
              <div
                key={step.num}
                onClick={() => {
                  onNavigate(step.route);
                  onClose();
                }}
                className="group flex items-start justify-between p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-indigo-500/60 hover:bg-slate-800/40 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    {step.num}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
                        {step.title}
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {step.tag}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                  </div>
                </div>

                <ArrowRight
                  size={16}
                  className="text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all shrink-0 mt-1"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldAlert size={14} className="text-cyan-400" />
            Decision-support only; synthetic demo dataset
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
          >
            Start Exploring
          </button>
        </div>
      </div>
    </div>
  );
};
