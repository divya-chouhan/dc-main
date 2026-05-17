import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = '/api';

export const loginUser = createAsyncThunk('auth/login', async ({ email, password }, thunkAPI) => {
  try {
    const res = await axios.post(`${API_URL}/auth/login`, { email, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data));
    toast.success('Logged in successfully!');
    return res.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Login failed';
    toast.error(message);
    return thunkAPI.rejectWithValue(message);
  }
});

export const signupUser = createAsyncThunk('auth/signup', async ({ name, email, password, role, adminCode }, thunkAPI) => {
  try {
    const res = await axios.post(`${API_URL}/auth/signup`, { name, email, password, role, adminCode });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data));
    toast.success('Account created successfully!');
    return res.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Signup failed';
    toast.error(message);
    return thunkAPI.rejectWithValue(message);
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (userData, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    const res = await axios.put(`${API_URL}/users/profile`, userData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    localStorage.setItem('user', JSON.stringify(res.data));
    toast.success('Profile updated successfully!');
    return res.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Update failed';
    toast.error(message);
    return thunkAPI.rejectWithValue(message);
  }
});
export const upgradeAccount = createAsyncThunk('auth/upgrade', async (adminCode, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    const res = await axios.post(`${API_URL}/auth/upgrade`, { adminCode }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    localStorage.setItem('user', JSON.stringify(res.data));
    toast.success('Account upgraded to Admin!');
    return res.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Upgrade failed';
    toast.error(message);
    return thunkAPI.rejectWithValue(message);
  }
});

export const deleteAccount = createAsyncThunk('auth/deleteAccount', async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    const res = await axios.delete(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Account deleted successfully');
    return res.data;
  } catch (error) {
    console.error('Delete thunk error:', error.response?.data || error.message);
    const message = error.response?.data?.message || error.message || 'Deletion failed';
    toast.error(`Deletion failed: ${message}`);
    return thunkAPI.rejectWithValue(message);
  }
});
export const getMe = createAsyncThunk('auth/getMe', async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    const res = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    localStorage.setItem('user', JSON.stringify(res.data));
    return res.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message);
  }
});

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      state.user = null;
      state.token = null;
      toast.success('Logged out');
    },
    googleLogin: (state, action) => {
      state.token = action.payload.token;
      // We need to fetch the user or rely on token. For simplicity we expect token.
      localStorage.setItem('token', action.payload.token);
    },
    setUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => { state.isLoading = true; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state) => { state.isLoading = false; })
      
      .addCase(signupUser.pending, (state) => { state.isLoading = true; })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.token = action.payload.token;
      })
      .addCase(signupUser.rejected, (state) => { state.isLoading = false; })
      
      .addCase(updateProfile.pending, (state) => { state.isLoading = true; })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state) => { state.isLoading = false; })
      
      .addCase(deleteAccount.pending, (state) => { state.isLoading = true; })
      .addCase(deleteAccount.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
      })
      .addCase(deleteAccount.rejected, (state) => { state.isLoading = false; })
      
      .addCase(getMe.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(upgradeAccount.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  }
});

export const { logout, googleLogin, setUser } = authSlice.actions;
export default authSlice.reducer;
