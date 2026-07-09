import { useSelector, useDispatch } from 'react-redux';
import { addToCart, removeFromCart, updateQuantity, clearCart, selectCartTotal, selectCartCount } from '../redux/slices/cartSlice';

export const useCart = () => {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.cart);
  const total = useSelector(selectCartTotal);
  const count = useSelector(selectCartCount);

  return {
    items,
    total,
    count,
    addToCart: (product, quantity) => dispatch(addToCart({ product, quantity })),
    removeFromCart: (productId) => dispatch(removeFromCart(productId)),
    updateQuantity: (productId, quantity) => dispatch(updateQuantity({ productId, quantity })),
    clearCart: () => dispatch(clearCart()),
  };
};
