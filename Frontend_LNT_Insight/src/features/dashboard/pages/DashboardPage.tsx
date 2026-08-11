import React from 'react';
import {
  Clock,
  TrendingUp,
  Target as TargetIcon,
  Scale,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { StatCard } from '../../../components/ui/StatCard';
import { Table } from '../../../components/ui/Table';
import { Card } from '../../../components/ui/Card';
import {
  mockKpis,
  mockHourlyDetails,
  mockChartData
} from '../data/dashboard.mock';
import type { HourlyProductionRow } from '../data/dashboard.mock';

export const DashboardPage: React.FC = () => {
  // Cấu hình các cột cho Bảng chi tiết sản xuất theo giờ
  const columns = [
    {
      header: 'Khung giờ',
      accessor: (row: HourlyProductionRow) => (
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-slate-400" />
          <span>{row.hour}</span>
        </div>
      ),
      className: 'w-1/6'
    },
    {
      header: 'Sản lượng theo giờ (PCS)',
      accessor: (row: HourlyProductionRow) => (
        <span className="font-semibold">{row.hourlyOutput === 0 ? '-' : row.hourlyOutput.toLocaleString()}</span>
      ),
      className: 'text-center'
    },
    {
      header: 'Luỹ kế thực tế (PCS)',
      accessor: (row: HourlyProductionRow) => (
        <span className="font-bold text-slate-900">{row.runningOutput.toLocaleString()}</span>
      ),
      className: 'text-center'
    },
    {
      header: 'Mục tiêu (PCS)',
      accessor: (row: HourlyProductionRow) => (
        <span className="text-slate-500 font-semibold">{row.target.toLocaleString()}</span>
      ),
      className: 'text-center'
    },
    {
      header: 'Chênh lệch mục tiêu (PCS)',
      accessor: (row: HourlyProductionRow) => (
        <span className="text-amber-600 font-bold">{row.balanceToTarget.toLocaleString()}</span>
      ),
      className: 'text-center'
    },
    {
      header: '% Đạt được (vs Target)',
      accessor: (row: HourlyProductionRow) => (
        <span className="text-blue-600 font-bold">{row.achievementRate.toFixed(2)}%</span>
      ),
      className: 'text-center'
    }
  ];

  return (
    <div className="space-y-6">
      {/* 4 Cards KPI ở trên cùng */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="HOURLY OUTPUT"
          value={mockKpis.hourlyOutput.value}
          subtitle={mockKpis.hourlyOutput.timeRange}
          icon={<Clock size={22} />}
          iconColorClass="text-blue-600"
          iconBgClass="bg-blue-50"
        />

        <StatCard
          title="RUNNING OUTPUT"
          value={mockKpis.runningOutput.value.toLocaleString()}
          subtitle={mockKpis.runningOutput.timeRange}
          icon={<TrendingUp size={22} />}
          iconColorClass="text-emerald-600"
          iconBgClass="bg-emerald-50"
        />

        <StatCard
          title="TARGET"
          value={mockKpis.target.value.toLocaleString()}
          subtitle={mockKpis.target.note}
          icon={<TargetIcon size={22} />}
          iconColorClass="text-purple-600"
          iconBgClass="bg-purple-50"
        />

        <StatCard
          title="BALANCE TO TARGET"
          value={mockKpis.balanceToTarget.value.toLocaleString()}
          subtitle={mockKpis.balanceToTarget.note}
          icon={<Scale size={22} />}
          iconColorClass="text-orange-600"
          iconBgClass="bg-orange-50"
        />
      </div>

      {/* Grid bên dưới: Bảng & Biểu đồ */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Bảng chi tiết (Bên trái) */}
        <div className="xl:col-span-7 flex flex-col gap-3">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider pl-1">
            Hourly Production Details
          </h2>
          <Table<HourlyProductionRow>
            columns={columns}
            data={mockHourlyDetails}
            keyExtractor={(row) => row.hour}
          />
        </div>

        {/* Biểu đồ (Bên phải) */}
        <div className="xl:col-span-5 flex flex-col gap-3">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider pl-1">
            Running Output vs Target
          </h2>
          <Card className="flex-1 flex flex-col justify-center h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={mockChartData}
                margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', marginTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="runningOutput"
                  name="Running Output (PCS)"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  name="Target (PCS)"
                  stroke="#2563eb"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>

      {/* Box thông báo ghi chú phía dưới */}
      <div className="flex gap-3 p-4 bg-blue-50/50 border border-blue-100 rounded-xl text-xs text-blue-700 leading-relaxed">
        <Info size={16} className="shrink-0 text-blue-500" />
        <div className="space-y-1">
          <p className="font-semibold">Lưu ý:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Sản lượng lũy kế thực tế (Running Output) được cộng dồn theo từng khung giờ sản xuất.</li>
            <li>Chênh lệch mục tiêu (Balance to Target) thể hiện phần sản lượng còn thiếu để đạt kế hoạch cuối ca.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
