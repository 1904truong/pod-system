const path = require('path');
const fs = require('fs');
const prisma = require('../utils/prisma');

const coerceInt = (value) => {
  if (value === null || value === undefined) return null;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isInteger(parsed) ? parsed : null;
};

const validateId = (value) => {
  return (typeof value === 'string' && value.length > 0) ? value : null;
};

const pickStoreSettings = (store) => {
  if (!store) return null;
  return {
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
  };
};

const ensureOwnerStore = async (storeId, userId) => {
  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) return { error: { status: 404, message: 'Store not found' } };
  if (store.userId !== userId) return { error: { status: 403, message: 'Not authorized' } };
  return { store };
};

const getStoreSettings = async (req, res) => {
  try {
    const storeId = validateId(req.params.id);
    if (!storeId) return res.status(400).json({ message: 'Invalid store id' });

    const { store, error } = await ensureOwnerStore(storeId, req.user.id);
    if (error) return res.status(error.status).json({ message: error.message });

    return res.json(pickStoreSettings(store));
  } catch (err) {
    console.error(err);
    return res.status(500).send('Server error');
  }
};

const updateStoreSettings = async (req, res) => {
  try {
    const storeId = validateId(req.params.id);
    if (!storeId) return res.status(400).json({ message: 'Invalid store id' });

    const { store, error } = await ensureOwnerStore(storeId, req.user.id);
    if (error) return res.status(error.status).json({ message: error.message });

    const allowedDesktop = new Set([3, 4]);
    const allowedMobile = new Set([1, 2]);
    const allowedInitial = new Set([12, 24]);

    const next = {};

    if (typeof req.body?.aboutText === 'string') {
      const trimmed = req.body.aboutText.trim();
      if (trimmed.length > 1000) {
        return res.status(400).json({ message: 'About text must be at most 1000 characters' });
      }
      next.aboutText = trimmed;
    }

    if (typeof req.body?.storeTimezone === 'string') {
      const timezone = req.body.storeTimezone.trim();
      if (!timezone) return res.status(400).json({ message: 'Store timezone is required' });
      next.storeTimezone = timezone;
    }

    if (typeof req.body?.payoutCurrency === 'string') {
      const payoutCurrency = req.body.payoutCurrency.trim().toUpperCase();
      const allowed = new Set(['USD', 'EUR', 'GBP']);
      if (!allowed.has(payoutCurrency)) {
        return res.status(400).json({ message: 'Invalid payout currency' });
      }
      next.payoutCurrency = payoutCurrency;
    }

    const desktopColumns = coerceInt(req.body?.desktopColumns);
    if (desktopColumns != null) {
      if (!allowedDesktop.has(desktopColumns)) return res.status(400).json({ message: 'Invalid desktop columns' });
      next.desktopColumns = desktopColumns;
    }

    const mobileColumns = coerceInt(req.body?.mobileColumns);
    if (mobileColumns != null) {
      if (!allowedMobile.has(mobileColumns)) return res.status(400).json({ message: 'Invalid mobile columns' });
      next.mobileColumns = mobileColumns;
    }

    if (typeof req.body?.filtersEnabled === 'boolean') {
      next.filtersEnabled = req.body.filtersEnabled;
    }

    if (typeof req.body?.searchEnabled === 'boolean') {
      next.searchEnabled = req.body.searchEnabled;
    }

    const initialProductCount = coerceInt(req.body?.initialProductCount);
    if (initialProductCount != null) {
      if (!allowedInitial.has(initialProductCount)) return res.status(400).json({ message: 'Invalid initial product count' });
      next.initialProductCount = initialProductCount;
    }

    if (typeof req.body?.cookieBannerEnabled === 'boolean') {
      next.cookieBannerEnabled = req.body.cookieBannerEnabled;
    }

    if (typeof req.body?.companyInfoEnabled === 'boolean') {
      next.companyInfoEnabled = req.body.companyInfoEnabled;
    }

    const updated = await prisma.store.update({
      where: { id: store.id },
      data: next,
    });

    return res.json(pickStoreSettings(updated));
  } catch (err) {
    console.error(err);
    return res.status(500).send('Server error');
  }
};

const getUploadsDir = () => {
  const uploadDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
};

const getBrandingFieldForAsset = (asset) => {
  if (asset === 'logo') return 'logo';
  if (asset === 'banner') return 'banner';
  if (asset === 'favicon') return 'favicon';
  return null;
};

const getAllowedExtensionsForAsset = (asset) => {
  if (asset === 'logo' || asset === 'banner') return new Set(['.jpg', '.jpeg', '.png']);
  if (asset === 'favicon') return new Set(['.ico', '.png', '.gif', '.jpg', '.jpeg']);
  return new Set();
};

const uploadStoreBranding = async (req, res) => {
  try {
    const storeId = validateId(req.params.id);
    if (!storeId) return res.status(400).json({ message: 'Invalid store id' });

    const asset = typeof req.params.asset === 'string' ? req.params.asset.trim().toLowerCase() : '';
    const field = getBrandingFieldForAsset(asset);
    if (!field) return res.status(400).json({ message: 'Invalid branding asset' });

    const { store, error } = await ensureOwnerStore(storeId, req.user.id);
    if (error) return res.status(error.status).json({ message: error.message });

    if (!req.file) return res.status(400).json({ message: 'Missing file' });

    const ext = path.extname(req.file.originalname || '').toLowerCase();
    const allowed = getAllowedExtensionsForAsset(asset);
    if (!allowed.has(ext)) {
      return res.status(400).json({ message: `Invalid file type for ${asset}` });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    const updated = await prisma.store.update({
      where: { id: store.id },
      data: { [field]: fileUrl },
    });

    return res.json(pickStoreSettings(updated));
  } catch (err) {
    console.error(err);
    return res.status(500).send('Server error');
  }
};

const removeStoreBranding = async (req, res) => {
  try {
    const storeId = validateId(req.params.id);
    if (!storeId) return res.status(400).json({ message: 'Invalid store id' });

    const asset = typeof req.params.asset === 'string' ? req.params.asset.trim().toLowerCase() : '';
    const field = getBrandingFieldForAsset(asset);
    if (!field) return res.status(400).json({ message: 'Invalid branding asset' });

    const { store, error } = await ensureOwnerStore(storeId, req.user.id);
    if (error) return res.status(error.status).json({ message: error.message });

    const updated = await prisma.store.update({
      where: { id: store.id },
      data: { [field]: null },
    });

    return res.json(pickStoreSettings(updated));
  } catch (err) {
    console.error(err);
    return res.status(500).send('Server error');
  }
};

module.exports = {
  getStoreSettings,
  updateStoreSettings,
  uploadStoreBranding,
  removeStoreBranding,
  getUploadsDir,
  getAllowedExtensionsForAsset,
  getBrandingFieldForAsset,
};
