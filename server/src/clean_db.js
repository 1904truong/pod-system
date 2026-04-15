const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Đang dọn dẹp Database MongoDB Atlas ---');

  // Xóa theo thứ tự để tránh lỗi ràng buộc (nếu có)
  await prisma.collectionCampaign.deleteMany({});
  await prisma.campaignProduct.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.discount.deleteMany({});
  await prisma.collection.deleteMany({});
  await prisma.campaign.deleteMany({});
  await prisma.artwork.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.wallet.deleteMany({});
  await prisma.setting.deleteMany({});
  await prisma.store.deleteMany({});
  await prisma.taskLog.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.baseProduct.deleteMany({});

  console.log('✔ Đã xóa sạch toàn bộ dữ liệu cũ.');

  // Nạp lại dữ liệu BaseProduct mẫu 1-8 để Catalog hoạt động
  console.log('--- Đang nạp lại 8 sản phẩm mẫu cho Catalog ---');
  const baseProducts = [
    { id: '1', name: 'Classic Unisex T-shirt', category: 'unisex', costPrice: 6.98, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop' },
    { id: '2', name: "Premium Men's Hoodie", category: 'unisex', costPrice: 19.99, image: 'https://images.unsplash.com/photo-1556821552-5b0d4c2b9d4a?w=400&h=400&fit=crop' },
    { id: '3', name: 'Classic Sweatshirt', category: 'unisex', costPrice: 14.50, image: 'https://images.unsplash.com/photo-1556821552-5b0d4c2b9d4a?w=400&h=400&fit=crop' },
    { id: '4', name: "Women's Crop Top", category: 'female', costPrice: 11.20, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop' },
    { id: '5', name: 'Comfort Colors Tee', category: 'unisex', costPrice: 13.49, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop' },
    { id: '6', name: 'Classic Polo Shirt', category: 'unisex', costPrice: 15.60, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop' },
    { id: '7', name: 'All-Over Print Tee', category: 'unisex', costPrice: 18.30, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop' },
    { id: '8', name: 'Premium Hoodie', category: 'unisex', costPrice: 22.50, image: 'https://images.unsplash.com/photo-1556821552-5b0d4c2b9d4a?w=400&h=400&fit=crop' }
  ];

  for (const p of baseProducts) {
    await prisma.baseProduct.create({ data: p });
  }

  console.log('✔ Đã nạp xong sản phẩm mẫu.');
  console.log('--- DATABASE ĐÃ TRỐNG VÀ SẴN SÀNG ---');
}

main()
  .catch((e) => {
    console.error('Lỗi khi dọn dẹp:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
