import React, { useState, useEffect } from 'react';
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
    '#3B82F6', // Blue
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#14B8A6', // Teal
    '#6366F1', // Indigo
    '#84CC16', // Lime
    '#EAB308', // Yellow
    '#D946EF', // Fuchsia
    '#F97316', // Orange
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
                    fontSize={19}
                    fontWeight={100}
                    className="select-none pointer-events-none"
                >
                    {name.split('/')[0]}
                </text>
            )}
            {width > 60 && height > 30 && (
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
                    Qty: {value}
                </text>
            )}
        </g>
    );
};

export const OverallDefectDetailModal: React.FC<OverallDefectDetailModalProps> = ({
    open,
    filter,
    onClose,
    inspectedQty,
    defectQty,
    defectRate
}) => {
    const [defects, setDefects] = useState<OverallDefectAnalysis[]>([]);
    const [loading, setLoading] = useState(false);
    const [isDataDetailTableOverallDefectOpen, setIsDataDetailTableOverallDefectOpen] = useState(false)

    useEffect(() => {
        if (open) {
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
                    setDefects(data);
                } catch (error) {
                    console.error('Failed to fetch defect analysis data', error);
                    setDefects([]);
                } finally {
                    setLoading(false);
                }
            };
            fetchDefects();
        }
    }, [open, filter.CompanyID, filter.SiteID, filter.Date]);

    if (!open) return null;

    const chartData = defects.map((d) => ({
        name: d.DefectName,
        value: d.DefectQty,
    }));


    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-6"
            onClick={onClose}
        >
            <div
                className="w-full max-w-8xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex-shrink-0">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                            Defect GMT Detail (Overall)
                        </h2>
                        <p className="mt-1 text-sm text-slate-400 dark:text-slate-400">
                            Overall Defect Analysis
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 text-xl font-bold transition-colors cursor-pointer"
                    >
                        ×
                    </button>
                </div>

                {/* Content - Scrollable if content overflows */}
                <div className="overflow-y-auto p-6 space-y-6 flex-1">
                    {/* Dashboard Filter Information */}
                    <div className="grid grid-cols-2 gap-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 p-4 md:grid-cols-4">
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
                                {`${filter.SectionName}`}
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

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-xl border border-purple-500/20 dark:border-purple-500/30 bg-purple-500/10 dark:bg-purple-950/40 p-5 transition-all hover:shadow-xs">
                            <p className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                                Inspected Qty
                            </p>
                            <p className="mt-1.5 text-2xl font-semibold text-purple-600 dark:text-purple-400">
                                {inspectedQty.toLocaleString()}
                            </p>
                            <p className="mt-0.5 text-xs text-purple-500 dark:text-purple-400 font-medium">Total sewing inspected</p>
                        </div>

                        <div className="rounded-xl border border-rose-100 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/40 p-5 transition-all hover:shadow-xs">
                            <p className="text-xs font-bold uppercase tracking-wider text-rose-400 dark:text-rose-400">
                                Defect Qty
                            </p>
                            <p className="mt-1.5 text-2xl font-semibold text-rose-600 dark:text-rose-400">
                                {defectQty.toLocaleString()}
                            </p>
                            <p className="mt-0.5 text-xs text-rose-500 dark:text-rose-400 font-medium">Total defective pieces</p>
                        </div>

                        <div className="rounded-xl border border-amber-100 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/40 p-5 transition-all hover:shadow-xs">
                            <p className="text-xs font-bold uppercase tracking-wider text-amber-500 dark:text-amber-400">
                                Defect Rate
                            </p>
                            <p className="mt-1.5 text-2xl font-semibold text-amber-600 dark:text-amber-400">
                                {defectRate.toFixed(2)}%
                            </p>
                            <p className="mt-0.5 text-xs text-amber-500 dark:text-amber-400 font-medium">Defective pieces ratio</p>
                        </div>
                    </div>

                    {/* Chart Block Container */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider pl-1">
                                Defect Distribution Chart (Treemap)
                            </h3>
                            <button
                                type='button'
                                onClick={() => setIsDataDetailTableOverallDefectOpen(true)}
                                className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                                title="View defect detail data table"
                            >
                                <Ellipsis size={18} />
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex h-80 items-center justify-center border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/20 dark:bg-slate-800/20">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-xs font-semibold text-slate-400">Loading defect details...</span>
                                </div>
                            </div>
                        ) : defects.length === 0 ? (
                            <div className="flex h-80 items-center justify-center border border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/10">
                                <span className="text-sm text-slate-400 font-medium">
                                    No defect details available for the selected filters.
                                </span>
                            </div>
                        ) : (
                            <div className="bg-slate-50/50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
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
                                                        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 max-w-xs">
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Defect Category</p>
                                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-1 leading-snug">{data.name}</p>
                                                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 justify-between">
                                                                <div className="flex items-center gap-1.5">
                                                                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                                                                    <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Qty</span>
                                                                </div>
                                                                <span className="text-xs font-bold text-rose-600 dark:text-rose-400">{data.value} PCS</span>
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
};
