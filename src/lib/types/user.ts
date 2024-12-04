import { Role } from './role';

export interface User {
  id: string;
  name: string;
  email: string;
  roleId: string;
  subscriptionPlan: 'free' | 'pro' | 'enterprise';
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  roleId: string;
  subscriptionPlan?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  roleId?: string;
  subscriptionPlan?: string;
}