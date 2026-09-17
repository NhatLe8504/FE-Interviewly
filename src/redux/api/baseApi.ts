import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    // 1. Try to get token from Redux state
    let token: string | null = null;
    try {
      const state = getState() as RootState;
      token = state.auth?.token || null;
    } catch {
      // Fallback
    }

    // 2. Fallback to localStorage if not yet in state
    if (!token && typeof window !== "undefined") {
      token = localStorage.getItem("interviewly_token");
    }

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: [
    "User",
    "Profile",
    "Session",
    "Subscription",
    "Analytics",
    "History",
    "Quota",
    "Catalog",
  ],
  endpoints: () => ({}),
});