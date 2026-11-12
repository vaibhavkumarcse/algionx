import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { inMemoryUsers } from '../controllers/authController.js';
import { getDBStatus } from '../config/db.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const secret = process.env.JWT_SECRET || 'kosis_luxury_super_secret_jwt_key_2026_fashion';
      const decoded = jwt.verify(token, secret);

      const dbStatus = getDBStatus();
      if (dbStatus.connected) {
        req.user = await User.findById(decoded.id).select('-password');
      } else {
        let memUser = inMemoryUsers.find((u) => u._id.toString() === decoded.id.toString());
        if (!memUser && decoded.email) {
          memUser = inMemoryUsers.find((u) => u.email.toLowerCase() === decoded.email.toLowerCase());
        }
        if (!memUser) {
          // If server was restarted, seamlessly restore the user session from the valid JWT
          memUser = {
            _id: decoded.id || ('usr_' + Date.now()),
            name: decoded.name || (decoded.email ? decoded.email.split('@')[0] : 'Valued Client'),
            email: decoded.email || 'client@algionx.luxury',
            role: decoded.role || 'customer',
            avatar: decoded.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
            wishlist: [],
            createdAt: new Date(),
          };
          inMemoryUsers.push(memUser);
        }
        const { password, ...userWithoutPass } = memUser;
        req.user = userWithoutPass;
      }

      if (!req.user) {
        return res.status(401).json({ message: 'User not found or authorization revoked' });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admin authorization required' });
  }
};

