import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CURRENCIES = {
  INR: { symbol: '₹', rate: 1, label: 'INR (₹)' },
};

const PROMO_CODES = {
  'ALGIONX15': { discount: 0.15, label: '15% Private Preview Atelier Discount' },
  'ATELIER20': { discount: 0.20, label: '20% Seasonal Capsule Special' },
  'FREESHIP': { discount: 0, freeShipping: true, label: 'Complimentary Worldwide Shipping' },
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('kosis_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [currency, setCurrency] = useState('INR');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');

  useEffect(() => {
    localStorage.setItem('kosis_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, qty = 1, size = 'M', color = 'Olive') => {
    const itemSize = size || (product.sizes?.[0] || 'M');
    const itemColor = color || (product.colors?.[0] || 'Default');
    const cartId = `${product._id}_${itemSize}_${itemColor}`;

    setCartItems((prev) => {
      const existing = prev.find((item) => item.cartId === cartId);
      if (existing) {
        return prev.map((item) =>
          item.cartId === cartId
            ? { ...item, qty: Math.min(item.qty + qty, product.stock || 20) }
            : item
        );
      }
      return [
        ...prev,
        {
          cartId,
          productId: product._id,
          title: product.title,
          subtitle: product.subtitle,
          price: product.price,
          image: product.image,
          size: itemSize,
          color: itemColor,
          qty,
          stock: product.stock || 20,
        },
      ];
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (cartId) => {
    setCartItems((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  const updateQuantity = (cartId, qty) => {
    if (qty <= 0) {
      removeFromCart(cartId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.cartId === cartId ? { ...item, qty: Math.min(qty, item.stock) } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedPromo(null);
  };

  const applyPromoCode = (code) => {
    setPromoError('');
    const clean = code.trim().toUpperCase();
    if (!clean) return false;

    if (PROMO_CODES[clean]) {
      setAppliedPromo({ code: clean, ...PROMO_CODES[clean] });
      return true;
    } else {
      setPromoError('Invalid promo code. Try ALGIONX15 or ATELIER20');
      return false;
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setPromoError('');
  };

  // Financial Calculations in Base USD
  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const rawSubtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  const discountAmount = appliedPromo?.discount
    ? Math.round(rawSubtotal * appliedPromo.discount)
    : 0;

  const cartSubtotal = Math.max(0, rawSubtotal - discountAmount);
  const freeShippingThreshold = 5000;
  const isFreeShipping =
    rawSubtotal >= freeShippingThreshold ||
    appliedPromo?.freeShipping ||
    cartItems.length === 0;

  const freeShippingProgress = Math.min(100, Math.round((rawSubtotal / freeShippingThreshold) * 100));
  const shippingFee = isFreeShipping ? 0 : 199;
  const tax = Math.round(cartSubtotal * 0.05);
  const grandTotal = cartSubtotal + shippingFee + tax;

  // Currency Converter helper - prices are directly in INR
  const formatPrice = (amount) => {
    return `₹${Math.round(amount || 0).toLocaleString('en-IN')}`;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        setIsCartOpen,
        quickViewProduct,
        setQuickViewProduct,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        rawSubtotal,
        discountAmount,
        cartSubtotal,
        freeShippingThreshold,
        freeShippingProgress,
        shippingFee,
        tax,
        grandTotal,
        currency,
        setCurrency,
        formatPrice,
        appliedPromo,
        promoError,
        applyPromoCode,
        removePromoCode,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
