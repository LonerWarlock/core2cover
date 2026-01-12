/* src/api/auth.js */
import api from "./axios";

/* =========================================
   CUSTOMER AUTHENTICATION
========================================= */

// Customer Login
export const customerLogin = (data) => {
  return api.post("/login", data);
};

// Customer Signup
export const customerSignup = (data) => {
  return api.post("/auth/signup", data);
};

// Send OTP (Customer)
export const sendCustomerOtp = (email) => {
  return api.post("/customer/send-otp", { email });
};

// Verify OTP (Customer)
export const verifyCustomerOtp = (email, otp) => {
  return api.post("/customer/verify-otp", { email, otp });
};

/* =========================================
   SELLER AUTHENTICATION
========================================= */

// Seller Login
export const sellerLogin = (data) => {
  return api.post("/seller/login", data);
};

// Seller Signup
export const sellerSignup = (data) => {
  return api.post("/seller/signup", data);
};

// Send OTP (Seller)
export const sendSellerOtp = (email) => {
  return api.post("/seller/send-otp", { email });
};

// Verify OTP (Seller)
export const verifySellerOtp = (email, otp) => {
  return api.post("/seller/verify-otp", { email, otp });
};