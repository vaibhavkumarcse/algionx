import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, getDBStatus } from '../server/config/db.js';
import { notFound, errorHandler } from '../server/middleware/errorMiddleware.js';
import authRoutes from '../server/routes/authRoutes.js';
import productRoutes from '../server/routes/productRoutes.js';
import orderRoutes from '../server/routes/orderRoutes.js';
import paymentRoutes from '../server/routes/paymentRoutes.js';
import { isConfigured as isRazorpayConfigured, getRazorpayKey } from '../server/config/razorpay.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../server/.env') });
dotenv.config();

const app = express();

// Ensure DB connects on invocation
connectDB().catch((err) => {
  console.warn('Vercel serverless DB initialization notice:', err.message);
});

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
    service: 'ALGIONX Luxury Fashion Platform API (Vercel Serverless)',
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

app.use(notFound);
app.use(errorHandler);

export default app;

