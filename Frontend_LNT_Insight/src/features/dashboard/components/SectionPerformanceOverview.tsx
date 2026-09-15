import React from 'react';
import { LayoutGrid } from 'lucide-react';

interface SectionPerformanceOverviewProps {
  filterProductionData: any[];
}

export const SectionPerformanceOverview: React.FC<SectionPerformanceOverviewProps> = React.memo(({
  filterProductionData
}) => {
  return (
    <div className="bg-background rounded-2xl border-6 border-white shadow-xs p-1 px-1 flex flex-col md:flex-row items-stretch md:items-center gap-5">
      {/* Header: Icon + Title */}
      <div className="flex items-center gap-3 shrink-0 md:pr-6 md:border-r border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-xs shrink-0">
          <LayoutGrid size={20} />
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] font-black text-blue-900 tracking-wider leading-tight uppercase">
            SECTION
          </span>
          <span className="text-[11px] font-black text-blue-900 tracking-wider leading-tight uppercase">
            PERFORMANCE
          </span>
          <span className="text-[11px] font-black text-blue-900 tracking-wider leading-tight uppercase">
            OVERVIEW
          </span>
        </div>
      </div>

      {/* List of Team Performance Boxes */}
      <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5">
        {filterProductionData.map((item, idx) => {
          const colors = ['#276ebe'];
          const teamColor = colors[idx % colors.length];
          const target = item.DayTargetTotal ?? 0;
          const output = item.DayOutputTotal ?? 0;
          const rate = item.DayPercent ?? 0;
          const displayRate = `${rate.toFixed(rate % 1 === 0 ? 0 : 2)}%`;

          return (
            <div key={item.SectionID} className="flex flex-col gap-1.5 bg-white p-4 rounded-xl">
              {/* Top: Color Dot + Team Name */}
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: teamColor }}
                />
                <span className="text-[14px] font-bold text-slate-800 truncate">
                  S{item.SectionID}
                </span>
              </div>

              {/* Middle: output / target + percent */}
              <div className="flex items-center justify-between text-[13px] text-slate-600 font-semibold">
                <span>{`${output} / ${target}`}</span>
                <span>{displayRate}</span>
              </div>

              {/* Bottom: Progress Bar */}
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(rate, 100)}%`,
                    backgroundColor: teamColor,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

SectionPerformanceOverview.displayName = 'SectionPerformanceOverview';
