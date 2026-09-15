import React from 'react';
import { Target as TargetIcon, Settings as SettingsIcon, AlertTriangle, ShieldCheck } from 'lucide-react';
import { StatCard } from '../../../components/ui/StatCard';

interface TrendInfo {
  trendValue: string;
  trendType: 'up' | 'down' | 'neutral';
  diff: number;
}

interface StatCardsGridProps {
  totalTarget: number;
  totalOutput: number;
  achievementRate: number;
  inspection: number;
  defectGMT: string;
  targetTrend: TrendInfo;
  outputTrend: TrendInfo;
  rateTrend: TrendInfo;
  qualityTrend: TrendInfo;
  defectTrend: TrendInfo;
  onOpenDefectModal: () => void;
}

export const StatCardsGrid: React.FC<StatCardsGridProps> = React.memo(({
  totalTarget,
  totalOutput,
  achievementRate,
  inspection,
  defectGMT,
  targetTrend,
  outputTrend,
  rateTrend,
  qualityTrend,
  defectTrend,
  onOpenDefectModal,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      <StatCard
        variant="target"
        title="TOTAL TARGET"
        value={totalTarget.toLocaleString()}
        subtitle="Cumulative Shift Plan (PCS)"
        icon={<TargetIcon size={20} />}
        trendValue={targetTrend.trendValue}
        trendType={targetTrend.trendType}
        trendLabel="vs. previous day"
      />

      <StatCard
        variant="output"
        title="TOTAL OUTPUT"
        value={totalOutput.toLocaleString()}
        subtitle="Cumulative Actual Output (PCS)"
        icon={<SettingsIcon size={20} />}
        trendValue={outputTrend.trendValue}
        trendType={outputTrend.trendType}
        trendLabel="vs. previous day"
      />

      <StatCard
        variant="rate"
        title="ACHIEVEMENT RATE"
        value={`${achievementRate.toFixed(1)}%`}
        subtitle="Actual Output / Shift Plan"
        icon={<TargetIcon size={20} />}
        trendValue={rateTrend.trendValue}
        trendType={rateTrend.trendType}
        trendLabel="vs. previous day"
      />

      <StatCard
        variant="quality"
        title="QUALITY INSPECTED GMT"
        value={inspection.toString()}
        subtitle="Sewing End line Inspection"
        icon={<AlertTriangle size={20} />}
        trendValue={qualityTrend.trendValue}
        trendType={qualityTrend.trendType}
        trendLabel="vs. previous day"
      />

      <StatCard
        variant="defect"
        title="DEFECT GMT"
        value={defectGMT}
        subtitle="Defect (PCS) / Defect Rate"
        icon={<ShieldCheck size={20} />}
        trendValue={defectTrend.trendValue}
        trendType={defectTrend.trendType}
        trendLabel="vs. previous day"
        titleColorClass="text-[#0D9488]"
        onClick={onOpenDefectModal}
      />
    </div>
  );
});

StatCardsGrid.displayName = 'StatCardsGrid';
