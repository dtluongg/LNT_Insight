/**
 * This file is process date for "Comparison Previous Date" Function
 */

export const getPreviousWorkingDay = (dateInput: string): string => { // dateInput must be is string, and result will be return is string value.
    if (!dateInput) return '';
    const date = new Date(dateInput)    // create Date object for calculate
    if (isNaN(date.getTime())) return dateInput;

    // Subtract 1 day:
    date.setDate(date.getDate() - 1);

    // If Sunday (0), substract another day to get Saturday 
    if (date.getDate() === 0) {
        date.setDate(date.getDate() - 1);
    }

    return date.toISOString().split('T')[0];
}

export const getNextWorkingDay = (dateInput: string): string => { // dateInput must be is string, and result will be return is string value.
    if (!dateInput) return '';
    const date = new Date(dateInput)    // create Date object for calculate
    if (isNaN(date.getTime())) return dateInput;

    // Add 1 day:
    date.setDate(date.getDate() + 1);

    // If Sunday (0), substract another day to get Saturday 
    if (date.getDate() === 0) {
        date.setDate(date.getDate() + 1);
    }

    return date.toISOString().split('T')[0];
}