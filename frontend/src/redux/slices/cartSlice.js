import { createSlice } from '@reduxjs/toolkit';

const savedCart = JSON.parse(localStorage.getItem('shopease_cart') || '[]');

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: savedCart,
  },
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      const existing = state.items.find((i) => i.product._id === product._id);
      if (existing) {
        existing.quantity = Math.min(existing.quantity + quantity, product.stock);
      } else {
        state.items.push({ product, quantity });
      }
      localStorage.setItem('shopease_cart', JSON.stringify(state.items));
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((i) => i.product._id !== action.payload);
      localStorage.setItem('shopease_cart', JSON.stringify(state.items));
    },
    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find((i) => i.product._id === productId);
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter((i) => i.product._id !== productId);
        } else {
          item.quantity = quantity;
        }
      }
      localStorage.setItem('shopease_cart', JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem('shopease_cart');
    },
  },
});

// Selectors
export const selectCartTotal = (state) =>
  state.cart.items.reduce((acc, i) => acc + i.product.price * i.quantity, 0);

export const selectCartCount = (state) =>
  state.cart.items.reduce((acc, i) => acc + i.quantity, 0);

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
