import { createContext, useContext, useEffect, useState } from "react";
import * as authApi from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(authApi.getStoredUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = authApi.getToken();
    if (!token) {
      setUser(null);
      return;
    }
    authApi
      .fetchMe()
      .then((res) => setUser(res.user))
      .catch(() => {
        authApi.clearSession();
        setUser(null);
      });
  }, []);

  async function signIn(email, password) {
    setLoading(true);
    try {
      const u = await authApi.login(email, password);
      setUser(u);
      return u;
    } finally {
      setLoading(false);
    }
  }

  async function signUp(payload) {
    setLoading(true);
    try {
      const u = await authApi.register(payload);
      setUser(u);
      return u;
    } finally {
      setLoading(false);
    }
  }

  function signOut() {
    authApi.logout();
    setUser(null);
  }

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    role: user?.role || null,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}