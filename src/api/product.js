import api from "./axios";

export const getAllProducts = (type) => api.get(`/products${type ? `?type=${type}` : ""}`);
export const searchProducts = (query) => api.get(`/products/search?q=${query}`);
export const getProductById = (id) => api.get(`/product/${id}`);
export const getProductRatings = (id) => api.get(`/product/${id}/ratings`);
export const rateProduct = (orderItemId, data) => api.post(`/order/item/${orderItemId}/rate`, data);