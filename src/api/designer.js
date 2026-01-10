import api from "./axios";

// Public
export const getAllDesigners = () => api.get("/designers");
export const getDesignerInfo = (id) => api.get(`/designer/${id}/info`);
export const hireDesigner = (id, data) => api.post(`/designer/${id}/hire`, data);

// Designer Dashboard
export const getDesignerBasic = (id) => api.get(`/designer/${id}/basic`);
export const updateDesignerAvailability = (id, availability) => api.patch(`/designer/${id}/availability`, { availability });
export const getWorkRequests = (id) => api.get(`/designer/${id}/work-requests`);
export const updateRequestStatus = (id, status) => api.patch(`/designer/work-request/${id}/status`, { status });

// Profile & Portfolio
export const setupDesignerProfile = (formData) => api.post("/designer/profile", formData, {
    headers: { "Content-Type": "multipart/form-data" }
});
export const getDesignerEditProfile = (id) => api.get(`/designer/${id}/edit-profile`);
export const updateDesignerEditProfile = (id, formData) => api.put(`/designer/${id}/edit-profile`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
});
export const getDesignerPortfolio = (id) => api.get(`/designer/${id}/portfolio`);
export const addPortfolioWork = (id, formData) => api.post(`/designer/${id}/work`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
});
export const deletePortfolioWork = (workId) => api.delete(`/designer/work/${workId}`);

// Ratings
export const rateDesigner = (id, data) => api.post(`/designer/${id}/rate`, data);
export const rateUser = (id, data) => api.post(`/designer/${id}/rate-user`, data);
export const getUserRatings = (userId) => api.get(`/client/${userId}/ratings`);