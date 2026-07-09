import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Globe, MessageCircle, Share2, Mail } from 'lucide-react';

const SHOP_LINKS = ['Skincare', 'Haircare', 'Wellness', 'Aromatherapy', 'Gift Sets'];
const COMPANY_LINKS = ['Our Story', 'Blog', 'Sustainability', 'Careers'];
const SUPPORT_LINKS = ['Orders', 'Shipping Policy', 'Returns & Refunds', 'Contact Us', 'FAQ'];
const SOCIAL = [
  { Icon: Globe, label: 'Website', href: '#' },
  { Icon: MessageCircle, label: 'Chat', href: '#' },
  { Icon: Share2, label: 'Share', href: '#' },
  { Icon: Mail, label: 'Email', href: '#' },
];

const Footer = () => (
  <footer className="bg-botanical-text text-white relative overflow-hidden">

    {/* Main grid */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12">

        {/* ── Brand (2 cols) ── */}
        <div className="lg:col-span-2">
          <Link to="/" className="flex items-center gap-2.5 mb-6 group">
            <div className="w-9 h-9 rounded-full bg-botanical-primary flex items-center justify-center
                            transition-transform duration-500 group-hover:rotate-12">
              <Leaf className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="font-serif text-xl font-semibold">
              Shop<em className="italic text-botanical-secondary not-italic">Ease</em>
            </span>
          </Link>

          <p className="font-sans text-white/55 text-sm leading-relaxed max-w-xs mb-8">
            Premium botanical wellness products, thoughtfully crafted from
            nature's finest ingredients for your daily rituals.
          </p>

          {/* Newsletter pill */}
          <form onSubmit={(e) => e.preventDefault()}
            className="flex gap-2 max-w-xs">
            <input
              type="email"
              placeholder="Your email"
              className="flex-1 px-4 py-2.5 rounded-full text-sm font-sans bg-white/10 border border-white/20
                         text-white placeholder-white/40 focus:outline-none focus:border-botanical-primary
                         transition-colors duration-300"
            />
            <button type="submit"
              className="px-4 py-2.5 rounded-full bg-botanical-accent text-white text-xs font-medium
                         hover:bg-botanical-accent-dark transition-colors duration-300 whitespace-nowrap">
              Subscribe
            </button>
          </form>

          {/* Social icons */}
          <div className="flex gap-3 mt-8">
            {SOCIAL.map(({ Icon, label, href }) => (
              <a key={label} href={href} aria-label={label}
                className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center
                           hover:border-botanical-primary hover:bg-botanical-primary/20 transition-all duration-300">
                <Icon className="w-4 h-4 text-white/60" />
              </a>
            ))}
          </div>
        </div>

        {/* ── Shop ── */}
        <div>
          <h4 className="font-serif text-base font-semibold mb-5 text-white">Shop</h4>
          <ul className="space-y-3">
            {SHOP_LINKS.map((item) => (
              <li key={item}>
                <Link to={`/products?category=${item.toLowerCase()}`}
                  className="font-sans text-sm text-white/55 hover:text-botanical-secondary
                             transition-colors duration-300">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Company ── */}
        <div>
          <h4 className="font-serif text-base font-semibold mb-5 text-white">Company</h4>
          <ul className="space-y-3">
            {COMPANY_LINKS.map((item) => (
              <li key={item}>
                <a href="#"
                  className="font-sans text-sm text-white/55 hover:text-botanical-secondary transition-colors duration-300">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Support ── */}
        <div>
          <h4 className="font-serif text-base font-semibold mb-5 text-white">Support</h4>
          <ul className="space-y-3">
            {SUPPORT_LINKS.map((item) => (
              <li key={item}>
                <a href="#"
                  className="font-sans text-sm text-white/55 hover:text-botanical-secondary transition-colors duration-300">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 mt-14 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="font-sans text-xs text-white/35">
          © {new Date().getFullYear()} ShopEase. All rights reserved.
        </p>
        <p className="font-sans text-xs text-white/35">
          Made with <span className="text-botanical-secondary">♥</span> for a greener world
        </p>
      </div>
    </div>

    {/* ── Ghost brand text ── */}
    <div className="pointer-events-none select-none overflow-hidden -mt-4 pb-2">
      <p className="font-serif font-bold text-[14vw] leading-none text-white/[0.04] text-center whitespace-nowrap tracking-tight">
        ShopEase
      </p>
    </div>

  </footer>
);

export default Footer;
