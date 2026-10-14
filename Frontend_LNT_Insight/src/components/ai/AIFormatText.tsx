import React from 'react'

interface AIFormatTextProps {
    content: string;  // content includes markdown, number, -, ....
    className?: string; // classname css of tailwindCSS
    isDeepAnalysis?: boolean; // true if detail views
    theme?: 'dark' | 'light' | 'auto' ; // theme for css.
}

function hightlightMetrics( text: string, theme: 'dark' | 'light' | 'auto' = 'auto'): React.ReactNode[]{
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
        })`,`gi`
    );

    const parts = text.split(metricRegexTL):
    return parts.map((part , idx) => {
        if(!part)
            return null;
        return <span key={idx}>{part}</span>
    }) 
}



function AIFormatText {
  return (
    <div>AIFormatText</div>
  )
}

export default AIFormatText