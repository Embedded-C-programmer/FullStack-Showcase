// import React, { useState, useContext } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { MessageCircle, Mail, Lock, LogIn } from 'lucide-react';
// import axios from 'axios';
// import ChatContext from '../context/ChatContext';
// import '../styles/Auth.css';

// const Login = () => {
//     const { login } = useContext(ChatContext);
//     const navigate = useNavigate();

//     const [formData, setFormData] = useState({
//         email: '',
//         password: ''
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

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setError('');

//         try {
//             const response = await axios.post('http://localhost:5000/api/auth/login', formData);

//             if (response.data.token) {
//                 login(response.data);
//                 navigate('/');
//             }
//         } catch (err) {
//             setError(err.response?.data?.message || 'Login failed');
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
//                         <h2 className="auth-title">Welcome Back!</h2>
//                         <p className="auth-subtitle">Sign in to continue chatting</p>
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
//                                 required
//                             />
//                         </div>

//                         <button
//                             type="submit"
//                             className="auth-button"
//                             disabled={loading}
//                         >
//                             {loading ? (
//                                 <>
//                                     <div className="btn-spinner"></div>
//                                     Signing in...
//                                 </>
//                             ) : (
//                                 <>
//                                     <LogIn size={20} />
//                                     Sign In
//                                 </>
//                             )}
//                         </button>
//                     </form>

//                     <div className="auth-footer">
//                         <p>Don't have an account?</p>
//                         <button
//                             onClick={() => navigate('/register')}
//                             className="auth-link"
//                         >
//                             Create Account
//                         </button>
//                     </div>

//                     <div className="auth-demo">
//                         <p className="demo-title">Demo Accounts</p>
//                         <div className="demo-credentials">
//                             <div className="demo-item">
//                                 <span className="demo-label">User 1:</span>
//                                 <code>user1@chat.com / password123</code>
//                             </div>
//                             <div className="demo-item">
//                                 <span className="demo-label">User 2:</span>
//                                 <code>user2@chat.com / password123</code>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Login;



// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import '../styles/Auth.css';

// function Login() {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [error, setError] = useState('');
//     const [loading, setLoading] = useState(false);
//     const navigate = useNavigate();

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setError('');
//         setLoading(true);

//         // Validation
//         if (!email || !password) {
//             setError('Please fill in all fields');
//             setLoading(false);
//             return;
//         }

//         try {
//             console.log('🔐 Attempting login...');

//             const response = await fetch('http://localhost:5000/api/auth/login', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ email, password }),
//             });

//             const data = await response.json();
//             console.log('📡 Login response:', { status: response.status, ok: response.ok });

//             if (response.ok) {
//                 console.log('✅ Login successful!');
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
//                     setError('Failed to save login data. Please try again.');
//                     setLoading(false);
//                     return;
//                 }

//                 // Navigate to dashboard
//                 console.log('🚀 Navigating to dashboard...');
//                 navigate('/dashboard');
//             } else {
//                 console.error('❌ Login failed:', data.message);
//                 setError(data.message || 'Login failed');
//             }
//         } catch (error) {
//             console.error('❌ Login error:', error);
//             setError('Network error. Please check if the server is running.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="auth-container">
//             <div className="auth-card">
//                 <div className="auth-header">
//                     <h1>Welcome Back</h1>
//                     <p>Sign in to your account</p>
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
//                             placeholder="Enter your password"
//                             value={password}
//                             onChange={(e) => setPassword(e.target.value)}
//                             disabled={loading}
//                             required
//                         />
//                     </div>

//                     <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
//                         {loading ? (
//                             <>
//                                 <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
//                                 Signing in...
//                             </>
//                         ) : (
//                             'Sign In'
//                         )}
//                     </button>
//                 </form>

//                 <div className="auth-footer">
//                     <p>
//                         Don't have an account?{' '}
//                         <a href="/register" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>
//                             Sign up
//                         </a>
//                     </p>
//                 </div>

//                 {/* Debug info (remove in production) */}
//                 <div style={{
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
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default Login;

// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import '../styles/Auth.css';

// function Login() {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [error, setError] = useState('');
//     const [loading, setLoading] = useState(false);
//     const navigate = useNavigate();

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setError('');
//         setLoading(true);

//         // Validation
//         if (!email || !password) {
//             setError('Please fill in all fields');
//             setLoading(false);
//             return;
//         }

//         try {
//             console.log('🔐 Attempting login...');

//             const response = await fetch('http://localhost:5000/api/auth/login', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ email, password }),
//             });

//             const data = await response.json();
//             console.log('📡 Login response:', { status: response.status, ok: response.ok });

//             if (response.ok) {
//                 console.log('✅ Login successful!');
//                 console.log('📦 Received data:', {
//                     hasToken: !!data.token,
//                     hasUserId: !!data.userId,
//                     username: data.username
//                 });

//                 // CRITICAL: Clear any old data first
//                 localStorage.clear();
//                 console.log('🗑️ Cleared old localStorage');

//                 // Save to localStorage with verification
//                 try {
//                     localStorage.setItem('token', data.token);
//                     localStorage.setItem('userId', data.userId);
//                     localStorage.setItem('user', JSON.stringify({
//                         username: data.username,
//                         email: data.email
//                     }));

//                     console.log('💾 Attempted to save to localStorage');

//                     // IMMEDIATE verification
//                     const savedToken = localStorage.getItem('token');
//                     const savedUserId = localStorage.getItem('userId');
//                     const savedUser = localStorage.getItem('user');

//                     console.log('✅ Verification:', {
//                         token: savedToken ? savedToken.substring(0, 20) + '... (length: ' + savedToken.length + ')' : '❌ MISSING!',
//                         userId: savedUserId || '❌ MISSING!',
//                         user: savedUser ? '✅ Saved' : '❌ MISSING!'
//                     });

//                     if (!savedToken || !savedUserId) {
//                         throw new Error('Failed to save to localStorage - data not persisting');
//                     }

//                     // Wait a tiny bit to ensure storage is synced
//                     setTimeout(() => {
//                         console.log('🚀 Navigating to dashboard...');
//                         navigate('/dashboard');
//                     }, 100);

//                 } catch (storageError) {
//                     console.error('❌ localStorage error:', storageError);
//                     setError('Failed to save login data. Is localStorage enabled in your browser?');
//                     setLoading(false);
//                     return;
//                 }
//             } else {
//                 console.error('❌ Login failed:', data.message);
//                 setError(data.message || 'Login failed');
//             }
//         } catch (error) {
//             console.error('❌ Login error:', error);
//             setError('Network error. Please check if the server is running.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="auth-container">
//             <div className="auth-card">
//                 <div className="auth-header">
//                     <h1>Welcome Back</h1>
//                     <p>Sign in to your account</p>
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
//                             placeholder="Enter your password"
//                             value={password}
//                             onChange={(e) => setPassword(e.target.value)}
//                             disabled={loading}
//                             required
//                         />
//                     </div>

//                     <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
//                         {loading ? (
//                             <>
//                                 <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
//                                 Signing in...
//                             </>
//                         ) : (
//                             'Sign In'
//                         )}
//                     </button>
//                 </form>

//                 <div className="auth-footer">
//                     <p>
//                         Don't have an account?{' '}
//                         <a href="/register" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>
//                             Sign up
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

// export default Login;



// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import '../styles/Auth.css';

// function Login() {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [error, setError] = useState('');
//     const [loading, setLoading] = useState(false);
//     const navigate = useNavigate();

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setError('');
//         setLoading(true);

//         if (!email || !password) {
//             setError('Please fill in all fields');
//             setLoading(false);
//             return;
//         }
//     };

//     return (
//         <div className="auth-page">
//             <div className="auth-container">

//                 {/* LOGO */}
//                 <div className="auth-logo-section">
//                     <div className="auth-logo">💬</div>
//                     <h1 className="auth-brand">ChatApp</h1>
//                     <p className="auth-tagline">Connect with friends instantly</p>
//                 </div>

