import axios from 'axios';
import { User, CreateUserData, UpdateUserData } from '../types/user';

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

export const getUsers = async (): Promise<User[]> => {
  const response = await axios.get('/users');
  return response.data;
};

export const getUser = async (id: string): Promise<User> => {
  const response = await axios.get(`/users/${id}`);
  return response.data;
};

export const createUser = async (data: CreateUserData): Promise<User> => {
  const response = await axios.post('/users', data);
  return response.data;
};

export const updateUser = async (id: string, data: UpdateUserData): Promise<User> => {
  const response = await axios.put(`/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await axios.delete(`/users/${id}`);
};