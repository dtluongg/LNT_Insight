import React, { useState, useEffect, useMemo } from 'react';
import { Treemap, Tooltip, ResponsiveContainer } from 'recharts';
import { companiesApi } from '../../../core/api/companies';
import type { DashboardFilter } from '../types/TeamSewingFilters';
import type { OverallDefectAnalysis } from '../../../types';
import { EndlineDefectAnalysisTableModal } from './EndlineDefectAnalysisTableModal';
import { Ellipsis } from 'lucide-react';

interface OverallDefectDetailModalProps {
    open: boolean;
    filter: DashboardFilter;
    onClose: () => void;
    inspectedQty: number;
    defectQty: number;
    defectRate: number;
}

const COLORS = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#06B6D4', '#14B8A6', '#6366F1', '#84CC16',
    '#EAB308', '#D946EF', '#F97316',
];

const CustomizedContent = (props: any) => {
    const { depth, x, y, width, height, index, name, value } = props;
    const color = COLORS[index % COLORS.length];

    if (width < 30 || height < 20) {
        return null;
    }

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: color,
                    stroke: '#fff',
                    strokeWidth: 2 / (depth + 1),
                    strokeOpacity: 0.9,
                }}
                className="hover:opacity-90 transition-opacity duration-150 cursor-pointer"
            />
            {width > 60 && height > 30 && (
                <text
                    x={x + width / 2}
                    y={y + height / 2 - 4}
                    textAnchor="middle"
                    fill="#0f172a"
                    fontSize={16}
                    fontWeight={100}
                    className="select-none pointer-events-none"
                >
                    {name.split('/')[0]}
                </text>
            )}
            {width > 60 && height > 45 && (
                <text
                    x={x + width / 2}
                    y={y + height / 2 + 12}
                    textAnchor="middle"
                    fill="#0f172a"
                    fontSize={14}
                    fontWeight={100}
                    opacity={0.95}
                    className="select-none pointer-events-none"
                >
                    {value} Qty
                </text>
            )}
        </g>
    );
};

export const OverallDefectDetailModal: React.FC<OverallDefectDetailModalProps> = React.memo(({
    open,
    filter,
    onClose,
    inspectedQty,
    defectQty,
    defectRate
}) => {
    const [defects, setDefects] = useState<OverallDefectAnalysis[]>([]);
    const [loading, setLoading] = useState(false);
    const [isDataDetailTableOverallDefectOpen, setIsDataDetailTableOverallDefectOpen] = useState(false);

    useEffect(() => {
        if (open) {
            let isMounted = true;
            const fetchDefects = async () => {
                setLoading(true);
                try {
                    const dateObj = new Date(filter.Date);
                    const data = await companiesApi.getOverallDefectAnalysis(
                        filter.CompanyID,
                        filter.SiteID,
                        Number(filter.SectionID),
                        dateObj
                    );
                    if (isMounted) setDefects(data);
                } catch (error) {
                    console.error('Failed to fetch defect analysis data', error);
                    if (isMounted) setDefects([]);
                } finally {
                    if (isMounted) setLoading(false);
                }
            };
            fetchDefects();
            return () => { isMounted = false; };
        }
    }, [open, filter.CompanyID, filter.SiteID, filter.Date]);

    const chartData = useMemo(() => defects.map((d) => ({
        name: d.DefectName,
        value: d.DefectQty,
    })), [defects]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
            onClick={onClose}
        >
            <div
                className="w-full max-w-8xl rounded-xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 flex-shrink-0">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800">
                            Defect GMT Detail (Overall)
                        </h2>
                        <p className="mt-1 text-sm text-slate-400">
                            Overall Defect Analysis
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 text-xl font-bold"
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-6 space-y-6 flex-1">
                    {/* Filter Information */}
                    <div className="grid grid-cols-2 gap-4 border border-slate-100 rounded-xl bg-slate-50/50 p-4 md:grid-cols-4">
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

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-xl border border-green-100 bg-green-300-50/50 p-5 transition-all hover:shadow-xs">
                            <p className="text-xs font-bold uppercase tracking-wider text-green-400">
                                Inspected Qty
                            </p>
                            <p className="mt-1.5 text-2xl font-semibold text-green-700">
                                {inspectedQty.toLocaleString()}
                            </p>
                            <p className="mt-0.5 text-xs text-green-500 font-medium">Total sewing inspected</p>
                        </div>

                        <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-5 transition-all hover:shadow-xs">
                            <p className="text-xs font-bold uppercase tracking-wider text-rose-400">
                                Defect Qty
                            </p>
                            <p className="mt-1.5 text-2xl font-semibold text-rose-600">
                                {defectQty.toLocaleString()}
                            </p>
                            <p className="mt-0.5 text-xs text-rose-500 font-medium">Total defective pieces</p>
                        </div>

                        <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-5 transition-all hover:shadow-xs">
                            <p className="text-xs font-bold uppercase tracking-wider text-amber-400">
                                Defect Rate
                            </p>
                            <p className="mt-1.5 text-2xl font-semibold text-amber-600">
                                {defectRate.toFixed(2)}%
                            </p>
                            <p className="mt-0.5 text-xs text-amber-500 font-medium">Defective pieces ratio</p>
                        </div>
                    </div>

                    {/* Chart Block Container */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider pl-1">
                                Defect Distribution Chart (Treemap)
                            </h3>
                            <button
                                type='button'
                                onClick={() => setIsDataDetailTableOverallDefectOpen(true)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                                title="View defect detail data table"
                            >
                                <Ellipsis size={18} />
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex h-80 items-center justify-center border border-slate-100 rounded-xl bg-slate-50/20">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-xs font-semibold text-slate-400">Loading defect details...</span>
                                </div>
                            </div>
                        ) : defects.length === 0 ? (
                            <div className="flex h-80 items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50/10">
                                <span className="text-sm text-slate-400 font-medium">
                                    No defect details available for the selected filters.
                                </span>
                            </div>
                        ) : (
                            <div className="bg-slate-50/30 p-4 rounded-xl border border-slate-100/80">
                                <ResponsiveContainer width="100%" height={360}>
                                    <Treemap
                                        data={chartData}
                                        dataKey="value"
                                        stroke="#000"
                                        fill="#8884d8"
                                        content={<CustomizedContent />}
                                    >
                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    return (
                                                        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-100 max-w-xs">
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Defect Category</p>
                                                            <p className="text-xs font-bold text-slate-800 mt-1 leading-snug">{data.name}</p>
                                                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 justify-between">
                                                                <div className="flex items-center gap-1.5">
                                                                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                                                                    <span className="text-xs text-slate-500 font-semibold">Qty</span>
                                                                </div>
                                                                <span className="text-xs font-bold text-rose-600">{data.value} PCS</span>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                    </Treemap>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </div>
                <EndlineDefectAnalysisTableModal
                    open={isDataDetailTableOverallDefectOpen}
                    data={defects}
                    onClose={() => setIsDataDetailTableOverallDefectOpen(false)}
                />
            </div>
        </div>
    );
});

OverallDefectDetailModal.displayName = 'OverallDefectDetailModal';
