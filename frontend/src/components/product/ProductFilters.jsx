import React, { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';

const CATEGORIES = ['skincare', 'haircare', 'wellness', 'aromatherapy', 'supplements', 'home'];

const ProductFilters = ({ filters, onFilterChange, onClear }) => {
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const debouncedSearch = useDebounce(searchInput, 1500);

  React.useEffect(() => {
    onFilterChange({ search: debouncedSearch });
  }, [debouncedSearch]);

  return (
    <aside className="w-full space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-botanical-primary" />
          <span className="font-serif text-base font-medium text-botanical-text">Filters</span>
        </div>
        <button
          onClick={onClear}
          className="text-xs text-botanical-muted hover:text-botanical-accent font-sans transition-colors duration-300 flex items-center gap-1"
        >
          <X className="w-3 h-3" /> Clear all
        </button>
      </div>

      {/* Search */}
      <div>
        <p className="input-label mb-3">Search</p>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-botanical-muted" />
          <input
            type="text"
            placeholder="Search products…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="input-field pl-11"
            id="product-search"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <p className="input-label mb-3">Category</p>
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="radio"
              name="category"
              value=""
              checked={filters.category === ''}
              onChange={() => onFilterChange({ category: '' })}
              className="accent-botanical-primary"
              id="cat-all"
            />
            <span className="font-sans text-sm text-botanical-text group-hover:text-botanical-primary transition-colors capitalize">
              All Categories
            </span>
          </label>
          {CATEGORIES.map((cat) => (
            <label key={cat} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="category"
                value={cat}
                checked={filters.category === cat}
                onChange={() => onFilterChange({ category: cat })}
                className="accent-botanical-primary"
                id={`cat-${cat}`}
              />
              <span className="font-sans text-sm text-botanical-text group-hover:text-botanical-primary transition-colors capitalize">
                {cat}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <p className="input-label mb-3">Price Range</p>
        <div className="flex gap-3 items-center">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            min={0}
            onChange={(e) => onFilterChange({ minPrice: e.target.value })}
            className="input-field"
            id="price-min"
          />
          <span className="text-botanical-muted font-sans text-sm">—</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            min={0}
            onChange={(e) => onFilterChange({ maxPrice: e.target.value })}
            className="input-field"
            id="price-max"
          />
        </div>
      </div>
    </aside>
  );
};

export default ProductFilters;
