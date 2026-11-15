import api from "./api";

export const getProducts = async (params = {}) => {
  const response = await api.get("/products", { params });
  return response.data;
};

export const getFeaturedProducts = async (limit = 8) => {
  const response = await api.get("/products/featured", { params: { limit } });
  return response.data;
};

export const getNewArrivals = async (limit = 8) => {
  const response = await api.get("/products/new-arrivals", { params: { limit } });
  return response.data;
};

export const getProductDetails = async (identifier) => {
  const response = await api.get(`/products/${identifier}`);
  return response.data;
};

export const getProductByIdOrSlug = getProductDetails;

export const getCategories = async () => {
  const response = await api.get("/categories");
  return response.data;
};
