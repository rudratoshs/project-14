import { Role } from './role';
import { UserSubscription } from './subscription';

export interface User {
  id: string;
  name: string;
  email: string;
  roleId: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
  subscriptions: UserSubscription[];
}

export interface CreateUserData {
  name: string;
  email: string;
  password?: string;
  roleId: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  roleId?: string;
}