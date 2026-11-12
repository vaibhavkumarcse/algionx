import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { connectDB, getDBStatus } from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import Product from './models/Product.js';
import { sampleProducts } from './data/seedProducts.js';
import { isConfigured as isRazorpayConfigured, getRazorpayKey } from './config/razorpay.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from both root and server/.env
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);

// Health & System Info
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'ALGIONX Luxury Fashion Platform API',
  });
});

app.get('/api/system/status', (req, res) => {
  const dbStatus = getDBStatus();
  res.json({
    db: dbStatus,
    razorpay: {
      configured: isRazorpayConfigured,
      keyId: getRazorpayKey(),
      mode: isRazorpayConfigured ? 'Live / Test Active' : 'Sandbox Simulated Checkout'
    },
    googleAuth: {
      configured: Boolean(process.env.GOOGLE_CLIENT_ID),
      clientId: process.env.GOOGLE_CLIENT_ID || 'demo_mode_ready'
    }
  });
});

// Serve frontend build if dist folder exists
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // API Welcome
  app.get('/', (req, res) => {
    res.send('KOSIS Luxury Editorial Fashion MERN API is running.');
  });
  app.use(notFound);
}

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to DB and seed if necessary, then start listening
const startServer = async () => {
  const isConnected = await connectDB();

  if (isConnected) {
    try {
      const count = await Product.countDocuments();
      if (count === 0) {
        console.log(' Seeding initial luxury editorial catalog into MongoDB...');
        await Product.insertMany(sampleProducts);
        console.log(` Successfully seeded ${sampleProducts.length} products.`);
      }
    } catch (seedErr) {
      console.warn('Initial seeding note:', seedErr.message);
    }
  }

  app.listen(PORT, () => {
    console.log(`-----------------------------------------------------`);
    console.log(` ALGIONX MERN E-Commerce Platform live on port ${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(` Store Mode: ${getDBStatus().mode}`);
    console.log(` Razorpay: ${isRazorpayConfigured ? 'Configured' : 'Sandbox Ready'}`);
    console.log(` Google Auth: ${process.env.GOOGLE_CLIENT_ID ? 'Configured' : 'Ready'}`);
    console.log(` Access URL: http://localhost:${PORT}`);
    console.log(`-----------------------------------------------------`);
  });
};

startServer();
