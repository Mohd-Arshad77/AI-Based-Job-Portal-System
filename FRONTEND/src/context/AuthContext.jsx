import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../services/api.js";

const AuthContext = createContext(null);

const storageKeys = {
  token: "portal_token",
  user: "portal_user"
};

const buildDemoUser = (values = {}) => {
  const role = values.email?.includes("recruiter") ? "recruiter" : "user";
  const fallbackName = values.name || values.email?.split("@")[0]?.replace(/[._-]/g, " ") || "Demo User";

  return {
    _id: `demo-${role}`,
    name: fallbackName.replace(/\b\w/g, (char) => char.toUpperCase()),
    email: values.email || `${role}@demo.com`,
    role,
    education: "B.Tech in Computer Science",
    experience: "Designed and shipped polished hiring products with AI-assisted workflows.",
    skills: ["React", "Tailwind CSS", "Product Design", "AI Workflows", "Communication"]
  };
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(storageKeys.token) || "");
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem(storageKeys.user);
    return storedUser ? JSON.parse(storedUser) : null;
  });
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

 const login = async (values) => {
  setLoading(true);
  try {
    const { data } = await authApi.login(values);

    setToken(data.token);
    setUser(data.user);

    return { success: true, user: data.user };

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

    setToken(data.token);
    setUser(data.user);

    return { success: true, user: data.user };

  } catch (error) {
    return {
      success: false,   
      message: error.response?.data?.message || "Registration failed"
    };
  } finally {
    setLoading(false);
  }
};

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore logout failures so local auth state can still be cleared
    }

    setToken("");
    setUser(null);
  };

  const value = useMemo(() => ({ token, user, loading, login, register, logout, isAuthenticated: Boolean(user || token) }), [token, user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
