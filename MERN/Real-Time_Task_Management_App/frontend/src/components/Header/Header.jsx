import React from 'react';
import { CheckSquare, Wifi, WifiOff, Users, LogOut } from 'lucide-react';
import { useSocketStatus } from '../../hooks/useSocket';
import { useAuth } from '../../context/AuthContext';
import UserAvatar from '../UserAvatar/UserAvatar';
import './Header.css';

const Header = () => {
    const { connected, activeUsers, reconnecting } = useSocketStatus();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        if (window.confirm('Are you sure you want to logout?')) {
            await logout();
        }
    };

    return (
        <header className="header">
            <div className="header-content">
                <div className="header-left">
                    <div className="logo-wrapper">
                        <CheckSquare className="header-icon" size={36} />
                        <div className="logo-text">
                            <h1 className="header-title">TaskFlow</h1>
                            <p className="header-subtitle">Collaborate in Real-Time</p>
                        </div>
                    </div>
                </div>

                <div className="header-right">
                    {user && (
                        <div className="user-profile">
                            <UserAvatar email={user.email} size="medium" showStatus={true} />
                            <div className="user-details">
                                <span className="user-name">{user.username}</span>
                                <span className="user-email-small">{user.email}</span>
                            </div>
                            <button className="logout-button" onClick={handleLogout} title="Logout">
                                <LogOut size={18} />
                            </button>
                        </div>
                    )}

                    <div className={`status-indicator ${connected ? 'connected' : 'disconnected'}`}>
                        {reconnecting ? (
                            <>
                                <div className="status-dot reconnecting" />
                                <span className="status-text">Reconnecting...</span>
                            </>
                        ) : (
                            <>
                                {connected ? <Wifi size={16} /> : <WifiOff size={16} />}
                                <span className="status-text">
                                    {connected ? 'Connected' : 'Disconnected'}
                                </span>
                            </>
                        )}
                    </div>

                    <div className="users-count" title={`${activeUsers} active user${activeUsers !== 1 ? 's' : ''} online`}>
                        <Users size={16} />
                        <span className="users-text">{activeUsers}</span>
                    </div>
                </div>
            </div>

            <div className="header-description">
                <p>📋 Manage your tasks efficiently with real-time collaboration</p>
            </div>
        </header>
    );
};

export default Header;
