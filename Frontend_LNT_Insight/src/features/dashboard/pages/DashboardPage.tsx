import React, { useState, useEffect } from 'react';
import { data, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import { DashboardHeader } from '../components/DashboardHeader';
import { TeamProductionDetailModal } from '../components/TeamProductionDetailModal';
import { OverallDefectDetailModal } from '../components/OverallDefectDetailModal';
import { ProductionOutputTableModal } from '../components/ProductionOutputTableModal';
import {
  Target as TargetIcon,
  Settings as SettingsIcon,
  AlertTriangle,
  ShieldCheck,
  Ellipsis,
  Activity,
  LayoutGrid,
  Lightbulb,
  TrendingUp,
  CheckCircle2,
  BarChart2
} from 'lucide-react';
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
} from 'recharts';
import { StatCard } from '../../../components/ui/StatCard';
import { companiesApi } from '../../../core/api/companies';
import { comparisonTrendResult } from '../utils/compareUtils';
import type { SewingTeamSummay, SewingTeamDetail } from '../../../types';
import type { DashboardFilter } from '../types/TeamSewingFilters';

export const DashboardPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedCompanyID } = useAuth();
  const todayStr = new Date().toLocaleDateString('sv-SE');

  // Dashboard Filter
  const [filter, setFilter] = useState<DashboardFilter>({
    CompanyID: selectedCompanyID || searchParams.get('companyId') || searchParams.get('CompanyId') || 'COM01',
    CompanyName: '',

    SiteID: searchParams.get('siteId') || searchParams.get('SiteId') || 'Site1',
    SiteCode: '',

    SectionID: searchParams.get('sectionId') || searchParams.get('SectionId') || '0',
    SectionName: '',

    Date: searchParams.get('date') || searchParams.get('Date') || todayStr,
  });

  // Đồng bộ filter.CompanyID khi selectedCompanyID ở Main Header thay đổi
  useEffect(() => {
    if (selectedCompanyID && selectedCompanyID !== filter.CompanyID) {
      setFilter(prev => ({
        ...prev,
        CompanyID: selectedCompanyID
      }));
      setSearchParams(prev => {
        prev.set('companyId', selectedCompanyID);
        return prev;
      });
    }
  }, [selectedCompanyID]);

  const [productionData, setProductionData] = useState<SewingTeamDetail[]>([]);
  const [filterProductionData, setFilterProductionData] = useState<any[]>([]);
  const [dataSewingTeamSummary, setDataSewingTeamSummary] = useState<SewingTeamSummay[]>([]);
  const [prevDataSewingTeamSummary, setPrevDataSewingTeamSummary] = useState<SewingTeamSummay[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Modals state
  const [selectedProduction, setSelectedProduction] = useState<SewingTeamDetail | null>(null);
  const [isDefectModalOpen, setIsDefectModalOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);

  // Load Dashboard Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const dateObj = new Date(filter.Date);
        const prevDateStr = await companiesApi.getPreviousWorkingDay(filter.CompanyID, filter.SiteID, filter.Date);
        const prevDateObj = new Date(prevDateStr);

        const [prodResult, summaryResult, prevSummaryResult] = await Promise.all([
          companiesApi.getTeamSewingDetail(filter.CompanyID, filter.SiteID, Number(filter.SectionID), dateObj),
          companiesApi.getTeamSewingSummary(filter.CompanyID, filter.SiteID, Number(filter.SectionID), dateObj),
          companiesApi.getTeamSewingSummary(filter.CompanyID, filter.SiteID, Number(filter.SectionID), prevDateObj)
        ]);
        setProductionData(prodResult);
        setDataSewingTeamSummary(summaryResult);
        setPrevDataSewingTeamSummary(prevSummaryResult);

        // filter for get sumary:
        const datafilter = prodResult.reduce((acc, cur) => {
          const dataGroup = cur.SectionID;
          // neu như object chua co bien nao thuoc sectionID thi tao bien moi voi value mac dinh
          if (!acc[dataGroup]) {
            acc[dataGroup] = {
              DayTargetTotal: 0,
              DayOutputTotal: 0,
              DayPercent: 0
            }
          }
          // neu như object co bien thuoc sectionID thi tiep tuc cong don:
          acc[dataGroup].DayTargetTotal += cur.MOPlanQty;
          acc[dataGroup].DayOutputTotal += cur.OutputQty;
          acc[dataGroup].DayPercent = (acc[dataGroup].DayTargetTotal) / (acc[dataGroup].DayOutputTotal);
          return acc;
        }, {} as Record<number, any>);
        // maping dataFilter to array:
        const mapDataFilter = Object.keys(datafilter).map(keyObj => {
          return {
            SectionID: keyObj,
            ...datafilter[Number(keyObj)]
          }
        })
        // set data
        setFilterProductionData(mapDataFilter);
        console.log("data filter: ", mapDataFilter);

      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
        setProductionData([]);
        setDataSewingTeamSummary([]);
        setPrevDataSewingTeamSummary([]);
      } finally {
        setLoading(false);
      }
    };
    if (filter.CompanyID && filter.SiteID && filter.SectionID && filter.Date) {
      fetchData();
    }
  }, [filter.CompanyID, filter.SiteID, filter.SectionID, filter.Date, refreshTrigger]);

  // Apply Filter từ DashboardHeader
  const handleApplyFilter = (newFilter: DashboardFilter) => {
    setFilter(newFilter);
    setRefreshTrigger(prev => prev + 1);
    // Đồng bộ filter ID lên URL
    setSearchParams({
      companyId: newFilter.CompanyID,
      siteId: newFilter.SiteID,
      sectionId: newFilter.SectionID,
      date: newFilter.Date,
    });
  };

  // Calculate dynamic stats for active day
  const totalOutput = dataSewingTeamSummary[0]?.OutputQty ?? 0;
  const totalTarget = dataSewingTeamSummary[0]?.MOPlanQty ?? 0;
  const achievementRate = totalTarget > 0 ? (totalOutput / totalTarget) * 100 : 0;
  const inspection = dataSewingTeamSummary[0]?.InspectedQty ?? 0;
  const defect = dataSewingTeamSummary[0]?.DefectQty ?? 0;
  const defectRate = dataSewingTeamSummary[0]?.DefectRate ?? 0;
  const defectGMT = `${defect}/${defectRate}%`;

  // Stats for previous working day
  const prevOutput = prevDataSewingTeamSummary[0]?.OutputQty ?? 0;
  const prevTarget = prevDataSewingTeamSummary[0]?.MOPlanQty ?? 0;
  const prevAchievementRate = prevTarget > 0 ? (prevOutput / prevTarget) * 100 : 0;
  const prevInspection = prevDataSewingTeamSummary[0]?.InspectedQty ?? 0;
  const prevDefectRate = prevDataSewingTeamSummary[0]?.DefectRate ?? 0;

  // Dynamic comparison trends vs previous day
  const targetTrend = comparisonTrendResult(prevTarget, totalTarget);
  const outputTrend = comparisonTrendResult(prevOutput, totalOutput);
  const rateTrend = comparisonTrendResult(prevAchievementRate, achievementRate, true);
  const qualityTrend = comparisonTrendResult(prevInspection, inspection);
  const defectTrend = comparisonTrendResult(prevDefectRate, defectRate, true);

  // Highest contributing team for Key Insights

  const getHighestTeam = productionData.length > 0
    ? [...productionData].sort((a, b) => (b.OutputQty ?? 0) - (a.OutputQty ?? 0))[0]
    : null;
  const highestTeam = (getHighestTeam?.OutputQty ?? 0) > 0 ? getHighestTeam : null;

  const highestContrib = (totalOutput > 0 && highestTeam?.OutputQty)
    ? ((highestTeam.OutputQty / totalOutput) * 100).toFixed(1)
    : '';

  // Render
  return (
    <div className="space-y-2">
      {/* Header */}
      <DashboardHeader
        filter={filter}
        onApplyFilter={handleApplyFilter}
        isLoading={loading}
      />

      {loading && productionData.length === 0 ? (
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-semibold text-slate-500">Loading production dashboard...</span>
          </div>
        </div>
      ) : (
        <div className={`space-y-2 transition-opacity duration-200 ${loading ? 'opacity-70 pointer-events-none' : 'opacity-100'}`}>

          {/* 5 Cards KPI ở trên cùng */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            <StatCard
              variant="target"
              title="TOTAL TARGET"
              value={totalTarget.toLocaleString()}
              subtitle="Cumulative Shift Plan (PCS)"
              icon={<TargetIcon size={20} />}
              trendValue={targetTrend.trendValue}
              trendType={targetTrend.trendType}
              trendLabel="vs. previous day"
            />

            <StatCard
              variant="output"
              title="TOTAL OUTPUT"
              value={totalOutput.toLocaleString()}
              subtitle="Cumulative Actual Output (PCS)"
              icon={<SettingsIcon size={20} />}
              trendValue={outputTrend.trendValue}
              trendType={outputTrend.trendType}
              trendLabel="vs. previous day"
            />

            <StatCard
              variant="rate"
              title="ACHIEVEMENT RATE"
              value={`${achievementRate.toFixed(1)}%`}
              subtitle="Actual Output / Shift Plan"
              icon={<TargetIcon size={20} />}
              trendValue={rateTrend.trendValue}
              trendType={rateTrend.trendType}
              trendLabel="vs. previous day"
            />

            <StatCard
              variant="quality"
              title="QUALITY INSPECTED GMT"
              value={inspection.toString()}
              subtitle="Sewing End line Inspection"
              icon={<AlertTriangle size={20} />}
              trendValue={qualityTrend.trendValue}
              trendType={qualityTrend.trendType}
              trendLabel="vs. previous day"
            />

            <StatCard
              variant="defect"
              title="DEFECT GMT"
              value={defectGMT.toString()}
              subtitle="Defect (PCS) / Defect Rate"
              icon={<ShieldCheck size={20} />}
              trendValue={defectTrend.trendValue}
              trendType={defectTrend.trendType}
              trendLabel="vs. previous day"
              titleColorClass="text-[#0D9488]"
              onClick={() => setIsDefectModalOpen(true)}
            />
          </div>

          {/* SECTION PERFORMANCE OVERVIEW */}
          <div className="bg-background rounded-2xl border-6 border-white shadow-xs p-1 px-1 flex flex-col md:flex-row items-stretch md:items-center gap-5">
            {/* Header: Icon + Title */}
            <div className="flex items-center gap-3 shrink-0 md:pr-6 md:border-r border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-xs shrink-0">
                <LayoutGrid size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-black text-blue-900 tracking-wider leading-tight uppercase">
                  SECTION
                </span>
                <span className="text-[11px] font-black text-blue-900 tracking-wider leading-tight uppercase">
                  PERFORMANCE
                </span>
                <span className="text-[11px] font-black text-blue-900 tracking-wider leading-tight uppercase">
                  OVERVIEW
                </span>
              </div>
            </div>

            {/* List of Team Performance Boxes */}
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5">
              {(filterProductionData.length > 0
                ? filterProductionData
                : [
                  // { TeamName: 'S1', DayOutput: 25, DayTarget: 175 },
                  // { TeamName: 'S2', DayOutput: 217, DayTarget: 839 },
                  // { TeamName: 'S3', DayOutput: 0, DayTarget: 0 },
                  // { TeamName: 'S4', DayOutput: 0, DayTarget: 0 },
                  // { TeamName: 'S5', DayOutput: 0, DayTarget: 0 },
                ]
              ).map((item, idx) => {
                const colors = ['#276ebe'];
                const teamColor = colors[idx % colors.length];
                const target = item.DayTargetTotal ?? 0;
                const output = item.DayOutputTotal ?? 0;
                const rate = (item.DayPercent ?? 0);
                const displayRate = `${((output / target) * 100).toFixed(1)}%`;

                return (
                  <div key={item.SectionID} className="flex flex-col gap-1.5 bg-white p-4 rounded-xl">
                    {/* Top: Color Dot + Team Name */}
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: teamColor }}
                      />
                      <span className="text-[14px] font-bold text-slate-800 truncate">
                        S{item.SectionID}
                      </span>
                    </div>

                    {/* Middle: output / target + percent */}
                    <div className="flex items-center justify-between text-[13px] text-slate-600 font-semibold">
                      <span>{`${output} / ${target}`}</span>
                      <span>{displayRate}</span>
                    </div>

                    {/* Bottom: Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(rate, 100)}%`,
                          backgroundColor: teamColor,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PRODUCTION OUTPUT STATUS (Chart) */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-4 flex flex-col gap-4">
            {/* Chart Header: Title & Custom Legend & Ellipsis Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
              {/* Left: Icon & Title */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center shadow-xs shrink-0">
                  <BarChart2 size={18} />
                </div>
                <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                  PRODUCTION OUTPUT STATUS
                </h2>
              </div>

              {/* Right: Legend & Table modal trigger */}
              <div className="flex items-center gap-6">
                {/* 4 Legend Items: Target, Output, Achieved, Defect */}
                <div className="flex items-center gap-4 text-xs font-medium">
                  {/* Target (Brown) */}
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#d6951b]" />
                    <span className="text-slate-600">Target</span>
                  </div>
                  {/* Output (Blue) */}
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
                    <span className="text-slate-600">Output</span>
                  </div>
                  {/* Inspected Qty  (Green) */}
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
                    {/* <span className="w-2.5 h-2.5 rounded-full bg-[#276ebe]" /> */}
                    <span className="text-slate-600">Inspected Qty </span>
                  </div>
                  {/* Defect (Purple) */}
                  {/* <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#A855F7]" />
                    <span className="text-slate-600">Defect</span>
                  </div> */}
                </div>

                <button
                  type="button"
                  onClick={() => setIsTableModalOpen(true)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="View production data table"
                >
                  <Ellipsis size={18} />
                </button>
              </div>
            </div>

            {/* Chart Canvas */}
            <div className="h-[300px] w-full">
              {productionData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-400 font-medium">
                  No production data found for this company and site.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={productionData}
                    margin={{ top: 25, right: 20, bottom: 10, left: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="TeamName"
                      stroke="#94a3b8"
                      fontSize={11}
                      fontWeight={700}
                      tickLine={false}
                      dy={8}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      fontWeight={500}
                      tickLine={false}
                      axisLine={false}
                      dx={-8}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
                        fontFamily: 'sans-serif',
                        fontSize: '12px',
                        padding: '10px 14px'
                      }}
                      formatter={(value: any, name: string) => {
                        if (name === "Target") return [value ? value.toLocaleString() : '-', 'Target'];
                        if (name === "Output") return [value ? value.toLocaleString() : '0', 'Actual Output'];
                        if (name === "Inspected") return [value ? value.toLocaleString() : '0', 'Inspected'];
                        // if (name === "Defect") return [value ? value.toLocaleString() : '0', 'Defect Qty'];
                        return [value, name];
                      }}
                    />

                    {/* Brown Target Line */}
                    <Line
                      type="monotone"
                      dataKey="MOPlanQty"
                      name="Target"
                      stroke="#d6951b"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: "#d6951b", stroke: "#fff", strokeWidth: 1.5 }}
                      activeDot={{ r: 6 }}
                      label={{ position: 'top', fill: '#d6951b', fontSize: 13, fontWeight: 700 }}
                    />

                    {/* Blue Output Bar */}
                    <Bar
                      dataKey="OutputQty"
                      name="Output"
                      fill="#38BDF8"
                      radius={[3, 3, 0, 0]}
                      barSize={22}
                      label={{ position: 'top', fill: '#0284C7', fontSize: 13, fontWeight: 600 }}
                      onClick={(data) => { setSelectedProduction(data.payload) }}
                      cursor="pointer"
                    />

                    {/* Green Inspected Bar */}
                    <Bar
                      dataKey="InspectedQty"
                      name="Inspected"
                      fill="#22C55E"
                      radius={[3, 3, 0, 0]}
                      barSize={22}
                      label={{ position: 'top', fill: '#16A34A', fontSize: 13, fontWeight: 600 }}
                      onClick={(data) => { setSelectedProduction(data.payload) }}
                      cursor="pointer"
                    />

                    {/* Purple Defect Bar */}
                    {/* <Bar
                        dataKey="DefectQty"
                        name="Defect"
                        fill="#A855F7"
                        radius={[3, 3, 0, 0]}
                        barSize={22}
                        label={{ position: 'top', fill: '#7C3AED', fontSize: 13, fontWeight: 600 }}
                        onClick={(data) => { setSelectedProduction(data.payload) }}
                        cursor="pointer"
                      /> */}
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* KEY INSIGHTS */}
          <div className="bg-background rounded-2xl border-white border-6 shadow-xs p-2 flex flex-col xl:flex-row items-stretch xl:items-center gap-6">
            {/* Header: Lightbulb Icon + Title */}
            <div className="flex items-center gap-3 shrink-0 xl:pr-6 xl:border-r border-slate-100">
              <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Lightbulb size={20} />
              </div>
              <span className="text-xs font-black text-slate-800 tracking-wider uppercase">
                KEY INSIGHTS
              </span>
            </div>

            {/* 4 Insights Columns */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
              {/* Item 1: Total Output */}
              <div className="flex items-center gap-3.5 sm:px-4 first:pl-0 border-r-1 border-zinc-300">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <div className="text-[13px] font-medium text-slate-500">Total Output</div>
                  <div className={`text-[19px] font-bold leading-tight ${outputTrend.diff >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>
                    {outputTrend.trendValue}
                  </div>
                  <div className="text-[12px] text-slate-400">vs. previous day</div>
                </div>
              </div>

              {/* Item 2: Highest contribution team */}
              <div className="flex items-center gap-3.5 sm:px-4 border-r-1 border-zinc-300">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <TargetIcon size={18} />
                </div>
                <div>
                  <div className="text-[13px] font-medium text-slate-500 truncate">
                    {highestTeam?.TeamName || 'N/A'} has highest contribution
                  </div>
                  <div className="text-[19px] font-bold text-blue-600 leading-tight">
                    {highestContrib}%
                  </div>
                  <div className="text-[12px] text-slate-400">of total output</div>
                </div>
              </div>

              {/* Item 3: Achievement rate */}
              <div className="flex items-center gap-3.5 sm:px-4 border-r-1 border-zinc-300">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <div className="text-[13px] font-medium text-slate-500">
                    Achievement rate {rateTrend.diff >= 0 ? 'increased' : 'decreased'}
                  </div>
                  <div className={`text-[19px] font-bold leading-tight ${rateTrend.diff >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {rateTrend.trendValue}
                  </div>
                  <div className="text-[12px] text-slate-400">vs. previous day</div>
                </div>
              </div>

              {/* Item 4: Defect rate */}
              <div className="flex items-center gap-3.5 sm:px-4">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <div className="text-[13px] font-medium text-slate-500">
                    Defect rate {defectTrend.diff <= 0 ? 'decreased' : 'increased'}
                  </div>
                  <div className={`text-[19px] font-bold leading-tight ${defectTrend.diff <= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                    {defectTrend.trendValue}
                  </div>
                  <div className="text-[12px] text-slate-400">vs. previous day</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ProductionOutputTableModal
        open={isTableModalOpen}
        filter={filter}
        data={productionData}
        onClose={() => setIsTableModalOpen(false)}
      />
      <TeamProductionDetailModal
        open={selectedProduction !== null}
        filter={filter}
        production={selectedProduction}
        onClose={() => setSelectedProduction(null)}
      />
      <OverallDefectDetailModal
        open={isDefectModalOpen}
        filter={filter}
        onClose={() => setIsDefectModalOpen(false)}
        inspectedQty={inspection}
        defectQty={defect}
        defectRate={defectRate}
      />
    </div>
  );
};
