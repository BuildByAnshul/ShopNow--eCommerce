import React from 'react';
import ProductCard from './ProductCard';
import Spinner from '../ui/Spinner';

const ProductGrid = ({ products, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Spinner size="lg" />
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
