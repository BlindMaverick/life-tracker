import client from './client';

export const getDailySummary = (date) => client.get(`/summary/daily?date=${date}`);
export const getWeeklySummary = (week_start) => client.get(`/summary/weekly?week_start=${week_start}`);
export const getBiweeklyTrend = (start_date) => client.get(`/summary/biweekly?start_date=${start_date}`);