import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../redux/slices/productSlice';
import { setFilters, clearFilters } from '../redux/slices/productSlice';
import ProductGrid from '../components/product/ProductGrid';
import ProductFilters from '../components/product/ProductFilters';
import { SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';

const ProductsPage = () => {
  const dispatch = useDispatch();
  const { items, loading, total, pages, page, filters } = useSelector((s) => s.products);
  const [searchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Sync URL query params to filters on mount
  useEffect(() => {
    window.scrollTo(0, 0);
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';
    const sale = searchParams.get('sale') || '';
    dispatch(setFilters({ category, search, sale }));
  }, [searchParams]);

  useEffect(() => {
    dispatch(
      fetchProducts({
        ...filters,
        page: currentPage,
        limit: 12,
      })
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [filters, currentPage, dispatch]);

  const handleFilterChange = (updated) => {
    dispatch(setFilters(updated));
    setCurrentPage(1);
  };

  const handleClear = () => {
    dispatch(clearFilters());
    setCurrentPage(1);
  };

  const getPaginationGroup = () => {
    if (pages <= 5) return Array.from({ length: pages }, (_, i) => i + 1);
    
    if (currentPage <= 3) return [1, 2, 3, 4, '...', pages];
    if (currentPage >= pages - 2) return [1, '...', pages - 3, pages - 2, pages - 1, pages];
    
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', pages];
  };

  return (
    <div className="min-h-screen pt-24">
      <div className="section-container !py-12">
        {/* Header */}
        <div className="mb-12">
          <p className="font-sans text-botanical-primary text-xs font-medium tracking-widest uppercase mb-3">
            All Products
          </p>
          <div className="flex items-end justify-between gap-4">
            <h1 className="section-heading">
              The <em className="italic text-botanical-accent">Collection</em>
            </h1>
            <div className="flex items-center gap-3">
              <span className="font-sans text-sm text-botanical-muted hidden sm:block">
                {total} products
              </span>
              {/* Mobile filter toggle */}
              <button
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 border border-botanical-border rounded-full text-sm font-sans text-botanical-text hover:border-botanical-primary transition-colors"
                onClick={() => setMobileFiltersOpen(true)}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>
          <div className="botanical-divider !mx-0 !mt-6" />
        </div>

        <div className="flex gap-12">
          {/* Desktop Filters */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar pr-2">
              <ProductFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onClear={handleClear}
              />
            </div>
          </aside>

          {/* Products */}
          <div className="flex-1 min-w-0">
            <ProductGrid products={items} loading={loading} />

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-16">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 flex items-center justify-center rounded-full text-botanical-text disabled:opacity-30 disabled:cursor-not-allowed hover:bg-botanical-surface transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                {getPaginationGroup().map((item, index) => (
                  <button
                    key={index}
                    onClick={() => item !== '...' && setCurrentPage(item)}
                    disabled={item === '...'}
                    className={`w-10 h-10 rounded-full text-sm font-sans font-medium transition-all duration-300 ${
                      item === '...' 
                        ? 'cursor-default text-botanical-muted'
                        : currentPage === item
                        ? 'bg-botanical-text text-white shadow-soft'
                        : 'border border-botanical-border text-botanical-text hover:border-botanical-primary hover:text-botanical-primary'
                    }`}
                  >
                    {item}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, pages))}
                  disabled={currentPage === pages}
                  className="w-10 h-10 flex items-center justify-center rounded-full text-botanical-text disabled:opacity-30 disabled:cursor-not-allowed hover:bg-botanical-surface transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-botanical-text/30 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />
          <div className="relative ml-auto w-80 max-w-full h-full bg-botanical-bg shadow-soft-lg overflow-y-auto p-8 animate-slide-up">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-serif text-xl text-botanical-text">Filters</h3>
              <button onClick={() => setMobileFiltersOpen(false)}>
                <X className="w-5 h-5 text-botanical-muted" />
              </button>
            </div>
            <ProductFilters
              filters={filters}
              onFilterChange={(f) => { handleFilterChange(f); }}
              onClear={handleClear}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
