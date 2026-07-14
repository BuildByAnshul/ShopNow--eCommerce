import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, Leaf, LogOut, LayoutDashboard, Search, X as CloseIcon, ChevronDown, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { productService } from '../../services/productService';

const CATEGORIES = ['skincare', 'haircare', 'wellness', 'aromatherapy', 'supplements', 'home'];

const Navbar = () => {

  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef(null);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
    setSearchActive(false);
    setSearchQuery('');
    setSearchResults([]);
  }, [location]);

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
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

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
        ? 'bg-botanical-bg/92 backdrop-blur-xl shadow-soft border-b border-botanical-border'
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
          <span className="font-serif text-xl font-semibold text-botanical-text tracking-tight">
            Shop<em className="italic text-botanical-accent not-italic">Ease</em>
          </span>
        </Link>

        {/* ── Desktop Links ── */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            to="/products"
            className={`nav-link ${location.pathname === '/products' ? 'text-botanical-accent' : ''}`}
          >
            Shop
          </Link>
          
          <div className="relative group">
            <button className="nav-link flex items-center gap-1 focus:outline-none cursor-pointer">
              Categories <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
            </button>
            <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50">
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
            className={`nav-link ${location.pathname === '/about' ? 'text-botanical-accent' : ''}`}
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
            <Search className="w-4.5 h-4.5 text-botanical-text" />
          </button>

          {/* Cart */}
          <Link
            to="/cart"
            className="relative p-2.5 rounded-full hover:bg-botanical-secondary transition-colors duration-300"
            aria-label="Cart"
          >
            <ShoppingBag className="w-4.5 h-4.5 text-botanical-text" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-botanical-accent text-white
                               text-xs font-bold flex items-center justify-center leading-none">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </Link>

          {/* Auth */}
          {isAuthenticated ? (
            <div className="relative">
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
                <span className="hidden sm:block text-sm font-medium text-botanical-text">
                  {user?.name?.split(' ')[0]}
                </span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-3xl shadow-soft-lg
                                border border-botanical-border overflow-hidden animate-fade-in">
                  {isAdmin && (
                    <Link to="/admin"
                      className="flex items-center gap-3 px-5 py-3.5 text-sm text-botanical-text
                                 hover:bg-botanical-surface hover:text-botanical-primary transition-colors">
                      <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                    </Link>
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
              ? <X className="w-5 h-5 text-botanical-text" />
              : <Menu className="w-5 h-5 text-botanical-text" />}
          </button>
        </div>
      </nav>

      {/* ── Mobile Menu ── */}
      <div className={`md:hidden transition-all duration-500 ease-in-out overflow-hidden ${mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        } bg-botanical-bg/98 backdrop-blur-md border-t border-botanical-border`}>
        <div className="px-6 py-6 flex flex-col gap-4">
          <Link to="/products" className={`font-sans text-base font-medium transition-colors ${location.pathname === '/products' ? 'text-botanical-accent' : 'text-botanical-text hover:text-botanical-accent'}`}>
            Shop
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
      <div ref={searchRef} className={`absolute top-[calc(100%+0.5rem)] left-0 right-0 flex justify-center px-4 sm:px-6 transition-all duration-300 z-50 transform origin-top
                                        ${searchActive ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'}`}>
        <div className="bg-white border border-botanical-border rounded-3xl shadow-soft-xl pb-6 pt-4 w-full max-w-3xl">
          <div className="px-2 sm:px-4">
            
            {/* Search Input */}
            <div className="flex items-center gap-3 bg-gray-50/70 border border-botanical-border/60 rounded-2xl px-4 py-1 focus-within:ring-2 focus-within:ring-botanical-primary transition-all">
              <Search className="w-5 h-5 text-botanical-muted" />
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
                className="flex-1 bg-transparent border-none focus:outline-none text-botanical-text py-3 text-base"
                autoFocus={searchActive}
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1.5 rounded-full hover:bg-botanical-border text-botanical-muted transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : null}
            </div>

            {/* Search Results */}
            {searchQuery.trim() && (
              <div className="mt-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                {searchLoading ? (
                  <div className="py-8 text-center text-botanical-muted font-sans text-sm animate-pulse">
                    Searching...
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {searchResults.map((product) => (
                      <button
                        key={product._id}
                        onClick={() => handleProductClick(product._id)}
                        className="flex items-center gap-4 p-3 rounded-2xl hover:bg-botanical-surface transition-colors text-left group border border-transparent hover:border-botanical-border"
                      >
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-white shadow-sm flex-shrink-0">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-botanical-secondary flex items-center justify-center">
                              <Leaf className="w-5 h-5 text-botanical-primary opacity-50" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-sans font-semibold text-sm text-botanical-text truncate group-hover:text-botanical-primary transition-colors">
                            {product.name}
                          </p>
                          <p className="font-sans text-xs text-botanical-muted capitalize mt-0.5">
                            {product.category}
                          </p>
                          <p className="font-sans font-medium text-sm text-botanical-accent mt-1">
                            ₹{product.price}
                          </p>
                        </div>
                      </button>
                    ))}
                    
                    <div className="pt-2 pb-1">
                      <button
                        onClick={() => handleSearchSelect(searchQuery)}
                        className="w-full py-3 bg-botanical-surface rounded-xl text-sm font-sans font-medium text-botanical-primary hover:text-botanical-accent hover:bg-botanical-secondary transition-colors"
                      >
                        View all results for "{searchQuery}"
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <Search className="w-8 h-8 text-botanical-border mx-auto mb-3" />
                    <p className="font-sans text-botanical-text font-medium text-sm">No products found</p>
                    <p className="font-sans text-botanical-muted text-xs mt-1">Try checking for typos or searching with different keywords.</p>
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
