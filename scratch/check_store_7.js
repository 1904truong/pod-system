
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStore7() {
  try {
    const store = await prisma.store.findFirst({
      where: { id: 7 },
      include: {
        campaigns: {
          include: {
            baseProduct: true,
            products: {
              include: {
                artwork: true
              }
            }
          }
        }
      }
    });

    if (!store) {
      console.log("Store 7 not found");
      return;
    }

    console.log("Store ID:", store.id);
    console.log("Store URL:", store.storeUrl);

    store.campaigns.forEach(campaign => {
      console.log("\nCampaign ID:", campaign.id);
      console.log("Campaign Title:", campaign.title);
      console.log("Base Product Image:", campaign.baseProduct?.image);
      
      campaign.products.forEach(product => {
        console.log("  Product ID:", product.id);
        console.log("  Product Name:", product.name);
        console.log("  Preview URL:", product.previewUrl);
        console.log("  Designer Draft:", !!product.designerDraft);
      });
    });

  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStore7();
