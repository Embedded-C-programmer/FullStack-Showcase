const User = require('../models/User');
const OTP = require('../models/OTP');
const crypto = require('crypto');

// Generate 4-digit OTP
const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

// @desc    Request password reset OTP
// @route   POST /api/auth/forgot-password
// @access  Public
exports.requestPasswordReset = async (req, res, next) => {
    try {
        const { email } = req.body;

        // Check if user exists
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No account found with this email address'
            });
        }

        // Generate 4-digit OTP
        const otp = generateOTP();

        // Delete any existing OTPs for this email
        await OTP.deleteMany({ email: email.toLowerCase() });

        // Create new OTP
        await OTP.create({
            email: email.toLowerCase(),
            otp: otp
        });

        // TODO: Send email with OTP (For now, just return it in response for testing)
        // In production, use nodemailer or similar to send email
        console.log(`OTP for ${email}: ${otp}`);

        res.status(200).json({
            success: true,
            message: 'OTP sent to your email address',
            // Remove this in production!
            otp: otp  // Only for development/testing
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        // Find the most recent OTP for this email
        const otpRecord = await OTP.findOne({
            email: email.toLowerCase(),
            otp: otp,
            verified: false
        }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        // Mark OTP as verified
        otpRecord.verified = true;
        await otpRecord.save();

        // Generate temporary token for password reset
        const resetToken = crypto.randomBytes(32).toString('hex');

        res.status(200).json({
            success: true,
            message: 'OTP verified successfully',
            resetToken: resetToken,
            email: email
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res, next) => {
    try {
        const { email, resetToken, newPassword } = req.body;

        // Verify OTP was verified
        const otpRecord = await OTP.findOne({
            email: email.toLowerCase(),
            verified: true
        }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: 'Invalid password reset request'
            });
        }

        // Find user and update password
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update password (will be hashed by pre-save hook)
        user.password = newPassword;
        await user.save();

        // Delete used OTP
        await OTP.deleteMany({ email: email.toLowerCase() });

        res.status(200).json({
            success: true,
            message: 'Password reset successfully. Please login with your new password.'
        });
    } catch (error) {
        next(error);
    }
};