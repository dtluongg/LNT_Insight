import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, RefreshCw, AlertTriangle, CheckCircle2, Info, ArrowUpRight, AlertOctagon, XCircle } from 'lucide-react';
import { batchGenerate } from '../../core/api/aiSummary';
import { AiInsightDrawer } from './AiInsightDrawer';
// import { AiFormattedText } from './AiFormattedText';
import AIFormatText from './AIFormatText';
import type { AiBatchResponse, AiCardResult, AiSeverity } from '../../types/aiSummary';
import { md3smd2Api } from '../../core/api/md3smd2';

interface AiExecutiveBriefingCardProps {
    pageCode?: string;
    companyId?: string;
    siteId?: string;
    filterDate?: string;
    language?: 'vi' | 'en' | 'si';
}

export const AiExecutiveBriefingCard: React.FC<AiExecutiveBriefingCardProps> = ({
    companyId = 'COM01',
    siteId = 'SITE1',
    filterDate,
    language = 'vi'
}) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [batchData, setBatchData] = useState<AiBatchResponse | null>(null);
    const [rawDatasets, setRawDatasets] = useState<{
        summary_five_statcarts: any;
        summary_production_output_status: any;
        summary_defect_gmt_overall: any;
    }>({ summary_five_statcarts: null, summary_production_output_status: null, summary_defect_gmt_overall: null });

    const isFetchingRef = useRef<boolean>(false);

    // Stage 2 Deep-Dive Drawer state
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
    const [deepDiveLoading, setDeepDiveLoading] = useState<boolean>(false);
    const [deepDiveResult, setDeepDiveResult] = useState<any | null>(null);

    const todayDate = filterDate ? new Date(filterDate) : new Date();

    const fetchAnalysis = async (forceRefresh: boolean = false) => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;
        try {
            setLoading(true);
            setErrorMsg(null);

            const effectiveDateStr = filterDate || new Date().toISOString().split('T')[0];
            const prevDateStr = await md3smd2Api.getPreviousWorkingDay(effectiveDateStr).catch(() => '');
            const yesterdayDate = prevDateStr ? new Date(prevDateStr) : new Date(Date.now() - 86400000);

            // 1. Fetch real data from SPs
            const [summaryDataYesterday, summaryDataToday, summary_production_output_status, summary_defect_gmt_overall] = await Promise.all([
                md3smd2Api.getTeamSewingSummary(companyId, siteId, 0, yesterdayDate).catch(() => null),
                md3smd2Api.getTeamSewingSummary(companyId, siteId, 0, todayDate).catch(() => null),
                md3smd2Api.getTeamSewingDetail(companyId, siteId, 0, todayDate).catch(() => null),
                md3smd2Api.getOverallDefectAnalysis(companyId, siteId, 0, todayDate).catch(() => null),
            ]);

            // Live Time for Shift 07:15 - 16:15 run-rate forecast
            const now = new Date();
            const currentTimeStr = now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });

            // Card 1: Gán nhãn hôm qua vs hôm nay rõ ràng
            const card1Payload = {
                yesterday: Array.isArray(summaryDataYesterday) && summaryDataYesterday.length > 0 ? summaryDataYesterday[0] : null,
                today: Array.isArray(summaryDataToday) && summaryDataToday.length > 0 ? summaryDataToday[0] : null
            };

            // Card 2: Áp cứng ca làm việc 07:15 - 16:15 và truyền currentTime
            const card2Payload = {
                currentTime: currentTimeStr,
                shiftSchedule: {
                    startTime: "07:15",
                    endTime: "16:15",
                    breakMinutes: 90,
                    standardWorkHours: 8.0
                },
                teams: summary_production_output_status
            };

            // Card 3: Danh sách lỗi tổng quan
            const card3Payload = {
                defects: summary_defect_gmt_overall
            };

            setRawDatasets({
                summary_five_statcarts: card1Payload,
                summary_production_output_status: card2Payload,
                summary_defect_gmt_overall: card3Payload
            });

            // 2. Prepare 3 items with card IDs & structured data
            const items = [
                {
                    id: 'summary_five_statcarts',
                    data: card1Payload
                },
                {
                    id: 'summary_production_output_status',
                    data: card2Payload
                },
                {
                    id: 'summary_defect_gmt_overall',
                    data: card3Payload
                }
            ];

            const cacheKey = `HOME_3_CARDS_${companyId}_${siteId}_${filterDate || 'TODAY'}`;

            // 3. Send 1 single request to Gemini
            const res = await batchGenerate({
                cacheKey,
                forceRefresh,
                language,
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

            // 1. Lấy data của chính thẻ cha
            let targetCardData = null;
            if (cardId === 'summary_five_statcarts') targetCardData = rawDatasets.summary_five_statcarts;
            else if (cardId === 'summary_production_output_status') targetCardData = rawDatasets.summary_production_output_status;
            else if (cardId === 'summary_defect_gmt_overall') targetCardData = rawDatasets.summary_defect_gmt_overall;

            // 2. Map ID riêng biệt tương ứng với thẻ cha
            const deepDiveItemId = `deep_dive_${cardId}`;

            // 3. Cache key gắn kèm language để không bị lẫn lộn giữa các thứ tiếng
            const cacheKey = `DEEP_DIVE_${cardId}_${companyId}_${siteId}_${filterDate || 'TODAY'}_${language}`;

            const res = await batchGenerate({
                cacheKey,
                forceRefresh: false,
                language,
                items: [
                    {
                        id: deepDiveItemId,
                        data: {
                            targetCardId: cardId,
                            targetData: targetCardData,        // Dữ liệu trọng tâm của thẻ cha
                            allSummaryData: rawDatasets        // Dữ liệu tổng hợp cả 3 SP làm ngữ cảnh toàn cảnh
                        }
                    }
                ]
            });

            if (res.success && res.results) {
                const item = res.results[deepDiveItemId] || Object.values(res.results)[0];
                if (item) {
                    // Lấy chính xác ngôn ngữ đang chọn từ translations
                    const translated = item.translations?.[language];
                    const currentTitle = translated?.title || item.title || cardTitle;
                    const currentSummary = translated?.summary || item.summary || '';

                    setDeepDiveResult({
                        title: currentTitle,
                        rootCauseAnalysis: currentSummary,
                        keyHighlights: [],
                        warnings: [],
                        actionItems: [],
                        rawMarkdown: currentSummary,
                        subModuleCode: 'MD3SMD2',
                        generatedAt: res.generatedAt,
                        isCached: res.isCached
                    });
                }
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

    const t = {
        vi: {
            title: "Bản tin Điều hành Executive (LNTBOOST AI Engine)",
            subTitle: "Phân tích AI thời gian thực theo dữ liệu sản xuất • Ca làm việc: 07:15 - 16:15",
            analyzingHeader: "AI đang phân tích 3 chỉ số vận hành theo ca 07:15 - 16:15...",
            refreshBtn: "Làm mới AI",
            analyzingBtn: "Đang phân tích...",
            deepDiveBtn: "🔍 Phân tích chi tiết",
            updatedAt: "Cập nhật lúc:",
            cached: "Đã lưu đệm",
            noData: "Chưa có dữ liệu phân tích AI."
        },
        en: {
            title: "Executive Daily Briefing (LNTBOOST AI Engine)",
            subTitle: "Real-time AI analysis based on actual query data • Shift: 07:15 - 16:15",
            analyzingHeader: "AI is analyzing operational metrics for shift 07:15 - 16:15...",
            refreshBtn: "Refresh AI",
            analyzingBtn: "Analyzing...",
            deepDiveBtn: "🔍 Deep-Dive Analysis",
            updatedAt: "Updated at:",
            cached: "Cached",
            noData: "No AI analysis available."
        },
        si: {
            title: "විධායක දෛනික සාරාංශය (LNTBOOST AI Engine)",
            subTitle: "සැබෑ නිෂ්පාදන දත්ත මත පදනම් වූ AI විශ්ලේෂණය • වැඩ මුරය: 07:15 - 16:15",
            analyzingHeader: "AI 07:15 - 16:15 වැඩ මුරයේ දත්ත විශ්ලේෂණය කරයි...",
            refreshBtn: "යාවත්කාලීන කරන්න",
            analyzingBtn: "විශ්ලේෂණය කරමින්...",
            deepDiveBtn: "🔍 ගැඹුරු විශ්ලේෂණය",
            updatedAt: "යාවත්කාලීන වේලාව:",
            cached: "කැචය",
            noData: "AI විශ්ලේෂණයක් නොමැත."
        }
    }[language];

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
                                {t.title}
                                {batchData?.isCached && (
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                        {t.cached}
                                    </span>
                                )}
                            </h2>
                            <p className="text-xs text-sky-200/80">
                                {t.subTitle} • {t.updatedAt} {batchData ? new Date(batchData.generatedAt).toLocaleTimeString() : '---'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => fetchAnalysis(true)}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/30 text-sky-200 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        <span>{loading ? t.analyzingBtn : t.refreshBtn}</span>
                    </button>
                </div>

                {/* Body Content */}
                {loading ? (
                    <div className="space-y-4 py-4">
                        <div className="flex items-center gap-2 text-sky-300 text-sm font-medium">
                            <Sparkles className="w-4 h-4 animate-spin text-cyan-400" />
                            <span>{t.analyzingHeader}</span>
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
                        {['summary_five_statcarts', 'summary_production_output_status', 'summary_defect_gmt_overall'].map((cardId) => {
                            const cardResult: AiCardResult | undefined = batchData.results[cardId];
                            if (!cardResult) return null;

                            const badge = getSeverityBadge(cardResult.severity);
                            const translated = cardResult.translations?.[language];
                            const currentTitle = translated?.title || cardResult.title;
                            const currentSummary = translated?.summary || cardResult.summary;

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

                                        {/* Card Title (Instant translated) */}
                                        <h3 className="text-sm font-bold text-white mb-2 leading-snug">
                                            {currentTitle}
                                        </h3>

                                        {/* Card Summary with highlighted metrics & structured bullet labels */}
                                        <AIFormatText
                                            content={currentSummary}
                                            className="text-xs text-slate-100 leading-relaxed font-normal"
                                        />
                                    </div>

                                    {/* 1-Click Deep Dive Action */}
                                    <button
                                        onClick={() => handleOpenDeepDive(cardId, currentTitle)}
                                        className="mt-4 pt-3 border-t border-white/10 text-xs font-semibold text-cyan-300 hover:text-cyan-200 flex items-center justify-between group transition-colors cursor-pointer"
                                    >
                                        <span>{t.deepDiveBtn}</span>
                                        <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-6 text-slate-400 text-xs">
                        {t.noData}
                    </div>
                )}
            </div>

            {/* Deep-Dive Drawer Modal */}
            <AiInsightDrawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                isLoading={deepDiveLoading}
                data={deepDiveResult}
                language={language}
            />
        </>
    );
};
