import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import  jwtDecode  from 'jwt-decode';

// Configure axios defaults
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
axios.defaults.headers.common['Content-Type'] = 'application/json';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Set axios interceptor to always include token
    useEffect(() => {
        const interceptor = axios.interceptors.request.use(
            (config) => {
                const storedToken = localStorage.getItem('token');
                if (storedToken) {
                    config.headers.Authorization = `Bearer ${storedToken}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.request.eject(interceptor);
        };
    }, []);

    // Set axios default headers
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            loadUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    // Load user data
    const loadUser = async () => {
        try {
            const res = await axios.get('/auth/me');
            setUser(res.data.data);
        } catch (error) {
            console.error('Failed to load user:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    // Register user
    const register = async (userData) => {
        try {
            const res = await axios.post('/auth/register', userData);
            const { token, user } = res.data;

            localStorage.setItem('token', token);
            setToken(token);
            setUser(user);

            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    };

    // Login user
    const login = async (email, password) => {
        try {
            const res = await axios.post('/auth/login', { email, password });
            const { token, user } = res.data;

            localStorage.setItem('token', token);
            setToken(token);
            setUser(user);

            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    // Logout user
    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setToken(null);
        setUser(null);
    };

    // Update user profile
    const updateProfile = async (userData) => {
        try {
            const res = await axios.put('/auth/updatedetails', userData);
            setUser(res.data.data);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Update failed'
            };
        }
    };

    // Check if token is expired
    const isTokenExpired = () => {
        if (!token) return true;
        try {
            const decoded = jwtDecode(token);
            return decoded.exp < Date.now() / 1000;
        } catch {
            return true;
        }
    };

    const value = {
        user,
        token,
        loading,
        register,
        login,
        logout,
        updateProfile,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isVendor: user?.role === 'vendor',
        isTokenExpired
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};