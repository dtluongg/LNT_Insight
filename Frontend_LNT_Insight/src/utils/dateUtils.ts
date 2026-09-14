/**
 * Date and comparison utility functions
 */

/**
 * Calculates the previous working day given a date string in YYYY-MM-DD format.
 * If the calculated previous day falls on Sunday (0), it rolls back to Saturday or Friday.
 */
export const getPreviousWorkingDayClient = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  // Subtract 1 day
  date.setDate(date.getDate() - 1);

  // If Sunday (0), subtract another day to get Saturday (6)
  if (date.getDay() === 0) {
    date.setDate(date.getDate() - 1);
  }

  return date.toISOString().split('T')[0];
};

export interface TrendResult {
  trendValue: string;
  trendType: 'up' | 'down' | 'neutral';
  diff: number;
}

/**
 * Calculates trend percentage or point difference between current and previous values.
 * @param currentVal Current day value
 * @param prevVal Previous day value
 * @param isPointDiff If true, calculates absolute point difference (e.g. rate % minus rate %). Otherwise calculates percentage change %.
 */
export const calculateTrend = (
  currentVal: number,
  prevVal: number,
  isPointDiff: boolean = false
): TrendResult => {
  if (prevVal === 0) {
    if (currentVal > 0) {
      return { trendValue: '+100%', trendType: 'up', diff: 100 };
    }
    return { trendValue: '0.0%', trendType: 'neutral', diff: 0 };
  }

  if (isPointDiff) {
    const diff = currentVal - prevVal;
    const absDiff = Math.abs(diff).toFixed(1);
    if (diff > 0) {
      return { trendValue: `+${absDiff}%`, trendType: 'up', diff };
    } else if (diff < 0) {
      return { trendValue: `-${absDiff}%`, trendType: 'down', diff };
    }
    return { trendValue: '0.0%', trendType: 'neutral', diff: 0 };
  }

  const percentChange = ((currentVal - prevVal) / prevVal) * 100;
  const absChange = Math.abs(percentChange).toFixed(1);

  if (percentChange > 0) {
    return { trendValue: `+${absChange}%`, trendType: 'up', diff: percentChange };
  } else if (percentChange < 0) {
    return { trendValue: `-${absChange}%`, trendType: 'down', diff: percentChange };
  }

  return { trendValue: '0.0%', trendType: 'neutral', diff: 0 };
};
