export interface TrendResult {
    trendValue: string;
    trendType: 'up' | 'down' | 'neutral';
    diff: number;
}
/**
 * 
 * @param preValue (number) value of previous date
 * @param curValue (number) value of current date
 * @param isPercent (boolean) If true, calculates absolute point difference (e.g. rate % minus rate %). Otherwise calculates percentage change %.
 * @returns TrendResult
 */
export const comparisonTrendResult = (preValue: number, curValue: number, isPercent: boolean = false): TrendResult => {
    if (isPercent) { // if value has flag isPercent, just get data current minus prev to show data.
        const diff = curValue - preValue;
        const absDiff = Math.abs(diff).toFixed(2);
        if (diff > 0) {
            return { trendValue: `+${absDiff}%`, trendType: 'up', diff };
        } else if (diff < 0) {
            return { trendValue: `-${absDiff}%`, trendType: 'down', diff };
        }
        return { trendValue: `0.0%`, trendType: 'neutral', diff: 0 };
    }

    // if value not have flg isPercent -> calculate data and percent

    if (preValue === 0) {
        if (curValue > 0) {
            return { trendValue: '+100%', trendType: 'up', diff: 100 };
        }
        return { trendValue: '0.0%', trendType: 'neutral', diff: 0 };
    }

    const percentChange = ((curValue - preValue) / preValue) * 100;
    const absChange = Math.abs(percentChange).toFixed(1);
    if (percentChange > 0) {
        return { trendValue: `+${absChange}%`, trendType: 'up', diff: percentChange };
    } else if (percentChange < 0) {
        return { trendValue: `-${absChange}%`, trendType: 'down', diff: percentChange };
    }
    return { trendValue: '0.0%', trendType: 'neutral', diff: 0 };
}
