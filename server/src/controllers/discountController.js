const prisma = require('../utils/prisma');

const validateId = (value) => { return (typeof value === "string" && value.length > 0) ? value : null; };

const toNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const normalizePromoCode = (value) => {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!raw) return '';
  return raw.replace(/\s+/g, '').toUpperCase();
};

const isValidPromoCode = (value) => /^[A-Z0-9_-]{3,64}$/.test(String(value || ''));

const ALLOWED_REGIONS = ['EUROPE', 'NORTH_AMERICA', 'OCEANIA'];

const parseRegions = (value) => {
  const raw = Array.isArray(value) ? value : [];
  const cleaned = raw
    .map((v) => String(v || '').trim().toUpperCase())
    .filter(Boolean)
    .filter((v) => ALLOWED_REGIONS.includes(v));
  return Array.from(new Set(cleaned));
};

const parseShippingCountries = (value) => {
  if (!value || typeof value !== 'object') return null;
  const out = {};
  for (const regionKey of Object.keys(value)) {
    const region = String(regionKey || '').trim().toUpperCase();
    if (!ALLOWED_REGIONS.includes(region)) continue;
    const raw = value[regionKey];
    if (!Array.isArray(raw)) continue;
    const cleaned = raw
      .map((v) => String(v || '').trim().toUpperCase())
      .filter(Boolean);
    out[region] = Array.from(new Set(cleaned));
  }
  return Object.keys(out).length > 0 ? out : {};
};

const DEFAULT_FREE_SHIPPING_FEE = Number(process.env.DEFAULT_FREE_SHIPPING_FEE || 4.99);

const sizeSurchargeBySize = (sizeValue) => {
  const size = String(sizeValue || '').trim().toUpperCase().replace(/\s+/g, '');
  if (!size) return 0;
  if (size === '3XL') return 1.5;
  if (size === '4XL') return 2.5;
  if (size === '5XL') return 3;
  return 0;
};

const REGIONAL_PRICING_TEMPLATE = [
  { destination: "UNITED STATES",   code: "US", ratioS: 4.99 / 7.98 },
  { destination: "EUROPEAN UNION",  code: "EU", ratioS: 6.99 / 7.98 },
  { destination: "UNITED KINGDOM",  code: "GB", ratioS: 6.99 / 7.98 },
  { destination: "CANADA",          code: "CA", ratioS: 8.99 / 7.98 },
  { destination: "OCEANIA",         code: "OC", ratioS: 12.99 / 7.98 },
  { destination: "GERMANY",         code: "DE", ratioS: 6.99 / 7.98 },
  { destination: "FRANCE",          code: "FR", ratioS: 6.99 / 7.98 },
  { destination: "SPAIN",           code: "ES", ratioS: 6.99 / 7.98 },
];

