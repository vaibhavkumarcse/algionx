import React, { useState } from 'react';
import { Search, X, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SearchModal({ isOpen, onClose, products = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  if (!isOpen) return null;

  const filtered = searchTerm.trim()
    ? products.filter(
        (p) =>
          p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const handleSelect = (productId) => {
    onClose();
    navigate(`/shop?search=${encodeURIComponent(searchTerm)}`);
  };

  const trendingSearches = ['Silk Whisper', 'Retro Runner', 'Crossbody Bag', 'Corduroy', 'Blazer'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 flex items-start justify-center pt-20">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl z-10 border border-zinc-200 animate-slide-up">
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-zinc-200 pb-4">
          <Search className="w-5 h-5 text-zinc-400 mr-3" />
          <input
            type="text"
            placeholder="Search silhouettes, materials, jackets, accessories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
            className="w-full text-base sm:text-lg font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-500 hover:text-black ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Trending Tags */}
        <div className="py-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
            Trending Searches
          </span>
          <div className="flex flex-wrap gap-2">
            {trendingSearches.map((term) => (
              <button
                key={term}
                onClick={() => setSearchTerm(term)}
                className="px-3 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200 text-xs text-zinc-700 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {searchTerm.trim() && (
          <div className="mt-2 max-h-72 overflow-y-auto space-y-2 custom-scrollbar">
            {filtered.length === 0 ? (
              <p className="text-center text-xs text-zinc-400 py-6">
                No pieces found matching "{searchTerm}"
              </p>
            ) : (
              filtered.map((item) => (
                <div
                  key={item._id}
                  onClick={() => handleSelect(item._id)}
                  className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-[#F6F5F2] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-900">{item.title}</h4>
                      <p className="text-[11px] text-zinc-500">{item.category} · ₹{item.price.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-zinc-400" />
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

