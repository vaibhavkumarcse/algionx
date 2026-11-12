import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Heart, User, LogOut, ChevronDown, Search, ShieldCheck, Sparkles, Menu, X, Sun, Snowflake, Flower2, Briefcase, Coffee } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar({ onOpenWishlist, onOpenSearch }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount, setIsCartOpen, currency, setCurrency } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileCollectionsOpen, setMobileCollectionsOpen] = useState(false);

  const collectionsRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (collectionsRef.current && !collectionsRef.current.contains(e.target)) {
        setCollectionsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileCollectionsOpen(false);
  }, [location.pathname, location.search]);

  const collections = [
    { name: 'Winter',   tag: 'AW 2024',  icon: Snowflake,  path: '/shop?season=Winter',  color: 'text-blue-500' },
    { name: 'Summer',   tag: 'SS 2024',  icon: Sun,        path: '/shop?season=Summer',  color: 'text-amber-500' },
    { name: 'Spring',   tag: 'Fresh',    icon: Flower2,    path: '/shop?season=Spring',  color: 'text-emerald-500' },
    { name: 'Formal',   tag: 'Business', icon: Briefcase,  path: '/shop?season=Formal',  color: 'text-zinc-700' },
    { name: 'Casual',   tag: 'Everyday', icon: Coffee,     path: '/shop?season=Casual',  color: 'text-orange-500' },
  ];

  const isActive = (search) => location.search.includes(search);

  return (
    <header className="sticky top-0 z-40 bg-[#FCFCFA]/95 backdrop-blur-md border-b border-zinc-200/60 transition-all">
      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="font-serif tracking-widest text-2xl sm:text-3xl font-bold uppercase text-zinc-950 hover:opacity-80 transition-opacity"
          >
            ALGIONX
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-6 text-[13px] font-medium tracking-wide text-zinc-700">
            {/* Men */}
            <Link
              to="/shop?category=Men"
              className={`hover:text-black transition-colors pb-0.5 border-b-2 ${
                isActive('category=Men') ? 'border-black text-black font-semibold' : 'border-transparent'
              }`}
            >
              Men
            </Link>

            {/* Women */}
            <Link
              to="/shop?category=Women"
              className={`hover:text-black transition-colors pb-0.5 border-b-2 ${
                isActive('category=Women') ? 'border-black text-black font-semibold' : 'border-transparent'
              }`}
            >
              Women
            </Link>

            {/* Kids */}
            <Link
              to="/shop?category=Kids"
              className={`hover:text-black transition-colors pb-0.5 border-b-2 ${
                isActive('category=Kids') ? 'border-black text-black font-semibold' : 'border-transparent'
              }`}
            >
              Kids
            </Link>

            {/* Collections Dropdown */}
            <div
              ref={collectionsRef}
              className="relative"
              onMouseEnter={() => setCollectionsOpen(true)}
              onMouseLeave={() => setCollectionsOpen(false)}
            >
              <button
                className={`flex items-center gap-1 hover:text-black transition-colors py-2 pb-0.5 border-b-2 ${
                  isActive('season=') ? 'border-black text-black font-semibold' : 'border-transparent'
                }`}
                onClick={() => setCollectionsOpen(!collectionsOpen)}
              >
                <span>Collections</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${collectionsOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Panel */}
              {collectionsOpen && (
                <div className="absolute top-full -left-4 w-56 bg-white border border-zinc-200/80 rounded-2xl shadow-2xl py-2 z-50">
                  {collections.map((col) => {
                    const Icon = col.icon;
                    return (
                      <Link
                        key={col.name}
                        to={col.path}
                        onClick={() => setCollectionsOpen(false)}
                        className="flex items-center justify-between px-4 py-2.5 hover:bg-zinc-50 transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${col.color}`} />
                          <span className="text-sm font-medium text-zinc-900 group-hover:text-black">{col.name}</span>
                        </div>
                        <span className="text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">
                          {col.tag}
                        </span>
                      </Link>
                    );
                  })}
                  {/* View all */}
                  <div className="border-t border-zinc-100 mt-1 pt-1">
                    <Link
                      to="/shop"
                      onClick={() => setCollectionsOpen(false)}
                      className="flex items-center justify-center px-4 py-2 text-xs font-semibold text-zinc-500 hover:text-black transition-colors"
                    >
                      View All →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* 20% Sales */}
            <Link
              to="/shop?sort=featured&search=sale"
              className="hover:text-rose-700 text-rose-600 font-semibold transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>20% Sales</span>
            </Link>

            {/* Gift */}
            <Link
              to="/shop?category=Accessories"
              className={`hover:text-black transition-colors pb-0.5 border-b-2 ${
                isActive('category=Accessories') ? 'border-black text-black font-semibold' : 'border-transparent'
              }`}
            >
              Gift
            </Link>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Search */}
          <button
            onClick={onOpenSearch}
            className="p-2 text-zinc-700 hover:text-black rounded-full hover:bg-zinc-100 transition-colors"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Wishlist */}
          <button
            onClick={onOpenWishlist}
            className="p-2 text-zinc-700 hover:text-black rounded-full hover:bg-zinc-100 transition-colors relative"
            title="Wishlist"
          >
            <Heart className="w-4 h-4" />
            {user?.wishlist?.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>

          {/* Cart Bag */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full border border-zinc-300 hover:border-black transition-all bg-white text-xs font-semibold text-zinc-900 shadow-sm"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bag</span>
            {cartCount > 0 && (
              <span className="bg-zinc-950 text-white rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none">
                {cartCount}
              </span>
            )}
          </button>

          {/* Auth / Profile */}
          {isAuthenticated ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-1.5 p-1 rounded-full border border-zinc-200 hover:border-black transition-all bg-zinc-50"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover"
                />
                <span className="text-xs font-medium text-zinc-800 pr-1 hidden sm:inline">
                  {user.name?.split(' ')[0]}
                </span>
                <ChevronDown className="w-3 h-3 text-zinc-500 mr-1" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-zinc-200 rounded-2xl shadow-xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-zinc-100">
                    <p className="text-xs font-semibold text-zinc-900 truncate">{user.name}</p>
                    <p className="text-[11px] text-zinc-500 truncate">{user.email}</p>
                    {isAdmin && (
                      <span className="inline-block mt-1 text-[10px] tracking-wide font-medium uppercase px-2 py-0.5 rounded-full bg-zinc-900 text-white">
                        Admin
                      </span>
                    )}
                  </div>
                  <Link
                    to="/orders"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-xs text-zinc-700 hover:bg-zinc-50 transition-colors"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>My Orders</span>
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs text-zinc-700 hover:bg-zinc-50 transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-zinc-900" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}
                  <div className="border-t border-zinc-100 mt-1">
                    <button
                      onClick={() => { logout(); setProfileDropdownOpen(false); navigate('/'); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/signin"
              className="px-4 py-2 rounded-full bg-[#0E0E10] hover:bg-black text-[#FCFCFA] text-xs font-semibold tracking-wide transition-all shadow-sm"
            >
              Sign In
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-zinc-700 hover:text-black rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-zinc-200 shadow-lg">
          <div className="px-5 py-4 space-y-1">
            {/* Primary Links */}
            {[
              { label: 'Men',    to: '/shop?category=Men'     },
              { label: 'Women',  to: '/shop?category=Women'   },
              { label: 'Kids',   to: '/shop?category=Kids'    },
            ].map(item => (
              <Link
                key={item.label}
                to={item.to}
                className="block py-2.5 px-3 text-sm font-medium text-zinc-800 hover:bg-zinc-50 rounded-xl transition-colors"
              >
                {item.label}
              </Link>
            ))}

            {/* Collections accordion */}
            <div>
              <button
                onClick={() => setMobileCollectionsOpen(!mobileCollectionsOpen)}
                className="w-full flex items-center justify-between py-2.5 px-3 text-sm font-medium text-zinc-800 hover:bg-zinc-50 rounded-xl transition-colors"
              >
                <span>Collections</span>
                <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${mobileCollectionsOpen ? 'rotate-180' : ''}`} />
              </button>
              {mobileCollectionsOpen && (
                <div className="ml-3 mt-1 space-y-0.5 border-l-2 border-zinc-100 pl-3">
                  {collections.map(col => {
                    const Icon = col.icon;
                    return (
                      <Link
                        key={col.name}
                        to={col.path}
                        className="flex items-center gap-2 py-2 px-2 text-sm text-zinc-700 hover:text-black rounded-lg hover:bg-zinc-50 transition-colors"
                      >
                        <Icon className={`w-4 h-4 ${col.color}`} />
                        {col.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <Link
              to="/shop?search=sale"
              className="block py-2.5 px-3 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            >
              🔥 20% Sales
            </Link>
            <Link
              to="/shop?category=Accessories"
              className="block py-2.5 px-3 text-sm font-medium text-zinc-800 hover:bg-zinc-50 rounded-xl transition-colors"
            >
              Gift
            </Link>

            {/* Auth links in mobile */}
            <div className="border-t border-zinc-100 pt-3 mt-2 space-y-1">
              {isAuthenticated ? (
                <>
                  <Link to="/orders" className="block py-2.5 px-3 text-sm text-zinc-700 hover:bg-zinc-50 rounded-xl">
                    My Orders
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="block py-2.5 px-3 text-sm text-zinc-700 hover:bg-zinc-50 rounded-xl">
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => { logout(); navigate('/'); }}
                    className="w-full text-left py-2.5 px-3 text-sm text-rose-600 hover:bg-rose-50 rounded-xl"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/signin"
                  className="block py-2.5 px-3 text-sm font-semibold text-zinc-900 bg-zinc-950 text-white rounded-xl text-center"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
