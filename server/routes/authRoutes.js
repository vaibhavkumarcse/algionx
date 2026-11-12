import express from 'express';
import {
  registerUser,
  loginUser,
  googleAuth,
  getUserProfile,
  toggleWishlist,
  sendOTP,
  verifyOTP,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.get('/profile', protect, getUserProfile);
router.post('/wishlist/:id', protect, toggleWishlist);

export default router;

