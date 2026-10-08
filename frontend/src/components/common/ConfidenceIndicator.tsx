import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

interface ConfidenceIndicatorProps {
  confidence: number; // 0.0 - 1.0
  modelVersion?: string;
  timestamp?: string;
}

export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({
  confidence,
  modelVersion,
  timestamp,
}) => {
  const pct = Math.round(confidence * 100);
  let statusText = 'High Confidence';
  let color = 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40';

  if (pct < 75) {
    statusText = 'Moderate Confidence';
    color = 'text-amber-400 bg-amber-950/40 border-amber-800/40';
  } else if (pct < 85) {
    statusText = 'Good Confidence';
    color = 'text-blue-400 bg-blue-950/40 border-blue-800/40';
  }

  return (
    <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-300 font-medium">
          <ShieldCheck size={14} className="text-cyan-400" />
          <span>Model Prediction Reliability</span>
        </div>
        <span className={`px-2 py-0.5 rounded-full border text-[11px] font-medium ${color}`}>
          {pct}% ({statusText})
        </span>
      </div>

      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
        <span>Model: {modelVersion || 'Active Ensemble'}</span>
        {timestamp && <span>{new Date(timestamp).toLocaleDateString()}</span>}
      </div>

      <div className="flex items-start gap-1.5 mt-1 text-[11px] text-slate-400 bg-slate-950/40 p-2 rounded border border-slate-800/50">
        <Info size={12} className="text-slate-400 shrink-0 mt-0.5" />
        <span>
          Confidence reflects distance from decision boundary and data completeness.
          Decision-support signal only; does not replace educator evaluation.
        </span>
      </div>
    </div>
  );
};
