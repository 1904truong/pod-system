const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.DATABASE_URL;
const client = new MongoClient(uri);

const baseProducts = [
  { _id: '1', name: 'Classic Unisex T-shirt', category: 'unisex', costPrice: 6.98, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop' },
  { _id: '2', name: "Premium Men's Hoodie", category: 'unisex', costPrice: 19.99, image: 'https://images.unsplash.com/photo-1556821552-5b0d4c2b9d4a?w=400&h=400&fit=crop' },
  { _id: '3', name: 'Classic Sweatshirt', category: 'unisex', costPrice: 14.50, image: 'https://images.unsplash.com/photo-1556821552-5b0d4c2b9d4a?w=400&h=400&fit=crop' },
  { _id: '4', name: "Women's Crop Top", category: 'female', costPrice: 11.20, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop' },
  { _id: '5', name: 'Comfort Colors Tee', category: 'unisex', costPrice: 13.49, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop' },
  { _id: '6', name: 'Classic Polo Shirt', category: 'unisex', costPrice: 15.60, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop' },
  { _id: '7', name: 'All-Over Print Tee', category: 'unisex', costPrice: 18.30, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop' },
  { _id: '8', name: 'Premium Hoodie', category: 'unisex', costPrice: 22.50, image: 'https://images.unsplash.com/photo-1556821552-5b0d4c2b9d4a?w=400&h=400&fit=crop' }
];

async function run() {
  try {
    await client.connect();
    const database = client.db(); // uses db from connection string
    const collection = database.collection('BaseProduct');
    
    console.log("Seeding BaseProduct via Native Driver...");
    for (const p of baseProducts) {
      await collection.updateOne({ _id: p._id }, { $set: p }, { upsert: true });
    }
    console.log("Successfully seeded BaseProduct IDs 1-8");
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
