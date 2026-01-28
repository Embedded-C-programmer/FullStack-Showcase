import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { conversationAPI, messageAPI } from '../services/api';
import socketService from '../services/socket';
import toast from 'react-hot-toast';

const ChatContext = createContext(null);

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within ChatProvider');
    }
    return context;
};

export const ChatProvider = ({ children }) => {
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
            setMessages(prev => ({
                ...prev,
                [conversationId]: response.data.messages
            }));
        } catch (error) {
            console.error('Load messages error:', error);
            toast.error('Failed to load messages');
        }
    }, []);

    // Select conversation
    const selectConversation = useCallback(async (conversation) => {
        setActiveConversation(conversation);

        if (conversation && !messages[conversation._id]) {
            await loadMessages(conversation._id);
        }

        // Join conversation room
        if (conversation) {
            socketService.joinConversation(conversation._id);

            // Mark messages as read
            const conversationMessages = messages[conversation._id] || [];
            const unreadMessageIds = conversationMessages
                .filter(m => !m.readBy.some(r => r.user === conversation._id))
                .map(m => m._id);

            if (unreadMessageIds.length > 0) {
                socketService.markAsRead({
                    conversationId: conversation._id,
                    messageIds: unreadMessageIds
                });
            }
        }
    }, [messages, loadMessages]);

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
    const sendMessage = useCallback((conversationId, content) => {
        socketService.sendMessage({
            conversationId,
            content,
            type: 'text'
        });
    }, []);

    // Setup socket listeners
    useEffect(() => {
        if (!socketService.isConnected()) return;

        // New message
        const handleNewMessage = ({ message, conversationId }) => {
            setMessages(prev => ({
                ...prev,
                [conversationId]: [...(prev[conversationId] || []), message]
            }));

            // Update conversation last message
            setConversations(prev =>
                prev.map(conv =>
                    conv._id === conversationId
                        ? { ...conv, lastMessage: message, lastMessageAt: message.createdAt }
                        : conv
                ).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
            );
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
                            readBy: [...m.readBy, { user: userId, readAt: new Date() }]
                        }
                        : m
                )
            }));
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
        sendMessage
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};