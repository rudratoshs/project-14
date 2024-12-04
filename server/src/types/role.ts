import { Role, Permission } from '@prisma/client';

export interface RoleWithPermissions extends Role {
  permissions: {
    permission: Permission;
  }[];
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