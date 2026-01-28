import React from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const MessageItem = ({ message, isOwn }) => {
    const time = format(new Date(message.createdAt), 'HH:mm');

    return (
        <motion.div
            className={`message ${isOwn ? 'own' : ''}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
        >
            {!isOwn && (
                <img
                    src={message.sender.avatar}
                    alt={message.sender.username}
                    className="message-avatar"
                />
            )}

            <div className="message-content">
                {!isOwn && (
                    <div className="message-sender">{message.sender.username}</div>
                )}

                <div className={`message-bubble ${message.deleted ? 'deleted' : ''}`}>
                    {message.content}
                    {message.edited && !message.deleted && (
                        <span className="message-edited"> (edited)</span>
                    )}
                </div>

                <div className="message-footer">
                    <span className="message-time">{time}</span>
                    {isOwn && (
                        <div className="message-status">
                            {message.readBy.length > 1 ? (
                                <svg className="check-icon read" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="20 6 9 17 4 12" />
                                    <polyline points="20 6 9 17 4 12" transform="translate(4, 0)" />
                                </svg>
                            ) : (
                                <svg className="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default MessageItem;