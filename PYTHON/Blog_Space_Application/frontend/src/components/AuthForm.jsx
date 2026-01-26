import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './AuthForm.css';

const AuthForm = ({ mode, onSuccess }) => {
    const { login, register, loading } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLogin, setIsLogin] = useState(mode === 'login');

    const handleSubmit = async () => {
        setError('');

        // Validation
        if (!formData.email || !formData.password) {
            setError('Please fill in all required fields');
            return;
        }

        if (!isLogin && !formData.username) {
            setError('Username is required for registration');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (!isValidEmail(formData.email)) {
            setError('Please enter a valid email address');
            return;
        }

        try {
            if (isLogin) {
                await login(formData.email, formData.password);
            } else {
                await register(formData.username, formData.email, formData.password);
            }
            onSuccess();
        } catch (err) {
            setError(err.message || 'An error occurred. Please try again.');
        }
    };

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-icon">
                        {isLogin ? '🔐' : '🚀'}
                    </div>
                    <h2 className="auth-title">
                        {isLogin ? 'Welcome Back!' : 'Join BlogSpace'}
                    </h2>
                    <p className="auth-subtitle">
                        {isLogin
                            ? 'Sign in to continue your writing journey'
                            : 'Create an account and start sharing your stories'}
                    </p>
                </div>

                {error && (
                    <div className="error-message">
                        <span className="error-icon">⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                <div className="auth-form">
                    {!isLogin && (
                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">👤</span>
                                <span>Username</span>
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                onKeyPress={handleKeyPress}
                                placeholder="Choose a unique username"
                                required
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">
                            <span className="label-icon">✉️</span>
                            <span>Email Address</span>
                        </label>
                        <input
                            type="email"
                            className="form-input"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            onKeyPress={handleKeyPress}
                            placeholder="your.email@example.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <span className="label-icon">🔒</span>
                            <span>Password</span>
                        </label>
                        <input
                            type="password"
                            className="form-input"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            onKeyPress={handleKeyPress}
                            placeholder="Enter a secure password"
                            required
                            minLength="6"
                        />
                        <p className="password-hint">
                            {formData.password.length > 0 && formData.password.length < 6
                                ? `${6 - formData.password.length} more characters needed`
                                : 'Must be at least 6 characters'}
                        </p>
                    </div>

                    <button
                        onClick={handleSubmit}
                        className="btn-submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                <span>Please wait...</span>
                            </>
                        ) : (
                            <>
                                <span className="btn-icon">{isLogin ? '🔓' : '✨'}</span>
                                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                            </>
                        )}
                    </button>
                </div>

                <div className="auth-footer">
                    <div className="divider">
                        <span>OR</span>
                    </div>
                    <button
                        className="btn-switch"
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                            setFormData({ username: '', email: '', password: '' });
                        }}
                    >
                        {isLogin
                            ? "Don't have an account? Sign up"
                            : 'Already have an account? Sign in'}
                    </button>
                </div>
            </div>

            <div className="auth-features">
                <div className="feature-item">
                    <span className="feature-icon">✍️</span>
                    <span>Write & Share Stories</span>
                </div>
                <div className="feature-item">
                    <span className="feature-icon">💬</span>
                    <span>Engage with Community</span>
                </div>
                <div className="feature-item">
                    <span className="feature-icon">🌟</span>
                    <span>Build Your Audience</span>
                </div>
            </div>
        </div>
    );
};

export default AuthForm;