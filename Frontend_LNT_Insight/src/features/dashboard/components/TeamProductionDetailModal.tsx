import React, { useState, useEffect } from 'react';
import {
    ResponsiveContainer,
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Treemap,
    LabelList,
    ReferenceLine
} from 'recharts';
import { Ellipsis } from 'lucide-react';
import { companiesApi } from '../../../core/api/companies';
import type { DashboardFilter } from '../types/TeamSewingFilters';
import type { SewingTeamDetail, WorkshiftInfo, SewingTeamAnalysis, OverallDefectAnalysis } from '../../../types';
import { SewingTeamTableModal } from './SewingTeamTableModal';
import { EndlineDefectAnalysisTableModal } from './EndlineDefectAnalysisTableModal';

interface TeamProductionDetailModalProps {
    open: boolean;
    filter: DashboardFilter;
    production: SewingTeamDetail;
    onClose: () => void;
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

export const TeamProductionDetailModal: React.FC<TeamProductionDetailModalProps> = ({
    open,
    filter,
    production,
    onClose
}) => {
    const [shiftworks, setShiftworks] = useState<WorkshiftInfo[]>([]);
    const [selectedShiftworkID, setSelectedShiftworkID] = useState<number | null>(null);
    const [hourlyAnalysis, setHourlyAnalysis] = useState<SewingTeamAnalysis[]>([]);
    const [teamDefects, setTeamDefects] = useState<OverallDefectAnalysis[]>([]);

    const [activeTab, setActiveTab] = useState<'hourly_cumulative_output' | 'hourly_production_output' | 'defects'>('hourly_cumulative_output');

    const [loadingShiftworks, setLoadingShiftworks] = useState(false);
    const [loadingAnalysis, setLoadingAnalysis] = useState(false);
    const [loadingDefects, setLoadingDefects] = useState(false);

    // Modal:
    const [isTableModalOpen, setIsTableModalOpen] = useState(false);
    const [isTableModalOpen2, setIsTableModalOpen2] = useState(false);

    // Fetch Shiftwork List & Team Defects on Modal Open
    useEffect(() => {
        if (open && production) {
            const dateObj = new Date(filter.Date);

            // 1. Fetch workshifts
            const fetchWorkshifts = async () => {
                setLoadingShiftworks(true);
                try {
                    const shifts = await companiesApi.getWorkshiftList(
                        filter.CompanyID,
                        filter.SiteID,
                        dateObj,
                        Number(production.SectionID)
                    );
                    setShiftworks(shifts);
                    if (shifts.length > 0) {
                        setSelectedShiftworkID(shifts[0].ShiftWorkID);
                    } else {
                        setSelectedShiftworkID(null);
                    }
                } catch (error) {
                    console.error('Failed to fetch workshift list', error);
                    setShiftworks([]);
                    setSelectedShiftworkID(null);
                } finally {
                    setLoadingShiftworks(false);
                }
            };

            // 2. Fetch team-specific defects
            const fetchTeamDefects = async () => {
                setLoadingDefects(true);
                try {
                    const defects = await companiesApi.getTeamDefectAnalysis(
                        filter.CompanyID,
                        filter.SiteID,
                        Number(production.SectionID),
                        dateObj,
                        production.TeamID
                    );
                    console.log(production.SectionID)
                    setTeamDefects(defects);
                } catch (error) {
                    console.error('Failed to fetch team defect analysis', error);
                    setTeamDefects([]);
                } finally {
                    setLoadingDefects(false);
                }
            };

            fetchWorkshifts();
            fetchTeamDefects();
            setActiveTab('hourly_cumulative_output'); // Reset to default tab
        }
    }, [open, production, filter.CompanyID, filter.SiteID, filter.Date, filter.SectionID]);

    // Fetch Hourly Analysis whenever selectedShiftworkID changes
    useEffect(() => {
        if (open && production && selectedShiftworkID !== null) {
            const fetchHourlyAnalysis = async () => {
                setLoadingAnalysis(true);
                try {
                    const dateObj = new Date(filter.Date);
                    const analysis = await companiesApi.getDataSewingTeamAnalysis(
                        filter.CompanyID,
                        filter.SiteID,
                        dateObj,
                        production.TeamID,
                        selectedShiftworkID
                    );
                    setHourlyAnalysis(analysis);
                    // if (analysis) {
                    //     let sumOutputQty = 0;
                    //     let sumHourlyPlan = 0;
                    //     const newAnalysis = analysis.map(item => {
                    //         sumOutputQty += item.OutputQty;
                    //         sumHourlyPlan += item.HourlyPlan;
                    //         return {
                    //             ...item,
                    //             OutputQty: sumOutputQty,
                    //             HourlyPlan: sumHourlyPlan
                    //         };
                    //     });
                    //     setHourlyAnalysis(newAnalysis);
                    // }

                } catch (error) {
                    console.error('Failed to fetch hourly team analysis', error);
                    setHourlyAnalysis([]);
                } finally {
                    setLoadingAnalysis(false);
                }
            };
            fetchHourlyAnalysis();
        } else {
            setHourlyAnalysis([]);
        }
    }, [open, production, selectedShiftworkID, filter.CompanyID, filter.SiteID, filter.Date]);

    if (!open || !production) return null;

    const defectChartData = teamDefects.map((d) => ({
        name: d.DefectName,
        value: d.DefectQty,
    }));


    // const varianceChartData = hourlyAnalysis.map((item) => {
    //     const variance = item.OutputVariance ?? 0;
    //     return {
    //         ...item,
    //         // if variance > 0 then not change 
    //         PositiveVariance: variance > 0 ? variance : 0,
    //         // if variance < 0 then set variance to 0
    //         NegativeVariance: variance < 0 ? variance : 0
    //     }
    // })

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
                            Production Detail
                        </h2>
                        <div className="flex items-center justify-between mt-1 gap-6" >
                            <p className="mt-1 text-lg font-semibold text-slate-600 dark:text-slate-300">
                                Team: {production.TeamName}
                            </p>
                            <div className="flex items-baseline">
                                <p className="text-2xl font-semibold text-emerald-500 dark:text-emerald-400">
                                    {production.OutputQty?.toLocaleString() ?? 0}/
                                </p>
                                <p className="text-lg font-semibold text-amber-400">
                                    {production.MOPlanQty?.toLocaleString() ?? 0}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 p-6 md:grid-cols-5 flex-shrink-0">
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
                                Date
                            </p>
                            <p className="mt-1 text-sm font-bold text-slate-700 dark:text-slate-200 truncate">
                                {filter.Date}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                                Shiftwork
                            </p>
                            {loadingShiftworks ? (
                                <div className="mt-2 text-xs text-slate-400">Loading...</div>
                            ) : shiftworks.length === 0 ? (
                                <div className="mt-2 text-xs text-slate-400">No shifts</div>
                            ) : (
                                <select
                                    className="mt-1 block w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-1 px-2.5 text-xs font-bold text-slate-700 dark:text-slate-100 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                                    value={selectedShiftworkID ?? ''}
                                    onChange={(e) => setSelectedShiftworkID(Number(e.target.value))}
                                >
                                    {shiftworks.map((sw) => (
                                        <option key={sw.ShiftWorkID} value={sw.ShiftWorkID} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">
                                            {sw.ShiftWorkName}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 text-xl font-bold transition-colors cursor-pointer"
                    >
                        ×
                    </button>
                </div>

                {/* Content Area - Scrollable */}
                <div className="overflow-y-auto flex-1 flex flex-col min-h-0">
                    {/* Tabs Selector Navigation */}
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
                        <div className="flex px-6 flex-shrink-0">
                            <button
                                className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all duration-200 cursor-pointer ${activeTab === 'hourly_cumulative_output'
                                    ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                    }`}
                                onClick={() => setActiveTab('hourly_cumulative_output')}
                            >
                                Cumulative Output Analysis
                            </button>
                            <button
                                className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all duration-200 cursor-pointer ${activeTab === 'hourly_production_output'
                                    ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                    }`}
                                onClick={() => setActiveTab('hourly_production_output')}
                            >
                                Production Output Analysis
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsTableModalOpen(true)}
                            className="mr-5 p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                            title="View production data table"
                        >
                            <h3 className='text-sm font-medium'>Hourly Team Production Details</h3>
                        </button>
                    </div>

                    {/* Tab Panels Contents */}
                    <div className="p-6 flex-1 min-h-[400px]">
                        {activeTab === 'hourly_cumulative_output' ? (
                            <div className="h-full flex flex-col gap-4">
                                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider pl-1">
                                    Cumulative Output vs. Target
                                </h3>
                                {loadingAnalysis ? (
                                    <div className="flex flex-1 items-center justify-center border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/20 dark:bg-slate-800/20">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-xs font-semibold text-slate-400">Loading hourly output data...</span>
                                        </div>
                                    </div>
                                ) : hourlyAnalysis.length === 0 ? (
                                    <div className="flex flex-1 items-center justify-center border border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/10">
                                        <span className="text-sm text-slate-400 font-medium">
                                            No hourly output data found for selected workshift.
                                        </span>
                                    </div>
                                ) : (
                                    <div className="bg-slate-50/50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex-1 flex flex-col">
                                        <ResponsiveContainer width="100%" height={360}>
                                            <ComposedChart
                                                data={hourlyAnalysis}
                                                margin={{ top: 20, right: 20, bottom: 20, left: 10 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
                                                <XAxis
                                                    dataKey="ShiftHourID"
                                                    stroke="#94a3b8"
                                                    fontSize={13}
                                                    fontWeight={600}
                                                    tickLine={false}
                                                    dy={10}
                                                />
                                                <YAxis
                                                    stroke="#94a3b8"
                                                    fontSize={13}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    dx={-10}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        borderRadius: '12px',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                                        color: '#f8fafc',
                                                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)'
                                                    }}
                                                />
                                                <Legend
                                                    height={36}
                                                    iconType="circle"
                                                    wrapperStyle={{ fontSize: '12px', fontWeight: 500, paddingTop: '20px' }}
                                                    content={() => (
                                                        <div className="flex justify-center items-center gap-6 text-[13px] font-medium pt-2">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="w-3 h-3 rounded-full bg-[#10B981]" />
                                                                <span className="text-slate-600 dark:text-slate-300">Running Output</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                                                                <span className="text-slate-600 dark:text-slate-300">Cumulative Plan</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                />
                                                <Bar
                                                    id='bar-running-output'
                                                    dataKey="RunningOutput"
                                                    name="Running Output"
                                                    fill="#10B981"
                                                    radius={[4, 4, 0, 0]}
                                                    barSize={32}
                                                    label={{ position: 'top', fill: '#10B981', fontSize: 13, fontWeight: 500 }}
                                                />
                                                <Bar
                                                    id='bar-cumulative-plan'
                                                    dataKey="CumulativePlan"
                                                    name="Cumulative Plan"
                                                    fill="#F59E0B"
                                                    radius={[4, 4, 0, 0]}
                                                    barSize={32}
                                                    label={{ position: 'top', fill: '#F59E0B', fontSize: 13, fontWeight: 500 }}
                                                />
                                            </ComposedChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col gap-4">
                                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider pl-1">
                                    Running Output vs. Cumulative Variance
                                </h3>

                                {loadingAnalysis ? (
                                    <div className="flex flex-1 items-center justify-center border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/20 dark:bg-slate-800/20">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-xs font-semibold text-slate-400">Loading hourly output data...</span>
                                        </div>
                                    </div>
                                ) : hourlyAnalysis.length === 0 ? (
                                    <div className="flex flex-1 items-center justify-center border border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/10">
                                        <span className="text-sm text-slate-400 font-medium">
                                            No hourly output data found for selected workshift.
                                        </span>
                                    </div>
                                ) : (
                                    <div className="bg-slate-50/50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex-1 flex flex-col">
                                        <ResponsiveContainer width="100%" height={360}>
                                            <ComposedChart
                                                data={hourlyAnalysis}
                                                stackOffset='sign'
                                                margin={{ top: 20, right: 20, bottom: 20, left: 10 }}
                                            >
                                                <defs>
                                                    <linearGradient id="popupRunningOutput" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#2563EB" stopOpacity={0.95} />
                                                        <stop offset="100%" stopColor="#1D4ED8" stopOpacity={0.75} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
                                                <XAxis
                                                    dataKey="ShiftHourID"
                                                    stroke="#94a3b8"
                                                    fontSize={13}
                                                    fontWeight={600}
                                                    tickLine={false}
                                                    dy={10}
                                                />
                                                <YAxis
                                                    stroke="#94a3b8"
                                                    fontSize={13}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    dx={-10}
                                                    domain={['auto', 'auto']}
                                                />

                                                <ReferenceLine y={0} stroke="#64748b" strokeWidth={1.5} />

                                                <Tooltip
                                                    contentStyle={{
                                                        borderRadius: '12px',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                                        color: '#f8fafc'
                                                    }}
                                                    formatter={(val: any, name: string) => {
                                                        if (name === 'Running Output') return [val?.toLocaleString(), name];
                                                        if (name === 'Cumulative Variance') return [`${val?.toLocaleString()}`, name];
                                                        return [val, name];
                                                    }}
                                                />
                                                <Legend
                                                    height={36}
                                                    iconType="circle"
                                                    wrapperStyle={{ fontSize: '12px', fontWeight: 500, paddingTop: '20px' }}
                                                />
                                                <Bar
                                                    dataKey="RunningOutput"
                                                    name="Running Output"
                                                    stackId="varianceStack"
                                                    fill="#10B981"
                                                    barSize={32}
                                                    label={{ position: 'center', fill: '#fff', fontSize: 16, fontWeight: 500 }}
                                                />
                                                <Bar
                                                    dataKey="CumulativeVariance"
                                                    name="Cumulative Variance"
                                                    stackId="varianceStack"
                                                    fill="#1D4ED8"
                                                    barSize={32}
                                                    radius={[4, 4, 0, 0]}
                                                >
                                                    <LabelList
                                                        content={(props: any) => {
                                                            const { x, y, width, height, index } = props;
                                                            const originalItem = hourlyAnalysis[index];
                                                            const val = Number(originalItem?.CumulativeVariance) || 0;

                                                            if (val === 0) return null;

                                                            return (
                                                                <text
                                                                    x={x + width / 2}
                                                                    y={y + height / 2}
                                                                    fill="#ffffff"
                                                                    textAnchor="middle"
                                                                    dominantBaseline="central"
                                                                    fontSize={16}
                                                                    fontWeight={500}
                                                                >
                                                                    {val.toLocaleString()}
                                                                </text>
                                                            );
                                                        }}
                                                    />
                                                </Bar>
                                            </ComposedChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="h-full flex flex-col gap-4 mt-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider pl-1">
                                    Team End-Line Defect Analysis
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setIsTableModalOpen2(true)}
                                    className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                                    title="View production data table"
                                >
                                    <Ellipsis size={18} />
                                </button>
                            </div>
                            {loadingDefects ? (
                                <div className="flex flex-1 items-center justify-center border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/20 dark:bg-slate-800/20">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-xs font-semibold text-slate-400">Loading defect data...</span>
                                    </div>
                                </div>
                            ) : teamDefects.length === 0 ? (
                                <div className="flex flex-1 items-center justify-center border border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/10">
                                    <span className="text-sm text-slate-400 font-medium">
                                        No defect data found for this team.
                                    </span>
                                </div>
                            ) : (
                                <div className="bg-slate-50/50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex-1 flex flex-col">
                                    <ResponsiveContainer width="100%" height={360}>
                                        <Treemap
                                            data={defectChartData}
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
                </div>
                <SewingTeamTableModal
                    open={isTableModalOpen}
                    data={hourlyAnalysis}
                    onClose={() => setIsTableModalOpen(false)}
                />
                <EndlineDefectAnalysisTableModal
                    open={isTableModalOpen2}
                    data={teamDefects}
                    onClose={() => setIsTableModalOpen2(false)}
                />
            </div>
        </div>
    );
};
