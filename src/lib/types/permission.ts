export interface Permission {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface CreatePermissionData {
  name: string;
  description?: string;
}

export interface UpdatePermissionData {
  name?: string;
  description?: string;
}