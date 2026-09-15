import React from 'react';
import { Lightbulb, TrendingUp, Target as TargetIcon, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { SewingTeamDetail } from '../../../types';

interface TrendInfo {
  trendValue: string;
  trendType: 'up' | 'down' | 'neutral';
  diff: number;
}

interface KeyInsightsSectionProps {
  highestTeam: SewingTeamDetail | null;
  highestContrib: string;
  outputTrend: TrendInfo;
  rateTrend: TrendInfo;
  defectTrend: TrendInfo;
}

export const KeyInsightsSection: React.FC<KeyInsightsSectionProps> = React.memo(({
  highestTeam,
  highestContrib,
  outputTrend,
  rateTrend,
  defectTrend,
}) => {
  return (
    <div className="bg-background rounded-2xl border-white border-6 shadow-xs p-2 flex flex-col xl:flex-row items-stretch xl:items-center gap-6">
      {/* Header: Lightbulb Icon + Title */}
      <div className="flex items-center gap-3 shrink-0 xl:pr-6 xl:border-r border-slate-100">
        <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs">
          <Lightbulb size={20} />
        </div>
        <span className="text-xs font-black text-slate-800 tracking-wider uppercase">
          KEY INSIGHTS
        </span>
      </div>

      {/* 4 Insights Columns */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
        {/* Item 1: Total Output */}
        <div className="flex items-center gap-3.5 sm:px-4 first:pl-0 border-r-1 border-zinc-300">
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <TrendingUp size={18} />
          </div>
          <div>
            <div className="text-[13px] font-medium text-slate-500">Total Output</div>
            <div className={`text-[19px] font-bold leading-tight ${outputTrend.diff >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>
              {outputTrend.trendValue}
            </div>
            <div className="text-[12px] text-slate-400">vs. previous day</div>
          </div>
        </div>

        {/* Item 2: Highest contribution team */}
        <div className="flex items-center gap-3.5 sm:px-4 border-r-1 border-zinc-300">
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <TargetIcon size={18} />
          </div>
          <div>
            <div className="text-[13px] font-medium text-slate-500 truncate">
              {highestTeam?.TeamName || 'N/A'} has highest contribution
            </div>
            <div className="text-[19px] font-bold text-blue-600 leading-tight">
              {highestContrib}%
            </div>
            <div className="text-[12px] text-slate-400">of total output</div>
          </div>
        </div>

        {/* Item 3: Achievement rate */}
        <div className="flex items-center gap-3.5 sm:px-4 border-r-1 border-zinc-300">
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <div className="text-[13px] font-medium text-slate-500">
              Achievement rate {rateTrend.diff >= 0 ? 'increased' : 'decreased'}
            </div>
            <div className={`text-[19px] font-bold leading-tight ${rateTrend.diff >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {rateTrend.trendValue}
            </div>
            <div className="text-[12px] text-slate-400">vs. previous day</div>
          </div>
        </div>

        {/* Item 4: Defect rate */}
        <div className="flex items-center gap-3.5 sm:px-4">
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <AlertTriangle size={18} />
          </div>
          <div>
            <div className="text-[13px] font-medium text-slate-500">
              Defect rate {defectTrend.diff <= 0 ? 'decreased' : 'increased'}
            </div>
            <div className={`text-[19px] font-bold leading-tight ${defectTrend.diff <= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
              {defectTrend.trendValue}
            </div>
            <div className="text-[12px] text-slate-400">vs. previous day</div>
          </div>
        </div>
      </div>
    </div>
  );
});

KeyInsightsSection.displayName = 'KeyInsightsSection';
