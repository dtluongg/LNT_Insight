import React from 'react'

interface AIFormatTextProps {
    content: string;  // content includes markdown, number, -, ....
    className?: string; // classname css of tailwindCSS
    isDeepAnalysis?: boolean; // true if detail views
    theme?: 'dark' | 'light' | 'auto' ; // theme for css.
}

function hightlightMetrics( text: string, theme: 'dark' | 'light' | 'auto' = 'auto'): React.ReactNode[]{
    // bieu thuc chinh quy:
    const metricRegex = /(?:[+\-−]?\d+(?:[.,]\d+)?%|\b(?:LINE|Line|Chuy[ềe]n)[-\s]?\d+(?:[&\+]\d+)?\b|\b\d{1,2}:\d{2}\b|\b\d+(?:[.,]\d+)*(?:\/\d+(?:[.,]\d+)*)(?:\s*(?:sản phẩm|sp|pcs|cái|áo))?|\b\d+(?:[.,]\d+)?(?:\s*(?:sản phẩm|sp|pcs(?:\/h)?|cái|áo|trường hợp|lỗi|giờ|h|chiếc|đơn vị))\b|\b\d{1,3}(?:[.,]\d{3})+\b|\b\d{2,}\b)/gi;
    const numberAndPercentage = /(?:[+\-−]?\s?\d+[.,]?\d+)\s?%?/;
    const lineName = /\b(?:LINE|Line|Chuy[ềe]n)(?:\s?[.,-]?\d?\s*[+&]*\s*\d*)\b/;
    const valueOfPercentage = /\b(?:\d+(?:[.,]\d+)*\s*(?:\/\s*\d+(?:[.,]\d+)*)?(?:\s*(?:cái|sản phẩm|pcs|sp))?)/;
    const numberOfValueThoudsand = /\b\d{2,}(?:[.,]\d{3})*\b/;

    const parts = text.split(metricRegex):
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