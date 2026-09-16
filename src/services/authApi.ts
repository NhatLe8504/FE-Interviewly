import { request, setStoredToken, removeStoredToken, getStoredToken } from "./apiClient";
import {
  RegisterIn,
  LoginIn,
  SendOtpIn,
  VerifyOtpIn,
  GoogleAuthIn,
  TokenOut,
  UserOut,
  MessageOut,
} from "@/types/auth";

export const authApi = {
  async register(payload: RegisterIn): Promise<UserOut> {
    return request<UserOut>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async login(payload: LoginIn): Promise<TokenOut> {
    const res = await request<TokenOut>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (res.access_token) {
      setStoredToken(res.access_token);
    }
    return res;
  },

  async sendOtp(payload: SendOtpIn): Promise<MessageOut> {
    return request<MessageOut>("/api/v1/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({
        email: payload.email,
        purpose: payload.purpose || "verify_email",
      }),
    });
  },

  async verifyOtp(payload: VerifyOtpIn): Promise<MessageOut> {
    return request<MessageOut>("/api/v1/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({
        email: payload.email,
        otp: payload.otp,
        purpose: payload.purpose || "verify_email",
      }),
    });
  },

  async googleAuth(payload: GoogleAuthIn): Promise<TokenOut> {
    const res = await request<TokenOut>("/api/v1/auth/google", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (res.access_token) {
      setStoredToken(res.access_token);
    }
    return res;
  },

  async getMe(): Promise<UserOut> {
    return request<UserOut>("/api/v1/auth/me", {
      method: "GET",
    });
  },

  async checkHealth(): Promise<{ status: string; database?: string }> {
    return request<{ status: string; database?: string }>("/health", {
      method: "GET",
    });
  },

  logout(): void {
    removeStoredToken();
  },

  getToken(): string | null {
    return getStoredToken();
  },
};