import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { fetchProductById, clearCurrentProduct } from '../redux/slices/productSlice';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { productService } from '../services/productService';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import Badge from '../components/ui/Badge';
import ProductCard from '../components/product/ProductCard';
import { ShoppingBag, Star, Minus, Plus, ArrowLeft, Package, Truck, ShieldCheck, RefreshCcw, CheckCircle, Zap, Leaf, Play, Trash2 } from 'lucide-react';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

const ProductDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentProduct: product, loading, error } = useSelector((s) => s.products);
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
    dispatch(fetchProductById(id));
    return () => dispatch(clearCurrentProduct());
  }, [id, dispatch]);

  // Fetch related products from same category
  useEffect(() => {
    if (product && product.category) {
      setRelatedLoading(true);
      productService.getProducts({ category: product.category, limit: 6 })
        .then(data => {
          // Filter out current product and get related ones
          const related = (data.products || []).filter(p => p._id !== product._id);
          setRelatedProducts(related.slice(0, 6));
        })
        .catch(err => console.error('Failed to fetch related products:', err))
        .finally(() => setRelatedLoading(false));
    }
  }, [product]);

  // Check if user has purchased this product
  useEffect(() => {
    if (user && product && user.role !== 'admin') {
      setCheckingPurchase(true);
      productService.checkPurchase(id)
        .then(data => setHasPurchased(data.purchased))
        .catch(err => console.error('Failed to check purchase:', err))
        .finally(() => setCheckingPurchase(false));
    }
  }, [id, user, product]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    toast.success(`${quantity} ${product.name} added to cart`, {
      position: 'top-right',
      style: {
        marginTop: '64px', // Below the cart icon
        background: '#ffffff',
        color: '#1a1f1b',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '500'
      },
      iconTheme: {
        primary: '#4a6b53', // botanical-primary
        secondary: '#fff',
      },
    });
    setTimeout(() => setAdded(false), 2000);
  };

  const handleAddReview = async () => {
    if (!user) {
      toast.error('Please login to add a review');
      return;
    }
    if (!reviewComment.trim()) {
      setReviewError('Please write a comment');
      return;
    }

    setReviewLoading(true);
    setReviewError('');
    try {
      await productService.addReview(id, {
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewSubmitted(true);
      setReviewComment('');
      setReviewRating(5);
      
      // Refresh product to get updated reviews
      dispatch(fetchProductById(id));
      
      setTimeout(() => setReviewSubmitted(false), 3000);
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to add review');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await productService.removeReview(id, reviewId);
      toast.success('Review deleted successfully');
      dispatch(fetchProductById(id));
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete review');
    }
  };

  if (loading) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );

  if (error || !product) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="text-center">
        <p className="font-serif text-2xl text-botanical-muted mb-4">Product not found</p>
        <Link to="/products"><Button>Browse Products</Button></Link>
      </div>
    </div>
  );

  const images = product.images?.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800&q=80'];

  // Build combined media array: all images + video (if exists)
  const mediaItems = images.map((url) => ({ type: 'image', url }));
  if (product.video) {
    mediaItems.push({ type: 'video', url: product.video });
  }

  const currentMedia = mediaItems[selectedImage] || mediaItems[0];

  return (
    <div className="min-h-screen pt-24">
      <div className="section-container !py-8">
        {/* Breadcrumb */}
        <Link to="/products" className="inline-flex items-center gap-2 text-xs font-sans text-botanical-muted hover:text-botanical-primary transition-colors mb-6">
          <ArrowLeft className="w-3 h-3" /> Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images + Video Gallery */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Thumbnails (images + video) */}
            {mediaItems.length > 1 && (
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:max-h-[500px] custom-scrollbar pb-2 md:pb-0 md:pr-2 order-2 md:order-1 flex-shrink-0">
                {mediaItems.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                      selectedImage === i
                        ? 'border-botanical-primary shadow-soft'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    {item.type === 'video' ? (
                      <>
                        <video src={item.url} muted className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Play className="w-5 h-5 text-white" fill="white" />
                        </div>
                      </>
                    ) : (
                      <img src={item.url} alt="" className="w-full h-full object-cover" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Main media viewer */}
            <div className="flex-1 overflow-hidden bg-botanical-surface shadow-soft-lg rounded-3xl order-1 md:order-2">
              <div className="aspect-square overflow-hidden">
                {currentMedia?.type === 'video' ? (
                  <video
                    src={currentMedia.url}
                    controls
                    autoPlay
                    className="w-full h-full object-contain bg-black transition-all duration-700"
                  />
                ) : (
                  <img
                    src={currentMedia?.url}
                    alt={product.name}
                    className="w-full h-full object-cover transition-all duration-700"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="animate-slide-up">
            <p className="font-sans text-botanical-primary text-xs font-medium tracking-widest uppercase mb-2 capitalize">
              {product.category}
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-botanical-text leading-tight mb-3">
              {product.name}
            </h1>

            {/* Rating */}
            {product.numReviews > 0 && (
              <div className="flex items-center gap-3 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4" fill={i < Math.round(product.rating) ? '#C27B66' : 'none'} stroke={i < Math.round(product.rating) ? '#C27B66' : '#9AA394'} />
                  ))}
                </div>
                <span className="font-sans text-sm text-botanical-muted">
                  {product.rating.toFixed(1)} ({product.numReviews} {product.numReviews === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            )}

            <p className="font-serif text-4xl font-semibold text-botanical-text mb-5">
              {formatPrice(product.price)}
            </p>

            {/* Stock Badge */}
            <div className="flex items-center gap-2 mb-5">
              <Package className="w-4 h-4 text-botanical-muted" />
              {product.stock > 0 ? (
                <span className="font-sans text-sm text-green-600 font-medium">
                  In Stock • {product.stock} Available
                </span>
              ) : (
                <Badge variant="failed">Out of Stock</Badge>
              )}
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-3 mb-5 p-4 bg-botanical-surface rounded-2xl">
              <div>
                <p className="font-sans text-xs text-botanical-muted uppercase tracking-wide mb-1">SKU</p>
                <p className="font-sans font-medium text-botanical-text text-sm">PROD-{id?.slice(-6).toUpperCase()}</p>
              </div>
              <div>
                <p className="font-sans text-xs text-botanical-muted uppercase tracking-wide mb-1">Category</p>
                <p className="font-sans font-medium text-botanical-text text-sm capitalize">{product.category}</p>
              </div>
            </div>

            <p className="font-sans text-botanical-muted text-sm leading-relaxed mb-5">
              {product.description}
            </p>

            {/* Quantity + Add to Cart */}
            {product.stock > 0 && (
              <div className="flex flex-wrap gap-3 items-center mb-6">
                {/* Qty control */}
                <div className="flex items-center gap-3 border border-botanical-border rounded-full px-4 py-2.5">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-5 h-5 flex items-center justify-center text-botanical-muted hover:text-botanical-text transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-sans font-semibold text-botanical-text w-6 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-5 h-5 flex items-center justify-center text-botanical-muted hover:text-botanical-text transition-colors"
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <Button
                  onClick={handleAddToCart}
                  variant={added ? 'secondary' : 'primary'}
                  className="flex-1 sm:flex-none text-sm px-8 py-2.5"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {added ? 'Added to Cart!' : 'Add to Cart'}
                </Button>
              </div>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 pt-5 border-t border-botanical-border">
              <div className="text-center py-2">
                <Truck className="w-5 h-5 text-botanical-primary mx-auto mb-1" />
                <p className="font-sans text-xs text-botanical-muted">Free Shipping</p>
              </div>
              <div className="text-center py-2">
                <RefreshCcw className="w-5 h-5 text-botanical-primary mx-auto mb-1" />
                <p className="font-sans text-xs text-botanical-muted">30-Day Returns</p>
              </div>
              <div className="text-center py-2">
                <ShieldCheck className="w-5 h-5 text-botanical-primary mx-auto mb-1" />
                <p className="font-sans text-xs text-botanical-muted">Secure</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Benefits Section */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-botanical-primary/5 to-transparent rounded-2xl p-5 border border-botanical-primary/10">
            <div className="flex items-start gap-3 mb-2">
              <Zap className="w-5 h-5 text-botanical-primary mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-serif font-semibold text-botanical-text text-sm mb-1">Fast Acting</h3>
                <p className="font-sans text-xs text-botanical-muted">Quick results for visible benefits</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-botanical-primary/5 to-transparent rounded-2xl p-5 border border-botanical-primary/10">
            <div className="flex items-start gap-3 mb-2">
              <Leaf className="w-5 h-5 text-botanical-primary mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-serif font-semibold text-botanical-text text-sm mb-1">Natural Ingredients</h3>
                <p className="font-sans text-xs text-botanical-muted">Carefully selected quality sources</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-botanical-primary/5 to-transparent rounded-2xl p-5 border border-botanical-primary/10">
            <div className="flex items-start gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-botanical-primary mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-serif font-semibold text-botanical-text text-sm mb-1">Tested & Proven</h3>
                <p className="font-sans text-xs text-botanical-muted">Customer verified quality</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details & Usage */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Key Details */}
          <div className="bg-botanical-surface rounded-2xl p-6">
            <h3 className="font-serif text-lg font-semibold text-botanical-text mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-botanical-primary" />
              Product Details
            </h3>
            <ul className="space-y-3">
              <li className="flex justify-between items-start gap-4 py-2 border-b border-botanical-border/30">
                <span className="font-sans text-sm text-botanical-muted">Storage</span>
                <span className="font-sans font-medium text-botanical-text text-sm">{product.details?.storage || 'Cool & Dry Place'}</span>
              </li>
              <li className="flex justify-between items-start gap-4 py-2 border-b border-botanical-border/30">
                <span className="font-sans text-sm text-botanical-muted">Shelf Life</span>
                <span className="font-sans font-medium text-botanical-text text-sm">{product.details?.shelfLife || '24 Months'}</span>
              </li>
              <li className="flex justify-between items-start gap-4 py-2 border-b border-botanical-border/30">
                <span className="font-sans text-sm text-botanical-muted">Type</span>
                <span className="font-sans font-medium text-botanical-text text-sm capitalize">{product.category}</span>
              </li>
              <li className="flex justify-between items-start gap-4 py-2">
                <span className="font-sans text-sm text-botanical-muted">Suitable For</span>
                <span className="font-sans font-medium text-botanical-text text-sm">{product.details?.suitableFor || 'All Skin Types'}</span>
              </li>
            </ul>
          </div>

          {/* Usage Guide */}
          <div className="bg-botanical-surface rounded-2xl p-6">
            <h3 className="font-serif text-lg font-semibold text-botanical-text mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-botanical-primary" />
              How to Use
            </h3>
            <ol className="space-y-3">
              {(product.howToUse?.length > 0 ? product.howToUse : [
                'Clean and dry the area thoroughly',
                'Apply a small amount evenly',
                'Massage gently for 1-2 minutes',
                'Use 2-3 times daily for best results'
              ]).map((step, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-botanical-primary text-white flex items-center justify-center font-sans text-xs font-bold">{idx + 1}</span>
                  <span className="font-sans text-sm text-botanical-muted">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Add Review Form */}
        {user && user.role !== 'admin' && (
          <div className="mt-8 bg-white rounded-2xl p-6 shadow-soft">
            <h2 className="font-serif text-2xl font-semibold text-botanical-text mb-4">
              Share Your <em className="italic">Review</em>
            </h2>
            
            {hasPurchased ? (
              <div className="space-y-4">
                <div>
                  <label className="block font-sans text-sm font-medium text-botanical-text mb-2">
                    Rating
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className="w-7 h-7 cursor-pointer"
                          fill={star <= reviewRating ? '#C27B66' : 'none'}
                          stroke={star <= reviewRating ? '#C27B66' : '#D1D5DB'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-sans text-sm font-medium text-botanical-text mb-2">
                    Your Review
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience with this product..."
                    className="w-full px-4 py-2.5 border border-botanical-border rounded-xl focus:outline-none focus:ring-2 focus:ring-botanical-primary resize-none text-sm"
                    rows={3}
                  />
                </div>

                {reviewError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="font-sans text-red-700 text-xs font-medium">
                      {reviewError}
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleAddReview}
                  disabled={reviewLoading}
                  variant="primary"
                  className="text-sm py-2.5"
                >
                  {reviewLoading ? 'Submitting...' : 'Submit Review'}
                </Button>

                {reviewSubmitted && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
                    <p className="font-sans text-green-700 text-xs font-medium">
                      ✓ Thank you! Your review has been added.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-botanical-surface rounded-xl text-center">
                <p className="font-sans text-botanical-muted mb-2 text-sm">
                  Only customers who purchased this product can leave a review.
                </p>
                <p className="font-sans text-xs text-botanical-muted">
                  Buy this product to share your experience with others.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Reviews */}
        {product.reviews?.length > 0 && (
          <div className="mt-8">
            <h2 className="font-serif text-2xl font-semibold text-botanical-text mb-5">
              Customer <em className="italic">Reviews</em> ({product.numReviews})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.reviews.map((review, i) => (
                <div key={i} className="bg-botanical-surface rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-sans font-semibold text-botanical-text text-sm">{review.name}</p>
                      <div className="flex mt-1">
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} className="w-3 h-3" fill={j < review.rating ? '#C27B66' : 'none'} stroke={j < review.rating ? '#C27B66' : '#D1D5DB'} />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-sans text-xs text-botanical-muted">
                        {new Date(review.createdAt).toLocaleDateString('en-IN')}
                      </p>
                      {user?.role === 'admin' && (
                        <button onClick={() => handleDeleteReview(review._id)} className="text-botanical-muted hover:text-red-500 transition-colors p-1" title="Delete Review">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="font-sans text-sm text-botanical-muted leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-8">
            <p className="font-sans text-botanical-primary text-xs font-medium tracking-widest uppercase mb-2">
              More from {product.category}
            </p>
            <h2 className="font-serif text-2xl font-semibold text-botanical-text mb-5">
              Related <em className="italic">Products</em>
            </h2>
            {relatedLoading ? (
              <div className="flex justify-center py-8">
                <Spinner size="lg" />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {relatedProducts.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
