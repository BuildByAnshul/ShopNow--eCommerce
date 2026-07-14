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
  const [statusForm, setStatusForm] = useState({ orderStatus: '', paymentStatus: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setStatusForm({ orderStatus: order.orderStatus, paymentStatus: order.paymentStatus });
  };

  const handleUpdateStatus = async () => {
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

  return (
    <div className="min-h-screen pt-24">
      <div className="section-container !py-12">
        <div className="mb-10">
          <h1 className="section-heading mb-1">
            Manage <em className="italic text-botanical-primary">Orders</em>
          </h1>
          <p className="font-sans text-botanical-muted text-sm">{orders.length} total orders</p>
        </div>

        {loading ? (
          <Spinner size="lg" className="mt-20" />
        ) : (
          <div className="bg-white rounded-3xl shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-botanical-border">
                    {['Order ID', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', 'Actions'].map((h) => (
                      <th key={h} className="px-6 py-4 text-left font-sans text-xs text-botanical-muted uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id} className="border-b border-botanical-border/50 hover:bg-botanical-surface/30 transition-colors">
                      <td className="px-6 py-4 font-sans text-sm font-mono text-botanical-text">
                        #{order._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-sans text-sm text-botanical-text font-medium">{order.user?.name || 'N/A'}</p>
                        <p className="font-sans text-xs text-botanical-muted">{order.user?.email}</p>
                      </td>
                      <td className="px-6 py-4 font-sans text-sm text-botanical-muted">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</td>
                      <td className="px-6 py-4 font-sans text-sm font-semibold text-botanical-text">{formatPrice(order.total)}</td>
                      <td className="px-6 py-4">
                        <Badge variant={order.paymentStatus}>{order.paymentStatus}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={order.orderStatus}>{order.orderStatus}</Badge>
                      </td>
                      <td className="px-6 py-4 font-sans text-xs text-botanical-muted whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-6 py-4 flex flex-col gap-2">
                        <button
                          onClick={() => openStatusModal(order)}
                          className="font-sans text-xs text-left text-botanical-primary hover:underline whitespace-nowrap"
                        >
                          Update Status
                        </button>
                        {order.orderStatus === 'delivered' && (
                          <Link
                            to={`/invoice/${order._id}`}
                            className="font-sans text-xs text-left text-botanical-accent hover:underline whitespace-nowrap"
                          >
                            View Invoice
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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
    </div>
  );
};

export default AdminOrdersPage;
