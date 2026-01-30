import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSearch } from 'react-icons/fi';
import { useChat } from '../context/ChatContext';
import '../styles/Modal.css';

const SearchMessagesModal = ({ onClose }) => {
    const { messages, activeConversation, selectConversation } = useChat();
    const [searchQuery, setSearchQuery] = useState('');

    const conversationMessages = messages[activeConversation?._id] || [];

    const searchResults = conversationMessages.filter(msg =>
        msg.content.toLowerCase().includes(searchQuery.toLowerCase()) && !msg.deleted
    );

    const handleMessageClick = (message) => {
        // Scroll to message (you can implement smooth scroll to message)
        onClose();
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
                className="modal search-modal"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h2>Search Messages</h2>
                    <button onClick={onClose} className="icon-btn">
                        <FiX size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="search-bar">
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search in conversation..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="search-results">
                        {searchQuery && searchResults.length === 0 && (
                            <p className="empty-state">No messages found</p>
                        )}

                        {searchResults.map((message) => (
                            <div
                                key={message._id}
                                className="search-result-item"
                                onClick={() => handleMessageClick(message)}
                            >
                                <div className="result-sender">{message.sender.username}</div>
                                <div className="result-content">{message.content}</div>
                                <div className="result-time">
                                    {new Date(message.createdAt).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default SearchMessagesModal;