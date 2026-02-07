"use client";
import { create } from "zustand";
import { api } from "./api";

interface AuthState {
  token: string | null;
  userId: string | null;
  email: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  hydrate: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  token: null,
  userId: null,
  email: null,
  isAuthenticated: false,

  login: async (email, password) => {
    const res = await api.login(email, password);
    api.setToken(res.access_token);
    set({ token: res.access_token, userId: res.user_id, email: res.email, isAuthenticated: true });
  },

  register: async (email, password, name) => {
    const res = await api.register(email, password, name);
    api.setToken(res.access_token);
    set({ token: res.access_token, userId: res.user_id, email: res.email, isAuthenticated: true });
  },

  logout: () => {
    api.setToken(null);
    set({ token: null, userId: null, email: null, isAuthenticated: false });
  },

  hydrate: () => {
    const token = api.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        set({ token, userId: payload.sub, email: payload.email, isAuthenticated: true });
      } catch {
        api.setToken(null);
      }
    }
  },
}));
