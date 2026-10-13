import React from 'react';

interface AiFormattedTextProps {
    content: string;
    className?: string;
    isDeepDive?: boolean;
    theme?: 'dark' | 'light' | 'auto';
}

/**
 * Tokenizes text and highlights numbers, percentages, line codes, timestamps, and quantities
 * with theme-aware high-contrast executive badges.
 */
function highlightMetrics(text: string, theme: 'dark' | 'light' | 'auto' = 'auto'): React.ReactNode[] {
    // Regex matches in prioritized order:
    // 1. Percentages (e.g. +296.07%, 296,07%, -30.68%, 195.5%, 0.0%)
    // 2. Line/Team codes (e.g. LINE-01, LINE-09, Line 1, Chuyền 01)
    // 3. Timestamps (e.g. 16:57, 17:00, 07:30, 16:31)
    // 4. Ratios (e.g. 1,732/585, 1,732/585 sản phẩm)
    // 5. Quantities with units or decimal units (e.g. 199.1 pcs/h, 0.0h, 1551 pcs, 758 pcs, 585 sản phẩm, 6 trường hợp, 6 lỗi, 1.5h)
    // 6. Formatted thousand-separated numbers (e.g. 1.732, 2.500)
    // 7. Standalone integers (e.g. 585, 1800, 2500)
    const metricRegex = /([+\-−]?\d+(?:[.,]\d+)?%|\b(?:LINE|Line|Chuy[ềe]n)[-\s]?\d+(?:[&\+]\d+)?\b|\b\d{1,2}:\d{2}\b|\b\d+(?:[.,]\d+)*(?:\/\d+(?:[.,]\d+)*)(?:\s*(?:sản phẩm|sp|pcs|cái|áo))?|\b\d+(?:[.,]\d+)?(?:\s*(?:sản phẩm|sp|pcs(?:\/h)?|cái|áo|trường hợp|lỗi|giờ|h|chiếc|đơn vị))\b|\b\d{1,3}(?:[.,]\d{3})+\b|\b\d{2,}\b)/gi;

    const parts = text.split(metricRegex);

    return parts.map((part, idx) => {
        if (!part) return null;

        // 1. Percentage Token
        if (/^[+\-−]?\d+(?:[.,]\d+)?%$/.test(part)) {
            const isNegative = part.startsWith('-') || part.startsWith('−');

            let badgeClass = '';
            if (theme === 'dark') {
                badgeClass = isNegative
                    ? 'text-rose-300 bg-rose-500/25 border border-rose-500/40 shadow-xs'
                    : 'text-emerald-300 bg-emerald-500/25 border border-emerald-500/40 shadow-xs';
            } else if (theme === 'light') {
                badgeClass = isNegative
                    ? 'text-rose-700 bg-rose-100 border border-rose-300 shadow-xs'
                    : 'text-emerald-700 bg-emerald-100 border border-emerald-300 shadow-xs';
            } else {
                badgeClass = isNegative
                    ? 'text-rose-700 bg-rose-100 border border-rose-300 dark:text-rose-300 dark:bg-rose-500/25 dark:border-rose-500/40 shadow-xs'
                    : 'text-emerald-700 bg-emerald-100 border border-emerald-300 dark:text-emerald-300 dark:bg-emerald-500/25 dark:border-emerald-500/40 shadow-xs';
            }

            return (
                <span key={idx} className={`inline-flex items-center font-bold px-1.5 py-0.5 rounded text-[11px] font-mono mx-0.5 transition-colors ${badgeClass}`}>
                    {part}
                </span>
            );
        }

        // 2. Line / Workstation Token
        if (/^(?:LINE|Line|Chuy[ềe]n)[-\s]?\d+/i.test(part)) {
            let badgeClass = '';
            if (theme === 'dark') {
                badgeClass = 'text-purple-300 bg-purple-500/25 border border-purple-500/40 shadow-xs';
            } else if (theme === 'light') {
                badgeClass = 'text-purple-700 bg-purple-100 border border-purple-300 shadow-xs';
            } else {
                badgeClass = 'text-purple-700 bg-purple-100 border border-purple-300 dark:text-purple-300 dark:bg-purple-500/25 dark:border-purple-500/40 shadow-xs';
            }

            return (
                <span key={idx} className={`inline-flex items-center font-bold px-1.5 py-0.5 rounded text-[11px] font-mono mx-0.5 ${badgeClass}`}>
                    {part}
                </span>
            );
        }

        // 3. Timestamp Token (e.g. 16:57, 17:00)
        if (/^\d{1,2}:\d{2}$/.test(part)) {
            let badgeClass = '';
            if (theme === 'dark') {
                badgeClass = 'text-sky-300 bg-sky-500/25 border border-sky-500/40 shadow-xs';
            } else if (theme === 'light') {
                badgeClass = 'text-sky-700 bg-sky-100 border border-sky-300 shadow-xs';
            } else {
                badgeClass = 'text-sky-700 bg-sky-100 border border-sky-300 dark:text-sky-300 dark:bg-sky-500/25 dark:border-sky-500/40 shadow-xs';
            }

            return (
                <span key={idx} className={`inline-flex items-center font-semibold px-1.5 py-0.5 rounded text-[11px] font-mono mx-0.5 ${badgeClass}`}>
                    {part}
                </span>
            );
        }

        // 4. Quantities, Ratios, Decimal numbers
        if (/\d/.test(part)) {
            let badgeClass = '';
            if (theme === 'dark') {
                badgeClass = 'text-amber-300 bg-amber-500/25 border border-amber-500/40 shadow-xs';
            } else if (theme === 'light') {
                badgeClass = 'text-amber-800 bg-amber-100 border border-amber-300 shadow-xs';
            } else {
                badgeClass = 'text-amber-800 bg-amber-100 border border-amber-300 dark:text-amber-300 dark:bg-amber-500/25 dark:border-amber-500/40 shadow-xs';
            }

            return (
                <span key={idx} className={`inline-flex items-center font-bold px-1.5 py-0.5 rounded text-[11px] font-mono mx-0.5 ${badgeClass}`}>
                    {part}
                </span>
            );
        }

        return <span key={idx}>{part}</span>;
    });
}

