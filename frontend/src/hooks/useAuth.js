import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const handleLogout = () => dispatch(logout());

  return {
    user,
    isAuthenticated,
    loading,
    error,
    isAdmin: user?.role === 'admin',
    logout: handleLogout,
  };
};
