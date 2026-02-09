import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEnvelope, FaKey, FaLock } from 'react-icons/fa';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        otp: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [resetToken, setResetToken] = useState('');

    const handleSubmitEmail = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await axios.post('/auth/forgot-password', { email: formData.email });
            toast.success(res.data.message);

            // Show OTP in development
            if (res.data.otp) {
                toast.info(`Your OTP: ${res.data.otp}`, { autoClose: 10000 });
            }

            setStep(2);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await axios.post('/auth/verify-otp', {
                email: formData.email,
                otp: formData.otp
            });

            toast.success(res.data.message);
            setResetToken(res.data.resetToken);
            setStep(3);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (formData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const res = await axios.post('/auth/reset-password', {
                email: formData.email,
                resetToken,
                newPassword: formData.newPassword
            });

            toast.success(res.data.message);
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setLoading(true);

        try {
            const res = await axios.post('/auth/resend-otp', { email: formData.email });
            toast.success(res.data.message);

            if (res.data.otp) {
                toast.info(`Your new OTP: ${res.data.otp}`, { autoClose: 10000 });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-900 dark:to-purple-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8">
                <div className="text-center mb-8">
                    <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
                        <FaKey className="text-white text-2xl" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Reset Password</h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        {step === 1 && "Enter your email to receive an OTP"}
                        {step === 2 && "Enter the 4-digit OTP sent to your email"}
                        {step === 3 && "Create a new password"}
                    </p>
                </div>

                {/* Step Indicator */}
                <div className="flex justify-center mb-8">
                    <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                            1
                        </div>
                        <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                            2
                        </div>
                        <div className={`w-16 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                            3
                        </div>
                    </div>
                </div>

                {/* Step 1: Email */}
                {step === 1 && (
                    <form onSubmit={handleSubmitEmail} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="pl-10 w-full px-4 py-3 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
                        >
                            {loading ? 'Sending OTP...' : 'Send OTP'}
                        </button>
                    </form>
                )}

                {/* Step 2: OTP */}
                {step === 2 && (
                    <form onSubmit={handleVerifyOTP} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Enter 4-Digit OTP
                            </label>
                            <input
                                type="text"
                                required
                                maxLength="4"
                                value={formData.otp}
                                onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
                                className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg text-center text-2xl font-bold tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                placeholder="0000"
                            />
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                OTP is valid for 5 minutes
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
                        >
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>

                        <button
                            type="button"
                            onClick={handleResendOTP}
                            disabled={loading}
                            className="w-full text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            Resend OTP
                        </button>
                    </form>
                )}

                {/* Step 3: New Password */}
                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <FaLock className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="password"
                                    required
                                    minLength="6"
                                    value={formData.newPassword}
                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                    className="pl-10 w-full px-4 py-3 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    placeholder="Enter new password"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <FaLock className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="pl-10 w-full px-4 py-3 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    placeholder="Confirm new password"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}

                <div className="mt-6 text-center">
                    <Link to="/login" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;