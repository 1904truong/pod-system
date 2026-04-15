const express = require('express');
const router = express.Router();
const { getCampaigns, createCampaign, deleteCampaign } = require('../controllers/campaignController');
const authMiddleware = require('../middlewares/authMiddleware');

// @route   GET /api/campaigns
// @desc    Get all campaigns for the logged-in user
// @access  Private
router.get('/', authMiddleware, getCampaigns);

// @route   POST /api/campaigns
// @desc    Create a new campaign
// @access  Private
router.post('/', authMiddleware, createCampaign);

// @route   DELETE /api/campaigns/:id
// @desc    Delete a campaign
// @access  Private
router.delete('/:id', authMiddleware, deleteCampaign);

module.exports = router;
