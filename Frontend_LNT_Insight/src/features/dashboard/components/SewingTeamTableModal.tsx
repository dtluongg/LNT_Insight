import React from 'react';
import { Table } from '../../../components/ui/Table';
import type { SewingTeamAnalysis } from '../../../types';
import { Layers } from 'lucide-react';

interface SewingTeamTableModalProps {
    open: boolean;
    data: SewingTeamAnalysis[];
    onClose: () => void;
}

export const SewingTeamTableModal: React.FC<SewingTeamTableModalProps> = ({
    open,
    data,
    onClose,
}) => {
    if (!open) return null;
    const columnsForTable = [
        {
            header: 'Shift Time',
            accessor: (row: SewingTeamAnalysis) => (row.ShiftHourWithTime != null ? row.ShiftHourWithTime.toLocaleString() : '-'),
            className: 'text-right font-medium text-slate-800 dark:text-slate-100',
        },
        {
            header: 'Cumulative Plan',
            accessor: (row: SewingTeamAnalysis) => (row.CumulativePlan != null ? row.CumulativePlan.toLocaleString() : '-'),
            className: 'text-right',
        },
        {
            header: 'Running Output',
            accessor: (row: SewingTeamAnalysis) => (row.RunningOutput != null ? row.RunningOutput.toLocaleString() : '-'),
            className: 'text-right text-emerald-600 dark:text-emerald-400 font-bold',
        },
        {
            header: 'Cumulative Variance',
            accessor: (row: SewingTeamAnalysis) => (row.CumulativeVariance != null ? row.CumulativeVariance.toLocaleString() : '-'),
            className: 'text-right text-blue-600 dark:text-blue-400 font-bold',
        },
        {
            header: 'Achievement %',
            accessor: (row: SewingTeamAnalysis) => (row.Achievement != null ? `${row.Achievement.toLocaleString()} %` : '-'),
            className: 'text-right font-semibold',
        }
    ];
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-6"
            onClick={onClose}
        >
            <div
                className="w-full max-w-6xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                            <Layers size={22} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                                Cumulative Output vs. Target - Detail Table
                            </h2>
                            <p className="text-xs text-slate-400 dark:text-slate-400">
                                Detailed Cumulative Plan, Running Output and Output Variance by Shift Time
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 text-xl font-bold transition-colors cursor-pointer"
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-6 space-y-5 flex-1">
                    {/* Table */}
                    <Table
                        columns={columnsForTable}
                        data={data}
                        keyExtractor={(row) => row.ShiftHourID || row.ShiftHourWithTime}
                    />
                </div>
            </div>
        </div>
    );
};