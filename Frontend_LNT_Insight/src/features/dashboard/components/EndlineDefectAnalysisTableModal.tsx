import React from 'react';
import { Table } from '../../../components/ui/Table';
import type { OverallDefectAnalysis } from '../../../types';
import { Layers } from 'lucide-react';

interface EndlineDefectAnalysisTableModalProps {
    open: boolean;
    data: OverallDefectAnalysis[];
    onClose: () => void;
}

export const EndlineDefectAnalysisTableModal: React.FC<EndlineDefectAnalysisTableModalProps> = ({
    open,
    data,
    onClose,
}) => {
    const dataSort = [...data].sort((a, b) => b.DefectQty - a.DefectQty);
    if (!open) return null;

    const columnsForTable = [
        {
            header: 'Defect Name',
            accessor: (row: OverallDefectAnalysis) => (row.DefectName != null ? row.DefectName.toLocaleString() : '-'),
            className: 'text-left font-semibold text-slate-800 dark:text-slate-100',
        },
        {
            header: 'Defect Qty',
            accessor: (row: OverallDefectAnalysis) => (row.DefectQty != null ? row.DefectQty.toLocaleString() : '-'),
            className: 'text-right font-bold text-rose-600 dark:text-rose-400',
        }
    ];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-6"
            onClick={onClose}
        >
            <div
                className="w-full max-w-4xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-200"
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
                                Defect Analysis Table Detail
                            </h2>
                            <p className="text-xs text-slate-400 dark:text-slate-400">
                                Detailed Defect Name, Defect Qty
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

                {/* Content */}
                <div className="overflow-y-auto p-6 space-y-5 flex-1">
                    {/* Table */}
                    <Table
                        columns={columnsForTable}
                        data={dataSort}
                        keyExtractor={(row) => row.DefectID || row.DefectName}
                    />
                </div>
            </div>
        </div>
    );
};