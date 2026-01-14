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

export const saveDesignerPortfolio = async (portfolioData) => {
  const response = await axios.post("/api/designer/portfolio", portfolioData);
  return response.data;
};

export const saveDesignerProfile = async (profileData) => {
  // Replace the URL with your actual backend endpoint
  const response = await axios.post("/api/designer/profile-setup", profileData);
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
export const updateDesignerAvailability = async (designerId, status) => {
  // Use the correct endpoint for your backend
  const response = await axios.patch(`/api/designer/${designerId}/availability`, { 
    availability: status 
  });
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
  const response = await axios.get(`/api/designer/profile/${designerId}`);
  return response.data;
};

export const updateDesignerEditProfile = async (designerId, profileData) => {
  const response = await axios.put(`/api/designer/profile/${designerId}`, profileData);
  return response.data;
};

export const getDesignerWorkRequests = async (designerId) => {
  const response = await axios.get(`/api/designer/${designerId}/w ork-requests`);
  return response.data;
};

export const rateUser = async (ratingData) => {
  const response = await axios.post("/api/designer/rate-user", ratingData);
  return response.data;
};

//  FIX: Add rateDesigner
export const rateDesigner = (designerId, data) => {
  return api.post(`/designer/${designerId}/rate`, data);
};