const getRegionMaxShipping = (productBasePrice, selectedRegions, selectedCountries) => {
  // Logic: shipping first product = (basePrice + 1.0) * ratioS
  // For a standard $6.98 shirt, baseWeight-fee is 7.98.
  const baseShipping = Number(productBasePrice || 6.98) + 1.0;
  
  // Standard regions mapping from frontend
  const regionToCodes = {
    'NORTH_AMERICA': ['US', 'CA'],
    'EUROPE': ['EU', 'GB', 'DE', 'FR', 'ES', 'BE', 'NL', 'SE'],
    'OCEANIA': ['OC', 'AU', 'NZ'],
  };

  let activeCodes = new Set();
  
  // 1. Add codes from selected regions
  if (Array.isArray(selectedRegions)) {
    selectedRegions.forEach(r => {
      const normalizedRegion = String(r || '').toUpperCase().replace(/\s+/g, '_');
      const codes = regionToCodes[normalizedRegion] || [];
      codes.forEach(c => activeCodes.add(c));
    });
  }
  
  // 2. Add specific selected countries (if any)
  if (selectedCountries && typeof selectedCountries === 'object') {
     Object.values(selectedCountries).forEach(countryList => {
       if (Array.isArray(countryList)) {
         countryList.forEach(cty => activeCodes.add(cty.toUpperCase()));
       }
     });
  }

  // If nothing selected, assume US as fallback
  if (activeCodes.size === 0) activeCodes.add('US');

  // Find max ship fee among active codes
  let maxFee = 0;
  activeCodes.forEach(code => {
    // Try to find exact match or regional fallback
    let row = REGIONAL_PRICING_TEMPLATE.find(t => t.code === code);
    
    // Fallback for specific country codes not in template but in region mapping
    if (!row) {
      if (['AU', 'NZ'].includes(code)) row = REGIONAL_PRICING_TEMPLATE.find(t => t.code === 'OC');
      if (['BE', 'NL', 'SE'].includes(code)) row = REGIONAL_PRICING_TEMPLATE.find(t => t.code === 'EU');
    }

    if (row) {
      const fee = baseShipping * row.ratioS;
      if (fee > maxFee) maxFee = fee;
    } else if (code === 'US') {
      const fee = baseShipping * (4.99 / 7.98);
      if (fee > maxFee) maxFee = fee;
    } else {
      // Last resort: assume rest of world/oceania pricing for unknown codes
      const fee = baseShipping * (12.99 / 7.98);
      if (fee > maxFee) maxFee = fee;
    }
  });

  return maxFee || baseShipping;
};

const roundMoney = (value) => {
  if (!Number.isFinite(value)) return null;
  return Math.round((value + Number.EPSILON) * 100) / 100;
};

const normalizeFinancialInputs = (details = {}) => ({
  shippingFee: Math.max(0, toNumber(details.shippingFee) ?? DEFAULT_FREE_SHIPPING_FEE),
  transactionFeeRate: Math.max(0, toNumber(details.transactionFeeRate) ?? 0),
  transactionFeeAmount: Math.max(0, toNumber(details.transactionFeeAmount) ?? 0),
  targetProfit: Math.max(0, toNumber(details.targetProfit) ?? 5),
});

const analyzeProductProfitability = ({
  retailPrice,
  baseCost,
  shippingFee,
  transactionFeeRate,
  transactionFeeAmount,
  discountType,
  discountRate,
  discountAmount,
  minCartValue,
  targetProfit,
}) => {
  const rawSale = Number(retailPrice || 0);
  const minCart = Math.max(0, Number(minCartValue || 0));
  const sale = rawSale;
  const base = Number(baseCost || 0);
  const ship = Number(shippingFee || 0);
  const txnRate = Number(transactionFeeRate || 0);
  const txnAmount = Number(transactionFeeAmount || 0);
  const discountPct = Number(discountRate || 0);
  const discountFixed = Number(discountAmount || 0);

  const percentDiscount = discountType === 'PERCENT_OFF' ? sale * discountPct / 100 : 0;
  const fixedDiscount = discountType === 'FIXED_AMOUNT' ? discountFixed : 0;
  const shippingCost = discountType === 'FREE_SHIPPING' ? ship : 0;
  const discountValue = discountType === 'PERCENT_OFF'
    ? percentDiscount
    : discountType === 'FIXED_AMOUNT'
      ? fixedDiscount
      : 0;

  const transactionFeeValue = (sale * txnRate / 100) + txnAmount;
  const profit = sale - (base + shippingCost + transactionFeeValue) - discountValue;
  const marginPercent = sale > 0 ? profit / sale : null;
  const lowMargin = marginPercent !== null && marginPercent < 0.1;

  let denominator = 1 - (txnRate / 100);
  if (discountType === 'PERCENT_OFF') {
    denominator -= discountPct / 100;
  }

  const shippingComponent = discountType === 'FREE_SHIPPING' ? ship : 0;
  let minimumRetailPrice = null;
  if (denominator > 0) {
    minimumRetailPrice = roundMoney((base + shippingComponent + txnAmount + (discountType === 'FIXED_AMOUNT' ? discountFixed : 0) + targetProfit) / denominator);
  }

  return {
    retailPriceRaw: roundMoney(rawSale),
    retailPrice: roundMoney(sale),
    minCartValue: roundMoney(minCart),
    baseCost: roundMoney(base),
    shippingFee: roundMoney(ship),
    transactionFeeRate: roundMoney(txnRate),
    transactionFeeAmount: roundMoney(txnAmount),
    discountValue: roundMoney(discountValue),
    profit: roundMoney(profit),
    marginPercent: marginPercent === null ? null : roundMoney(marginPercent * 100),
    lowMargin,
    targetProfit: roundMoney(targetProfit),
    minimumRetailPrice,
    impossibleToMeetTarget: denominator <= 0,
  };
};

