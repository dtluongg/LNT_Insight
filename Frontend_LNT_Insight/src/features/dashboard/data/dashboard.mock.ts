export interface HourlyProductionRow {
  hour: string;
  hourlyOutput: number;
  runningOutput: number;
  target: number;
  balanceToTarget: number;
  achievementRate: number; // in percentage
}

export interface KpiData {
  hourlyOutput: { value: number; label: string; timeRange: string };
  runningOutput: { value: number; label: string; timeRange: string };
  target: { value: number; label: string; note: string };
  balanceToTarget: { value: number; label: string; note: string };
}

export const mockKpis: KpiData = {
  hourlyOutput: {
    value: 412,
    label: 'PCS',
    timeRange: 'During 15:00 - 16:00'
  },
  runningOutput: {
    value: 4652,
    label: 'PCS',
    timeRange: 'Running total until 16:00'
  },
  target: {
    value: 8000,
    label: 'PCS',
    note: 'Plan for Day Shift'
  },
  balanceToTarget: {
    value: 3348,
    label: 'PCS',
    note: 'Need to reach to complete the target'
  }
};

export const mockHourlyDetails: HourlyProductionRow[] = [
  { hour: '08:00 - 09:00', hourlyOutput: 320, runningOutput: 320, target: 800, balanceToTarget: 7680, achievementRate: 4.00 },
  { hour: '09:00 - 10:00', hourlyOutput: 450, runningOutput: 770, target: 1600, balanceToTarget: 7230, achievementRate: 9.63 },
  { hour: '10:00 - 11:00', hourlyOutput: 518, runningOutput: 1288, target: 2400, balanceToTarget: 6712, achievementRate: 16.10 },
  { hour: '11:00 - 12:00', hourlyOutput: 612, runningOutput: 1900, target: 3200, balanceToTarget: 6100, achievementRate: 23.75 },
  { hour: '12:00 - 13:00', hourlyOutput: 705, runningOutput: 2605, target: 4000, balanceToTarget: 5395, achievementRate: 32.56 },
  { hour: '13:00 - 14:00', hourlyOutput: 688, runningOutput: 3293, target: 4800, balanceToTarget: 4707, achievementRate: 41.16 },
  { hour: '14:00 - 15:00', hourlyOutput: 672, runningOutput: 3965, target: 5600, balanceToTarget: 3935, achievementRate: 49.56 },
  { hour: '15:00 - 16:00', hourlyOutput: 412, runningOutput: 4652, target: 6400, balanceToTarget: 3348, achievementRate: 57.78 },
  { hour: '16:00 - 17:00', hourlyOutput: 0, runningOutput: 4652, target: 7200, balanceToTarget: 2548, achievementRate: 64.61 }
];

export const mockChartData = [
  { hour: '08:00', runningOutput: 320, target: 800 },
  { hour: '09:00', runningOutput: 770, target: 1600 },
  { hour: '10:00', runningOutput: 1288, target: 2400 },
  { hour: '11:00', runningOutput: 1900, target: 3200 },
  { hour: '12:00', runningOutput: 2605, target: 4000 },
  { hour: '13:00', runningOutput: 3293, target: 4800 },
  { hour: '14:00', runningOutput: 3965, target: 5600 },
  { hour: '15:00', runningOutput: 4652, target: 6400 },
  { hour: '16:00', runningOutput: 4652, target: 7200 },
  { hour: '17:00', runningOutput: 4652, target: 8000 }
];
