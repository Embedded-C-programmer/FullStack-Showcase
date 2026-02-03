const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  confirmPayment,
  cancelOrder,
  getVendorStats
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/vendor/stats', authorize('vendor'), getVendorStats);
router.get('/:id', getOrder);
router.put('/:id/payment', confirmPayment);
router.put('/:id/cancel', cancelOrder);
router.put(
  '/:id/status',
  authorize('vendor', 'admin'),
  updateOrderStatus
);

module.exports = router;