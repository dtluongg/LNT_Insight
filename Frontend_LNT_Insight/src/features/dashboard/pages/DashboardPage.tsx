import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import { DashboardHeader } from '../components/DashboardHeader';
import { TeamProductionDetailModal } from '../components/TeamProductionDetailModal';
import { OverallDefectDetailModal } from '../components/OverallDefectDetailModal';
import { ProductionOutputTableModal } from '../components/ProductionOutputTableModal';
import {
  Target as TargetIcon,
  AlertTriangle,
  ShieldCheck,
  Ellipsis,
  LayoutGrid,
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
  Cell,
  ReferenceLine
} from 'recharts';
import { StatCard } from '../../../components/ui/StatCard';
// import { companiesApi } from '../../../core/api/companies';
import { md3smd2Api } from '../../../core/api/md3smd2';
import { comparisonTrendResult } from '../utils/compareUtils';
import type { SewingTeamSummay, SewingTeamDetail } from '../../../types';
import type { DashboardFilter } from '../types/TeamSewingFilters';

export const DashboardPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedCompanyID, authorizedCompanies } = useAuth();
  const currentCompany = authorizedCompanies.find((item) => item.companyID === selectedCompanyID);
  const todayStr = new Date().toLocaleDateString('sv-SE');

  // Dashboard Filter
  const initialSectionID = searchParams.get('sectionId') || searchParams.get('SectionId') || '0';
  const [filter, setFilter] = useState<DashboardFilter>({
    CompanyID: selectedCompanyID || searchParams.get('companyId') || searchParams.get('CompanyId') || 'COM01',
    CompanyName: currentCompany?.companyName ?? '',

    SiteID: searchParams.get('siteId') || searchParams.get('SiteId') || 'Site1',
    SiteCode: '',

    SectionID: searchParams.get('sectionId') || searchParams.get('SectionId') || '0',
    SectionName: initialSectionID === '0' ? 'All' : '',

    Date: searchParams.get('date') || searchParams.get('Date') || todayStr,
  });

  // Đồng bộ filter.CompanyID khi selectedCompanyID ở Main Header thay đổi
  useEffect(() => {
    if (selectedCompanyID && selectedCompanyID !== filter.CompanyID) {
      // find company:
      const findCurrentCompany = authorizedCompanies.find((comp) => comp.companyID === selectedCompanyID);
      const newCompanyName = findCurrentCompany?.companyName ?? '';
      setFilter(prev => ({
        ...prev,
        CompanyID: selectedCompanyID,
        CompanyName: newCompanyName
      }));
      setSearchParams(prev => {
        prev.set('companyId', selectedCompanyID);
        return prev;
      });
    }
  }, [selectedCompanyID, authorizedCompanies]);

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
  const [chartView, setChartView] = useState<'output' | 'defect'>('output');

  // Load Dashboard Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const dateObj = new Date(filter.Date);
        const prevDateStr = await md3smd2Api.getPreviousWorkingDay(filter.Date);
        const prevDateObj = new Date(prevDateStr);

        const [prodResult, summaryResult, prevSummaryResult, prodResultForOverview] = await Promise.all([
          md3smd2Api.getTeamSewingDetail(filter.CompanyID, filter.SiteID, Number(filter.SectionID), dateObj),
          md3smd2Api.getTeamSewingSummary(filter.CompanyID, filter.SiteID, Number(filter.SectionID), dateObj),
          md3smd2Api.getTeamSewingSummary(filter.CompanyID, filter.SiteID, Number(filter.SectionID), prevDateObj),
          md3smd2Api.getTeamSewingDetail(filter.CompanyID, filter.SiteID, 0, dateObj),
        ]);
        setProductionData(prodResult);
        setDataSewingTeamSummary(summaryResult);
        setPrevDataSewingTeamSummary(prevSummaryResult);

        // filter for get sumary:
        const datafilter = prodResultForOverview.reduce((acc, cur) => {
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
        // console.log("data filter: ", mapDataFilter);

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

  // Custom Tooltip cho Biểu đồ Sản lượng (Chart 1)
  const renderOutputTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0]?.payload as SewingTeamDetail;
    if (!data) return null;

    return (
      <div className="bg-slate-900/95 backdrop-blur-md px-3.5 py-3 rounded-xl border border-slate-700/80 shadow-2xl min-w-[200px] text-xs">
        <div className="font-bold text-white text-[13px] pb-2 mb-2 border-b border-slate-700/70">
          {data.TeamName}
        </div>
        <div className="space-y-2">
          {/* Target */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] shrink-0" />
              <span>Target:</span>
            </div>
            <span className="font-bold text-[#f59e0b] text-[13px]">
              {data.MOPlanQty != null ? data.MOPlanQty.toLocaleString() : '-'}
            </span>
          </div>

          {/* Actual Output */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8] shrink-0" />
              <span>Actual Output:</span>
            </div>
            <span className="font-bold text-[#38BDF8] text-[13px]">
              {data.OutputQty != null ? data.OutputQty.toLocaleString() : '0'}
            </span>
          </div>

          {/* Inspected */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] shrink-0" />
              <span>Inspected:</span>
            </div>
            <span className="font-bold text-[#22C55E] text-[13px]">
              {data.InspectedQty != null ? data.InspectedQty.toLocaleString() : '0'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Custom Tooltip cho Biểu đồ Defect Rate (Chart 2) - Đúng màu tương ứng với từng cột
  const renderDefectTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0]?.payload as SewingTeamDetail;
    if (!data) return null;

    const rate = data.DefectRate != null ? Number(data.DefectRate) : 0;
    const roundedRate = Math.round(rate * 100) / 100;
    // Màu tương ứng theo mức độ lỗi: < 2% Xanh đậm, 2 - <5% Xanh sáng, = 5% Vàng, > 5% Đỏ
    const statusColor =
      roundedRate > 5
        ? '#EF4444'
        : roundedRate === 5
        ? '#EAB308'
        : roundedRate >= 2
        ? '#22C55E'
        : '#15803D';
    const statusBg =
      roundedRate > 5
        ? 'bg-[#EF4444]'
        : roundedRate === 5
        ? 'bg-[#EAB308]'
        : roundedRate >= 2
        ? 'bg-[#22C55E]'
        : 'bg-[#15803D]';
    const statusLabel =
      roundedRate > 5
        ? 'High Risk (> 5%)'
        : roundedRate === 5
        ? 'At Target (5%)'
        : roundedRate >= 2
        ? 'Normal (2% - 5%)'
        : 'Good (< 2%)';

    return (
      <div className="bg-slate-900/95 backdrop-blur-md px-3.5 py-3 rounded-xl border border-slate-700/80 shadow-2xl min-w-[200px] text-xs">
        <div className="font-bold text-white text-[13px] pb-2 mb-2 border-b border-slate-700/70 flex items-center justify-between gap-3">
          <span>{data.TeamName}</span>
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-white"
            style={{ backgroundColor: statusColor }}
          >
            {statusLabel}
          </span>
        </div>

        <div className="space-y-2">
          {/* Defect Rate hiển thị ĐÚNG MÀU TƯƠNG ỨNG với cột */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              <span className={`w-2.5 h-2.5 rounded-full ${statusBg} shrink-0`} />
              <span>Defect Rate:</span>
            </div>
            <span className="font-extrabold text-[14px]" style={{ color: statusColor }}>
              {`${rate}%`}
            </span>
          </div>

          {/* Chi tiết số lỗi / số kiểm tra nếu có */}
          {(data.DefectQty != null || data.InspectedQty != null) && (
            <div className="flex items-center justify-between gap-4 pt-1.5 border-t border-slate-800 text-[11px] text-slate-400">
              <span>Defect / Inspected:</span>
              <span className="font-semibold text-slate-200">
                {`${(data.DefectQty || 0).toLocaleString()} / ${(data.InspectedQty || 0).toLocaleString()} PCS`}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

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
              icon={<TrendingUp size={20} />}
              trendValue={outputTrend.trendValue}
              trendType={outputTrend.trendType}
              trendLabel="vs. previous day"
            />

            <StatCard
              variant="rate"
              title="ACHIEVEMENT RATE"
              value={`${achievementRate.toFixed(1)}%`}
              subtitle="Actual Output / Shift Plan"
              icon={<CheckCircle2 size={20} />}
              trendValue={rateTrend.trendValue}
              trendType={rateTrend.trendType}
              trendLabel="vs. previous day"
            />

            <StatCard
              variant="quality"
              title="QUALITY INSPECTED GMT"
              value={inspection.toString()}
              subtitle="Sewing End line Inspection"
              icon={<ShieldCheck size={20} />}
              trendValue={qualityTrend.trendValue}
              trendType={qualityTrend.trendType}
              trendLabel="vs. previous day"
            />

            <StatCard
              variant="defect"
              title="DEFECT GMT"
              value={defectGMT.toString()}
              subtitle="Defect (PCS) / Defect Rate"
              icon={<AlertTriangle size={20} />}
              trendValue={defectTrend.trendValue}
              trendType={defectTrend.trendType}
              trendLabel="vs. previous day"
              // titleColorClass="text-[#590a1a]"
              onClick={() => setIsDefectModalOpen(true)}
            />
          </div>

          {/* SECTION PERFORMANCE OVERVIEW */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border-6 border-white dark:border-slate-800 shadow-xs p-1 px-1 flex flex-col md:flex-row items-stretch md:items-center gap-5 transition-colors duration-200">
            {/* Header: Icon + Title */}
            <div className="flex items-center gap-3 shrink-0 md:pr-6 md:border-r border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-xs shrink-0">
                <LayoutGrid size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-black text-blue-900 dark:text-blue-400 tracking-wider leading-tight uppercase">
                  SECTION
                </span>
                <span className="text-[11px] font-black text-blue-900 dark:text-blue-400 tracking-wider leading-tight uppercase">
                  PERFORMANCE
                </span>
                <span className="text-[11px] font-black text-blue-900 dark:text-blue-400 tracking-wider leading-tight uppercase">
                  OVERVIEW
                </span>
              </div>
            </div>

            {/* List of Team Performance Boxes */}
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5">
              {(filterProductionData.length > 0
                ? filterProductionData
                : []
              ).map((item, idx) => {
                const colors = ['#276ebe'];
                const teamColor = colors[idx % colors.length];
                const target = item.DayTargetTotal ?? 0;
                const output = item.DayOutputTotal ?? 0;
                // const rate = (item.DayPercent ?? 0);
                // const displayRate = `${((output / target) * 100).toFixed(1)}%`;
                // const displayRate = `${((output / target) * 100).toFixed(1)}%`;

                // calculate when output and target > 0
                const calculatedRate = target > 0 && output > 0 ? (output / target) * 100 : 0;
                // format view number and %
                const displayRate = `${calculatedRate.toFixed(1)}%`;
                // calculate width progress
                const progressWidth = Math.min(Math.max(calculatedRate, 0), 100);

                return (
                  <div key={item.SectionID} className="flex flex-col gap-1.5 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700/60">
                    {/* Top: Color Dot + Team Name */}
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: teamColor }}
                      />
                      <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate">
                        S{item.SectionID}
                      </span>
                    </div>

                    {/* Middle: output / target + percent */}
                    <div className="flex items-center justify-between text-[13px] text-slate-600 dark:text-slate-300 font-semibold">
                      <span>{`${output} / ${target}`}</span>
                      <span>{displayRate}</span>
                    </div>

                    {/* Bottom: Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          // width: `${Math.min(rate, 100)}%`,
                          width: `${progressWidth}%`,
                          backgroundColor: teamColor,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PRODUCTION OUTPUT STATUS / DEFECT RATE (Chart with Switcher) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs p-4 flex flex-col gap-4 transition-colors duration-200">
            {/* Chart Header: Title & Switcher & Custom Legend & Ellipsis Button */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800/80">
              {/* Left: 2 Interactive Header Tabs */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                {/* Header Tab 1: PRODUCTION OUTPUT STATUS */}
                <button
                  type="button"
                  onClick={() => setChartView('output')}
                  className={`group flex items-center gap-2.5 pb-2 -mb-2 relative transition-all cursor-pointer ${chartView === 'output' ? 'opacity-100' : 'opacity-40 hover:opacity-80'
                    }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-xs shrink-0 transition-all ${chartView === 'output'
                    ? 'bg-blue-500 text-white ring-2 ring-blue-400/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                    }`}>
                    <BarChart2 size={18} />
                  </div>
                  <h2 className={`text-sm font-extrabold uppercase tracking-wider transition-colors ${chartView === 'output'
                    ? 'text-slate-800 dark:text-slate-100'
                    : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                    }`}>
                    PRODUCTION OUTPUT STATUS
                  </h2>
                  {/* Active Underline Indicator */}
                  {chartView === 'output' && (
                    <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
                  )}
                </button>

                {/* Vertical Divider */}
                <div className="hidden sm:block h-5 w-px bg-slate-200 dark:bg-slate-700" />

                {/* Header Tab 2: END LINE DEFECT RATE ANALYSIS */}
                <button
                  type="button"
                  onClick={() => setChartView('defect')}
                  className={`group flex items-center gap-2.5 pb-2 -mb-2 relative transition-all cursor-pointer ${chartView === 'defect' ? 'opacity-100' : 'opacity-40 hover:opacity-80'
                    }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-xs shrink-0 transition-all ${chartView === 'defect'
                    ? 'bg-rose-500 text-white ring-2 ring-rose-400/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                    }`}>
                    <AlertTriangle size={18} />
                  </div>
                  <h2 className={`text-sm font-extrabold uppercase tracking-wider transition-colors ${chartView === 'defect'
                    ? 'text-slate-800 dark:text-slate-100'
                    : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                    }`}>
                    END LINE DEFECT RATE ANALYSIS
                  </h2>
                  {/* Active Underline Indicator */}
                  {chartView === 'defect' && (
                    <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-rose-500 rounded-full" />
                  )}
                </button>
              </div>

              {/* Right: Legend & Table modal trigger */}
              <div className="flex items-center gap-4 sm:gap-6 justify-between lg:justify-end">
                {chartView === 'output' ? (
                  /* Legend for Output */
                  <div className="flex items-center gap-4 text-xs font-medium">
                    {/* Target (Amber) */}
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                      <span className="text-slate-700 dark:text-slate-200 font-semibold">Target</span>
                    </div>
                    {/* Output (Blue) */}
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
                      <span className="text-slate-700 dark:text-slate-200 font-semibold">Output</span>
                    </div>
                    {/* Inspected Qty (Green) */}
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
                      <span className="text-slate-700 dark:text-slate-200 font-semibold">Inspected Qty</span>
                    </div>
                  </div>
                ) : (
                  /* Legend for Defect Rate */
                  <div className="flex items-center gap-3 text-xs font-semibold">
                    <span className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[11px] mr-0.5">Defect:</span>
                    {/* Dưới 2%: Xanh đậm */}
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#15803D]" />
                      <span className="text-green-700 dark:text-green-400">&lt; 2%</span>
                    </div>
                    {/* 2% đến 5%: Xanh sáng */}
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
                      <span className="text-emerald-600 dark:text-emerald-400">2% - 5%</span>
                    </div>
                    {/* = 5%: Vàng */}
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#EAB308]" />
                      <span className="text-yellow-600 dark:text-yellow-400"> 5%</span>
                    </div>
                    {/* Trên 5%: Đỏ */}
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                      <span className="text-rose-600 dark:text-rose-400">&gt; 5%</span>
                    </div>
                    {/* Target KPI */}
                    <div className="flex items-center gap-1.5 pl-1 border-l border-slate-200 dark:border-slate-700">
                      <span className="w-3.5 h-0.5 border-t-2 border-dashed border-[#F43F5E]" />
                      <span className="text-rose-500 dark:text-rose-400 font-bold">KPI: 5%</span>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setIsTableModalOpen(true)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="View production data table"
                >
                  <Ellipsis size={18} />
                </button>
              </div>
            </div>

            {/* Chart Canvas */}
            <div className="h-[360px] w-full">
              {productionData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-400 font-medium">
                  No production data found for this company and site.
                </div>
              ) : chartView === 'output' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={productionData}
                    margin={{ top: 25, right: 20, bottom: 15, left: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
                    <XAxis
                      dataKey="TeamName"
                      interval={0}
                      angle={-35}
                      textAnchor="end"
                      height={60}
                      stroke="#94a3b8"
                      fontSize={10}
                      fontWeight={700}
                      tickLine={false}
                      dy={4}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      fontWeight={500}
                      tickLine={false}
                      axisLine={false}
                      dx={-8}
                    />
                    <Tooltip content={renderOutputTooltip} />

                    {/* Amber Target Line */}
                    <Line
                      type="monotone"
                      dataKey="MOPlanQty"
                      name="Target"
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: "#f59e0b", stroke: "#fff", strokeWidth: 1.5 }}
                      activeDot={{ r: 6 }}
                      label={{ position: 'top', fill: '#f59e0b', fontSize: 13, fontWeight: 700 }}
                    />

                    {/* Blue Output Bar */}
                    <Bar
                      dataKey="OutputQty"
                      name="Output"
                      fill="#38BDF8"
                      radius={[3, 3, 0, 0]}
                      barSize={22}
                      label={{ position: 'top', fill: '#38BDF8', fontSize: 13, fontWeight: 600 }}
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
                      label={{ position: 'top', fill: '#22C55E', fontSize: 13, fontWeight: 600 }}
                      onClick={(data) => { setSelectedProduction(data.payload) }}
                      cursor="pointer"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                /* DEFECT RATE CHART */
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={productionData}
                    margin={{ top: 25, right: 20, bottom: 15, left: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
                    <XAxis
                      dataKey="TeamName"
                      interval={0}
                      angle={-35}
                      textAnchor="end"
                      height={60}
                      stroke="#94a3b8"
                      fontSize={10}
                      fontWeight={700}
                      tickLine={false}
                      dy={4}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      fontWeight={500}
                      tickLine={false}
                      axisLine={false}
                      dx={-8}
                      unit="%"
                      domain={[0, (dataMax: number) => Math.max(Math.ceil((dataMax || 0) + 1), 6)]}
                    />
                    <Tooltip content={renderDefectTooltip} />

                    {/* Vạch đỏ ngưỡng KPI trần 5% */}
                    <ReferenceLine
                      y={5}
                      stroke="#EAB308"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{
                        value: 'KPI Target: 5.0%',
                        position: 'insideTopRight',
                        fill: '#EAB308',
                        fontSize: 11,
                        fontWeight: 700
                      }}
                    />

                    {/* Cột Defect Rate tự đổi màu theo % */}
                    <Bar
                      dataKey="DefectRate"
                      name="Defect Rate"
                      fill="#f43f5e"
                      radius={[4, 4, 0, 0]}
                      barSize={24}
                      label={(props: any) => {
                        const { x, y, width, value } = props;
                        if (value == null) return null;
                        const rate = Number(value) || 0;
                        const rounded = Math.round(rate * 100) / 100;
                        const color =
                          rounded > 5
                            ? '#EF4444'
                            : rounded === 5
                            ? '#EAB308'
                            : rounded >= 2
                            ? '#22C55E'
                            : '#15803D';
                        return (
                          <text
                            x={x + width / 2}
                            y={y - 6}
                            fill={color}
                            textAnchor="middle"
                            fontSize={11}
                            fontWeight={700}
                          >
                            {`${rate}%`}
                          </text>
                        );
                      }}
                    >
                      {productionData.map((entry, index) => {
                        const rate = entry.DefectRate || 0;
                        const rounded = Math.round(rate * 100) / 100;
                        const color =
                          rounded > 5
                            ? '#EF4444'
                            : rounded === 5
                            ? '#EAB308'
                            : rounded >= 2
                            ? '#22C55E'
                            : '#15803D';
                        return <Cell key={`defect-cell-${index}`} fill={color} />;
                      })}
                    </Bar>
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* KEY INSIGHTS */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border-white dark:border-slate-800 border-6 shadow-xs p-2 flex flex-col xl:flex-row items-stretch xl:items-center gap-6 transition-colors duration-200">
            {/* Header: Lightbulb Icon + Title */}
            {/* <div className="flex items-center gap-3 shrink-0 xl:pr-6 xl:border-r border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Lightbulb size={20} />
              </div>
              <span className="text-xs font-black text-slate-800 dark:text-slate-100 tracking-wider uppercase">
                KEY INSIGHTS
              </span>
            </div> */}

            {/* 4 Insights Columns */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800">
              {/* Item 1: Total Output */}
              <div className="flex items-center gap-3.5 sm:px-4 first:pl-0 border-r-1 border-zinc-300 dark:border-slate-700">
                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <div className="text-[13px] font-medium text-slate-500 dark:text-slate-400">Total Output</div>
                  <div className={`text-[19px] font-bold leading-tight ${outputTrend.diff >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {outputTrend.trendValue}
                  </div>
                  <div className="text-[12px] text-slate-400 dark:text-slate-500">vs. previous day</div>
                </div>
              </div>

              {/* Item 2: Highest contribution team */}
              <div className="flex items-center gap-3.5 sm:px-4 border-r-1 border-zinc-300 dark:border-slate-700">
                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <TargetIcon size={18} />
                </div>
                <div>
                  <div className="text-[13px] font-medium text-slate-500 dark:text-slate-400 truncate">
                    {highestTeam?.TeamName || 'N/A'} has highest contribution
                  </div>
                  <div className="text-[19px] font-bold text-blue-600 dark:text-blue-400 leading-tight">
                    {highestContrib}%
                  </div>
                  <div className="text-[12px] text-slate-400 dark:text-slate-500">of total output</div>
                </div>
              </div>

              {/* Item 3: Achievement rate */}
              <div className="flex items-center gap-3.5 sm:px-4 border-r-1 border-zinc-300 dark:border-slate-700">
                <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <div className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
                    Achievement rate {rateTrend.diff >= 0 ? 'increased' : 'decreased'}
                  </div>
                  <div className={`text-[19px] font-bold leading-tight ${rateTrend.diff >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {rateTrend.trendValue}
                  </div>
                  <div className="text-[12px] text-slate-400 dark:text-slate-500">vs. previous day</div>
                </div>
              </div>

              {/* Item 4: Defect rate */}
              <div className="flex items-center gap-3.5 sm:px-4">
                <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-950/60 text-[#590a1a]/90 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <div className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
                    Defect rate {defectTrend.diff <= 0 ? 'decreased' : 'increased'}
                  </div>
                  <div className={`text-[19px] font-bold leading-tight ${defectTrend.diff <= 0 ? 'text-[#590a1a]/90 dark:text-rose-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {defectTrend.trendValue}
                  </div>
                  <div className="text-[12px] text-slate-400 dark:text-slate-500">vs. previous day</div>
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
