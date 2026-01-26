// import React, { useState, useEffect } from 'react';
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import io from 'socket.io-client';
// import axios from 'axios';

// // Components
// import Login from './components/Login';
// import Register from './components/Register';
// import ChatDashboard from './components/ChatDashboard';
// import ChatContext from './context/ChatContext';

// import './styles/App.css';
// import './styles/Auth.css';
// import './styles/ChatDashboard.css';
// import './styles/ChatList.css';
// import './styles/ChatWindow.css';
// import './styles/NewChatModal.css';
// // Add this new import:
// import './styles/Animations.css';
// import DebugAuth from './components/DebugAuth';
// // Styles
// import './App.css';

// const SOCKET_URL = 'http://localhost:5000';

// function App() {
//   const [user, setUser] = useState(null);
//   const [socket, setSocket] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Check for stored user on mount
//   useEffect(() => {
//     const storedUser = localStorage.getItem('chatUser');
//     if (storedUser) {
//       try {
//         const userData = JSON.parse(storedUser);
//         setUser(userData);
//         axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
//       } catch (error) {
//         console.error('Error parsing stored user:', error);
//         localStorage.removeItem('chatUser');
//       }
//     }
//     setLoading(false);
//   }, []);

//   // Initialize socket when user logs in
//   useEffect(() => {
//     if (user) {
//       const newSocket = io(SOCKET_URL, {
//         auth: {
//           token: user.token
//         }
//       });

//       newSocket.on('connect', () => {
//         console.log('Socket connected:', newSocket.id);
//       });

//       newSocket.on('disconnect', () => {
//         console.log('Socket disconnected');
//       });

//       newSocket.on('error', (error) => {
//         console.error('Socket error:', error);
//       });

//       setSocket(newSocket);

//       return () => {
//         newSocket.close();
//       };
//     }
//   }, [user]);

//   const login = (userData) => {
//     setUser(userData);
//     localStorage.setItem('chatUser', JSON.stringify(userData));
//     axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
//   };

//   const logout = () => {
//     if (socket) {
//       socket.close();
//     }
//     setUser(null);
//     localStorage.removeItem('chatUser');
//     delete axios.defaults.headers.common['Authorization'];
//   };

//   if (loading) {
//     return (
//       <div className="app-loading">
//         <div className="spinner"></div>
//         <p>Loading...</p>
//       </div>
//     );
//   }

//   return (
//     <ChatContext.Provider value={{ user, socket, login, logout }}>
//       <BrowserRouter>
//         <div className="chat-app">
//           <Routes>
//             <Route
//               path="/login"
//               element={user ? <Navigate to="/" /> : <Login />}
//             />
//             <Route
//               path="/register"
//               element={user ? <Navigate to="/" /> : <Register />}
//             />
//             <Route
//               path="/"
//               element={user ? <ChatDashboard /> : <Navigate to="/login" />}
//             />
//           </Routes>
//         </div>
//       </BrowserRouter>
//     </ChatContext.Provider>
//   );
// }

// export default App;


import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ChatDashboard from './components/ChatDashboard';
// import DebugAuth from './components/DebugAuth';
import './App.css';
// Protected Route Component
function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      console.log('🔍 Checking authentication...');
      console.log('Token exists:', !!token);
      console.log('UserId exists:', !!userId);

      if (!token || !userId) {
        console.log('❌ Not authenticated - redirecting to login');
        setIsAuthenticated(false);
        navigate('/login');
      } else {
        console.log('✅ Authenticated - allowing access');
        setIsAuthenticated(true);
      }
    };

    checkAuth();
  }, [navigate]);

  // Show loading while checking
  if (isAuthenticated === null) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#1e1e2e',
        color: 'white'
      }}>
        <div className="spinner"></div>
        <span style={{ marginLeft: '1rem' }}>Checking authentication...</span>
      </div>
    );
  }

  return isAuthenticated ? children : null;
}

// Public Route Component (redirects to dashboard if already logged in)
function PublicRoute({ children }) {
  const token = localStorage.getItem('token');

  if (token) {
    console.log('✅ Already logged in - redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  const [showDebug, setShowDebug] = useState(true);

  // Listen for storage changes (for multi-tab logout)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' && !e.newValue) {
        console.log('🔓 Token removed - user logged out');
        window.location.href = '/login';
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Press Ctrl+D to toggle debug panel
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        setShowDebug(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Router>
      {/* Debug Panel - Press Ctrl+D to toggle */}
      {/* {showDebug && <DebugAuth />} */}

      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <ChatDashboard />
            </ProtectedRoute>
          }
        />

        {/* Default Route */}
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        {/* 404 Route */}
        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;