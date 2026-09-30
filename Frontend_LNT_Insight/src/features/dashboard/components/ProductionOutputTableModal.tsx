import React, { useMemo } from 'react';
import { Table } from '../../../components/ui/Table';
import type { DashboardFilter } from '../types/TeamSewingFilters';
import type { SewingTeamDetail } from '../../../types';
import { Layers } from 'lucide-react';

interface ProductionOutputTableModalProps {
  open: boolean;
  filter: DashboardFilter;
  data: SewingTeamDetail[];
  onClose: () => void;
}

export const ProductionOutputTableModal: React.FC<ProductionOutputTableModalProps> = ({
  open,
  filter,
  data,
  onClose,
}) => {
  if (!open) return null;

  const columnsForTable = [
    {
      header: 'Team Name',
      accessor: 'TeamName' as const,
      className: 'font-semibold text-slate-800 dark:text-slate-100',
    },
    {
      header: 'Day Output',
      accessor: (row: SewingTeamDetail) =>
        row.OutputQty != null ? row.OutputQty.toLocaleString() : '-',
      className: 'text-right',
    },
    {
      header: 'Day Target',
      accessor: (row: SewingTeamDetail) =>
        row.MOPlanQty != null ? row.MOPlanQty.toLocaleString() : '-',
      className: 'text-right',
    },
    {
      header: 'Inspected Qty',
      accessor: (row: SewingTeamDetail) =>
        row.InspectedQty != null ? row.InspectedQty.toLocaleString() : '-',
      className: 'text-right',
    },
    {
      header: 'Defect Qty',
      accessor: (row: SewingTeamDetail) =>
        row.DefectQty != null ? row.DefectQty.toLocaleString() : '-',
      className: 'text-right',
    },
    {
      header: 'Defect Rate',
      accessor: (row: SewingTeamDetail) =>
        row.DefectRate != null ? `${row.DefectRate}%` : '-',
      className: 'text-right font-medium',
    },
  ];

  // Tính tổng các chỉ số
  const totalOutput = useMemo(
    () => data.reduce((sum, item) => sum + (item.OutputQty || 0), 0),
    [data]
  );
  const totalTarget = useMemo(
    () => data.reduce((sum, item) => sum + (item.MOPlanQty || 0), 0),
    [data]
  );
  const totalInspected = useMemo(
    () => data.reduce((sum, item) => sum + (item.InspectedQty || 0), 0),
    [data]
  );
  const totalDefect = useMemo(
    () => data.reduce((sum, item) => sum + (item.DefectQty || 0), 0),
    [data]
  );
  
  // Tỷ lệ lỗi tổng cộng (%)
  const overallDefectRate = totalInspected > 0
    ? ((totalDefect / totalInspected) * 100).toFixed(2)
    : '0.00';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-7xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[100vh] transition-colors duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Layers size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Production Output Status - Detail Table
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-400">
                Detailed production, inspection, and defect status by team
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 text-xl font-bold cursor-pointer transition-colors"
          >
            ×
          </button>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto p-6 space-y-5 flex-1">
          {/* Filter badges */}
          <div className="grid grid-cols-2 gap-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 p-4 md:grid-cols-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                Company
              </p>
              <p className="mt-1 text-sm font-bold text-slate-700 dark:text-slate-200 truncate">
                {filter.CompanyName || filter.CompanyID}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                Site
              </p>
              <p className="mt-1 text-sm font-bold text-slate-700 dark:text-slate-200 truncate">
                {filter.SiteCode || filter.SiteID}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                Section
              </p>
              <p className="mt-1 text-sm font-bold text-slate-700 dark:text-slate-200 truncate">
                {filter.SectionName || `Section ${filter.SectionID}`}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                Date
              </p>
              <p className="mt-1 text-sm font-bold text-slate-700 dark:text-slate-200 truncate">
                {filter.Date}
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-3 shadow-xs">
              <span className="text-xs text-slate-400 dark:text-slate-400 font-medium">Total Teams</span>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{data.length}</p>
            </div>
            <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-3 shadow-xs">
              <span className="text-xs text-slate-400 dark:text-slate-400 font-medium">Total Output</span>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{totalOutput.toLocaleString()} PCS</p>
            </div>
            <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-3 shadow-xs">
              <span className="text-xs text-slate-400 dark:text-slate-400 font-medium">Total Target</span>
              <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{totalTarget.toLocaleString()} PCS</p>
            </div>
            <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-3 shadow-xs">
              <span className="text-xs text-slate-400 dark:text-slate-400 font-medium">Defect / Inspected</span>
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                {totalDefect.toLocaleString()} / {totalInspected.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Table có Fixed Header & Fixed Sum Footer */}
          <Table
            columns={columnsForTable}
            data={data}
            keyExtractor={(row) => row.TeamName || row.TeamID}
            maxHeight="max-h-[500px]"
            renderFooter={() => (
              <tr className="text-slate-800 dark:text-slate-100">
                <td className="px-4 py-3.5 font-bold uppercase tracking-wider text-xs">
                  Summary
                </td>
                <td className="px-4 py-3.5 text-right font-bold text-blue-600 dark:text-blue-400">
                  {totalOutput.toLocaleString()}
                </td>
                <td className="px-4 py-3.5 text-right font-bold">
                  {totalTarget.toLocaleString()}
                </td>
                <td className="px-4 py-3.5 text-right font-bold">
                  {totalInspected.toLocaleString()}
                </td>
                <td className="px-4 py-3.5 text-right font-bold text-amber-600 dark:text-amber-400">
                  {totalDefect.toLocaleString()}
                </td>
                <td className="px-4 py-3.5 text-right font-bold text-rose-600 dark:text-rose-400">
                  {overallDefectRate}%
                </td>
              </tr>
            )}
          />
        </div>
      </div>
    </div>
  );
};