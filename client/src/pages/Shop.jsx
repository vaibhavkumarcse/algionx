import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { fallbackProducts, BRANDS, COLORS } from '../data/fallbackProducts';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import {
  ArrowUpDown, SlidersHorizontal, X, ChevronDown, ChevronUp,
  Search, Star, Package, Loader2, LayoutGrid, List
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = ['All', 'Men', 'Women', 'Kids', 'Footwear', 'Bags', 'Accessories'];
const SEASONS = ['All', 'Winter', 'Summer', 'Spring', 'Formal', 'Casual'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2Y', '4Y', '6Y', '8Y', '10Y', '12Y'];
const SORT_OPTIONS = [
  { value: 'featured',     label: 'Featured' },
  { value: 'newest',       label: 'Newest Arrivals' },
  { value: 'price-low',   label: 'Price: Low to High' },
  { value: 'price-high',  label: 'Price: High to Low' },
  { value: 'rating',       label: 'Highest Rated' },
  { value: 'best-selling', label: 'Best Selling' },
];

// Color name → CSS colour map for swatches
const COLOR_HEX = {
  Noir: '#1a1a1a', Ivory: '#f5f0e8', Olive: '#6b7c47', Sand: '#c2b280',
  Cobalt: '#0047ab', Ochre: '#cc7722', Charcoal: '#36454f', Sage: '#87a878',
  Crimson: '#dc143c', Burgundy: '#800020', Camel: '#c19a6b',
  'Powder Blue': '#b0d4e8', Lavender: '#967bb6', Emerald: '#50c878',
};

// ─── Skeleton Card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-[#F6F5F2] rounded-3xl p-5 animate-pulse">
      <div className="aspect-square rounded-2xl bg-zinc-200 mb-4" />
      <div className="h-3 bg-zinc-200 rounded-full w-3/4 mb-2" />
      <div className="h-3 bg-zinc-200 rounded-full w-1/2" />
    </div>
  );
}

// ─── Active Filter Chip ────────────────────────────────────────────────────────
function FilterChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-950 text-white text-[11px] font-semibold">
      {label}
      <button onClick={onRemove} className="ml-0.5 hover:text-zinc-300 transition-colors">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

