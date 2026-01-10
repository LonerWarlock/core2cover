import api from "./axios";

// Inventory
export const addProduct = (formData) => api.post("/seller/product", formData, {
    headers: { "Content-Type": "multipart/form-data" }
});
export const updateProduct = (id, formData) => api.put(`/seller/product/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
});
export const deleteProduct = (id) => api.delete(`/seller/product/${id}`);
export const getSellerProducts = (sellerId) => api.get(`/seller/${sellerId}/products`);

// Profile & Business
export const getSellerProfile = (id) => api.get(`/seller/profile/${id}`);
export const updateSellerProfile = (id, data) => api.put(`/seller/profile/${id}`, data);
export const getBusinessDetails = (sellerId) => api.get(`/seller/${sellerId}/business-details`);
export const updateBusinessDetails = (sellerId, data) => api.put(`/seller/${sellerId}/business-details`, data);
export const getBankDetails = (sellerId) => api.get(`/seller/${sellerId}/bank-details`);
export const saveBankDetails = (data) => api.post("/seller/bank-details", data);
export const getOnboardingStatus = (sellerId) => api.get(`/seller/${sellerId}/onboarding-status`);

// Delivery
export const saveDeliveryDetails = (data) => api.post("/seller/delivery-details", data);
export const getDeliveryDetails = (sellerId) => api.get(`/seller/${sellerId}/delivery-details`);