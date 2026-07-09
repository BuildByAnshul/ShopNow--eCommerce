import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Sparkles, Shield, Truck } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../redux/slices/productSlice';
import ProductGrid from '../components/product/ProductGrid';
import Button from '../components/ui/Button';

/* ── Static data ─────────────────────────────────────────── */
const CATEGORIES = [
  { label: 'Skincare', icon: '🌿', image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&q=80', slug: 'skincare' },
  { label: 'Haircare', icon: '✨', image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=600&q=80', slug: 'haircare' },
  { label: 'Wellness', icon: '🌸', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80', slug: 'wellness' },
  { label: 'Aromatherapy', icon: '🕯️', image: 'https://images.unsplash.com/photo-1602928309195-9ff5a71fa7a2?w=600&q=80', slug: 'aromatherapy' },
];

const FEATURES = [
  { icon: Leaf, title: 'Certified Organic', desc: 'Every ingredient is certified organic and ethically sourced from trusted farms.' },
  { icon: Sparkles, title: 'Artisan Crafted', desc: 'Small-batch production ensures extraordinary quality in every product.' },
  { icon: Shield, title: 'Clean & Safe', desc: 'Free from parabens, sulfates, and harmful synthetic fragrances.' },
  { icon: Truck, title: 'Free Delivery', desc: 'Complimentary shipping on all orders above ₹999 across India.' },
];

/* ── Scroll-reveal hook ──────────────────────────────────── */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('revealed'); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ── Page ────────────────────────────────────────────────── */
const HomePage = () => {
  const dispatch = useDispatch();
  const { items: products, loading } = useSelector((s) => s.products);

  useEffect(() => { dispatch(fetchProducts({ featured: true, limit: 8 })); }, [dispatch]);

  const heroRef = useReveal();
  const manifestoRef = useReveal();
  const featuresRef = useReveal();
  const newsletterRef = useReveal();

  return (
    <div className="min-h-screen bg-botanical-bg">

      {/* ════════════════════════════════════════════════════
          HERO — Full screen, two-column, editorial
      ════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-botanical-bg">

        {/* Decorative soft circle */}
        <div className="absolute -top-32 -right-32 w-[640px] h-[640px] rounded-full bg-botanical-secondary/30 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -left-20 w-96 h-96 rounded-full bg-botanical-primary/10 blur-3xl pointer-events-none" />

        <div ref={heroRef} className="reveal section-container grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left – Text */}
          <div>
            <p className="font-sans text-botanical-accent text-xs font-semibold tracking-[0.25em] uppercase mb-6">
              ✦ New Collection 2025
            </p>

            <h1 className="font-serif text-5xl sm:text-6xl xl:text-7xl font-bold leading-[1.08] text-botanical-text mb-8">
              Discover{' '}
              <em className="italic text-botanical-accent font-semibold">Nature-Inspired</em>
              <br />Living
            </h1>

            <p className="font-sans text-botanical-muted text-lg leading-relaxed max-w-md mb-10">
              A curated collection of certified organic skincare, wellness rituals,
              and botanical essentials — crafted to nurture your body and calm your mind.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/products">
                <button className="btn-primary">
                  Shop Collection <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link to="/products">
                <button className="btn-secondary">
                  Explore More
                </button>
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-8 mt-12 pt-8 border-t border-botanical-border">
              {[['4.9★', 'Rating'], ['12K+', 'Happy Customers'], ['100%', 'Organic']].map(([val, label]) => (
                <div key={label}>
                  <p className="font-serif text-2xl font-semibold text-botanical-text">{val}</p>
                  <p className="font-sans text-xs text-botanical-muted uppercase tracking-wider mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right – Arch image */}
          <div className="relative flex justify-center lg:justify-end">
            {/* Main arch */}
            <div className="arch-image w-72 sm:w-80 xl:w-96 aspect-[3/4] shadow-soft-lg overflow-hidden group">
              <img
                src="https://images.unsplash.com/photo-1608236443317-14b361138e66?w=900&q=85"
                alt="Botanical wellness products"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            {/* Floating badge */}
            <div className="absolute top-6 -left-4 sm:left-0 bg-white rounded-3xl shadow-soft-md px-5 py-4 flex items-center gap-3 animate-float">
              <div className="w-10 h-10 rounded-full bg-botanical-secondary flex items-center justify-center flex-shrink-0">
                <Leaf className="w-5 h-5 text-botanical-accent" />
              </div>
              <div>
                <p className="font-sans text-xs font-semibold text-botanical-text">100% Organic</p>
                <p className="font-sans text-xs text-botanical-muted">Certified & tested</p>
              </div>
            </div>

            {/* Second small image (offset) */}
            <div className="hidden lg:block absolute -bottom-8 -left-8 w-44 rounded-3xl overflow-hidden shadow-soft-md group">
              <img
                src="https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80"
                alt="Natural ingredients"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          MANIFESTO — Editorial two-column
      ════════════════════════════════════════════════════ */}
      <section className="border-t border-b border-botanical-border bg-botanical-surface">
        <div ref={manifestoRef} className="reveal section-container grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* Label column */}
          <div className="lg:col-span-3">
            <p className="font-sans text-xs text-botanical-muted uppercase tracking-[0.2em] border-t border-botanical-border pt-6 mt-1">
              Our Philosophy
            </p>
          </div>

          {/* Text column */}
          <div className="lg:col-span-9">
            <p className="font-serif text-3xl md:text-4xl font-medium text-botanical-text leading-snug max-w-3xl pl-0 lg:pl-8">
              We believe that the{' '}
              <em className="italic text-botanical-accent">finest skincare</em>{' '}
              comes from understanding nature — harvesting botanicals at their peak,
              preserving their vital essence, and delivering them to you in{' '}
              <em className="italic text-botanical-accent">their purest form.</em>
            </p>
            <p className="font-sans text-botanical-muted text-base leading-relaxed max-w-2xl mt-6 pl-0 lg:pl-8">
              Every product in the ShopEase collection is formulated with zero compromise —
              no harmful fillers, no shortcuts, and no greenwashing.
              Just honest, effective, nature-powered care.
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          CATEGORY DIVIDER — Large ribbon heading
      ════════════════════════════════════════════════════ */}
      <section className="bg-botanical-secondary border-t border-b border-botanical-border py-6 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <h2 className="font-serif text-6xl sm:text-7xl xl:text-8xl font-bold text-botanical-text leading-none tracking-tight">
            <em className="italic text-botanical-accent font-semibold">New</em> Collection
          </h2>
          <Link to="/products"
            className="hidden md:flex items-center gap-2 font-sans text-sm font-medium text-botanical-text
                       hover:text-botanical-accent transition-colors flex-shrink-0 ml-8">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          FEATURED PRODUCTS
      ════════════════════════════════════════════════════ */}
      <section className="bg-botanical-bg">
        <div className="section-container">
          {/* Heading */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-14 gap-6">
            <div>
              <p className="font-sans text-botanical-accent text-xs font-semibold tracking-[0.2em] uppercase mb-4">
                Bestsellers
              </p>
              <h2 className="section-heading">
                <em className="italic">Featured</em> Products
              </h2>
            </div>
            <Link to="/products">
              <button className="btn-ghost">
                View All <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>

          <ProductGrid products={products} loading={loading} />
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          CATEGORIES GRID — Staggered
      ════════════════════════════════════════════════════ */}
      <section className="bg-botanical-surface">
        <div className="section-container">
          <div className="text-center mb-14">
            <p className="font-sans text-botanical-accent text-xs font-semibold tracking-[0.2em] uppercase mb-4">Explore</p>
            <h2 className="section-heading">
              Shop by <em className="italic text-botanical-accent">Category</em>
            </h2>
            <div className="botanical-divider" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {CATEGORIES.map(({ label, image, slug }, i) => (
              <Link
                key={label}
                to={`/products?category=${slug}`}
                className={`group block rounded-3xl overflow-hidden relative shadow-soft
                            hover:shadow-soft-lg transition-all duration-700 hover:-translate-y-1.5
                            ${i % 2 === 1 ? 'mt-8 lg:mt-12' : ''}`}
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={image}
                    alt={label}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-botanical-text/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="font-serif text-lg font-semibold text-white">{label}</h3>
                  <p className="font-sans text-xs text-white/70 mt-1 flex items-center gap-1">
                    Shop now <ArrowRight className="w-3 h-3" />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          FEATURE CARDS
      ════════════════════════════════════════════════════ */}
      <section className="bg-botanical-bg">
        <div ref={featuresRef} className="reveal section-container">
          <div className="text-center mb-14">
            <p className="font-sans text-botanical-accent text-xs font-semibold tracking-[0.2em] uppercase mb-4">Why Choose Us</p>
            <h2 className="section-heading">
              Rooted in <em className="italic text-botanical-accent">Values</em>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title}
                className="bg-botanical-surface rounded-3xl p-8 shadow-soft
                           hover:shadow-soft-lg hover:-translate-y-1.5 transition-all duration-500">
                <div className="w-12 h-12 rounded-2xl bg-botanical-secondary flex items-center justify-center mb-5">
                  <Icon className="w-5 h-5 text-botanical-accent" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-lg font-semibold text-botanical-text mb-2">{title}</h3>
                <p className="font-sans text-sm text-botanical-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          NEWSLETTER
      ════════════════════════════════════════════════════ */}
      <section className="bg-botanical-surface border-t border-botanical-border">
        <div ref={newsletterRef} className="reveal section-container max-w-2xl text-center">
          <p className="font-sans text-botanical-accent text-xs font-semibold tracking-[0.2em] uppercase mb-4">
            Community
          </p>
          <h2 className="section-heading mb-4">
            Join the <em className="italic text-botanical-accent">Ritual</em>
          </h2>
          <p className="font-sans text-botanical-muted text-base mb-10 leading-relaxed">
            Subscribe for exclusive offers, wellness guides, and early access to new arrivals.
          </p>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              placeholder="Your email address"
              className="input-field flex-1 text-center sm:text-left"
            />
            <button type="submit" className="btn-accent whitespace-nowrap">
              Join the Community
            </button>
          </form>

          <p className="font-sans text-botanical-muted text-xs mt-5">
            No spam, ever. Unsubscribe anytime.
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          CTA BANNER
      ════════════════════════════════════════════════════ */}
      <section className="section-container pt-0">
        <div className="bg-botanical-text rounded-4xl px-8 py-16 sm:px-16 text-center relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute inset-0 pointer-events-none opacity-5">
            <div className="absolute top-8 left-8 w-40 h-40 rounded-full border-2 border-white" />
            <div className="absolute bottom-8 right-8 w-56 h-56 rounded-full border-2 border-white" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-white" />
          </div>

          <p className="font-sans text-botanical-primary-light text-xs font-semibold tracking-[0.2em] uppercase mb-4">
            Limited Offer
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold text-white mb-6 leading-tight">
            Free shipping on orders{' '}
            <em className="italic text-botanical-secondary">above ₹999</em>
          </h2>
          <p className="font-sans text-white/60 text-base mb-10 max-w-md mx-auto leading-relaxed">
            Enjoy complimentary delivery when you stock up on your favourite botanical essentials.
          </p>
          <Link to="/products">
            <button className="btn-accent">
              Shop Now & Save <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
