import axios from 'axios';

//process.env.REACT_APP_API_URL || 

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
    getMe: () => api.get('/auth/me'),
    searchUsers: (query) => api.get(`/auth/users/search?query=${query}`),
    updateProfile: (data) => api.patch('/auth/profile', data)
};

// Conversation API
export const conversationAPI = {
    getAll: () => api.get('/conversations'),
    getById: (id) => api.get(`/conversations/${id}`),
    createPrivate: (userId) => api.post('/conversations/private', { userId }),
    createGroup: (data) => api.post('/conversations/group', data),
    updateGroup: (id, data) => api.patch(`/conversations/${id}`, data),
    addParticipants: (id, participantIds) =>
        api.post(`/conversations/${id}/participants`, { participantIds })
};

// Message API
export const messageAPI = {
    getMessages: (conversationId, params) =>
        api.get(`/messages/${conversationId}`, { params }),
    markAsRead: (conversationId) =>
        api.post(`/messages/${conversationId}/read`),
    editMessage: (messageId, content) =>
        api.patch(`/messages/${messageId}`, { content }),
    deleteMessage: (messageId) =>
        api.delete(`/messages/${messageId}`)
};

export default api;