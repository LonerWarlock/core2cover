import api from "./axios";

// --- CUSTOMER AUTH ---
export const signupUser = (data) => api.post("/auth/signup", data);
export const loginUser = (data) => api.post("/login", data);
export const sendCustomerOtp = (email) => api.post("/customer/send-otp", { email });
export const verifyCustomerOtp = (email, otp) => api.post("/customer/verify-otp", { email, otp });

// --- SELLER AUTH ---
export const signupSeller = (data) => api.post("/seller/signup", data);
export const loginSeller = (data) => api.post("/seller/login", data);
export const sendSellerOtp = (email) => api.post("/seller/send-otp", { email });
export const verifySellerOtp = (email, otp) => api.post("/seller/verify-otp", { email, otp });
export const verifySellerPassword = (sellerId, password) => api.post("/seller/verify-password", { sellerId, password });

// --- DESIGNER AUTH ---
export const signupDesigner = (data) => api.post("/designer/signup", data);
export const loginDesigner = (data) => api.post("/designer/login", data);
export const sendDesignerOtp = (email) => api.post("/designer/send-otp", { email });
export const verifyDesignerOtp = (email, otp) => api.post("/designer/verify-otp", { email, otp });