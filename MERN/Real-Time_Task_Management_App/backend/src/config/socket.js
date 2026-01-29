// ==================== backend/src/config/socket.js (ENHANCED) ====================
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

let io;
const activeUsers = new Map();
const activeConnections = new Set();

const initializeSocket = (server) => {
    io = socketIO(server, {
        cors: {
            origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true
        },
        pingTimeout: 60000,
        pingInterval: 25000,
        maxHttpBufferSize: 1e6, // 1 MB
        transports: ['websocket', 'polling']
    });

    // Socket.IO middleware for authentication (optional)
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            // Allow connection without auth for demo
            return next();
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            logger.info(`Authenticated socket connection: ${socket.id} (User: ${decoded.id})`);
            next();
        } catch (error) {
            logger.error('Socket authentication error:', error);
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        logger.info(`✅ New client connected: ${socket.id}`);

        // Track active users
        activeUsers.set(socket.id, {
            socketId: socket.id,
            userId: socket.userId || 'guest',
            connectedAt: new Date(),
            lastActivity: new Date()
        });

        activeConnections.add(socket.id);

        // Broadcast user count to all clients
        const userCount = activeUsers.size;
        io.emit('users:count', userCount);
        logger.info(`Active users: ${userCount}`);

        // Handle task events
        socket.on('task:create', (task) => {
            try {
                logger.info(`Task create event from ${socket.id}: ${task._id}`);
                socket.broadcast.emit('task:created', task);
                updateUserActivity(socket.id);
            } catch (error) {
                logger.error('Error broadcasting task:create:', error);
            }
        });

        socket.on('task:update', (task) => {
            try {
                logger.info(`Task update event from ${socket.id}: ${task._id}`);
                socket.broadcast.emit('task:updated', task);
                updateUserActivity(socket.id);
            } catch (error) {
                logger.error('Error broadcasting task:update:', error);
            }
        });

        socket.on('task:delete', (taskId) => {
            try {
                logger.info(`Task delete event from ${socket.id}: ${taskId}`);
                socket.broadcast.emit('task:deleted', taskId);
                updateUserActivity(socket.id);
            } catch (error) {
                logger.error('Error broadcasting task:delete:', error);
            }
        });

        // Handle sync request
        socket.on('tasks:requestSync', async () => {
            try {
                logger.info(`Sync request from ${socket.id}`);
                const Task = require('../models/Task');
                const tasks = await Task.find().sort({ createdAt: -1 }).lean();
                socket.emit('tasks:sync', tasks);
                logger.info(`Synced ${tasks.length} tasks to ${socket.id}`);
                updateUserActivity(socket.id);
            } catch (error) {
                logger.error('Sync error:', error);
                socket.emit('sync:error', { message: 'Failed to sync tasks' });
            }
        });

        // Handle ping for connection health check
        socket.on('ping', () => {
            socket.emit('pong');
            updateUserActivity(socket.id);
        });

        // Handle disconnection
        socket.on('disconnect', (reason) => {
            logger.info(`❌ Client disconnected: ${socket.id} (Reason: ${reason})`);
            activeUsers.delete(socket.id);
            activeConnections.delete(socket.id);
            io.emit('users:count', activeUsers.size);
            logger.info(`Active users: ${activeUsers.size}`);
        });

        // Handle errors
        socket.on('error', (error) => {
            logger.error(`Socket error for ${socket.id}:`, error);
        });
    });

    // Clean up inactive connections periodically
    setInterval(() => {
        const now = new Date();
        const timeout = 30 * 60 * 1000; // 30 minutes

        activeUsers.forEach((user, socketId) => {
            if (now - user.lastActivity > timeout) {
                logger.warn(`Removing inactive user: ${socketId}`);
                activeUsers.delete(socketId);
                activeConnections.delete(socketId);
            }
        });
    }, 5 * 60 * 1000); // Check every 5 minutes

    logger.info('✅ Socket.IO initialized successfully');
    return io;
};

const updateUserActivity = (socketId) => {
    const user = activeUsers.get(socketId);
    if (user) {
        user.lastActivity = new Date();
    }
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

const emitToAll = (event, data) => {
    if (io) {
        io.emit(event, data);
        logger.info(`Emitted ${event} to all clients`);
    }
};

const emitToUser = (socketId, event, data) => {
    if (io) {
        io.to(socketId).emit(event, data);
        logger.info(`Emitted ${event} to ${socketId}`);
    }
};

const getActiveUsersCount = () => activeUsers.size;

const getActiveConnections = () => Array.from(activeConnections);

module.exports = {
    initializeSocket,
    getIO,
    emitToAll,
    emitToUser,
    getActiveUsersCount,
    getActiveConnections
};

