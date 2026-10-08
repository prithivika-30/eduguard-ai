import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

interface RiskBadgeProps {
  level: 'High' | 'Medium' | 'Low' | string;
  score?: number;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  score,
  showIcon = true,
  size = 'md',
}) => {
  const normLevel = level.toLowerCase();

  let colorClasses = 'bg-emerald-950/60 text-emerald-400 border-emerald-700/50';
  let Icon = CheckCircle2;

  if (normLevel.includes('high')) {
    colorClasses = 'bg-rose-950/60 text-rose-400 border-rose-700/60 animate-pulse';
    Icon = AlertTriangle;
  } else if (normLevel.includes('medium')) {
    colorClasses = 'bg-amber-950/60 text-amber-400 border-amber-700/60';
    Icon = AlertCircle;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-medium px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3.5 py-1.5 gap-2',
  }[size];

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border ${colorClasses} ${sizeClasses} shadow-sm backdrop-blur-sm`}
    >
      {showIcon && <Icon size={iconSizes} />}
      <span>{level}</span>
      {score !== undefined && (
        <span className="opacity-75 font-mono text-[0.9em]">
          ({(score * 100).toFixed(1)}%)
        </span>
      )}
    </span>
  );
};
