/**
 * Calculates the discounted price based on the active discount configuration.
 * 
 * @param {number} originalPrice - The original retail price.
 * @param {object} discount - The active discount object.
 * @returns {number} The discounted price, rounded to 2 decimal places.
 */
export const calculateDiscountedPrice = (originalPrice, discount) => {
  if (!discount || !originalPrice || originalPrice <= 0) {
    return originalPrice;
  }

  const { type, percentOff, fixedAmount } = discount;

  let finalPrice = originalPrice;

  if (type === "PERCENT_OFF" && percentOff) {
    const multiplier = (100 - Number(percentOff)) / 100;
    finalPrice = originalPrice * multiplier;
  } else if (type === "FIXED_AMOUNT" && fixedAmount) {
    finalPrice = originalPrice - Number(fixedAmount);
  }

  // Ensure price doesn't go below 0
  finalPrice = Math.max(0, finalPrice);

  // Round to 2 decimal places
  return Math.round((finalPrice + Number.EPSILON) * 100) / 100;
};

/**
 * Checks if a discount is applicable to a specific campaign or product.
 * 
 * @param {object} discount - The discount object.
 * @param {string|number} targetCampaignId - The ID of the campaign being viewed.
 * @returns {boolean} True if the discount applies.
 */
export const isDiscountApplicable = (discount, targetCampaignId) => {
  if (!discount || !discount.isActive || discount.status !== "READY") {
    return false;
  }

  // Store-wide discounts apply to everything
  if (discount.scope === "STOREWIDE") {
    return true;
  }

  // Campaign-specific discounts only apply if IDs match
  if (discount.scope === "CAMPAIGN" && discount.campaignId && targetCampaignId) {
    return String(discount.campaignId) === String(targetCampaignId);
  }

  return false;
};

/**
 * Format price to currency string
 */
export const formatPrice = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};
