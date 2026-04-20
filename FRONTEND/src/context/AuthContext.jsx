import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../services/api.js";

const AuthContext = createContext(null);

const storageKeys = {
  token: "portal_token",
  user: "portal_user"
};

const getStoredUser = () => {
  const storedUser = localStorage.getItem(storageKeys.user);

  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem(storageKeys.user);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(storageKeys.token) || "");
  const [user, setUser] = useState(getStoredUser);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem(storageKeys.token, token);
    } else {
      localStorage.removeItem(storageKeys.token);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(storageKeys.user, JSON.stringify(user));
    } else {
      localStorage.removeItem(storageKeys.user);
    }
  }, [user]);

  const applySession = (data) => {
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

const login = async (values) => {
    setLoading(true);
    try {
      const { data } = await authApi.login(values);
      const nextUser = applySession(data);

      return { success: true, user: nextUser };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Invalid email or password"
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (values) => {
    setLoading(true);
    try {
      const { data } = await authApi.register(values);
      return {
        success: true,
        requiresOTP: data.requiresOTP,
        email: data.email
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed"
      };
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (values) => {
    setLoading(true);
    try {
      const { data } = await authApi.verifyOtp(values);
      const nextUser = applySession(data);
      return { success: true, user: nextUser };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Invalid OTP"
      };
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (credential) => {
    setLoading(true);
    try {
      const { data } = await authApi.googleAuth(credential);
      const nextUser = applySession(data);
      return { success: true, user: nextUser };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Google auth failed"
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {}

    setToken("");
    setUser(null);
  };

  const value = {
    token,
    user,
    loading,
    login,
    register,
    verifyOtp,
    loginWithGoogle,
    logout,
    isAuthenticated: Boolean(user || token)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);