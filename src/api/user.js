import api from "./axios";

export const getUserByEmail = (email) => {
  return api.get(`/user/${encodeURIComponent(email)}`);
};

export const updateUserProfile = (email, data) => {
  return api.put(`/user/${encodeURIComponent(email)}`, data);
};