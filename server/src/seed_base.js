const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const baseProducts = [
  {
    id: '1',
    name: 'Classic Unisex T-shirt',
    category: 'unisex',
    costPrice: 6.98,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
  },
  {
    id: '2',
    name: "Premium Men's Hoodie",
    category: 'unisex',
    costPrice: 19.99,
    image: 'https://images.unsplash.com/photo-1556821552-5b0d4c2b9d4a?w=400&h=400&fit=crop',
  },
  {
    id: '3',
    name: 'Classic Sweatshirt',
    category: 'unisex',
    costPrice: 14.50,
    image: 'https://images.unsplash.com/photo-1556821552-5b0d4c2b9d4a?w=400&h=400&fit=crop',
  },
  {
    id: '4',
    name: "Women's Crop Top",
    category: 'female',
    costPrice: 11.20,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
  },
  {
    id: '5',
    name: 'Comfort Colors Tee',
    category: 'unisex',
    costPrice: 13.49,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
  },
  {
    id: '6',
    name: 'Classic Polo Shirt',
    category: 'unisex',
    costPrice: 15.60,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
  },
  {
    id: '7',
    name: 'All-Over Print Tee',
    category: 'unisex',
    costPrice: 18.30,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
  },
  {
    id: '8',
    name: 'Premium Hoodie',
    category: 'unisex',
    costPrice: 22.50,
    image: 'https://images.unsplash.com/photo-1556821552-5b0d4c2b9d4a?w=400&h=400&fit=crop',
  }
];

async function main() {
  console.log('Seeding base products...');
  for (const product of baseProducts) {
    await prisma.baseProduct.upsert({
      where: { id: product.id },
      update: product,
      create: product,
    });
  }
  console.log('Done!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
