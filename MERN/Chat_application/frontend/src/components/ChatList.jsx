import React, { useState, useEffect } from 'react';
import '../styles/ChatList.css';

function ChatList({ onChatSelect, selectedChat, onNewChat }) {
    const [chats, setChats] = useState([]);
    const [filteredChats, setFilteredChats] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([
        { id: 1, type: 'message', user: 'John Doe', message: 'Hey there!', time: '2 min ago' },
        { id: 2, type: 'mention', user: 'Jane Smith', message: 'mentioned you in a group', time: '5 min ago' }
    ]);

    useEffect(() => {
        fetchChats();
    }, []);

    useEffect(() => {
        filterChats();
    }, [chats, searchQuery, activeFilter]);

    const fetchChats = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/api/chats', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Ensure data is always an array
            if (Array.isArray(data)) {
                setChats(data);
            } else {
                console.error('Expected array but got:', data);
                setChats([]);
            }
        } catch (error) {
            console.error('Error fetching chats:', error);
            setChats([]);
        } finally {
            setLoading(false);
        }
    };

    const filterChats = () => {
        // Safety check - ensure chats is an array
        if (!Array.isArray(chats)) {
            console.warn('chats is not an array:', chats);
            setFilteredChats([]);
            return;
        }

        if (chats.length === 0) {
            setFilteredChats([]);
            return;
        }

        let filtered = [...chats];

        // Apply search filter
        if (searchQuery) {
            filtered = filtered.filter(chat => {
                const chatName = chat.isGroupChat
                    ? chat.name
                    : chat.participants?.[0]?.username || '';
                return chatName.toLowerCase().includes(searchQuery.toLowerCase());
            });
        }

        // Apply category filter
        if (activeFilter === 'groups') {
            filtered = filtered.filter(chat => chat.isGroupChat);
        } else if (activeFilter === 'personal') {
            filtered = filtered.filter(chat => !chat.isGroupChat);
        } else if (activeFilter === 'unread') {
            filtered = filtered.filter(chat => chat.unreadCount > 0);
        }

        setFilteredChats(filtered);
    };

    const formatTime = (date) => {
        if (!date) return '';
        const messageDate = new Date(date);
        const now = new Date();
        const diff = now - messageDate;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) {
            const hours = messageDate.getHours().toString().padStart(2, '0');
            const minutes = messageDate.getMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
        }
        if (diff < 604800000) {
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            return days[messageDate.getDay()];
        }
        return messageDate.toLocaleDateString();
    };

    const getChatName = (chat) => {
        if (chat.isGroupChat) {
            return chat.name || 'Group Chat';
        }
        return chat.participants?.[0]?.username || 'Unknown User';
    };

    const getLastMessage = (chat) => {
        if (!chat.lastMessage) return 'No messages yet';
        return chat.lastMessage.content || 'Sent an attachment';
    };

    return (
        <div className="chat-list">
            {/* Header */}
            <div className="chat-list-header">
                <div className="chat-list-title-row">
                    <h2 className="chat-list-title">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Chats
                    </h2>
                    <div className="chat-list-actions">
                        <button className="header-action-btn" title="Notifications" onClick={() => setShowNotifications(!showNotifications)}>
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            {notifications.length > 0 && (
                                <span className="notification-badge">{notifications.length}</span>
                            )}
                        </button>
                        <button className="header-action-btn" title="New Chat" onClick={onNewChat}>
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="chat-search-container">
                    <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        className="chat-search"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Filters */}
            <div className="chat-filters">
                <button
                    className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('all')}
                >
                    All
                    <span className="badge badge-primary">{chats.length}</span>
                </button>
                <button
                    className={`filter-tab ${activeFilter === 'personal' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('personal')}
                >
                    Personal
                </button>
                <button
                    className={`filter-tab ${activeFilter === 'groups' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('groups')}
                >
                    Groups
                </button>
                <button
                    className={`filter-tab ${activeFilter === 'unread' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('unread')}
                >
                    Unread
                    {chats.filter(c => c.unreadCount > 0).length > 0 && (
                        <span className="badge badge-danger">
                            {chats.filter(c => c.unreadCount > 0).length}
                        </span>
                    )}
                </button>
            </div>

            {/* Chat Items */}
            <div className="chat-items">
                {loading ? (
                    // Loading skeleton
                    <div className="chat-list-loading">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="chat-item">
                                <div className="skeleton skeleton-circle"></div>
                                <div style={{ flex: 1 }}>
                                    <div className="skeleton skeleton-text" style={{ width: '60%' }}></div>
                                    <div className="skeleton skeleton-text small" style={{ width: '80%' }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredChats.length === 0 ? (
                    // Empty state
                    <div className="chat-list-empty">
                        <svg className="chat-list-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <h3>No chats found</h3>
                        <p>{searchQuery ? 'Try a different search term' : 'Start a new conversation'}</p>
                        <button className="btn btn-primary" onClick={onNewChat}>
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '20px', height: '20px' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            New Chat
                        </button>
                    </div>
                ) : (
                    // Chat list
                    filteredChats.map(chat => (
                        <div
                            key={chat._id}
                            className={`chat-item ${selectedChat?._id === chat._id ? 'active' : ''} ${chat.unreadCount > 0 ? 'unread' : ''}`}
                            onClick={() => onChatSelect(chat)}
                        >
                            <div className="chat-avatar-container">
                                {chat.isGroupChat ? (
                                    <div className="group-avatar">
                                        {chat.name ? chat.name.charAt(0).toUpperCase() : 'G'}
                                    </div>
                                ) : (
                                    <div className="status-indicator online">
                                        <img
                                            src={`https://ui-avatars.com/api/?name=${getChatName(chat)}&background=random`}
                                            alt={getChatName(chat)}
                                            className="avatar"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="chat-info">
                                <div className="chat-info-top">
                                    <span className="chat-name">{getChatName(chat)}</span>
                                    <span className="chat-time">
                                        {formatTime(chat.lastMessage?.createdAt)}
                                    </span>
                                </div>
                                <div className="chat-info-bottom">
                                    <span className="chat-last-message">
                                        {getLastMessage(chat)}
                                    </span>
                                    {chat.unreadCount > 0 && (
                                        <span className="unread-count">{chat.unreadCount}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default ChatList;