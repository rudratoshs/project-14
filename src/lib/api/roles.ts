import axios from 'axios';
import { Role, CreateRoleData, UpdateRoleData } from '../types/role';

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

export const getRoles = async (): Promise<Role[]> => {
  const response = await axios.get('/roles');
  return response.data;
};

export const getRole = async (id: string): Promise<Role> => {
  const response = await axios.get(`/roles/${id}`);
  return response.data;
};

export const createRole = async (data: CreateRoleData): Promise<Role> => {
  const response = await axios.post('/roles', data);
  return response.data;
};

export const updateRole = async (id: string, data: UpdateRoleData): Promise<Role> => {
  const response = await axios.put(`/roles/${id}`, data);
  return response.data;
};

export const deleteRole = async (id: string): Promise<void> => {
  await axios.delete(`/roles/${id}`);
};

export const assignPermissions = async (roleId: string, permissionIds: string[]): Promise<Role> => {
  const response = await axios.post(`/roles/${roleId}/permissions`, { permissionIds });
  return response.data;
};