import api from "./axios";

export const sendContactMessage = async (formData) => {
  return await api.post("/contact", formData);
};