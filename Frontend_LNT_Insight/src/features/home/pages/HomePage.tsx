import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import { AiExecutiveBriefingCard } from '../../../components/ai/AiExecutiveBriefingCard';
import { Activity, ShieldCheck, FileText, ArrowRight, Layers, Building2, Calendar, Clock, Sparkles } from 'lucide-react';

export const HomePage: React.FC = () => {
    const { user, selectedCompanyID, authorizedCompanies } = useAuth();
    const navigate = useNavigate();
    
    // Live Running Clock State
    const [currentTime, setCurrentTime] = useState<Date>(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const todayStr = currentTime.toLocaleDateString('sv-SE');
    const timeFormatted = currentTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    const currentCompany = authorizedCompanies.find((comp) => comp.companyID === selectedCompanyID);
    const companyName = currentCompany?.companyName || selectedCompanyID || 'LNT Corp';

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            
            {/* Top Welcome Banner with Light Blue Accent Theme */}
            <div className="relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-5 bg-gradient-to-r from-sky-500/10 via-blue-500/5 to-cyan-500/10 dark:from-slate-900 dark:via-sky-950/30 dark:to-slate-900 p-6 rounded-2xl border border-sky-200/80 dark:border-sky-900/50 shadow-sm backdrop-blur-sm">
                
                {/* Decorative Light Blue Glow Elements */}
                <div className="absolute -top-16 -left-16 w-48 h-48 bg-sky-400/20 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-cyan-400/20 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex items-center gap-2 text-xs font-extrabold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-1.5">
                        <Sparkles className="w-4 h-4 text-cyan-500 animate-pulse" />
                        <span>Executive AI Control Portal</span>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        Welcome back, <span className="bg-gradient-to-r from-sky-600 to-cyan-600 dark:from-sky-400 dark:to-cyan-300 bg-clip-text text-transparent">{user?.fullName || user?.username || 'Admin'}</span>! 👋
                    </h1>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">
                        Real-time intelligent executive briefing and control center for LNT Insight.
                    </p>
                </div>

                {/* Real-time Running Clock & Company Info */}
                <div className="relative z-10 flex flex-wrap items-center gap-3">
                    
                    {/* Live Clock Badge */}
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-800/90 px-4 py-2 rounded-xl border border-sky-200 dark:border-sky-800 shadow-xs text-slate-800 dark:text-slate-100 font-mono">
                        <Clock className="w-4 h-4 text-sky-500 animate-spin" style={{ animationDuration: '8s' }} />
                        <span className="text-sm font-bold text-sky-600 dark:text-sky-400 tracking-wider">
                            {timeFormatted}
                        </span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping ml-0.5" title="Live Clock Active" />
                    </div>

                    {/* Company & Date Info Badge */}
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-800/90 px-4 py-2 rounded-xl border border-sky-200 dark:border-sky-800 shadow-xs text-xs font-semibold text-slate-700 dark:text-slate-200">
                        <div className="flex items-center gap-1.5 border-r border-slate-200 dark:border-slate-700 pr-3">
                            <Building2 className="w-4 h-4 text-sky-500" />
                            <span className="font-bold">{companyName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                            <Calendar className="w-4 h-4 text-cyan-500" />
                            <span>{todayStr}</span>
                        </div>
                    </div>

                </div>
            </div>

            {/* Dedicated AI Executive Briefing Engine */}
            <AiExecutiveBriefingCard
                pageCode="HOME_BRIEFING"
                companyId={selectedCompanyID || 'COM01'}
                filterDate={todayStr}
            />

            {/* Quick Access Submodules Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Layers className="w-5 h-5 text-sky-500" />
                        Quick Access Submodules & Features
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* MD3SMD2 Module Card */}
                    <div
                        onClick={() => navigate('/sewing/team-performance')}
                        className="group p-5 bg-white dark:bg-slate-900 rounded-2xl border border-sky-100 dark:border-slate-800 hover:border-sky-500/50 dark:hover:border-sky-500/50 shadow-xs hover:shadow-lg hover:shadow-sky-500/5 transition-all cursor-pointer flex flex-col justify-between"
                    >
                        <div>
                            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-900/40 flex items-center justify-center text-sky-600 dark:text-sky-400 mb-3 group-hover:scale-105 transition-transform">
                                <Activity className="w-5 h-5" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                                Production Output & Defect Analysis (MD3 - SM2)
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                                Monitor 5 StatCards metrics, team production output status, and granular defect breakdowns.
                            </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-sky-600 dark:text-sky-400 flex items-center justify-between">
                            <span>Open Submodule</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>

                    {/* Admin Access Management Card */}
                    <div
                        onClick={() => navigate('/admin/user-access')}
                        className="group p-5 bg-white dark:bg-slate-900 rounded-2xl border border-sky-100 dark:border-slate-800 hover:border-cyan-500/50 dark:hover:border-cyan-500/50 shadow-xs hover:shadow-lg hover:shadow-cyan-500/5 transition-all cursor-pointer flex flex-col justify-between"
                    >
                        <div>
                            <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-900/40 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-3 group-hover:scale-105 transition-transform">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                User Access & Permission Management
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                                Configure company authorizations and assign module access permissions across users.
                            </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-cyan-600 dark:text-cyan-400 flex items-center justify-between">
                            <span>Open Permissions</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>

                    {/* Report Placeholder Card */}
                    <div
                        onClick={() => navigate('/coming-soon')}
                        className="group p-5 bg-white dark:bg-slate-900 rounded-2xl border border-sky-100 dark:border-slate-800 hover:border-blue-400/50 shadow-xs hover:shadow-lg hover:shadow-blue-500/5 transition-all cursor-pointer flex flex-col justify-between"
                    >
                        <div>
                            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-slate-400 mb-3 group-hover:scale-105 transition-transform">
                                <FileText className="w-5 h-5" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-slate-300 transition-colors">
                                Additional Analytics & Reports
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                                Warehouse material control, equipment maintenance, and HR KPI modules in development.
                            </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-500 flex items-center justify-between">
                            <span>Explore Modules</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
