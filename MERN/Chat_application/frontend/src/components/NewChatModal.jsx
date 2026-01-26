import React, { useState, useEffect } from 'react';
import '../styles/NewChatModal.css';

function NewChatModal({ onClose, onChatCreated }) {
    const [chatType, setChatType] = useState('personal'); // 'personal' or 'group'
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [groupName, setGroupName] = useState('');
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await fetch('http://localhost:5000/api/users', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            const currentUserId = localStorage.getItem('userId');

            // Filter out current user
            const filteredUsers = (data || []).filter(user => user._id !== currentUserId);
            setUsers(filteredUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
            setError('Failed to load users. Please try again.');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const toggleUserSelection = (user) => {
        setSelectedUsers(prev => {
            const isSelected = prev.some(u => u._id === user._id);
            if (isSelected) {
                return prev.filter(u => u._id !== user._id);
            } else {
                // For personal chat, only allow one user
                if (chatType === 'personal') {
                    return [user];
                }
                return [...prev, user];
            }
        });
    };

    const removeUser = (userId) => {
        setSelectedUsers(prev => prev.filter(u => u._id !== userId));
    };

    const createChat = async () => {
        // Validation
        if (selectedUsers.length === 0) {
            setError('Please select at least one user');
            return;
        }

        if (chatType === 'group' && !groupName.trim()) {
            setError('Please enter a group name');
            return;
        }

        if (chatType === 'group' && selectedUsers.length < 2) {
            setError('Group chat requires at least 2 users');
            return;
        }

        try {
            setCreating(true);
            setError('');

            const response = await fetch('http://localhost:5000/api/chats', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    isGroupChat: chatType === 'group',
                    name: chatType === 'group' ? groupName : undefined,
                    participants: selectedUsers.map(u => u._id)
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create chat');
            }

            const newChat = await response.json();

            // Call the callback with the new chat
            if (onChatCreated) {
                onChatCreated(newChat);
            }

            // Close modal
            onClose();
        } catch (error) {
            console.error('Error creating chat:', error);
            setError(error.message || 'Failed to create chat. Please try again.');
        } finally {
            setCreating(false);
        }
    };

    const filteredUsers = users.filter(user => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            user.username?.toLowerCase().includes(query) ||
            user.email?.toLowerCase().includes(query)
        );
    });

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="new-chat-modal" onClick={handleOverlayClick}>
            <div className="modal-content">
                {/* Header */}
                <div className="modal-header">
                    <h2 className="modal-title">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Chat
                    </h2>
                    <button className="modal-close" onClick={onClose}>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="modal-body">
                    {/* Error Message */}
                    {error && (
                        <div style={{
                            padding: '1rem',
                            background: 'rgba(214, 48, 49, 0.1)',
                            border: '2px solid var(--danger-color)',
                            borderRadius: 'var(--border-radius-md)',
                            color: 'var(--danger-color)',
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <svg style={{ width: '20px', height: '20px', flexShrink: 0 }} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    )}

                    {/* Chat Type Selection */}
                    <div className="chat-type-selection">
                        <button
                            className={`chat-type-btn ${chatType === 'personal' ? 'active' : ''}`}
                            onClick={() => {
                                setChatType('personal');
                                setSelectedUsers([]);
                                setGroupName('');
                                setError('');
                            }}
                        >
                            <div className="chat-type-icon">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div className="chat-type-name">Personal</div>
                            <div className="chat-type-desc">One-on-one chat</div>
                        </button>

                        <button
                            className={`chat-type-btn ${chatType === 'group' ? 'active' : ''}`}
                            onClick={() => {
                                setChatType('group');
                                setError('');
                            }}
                        >
                            <div className="chat-type-icon">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div className="chat-type-name">Group</div>
                            <div className="chat-type-desc">Chat with multiple people</div>
                        </button>
                    </div>

                    {/* Group Name (only for group chats) */}
                    {chatType === 'group' && (
                        <div className="user-search-section">
                            <label className="search-label">Group Name</label>
                            <input
                                type="text"
                                className="group-name-input"
                                placeholder="Enter group name..."
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                            />
                        </div>
                    )}

                    {/* User Search */}
                    <div className="user-search-section">
                        <label className="search-label">
                            {chatType === 'personal' ? 'Select User' : 'Add Members'}
                        </label>
                        <div className="user-search-container">
                            <svg className="user-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                className="user-search-input"
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Selected Users */}
                        {selectedUsers.length > 0 && (
                            <div className="selected-users">
                                {selectedUsers.map(user => (
                                    <div key={user._id} className="selected-user-chip">
                                        <img
                                            src={`https://ui-avatars.com/api/?name=${user.username}&background=random`}
                                            alt={user.username}
                                        />
                                        {user.username}
                                        <button
                                            className="chip-remove"
                                            onClick={() => removeUser(user._id)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* User List */}
                    <div className="user-list">
                        {loading ? (
                            <div className="user-list-loading">
                                <div className="spinner"></div>
                                <p>Loading users...</p>
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="user-list-empty">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <p>{searchQuery ? 'No users found' : 'No users available'}</p>
                            </div>
                        ) : (
                            filteredUsers.map(user => {
                                const isSelected = selectedUsers.some(u => u._id === user._id);
                                return (
                                    <div
                                        key={user._id}
                                        className={`user-item ${isSelected ? 'selected' : ''}`}
                                        onClick={() => toggleUserSelection(user)}
                                    >
                                        <div className="user-item-avatar">
                                            <img
                                                src={`https://ui-avatars.com/api/?name=${user.username}&background=random`}
                                                alt={user.username}
                                                className="avatar"
                                            />
                                        </div>
                                        <div className="user-item-info">
                                            <div className="user-item-name">{user.username}</div>
                                            <div className="user-item-email">{user.email}</div>
                                        </div>
                                        <div className="user-item-checkbox"></div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={createChat}
                        disabled={creating || selectedUsers.length === 0 || (chatType === 'group' && !groupName.trim())}
                    >
                        {creating ? (
                            <>
                                <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                                Creating...
                            </>
                        ) : (
                            <>
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '20px', height: '20px' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Create Chat
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default NewChatModal;