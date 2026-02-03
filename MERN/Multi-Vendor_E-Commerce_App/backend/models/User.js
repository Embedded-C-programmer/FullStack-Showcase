const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'vendor', 'admin'],
        default: 'user'
    },
    phone: {
        type: String,
        maxlength: [20, 'Phone number cannot be longer than 20 characters']
    },
    avatar: {
        type: String,
        default: 'default-avatar.jpg'
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // Vendor-specific fields
    vendorInfo: {
        businessName: {
            type: String,
            trim: true
        },
        businessDescription: String,
        businessLogo: String,
        businessAddress: {
            street: String,
            city: String,
            state: String,
            zipCode: String,
            country: String
        },
        stripeAccountId: String,
        commission: {
            type: Number,
            default: 10, // Platform commission percentage
            min: 0,
            max: 100
        },
        isApproved: {
            type: Boolean,
            default: false
        },
        rating: {
            average: {
                type: Number,
                default: 0,
                min: 0,
                max: 5
            },
            count: {
                type: Number,
                default: 0
            }
        }
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Encrypt password before saving
// userSchema.pre('save', async function (next) {
//     if (!this.isModified('password')) {
//         next();
//     }

//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
// });


userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});


// Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Initialize vendor info for vendors
// userSchema.pre('save', function (next) {
//     if (this.role === 'vendor' && !this.vendorInfo) {
//         this.vendorInfo = {
//             isApproved: false,
//             commission: 10,
//             rating: {
//                 average: 0,
//                 count: 0
//             }
//         };
//     }
//     next();
// });


userSchema.pre('save', async function () {
    if (this.role === 'vendor' && !this.vendorInfo) {
        this.vendorInfo = {
            isApproved: false,
            commission: 10,
            rating: {
                average: 0,
                count: 0
            }
        };
    }
});


module.exports = mongoose.model('User', userSchema);