import axios from 'axios';
import { LoginCredentials, RegisterData } from '../types/auth';
import { User } from '../types/user';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Configure axios defaults
axios.defaults.baseURL = API_URL;

// Add JWT token to requests if available
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle 401 errors
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export const login = async (credentials: LoginCredentials): Promise<{ user: User; token: string }> => {
  try {
    const response = await axios.post('/auth/login', credentials);
    const { token, user } = response.data;
    return { user, token };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
    throw error;
  }
};

export const register = async (data: RegisterData): Promise<{ user: User; token: string }> => {
  try {
    const response = await axios.post('/auth/register', data);
    const { token, user } = response.data;
    return { user, token };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await axios.post('/auth/logout');
  } finally {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  }
};

export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await axios.get('/auth/me');
    return response.data.user;
  } catch (error) {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    throw error;
  }
};