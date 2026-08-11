import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, Leaf, LogOut, LayoutDashboard, Search, X as CloseIcon, ChevronDown, User, Users, Tag } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import toast from 'react-hot-toast';
import { productService } from '../../services/productService';
import saleGif from './kamranawan40-big-sale-3979_128.gif';

const CATEGORIES = ['skincare', 'haircare', 'wellness', 'aromatherapy', 'supplements', 'home'];

const AnimatedSaleBadge = () => (
  <div className="relative h-8 rounded-md overflow-hidden flex items-center shadow-[0_0_15px_rgba(227,24,24,0.4)] transform transition-transform hover:scale-105">
    <img
      src={saleGif}
      alt="Sale"
      className="h-full object-cover"
    />
  </div>
);

const Navbar = () => {

  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [hasSale, setHasSale] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  // Pages that have a full-bleed dark hero at the top
  const darkHeroPages = ['/', '/offers'];
  const hasDarkHero = darkHeroPages.includes(location.pathname);
  const isDarkHeader = hasDarkHero && !pastHero;
  const textColor = isDarkHeader ? 'text-white' : 'text-botanical-text';
  const mutedTextColor = isDarkHeader ? 'text-white/80' : 'text-botanical-muted';

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      if (hasDarkHero) {
        // Stay in dark mode until 80% of viewport height scrolled past
        setPastHero(window.scrollY > window.innerHeight * 0.8);
      } else {
        setPastHero(true);
      }
    };

    // Reset on route change
    setPastHero(!hasDarkHero);
    setScrolled(false);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [location.pathname]);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
    setSearchActive(false);
    setSearchQuery('');
    setSearchResults([]);
  }, [location]);

  // Check if any product is on sale
  useEffect(() => {
    const checkSales = async () => {
      try {
        const data = await productService.getProducts({ sale: true, limit: 1 });
        if (data && data.products && data.products.length > 0) {
          setHasSale(true);
        } else {
          setHasSale(false);
        }
      } catch (err) {
        console.error('Error checking sales', err);
      }
    };
    checkSales();
  }, []);

  // Search handler with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const debounceTimer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const data = await productService.getProducts({ search: searchQuery, limit: 5 });
        setSearchResults(data.products || []);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Close search on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchActive(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => { logout(); toast.success('Logged out successfully'); navigate('/'); };

  const handleSearchSelect = (query) => {
    navigate(`/products?search=${encodeURIComponent(query)}`);
    setSearchActive(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
    setSearchActive(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${scrolled
        ? isDarkHeader
          ? 'bg-[#1a2e21]/95 backdrop-blur-xl shadow-soft border-b border-white/10'
          : 'bg-botanical-bg/92 backdrop-blur-xl shadow-soft border-b border-botanical-border'
        : 'bg-transparent'
        }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">

        {/* ── Logo ── */}
        <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-botanical-primary flex items-center justify-center shadow-soft
                          transition-transform duration-500 group-hover:rotate-12 group-hover:bg-botanical-accent">
            <Leaf className="w-4 h-4 text-white" fill="white" />
          </div>
          <span className={`font-serif text-xl font-semibold tracking-tight ${textColor}`}>
            Shop<em className="italic text-botanical-accent not-italic">Ease</em>
          </span>
        </Link>

        {/* ── Desktop Links ── */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            to="/products"
            className={`nav-link ${location.pathname === '/products' && !location.search.includes('sale=true') ? 'text-botanical-accent' : textColor}`}
          >
            Shop
          </Link>

          {hasSale && (
            <Link
              to="/offers"
              className="flex items-center"
            >
              <AnimatedSaleBadge />
            </Link>
          )}

          <div className="relative group">
            <button className={`nav-link flex items-center gap-1 focus:outline-none cursor-pointer ${textColor}`}>
              Categories <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
            </button>
            <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-[60]">
              <div className="w-48 bg-white rounded-2xl shadow-soft-lg border border-botanical-border overflow-hidden p-2 flex flex-col">
                {CATEGORIES.map(c => (
                  <Link key={c} to={`/products?category=${c}`} className="px-4 py-2 text-sm font-sans text-botanical-text hover:bg-botanical-surface hover:text-botanical-primary rounded-xl capitalize transition-colors">
                    {c}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link
            to="/about"
            className={`nav-link ${location.pathname === '/about' ? 'text-botanical-accent' : textColor}`}
          >
            About
          </Link>
        </div>

        {/* ── Actions ── */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <button
            onMouseDown={(e) => {
              e.stopPropagation();
              setSearchActive(!searchActive);
            }}
            className="p-2.5 rounded-full hover:bg-botanical-secondary transition-colors duration-300"
            aria-label="Search"
          >
            <Search className={`w-4.5 h-4.5 ${textColor}`} />
          </button>

          {/* Cart */}
          <Link
            to="/cart"
            className="relative p-2.5 rounded-full hover:bg-botanical-secondary transition-colors duration-300"
            aria-label="Cart"
          >
            <ShoppingBag className={`w-4.5 h-4.5 ${textColor}`} />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-botanical-accent text-white
                               text-xs font-bold flex items-center justify-center leading-none">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </Link>

          {/* Auth */}
          {isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-4 py-2 rounded-full hover:bg-botanical-secondary
                           transition-all duration-300"
                id="user-menu-button"
                aria-expanded={userMenuOpen}
              >
                <div className="w-7 h-7 rounded-full bg-botanical-primary flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <span className={`hidden sm:block text-sm font-medium ${textColor}`}>
                  {user?.name?.split(' ')[0]}
                </span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-3xl shadow-soft-lg
                                border border-botanical-border overflow-hidden animate-fade-in">
                  {isAdmin && (
                    <>
                      <Link to="/admin"
                        className="flex items-center gap-3 px-5 py-3.5 text-sm text-botanical-text
                                   hover:bg-botanical-surface hover:text-botanical-primary transition-colors">
                        <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                      </Link>
                      <Link to="/admin/users"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-5 py-3.5 text-sm text-botanical-text
                                   hover:bg-botanical-surface hover:text-botanical-primary transition-colors">
                        <Users className="w-4 h-4" /> Manage Users
                      </Link>
                      <Link to="/admin/offers"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-5 py-3.5 text-sm text-botanical-text
                                   hover:bg-botanical-surface hover:text-botanical-primary transition-colors">
                        <Tag className="w-4 h-4" /> Manage Offers
                      </Link>
                    </>
                  )}
                  <Link to="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-5 py-3.5 text-sm text-botanical-text
                               hover:bg-botanical-surface hover:text-botanical-primary transition-colors">
                    <User className="w-4 h-4" /> My Profile
                  </Link>
                  <Link to="/orders"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-5 py-3.5 text-sm text-botanical-text
                               hover:bg-botanical-surface hover:text-botanical-primary transition-colors">
                    <ShoppingBag className="w-4 h-4" /> My Orders
                  </Link>
                  <div className="border-t border-botanical-border" />
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-5 py-3.5 text-sm text-red-500
                               hover:bg-red-50 transition-colors">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn-primary px-6 py-2.5 text-sm hidden sm:flex">
              Sign In
            </Link>
          )}

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2.5 rounded-full hover:bg-botanical-secondary transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen
              ? <X className={`w-5 h-5 ${textColor}`} />
              : <Menu className={`w-5 h-5 ${textColor}`} />}
          </button>
        </div>
      </nav>

      {/* ── Mobile Menu ── */}
      <div className={`md:hidden transition-all duration-500 ease-in-out overflow-hidden ${mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        } bg-botanical-bg/98 backdrop-blur-md border-t border-botanical-border`}>
        <div className="px-6 py-6 flex flex-col gap-4">
          <Link to="/products" className={`font-sans text-base font-medium transition-colors ${location.pathname === '/products' && !location.search.includes('sale=true') ? 'text-botanical-accent' : 'text-botanical-text hover:text-botanical-accent'}`}>
            Shop
          </Link>
          <Link to="/offers" onClick={() => setMobileOpen(false)} className="flex items-center py-1">
            <AnimatedSaleBadge />
          </Link>

          <div className="flex flex-col gap-2">
            <span className="font-sans text-base font-medium text-botanical-muted">Categories</span>
            <div className="flex flex-col gap-3 pl-4 border-l-2 border-botanical-surface ml-2">
              {CATEGORIES.map(c => (
                <Link key={c} onClick={() => setMobileOpen(false)} to={`/products?category=${c}`} className="font-sans text-sm text-botanical-text hover:text-botanical-primary capitalize">
                  {c}
                </Link>
              ))}
            </div>
          </div>

          <Link to="/about" className={`font-sans text-base font-medium transition-colors ${location.pathname === '/about' ? 'text-botanical-accent' : 'text-botanical-text hover:text-botanical-accent'}`}>
            About
          </Link>
          {!isAuthenticated && (
            <Link to="/login" className="btn-primary text-center mt-2">Sign In</Link>
          )}
          {isAuthenticated && (
            <button onClick={handleLogout} className="text-left text-sm text-red-500">Logout</button>
          )}
        </div>
      </div>

      {/* ── Search Dropdown ── */}
      <div ref={searchRef} className={`absolute top-full left-0 right-0 flex justify-center px-4 sm:px-6 transition-all duration-300 z-50 transform origin-top pt-2
                                        ${searchActive ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'}`}>
        <div className="bg-botanical-bg/95 backdrop-blur-2xl border border-botanical-border rounded-3xl shadow-[0_20px_40px_-15px_rgba(26,54,39,0.15)] pb-6 pt-5 w-full max-w-2xl mx-auto overflow-hidden">
          <div className="px-5">

            {/* Search Input */}
            <div className="flex items-center gap-3 bg-white border border-botanical-border rounded-2xl px-5 py-2 shadow-sm focus-within:ring-2 focus-within:ring-botanical-primary/30 focus-within:border-botanical-primary transition-all duration-300">
              <Search className="w-5 h-5 text-botanical-primary" />
              <input
                type="text"
                placeholder="Search for products, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    handleSearchSelect(searchQuery);
                  }
                }}
                className="flex-1 bg-transparent border-none focus:outline-none text-botanical-text py-2.5 text-base font-medium placeholder:text-botanical-muted/70 placeholder:font-normal"
                autoFocus={searchActive}
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1.5 rounded-full hover:bg-botanical-surface text-botanical-muted hover:text-botanical-primary transition-colors"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              ) : null}
            </div>

            {/* Search Results */}
            {searchQuery.trim() && (
              <div className="mt-5 max-h-[55vh] overflow-y-auto custom-scrollbar pr-2">
                {searchLoading ? (
                  <div className="py-10 flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-botanical-primary/20 border-t-botanical-primary animate-spin"></div>
                    <span className="text-botanical-primary font-medium text-sm animate-pulse">Searching the garden...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {searchResults.map((product) => {
                      const hasActiveOffer = product.offer && product.offer.discountPercentage > 0 && new Date(product.offer.expiresAt) > new Date();
                      const discountedPrice = hasActiveOffer
                        ? product.price - (product.price * product.offer.discountPercentage / 100)
                        : product.price;

                      return (
                        <button
                          key={product._id}
                          onClick={() => handleProductClick(product._id)}
                          className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white hover:shadow-soft transition-all text-left group border border-transparent hover:border-botanical-border/50"
                        >
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-botanical-surface shadow-sm flex-shrink-0 relative">
                            {product.images?.[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Leaf className="w-6 h-6 text-botanical-primary opacity-40" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <p className="font-serif font-semibold text-base text-botanical-text truncate group-hover:text-botanical-primary transition-colors">
                              {product.name}
                            </p>
                            <p className="font-sans text-xs text-botanical-muted uppercase tracking-wider mt-0.5">
                              {product.category}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <p className="font-sans font-medium text-sm text-botanical-accent">
                                ₹{discountedPrice}
                              </p>
                              {hasActiveOffer && (
                                <p className="font-sans text-[10px] text-botanical-muted line-through">
                                  ₹{product.price}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="px-3 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1">
                            <ChevronDown className="w-5 h-5 text-botanical-primary -rotate-90" />
                          </div>
                        </button>
                      )
                    })}

                    <div className="pt-4 pb-1 mt-2 border-t border-botanical-border/50">
                      <button
                        onClick={() => handleSearchSelect(searchQuery)}
                        className="w-full py-3.5 bg-botanical-primary/5 rounded-xl text-sm font-sans font-medium text-botanical-primary hover:bg-botanical-primary hover:text-white transition-all shadow-sm"
                      >
                        See all {searchQuery} products
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-botanical-surface rounded-full flex items-center justify-center mb-4">
                      <Search className="w-7 h-7 text-botanical-muted" />
                    </div>
                    <p className="font-serif text-botanical-text font-medium text-lg">Nothing found</p>
                    <p className="font-sans text-botanical-muted text-sm mt-1.5 max-w-xs">We couldn't find anything matching "{searchQuery}". Try different keywords.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
