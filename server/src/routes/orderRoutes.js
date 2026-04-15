const express = require('express');
const router = express.Router();
const { getOrders, getOrderById } = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, getOrders);
router.get('/:id', authMiddleware, getOrderById);

module.exports = router;
