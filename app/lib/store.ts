"use client";
import { create } from "zustand";
import { api } from "./api";

interface AuthState {
  token: string | null;
  userId: string | null;
  email: string | null;
  isAuthenticated: boolean;
  hydrate: () => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  token: null,
  userId: null,
  email: null,
  isAuthenticated: false,

  hydrate: () => {
    const token = api.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        // Check expiry
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          api.setToken(null);
          set({ token: null, userId: null, email: null, isAuthenticated: false });
          return;
        }
        set({ token, userId: payload.sub, email: payload.email, isAuthenticated: true });
      } catch {
        api.setToken(null);
        set({ token: null, userId: null, email: null, isAuthenticated: false });
      }
    }
  },

  logout: () => {
    api.setToken(null);
    set({ token: null, userId: null, email: null, isAuthenticated: false });
  },
}));
