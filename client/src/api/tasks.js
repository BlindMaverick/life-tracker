import client from './client';

export const getTasks = () => client.get('/tasks');
export const createTask = (data) => client.post('/tasks', data);
export const updateTask = (id, data) => client.put(`/tasks/${id}`, data);
export const deleteTask = (id) => client.delete(`/tasks/${id}`);