import api from './api';

export const paymentService = {
  createOrder: async (amount) => {
    const res = await api.post('/payment/create-order', { amount });
    return res.data;
  },
  verifyPayment: async (data) => {
    const res = await api.post('/payment/verify', data);
    return res.data;
  },
};

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const openRazorpayCheckout = async ({ amount, orderId, key, name, description, onSuccess, onFailure, prefill }) => {
  // Demo Mode bypass
  if (key && key.includes('XXXX')) {
    console.log('Running in Razorpay DEMO mode (simulating successful payment)');
    return new Promise((resolve) => {
      setTimeout(() => {
        const response = {
          razorpay_order_id: orderId,
          razorpay_payment_id: `pay_demo_${Date.now()}`,
          razorpay_signature: 'demo_signature_valid',
        };
        resolve(response);
        if (onSuccess) onSuccess(response);
      }, 1500);
    });
  }

  const isScriptLoaded = await loadRazorpayScript();
  if (!isScriptLoaded) {
    const err = new Error('Razorpay SDK failed to load. Are you offline?');
    if (onFailure) onFailure(err);
    throw err;
  }

  return new Promise((resolve, reject) => {
    const options = {
      key,
      amount,
      currency: 'INR',
      name: 'ShopEase',
      description,
      order_id: orderId,
      prefill: prefill || {},
      theme: { color: '#8C9A84' },
      handler: (response) => {
        resolve(response);
        if (onSuccess) onSuccess(response);
      },
      modal: {
        ondismiss: () => {
          reject(new Error('Payment cancelled'));
          if (onFailure) onFailure('cancelled');
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (response) => {
      reject(response.error);
      if (onFailure) onFailure(response.error);
    });
    rzp.open();
  });
};
