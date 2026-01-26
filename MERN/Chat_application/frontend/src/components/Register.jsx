// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { MessageCircle, User, Mail, Lock, UserPlus } from 'lucide-react';
// import axios from 'axios';
// import '../styles/Auth.css';

// const Register = () => {
//     const navigate = useNavigate();

//     const [formData, setFormData] = useState({
//         name: '',
//         email: '',
//         password: '',
//         confirmPassword: ''
//     });

//     const [error, setError] = useState('');
//     const [loading, setLoading] = useState(false);

//     const handleChange = (e) => {
//         setFormData({
//             ...formData,
//             [e.target.name]: e.target.value
//         });
//         setError('');
//     };

//     const validateForm = () => {
//         if (formData.password !== formData.confirmPassword) {
//             setError('Passwords do not match');
//             return false;
//         }
//         if (formData.password.length < 6) {
//             setError('Password must be at least 6 characters');
//             return false;
//         }
//         return true;
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         if (!validateForm()) {
//             return;
//         }

//         setLoading(true);
//         setError('');

//         try {
//             await axios.post('http://localhost:5000/api/auth/register', {
//                 name: formData.name,
//                 email: formData.email,
//                 password: formData.password
//             });

//             alert('Registration successful! Please login.');
//             navigate('/login');
//         } catch (err) {
//             setError(err.response?.data?.message || 'Registration failed');
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="auth-page">
//             <div className="auth-container">
//                 <div className="auth-logo-section">
//                     <div className="auth-logo">
//                         <MessageCircle size={48} />
//                     </div>
//                     <h1 className="auth-brand">ChatApp</h1>
//                     <p className="auth-tagline">Connect with friends instantly</p>
//                 </div>

//                 <div className="auth-card">
//                     <div className="auth-card-header">
//                         <h2 className="auth-title">Create Account</h2>
//                         <p className="auth-subtitle">Join our chat community</p>
//                     </div>

//                     {error && (
//                         <div className="auth-error">
//                             <span>⚠</span>
//                             {error}
//                         </div>
//                     )}

//                     <form onSubmit={handleSubmit} className="auth-form">
//                         <div className="form-group">
//                             <label className="form-label">
//                                 <User size={18} />
//                                 Full Name
//                             </label>
//                             <input
//                                 type="text"
//                                 name="name"
//                                 value={formData.name}
//                                 onChange={handleChange}
//                                 placeholder="John Doe"
//                                 className="form-input"
//                                 required
//                             />
//                         </div>

//                         <div className="form-group">
//                             <label className="form-label">
//                                 <Mail size={18} />
//                                 Email Address
//                             </label>
//                             <input
//                                 type="email"
//                                 name="email"
//                                 value={formData.email}
//                                 onChange={handleChange}
//                                 placeholder="your@email.com"
//                                 className="form-input"
//                                 required
//                             />
//                         </div>

//                         <div className="form-group">
//                             <label className="form-label">
//                                 <Lock size={18} />
//                                 Password
//                             </label>
//                             <input
//                                 type="password"
//                                 name="password"
//                                 value={formData.password}
//                                 onChange={handleChange}
//                                 placeholder="••••••••"
//                                 className="form-input"
//                                 minLength="6"
//                                 required
//                             />
//                         </div>

//                         <div className="form-group">
//                             <label className="form-label">
//                                 <Lock size={18} />
//                                 Confirm Password
//                             </label>
//                             <input
//                                 type="password"
//                                 name="confirmPassword"
//                                 value={formData.confirmPassword}
//                                 onChange={handleChange}
//                                 placeholder="••••••••"
//                                 className="form-input"
//                                 minLength="6"
//                                 required
//                             />
//                         </div>

//                         <button
//                             type="submit"
//                             className="auth-button register"
//                             disabled={loading}
//                         >
//                             {loading ? (
//                                 <>
//                                     <div className="btn-spinner"></div>
//                                     Creating Account...
//                                 </>
//                             ) : (
//                                 <>
//                                     <UserPlus size={20} />
//                                     Create Account
//                                 </>
//                             )}
//                         </button>
//                     </form>

//                     <div className="auth-footer">
//                         <p>Already have an account?</p>
//                         <button
//                             onClick={() => navigate('/login')}
//                             className="auth-link"
//                         >
//                             Sign In
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Register;


// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import '../styles/Auth.css';

// function Register() {
//     const [username, setUsername] = useState('');
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [confirmPassword, setConfirmPassword] = useState('');
//     const [error, setError] = useState('');
//     const [loading, setLoading] = useState(false);
//     const navigate = useNavigate();

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setError('');
//         setLoading(true);

//         // Validation
//         if (!username || !email || !password || !confirmPassword) {
//             setError('Please fill in all fields');
//             setLoading(false);
//             return;
//         }

//         if (password.length < 6) {
//             setError('Password must be at least 6 characters');
//             setLoading(false);
//             return;
//         }

//         if (password !== confirmPassword) {
//             setError('Passwords do not match');
//             setLoading(false);
//             return;
//         }

//         try {
//             console.log('📝 Attempting registration...');

//             const response = await fetch('http://localhost:5000/api/auth/register', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ username, email, password }),
//             });

//             const data = await response.json();
//             console.log('📡 Register response:', { status: response.status, ok: response.ok });

//             if (response.ok) {
//                 console.log('✅ Registration successful!');
//                 console.log('📦 Received data:', {
//                     hasToken: !!data.token,
//                     hasUserId: !!data.userId,
//                     username: data.username
//                 });

//                 // CRITICAL: Save to localStorage
//                 localStorage.setItem('token', data.token);
//                 localStorage.setItem('userId', data.userId);
//                 localStorage.setItem('user', JSON.stringify({
//                     username: data.username,
//                     email: data.email
//                 }));

//                 // Verify it was saved
//                 const savedToken = localStorage.getItem('token');
//                 const savedUserId = localStorage.getItem('userId');

//                 console.log('✅ Saved to localStorage:', {
//                     token: savedToken ? savedToken.substring(0, 20) + '...' : 'MISSING!',
//                     userId: savedUserId || 'MISSING!',
//                     user: localStorage.getItem('user') ? 'Saved' : 'MISSING!'
//                 });

//                 if (!savedToken || !savedUserId) {
//                     console.error('❌ Failed to save to localStorage!');
//                     setError('Failed to save registration data. Please try again.');
//                     setLoading(false);
//                     return;
//                 }

//                 // Navigate to dashboard
//                 console.log('🚀 Navigating to dashboard...');
//                 navigate('/dashboard');
//             } else {
//                 console.error('❌ Registration failed:', data.message);
//                 setError(data.message || 'Registration failed');
//             }
//         } catch (error) {
//             console.error('❌ Registration error:', error);
//             setError('Network error. Please check if the server is running.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="auth-container">
//             <div className="auth-card">
//                 <div className="auth-header">
//                     <h1>Create Account</h1>
//                     <p>Sign up to get started</p>
//                 </div>

//                 {error && (
//                     <div className="error-message">
//                         <svg fill="currentColor" viewBox="0 0 20 20" style={{ width: '20px', height: '20px' }}>
//                             <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//                         </svg>
//                         {error}
//                     </div>
//                 )}

//                 <form onSubmit={handleSubmit} className="auth-form">
//                     <div className="input-group">
//                         <label htmlFor="username">Username</label>
//                         <input
//                             id="username"
//                             type="text"
//                             placeholder="Choose a username"
//                             value={username}
//                             onChange={(e) => setUsername(e.target.value)}
//                             disabled={loading}
//                             required
//                         />
//                     </div>

//                     <div className="input-group">
//                         <label htmlFor="email">Email</label>
//                         <input
//                             id="email"
//                             type="email"
//                             placeholder="Enter your email"
//                             value={email}
//                             onChange={(e) => setEmail(e.target.value)}
//                             disabled={loading}
//                             required
//                         />
//                     </div>

//                     <div className="input-group">
//                         <label htmlFor="password">Password</label>
//                         <input
//                             id="password"
//                             type="password"
//                             placeholder="Create a password (min 6 characters)"
//                             value={password}
//                             onChange={(e) => setPassword(e.target.value)}
//                             disabled={loading}
//                             required
//                             minLength={6}
//                         />
//                     </div>

//                     <div className="input-group">
//                         <label htmlFor="confirmPassword">Confirm Password</label>
//                         <input
//                             id="confirmPassword"
//                             type="password"
//                             placeholder="Confirm your password"
//                             value={confirmPassword}
//                             onChange={(e) => setConfirmPassword(e.target.value)}
//                             disabled={loading}
//                             required
//                         />
//                     </div>

//                     <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
//                         {loading ? (
//                             <>
//                                 <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
//                                 Creating account...
//                             </>
//                         ) : (
//                             'Sign Up'
//                         )}
//                     </button>
//                 </form>

//                 <div className="auth-footer">
//                     <p>
//                         Already have an account?{' '}
//                         <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
//                             Sign in
//                         </a>
//                     </p>
//                 </div>

//                 {/* Debug info (remove in production) */}
//                 {/* <div style={{
//                     marginTop: '20px',
//                     padding: '10px',
//                     background: '#2a2a3e',
//                     borderRadius: '8px',
//                     fontSize: '12px',
//                     fontFamily: 'monospace'
//                 }}>
//                     <div style={{ marginBottom: '5px', color: '#a29bfe' }}>
//                         🔍 Debug Info (check console for logs):
//                     </div>
//                     <div style={{ color: '#b4b4c8' }}>
//                         Token: {localStorage.getItem('token') ? '✅ Saved' : '❌ Missing'}
//                     </div>
//                     <div style={{ color: '#b4b4c8' }}>
//                         UserId: {localStorage.getItem('userId') ? '✅ Saved' : '❌ Missing'}
//                     </div>
//                     <div style={{ color: '#b4b4c8' }}>
//                         User: {localStorage.getItem('user') ? '✅ Saved' : '❌ Missing'}
//                     </div>
//                 </div> */}
//             </div>
//         </div>
//     );
// }

// export default Register;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validation
        if (!username || !email || !password || !confirmPassword) {
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            console.log('📝 Attempting registration...');

            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();
            console.log('📡 Register response:', { status: response.status, ok: response.ok });

            if (response.ok) {
                console.log('✅ Registration successful!');
                console.log('📦 Received data:', {
                    hasToken: !!data.token,
                    hasUserId: !!data.userId,
                    username: data.username
                });

                // Clear old data first
                localStorage.clear();
                console.log('🗑️ Cleared old localStorage');

                // Save to localStorage
                try {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userId', data.userId);
                    localStorage.setItem('user', JSON.stringify({
                        username: data.username,
                        email: data.email
                    }));

                    console.log('💾 Attempted to save to localStorage');

                    // Verify
                    const savedToken = localStorage.getItem('token');
                    const savedUserId = localStorage.getItem('userId');

                    console.log('✅ Verification:', {
                        token: savedToken ? savedToken.substring(0, 20) + '...' : '❌ MISSING!',
                        userId: savedUserId || '❌ MISSING!'
                    });

                    if (!savedToken || !savedUserId) {
                        throw new Error('Failed to save to localStorage');
                    }

                    // Navigate to dashboard
                    setTimeout(() => {
                        console.log('🚀 Navigating to dashboard...');
                        navigate('/dashboard');
                    }, 100);

                } catch (storageError) {
                    console.error('❌ localStorage error:', storageError);
                    setError('Failed to save registration data. Please try again.');
                    setLoading(false);
                    return;
                }
            } else {
                console.error('❌ Registration failed:', data.message);
                setError(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('❌ Registration error:', error);
            setError('Network error. Please check if the server is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                {/* LOGO SECTION */}
                <div className="auth-logo-section">
                    <div className="auth-logo">💬</div>
                    <h1 className="auth-brand">ChatApp</h1>
                    <p className="auth-tagline">Create your account</p>
                </div>

                <div className="auth-card">
                    <div className="auth-card-header">
                        <h2 className="auth-title">Create Account</h2>
                        <p className="auth-subtitle">Sign up to get started</p>
                    </div>

                    {error && (
                        <div className="auth-error">
                            <span>⚠️</span>
                            {error}
                        </div>
                    )}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="auth-input-group">
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>

                        <div className="auth-input-group">
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>

                        <div className="auth-input-group">
                            <input
                                type="password"
                                placeholder="Password (min 6 characters)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                required
                                minLength={6}
                            />
                        </div>

                        <div className="auth-input-group">
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="auth-button register"
                            disabled={loading}
                        >
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                                    Creating account...
                                </span>
                            ) : (
                                'Sign Up'
                            )}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>Already have an account?</p>
                        <button
                            className="auth-link"
                            onClick={() => navigate('/login')}
                        >
                            Sign in
                        </button>
                    </div>

                    {/* Debug info */}
                    <div style={{
                        marginTop: '20px',
                        padding: '10px',
                        background: 'rgba(108, 92, 231, 0.1)',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontFamily: 'monospace'
                    }}>
                        <div style={{ marginBottom: '5px', color: '#a29bfe' }}>
                            🔍 Debug Info:
                        </div>
                        <div style={{ color: '#6c5ce7' }}>
                            Token: {localStorage.getItem('token') ? '✅ Saved' : '❌ Missing'}
                        </div>
                        <div style={{ color: '#6c5ce7' }}>
                            UserId: {localStorage.getItem('userId') ? '✅ Saved' : '❌ Missing'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
