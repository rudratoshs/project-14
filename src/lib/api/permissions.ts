import axios from 'axios';
import { Permission, CreatePermissionData, UpdatePermissionData } from '../types/permission';

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

export const getPermissions = async (): Promise<Permission[]> => {
  const response = await axios.get('/permissions');
  return response.data;
};

export const getPermission = async (id: string): Promise<Permission> => {
  const response = await axios.get(`/permissions/${id}`);
  return response.data;
};

export const createPermission = async (data: CreatePermissionData): Promise<Permission> => {
  const response = await axios.post('/permissions', data);
  return response.data;
};

export const updatePermission = async (id: string, data: UpdatePermissionData): Promise<Permission> => {
  const response = await axios.put(`/permissions/${id}`, data);
  return response.data;
};

export const deletePermission = async (id: string): Promise<void> => {
  await axios.delete(`/permissions/${id}`);
};