const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
    try {
        const { items, shippingAddress, paymentMethod } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No order items'
            });
        }

        // Verify products and calculate totals
        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.product);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product not found: ${item.product}`
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}`
                });
            }

            const itemTotal = product.price * item.quantity;
            subtotal += itemTotal;

            // Calculate vendor payout
            const vendor = await product.populate('vendor');
            const commission = vendor.vendor.vendorInfo.commission || 10;
            const platformCommission = (itemTotal * commission) / 100;
            const vendorPayout = itemTotal - platformCommission;

            orderItems.push({
                product: product._id,
                vendor: product.vendor,
                name: product.name,
                quantity: item.quantity,
                price: product.price,
                image: product.images[0]?.url,
                vendorPayout: {
                    amount: vendorPayout,
                    platformCommission: platformCommission
                }
            });
        }

        // Calculate shipping and tax
        const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
        const tax = subtotal * 0.08; // 8% tax
        const total = subtotal + shipping + tax;

        // Create order without Stripe (for demo purposes)
        const order = await Order.create({
            user: req.user.id,
            items: orderItems,
            shippingAddress,
            paymentInfo: {
                method: paymentMethod || 'cash_on_delivery',
                status: 'pending'
            },
            pricing: {
                subtotal,
                shipping,
                tax,
                total
            }
        });

        res.status(201).json({
            success: true,
            data: order,
            message: 'Order created successfully! Payment will be collected on delivery.'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        let filter = {};

        // Users see only their orders
        if (req.user.role === 'user') {
            filter.user = req.user.id;
        }

        // Vendors see orders containing their products
        if (req.user.role === 'vendor') {
            filter['items.vendor'] = req.user.id;
        }

        const orders = await Order.find(filter)
            .populate('user', 'name email')
            .populate('items.product', 'name images')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Order.countDocuments(filter);

        res.status(200).json({
            success: true,
            count: orders.length,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page,
            data: orders
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email phone')
            .populate('items.product', 'name images')
            .populate('items.vendor', 'name vendorInfo.businessName');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Make sure user is order owner, vendor, or admin
        const isOwner = order.user._id.toString() === req.user.id;
        const isVendor = req.user.role === 'vendor' &&
            order.items.some(item => item.vendor._id.toString() === req.user.id);
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isVendor && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this order'
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Vendor/Admin)
exports.updateOrderStatus = async (req, res, next) => {
    try {
        const { status, itemId } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Find the item to update
        const item = order.items.id(itemId);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Order item not found'
            });
        }

        // Check authorization
        if (req.user.role === 'vendor' && item.vendor.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this order item'
            });
        }

        // Update item status
        item.status = status;

        // Update product stock if delivered
        if (status === 'delivered') {
            const product = await Product.findById(item.product);
            if (product) {
                product.stock -= item.quantity;
                product.sold += item.quantity;
                await product.save();
            }
        }

        // Update overall order status
        order.updateOrderStatus();

        await order.save();

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Confirm payment
// @route   PUT /api/orders/:id/payment
// @access  Private
exports.confirmPayment = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Verify user owns this order
        if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // Auto-confirm payment for demo purposes
        order.paymentInfo.status = 'succeeded';
        order.paymentInfo.paidAt = Date.now();
        order.status = 'confirmed';

        // Update item statuses
        order.items.forEach(item => {
            item.status = 'confirmed';
        });

        // Clear user's cart
        await Cart.findOneAndUpdate(
            { user: req.user.id },
            { items: [], totalAmount: 0 }
        );

        await order.save();

        res.status(200).json({
            success: true,
            message: 'Payment confirmed',
            data: order
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check authorization
        if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this order'
            });
        }

        // Can only cancel pending or confirmed orders
        if (!['pending', 'confirmed'].includes(order.status)) {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel order at this stage'
            });
        }

        order.status = 'cancelled';
        order.cancelledAt = Date.now();
        order.cancellationReason = req.body.reason;

        // Update all items
        order.items.forEach(item => {
            item.status = 'cancelled';
        });

        // Mark as refunded if payment was made
        if (order.paymentInfo.status === 'succeeded') {
            order.paymentInfo.status = 'refunded';
        }

        await order.save();

        res.status(200).json({
            success: true,
            message: 'Order cancelled',
            data: order
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get vendor statistics
// @route   GET /api/orders/vendor/stats
// @access  Private (Vendor)
exports.getVendorStats = async (req, res, next) => {
    try {
        const orders = await Order.find({
            'items.vendor': req.user.id,
            'paymentInfo.status': 'succeeded'
        });

        let totalRevenue = 0;
        let totalOrders = 0;
        let totalProducts = 0;

        orders.forEach(order => {
            order.items.forEach(item => {
                if (item.vendor.toString() === req.user.id) {
                    totalRevenue += item.vendorPayout.amount;
                    totalProducts += item.quantity;
                }
            });
            totalOrders++;
        });

        res.status(200).json({
            success: true,
            data: {
                totalRevenue: totalRevenue.toFixed(2),
                totalOrders,
                totalProducts,
                averageOrderValue: totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0
            }
        });
    } catch (error) {
        next(error);
    }
};