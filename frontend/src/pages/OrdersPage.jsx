import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserOrders } from '../redux/slices/orderSlice';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import { Package, CheckCircle2, Circle, ArrowRight } from 'lucide-react';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const STATUS_STEPS = ['processing', 'confirmed', 'shipped', 'delivered'];

const OrdersPage = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((s) => s.orders);

  useEffect(() => {
    dispatch(fetchUserOrders());
  }, [dispatch]);

  if (loading) return (
    <div className="min-h-screen pt-24 flex items-center justify-center bg-botanical-bg">
      <Spinner size="lg" />
    </div>
  );

  if (orders.length === 0) return (
    <div className="min-h-screen pt-24 flex items-center justify-center bg-botanical-bg">
      <div className="text-center animate-slide-up bg-white p-10 rounded-3xl shadow-soft">
        <div className="w-20 h-20 rounded-full bg-botanical-surface flex items-center justify-center mx-auto mb-5">
          <Package className="w-8 h-8 text-botanical-primary" />
        </div>
        <h2 className="font-serif text-2xl font-semibold text-botanical-text mb-2">No orders yet</h2>
        <p className="font-sans text-sm text-botanical-muted mb-6">Looks like you haven't made your first purchase.</p>
        <Link to="/products" className="btn-primary px-6 py-2.5 text-sm">Start Shopping</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 bg-botanical-bg pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold text-botanical-text mb-1">
            My <em className="italic text-botanical-accent">Orders</em>
          </h1>
          <p className="font-sans text-sm text-botanical-muted">{orders.length} order{orders.length !== 1 ? 's' : ''} in your history</p>
        </div>

        <div className="space-y-5">
          {orders.map((order) => {
            const stepIdx = STATUS_STEPS.indexOf(order.orderStatus);
            return (
              <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-botanical-border/60 overflow-hidden hover:border-botanical-primary/30 transition-colors">
                {/* Header (Compact) */}
                <div className="bg-botanical-surface/50 px-5 py-3 flex flex-wrap items-center justify-between gap-4 border-b border-botanical-border/60">
                  <div className="flex items-center gap-6 sm:gap-10">
                    <div>
                      <p className="font-sans text-[10px] text-botanical-muted uppercase font-bold tracking-widest mb-0.5">Order Placed</p>
                      <p className="font-sans text-sm text-botanical-text font-medium">{formatDate(order.createdAt)}</p>
                    </div>
                    <div>
                      <p className="font-sans text-[10px] text-botanical-muted uppercase font-bold tracking-widest mb-0.5">Total</p>
                      <p className="font-sans text-sm text-botanical-text font-medium">{formatPrice(order.total)}</p>
                    </div>
                    <div className="hidden sm:block">
                      <p className="font-sans text-[10px] text-botanical-muted uppercase font-bold tracking-widest mb-0.5">Order ID</p>
                      <p className="font-sans text-sm text-botanical-text font-medium">#{order._id.slice(-8).toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Badge variant={order.paymentStatus}>{order.paymentStatus}</Badge>
                    {order.orderStatus === 'delivered' && (
                      <Link
                        to={`/invoice/${order._id}`}
                        className="text-xs font-sans font-medium text-botanical-primary hover:text-botanical-accent transition-colors ml-2"
                      >
                        Download Invoice
                      </Link>
                    )}
                  </div>
                </div>

                <div className="p-5 flex flex-col md:flex-row gap-8">
                  {/* Left: Items */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-sans text-sm font-semibold text-botanical-text">
                        Status: <span className="text-botanical-primary capitalize">{order.orderStatus}</span>
                      </h4>
                      <span className="sm:hidden font-sans text-xs text-botanical-muted font-medium">
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 hover:bg-botanical-surface/50 rounded-xl transition-colors">
                          <div className="w-12 h-12 rounded-lg overflow-hidden border border-botanical-border/50 flex-shrink-0 bg-white">
                            <img src={item.image || 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=100'} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-sans text-sm font-medium text-botanical-text line-clamp-1">{item.name}</p>
                            <p className="font-sans text-[11px] text-botanical-muted mt-0.5">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                          </div>
                          <p className="font-sans text-sm font-semibold text-botanical-text">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Vertical Compact Tracker */}
                  {order.orderStatus !== 'cancelled' && (
                    <div className="w-full md:w-48 md:border-l border-botanical-border/60 md:pl-6 pt-4 md:pt-0">
                      <p className="font-sans text-[10px] text-botanical-muted uppercase font-bold tracking-widest mb-4">Track Order</p>
                      <div className="relative space-y-4">
                        {/* Connecting Line */}
                        <div className="absolute top-2 bottom-2 left-[7px] w-[2px] bg-botanical-border/60 z-0"></div>
                        
                        {STATUS_STEPS.map((s, i) => {
                          const isCompleted = i <= stepIdx;
                          const isCurrent = i === stepIdx;
                          return (
                            <div key={s} className="relative z-10 flex items-center gap-3">
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 bg-white
                                ${isCompleted ? 'text-botanical-primary' : 'text-botanical-border'}`}
                              >
                                {isCompleted ? <CheckCircle2 className="w-4 h-4 fill-white" /> : <Circle className="w-3 h-3" />}
                              </div>
                              <span className={`font-sans text-xs capitalize ${
                                isCurrent ? 'text-botanical-primary font-bold' : 
                                isCompleted ? 'text-botanical-text font-medium' : 'text-botanical-muted'
                              }`}>
                                {s}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
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
