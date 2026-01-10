import api from "./axios";

export const placeOrder = (orderData) => api.post("/order/place", orderData);
export const getUserOrders = (email) => api.get(`/orders/user/${encodeURIComponent(email)}`);
export const getSellerOrders = (sellerId) => api.get(`/seller/${sellerId}/orders`);
export const getSellerDashboard = (sellerId) => api.get(`/seller/${sellerId}/dashboard`);
export const updateOrderStatus = (orderItemId, status) => api.patch(`/seller/order/${orderItemId}/status`, { status });
export const cancelOrder = (orderId) => api.patch(`/order/${orderId}/cancel`);