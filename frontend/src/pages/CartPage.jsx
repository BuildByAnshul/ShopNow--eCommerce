import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import Button from '../components/ui/Button';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

const CartPage = () => {
  const { items, total, count, removeFromCart, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();

  const shipping = total >= 999 ? 0 : 99;
  const grandTotal = total + shipping;

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center animate-slide-up">
          <div className="w-24 h-24 rounded-full bg-botanical-surface flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-botanical-muted" />
          </div>
          <h2 className="font-serif text-3xl font-semibold text-botanical-text mb-3">
            Your cart is empty
          </h2>
          <p className="font-sans text-botanical-muted mb-8">
            Discover our beautiful botanical collection
          </p>
          <Link to="/products">
            <Button variant="primary">
              Browse Products
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24">
      <div className="section-container !py-12">
        <h1 className="section-heading mb-2">
          Your <em className="italic text-botanical-accent">Cart</em>
        </h1>
        <p className="font-sans text-botanical-muted mb-10">{count} item{count !== 1 ? 's' : ''}</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(({ product, quantity }) => (
              <div
                key={product._id}
                className="flex gap-5 bg-white rounded-3xl p-5 shadow-soft hover:shadow-soft-md transition-all duration-500"
              >
                {/* Image */}
                <div className="w-24 h-28 rounded-2xl overflow-hidden bg-botanical-surface flex-shrink-0">
                  <img
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=200&q=80'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${product._id}`}>
                    <h3 className="font-serif text-lg font-medium text-botanical-text hover:text-botanical-primary transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="font-sans text-xs text-botanical-muted capitalize mt-0.5">{product.category}</p>
                  <p className="font-sans font-semibold text-botanical-text mt-2">
                    {formatPrice(product.price)}
                  </p>

                  {/* Qty + Remove */}
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-2 border border-botanical-border rounded-full px-3 py-1.5">
                      <button
                        onClick={() => updateQuantity(product._id, quantity - 1)}
                        className="text-botanical-muted hover:text-botanical-text transition-colors"
                        disabled={quantity <= 1}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-sans text-sm font-medium w-5 text-center">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product._id, quantity + 1)}
                        className="text-botanical-muted hover:text-botanical-text transition-colors"
                        disabled={quantity >= product.stock}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(product._id)}
                      className="p-1.5 text-botanical-muted hover:text-red-500 transition-colors"
                      aria-label="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="flex-shrink-0 text-right">
                  <p className="font-sans font-semibold text-botanical-text">
                    {formatPrice(product.price * quantity)}
                  </p>
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center pt-2">
              <Link to="/products" className="font-sans text-sm text-botanical-muted hover:text-botanical-primary transition-colors flex items-center gap-1">
                ← Continue Shopping
              </Link>
              <button
                onClick={clearCart}
                className="font-sans text-sm text-red-400 hover:text-red-600 transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-botanical-surface rounded-3xl p-7 sticky top-28">
              <h2 className="font-serif text-xl font-semibold text-botanical-text mb-6">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between font-sans text-sm text-botanical-text">
                  <span className="text-botanical-muted">Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between font-sans text-sm">
                  <span className="text-botanical-muted">Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                    {shipping === 0 ? 'Free' : formatPrice(shipping)}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="font-sans text-xs text-botanical-muted bg-botanical-secondary/50 rounded-xl px-3 py-2">
                    Add {formatPrice(999 - total)} more for free shipping!
                  </p>
                )}
                <div className="border-t border-botanical-border pt-3 flex justify-between">
                  <span className="font-sans font-semibold text-botanical-text">Total</span>
                  <span className="font-serif text-xl font-semibold text-botanical-text">
                    {formatPrice(grandTotal)}
                  </span>
                </div>
              </div>

              <Button
                onClick={() => navigate('/checkout')}
                variant="primary"
                className="w-full"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </Button>

              <p className="font-sans text-xs text-botanical-muted text-center mt-4">
                Secure checkout powered by Razorpay
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
