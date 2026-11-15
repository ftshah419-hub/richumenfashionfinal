import api from "./api";

/* Dashboard */
export const getDashboardStats = async () => (await api.get("/admin/dashboard")).data;

/* Products */
export const getAdminProducts = async (params = {}) =>
  (await api.get("/admin/products", { params })).data;

export const getAdminProductById = async (id) =>
  (await api.get(`/admin/products/${id}`)).data;

export const createProduct = async (payload) =>
  (await api.post("/admin/products", payload)).data;

export const updateProduct = async (id, payload) =>
  (await api.put(`/admin/products/${id}`)).data;

export const toggleProductStatus = async (id, isActive) =>
  (await api.patch(`/admin/products/${id}/status`, { isActive })).data;

export const deleteProduct = async (id) =>
  (await api.delete(`/admin/products/${id}`)).data;

/* Categories */
export const getAdminCategories = async () =>
  (await api.get("/admin/categories")).data;

export const getAdminCategoryById = async (id) =>
  (await api.get(`/admin/categories/${id}`)).data;

export const createCategory = async (payload) =>
  (await api.post("/admin/categories", payload)).data;

export const updateCategory = async (id, payload) =>
  (await api.put(`/admin/categories/${id}`)).data;

export const deleteCategory = async (id) =>
  (await api.delete(`/admin/categories/${id}`)).data;

/* Inventory */
export const getAdminInventory = async (params = {}) =>
  (await api.get("/admin/inventory", { params })).data;

export const updateVariantStock = async (payload) =>
  (await api.patch("/admin/inventory/variant-stock", payload)).data;

/* Orders */
export const getAdminOrders = async (params = {}) =>
  (await api.get("/admin/orders", { params })).data;

export const getAdminOrderById = async (id) =>
  (await api.get(`/admin/orders/${id}`)).data;

export const updateOrderStatus = async (id, payload) =>
  (await api.patch(`/admin/orders/${id}/status`, payload)).data;

export const updatePaymentStatus = async (id, payload) =>
  (await api.patch(`/admin/orders/${id}/payment-status`, payload)).data;

/* Customers */
export const getAdminCustomers = async (params = {}) =>
  (await api.get("/admin/customers", { params })).data;

export const getAdminCustomerById = async (id) =>
  (await api.get(`/admin/customers/${id}`)).data;

export const updateCustomerStatus = async (id, payload) =>
  (await api.patch(`/admin/customers/${id}/status`, payload)).data;

/* Reviews */
export const getAdminReviews = async (params = {}) =>
  (await api.get("/admin/reviews", { params })).data;

export const deleteReview = async (id) =>
  (await api.delete(`/admin/reviews/${id}`)).data;

/* Audit Logs */
export const getAdminAuditLogs = async (params = {}) =>
  (await api.get("/admin/audit-logs", { params })).data;

/* Image Upload (Cloudinary) */
export const uploadImage = async (image, folder = "richu/admin") =>
  (await api.post("/admin/upload", { image, folder })).data;
