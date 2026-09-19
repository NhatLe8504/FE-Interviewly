export interface UserOut {
  user_id: number;
  full_name: string;
  email: string;
  role: string;
  status: string;
  is_onboarded?: boolean;
  needs_password?: boolean;
  avatar_url?: string | null;
}

export interface TokenOut {
  access_token: string;
  token_type: string;
  is_new_user?: boolean;
  needs_password?: boolean;
  is_onboarded?: boolean;
}

export interface SetInitialPasswordIn {
  password: string;
}

export interface RegisterIn {
  full_name: string;
  email: string;
  password: string;
  otp?: string | null;
}

export interface LoginIn {
  email: string;
  password: string;
}

export interface SendOtpIn {
  email: string;
  purpose?: string;
}

export interface VerifyOtpIn {
  email: string;
  otp: string;
  purpose?: string;
}

export interface GoogleAuthIn {
  credential: string;
}

export interface MessageOut {
  message: string;
}

export interface ValidationErrorItem {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface ApiErrorResponse {
  detail?: string | ValidationErrorItem[];
}