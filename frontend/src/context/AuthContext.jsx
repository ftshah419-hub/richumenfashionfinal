import { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as authApi from "../services/authService";

const AuthContext = createContext(undefined);
const TOKEN_KEY = "richu_access_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  function clearSession() {
    sessionStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }

  function establishSession(result) {
    sessionStorage.setItem(TOKEN_KEY, result.token);
    setUser(result.user);
    return result;
  }

  useEffect(() => {
    let cancelled = false;
    const token = sessionStorage.getItem(TOKEN_KEY);

    if (!token) {
      setLoading(false);
      return undefined;
    }

    authApi.getMe()
      .then((result) => {
        if (!cancelled) setUser(result.user);
      })
      .catch(() => {
        if (!cancelled) clearSession();
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: Boolean(user),
    signUp: async (payload) => establishSession(await authApi.register(payload)),
    signIn: async (payload, portal = "customer") => establishSession(
      portal === "admin" ? await authApi.adminLogin(payload) : await authApi.login(payload)
    ),
    signOut: async () => {
      try {
        await authApi.logout();
      } finally {
        clearSession();
      }
    },
    changePassword: async (payload) => establishSession(await authApi.changePassword(payload)),
    clearSession
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
