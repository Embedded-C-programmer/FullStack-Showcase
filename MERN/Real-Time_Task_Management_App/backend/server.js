// const express = require('express');
// const http = require('http');
// const cors = require('cors');
// const helmet = require('helmet');
// const morgan = require('morgan');
// const rateLimit = require('express-rate-limit');
// require('dotenv').config();

// const connectDB = require('./src/config/database');
// const { initializeSocket } = require('./src/config/socket');
// const errorHandler = require('./src/middleware/errorHandler');
// const taskRoutes = require('./src/routes/taskRoutes');
// const authRoutes = require('./src/routes/authRoutes');

// const app = express();
// const server = http.createServer(app);

// // Connect to MongoDB
// connectDB();

// // Initialize Socket.IO
// const io = initializeSocket(server);

// // Make io accessible to routes
// app.set('io', io);

// // Security middleware
// app.use(helmet());
// app.use(cors({
//     origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
//     credentials: true
// }));

// // Rate limiting
// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 100 // limit each IP to 100 requests per windowMs
// });
// app.use('/api', limiter);

// // Body parsing middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Logging
// if (process.env.NODE_ENV === 'development') {
//     app.use(morgan('dev'));
// }

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/tasks', taskRoutes);

// // Health check
// app.get('/health', (req, res) => {
//     res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
// });

// // Error handling middleware
// app.use(errorHandler);

// const PORT = process.env.PORT || 5000;

// server.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//     console.log(`Environment: ${process.env.NODE_ENV}`);
// });

// // Handle unhandled promise rejections
// process.on('unhandledRejection', (err) => {
//     console.error('UNHANDLED REJECTION! Shutting down...');
//     console.error(err.name, err.message);
//     server.close(() => {
//         process.exit(1);
//     });
// });

// module.exports = app;



const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./src/config/database');
const { initializeSocket } = require('./src/config/socket');
const errorHandler = require('./src/middleware/errorHandler');
const taskRoutes = require('./src/routes/taskRoutes');
const authRoutes = require('./src/routes/authRoutes');

const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// Initialize Socket.IO
const io = initializeSocket(server);

// Make io accessible to routes
app.set('io', io);

// Security middleware
app.use(helmet());
// app.use(cors({
//     origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
//     credentials: true
// }));


app.use(
    cors({
        origin: [
            'http://localhost:3000',
            'http://localhost:5173'
        ],
        credentials: true
    })
);

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Task Manager API',
        version: '1.0.0',
        endpoints: {
            tasks: '/api/tasks',
            auth: '/api/auth',
            health: '/health'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log('=================================');
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`API URL: http://localhost:${PORT}/api`);
    console.log('=================================');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    console.error(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});

// Handle SIGTERM
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
    server.close(() => {
        console.log('💥 Process terminated!');
    });
});

module.exports = app;
