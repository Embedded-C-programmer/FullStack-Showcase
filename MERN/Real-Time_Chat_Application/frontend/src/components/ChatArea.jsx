import React, { useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import MessageItem from './MessageItem';
import MessageInput from './MessageInput';
import { formatDate } from '../utils/dateUtils';

const ChatArea = () => {
    const { user } = useAuth();
    const { activeConversation, messages, typingUsers, onlineUsers } = useChat();
    const messagesEndRef = useRef(null);
    const conversationMessages = messages[activeConversation?._id] || [];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [conversationMessages]);

    if (!activeConversation) return null;

    // Get conversation display info
    const getDisplayInfo = () => {
        if (activeConversation.type === 'group') {
            return {
                name: activeConversation.name,
                avatar: activeConversation.avatar,
                subtitle: `${activeConversation.participants.length} members`,
                isOnline: false
            };
        }

        const otherUser = activeConversation.participants.find(p => p._id !== user._id);
        return {
            name: otherUser?.username || 'Unknown User',
            avatar: otherUser?.avatar,
            subtitle: onlineUsers.has(otherUser?._id) ? 'Online' : 'Offline',
            isOnline: onlineUsers.has(otherUser?._id)
        };
    };

    const { name, avatar, subtitle, isOnline } = getDisplayInfo();
    const typing = typingUsers[activeConversation._id];

    // Group messages by date
    const groupedMessages = conversationMessages.reduce((groups, message) => {
        const date = formatDate(new Date(message.createdAt));
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(message);
        return groups;
    }, {});

    return (
        <div className="chat-area">
            <div className="chat-header glass">
                <div className="chat-header-info">
                    <div className="chat-avatar-wrapper">
                        <img
                            src={avatar}
                            alt={name}
                            className="chat-avatar"
                        />
                        {activeConversation.type === 'private' && isOnline && (
                            <span className="status-indicator online"></span>
                        )}
                    </div>
                    <div>
                        <h2 className="chat-name">{name}</h2>
                        <p className="chat-subtitle">{subtitle}</p>
                    </div>
                </div>

                <div className="chat-actions">
                    <button className="icon-btn" title="Video call">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M23 7l-7 5 7 5V7z" />
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                        </svg>
                    </button>
                    <button className="icon-btn" title="Voice call">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                    </button>
                    <button className="icon-btn" title="More options">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="1" />
                            <circle cx="12" cy="5" r="1" />
                            <circle cx="12" cy="19" r="1" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="messages-container">
                {Object.entries(groupedMessages).length === 0 ? (
                    <div className="empty-messages">
                        <div className="empty-icon">💬</div>
                        <p>No messages yet</p>
                        <span>Start the conversation!</span>
                    </div>
                ) : (
                    Object.entries(groupedMessages).map(([date, msgs]) => (
                        <div key={date}>
                            <div className="date-divider">
                                <span>{date}</span>
                            </div>
                            {msgs.map((message) => (
                                <MessageItem
                                    key={message._id}
                                    message={message}
                                    isOwn={message.sender._id === user._id}
                                />
                            ))}
                        </div>
                    ))
                )}

                {typing && (
                    <div className="typing-indicator">
                        <img
                            src={typing.avatar}
                            alt={typing.username}
                            className="typing-avatar"
                        />
                        <div className="typing-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <MessageInput />
        </div>
    );
};

export default ChatArea;