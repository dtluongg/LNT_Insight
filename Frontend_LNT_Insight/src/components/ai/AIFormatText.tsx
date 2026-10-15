import React from 'react'

interface AIFormatTextProps {
    content: string;  // content includes markdown, number, -, ....
    className?: string; // classname css of tailwindCSS
    isDeepAnalysis?: boolean; // true if detail views
    // theme?: 'dark' | 'light' | 'auto'; // theme for css.
}

function hightlightMetrics(text: string): React.ReactNode[] {
    // bieu thuc chinh quy:
    // const metricRegex = /(?:[+\-−]?\d+(?:[.,]\d+)?%|\b(?:LINE|Line|Chuy[ềe]n)[-\s]?\d+(?:[&\+]\d+)?\b|\b\d{1,2}:\d{2}\b|\b\d+(?:[.,]\d+)*(?:\/\d+(?:[.,]\d+)*)(?:\s*(?:sản phẩm|sp|pcs|cái|áo))?|\b\d+(?:[.,]\d+)?(?:\s*(?:sản phẩm|sp|pcs(?:\/h)?|cái|áo|trường hợp|lỗi|giờ|h|chiếc|đơn vị))\b|\b\d{1,3}(?:[.,]\d{3})+\b|\b\d{2,}\b)/gi;
    // 1. Tỷ lệ % (e.g. +296.07%, 95%, -30.5%)
    const percentagePattern = /[+\-−]?\d+(?:[.,]\d+)?%/;

    // 2. Chuyền / Line (e.g. LINE-01, Line 1, Chuyền 01)
    const lineNamePattern = /\b(?:LINE|Line|Chuy[ềe]n)[-\s]?\d+(?:[&\+]\d+)?\b/i;

    // 3. Mốc giờ (e.g. 07:30, 16:57)
    const timestampPattern = /\b\d{1,2}:\d{2}\b/;

    // 4. Số lượng, tỷ lệ, số nghìn, số nguyên (Đã gộp gọn 4 trong 1)
    const quantityAndNumberPattern = /\b(?:\d+(?:[.,]\d+)*(?:\s*\/\s*\d+(?:[.,]\d+)*)?\s*(?:pcs(?:\/h)?|sản phẩm|sp|cái|áo|lỗi|h|giờ)\b|\d{1,3}(?:[.,]\d{3})+\b|\d{2,}\b)/i;

    const metricRegexTL = new RegExp(
        `(${[percentagePattern.source, lineNamePattern.source, timestampPattern.source, quantityAndNumberPattern.source]
            .join('|')
        })`, `gi`
    );

    const parts = text.split(metricRegexTL);

    return parts.map((part, idx) => {
        if (!part)
            return null;

        // 1. Config for percentage value data:
        if (percentagePattern.test(part)) {
            const isNegative = part.startsWith('-') || part.startsWith('−');
            let badgeClass = isNegative ? 'text-rose-700 bg-rose-100 border border-rose-300 shadow-xs'
                : 'text-emerald-700 bg-emerald-100 border border-emerald-300 shadow-xs';
            return <span key={idx} className={`inline-flex items-center font-bold px-1.5 py-0.5 rounded text-[11px] font-mono mx-0.5 transition-colors ${badgeClass}`}>{part}</span>
        }
        // 2. Team Name and Time:
        if (lineNamePattern.test(part)) {
            let badgeClass = 'text-purple-700 bg-purple-100 border border-purple-300 shadow-xs';
            return <span key={idx} className={`inline-flex items-center font-bold px-1.5 py-0.5 rounded text-[11px] font-mono mx-0.5 ${badgeClass}`}>{part}</span>
        }

        // 3. Clock:
        if (timestampPattern.test(part)) {
            let badgeClass = 'text-sky-700 bg-sky-100 border border-sky-300 shadow-xs';
            return <span key={idx} className={`inline-flex items-center font-semibold px-1.5 py-0.5 rounded text-[11px] font-mono mx-0.5 ${badgeClass}`}>{part}</span>
        }

        // 4: summary nummber value:
        if (quantityAndNumberPattern.test(part)) {
            let badgeClass = 'text-amber-800 bg-amber-100 border border-amber-300 shadow-xs';
            return <span key={idx} className={`inline-flex items-center font-bold px-1.5 py-0.5 rounded text-[11px] font-mono mx-0.5 ${badgeClass}`}>{part}</span>
        }
    })
}



function AIFormatText({ content, className = '', isDeepAnalysis = false }: AIFormatTextProps) {
    // 1 if don't have data, return null -> sure.
    if (!content) return null;

    // 2 tách nội dung xuống dòng (split)
    const rawLines = content.split('\n');

    // 3 Preset bảng màu cho các thành phần văn bản:
    const colors = {
        bulletDot: 'text-indigo-600',
        subLabel: 'text-slate-900',
        restText: 'text-slate-800',
        paragraph: 'text-slate-800',
        headingBadge: 'bg-indigo-600 text-white',
        headingText: 'text-slate-900',
    }

    return (
        <div className={`space-y-2.5 ${className}`}>
            {rawLines.map((line, lineIdx) => {
                const trimmed = line.trim();

                if (!trimmed) return <div key={lineIdx} className='h1'></div>
                // nhận diện tiêu đề:
                const headingMatch = trimmed.match(/^(\d+[\.\)]\s+)(.+)$/);
                if (headingMatch && isDeepAnalysis) {
                    const numberPrefix = headingMatch[1].trim();
                    const titleText = headingMatch[2].trim();
                    return (
                        <div
                            key={lineIdx}
                            className="pt-3 pb-1 border-b border-indigo-200/50 dark:border-slate-800 first:pt-0"
                        >
                            <div className="flex items-center gap-2">
                                {/* Ô vuông nhỏ chứa số thứ tự mục */}
                                <span className={`w-5 h-5 rounded-md ${colors.headingBadge} flex items-center justify-center text-[11px] font-bold shrink-0`}>
                                    {numberPrefix.replace(/[\.\)]/, '')}
                                </span>
                                {/* Nội dung tiêu đề in hoa đậm */}
                                <h4 className={`text-xs font-black uppercase tracking-wider ${colors.headingText}`}>
                                    {titleText}
                                </h4>
                            </div>
                        </div>
                    );
                }
                return
            })}

        </div>
    )
}

export default AIFormatText