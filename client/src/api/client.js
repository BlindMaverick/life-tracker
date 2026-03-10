import axios from 'axios';

const client = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request automatically
client.interceptors.request.use(config => {
    const token = localStorage.getItem('lt_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default client;