import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, AlertCircle, Sparkles } from 'lucide-react';
import { PredictionFactor } from '../../types';

interface FactorsListProps {
  factors: PredictionFactor[];
  title?: string;
}

export const FactorsList: React.FC<FactorsListProps> = ({
  factors,
  title = 'Why this prediction? — Associated Factors',
}) => {
  if (!factors || factors.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-sm text-slate-400 text-center">
        No factor analysis data available for this record.
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-5 shadow-lg">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-amber-400" />
          <h3 className="font-semibold text-slate-100 text-sm md:text-base">{title}</h3>
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
          Explainable AI (XAI)
        </span>
      </div>

      <p className="text-xs text-slate-400 mb-4 leading-relaxed">
        <strong className="text-slate-300">Methodology notice: </strong>
        The model weights student indicators relative to institutional baseline distributions.
        These are <em>factors statistically associated with the prediction</em>, not proved causal triggers.
      </p>

      <div className="space-y-3">
        {factors.map((item, idx) => {
          const isHighNeg = item.impact === 'High Negative';
          const isModNeg = item.impact === 'Moderate Negative';
          const isPos = item.impact === 'Positive';

          let impactBadge = 'bg-slate-800 text-slate-300 border-slate-700';
          let icon = <Minus size={14} className="text-slate-400" />;
          let barColor = 'bg-slate-600';

          if (isHighNeg) {
            impactBadge = 'bg-rose-950/80 text-rose-300 border-rose-800/80';
            icon = <ArrowUpRight size={14} className="text-rose-400" />;
            barColor = 'bg-rose-500';
          } else if (isModNeg) {
            impactBadge = 'bg-amber-950/80 text-amber-300 border-amber-800/80';
            icon = <ArrowUpRight size={14} className="text-amber-400" />;
            barColor = 'bg-amber-500';
          } else if (isPos) {
            impactBadge = 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80';
            icon = <ArrowDownRight size={14} className="text-emerald-400" />;
            barColor = 'bg-emerald-500';
          }

          // Calculate bar width based on absolute weight
          const barWidth = Math.min(100, Math.max(15, Math.round(Math.abs(item.weight) * 300)));

          return (
            <div
              key={idx}
              className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-200 text-xs md:text-sm">
                    {item.factor}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800/90 text-slate-300 border border-slate-700">
                    {item.value}
                  </span>
                </div>
                <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${impactBadge}`}>
                  {icon}
                  <span className="font-medium">{item.impact}</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 mb-2 leading-relaxed">
                {item.description}
              </p>

              {/* Relative impact bar */}
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden flex items-center">
                <div
                  className={`h-full rounded-full ${barColor} transition-all duration-500`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <span>Higher negative impact increases risk score</span>
        <span>Positive factors mitigate risk score</span>
      </div>
    </div>
  );
};
