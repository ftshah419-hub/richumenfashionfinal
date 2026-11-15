import api from "./api";

export const getProfile = async () => {
  const response = await api.get("/users/profile");
  return response.data;
};

export const updateProfile = async (payload) => {
  const response = await api.put("/users/profile", payload);
  return response.data;
};

export const getAddresses = async () => {
  const response = await api.get("/users/addresses");
  return response.data;
};

export const addAddress = async (payload) => {
  const response = await api.post("/users/addresses", payload);
  return response.data;
};

export const updateAddress = async (addressId, payload) => {
  const response = await api.put(`/users/addresses/${addressId}`, payload);
  return response.data;
};

export const deleteAddress = async (addressId) => {
  const response = await api.delete(`/users/addresses/${addressId}`);
  return response.data;
};

export const setDefaultAddress = async (addressId) => {
  const response = await api.patch(`/users/addresses/${addressId}/default`);
  return response.data;
};
