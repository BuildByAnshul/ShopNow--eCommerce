import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ShieldCheck, Heart, Sparkles, Droplets } from 'lucide-react';
import Button from '../components/ui/Button';

const AboutPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-12 bg-botanical-bg">
      {/* Hero Section */}
      <div className="section-container !py-12">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-slide-up">
          <p className="font-sans text-botanical-primary text-sm font-medium tracking-widest uppercase mb-4">
            Our Story
          </p>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-botanical-text leading-tight mb-6">
            Rooted in <em className="italic text-botanical-accent">Nature</em>, Crafted for You
          </h1>
          <p className="font-sans text-botanical-muted text-lg leading-relaxed">
            At ShopEase, we believe that the earth provides everything we need to nurture our skin and well-being. Our journey began with a simple mission: to harness the raw power of botanicals and deliver them in their purest form.
          </p>
        </div>

        <div className="relative h-64 md:h-96 rounded-3xl overflow-hidden shadow-soft-lg mb-20 animate-fade-in">
          <img
            src="https://images.unsplash.com/photo-1611078589088-7517c66d11f7?w=1200&q=80"
            alt="Botanical herbs and ingredients"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/10" />
        </div>
      </div>

      {/* Our Philosophy */}
      <div className="bg-botanical-surface py-20">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 relative">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-soft-md">
                <img
                  src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80"
                  alt="Making botanical products"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-botanical-primary/10 rounded-full blur-2xl -z-10" />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-botanical-text mb-6">
                The ShopEase <em className="italic">Philosophy</em>
              </h2>
              <div className="space-y-6 font-sans text-botanical-muted leading-relaxed">
                <p>
                  We are more than just a skincare brand. We are a community of nature enthusiasts dedicated to bringing the therapeutic benefits of plant-based ingredients directly to your daily routine.
                </p>
                <p>
                  Every product we curate is ethically sourced, cruelty-free, and formulated without harsh chemicals. We prioritize transparency, ensuring that you know exactly what you're putting on your skin.
                </p>
                <ul className="space-y-4 mt-8">
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-botanical-primary/10 flex items-center justify-center">
                      <Leaf className="w-4 h-4 text-botanical-primary" />
                    </div>
                    <span className="font-medium text-botanical-text">100% Plant-Based Ingredients</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-botanical-primary/10 flex items-center justify-center">
                      <Droplets className="w-4 h-4 text-botanical-primary" />
                    </div>
                    <span className="font-medium text-botanical-text">Sustainably Sourced</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-botanical-primary/10 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-botanical-primary" />
                    </div>
                    <span className="font-medium text-botanical-text">Clinically Tested & Safe</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="section-container py-20">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl font-semibold text-botanical-text">
            Our Core <em className="italic text-botanical-primary">Values</em>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-soft text-center hover:-translate-y-2 transition-transform duration-500">
            <div className="w-16 h-16 rounded-full bg-botanical-primary/10 flex items-center justify-center mx-auto mb-6">
              <Heart className="w-8 h-8 text-botanical-primary" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-botanical-text mb-3">Cruelty Free</h3>
            <p className="font-sans text-sm text-botanical-muted">
              We love all creatures. Our products are never tested on animals, and we only work with suppliers who share this commitment.
            </p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-soft text-center hover:-translate-y-2 transition-transform duration-500">
            <div className="w-16 h-16 rounded-full bg-botanical-primary/10 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-botanical-primary" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-botanical-text mb-3">Pure Quality</h3>
            <p className="font-sans text-sm text-botanical-muted">
              No artificial fragrances, parabens, or sulfates. Just pure, unadulterated botanical goodness for your skin.
            </p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-soft text-center hover:-translate-y-2 transition-transform duration-500">
            <div className="w-16 h-16 rounded-full bg-botanical-primary/10 flex items-center justify-center mx-auto mb-6">
              <Leaf className="w-8 h-8 text-botanical-primary" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-botanical-text mb-3">Eco-Conscious</h3>
            <p className="font-sans text-sm text-botanical-muted">
              From our recyclable packaging to our carbon-neutral shipping, we strive to minimize our environmental footprint.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="section-container pb-12">
        <div className="bg-botanical-text rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full border-2 border-white" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full border-2 border-white" />
          </div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-white mb-6">
              Ready to transform your ritual?
            </h2>
            <p className="font-sans text-white/80 mb-8">
              Explore our collection of natural remedies and find the perfect botanical match for your daily self-care routine.
            </p>
            <Link to="/products">
              <Button variant="accent" size="lg">
                Shop the Collection
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
