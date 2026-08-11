import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../redux/slices/productSlice';
import ProductCard from '../components/product/ProductCard';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { Tag, Clock, ArrowRight, Sparkles } from 'lucide-react';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

const CountdownTimer = ({ targetDate, className = "" }) => {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate) - new Date();
      if (difference > 0) {
        setTimeLeft({
          d: Math.floor(difference / (1000 * 60 * 60 * 24)),
          h: Math.floor((difference / (1000 * 60 * 60)) % 24),
          m: Math.floor((difference / 1000 / 60) % 60),
          s: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className={`flex gap-3 ${className}`}>
      {[
        { label: 'Days', value: timeLeft.d },
        { label: 'Hours', value: timeLeft.h },
        { label: 'Mins', value: timeLeft.m },
        { label: 'Secs', value: timeLeft.s }
      ].map((unit, i) => (
        <div key={i} className="flex flex-col items-center">
          <div className="w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-md rounded-xl border border-white/20 mb-1 shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
            <span className="font-serif text-xl font-bold text-white">{unit.value.toString().padStart(2, '0')}</span>
          </div>
          <span className="font-sans text-[10px] uppercase tracking-wider text-white/70">{unit.label}</span>
        </div>
      ))}
    </div>
  );
};

const OffersPage = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.products);

  useEffect(() => {
    window.scrollTo(0, 0);
    dispatch(fetchProducts({ offersOnly: true, limit: 100 }));
  }, [dispatch]);

  const now = new Date();
  
  // Categorize offers
  const activeOffers = items.filter(
    (product) => 
      product.offer && 
      product.offer.discountPercentage > 0 &&
      new Date(product.offer.expiresAt) > now &&
      (!product.offer.startsAt || new Date(product.offer.startsAt) <= now)
  );

  const upcomingSales = items.filter(
    (product) => 
      product.offer && 
      product.offer.discountPercentage > 0 &&
      product.offer.startsAt && 
      new Date(product.offer.startsAt) > now
  );

  // Find the product with the highest discount for Deal of the Day
  const dealOfTheDay = activeOffers.length > 0 
    ? [...activeOffers].sort((a, b) => b.offer.discountPercentage - a.offer.discountPercentage)[0]
    : null;

  // Filter out the deal of the day from the general active offers
  const remainingActiveOffers = activeOffers.filter(p => p._id !== dealOfTheDay?._id);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-botanical-bg">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-botanical-bg overflow-x-hidden">
      
      {/* ── DEAL OF THE DAY HERO ── */}
      {dealOfTheDay ? (
        <div className="relative pt-24 pb-12 lg:pb-0 lg:pt-0 lg:min-h-screen flex items-center bg-[#1a2e21]">
          {/* Background Decorative Elements */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-botanical-primary/20 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#c27b66]/20 rounded-full blur-[100px] -translate-x-1/4 translate-y-1/4 pointer-events-none" />

          <div className="section-container relative z-10 w-full h-full pt-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center h-full">
              
              {/* Info Column */}
              <div className="order-2 lg:order-1 animate-slide-up">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full mb-6 backdrop-blur-md">
                  <Sparkles className="w-4 h-4 text-red-400" />
                  <span className="font-sans text-xs font-bold text-red-400 uppercase tracking-widest">Deal of the Day</span>
                </div>
                
                <h1 className="font-serif text-5xl lg:text-7xl font-medium text-white leading-[1.1] mb-6">
                  {dealOfTheDay.name}
                </h1>
                
                <p className="font-sans text-white/70 text-lg mb-8 max-w-lg leading-relaxed line-clamp-3">
                  {dealOfTheDay.description}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-end gap-6 mb-10">
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 inline-block">
                    <p className="font-sans text-xs text-white/50 uppercase tracking-widest mb-2">Offer Ends In</p>
                    <CountdownTimer targetDate={dealOfTheDay.offer.expiresAt} />
                  </div>
                  
                  <div className="mb-2">
                    <p className="font-sans text-sm text-white/50 line-through mb-1">
                      {formatPrice(dealOfTheDay.price)}
                    </p>
                    <p className="font-serif text-4xl text-white font-semibold">
                      {formatPrice(dealOfTheDay.price - (dealOfTheDay.price * dealOfTheDay.offer.discountPercentage / 100))}
                    </p>
                  </div>
                </div>

                <Link to={`/products/${dealOfTheDay._id}`}>
                  <button className="flex items-center gap-3 px-8 py-4 bg-white text-[#1a2e21] font-sans font-semibold rounded-full hover:bg-botanical-accent hover:text-white transition-all duration-300 transform hover:scale-105 shadow-xl shadow-white/5">
                    Shop This Deal Now <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
              </div>

              {/* Image Column */}
              <div className="order-1 lg:order-2 relative lg:h-[800px] flex items-center justify-center">
                {/* Sale Badge overlay */}
                <div className="absolute top-4 lg:top-1/4 right-4 lg:right-10 z-20 w-24 h-24 bg-red-500 text-white rounded-full flex flex-col items-center justify-center shadow-2xl rotate-12 transform hover:rotate-0 transition-transform duration-500">
                  <span className="font-sans font-bold text-sm uppercase tracking-widest leading-none mb-1">Save</span>
                  <span className="font-serif text-3xl font-bold leading-none">{dealOfTheDay.offer.discountPercentage}%</span>
                </div>
                
                <div className="relative w-full max-w-md lg:max-w-none aspect-[4/5] lg:aspect-auto lg:h-[80%] rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 group">
                  <img 
                    src={dealOfTheDay.images?.[0] || 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc'}
                    alt={dealOfTheDay.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a2e21]/80 via-transparent to-transparent opacity-60" />
                </div>
              </div>

            </div>
          </div>
        </div>
      ) : (
        <div className="relative pt-40 pb-32 text-center bg-[#1a2e21] overflow-hidden">
          {/* Decorative blur elements to match dark theme */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-botanical-primary/20 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#c27b66]/10 rounded-full blur-[80px] -translate-x-1/4 translate-y-1/4 pointer-events-none" />
          
          <div className="section-container relative z-10">
            <div className="w-20 h-20 mx-auto bg-white/10 text-botanical-secondary rounded-full flex items-center justify-center mb-6 backdrop-blur-sm border border-white/20">
              <Tag className="w-10 h-10" />
            </div>
            <h1 className="font-serif text-5xl sm:text-7xl font-semibold text-white leading-tight mb-4">
              Exclusive <em className="italic text-botanical-secondary">Offers</em>
            </h1>
            <p className="font-sans text-white/70 max-w-xl mx-auto text-lg">
              Discover our curated selection of premium products at special prices.
            </p>
          </div>
        </div>
      )}

      {/* ── ACTIVE OFFERS SECTION ── */}
      {remainingActiveOffers.length > 0 && (
        <div className="relative py-24 bg-gradient-to-b from-botanical-bg to-white">
          <div className="section-container">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
              <div>
                <h2 className="font-serif text-3xl md:text-4xl font-semibold text-botanical-text mb-2 flex items-center gap-3">
                  <Tag className="w-8 h-8 text-botanical-accent" />
                  Limited Time <em className="italic">Offers</em>
                </h2>
                <p className="font-sans text-botanical-muted text-sm max-w-lg">
                  Shop these incredible deals before they're gone. Premium quality at exceptional value.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
              {remainingActiveOffers.map((product) => (
                <div key={product._id} className="transform hover:-translate-y-2 transition-transform duration-500">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── UPCOMING SALES SECTION ── */}
      {upcomingSales.length > 0 && (
        <div className="py-24 bg-botanical-surface/50 border-t border-botanical-border">
          <div className="section-container">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-botanical-primary/10 rounded-full mb-4">
                <Clock className="w-4 h-4 text-botanical-primary" />
                <span className="font-sans text-xs font-bold text-botanical-primary uppercase tracking-widest">Sneak Peek</span>
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-botanical-text mb-4">
                Upcoming <em className="italic text-botanical-muted">Sales</em>
              </h2>
              <p className="font-sans text-botanical-muted max-w-md mx-auto">
                Mark your calendars. These exclusive deals will be dropping soon. 
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 opacity-80 hover:opacity-100 transition-opacity duration-500">
              {upcomingSales.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── EMPTY STATE ── */}
      {activeOffers.length === 0 && upcomingSales.length === 0 && (
        <div className="py-32 section-container">
          <div className="text-center bg-white rounded-[3rem] p-16 shadow-soft-xl border border-botanical-border max-w-3xl mx-auto">
            <div className="w-20 h-20 mx-auto bg-botanical-surface text-botanical-muted rounded-full flex items-center justify-center mb-6">
              <Tag className="w-10 h-10" />
            </div>
            <h2 className="font-serif text-3xl font-semibold text-botanical-text mb-4">No Special Offers Currently</h2>
            <p className="font-sans text-botanical-muted mb-8 text-lg">
              We're currently brewing some amazing new deals for you. Check back soon!
            </p>
            <Link to="/products">
              <Button variant="primary" className="px-8">
                Explore All Products
              </Button>
            </Link>
          </div>
        </div>
      )}

    </div>
  );
};

export default OffersPage;
