import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Clock,
  TrendingUp,
  Target as TargetIcon,
  Layers,
  Info,
  Activity
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
  Legend
} from 'recharts';
import { StatCard } from '../../../components/ui/StatCard';
import { Card } from '../../../components/ui/Card';
import { companiesApi } from '../../../core/api/companies';
import type { ProductionVsPlanInfo, SectionInfo } from '../../../types';

export const DashboardPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get('companyId') || 'COM01';
  const siteId = searchParams.get('siteId') || 'Site1';
  const departmentId = searchParams.get('departmentId') || 'DEP05';

  const [productionData, setProductionData] = useState<ProductionVsPlanInfo[]>([]);
  const [sections, setSections] = useState<SectionInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [prodResult, sectionsResult] = await Promise.all([
          companiesApi.getProductionVsPlan(companyId, siteId),
          companiesApi.getSections(companyId, siteId, departmentId)
        ]);
        setProductionData(prodResult);
        setSections(sectionsResult);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [companyId, siteId, departmentId]);

  // Calculate dynamic stats
  const totalOutput = productionData.reduce((sum, item) => sum + (item.dayOutput || 0), 0);
  const totalTarget = productionData.reduce((sum, item) => sum + (item.dayTarget || 0), 0);
  const achievementRate = totalTarget > 0 ? (totalOutput / totalTarget) * 100 : 0;
  const activeLines = productionData.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-slate-500">Loading production dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 4 Cards KPI ở trên cùng */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="TOTAL OUTPUT"
          value={totalOutput.toLocaleString()}
          subtitle="Cumulative Actual Output (PCS)"
          icon={<Clock size={22} />}
          iconColorClass="text-orange-600"
          iconBgClass="bg-orange-50"
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
          title="ACTIVE LINES"
          value={activeLines.toString()}
          subtitle="Sewing Lines Monitored"
          icon={<Layers size={22} />}
          iconColorClass="text-purple-600"
          iconBgClass="bg-purple-50"
        />
      </div>

      {/* Grid bên dưới: Biểu đồ & Danh sách Section */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Biểu đồ (Bên trái, col-span-9) */}
        <div className="xl:col-span-9 flex flex-col gap-3">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider pl-1 flex items-center gap-2">
            <Activity size={16} className="text-blue-600" />
            Overall Sewing Team Achievement
          </h2>
          <Card className="flex flex-col justify-center h-[450px] p-6">
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
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f97316" stopOpacity={0.95}/>
                      <stop offset="100%" stopColor="#ea580c" stopOpacity={0.75}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="teamNo" 
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
                      if (name === "dayOutput") return [value ? value.toLocaleString() : '0', 'Day Output (Actual)'];
                      if (name === "dayTarget") return [value ? value.toLocaleString() : '-', 'Day Target (Plan)'];
                      return [value, name];
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    wrapperStyle={{ fontSize: '12px', fontWeight: 500 }}
                  />
                  {/* Cột Actual Output (Màu cam gradient) */}
                  <Bar 
                    dataKey="dayOutput" 
                    name="Day Output" 
                    fill="url(#barGradient)" 
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />
                  {/* Đường Line Target (Màu xanh dương) */}
                  <Line 
                    type="monotone" 
                    dataKey="dayTarget" 
                    name="Day Target" 
                    stroke="#2563eb" 
                    strokeWidth={3} 
                    dot={{ r: 5, fill: "#2563eb", stroke: "#fff", strokeWidth: 2 }} 
                    activeDot={{ r: 8 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        {/* Danh sách Section (Bên phải, col-span-3) */}
        <div className="xl:col-span-3 flex flex-col gap-3">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider pl-1">
            Active Sections
          </h2>
          <Card className="flex-1 overflow-y-auto max-h-[450px] p-6 space-y-4">
            {sections.length === 0 ? (
              <div className="text-center text-slate-400 text-sm py-10">
                No active sections found.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {sections.map((section, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-blue-50/50 hover:text-blue-700 rounded-lg text-sm text-slate-700 font-semibold transition-colors duration-150 border border-slate-100"
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                    <span>{section.sectionName}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Box thông báo ghi chú phía dưới */}
      <div className="flex gap-3 p-4 bg-blue-50/50 border border-blue-100 rounded-xl text-xs text-blue-700 leading-relaxed">
        <Info size={16} className="shrink-0 text-blue-500" />
        <div className="space-y-1">
          <p className="font-semibold">Lưu ý:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Sản lượng lũy kế thực tế (Day Output) được tổng hợp trực tiếp từ cơ sở dữ liệu giám sát chuyền.</li>
            <li>Đường mục tiêu (Day Target) thể hiện hạn mức kế hoạch ngày cho từng tổ may tương ứng.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
