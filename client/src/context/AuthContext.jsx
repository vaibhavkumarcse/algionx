import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('kosis_user');
    const token = localStorage.getItem('kosis_token');

    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
        // Verify with backend silently
        api.getProfile()
          .then((fresh) => {
            setUser((prev) => ({ ...prev, ...fresh }));
            localStorage.setItem('kosis_user', JSON.stringify({ ...JSON.parse(savedUser), ...fresh }));
          })
          .catch(() => {
            // keep cached user if offline
          });
      } catch (e) {
        localStorage.removeItem('kosis_user');
        localStorage.removeItem('kosis_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    setUser(data);
    localStorage.setItem('kosis_user', JSON.stringify(data));
    localStorage.setItem('kosis_token', data.token);
    return data;
  };

  const register = async (name, email, password) => {
    const data = await api.register(name, email, password);
    setUser(data);
    localStorage.setItem('kosis_user', JSON.stringify(data));
    localStorage.setItem('kosis_token', data.token);
    return data;
  };

  const requestOTP = async (email) => {
    return await api.sendOTP(email);
  };

  const loginWithOTP = async (email, otp) => {
    const data = await api.verifyOTP(email, otp);
    setUser(data);
    localStorage.setItem('kosis_user', JSON.stringify(data));
    localStorage.setItem('kosis_token', data.token);
    return data;
  };

  const loginWithGoogle = async (credential, profile) => {
    const data = await api.googleAuth(credential, profile);
    setUser(data);
    localStorage.setItem('kosis_user', JSON.stringify(data));
    localStorage.setItem('kosis_token', data.token);
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('kosis_user');
    localStorage.removeItem('kosis_token');
  };

  const toggleWishlist = async (productId) => {
    if (!user) {
      throw new Error('Please sign in to save items to your wishlist');
    }
    try {
      const res = await api.toggleWishlist(productId);
      const updatedWishlist = res.wishlist;
      const updatedUser = { ...user, wishlist: updatedWishlist };
      setUser(updatedUser);
      localStorage.setItem('kosis_user', JSON.stringify(updatedUser));
      return updatedWishlist;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const isWishlisted = (productId) => {
    if (!user || !user.wishlist) return false;
    return user.wishlist.some(
      (id) => (typeof id === 'string' ? id : id._id || id.toString()) === productId.toString()
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === 'admin',
        login,
        register,
        requestOTP,
        loginWithOTP,
        loginWithGoogle,
        logout,
        toggleWishlist,
        isWishlisted,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

