import axios from "axios";

const api = axios.create({
  baseURL: "/api", // HARDCODE THIS to ensure it hits your local routes
  withCredentials: true,
  headers: { "Content-Type": "application/json" }
});

// Request Interceptor: Attach local storage IDs for extra validation
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const userEmail = localStorage.getItem("userEmail");
      const sellerId = localStorage.getItem("sellerId");
      const designerId = localStorage.getItem("designerId");

      if (userEmail) config.headers["x-user-email"] = userEmail;
      if (sellerId) config.headers["x-seller-id"] = sellerId;
      if (designerId) config.headers["x-designer-id"] = designerId;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Better error logging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // This logs the 401 error to your console
    console.error("API Error Interface:", error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
);

export default api;