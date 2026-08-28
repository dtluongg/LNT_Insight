import React from 'react';
import { Card } from './Card';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  iconColorClass?: string;
  iconBgClass?: string;
  trendText?: string;
  trendType?: 'up' | 'down' | 'neutral';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconColorClass = 'text-blue-600',
  iconBgClass = 'bg-blue-50',
  trendText,
  trendType = 'neutral',
  onClick,
}) => {
  const trendColors = {
    up: 'text-emerald-600',
    down: 'text-rose-600',
    neutral: 'text-slate-500',
  };

  return (
    <Card 
      className={`flex-col gap-5 ${onClick ? 'cursor-pointer hover:shadow-lg transition-all duration-200' : ''}`}
      onClick={onClick}
    >
      <div className="flex rounded-xl items-center gap-5 hover:shadow-md transition-shadow duration-200">
        <div className={`p-4 rounded-xl flex items-center justify-center ${iconBgClass} ${iconColorClass}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">
            {title}
          </p>
          <p className="text-2xl font-bold text-slate-800 tracking-tight mt-1">
            {value}
          </p>
          {trendText && (
            <span className={`text-[11px] font-medium mt-1.5 inline-block ${trendColors[trendType]}`}>
              {trendText}
            </span>
          )}
        </div>
      </div>
      <p className="text-xs text-slate-500 mt-2 truncate text-center">
        {subtitle}
      </p>
    </Card>
  );
};
