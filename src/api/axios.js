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
    // Check if we are in the browser
    if (typeof window !== "undefined") {
      const userEmail = localStorage.getItem("userEmail");
      const sellerId = localStorage.getItem("sellerId");
      const designerId = localStorage.getItem("designerId"); // Added for Designer Dashboard

      if (userEmail) config.headers["x-user-email"] = userEmail;
      if (sellerId) config.headers["x-seller-id"] = sellerId;
      if (designerId) config.headers["x-designer-id"] = designerId; // Useful for backend validation
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Standardised error logging
    console.error("API Error Interface:", error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
);

export default api;