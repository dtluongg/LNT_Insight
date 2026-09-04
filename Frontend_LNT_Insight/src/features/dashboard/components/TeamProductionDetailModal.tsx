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
import { companiesApi } from '../../../core/api/companies';
import type { DashboardFilter } from '../types/TeamSewingFilters';
import type { ProductionVsPlanInfo, WorkshiftInfo, SewingTeamAnalysis, OverallDefectAnalysis } from '../../../types';

interface TeamProductionDetailModalProps {
    open: boolean;
    filter: DashboardFilter;
    production: ProductionVsPlanInfo | null;
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
                    fill="#fff"
                    fontSize={11}
                    fontWeight={600}
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
                    fill="#fff"
                    fontSize={10}
                    fontWeight={500}
                    opacity={0.95}
                    className="select-none pointer-events-none"
                >
                    {value} Qty
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
                        Number(filter.SectionID)
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
                        Number(filter.SectionID),
                        dateObj,
                        production.TeamID
                    );
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


    const varianceChartData = hourlyAnalysis.map((item) => {
        const variance = item.OutputVariance ?? 0;
        return {
            ...item, 
            // if variance > 0 then not change 
            PositiveVariance: variance > 0 ? variance : 0,
            // if variance < 0 then set variance to 0
            NegativeVariance: variance < 0 ? variance : 0
        }
    })

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
                            Production Detail (Team)
                        </h2>
                        <p className="mt-1 text-sm text-slate-400">
                            Team: {production.TeamName}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 text-xl font-bold"
                    >
                        ×
                    </button>
                </div>

                {/* Content Area - Scrollable */}
                <div className="overflow-y-auto flex-1 flex flex-col min-h-0">
                    {/* Dashboard Filter Information */}
                    <div className="grid grid-cols-2 gap-4 border-b border-slate-200 p-6 md:grid-cols-5 flex-shrink-0">
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

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Shiftwork
                            </p>
                            {loadingShiftworks ? (
                                <div className="mt-2 text-xs text-slate-400">Loading...</div>
                            ) : shiftworks.length === 0 ? (
                                <div className="mt-2 text-xs text-slate-400">No shifts</div>
                            ) : (
                                <select
                                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white py-1 px-2.5 text-xs font-bold text-slate-700 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                                    value={selectedShiftworkID ?? ''}
                                    onChange={(e) => setSelectedShiftworkID(Number(e.target.value))}
                                >
                                    {shiftworks.map((sw) => (
                                        <option key={sw.ShiftWorkID} value={sw.ShiftWorkID}>
                                            {sw.ShiftWorkName}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>

                    {/* Selected Chart Data Summary */}
                    <div className="grid grid-cols-2 gap-4 p-6 md:grid-cols-3 flex-shrink-0">
                        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Team
                            </p>
                            <p className="mt-1 text-lg font-bold text-slate-800">
                                {production.TeamName}
                            </p>
                        </div>

                        <div className="rounded-xl border border-orange-100 bg-orange-50/50 p-4">
                            <p className="text-xs font-bold uppercase tracking-wider text-orange-400">
                                Day Output
                            </p>
                            <p className="mt-1 text-lg font-extrabold text-orange-600">
                                {production.DayOutput?.toLocaleString() ?? 0}
                            </p>
                        </div>

                        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                            <p className="text-xs font-bold uppercase tracking-wider text-blue-400">
                                Day Target
                            </p>
                            <p className="mt-1 text-lg font-extrabold text-blue-600">
                                {production.DayTarget?.toLocaleString() ?? 0}
                            </p>
                        </div>
                    </div>

                    {/* Tabs Selector Navigation */}
                    <div className="flex border-b border-slate-200 px-6 flex-shrink-0">
                        <button
                            className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all duration-200 ${activeTab === 'hourly_cumulative_output'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-400 hover:text-slate-700'
                                }`}
                            onClick={() => setActiveTab('hourly_cumulative_output')}
                        >
                            Cumulative Output Analysis
                        </button>

                        {/* <button
                            className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all duration-200 ${activeTab === 'defects'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-400 hover:text-slate-700'
                                }`}
                            onClick={() => setActiveTab('defects')}
                        >
                            Team Defect Analysis
                        </button> */}
                        <button
                            className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all duration-200 ${activeTab === 'hourly_production_output'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-400 hover:text-slate-700'
                                }`}
                            onClick={() => setActiveTab('hourly_production_output')}
                        >
                            Production Output Analysis
                        </button>
                    </div>

                    {/* Tab Panels Contents */}
                    <div className="p-6 flex-1 min-h-[400px]">
                        {activeTab === 'hourly_cumulative_output' ? (
                            <div className="h-full flex flex-col gap-4">
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider pl-1">
                                    Cumulative Output vs. Target
                                </h3>

                                {loadingAnalysis ? (
                                    <div className="flex flex-1 items-center justify-center border border-slate-100 rounded-xl bg-slate-50/20">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-xs font-semibold text-slate-400">Loading hourly output data...</span>
                                        </div>
                                    </div>
                                ) : hourlyAnalysis.length === 0 ? (
                                    <div className="flex flex-1 items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50/10">
                                        <span className="text-sm text-slate-400 font-medium">
                                            No hourly output data found for selected workshift.
                                        </span>
                                    </div>
                                ) : (
                                    <div className="bg-slate-50/30 p-4 rounded-xl border border-slate-100/80 flex-1 flex flex-col">
                                        <ResponsiveContainer width="100%" height={360}>
                                            <ComposedChart
                                                data={hourlyAnalysis}
                                                margin={{ top: 20, right: 20, bottom: 20, left: 10 }}
                                            >
                                                <defs>
                                                    <linearGradient id="popupCumulativePlan" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.95} />
                                                        <stop offset="100%" stopColor="#D97706" stopOpacity={0.75} />
                                                    </linearGradient>
                                                    <linearGradient id="popupRunningOutput" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#2563EB" stopOpacity={0.95} />
                                                        <stop offset="100%" stopColor="#1D4ED8" stopOpacity={0.75} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
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
                                                        border: 'none',
                                                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
                                                        fontFamily: 'sans-serif'
                                                    }}
                                                // formatter={(value: any, name: string) => {
                                                //     if (name === "OutputQty") return [value !== null ? value.toLocaleString() : '0', 'Actual Output'];
                                                //     if (name === "HourlyPlan") return [value !== null ? value.toLocaleString() : '-', 'Plan Target'];
                                                //     return [value, name];
                                                // }}
                                                />
                                                <Legend
                                                    height={36}
                                                    iconType="circle"
                                                    wrapperStyle={{ fontSize: '12px', fontWeight: 500, paddingTop: '20px' }}
                                                />
                                                <Bar
                                                    dataKey="RunningOutput"
                                                    name="Running Output"
                                                    fill="url(#popupRunningOutput)"
                                                    radius={[4, 4, 0, 0]}
                                                    barSize={32}
                                                    label={{ position: 'insideTop', fill: '#fff', fontSize: 20, fontWeight: 400 }}
                                                >
                                                    {/* <LabelList dataKey="RunningOutput" position="insideTop" angle={0} fill="#fff" fontSize={20} fontWeight={500} /> */}
                                                </Bar>
                                                <Bar
                                                    dataKey="CumulativePlan"
                                                    name="Cumulative Plan"
                                                    fill="url(#popupCumulativePlan)"
                                                    radius={[4, 4, 0, 0]}
                                                    barSize={32}
                                                    label={{ position: 'insideTop', fill: '#fff', fontSize: 20, fontWeight: 400 }}
                                                />
                                                {/* <Line
                                                    type="monotone"
                                                    dataKey="HourlyPlan"
                                                    name="HourlyPlan"
                                                    stroke="#3B82F6"
                                                    strokeWidth={3}
                                                    dot={{ r: 4, fill: "#3B82F6", stroke: "#fff", strokeWidth: 2 }}
                                                    activeDot={{ r: 6 }}
                                                    label={{ position: 'top', fill: '#2563EB', fontSize: 10, fontWeight: 600 }}
                                                /> */}
                                            </ComposedChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>
                        ) 
                        : activeTab === 'defects' ? (
                            <div className="h-full flex flex-col gap-4">
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider pl-1">
                                    Defect
                                </h3>

                                {loadingDefects ? (
                                    <div className="flex flex-1 items-center justify-center border border-slate-100 rounded-xl bg-slate-50/20">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-xs font-semibold text-slate-400">Loading defect data...</span>
                                        </div>
                                    </div>
                                ) : teamDefects.length === 0 ? (
                                    <div className="flex flex-1 items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50/10">
                                        <span className="text-sm text-slate-400 font-medium">
                                            No defect data found for this team.
                                        </span>
                                    </div>
                                ) : (
                                    <div className="bg-slate-50/30 p-4 rounded-xl border border-slate-100/80 flex-1 flex flex-col">
                                        <ResponsiveContainer width="100%" height={360}>
                                            <Treemap
                                                data={defectChartData}
                                                dataKey="value"
                                                stroke="#fff"
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
                        ) 
                        : (
                            <div className="h-full flex flex-col gap-4">
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider pl-1">
                                    Production Output vs. Target Variance
                                </h3>

                                {loadingAnalysis ? (
                                    <div className="flex flex-1 items-center justify-center border border-slate-100 rounded-xl bg-slate-50/20">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-xs font-semibold text-slate-400">Loading hourly output data...</span>
                                        </div>
                                    </div>
                                ) : hourlyAnalysis.length === 0 ? (
                                    <div className="flex flex-1 items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50/10">
                                        <span className="text-sm text-slate-400 font-medium">
                                            No hourly output data found for selected workshift.
                                        </span>
                                    </div>
                                ) : (
                                    <div className="bg-slate-50/30 p-4 rounded-xl border border-slate-100/80 flex-1 flex flex-col">
                                        <ResponsiveContainer width="100%" height={360}>
                                            <ComposedChart
                                                data={varianceChartData}
                                                stackOffset='sign'
                                                margin={{ top: 20, right: 20, bottom: 20, left: 10 }}
                                            >
                                                <defs>
                                                    <linearGradient id="popupCumulativePlan" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.95} />
                                                        <stop offset="100%" stopColor="#D97706" stopOpacity={0.75} />
                                                    </linearGradient>
                                                    <linearGradient id="popupRunningOutput" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#2563EB" stopOpacity={0.95} />
                                                        <stop offset="100%" stopColor="#1D4ED8" stopOpacity={0.75} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
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
                                                    domain={['auto', 'auto']}  // cho phép mở trục dải số âm bên dưới nếu có.
                                                />

                                                <ReferenceLine y={0} stroke="#64748b" strokeWidth={1.5} /> // vẽ kẻ trục 0 phân định trên dưới

                                                <Tooltip
                                                    formatter={(val: any, name: string) => {
                                                        if (name === 'Base Output') return [val?.toLocaleString(), 'Sản lượng thực tế'];
                                                        if (name === 'Over Target') return [`+${val?.toLocaleString()}`, 'Vượt kế hoạch'];
                                                        if (name === 'Under Target') return [`${val?.toLocaleString()}`, 'Hụt kế hoạch'];
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
                                                    name="Base Output"
                                                    stackId="varianceStack"
                                                    fill="url(#popupRunningOutput)"
                                                    barSize={32}
                                                    label = {{position: 'center', fill: '#fff', fontSize: 20, fontWeight: 400}}
                                                />
                                                <Bar
                                                    dataKey="PositiveVariance"
                                                    name="Over Target"
                                                    stackId="varianceStack"
                                                    fill="#10B981"
                                                    barSize={32}
                                                    radius={[4, 4, 0, 0]}
                                                >
                                                    <LabelList
                                                        dataKey="PositiveVariance"
                                                        position="top"
                                                        fill="#000"
                                                        fontSize={20}
                                                        fontWeight={400}
                                                        formatter={(value: any) => {
                                                            const num = Number(value);
                                                            return num > 0 ? `+${num.toLocaleString()}` : '';
                                                        }}
                                                    />
                                                </Bar>
                                                <Bar
                                                    dataKey="NegativeVariance"
                                                    name="Under Target"
                                                    stackId="varianceStack"
                                                    fill="#EF4444"
                                                    barSize={32}
                                                    radius={[0, 0, 4, 4]}
                                                    label = {{position: 'top', fill: '#000', fontSize: 20, fontWeight: 400}}
                                                />
                                            </ComposedChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="h-full flex flex-col gap-4 mt-6">
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider pl-1">
                                    Team End-Line Defect Analysis
                                </h3>

                                {loadingDefects ? (
                                    <div className="flex flex-1 items-center justify-center border border-slate-100 rounded-xl bg-slate-50/20">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-xs font-semibold text-slate-400">Loading defect data...</span>
                                        </div>
                                    </div>
                                ) : teamDefects.length === 0 ? (
                                    <div className="flex flex-1 items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50/10">
                                        <span className="text-sm text-slate-400 font-medium">
                                            No defect data found for this team.
                                        </span>
                                    </div>
                                ) : (
                                    <div className="bg-slate-50/30 p-4 rounded-xl border border-slate-100/80 flex-1 flex flex-col">
                                        <ResponsiveContainer width="100%" height={360}>
                                            <Treemap
                                                data={defectChartData}
                                                dataKey="value"
                                                stroke="#fff"
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
                </div>
            </div>
        </div>
    );
};
