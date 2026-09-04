import React from 'react';
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
      className: 'font-semibold text-slate-800',
    },
    {
      header: 'Day Output',
      accessor: (row: SewingTeamDetail) => (row.DayOutput != null ? row.DayOutput.toLocaleString() : '-'),
      className: 'text-right',
    },
    {
      header: 'Day Target',
      accessor: (row: SewingTeamDetail) => (row.DayTarget != null ? row.DayTarget.toLocaleString() : '-'),
      className: 'text-right',
    },
    {
      header: 'Inspected Qty',
      accessor: (row: SewingTeamDetail) => (row.InspectedQty != null ? row.InspectedQty.toLocaleString() : '-'),
      className: 'text-right',
    },
    {
      header: 'Defect Qty',
      accessor: (row: SewingTeamDetail) => (row.DefectQty != null ? row.DefectQty.toLocaleString() : '-'),
      className: 'text-right',
    },
    {
      header: 'Defect Rate',
      accessor: (row: SewingTeamDetail) => (row.DefectRate != null ? `${row.DefectRate}%` : '-'),
      className: 'text-right font-medium',
    },
  ];

  const totalOutput = data.reduce((sum, item) => sum + (item.DayOutput || 0), 0);
  const totalTarget = data.reduce((sum, item) => sum + (item.DayTarget || 0), 0);
  const totalInspected = data.reduce((sum, item) => sum + (item.InspectedQty || 0), 0);
  const totalDefect = data.reduce((sum, item) => sum + (item.DefectQty || 0), 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-6xl rounded-xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Layers size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Production Output Status - Detail Table
              </h2>
              <p className="text-xs text-slate-400">
                Detailed production, inspection, and defect status by team
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 text-xl font-bold cursor-pointer transition-colors"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-5 flex-1">
          {/* Filter badges */}
          <div className="grid grid-cols-2 gap-4 border border-slate-100 rounded-xl bg-slate-50/60 p-4 md:grid-cols-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Company
              </p>
              <p className="mt-1 text-sm font-bold text-slate-700 truncate">
                {filter.CompanyName || filter.CompanyID}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Site
              </p>
              <p className="mt-1 text-sm font-bold text-slate-700 truncate">
                {filter.SiteCode || filter.SiteID}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Section
              </p>
              <p className="mt-1 text-sm font-bold text-slate-700 truncate">
                {filter.SectionName || `Section ${filter.SectionID}`}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Date
              </p>
              <p className="mt-1 text-sm font-bold text-slate-700 truncate">
                {filter.Date}
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-lg border border-slate-100 bg-white p-3 shadow-xs">
              <span className="text-xs text-slate-400 font-medium">Total Teams</span>
              <p className="text-lg font-bold text-slate-800">{data.length}</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-white p-3 shadow-xs">
              <span className="text-xs text-slate-400 font-medium">Total Output</span>
              <p className="text-lg font-bold text-blue-600">{totalOutput.toLocaleString()} PCS</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-white p-3 shadow-xs">
              <span className="text-xs text-slate-400 font-medium">Total Target</span>
              <p className="text-lg font-bold text-slate-700">{totalTarget.toLocaleString()} PCS</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-white p-3 shadow-xs">
              <span className="text-xs text-slate-400 font-medium">Total Defect</span>
              <p className="text-lg font-bold text-amber-600">{totalDefect.toLocaleString()} / {totalInspected.toLocaleString()}</p>
            </div>
          </div>

          {/* Table */}
          <Table
            columns={columnsForTable}
            data={data}
            keyExtractor={(row) => row.TeamName || row.TeamID}
          />
        </div>
      </div>
    </div>
  );
};
