import React, { useState } from 'react';
import { Search, Download, Calendar } from 'lucide-react';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const [date, setDate] = useState('2025-05-16');
  const [factory, setFactory] = useState('sumbiri-garments');
  const [line, setLine] = useState('all');
  const [shift, setShift] = useState('day-shift');

  const factoryOptions = [
    { value: 'sumbiri-garments', label: 'SUMBIRI Garments' },
    { value: 'lnt-garments', label: 'LNT Garments' }
  ];

  const lineOptions = [
    { value: 'all', label: 'All' },
    { value: 'line-1', label: 'Line 01' },
    { value: 'line-2', label: 'Line 02' },
    { value: 'line-3', label: 'Line 03' }
  ];

  const shiftOptions = [
    { value: 'day-shift', label: 'Day Shift (08:00 - 17:00)' },
    { value: 'night-shift', label: 'Night Shift (18:00 - 03:00)' }
  ];

  return (
    <header className="bg-white border-b border-slate-100 px-8 py-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between shrink-0">
      {/* Title info */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            {title}
          </h1>
          <div className="w-5 h-5 rounded-full border border-slate-300 text-slate-400 text-xs flex items-center justify-center font-semibold cursor-help select-none">
            i
          </div>
        </div>
        <span className="text-xs text-slate-400 mt-1">Latest Update: 12/08/2025 9:30</span>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-wrap items-end gap-3">
        {/* Date Input */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Day</span>
          <div className="relative flex items-center">
            <Calendar size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-10 rounded-lg border border-slate-200 pl-10 pr-3 text-sm font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer shadow-xs"
            />
          </div>
        </div>

        {/* Factory Select */}
        <Select
          label="Factory"
          options={factoryOptions}
          value={factory}
          onChange={(e) => setFactory(e.target.value)}
        />

        {/* Line / Team Select */}
        <Select
          label="Line"
          options={lineOptions}
          value={line}
          onChange={(e) => setLine(e.target.value)}
        />

        {/* Shift Select */}
        <Select
          label="Time Shift"
          options={shiftOptions}
          value={shift}
          onChange={(e) => setShift(e.target.value)}
        />

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button className="h-10 px-4 flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 shadow-xs">
            <Search size={16} />
            Find
          </Button>

          <Button variant="secondary" className="h-10 px-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold shadow-xs">
            <Download size={16} />
            Export file
          </Button>
        </div>
      </div>
    </header>
  );
};
