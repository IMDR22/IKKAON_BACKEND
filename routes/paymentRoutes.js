const express = require('express');
const verifyToken = require('../middlewares/middleWare.js');
const { createPayment, updatePaymentStatus, getPaymentByOrder } = require('../controllers/paymentController.js');

const router = express.Router();

router.post('/', verifyToken, createPayment); // create payment record
router.patch('/:payment_id/status', verifyToken, updatePaymentStatus); // update payment status
router.get('/order/:order_id', verifyToken, getPaymentByOrder); // get payment info by order

module.exports = router;