export const AiFormattedText: React.FC<AiFormattedTextProps> = ({
    content,
    className = '',
    isDeepDive = false,
    theme = 'auto'
}) => {
    if (!content) return null;

    // Split content by line breaks
    const rawLines = content.split('\n');

    // Theme color presets for text
    const colors = {
        dark: {
            bulletDot: 'text-cyan-400',
            subLabel: 'text-cyan-300',
            restText: 'text-slate-100',
            paragraph: 'text-slate-100',
            headingBadge: 'bg-indigo-500 text-white',
            headingText: 'text-white'
        },
        light: {
            bulletDot: 'text-indigo-600',
            subLabel: 'text-slate-900',
            restText: 'text-slate-800',
            paragraph: 'text-slate-800',
            headingBadge: 'bg-indigo-600 text-white',
            headingText: 'text-slate-900'
        },
        auto: {
            bulletDot: 'text-indigo-600 dark:text-cyan-400',
            subLabel: 'text-slate-900 dark:text-cyan-300',
            restText: 'text-slate-800 dark:text-slate-100',
            paragraph: 'text-slate-800 dark:text-slate-100',
            headingBadge: 'bg-indigo-600 text-white dark:bg-indigo-500',
            headingText: 'text-slate-800 dark:text-slate-100'
        }
    }[theme];

    return (
        <div className={`space-y-2.5 ${className}`}>
            {rawLines.map((line, lineIdx) => {
                const trimmed = line.trim();
                if (!trimmed) return <div key={lineIdx} className="h-1" />;

                // 1. Check for Major Section Headings (e.g., "1. HIỆU SUẤT TOÀN NHÀ MÁY", "2. PHÂN TÍCH...")
                const headingMatch = trimmed.match(/^(\d+[\.\)]\s+)(.+)$/);
                if (headingMatch && isDeepDive) {
                    const numberPrefix = headingMatch[1].trim();
                    const titleText = headingMatch[2].trim();
                    return (
                        <div
                            key={lineIdx}
                            className="pt-3 pb-1 border-b border-indigo-200/50 dark:border-slate-800 first:pt-0"
                        >
                            <div className="flex items-center gap-2">
                                <span className={`w-5 h-5 rounded-md ${colors.headingBadge} flex items-center justify-center text-[11px] font-bold shrink-0`}>
                                    {numberPrefix.replace(/[\.\)]/, '')}
                                </span>
                                <h4 className={`text-xs font-black uppercase tracking-wider ${colors.headingText}`}>
                                    {titleText}
                                </h4>
                            </div>
                        </div>
                    );
                }

                // 2. Check for Bullet Points with Sub-labels
                // Matches "• Sub Label: Rest of sentence" while avoiding splitting on colons inside timestamps like (17:00)
                const bulletMatch = trimmed.match(/^([•\-\*]\s*)(.+?):\s+(.*)$/);
                if (bulletMatch) {
                    const subLabel = bulletMatch[2].trim();
                    let restText = bulletMatch[3].trim();

                    // Guard against accidental duplicate label e.g. "• Hiệu suất: Hiệu suất: Tỷ lệ..."
                    if (restText.toLowerCase().startsWith(subLabel.toLowerCase() + ':')) {
                        restText = restText.slice(subLabel.length + 1).trim();
                    }

                    return (
                        <div key={lineIdx} className="flex items-start gap-2 pl-1 leading-relaxed">
                            <span className={`${colors.bulletDot} font-bold shrink-0 mt-0.5`}>•</span>
                            <div className="flex-1">
                                <span className={`font-bold ${colors.subLabel} mr-1.5 underline-offset-2`}>
                                    {subLabel}:
                                </span>
                                <span className={`${colors.restText}`}>
                                    {highlightMetrics(restText, theme)}
                                </span>
                            </div>
                        </div>
                    );
                }

                // 3. Check for Bullets without explicit colon (e.g., "• Đạt 1.732...")
                const simpleBulletMatch = trimmed.match(/^([•\-\*]\s*)(.*)$/);
                if (simpleBulletMatch) {
                    return (
                        <div key={lineIdx} className="flex items-start gap-2 pl-1 leading-relaxed">
                            <span className={`${colors.bulletDot} font-bold shrink-0 mt-0.5`}>•</span>
                            <div className={`flex-1 ${colors.restText}`}>
                                {highlightMetrics(simpleBulletMatch[2], theme)}
                            </div>
                        </div>
                    );
                }

                // 4. Default regular text paragraph
                return (
                    <p key={lineIdx} className={`leading-relaxed ${colors.paragraph}`}>
                        {highlightMetrics(trimmed, theme)}
                    </p>
                );
            })}
        </div>
    );
};
