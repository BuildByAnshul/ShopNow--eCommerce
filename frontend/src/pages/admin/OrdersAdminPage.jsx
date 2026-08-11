import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { fetchAllOrders, updateOrderStatus } from '../../redux/slices/orderSlice';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { ChevronDown, Check } from 'lucide-react';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

const ORDER_STATUSES = ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

const CustomSelect = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left input-field flex items-center justify-between capitalize focus:ring-2 focus:ring-botanical-primary focus:border-botanical-primary outline-none bg-white"
      >
        <span>{value}</span>
        <svg className={`fill-current h-4 w-4 text-botanical-muted transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
        </svg>
      </button>

      {/* Overlay to catch outside clicks */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}

      <div className={`absolute z-50 top-full left-0 right-0 mt-2 bg-white border border-botanical-border rounded-2xl shadow-soft overflow-hidden transition-all duration-300 transform origin-top ${isOpen ? 'opacity-100 scale-y-100 py-2' : 'opacity-0 scale-y-0 h-0 border-none'}`}>
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => { onChange(opt); setIsOpen(false); }}
            className={`w-full text-left px-5 py-2.5 font-sans text-sm capitalize transition-colors ${
              value === opt 
                ? 'bg-botanical-primary/10 text-botanical-primary font-medium' 
                : 'text-botanical-text hover:bg-botanical-surface'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

const AdminOrdersPage = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((s) => s.orders);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsOrder, setDetailsOrder] = useState(null);
  const [statusForm, setStatusForm] = useState({ orderStatus: '', paymentStatus: '' });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setStatusForm({ orderStatus: order.orderStatus, paymentStatus: order.paymentStatus });
  };

  const handleUpdateStatus = async () => {
    if (
      selectedOrder.paymentMethod === 'cod' &&
      statusForm.orderStatus === 'delivered' &&
      statusForm.paymentStatus !== 'paid'
    ) {
      toast.error('COD orders must be marked as PAID before delivery');
      return;
    }

    setSaving(true);
    try {
      await dispatch(updateOrderStatus({ id: selectedOrder._id, data: statusForm })).unwrap();
      toast.success('Order status updated successfully');
      setSelectedOrder(null);
    } catch (err) {
      toast.error(err?.message || err || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesTab = activeTab === 'all' || order.orderStatus === activeTab;
    const matchesSearch =
      order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.user?.name && order.user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.user?.email && order.user.email.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen pt-24">
      <div className="section-container !py-12">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="section-heading mb-1">
              Manage <em className="italic text-botanical-primary">Orders</em>
            </h1>
            <p className="font-sans text-botanical-muted text-sm">{orders.length} total orders</p>
          </div>
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search by ID, Name or Email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-botanical-border rounded-xl font-sans text-sm focus:outline-none focus:ring-2 focus:ring-botanical-primary"
            />
            <svg
              className="absolute left-3.5 top-3 w-4 h-4 text-botanical-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {loading ? (
          <Spinner size="lg" className="mt-20" />
        ) : (
          <>
            {/* Tabs */}
            <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide">
              {['all', ...ORDER_STATUSES].map((status) => (
                <button
                  key={status}
                  onClick={() => setActiveTab(status)}
                  className={`px-5 py-2 rounded-full font-sans text-sm font-medium transition-colors whitespace-nowrap capitalize ${
                    activeTab === status
                      ? 'bg-botanical-primary text-white shadow-soft'
                      : 'bg-white text-botanical-muted hover:bg-botanical-surface hover:text-botanical-text'
                  }`}
                >
                  {status} ({status === 'all' ? orders.length : orders.filter((o) => o.orderStatus === status).length})
                </button>
              ))}
            </div>

            <div className="bg-white rounded-3xl shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-botanical-border">
                    {['Order ID', 'Customer', 'Method', 'Total', 'Payment', 'Status', 'Date', 'Actions'].map((h) => (
                      <th key={h} className="px-6 py-4 text-left font-sans text-xs text-botanical-muted uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className="border-b border-botanical-border/50 hover:bg-botanical-surface/30 transition-colors">
                      <td className="px-6 py-4 font-sans text-sm font-mono text-botanical-text">
                        #{order._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-sans text-sm text-botanical-text font-medium">{order.user?.name || 'N/A'}</p>
                        <p className="font-sans text-xs text-botanical-muted">{order.user?.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-sans text-xs font-semibold bg-botanical-surface px-3 py-1 rounded-full uppercase tracking-wider text-botanical-primary">
                          {order.paymentMethod === 'cod' ? 'COD' : 'Online'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-sans text-sm font-semibold text-botanical-text">{formatPrice(order.total)}</td>
                      <td className="px-6 py-4">
                        <Badge variant={order.paymentStatus}>{order.paymentStatus}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={order.orderStatus}>{order.orderStatus}</Badge>
                      </td>
                      <td className="px-6 py-4 font-sans text-xs text-botanical-muted whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4 flex flex-col gap-2">
                        <button
                          onClick={() => setDetailsOrder(order)}
                          className="font-sans text-xs text-left text-botanical-text hover:underline whitespace-nowrap mb-1"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => openStatusModal(order)}
                          className="font-sans text-xs text-left text-botanical-primary hover:underline whitespace-nowrap"
                        >
                          Update Status
                        </button>
                        {order.orderStatus === 'delivered' && (
                          <Link
                            to={`/invoice/${order._id}`}
                            className="font-sans text-xs text-left text-botanical-accent hover:underline whitespace-nowrap block"
                          >
                            View Invoice
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center">
                        <p className="font-sans text-botanical-muted text-sm">No orders found.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          </>
        )}
      </div>

      {/* Status Update Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title="Update Order Status"
        maxWidth="max-w-md"
      >
        {selectedOrder && (
          <div className="space-y-5">
            <p className="font-sans text-sm text-botanical-muted">
              Order #{selectedOrder._id.slice(-8).toUpperCase()}
            </p>

            <div>
              <label className="input-label">Order Status</label>
              <CustomSelect
                value={statusForm.orderStatus}
                onChange={(val) => setStatusForm({ ...statusForm, orderStatus: val })}
                options={ORDER_STATUSES}
              />
            </div>

            <div>
              <label className="input-label">Payment Status</label>
              <CustomSelect
                value={statusForm.paymentStatus}
                onChange={(val) => setStatusForm({ ...statusForm, paymentStatus: val })}
                options={PAYMENT_STATUSES}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handleUpdateStatus} loading={saving} variant="primary" className="flex-1">
                Save
              </Button>
              <Button onClick={() => setSelectedOrder(null)} variant="secondary">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Order Details Modal */}
      <Modal
        isOpen={!!detailsOrder}
        onClose={() => setDetailsOrder(null)}
        title={`Order Details #${detailsOrder?._id?.slice(-8).toUpperCase()}`}
        maxWidth="max-w-3xl"
      >
        {detailsOrder && (
          <div className="space-y-8 pt-2">
            
            {/* Customer & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-botanical-surface/50 p-6 rounded-2xl">
              <div>
                <h3 className="font-serif text-lg font-semibold text-botanical-text mb-3">Customer Info</h3>
                <p className="font-sans text-sm text-botanical-text font-medium">{detailsOrder.user?.name || 'N/A'}</p>
                <p className="font-sans text-sm text-botanical-muted">{detailsOrder.user?.email || 'N/A'}</p>
                <p className="font-sans text-sm text-botanical-muted mt-2">Placed: {new Date(detailsOrder.createdAt).toLocaleString('en-IN')}</p>
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold text-botanical-text mb-3">Shipping Address</h3>
                <p className="font-sans text-sm text-botanical-text">{detailsOrder.address?.fullName}</p>
                <p className="font-sans text-sm text-botanical-muted">{detailsOrder.address?.phone}</p>
                <p className="font-sans text-sm text-botanical-muted mt-1">{detailsOrder.address?.line1}</p>
                {detailsOrder.address?.line2 && <p className="font-sans text-sm text-botanical-muted">{detailsOrder.address?.line2}</p>}
                <p className="font-sans text-sm text-botanical-muted">{detailsOrder.address?.city}, {detailsOrder.address?.state} {detailsOrder.address?.pincode}</p>
              </div>
            </div>

            {/* Items */}
            <div>
              <h3 className="font-serif text-xl font-semibold text-botanical-text mb-4">Order Items</h3>
              <div className="space-y-4">
                {detailsOrder.items?.map(item => (
                  <div key={item._id || item.product} className="flex items-center gap-4 border border-botanical-border rounded-xl p-4">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg bg-botanical-surface" />
                    <div className="flex-1 min-w-0">
                      <p className="font-serif font-semibold text-botanical-text truncate">{item.name}</p>
                      <p className="font-sans text-sm text-botanical-muted">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                    </div>
                    <div className="font-sans font-medium text-botanical-text text-right">
                      {formatPrice(item.quantity * item.price)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-botanical-bg p-6 rounded-2xl border border-botanical-border">
              <h3 className="font-serif text-lg font-semibold text-botanical-text mb-4">Payment Summary</h3>
              <div className="space-y-3 font-sans text-sm">
                <div className="flex justify-between text-botanical-muted">
                  <span>Method</span>
                  <span className="uppercase font-semibold">{detailsOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</span>
                </div>
                <div className="flex justify-between text-botanical-muted">
                  <span>Items Subtotal</span>
                  <span>{formatPrice(detailsOrder.itemsTotal || 0)}</span>
                </div>
                <div className="flex justify-between text-botanical-muted">
                  <span>Shipping</span>
                  <span>{detailsOrder.shippingCost === 0 ? 'Free' : formatPrice(detailsOrder.shippingCost)}</span>
                </div>
                <div className="flex justify-between font-medium text-botanical-text text-base pt-3 border-t border-botanical-border">
                  <span>Total</span>
                  <span className="font-serif text-xl text-botanical-accent">{formatPrice(detailsOrder.total)}</span>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                 <Badge variant={detailsOrder.paymentStatus}>{detailsOrder.paymentStatus} Payment</Badge>
                 <Badge variant={detailsOrder.orderStatus}>{detailsOrder.orderStatus}</Badge>
              </div>
            </div>

            <div className="pt-2">
              <Button onClick={() => setDetailsOrder(null)} variant="secondary" className="w-full">
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminOrdersPage;
