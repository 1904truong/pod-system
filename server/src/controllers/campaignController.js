const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const prisma = require('../utils/prisma');
const { logTask } = require('../utils/logger');

// Helper to save Base64 data to a file in /uploads/designs
const saveBase64Image = (base64Data) => {
  try {
    if (!base64Data || !base64Data.startsWith('data:image')) return null;

    // Extract content type and data
    const matches = base64Data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return null;

    const extension = matches[1].split('/')[1] || 'png';
    const buffer = Buffer.from(matches[2], 'base64');

    const uploadsDir = path.resolve(__dirname, '..', '..', 'uploads', 'designs');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `design-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${extension}`;
    const filePath = path.join(uploadsDir, fileName);
    
    fs.writeFileSync(filePath, buffer);
    return `/uploads/designs/${fileName}`;
  } catch (err) {
    console.error("[saveBase64Image] Error saving file:", err.message);
    return null;
  }
};

const getCampaigns = async (req, res) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { userId: req.user.id },
      include: {
        baseProduct: true,
        products: {
          include: {
            artwork: true
          }
        }
      }
    });
    res.json(campaigns);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const createCampaign = async (req, res) => {
  try {
    let { title, slug, products, baseProductId, storeId } = req.body;

    if (baseProductId) {
      const exists = await prisma.baseProduct.findUnique({ where: { id: baseProductId } });
      if (!exists) baseProductId = null;
    }

    if (!baseProductId) {
      const firstBase = await prisma.baseProduct.findFirst();
      if (firstBase) {
        baseProductId = firstBase.id;
      } else {
        // Create a default base product if the table is empty to avoid FK violation
        console.log("[createCampaign] Table BaseProduct is empty. Creating default base...");
        const defaultBase = await prisma.baseProduct.create({
          data: {
            id: "default-tee",
            name: "Premium Cotton Tee",
            category: "unisex",
            costPrice: 7.5,
            image: "/assets/tshirt-man/t-men-1.webp"
          }
        });
        baseProductId = defaultBase.id;
      }
    }

    // 2. Validate required fields
    if (!title || !baseProductId || !Array.isArray(products) || !storeId) {
      return res.status(400).json({ message: 'Missing fields (title, baseProductId, products, or storeId)' });
    }

    // Verify store ownership
    const storeCheck = await prisma.store.findUnique({
      where: { id: storeId }
    });
    if (!storeCheck || storeCheck.userId !== req.user.id) {
      return res.status(403).json({ message: 'Invalid or unauthorized storeId' });
    }

    // Prepare CampaignProduct records
    const campaignProducts = products.map(p => {
      // 1. Handle design image saving if it's Base64
      let designerDraft = p.designerDraft ? { ...p.designerDraft } : null;
      let artworkUrl = designerDraft?.designImageDataUrl;
      
      // If it's a Base64 data URL, save it to disk
      if (typeof artworkUrl === 'string' && artworkUrl.startsWith('data:image')) {
        const savedPath = saveBase64Image(artworkUrl);
        if (savedPath) {
          artworkUrl = savedPath;
          // IMPORTANT: Remove the massive Base64 from the JSON draft to save space in DB
          if (designerDraft) {
            delete designerDraft.designImageDataUrl;
          }
        }
      }

      // catalogId could be a string (like "local-...") or a fixed ID. 
      const catId = p.catalogId ? String(p.catalogId) : (p.id ? String(p.id) : null);

      return {
        catalogId: catId,
        name: p.name || p.title || "Product",
        category: p.category || "",
        subCategory: p.subCategory || "",
        salePrice: parseFloat(p.retailPrice || p.salePrice || 0),
        img: p.img || p.previewUrl || "",
        designerDraft: designerDraft,
        artwork: artworkUrl 
          ? { create: { 
              title: `Design for ${title || 'Campaign'} - ${p.name || 'Item'}`,
              fileUrl: artworkUrl, 
              userId: req.user.id
            } }
          : undefined
      };
    });

    const newCampaign = await prisma.campaign.create({
      data: {
        title,
        slug: slug || `camp-${Date.now()}`,
        userId: req.user.id,
        storeId,
        baseProductId,
        products: {
          create: campaignProducts
        }
      },
      include: {
        products: {
          include: {
            artwork: true
          }
        }
      }
    });

    // --- NEW: Automate Publication to Store (Isolated) ---
    try {
        // Find or create a default "Home" collection for THIS specific store
        let collection = await prisma.collection.findFirst({
          where: { storeId: storeId, parentId: null, slug: 'home' }
        });

        if (!collection) {
          try {
            collection = await prisma.collection.create({
              data: {
                storeId: storeId,
                name: 'Home',
                slug: 'home'
              }
            });
          } catch (createErr) {
            // If it failed due to unique constraint, it means another process created it
            if (createErr.code === 'P2002') {
              collection = await prisma.collection.findFirst({
                where: { storeId: storeId, parentId: null, slug: 'home' }
              });
            } else {
              throw createErr;
            }
          }
        }

        // Link the new campaign to this specific store's collection
        if (collection && collection.id) {
          await prisma.collectionCampaign.create({
            data: {
              collectionId: collection.id,
              campaignId: newCampaign.id
            }
          });
        }

        // Update the store's published timestamp
        await prisma.store.update({
          where: { id: storeId },
          data: { collectionsPublishedAt: new Date() }
        });

        console.log(`[createCampaign] Automatically linked campaign ${newCampaign.id} to store ${storeId} and published.`);
    } catch (pubErr) {
      console.error("[createCampaign] Auto-publish failed:", pubErr.message);
    }

    // Log Activity
    await logTask(req.user.id, "Create Campaign", "Success", `Created campaign: ${title} (${products.length} products)`);

    res.json(newCampaign);
  } catch (err) {
    console.error("[createCampaign] error:", err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deleteCampaign = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ message: 'Invalid campaign id' });
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id }
    });

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (campaign.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Prisma will handle dependent product deletions if cascade is set, 
    // otherwise we delete them manually. Let's delete them for safety.
    await prisma.campaignProduct.deleteMany({
      where: { campaignId: id }
    });

    await prisma.campaign.delete({
      where: { id }
    });

    // Log Activity
    await logTask(req.user.id, "Delete Campaign", "Success", `Deleted campaign: ${campaign.name || id}`);

    res.json({ message: 'Campaign removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

module.exports = {
  getCampaigns,
  createCampaign,
  deleteCampaign
};
