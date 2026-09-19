"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { UserOut, LoginIn, RegisterIn, TokenOut } from "@/types/auth";
import { authApi } from "@/services/authApi";
import { getStoredToken } from "@/services/apiClient";
import { profileApi } from "@/services/profileApi";

interface AuthContextType {
  user: UserOut | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginIn) => Promise<TokenOut>;
  register: (payload: RegisterIn) => Promise<UserOut>;
  googleLogin: (credential: string) => Promise<TokenOut>;
  setInitialPassword: (password: string) => Promise<void>;
  updateUserLocal: (updated: Partial<UserOut>) => void;
  logout: () => void;
  refreshUser: () => Promise<UserOut | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserOut | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async (): Promise<UserOut | null> => {
    const storedToken = getStoredToken();
    if (!storedToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return null;
    }

    try {
      setToken(storedToken);
      const profile = await authApi.getMe();
      let avatarUrl = profile.avatar_url;
      if (!avatarUrl) {
        try {
          const userProfile = await profileApi.getMyProfile();
          avatarUrl = userProfile.avatar_url;
        } catch {}
      }
      const combined: UserOut = {
        ...profile,
        avatar_url: avatarUrl || profile.avatar_url || null,
      };
      setUser(combined);
      return combined;
    } catch {
      authApi.logout();
      setUser(null);
      setToken(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (payload: LoginIn): Promise<TokenOut> => {
    const res = await authApi.login(payload);
    setToken(res.access_token);
    try {
      const profile = await authApi.getMe();
      setUser(profile);
    } catch {
      // Ignored if me fails temporarily
    }
    return res;
  };

  const register = async (payload: RegisterIn): Promise<UserOut> => {
    const res = await authApi.register(payload);
    return res;
  };

  const googleLogin = async (credential: string): Promise<TokenOut> => {
    const res = await authApi.googleAuth({ credential });
    setToken(res.access_token);
    try {
      const profile = await authApi.getMe();
      const combinedProfile: UserOut = {
        ...profile,
        needs_password: res.needs_password !== undefined ? res.needs_password : profile?.needs_password,
      };
      setUser(combinedProfile);
    } catch {
      // Ignored
    }
    return res;
  };

  const setInitialPassword = async (password: string): Promise<void> => {
    await authApi.setInitialPassword({ password });
    await refreshUser();
  };

  const updateUserLocal = (updated: Partial<UserOut>) => {
    setUser((prev) => (prev ? { ...prev, ...updated } : null));
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        googleLogin,
        setInitialPassword,
        updateUserLocal,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}