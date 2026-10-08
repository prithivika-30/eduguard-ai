import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  BarChart2,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { api } from '../services/api';
import { ModelVersion } from '../types';

export const ModelsPage: React.FC = () => {
  const [models, setModels] = useState<ModelVersion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRetraining, setIsRetraining] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchModels = async () => {
    setIsLoading(true);
    try {
      const data = await api.getModels();
      setModels(data);
    } catch (err) {
      console.error('Failed to load models', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleRetrain = async () => {
    setIsRetraining(true);
    setStatusMessage(null);
    try {
      const res = await api.trainModels();
      setStatusMessage(res.message);
      fetchModels();
    } catch (err: any) {
      alert(err.message || 'Retraining failed');
    } finally {
      setIsRetraining(false);
    }
  };

  const handleActivate = async (id: number) => {
    try {
      const res = await api.activateModel(id);
      setStatusMessage(res.message);
      fetchModels();
    } catch (err: any) {
      alert(err.message || 'Failed to activate model');
    }
  };

  const activeModel = models.find((m) => m.is_active) || models[0];

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Cpu size={20} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Machine Learning Pipeline & Candidate Models
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Real scikit-learn ensemble architectures evaluated on holdout test splits (25%). No simulated numbers.
          </p>
        </div>

        <button
          onClick={handleRetrain}
          disabled={isRetraining}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition-all"
        >
          {isRetraining ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <RefreshCw size={14} />
          )}
          <span>{isRetraining ? 'Training Candidates...' : 'Retrain All Candidate Models'}</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>{statusMessage}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-emerald-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Active Model Spotlight */}
      {activeModel && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900/90 to-purple-950/30 border border-indigo-800/60 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-600 text-white shadow-sm">
                Active Production Model
              </span>
              <span className="text-xs font-mono text-indigo-300 font-semibold">
                {activeModel.version_tag}
              </span>
            </div>

            <h2 className="text-2xl font-bold text-white tracking-tight">
              {activeModel.model_name}
            </h2>

            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Selected via balanced F1-score criterion. Trained on {activeModel.dataset_records_count.toLocaleString()} cohort records.
              Feature weights and probabilities drive all real-time API risk inference.
            </p>
          </div>

          {/* Genuine Test Evaluation Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center shrink-0">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="text-[10px] text-slate-400 font-medium uppercase">Accuracy</div>
              <div className="text-lg font-mono font-bold text-white">
                {(activeModel.accuracy * 100).toFixed(1)}%
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="text-[10px] text-slate-400 font-medium uppercase">Recall</div>
              <div className="text-lg font-mono font-bold text-emerald-400">
                {(activeModel.recall * 100).toFixed(1)}%
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="text-[10px] text-slate-400 font-medium uppercase">F1-Score</div>
              <div className="text-lg font-mono font-bold text-indigo-400">
                {(activeModel.f1_score * 100).toFixed(1)}%
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="text-[10px] text-slate-400 font-medium uppercase">ROC-AUC</div>
              <div className="text-lg font-mono font-bold text-cyan-400">
                {(activeModel.roc_auc * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Models Comparison Table */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-100 text-sm">
              Candidate Models Benchmark (Holdout Test Split)
            </h3>
            <p className="text-xs text-slate-400">
              Comparative evaluation across Logistic Regression, Decision Trees, Random Forests, and Gradient Boosting.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium bg-slate-950/50">
                <th className="py-3 px-3">Algorithm</th>
                <th className="py-3 px-3">Accuracy</th>
                <th className="py-3 px-3">Precision</th>
                <th className="py-3 px-3">Recall</th>
                <th className="py-3 px-3">F1-Score</th>
                <th className="py-3 px-3">ROC-AUC</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {models.map((m) => (
                <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-200">{m.model_name}</div>
                    <div className="text-[10px] font-mono text-slate-400">{m.version_tag}</div>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-200">{(m.accuracy * 100).toFixed(2)}%</td>
                  <td className="py-3 px-3 font-mono text-slate-200">{(m.precision * 100).toFixed(2)}%</td>
                  <td className="py-3 px-3 font-mono text-emerald-400 font-medium">{(m.recall * 100).toFixed(2)}%</td>
                  <td className="py-3 px-3 font-mono text-indigo-400 font-medium">{(m.f1_score * 100).toFixed(2)}%</td>
                  <td className="py-3 px-3 font-mono text-cyan-400 font-medium">{(m.roc_auc * 100).toFixed(2)}%</td>
                  <td className="py-3 px-3">
                    {m.is_active ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700 font-bold">
                        Active In Production
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                        Candidate
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    {!m.is_active && (
                      <button
                        onClick={() => handleActivate(m.id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition-colors"
                      >
                        Activate Model
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature Importances Breakdown */}
      {activeModel && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <BarChart2 size={18} className="text-indigo-400" />
            <h3 className="font-semibold text-slate-100 text-sm">
              Global Feature Importance Weights ({activeModel.model_name})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(activeModel.feature_importances).map(([feat, weight]) => {
              const pct = Math.round(weight * 100);
              return (
                <div
                  key={feat}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between"
                >
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="text-slate-300 capitalize font-medium">
                      {feat.replace(/_/g, ' ')}
                    </span>
                    <span className="font-mono text-indigo-400 font-bold">{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(10, pct * 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
