import React from 'react';
import {
  Shield,
  ArrowRight,
  Sparkles,
  SlidersHorizontal,
  ClipboardCheck,
  TrendingDown,
  Layers,
  HeartHandshake,
  CheckCircle2,
  Database,
  Cpu,
  Compass,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LandingPageProps {
  onNavigate: (path: string) => void;
  onOpenTour: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onOpenTour }) => {
  const { isAuthenticated } = useAuth();

  const loopSteps = [
    { step: 'Data Ingestion', desc: 'Attendance, grades, LMS logs' },
    { step: 'Quality Audit', desc: 'Missing rate, range validations' },
    { step: 'ML Ensembles', desc: 'GBDT, RF, Decision Tree, Logistic' },
    { step: 'Risk Tiers', desc: 'High / Medium / Low bands' },
    { step: 'XAI Factors', desc: 'Statistical relative contributions' },
    { step: 'What-If Simulation', desc: 'Controllable indicator testing' },
    { step: 'Intervention Plan', desc: 'Actionable support assignments' },
    { step: 'Follow-Up Tracking', desc: 'Temporal outcome monitoring' },
  ];

  const features = [
    {
      icon: TrendingDown,
      title: 'Multi-Factor Early Risk Detection',
      desc: 'Combines attendance trajectory, internal exam score shifts, LMS engagement metrics, and backlogs before failures become irreversible.',
      tag: 'Predictive',
    },
    {
      icon: Sparkles,
      title: 'Explainable Contributing Factors',
      desc: 'No black-box scores. Every prediction details the specific metrics associated with elevated risk relative to institutional cohort averages.',
      tag: 'XAI',
    },
    {
      icon: SlidersHorizontal,
      title: 'Interactive What-If Simulation',
      desc: 'Allows educators to adjust controllable indicators (e.g. +15% attendance) and observe simulated model response in real time.',
      tag: 'Novelty Feature',
    },
    {
      icon: ClipboardCheck,
      title: 'Intervention & Follow-up Workflows',
      desc: 'Bridge predictions to action with structured support categories: tutoring, attendance contracts, mentoring, and outcome logging.',
      tag: 'Workflow',
    },
    {
      icon: Layers,
      title: 'Stage-Aware Risk Interpretation',
      desc: 'Adapts metrics and evaluation criteria appropriately for School, Higher Secondary, and Undergraduate degree programs.',
      tag: 'Stage-Aware',
    },
    {
      icon: HeartHandshake,
      title: 'Human-in-the-Loop & Responsible AI',
      desc: 'Built purely as decision-support for mentors. AI never makes autonomous punitive actions or permanent labelling judgements.',
      tag: 'Ethics First',
    },
  ];

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24 px-4 md:px-8 border-b border-slate-800/80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.15),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(6,182,212,0.1),transparent_50%)] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-950/70 border border-indigo-700/60 text-indigo-300 text-xs font-medium mb-6 backdrop-blur-md">
            <Sparkles size={14} className="text-indigo-400" />
            <span>EduGuard AI Hackathon Master Build • Full-Stack Operational System</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Predict risk earlier. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
              Support students sooner.
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            EduGuard AI turns student attendance and performance data into explainable
            early-warning insights, scenario simulations, and collaborative intervention workflows for educators.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
            <button
              onClick={() => onNavigate(isAuthenticated ? '/dashboard' : '/login')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] transition-all"
            >
              <span>{isAuthenticated ? 'Open Dashboard' : 'Explore Live Demo'}</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={onOpenTour}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm hover:border-indigo-400 transition-all"
            >
              <Compass size={16} className="text-indigo-400" />
              <span>Judge Guided Tour</span>
            </button>

            <button
              onClick={() => onNavigate('/what-if')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-800/60 font-semibold text-sm hover:border-cyan-400 transition-all"
            >
              <SlidersHorizontal size={16} className="text-cyan-400" />
              <span>Try What-If Simulator</span>
            </button>
          </div>
        </div>
      </section>

      {/* Closed Early-Warning Loop Architecture */}
      <section className="py-14 px-4 md:px-8 border-b border-slate-800/80 bg-slate-900/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-xl md:text-2xl font-bold text-slate-100 mb-2">
              The Closed-Loop Early Warning Architecture
            </h2>
            <p className="text-xs md:text-sm text-slate-400 max-w-2xl mx-auto">
              EduGuard AI connects raw student records all the way to recorded intervention outcomes.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {loopSteps.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col items-center text-center relative group hover:border-indigo-500/50 transition-colors"
              >
                <span className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-700/60 text-[10px] font-bold flex items-center justify-center mb-2">
                  {idx + 1}
                </span>
                <span className="text-xs font-semibold text-slate-200 mb-1">{item.step}</span>
                <span className="text-[10px] text-slate-400 leading-tight">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Innovation Features */}
      <section className="py-16 px-4 md:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-3">
            Engineered for Real Educational Impact
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            Designed to empower educators with explainability, role-based governance, and real decision support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/90 transition-all flex flex-col justify-between group shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-600/20 group-hover:scale-105 transition-transform">
                      <Icon size={22} />
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {feat.tag}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-slate-100 mb-2 group-hover:text-indigo-300 transition-colors">
                    {feat.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {feat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Trust & Responsible AI Callout */}
      <section className="py-12 px-4 md:px-8 border-t border-slate-800/80 bg-slate-900/30">
        <div className="max-w-4xl mx-auto rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900/80 to-cyan-950/40 border border-slate-800 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-indigo-400 font-semibold text-sm">
              <CheckCircle2 size={16} />
              <span>Responsible AI Governance</span>
            </div>
            <h4 className="text-lg md:text-xl font-bold text-white">
              AI Assists. Educators Decide.
            </h4>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              EduGuard AI provides decision-support signals. A risk prediction is not a final
              judgement about a student and should always be reviewed by an authorized educator.
            </p>
          </div>

          <button
            onClick={() => onNavigate('/dashboard')}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shrink-0 shadow-lg transition-colors"
          >
            Launch System
          </button>
        </div>
      </section>
    </div>
  );
};
