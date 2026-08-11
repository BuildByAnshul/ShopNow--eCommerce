import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Sparkles, Shield, Truck, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../redux/slices/productSlice';
import ProductCard from '../components/product/ProductCard';

/* ── Static data ─────────────────────────────────────────── */
const CATEGORIES = [
  {
    label: 'Skincare',
    badge: 'Bestsellers',
    sub: 'Glow from within',
    count: '40+ products',
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80',
    slug: 'skincare',
    size: 'tall', // spans 2 rows
  },
  {
    label: 'Wellness',
    badge: 'New Arrivals',
    sub: 'Balance your life',
    count: '28+ products',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
    slug: 'wellness',
    size: 'normal',
  },
  {
    label: 'Haircare',
    badge: "Editor's Pick",
    sub: 'Nourish every strand',
    count: '22+ products',
    image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800&q=80',
    slug: 'haircare',
    size: 'normal',
  },
  {
    label: 'Aromatherapy',
    badge: 'Curated For You',
    sub: 'Calm the senses',
    count: '15+ products',
    image: 'https://images.unsplash.com/photo-1608528577891-b1e1966a3d13?w=800&q=80',
    slug: 'aromatherapy',
    size: 'wide', // spans 2 cols
  },
];

const HERO_SLIDES = [
  {
    headline: 'Pure Nature,',
    sub: 'Effortless Living.',
    desc: 'Certified organic skincare and wellness rituals, crafted to nurture your body and calm your mind.',
    image: 'https://images.pexels.com/photos/8508788/pexels-photo-8508788.jpeg',
    cta: 'Explore the Collections',
    ctaLink: '/products',
  },
  {
    headline: 'Timeless Rituals,',
    sub: 'Modern Wellness.',
    desc: 'Small-batch formulas made with botanicals harvested at their peak — zero compromise, always.',
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=1400&q=80',
    cta: 'Shop Wellness',
    ctaLink: '/products?category=wellness',
  },
  {
    headline: 'Botanical Essentials',
    sub: 'For Every Day.',
    desc: 'From morning cleansers to evening serums — build a routine that feels as good as it looks.',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1400&q=80',
    cta: 'Shop Skincare',
    ctaLink: '/products?category=skincare',
  },
];

const FEATURES = [
  { icon: Leaf, title: 'Certified Organic', desc: 'Every ingredient is certified organic and ethically sourced.' },
  { icon: Sparkles, title: 'Artisan Crafted', desc: 'Small-batch production ensures extraordinary quality.' },
  { icon: Shield, title: 'Clean & Safe', desc: 'Free from parabens, sulfates, and harmful fragrances.' },
  { icon: Truck, title: 'Free Delivery', desc: 'Complimentary shipping on all orders above ₹999.' },
];

