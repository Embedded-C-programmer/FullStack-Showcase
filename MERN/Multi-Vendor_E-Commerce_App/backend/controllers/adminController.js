const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const skip = (page - 1) * limit;

        const filter = {};
        if (req.query.role) {
            filter.role = req.query.role;
        }

        const users = await User.find(filter)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments(filter);

        res.status(200).json({
            success: true,
            count: users.length,
            total,
            pages: Math.ceil(total / limit),
            data: users
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
exports.getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res, next) => {
    try {
        const fieldsToUpdate = {
            name: req.body.name,
            email: req.body.email,
            role: req.body.role,
            isActive: req.body.isActive
        };

        const user = await User.findByIdAndUpdate(
            req.params.id,
            fieldsToUpdate,
            {
                new: true,
                runValidators: true
            }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await user.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Approve vendor
// @route   PUT /api/admin/vendors/:id/approve
// @access  Private (Admin)
exports.approveVendor = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.role !== 'vendor') {
            return res.status(400).json({
                success: false,
                message: 'User is not a vendor'
            });
        }

        user.vendorInfo.isApproved = true;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Vendor approved',
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get pending vendors
// @route   GET /api/admin/vendors/pending
// @access  Private (Admin)
exports.getPendingVendors = async (req, res, next) => {
    try {
        const vendors = await User.find({
            role: 'vendor',
            'vendorInfo.isApproved': false
        }).select('-password');

        res.status(200).json({
            success: true,
            count: vendors.length,
            data: vendors
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update product status
// @route   PUT /api/admin/products/:id/status
// @access  Private (Admin)
exports.updateProductStatus = async (req, res, next) => {
    try {
        const { isActive, isFeatured } = req.body;

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { isActive, isFeatured },
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getDashboardStats = async (req, res, next) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalVendors = await User.countDocuments({ role: 'vendor' });
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();

        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name email')
            .select('orderNumber status pricing createdAt');

        // Calculate total revenue
        const orders = await Order.find({ 'paymentInfo.status': 'succeeded' });
        const totalRevenue = orders.reduce((sum, order) => sum + order.pricing.total, 0);

        // Get monthly revenue
        const currentMonth = new Date();
        currentMonth.setDate(1);
        currentMonth.setHours(0, 0, 0, 0);

        const monthlyOrders = await Order.find({
            'paymentInfo.status': 'succeeded',
            createdAt: { $gte: currentMonth }
        });

        const monthlyRevenue = monthlyOrders.reduce(
            (sum, order) => sum + order.pricing.total,
            0
        );

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalUsers,
                    totalVendors,
                    totalProducts,
                    totalOrders,
                    totalRevenue: totalRevenue.toFixed(2),
                    monthlyRevenue: monthlyRevenue.toFixed(2)
                },
                recentOrders
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update vendor commission
// @route   PUT /api/admin/vendors/:id/commission
// @access  Private (Admin)
exports.updateVendorCommission = async (req, res, next) => {
    try {
        const { commission } = req.body;

        if (commission < 0 || commission > 100) {
            return res.status(400).json({
                success: false,
                message: 'Commission must be between 0 and 100'
            });
        }

        const user = await User.findById(req.params.id);

        if (!user || user.role !== 'vendor') {
            return res.status(404).json({
                success: false,
                message: 'Vendor not found'
            });
        }

        user.vendorInfo.commission = commission;
        await user.save();

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};