const ensureStoreOwnedByUser = async ({ storeId, userId }) => {
  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) {
    return { ok: false, status: 404, message: 'Store not found' };
  }
  if (store.userId !== userId) {
    return { ok: false, status: 403, message: 'Not authorized' };
  }
  return { ok: true, store };
};

const ensureDiscountInStore = async ({ discountId, storeId }) => {
  const discount = await prisma.discount.findUnique({ where: { id: discountId } });
  if (!discount || discount.storeId !== storeId) {
    return { ok: false, status: 404, message: 'Discount not found' };
  }
  return { ok: true, discount };
};

const listDiscountsForStore = async (req, res) => {
  try {
    const storeId = validateId(req.params.storeId);
    if (!storeId) return res.status(400).json({ message: 'Invalid store id' });

    const ownership = await ensureStoreOwnedByUser({ storeId, userId: req.user.id });
    if (!ownership.ok) return res.status(ownership.status).json({ message: ownership.message });

    const publishedAt = ownership.store?.discountsPublishedAt || null;

    const discounts = await prisma.discount.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
      include: {
        campaign: { select: { id: true, title: true } },
      },
    });

    res.json(
      discounts.map((d) => ({
        id: d.id,
        storeId: d.storeId,
        scope: d.scope,
        type: d.type,
        audience: d.audience,
        status: d.status,
        campaignId: d.campaignId,
        campaign: d.campaign ? { id: d.campaign.id, title: d.campaign.title } : null,
        name: d.name,
        percentOff: d.percentOff,
        fixedAmount: d.fixedAmount,
        promoCode: d.promoCode,
        minCartValue: d.minCartValue,
        regions: d.regions,
        shippingCountries: d.shippingCountries,
        isActive: d.isActive,
        storeDiscountsPublishedAt: publishedAt,
        isPublished: publishedAt ? new Date(d.updatedAt).getTime() <= new Date(publishedAt).getTime() : false,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

const createDiscountDraft = async (req, res) => {
  try {
    const storeId = validateId(req.params.storeId);
    if (!storeId) return res.status(400).json({ message: 'Invalid store id' });

    const ownership = await ensureStoreOwnedByUser({ storeId, userId: req.user.id });
    if (!ownership.ok) return res.status(ownership.status).json({ message: ownership.message });

    const scope = typeof req.body?.scope === 'string' ? req.body.scope.trim().toUpperCase() : '';
    const type = typeof req.body?.type === 'string' ? req.body.type.trim().toUpperCase() : '';
    const audience = typeof req.body?.audience === 'string' ? req.body.audience.trim().toUpperCase() : '';

    const validScopes = new Set(['STOREWIDE', 'CAMPAIGN']);
    const validTypes = new Set(['FREE_SHIPPING', 'PERCENT_OFF', 'FIXED_AMOUNT']);
    const validAudiences = new Set(['EVERYONE', 'TARGETED']);

    if (!validScopes.has(scope)) return res.status(400).json({ message: 'Invalid discount scope' });
    if (!validTypes.has(type)) return res.status(400).json({ message: 'Invalid discount type' });
    if (!validAudiences.has(audience)) return res.status(400).json({ message: 'Invalid discount audience' });

    const campaignId = req.body?.campaignId ? validateId(req.body.campaignId) : null;

    if (scope === 'STOREWIDE' && type === 'FIXED_AMOUNT') {
      return res.status(400).json({ message: 'Fixed amount discounts are only supported for campaign-wide discounts' });
    }

    if (campaignId) {
      const ownedCampaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
      if (!ownedCampaign) return res.status(404).json({ message: 'Campaign not found' });
      if (ownedCampaign.userId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
      if (scope !== 'CAMPAIGN') return res.status(400).json({ message: 'Campaign can only be set for campaign-wide discounts' });
    }

    const created = await prisma.discount.create({
      data: {
        storeId,
        scope,
        type,
        audience,
        status: 'DRAFT',
        isActive: false,
        promoCode: null,
        promoCodeNormalized: null,
        campaignId: campaignId || null,
      },
    });

    res.status(201).json(created);
  } catch (err) {
    if (err?.code === 'P2002') {
      return res.status(409).json({ message: 'Discount promo code already exists in this store' });
    }
    console.error(err);
    res.status(500).send('Server error');
  }
};

const computeProfitabilityAnalysis = async ({ storeId, discount, details, userId }) => {
  const type = discount.type;
  const financialInputs = normalizeFinancialInputs(details);
  const percentOff = type === 'PERCENT_OFF' ? toNumber(details.percentOff) : null;
  const fixedAmount = type === 'FIXED_AMOUNT' ? toNumber(details.fixedAmount) : null;
  const minCartValue = Math.max(0, toNumber(details.minCartValue) ?? toNumber(discount.minCartValue) ?? 0);

  let campaignIds = [];
  if (discount.scope === 'CAMPAIGN') {
    const campaignId = validateId(details.campaignId) || discount.campaignId;
    if (campaignId) campaignIds = [campaignId];
  } else {
    const rows = await prisma.collectionCampaign.findMany({
      where: { collection: { storeId } },
      select: { campaignId: true },
    });
    campaignIds = Array.from(new Set(rows.map((r) => r.campaignId)));

    // Fallback: if a store has not mapped campaigns to collections yet,
    // still evaluate all campaigns owned by the user so profitability checks
    // can catch loss scenarios immediately.
    if (campaignIds.length === 0) {
      const owned = await prisma.campaign.findMany({
        where: { userId },
        select: { id: true },
      });
      campaignIds = owned.map((c) => c.id);
    }
  }

  if (campaignIds.length === 0) {
    return {
      conflicts: [],
      warnings: [],
      summary: {
        analyzedVariants: 0,
        unprofitableVariants: 0,
        lowMarginVariants: 0,
        targetProfit: financialInputs.targetProfit,
      },
    };
  }

  const campaigns = await prisma.campaign.findMany({
    where: {
      id: { in: campaignIds },
      userId,
    },
    select: {
      id: true,
      title: true,
      baseProduct: { select: { name: true, costPrice: true } },
      products: {
        select: { id: true, color: true, size: true, salePrice: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  const conflicts = [];
  const warnings = [];
  const summaries = [];
  for (const c of campaigns) {
    const baseCost = Number(c.baseProduct?.costPrice || 0);
    const bad = [];

    for (const p of c.products || []) {
      const sale = Number(p.salePrice || 0);
      const variantBaseCost = baseCost + sizeSurchargeBySize(p.size);

      // Determine dynamic shipping fee for this specific product based on regions
      let analyzedShipFee = financialInputs.shippingFee;
      if (type === 'FREE_SHIPPING') {
        analyzedShipFee = getRegionMaxShipping(baseCost, details.regions, details.shippingCountries);
      }

      const analysis = analyzeProductProfitability({
        retailPrice: sale,
        baseCost: variantBaseCost,
        shippingFee: analyzedShipFee,
        transactionFeeRate: financialInputs.transactionFeeRate,
        transactionFeeAmount: financialInputs.transactionFeeAmount,
        discountType: type,
        discountRate: percentOff || 0,
        discountAmount: fixedAmount || 0,
        minCartValue,
        targetProfit: financialInputs.targetProfit,
      });

      summaries.push({
        campaignId: c.id,
        campaignTitle: c.title,
        campaignProductId: p.id,
        variant: [p.color, p.size].filter(Boolean).join(' / ') || 'Variant',
        ...analysis,
      });

      if (analysis.profit < analysis.targetProfit) {
        bad.push({
          campaignProductId: p.id,
          variant: [p.color, p.size].filter(Boolean).join(' / ') || 'Variant',
          retailPriceRaw: analysis.retailPriceRaw,
          retailPrice: analysis.retailPrice,
          minCartValue: analysis.minCartValue,
          baseCost: analysis.baseCost,
          shippingFee: analysis.shippingFee,
          transactionFeeRate: analysis.transactionFeeRate,
          transactionFeeAmount: analysis.transactionFeeAmount,
          discount: analysis.discountValue,
          profit: analysis.profit,
          marginPercent: analysis.marginPercent,
          targetProfit: analysis.targetProfit,
          minimumRetailPrice: analysis.minimumRetailPrice,
          impossibleToMeetTarget: analysis.impossibleToMeetTarget,
        });
      } else if (analysis.lowMargin) {
        warnings.push({
          campaignProductId: p.id,
          campaignId: c.id,
          campaignTitle: c.title,
          variant: [p.color, p.size].filter(Boolean).join(' / ') || 'Variant',
          retailPriceRaw: analysis.retailPriceRaw,
          retailPrice: analysis.retailPrice,
          minCartValue: analysis.minCartValue,
          profit: analysis.profit,
          marginPercent: analysis.marginPercent,
          minimumRetailPrice: analysis.minimumRetailPrice,
        });
      }
    }

    if (bad.length > 0) {
      conflicts.push({
        campaignId: c.id,
        campaignTitle: c.title,
        baseProductName: c.baseProduct?.name || '',
        variants: bad,
      });
    }
  }

  return {
    conflicts,
    warnings,
    summary: {
      analyzedVariants: summaries.length,
      unprofitableVariants: conflicts.reduce((total, item) => total + (item.variants?.length || 0), 0),
      lowMarginVariants: warnings.length,
      targetProfit: financialInputs.targetProfit,
    },
  };
};

const previewProfitability = async (req, res) => {
  try {
    const storeId = validateId(req.params.storeId);
    const discountId = validateId(req.params.discountId);
    if (!storeId) return res.status(400).json({ message: 'Invalid store id' });
    if (!discountId) return res.status(400).json({ message: 'Invalid discount id' });

    const ownership = await ensureStoreOwnedByUser({ storeId, userId: req.user.id });
    if (!ownership.ok) return res.status(ownership.status).json({ message: ownership.message });

    const discountCheck = await ensureDiscountInStore({ discountId, storeId });
    if (!discountCheck.ok) return res.status(discountCheck.status).json({ message: discountCheck.message });

    const analysis = await computeProfitabilityAnalysis({
      storeId,
      discount: discountCheck.discount,
      details: req.body || {},
      userId: req.user.id,
    });

    res.json(analysis);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

const finalizeDiscount = async (req, res) => {
  try {
    const storeId = validateId(req.params.storeId);
    const discountId = validateId(req.params.discountId);
    if (!storeId) return res.status(400).json({ message: 'Invalid store id' });
    if (!discountId) return res.status(400).json({ message: 'Invalid discount id' });

    const ownership = await ensureStoreOwnedByUser({ storeId, userId: req.user.id });
    if (!ownership.ok) return res.status(ownership.status).json({ message: ownership.message });

    const discountCheck = await ensureDiscountInStore({ discountId, storeId });
    if (!discountCheck.ok) return res.status(discountCheck.status).json({ message: discountCheck.message });

    const existing = discountCheck.discount;

    if (existing.scope === 'STOREWIDE' && existing.audience === 'EVERYONE') {
      const activeStorewide = await prisma.discount.findFirst({
        where: {
          storeId,
          scope: 'STOREWIDE',
          audience: 'EVERYONE',
          status: 'READY',
          id: { not: discountId }
        }
      });
      if (activeStorewide) {
        return res.status(400).json({ message: 'You can have only one untargeted storewide promotion' });
      }
    }

    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    if (!name) return res.status(400).json({ message: 'Discount name is required' });

    const data = {
      name,
      minCartValue: req.body?.minCartValue === '' || req.body?.minCartValue === null || req.body?.minCartValue === undefined
        ? null
        : Number(req.body.minCartValue),
    };

    if (data.minCartValue !== null && Number.isNaN(data.minCartValue)) {
      return res.status(400).json({ message: 'Minimum cart value must be a number' });
    }
    if (typeof data.minCartValue === 'number' && data.minCartValue < 0) {
      return res.status(400).json({ message: 'Minimum cart value must be >= 0' });
    }

    if (existing.type === 'PERCENT_OFF') {
      const percentOff = Number(req.body?.percentOff);
      if (Number.isNaN(percentOff)) return res.status(400).json({ message: 'Percent off is required' });
      if (percentOff <= 0 || percentOff > 100) return res.status(400).json({ message: 'Percent off must be between 1 and 100' });
      data.percentOff = percentOff;
      data.fixedAmount = null;
      data.regions = null;
      data.shippingCountries = null;
    } else if (existing.type === 'FIXED_AMOUNT') {
      const fixedAmount = Number(req.body?.fixedAmount);
      if (Number.isNaN(fixedAmount)) return res.status(400).json({ message: 'Fixed amount is required' });
      if (fixedAmount <= 0) return res.status(400).json({ message: 'Fixed amount must be greater than 0' });
      data.fixedAmount = fixedAmount;
      data.percentOff = null;
      data.regions = null;
      data.shippingCountries = null;
    } else {
      data.percentOff = null;
      data.fixedAmount = null;
      const regions = parseRegions(req.body?.regions);
      if (regions.length === 0) {
        return res.status(400).json({ message: 'Select at least one region for free shipping' });
      }
      data.regions = regions;
      data.shippingCountries = parseShippingCountries(req.body?.shippingCountries);
    }

    if (existing.audience === 'TARGETED') {
      const promoCode = normalizePromoCode(req.body?.promoCode);
      if (!promoCode) return res.status(400).json({ message: 'Promo code is required for targeted discounts' });
      if (!isValidPromoCode(promoCode)) {
        return res.status(400).json({
          message: 'Promo code must be 3-64 characters and use only letters, numbers, underscore, or dash',
        });
      }
      data.promoCode = promoCode;
      data.promoCodeNormalized = promoCode;
    } else {
      data.promoCode = null;
      data.promoCodeNormalized = null;
    }

    if (existing.scope === 'CAMPAIGN') {
      const campaignId = validateId(req.body?.campaignId);
      const chosenCampaignId = campaignId || existing.campaignId;
      if (!chosenCampaignId) return res.status(400).json({ message: 'Campaign is required for campaign-specific discounts' });

      const ownedCampaign = await prisma.campaign.findUnique({ where: { id: chosenCampaignId } });
      if (!ownedCampaign) return res.status(404).json({ message: 'Campaign not found' });
      if (ownedCampaign.userId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

      data.campaignId = chosenCampaignId;
    } else {
      data.campaignId = null;
    }

    const analysis = await computeProfitabilityAnalysis({
      storeId,
      discount: existing,
      details: {
        ...req.body,
        campaignId: data.campaignId,
        percentOff: data.percentOff,
        fixedAmount: data.fixedAmount,
      },
      userId: req.user.id,
    });
    if (analysis.conflicts.length > 0) {
      return res.status(409).json({
        message: 'Price adjustments necessary for some items',
        conflicts: analysis.conflicts,
        warnings: analysis.warnings,
        summary: analysis.summary,
      });
    }

    data.status = 'READY';

    const updated = await prisma.discount.update({
      where: { id: discountId },
      data,
      include: { campaign: { select: { id: true, title: true } } },
    });

    res.json({
      id: updated.id,
      storeId: updated.storeId,
      scope: updated.scope,
      type: updated.type,
      audience: updated.audience,
      status: updated.status,
      campaignId: updated.campaignId,
      campaign: updated.campaign ? { id: updated.campaign.id, title: updated.campaign.title } : null,
      name: updated.name,
      percentOff: updated.percentOff,
      fixedAmount: updated.fixedAmount,
      promoCode: updated.promoCode,
      minCartValue: updated.minCartValue,
      regions: updated.regions,
      shippingCountries: updated.shippingCountries,
      isActive: updated.isActive,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      warnings: analysis.warnings,
      summary: analysis.summary,
    });
  } catch (err) {
    if (err?.code === 'P2002') {
      return res.status(409).json({ message: 'Discount promo code already exists in this store' });
    }
    console.error(err);
    res.status(500).send('Server error');
  }
};

const setDiscountActive = async (req, res) => {
  try {
    const storeId = validateId(req.params.storeId);
    const discountId = validateId(req.params.discountId);
    if (!storeId) return res.status(400).json({ message: 'Invalid store id' });
    if (!discountId) return res.status(400).json({ message: 'Invalid discount id' });

    const ownership = await ensureStoreOwnedByUser({ storeId, userId: req.user.id });
    if (!ownership.ok) return res.status(ownership.status).json({ message: ownership.message });

    const discountCheck = await ensureDiscountInStore({ discountId, storeId });
    if (!discountCheck.ok) return res.status(discountCheck.status).json({ message: discountCheck.message });

    const existing = discountCheck.discount;
    if (existing.status !== 'READY') {
      return res.status(400).json({ message: 'Finalize the discount before activating it' });
    }

    const isActive = Boolean(req.body?.isActive);

    const updated = await prisma.discount.update({
      where: { id: discountId },
      data: { isActive },
      select: { id: true, storeId: true, isActive: true, status: true },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

const deleteDiscount = async (req, res) => {
  try {
    const storeId = validateId(req.params.storeId);
    const discountId = validateId(req.params.discountId);
    if (!storeId) return res.status(400).json({ message: 'Invalid store id' });
    if (!discountId) return res.status(400).json({ message: 'Invalid discount id' });

    const ownership = await ensureStoreOwnedByUser({ storeId, userId: req.user.id });
    if (!ownership.ok) return res.status(ownership.status).json({ message: ownership.message });

    const discountCheck = await ensureDiscountInStore({ discountId, storeId });
    if (!discountCheck.ok) return res.status(discountCheck.status).json({ message: discountCheck.message });

    await prisma.discount.delete({ where: { id: discountId } });
    res.json({ message: 'Discount deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

const publishDiscountsForStore = async (req, res) => {
  try {
    const storeId = validateId(req.params.storeId);
    if (!storeId) return res.status(400).json({ message: 'Invalid store id' });

    const ownership = await ensureStoreOwnedByUser({ storeId, userId: req.user.id });
    if (!ownership.ok) return res.status(ownership.status).json({ message: ownership.message });

    const updated = await prisma.store.update({
      where: { id: storeId },
      data: { discountsPublishedAt: new Date() },
      select: { id: true, discountsPublishedAt: true },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

module.exports = {
  listDiscountsForStore,
  createDiscountDraft,
  previewProfitability,
  finalizeDiscount,
  setDiscountActive,
  deleteDiscount,
  publishDiscountsForStore,
};
