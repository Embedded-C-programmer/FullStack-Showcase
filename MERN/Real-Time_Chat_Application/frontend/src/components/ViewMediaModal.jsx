import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiDownload } from 'react-icons/fi';
import { useChat } from '../context/ChatContext';
import '../styles/Modal.css';

const ViewMediaModal = ({ onClose }) => {
    const { messages, activeConversation } = useChat();
    const [filter, setFilter] = useState('all'); // 'all', 'images', 'videos', 'files'

    const conversationMessages = messages[activeConversation?._id] || [];
    const API_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

    const mediaMessages = conversationMessages.filter(msg => {
        if (msg.deleted) return false;

        if (filter === 'images') return msg.type === 'image';
        if (filter === 'videos') return msg.type === 'video';
        if (filter === 'files') return msg.type === 'file' || msg.type === 'audio';

        return msg.fileUrl; // all media
    });

    return (
        <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="modal media-modal"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h2>Media, Files & Links</h2>
                    <button onClick={onClose} className="icon-btn">
                        <FiX size={20} />
                    </button>
                </div>

                <div className="media-filters">
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All ({conversationMessages.filter(m => m.fileUrl && !m.deleted).length})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'images' ? 'active' : ''}`}
                        onClick={() => setFilter('images')}
                    >
                        Images
                    </button>
                    <button
                        className={`filter-btn ${filter === 'videos' ? 'active' : ''}`}
                        onClick={() => setFilter('videos')}
                    >
                        Videos
                    </button>
                    <button
                        className={`filter-btn ${filter === 'files' ? 'active' : ''}`}
                        onClick={() => setFilter('files')}
                    >
                        Files
                    </button>
                </div>

                <div className="modal-body">
                    <div className="media-grid">
                        {mediaMessages.length === 0 && (
                            <p className="empty-state">No media found</p>
                        )}

                        {mediaMessages.map((message) => (
                            <div key={message._id} className="media-item">
                                {message.type === 'image' && (
                                    <div className="media-thumbnail">
                                        <img
                                            src={`${API_URL}${message.thumbnail || message.fileUrl}`}
                                            alt={message.fileName}
                                            onClick={() => window.open(`${API_URL}${message.fileUrl}`, '_blank')}
                                        />
                                        <a
                                            href={`${API_URL}${message.fileUrl}`}
                                            download={message.fileName}
                                            className="download-overlay"
                                        >
                                            <FiDownload size={20} />
                                        </a>
                                    </div>
                                )}

                                {message.type === 'video' && (
                                    <div className="media-thumbnail">
                                        <video src={`${API_URL}${message.fileUrl}`} />
                                        <div className="play-overlay">▶</div>
                                    </div>
                                )}

                                {(message.type === 'file' || message.type === 'audio') && (
                                    <div className="file-item">
                                        <div className="file-icon">📄</div>
                                        <div className="file-info">
                                            <div className="file-name">{message.fileName}</div>
                                            <div className="file-date">
                                                {new Date(message.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <a
                                            href={`${API_URL}${message.fileUrl}`}
                                            download={message.fileName}
                                            className="icon-btn"
                                        >
                                            <FiDownload size={16} />
                                        </a>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ViewMediaModal;