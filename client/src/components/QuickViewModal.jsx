import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Heart, ShoppingBag, ShieldCheck, Truck, RefreshCw, Star, Check, ExternalLink } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function QuickViewModal() {
  const navigate = useNavigate();
  const { quickViewProduct, setQuickViewProduct, addToCart, formatPrice } = useCart();
  const { isWishlisted, toggleWishlist, isAuthenticated } = useAuth();

  if (!quickViewProduct) return null;

  const [selectedSize, setSelectedSize] = useState(quickViewProduct.sizes?.[0] || 'M');
  const [selectedColor, setSelectedColor] = useState(quickViewProduct.colors?.[0] || 'Olive');
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(quickViewProduct.image);

  const wishlisted = isWishlisted(quickViewProduct._id);

  const handleAdd = () => {
    addToCart(quickViewProduct, qty, selectedSize, selectedColor);
    setQuickViewProduct(null);
  };

  const images = quickViewProduct.images?.length
    ? quickViewProduct.images
    : [quickViewProduct.image];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        onClick={() => setQuickViewProduct(null)}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl z-10 animate-fade-in border border-zinc-200">
        {/* Close Button */}
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-5 right-5 z-20 w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Product Images */}
          <div className="bg-[#F6F5F2] p-6 flex flex-col justify-between">
            <div className="aspect-square rounded-2xl overflow-hidden bg-white/60 flex items-center justify-center">
              <img
                src={activeImage}
                alt={quickViewProduct.title}
                className="w-full h-full object-cover rounded-2xl transition-all"
              />
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImage === img ? 'border-zinc-950 scale-105' : 'border-transparent opacity-70'
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details & Purchase Form */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              {/* Category & Rating */}
              <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                <span className="font-semibold uppercase tracking-wider text-zinc-400">
                  {quickViewProduct.category} · {quickViewProduct.season}
                </span>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-zinc-900">{quickViewProduct.rating || 4.9}</span>
                  <span className="text-zinc-400">({quickViewProduct.reviewsCount || 24})</span>
                </div>
              </div>

              {/* Title & Price */}
              <h2 className="text-2xl font-serif text-zinc-950 font-medium">
                {quickViewProduct.title}
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                {quickViewProduct.subtitle}
              </p>

              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-2xl font-bold text-zinc-950">
                  {formatPrice ? formatPrice(quickViewProduct.price) : `₹${quickViewProduct.price}`}
                </span>
                {quickViewProduct.originalPrice > quickViewProduct.price && (
                  <span className="text-sm text-zinc-400 line-through">
                    {formatPrice ? formatPrice(quickViewProduct.originalPrice) : `₹${quickViewProduct.originalPrice}`}
                  </span>
                )}
                {quickViewProduct.isEcoFriendly && (
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Eco-Friendly
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-zinc-600 mt-4 leading-relaxed font-light">
                {quickViewProduct.description}
              </p>
            </div>

            {/* Selectors */}
            <div className="space-y-4">
              {/* Size Selector */}
              {quickViewProduct.sizes && quickViewProduct.sizes.length > 0 && (
                <div>
                  <div className="flex justify-between text-xs font-semibold text-zinc-800 mb-2">
                    <span>Select Size</span>
                    <span className="text-zinc-400 font-normal underline cursor-pointer">Size Guide</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {quickViewProduct.sizes.map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setSelectedSize(sz)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          selectedSize === sz
                            ? 'bg-zinc-950 text-white shadow-sm'
                            : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Swatches */}
              {quickViewProduct.colors && quickViewProduct.colors.length > 0 && (
                <div>
                  <span className="block text-xs font-semibold text-zinc-800 mb-2">
                    Color: <span className="font-normal text-zinc-600">{selectedColor}</span>
                  </span>
                  <div className="flex gap-2">
                    {quickViewProduct.colors.map((col) => (
                      <button
                        key={col}
                        onClick={() => setSelectedColor(col)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                          selectedColor === col
                            ? 'border-zinc-950 bg-zinc-950 text-white'
                            : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400'
                        }`}
                      >
                        {col}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock status */}
              <div className="flex items-center gap-2 text-[11px] text-emerald-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>In stock · Ready for worldwide dispatch</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleAdd}
                className="flex-1 flex items-center justify-center gap-2 bg-zinc-950 hover:bg-black text-white py-3.5 rounded-full font-semibold text-xs tracking-wider uppercase transition-all shadow-xl hover:scale-[1.01]"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Bag</span>
              </button>

              <button
                onClick={() => {
                  const id = quickViewProduct._id;
                  setQuickViewProduct(null);
                  navigate(`/product/${id}`);
                }}
                className="flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-full border border-zinc-300 hover:border-zinc-950 text-zinc-900 font-semibold text-xs tracking-wider uppercase transition-colors"
                title="View Full Product Page"
              >
                <span>Full Details</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  if (!isAuthenticated) return alert('Please sign in to save pieces.');
                  toggleWishlist(quickViewProduct._id);
                }}
                className="w-12 h-12 rounded-full border border-zinc-300 hover:border-zinc-950 flex items-center justify-center text-zinc-700 transition-colors"
                title="Wishlist"
              >
                <Heart
                  className={`w-5 h-5 ${wishlisted ? 'fill-rose-500 text-rose-500' : ''}`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

