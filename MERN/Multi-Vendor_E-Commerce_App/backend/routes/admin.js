const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getUser,
    updateUser,
    deleteUser,
    approveVendor,
    getPendingVendors,
    updateProductStatus,
    getDashboardStats,
    updateVendorCommission
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected and admin-only
router.use(protect);
router.use(authorize('admin'));

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Vendor management
router.get('/vendors/pending', getPendingVendors);
router.put('/vendors/:id/approve', approveVendor);
router.put('/vendors/:id/commission', updateVendorCommission);

// Product management
router.put('/products/:id/status', updateProductStatus);

// Dashboard stats
router.get('/stats', getDashboardStats);

module.exports = router;