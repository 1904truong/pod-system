const express = require('express');
const router = express.Router();

const {
	getPublishedActiveDiscountsByStoreUrl,
	getPublicStoreSettingsByStoreUrl,
	getPublishedStorefrontCampaignsByStoreUrl,
} = require('../controllers/publicStoreController');

// @route   GET /api/public/stores/:storeUrl/discounts
// @desc    Get active, published discounts for storefront
// @access  Public
router.get('/stores/:storeUrl/discounts', getPublishedActiveDiscountsByStoreUrl);

// @route   GET /api/public/stores/:storeUrl/settings
// @desc    Get public store settings for storefront
// @access  Public
router.get('/stores/:storeUrl/settings', getPublicStoreSettingsByStoreUrl);

// @route   GET /api/public/stores/:storeUrl/campaigns
// @desc    Get published campaigns for storefront
// @access  Public
router.get('/stores/:storeUrl/campaigns', getPublishedStorefrontCampaignsByStoreUrl);

module.exports = router;
