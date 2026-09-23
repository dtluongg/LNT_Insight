import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowLeft,
  ShieldCheck, 
  Users, 
  Briefcase, 
  BellRing,
  Layers,
  BarChart3
} from 'lucide-react';

interface BlankPageProps {
  title?: string;
  subtitle?: string;
  moduleCode?: string;
}

export const BlankPage: React.FC<BlankPageProps> = ({ 
  title = 'System Module',
  subtitle = 'This feature is currently in the active development and UI integration roadmap.',
  moduleCode
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 min-h-[calc(100vh-56px)] p-6 md:p-10 flex flex-col justify-between bg-gradient-to-b from-slate-50 via-sky-50/20 to-white select-none">
      {/* 1. Top Sub-Header */}
      <div className="flex items-center justify-between border-b border-slate-200/70 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-200/60 flex items-center justify-center text-blue-600 shadow-xs">
            <Layers size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 tracking-tight">
              {title}
            </h2>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              LNT Insight • Intelligent Operations Platform
            </p>
          </div>
        </div>

        {moduleCode && (
          <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/80">
            Module Code: {moduleCode}
          </span>
        )}
      </div>

      {/* 2. Main Executive Content Area */}
      <div className="max-w-4xl mx-auto my-auto py-10 flex flex-col items-center text-center">
        {/* Release Status Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/80 border border-blue-200/70 text-blue-700 text-xs font-semibold mb-6 shadow-xs animate-pulse">
          <Sparkles size={14} className="text-cyan-500" />
          <span>Release Candidate • Under Development</span>
        </div>

        {/* Executive Management Team Visual Group */}
        <div className="relative mb-8">
          {/* Subtle Ambient Light Glow */}
          <div className="absolute inset-0 -m-6 rounded-full bg-gradient-to-tr from-blue-400/20 via-cyan-400/20 to-sky-300/10 blur-2xl pointer-events-none" />

          {/* Council & Executive Badges */}
          <div className="relative z-10 flex items-center justify-center">
            {/* Leadership 1: Operations Management */}
            <div className="flex flex-col items-center -mr-3 transform -rotate-3 hover:rotate-0 hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-700 border-2 border-white shadow-lg flex items-center justify-center text-slate-200 overflow-hidden">
                <Briefcase size={28} className="text-cyan-300" />
              </div>
              <span className="mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                Management Board
              </span>
            </div>

            {/* Core Center: Executive Oversight */}
            <div className="flex flex-col items-center z-20 transform hover:scale-105 transition-all duration-300">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-blue-700 via-sky-600 to-cyan-500 border-4 border-white shadow-xl flex items-center justify-center text-white ring-2 ring-blue-500/20">
                <ShieldCheck size={42} className="drop-shadow" />
              </div>
              <span className="mt-2 text-[11px] font-extrabold text-blue-700 uppercase tracking-wider bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200 shadow-2xs">
                Executive Board
              </span>
            </div>

            {/* Leadership 3: Engineering & Governance */}
            <div className="flex flex-col items-center -ml-3 transform rotate-3 hover:rotate-0 hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-indigo-800 to-blue-900 border-2 border-white shadow-lg flex items-center justify-center text-indigo-200 overflow-hidden">
                <Users size={28} className="text-sky-300" />
              </div>
              <span className="mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                Operational Board
              </span>
            </div>
          </div>
        </div>

        {/* Headlines */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight leading-snug">
          Interface Configuration & Pipeline in Progress
        </h1>
        <p className="max-w-xl text-xs sm:text-sm text-slate-500 mt-2.5 leading-relaxed">
          {subtitle} Our engineering and production analytics teams are standardizing datasets, access control policies, and real-time visualization widgets for this partition.
        </p>

        {/* 2 Value Proposition / Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full max-w-xl mt-8">
          
          <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs text-left">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs mb-1">
              <ShieldCheck size={15} />
              <span>Compliance</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Strict role-based access control (RBAC) configured.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs text-left">
            <div className="flex items-center gap-2 text-cyan-600 font-bold text-xs mb-1">
              <BellRing size={15} />
              <span>Availability</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Notifications will broadcast once deployment goes live.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-all cursor-pointer"
          >
            <ArrowLeft size={15} />
            <span>Go Back</span>
          </button>

          {/* Direct link to active production page */}
          <button
            type="button"
            onClick={() => navigate('/sewing/team-performance')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 hover:opacity-95 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <BarChart3 size={15} />
            <span>Go to Overall Sewing Analysis</span>
          </button>
        </div>
      </div>

      {/* 3. Global Enterprise Footer */}
      <div className="pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400 font-medium">
        <span>&copy; 2026 LNTSOFT BUSINESS SOLUTION</span>
      </div>
    </div>
  );
};