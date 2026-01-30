const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const { setupCallHandlers } = require('./callHandlers');

// Store online users
const onlineUsers = new Map();

const setupSocketHandlers = (io) => {
    // Socket authentication middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;

            if (!token) {
                return next(new Error('Authentication error'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId);

            if (!user) {
                return next(new Error('User not found'));
            }

            socket.userId = user._id.toString();
            socket.user = user;
            next();
        } catch (error) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', async (socket) => {
        console.log(`User connected: ${socket.user.username} (${socket.userId})`);

        // Add user to online users
        onlineUsers.set(socket.userId, socket.id);

        // Update user status
        socket.user.status = 'online';
        await socket.user.save();

        // Join user's conversation rooms
        const conversations = await Conversation.find({
            participants: socket.userId
        });

        conversations.forEach(conv => {
            socket.join(conv._id.toString());
        });

        // Broadcast user online status
        socket.broadcast.emit('user:online', {
            userId: socket.userId,
            status: 'online'
        });

        // Handle typing indicator
        socket.on('typing:start', ({ conversationId }) => {
            socket.to(conversationId).emit('typing:start', {
                conversationId,
                userId: socket.userId,
                username: socket.user.username
            });
        });

        socket.on('typing:stop', ({ conversationId }) => {
            socket.to(conversationId).emit('typing:stop', {
                conversationId,
                userId: socket.userId
            });
        });

        // Handle sending messages
        socket.on('message:send', async (data) => {
            try {
                const { conversationId, content, type = 'text', fileUrl, fileName, fileSize, mimeType, thumbnail } = data;

                // Verify user is participant
                const conversation = await Conversation.findOne({
                    _id: conversationId,
                    participants: socket.userId
                });

                if (!conversation) {
                    return socket.emit('error', { message: 'Conversation not found' });
                }

                // Create message
                const messageData = {
                    conversationId,
                    sender: socket.userId,
                    content,
                    type,
                    readBy: [{
                        user: socket.userId,
                        readAt: new Date()
                    }]
                };

                // Add file data if present
                if (fileUrl) {
                    messageData.fileUrl = fileUrl;
                    messageData.fileName = fileName;
                    messageData.fileSize = fileSize;
                    messageData.mimeType = mimeType;
                    messageData.thumbnail = thumbnail;
                }

                const message = new Message(messageData);
                await message.save();
                await message.populate('sender', '-password');

                // Update conversation
                conversation.lastMessage = message._id;
                conversation.lastMessageAt = new Date();
                await conversation.save();

                // Emit to all participants in the conversation
                io.to(conversationId).emit('message:new', {
                    message,
                    conversationId
                });

                // Send notification to offline users
                const offlineParticipants = conversation.participants.filter(
                    p => p.toString() !== socket.userId && !onlineUsers.has(p.toString())
                );

                // Here you could implement push notifications for offline users
                if (offlineParticipants.length > 0) {
                    console.log('Offline participants:', offlineParticipants);
                }

            } catch (error) {
                console.error('Message send error:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // Handle message editing
        socket.on('message:edit', async (data) => {
            try {
                const { messageId, content } = data;

                const message = await Message.findOne({
                    _id: messageId,
                    sender: socket.userId
                });

                if (!message) {
                    return socket.emit('error', { message: 'Message not found' });
                }

                message.content = content;
                message.edited = true;
                message.editedAt = new Date();
                await message.save();
                await message.populate('sender', '-password');

                io.to(message.conversationId.toString()).emit('message:edited', {
                    message
                });

            } catch (error) {
                console.error('Message edit error:', error);
                socket.emit('error', { message: 'Failed to edit message' });
            }
        });

        // Handle message deletion
        socket.on('message:delete', async (data) => {
            try {
                const { messageId } = data;

                const message = await Message.findOne({
                    _id: messageId,
                    sender: socket.userId
                });

                if (!message) {
                    return socket.emit('error', { message: 'Message not found' });
                }

                message.deleted = true;
                message.content = 'This message has been deleted';
                await message.save();

                io.to(message.conversationId.toString()).emit('message:deleted', {
                    messageId,
                    conversationId: message.conversationId
                });

            } catch (error) {
                console.error('Message delete error:', error);
                socket.emit('error', { message: 'Failed to delete message' });
            }
        });

        // Handle marking messages as read
        socket.on('message:read', async (data) => {
            try {
                const { conversationId, messageIds } = data;

                // Filter out temp message IDs (they start with 'temp-')
                const validMessageIds = messageIds.filter(id =>
                    typeof id === 'string' && !id.startsWith('temp-') && id.length === 24
                );

                if (validMessageIds.length === 0) {
                    return; // No valid IDs to process
                }

                await Message.updateMany(
                    {
                        _id: { $in: validMessageIds },
                        conversationId,
                        'readBy.user': { $ne: socket.userId }
                    },
                    {
                        $push: {
                            readBy: {
                                user: socket.userId,
                                readAt: new Date()
                            }
                        }
                    }
                );

                socket.to(conversationId).emit('messages:read', {
                    conversationId,
                    userId: socket.userId,
                    messageIds: validMessageIds
                });

            } catch (error) {
                console.error('Mark as read error:', error);
            }
        });

        // Handle joining new conversation
        socket.on('conversation:join', ({ conversationId }) => {
            socket.join(conversationId);
        });

        // Handle leaving conversation
        socket.on('conversation:leave', ({ conversationId }) => {
            socket.leave(conversationId);
        });

        // Handle disconnect
        socket.on('disconnect', async () => {
            console.log(`User disconnected: ${socket.user.username}`);

            // Remove from online users
            onlineUsers.delete(socket.userId);

            // Update user status
            try {
                socket.user.status = 'offline';
                socket.user.lastSeen = new Date();
                await socket.user.save();

                // Broadcast user offline status
                socket.broadcast.emit('user:offline', {
                    userId: socket.userId,
                    status: 'offline',
                    lastSeen: socket.user.lastSeen
                });
            } catch (error) {
                console.error('Disconnect error:', error);
            }
        });

        // Setup call handlers
        setupCallHandlers(io, socket);
    });

    return io;
};

module.exports = { setupSocketHandlers, onlineUsers };