import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('mentorToken');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response interceptor to handle 401 Unauthorized token expiration
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            const currentToken = localStorage.getItem('mentorToken');
            if (currentToken) {
                localStorage.removeItem('mentorToken');
            }
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
    getProfile: () => api.get('/auth/profile'),
    logout: () => api.post('/auth/logout'),
    updateOnboarding: (data) => api.put('/auth/onboarding', data),
};

export const chatAPI = {
    getHistory: () => api.get('/chat/history'),
    sendMessage: (message) => api.post('/chat/message', { message }),
};

export const roadmapAPI = {
    getRoadmap: () => api.get('/roadmap'),
    generateRoadmap: () => api.post('/roadmap/generate'),
    reviewCode: (data) => api.post('/roadmap/review-code', data),
};

export const progressAPI = {
    getProgress: () => api.get('/progress'),
    updateProgress: (data) => api.post('/progress/update', data),
};

export default api;
