import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Spinner from './components/ui/Spinner';
import { useAuth } from './hooks/useAuth';

// Lazy-loaded pages---------     ---------test
const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const InvoicePage = lazy(() => import('./pages/InvoicePage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const AdminProductsPage = lazy(() => import('./pages/admin/ProductsAdminPage'));
const AdminOrdersPage = lazy(() => import('./pages/admin/OrdersAdminPage'));

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Admin-only route wrapper
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

// Layout wrapper (Navbar + Footer)
const Layout = ({ children }) => (
  <>
    <Navbar />
    <main>{children}</main>
    <Footer />
  </>
);

// Full-screen layout (no footer) for auth pages
const AuthLayout = ({ children }) => children;

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-botanical-bg">
    <Spinner size="lg" />
  </div>
);

const App = () => {
  return (
    <>
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#1a3627', 
            fontFamily: 'inherit',
            fontSize: '14px',
            fontWeight: '500',
            borderRadius: '16px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 10px 25px -5px rgba(26, 54, 39, 0.1), 0 8px 10px -6px rgba(26, 54, 39, 0.1)',
            padding: '12px 20px',
          },
          success: {
            iconTheme: {
              primary: '#2b5a41', // botanical-primary
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
      <Suspense fallback={<PageLoader />}>
        <Routes>
        {/* Auth routes — no Navbar/Footer */}
        <Route path="/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
        <Route path="/register" element={<AuthLayout><RegisterPage /></AuthLayout>} />

        {/* Public routes */}
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/about" element={<Layout><AboutPage /></Layout>} />
        <Route path="/products" element={<Layout><ProductsPage /></Layout>} />
        <Route path="/products/:id" element={<Layout><ProductDetailPage /></Layout>} />
        <Route path="/cart" element={<Layout><CartPage /></Layout>} />

        {/* Protected user routes */}
        <Route path="/profile" element={<ProtectedRoute><Layout><ProfilePage /></Layout></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Layout><CheckoutPage /></Layout></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Layout><OrdersPage /></Layout></ProtectedRoute>} />
        <Route path="/invoice/:id" element={<ProtectedRoute><Layout><InvoicePage /></Layout></ProtectedRoute>} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminRoute><Layout><AdminDashboardPage /></Layout></AdminRoute>} />
        <Route path="/admin/products" element={<AdminRoute><Layout><AdminProductsPage /></Layout></AdminRoute>} />
        <Route path="/admin/orders" element={<AdminRoute><Layout><AdminOrdersPage /></Layout></AdminRoute>} />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
    </>
  );
};

export default App;
