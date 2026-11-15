import api from "./api";

export const createRazorpayOrder = async (orderId) => {
  const response = await api.post("/payments/create-razorpay-order", { orderId });
  return response.data;
};

export const verifyPayment = async (payload) => {
  const response = await api.post("/payments/verify", payload);
  return response.data;
};

export const recordPaymentFailure = async (payload) => {
  const response = await api.post("/payments/failure", payload);
  return response.data;
};
