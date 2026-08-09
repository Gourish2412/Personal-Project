import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('mentorToken');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getProfile: () => api.get('/auth/profile'),
    updateOnboarding: (data) => api.put('/auth/onboarding', data),
};

export const chatAPI = {
    getHistory: () => api.get('/chat/history'),
    sendMessage: (message) => api.post('/chat/message', { message }),
};

export const roadmapAPI = {
    getRoadmap: () => api.get('/roadmap'),
    generateRoadmap: () => api.post('/roadmap/generate'),
};

export const progressAPI = {
    getProgress: () => api.get('/progress'),
    updateProgress: (data) => api.post('/progress/update', data),
};

export default api;
