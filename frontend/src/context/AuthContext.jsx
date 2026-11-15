import { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as authService from "../services/authService";
import * as userService from "../services/userService";

const AuthContext = createContext(null);
const TOKEN_KEY = "richu_access_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    () => localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || null
  );
  const [loading, setLoading] = useState(true);

  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }

  function establishSession(result) {
    const accessToken = result?.token || result?.data?.token;
    const currentUser = result?.user || result?.data?.user;

    if (accessToken) {
      localStorage.setItem(TOKEN_KEY, accessToken);
      sessionStorage.setItem(TOKEN_KEY, accessToken);
      setToken(accessToken);
    }
    if (currentUser) {
      setUser(currentUser);
    }
    return result;
  }

  useEffect(() => {
    let cancelled = false;
    const currentToken = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);

    if (!currentToken) {
      setLoading(false);
      return;
    }

    authService.getMe()
      .then((res) => {
        if (!cancelled) {
          const currentUser = res?.user || res?.data;
          if (currentUser) {
            setUser(currentUser);
          } else {
            clearSession();
          }
        }
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

  const handleLogin = async (emailOrPayload, password, portal = "customer") => {
    let payload;
    let targetPortal = portal;

    if (typeof emailOrPayload === "object" && emailOrPayload !== null) {
      payload = emailOrPayload;
      if (payload.portal) targetPortal = payload.portal;
    } else {
      payload = { email: emailOrPayload, password };
    }

    const res = targetPortal === "admin" && authService.adminLogin
      ? await authService.adminLogin(payload)
      : await authService.login(payload);

    establishSession(res);
    return res;
  };

  const handleRegister = async (nameOrPayload, email, password, phone) => {
    let payload;
    if (typeof nameOrPayload === "object" && nameOrPayload !== null) {
      payload = nameOrPayload;
    } else {
      payload = { name: nameOrPayload, email, password, phone };
    }

    const res = await authService.register(payload);
    establishSession(res);
    return res;
  };

  const handleLogout = async () => {
    try {
      if (authService.logout) {
        await authService.logout();
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      clearSession();
    }
  };

  const refreshProfile = async () => {
    const currentToken = token || localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    if (currentToken) {
      try {
        if (userService && userService.getProfile) {
          const res = await userService.getProfile();
          if (res?.success && res?.data) {
            setUser(res.data);
          } else if (res?.user) {
            setUser(res.user);
          }
        } else {
          const res = await authService.getMe();
          if (res?.user) setUser(res.user);
        }
      } catch (err) {
        console.error("Failed to refresh profile:", err);
      }
    }
  };

  const changePassword = async (payload) => {
    if (authService.changePassword) {
      const res = await authService.changePassword(payload);
      establishSession(res);
      return res;
    }
  };

  const value = useMemo(() => ({
    user,
    token,
    loading,
    isAuthenticated: Boolean(user),
    // Aliases to support both teammates' conventions
    login: handleLogin,
    signIn: handleLogin,
    register: handleRegister,
    signUp: handleRegister,
    logout: handleLogout,
    signOut: handleLogout,
    refreshProfile,
    changePassword,
    clearSession
  }), [user, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}