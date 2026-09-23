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
    // sap xep lai du lieu 
    // const dataSortASC = data
    //     .map((item, index) => ({ index, value: item.DefectQty })) // tao 1 mang moi
    //     .sort((a, b) => a.value - b.value)
    //     .map(sorted => data[sorted.index]);

    // const dataSort = [...data].sort((a, b) => a.DefectQty - b.DefectQty);
    const dataSort = [...data].sort((a, b) => b.DefectQty - a.DefectQty);
    // ==================================================================================
    if (!open) return null;
    const columnsForTable = [
        {
            header: 'Defect Name',
            accessor: (row: OverallDefectAnalysis) => (row.DefectName != null ? row.DefectName.toLocaleString() : '-'),
            className: 'text-right',
        },
        {
            header: 'Defect Qty',
            accessor: (row: OverallDefectAnalysis) => (row.DefectQty != null ? row.DefectQty.toLocaleString() : '-'),
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
                                Defect Analysis Table Detail
                            </h2>
                            <p className="text-xs text-slate-400">
                                Detailed Defect Name, Defect Qty
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
                        data={dataSort}
                        keyExtractor={(row) => row.DefectID || row.DefectName}
                    />
                </div>
            </div>
        </div>
    )
}