// ==================== frontend/src/services/api.js (ENHANCED) ====================
import axios from 'axios';
// process.env.REACT_APP_API_URL || 
const API_URL ='http://localhost:5000';

const api = axios.create({
    baseURL: `${API_URL}/api`,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor with better error handling
api.interceptors.response.use(
    (response) => {
        // Return the data directly for consistency
        return response.data;
    },
    (error) => {
        if (error.response) {
            // Server responded with error
            const message = error.response.data?.message || error.response.data?.error || 'Server error occurred';

            if (error.response.status === 401) {
                localStorage.removeItem('token');
                // window.location.href = '/login'; // Uncomment if you have auth
            }

            console.error('API Error:', message);
            return Promise.reject(new Error(message));
        } else if (error.request) {
            // Request made but no response
            console.error('Network Error:', error.message);
            return Promise.reject(new Error('Network error. Please check your connection.'));
        } else {
            // Something else happened
            console.error('Error:', error.message);
            return Promise.reject(error);
        }
    }
);

// Task API endpoints with error handling
export const getTasks = async (params = {}) => {
    try {
        const response = await api.get('/tasks', { params });
        // Handle different response structures
        if (Array.isArray(response)) return response;
        if (response.data && Array.isArray(response.data)) return response.data;
        if (response.tasks && Array.isArray(response.tasks)) return response.tasks;
        return [];
    } catch (error) {
        console.error('getTasks error:', error);
        throw error;
    }
};

export const getTask = async (id) => {
    try {
        const response = await api.get(`/tasks/${id}`);
        return response.data || response;
    } catch (error) {
        console.error('getTask error:', error);
        throw error;
    }
};

export const createTask = async (taskData) => {
    try {
        if (!taskData || !taskData.title) {
            throw new Error('Task title is required');
        }
        const response = await api.post('/tasks', taskData);
        return response.data || response;
    } catch (error) {
        console.error('createTask error:', error);
        throw error;
    }
};

export const updateTask = async (id, updates) => {
    try {
        if (!id) throw new Error('Task ID is required');
        const response = await api.patch(`/tasks/${id}`, updates);
        return response.data || response;
    } catch (error) {
        console.error('updateTask error:', error);
        throw error;
    }
};

export const deleteTask = async (id) => {
    try {
        if (!id) throw new Error('Task ID is required');
        const response = await api.delete(`/tasks/${id}`);
        return response.data || response;
    } catch (error) {
        console.error('deleteTask error:', error);
        throw error;
    }
};

// Auth API endpoints
export const login = async (credentials) => {
    try {
        const response = await api.post('/auth/login', credentials);
        return response.data || response;
    } catch (error) {
        console.error('login error:', error);
        throw error;
    }
};

export const register = async (userData) => {
    try {
        const response = await api.post('/auth/register', userData);
        return response.data || response;
    } catch (error) {
        console.error('register error:', error);
        throw error;
    }
};

export const logout = async () => {
    try {
        const response = await api.post('/auth/logout');
        localStorage.removeItem('token');
        return response.data || response;
    } catch (error) {
        console.error('logout error:', error);
        localStorage.removeItem('token');
        throw error;
    }
};

export default api;