/* ── Scroll-reveal hook ──────────────────────────────────── */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('revealed'); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ── Page ─────────────────────────────────────────────────── */
const HomePage = () => {
  const dispatch = useDispatch();
  const { items: products, loading } = useSelector((s) => s.products);
  const [slide, setSlide] = useState(0);
  const trendingRef = useReveal();
  const categoryRef = useReveal();
  const featuresRef = useReveal();
  const newsletterRef = useReveal();

  useEffect(() => { dispatch(fetchProducts({ featured: true, limit: 8 })); }, [dispatch]);

  // Auto-slide
  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const current = HERO_SLIDES[slide];

  return (
    <div className="min-h-screen bg-botanical-bg overflow-x-hidden">

      {/* ══════════════════════════════════════════════════
          HERO — Full-bleed with overlaid text
      ══════════════════════════════════════════════════ */}
      <section className="relative h-screen min-h-[600px] overflow-hidden">
        {/* Slides */}
        {HERO_SLIDES.map((s, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ${i === slide ? 'opacity-100' : 'opacity-0'}`}
          >
            <img
              src={s.image}
              alt={s.headline}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-botanical-text/80 via-botanical-text/40 to-transparent" />
          </div>
        ))}

        {/* Text overlay */}
        <div className="relative z-10 h-full flex flex-col justify-center section-container pt-20">
          <div className="max-w-2xl">
            <p className="font-sans text-botanical-secondary text-xs font-semibold tracking-[0.3em] uppercase mb-6 animate-fade-in">
              ✦ New Collection 2025
            </p>
            <h1 key={slide} className="font-serif text-5xl sm:text-7xl font-bold leading-[1.05] text-white mb-4 animate-slide-up">
              {current.headline}
              <br />
              <em className="italic text-botanical-secondary font-semibold">{current.sub}</em>
            </h1>
            <p className="font-sans text-white/75 text-lg leading-relaxed max-w-lg mb-10 animate-fade-in">
              {current.desc}
            </p>
            <div className="flex items-center gap-4">
              <Link to={current.ctaLink}>
                <button className="group flex items-center gap-2 bg-white text-botanical-text font-sans font-semibold text-sm px-8 py-4 rounded-full hover:bg-botanical-accent hover:text-white transition-all duration-300 shadow-lg">
                  {current.cta} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link to="/products">
                <button className="font-sans font-medium text-sm text-white border border-white/40 px-8 py-4 rounded-full hover:bg-white/10 transition-all duration-300">
                  View All
                </button>
              </Link>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-8 mt-12 pt-8 border-t border-white/20">
              {[['4.9★', 'Avg Rating'], ['12K+', 'Customers'], ['100%', 'Organic']].map(([v, l]) => (
                <div key={l}>
                  <p className="font-serif text-2xl font-bold text-white">{v}</p>
                  <p className="font-sans text-xs text-white/60 uppercase tracking-wider mt-0.5">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Slide controls */}
        <div className="absolute bottom-8 right-8 z-10 flex items-center gap-3">
          <button
            onClick={() => setSlide(s => (s - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex gap-1.5">
            {HERO_SLIDES.map((_, i) => (
              <button key={i} onClick={() => setSlide(i)}
                className={`rounded-full transition-all duration-300 ${i === slide ? 'bg-white w-6 h-2' : 'bg-white/40 w-2 h-2'}`}
              />
            ))}
          </div>
          <button
            onClick={() => setSlide(s => (s + 1) % HERO_SLIDES.length)}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/40 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          MARQUEE — Animated ribbon
      ══════════════════════════════════════════════════ */}
      <div className="bg-botanical-text py-4 overflow-hidden border-t border-botanical-text">
        <div className="flex animate-marquee whitespace-nowrap gap-0">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="font-serif text-sm font-medium text-botanical-secondary/70 mx-8 flex-shrink-0">
              ORGANIC &nbsp;&nbsp;✦&nbsp;&nbsp; CERTIFIED &nbsp;&nbsp;✦&nbsp;&nbsp; SUSTAINABLE &nbsp;&nbsp;✦&nbsp;&nbsp; ARTISAN CRAFTED &nbsp;&nbsp;✦&nbsp;&nbsp; NATURE INSPIRED
            </span>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          SHOP BY CATEGORY — Creative Bento Grid
      ══════════════════════════════════════════════════ */}
      <section ref={categoryRef} className="reveal bg-botanical-bg py-24">
        <div className="section-container">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <p className="font-sans text-botanical-accent text-xs font-semibold tracking-[0.25em] uppercase mb-3">Explore</p>
              <h2 className="font-serif text-5xl md:text-6xl font-bold text-botanical-text leading-[1.0]">
                Find Your{' '}
                <em className="italic text-botanical-accent">Look.</em>
              </h2>
            </div>
            <Link to="/products" className="group flex items-center gap-2 font-sans text-sm font-medium text-botanical-muted hover:text-botanical-accent transition-colors">
              Browse All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-2 md:grid-cols-12 grid-rows-2 gap-4" style={{ height: 'clamp(480px, 60vw, 700px)' }}>

            {/* Cell 1 — Large left tall card (Skincare) */}
            <Link
              to="/products?category=skincare"
              className="group relative overflow-hidden rounded-3xl col-span-2 md:col-span-5 row-span-2 shadow-soft hover:shadow-soft-lg transition-all duration-700"
            >
              <img
                src="https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80"
                alt="Skincare"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-botanical-text/90 via-botanical-text/20 to-transparent" />
              {/* Top badge */}
              <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-botanical-text font-sans text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
                Bestsellers
              </span>
              {/* Bottom info */}
              <div className="absolute bottom-0 left-0 right-0 p-7">
                <p className="font-sans text-white/60 text-xs uppercase tracking-widest mb-1">40+ products</p>
                <h3 className="font-serif text-4xl font-bold text-white mb-2 leading-none">Skincare</h3>
                <p className="font-sans text-white/70 text-sm mb-4">Glow from within</p>
                <div className="flex items-center gap-2 text-white font-sans text-sm font-semibold bg-white/15 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 w-fit opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                  Shop Now <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>

            {/* Cell 2 — Top right (Wellness) */}
            <Link
              to="/products?category=wellness"
              className="group relative overflow-hidden rounded-3xl col-span-2 md:col-span-4 row-span-1 shadow-soft hover:shadow-soft-lg transition-all duration-700"
            >
              <img
                src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80"
                alt="Wellness"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-botanical-text/80 via-botanical-text/30 to-transparent" />
              <div className="absolute inset-0 p-6 flex flex-col justify-between">
                <span className="bg-white/90 backdrop-blur-sm text-botanical-text font-sans text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full w-fit">
                  New Arrivals
                </span>
                <div>
                  <p className="font-sans text-white/60 text-xs mb-0.5">Balance your life</p>
                  <h3 className="font-serif text-2xl font-bold text-white">Wellness</h3>
                </div>
              </div>
            </Link>

            {/* Cell 3 — Middle right (Haircare) */}
            <Link
              to="/products?category=haircare"
              className="group relative overflow-hidden rounded-3xl col-span-1 md:col-span-2 row-span-1 shadow-soft hover:shadow-soft-lg transition-all duration-700"
            >
              <img
                src="https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=600&q=80"
                alt="Haircare"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-botanical-text/80 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="font-serif text-xl font-bold text-white">Haircare</h3>
                <p className="font-sans text-white/60 text-xs">22+ products</p>
              </div>
            </Link>

            {/* Cell 4 — Bottom right tall (Aromatherapy) */}
            <Link
              to="/products?category=aromatherapy"
              className="group relative overflow-hidden rounded-3xl col-span-1 md:col-span-2 row-span-1 shadow-soft hover:shadow-soft-lg transition-all duration-700"
            >
              <img
                src="https://images.unsplash.com/photo-1608528577891-b1e1966a3d13?w=800&q=80"
                alt="Aromatherapy"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-botanical-text/80 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <span className="font-sans text-[9px] text-botanical-secondary uppercase tracking-widest font-bold">Curated For You</span>
                <h3 className="font-serif text-xl font-bold text-white mt-0.5">Aromatherapy</h3>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          EDITORIAL BANNER — "Sustainably Designed"
      ══════════════════════════════════════════════════ */}
      <section className="bg-botanical-surface border-t border-b border-botanical-border">
        <div className="section-container grid grid-cols-1 lg:grid-cols-2 gap-8 items-center py-0">
          {/* Images left */}
          <div className="grid grid-cols-2 gap-3 h-80 lg:h-[420px]">
            <div className="rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&q=80"
                alt="Seasonal Must-Haves"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="rounded-2xl overflow-hidden mt-6">
              <img
                src="https://images.pexels.com/photos/3762875/pexels-photo-3762875.jpeg?w=600&q=80"
                alt="Curated for You"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>

          {/* Text right */}
          <div className="py-16 lg:pl-8">
            <p className="font-sans text-botanical-accent text-xs font-semibold tracking-[0.25em] uppercase mb-4">Our Promise</p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-botanical-text leading-tight mb-6">
              Sustainably designed,{' '}
              <em className="italic text-botanical-accent">effortlessly worn.</em>
            </h2>
            <p className="font-sans text-botanical-muted text-base leading-relaxed mb-8 max-w-md">
              Elevate your wardrobe with our exclusive collections, designed for modern living. Every product crafted with zero compromise on quality or ethics.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/products">
                <button className="group flex items-center gap-2 bg-botanical-text text-white font-sans font-semibold text-sm px-6 py-3.5 rounded-full hover:bg-botanical-accent transition-all duration-300">
                  Shop Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <span className="font-sans text-xs text-botanical-muted px-3 py-1.5 bg-botanical-secondary/40 rounded-full">New Arrivals</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          TRENDING NOW — Product grid
      ══════════════════════════════════════════════════ */}
      <section ref={trendingRef} className="reveal bg-botanical-bg py-24">
        <div className="section-container">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
            <div>
              <p className="font-sans text-botanical-accent text-xs font-semibold tracking-[0.25em] uppercase mb-3">Bestsellers</p>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-botanical-text leading-tight">
                Trending <em className="italic text-botanical-accent">Now</em>
              </h2>
            </div>
            <Link to="/products">
              <button className="flex items-center gap-2 font-sans text-sm font-medium border border-botanical-border px-5 py-2.5 rounded-full hover:bg-botanical-text hover:text-white hover:border-botanical-text transition-all duration-300">
                Show All <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>

          {/* Product grid — 4 col with wishlist badge style */}
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-3xl bg-botanical-surface animate-pulse aspect-[3/4]" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {products.slice(0, 4).map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECOND EDITORIAL BANNER — "Effortless Elegance"
      ══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden h-[500px] lg:h-[560px]">
        <img
          src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=1600&q=80"
          alt="Effortless Elegance"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-botanical-text/80 via-botanical-text/30 to-transparent" />

        {/* Overlaid large text */}
        <div className="absolute inset-0 flex items-center justify-end">
          <div className="section-container flex justify-end">
            <div className="max-w-lg text-right">
              <h2 className="font-serif text-5xl md:text-7xl font-bold text-white/90 leading-none mb-2 mix-blend-overlay absolute inset-0 flex items-center justify-center pointer-events-none select-none">
              </h2>
              <p className="font-sans text-white/70 text-xs uppercase tracking-widest font-semibold mb-4">Signature Collection</p>
              <h2 className="font-serif text-5xl md:text-6xl font-bold text-white leading-[1.05] mb-6">
                Effortless <em className="italic text-botanical-secondary">Elegance</em>
              </h2>
              <p className="font-sans text-white/70 text-base leading-relaxed mb-8 max-w-sm ml-auto">
                Luxuriously crafted collections designed to bring sophistication and sustainability together — timeless quality, modern style.
              </p>
              <Link to="/products">
                <button className="group flex items-center gap-2 ml-auto bg-white text-botanical-text font-sans font-semibold text-sm px-7 py-4 rounded-full hover:bg-botanical-accent hover:text-white transition-all duration-300">
                  Explore the Collections <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════════════ */}
      <section ref={featuresRef} className="reveal bg-botanical-surface py-24 border-t border-botanical-border">
        <div className="section-container">
          <div className="text-center mb-14">
            <p className="font-sans text-botanical-accent text-xs font-semibold tracking-[0.25em] uppercase mb-3">Why Choose Us</p>
            <h2 className="font-serif text-4xl font-bold text-botanical-text">
              Rooted in <em className="italic text-botanical-accent">Values</em>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-3xl p-8 shadow-soft hover:shadow-soft-lg hover:-translate-y-1.5 transition-all duration-500 group">
                <div className="w-12 h-12 rounded-2xl bg-botanical-secondary flex items-center justify-center mb-5 group-hover:bg-botanical-accent transition-colors duration-300">
                  <Icon className="w-5 h-5 text-botanical-accent group-hover:text-white transition-colors duration-300" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-lg font-semibold text-botanical-text mb-2">{title}</h3>
                <p className="font-sans text-sm text-botanical-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          NEWSLETTER + FOOTER BAND
      ══════════════════════════════════════════════════ */}
      <section ref={newsletterRef} className="reveal bg-botanical-text py-20">
        <div className="section-container grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left copy */}
          <div>
            <p className="font-sans text-botanical-secondary/70 text-xs font-semibold tracking-[0.25em] uppercase mb-4">Community</p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
              Wear the Moment.<br />
              <em className="italic text-botanical-secondary">Own the Look.</em>
            </h2>
            <p className="font-sans text-white/60 text-base leading-relaxed">
              Subscribe for exclusive offers, wellness guides, and early access to new arrivals.
            </p>
          </div>

          {/* Right form */}
          <div>
            <form onSubmit={(e) => e.preventDefault()} className="flex gap-3">
              <input
                type="email"
                placeholder="Enter your email..."
                className="flex-1 bg-white/10 border border-white/20 text-white placeholder:text-white/40 font-sans text-sm rounded-full px-6 py-4 focus:outline-none focus:border-botanical-secondary transition-colors"
              />
              <button type="submit" className="bg-white text-botanical-text font-sans font-semibold text-sm px-7 py-4 rounded-full hover:bg-botanical-accent hover:text-white transition-all duration-300 whitespace-nowrap flex-shrink-0">
                Subscribe
              </button>
            </form>
            <p className="font-sans text-white/40 text-xs mt-4">No spam, ever. Unsubscribe anytime.</p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
