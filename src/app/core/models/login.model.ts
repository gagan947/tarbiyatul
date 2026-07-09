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
  success?: boolean;
  message?: string;
  data?: {
    token?: string;
    role?: string;
    user?: UserInfo;
    isFirstLogin?: boolean;
    isPasswordGenerated?: boolean;
  };
  token?: string;
  user?: UserInfo;
}
