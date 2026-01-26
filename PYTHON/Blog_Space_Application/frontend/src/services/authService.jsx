import api from './api';

export const register = async (username, email, password) => {
    const response = await api.post('/auth/register/', {
        username,
        email,
        password,
        password2: password
    });

    // Store tokens
    if (response.access) {
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
    }

    return response;
};

export const login = async (email, password) => {
    const response = await api.post('/auth/login/', { email, password });

    // Store tokens
    if (response.access) {
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
    }

    return response;
};

export const getCurrentUser = async () => {
    return await api.get('/auth/me/');
};

export const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
};