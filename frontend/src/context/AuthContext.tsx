import React, { createContext, useContext, useMemo, useState } from "react";

type User = { id?: string; name?: string; email?: string } | null;

type AuthState = {
  user: User;
  token: string | null;
  login: (token: string, user?: User) => void;
  logout: () => void;
};

const AuthCtx = createContext<AuthState | null>(null);

const LS_KEY = "vc_token";
const LS_USER = "vc_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize from LocalStorage so refresh keeps you logged in
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(LS_KEY));
  const [user, setUser] = useState<User>(() => {
    const raw = localStorage.getItem(LS_USER);
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
  });

  const loginFn = (tk: string, u?: User) => {
    setToken(tk);
    localStorage.setItem(LS_KEY, tk);
    if (u) {
      setUser(u);
      localStorage.setItem(LS_USER, JSON.stringify(u));
    }
  };

  const logoutFn = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(LS_KEY);
    localStorage.removeItem(LS_USER);
  };

  const value = useMemo(() => ({ user, token, login: loginFn, logout: logoutFn }), [user, token]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
