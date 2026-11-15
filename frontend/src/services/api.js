import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
  headers: { "Content-Type": "application/json" }
});

api.interceptors.request.use((config) => {
  const token =
    sessionStorage.getItem("richu_access_token") ||
    localStorage.getItem("richu_access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
