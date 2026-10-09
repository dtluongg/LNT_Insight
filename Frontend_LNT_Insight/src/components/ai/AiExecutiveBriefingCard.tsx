import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, ChevronRight, AlertTriangle, CheckCircle2, Info, ArrowUpRight } from 'lucide-react';
import { aiSummaryApi } from '../../core/api/aiSummary';
import { AiInsightDrawer } from './AiInsightDrawer';
import type { AiOverviewResponse, AiDrillDownResponse, DrillDownOption } from '../../types/aiSummary';

interface AiExecutiveBriefingCardProps {
    pageCode?: string;
    companyId?: string;
    siteId?: string;
    sectionId?: number;
    filterDate?: string;
}

export const AiExecutiveBriefingCard: React.FC<AiExecutiveBriefingCardProps> = ({
    pageCode = 'HOME_BRIEFING',
    companyId = 'COM01',
    siteId = 'SI01',
    sectionId = 0,
    filterDate
}) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [overviewData, setOverviewData] = useState<AiOverviewResponse | null>(null);

    // Stage 2 Drawer State
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
    const [drillDownLoading, setDrillDownLoading] = useState<boolean>(false);
    const [drillDownData, setDrillDownData] = useState<AiDrillDownResponse | null>(null);
    const [activeOption, setActiveOption] = useState<DrillDownOption | null>(null);

    const fetchOverview = async (forceRefresh: boolean = false) => {
        try {
            setLoading(true);
            const res = await aiSummaryApi.getOverview({
                pageCode,
                companyId,
                siteId,
                sectionId,
                filterDate,
                forceRefresh
            });
            setOverviewData(res);
        } catch (err) {
            console.error('Failed to fetch AI Overview:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOverview();
    }, [pageCode, companyId, siteId, sectionId, filterDate]);

    const handleTriggerDrillDown = async (option: DrillDownOption) => {
        try {
            setActiveOption(option);
            setDrawerOpen(true);
            setDrillDownLoading(true);

            const res = await aiSummaryApi.getDrillDown({
                subModuleCode: option.subModuleCode || 'MD3SMD2',
                optionId: option.optionId,
                companyId,
                siteId,
                sectionId,
                filterDate
            });

            setDrillDownData(res);
        } catch (err) {
            console.error('Failed to fetch Drill Down Analysis:', err);
        } finally {
            setDrillDownLoading(false);
        }
    };

    const handleRefreshDrillDown = () => {
        if (activeOption) {
            handleTriggerDrillDown(activeOption);
        }
    };

    return (
        <>
            <div className="w-full bg-gradient-to-br from-slate-900 via-sky-950 to-blue-950 rounded-2xl p-6 text-white shadow-2xl shadow-sky-950/30 border border-sky-500/30 relative overflow-hidden mb-6">
                
                {/* Background Ambient Glow */}
                <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-sky-400/15 rounded-full blur-3xl pointer-events-none" />

                {/* Header Section */}
                <div className="flex items-center justify-between border-b border-sky-500/20 pb-4 mb-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-tr from-sky-400 to-cyan-500 rounded-xl shadow-lg shadow-cyan-500/25">
                            <Sparkles className="w-5 h-5 text-slate-950" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                                {overviewData?.overviewTitle || 'Executive Daily Briefing (LNT AI Engine)'}
                                {overviewData?.isCached && (
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                        Cached
                                    </span>
                                )}
                            </h2>
                            <p className="text-xs text-sky-200/80">
                                Aggregated from live system datasets • Last Updated: {overviewData ? new Date(overviewData.generatedAt).toLocaleTimeString() : '---'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => fetchOverview(true)}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/30 text-sky-200 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        <span>{loading ? 'Analyzing...' : 'Refresh AI'}</span>
                    </button>
                </div>

                {/* Main Body */}
                {loading ? (
                    <div className="space-y-4 py-4">
                        <div className="flex items-center gap-2 text-sky-300 text-sm font-medium">
                            <Sparkles className="w-4 h-4 animate-spin text-cyan-400" />
                            <span>AI Engine is aggregating macro datasets across modules...</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="h-28 bg-white/5 rounded-xl animate-pulse border border-white/10" />
                            <div className="h-28 bg-white/5 rounded-xl animate-pulse border border-white/10" />
                            <div className="h-28 bg-white/5 rounded-xl animate-pulse border border-white/10" />
                        </div>
                    </div>
                ) : overviewData ? (
                    <div className="space-y-5">
                        
                        {/* Summary Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {overviewData.insights.map((card) => {
                                const isWarning = card.severity === 'WARNING' || card.severity === 'DANGER';
                                const isSuccess = card.severity === 'SUCCESS';

                                return (
                                    <div
                                        key={card.insightId}
                                        className={`p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                                            isWarning
                                                ? 'bg-gradient-to-b from-rose-950/40 to-slate-900/80 border-rose-500/30'
                                                : isSuccess
                                                ? 'bg-gradient-to-b from-emerald-950/40 to-slate-900/80 border-emerald-500/30'
                                                : 'bg-gradient-to-b from-sky-950/40 to-slate-900/80 border-sky-500/30'
                                        }`}
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                                    {card.moduleCode}
                                                </span>
                                                {isWarning ? (
                                                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                                                ) : isSuccess ? (
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                                ) : (
                                                    <Info className="w-4 h-4 text-sky-400" />
                                                )}
                                            </div>
                                            <h3 className="text-sm font-bold text-white mb-1.5">
                                                {card.title}
                                            </h3>
                                            <p className="text-xs text-slate-300 leading-relaxed">
                                                {card.summaryText}
                                            </p>
                                        </div>

                                        {/* 1-Click Drill Down Option */}
                                        {card.drillDownTarget && (
                                            <button
                                                onClick={() => handleTriggerDrillDown(card.drillDownTarget!)}
                                                className="mt-4 pt-3 border-t border-white/10 text-xs font-semibold text-cyan-300 hover:text-cyan-200 flex items-center justify-between group transition-colors"
                                            >
                                                <span>{card.drillDownTarget.optionLabel}</span>
                                                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Additional Action Buttons */}
                        {overviewData.availableOptions && overviewData.availableOptions.length > 0 && (
                            <div className="pt-2 border-t border-sky-500/20">
                                <span className="text-xs font-semibold text-sky-300 mr-3">
                                    🔍 Deep-Dive Analysis Options:
                                </span>
                                <div className="inline-flex flex-wrap gap-2 mt-2 md:mt-0">
                                    {overviewData.availableOptions.map((opt) => (
                                        <button
                                            key={opt.optionId}
                                            onClick={() => handleTriggerDrillDown(opt)}
                                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all inline-flex items-center gap-1.5"
                                        >
                                            <span>{opt.optionLabel}</span>
                                            <ChevronRight className="w-3 h-3 text-slate-400" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                ) : (
                    <div className="text-center py-6 text-sky-200 text-xs">
                        Unable to connect to AI Executive Engine.
                    </div>
                )}
            </div>

            {/* Stage 2 Deep-Dive Drawer Component */}
            <AiInsightDrawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                isLoading={drillDownLoading}
                data={drillDownData}
                onRefresh={handleRefreshDrillDown}
            />
        </>
    );
};
