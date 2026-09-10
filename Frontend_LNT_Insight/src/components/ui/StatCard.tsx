import React from 'react';
import { TrendingUp, TrendingDown, ArrowUp, ArrowDown } from 'lucide-react';

export type StatCardVariant = 'target' | 'output' | 'rate' | 'quality' | 'defect';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  variant?: StatCardVariant;
  borderColorClass?: string;
  titleColorClass?: string;
  iconBgClass?: string;
  sparklineColor?: string;
  trendValue?: string;
  trendType?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  onClick?: () => void;
  className?: string;
}

const variantStyles: Record<
  StatCardVariant,
  {
    border: string;
    title: string;
    iconBg: string;
    sparkline: string;
  }
> = {
  target: {
    border: 'border-[#8A4A28]',
    title: 'text-[#8A4A28]',
    iconBg: 'bg-[#8A4A28]',
    sparkline: '#8A4A28',
  },
  output: {
    border: 'border-[#0EA5E9]',
    title: 'text-[#0EA5E9]',
    iconBg: 'bg-[#0EA5E9]',
    sparkline: '#0EA5E9',
  },
  rate: {
    border: 'border-[#10B981]',
    title: 'text-[#10B981]',
    iconBg: 'bg-[#10B981]',
    sparkline: '#10B981',
  },
  quality: {
    border: 'border-[#A855F7]',
    title: 'text-[#A855F7]',
    iconBg: 'bg-[#A855F7]',
    sparkline: '#A855F7',
  },
  defect: {
    border: 'border-[#0D9488]',
    title: 'text-[#0D9488]',
    iconBg: 'bg-[#0D9488]',
    sparkline: '#0D9488',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  variant,
  borderColorClass,
  titleColorClass,
  iconBgClass,
  sparklineColor,
  trendValue,
  trendType = 'up',
  trendLabel = 'vs. previous day',
  onClick,
  className = '',
}) => {
  const preset = variant ? variantStyles[variant] : null;

  const borderClass = borderColorClass || preset?.border || 'border-slate-200';
  const titleClass = titleColorClass || preset?.title || 'text-slate-600';
  const iconBackground = iconBgClass || preset?.iconBg || 'bg-blue-600';
  const sparkColor = sparklineColor || preset?.sparkline || '#2563eb';

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border-2 ${borderClass} p-4 shadow-xs transition-all duration-200 flex flex-col justify-between ${
        onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5' : ''
      } ${className}`}
    >
      {/* Top row: Circle Icon + Content */}
      <div className="flex items-start gap-3">
        {/* Solid circular icon badge */}
        <div
          className={`w-11 h-11 rounded-full flex items-center justify-center text-white shrink-0 shadow-xs ${iconBackground}`}
        >
          {icon}
        </div>

        {/* Title, Value, Subtitle */}
        <div className="flex-1 min-w-0">
          <span
            className={`block text-[11px] font-extrabold tracking-wider uppercase truncate ${titleClass}`}
          >
            {title}
          </span>
          <div className="text-2xl font-black text-slate-800 tracking-tight leading-tight mt-0.5 truncate">
            {value}
          </div>
          <span className="block text-[10px] font-medium text-slate-400 mt-0.5 truncate">
            {subtitle}
          </span>
        </div>
      </div>

      {/* Thin divider line */}
      <div className="border-t border-slate-100 my-2.5" />

      {/* Bottom row: Trend badge + Sparkline */}
      <div className="flex items-center justify-between pt-0.5">
        {/* Trend percentage & vs. previous day */}
        <div className="flex flex-col">
          {trendValue && (
            <div
              className={`flex items-center gap-0.5 text-xs font-bold leading-none ${
                trendType === 'down' ? 'text-rose-500' : 'text-emerald-500'
              }`}
            >
              {trendType === 'down' ? (
                <ArrowDown size={13} className="stroke-[2.5]" />
              ) : (
                <ArrowUp size={13} className="stroke-[2.5]" />
              )}
              <span>{trendValue}</span>
            </div>
          )}
          {trendLabel && (
            <span className="text-[10px] text-slate-400 font-medium mt-0.5 leading-none">
              {trendLabel}
            </span>
          )}
        </div>

        {/* Squiggle Sparkline icon in matching color */}
        <div style={{ color: sparkColor }} className="shrink-0">
          {trendType === 'down' ? (
            <TrendingDown size={20} className="stroke-[2.2]" />
          ) : (
            <TrendingUp size={20} className="stroke-[2.2]" />
          )}
        </div>
      </div>
    </div>
  );
};
