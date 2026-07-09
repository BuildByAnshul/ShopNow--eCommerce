import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../redux/slices/authSlice';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Leaf, Eye, EyeOff } from 'lucide-react';

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((s) => s.auth);

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isAuthenticated) navigate('/');
    return () => dispatch(clearError());
  }, [isAuthenticated]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    if (!form.password || form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) dispatch(register(form));
  };

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-botanical-primary p-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-16 left-16 w-64 h-64 rounded-full border-2 border-white" />
          <div className="absolute bottom-24 right-8 w-40 h-40 rounded-full border border-white" />
        </div>
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" fill="white" />
            </div>
            <span className="font-serif text-2xl font-semibold text-white">ShopEase</span>
          </Link>
        </div>
        <div className="relative z-10 space-y-8">
          {['100% Organic & Certified', 'Artisan Crafted Products', 'Free Shipping above ₹999'].map((t) => (
            <div key={t} className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">✓</span>
              </div>
              <p className="font-sans text-white text-base">{t}</p>
            </div>
          ))}
        </div>
        <p className="font-sans text-white/40 text-xs relative z-10">
          © {new Date().getFullYear()} ShopEase
        </p>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 bg-botanical-bg">
        <div className="w-full max-w-md animate-slide-up">
          <Link to="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-full bg-botanical-primary flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="font-serif text-xl font-semibold text-botanical-text">ShopEase</span>
          </Link>

          <h2 className="font-serif text-4xl font-semibold text-botanical-text mb-2">
            Create account
          </h2>
          <p className="font-sans text-botanical-muted mb-8">
            Join the botanical wellness community
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl px-4 py-3 mb-6 text-sm font-sans">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full Name"
              id="reg-name"
              placeholder="Jane Doe"
              value={form.name}
              error={errors.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <Input
              label="Email"
              id="reg-email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              error={errors.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <div className="relative">
              <Input
                label="Password"
                id="reg-password"
                type={showPw ? 'text' : 'password'}
                placeholder="Min. 6 characters"
                value={form.password}
                error={errors.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-[calc(50%+6px)] text-botanical-muted hover:text-botanical-text transition-colors"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Button type="submit" loading={loading} variant="primary" className="w-full mt-2">
              Create Account
            </Button>
          </form>

          <p className="font-sans text-sm text-botanical-muted text-center mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-botanical-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
