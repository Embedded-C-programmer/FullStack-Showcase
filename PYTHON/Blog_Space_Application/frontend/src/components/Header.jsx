import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

const Header = ({ onNavigate, currentView }) => {
    const { user, logout } = useAuth();
    const [scrolled, setScrolled] = React.useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const getInitials = (name) => {
        return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
    };

    return (
        <header className={`header ${scrolled ? 'scrolled' : ''}`}>
            <a href="#main-content" className="skip-to-main">
                Skip to main content
            </a>

            <div className="header-content">
                <div className="logo" onClick={() => onNavigate('home')} role="button" tabIndex={0}>
                    <span className="logo-icon" aria-hidden="true">✍️</span>
                    <span className="logo-text">BlogSpace</span>
                </div>

                <nav className={`nav ${mobileMenuOpen ? '' : 'mobile-hidden'}`} role="navigation">
                    {user ? (
                        <>
                            <button
                                className={`nav-link ${currentView === 'home' ? 'active' : ''}`}
                                onClick={() => {
                                    onNavigate('home');
                                    setMobileMenuOpen(false);
                                }}
                                aria-label="Go to home page"
                            >
                                <span>🏠</span> <span>Home</span>
                            </button>
                            <button
                                className={`nav-link ${currentView === 'create' ? 'active' : ''}`}
                                onClick={() => {
                                    onNavigate('create');
                                    setMobileMenuOpen(false);
                                }}
                                aria-label="Create new post"
                            >
                                <span>✏️</span> <span>Write</span>
                            </button>
                            <div className="user-menu">
                                <div
                                    className="user-avatar"
                                    title={user.username}
                                    style={{
                                        background: `linear-gradient(135deg, ${getAvatarColor(user.username)} 0%, ${getAvatarColor(user.username, true)} 100%)`
                                    }}
                                >
                                    {getInitials(user.username)}
                                </div>
                                <div className="user-info">
                                    <span className="user-name">{user.username}</span>
                                    <span className="user-status">Online</span>
                                </div>
                                <button
                                    className="btn-logout"
                                    onClick={logout}
                                    aria-label="Logout"
                                >
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <button
                                className={`nav-link ${currentView === 'home' ? 'active' : ''}`}
                                onClick={() => {
                                    onNavigate('home');
                                    setMobileMenuOpen(false);
                                }}
                                aria-label="Go to home page"
                            >
                                <span>🏠</span> <span>Home</span>
                            </button>
                            <button
                                className="btn-primary"
                                onClick={() => {
                                    onNavigate('login');
                                    setMobileMenuOpen(false);
                                }}
                                aria-label="Sign in to your account"
                            >
                                Sign In
                            </button>
                        </>
                    )}
                </nav>

                <button
                    className="menu-toggle"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle mobile menu"
                    aria-expanded={mobileMenuOpen}
                >
                    {mobileMenuOpen ? '✕' : '☰'}
                </button>
            </div>
        </header>
    );
};

// Helper function for avatar colors
const getAvatarColor = (str, dark = false) => {
    if (!str) return dark ? '#764ba2' : '#667eea';

    const colors = [
        { light: '#667eea', dark: '#764ba2' },
        { light: '#f093fb', dark: '#f5576c' },
        { light: '#4facfe', dark: '#00f2fe' },
        { light: '#43e97b', dark: '#38f9d7' },
        { light: '#fa709a', dark: '#fee140' },
        { light: '#30cfd0', dark: '#330867' },
    ];

    const hash = str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colorPair = colors[hash % colors.length];
    return dark ? colorPair.dark : colorPair.light;
};

export default Header;