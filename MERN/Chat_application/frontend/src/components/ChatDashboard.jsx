import React, { useState, useEffect } from 'react';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import NewChatModal from './NewChatModal';
import ProfileModal from './ProfileModal';
import DraggableThemeToggle from './DraggableThemeToggle';
import '../styles/ChatDashboard.css';

function ChatDashboard() {
    const [selectedChat, setSelectedChat] = useState(null);
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showNotificationsModal, setShowNotificationsModal] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [theme, setTheme] = useState('dark');
    const [user, setUser] = useState(null);

    // Close settings dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showSettings && !event.target.closest('.user-profile-actions')) {
                setShowSettings(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showSettings]);

    useEffect(() => {
        // Load user data
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }

        // Load theme preference
        const savedTheme = localStorage.getItem('theme') || 'dark';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);

        // Close sidebar on desktop
        const handleResize = () => {
            if (window.innerWidth > 768) {
                setSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleChatSelect = (chat) => {
        setSelectedChat(chat);
        // Close sidebar on mobile when chat is selected
        if (window.innerWidth <= 768) {
            setSidebarOpen(false);
        }
    };

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const handleLogout = () => {
        console.log('🚪 Logging out...');

        // Clear all localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('user');

        // Verify cleared
        console.log('🗑️ Cleared localStorage:', {
            token: localStorage.getItem('token'),
            userId: localStorage.getItem('userId'),
            user: localStorage.getItem('user')
        });

        // Close settings dropdown
        setShowSettings(false);

        // Redirect to login
        console.log('🔄 Redirecting to login...');
        window.location.href = '/login';
    };

    return (
        <div className="chat-dashboard">
            {/* Mobile Menu Toggle */}
            <button
                className="mobile-menu-toggle"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle menu"
            >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {sidebarOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                </svg>
            </button>

            {/* Mobile Overlay */}
            <div
                className={`mobile-overlay ${sidebarOpen ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar */}
            <div className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
                {/* User Profile Section */}
                <div className="user-profile-section">
                    <div className="user-profile-avatar status-indicator online">
                        <img
                            src={`https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=random`}
                            alt={user?.username}
                            className="avatar avatar-lg"
                        />
                    </div>
                    <div className="user-profile-info">
                        <div className="user-profile-name">{user?.username || 'User'}</div>
                        <div className="user-profile-status">Online</div>
                    </div>
                    <div className="user-profile-actions" style={{ position: 'relative' }}>
                        <button
                            className="profile-action-btn"
                            onClick={() => setShowSettings(!showSettings)}
                            title="Settings"
                        >
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>

                        {showSettings && (
                            <div className="settings-dropdown" style={{ position: 'absolute', top: '100%', right: '0', zIndex: 1000 }}>
                                <button className="dropdown-item" onClick={() => { setShowProfileModal(true); setShowSettings(false); }}>
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Profile
                                </button>
                                <button className="dropdown-item" onClick={toggleTheme}>
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        {theme === 'dark' ? (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                        ) : (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                        )}
                                    </svg>
                                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                                </button>
                                <button className="dropdown-item" onClick={() => { setShowNotificationsModal(true); setShowSettings(false); }}>
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                    Notifications
                                </button>
                                <button className="dropdown-item" onClick={() => { setShowPrivacyModal(true); setShowSettings(false); }}>
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    Privacy
                                </button>
                                <button className="dropdown-item danger" onClick={handleLogout}>
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat List */}
                <ChatList
                    onChatSelect={handleChatSelect}
                    selectedChat={selectedChat}
                    onNewChat={() => setShowNewChatModal(true)}
                />
            </div>

            {/* Main Content */}
            <div className="dashboard-main">
                {selectedChat ? (
                    <ChatWindow chat={selectedChat} />
                ) : (
                    <div className="welcome-screen">
                        <svg className="welcome-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <h2>Welcome to ChatApp</h2>
                        <p>Select a conversation from the sidebar or start a new chat to begin messaging</p>
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={() => setShowNewChatModal(true)}
                        >
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '20px', height: '20px' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Start New Chat
                        </button>

                        <div className="welcome-features">
                            <div className="feature-card">
                                <svg className="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <h3>Real-time Messaging</h3>
                                <p>Instant message delivery with typing indicators</p>
                            </div>
                            <div className="feature-card">
                                <svg className="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                                <h3>File Sharing</h3>
                                <p>Share documents, images, and files easily</p>
                            </div>
                            <div className="feature-card">
                                <svg className="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <h3>Group Chats</h3>
                                <p>Create groups and chat with multiple people</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Theme Toggle Button */}
            <DraggableThemeToggle theme={theme} onToggle={toggleTheme} />

            {/* New Chat Modal */}
            {showNewChatModal && (
                <NewChatModal
                    onClose={() => setShowNewChatModal(false)}
                    onChatCreated={(chat) => {
                        setSelectedChat(chat);
                        setShowNewChatModal(false);
                    }}
                />
            )}

            {/* Profile Modal */}
            {showProfileModal && (
                <ProfileModal onClose={() => setShowProfileModal(false)} />
            )}

            {/* Notifications Modal */}
            {showNotificationsModal && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowNotificationsModal(false)}>
                    <div className="modal-content" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '28px', height: '28px' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                Notifications
                            </h2>
                            <button className="modal-close" onClick={() => setShowNotificationsModal(false)}>
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="modal-body" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <p>No new notifications</p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowNotificationsModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Privacy Modal */}
            {showPrivacyModal && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowPrivacyModal(false)}>
                    <div className="modal-content" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '28px', height: '28px' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Privacy Settings
                            </h2>
                            <button className="modal-close" onClick={() => setShowPrivacyModal(false)}>
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="modal-body" style={{ padding: '2rem' }}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                    <input type="checkbox" defaultChecked />
                                    <span>Show online status</span>
                                </label>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                    <input type="checkbox" defaultChecked />
                                    <span>Read receipts</span>
                                </label>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                    <input type="checkbox" />
                                    <span>Block unknown contacts</span>
                                </label>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowPrivacyModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={() => { alert('Privacy settings saved!'); setShowPrivacyModal(false); }}>Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ChatDashboard;