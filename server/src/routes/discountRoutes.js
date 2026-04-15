const express = require('express');
const router = express.Router({ mergeParams: true });

const authMiddleware = require('../middlewares/authMiddleware');
const {
  listDiscountsForStore,
  createDiscountDraft,
  previewProfitability,
  finalizeDiscount,
  setDiscountActive,
  deleteDiscount,
  publishDiscountsForStore,
} = require('../controllers/discountController');

// @route   GET /api/stores/:storeId/discounts
// @desc    List discounts for a store
// @access  Private
router.get('/', authMiddleware, listDiscountsForStore);

// @route   POST /api/stores/:storeId/discounts
// @desc    Create a discount draft (scope/type/audience)
// @access  Private
router.post('/', authMiddleware, createDiscountDraft);
// @route   POST /api/stores/:storeId/discounts/:discountId/profitability/preview
// @desc    Preview profitability for a discount
// @access  Private
router.post('/:discountId/profitability/preview', authMiddleware, previewProfitability);

// @route   POST /api/stores/:storeId/discounts/publish
// @desc    Publish discount changes for a store
// @access  Private
router.post('/publish', authMiddleware, publishDiscountsForStore);

// @route   POST /api/stores/:storeId/discounts/:discountId/finalize
// @desc    Finalize discount details
// @access  Private
router.post('/:discountId/finalize', authMiddleware, finalizeDiscount);

// @route   PATCH /api/stores/:storeId/discounts/:discountId/active
// @desc    Set discount active state
// @access  Private
router.patch('/:discountId/active', authMiddleware, setDiscountActive);

// @route   DELETE /api/stores/:storeId/discounts/:discountId
// @desc    Delete a discount
// @access  Private
router.delete('/:discountId', authMiddleware, deleteDiscount);

module.exports = router;
