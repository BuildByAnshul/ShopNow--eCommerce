import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../../redux/slices/productSlice';
import { fetchAllOrders } from '../../redux/slices/orderSlice';
import { ShoppingBag, Package, Users, TrendingUp, ArrowRight } from 'lucide-react';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

const AdminDashboardPage = () => {
  const dispatch = useDispatch();
  const { items: products } = useSelector((s) => s.products);
  const { orders } = useSelector((s) => s.orders);

  useEffect(() => {
    dispatch(fetchProducts({ limit: 100 }));
    dispatch(fetchAllOrders());
  }, [dispatch]);

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((acc, o) => acc + o.total, 0);

  const pendingOrders = orders.filter((o) => o.orderStatus === 'processing').length;

  const stats = [
    { label: 'Total Revenue', value: formatPrice(totalRevenue), icon: TrendingUp, color: 'bg-green-100 text-green-600' },
    { label: 'Total Orders', value: orders.length, icon: ShoppingBag, color: 'bg-blue-100 text-blue-600' },
    { label: 'Products', value: products.length, icon: Package, color: 'bg-botanical-secondary text-botanical-accent' },
    { label: 'Pending Orders', value: pendingOrders, icon: Users, color: 'bg-amber-100 text-amber-600' },
  ];

  return (
    <div className="min-h-screen pt-24">
      <div className="section-container !py-12">
        <h1 className="section-heading mb-2">
          Admin <em className="italic text-botanical-primary">Dashboard</em>
        </h1>
        <p className="font-sans text-botanical-muted mb-10">ShopEase management panel</p>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-3xl p-7 shadow-soft">
              <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-4`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="font-serif text-3xl font-semibold text-botanical-text mb-1">{value}</p>
              <p className="font-sans text-sm text-botanical-muted">{label}</p>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Link
            to="/admin/products"
            className="bg-botanical-text rounded-3xl p-8 flex items-center justify-between group hover:opacity-90 transition-opacity"
          >
            <div>
              <p className="font-sans text-white/60 text-sm mb-2">Manage</p>
              <h3 className="font-serif text-2xl font-semibold text-white">Products</h3>
              <p className="font-sans text-white/50 text-sm mt-1">{products.length} products listed</p>
            </div>
            <ArrowRight className="w-6 h-6 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
          </Link>
          <Link
            to="/admin/orders"
            className="bg-botanical-primary rounded-3xl p-8 flex items-center justify-between group hover:opacity-90 transition-opacity"
          >
            <div>
              <p className="font-sans text-white/60 text-sm mb-2">Manage</p>
              <h3 className="font-serif text-2xl font-semibold text-white">Orders</h3>
              <p className="font-sans text-white/50 text-sm mt-1">{pendingOrders} pending</p>
            </div>
            <ArrowRight className="w-6 h-6 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-3xl shadow-soft overflow-hidden">
          <div className="flex items-center justify-between px-8 py-6 border-b border-botanical-border">
            <h2 className="font-serif text-xl font-semibold text-botanical-text">Recent Orders</h2>
            <Link to="/admin/orders" className="font-sans text-sm text-botanical-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-botanical-border">
                  {['Order ID', 'Customer', 'Total', 'Payment', 'Status', 'Date'].map((h) => (
                    <th key={h} className="px-8 py-4 text-left font-sans text-xs text-botanical-muted uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr key={order._id} className="border-b border-botanical-border/50 hover:bg-botanical-surface/50 transition-colors">
                    <td className="px-8 py-4 font-sans text-sm text-botanical-text font-mono">
                      #{order._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-8 py-4 font-sans text-sm text-botanical-text">
                      {order.user?.name || 'N/A'}
                    </td>
                    <td className="px-8 py-4 font-sans text-sm font-semibold text-botanical-text">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-8 py-4">
                      <span className={`badge text-xs ${order.paymentStatus === 'paid' ? 'badge-success' : order.paymentStatus === 'failed' ? 'badge-error' : 'badge-warning'}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-8 py-4">
                      <span className={`badge text-xs ${order.orderStatus === 'delivered' ? 'badge-success' : order.orderStatus === 'cancelled' ? 'badge-error' : 'badge-info'}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-8 py-4 font-sans text-sm text-botanical-muted">
                      {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
