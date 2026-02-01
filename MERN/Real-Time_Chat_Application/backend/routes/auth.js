// const express = require('express');
// const jwt = require('jsonwebtoken');
// const { body, validationResult } = require('express-validator');
// const User = require('../models/User');
// const authenticate = require('../middleware/auth');

// const router = express.Router();

// // Register
// router.post('/register',
//     [
//         body('username').trim().isLength({ min: 3, max: 30 }),
//         body('email').isEmail().normalizeEmail(),
//         body('password').isLength({ min: 6 })
//     ],
//     async (req, res) => {
//         try {
//             const errors = validationResult(req);
//             if (!errors.isEmpty()) {
//                 return res.status(400).json({ errors: errors.array() });
//             }

//             const { username, email, password } = req.body;

//             // Check if user already exists
//             const existingUser = await User.findOne({
//                 $or: [{ email }, { username }]
//             });

//             if (existingUser) {
//                 return res.status(400).json({
//                     error: existingUser.email === email
//                         ? 'Email already registered'
//                         : 'Username already taken'
//                 });
//             }

//             // Create user
//             const user = new User({
//                 username,
//                 email,
//                 password,
//                 avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
//             });

//             await user.save();

//             // Generate token
//             const token = jwt.sign(
//                 { userId: user._id },
//                 process.env.JWT_SECRET,
//                 { expiresIn: '7d' }
//             );

//             res.status(201).json({
//                 user: user.toPublicJSON(),
//                 token
//             });
//         } catch (error) {
//             console.error('Register error:', error);
//             res.status(500).json({ error: 'Server error during registration' });
//         }
//     }
// );

// // Login
// router.post('/login',
//     [
//         body('email').isEmail().normalizeEmail(),
//         body('password').exists()
//     ],
//     async (req, res) => {
//         try {
//             const errors = validationResult(req);
//             if (!errors.isEmpty()) {
//                 return res.status(400).json({ errors: errors.array() });
//             }

//             const { email, password } = req.body;

//             // Find user
//             const user = await User.findOne({ email });
//             if (!user) {
//                 return res.status(401).json({ error: 'Invalid credentials' });
//             }

//             // Check password
//             const isMatch = await user.comparePassword(password);
//             if (!isMatch) {
//                 return res.status(401).json({ error: 'Invalid credentials' });
//             }

//             // Update status
//             user.status = 'online';
//             await user.save();

//             // Generate token
//             const token = jwt.sign(
//                 { userId: user._id },
//                 process.env.JWT_SECRET,
//                 { expiresIn: '7d' }
//             );

//             res.json({
//                 user: user.toPublicJSON(),
//                 token
//             });
//         } catch (error) {
//             console.error('Login error:', error);
//             res.status(500).json({ error: 'Server error during login' });
//         }
//     }
// );

// // Get current user
// router.get('/me', authenticate, async (req, res) => {
//     try {
//         res.json({ user: req.user.toPublicJSON() });
//     } catch (error) {
//         res.status(500).json({ error: 'Server error' });
//     }
// });

// // Logout
// router.post('/logout', authenticate, async (req, res) => {
//     try {
//         req.user.status = 'offline';
//         req.user.lastSeen = new Date();
//         await req.user.save();

//         res.json({ message: 'Logged out successfully' });
//     } catch (error) {
//         res.status(500).json({ error: 'Server error' });
//     }
// });

// // Search users
// router.get('/users/search', authenticate, async (req, res) => {
//     try {
//         const { query } = req.query;

//         if (!query || query.length < 2) {
//             return res.status(400).json({ error: 'Search query too short' });
//         }

//         const users = await User.find({
//             $and: [
//                 { _id: { $ne: req.user._id } },
//                 {
//                     $or: [
//                         { username: { $regex: query, $options: 'i' } },
//                         { email: { $regex: query, $options: 'i' } }
//                     ]
//                 }
//             ]
//         })
//             .select('-password')
//             .limit(20);

//         res.json({ users: users.map(u => u.toPublicJSON()) });
//     } catch (error) {
//         res.status(500).json({ error: 'Server error' });
//     }
// });