// ─── Collapsible Filter Panel ──────────────────────────────────────────────────
function FilterPanel({ title, open, onToggle, children }) {
  return (
    <div className="border-b border-zinc-200 py-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between"
      >
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-800">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

// ─── Main Shop Component ───────────────────────────────────────────────────────
export default function Shop() {
  const location = useLocation();
  const navigate = useNavigate();
  const { formatPrice } = useCart();

  // Parse initial state from URL
  const getURLParams = () => {
    const sp = new URLSearchParams(location.search);
    return {
      category:  sp.get('category') || 'All',
      season:    sp.get('season')   || 'All',
      search:    sp.get('search')   || '',
      sort:      sp.get('sort')     || 'featured',
      minPrice:  Number(sp.get('minPrice') || 1000),
      maxPrice:  Number(sp.get('maxPrice') || 8000),
      sizes:     sp.get('sizes')   ? sp.get('sizes').split(',') : [],
      colors:    sp.get('colors')  ? sp.get('colors').split(',') : [],
      brands:    sp.get('brands')  ? sp.get('brands').split(',') : [],
      rating:    Number(sp.get('rating') || 0),
      inStock:   sp.get('inStock') || '',
      page:      Number(sp.get('page') || 1),
    };
  };

  const init = getURLParams();

  // Filter state
  const [category,       setCategory]       = useState(init.category);
  const [season,         setSeason]         = useState(init.season);
  const [searchTerm,     setSearchTerm]     = useState(init.search);
  const [sort,           setSort]           = useState(init.sort);
  const [priceMin,       setPriceMin]       = useState(init.minPrice);
  const [priceMax,       setPriceMax]       = useState(init.maxPrice);
  const [selectedSizes,  setSelectedSizes]  = useState(init.sizes);
  const [selectedColors, setSelectedColors] = useState(init.colors);
  const [selectedBrands, setSelectedBrands] = useState(init.brands);
  const [minRating,      setMinRating]      = useState(init.rating);
  const [inStockOnly,    setInStockOnly]    = useState(init.inStock === 'true');
  const [currentPage,    setCurrentPage]    = useState(init.page);

  // UI state
  const [showFilters,    setShowFilters]    = useState(false); // mobile drawer
  const [sidebarOpen,    setSidebarOpen]    = useState(true);  // desktop sidebar
  const [loading,        setLoading]        = useState(false);
  const [openPanels,     setOpenPanels]     = useState({
    season: true, price: true, size: true, color: true, brand: false, rating: true, availability: true
  });

  // Product state
  const [apiProducts,    setApiProducts]    = useState(null); // null = not yet loaded
  const [totalCount,     setTotalCount]     = useState(0);
  const [totalPages,     setTotalPages]     = useState(1);

  const ITEMS_PER_PAGE = 24;
  const searchInputRef = useRef(null);
  const topRef = useRef(null);

  // ── Sync filters → URL ──────────────────────────────────────────────────────
  useEffect(() => {
    const sp = new URLSearchParams();
    if (category !== 'All')       sp.set('category', category);
    if (season !== 'All')         sp.set('season', season);
    if (searchTerm)                sp.set('search', searchTerm);
    if (sort !== 'featured')       sp.set('sort', sort);
    if (priceMin > 1000)           sp.set('minPrice', priceMin);
    if (priceMax < 8000)           sp.set('maxPrice', priceMax);
    if (selectedSizes.length)      sp.set('sizes', selectedSizes.join(','));
    if (selectedColors.length)     sp.set('colors', selectedColors.join(','));
    if (selectedBrands.length)     sp.set('brands', selectedBrands.join(','));
    if (minRating > 0)             sp.set('rating', minRating);
    if (inStockOnly)               sp.set('inStock', 'true');
    if (currentPage > 1)           sp.set('page', currentPage);

    const newSearch = sp.toString();
    const current = new URLSearchParams(location.search).toString();
    if (newSearch !== current) {
      navigate(`/shop${newSearch ? '?' + newSearch : ''}`, { replace: true });
    }
  }, [category, season, searchTerm, sort, priceMin, priceMax, selectedSizes, selectedColors, selectedBrands, minRating, inStockOnly, currentPage]);

  // ── Fetch from API ──────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getProducts({
        category, season: season !== 'All' ? season : undefined, search: searchTerm, sort, minPrice: priceMin, maxPrice: priceMax,
        sizes: selectedSizes, colors: selectedColors, brands: selectedBrands,
        rating: minRating || undefined, inStock: inStockOnly ? true : undefined,
        page: currentPage, limit: ITEMS_PER_PAGE,
      });
      if (data?.products) {
        setApiProducts(data.products);
        setTotalCount(data.total || data.count || data.products.length);
        setTotalPages(data.pages || 1);
      }
    } catch {
      setApiProducts(null); // fall back to client-side
    } finally {
      setLoading(false);
    }
  }, [category, season, searchTerm, sort, priceMin, priceMax, selectedSizes, selectedColors, selectedBrands, minRating, inStockOnly, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [category, season, searchTerm, sort, priceMin, priceMax, selectedSizes, selectedColors, selectedBrands, minRating, inStockOnly]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ── Client-side filter fallback (always available) ──────────────────────────
  const clientFiltered = useMemo(() => {
    let list = [...fallbackProducts];
    if (category !== 'All')        list = list.filter(p => p.category === category);
    if (season !== 'All')          list = list.filter(p => p.season?.toLowerCase() === season.toLowerCase());
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      list = list.filter(p =>
        p.title?.toLowerCase().includes(s) ||
        p.subtitle?.toLowerCase().includes(s) ||
        p.brand?.toLowerCase().includes(s) ||
        p.tags?.some(t => t.toLowerCase().includes(s))
      );
    }
    if (priceMin > 1000)           list = list.filter(p => p.price >= priceMin);
    if (priceMax < 8000)           list = list.filter(p => p.price <= priceMax);
    if (selectedSizes.length)      list = list.filter(p => p.sizes?.some(s => selectedSizes.includes(s)));
    if (selectedColors.length)     list = list.filter(p => p.colors?.some(c => selectedColors.includes(c)));
    if (selectedBrands.length)     list = list.filter(p => selectedBrands.includes(p.brand));
    if (minRating > 0)             list = list.filter(p => (p.rating || 0) >= minRating);
    if (inStockOnly)               list = list.filter(p => (p.stock || 0) > 0);

    switch (sort) {
      case 'price-low':    list.sort((a, b) => a.price - b.price); break;
      case 'price-high':   list.sort((a, b) => b.price - a.price); break;
      case 'rating':       list.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      case 'newest':       list.sort((a, b) => new Date(b.createdAt||0) - new Date(a.createdAt||0)); break;
      case 'best-selling': list.sort((a, b) => (b.reviewsCount||0) - (a.reviewsCount||0)); break;
      default:             list.sort((a, b) => (b.isFeatured?1:0) - (a.isFeatured?1:0)); break;
    }
    return list;
  }, [category, season, searchTerm, sort, priceMin, priceMax, selectedSizes, selectedColors, selectedBrands, minRating, inStockOnly]);

  // The products to display — prefer API, fall back to client
  const displayProducts = apiProducts ?? clientFiltered;
  const displayTotal    = apiProducts ? totalCount : clientFiltered.length;

  // Client-side pagination when using fallback (API already paginates)
  const paginatedProducts = apiProducts
    ? displayProducts
    : displayProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const derivedTotalPages = apiProducts ? totalPages : Math.max(1, Math.ceil(clientFiltered.length / ITEMS_PER_PAGE));

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const togglePanel = (key) => setOpenPanels(p => ({ ...p, [key]: !p[key] }));
  const toggleSize  = (s) => setSelectedSizes(prev  => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const toggleColor = (c) => setSelectedColors(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  const toggleBrand = (b) => setSelectedBrands(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]);

  const resetAll = () => {
    setCategory('All'); setSeason('All'); setSearchTerm(''); setSort('featured');
    setPriceMin(1000); setPriceMax(8000);
    setSelectedSizes([]); setSelectedColors([]); setSelectedBrands([]);
    setMinRating(0); setInStockOnly(false); setCurrentPage(1);
  };

  // ── Active Filters ───────────────────────────────────────────────────────────
  const activeFilters = [
    ...(category !== 'All'   ? [{ id: 'cat',   label: category,         remove: () => setCategory('All') }] : []),
    ...(season !== 'All'     ? [{ id: 'sea',   label: `Collection: ${season}`, remove: () => setSeason('All') }] : []),
    ...(searchTerm            ? [{ id: 'q',     label: `"${searchTerm}"`, remove: () => setSearchTerm('') }] : []),
    ...(priceMin > 1000 || priceMax < 8000
      ? [{ id: 'price', label: `₹${priceMin.toLocaleString()}–₹${priceMax.toLocaleString()}`, remove: () => { setPriceMin(1000); setPriceMax(8000); } }]
      : []),
    ...selectedSizes.map(s  => ({ id:`sz-${s}`,  label: `Size: ${s}`,  remove: () => toggleSize(s)  })),
    ...selectedColors.map(c => ({ id:`cl-${c}`,  label: c,              remove: () => toggleColor(c) })),
    ...selectedBrands.map(b => ({ id:`br-${b}`,  label: b,              remove: () => toggleBrand(b) })),
    ...(minRating > 0 ? [{ id: 'rate', label: `${minRating}★+`, remove: () => setMinRating(0) }] : []),
    ...(inStockOnly   ? [{ id: 'stk',  label: 'In Stock',         remove: () => setInStockOnly(false) }] : []),
  ];

  const hasActiveFilters = activeFilters.length > 0;

  // ── Sidebar JSX (reused on desktop + mobile) ─────────────────────────────────
  const SidebarContent = () => (
    <div className="space-y-0 divide-y divide-zinc-100">
      {/* Clear All */}
      {hasActiveFilters && (
        <div className="pb-4">
          <button
            onClick={resetAll}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Clear All Filters
          </button>
        </div>
      )}

      {/* Collections / Season */}
      <FilterPanel title="Collections" open={openPanels.season} onToggle={() => togglePanel('season')}>
        <div className="flex flex-wrap gap-1.5">
          {SEASONS.map(s => (
            <button
              key={s}
              onClick={() => setSeason(s)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                season === s
                  ? 'bg-zinc-950 text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </FilterPanel>

      {/* Price Range */}
      <FilterPanel title="Price Range" open={openPanels.price} onToggle={() => togglePanel('price')}>
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Min (₹)</label>
              <input
                type="number" value={priceMin} min={1000} max={8000}
                onChange={e => setPriceMin(Number(e.target.value))}
                className="w-full mt-1 px-2.5 py-1.5 text-xs rounded-xl border border-zinc-200 focus:border-zinc-900 focus:outline-none bg-white"
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Max (₹)</label>
              <input
                type="number" value={priceMax} min={1000} max={8000}
                onChange={e => setPriceMax(Number(e.target.value))}
                className="w-full mt-1 px-2.5 py-1.5 text-xs rounded-xl border border-zinc-200 focus:border-zinc-900 focus:outline-none bg-white"
              />
            </div>
          </div>
          {/* Preset chips */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: '₹1K – ₹2K',       min: 1000, max: 2000 },
              { label: '₹2K – ₹4K',       min: 2000, max: 4000 },
              { label: '₹4K – ₹6K',       min: 4000, max: 6000 },
              { label: '₹6K – ₹8K',       min: 6000, max: 8000 },
              { label: 'All (₹1K–₹8K)',   min: 1000, max: 8000 },
            ].map(p => (
              <button
                key={p.label}
                onClick={() => { setPriceMin(p.min); setPriceMax(p.max); }}
                className={`text-[11px] px-2.5 py-1 rounded-full border font-medium transition-all ${
                  priceMin === p.min && priceMax === p.max
                    ? 'bg-zinc-950 text-white border-zinc-950'
                    : 'bg-white text-zinc-600 border-zinc-300 hover:border-zinc-500'
                }`}
              >{p.label}</button>
            ))}
          </div>
        </div>
      </FilterPanel>

      {/* Size */}
      <FilterPanel title="Size" open={openPanels.size} onToggle={() => togglePanel('size')}>
        <div className="flex flex-wrap gap-2">
          {SIZES.map(s => (
            <button
              key={s}
              onClick={() => toggleSize(s)}
              className={`w-10 h-10 rounded-xl text-xs font-bold border-2 transition-all ${
                selectedSizes.includes(s)
                  ? 'bg-zinc-950 text-white border-zinc-950 shadow-sm'
                  : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400'
              }`}
            >{s}</button>
          ))}
        </div>
      </FilterPanel>

      {/* Colour */}
      <FilterPanel title="Colour" open={openPanels.color} onToggle={() => togglePanel('color')}>
        <div className="flex flex-wrap gap-2">
          {COLORS.map(c => {
            const hex = COLOR_HEX[c] || '#888';
            const isSelected = selectedColors.includes(c);
            return (
              <button
                key={c}
                onClick={() => toggleColor(c)}
                title={c}
                className={`w-7 h-7 rounded-full border-2 transition-all relative ${
                  isSelected ? 'border-zinc-950 scale-110 shadow-md' : 'border-zinc-300 hover:border-zinc-500 hover:scale-105'
                }`}
                style={{ backgroundColor: hex }}
              >
                {isSelected && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-white shadow-sm" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {selectedColors.length > 0 && (
          <p className="text-[10px] text-zinc-500 mt-2">{selectedColors.join(', ')}</p>
        )}
      </FilterPanel>

      {/* Brand */}
      <FilterPanel title="Brand" open={openPanels.brand} onToggle={() => togglePanel('brand')}>
        <div className="max-h-56 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
          {BRANDS.map(b => (
            <label key={b} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedBrands.includes(b)}
                onChange={() => toggleBrand(b)}
                className="w-3.5 h-3.5 accent-zinc-900 cursor-pointer rounded"
              />
              <span className="text-[11px] text-zinc-700 group-hover:text-black transition-colors leading-tight">
                {b}
              </span>
            </label>
          ))}
        </div>
      </FilterPanel>

      {/* Rating */}
      <FilterPanel title="Rating" open={openPanels.rating} onToggle={() => togglePanel('rating')}>
        <div className="space-y-1.5">
          {[4, 3, 2].map(r => (
            <button
              key={r}
              onClick={() => setMinRating(minRating === r ? 0 : r)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
                minRating === r
                  ? 'bg-zinc-950 text-white border-zinc-950'
                  : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400'
              }`}
            >
              <span className="flex">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className={`w-3 h-3 ${i <= r ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'}`} />
                ))}
              </span>
              <span>{r}+ Stars</span>
            </button>
          ))}
        </div>
      </FilterPanel>

      {/* Availability */}
      <FilterPanel title="Availability" open={openPanels.availability} onToggle={() => togglePanel('availability')}>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={() => setInStockOnly(!inStockOnly)}
              className="w-3.5 h-3.5 accent-zinc-900 cursor-pointer"
            />
            <span className="text-[11px] text-zinc-700 group-hover:text-black transition-colors font-medium">
              In Stock Only
            </span>
          </label>
        </div>
      </FilterPanel>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FCFCFA]" ref={topRef}>
      {/* ── Page Header ── */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
        <div className="text-center space-y-1.5 mb-8">
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Atelier Collection
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif text-zinc-950 font-normal">
            {category === 'All' ? 'Refined Silhouettes' : `${category}'s Edit`}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 font-light max-w-md mx-auto">
            Timeless modern garments crafted with uncompromising precision and sustainable materials.
          </p>
        </div>

        {/* ── Top Controls Bar ── */}
        <div className="bg-[#F6F5F2] p-3 rounded-2xl border border-zinc-200/80 flex flex-wrap items-center gap-2 mb-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 custom-scrollbar flex-1">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => { setCategory(c); setCurrentPage(1); }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  category === c
                    ? 'bg-zinc-950 text-white shadow-sm'
                    : 'bg-white hover:bg-zinc-100 text-zinc-700'
                }`}
              >{c}</button>
            ))}
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-6 bg-zinc-300" />

          {/* Search */}
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="Search products…"
              className="pl-8 pr-3 py-1.5 text-xs rounded-full border border-zinc-200 focus:border-zinc-900 focus:outline-none bg-white w-40 sm:w-48 transition-all focus:w-56"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-2.5 text-zinc-400 hover:text-black">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Filter toggle (desktop sidebar) */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              sidebarOpen
                ? 'bg-zinc-950 text-white border-zinc-950'
                : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
            {hasActiveFilters && (
              <span className={`rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold ${
                sidebarOpen ? 'bg-white text-zinc-950' : 'bg-zinc-950 text-white'
              }`}>
                {activeFilters.length}
              </span>
            )}
          </button>

          {/* Filter toggle (mobile drawer) */}
          <button
            onClick={() => setShowFilters(true)}
            className={`lg:hidden flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              hasActiveFilters
                ? 'bg-zinc-950 text-white border-zinc-950'
                : 'bg-white text-zinc-700 border-zinc-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters {hasActiveFilters && `(${activeFilters.length})`}
          </button>

          {/* Sort */}
          <div className="flex items-center gap-1 bg-white border border-zinc-200 rounded-full px-3 py-1.5 ml-auto sm:ml-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="text-xs font-semibold text-zinc-800 bg-transparent focus:outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Active Filter Chips ── */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            {activeFilters.map(f => (
              <FilterChip key={f.id} label={f.label} onRemove={f.remove} />
            ))}
            <button
              onClick={resetAll}
              className="text-[11px] text-zinc-500 hover:text-black underline underline-offset-2 ml-1"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ── Layout: Sidebar + Grid ── */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex gap-8">

          {/* Desktop Sidebar */}
          {sidebarOpen && (
            <aside className="hidden lg:block w-60 xl:w-64 flex-shrink-0">
              <div className="sticky top-24 bg-white rounded-2xl border border-zinc-200/80 p-5 max-h-[calc(100vh-7rem)] overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-900">Filters</span>
                  {hasActiveFilters && (
                    <button onClick={resetAll} className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold">
                      Reset
                    </button>
                  )}
                </div>
                <SidebarContent />
              </div>
            </aside>
          )}

          {/* Product Area */}
          <div className="flex-1 min-w-0">
            {/* Count + result info */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-xs text-zinc-500 font-mono">
                {loading
                  ? 'Loading…'
                  : `${displayTotal.toLocaleString()} result${displayTotal !== 1 ? 's' : ''}`
                }
                {category !== 'All' && !loading && (
                  <span className="ml-1 text-zinc-400">in <strong className="text-zinc-700">{category}</strong></span>
                )}
              </p>
              {derivedTotalPages > 1 && (
                <span className="text-xs text-zinc-400">Page {currentPage} of {derivedTotalPages}</span>
              )}
            </div>

            {/* Loading Skeletons */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            )}

            {/* Empty State */}
            {!loading && paginatedProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-28 text-center space-y-4">
                <Package className="w-14 h-14 text-zinc-300" />
                <h3 className="text-lg font-serif text-zinc-900">No pieces found</h3>
                <p className="text-xs text-zinc-500 max-w-xs">
                  {searchTerm
                    ? `No results for "${searchTerm}". Try a different search or adjust your filters.`
                    : 'Try adjusting your filters to discover our full collection.'}
                </p>
                <button
                  onClick={resetAll}
                  className="px-6 py-2.5 rounded-full bg-zinc-950 text-white text-xs font-semibold hover:bg-black transition-all shadow-sm"
                >
                  Reset All Filters
                </button>
              </div>
            )}

            {/* Products Grid */}
            {!loading && paginatedProducts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {paginatedProducts.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && derivedTotalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); topRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
                  className="px-4 py-2 rounded-full border border-zinc-200 text-xs font-semibold text-zinc-700 hover:border-zinc-900 hover:text-black disabled:opacity-40 disabled:cursor-not-allowed transition-all bg-white"
                >
                  ← Prev
                </button>

                {/* Page numbers */}
                {Array.from({ length: Math.min(7, derivedTotalPages) }, (_, i) => {
                  let pageNum;
                  if (derivedTotalPages <= 7) {
                    pageNum = i + 1;
                  } else if (currentPage <= 4) {
                    pageNum = i + 1;
                  } else if (currentPage >= derivedTotalPages - 3) {
                    pageNum = derivedTotalPages - 6 + i;
                  } else {
                    pageNum = currentPage - 3 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => { setCurrentPage(pageNum); topRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
                      className={`w-9 h-9 rounded-full text-xs font-bold transition-all ${
                        currentPage === pageNum
                          ? 'bg-zinc-950 text-white shadow-sm'
                          : 'bg-white text-zinc-700 border border-zinc-200 hover:border-zinc-500'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  disabled={currentPage >= derivedTotalPages}
                  onClick={() => { setCurrentPage(p => Math.min(derivedTotalPages, p + 1)); topRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
                  className="px-4 py-2 rounded-full border border-zinc-200 text-xs font-semibold text-zinc-700 hover:border-zinc-900 hover:text-black disabled:opacity-40 disabled:cursor-not-allowed transition-all bg-white"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile Filter Drawer ── */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowFilters(false)}
          />
          {/* Drawer */}
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[90vw] bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200">
              <span className="font-semibold text-sm text-zinc-900">Filters</span>
              <button onClick={() => setShowFilters(false)} className="p-1.5 rounded-lg hover:bg-zinc-100">
                <X className="w-5 h-5 text-zinc-700" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-2 custom-scrollbar">
              <SidebarContent />
            </div>
            <div className="px-5 py-4 border-t border-zinc-200 flex gap-3">
              <button
                onClick={() => { resetAll(); setShowFilters(false); }}
                className="flex-1 py-2.5 rounded-full border border-zinc-300 text-xs font-semibold text-zinc-700 hover:border-zinc-900 transition-all"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="flex-1 py-2.5 rounded-full bg-zinc-950 text-white text-xs font-semibold hover:bg-black transition-all shadow-sm"
              >
                Show {displayTotal.toLocaleString()} Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
