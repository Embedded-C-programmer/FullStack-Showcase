import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { conversationAPI, messageAPI } from '../services/api';
import socketService from '../services/socket';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const ChatContext = createContext(null);

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within ChatProvider');
    }
    return context;
};

export const ChatProvider = ({ children }) => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState({});
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [typingUsers, setTypingUsers] = useState({});
    const [loading, setLoading] = useState(true);

    // Load conversations
    const loadConversations = useCallback(async () => {
        try {
            const response = await conversationAPI.getAll();
            setConversations(response.data.conversations);
        } catch (error) {
            console.error('Load conversations error:', error);
            toast.error('Failed to load conversations');
        } finally {
            setLoading(false);
        }
    }, []);

    // Load messages for a conversation
    const loadMessages = useCallback(async (conversationId) => {
        try {
            const response = await messageAPI.getMessages(conversationId);

            // Filter out messages deleted for current user
            const filteredMessages = response.data.messages.filter(msg =>
                !msg.deletedFor || !msg.deletedFor.includes(user?._id)
            );

            setMessages(prev => ({
                ...prev,
                [conversationId]: filteredMessages
            }));
        } catch (error) {
            console.error('Load messages error:', error);
            toast.error('Failed to load messages');
        }
    }, [user]);

    // Select conversation
    const selectConversation = useCallback(async (conversation) => {
        setActiveConversation(conversation);

        if (conversation) {
            // Always load messages to ensure fresh data (especially after deletions)
            await loadMessages(conversation._id);

            // Join conversation room
            socketService.joinConversation(conversation._id);
        }
    }, [loadMessages]);

    // Create or get private conversation
    const createPrivateConversation = useCallback(async (userId) => {
        try {
            const response = await conversationAPI.createPrivate(userId);
            const { conversation, isNew } = response.data;

            if (isNew) {
                setConversations(prev => [conversation, ...prev]);
            }

            await selectConversation(conversation);
            return conversation;
        } catch (error) {
            console.error('Create conversation error:', error);
            toast.error('Failed to create conversation');
        }
    }, [selectConversation]);

    // Create group conversation
    const createGroupConversation = useCallback(async (name, participantIds) => {
        try {
            const response = await conversationAPI.createGroup({ name, participantIds });
            const conversation = response.data.conversation;

            setConversations(prev => [conversation, ...prev]);
            await selectConversation(conversation);

            toast.success('Group created');
            return conversation;
        } catch (error) {
            console.error('Create group error:', error);
            toast.error('Failed to create group');
        }
    }, [selectConversation]);

    // Send message
    const sendMessage = useCallback((conversationId, content, fileData = null, userId) => {
        const messageData = {
            conversationId,
            content,
            type: fileData?.type || 'text'
        };

        if (fileData) {
            messageData.fileUrl = fileData.fileUrl;
            messageData.fileName = fileData.fileName;
            messageData.fileSize = fileData.fileSize;
            messageData.mimeType = fileData.mimeType;
            messageData.thumbnail = fileData.thumbnail;
        }

        socketService.sendMessage(messageData);

        // Optimistic update - add message immediately to UI with correct sender
        const tempMessage = {
            _id: 'temp-' + Date.now(),
            conversationId,
            content,
            type: messageData.type,
            sender: {
                _id: userId, // Use actual user ID
                username: 'You',
                avatar: ''
            },
            createdAt: new Date().toISOString(),
            readBy: [{
                user: userId,
                readAt: new Date()
            }],
            temp: true,
            ...messageData
        };

        setMessages(prev => ({
            ...prev,
            [conversationId]: [...(prev[conversationId] || []), tempMessage]
        }));

        // Update conversation list immediately
        setConversations(prev =>
            prev.map(conv =>
                conv._id === conversationId
                    ? {
                        ...conv,
                        lastMessage: tempMessage,
                        lastMessageAt: tempMessage.createdAt
                    }
                    : conv
            ).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
        );
    }, []);

    // Edit message
    const editMessage = useCallback((messageId, content) => {
        socketService.editMessage({ messageId, content });
    }, []);

    // Delete message
    const deleteMessage = useCallback(async (messageId, conversationId) => {
        // Optimistic update - remove immediately from UI
        setMessages(prev => ({
            ...prev,
            [conversationId]: (prev[conversationId] || []).filter(m => m._id !== messageId)
        }));

        socketService.deleteMessage({ messageId });

        // Reload conversations to update sidebar properly
        setTimeout(() => {
            loadConversations();
        }, 500);
    }, [loadConversations]);

    // Setup socket listeners
    useEffect(() => {
        if (!socketService.isConnected()) return;

        // New message
        const handleNewMessage = ({ message, conversationId }) => {
            setMessages(prev => {
                const currentMessages = prev[conversationId] || [];
                // Remove temp message if exists and filter out any remaining temp messages
                const filtered = currentMessages.filter(m => !m.temp && !m._id.toString().startsWith('temp-'));
                return {
                    ...prev,
                    [conversationId]: [...filtered, message]
                };
            });

            // Update conversation last message and reload to get updated unread count
            setConversations(prev =>
                prev.map(conv =>
                    conv._id === conversationId
                        ? { ...conv, lastMessage: message, lastMessageAt: message.createdAt }
                        : conv
                ).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
            );

            // Reload conversations to get accurate unread count
            if (message.sender._id !== user._id) {
                setTimeout(() => {
                    loadConversations();
                }, 500);
            }
        };

        // Message edited
        const handleMessageEdited = ({ message }) => {
            setMessages(prev => ({
                ...prev,
                [message.conversationId]: (prev[message.conversationId] || []).map(m =>
                    m._id === message._id ? message : m
                )
            }));
        };

        // Message deleted
        const handleMessageDeleted = ({ messageId, conversationId }) => {
            setMessages(prev => ({
                ...prev,
                [conversationId]: (prev[conversationId] || []).filter(m => m._id !== messageId)
            }));
        };

        // User online/offline
        const handleUserOnline = ({ userId }) => {
            setOnlineUsers(prev => new Set([...prev, userId]));
        };

        const handleUserOffline = ({ userId }) => {
            setOnlineUsers(prev => {
                const next = new Set(prev);
                next.delete(userId);
                return next;
            });
        };

        // Typing indicators
        const handleTypingStart = ({ conversationId, userId, username }) => {
            setTypingUsers(prev => ({
                ...prev,
                [conversationId]: { userId, username }
            }));
        };

        const handleTypingStop = ({ conversationId }) => {
            setTypingUsers(prev => {
                const next = { ...prev };
                delete next[conversationId];
                return next;
            });
        };

        // Messages read
        const handleMessagesRead = ({ conversationId, userId, messageIds }) => {
            setMessages(prev => ({
                ...prev,
                [conversationId]: (prev[conversationId] || []).map(m =>
                    messageIds.includes(m._id)
                        ? {
                            ...m,
                            readBy: [...(m.readBy || []), { user: userId, readAt: new Date() }]
                        }
                        : m
                )
            }));

            // Reload conversations to update unread count in sidebar
            loadConversations();
        };

        socketService.on('message:new', handleNewMessage);
        socketService.on('message:edited', handleMessageEdited);
        socketService.on('message:deleted', handleMessageDeleted);
        socketService.on('user:online', handleUserOnline);
        socketService.on('user:offline', handleUserOffline);
        socketService.on('typing:start', handleTypingStart);
        socketService.on('typing:stop', handleTypingStop);
        socketService.on('messages:read', handleMessagesRead);

        return () => {
            socketService.off('message:new', handleNewMessage);
            socketService.off('message:edited', handleMessageEdited);
            socketService.off('message:deleted', handleMessageDeleted);
            socketService.off('user:online', handleUserOnline);
            socketService.off('user:offline', handleUserOffline);
            socketService.off('typing:start', handleTypingStart);
            socketService.off('typing:stop', handleTypingStop);
            socketService.off('messages:read', handleMessagesRead);
        };
    }, []);

    // Mark messages as read when conversation is active and messages are loaded
    useEffect(() => {
        if (!activeConversation || !user) return;

        const conversationMessages = messages[activeConversation._id] || [];
        if (conversationMessages.length === 0) return;

        // Find unread messages
        const unreadMessageIds = conversationMessages
            .filter(m => {
                // Not sent by me
                const notMine = m.sender && m.sender._id !== user._id;
                // Not already read by me
                const notRead = !m.readBy || !m.readBy.some(r => r.user === user._id);
                // Has real ID (not temp)
                const isReal = m._id && !m._id.toString().startsWith('temp-');
                return notMine && notRead && isReal;
            })
            .map(m => m._id);

        if (unreadMessageIds.length > 0) {
            // Mark as read
            socketService.markAsRead({
                conversationId: activeConversation._id,
                messageIds: unreadMessageIds
            });

            // Reload conversations after a delay to update unread count
            setTimeout(() => {
                loadConversations();
            }, 1000);
        }
    }, [activeConversation, messages, user, loadConversations]);

    const value = {
        conversations,
        activeConversation,
        messages,
        onlineUsers,
        typingUsers,
        loading,
        loadConversations,
        selectConversation,
        createPrivateConversation,
        createGroupConversation,
        sendMessage,
        editMessage,
        deleteMessage,
        loadMessages,
        setMessages,
        setConversations
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};