import api from './api';

export const productService = {
  getProducts: async (params = {}) => {
    const res = await api.get('/products', { params });
    return res.data;
  },
  getProductById: async (id) => {
    const res = await api.get(`/products/${id}`);
    return res.data;
  },
  createProduct: async (data) => {
    const res = await api.post('/products', data);
    return res.data;
  },
  updateProduct: async (id, data) => {
    const res = await api.put(`/products/${id}`, data);
    return res.data;
  },
  deleteProduct: async (id) => {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  },
  addReview: async (id, data) => {
    const res = await api.post(`/products/${id}/reviews`, data);
    return res.data;
  },
  removeReview: async (productId, reviewId) => {
    const res = await api.delete(`/products/${productId}/reviews/${reviewId}`);
    return res.data;
  },
  checkPurchase: async (productId) => {
    const res = await api.get(`/orders/check-purchase/${productId}`);
    return res.data;
  },
};
