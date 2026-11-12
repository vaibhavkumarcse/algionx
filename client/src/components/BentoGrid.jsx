import React, { useState } from 'react';
import { ArrowUpRight, Heart, Sparkles, Filter, ChevronDown } from 'lucide-react';
import ProductCard from './ProductCard';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function BentoGrid({ products, onSelectCategory, selectedCategory }) {
  const { setQuickViewProduct, addToCart, formatPrice } = useCart();
  const { isWishlisted, toggleWishlist, isAuthenticated } = useAuth();
  const [selectedSeason, setSelectedSeason] = useState('2024 Collections');
  const [seasonDropdownOpen, setSeasonDropdownOpen] = useState(false);

  const categories = ['All', 'Men', 'Women', 'Kids', 'Footwear', 'Bags', 'Accessories'];
  const seasons = ['2024 Collections', 'ALGIONX Seasons', 'Futuristic Tech', 'Atelier Edition'];

  // Identify special hero bento products
  const heroModelProduct = products.find((p) => p.isHeroBento && p.title.includes('Urban Sun')) || products[6] || products[0];
  const alpineModelProduct = products.find((p) => p.isHeroBento && p.title.includes('Alpine')) || products[9] || products[1];

  // Standard product cards
  const standardProducts = products.filter(
    (p) => p._id !== heroModelProduct?._id && p._id !== alpineModelProduct?._id
  );

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
          ALGIONX Seasons
        </span>
        <h2 className="text-3xl sm:text-5xl font-serif text-zinc-950 font-normal tracking-tight">
          Details with <span className="italic font-light">eco-friendly</span> materials
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 font-light max-w-lg mx-auto">
          Thoughtfully curated garments woven with organic cotton, mulberry silk, and regenerative plant-based fibers.
        </p>
      </div>

      {/* Filter Tabs & Collection Selector */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 pb-6 border-b border-zinc-200/80">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 custom-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-zinc-950 text-white shadow-sm'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
              }`}
            >
              {cat === 'Men' ? 'For Men' : cat}
            </button>
          ))}
        </div>

        {/* Season Dropdown */}
        <div className="relative self-end sm:self-auto">
          <button
            onClick={() => setSeasonDropdownOpen(!seasonDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-300 hover:border-black text-xs font-medium text-zinc-800 bg-white shadow-xs transition-colors"
          >
            <span>{selectedSeason}</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
          </button>

          {seasonDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-zinc-200 rounded-2xl shadow-xl py-2 z-30 animate-fade-in">
              {seasons.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSelectedSeason(s);
                    setSeasonDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs hover:bg-zinc-50 transition-colors ${
                    selectedSeason === s ? 'font-semibold text-black bg-zinc-50' : 'text-zinc-600'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Editorial Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Column 1: Items 0 & 1 */}
        {standardProducts[0] && <ProductCard product={standardProducts[0]} />}
        {standardProducts[1] && <ProductCard product={standardProducts[1]} />}

        {/* Column 2 & 3: Featured Tall Lifestyle Bento Card (Yellow Tee Model) */}
        {heroModelProduct && (
          <div
            onClick={() => setQuickViewProduct(heroModelProduct)}
            className="group relative sm:col-span-2 sm:row-span-2 bg-[#EAE8E1] rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 min-h-[460px] flex flex-col justify-between p-6 sm:p-8"
          >
            {/* Background Lifestyle Photography */}
            <div className="absolute inset-0">
              <img
                src={heroModelProduct.image}
                alt={heroModelProduct.title}
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 filter contrast-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            </div>

            {/* Top Tag & Wishlist */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="text-[11px] font-semibold tracking-widest uppercase px-3 py-1 rounded-full bg-white/90 text-zinc-900 shadow-sm backdrop-blur-sm">
                Featured Editorial
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isAuthenticated) return alert('Please sign in to save pieces.');
                  toggleWishlist(heroModelProduct._id);
                }}
                className="w-9 h-9 rounded-full bg-white/80 hover:bg-white text-zinc-900 flex items-center justify-center transition-all shadow-sm"
              >
                <Heart
                  className={`w-4 h-4 ${
                    isWishlisted(heroModelProduct._id) ? 'fill-rose-500 text-rose-500' : ''
                  }`}
                />
              </button>
            </div>

            {/* Bottom Overlay Content */}
            <div className="relative z-10 space-y-3">
              <div className="space-y-1">
                <span className="text-[11px] text-zinc-300 font-medium uppercase tracking-wider">
                  Urban Ease Atelier
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif text-white font-medium">
                  {heroModelProduct.title}
                </h3>
                <p className="text-xs text-zinc-200 line-clamp-2 font-light">
                  {heroModelProduct.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-lg font-bold text-white">
                  {formatPrice ? formatPrice(heroModelProduct.price) : `₹${heroModelProduct.price}`}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(heroModelProduct, 1, 'L');
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-zinc-950 font-semibold text-xs hover:bg-zinc-100 transition-all shadow-md group-hover:scale-105"
                >
                  <span>Quick Add</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Column 4: Items 2 & 3 */}
        {standardProducts[2] && <ProductCard product={standardProducts[2]} />}
        {standardProducts[3] && <ProductCard product={standardProducts[3]} />}

        {/* Second Row Standard Cards */}
        {standardProducts[4] && <ProductCard product={standardProducts[4]} />}
        {standardProducts[5] && <ProductCard product={standardProducts[5]} />}

        {/* Column: Alpine Lifestyle Card */}
        {alpineModelProduct && (
          <div
            onClick={() => setQuickViewProduct(alpineModelProduct)}
            className="group relative sm:col-span-1 sm:row-span-2 bg-[#E4E2DC] rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 min-h-[420px] flex flex-col justify-between p-6"
          >
            <div className="absolute inset-0">
              <img
                src={alpineModelProduct.image}
                alt={alpineModelProduct.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>
            </div>

            <div className="relative z-10 flex items-center justify-between">
              <span className="text-[10px] font-semibold tracking-widest uppercase px-2.5 py-1 rounded-full bg-white/90 text-zinc-900">
                Gorpcore
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isAuthenticated) return alert('Please sign in to save pieces.');
                  toggleWishlist(alpineModelProduct._id);
                }}
                className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-zinc-900 flex items-center justify-center transition-all"
              >
                <Heart
                  className={`w-4 h-4 ${
                    isWishlisted(alpineModelProduct._id) ? 'fill-rose-500 text-rose-500' : ''
                  }`}
                />
              </button>
            </div>

            <div className="relative z-10 space-y-2">
              <h3 className="text-lg font-serif text-white font-medium line-clamp-1">
                {alpineModelProduct.title}
              </h3>
              <p className="text-[11px] text-zinc-300 line-clamp-2">
                {alpineModelProduct.subtitle}
              </p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-sm font-bold text-white">
                  {formatPrice ? formatPrice(alpineModelProduct.price) : `₹${alpineModelProduct.price}`}
                </span>
                <span className="text-[11px] font-semibold text-white underline underline-offset-4">
                  View Piece
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Remaining standard cards */}
        {standardProducts[6] && <ProductCard product={standardProducts[6]} />}
        {standardProducts[7] && <ProductCard product={standardProducts[7]} />}
        {standardProducts[8] && <ProductCard product={standardProducts[8]} />}
      </div>
    </section>
  );
}

