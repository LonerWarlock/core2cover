import axios from "axios";

const api = axios.create({
  // This tells axios to look at the same domain/port the website is running on
  baseURL: "/api", 
  headers: {
    "Content-Type": "application/json",
  }
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const userEmail = typeof window !== "undefined" ? localStorage.getItem("userEmail") : null;
    const sellerId = typeof window !== "undefined" ? localStorage.getItem("sellerId") : null;
    
    if (userEmail) config.headers["x-user-email"] = userEmail;
    // Many backends also expect the seller ID in headers for dashboard stats
    if (sellerId) config.headers["x-seller-id"] = sellerId;
    
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
);

export default api;