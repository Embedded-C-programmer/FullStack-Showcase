import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { authAPI } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const NewChatModal = ({ onClose }) => {
    const { createPrivateConversation, createGroupConversation } = useChat();
    const [tab, setTab] = useState('private'); // 'private' or 'group'
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [groupName, setGroupName] = useState('');
    const [searching, setSearching] = useState(false);

    const handleSearch = async (query) => {
        setSearchQuery(query);

        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setSearching(true);
        try {
            const response = await authAPI.searchUsers(query);
            setSearchResults(response.data.users);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setSearching(false);
        }
    };

    const toggleUserSelection = (user) => {
        setSelectedUsers(prev => {
            const exists = prev.find(u => u._id === user._id);
            if (exists) {
                return prev.filter(u => u._id !== user._id);
            }
            return [...prev, user];
        });
    };

    const handleCreatePrivate = async (user) => {
        await createPrivateConversation(user._id);
        onClose();
    };

    const handleCreateGroup = async () => {
        if (groupName.trim() && selectedUsers.length >= 2) {
            await createGroupConversation(
                groupName.trim(),
                selectedUsers.map(u => u._id)
            );
            onClose();
        }
    };

    return (
        <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="modal new-chat-modal glass"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h2>New Chat</h2>
                    <button className="icon-btn" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className="modal-tabs">
                    <button
                        className={`tab-btn ${tab === 'private' ? 'active' : ''}`}
                        onClick={() => setTab('private')}
                    >
                        Private Chat
                    </button>
                    <button
                        className={`tab-btn ${tab === 'group' ? 'active' : ''}`}
                        onClick={() => setTab('group')}
                    >
                        Group Chat
                    </button>
                </div>

                <div className="modal-content">
                    <div className="search-input">
                        <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {tab === 'group' && selectedUsers.length > 0 && (
                        <div className="selected-users">
                            {selectedUsers.map(user => (
                                <div key={user._id} className="selected-user-chip">
                                    <img src={user.avatar} alt={user.username} />
                                    <span>{user.username}</span>
                                    <button onClick={() => toggleUserSelection(user)}>×</button>
                                </div>
                            ))}
                        </div>
                    )}

                    {tab === 'group' && selectedUsers.length >= 2 && (
                        <div className="group-name-input">
                            <input
                                type="text"
                                placeholder="Group name"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                            />
                            <motion.button
                                className="btn-primary"
                                onClick={handleCreateGroup}
                                disabled={!groupName.trim()}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Create Group
                            </motion.button>
                        </div>
                    )}

                    <div className="search-results">
                        {searching ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                            </div>
                        ) : searchResults.length === 0 && searchQuery.length >= 2 ? (
                            <div className="empty-state">
                                <p>No users found</p>
                            </div>
                        ) : (
                            searchResults.map(user => (
                                <motion.div
                                    key={user._id}
                                    className={`user-item ${selectedUsers.find(u => u._id === user._id) ? 'selected' : ''}`}
                                    onClick={() => {
                                        if (tab === 'private') {
                                            handleCreatePrivate(user);
                                        } else {
                                            toggleUserSelection(user);
                                        }
                                    }}
                                    whileHover={{ backgroundColor: 'var(--bg-hover)' }}
                                >
                                    <img src={user.avatar} alt={user.username} className="user-avatar" />
                                    <div className="user-info">
                                        <div className="user-name">{user.username}</div>
                                        <div className="user-email">{user.email}</div>
                                    </div>
                                    {tab === 'group' && selectedUsers.find(u => u._id === user._id) && (
                                        <svg className="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    )}
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default NewChatModal;