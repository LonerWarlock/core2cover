import api from "./axios";

/* =========================================
   INVENTORY & PRODUCTS
========================================= */

// Add a new product with images/video
export const addSellerProduct = async (formData) => {
  try {
    const response = await api.post("/seller/product", formData, {
      headers: { "Content-Type": "multipart/form-to-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Add Product API Error:", error);
    throw error;
  }
};

// Update an existing product
export const updateSellerProduct = (productId, formData) => {
  return api.put(`/seller/product/${productId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Delete a product
export const deleteSellerProduct = (productId) => {
  return api.delete(`/seller/product/${productId}`);
};

// Fetch all products for a specific seller
export const getSellerProducts = (sellerId) => {
  return api.get(`/seller/${sellerId}/products`);
};

// Fetch ratings and reviews for a product
export const getProductRatings = (productId) => {
  return api.get(`/product/${productId}/ratings`);
};

/* =========================================
   ORDERS & DASHBOARD
========================================= */

// Fetch dashboard statistics
export const getSellerDashboard = async (sellerId) => {
  return await api.get(`/seller/${sellerId}/dashboard-stats`);
};

// Fetch all orders for a seller
export const getSellerOrders = async (sellerId) => {
  return await api.get(`/seller/${sellerId}/orders`);
};

// Update status of a specific order item
export const updateSellerOrderStatus = async (orderItemId, status) => {
  return await api.patch(`/seller/order-item/${orderItemId}/status`, { status });
};

/* =========================================
   PROFILE & BUSINESS DETAILS
========================================= */

// Fetch seller profile
export const getSellerProfile = (id) => {
  return api.get(`/seller/profile/${id}`);
};

// Update seller profile
export const updateSellerProfile = (id, data) => {
  return api.put(`/seller/profile/${id}`, data);
};

// Onboarding: Create business details
export const createSellerBusinessDetails = async (businessData) => {
  try {
    const response = await api.post("/seller/business-details", businessData);
    return response.data;
  } catch (error) {
    console.error("Error creating business details:", error);
    throw error;
  }
};

// Fetch business details
export const getSellerBusinessDetails = (sellerId) => {
    return api.get(`/seller/${sellerId}/business-details`);
};

// Update business details
export const updateSellerBusinessDetails = (sellerId, data) => {
    return api.put(`/seller/${sellerId}/business-details`, data);
};

// Fetch onboarding progress status
export const getOnboardingStatus = (sellerId) => {
  return api.get(`/seller/${sellerId}/onboarding-status`);
};

/* =========================================
   BANK & PAYOUT DETAILS
========================================= */

// Save bank details
export const saveSellerBankDetails = async (bankData) => {
  const response = await api.post("/seller/bank-details", bankData);
  return response.data;
};

// Fetch bank details
export const getSellerBankDetails = async (sellerId) => {
  const response = await api.get(`/seller/${sellerId}/bank-details`);
  return response.data;
};

/* =========================================
   DELIVERY & LOGISTICS
========================================= */

// Save or Update delivery preferences
export const saveSellerDeliveryDetails = async (deliveryData) => {
  try {
    const response = await api.post("/seller/delivery-details", deliveryData);
    return response.data;
  } catch (error) {
    console.error("Logistics Update Error:", error);
    throw error;
  }
};

// Fetch delivery details
export const getSellerDeliveryDetails = (sellerId) => {
  return api.get(`/seller/${sellerId}/delivery-details`);
};

export const getSellerReturns = (sellerId) => {
  return api.get(`/seller/${sellerId}/returns`);
};

/**
 * Updates status to APPROVED by seller
 */
export const approveReturn = (returnId) => {
  return api.patch(`/return/${returnId}/approve`);
};

/**
 * Updates status to REJECTED with a reason
 */
export const rejectReturn = (returnId, reason) => {
  return api.patch(`/return/${returnId}/reject`, { reason });
};