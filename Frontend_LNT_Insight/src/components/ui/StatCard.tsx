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
}

const variantStyles: Record<
  StatCardVariant,
  {
    border: string;
    title: string;
    iconBg: string;
    sparkline: string;
    textPreviewColor: string;
    bgPreviewColor: string;
  }
> = {
  target: {
    border: 'border-[#d6951b] dark:border-[#d6951b]/60',
    title: 'text-[#d6951b] dark:text-[#fbbf24]',
    iconBg: 'bg-[#d6951b]',
    sparkline: '#d6951b',
    textPreviewColor: 'text-[#d6951b] dark:text-[#fbbf24]',
    bgPreviewColor: 'bg-[#d6951b]/[0.19] dark:bg-[#d6951b]/[0.3]'
  },
  output: {
    border: 'border-[#0EA5E9] dark:border-[#0EA5E9]/60',
    title: 'text-[#0EA5E9] dark:text-[#38bdf8]',
    iconBg: 'bg-[#0EA5E9]',
    sparkline: '#0EA5E9',
    textPreviewColor: 'text-[#0EA5E9] dark:text-[#38bdf8]',
    bgPreviewColor: 'bg-[#0EA5E9]/[0.19] dark:bg-[#0EA5E9]/[0.3]'
  },
  rate: {
    border: 'border-[#10B981] dark:border-[#10B981]/60',
    title: 'text-[#10B981] dark:text-[#34d399]',
    iconBg: 'bg-[#10B981]',
    sparkline: '#10B981',
    textPreviewColor: 'text-[#10B981] dark:text-[#34d399]',
    bgPreviewColor: 'bg-[#10B981]/[0.19] dark:bg-[#10B981]/[0.3]'
  },
  quality: {
    border: 'border-[#A855F7] dark:border-[#A855F7]/60',
    title: 'text-[#A855F7] dark:text-[#c084fc]',
    iconBg: 'bg-[#A855F7]',
    sparkline: '#A855F7',
    textPreviewColor: 'text-[#A855F7] dark:text-[#c084fc]',
    bgPreviewColor: 'bg-[#A855F7]/[0.19] dark:bg-[#A855F7]/[0.3]'
  },
  defect: {
    border: 'border-[#881337] dark:border-[#f43f5e]/60',
    title: 'text-[#881337] dark:text-[#fb7185]',
    iconBg: 'bg-[#881337] dark:bg-[#e11d48]',
    sparkline: '#f43f5e',
    textPreviewColor: 'text-[#881337] dark:text-[#fb7185]',
    bgPreviewColor: 'bg-[#881337]/[0.19] dark:bg-[#e11d48]/[0.3]'
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
}) => {
  const preset = variant ? variantStyles[variant] : null;

  const borderClass = borderColorClass || preset?.border || 'border-slate-200 dark:border-slate-800';
  const titleClass = titleColorClass || preset?.title || 'text-slate-600 dark:text-slate-300';
  const iconBackground = iconBgClass || preset?.iconBg || 'bg-blue-600';
  const sparkColor = sparklineColor || preset?.sparkline || '#2563eb';
  const textPreviewColor = preset?.textPreviewColor || 'text-slate-600 dark:text-slate-300';
  const bgPreviewColor = preset?.bgPreviewColor || 'bg-blue-600';

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 rounded-2xl border-2 ${borderClass} shadow-xs transition-all duration-200 flex flex-col justify-between ${onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5' : ''}`}
    >
      {/* Top row: Circle Icon + Content */}
      <div className="flex items-start gap-3 p-2">
        

        {/* Title, Value, Subtitle */}
        <div className="flex-1 min-w-0">
          <span
            className={`block text-[16px] font-bold tracking-wider uppercase truncate ${titleClass}`}
          >
            {title}
          </span>
          <div className={`text-2xl font-bold ${titleClass} tracking-tight leading-tight mt-0.5 truncate`}>
            {value}
          </div>
          <span className="block text-[15px] font-medium text-slate-400 dark:text-slate-400 mt-0.5 truncate">
            {subtitle}
          </span>
        </div>
        {/* Solid circular icon badge */}
        <div
          className={`w-13 h-13 m-2 rounded-full flex items-center justify-center text-white shrink-0 shadow-xs ${iconBackground}`}
        >
          {icon}
        </div>
      </div>

      {/* Bottom row: Trend badge + Sparkline */}
      <div className={`flex items-center justify-between ${bgPreviewColor} p-2 rounded-bl-2xl rounded-b-2xl`}>
        {/* Trend percentage & vs. previous day */}
        <div className="flex flex-col">
          {trendValue && (
            <div
              className={`flex items-center gap-0.5 text-xl font-bold leading-none ${textPreviewColor}`}
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
            <span className="text-[13px] text-slate-400 font-medium mt-0.5 leading-none">
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
