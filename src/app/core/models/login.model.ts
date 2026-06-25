export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserInfo {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

export interface LoginResponse {
  token?: string;
  user?: UserInfo;
  message?: string;
  success?: boolean;
}
