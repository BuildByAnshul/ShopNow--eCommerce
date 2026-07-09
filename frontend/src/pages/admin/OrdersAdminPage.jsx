import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllOrders, updateOrderStatus } from '../../redux/slices/orderSlice';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

const ORDER_STATUSES = ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

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
      setSelectedOrder(null);
    } catch (err) {
      alert(err || 'Update failed');
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
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openStatusModal(order)}
                          className="font-sans text-xs text-botanical-primary hover:underline whitespace-nowrap"
                        >
                          Update Status
                        </button>
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
        maxWidth="max-w-sm"
      >
        {selectedOrder && (
          <div className="space-y-5">
            <p className="font-sans text-sm text-botanical-muted">
              Order #{selectedOrder._id.slice(-8).toUpperCase()}
            </p>

            <div>
              <label className="input-label" htmlFor="order-status">Order Status</label>
              <select
                id="order-status"
                value={statusForm.orderStatus}
                onChange={(e) => setStatusForm({ ...statusForm, orderStatus: e.target.value })}
                className="input-field capitalize"
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s} className="capitalize">{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="input-label" htmlFor="payment-status">Payment Status</label>
              <select
                id="payment-status"
                value={statusForm.paymentStatus}
                onChange={(e) => setStatusForm({ ...statusForm, paymentStatus: e.target.value })}
                className="input-field capitalize"
              >
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s} className="capitalize">{s}</option>
                ))}
              </select>
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
