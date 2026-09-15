import React, { useCallback } from 'react';
import { BarChart2, Ellipsis } from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import type { SewingTeamDetail } from '../../../types';

interface ProductionChartSectionProps {
  productionData: SewingTeamDetail[];
  onOpenTableModal: () => void;
  onSelectProduction: (item: SewingTeamDetail) => void;
}

export const ProductionChartSection: React.FC<ProductionChartSectionProps> = React.memo(({
  productionData,
  onOpenTableModal,
  onSelectProduction,
}) => {
  const handleBarClick = useCallback((data: any) => {
    if (data?.payload) {
      onSelectProduction(data.payload);
    }
  }, [onSelectProduction]);

  const tooltipFormatter = useCallback((value: any, name: string) => {
    if (name === 'Target') return [value ? value.toLocaleString() : '-', 'Target'];
    if (name === 'Output') return [value ? value.toLocaleString() : '0', 'Actual Output'];
    if (name === 'Achieved') return [value ? value.toLocaleString() : '0', 'Inspected / Achieved'];
    if (name === 'Defect') return [value ? value.toLocaleString() : '0', 'Defect Qty'];
    return [value, name];
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-4 flex flex-col gap-4">
      {/* Chart Header: Title & Custom Legend & Ellipsis Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        {/* Left: Icon & Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center shadow-xs shrink-0">
            <BarChart2 size={18} />
          </div>
          <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
            PRODUCTION OUTPUT STATUS
          </h2>
        </div>

        {/* Right: Legend & Table modal trigger */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#d6951b]" />
              <span className="text-slate-600">Target</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
              <span className="text-slate-600">Output</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
              <span className="text-slate-600">Achieved</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenTableModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="View production data table"
          >
            <Ellipsis size={18} />
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-[300px] w-full">
        {productionData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400 font-medium">
            No production data found for this company and site.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={productionData}
              margin={{ top: 25, right: 20, bottom: 10, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="TeamName"
                stroke="#94a3b8"
                fontSize={11}
                fontWeight={700}
                tickLine={false}
                dy={8}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                fontWeight={500}
                tickLine={false}
                axisLine={false}
                dx={-8}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
                  fontFamily: 'sans-serif',
                  fontSize: '12px',
                  padding: '10px 14px'
                }}
                formatter={tooltipFormatter}
              />

              {/* Brown Target Line */}
              <Line
                type="monotone"
                dataKey="DayTarget"
                name="Target"
                stroke="#d6951b"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#d6951b', stroke: '#fff', strokeWidth: 1.5 }}
                activeDot={{ r: 6 }}
                label={{ position: 'top', fill: '#d6951b', fontSize: 13, fontWeight: 700 }}
              />

              {/* Blue Output Bar */}
              <Bar
                dataKey="DayOutput"
                name="Output"
                fill="#38BDF8"
                radius={[3, 3, 0, 0]}
                barSize={22}
                label={{ position: 'top', fill: '#0284C7', fontSize: 13, fontWeight: 600 }}
                onClick={handleBarClick}
                cursor="pointer"
              />

              {/* Green Achieved / Inspected Bar */}
              <Bar
                dataKey="InspectedQty"
                name="Achieved"
                fill="#22C55E"
                radius={[3, 3, 0, 0]}
                barSize={22}
                label={{ position: 'top', fill: '#16A34A', fontSize: 13, fontWeight: 600 }}
                onClick={handleBarClick}
                cursor="pointer"
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
});

ProductionChartSection.displayName = 'ProductionChartSection';
