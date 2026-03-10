import client from './client';

export const getReflection = (date) => client.get(`/reflections?date=${date}`);
export const upsertReflection = (data) => client.post('/reflections', data);