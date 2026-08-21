import React from 'react';
import type { DashboardFilter } from '../types/TeamSewingFilters';
import type { ProductionVsPlanInfo } from '../../../types';

interface ProductionDetailModalProps {
    open: boolean;
    filter: DashboardFilter;
    production: ProductionVsPlanInfo | null;
    onClose: () => void;
}

export const ProductionDetailModal: React.FC<ProductionDetailModalProps> = ({
    open,
    filter,
    production,
    onClose
}) => {
    if (!open || !production) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
            onClick={onClose}
        >
            <div
                className="w-full max-w-5xl rounded-xl bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800">
                            Production Detail
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                            {production.teamName}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                        ×
                    </button>
                </div>

                {/* Dashboard Filter Information */}
                <div className="grid grid-cols-2 gap-4 border-b border-slate-200 p-6 md:grid-cols-4">
                    <div>
                        <p className="text-xs font-medium uppercase text-slate-400">
                            Company
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-700">
                            {filter.companyName}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs font-medium uppercase text-slate-400">
                            Site
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-700">
                            {filter.siteCode}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs font-medium uppercase text-slate-400">
                            Section
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-700">
                            {filter.sectionName}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs font-medium uppercase text-slate-400">
                            Date
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-700">
                            {filter.date}
                        </p>
                    </div>
                </div>

                {/* Selected Chart Data */}
                <div className="grid grid-cols-2 gap-4 p-6 md:grid-cols-3">
                    <div className="rounded-lg bg-slate-50 p-4">
                        <p className="text-xs font-medium uppercase text-slate-400">
                            Team
                        </p>
                        <p className="mt-1 text-lg font-semibold text-slate-800">
                            {production.teamName}
                        </p>
                    </div>

                    <div className="rounded-lg bg-orange-50 p-4">
                        <p className="text-xs font-medium uppercase text-slate-400">
                            Day Output
                        </p>
                        <p className="mt-1 text-lg font-semibold text-orange-600">
                            {production.dayOutput?.toLocaleString() ?? 0}
                        </p>
                    </div>

                    <div className="rounded-lg bg-blue-50 p-4">
                        <p className="text-xs font-medium uppercase text-slate-400">
                            Day Target
                        </p>
                        <p className="mt-1 text-lg font-semibold text-blue-600">
                            {production.dayTarget?.toLocaleString() ?? 0}
                        </p>
                    </div>
                </div>

                {/* Detail Chart - để dành cho bước tiếp theo */}
                <div className="px-6 pb-6">
                    <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-slate-300">
                        <span className="text-sm text-slate-400">
                            Detail chart will be displayed here
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};