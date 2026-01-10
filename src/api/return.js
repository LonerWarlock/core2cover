import api from "./axios";

export const requestReturn = (formData, email) => api.post("/returns", formData, {
    headers: { 
        "Content-Type": "multipart/form-data",
        "x-user-email": email 
    }
});

export const getUserReturns = (email) => api.get("/returns/user", {
    headers: { "x-user-email": email }
});

export const getUserCredit = (email) => api.get("/returns/credit", {
    headers: { "x-user-email": email }
});

export const cancelReturn = (id, email) => api.patch(`/returns/${id}/cancel`, {}, {
    headers: { "x-user-email": email }
});

// Seller Side Returns
export const getSellerReturns = (email) => api.get("/returns/seller", {
    headers: { "x-seller-email": email }
});
export const approveReturn = (id, email) => api.post(`/returns/${id}/approve`, {}, {
    headers: { "x-seller-email": email }
});
export const rejectReturn = (id, email, note) => api.post(`/returns/${id}/reject`, { decisionNote: note }, {
    headers: { "x-seller-email": email }
});