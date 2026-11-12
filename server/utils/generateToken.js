import jwt from 'jsonwebtoken';

export const generateToken = (id, role = 'customer', email = '', name = '') => {
  const secret = process.env.JWT_SECRET || 'kosis_luxury_super_secret_jwt_key_2026_fashion';
  return jwt.sign({ id, role, email, name }, secret, {
    expiresIn: '30d',
  });
};

