// require('dotenv').config();
// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const helmet = require('helmet');
// const compression = require('compression');
// const rateLimit = require('express-rate-limit');
// const path = require('path');

// const authRoutes = require('./routes/auth');
// const conversationRoutes = require('./routes/conversations');
// const messageRoutes = require('./routes/messages');
// const uploadRoutes = require('./routes/upload');
// const { setupSocketHandlers } = require('./socket/socketHandlers');
// const logger = require('./config/logger');

// const app = express();
// const server = http.createServer(app);

// // Socket.io setup with CORS
// const io = new Server(server, {
//     cors: {
//         origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
//         methods: ['GET', 'POST'],
//         credentials: true
//     },
//     pingTimeout: 60000,
//     pingInterval: 25000,
//     maxHttpBufferSize: 1e8 // 100MB for file transfers
// });

// // Security middleware
// app.use(helmet({
//     crossOriginResourcePolicy: { policy: 'cross-origin' }
// }));

// // Rate limiting
// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 100, // limit each IP to 100 requests per windowMs
//     message: 'Too many requests from this IP, please try again later.'
// });
// app.use('/api/', limiter);

// // Compression
// app.use(compression());

// // CORS
// // app.use(cors({
// //     origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
// //     credentials: true
// // }));
// app.use(
//     cors({
//         origin: [
//             'http://localhost:3000','http://localhost:5000',
//             'http://localhost:5173'
//         ],
//         credentials: true
//     })
// );

// // Body parsers
// app.use(express.json({ limit: '50mb' }));
// app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// // Static files
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Request logging
// app.use((req, res, next) => {
//     logger.info(`${req.method} ${req.path}`, {
//         ip: req.ip,
//         userAgent: req.get('user-agent')
//     });
//     next();
// });

// // Health check
// app.get('/health', (req, res) => {
//     res.json({
//         status: 'ok',
//         timestamp: new Date().toISOString(),
//         uptime: process.uptime(),
//         memory: process.memoryUsage()
//     });
// });

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/conversations', conversationRoutes);
// app.use('/api/messages', messageRoutes);
// app.use('/api/upload', uploadRoutes);

// // 404 handler
// app.use((req, res) => {
//     res.status(404).json({ error: 'Route not found' });
// });

// // Error handler
// app.use((err, req, res, next) => {
//     logger.error('Error:', err);
//     res.status(err.status || 500).json({
//         error: err.message || 'Internal server error'
//     });
// });

// // Setup Socket.io handlers
// setupSocketHandlers(io);

// // MongoDB connection with retry logic
// const connectDB = async (retries = 5) => {
//     try {
//         await mongoose.connect(process.env.MONGODB_URI, {
//             // useNewUrlParser: true,
//             // useUnifiedTopology: true
//         });
//         logger.info('✓ Connected to MongoDB');
//     } catch (error) {
//         logger.error('MongoDB connection error:', error);

//         if (retries > 0) {
//             logger.info(`Retrying connection... (${retries} attempts left)`);
//             setTimeout(() => connectDB(retries - 1), 5000);
//         } else {
//             logger.error('Failed to connect to MongoDB after multiple attempts');
//             process.exit(1);
//         }
//     }
// };

// connectDB().then(() => {
//     // Start server
//     const PORT = process.env.PORT || 5000;
//     server.listen(PORT, () => {
//         logger.info(`✓ Server running on port ${PORT}`);
//         logger.info(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
//     });
// });

// // Graceful shutdown
// process.on('SIGTERM', async () => {
//     logger.info('SIGTERM received, shutting down gracefully...');
//     server.close(() => {
//         logger.info('Server closed');
//         mongoose.connection.close(false, () => {
//             logger.info('MongoDB connection closed');
//             process.exit(0);
//         });
//     });
// });

// // Handle uncaught exceptions
// process.on('uncaughtException', (error) => {
//     logger.error('Uncaught Exception:', error);
//     process.exit(1);
// });

// process.on('unhandledRejection', (reason, promise) => {
//     logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
//     process.exit(1);
// });

// module.exports = { app, server, io };



require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

const authRoutes = require('./routes/auth');
const conversationRoutes = require('./routes/conversations');
const messageRoutes = require('./routes/messages');
const uploadRoutes = require('./routes/upload');
const { setupSocketHandlers } = require('./socket/socketHandlers');
const logger = require('./config/logger');

const app = express();
const server = http.createServer(app);

// Socket.io setup with CORS
const io = new Server(server, {
    cors: {
        origin: [
            'http://localhost:3000',
            'http://localhost:5000',
            'http://localhost:5173',
            'http://localhost:5174',
            process.env.CORS_ORIGIN
        ].filter(Boolean),
        methods: ['GET', 'POST'],
        credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    maxHttpBufferSize: 1e8 // 100MB for file transfers
});

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Rate limiting - Increased for development
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Increased from 100 to 500 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    skip: (req) => {
        // Skip rate limiting for localhost in development
        return process.env.NODE_ENV === 'development' &&
            (req.ip === '::1' || req.ip === '127.0.0.1' || req.ip === '::ffff:127.0.0.1');
    }
});
app.use('/api/', limiter);

// Compression
app.use(compression());

// CORS
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:5174',
        process.env.CORS_ORIGIN
    ].filter(Boolean),
    credentials: true
}));

// Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('user-agent')
    });
    next();
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/upload', uploadRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    logger.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
    });
});

// Setup Socket.io handlers
setupSocketHandlers(io);

// MongoDB connection with retry logic
const connectDB = async (retries = 5) => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            // useNewUrlParser: true,
            // useUnifiedTopology: true
        });
        logger.info('✓ Connected to MongoDB');
    } catch (error) {
        logger.error('MongoDB connection error:', error);

        if (retries > 0) {
            logger.info(`Retrying connection... (${retries} attempts left)`);
            setTimeout(() => connectDB(retries - 1), 5000);
        } else {
            logger.error('Failed to connect to MongoDB after multiple attempts');
            process.exit(1);
        }
    }
};

connectDB().then(() => {
    // Start server
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
        logger.info(`✓ Server running on port ${PORT}`);
        logger.info(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully...');
    server.close(() => {
        logger.info('Server closed');
        mongoose.connection.close(false, () => {
            logger.info('MongoDB connection closed');
            process.exit(0);
        });
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

module.exports = { app, server, io };

