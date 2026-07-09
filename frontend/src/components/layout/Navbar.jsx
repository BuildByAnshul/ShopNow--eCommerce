import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, Leaf, LogOut, LayoutDashboard, Search, X as CloseIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { productService } from '../../services/productService';

const navLinks = [
  { label: 'Shop', to: '/products' },
  { label: 'Categories', to: '/products' },
  { label: 'About', to: '/about' },
];

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
          {navLinks.map((link) => (
            <Link
              key={link.to + link.label}
              to={link.to}
              className={`nav-link ${location.pathname === link.to && link.label === 'Shop' ? 'text-botanical-accent' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* ── Actions ── */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <button
            onClick={() => setSearchActive(!searchActive)}
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
                  <Link to="/orders"
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
          {navLinks.map((link) => (
            <Link key={link.label} to={link.to}
              className="font-sans text-base font-medium text-botanical-text
                         hover:text-botanical-accent transition-colors">
              {link.label}
            </Link>
          ))}
          {!isAuthenticated && (
            <Link to="/login" className="btn-primary text-center mt-2">Sign In</Link>
          )}
          {isAuthenticated && (
            <button onClick={handleLogout} className="text-left text-sm text-red-500">Logout</button>
          )}
        </div>
      </div>

      {/* ── Search Dropdown ── */}
      <div ref={searchRef} className={`absolute top-20 left-0 right-0 transition-all duration-300 z-50
                                        ${searchActive ? 'max-h-96 opacity-100 pointer-events-auto' : 'max-h-0 opacity-0 pointer-events-none'}`}>
        <div className="bg-white/95 backdrop-blur-md border-b border-botanical-border shadow-soft-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            {/* Search Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    handleSearchSelect(searchQuery);
                  }
                }}
                className="flex-1 px-4 py-2.5 border border-botanical-border rounded-lg focus:outline-none
                           focus:ring-2 focus:ring-botanical-primary text-sm"
                autoFocus
              />
              <button
                onClick={() => {
                  setSearchActive(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="p-2.5 rounded-lg hover:bg-botanical-secondary transition-colors"
              >
                <X className="w-5 h-5 text-botanical-text" />
              </button>
            </div>

            {/* Search Results Dropdown - Only show when there's a query */}
            {searchQuery.trim() && (
              <div className="mt-3 pt-3 border-t border-botanical-border max-h-64 overflow-y-auto">
                {searchLoading ? (
                  <div className="py-6 text-center text-botanical-muted text-sm">Searching...</div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-2">
                    {searchResults.map((product) => (
                      <button
                        key={product._id}
                        onClick={() => handleProductClick(product._id)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-botanical-surface
                                   transition-colors text-left group"
                      >
                        {product.images?.[0] && (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-10 h-10 rounded object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-botanical-text truncate group-hover:text-botanical-primary">
                            {product.name}
                          </p>
                          <p className="text-xs text-botanical-muted">${product.price}</p>
                        </div>
                      </button>
                    ))}
                    <button
                      onClick={() => handleSearchSelect(searchQuery)}
                      className="w-full py-2 mt-2 pt-3 border-t border-botanical-border text-sm
                                 text-botanical-primary hover:text-botanical-accent font-medium transition-colors"
                    >
                      View all results for "{searchQuery}"
                    </button>
                  </div>
                ) : (
                  <div className="py-6 text-center text-botanical-muted text-sm">
                    No products found
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
