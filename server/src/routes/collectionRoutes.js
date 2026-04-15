const express = require('express');
const router = express.Router({ mergeParams: true });

const authMiddleware = require('../middlewares/authMiddleware');
const {
  getCollectionsForStore,
  createCollectionForStore,
  updateCollectionForStore,
  deleteCollectionForStore,
  setCampaignsForCollection,
  removeCampaignFromCollection,
  publishCollectionsForStore,
} = require('../controllers/collectionController');

// @route   GET /api/stores/:storeId/collections
// @desc    List collections for a store
// @access  Private
router.get('/', authMiddleware, getCollectionsForStore);

// @route   POST /api/stores/:storeId/collections
// @desc    Create a collection in a store
// @access  Private
router.post('/', authMiddleware, createCollectionForStore);

// @route   POST /api/stores/:storeId/collections/publish
// @desc    Publish collection changes for a store
// @access  Private
router.post('/publish', authMiddleware, publishCollectionsForStore);

// @route   PUT /api/stores/:storeId/collections/:collectionId/campaigns
// @desc    Replace campaigns assigned to a collection
// @access  Private
router.put('/:collectionId/campaigns', authMiddleware, setCampaignsForCollection);

// @route   DELETE /api/stores/:storeId/collections/:collectionId/campaigns/:campaignId
// @desc    Remove a campaign from a collection
// @access  Private
router.delete('/:collectionId/campaigns/:campaignId', authMiddleware, removeCampaignFromCollection);

// @route   PUT /api/stores/:storeId/collections/:collectionId
// @desc    Update a collection
// @access  Private
router.put('/:collectionId', authMiddleware, updateCollectionForStore);

// @route   DELETE /api/stores/:storeId/collections/:collectionId
// @desc    Delete a collection
// @access  Private
router.delete('/:collectionId', authMiddleware, deleteCollectionForStore);

module.exports = router;
