import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserOrders } from '../redux/slices/orderSlice';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import { Package, ChevronDown } from 'lucide-react';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

const STATUS_STEPS = ['processing', 'confirmed', 'shipped', 'delivered'];

const OrdersPage = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((s) => s.orders);

  useEffect(() => {
    dispatch(fetchUserOrders());
  }, [dispatch]);

  if (loading) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );

  if (orders.length === 0) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="text-center animate-slide-up">
        <div className="w-24 h-24 rounded-full bg-botanical-surface flex items-center justify-center mx-auto mb-6">
          <Package className="w-10 h-10 text-botanical-muted" />
        </div>
        <h2 className="font-serif text-3xl font-semibold text-botanical-text mb-3">No orders yet</h2>
        <p className="font-sans text-botanical-muted">Your order history will appear here.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-24">
      <div className="section-container !py-12">
        <h1 className="section-heading mb-2">
          My <em className="italic text-botanical-accent">Orders</em>
        </h1>
        <p className="font-sans text-botanical-muted mb-10">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>

        <div className="space-y-6">
          {orders.map((order) => {
            const stepIdx = STATUS_STEPS.indexOf(order.orderStatus);
            return (
              <div key={order._id} className="bg-white rounded-3xl shadow-soft overflow-hidden">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 px-8 py-5 border-b border-botanical-border">
                  <div>
                    <p className="font-sans text-xs text-botanical-muted uppercase tracking-wider mb-1">Order ID</p>
                    <p className="font-sans text-sm font-medium text-botanical-text">{order._id.slice(-8).toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="font-sans text-xs text-botanical-muted uppercase tracking-wider mb-1">Placed</p>
                    <p className="font-sans text-sm text-botanical-text">{formatDate(order.createdAt)}</p>
                  </div>
                  <div>
                    <p className="font-sans text-xs text-botanical-muted uppercase tracking-wider mb-1">Total</p>
                    <p className="font-serif text-lg font-semibold text-botanical-text">{formatPrice(order.total)}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant={order.paymentStatus}>{order.paymentStatus}</Badge>
                    <Badge variant={order.orderStatus}>{order.orderStatus}</Badge>
                  </div>
                </div>

                {/* Progress bar */}
                {order.orderStatus !== 'cancelled' && (
                  <div className="px-8 py-5 border-b border-botanical-border">
                    <div className="flex items-center gap-0">
                      {STATUS_STEPS.map((s, i) => (
                        <React.Fragment key={s}>
                          <div className="flex flex-col items-center gap-1.5">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                                i <= stepIdx
                                  ? 'bg-botanical-primary text-white'
                                  : 'bg-botanical-border text-botanical-muted'
                              }`}
                            >
                              {i < stepIdx ? '✓' : i + 1}
                            </div>
                            <span className="font-sans text-xs text-botanical-muted capitalize hidden sm:block">{s}</span>
                          </div>
                          {i < STATUS_STEPS.length - 1 && (
                            <div
                              className={`flex-1 h-0.5 mx-1 transition-all duration-700 ${
                                i < stepIdx ? 'bg-botanical-primary' : 'bg-botanical-border'
                              }`}
                            />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}

                {/* Items */}
                <div className="px-8 py-5">
                  <div className="space-y-3">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-botanical-surface flex-shrink-0">
                          <img src={item.image || 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=100'} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-sans text-sm font-medium text-botanical-text line-clamp-1">{item.name}</p>
                          <p className="font-sans text-xs text-botanical-muted">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                        </div>
                        <p className="font-sans text-sm font-semibold text-botanical-text">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
