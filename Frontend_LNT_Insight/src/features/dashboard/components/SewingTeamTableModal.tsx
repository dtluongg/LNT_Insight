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
            className: 'text-right',
        },
        {
            header: 'Cumulative Plan',
            accessor: (row: SewingTeamAnalysis) => (row.CumulativePlan != null ? row.CumulativePlan.toLocaleString() : '-'),
            className: 'text-right',
        },
        {
            header: 'Running Output',
            accessor: (row: SewingTeamAnalysis) => (row.RunningOutput != null ? row.RunningOutput.toLocaleString() : '-'),
            className: 'text-right',
        },
        {
            header: 'Cumulative Variance',
            accessor: (row: SewingTeamAnalysis) => (row.CumulativeVariance != null ? row.CumulativeVariance.toLocaleString() : '-'),
            className: 'text-right',
        },
        {
            header: 'Achievement %',
            accessor: (row: SewingTeamAnalysis) => (row.Achievement != null ? `${row.Achievement.toLocaleString()} %` : '-'),
            className: 'text-right',
        }
    ];
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
                                Cumulative Output vs. Target - Detail Table
                            </h2>
                            <p className="text-xs text-slate-400">
                                Detailed Cumulative Plan, Running Output and Output Variance by Shift Time
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
                    {/* Table */}
                    <Table
                        columns={columnsForTable}
                        data={data}
                        keyExtractor={(row) => row.ShiftHourID || row.ShiftHourWithTime}
                    />
                </div>
            </div>
        </div>
    )
}