//                 <div className="auth-card">
//                     <div className="auth-card-header">
//                         <h2 className="auth-title">Welcome Back!</h2>
//                         <p className="auth-subtitle">Sign in to continue chatting</p>
//                     </div>

//                     {error && (
//                         <div className="auth-error">
//                             <span>⚠</span>
//                             {error}
//                         </div>
//                     )}

//                     <form className="auth-form" onSubmit={handleSubmit}>
//                         <input
//                             type="email"
//                             placeholder="Email"
//                             value={email}
//                             onChange={(e) => setEmail(e.target.value)}
//                         />

//                         <input
//                             type="password"
//                             placeholder="Password"
//                             value={password}
//                             onChange={(e) => setPassword(e.target.value)}
//                         />

//                         <button
//                             type="submit"
//                             className="auth-button"
//                             disabled={loading}
//                         >
//                             {loading ? 'Signing in...' : 'Sign In'}
//                         </button>
//                     </form>

//                     <div className="auth-footer">
//                         <p>Don't have an account?</p>
//                         <button
//                             className="auth-link"
//                             onClick={() => navigate('/register')}
//                         >
//                             Create Account
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default Login;



import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validation
        if (!email || !password) {
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }

        try {
            console.log('🔐 Attempting login...');

            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            console.log('📡 Login response:', { status: response.status, ok: response.ok });

            if (response.ok) {
                console.log('✅ Login successful!');
                console.log('📦 Received data:', {
                    hasToken: !!data.token,
                    hasUserId: !!data.userId,
                    username: data.username
                });

                // CRITICAL: Clear any old data first
                localStorage.clear();
                console.log('🗑️ Cleared old localStorage');

                // Save to localStorage with verification
                try {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userId', data.userId);
                    localStorage.setItem('user', JSON.stringify({
                        username: data.username,
                        email: data.email
                    }));

                    console.log('💾 Attempted to save to localStorage');

                    // IMMEDIATE verification
                    const savedToken = localStorage.getItem('token');
                    const savedUserId = localStorage.getItem('userId');
                    const savedUser = localStorage.getItem('user');

                    console.log('✅ Verification:', {
                        token: savedToken ? savedToken.substring(0, 20) + '... (length: ' + savedToken.length + ')' : '❌ MISSING!',
                        userId: savedUserId || '❌ MISSING!',
                        user: savedUser ? '✅ Saved' : '❌ MISSING!'
                    });

                    if (!savedToken || !savedUserId) {
                        throw new Error('Failed to save to localStorage - data not persisting');
                    }

                    // Wait a tiny bit to ensure storage is synced
                    setTimeout(() => {
                        console.log('🚀 Navigating to dashboard...');
                        navigate('/dashboard');
                    }, 100);

                } catch (storageError) {
                    console.error('❌ localStorage error:', storageError);
                    setError('Failed to save login data. Is localStorage enabled in your browser?');
                    setLoading(false);
                    return;
                }
            } else {
                console.error('❌ Login failed:', data.message);
                setError(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('❌ Login error:', error);
            setError('Network error. Please check if the server is running.');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="auth-page">
            <div className="auth-container">

                {/* Optional Logo Section */}
                <div className="auth-logo-section">
                    <div className="auth-logo">🔐</div>
                    <div className="auth-brand">Chat App</div>
                    <div className="auth-tagline">Secure login portal</div>
                </div>

                <div className="auth-card">

                    {/* Card Header */}
                    <div className="auth-card-header">
                        <h1 className="auth-title">Welcome Back</h1>
                        <p className="auth-subtitle">Sign in to your account</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="auth-error">
                            <span>⚠️</span>
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="auth-form">

                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            required
                        />

                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            required
                        />

                        <button
                            type="submit"
                            className="auth-button"
                            disabled={loading}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>

                    </form>

                    {/* Footer */}
                    <div className="auth-footer">
                        <p>Don’t have an account?</p>
                        <button
                            className="auth-link"
                            onClick={() => navigate('/register')}
                        >
                            Sign up
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );

}

export default Login;