// // Update profile
// router.patch('/profile', authenticate,
//     [
//         body('bio').optional().isLength({ max: 200 }),
//         body('avatar').optional().isURL()
//     ],
//     async (req, res) => {
//         try {
//             const errors = validationResult(req);
//             if (!errors.isEmpty()) {
//                 return res.status(400).json({ errors: errors.array() });
//             }

//             const updates = {};
//             if (req.body.bio !== undefined) updates.bio = req.body.bio;
//             if (req.body.avatar !== undefined) updates.avatar = req.body.avatar;

//             Object.assign(req.user, updates);
//             await req.user.save();

//             res.json({ user: req.user.toPublicJSON() });
//         } catch (error) {
//             res.status(500).json({ error: 'Server error' });
//         }
//     }
// );

// module.exports = router;


const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const authenticate = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register',
    [
        body('username').trim().isLength({ min: 3, max: 30 }),
        body('email').isEmail().normalizeEmail(),
        body('password').isLength({ min: 6 })
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { username, email, password } = req.body;

            // Check if user already exists
            const existingUser = await User.findOne({
                $or: [{ email }, { username }]
            });

            if (existingUser) {
                return res.status(400).json({
                    error: existingUser.email === email
                        ? 'Email already registered'
                        : 'Username already taken'
                });
            }

            // Create user
            const user = new User({
                username,
                email,
                password,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
            });

            await user.save();

            // Generate token
            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.status(201).json({
                user: user.toPublicJSON(),
                token
            });
        } catch (error) {
            console.error('Register error:', error);
            res.status(500).json({ error: 'Server error during registration' });
        }
    }
);

// Login
router.post('/login',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').exists()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password } = req.body;

            // Find user
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Check password
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Update status
            user.status = 'online';
            await user.save();

            // Generate token
            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.json({
                user: user.toPublicJSON(),
                token
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Server error during login' });
        }
    }
);

// Get current user
router.get('/me', authenticate, async (req, res) => {
    try {
        res.json({ user: req.user.toPublicJSON() });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Logout
router.post('/logout', authenticate, async (req, res) => {
    try {
        req.user.status = 'offline';
        req.user.lastSeen = new Date();
        await req.user.save();

        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Search users
router.get('/users/search', authenticate, async (req, res) => {
    try {
        const { query } = req.query;

        if (!query || query.length < 2) {
            return res.status(400).json({ error: 'Search query too short' });
        }

        const users = await User.find({
            $and: [
                { _id: { $ne: req.user._id } },
                {
                    $or: [
                        { username: { $regex: query, $options: 'i' } },
                        { email: { $regex: query, $options: 'i' } }
                    ]
                }
            ]
        })
            .select('-password')
            .limit(20);

        res.json({ users: users.map(u => u.toPublicJSON()) });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Update profile
router.patch('/profile', authenticate,
    [
        body('bio').optional().isLength({ max: 200 }),
        body('avatar').optional().isURL()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const updates = {};
            if (req.body.bio !== undefined) updates.bio = req.body.bio;
            if (req.body.avatar !== undefined) updates.avatar = req.body.avatar;

            Object.assign(req.user, updates);
            await req.user.save();

            res.json({ user: req.user.toPublicJSON() });
        } catch (error) {
            res.status(500).json({ error: 'Server error' });
        }
    }
);

// Block user
router.post('/block/:userId', authenticate, async (req, res) => {
    try {
        const { userId } = req.params;

        if (userId === req.user._id.toString()) {
            return res.status(400).json({ error: 'Cannot block yourself' });
        }

        if (!req.user.blockedUsers.includes(userId)) {
            req.user.blockedUsers.push(userId);
            await req.user.save();
        }

        res.json({
            message: 'User blocked successfully',
            blockedUsers: req.user.blockedUsers
        });
    } catch (error) {
        console.error('Block user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Unblock user
router.post('/unblock/:userId', authenticate, async (req, res) => {
    try {
        const { userId } = req.params;

        req.user.blockedUsers = req.user.blockedUsers.filter(
            id => id.toString() !== userId
        );
        await req.user.save();

        res.json({
            message: 'User unblocked successfully',
            blockedUsers: req.user.blockedUsers
        });
    } catch (error) {
        console.error('Unblock user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;