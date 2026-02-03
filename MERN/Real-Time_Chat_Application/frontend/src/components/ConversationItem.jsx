import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { formatDistanceToNow } from 'date-fns';

const ConversationItem = ({ conversation }) => {
    const { user } = useAuth();
    const { activeConversation, selectConversation, onlineUsers } = useChat();

    const isActive = activeConversation?._id === conversation._id;

    // Get conversation display info
    const getDisplayInfo = () => {
        if (conversation.type === 'group') {
            return {
                name: conversation.name,
                avatar: conversation.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(conversation.name) + '&background=6366f1&color=fff&size=128&rounded=true&bold=true',
                isOnline: false,
                isGroup: true
            };
        }

        const otherUser = conversation.participants.find(p => p._id !== user._id);
        return {
            name: otherUser?.username || 'Unknown User',
            avatar: otherUser?.avatar || `https://ui-avatars.com/api/?name=${otherUser?.username || 'U'}&background=random`,
            isOnline: onlineUsers.has(otherUser?._id),
            isGroup: false
        };
    };

    const { name, avatar, isOnline, isGroup } = getDisplayInfo();

    const lastMessageText = conversation.lastMessage?.content || 'No messages yet';
    const lastMessageTime = conversation.lastMessageAt
        ? formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })
        : '';

    return (
        <div
            className={`conversation-item ${isActive ? 'active' : ''}`}
            onClick={() => selectConversation(conversation)}
        >
            <div className="conversation-avatar-wrapper">
                <img
                    src={avatar}
                    alt={name}
                    className={`conversation-avatar ${isGroup ? 'group-avatar' : ''}`}
                />
                {isGroup && (
                    <span className="group-indicator">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                    </span>
                )}
                {conversation.type === 'private' && isOnline && (
                    <span className="status-indicator online"></span>
                )}
            </div>

            <div className="conversation-content">
                <div className="conversation-header">
                    <h3 className={`conversation-name ${conversation.unreadCount > 0 ? 'unread' : ''}`}>
                        {name}
                    </h3>
                    <div className="conversation-header-right">
                        {lastMessageTime && (
                            <span className="conversation-time">{lastMessageTime}</span>
                        )}
                    </div>
                </div>

                <div className="conversation-preview-row">
                    <p className={`conversation-preview ${conversation.unreadCount > 0 ? 'unread' : ''}`}>
                        {lastMessageText}
                    </p>
                    {conversation.unreadCount > 0 && (
                        <span className="unread-badge">{conversation.unreadCount}</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConversationItem;