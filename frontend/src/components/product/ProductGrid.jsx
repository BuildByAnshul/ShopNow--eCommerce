import React from 'react';
import ProductCard from './ProductCard';
import Spinner from '../ui/Spinner';

const SkeletonCard = () => (
  <div className="flex flex-col h-full animate-pulse">
    {/* Image Container */}
    <div className="relative overflow-hidden mb-2 rounded-lg">
      <div className="aspect-square bg-botanical-surface" />
    </div>

    {/* Info */}
    <div className="flex flex-col flex-1 mt-1">
      <div className="h-2.5 w-16 bg-botanical-border rounded-full mb-1.5"></div>
      <div className="h-4 w-3/4 bg-botanical-border rounded-full mb-2"></div>
      
      <div className="flex items-center gap-1.5 mb-1 mt-auto">
         <div className="h-2 w-20 bg-botanical-border rounded-full"></div>
      </div>
      
      <div className="h-3 w-12 bg-botanical-border rounded-full mt-1.5"></div>
    </div>
  </div>
);

const ProductGrid = ({ products, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="font-serif text-2xl text-botanical-muted mb-3">No products found</p>
        <p className="font-sans text-sm text-botanical-muted">
          Try adjusting your filters or search term.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
      {products.map((product, index) => (
        <ProductCard key={product._id} product={product} index={index} />
      ))}
    </div>
  );
};

export default ProductGrid;
