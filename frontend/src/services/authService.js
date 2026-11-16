import api from "./api";

export const register = async (payload) => (await api.post("/auth/register", payload)).data;
export const login = async (payload) => (await api.post("/auth/login", payload)).data;
export const adminLogin = async (payload) => (await api.post("/auth/admin/login", payload)).data;
export const getMe = async () => (await api.get("/auth/me")).data;
export const logout = async () => (await api.post("/auth/logout")).data;
export const changePassword = async (payload) => (await api.put("/auth/change-password", payload)).data;
