export interface BaseResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface ApiError {
  message: string;
  statusCode: number;
  timestamp: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  email: string;
  token: string;
}

export interface LoginResponse {
  success: boolean;
  userName: string;
  email: string;
  fullName: string;
  token: string;
  roles: string[]; // ✅ هنا حطينا الـ roles كمصفوفة
}


export interface forgetPassword {
  message: string;
  statusCode: number;
}

export interface resetPassword {
  message: string;
  statusCode: number;
}