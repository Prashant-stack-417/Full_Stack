import { createContext, useContext, useEffect, useState } from "react";
import API from "../utils/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize authentication state
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      fetchProfile();
    } else {
      localStorage.removeItem("token");
      setUser(null);
      setIsAuthenticated(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/auth/profile");
      if (res.data && res.data.success) {
        setUser(res.data.user);
        setIsAuthenticated(true);
      } else {
        // Invalid response structure
        setToken(null);
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
      // Token invalid, expired, or network issue
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    try {
      setLoading(true);
      const res = await API.post("/api/auth/register", payload);

      // If registration includes auto-login (returns token)
      if (res.data && res.data.success && res.data.token) {
        setToken(res.data.token);
        setUser(res.data.user);
        setIsAuthenticated(true);
      }

      return res.data;
    } catch (error) {
      // Re-throw to let component handle the error
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async ({ email, password }) => {
    try {
      setLoading(true);
      const res = await API.post("/api/auth/login", { email, password });

      if (res.data && res.data.success && res.data.token) {
        setToken(res.data.token);
        setUser(res.data.user);
        setIsAuthenticated(true);
      }

      return res.data;
    } catch (error) {
      // Re-throw to let component handle the error
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint if authenticated
      if (token) {
        await API.post("/api/auth/logout");
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Continue with logout even if API call fails
    } finally {
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        register,
        login,
        logout,
        fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
