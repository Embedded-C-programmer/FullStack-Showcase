const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = async (req, res, next) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.user.id })
            .populate({
                path: 'products',
                select: 'name price images stock vendor rating',
                populate: {
                    path: 'vendor',
                    select: 'name vendorInfo.businessName'
                }
            });

        if (!wishlist) {
            wishlist = await Wishlist.create({ user: req.user.id, products: [] });
        }

        res.status(200).json({
            success: true,
            data: wishlist
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
exports.addToWishlist = async (req, res, next) => {
    try {
        const { productId } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        let wishlist = await Wishlist.findOne({ user: req.user.id });

        if (!wishlist) {
            wishlist = await Wishlist.create({
                user: req.user.id,
                products: [productId]
            });
        } else {
            if (wishlist.products.includes(productId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Product already in wishlist'
                });
            }
            wishlist.products.push(productId);
            await wishlist.save();
        }

        await wishlist.populate({
            path: 'products',
            select: 'name price images stock vendor rating',
            populate: {
                path: 'vendor',
                select: 'name vendorInfo.businessName'
            }
        });

        res.status(200).json({
            success: true,
            data: wishlist
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
exports.removeFromWishlist = async (req, res, next) => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.user.id });

        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: 'Wishlist not found'
            });
        }

        wishlist.products = wishlist.products.filter(
            id => id.toString() !== req.params.productId
        );

        await wishlist.save();

        await wishlist.populate({
            path: 'products',
            select: 'name price images stock vendor rating',
            populate: {
                path: 'vendor',
                select: 'name vendorInfo.businessName'
            }
        });

        res.status(200).json({
            success: true,
            data: wishlist
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Clear wishlist
// @route   DELETE /api/wishlist
// @access  Private
exports.clearWishlist = async (req, res, next) => {
    try {
        const wishlist = await Wishlist.findOneAndUpdate(
            { user: req.user.id },
            { products: [] },
            { new: true }
        );

        res.status(200).json({
            success: true,
            data: wishlist
        });
    } catch (error) {
        next(error);
    }
};