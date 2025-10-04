import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 errors (unauthorized) by redirecting to login
    if (typeof window !== "undefined" && error.response?.status === 401) {
      // Remove the token if it's invalid
      localStorage.removeItem("authToken");
      // Note: We can't use router.push here because this is not a React component
      // The ProtectedRoute component will handle the actual redirection
    }
    return Promise.reject(error);
  }
);

export default api;
