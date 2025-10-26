export interface User {
  fullName: string;
  email?: string;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  Username: string;
  fullName: string;
  email: string;
  password: string;
  ConfirmPassword: string;

}

export interface ForgetPasswordRequest {
  email: string;
}

export interface resetPasswordRequest {
  email: string;
  token:string;
  NewPassword:string;
  ConfirmNewPassword:string;
}

export interface AuthResponse {
  fullName: string;
  token: string;
}