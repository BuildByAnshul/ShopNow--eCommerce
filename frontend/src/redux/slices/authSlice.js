import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';

const user = JSON.parse(localStorage.getItem('shopease_user') || 'null');

export const register = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await authService.register(data);
    return res;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const login = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await authService.login(data);
    return res;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const addAddress = createAsyncThunk('auth/addAddress', async (data, { rejectWithValue }) => {
  try {
    const addresses = await authService.addAddress(data);
    return addresses;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to add address');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: user || null,
    isAuthenticated: !!user,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('shopease_user');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const handlePending = (state) => {
      state.loading = true;
      state.error = null;
    };
    const handleFulfilled = (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('shopease_user', JSON.stringify(action.payload));
    };
    const handleRejected = (state, action) => {
      state.loading = false;
      state.error = action.payload;
    };

    builder
      .addCase(register.pending, handlePending)
      .addCase(register.fulfilled, handleFulfilled)
      .addCase(register.rejected, handleRejected)
      .addCase(login.pending, handlePending)
      .addCase(login.fulfilled, handleFulfilled)
      .addCase(login.rejected, handleRejected)
      .addCase(addAddress.fulfilled, (state, action) => {
        if (state.user) {
          state.user.addresses = action.payload;
          localStorage.setItem('shopease_user', JSON.stringify(state.user));
        }
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
