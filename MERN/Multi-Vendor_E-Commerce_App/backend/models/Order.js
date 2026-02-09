const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true
    },
    image: String,
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
        default: 'pending'
    },
    vendorPayout: {
        amount: Number,
        platformCommission: Number,
        status: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed'],
            default: 'pending'
        },
        paidAt: Date
    }
});

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true,
        sparse: true,
        default: function () {
            return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        }
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [orderItemSchema],
    shippingAddress: {
        fullName: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        zipCode: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true,
            default: 'USA'
        }
    },
    paymentInfo: {
        method: {
            type: String,
            enum: ['stripe', 'card', 'upi', 'netbanking', 'qr', 'cod'],
            required: true
        },
        stripePaymentIntentId: String,
        status: {
            type: String,
            enum: ['pending', 'processing', 'succeeded', 'failed', 'refunded'],
            default: 'pending'
        },
        paidAt: Date
    },
    pricing: {
        subtotal: {
            type: Number,
            required: true
        },
        shipping: {
            type: Number,
            default: 0
        },
        tax: {
            type: Number,
            default: 0
        },
        total: {
            type: Number,
            required: true
        }
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
        default: 'pending'
    },
    trackingNumber: String,
    deliveredAt: Date,
    cancelledAt: Date,
    cancellationReason: String,
    notes: String
}, {
    timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', function () {
    if (!this.orderNumber) {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substr(2, 5).toUpperCase();
        this.orderNumber = `ORD-${timestamp}-${random}`;
    }
});

// Update order status based on items
orderSchema.methods.updateOrderStatus = function () {
    const itemStatuses = this.items.map(item => item.status);

    if (itemStatuses.every(status => status === 'delivered')) {
        this.status = 'delivered';
        this.deliveredAt = new Date();
    } else if (itemStatuses.every(status => status === 'cancelled')) {
        this.status = 'cancelled';
    } else if (itemStatuses.some(status => status === 'shipped')) {
        this.status = 'processing';
    }
};

// Indexes for performance
// Indexes
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 }, { unique: true, sparse: true });
orderSchema.index({ 'items.vendor': 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);