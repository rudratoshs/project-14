import { Permission } from './permission';

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: {
    permission: Permission;
  }[];
  createdAt: string;
}

export interface CreateRoleData {
  name: string;
  description?: string;
  permissionIds: string[];
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
  permissionIds?: string[];
}