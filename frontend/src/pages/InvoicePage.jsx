import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Leaf, Printer, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

const InvoicePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data);
      } catch (err) {
        toast.error('Failed to load invoice');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, navigate]);

  if (loading) {
    return <div className="min-h-screen pt-24 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-botanical-primary"></div></div>;
  }

  if (!order) return null;

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50 print:pt-0 print:bg-white">
      <style>
        {`
          @media print {
            body { background-color: white; }
            nav, header, footer, .no-print { display: none !important; }
            .print-container { box-shadow: none !important; margin: 0 !important; padding: 0 !important; max-width: 100% !important; }
          }
        `}
      </style>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-6 no-print flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-botanical-primary hover:text-botanical-accent transition-colors font-sans font-medium">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button onClick={() => window.print()} className="flex items-center gap-2 bg-botanical-primary text-white px-5 py-2.5 rounded-xl hover:bg-botanical-accent transition-colors font-sans font-medium shadow-soft">
          <Printer className="w-4 h-4" /> Print Invoice
        </button>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-soft p-8 sm:p-12 print-container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-8 mb-8">
          <div className="flex items-center gap-3 mb-6 sm:mb-0">
            <div className="w-12 h-12 rounded-full bg-botanical-primary flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" fill="white" />
            </div>
            <div>
              <span className="font-serif text-2xl font-semibold text-botanical-text tracking-tight block">
                Shop<em className="italic text-botanical-accent not-italic">Ease</em>
              </span>
              <span className="text-sm text-gray-500 font-sans">Nature's Best, Delivered.</span>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <h1 className="text-3xl font-serif text-botanical-text font-bold uppercase tracking-wider mb-2">Invoice</h1>
            <p className="text-sm text-gray-600 font-sans"><strong>Invoice No:</strong> #{order._id.slice(-8).toUpperCase()}</p>
            <p className="text-sm text-gray-600 font-sans"><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Addresses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Billed To</h3>
            <p className="font-sans font-semibold text-botanical-text text-base">{order.address.fullName}</p>
            <p className="font-sans text-gray-600 text-sm mt-1 leading-relaxed">
              {order.address.line1}<br />
              {order.address.line2 && <>{order.address.line2}<br /></>}
              {order.address.city}, {order.address.state} {order.address.pincode}<br />
              Phone: {order.address.phone}
            </p>
          </div>
          <div className="sm:text-right">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Payment Details</h3>
            <p className="font-sans text-gray-600 text-sm mb-1">
              <strong>Method:</strong> {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
            </p>
            <p className="font-sans text-gray-600 text-sm mb-1">
              <strong>Status:</strong> <span className={`uppercase font-bold ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-500'}`}>{order.paymentStatus}</span>
            </p>
            {order.razorpayOrderId && (
              <p className="font-sans text-gray-500 text-xs mt-2">Ref: {order.razorpayOrderId}</p>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="py-3 font-sans font-bold text-gray-700 text-sm uppercase">Item Description</th>
                <th className="py-3 font-sans font-bold text-gray-700 text-sm uppercase text-center">Qty</th>
                <th className="py-3 font-sans font-bold text-gray-700 text-sm uppercase text-right">Price</th>
                <th className="py-3 font-sans font-bold text-gray-700 text-sm uppercase text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-4 font-sans text-gray-800 text-sm">
                    <div className="flex items-center gap-3">
                      {item.image && <img src={item.image} alt={item.name} className="w-10 h-10 rounded object-cover flex-shrink-0" />}
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </td>
                  <td className="py-4 font-sans text-gray-600 text-sm text-center">{item.quantity}</td>
                  <td className="py-4 font-sans text-gray-600 text-sm text-right">{formatPrice(item.price)}</td>
                  <td className="py-4 font-sans text-gray-800 text-sm font-medium text-right">{formatPrice(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end border-t border-gray-200 pt-6">
          <div className="w-full sm:w-1/2 lg:w-1/3 space-y-3">
            <div className="flex justify-between font-sans text-gray-600 text-sm">
              <span>Subtotal</span>
              <span>{formatPrice(order.itemsTotal)}</span>
            </div>
            <div className="flex justify-between font-sans text-gray-600 text-sm">
              <span>Shipping</span>
              <span>{order.shippingCost === 0 ? 'Free' : formatPrice(order.shippingCost)}</span>
            </div>
            <div className="flex justify-between font-sans text-botanical-text text-lg font-bold border-t border-gray-200 pt-3 mt-3">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-100 text-center">
          <p className="font-sans text-gray-500 text-sm italic">Thank you for shopping with ShopEase!</p>
          <p className="font-sans text-gray-400 text-xs mt-1">If you have any questions about this invoice, please contact support@shopease.com</p>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
