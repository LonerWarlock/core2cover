import api from "./axios";

/* =========================================
    INVENTORY & PRODUCTS
========================================= */

// Add a new product (POST /api/seller/product)
export const addSellerProduct = async (formData) => {
  try {
    const response = await api.post("/seller/product", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Add Product API Error:", error);
    throw error;
  }
};

// Update an existing product (PUT /api/seller/products/[id])
export const updateSellerProduct = (productId, formData) => {
  return api.put(`/product/${productId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};  

// Delete a product (DELETE /api/seller/products/[id])
export const deleteSellerProduct = (productId) => {
  return api.delete(`/product/${productId}`);
};


export const getSellerProducts = (sellerId) => {
  return api.get(`/seller/${sellerId}/products`);
};

// Matches: src/app/api/product/[id]/ratings/route.js
export const getProductRatings = (productId) => {
  return api.get(`/product/${productId}/ratings`);
};
/* =========================================
    ORDERS & DASHBOARD
========================================= */

// Fetch dashboard statistics
export const getSellerDashboard = (id) => {
  return api.get(`/seller/${id}/dashboard-stats`);
};

// Fetch all orders for a seller
export const getSellerOrders = (id) => {
  return api.get(`/seller/${id}/orders`);
};

// Update status of a specific order item
export const updateSellerOrderStatus = (orderItemId, status) => {
  return api.patch(`/seller/order-item/${orderItemId}/status`, { status });
};

/* =========================================
    PROFILE & BUSINESS DETAILS
========================================= */

// Fetch seller profile
export const getSellerProfile = (id) => {
  return api.get(`/seller/${id}/profile`);
};

// Update seller profile
export const updateSellerProfile = (id, data) => {
  return api.put(`/seller/${id}/profile`, data);
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

export const getSellerBusinessDetails = (id) => {
  return api.get(`/seller/${id}/business-details`);
};

export const updateSellerBusinessDetails = (id, data) => {
  // This matches the PUT route in the file above
  return api.put(`/seller/${id}/business-details`, data);
};

// Fetch onboarding progress status
export const getOnboardingStatus = (id) => {
  return api.get(`/seller/${id}/onboarding-status`);
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
export const getSellerBankDetails = (id) => {
  return api.get(`/seller/bank-details?sellerId=${id}`);
};

/* =========================================
    DELIVERY & LOGISTICS
========================================= */

// Save or Update delivery preferences
export const saveSellerDeliveryDetails = async (deliveryData) => {
  try {
    // Ensure we are sending JSON
    const response = await api.post("/seller/delivery-details", deliveryData);
    return response.data;
  } catch (error) {
    console.error("Logistics Update Error:", error);
    throw error;
  }
};

// Fetch delivery details
export const getSellerDeliveryDetails = (id) => {
  return api.get(`/seller/delivery-details?sellerId=${id}`);
};

// Fetch returns
export const getSellerReturns = (id) => {
  return api.get(`/seller/${id}/returns`);
};

// Updates status to APPROVED by seller
export const approveReturn = (returnId) => {
  return api.patch(`/returns/${returnId}/approve`);
};

// Updates status to REJECTED with a reason
export const rejectReturn = (returnId, reason) => {
  return api.patch(`/returns/${returnId}/reject`, { reason });
};

export const uploadSellerKYC = async (kycData) => {
  try {
    const response = await api.post("/seller/kyc", kycData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};