import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import Button from '../ui/Button';

const CATEGORIES = ['skincare', 'haircare', 'wellness', 'aromatherapy', 'supplements', 'home'];

const ProductFilters = ({ filters, onFilterChange, onClear }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  // Sync with external filter changes (e.g. from Redux on 'Clear all')
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApply = () => {
    onFilterChange(localFilters);
  };

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
            value={localFilters.search || ''}
            onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
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
              checked={localFilters.category === '' || !localFilters.category}
              onChange={() => setLocalFilters({ ...localFilters, category: '' })}
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
                checked={localFilters.category === cat}
                onChange={() => setLocalFilters({ ...localFilters, category: cat })}
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
            value={localFilters.minPrice || ''}
            min={0}
            onChange={(e) => setLocalFilters({ ...localFilters, minPrice: e.target.value })}
            className="input-field"
            id="price-min"
          />
          <span className="text-botanical-muted font-sans text-sm">—</span>
          <input
            type="number"
            placeholder="Max"
            value={localFilters.maxPrice || ''}
            min={0}
            onChange={(e) => setLocalFilters({ ...localFilters, maxPrice: e.target.value })}
            className="input-field"
            id="price-max"
          />
        </div>
      </div>

      {/* Apply Button */}
      <div className="pt-2">
        <Button onClick={handleApply} variant="primary" className="w-full">
          Apply Filters
        </Button>
      </div>
    </aside>
  );
};

export default ProductFilters;
