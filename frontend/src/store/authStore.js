import { create } from 'zustand';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token, ...userData } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      set({ user: userData, token, isLoading: false });
      toast.success('Logged in successfully!');
      return true;
    } catch (error) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    }
  },

  signup: async (name, email, password, role) => {
    set({ isLoading: true });
    try {
      const res = await axios.post(`${API_URL}/auth/signup`, { name, email, password, role });
      const { token, ...userData } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      set({ user: userData, token, isLoading: false });
      toast.success('Account created successfully!');
      return true;
    } catch (error) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || 'Signup failed');
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
    toast.success('Logged out');
  }
}));

export default useAuthStore;
