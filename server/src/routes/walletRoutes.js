const express = require('express');
const router = express.Router();
const { getWallet, getTransactions } = require('../controllers/walletController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/balance', authMiddleware, getWallet);
router.get('/transactions', authMiddleware, getTransactions);

module.exports = router;
