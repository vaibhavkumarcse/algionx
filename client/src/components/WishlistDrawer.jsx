import React from 'react';
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

export default function WishlistDrawer({ isOpen, onClose, allProducts }) {
  const { user, isAuthenticated, toggleWishlist } = useAuth();
  const { addToCart, formatPrice } = useCart();

  if (!isOpen) return null;

  const wishlistedIds = user?.wishlist || [];
  const wishlistedProducts = allProducts.filter((p) =>
    wishlistedIds.some((id) => (typeof id === 'string' ? id : id._id || id.toString()) === p._id.toString())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-slide-left">
          {/* Header */}
          <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              <h2 className="text-base font-semibold text-zinc-950">
                Your Saved Pieces ({wishlistedProducts.length})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-zinc-100 text-zinc-500 hover:text-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {!isAuthenticated ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-12">
                <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                  <Heart className="w-8 h-8" />
                </div>
                <h3 className="text-base font-medium text-zinc-900">Sign in to save pieces</h3>
                <p className="text-xs text-zinc-500 max-w-xs">
                  Create a wishlist across your devices and receive private drop notifications.
                </p>
                <Link
                  to="/signin"
                  onClick={onClose}
                  className="mt-2 px-6 py-2.5 rounded-full bg-zinc-950 text-white text-xs font-semibold hover:bg-zinc-800"
                >
                  Sign In / Register
                </Link>
              </div>
            ) : wishlistedProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-12">
                <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                  <Heart className="w-8 h-8" />
                </div>
                <h3 className="text-base font-medium text-zinc-900">Your wishlist is empty</h3>
                <p className="text-xs text-zinc-500 max-w-xs">
                  Tap the heart icon on any piece to save it for your bespoke wardrobe edit.
                </p>
              </div>
            ) : (
              wishlistedProducts.map((product) => (
                <div
                  key={product._id}
                  className="flex gap-4 p-3 rounded-2xl bg-[#F6F5F2] border border-zinc-200/60"
                >
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold text-xs text-zinc-900 line-clamp-1">
                          {product.title}
                        </h4>
                        <button
                          onClick={() => toggleWishlist(product._id)}
                          className="text-zinc-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-zinc-500">{product.subtitle}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="font-semibold text-xs text-zinc-950">
                        {formatPrice ? formatPrice(product.price) : `₹${product.price}`}
                      </span>
                      <button
                        onClick={() => {
                          addToCart(product, 1, product.sizes?.[0] || 'M');
                          toggleWishlist(product._id);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-950 text-white text-[11px] font-semibold hover:bg-zinc-800 transition-colors"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>Move to Bag</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

