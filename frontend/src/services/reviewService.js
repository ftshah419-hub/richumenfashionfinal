import api from "./api";

export const getProductReviews = async (productId) => {
  const response = await api.get(`/reviews/product/${productId}`);
  return response.data;
};

export const submitReview = async (payload) => {
  const response = await api.post("/reviews", payload);
  return response.data;
};
