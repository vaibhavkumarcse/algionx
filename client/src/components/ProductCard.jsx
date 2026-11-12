import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product, onSelect }) {
  const navigate = useNavigate();
  const { isWishlisted, toggleWishlist, isAuthenticated } = useAuth();
  const { addToCart, setQuickViewProduct, formatPrice } = useCart();

  const wishlisted = isWishlisted(product._id);

  const handleWishlist = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      alert('Please sign in to save pieces to your wishlist.');
      return;
    }
    try {
      await toggleWishlist(product._id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    addToCart(product, 1, product.sizes?.[0] || 'M');
  };

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(product);
    } else {
      navigate(`/product/${product._id}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-[#F6F5F2] hover:bg-[#EFECE6] rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 cursor-pointer border border-transparent hover:border-zinc-300/60 shadow-sm hover:shadow-md"
    >
      {/* Top Badges & Wishlist Heart */}
      <div className="flex items-center justify-between z-10">
        <div>
          {product.isEcoFriendly && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full bg-white/80 text-zinc-800 shadow-2xs backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Eco
            </span>
          )}
        </div>

        <button
          onClick={handleWishlist}
          className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-zinc-700 hover:text-black flex items-center justify-center transition-all shadow-xs backdrop-blur-sm"
          title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              wishlisted ? 'fill-rose-500 text-rose-500' : 'text-zinc-600'
            }`}
          />
        </button>
      </div>

      {/* Product Image */}
      <div className="relative my-4 aspect-square flex items-center justify-center overflow-hidden rounded-2xl">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 rounded-2xl"
          loading="lazy"
        />

        {/* Hover Quick View Overlay button */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setQuickViewProduct(product);
            }}
            className="p-2.5 rounded-full bg-white text-zinc-950 shadow-lg hover:scale-110 transition-transform"
            title="Quick view modal"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={handleQuickAdd}
            className="p-2.5 rounded-full bg-zinc-950 text-white shadow-lg hover:scale-110 transition-transform"
            title="Add to bag"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="mt-2 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-sm text-zinc-900 group-hover:text-black line-clamp-1">
              {product.title}
            </h3>
            <p className="text-[11px] text-zinc-500 line-clamp-1">
              {product.subtitle || product.category}
            </p>
          </div>
          <div className="text-right">
            <span className="font-semibold text-sm text-zinc-950">
              {formatPrice ? formatPrice(product.price) : `₹${product.price}`}
            </span>
            {product.originalPrice > product.price && (
              <span className="block text-[10px] text-zinc-400 line-through">
                {formatPrice ? formatPrice(product.originalPrice) : `₹${product.originalPrice}`}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

