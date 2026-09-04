import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardHeader } from '../components/DashboardHeader';
import { TeamProductionDetailModal } from '../components/TeamProductionDetailModal';
import { OverallDefectDetailModal } from '../components/OverallDefectDetailModal';
import { ProductionOutputTableModal } from '../components/ProductionOutputTableModal';
import {
  Clock,
  TrendingUp,
  Target as TargetIcon,
  Ellipsis,
  Activity,
  Layers
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
import { Card } from '../../../components/ui/Card';
import { companiesApi } from '../../../core/api/companies';
import type { SewingTeamSummay, SewingTeamDetail } from '../../../types';
import type { DashboardFilter } from '../types/TeamSewingFilters';

export const DashboardPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const todayStr = new Date().toLocaleDateString('sv-SE');

  // Dashboard Filter
  const [filter, setFilter] = useState<DashboardFilter>({
    CompanyID: searchParams.get('companyId') || searchParams.get('CompanyId') || 'COM01',
    CompanyName: '',

    SiteID: searchParams.get('siteId') || searchParams.get('SiteId') || 'Site1',
    SiteCode: '',

    SectionID: searchParams.get('sectionId') || searchParams.get('SectionId') || '1',
    SectionName: '',

    Date: searchParams.get('date') || searchParams.get('Date') || todayStr,
  });

  const [productionData, setProductionData] = useState<SewingTeamDetail[]>([]);
  const [dataSewingTeamSummary, setDataSewingTeamSummary] = useState<SewingTeamSummay[]>([]);
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
        const [prodResult, summaryResult] = await Promise.all([
          companiesApi.getTeamSewingDetail(filter.CompanyID, filter.SiteID, Number(filter.SectionID), dateObj),
          companiesApi.getTeamSewingSummary(filter.CompanyID, filter.SiteID, Number(filter.SectionID), dateObj)
        ]);
        setProductionData(prodResult);
        setDataSewingTeamSummary(summaryResult);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
        setProductionData([]);
        setDataSewingTeamSummary([]);
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

  // Calculate dynamic stats
  const totalOutput = dataSewingTeamSummary[0]?.DayOutput ?? 0;
  const totalTarget = dataSewingTeamSummary[0]?.DayTarget ?? 0;
  const achievementRate = totalTarget > 0 ? (totalOutput / totalTarget) * 100 : 0;
  const inspection = dataSewingTeamSummary[0]?.InspectedQty ?? 0;
  const defect = dataSewingTeamSummary[0]?.DefectQty ?? 0;
  const defectRate = dataSewingTeamSummary[0]?.DefectRate ?? 0;
  const defectGMT = `${defect}/${defectRate}%`;

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

      {/* 4 Cards KPI ở trên cùng */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
        <StatCard
          title="TOTAL OUTPUT"
          value={totalOutput.toLocaleString()}
          subtitle="Cumulative Actual Output (PCS)"
          icon={<Clock size={22} />}
          iconColorClass="text-blue-600"
          iconBgClass="bg-blue-50"
        />

        <StatCard
          title="TOTAL TARGET"
          value={totalTarget.toLocaleString()}
          subtitle="Overall Shift Plan (PCS)"
          icon={<TargetIcon size={22} />}
          iconColorClass="text-blue-600"
          iconBgClass="bg-blue-50"
        />

        <StatCard
          title="ACHIEVEMENT RATE"
          value={`${achievementRate.toFixed(1)}%`}
          subtitle="Actual Output / Shift Plan"
          icon={<TrendingUp size={22} />}
          iconColorClass={achievementRate >= 90 ? "text-emerald-600" : "text-amber-600"}
          iconBgClass={achievementRate >= 90 ? "bg-emerald-50" : "bg-amber-50"}
        />

        <StatCard
          title="QUALITY INSPECTED GMT"
          value={inspection.toString()}
          subtitle="Sewing End line Inspection"
          icon={<Layers size={22} />}
          iconColorClass="text-purple-600"
          iconBgClass="bg-purple-50"
        />

        <StatCard
          title="DEFECT GMT"
          value={defectGMT.toString()}
          subtitle="Defect (PCS) / Defect Rate "
          icon={<Layers size={22} />}
          iconColorClass="text-green-600"
          iconBgClass="bg-green-50"
          onClick={() => setIsDefectModalOpen(true)}
        />
      </div>

      {/* Grid bên dưới: Biểu đồ & Danh sách Section */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Biểu đồ */}
        <div className="xl:col-span-12 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider pl-1 flex items-center gap-2">
              <Activity size={16} className="text-blue-600" />
              PRODUCTION OUTPUT STATUS
            </h2>
            <button
              type="button"
              onClick={() => setIsTableModalOpen(true)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              title="View production data table"
            >
              <Ellipsis size={18} />
            </button>
          </div>
          
          <Card className="flex flex-col justify-center h-[520px] p-6">
            {productionData.length === 0 ? (
              <div className="text-center text-slate-400 font-medium py-10">
                No production data found for this company and site.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={productionData}
                  margin={{ top: 20, right: 20, bottom: 20, left: 10 }}
                >
                  <defs>
                    <linearGradient id="barDayOutput" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#D97706" stopOpacity={0.75} />
                    </linearGradient>
                    <linearGradient id="barInspectedQty" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#14B8A6" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#0F766E" stopOpacity={0.75} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="TeamName"
                    stroke="#94a3b8"
                    fontSize={11}
                    fontWeight={600}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
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
                    formatter={(value: any, name: string) => {
                      if (name === "DayOutput") return [value ? value.toLocaleString() : '0', 'Day Output (Actual)'];
                      if (name === "DayTarget") return [value ? value.toLocaleString() : '-', 'Day Target (Plan)'];
                      return [value, name];
                    }}
                  />
                  <Legend
                    // verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ fontSize: '13px', fontWeight: 500 }}
                    
                  />
                  {/* Cột Actual Output (Màu cam gradient) */}
                  <Bar
                    dataKey="DayOutput"
                    name="Day Output"
                    fill="url(#barDayOutput)"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                    label={{ position: 'top', fill: '#0F766E', fontSize: 11, fontWeight: 600 }}
                    onClick={(data) => { setSelectedProduction(data.payload) }}
                    cursor="pointer"
                  />
                  <Bar
                    dataKey="InspectedQty"
                    name="Inspected Qty"
                    fill="url(#barInspectedQty)"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                    label={{ position: 'top', fill: '#2a8caa', fontSize: 11, fontWeight: 600 }}
                    onClick={(data) => { setSelectedProduction(data.payload) }}
                    cursor="pointer"
                  />
                  {/* Đường Line Target (Màu xanh dương) */}
                  <Line
                    type="monotone"
                    dataKey="DayTarget"
                    name="Day Target"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    dot={{ r: 5, fill: "#3B82F6", stroke: "#fff", strokeWidth: 2 }}
                    activeDot={{ r: 8 }}
                    label={{ position: 'top', fill: '#2563EB', fontSize: 11, fontWeight: 600 }}

                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </Card>
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
