import client from './client';

export const getWeeklyEntries = (week_start) =>
    client.get(`/entries/weekly?week_start=${week_start}`);

export const getDayEntries = (date) =>
    client.get(`/entries/daily?date=${date}`);

export const upsertEntry = (data) =>
    client.post('/entries', data);