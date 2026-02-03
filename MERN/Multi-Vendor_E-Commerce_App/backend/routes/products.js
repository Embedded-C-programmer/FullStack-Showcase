const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    getMyProducts,
    addReview,
    getFeaturedProducts
} = require('../controllers/productController');
const { protect, authorize, checkVendorApproval } = require('../middleware/auth');

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:id', getProduct);

// Protected routes
router.post(
    '/',
    protect,
    authorize('vendor', 'admin'),
    checkVendorApproval,
    createProduct
);

router.put(
    '/:id',
    protect,
    authorize('vendor', 'admin'),
    updateProduct
);

router.delete(
    '/:id',
    protect,
    authorize('vendor', 'admin'),
    deleteProduct
);

router.get(
    '/vendor/my-products',
    protect,
    authorize('vendor'),
    getMyProducts
);

router.post('/:id/reviews', protect, addReview);

module.exports = router;