import axios from "axios";

/**
 * Next.js Unified API Instance
 * * Since our frontend and backend are now in the same project,
 * we use '/api' as the baseURL. This allows the browser to 
 * automatically prepend the current domain (e.g., http://localhost:3000).
 */
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  // Ensure cookies/sessions are sent if you implement them later
  withCredentials: true, 
});

// Request Interceptor (Optional: For adding tokens if you use them)
api.interceptors.request.use(
  (config) => {
    // You can add logic here to attach tokens from localStorage if needed
    // const token = localStorage.getItem("token");
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor (For global error handling)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
);

export default api;