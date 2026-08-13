import React from 'react';
import { SewingTeamPerformance } from '../features/dashboard/components/SewingTeamPerformance';

// Mapping: SubModule ID -> React Component
export const submoduleComponentRegistry: Record<string, React.ComponentType> = {
  "2": SewingTeamPerformance, // SubModule ID = 2 (Sewing Team Performance)
};

export const DefaultPendingComponent: React.FC<{ subId: string }> = ({ subId }) => (
  <div className="p-8 text-center text-slate-400 font-medium bg-white rounded-xl border border-slate-100 shadow-xs">
    Tính năng cho Submodule #{subId} đang được phát triển...
  </div>
);
