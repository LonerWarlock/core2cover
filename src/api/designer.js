import api from "./axios";

// Designer Login
export const designerLogin = (data) => {
  return api.post("/designer/login", data);
};

// Designer Signup
export const designerSignup = (data) => {
  return api.post("/designer/signup", data);
};

// Send OTP
export const sendDesignerOtp = (email) => {
  return api.post("/designer/send-otp", { email });
};

// Verify OTP
export const verifyDesignerOtp = (email, otp) => {
  return api.post("/designer/verify-otp", { email, otp });
};

// Get Basic Info (for dashboard)
export const getDesignerBasic = (id) => {
  return api.get(`/designer/${id}/basic`).then((res) => res.data);
};

// Update Availability
export const updateDesignerAvailability = (id, status) => {
  return api.put(`/designer/${id}/availability`, { status });
};

// Hire a Designer (Client -> Designer)
export const hireDesigner = (designerId, data) => {
  return api.post(`/designer/${designerId}/hire`, data);
};

// ✅ FIX: Add getClientHiredDesigners
export const getClientHiredDesigners = ({ userId }) => {
  // Pass userId as a query param or in body depending on your API
  return api.get(`/client/hired-designers?userId=${userId}`);
};

// ✅ FIX: Add rateDesigner
export const rateDesigner = (designerId, data) => {
  return api.post(`/designer/${designerId}/rate`, data);
};