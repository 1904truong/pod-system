const prisma = require('../utils/prisma');

const validateId = (value) => {
  return (typeof value === 'string' && value.length > 0) ? value : null;
};

const slugify = (value) => {
  const raw = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (!raw) return '';

  return raw
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
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

const ensureCollectionInStore = async ({ collectionId, storeId }) => {
  const collection = await prisma.collection.findUnique({ where: { id: collectionId } });
  if (!collection || collection.storeId !== storeId) {
    return { ok: false, status: 404, message: 'Collection not found' };
  }
  return { ok: true, collection };
};

const parseCampaignIds = (value) => {
  const raw = Array.isArray(value) ? value : [];
  const ids = raw
    .map((v) => String(v))
    .filter((s) => s.length > 0);
  return Array.from(new Set(ids));
};

const getCollectionsForStore = async (req, res) => {
  try {
    const storeId = validateId(req.params.storeId);
    if (!storeId) return res.status(400).json({ message: 'Invalid store id' });

    const ownership = await ensureStoreOwnedByUser({ storeId, userId: req.user.id });
    if (!ownership.ok) return res.status(ownership.status).json({ message: ownership.message });

    const collections = await prisma.collection.findMany({
      where: { storeId },
      orderBy: [{ parentId: 'asc' }, { createdAt: 'asc' }],
      include: {
        campaigns: {
          include: {
            campaign: {
              select: {
                id: true,
                title: true,
                createdAt: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    const shaped = collections.map((c) => ({
      id: c.id,
      storeId: c.storeId,
      parentId: c.parentId,
      name: c.name,
      slug: c.slug,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      campaigns: (c.campaigns || []).map((cc) => cc.campaign),
    }));

    res.json(shaped);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

const createCollectionForStore = async (req, res) => {
  try {
    const storeId = validateId(req.params.storeId);
    if (!storeId) return res.status(400).json({ message: 'Invalid store id' });

    const ownership = await ensureStoreOwnedByUser({ storeId, userId: req.user.id });
    if (!ownership.ok) return res.status(ownership.status).json({ message: ownership.message });

    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    if (!name) return res.status(400).json({ message: 'Collection name is required' });

    const parentId = req.body?.parentId === null || req.body?.parentId === undefined
      ? null
      : validateId(req.body.parentId);

    if (req.body?.parentId !== null && req.body?.parentId !== undefined && !parentId) {
      return res.status(400).json({ message: 'Invalid parent collection id' });
    }

    if (parentId) {
      const parentCheck = await prisma.collection.findUnique({ where: { id: parentId } });
      if (!parentCheck || parentCheck.storeId !== storeId) {
        return res.status(404).json({ message: 'Parent collection not found' });
      }
    }

    const incomingSlug = typeof req.body?.slug === 'string' ? req.body.slug.trim() : '';
    const slug = slugify(incomingSlug || name);
    if (!slug) return res.status(400).json({ message: 'Collection URL is invalid' });

    const created = await prisma.collection.create({
      data: {
        name,
        slug,
        storeId,
        parentId: parentId || null,
      },
    });

    res.status(201).json(created);
  } catch (err) {
    if (err?.code === 'P2002') {
      return res.status(409).json({ message: 'This collection URL already exists in the store' });
    }
    console.error(err);
    res.status(500).send('Server error');
  }
};

const setCampaignsForCollection = async (req, res) => {
  try {
    const storeId = validateId(req.params.storeId);
    const collectionId = validateId(req.params.collectionId);
    if (!storeId) return res.status(400).json({ message: 'Invalid store id' });
    if (!collectionId) return res.status(400).json({ message: 'Invalid collection id' });

    const ownership = await ensureStoreOwnedByUser({ storeId, userId: req.user.id });
    if (!ownership.ok) return res.status(ownership.status).json({ message: ownership.message });

    const collectionCheck = await ensureCollectionInStore({ collectionId, storeId });
    if (!collectionCheck.ok) return res.status(collectionCheck.status).json({ message: collectionCheck.message });

    const campaignIds = parseCampaignIds(req.body?.campaignIds);

    if (campaignIds.length > 0) {
      const owned = await prisma.campaign.findMany({
        where: { id: { in: campaignIds }, userId: req.user.id },
        select: { id: true },
      });
      const ownedSet = new Set(owned.map((c) => c.id));
      const notOwned = campaignIds.filter((id) => !ownedSet.has(id));
      if (notOwned.length > 0) {
        return res.status(403).json({ message: 'One or more campaigns are not owned by the current user' });
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.collectionCampaign.deleteMany({ where: { collectionId } });
      if (campaignIds.length > 0) {
        await tx.collectionCampaign.createMany({
          data: campaignIds.map((campaignId) => ({ collectionId, campaignId })),
          skipDuplicates: true,
        });
      }
    });

    const updated = await prisma.collection.findUnique({
      where: { id: collectionId },
      include: {
        campaigns: {
          include: {
            campaign: {
              select: { id: true, title: true, createdAt: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    res.json({
      collectionId,
      campaigns: (updated?.campaigns || []).map((cc) => cc.campaign),
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

const removeCampaignFromCollection = async (req, res) => {
  try {
    const storeId = validateId(req.params.storeId);
    const collectionId = validateId(req.params.collectionId);
    const campaignId = validateId(req.params.campaignId);
    if (!storeId) return res.status(400).json({ message: 'Invalid store id' });
    if (!collectionId) return res.status(400).json({ message: 'Invalid collection id' });
    if (!campaignId) return res.status(400).json({ message: 'Invalid campaign id' });

    const ownership = await ensureStoreOwnedByUser({ storeId, userId: req.user.id });
    if (!ownership.ok) return res.status(ownership.status).json({ message: ownership.message });

    const collectionCheck = await ensureCollectionInStore({ collectionId, storeId });
    if (!collectionCheck.ok) return res.status(collectionCheck.status).json({ message: collectionCheck.message });

    const owned = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!owned) return res.status(404).json({ message: 'Campaign not found' });
    if (owned.userId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    await prisma.collectionCampaign.deleteMany({ where: { collectionId, campaignId } });
    res.json({ message: 'Campaign removed from collection' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

const publishCollectionsForStore = async (req, res) => {
  try {
    const storeId = validateId(req.params.storeId);
    if (!storeId) return res.status(400).json({ message: 'Invalid store id' });

    const ownership = await ensureStoreOwnedByUser({ storeId, userId: req.user.id });
    if (!ownership.ok) return res.status(ownership.status).json({ message: ownership.message });

    // Make sure the store has at least one collection and that campaigns are assigned to a collection.
    // The public storefront campaigns endpoint only returns campaigns that are linked via CollectionCampaign.
    const existingCollection = await prisma.collection.findFirst({
      where: { storeId, parentId: null },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });

    let collection = existingCollection;
    if (!collection) {
      try {
        collection = await prisma.collection.create({
          data: {
            storeId,
            parentId: null,
            name: 'Home',
            slug: 'home',
          },
          select: { id: true },
        });
      } catch (createErr) {
        if (createErr.code === 'P2002') {
          collection = await prisma.collection.findFirst({
            where: { storeId, parentId: null, slug: 'home' },
            select: { id: true },
          });
        } else {
          throw createErr;
        }
      }
    }

    const campaigns = await prisma.campaign.findMany({
      where: { userId: ownership.store.userId },
      select: { id: true },
    });

    if (campaigns.length && collection && collection.id) {
      const data = campaigns.map((c) => ({ collectionId: collection.id, campaignId: c.id }));
      try {
        await prisma.collectionCampaign.createMany({ data, skipDuplicates: true });
      } catch {
        // Fallback if skipDuplicates isn't supported by the client/runtime.
        for (const row of data) {
          try {
            await prisma.collectionCampaign.create({ data: row });
          } catch {
            // ignore duplicates
          }
        }
      }
    }

    const updated = await prisma.store.update({
      where: { id: storeId },
      data: { collectionsPublishedAt: new Date() },
      select: { id: true, collectionsPublishedAt: true },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

const updateCollectionForStore = async (req, res) => {
  try {
    const storeId = validateId(req.params.storeId);
    const collectionId = validateId(req.params.collectionId);
    if (!storeId) return res.status(400).json({ message: 'Invalid store id' });
    if (!collectionId) return res.status(400).json({ message: 'Invalid collection id' });

    const ownership = await ensureStoreOwnedByUser({ storeId, userId: req.user.id });
    if (!ownership.ok) return res.status(ownership.status).json({ message: ownership.message });

    const existing = await prisma.collection.findUnique({ where: { id: collectionId } });
    if (!existing || existing.storeId !== storeId) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : undefined;
    const incomingSlug = typeof req.body?.slug === 'string' ? req.body.slug.trim() : undefined;

    const data = {};
    if (typeof name === 'string') {
      if (!name) return res.status(400).json({ message: 'Collection name is required' });
      data.name = name;
    }

    if (typeof incomingSlug === 'string') {
      const nextSlug = slugify(incomingSlug);
      if (!nextSlug) return res.status(400).json({ message: 'Collection URL is invalid' });
      data.slug = nextSlug;
    }

    const updated = await prisma.collection.update({
      where: { id: collectionId },
      data,
    });

    res.json(updated);
  } catch (err) {
    if (err?.code === 'P2002') {
      return res.status(409).json({ message: 'This collection URL already exists in the store' });
    }
    console.error(err);
    res.status(500).send('Server error');
  }
};

const deleteCollectionForStore = async (req, res) => {
  try {
    const storeId = validateId(req.params.storeId);
    const collectionId = validateId(req.params.collectionId);
    if (!storeId) return res.status(400).json({ message: 'Invalid store id' });
    if (!collectionId) return res.status(400).json({ message: 'Invalid collection id' });

    const ownership = await ensureStoreOwnedByUser({ storeId, userId: req.user.id });
    if (!ownership.ok) return res.status(ownership.status).json({ message: ownership.message });

    const existing = await prisma.collection.findUnique({ where: { id: collectionId } });
    if (!existing || existing.storeId !== storeId) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    await prisma.collection.delete({ where: { id: collectionId } });
    res.json({ message: 'Collection deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

module.exports = {
  getCollectionsForStore,
  createCollectionForStore,
  updateCollectionForStore,
  deleteCollectionForStore,
  setCampaignsForCollection,
  removeCampaignFromCollection,
  publishCollectionsForStore,
};
