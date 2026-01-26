// ============================================
// IMPORTS
// ============================================
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// ============================================
// APP SETUP
// ============================================
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:3001'],
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// ============================================
// DATABASE SCHEMAS (MONGOOSE MODELS)
// ============================================

// User Schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

// Chat Schema
const chatSchema = new mongoose.Schema({
    isGroupChat: {
        type: Boolean,
        default: false
    },
    name: {
        type: String,
        trim: true
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    }
}, {
    timestamps: true
});

const Chat = mongoose.model('Chat', chatSchema);

// Message Schema
const messageSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        trim: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true
    },
    attachments: [{
        name: String,
        url: String,
        type: String,
        size: Number
    }],
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read'],
        default: 'sent'
    }
}, {
    timestamps: true
});

const Message = mongoose.model('Message', messageSchema);

// ============================================
// AUTH MIDDLEWARE
// ============================================
const auth = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.header('Authorization');

        if (!authHeader) {
            return res.status(401).json({ message: 'No authentication token, access denied' });
        }

        // Remove 'Bearer ' prefix if present
        const token = authHeader.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'No authentication token, access denied' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this-in-production');

        // Add user info to request
        req.user = {
            userId: decoded.userId,
            email: decoded.email
        };

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }

        res.status(401).json({ message: 'Token verification failed' });
    }
};

// ============================================
// DATABASE CONNECTION
// ============================================
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chatapp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('✅ MongoDB connected successfully'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// ============================================
// PUBLIC ROUTES (NO AUTH REQUIRED)
// ============================================

// Health check
app.get('/', (req, res) => {
    res.json({ message: 'Chat API is running!' });
});

// Register new user
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                message: existingUser.email === email
                    ? 'Email already registered'
                    : 'Username already taken'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = new User({
            username,
            email,
            password: hashedPassword
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            token,
            userId: user._id,
            username: user.username,
            email: user.email
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
            { expiresIn: '7d' }
        );

        res.json({
            token,
            userId: user._id,
            username: user.username,
            email: user.email
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// ============================================
// PROTECTED ROUTES (AUTH REQUIRED)
// ============================================

// Get current user info
app.get('/api/auth/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Error fetching user data' });
    }
});

// Get all users (except current user)
app.get('/api/users', auth, async (req, res) => {
    try {
        const users = await User.find({ _id: { $ne: req.user.userId } })
            .select('username email')
            .sort({ username: 1 });
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// Get all chats for current user
app.get('/api/chats', auth, async (req, res) => {
    try {
        const chats = await Chat.find({
            participants: req.user.userId
        })
            .populate('participants', 'username email')
            .populate({
                path: 'lastMessage',
                populate: {
                    path: 'sender',
                    select: 'username'
                }
            })
            .sort({ updatedAt: -1 });

        res.json(chats);
    } catch (error) {
        console.error('Error fetching chats:', error);
        res.status(500).json({ message: 'Error fetching chats' });
    }
});

// Create new chat
app.post('/api/chats', auth, async (req, res) => {
    try {
        const { isGroupChat, name, participants } = req.body;

        // Validation
        if (!participants || participants.length === 0) {
            return res.status(400).json({ message: 'Participants are required' });
        }

        if (isGroupChat && participants.length < 2) {
            return res.status(400).json({ message: 'Group chat requires at least 2 participants' });
        }

        if (isGroupChat && !name) {
            return res.status(400).json({ message: 'Group name is required' });
        }

        // Add current user to participants if not already included
        const allParticipants = [...new Set([req.user.userId, ...participants])];

        // For personal chats, check if chat already exists
        if (!isGroupChat) {
            const existingChat = await Chat.findOne({
                isGroupChat: false,
                participants: { $all: allParticipants, $size: 2 }
            })
                .populate('participants', 'username email')
                .populate({
                    path: 'lastMessage',
                    populate: {
                        path: 'sender',
                        select: 'username'
                    }
                });

            if (existingChat) {
                return res.json(existingChat);
            }
        }

        // Create new chat
        const chat = new Chat({
            isGroupChat: isGroupChat || false,
            name: isGroupChat ? name : undefined,
            participants: allParticipants,
            admin: isGroupChat ? req.user.userId : undefined
        });

        await chat.save();

        // Populate and return
        const populatedChat = await Chat.findById(chat._id)
            .populate('participants', 'username email')
            .populate({
                path: 'lastMessage',
                populate: {
                    path: 'sender',
                    select: 'username'
                }
            });

        res.status(201).json(populatedChat);
    } catch (error) {
        console.error('Error creating chat:', error);
        res.status(500).json({ message: 'Error creating chat' });
    }
});

// Get messages for a specific chat
app.get('/api/messages/:chatId', auth, async (req, res) => {
    try {
        const { chatId } = req.params;

        // Verify chat exists
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        // Verify user is part of the chat
        if (!chat.participants.includes(req.user.userId)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Fetch all messages for this chat
        const messages = await Message.find({ chat: chatId })
            .populate('sender', 'username email')
            .sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Error fetching messages' });
    }
});

// Send a new message
app.post('/api/messages', auth, async (req, res) => {
    try {
        const { content, chatId } = req.body;

        // Validation
        if (!content || !content.trim()) {
            return res.status(400).json({ message: 'Message content is required' });
        }

        if (!chatId) {
            return res.status(400).json({ message: 'Chat ID is required' });
        }

        // Verify chat exists
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        // Verify user is part of the chat
        if (!chat.participants.includes(req.user.userId)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Create new message
        const message = new Message({
            content: content.trim(),
            sender: req.user.userId,
            chat: chatId
        });

        await message.save();

        // Update chat's last message
        chat.lastMessage = message._id;
        chat.updatedAt = new Date();
        await chat.save();

        // Populate sender info and return
        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'username email');

        res.status(201).json(populatedMessage);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Error sending message' });
    }
});

// Delete a chat
app.delete('/api/chats/:chatId', auth, async (req, res) => {
    try {
        const { chatId } = req.params;

        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        // Verify user is part of the chat
        if (!chat.participants.includes(req.user.userId)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Delete all messages in the chat
        await Message.deleteMany({ chat: chatId });

        // Delete the chat
        await Chat.findByIdAndDelete(chatId);

        res.json({ message: 'Chat deleted successfully' });
    } catch (error) {
        console.error('Error deleting chat:', error);
        res.status(500).json({ message: 'Error deleting chat' });
    }
});

// ============================================
// SOCKET.IO CONNECTION
// ============================================
io.on('connection', (socket) => {
    console.log('✅ User connected:', socket.id);

    // Join a chat room
    socket.on('join-chat', (chatId) => {
        socket.join(chatId);
        console.log(`User ${socket.id} joined chat ${chatId}`);
    });

    // Leave a chat room
    socket.on('leave-chat', (chatId) => {
        socket.leave(chatId);
        console.log(`User ${socket.id} left chat ${chatId}`);
    });

    // Send message to room
    socket.on('send-message', (message) => {
        io.to(message.chat).emit('receive-message', message);
    });

    // Typing indicator
    socket.on('typing', ({ chatId, isTyping }) => {
        socket.to(chatId).emit('user-typing', {
            userId: socket.userId,
            isTyping
        });
    });

    // User disconnect
    socket.on('disconnect', () => {
        console.log('❌ User disconnected:', socket.id);
    });
});

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

// 404 handler - Route not found
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Socket.IO ready for connections`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});