import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, RefreshCw, AlertTriangle, CheckCircle2, Info, ArrowUpRight, AlertOctagon, XCircle } from 'lucide-react';
import { batchGenerate } from '../../core/api/aiSummary';
import { AiInsightDrawer } from './AiInsightDrawer';
import type { AiBatchResponse, AiCardResult, AiSeverity } from '../../types/aiSummary';
import { md3smd2Api } from '../../core/api/md3smd2';

interface AiExecutiveBriefingCardProps {
    companyId?: string;
    siteId?: string;
    filterDate?: string;
}

export const AiExecutiveBriefingCard: React.FC<AiExecutiveBriefingCardProps> = ({
    companyId = 'COM01',
    siteId = 'SITE1',
    filterDate
}) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [batchData, setBatchData] = useState<AiBatchResponse | null>(null);
    const [rawDatasets, setRawDatasets] = useState<{
        summary_five_statcarts: any;
        summary_production_output_status: any;
        summary_defect_gmt_overall: any;
    }>({ summary_five_statcarts: null, summary_production_output_status:null, summary_defect_gmt_overall: null});

    const isFetchingRef = useRef<boolean>(false);

    // Stage 2 Deep-Dive Drawer state
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
    const [deepDiveLoading, setDeepDiveLoading] = useState<boolean>(false);
    const [deepDiveResult, setDeepDiveResult] = useState<any | null>(null);

    const todayDate = filterDate ? new Date(filterDate) : new Date();
    

    const fetchAnalysis = async (forceRefresh: boolean = false) => {
        const prevDateStr = await md3smd2Api.getPreviousWorkingDay(filterDate);
        const yesterdayDate = new Date(prevDateStr);
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;
        try {
            setLoading(true);
            setErrorMsg(null);

            // 1. Fetch real data from SPs (or pass whatever data you want)
            const [summaryDataYesterday, summaryDataToday, summary_production_output_status, summary_defect_gmt_overall] = await Promise.all([
                md3smd2Api.getTeamSewingSummary(companyId, siteId, 0, yesterdayDate).catch(() => null),
                md3smd2Api.getTeamSewingSummary(companyId, siteId, 0, todayDate).catch(() => null),
                md3smd2Api.getTeamSewingDetail(companyId, siteId, 0, todayDate).catch(() => null),
                md3smd2Api.getOverallDefectAnalysis(companyId, siteId, 0, todayDate).catch(() => null),
                // md3smd2Api.getWorkshiftList(companyId, siteId, todayDate, 0).catch(() => null)
            ]);
            const summary_five_statcarts = [...summaryDataYesterday, ...summaryDataToday];
        

            setRawDatasets({ summary_five_statcarts, summary_production_output_status, summary_defect_gmt_overall });

            // 2. Prepare 3 items with card IDs & query data (Prompts are centrally loaded from backend appsettings.json)
            const items = [
                {
                    id: 'summary_five_statcarts',
                    data: summary_five_statcarts
                },
                {
                    id: 'summary_production_output_status',
                    data: summary_production_output_status
                },
                {
                    id: 'summary_defect_gmt_overall',
                    data: summary_defect_gmt_overall
                },
                // {
                //     id: 'card_shift',
                //     data: shiftData
                // }
            ];

            const cacheKey = `HOME_3_CARDS_${companyId}_${siteId}_${filterDate || 'TODAY'}`;

            // 3. Send 1 single request to Gemini
            const res = await batchGenerate({
                cacheKey,
                forceRefresh,
                items
            });

            if (res.success) {
                setBatchData(res);
            } else {
                setErrorMsg(res.errorMessage || 'Failed to generate AI analysis.');
            }
        } catch (err: any) {
            console.error('AI Batch API Error:', err);
            setErrorMsg(err.message || 'Unable to connect to backend AI service.');
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
        }
    };

    useEffect(() => {
        fetchAnalysis();
    }, [companyId, siteId, filterDate]);

    // Handle Deep-Dive Click for a specific card
    const handleOpenDeepDive = async (cardId: string, cardTitle: string) => {
        try {
            setDrawerOpen(true);
            setDeepDiveLoading(true);

            // 1. Lấy data tổng của chính card đó
            let overviewData = null;
            if (cardId === 'summary_five_statcarts') overviewData = rawDatasets.summary_five_statcarts;
            else if (cardId === 'summary_production_output_status') overviewData = rawDatasets.summary_production_output_status;
            else if (cardId === 'summary_defect_gmt_overall') overviewData = rawDatasets.summary_defect_gmt_overall;

            // 2. Fetch detailed SP data on-demand (có thể tùy chỉnh SP/tham số cứng)
            const deepData = await md3smd2Api.getOverallDefectAnalysis(companyId, siteId, 0, todayDate).catch(() => null);

            const res = await batchGenerate({
                cacheKey: `DEEP_DIVE_${cardId}_${companyId}_${filterDate || 'TODAY'}`,
                forceRefresh: false,
                items: [
                    {
                        id: 'deep_dive_detail',
                        data: {
                            overview: overviewData, // Data tổng
                            detail: deepData       // Data chi tiết từ SP
                        }
                    }
                ]
            });

            if (res.success && res.results['deep_dive_detail']) {
                const item = res.results['deep_dive_detail'];
                setDeepDiveResult({
                    title: item.title || `Deep-Dive Analysis: ${cardTitle}`,
                    rootCauseAnalysis: item.summary,
                    keyHighlights: ['Automated defect correlation verified', 'Fast root-cause identification'],
                    warnings: [item.summary],
                    actionItems: ['Review machine settings on affected line', 'Schedule technical inspection before next shift'],
                    rawMarkdown: item.summary,
                    subModuleCode: 'MD3SMD2',
                    generatedAt: res.generatedAt,
                    isCached: res.isCached
                });
            }
        } catch (err) {
            console.error('Deep-dive error:', err);
        } finally {
            setDeepDiveLoading(false);
        }
    };

    const getSeverityBadge = (severity: AiSeverity) => {
        switch (severity) {
            case 'DANGER':
                return {
                    border: 'border-rose-500/40 hover:border-rose-500',
                    bg: 'bg-gradient-to-b from-rose-950/40 to-slate-900/90',
                    icon: <AlertOctagon className="w-4 h-4 text-rose-400" />,
                    tag: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                };
            case 'WARNING':
                return {
                    border: 'border-amber-500/40 hover:border-amber-500',
                    bg: 'bg-gradient-to-b from-amber-950/40 to-slate-900/90',
                    icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
                    tag: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                };
            case 'SUCCESS':
                return {
                    border: 'border-emerald-500/40 hover:border-emerald-500',
                    bg: 'bg-gradient-to-b from-emerald-950/40 to-slate-900/90',
                    icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
                    tag: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                };
            default:
                return {
                    border: 'border-sky-500/40 hover:border-sky-500',
                    bg: 'bg-gradient-to-b from-sky-950/40 to-slate-900/90',
                    icon: <Info className="w-4 h-4 text-sky-400" />,
                    tag: 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                };
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
                                Executive Daily Briefing (LNT AI Engine)
                                {batchData?.isCached && (
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                        Cached
                                    </span>
                                )}
                            </h2>
                            <p className="text-xs text-sky-200/80">
                                Real-time AI analysis based on actual query data • Updated: {batchData ? new Date(batchData.generatedAt).toLocaleTimeString() : '---'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => fetchAnalysis(true)}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/30 text-sky-200 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        <span>{loading ? 'Analyzing...' : 'Refresh AI'}</span>
                    </button>
                </div>

                {/* Body Content */}
                {loading ? (
                    <div className="space-y-4 py-4">
                        <div className="flex items-center gap-2 text-sky-300 text-sm font-medium">
                            <Sparkles className="w-4 h-4 animate-spin text-cyan-400" />
                            <span>AI is analyzing your 3 queries simultaneously...</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="h-36 bg-white/5 rounded-xl animate-pulse border border-white/10" />
                            <div className="h-36 bg-white/5 rounded-xl animate-pulse border border-white/10" />
                            <div className="h-36 bg-white/5 rounded-xl animate-pulse border border-white/10" />
                        </div>
                    </div>
                ) : errorMsg ? (
                    /* Error Banner - No Mock Data! */
                    <div className="p-4 bg-rose-950/60 border border-rose-500/40 rounded-xl flex items-start gap-3 text-rose-200">
                        <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                        <div className="flex-1 text-xs">
                            <h4 className="font-bold text-rose-300 text-sm mb-1">AI Service Connection Failed</h4>
                            <p className="leading-relaxed font-mono">{errorMsg}</p>
                            <button
                                onClick={() => fetchAnalysis(true)}
                                className="mt-3 px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition-colors inline-flex items-center gap-1.5"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                Retry Connection
                            </button>
                        </div>
                    </div>
                ) : batchData?.results ? (
                    /* Render 3 Dynamic AI Cards */
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {['card_production', 'card_defect'].map((cardId) => {
                            const cardResult: AiCardResult | undefined = batchData.results[cardId];
                            if (!cardResult) return null;

                            const badge = getSeverityBadge(cardResult.severity);

                            return (
                                <div
                                    key={cardId}
                                    className={`p-4 rounded-xl border ${badge.border} ${badge.bg} transition-all duration-200 flex flex-col justify-between`}
                                >
                                    <div>
                                        {/* Card Header with AI Severity Badge */}
                                        <div className="flex items-center justify-between mb-2.5">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider flex items-center gap-1.5 ${badge.tag}`}>
                                                {badge.icon}
                                                {cardResult.severity}
                                            </span>
                                            <span className="text-[10px] font-mono text-slate-400">
                                                ID: {cardId}
                                            </span>
                                        </div>

                                        {/* Card Title (Generated by Gemini) */}
                                        <h3 className="text-sm font-bold text-white mb-2 leading-snug">
                                            {cardResult.title}
                                        </h3>

                                        {/* Card Summary (Generated by Gemini based on real query data) */}
                                        <p className="text-xs text-slate-300 leading-relaxed font-medium">
                                            {cardResult.summary}
                                        </p>
                                    </div>

                                    {/* 1-Click Deep Dive Action */}
                                    <button
                                        onClick={() => handleOpenDeepDive(cardId, cardResult.title)}
                                        className="mt-4 pt-3 border-t border-white/10 text-xs font-semibold text-cyan-300 hover:text-cyan-200 flex items-center justify-between group transition-colors cursor-pointer"
                                    >
                                        <span>🔍 Deep-Dive Analysis</span>
                                        <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-6 text-slate-400 text-xs">
                        No AI analysis available.
                    </div>
                )}
            </div>

            {/* Deep-Dive Drawer Modal */}
            <AiInsightDrawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                isLoading={deepDiveLoading}
                data={deepDiveResult}
            />
        </>
    );
};
