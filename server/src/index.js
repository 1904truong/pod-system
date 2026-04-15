const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const prisma = require('./utils/prisma');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Trả về thư mục uploads tĩnh để load hình ảnh local
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/stores', require('./routes/storeRoutes'));
app.use('/api/stores/:storeId/collections', require('./routes/collectionRoutes'));
app.use('/api/stores/:storeId/discounts', require('./routes/discountRoutes'));
app.use('/api/campaigns', require('./routes/campaignRoutes'));
app.use('/api/artworks', require('./routes/artworkRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/wallet', require('./routes/walletRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/public', require('./routes/publicStoreRoutes'));

// Default route
app.get('/', (req, res) => {
  res.send('Welcome to POD System API');
});

const PORT = process.env.PORT || 5000;

const start = async () => {
  if (!process.env.DATABASE_URL) {
    console.error('Missing DATABASE_URL. Check server/.env');
    process.exit(1);
  }

  try {
    await prisma.$connect();
    console.log('Connected to database');
  } catch (err) {
    console.error('Failed to connect to database. Check DATABASE_URL and ensure MongoDB is reachable.');
    console.error(err);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

process.on('SIGINT', async () => {
  try {
    await prisma.$disconnect();
  } finally {
    process.exit(0);
  }
});

process.on('SIGTERM', async () => {
  try {
    await prisma.$disconnect();
  } finally {
    process.exit(0);
  }
});

start();
