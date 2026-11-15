import { createContext, useContext, useState, useEffect } from "react";
import * as authService from "../services/authService";
import * as userService from "../services/userService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    sessionStorage.getItem("richu_access_token") ||
    localStorage.getItem("richu_access_token") ||
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCurrentUser() {
      if (token) {
        try {
          const res = await authService.getMe();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            logout();
          }
        } catch {
          logout();
        }
      }
      setLoading(false);
    }
    loadCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res.token) {
      sessionStorage.setItem("richu_access_token", res.token);
      localStorage.setItem("richu_access_token", res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const register = async (name, email, password, phone) => {
    const res = await authService.register({ name, email, password, phone });
    if (res.token) {
      sessionStorage.setItem("richu_access_token", res.token);
      localStorage.setItem("richu_access_token", res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const logout = () => {
    sessionStorage.removeItem("richu_access_token");
    localStorage.removeItem("richu_access_token");
    setToken(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    if (token) {
      try {
        const res = await userService.getProfile();
        if (res.success && res.data) {
          setUser(res.data);
        }
      } catch (err) {
        console.error("Failed to refresh profile:", err);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user),
        loading,
        login,
        register,
        logout,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
