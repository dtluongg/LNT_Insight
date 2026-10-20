import React from 'react'

interface AIFormatTextProps {
    content: string;  // content includes markdown, number, -, ....
    className?: string; // classname css of tailwindCSS
    isDeepAnalysis?: boolean; // true if detail views
    // theme?: 'dark' | 'light' | 'auto'; // theme for css.
}
function hightlightMetrics(text: string): React.ReactNode[] {
    // 1. Tỷ lệ % (BẮT CẢ DẤU NGOẶC ĐƠN nếu có, ví dụ: "(206.4%)", "( 0.0% )", "+130.3%")
    const percentagePattern = /(?:\(\s*)?[+\-−]?\d+(?:[.,]\d+)?\%\s*(?:\))?/;

    // 2. Chuyền / Line (Ví dụ: "LINE-01", "Line 02", "LINE-01&03")
    const lineNamePattern = /\b(?:LINE|Line|Chuy[ềe]n)[-\s]?\d+(?:[&\+]\d+)?\b/i;

    // 3. Số lượng, số phân cách, mốc giờ (Chỉ bắt để IN ĐẬM, không đóng khung badge hộp)
    const highlightNumberPattern = /\b\d{1,2}:\d{2}\b|\b\d+(?:[.,]\d+)*(?:\s*(?:pcs(?:\/h)?|sản phẩm|sp|cái|áo|lỗi|h|giờ))?\b/i;

    // Gộp Regex với ngoặc chụp () để split giữ lại các phần tử
    const metricRegex = new RegExp(
        `(${[
            percentagePattern.source,
            lineNamePattern.source,
            highlightNumberPattern.source
        ].join('|')})`,
        'gi'
    );

    const parts = text.split(metricRegex);

    return parts.map((part, idx) => {
        if (!part) return null;

        // --- NHÓM 1: TỶ LỆ % (Badge mềm bo tròn, nuốt trọn cả ngoặc) ---
        if (percentagePattern.test(part)) {
            // Kiểm tra xem có phải 0% hoặc số âm không
            const isWarning = part.includes('-') || part.includes('−') || /^\(?\s*0(?:[.,]0+)?\%\s*\)?$/.test(part);
            
            const badgeClass = isWarning
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' // Đỏ hồng cảnh báo nếu âm hoặc 0%
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'; // Xanh ngọc nếu đạt

            return (
                <span
                    key={idx}
                    className={`inline-flex items-center font-bold px-1.5 py-0.5 rounded text-[11px] font-mono mx-1 ${badgeClass}`}
                >
                    {part}
                </span>
            );
        }

        // --- NHÓM 2: MÃ CHUYỀN (Badge Tím Indigo thanh lịch) ---
        if (lineNamePattern.test(part)) {
            return (
                <span
                    key={idx}
                    className="inline-flex items-center font-bold px-1.5 py-0.5 rounded text-[11px] font-mono mx-1 bg-indigo-500/25 text-indigo-200 border border-indigo-400/30"
                >
                    {part}
                </span>
            );
        }

        // --- NHÓM 3: SỐ LƯỢNG / MỐC GIỜ (CHỈ IN ĐẬM & ĐỔI MÀU VÀNG/TRẮNG, KHÔNG DÙNG BADGE HỘP) ---
        if (highlightNumberPattern.test(part)) {
            return (
                <strong key={idx} className="font-bold text-amber-300 font-mono mx-0.5">
                    {part}
                </strong>
            );
        }

        // Chữ thông thường trong câu
        return <span key={idx}>{part}</span>;
    });
}


function AIFormatText({ content, className = '', isDeepAnalysis = false }: AIFormatTextProps) {
    // 1 if don't have data, return null -> sure.
    if (!content) return null;

    // 2 tách nội dung xuống dòng (split)
    const rawLines = content.split('\n');

    // 3 Preset bảng màu cho các thành phần văn bản:
    const colors = {
    bulletDot: 'text-cyan-400',       // Chấm tròn sáng màu cyan
    subLabel: 'text-cyan-300 font-bold', // Nhãn phụ sáng rõ
    restText: 'text-slate-200',       // Chữ nội dung màu trắng ngà
    paragraph: 'text-slate-200',      // Đoạn văn màu trắng ngà
    headingBadge: 'bg-indigo-500 text-white',
    headingText: 'text-white font-bold',
};

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
                            className="pt-3 pb-1 border-b border-indigo-200/50 border-indigo-200/50 first:pt-0"
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

                // Nhận diện gạch đầu dòng có nhãn phụ:
                const bulletMatch = trimmed.match(/^([•\-\*]\s*)(.+?):\s+(.*)$/);
                if (bulletMatch) {
                    const subLabel = bulletMatch[2].trim();
                    let restText = bulletMatch[3].trim();

                    // Guard chống lỗi AI vô tình lặp từ (Ví dụ: "• Hiệu suất: Hiệu suất: Tỷ lệ...")
                    if (restText.toLowerCase().startsWith(subLabel.toLowerCase() + ':')) {
                        restText = restText.slice(subLabel.length + 1).trim();
                    }

                    return (
                        <div key={lineIdx} className="flex items-start gap-2 pl-1 leading-relaxed">
                            {/* Dấu chấm tròn đầu dòng với màu nổi bật theo theme */}
                            <span className={`${colors.bulletDot} font-bold shrink-0 mt-0.5`}>•</span>

                            <div className="flex-1">
                                {/* Nhãn phụ in đậm */}
                                <span className={`font-bold ${colors.subLabel} mr-1.5 underline-offset-2`}>
                                    {subLabel}:
                                </span>

                                {/* Nội dung phía sau: Tự động badge hóa các số liệu */}
                                <span className={colors.restText}>
                                    {hightlightMetrics(restText)}
                                </span>
                            </div>
                        </div>
                    );
                }

                // 3. Nhận diện Gạch đầu dòng đơn (Ví dụ: "• Đạt 1.732 sản phẩm hôm nay")
                const simpleBulletMatch = trimmed.match(/^([•\-\*]\s*)(.*)$/);
                if (simpleBulletMatch) {
                    return (
                        <div key={lineIdx} className="flex items-start gap-2 pl-1 leading-relaxed">
                            <span className={`${colors.bulletDot} font-bold shrink-0 mt-0.5`}>•</span>
                            <div className={`flex-1 ${colors.restText}`}>
                                {hightlightMetrics(simpleBulletMatch[2])}
                            </div>
                        </div>
                    );
                }

                // 4. Đoạn văn thông thường (Mặc định cho các dòng còn lại)
                return (
                    <p key={lineIdx} className={`leading-relaxed ${colors.paragraph}`}>
                        {hightlightMetrics(trimmed)}
                    </p>
                );
                
            })}

        </div>
    )
}

export default AIFormatText