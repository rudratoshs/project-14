export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokenPayload {
  userId: string;
  roleId: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
}
