const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// @route   GET /api/user/profile
// @desc    Get user profile and settings
// @access  Private
router.get('/profile', authMiddleware, getProfile);

// @route   PUT /api/user/profile
// @desc    Update user profile and settings
// @access  Private
router.put('/profile', authMiddleware, updateProfile);

module.exports = router;
