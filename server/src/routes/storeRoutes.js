const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const { getStores, createStore, deleteStore, updateStore } = require('../controllers/storeController');
const {
	getStoreSettings,
	updateStoreSettings,
	uploadStoreBranding,
	removeStoreBranding,
	getUploadsDir,
	getAllowedExtensionsForAsset,
	getBrandingFieldForAsset,
} = require('../controllers/storeSettingsController');
const authMiddleware = require('../middlewares/authMiddleware');

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, getUploadsDir());
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		cb(null, uniqueSuffix + path.extname(file.originalname));
	},
});

const upload = multer({
	storage,
	fileFilter: (req, file, cb) => {
		const asset = typeof req.params.asset === 'string' ? req.params.asset.trim().toLowerCase() : '';
		const field = getBrandingFieldForAsset(asset);
		if (!field) return cb(new Error('Invalid branding asset'));

		const ext = path.extname(file.originalname || '').toLowerCase();
		const allowed = getAllowedExtensionsForAsset(asset);
		if (!allowed.has(ext)) return cb(new Error('Invalid file type'));
		return cb(null, true);
	},
});

// @route   GET /api/stores
// @desc    Get all stores for the logged-in user
// @access  Private
router.get('/', authMiddleware, getStores);

// @route   POST /api/stores
// @desc    Create a new store
// @access  Private
router.post('/', authMiddleware, createStore);

// @route   PUT /api/stores/:id
// @desc    Update store name
// @access  Private
router.put('/:id', authMiddleware, updateStore);

// @route   DELETE /api/stores/:id
// @desc    Delete/Disconnect a store
// @access  Private
router.delete('/:id', authMiddleware, deleteStore);

// @route   GET /api/stores/:id/settings
// @desc    Get store settings
// @access  Private
router.get('/:id/settings', authMiddleware, getStoreSettings);

// @route   PUT /api/stores/:id/settings
// @desc    Update store settings
// @access  Private
router.put('/:id/settings', authMiddleware, updateStoreSettings);

// @route   POST /api/stores/:id/branding/:asset
// @desc    Upload branding asset (logo|banner|favicon)
// @access  Private
router.post('/:id/branding/:asset', authMiddleware, upload.single('file'), uploadStoreBranding);

// @route   DELETE /api/stores/:id/branding/:asset
// @desc    Remove branding asset (logo|banner|favicon)
// @access  Private
router.delete('/:id/branding/:asset', authMiddleware, removeStoreBranding);

module.exports = router;
