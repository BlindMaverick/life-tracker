import { startOfWeek, addDays, format } from 'date-fns';

// Get Monday of the current week
export const getWeekStart = (date = new Date()) => {
    return startOfWeek(date, { weekStartsOn: 1 }); // 1 = Monday
};

// Get all 7 days of the week from a Monday
export const getWeekDays = (weekStart) => {
    return Array.from({ length: 7 }, (_, i) => ({
        date: format(addDays(weekStart, i), 'yyyy-MM-dd'),
        label: format(addDays(weekStart, i), 'EEE, MMM d'), // "Mon, Mar 9"
    }));
};