const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function sync() {
  try {
    console.log("Starting sync of unlinked campaigns...");
    
    // 1. Find all campaigns
    const campaigns = await prisma.campaign.findMany({
      include: { user: { include: { stores: true } } }
    });

    for (const campaign of campaigns) {
      const store = (campaign.user.stores || [])[0];
      if (!store) {
        console.log(`Campaign ${campaign.id} has no store. Skipping.`);
        continue;
      }

      // Find or create Home collection
      let collection = await prisma.collection.findFirst({
        where: { storeId: store.id, parentId: null, slug: 'home' }
      });

      if (!collection) {
        collection = await prisma.collection.create({
          data: { storeId: store.id, name: 'Home', slug: 'home' }
        });
      }

      // Link if not already linked
      const link = await prisma.collectionCampaign.findUnique({
        where: { collectionId_campaignId: { collectionId: collection.id, campaignId: campaign.id } }
      });

      if (!link) {
        await prisma.collectionCampaign.create({
          data: { collectionId: collection.id, campaignId: campaign.id }
        });
        console.log(`Linked Campaign ${campaign.id} to Store ${store.id}.`);
      }

      // Final publish update
      await prisma.store.update({
        where: { id: store.id },
        data: { collectionsPublishedAt: new Date() }
      });
    }

    console.log("Sync complete.");
  } catch (err) {
    console.error("Sync failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

sync();
