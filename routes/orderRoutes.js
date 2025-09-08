const express = require('express');
const verifyToken = require('../middlewares/middleWare.js');
const { createOrder, getOrders, getOrderDetails, updateOrderStatus } = require('../controllers/ordersController.js');

const router = express.Router();

// Place an order
router.post('/', verifyToken, createOrder);

// Get all orders for logged-in user
router.get('/', verifyToken, getOrders);

// Get order details by order_id
router.get('/:id', verifyToken, getOrderDetails);

// Update order status (admin/user)
router.patch('/:order_id/status', verifyToken, updateOrderStatus);

module.exports = router;
