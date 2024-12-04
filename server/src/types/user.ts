import { User, Role, Permission } from '@prisma/client';

export interface UserWithRole extends User {
  role: Role & {
    permissions: {
      permission: Permission;
    }[];
  };
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  roleId: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  roleId?: string;
}