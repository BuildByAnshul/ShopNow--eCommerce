import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const AdminProductsPage = lazy(() => import('./pages/admin/ProductsAdminPage'));
const AdminOrdersPage = lazy(() => import('./pages/admin/OrdersAdminPage'));

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  return isAuthenticated ? children : <Navigate to="/login" replace state={{ from: location }} />;
};

// Admin-only route wrapper
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
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
    <Suspense fallback={<PageLoader />}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#F2EFE9', // botanical-surface
            color: '#2D3A31', // botanical-text
            border: '1px solid #E6E2DA', // botanical-border
            fontFamily: '"Source Sans 3", system-ui, sans-serif',
            fontSize: '14px',
            boxShadow: '0 4px 30px rgba(45,58,49,0.10)', // shadow-soft-md
            borderRadius: '1rem',
          },
          success: {
            iconTheme: {
              primary: '#8C9A84', // botanical-primary
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#C27B66', // botanical-accent
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        {/* Auth routes — no Navbar/Footer */}
        <Route path="/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
        <Route path="/register" element={<AuthLayout><RegisterPage /></AuthLayout>} />

        {/* Public Routes with Navbar/Footer */}
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/about" element={<Layout><AboutPage /></Layout>} />
        <Route path="/products" element={<Layout><ProductsPage /></Layout>} />
        <Route path="/products/:id" element={<Layout><ProductDetailPage /></Layout>} />
        <Route path="/cart" element={<Layout><CartPage /></Layout>} />

        {/* Protected user routes */}
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
  );
};

export default App;
