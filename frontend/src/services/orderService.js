import api from './api';

export const orderService = {
  createOrder: async (data) => {
    const res = await api.post('/orders', data);
    return res.data;
  },
  getUserOrders: async () => {
    const res = await api.get('/orders/user');
    return res.data;
  },
  getOrderById: async (id) => {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },
  getAllOrders: async () => {
    const res = await api.get('/orders/admin');
    return res.data;
  },
  updateOrderStatus: async (id, data) => {
    const res = await api.put(`/orders/${id}`, data);
    return res.data;
  },
};
