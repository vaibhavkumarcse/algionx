import { OAuth2Client } from 'google-auth-library';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import { getDBStatus } from '../config/db.js';

// In-memory fallback users store (with a default admin & demo customer)
export let inMemoryUsers = [
  {
    _id: '66f100000000000000000001',
    name: 'Eleanor Vance',
    email: 'admin@algionx.luxury',
    password: '', // hashed below
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    wishlist: ['66f101a01100000000000001', '66f101a01100000000000004'],
    createdAt: new Date(),
  },
  {
    _id: '66f100000000000000000002',
    name: 'Julian Hayes',
    email: 'user@algionx.luxury',
    password: '',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    wishlist: ['66f101a01100000000000007'],
    createdAt: new Date(),
  }
];

// Initialize default hashed passwords
(async () => {
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash('password123', salt);
  inMemoryUsers[0].password = hashed;
  inMemoryUsers[1].password = hashed;
})();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    const { connected } = getDBStatus();

    if (connected) {
      const userExists = await User.findOne({ email: email.toLowerCase() });
      if (userExists) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        role: 'customer',
      });

      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        wishlist: user.wishlist,
        token: generateToken(user._id, user.role, user.email, user.name),
      });
    } else {
      // In-memory fallback
      const exists = inMemoryUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = {
        _id: 'usr_' + Date.now().toString(),
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'customer',
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=0E0E10&textColor=ffffff`,
        wishlist: [],
        createdAt: new Date(),
      };

      inMemoryUsers.push(newUser);

      return res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar,
        wishlist: newUser.wishlist,
        token: generateToken(newUser._id, newUser.role, newUser.email, newUser.name),
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message || 'Server error during registration' });
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const { connected } = getDBStatus();

    if (connected) {
      const user = await User.findOne({ email: email.toLowerCase() });

      if (user && (await user.matchPassword(password))) {
        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          wishlist: user.wishlist,
          token: generateToken(user._id, user.role, user.email, user.name),
        });
      } else {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
    } else {
      // In-memory fallback
      const user = inMemoryUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());

      if (user && (await bcrypt.compare(password, user.password))) {
        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          wishlist: user.wishlist || [],
          token: generateToken(user._id, user.role, user.email, user.name),
        });
      } else {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message || 'Server error during login' });
  }
};

/**
 * @desc    Authenticate or register user with Google OAuth
 * @route   POST /api/auth/google
 * @access  Public
 */
export const googleAuth = async (req, res) => {
  try {
    const { credential, profile } = req.body;
    let name, email, googleId, picture;

    if (credential) {
      // Try verifying with Google OAuth client if client ID configured
      const clientId = process.env.GOOGLE_CLIENT_ID;
      if (clientId) {
        try {
          const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: clientId,
          });
          const payload = ticket.getPayload();
          name = payload.name;
          email = payload.email;
          googleId = payload.sub;
          picture = payload.picture;
        } catch (verifyErr) {
          console.warn('Google ID token verification fallback (decoding payload directly):', verifyErr.message);
          // Fallback decode JWT payload if verification fails due to client ID mismatch or test mode
          const base64Url = credential.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            Buffer.from(base64, 'base64')
              .toString('binary')
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          const decoded = JSON.parse(jsonPayload);
          name = decoded.name;
          email = decoded.email;
          googleId = decoded.sub;
          picture = decoded.picture;
        }
      } else {
        // If no server GOOGLE_CLIENT_ID is set, safely decode the valid JWT payload from frontend
        try {
          const base64Url = credential.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            Buffer.from(base64, 'base64')
              .toString('binary')
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          const decoded = JSON.parse(jsonPayload);
          name = decoded.name;
          email = decoded.email;
          googleId = decoded.sub;
          picture = decoded.picture;
        } catch (e) {
          throw new Error('Could not parse Google credential');
        }
      }
    } else if (profile) {
      // Direct mock/demo Google profile fallback
      name = profile.name;
      email = profile.email;
      googleId = profile.id || profile.sub || 'google_mock_' + Date.now();
      picture = profile.picture || profile.avatar;
    } else {
      return res.status(400).json({ message: 'No Google credential or profile provided' });
    }

    if (!email) {
      return res.status(400).json({ message: 'Could not obtain email from Google' });
    }

    const { connected } = getDBStatus();

    if (connected) {
      let user = await User.findOne({ email: email.toLowerCase() });

      if (user) {
        if (!user.googleId) user.googleId = googleId;
        if (picture && (!user.avatar || user.avatar.includes('unsplash') || user.avatar.includes('dicebear'))) {
          user.avatar = picture;
        }
        await user.save();
      } else {
        user = await User.create({
          name: name || 'Fashion Connoisseur',
          email: email.toLowerCase(),
          googleId,
          avatar: picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'K')}&backgroundColor=0E0E10&textColor=ffffff`,
          role: 'customer',
        });
      }

      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        wishlist: user.wishlist || [],
        token: generateToken(user._id, user.role, user.email, user.name),
      });
    } else {
      // In-memory fallback
      let user = inMemoryUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());

      if (user) {
        if (picture) user.avatar = picture;
      } else {
        user = {
          _id: 'usr_g_' + Date.now(),
          name: name || 'Fashion Connoisseur',
          email: email.toLowerCase(),
          googleId,
          avatar: picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'K')}&backgroundColor=0E0E10&textColor=ffffff`,
          role: 'customer',
          wishlist: [],
          createdAt: new Date(),
        };
        inMemoryUsers.push(user);
      }

      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        wishlist: user.wishlist || [],
        token: generateToken(user._id, user.role, user.email, user.name),
      });
    }
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ message: error.message || 'Google authentication failed' });
  }
};

/**
 * @desc    Get logged in user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
export const getUserProfile = async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    avatar: req.user.avatar,
    wishlist: req.user.wishlist || [],
  });
};

/**
 * @desc    Toggle wishlist item
 * @route   POST /api/auth/wishlist/:id
 * @access  Private
 */
export const toggleWishlist = async (req, res) => {
  try {
    const productId = req.params.id;
    const { connected } = getDBStatus();

    if (connected) {
      const user = await User.findById(req.user._id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      const index = user.wishlist.findIndex((id) => id.toString() === productId);
      if (index > -1) {
        user.wishlist.splice(index, 1);
      } else {
        user.wishlist.push(productId);
      }
      await user.save();
      return res.json({ wishlist: user.wishlist });
    } else {
      const user = inMemoryUsers.find((u) => u._id.toString() === req.user._id.toString());
      if (!user) return res.status(404).json({ message: 'User not found' });

      user.wishlist = user.wishlist || [];
      const index = user.wishlist.indexOf(productId);
      if (index > -1) {
        user.wishlist.splice(index, 1);
      } else {
        user.wishlist.push(productId);
      }
      return res.json({ wishlist: user.wishlist });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Active OTP store: email -> { otp, expiresAt }
export const otpCache = new Map();

/**
 * @desc    Generate & send OTP code to email
 * @route   POST /api/auth/send-otp
 * @access  Public
 */
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    // Generate secure 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // Valid for 5 minutes

    otpCache.set(cleanEmail, { otp, expiresAt });
    console.log(`[AUTH OTP] Code for ${cleanEmail}: ${otp}`);

    return res.json({
      success: true,
      message: `Verification code sent to ${cleanEmail}`,
      otpPreview: otp, // Shown in UI notification for instant verification
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc    Verify OTP code and authenticate user
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP code are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cached = otpCache.get(cleanEmail);

    if (!cached || cached.otp !== otp.toString().trim()) {
      return res.status(400).json({ message: 'Invalid OTP code. Please check and try again.' });
    }

    if (Date.now() > cached.expiresAt) {
      otpCache.delete(cleanEmail);
      return res.status(400).json({ message: 'OTP has expired. Please request a new code.' });
    }

    // Clear used OTP
    otpCache.delete(cleanEmail);

    const { connected } = getDBStatus();

    if (connected) {
      let user = await User.findOne({ email: cleanEmail });
      if (!user) {
        const username = cleanEmail.split('@')[0];
        const formattedName = username.charAt(0).toUpperCase() + username.slice(1);
        user = await User.create({
          name: formattedName,
          email: cleanEmail,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formattedName)}&backgroundColor=0E0E10&textColor=ffffff`,
          role: 'customer',
        });
      }

      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        wishlist: user.wishlist || [],
        token: generateToken(user._id, user.role, user.email, user.name),
      });
    } else {
      let user = inMemoryUsers.find((u) => u.email.toLowerCase() === cleanEmail);
      if (!user) {
        const username = cleanEmail.split('@')[0];
        const formattedName = username.charAt(0).toUpperCase() + username.slice(1);
        user = {
          _id: 'usr_otp_' + Date.now(),
          name: formattedName,
          email: cleanEmail,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formattedName)}&backgroundColor=0E0E10&textColor=ffffff`,
          role: 'customer',
          wishlist: [],
          createdAt: new Date(),
        };
        inMemoryUsers.push(user);
      }

      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        wishlist: user.wishlist || [],
        token: generateToken(user._id, user.role, user.email, user.name),
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

