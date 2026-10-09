import React from 'react';
import { X, Sparkles, AlertTriangle, CheckCircle2, Copy, Check, RefreshCw, Zap } from 'lucide-react';
import type { AiDrillDownResponse } from '../../types/aiSummary';

interface AiInsightDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    isLoading: boolean;
    data: AiDrillDownResponse | null;
    onRefresh?: () => void;
}

export const AiInsightDrawer: React.FC<AiInsightDrawerProps> = ({
    isOpen,
    onClose,
    isLoading,
    data,
    onRefresh
}) => {
    const [copied, setCopied] = React.useState(false);

    if (!isOpen) return null;

    const handleCopy = () => {
        if (data?.rawMarkdown) {
            navigator.clipboard.writeText(data.rawMarkdown);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
                <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col border-l border-indigo-100 dark:bg-slate-900 dark:border-slate-800">
                    
                    {/* Header */}
                    <div className="px-6 py-4 bg-gradient-to-r from-sky-900 via-slate-900 to-blue-950 text-white flex items-center justify-between shadow-md">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-sky-500/20 rounded-lg border border-sky-400/30">
                                <Sparkles className="w-5 h-5 text-cyan-300 animate-pulse" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                                    LNT AI Executive Engine
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/30 border border-cyan-300/40 text-cyan-200">
                                        Stage 2 Deep Dive
                                    </span>
                                </h2>
                                <p className="text-xs text-sky-200">Root Cause Analysis & Actionable Recommendations</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {onRefresh && (
                                <button
                                    onClick={onRefresh}
                                    disabled={isLoading}
                                    className="p-2 text-sky-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                                    title="Refresh AI Analysis"
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
                                    <span className="font-semibold text-sm animate-pulse">Gemini AI is performing granular root cause analysis...</span>
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
                                        <span>Submodule: {data.subModuleCode}</span>
                                        <span>•</span>
                                        <span>Generated At: {new Date(data.generatedAt).toLocaleTimeString()}</span>
                                        {data.isCached && (
                                            <span className="px-2 py-0.5 text-[10px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded">
                                                Fast Cache Hit
                                            </span>
                                        )}
                                    </p>
                                </div>

                                {/* Root Cause Analysis Card */}
                                <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 rounded-xl dark:from-slate-900 dark:to-amber-950/20 dark:border-amber-900/40">
                                    <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold mb-2">
                                        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                        Root Cause Analysis Identification
                                    </div>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                                        {data.rootCauseAnalysis}
                                    </p>
                                </div>

                                {/* Key Highlights & Warnings Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Highlights */}
                                    <div className="p-4 bg-emerald-50/70 border border-emerald-200/70 rounded-xl dark:from-slate-900 dark:bg-slate-800/40 dark:border-emerald-900/30">
                                        <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold text-sm mb-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                            Key Positive Highlights
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

                                    {/* Warnings */}
                                    <div className="p-4 bg-rose-50/70 border border-rose-200/70 rounded-xl dark:bg-slate-800/40 dark:border-rose-900/30">
                                        <div className="flex items-center gap-2 text-rose-800 dark:text-rose-400 font-bold text-sm mb-2">
                                            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                                            Critical Warnings
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
                                </div>

                                {/* Recommended Action Items */}
                                <div className="p-4 bg-sky-50/80 border border-sky-200/80 rounded-xl dark:bg-sky-950/20 dark:border-sky-900/40">
                                    <div className="flex items-center gap-2 text-sky-900 dark:text-sky-300 font-bold text-sm mb-3">
                                        <Zap className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                                        Recommended Immediate Action Items
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

                                {/* Full Raw Markdown Report */}
                                <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                            Full AI Report Text (Markdown)
                                        </h4>
                                        <button
                                            onClick={handleCopy}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                        >
                                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                            {copied ? 'Copied' : 'Copy Markdown'}
                                        </button>
                                    </div>
                                    <div className="p-4 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto">
                                        {data.rawMarkdown}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12 text-slate-400">
                                No deep-dive analysis available.
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 dark:bg-slate-900 dark:border-slate-800 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors"
                        >
                            Close Window
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};
