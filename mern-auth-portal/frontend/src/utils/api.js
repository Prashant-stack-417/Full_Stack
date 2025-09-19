import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor to add token to requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle global errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token is invalid or expired, remove it
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      // Could also redirect to login page here if needed
    }
    return Promise.reject(error);
  }
);

export default API;
