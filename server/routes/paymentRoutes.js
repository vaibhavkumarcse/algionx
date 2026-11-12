import express from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  getPaymentConfig,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/config', getPaymentConfig);
router.post('/create-order', protect, createPaymentOrder);
router.post('/verify-payment', protect, verifyPayment);

export default router;

