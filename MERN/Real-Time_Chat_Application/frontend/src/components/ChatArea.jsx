import React, { useRef, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import MessageItem from './MessageItem';
import MessageInput from './MessageInput';
import VideoCall from './VideoCall';
import SearchMessagesModal from './SearchMessagesModal';
import ViewMediaModal from './ViewMediaModal';
import { formatDate } from '../utils/dateUtils';
import { FiPhone, FiVideo, FiMoreVertical } from 'react-icons/fi';
import { authAPI, messageAPI } from '../services/api';
import socketService from '../services/socket';
import toast from 'react-hot-toast';
import { AnimatePresence,motion  } from 'framer-motion';

const ChatArea = ({ onBack }) => {
    const { user } = useAuth();
    const { activeConversation, messages, typingUsers, onlineUsers, loadMessages, setMessages, setConversations, loadConversations } = useChat();
    const [activeCall, setActiveCall] = useState(null);
    const [incomingCall, setIncomingCall] = useState(null);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [showMediaModal, setShowMediaModal] = useState(false);
    const messagesEndRef = useRef(null);
    const conversationMessages = messages[activeConversation?._id] || [];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [conversationMessages]);

    useEffect(() => {
        // Listen for incoming calls
        const handleIncomingCall = (callData) => {
            if (callData.call.conversationId === activeConversation?._id) {
                setIncomingCall(callData);
                toast((t) => (
                    <div>
                        <p>{callData.caller.username} is calling...</p>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <button
                                onClick={() => {
                                    acceptCall(callData);
                                    toast.dismiss(t.id);
                                }}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: 'var(--success)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px'
                                }}
                            >
                                Accept
                            </button>
                            <button
                                onClick={() => {
                                    rejectCall(callData);
                                    toast.dismiss(t.id);
                                }}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: 'var(--error)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px'
                                }}
                            >
                                Decline
                            </button>
                        </div>
                    </div>
                ), {
                    duration: 30000,
                    icon: callData.call.type === 'video' ? '📹' : '📞'
                });
            }
        };

        socketService.on('call:incoming', handleIncomingCall);
        socketService.on('call:accepted', ({ roomId }) => {
            if (activeCall && activeCall.roomId === roomId) {
                toast.success('Call connected');
            }
        });
        socketService.on('call:rejected', () => {
            toast.error('Call declined');
            setActiveCall(null);
            setIncomingCall(null);
        });

        return () => {
            socketService.off('call:incoming', handleIncomingCall);
            socketService.off('call:accepted');
            socketService.off('call:rejected');
        };
    }, [activeConversation]);

    const initiateCall = (type) => {
        if (activeConversation.type === 'group') {
            toast.error('Group calls coming soon!');
            return;
        }

        const otherUser = activeConversation.participants.find(p => p._id !== user._id);

        const callData = {
            conversationId: activeConversation._id,
            caller: user,
            type,
            roomId: null
        };

        socketService.emit('call:initiate', {
            receiverId: otherUser._id,
            conversationId: activeConversation._id,
            type
        });

        socketService.once('call:initiated', ({ call, roomId }) => {
            setActiveCall({ ...call, roomId });
        });

        socketService.once('call:failed', ({ error }) => {
            toast.error(error);
        });
    };

    const acceptCall = (callData) => {
        socketService.emit('call:accept', { roomId: callData.roomId });
        setActiveCall(callData.call);
        setIncomingCall(null);
    };

    const rejectCall = (callData) => {
        socketService.emit('call:reject', { roomId: callData.roomId });
        setIncomingCall(null);
    };

    const endCall = () => {
        setActiveCall(null);
        setIncomingCall(null);
    };

    // More Options handlers
    const handleSearchMessages = () => {
        setShowSearchModal(true);
        setShowMoreMenu(false);
    };

    const handleMuteNotifications = () => {
        setIsMuted(!isMuted);
        setShowMoreMenu(false);
        toast.success(isMuted ? 'Notifications unmuted' : 'Notifications muted');
    };

    const handleViewMedia = () => {
        setShowMediaModal(true);
        setShowMoreMenu(false);
    };

    const handleExportChat = () => {
        setShowMoreMenu(false);

        // Create export data
        const exportData = {
            conversation: activeConversation.type === 'group'
                ? activeConversation.name
                : activeConversation.participants.find(p => p._id !== user._id)?.username,
            exportDate: new Date().toISOString(),
            messages: conversationMessages.map(m => ({
                sender: m.sender.username,
                content: m.content,
                timestamp: m.createdAt,
                type: m.type
            }))
        };

        // Create and download file
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-export-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success('Chat exported successfully');
    };

    const handleBlockUser = async () => {
        setShowMoreMenu(false);

        if (activeConversation.type === 'group') {
            toast.error('Cannot block group conversations');
            return;
        }

        const otherUser = activeConversation.participants.find(p => p._id !== user._id);

        if (window.confirm(isBlocked ? 'Unblock this user?' : 'Block this user?')) {
            try {
                if (isBlocked) {
                    await authAPI.unblockUser(otherUser._id);
                    setIsBlocked(false);
                    toast.success('User unblocked');
                } else {
                    await authAPI.blockUser(otherUser._id);
                    setIsBlocked(true);
                    toast.success('User blocked');
                }
            } catch (error) {
                toast.error('Failed to update block status');
                console.error('Block error:', error);
            }
        }
    };

    const handleClearMessages = async () => {
        setShowMoreMenu(false);

        if (window.confirm('Clear all messages in this conversation? This will only clear messages for you.')) {
            try {
                await messageAPI.clearMessages(activeConversation._id);

                // Clear messages locally
                setMessages(prev => ({
                    ...prev,
                    [activeConversation._id]: []
                }));

                // Reload conversations to update sidebar with correct last message
                await loadConversations();

                toast.success('Messages cleared for you');
            } catch (error) {
                toast.error('Failed to clear messages');
                console.error('Clear error:', error);
            }
        }
    };

    if (!activeConversation) return null;

    // Get conversation display info
    const getDisplayInfo = () => {
        if (activeConversation.type === 'group') {
            return {
                name: activeConversation.name,
                avatar: activeConversation.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(activeConversation.name) + '&background=6366f1&color=fff&size=128&rounded=true&bold=true',
                subtitle: `${activeConversation.participants.length} members`,
                isOnline: false,
                isGroup: true
            };
        }

        const otherUser = activeConversation.participants.find(p => p._id !== user._id);
        return {
            name: otherUser?.username || 'Unknown User',
            avatar: otherUser?.avatar || `https://ui-avatars.com/api/?name=${otherUser?.username || 'U'}&background=random`,
            subtitle: onlineUsers.has(otherUser?._id) ? 'Online' : 'Offline',
            isOnline: onlineUsers.has(otherUser?._id),
            isGroup: false
        };
    };

    const { name, avatar, subtitle, isOnline, isGroup } = getDisplayInfo();
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
            <AnimatePresence>
                {activeCall && (
                    <VideoCall call={activeCall} onEnd={endCall} />
                )}
            </AnimatePresence>

            <div className="chat-header glass">
                <div className="chat-header-info">
                    {onBack && (
                        <button className="back-button mobile-only" onClick={onBack}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                        </button>
                    )}
                    <div className="chat-avatar-wrapper">
                        <img
                            src={avatar}
                            alt={name}
                            className={`chat-avatar ${isGroup ? 'group-avatar' : ''}`}
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
                    {activeConversation.type === 'private' && (
                        <>
                            <button
                                className="icon-btn"
                                title="Voice call"
                                onClick={() => initiateCall('audio')}
                            >
                                <FiPhone size={20} />
                            </button>
                            <button
                                className="icon-btn"
                                title="Video call"
                                onClick={() => initiateCall('video')}
                            >
                                <FiVideo size={20} />
                            </button>
                        </>
                    )}
                    <div className="more-menu-wrapper">
                        <button
                            className="icon-btn"
                            title="More options"
                            onClick={() => setShowMoreMenu(!showMoreMenu)}
                        >
                            <FiMoreVertical size={20} />
                        </button>

                        {showMoreMenu && (
                            <motion.div
                                className="more-menu"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <button onClick={handleSearchMessages}>
                                    🔍 Search Messages
                                </button>
                                <button onClick={handleMuteNotifications}>
                                    {isMuted ? '🔔' : '🔕'} {isMuted ? 'Unmute' : 'Mute'} Notifications
                                </button>
                                <button onClick={handleViewMedia}>
                                    🖼️ View Media
                                </button>
                                {activeConversation.type === 'group' && (
                                    <button onClick={() => {
                                        toast('Group info feature coming soon!');
                                        setShowMoreMenu(false);
                                    }}>
                                        ℹ️ Group Info
                                    </button>
                                )}
                                {activeConversation.type === 'private' && (
                                    <button onClick={handleBlockUser}>
                                        🚫 {isBlocked ? 'Unblock' : 'Block'} User
                                    </button>
                                )}
                                <button onClick={handleExportChat}>
                                    💾 Export Chat
                                </button>
                                <button
                                    className="danger"
                                    onClick={handleClearMessages}
                                >
                                    🗑️ Clear Messages
                                </button>
                            </motion.div>
                        )}
                    </div>
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

            {/* Modals */}
            <AnimatePresence>
                {showSearchModal && (
                    <SearchMessagesModal onClose={() => setShowSearchModal(false)} />
                )}
                {showMediaModal && (
                    <ViewMediaModal onClose={() => setShowMediaModal(false)} />
                )}
            </AnimatePresence>
        </div>
    );
};

export default ChatArea;