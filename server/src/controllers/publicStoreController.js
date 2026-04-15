const prisma = require('../utils/prisma');

const resolveStoreByKey = async (storeKey, select) => {
  const key = typeof storeKey === 'string' ? storeKey.trim() : '';
  if (!key) return null;

  // MongoDB ObjectIds are 24-character hex strings.
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(key);

  const store = isObjectId
    ? await prisma.store.findUnique({
      where: { id: key },
      select,
    })
    : await prisma.store.findFirst({
      where: { url: key },
      select,
    });

  if (store) return store;

  // If it wasn't an ObjectId but we haven't checked URL, or vice versa
  if (isObjectId) {
    return prisma.store.findFirst({
      where: { url: key },
      select,
    });
  }

  return null;
};

const normalizePromoCode = (value) => {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!raw) return '';
  return raw.replace(/\s+/g, '').toUpperCase();
};

const pickMostRecent = (discounts) => {
  if (!Array.isArray(discounts) || discounts.length === 0) return null;
  return discounts
    .slice()
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
};

const getPublishedActiveDiscountsByStoreUrl = async (req, res) => {
  try {
    const storeUrl = typeof req.params.storeUrl === 'string' ? req.params.storeUrl.trim() : '';
    if (!storeUrl) return res.status(400).json({ message: 'Invalid store url' });

    const resolvedStore = await resolveStoreByKey(storeUrl, { id: true, url: true, discountsPublishedAt: true });

    if (!resolvedStore) return res.status(404).json({ message: 'Store not found' });

    const publishedAt = resolvedStore.discountsPublishedAt;
    if (!publishedAt) return res.json([]);

    const discounts = await prisma.discount.findMany({
      where: {
        storeId: resolvedStore.id,
        status: 'READY',
        isActive: true,
        updatedAt: { lte: publishedAt },
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        campaign: { select: { id: true, title: true } },
      },
    });

    // Discount precedence rules (single discount "in play")
    // 1) Targeted discounts (promo code URL) override all others.
    // 2) Untargeted storewide discounts override all campaign-level discounts.
    // 3) Only one untargeted campaign-level discount can be in play.
    const requestedCode = normalizePromoCode(req.query?.code || req.query?.promo || req.query?.promoCode);

    const targetedMatches = requestedCode
      ? discounts.filter(
        (d) => d.audience === 'TARGETED' && (
          String(d.promoCodeNormalized || '') === requestedCode ||
          normalizePromoCode(d.promoCode) === requestedCode
        )
      )
      : [];

    const untargetedStorewide = discounts.filter((d) => d.audience === 'EVERYONE' && d.scope === 'STOREWIDE');
    const untargetedCampaign = discounts.filter((d) => d.audience === 'EVERYONE' && d.scope === 'CAMPAIGN');

    const selected =
      pickMostRecent(targetedMatches) ||
      pickMostRecent(untargetedStorewide) ||
      pickMostRecent(untargetedCampaign);

    if (!selected) return res.json([]);

    res.json([
      {
        id: selected.id,
        scope: selected.scope,
        type: selected.type,
        audience: selected.audience,
        campaignId: selected.campaignId,
        campaign: selected.campaign ? { id: selected.campaign.id, title: selected.campaign.title } : null,
        name: selected.name,
        percentOff: selected.percentOff,
        fixedAmount: selected.fixedAmount,
        promoCode: selected.promoCode,
        minCartValue: selected.minCartValue,
        regions: selected.regions,
        updatedAt: selected.updatedAt,
      },
    ]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

const getPublicStoreSettingsByStoreUrl = async (req, res) => {
  try {
    const storeUrl = typeof req.params.storeUrl === 'string' ? req.params.storeUrl.trim() : '';
    if (!storeUrl) return res.status(400).json({ message: 'Invalid store url' });

    const store = await resolveStoreByKey(storeUrl, {
      id: true,
      name: true,
      url: true,
      logo: true,
      banner: true,
      favicon: true,
      aboutText: true,
      storeTimezone: true,
      payoutCurrency: true,
      desktopColumns: true,
      mobileColumns: true,
      filtersEnabled: true,
      searchEnabled: true,
      initialProductCount: true,
      cookieBannerEnabled: true,
      companyInfoEnabled: true,
      updatedAt: true,
    });

    if (!store) return res.status(404).json({ message: 'Store not found' });

    return res.json({
      storeId: store.id,
      name: store.name,
      url: store.url,
      logo: store.logo,
      banner: store.banner,
      favicon: store.favicon,
      aboutText: store.aboutText,
      storeTimezone: store.storeTimezone,
      payoutCurrency: store.payoutCurrency,
      desktopColumns: store.desktopColumns,
      mobileColumns: store.mobileColumns,
      filtersEnabled: store.filtersEnabled,
      searchEnabled: store.searchEnabled,
      initialProductCount: store.initialProductCount,
      cookieBannerEnabled: store.cookieBannerEnabled,
      companyInfoEnabled: store.companyInfoEnabled,
      updatedAt: store.updatedAt,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send('Server error');
  }
};

const getPublishedStorefrontCampaignsByStoreUrl = async (req, res) => {
  try {
    const storeUrl = typeof req.params.storeUrl === 'string' ? req.params.storeUrl.trim() : '';
    if (!storeUrl) return res.status(400).json({ message: 'Invalid store url' });

    const store = await resolveStoreByKey(storeUrl, {
      id: true,
      collectionsPublishedAt: true,
    });

    if (!store) return res.status(404).json({ message: 'Store not found' });

    const publishedAt = store.collectionsPublishedAt || new Date(0); // If never published, treat as 1970

    // --- AUTO-SYNC: Ensure all user's campaigns are in the 'Home' collection ---
    try {
      const owner = await prisma.store.findUnique({
        where: { id: store.id },
        select: { userId: true }
      });

      if (owner) {
        // Find or create default "Home" collection
        let homeCollection = await prisma.collection.findFirst({
          where: { storeId: store.id, parentId: null, slug: 'home' }
        });

        if (!homeCollection) {
          try {
            homeCollection = await prisma.collection.create({
              data: { storeId: store.id, name: 'Home', slug: 'home' }
            });
          } catch (createErr) {
            if (createErr.code === 'P2002') {
              homeCollection = await prisma.collection.findFirst({
                where: { storeId: store.id, parentId: null, slug: 'home' }
              });
            } else {
              throw createErr;
            }
          }
        }

        // Find all campaigns FOR THIS SPECIFIC STORE
        const storeCampaigns = await prisma.campaign.findMany({
          where: { storeId: store.id },
          select: { id: true }
        });

        // Link any that aren't linked to a collection
        for (const camp of storeCampaigns) {
          try {
            await prisma.collectionCampaign.upsert({
              where: {
                collectionId_campaignId: {
                  collectionId: homeCollection.id,
                  campaignId: camp.id
                }
              },
              create: {
                collectionId: homeCollection.id,
                campaignId: camp.id
              },
              update: {} // do nothing if already exists
            });
          } catch (itemErr) {
            console.error(`[Storefront Auto-Sync] Failed for campaign ${camp.id}:`, itemErr.message);
          }
        }

        // If it was never published, or we just added new ones, 
        // we might want to update the publish timestamp to "now" to make them visible.
        if (!store.collectionsPublishedAt) {
          await prisma.store.update({
            where: { id: store.id },
            data: { collectionsPublishedAt: new Date() }
          });
        }
      }
    } catch (syncErr) {
      console.error("[Storefront Auto-Sync] failed:", syncErr.message);
    }

    const collectionCampaigns = await prisma.collectionCampaign.findMany({
      where: {
        collection: { storeId: store.id },
      },
      include: {
        campaign: {
          include: {
            baseProduct: true,
            products: { include: { artwork: true } },
          },
        },
      },
    });

    const campaignMap = new Map();
    collectionCampaigns.forEach((item) => {
      const campaign = item.campaign;
      if (!campaign) return;
      if (new Date(campaign.updatedAt).getTime() > new Date(publishedAt).getTime()) return;
      campaignMap.set(campaign.id, campaign);
    });

    const campaigns = Array.from(campaignMap.values()).map((campaign) => ({
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      updatedAt: campaign.updatedAt,
      baseProduct: campaign.baseProduct
        ? {
          id: campaign.baseProduct.id,
          name: campaign.baseProduct.name,
          category: campaign.baseProduct.category,
          subCategory: campaign.baseProduct.subCategory,
          image: campaign.baseProduct.image,
        }
        : null,
      products: (campaign.products || []).map((product) => ({
        id: product.id,
        salePrice: product.salePrice,
        previewUrl: product.previewUrl,
        artworkUrl: product.artwork?.fileUrl || null,
        color: product.color || null,
        size: product.size || null,
        category: product.category,
        subCategory: product.subCategory,
        designerDraft: product.designerDraft,
      })),
    }));

    return res.json(campaigns);
  } catch (err) {
    console.error(err);
    return res.status(500).send('Server error');
  }
};

module.exports = {
  getPublishedActiveDiscountsByStoreUrl,
  getPublicStoreSettingsByStoreUrl,
  getPublishedStorefrontCampaignsByStoreUrl,
};
