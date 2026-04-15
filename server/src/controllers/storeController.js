const prisma = require('../utils/prisma');

const getStores = async (req, res) => {
  try {
    const stores = await prisma.store.findMany({
      where: { userId: req.user.id },
      include: {
        _count: {
          select: { orders: true }
        }
      }
    });
    res.json(stores);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const createStore = async (req, res) => {
  try {
    const { name, url, platform, logo } = req.body;

    const cleanName = typeof name === 'string' ? name.trim() : '';
    if (!cleanName) {
      return res.status(400).json({ message: 'Store name is required' });
    }

    const cleanUrl = typeof url === 'string' ? url.trim() : null;
    const allowedPlatforms = new Set(['SHOPIFY', 'WOOCOMMERCE', 'CUSTOM']);
    const cleanPlatform = typeof platform === 'string' ? platform.trim().toUpperCase() : undefined;
    if (cleanPlatform && !allowedPlatforms.has(cleanPlatform)) {
      return res.status(400).json({ message: 'Invalid platform' });
    }

    const newStore = await prisma.store.create({
      data: {
        name: cleanName,
        url: cleanUrl || null,
        platform: cleanPlatform,
        logo: typeof logo === 'string' && logo.trim() ? logo.trim() : null,
        userId: req.user.id
      }
    });

    res.json(newStore);
  } catch (err) {
    // Return a clearer message for common validation errors
    if (err?.name === 'PrismaClientValidationError') {
      console.error('Prisma validation error (createStore):', err.message);
      return res.status(400).json({ message: 'Invalid store payload' });
    }
    if (err?.code === 'P2002') {
      return res.status(409).json({ message: 'Store already exists' });
    }

    console.error(err);
    res.status(500).send('Server error');
  }
};

const deleteStore = async (req, res) => {
  try {
    const storeId = req.params.id;
    if (!storeId) {
      return res.status(400).json({ message: 'Invalid store id' });
    }

    const store = await prisma.store.findUnique({
      where: { id: storeId }
    });

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    if (store.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await prisma.store.delete({
      where: { id: storeId }
    });

    res.json({ message: 'Store disconnected' });
  } catch (err) {
    // Prisma FK constraint (e.g., store still has related orders)
    if (err && err.code === 'P2003') {
      return res.status(409).json({
        message: 'Cannot disconnect this store because it has related data (e.g., orders). Remove related records first.'
      });
    }
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const updateStore = async (req, res) => {
  try {
    const storeId = req.params.id;
    if (!storeId) {
      return res.status(400).json({ message: 'Invalid store id' });
    }

    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    if (store.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const nextName = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    if (!nextName) {
      return res.status(400).json({ message: 'Store name is required' });
    }

    const updated = await prisma.store.update({
      where: { id: store.id },
      data: { name: nextName },
    });

    return res.json(updated);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server error');
  }
};

module.exports = {
  getStores,
  createStore,
  deleteStore,
  updateStore
};
