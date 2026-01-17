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

export const saveDesignerPortfolio = async (formData) => {
  // 2. Use 'api' instead of the undefined 'axios'
  const response = await api.post("/designer/portfolio", formData, {
    headers: {
      "Content-Type": "multipart/form-data", // Essential for image uploads
    },
  });
  return response.data;
};

export const saveDesignerProfile = async (formData) => {
  // Use 'api' instead of 'axios'
  // Also ensure the URL matches your Next.js route path exactly
  const response = await api.post("/designer/profile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Get Basic Info (for dashboard)
export const getDesignerBasic = (id) => {
  return api.get(`/designer/${id}/basic`).then((res) => res.data);
};

export const getClientRatings = async (designerId) => {
  try {
    const response = await axios.get(`/api/designer/${designerId}/client-ratings`);
    return response.data;
  } catch (error) {
    console.error("Error fetching client ratings:", error);
    throw error;
  }
};

// Update Availability
export const updateDesignerAvailability = async (id, availability) => {
  const response = await api.patch(`/designer/${id}/basic`, { availability });
  return response.data;
};
// Hire a Designer (Client -> Designer)
export const hireDesigner = (designerId, data) => {
  return api.post(`/designer/${designerId}/hire`, data);
};

//  FIX: Add getClientHiredDesigners
export const getClientHiredDesigners = ({ userId }) => {
  // Pass userId as a query param or in body depending on your API
  return api.get(`/client/hired-designers?userId=${userId}`);
};

export const getDesignerEditProfile = async (designerId) => {
  const response = await api.get(`/designer/${designerId}/edit-profile`);
  return response.data;
};

export const updateDesignerProfile = async (designerId, formData) => {
  const response = await api.put(`/designer/${designerId}/edit-profile`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getDesignerWorkRequests = async (designerId) => {
  const response = await api.get(`/designer/${designerId}/work-requests`);
  return response.data;
};

export const rateUser = async (designerId, ratingData) => {
  const response = await api.post(`/designer/${designerId}/rate`, ratingData);
  return response.data;
};

//  FIX: Add rateDesigner
export const rateDesigner = (designerId, data) => {
  return api.post(`/designer/${designerId}/rate`, data);
};