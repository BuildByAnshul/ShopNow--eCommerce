import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../../redux/slices/productSlice';
import { fetchAllOrders } from '../../redux/slices/orderSlice';
import { ShoppingBag, Package, Users, TrendingUp, ArrowRight, Tag, Activity, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Brush } from 'recharts';
import api from '../../services/api';
import toast from 'react-hot-toast';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

const AdminDashboardPage = () => {
  const dispatch = useDispatch();
  const { items: products } = useSelector((s) => s.products);
  const { orders } = useSelector((s) => s.orders);

  const [users, setUsers] = useState([]);
  const [timeRange, setTimeRange] = useState('All Time');

  useEffect(() => {
    dispatch(fetchProducts({ limit: 100 }));
    dispatch(fetchAllOrders());
    fetchUsers();
  }, [dispatch]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/auth/users');
      setUsers(res.data);
    } catch (err) {
      toast.error('Failed to load users for analytics');
    }
  };

  // ─── Time Filtering Logic ─────────────────────────────────
  const now = new Date();
  let filterDate = new Date(0);
  
  if (timeRange === 'Day') filterDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  else if (timeRange === 'Week') filterDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  else if (timeRange === 'Month') filterDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  else if (timeRange === 'Year') filterDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

  const filteredOrders = orders.filter(o => new Date(o.createdAt) >= filterDate);
  const filteredUsers = users.filter(u => new Date(u.createdAt) >= filterDate);

  const totalRevenue = filteredOrders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((acc, o) => acc + o.total, 0);

  const pendingOrders = filteredOrders.filter((o) => o.orderStatus === 'processing').length;

  const stats = [
    { label: 'Total Revenue', value: formatPrice(totalRevenue), icon: TrendingUp, color: 'bg-green-100 text-green-600' },
    { label: 'Total Orders', value: filteredOrders.length, icon: ShoppingBag, color: 'bg-blue-100 text-blue-600' },
    { label: 'Products', value: products.length, icon: Package, color: 'bg-botanical-secondary text-botanical-accent' },
    { label: 'Pending Orders', value: pendingOrders, icon: Users, color: 'bg-amber-100 text-amber-600' },
  ];

  // ─── Analytics Calculations ─────────────────────────────────
  
  // 1. City Sales
  const citySales = {};
  filteredOrders.forEach(order => {
    if (order.paymentStatus === 'paid' && order.address?.city) {
      const city = order.address.city;
      const qty = order.items.reduce((sum, item) => sum + item.quantity, 0);
      citySales[city] = (citySales[city] || 0) + qty;
    }
  });
  const cityData = Object.entries(citySales)
    .map(([name, Sales]) => ({ name, Sales }))
    .sort((a, b) => b.Sales - a.Sales)
    .slice(0, 7);

  // 2. Monthly Users
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const userMonths = {};
  filteredUsers.forEach(u => {
    const d = new Date(u.createdAt);
    const m = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
    userMonths[m] = (userMonths[m] || 0) + 1;
  });
  const monthlyUsersData = Object.entries(userMonths).map(([name, Users]) => ({ name, Users })).reverse().slice(0, 6).reverse(); // Last 6 active months

  // 3. User Engagement Funnel
  const purchasingUsers = new Set(filteredOrders.map(o => o.user?._id || o.user?.toString())).size;
  const viewingUsers = Math.max(filteredUsers.length - purchasingUsers, 0);
  const engagementData = [
    { name: 'Purchased', value: purchasingUsers, color: '#4a6b53' },
    { name: 'Just Viewed', value: viewingUsers, color: '#A3B899' },
  ];

  // 4. Sale Offers Analysis
  let offerRevenue = 0;
  let regularRevenue = 0;
  filteredOrders.forEach(order => {
    if (order.paymentStatus === 'paid') {
      order.items.forEach(item => {
        const p = products.find(prod => prod._id === item.product?._id || prod._id === item.product);
        if (p && p.offer && p.offer.discountPercentage > 0) {
          offerRevenue += (item.price * item.quantity);
        } else {
          regularRevenue += (item.price * item.quantity);
        }
      });
    }
  });
  const offerData = [
    { name: 'On Sale', Revenue: offerRevenue, color: '#C27B66' },
    { name: 'Regular', Revenue: regularRevenue, color: '#4a6b53' }
  ];

  // 5. Product Sales Performance (With 0 sales handling)
  const productSalesMap = {};
  products.forEach(p => {
    productSalesMap[p.name] = 0;
  });
  filteredOrders.forEach(order => {
    if (order.paymentStatus === 'paid') {
      order.items.forEach(item => {
        if (productSalesMap[item.name] !== undefined) {
          productSalesMap[item.name] += item.quantity;
        } else {
          productSalesMap[item.name] = item.quantity;
        }
      });
    }
  });
  const productPerformanceData = Object.entries(productSalesMap)
    .map(([name, Sold]) => ({ name, Sold }))
    .sort((a, b) => b.Sold - a.Sold);

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link
            to="/admin/products"
            className="bg-botanical-text rounded-3xl p-8 flex flex-col justify-between group hover:opacity-90 transition-opacity min-h-[160px]"
          >
            <div>
              <p className="font-sans text-white/60 text-sm mb-2">Manage</p>
              <h3 className="font-serif text-2xl font-semibold text-white">Products</h3>
              <p className="font-sans text-white/50 text-sm mt-1">{products.length} listed</p>
            </div>
            <div className="flex justify-end mt-4">
              <ArrowRight className="w-6 h-6 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
            </div>
          </Link>
          
          <Link
            to="/admin/offers"
            className="bg-botanical-accent rounded-3xl p-8 flex flex-col justify-between group hover:opacity-90 transition-opacity min-h-[160px]"
          >
            <div>
              <p className="font-sans text-white/60 text-sm mb-2">Manage</p>
              <h3 className="font-serif text-2xl font-semibold text-white">Offers</h3>
              <p className="font-sans text-white/50 text-sm mt-1">Special Deals</p>
            </div>
            <div className="flex justify-end mt-4">
              <ArrowRight className="w-6 h-6 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
            </div>
          </Link>

          <Link
            to="/admin/orders"
            className="bg-botanical-primary rounded-3xl p-8 flex flex-col justify-between group hover:opacity-90 transition-opacity min-h-[160px]"
          >
            <div>
              <p className="font-sans text-white/60 text-sm mb-2">Manage</p>
              <h3 className="font-serif text-2xl font-semibold text-white">Orders</h3>
              <p className="font-sans text-white/50 text-sm mt-1">{pendingOrders} pending</p>
            </div>
            <div className="flex justify-end mt-4">
              <ArrowRight className="w-6 h-6 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
            </div>
          </Link>
        </div>

        {/* Advanced Analytics */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6 text-botanical-primary" />
              <h2 className="font-serif text-2xl font-semibold text-botanical-text">Analytics Overview</h2>
            </div>
            
            <div className="flex items-center gap-2 bg-botanical-surface p-1 rounded-xl border border-botanical-border overflow-x-auto shadow-inner">
              {['Day', 'Week', 'Month', 'Year', 'All Time'].map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-1.5 text-sm font-sans font-medium rounded-lg whitespace-nowrap transition-all duration-300 ${
                    timeRange === range ? 'bg-white text-botanical-primary shadow-sm' : 'text-botanical-muted hover:text-botanical-text'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          
          {/* Product Performance (With Panning) */}
          <div className="bg-white rounded-3xl p-7 shadow-soft mb-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-sans text-sm font-semibold text-botanical-muted uppercase tracking-wider">Product Sales Performance</h3>
              <p className="font-sans text-xs text-botanical-muted">Drag the slider below to pan</p>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productPerformanceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} tickFormatter={(name) => name.length > 15 ? name.substring(0,15) + '...' : name} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)'}} />
                  <Bar dataKey="Sold" fill="#A3B899" radius={[4, 4, 0, 0]} barSize={25} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* City Sales */}
            <div className="bg-white rounded-3xl p-7 shadow-soft">
              <h3 className="font-sans text-sm font-semibold text-botanical-muted uppercase tracking-wider mb-6">Top Cities by Product Sales</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cityData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)'}} />
                    <Bar dataKey="Sales" fill="#4a6b53" radius={[4, 4, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Users */}
            <div className="bg-white rounded-3xl p-7 shadow-soft">
              <h3 className="font-sans text-sm font-semibold text-botanical-muted uppercase tracking-wider mb-6">Monthly User Registrations</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyUsersData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)'}} />
                    <Line type="monotone" dataKey="Users" stroke="#C27B66" strokeWidth={3} dot={{r: 4, fill: '#C27B66', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Engagement Funnel / Pie */}
            <div className="bg-white rounded-3xl p-7 shadow-soft">
              <h3 className="font-sans text-sm font-semibold text-botanical-muted uppercase tracking-wider mb-6">User Engagement (Purchasers vs Viewers)</h3>
              <div className="h-64 flex items-center justify-center">
                {users.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={engagementData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {engagementData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)'}} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-botanical-muted">Loading data...</p>
                )}
              </div>
            </div>

            {/* Sale Offers Analysis */}
            <div className="bg-white rounded-3xl p-7 shadow-soft">
              <h3 className="font-sans text-sm font-semibold text-botanical-muted uppercase tracking-wider mb-6">Revenue: Sale Offers vs Regular</h3>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={offerData} innerRadius={0} outerRadius={80} dataKey="Revenue">
                      {offerData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatPrice(value)} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)'}} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
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
