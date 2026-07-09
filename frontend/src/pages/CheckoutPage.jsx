import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { createOrder } from '../redux/slices/orderSlice';
import { paymentService, openRazorpayCheckout } from '../services/paymentService';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { CheckCircle, ShieldCheck, Plus } from 'lucide-react';
import { addAddress } from '../redux/slices/authSlice';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

const initialAddress = {
  fullName: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '',
};

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const { loading: orderLoading } = useSelector((s) => s.orders);

  const [address, setAddress] = useState(initialAddress);
  const [errors, setErrors] = useState({});
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [step, setStep] = useState('address'); // 'address' | 'review' | 'success'

  const shipping = total >= 999 ? 0 : 99;
  const grandTotal = total + shipping;
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(
    user?.addresses?.length > 0 ? 0 : -1
  );
  const [showNewAddressForm, setShowNewAddressForm] = useState(
    !(user?.addresses?.length > 0)
  );

  React.useEffect(() => {
    if (selectedAddressIndex >= 0 && user?.addresses?.[selectedAddressIndex]) {
      setAddress(user.addresses[selectedAddressIndex]);
    } else if (showNewAddressForm) {
      setAddress(initialAddress);
    }
  }, [selectedAddressIndex, showNewAddressForm, user?.addresses]);

  const validate = () => {
    const errs = {};
    if (!address.fullName.trim()) errs.fullName = 'Full name is required';
    if (!address.phone.trim() || !/^\d{10}$/.test(address.phone)) errs.phone = 'Valid 10-digit phone required';
    if (!address.line1.trim()) errs.line1 = 'Address line 1 is required';
    if (!address.city.trim()) errs.city = 'City is required';
    if (!address.state.trim()) errs.state = 'State is required';
    if (!address.pincode.trim() || !/^\d{6}$/.test(address.pincode)) errs.pincode = 'Valid 6-digit pincode required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleProceedToReview = async () => {
    if (showNewAddressForm) {
      if (validate()) {
        try {
          await dispatch(addAddress(address)).unwrap();
          setStep('review');
        } catch (err) {
          alert('Failed to save address: ' + err);
        }
      }
    } else {
      if (selectedAddressIndex >= 0) {
        setStep('review');
      } else {
        alert('Please select an address or add a new one');
      }
    }
  };

  const handlePay = async () => {
    setPaymentLoading(true);
    try {
      // 1. Create Razorpay order
      const { orderId, amount, currency, key } = await paymentService.createOrder(grandTotal);

      // 2. Open Razorpay checkout
      const payment = await openRazorpayCheckout({
        amount,
        orderId,
        key,
        description: 'ShopEase Order',
        prefill: { name: user?.name, email: user?.email },
      });

      // 3. Create order in our DB
      const orderData = {
        items: items.map((i) => ({ product: i.product._id, quantity: i.quantity })),
        address,
        razorpayOrderId: orderId,
      };
      const orderRes = await dispatch(createOrder(orderData)).unwrap();

      // 4. Verify payment
      await paymentService.verifyPayment({
        razorpay_order_id: payment.razorpay_order_id,
        razorpay_payment_id: payment.razorpay_payment_id,
        razorpay_signature: payment.razorpay_signature,
        orderId: orderRes._id,
      });

      clearCart();
      setStep('success');
    } catch (err) {
      console.error('Payment error:', err);
      alert(err?.message || 'Payment failed. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (items.length === 0 && step !== 'success') {
    navigate('/cart');
    return null;
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center animate-slide-up max-w-md px-6">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="font-serif text-4xl font-semibold text-botanical-text mb-3">
            Order Placed!
          </h2>
          <p className="font-sans text-botanical-muted mb-8 leading-relaxed">
            Thank you for your order. We'll send you a confirmation soon, and your botanical treasures will be on their way!
          </p>
          <Button onClick={() => navigate('/orders')} variant="primary">
            View My Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24">
      <div className="section-container !py-12">
        <h1 className="section-heading mb-10">
          <em className="italic text-botanical-accent">Checkout</em>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: Steps */}
          <div className="lg:col-span-2">
            {step === 'address' && (
              <div className="bg-white rounded-3xl p-8 shadow-soft animate-fade-in">
                <h2 className="font-serif text-2xl font-semibold text-botanical-text mb-7">
                  Delivery Address
                </h2>
                {/* Saved Addresses List */}
                {user?.addresses?.length > 0 && !showNewAddressForm && (
                  <div className="space-y-4 mb-6">
                    {user.addresses.map((addr, idx) => (
                      <div
                        key={idx}
                        className={`p-4 border rounded-2xl cursor-pointer transition-colors ${
                          selectedAddressIndex === idx
                            ? 'border-botanical-primary bg-botanical-surface'
                            : 'border-botanical-border hover:border-botanical-primary'
                        }`}
                        onClick={() => setSelectedAddressIndex(idx)}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="address"
                            checked={selectedAddressIndex === idx}
                            onChange={() => setSelectedAddressIndex(idx)}
                            className="text-botanical-primary focus:ring-botanical-primary"
                          />
                          <div>
                            <p className="font-sans font-medium text-botanical-text text-sm">{addr.fullName}</p>
                            <p className="font-sans text-xs text-botanical-muted mt-1">
                              {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.state} — {addr.pincode}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <button
                      onClick={() => {
                        setShowNewAddressForm(true);
                        setSelectedAddressIndex(-1);
                      }}
                      className="flex items-center gap-2 text-sm font-sans font-medium text-botanical-primary hover:underline mt-4"
                    >
                      <Plus className="w-4 h-4" /> Add New Address
                    </button>
                  </div>
                )}

                {/* New Address Form */}
                {showNewAddressForm && (
                  <>
                    {user?.addresses?.length > 0 && (
                      <button
                        onClick={() => {
                          setShowNewAddressForm(false);
                          setSelectedAddressIndex(0);
                        }}
                        className="text-sm font-sans text-botanical-muted hover:text-botanical-primary mb-6 block"
                      >
                        ← Back to saved addresses
                      </button>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Input label="Full Name" id="fullName" value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} error={errors.fullName} placeholder="Jane Doe" />
                      <Input label="Phone" id="phone" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} error={errors.phone} placeholder="10-digit mobile number" />
                      <div className="sm:col-span-2">
                        <Input label="Address Line 1" id="line1" value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} error={errors.line1} placeholder="Flat/House No., Street" />
                      </div>
                      <div className="sm:col-span-2">
                        <Input label="Address Line 2 (Optional)" id="line2" value={address.line2} onChange={(e) => setAddress({ ...address, line2: e.target.value })} placeholder="Area, Landmark" />
                      </div>
                      <Input label="City" id="city" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} error={errors.city} placeholder="Mumbai" />
                      <Input label="State" id="state" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} error={errors.state} placeholder="Maharashtra" />
                      <Input label="Pincode" id="pincode" value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value })} error={errors.pincode} placeholder="400001" />
                    </div>
                  </>
                )}
                <div className="mt-8">
                  <Button onClick={handleProceedToReview} variant="primary" className="w-full sm:w-auto">
                    Continue to Review
                  </Button>
                </div>
              </div>
            )}

            {step === 'review' && (
              <div className="space-y-5 animate-fade-in">
                {/* Address review */}
                <div className="bg-white rounded-3xl p-7 shadow-soft">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-serif text-xl font-semibold text-botanical-text">Delivering to</h2>
                    <button onClick={() => setStep('address')} className="text-sm text-botanical-primary font-sans hover:underline">Edit</button>
                  </div>
                  <p className="font-sans text-sm text-botanical-text font-medium">{address.fullName}</p>
                  <p className="font-sans text-sm text-botanical-muted mt-1">
                    {address.line1}{address.line2 ? `, ${address.line2}` : ''}, {address.city}, {address.state} — {address.pincode}
                  </p>
                  <p className="font-sans text-sm text-botanical-muted">{address.phone}</p>
                </div>

                {/* Items */}
                <div className="bg-white rounded-3xl p-7 shadow-soft">
                  <h2 className="font-serif text-xl font-semibold text-botanical-text mb-5">Items</h2>
                  <div className="space-y-4">
                    {items.map(({ product, quantity }) => (
                      <div key={product._id} className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-botanical-surface flex-shrink-0">
                          <img src={product.images?.[0] || ''} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <p className="font-sans text-sm font-medium text-botanical-text line-clamp-1">{product.name}</p>
                          <p className="font-sans text-xs text-botanical-muted">Qty: {quantity}</p>
                        </div>
                        <p className="font-sans text-sm font-semibold">{formatPrice(product.price * quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-botanical-muted font-sans px-2">
                  <ShieldCheck className="w-4 h-4 text-botanical-primary flex-shrink-0" />
                  Your payment is secured by Razorpay with 256-bit SSL encryption.
                </div>

                <Button
                  onClick={handlePay}
                  loading={paymentLoading || orderLoading}
                  variant="primary"
                  className="w-full text-base py-4"
                >
                  Pay {formatPrice(grandTotal)} securely
                </Button>
              </div>
            )}
          </div>

          {/* Right: Summary */}
          <div>
            <div className="bg-botanical-surface rounded-3xl p-7 sticky top-28">
              <h2 className="font-serif text-xl font-semibold text-botanical-text mb-6">Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm font-sans text-botanical-muted">
                  <span>Subtotal</span><span className="text-botanical-text">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm font-sans text-botanical-muted">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : 'text-botanical-text'}>
                    {shipping === 0 ? 'Free' : formatPrice(shipping)}
                  </span>
                </div>
                <div className="border-t border-botanical-border pt-3 flex justify-between">
                  <span className="font-sans font-semibold text-botanical-text">Total</span>
                  <span className="font-serif text-2xl font-semibold text-botanical-text">{formatPrice(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
