import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../redux/slices/authSlice';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Leaf, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading, error } = useSelector((s) => s.auth);

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
    return () => dispatch(clearError());
  }, [isAuthenticated, navigate, from, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login(form));
  };

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-botanical-text p-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-16 right-16 w-64 h-64 rounded-full border-2 border-white" />
          <div className="absolute bottom-24 left-8 w-40 h-40 rounded-full border border-white" />
        </div>
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-botanical-primary flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" fill="white" />
            </div>
            <span className="font-serif text-2xl font-semibold text-white">ShopEase</span>
          </Link>
        </div>
        <div className="relative z-10">
          <blockquote className="font-serif text-3xl font-medium text-white leading-snug mb-6">
            "Nature's wisdom,{' '}
            <em className="italic text-botanical-primary-light">
              bottled
            </em>{' '}
            for your daily ritual."
          </blockquote>
          <p className="font-sans text-white/50 text-sm">— ShopEase Philosophy</p>
        </div>
        <div className="relative z-10">
          <p className="font-sans text-white/30 text-xs">
            © {new Date().getFullYear()} ShopEase
          </p>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-16 bg-botanical-bg relative">
        <div className="absolute top-8 left-8 hidden lg:block">
          <Link to="/" className="text-sm font-sans text-botanical-muted hover:text-botanical-primary flex items-center gap-1 transition-colors">
            ← Back to Home
          </Link>
        </div>
        <div className="w-full max-w-md mx-auto animate-slide-up">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-full bg-botanical-primary flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="font-serif text-xl font-semibold text-botanical-text">ShopEase</span>
          </Link>

          <h2 className="font-serif text-4xl font-semibold text-botanical-text mb-2">
            Welcome back
          </h2>
          <p className="font-sans text-botanical-muted mb-8">
            Sign in to continue your botanical journey
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl px-4 py-3 mb-6 text-sm font-sans">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <div className="relative">
              <Input
                label="Password"
                id="login-password"
                type={showPw ? 'text' : 'password'}
                placeholder="Your password"
                value={form.password}
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
              Sign In
            </Button>
          </form>

          <p className="font-sans text-sm text-botanical-muted text-center mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-botanical-primary font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
