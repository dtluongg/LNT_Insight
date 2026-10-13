import React from 'react';
import { X, Sparkles, AlertTriangle, CheckCircle2, Copy, Check, RefreshCw, Zap } from 'lucide-react';
import type { AiDrillDownResponse } from '../../types/aiSummary';

interface AiInsightDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    isLoading: boolean;
    data: AiDrillDownResponse | null;
    onRefresh?: () => void;
    language?: 'vi' | 'en' | 'si';
}

export const AiInsightDrawer: React.FC<AiInsightDrawerProps> = ({
    isOpen,
    onClose,
    isLoading,
    data,
    onRefresh,
    language = 'vi'
}) => {
    const [copied, setCopied] = React.useState(false);

    // React Hooks must always be called unconditionally at the top level
    React.useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const DICTIONARIES = {
        vi: {
            engineTitle: "Bộ máy Điều hành AI (LNT Insight)",
            badge: "Phân tích Chuyên sâu",
            subTitle: "Chẩn đoán Nguyên nhân Gốc rễ & Dự báo Kịch bản Vận hành",
            refreshTitle: "Làm mới phân tích AI",
            analyzingText: "Gemini AI đang tiến hành chẩn đoán dữ liệu chuyên sâu...",
            submodule: "Phân hệ:",
            generatedAt: "Khởi tạo lúc:",
            cached: "Đã lưu đệm (Fast Cache)",
            diagnosticTitle: "Báo cáo Chẩn đoán Vận hành Chuyên sâu",
            highlightsTitle: "Điểm Sáng Tích cực",
            warningsTitle: "Cảnh báo Nguy cơ Trọng yếu",
            actionTitle: "Khuyến nghị Tác chiến Ưu tiên",
            rawTitle: "Toàn văn Báo cáo AI (Markdown)",
            copyBtn: "Sao chép Markdown",
            copiedBtn: "Đã sao chép",
            closeBtn: "Đóng cửa sổ",
            noData: "Chưa có dữ liệu phân tích chuyên sâu."
        },
        en: {
            engineTitle: "LNT AI Executive Engine",
            badge: "Stage 2 Deep Dive",
            subTitle: "Root Cause Analysis & Actionable Recommendations",
            refreshTitle: "Refresh AI Analysis",
            analyzingText: "Gemini AI is performing granular root cause analysis...",
            submodule: "Submodule:",
            generatedAt: "Generated At:",
            cached: "Fast Cache Hit",
            diagnosticTitle: "In-Depth Diagnostic & Operational Report",
            highlightsTitle: "Key Positive Highlights",
            warningsTitle: "Critical Warnings",
            actionTitle: "Recommended Immediate Action Items",
            rawTitle: "Full AI Report Text (Markdown)",
            copyBtn: "Copy Markdown",
            copiedBtn: "Copied",
            closeBtn: "Close Window",
            noData: "No deep-dive analysis available."
        },
        si: {
            engineTitle: "LNT AI විධායක එන්ජිම",
            badge: "ගැඹුරු විශ්ලේෂණය",
            subTitle: "මූලික හේතු විශ්ලේෂණය සහ ක්‍රියාකාරී නිර්දේශ",
            refreshTitle: "නැවත පූරණය කරන්න",
            analyzingText: "AI ගැඹුරු දත්ත විශ්ලේෂණය කරමින් පවතී...",
            submodule: "උප අංශය:",
            generatedAt: "ජනනය කළ වේලාව:",
            cached: "කැචය",
            diagnosticTitle: "සවිස්තරාත්මක මෙහෙයුම් සහ රෝග විනිශ්චය වාර්තාව",
            highlightsTitle: "ධනාත්මක ප්‍රධාන කරුණු",
            warningsTitle: "අවදානම් අනතුරු ඇඟවීම්",
            actionTitle: "ක්ෂණික ක්‍රියාමාර්ග නිර්දේශ",
            rawTitle: "සම්පූර්ණ AI වාර්තාව (Markdown)",
            copyBtn: "පිටපත් කරන්න",
            copiedBtn: "පිටපත් කරන ලදී",
            closeBtn: "වසන්න",
            noData: "ගැඹුරු විශ්ලේෂණයක් නොමැත."
        }
    };

    const activeLang = language === 'en' || language === 'si' ? language : 'vi';
    const t = DICTIONARIES[activeLang];

    const handleCopy = () => {
        if (data?.rawMarkdown) {
            navigator.clipboard.writeText(data.rawMarkdown);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div 
            className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200 cursor-pointer"
            onClick={onClose}
        >
            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
                <div 
                    className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col border-l border-indigo-100 dark:bg-slate-900 dark:border-slate-800 cursor-default"
                    onClick={(e) => e.stopPropagation()}
                >
                    
                    {/* Header */}
                    <div className="px-6 py-4 bg-gradient-to-r from-sky-900 via-slate-900 to-blue-950 text-white flex items-center justify-between shadow-md">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-sky-500/20 rounded-lg border border-sky-400/30">
                                <Sparkles className="w-5 h-5 text-cyan-300 animate-pulse" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                                    {t.engineTitle}
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/30 border border-cyan-300/40 text-cyan-200">
                                        {t.badge}
                                    </span>
                                </h2>
                                <p className="text-xs text-sky-200">{t.subTitle}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {onRefresh && (
                                <button
                                    onClick={onRefresh}
                                    disabled={isLoading}
                                    className="p-2 text-sky-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                                    title={t.refreshTitle}
                                >
                                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="p-2 text-sky-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Content Body */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {isLoading ? (
                            <div className="space-y-6 py-8">
                                <div className="flex items-center justify-center gap-3 text-sky-600 dark:text-sky-400">
                                    <Sparkles className="w-6 h-6 animate-spin text-cyan-500" />
                                    <span className="font-semibold text-sm animate-pulse">{t.analyzingText}</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-3/4"></div>
                                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-full"></div>
                                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-5/6"></div>
                                    <div className="h-24 bg-sky-50/50 dark:bg-slate-800/50 rounded-xl animate-pulse border border-sky-100 dark:border-slate-800"></div>
                                </div>
                            </div>
                        ) : data ? (
                            <>
                                {/* Report Title */}
                                <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                                        {data.title}
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                                        <span>{t.submodule} {data.subModuleCode}</span>
                                        <span>•</span>
                                        <span>{t.generatedAt} {data.generatedAt ? new Date(data.generatedAt).toLocaleTimeString() : new Date().toLocaleTimeString()}</span>
                                        {data.isCached && (
                                            <span className="px-2 py-0.5 text-[10px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded">
                                                {t.cached}
                                            </span>
                                        )}
                                    </p>
                                </div>

                                {/* Main Diagnostic & Root Cause Report Card */}
                                <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 rounded-xl dark:from-slate-900 dark:to-amber-950/20 dark:border-amber-900/40">
                                    <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold mb-2">
                                        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                        {t.diagnosticTitle}
                                    </div>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-line">
                                        {data.rootCauseAnalysis}
                                    </p>
                                </div>

                                {/* Key Highlights & Warnings Grid (if available) */}
                                {((data.keyHighlights && data.keyHighlights.length > 0) || (data.warnings && data.warnings.length > 0)) && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Highlights */}
                                        {data.keyHighlights && data.keyHighlights.length > 0 && (
                                            <div className="p-4 bg-emerald-50/70 border border-emerald-200/70 rounded-xl dark:from-slate-900 dark:bg-slate-800/40 dark:border-emerald-900/30">
                                                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold text-sm mb-2">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                    {t.highlightsTitle}
                                                </div>
                                                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                                                    {data.keyHighlights.map((item, idx) => (
                                                        <li key={idx} className="flex items-start gap-1.5">
                                                            <span className="text-emerald-600 font-bold">•</span>
                                                            <span>{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Warnings */}
                                        {data.warnings && data.warnings.length > 0 && (
                                            <div className="p-4 bg-rose-50/70 border border-rose-200/70 rounded-xl dark:bg-slate-800/40 dark:border-rose-900/30">
                                                <div className="flex items-center gap-2 text-rose-800 dark:text-rose-400 font-bold text-sm mb-2">
                                                    <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                                                    {t.warningsTitle}
                                                </div>
                                                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                                                    {data.warnings.map((item, idx) => (
                                                        <li key={idx} className="flex items-start gap-1.5">
                                                            <span className="text-rose-600 font-bold">•</span>
                                                            <span>{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Recommended Action Items (if available) */}
                                {data.actionItems && data.actionItems.length > 0 && (
                                    <div className="p-4 bg-sky-50/80 border border-sky-200/80 rounded-xl dark:bg-sky-950/20 dark:border-sky-900/40">
                                        <div className="flex items-center gap-2 text-sky-900 dark:text-sky-300 font-bold text-sm mb-3">
                                            <Zap className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                                            {t.actionTitle}
                                        </div>
                                        <div className="space-y-2">
                                            {data.actionItems.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-3 p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-sky-100 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 font-medium">
                                                    <span className="w-5 h-5 rounded-full bg-sky-600 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                                                        {idx + 1}
                                                    </span>
                                                    <span>{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Full Raw Markdown Report */}
                                <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                            {t.rawTitle}
                                        </h4>
                                        <button
                                            onClick={handleCopy}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                                        >
                                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                            {copied ? t.copiedBtn : t.copyBtn}
                                        </button>
                                    </div>
                                    <div className="p-4 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto">
                                        {data.rawMarkdown}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12 text-slate-400">
                                {t.noData}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 dark:bg-slate-900 dark:border-slate-800 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                            {t.closeBtn}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};
