import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import Button from '../ui/Button';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <div className="group relative flex flex-col h-full transition-all duration-700">
      <Link to={`/products/${product._id}`} className="block">
        {/* Image Container */}
        <div className="relative overflow-hidden mb-2 rounded-lg">
          <div className="aspect-square bg-botanical-surface overflow-hidden">
            <img
              src={
                product.images?.[0] ||
                `https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&q=80`
              }
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          </div>

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-botanical-text/0 group-hover:bg-botanical-text/10 transition-all duration-500" />

          {/* Quick Add button */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex items-center gap-1 px-3 py-1.5 bg-white text-botanical-text text-xs font-sans font-medium rounded-full shadow-soft-md hover:bg-botanical-text hover:text-white transition-all duration-300 whitespace-nowrap"
            >
              <ShoppingBag className="w-2.5 h-2.5" />
              {product.stock === 0 ? 'Out' : 'Add'}
            </button>
          </div>

          {/* Stock badge */}
          {product.stock === 0 && (
            <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-100 text-red-600 text-xs font-sans rounded-full">
              Out
            </div>
          )}
          {product.featured && product.stock > 0 && (
            <div className="absolute top-2 left-2 px-2 py-0.5 bg-botanical-primary text-white text-xs font-sans rounded-full">
              New
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col flex-1">
          <p className="text-botanical-muted text-xs font-sans uppercase tracking-widest mb-0.5 capitalize">
            {product.category}
          </p>
          <h3 className="font-serif text-sm font-medium text-botanical-text leading-snug mb-1.5 group-hover:text-botanical-primary transition-colors duration-300 flex-1 line-clamp-2">
            {product.name}
          </h3>

          {/* Rating - Always Show */}
          <div className="flex items-center gap-1.5 mb-1 mt-auto">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-2.5 h-2.5"
                  fill={i < Math.round(product.rating) ? '#C27B66' : 'none'}
                  stroke={i < Math.round(product.rating) ? '#C27B66' : '#D1D5DB'}
                />
              ))}
            </div>
            <span className="text-botanical-muted text-xs font-sans">
              {product.numReviews > 0 ? `${product.rating.toFixed(1)} (${product.numReviews})` : 'No reviews'}
            </span>
          </div>

          <p className="font-sans font-semibold text-botanical-text text-xs mt-0.5">
            {formatPrice(product.price)}
          </p>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
