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
                avatar: conversation.avatar,
                isOnline: false
            };
        }

        const otherUser = conversation.participants.find(p => p._id !== user._id);
        return {
            name: otherUser?.username || 'Unknown User',
            avatar: otherUser?.avatar,
            isOnline: onlineUsers.has(otherUser?._id)
        };
    };

    const { name, avatar, isOnline } = getDisplayInfo();

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
                    className="conversation-avatar"
                />
                {conversation.type === 'private' && isOnline && (
                    <span className="status-indicator online"></span>
                )}
            </div>

            <div className="conversation-content">
                <div className="conversation-header">
                    <h3 className="conversation-name">{name}</h3>
                    {lastMessageTime && (
                        <span className="conversation-time">{lastMessageTime}</span>
                    )}
                </div>

                <p className="conversation-preview">{lastMessageText}</p>
            </div>
        </div>
    );
};

export default ConversationItem;