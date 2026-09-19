import { store } from "@/redux/store";
import { authApiSlice } from "@/redux/api/authApi";
import { logOut } from "@/redux/slices/authSlice";
import { getStoredToken } from "./apiClient";
import type {
  RegisterIn,
  LoginIn,
  SendOtpIn,
  VerifyOtpIn,
  GoogleAuthIn,
  SetInitialPasswordIn,
  TokenOut,
  UserOut,
  MessageOut,
} from "@/types/auth";

export const authApi = {
  async register(payload: RegisterIn): Promise<UserOut> {
    return store.dispatch(authApiSlice.endpoints.register.initiate(payload)).unwrap();
  },

  async login(payload: LoginIn): Promise<TokenOut> {
    return store.dispatch(authApiSlice.endpoints.login.initiate(payload)).unwrap();
  },

  async sendOtp(payload: SendOtpIn): Promise<MessageOut> {
    return store.dispatch(authApiSlice.endpoints.sendOtp.initiate(payload)).unwrap();
  },

  async verifyOtp(payload: VerifyOtpIn): Promise<MessageOut> {
    return store.dispatch(authApiSlice.endpoints.verifyOtp.initiate(payload)).unwrap();
  },

  async googleAuth(payload: GoogleAuthIn): Promise<TokenOut> {
    return store.dispatch(authApiSlice.endpoints.googleAuth.initiate(payload)).unwrap();
  },

  async getMe(): Promise<UserOut> {
    return store.dispatch(authApiSlice.endpoints.getMe.initiate()).unwrap();
  },

  async setInitialPassword(payload: SetInitialPasswordIn): Promise<MessageOut> {
    return store.dispatch(authApiSlice.endpoints.setInitialPassword.initiate(payload)).unwrap();
  },

  async checkHealth(): Promise<{ status: string; database?: string }> {
    return store.dispatch(authApiSlice.endpoints.checkHealth.initiate()).unwrap();
  },

  logout(): void {
    store.dispatch(logOut());
  },

  getToken(): string | null {
    return getStoredToken();
  },
};

// Re-export RTK Query hooks for direct component usage
export * from "@/redux/api/authApi";