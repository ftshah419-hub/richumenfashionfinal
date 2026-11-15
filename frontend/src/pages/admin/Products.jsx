import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  X,
  Upload,
  RefreshCw,
  Image as ImageIcon,
  Tag
} from "lucide-react";
import {
  getAdminProducts,
  getAdminCategories,
  createProduct,
  updateProduct,
  toggleProductStatus,
  deleteProduct,
  uploadImage
} from "../../services/adminService";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Drawer modal state (Add / Edit)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [drawerSubmitting, setDrawerSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    category: "",
    brand: "RICHU",
    price: "",
    isActive: true,
    images: [],
    variants: [{ size: "M", color: "Midnight Navy", sku: "", stock: 10, priceOverride: "" }]
  });

  const [toast, setToast] = useState({ message: "", type: "" });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 4000);
  };

  const loadCategories = async () => {
    try {
      const res = await getAdminCategories();
      setCategories(res.categories || []);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await getAdminProducts({
        search,
        category: selectedCategory,
        status: statusFilter,
        page,
        limit: 15
      });
      setProducts(res.products || []);
      setTotal(res.total || 0);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to fetch products", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [search, selectedCategory, statusFilter, page]);

  // Open drawer for adding a new product
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      category: categories[0]?._id || "",
      brand: "RICHU",
      price: "",
      isActive: true,
      images: [],
      variants: [{ size: "M", color: "Midnight Navy", sku: `RIC-${Date.now().toString().slice(-4)}-M`, stock: 10, priceOverride: "" }]
    });
    setIsDrawerOpen(true);
  };

  // Open drawer for editing an existing product
  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      slug: prod.slug,
      description: prod.description || "",
      category: prod.category?._id || prod.category || "",
      brand: prod.brand || "RICHU",
      price: prod.price,
      isActive: prod.isActive,
      images: prod.images || [],
      variants: prod.variants && prod.variants.length > 0
        ? prod.variants.map((v) => ({
            _id: v._id,
            size: v.size,
            color: v.color,
            sku: v.sku,
            stock: v.stock,
            priceOverride: v.priceOverride || ""
          }))
        : [{ size: "M", color: "Black", sku: `RIC-${prod._id.slice(-4)}-M`, stock: 10, priceOverride: "" }]
    });
    setIsDrawerOpen(true);
  };

  // Handle Cloudinary Image Upload
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const res = await uploadImage(reader.result, "richu/products");
        if (res.url) {
          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, res.url]
          }));
          showToast("Garment image uploaded to Cloudinary");
        }
      } catch (err) {
        showToast(err.response?.data?.message || "Image upload failed", "error");
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== indexToRemove)
    }));
  };

  // Variant Manager Helpers
  const handleAddVariant = () => {
    const nextSku = `RIC-${Date.now().toString().slice(-4)}-${formData.variants.length + 1}`;
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, { size: "L", color: "Navy", sku: nextSku, stock: 5, priceOverride: "" }]
    }));
  };

  const handleVariantChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.variants];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, variants: updated };
    });
  };

  const handleRemoveVariant = (index) => {
    if (formData.variants.length === 1) {
      showToast("At least one garment variant is required", "error");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  // Save / Update Handler
  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category) {
      showToast("Name, price, and category are mandatory", "error");
      return;
    }

    setDrawerSubmitting(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id, formData);
        showToast(`Product "${formData.name}" successfully updated`);
      } else {
        await createProduct(formData);
        showToast(`New creation "${formData.name}" added to atelier`);
      }
      setIsDrawerOpen(false);
      loadProducts();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save product", "error");
    } finally {
      setDrawerSubmitting(false);
    }
  };

  // Toggle Status Handler
  const handleToggleStatus = async (prod) => {
    try {
      await toggleProductStatus(prod._id, !prod.isActive);
      showToast(`Product is now ${!prod.isActive ? "Active" : "Archived"}`);
      loadProducts();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update status", "error");
    }
  };

  // Delete Handler
  const handleDeleteProduct = async (prod) => {
    if (!window.confirm(`Are you certain you wish to delete "${prod.name}"? This action is logged.`)) {
      return;
    }
    try {
      await deleteProduct(prod._id);
      showToast("Product deleted successfully");
      loadProducts();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete product", "error");
    }
  };

  return (
    <div>
      {/* Toast Alert */}
      {toast.message && (
        <div className={`admin-toast ${toast.type === "error" ? "toast-error" : "toast-success"}`}>
          <span>{toast.message}</span>
          <button onClick={() => setToast({ message: "", type: "" })} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="page-header-row">
        <div>
          <div className="page-eyebrow">
            <span>Sartorial Archive</span>
            <span>•</span>
            <span>Garment Catalog</span>
          </div>
          <h1 className="page-title">Product Management</h1>
          <p className="page-description">
            Curate bespoke garments, ready-to-wear collections, variant inventories, price overrides, and Cloudinary media assets.
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn-primary-richu">
          <Plus size={16} />
          <span>+ Add New Creation</span>
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="filter-toolbar">
        <div className="search-input-wrap">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search by name, slug, or variant SKU..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="filter-actions">
          <select
            className="select-richu"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            className="select-richu"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Archived / Inactive</option>
          </select>

          <button onClick={loadProducts} className="btn-secondary-richu" title="Refresh Products">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="admin-card">
        <div className="card-header-bar">
          <div>
            <h3 className="card-title">Archive Inventory ({total} items)</h3>
            <p className="card-subtitle">Page {page} of {Math.ceil(total / 15) || 1}</p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="richu-table">
            <thead>
              <tr>
                <th>Garment</th>
                <th>Category</th>
                <th>Base Price</th>
                <th>Variants / SKUs</th>
                <th>Total Stock</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "40px" }}>
                    <RefreshCw className="animate-spin" size={24} style={{ margin: "0 auto 8px" }} />
                    <span style={{ fontSize: "0.8125rem", color: "#6B7280" }}>Loading garment records...</span>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", color: "#6B7280", padding: "40px" }}>
                    No products matching your search or filters.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const totalStock = p.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
                  const thumb = p.images?.[0] || "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=150&q=80";

                  return (
                    <tr key={p._id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <img
                            src={thumb}
                            alt={p.name}
                            style={{ width: "44px", height: "54px", objectFit: "cover", borderRadius: "4px", border: "1px solid #E2E8F0" }}
                          />
                          <div>
                            <div style={{ fontWeight: "600", color: "#0D1B2A" }}>{p.name}</div>
                            <span style={{ fontSize: "0.75rem", color: "#64748B", fontFamily: "monospace" }}>
                              {p.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: "0.75rem", fontWeight: "600", textTransform: "uppercase", color: "#475569" }}>
                          {p.category?.name || "Unassigned"}
                        </span>
                      </td>

                      <td>
                        <span style={{ fontFamily: "Inter, sans-serif", fontWeight: "600", color: "#D4AF37", fontSize: "0.9375rem" }}>
                          ₹{(p.price || 0).toLocaleString()}
                        </span>
                      </td>

                      <td>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", maxWidth: "200px" }}>
                          {p.variants?.map((v) => (
                            <span
                              key={v.sku}
                              style={{
                                fontSize: "0.6875rem",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                backgroundColor: "#F1F5F9",
                                color: "#334155",
                                border: "1px solid #E2E8F0"
                              }}
                              title={`${v.color} - ${v.sku} (${v.stock} in stock)`}
                            >
                              {v.size} ({v.stock})
                            </span>
                          ))}
                        </div>
                      </td>

                      <td>
                        <span
                          style={{
                            fontWeight: "600",
                            color: totalStock === 0 ? "#BA1A1A" : totalStock <= 5 ? "#B45309" : "#15803D"
                          }}
                        >
                          {totalStock} units
                        </span>
                      </td>

                      <td>
                        <button
                          onClick={() => handleToggleStatus(p)}
                          style={{ background: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
                          title="Click to toggle activation"
                        >
                          {p.isActive ? (
                            <span className="status-pill status-active">
                              <CheckCircle size={12} /> Active
                            </span>
                          ) : (
                            <span className="status-pill status-inactive">
                              <XCircle size={12} /> Archived
                            </span>
                          )}
                        </button>
                      </td>

                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "8px" }}>
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="btn-secondary-richu"
                            style={{ padding: "6px 10px" }}
                            title="Edit Product"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p)}
                            className="btn-danger-richu"
                            style={{ padding: "6px 10px" }}
                            title="Delete Product"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-in Creation & Edit Drawer */}
      {isDrawerOpen && (
        <div className="modal-overlay" onClick={() => setIsDrawerOpen(false)}>
          <div className="modal-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h2 className="drawer-title">
                {editingProduct ? `Edit Garment: ${editingProduct.name}` : "Create Bespoke Garment"}
              </h2>
              <button className="drawer-close-btn" onClick={() => setIsDrawerOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitProduct} className="drawer-body">
              {/* Product Basic Info */}
              <div className="form-group-richu">
                <label className="form-label-richu">Product Title *</label>
                <input
                  type="text"
                  required
                  className="form-input-richu"
                  placeholder="e.g. Royal Oxford Bespoke Double-Breasted Suit"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group-richu">
                  <label className="form-label-richu">Category *</label>
                  <select
                    required
                    className="form-input-richu"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group-richu">
                  <label className="form-label-richu">Base Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    className="form-input-richu"
                    placeholder="e.g. 14999"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group-richu">
                <label className="form-label-richu">Product Narrative &amp; Craftsmanship Description</label>
                <textarea
                  rows="3"
                  className="form-textarea-richu"
                  placeholder="Detail the fabric provenance, thread count, silhouette cut, and styling notes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Cloudinary Image Assets */}
              <div className="form-group-richu">
                <label className="form-label-richu">Garment Imagery (Cloudinary)</label>
                <label className="image-upload-dropzone" style={{ display: "block" }}>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleImageFileChange}
                    disabled={uploadingImage}
                  />
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                    <Upload size={24} style={{ color: "#D4AF37" }} />
                    <span style={{ fontSize: "0.8125rem", color: "#334155", fontWeight: "600" }}>
                      {uploadingImage ? "Uploading to Cloudinary..." : "Click to Upload Garment Photo"}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "#64748B" }}>
                      JPG, PNG, WEBP automatically optimized and hosted
                    </span>
                  </div>
                </label>

                {/* Thumbnails preview */}
                {formData.images.length > 0 && (
                  <div className="image-thumbnails-grid">
                    {formData.images.map((url, idx) => (
                      <div key={idx} className="thumbnail-wrap">
                        <img src={url} alt={`Garment asset ${idx + 1}`} />
                        <button
                          type="button"
                          className="thumbnail-delete-btn"
                          onClick={() => handleRemoveImage(idx)}
                          title="Remove image"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Variants Matrix */}
              <div className="form-group-richu">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <label className="form-label-richu" style={{ margin: 0 }}>
                    Garment Variants (Size, Color, SKU &amp; Stock) *
                  </label>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="btn-secondary-richu"
                    style={{ padding: "4px 10px", fontSize: "0.7rem" }}
                  >
                    + Add Variant
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {formData.variants.map((v, i) => (
                    <div key={i} className="variant-row">
                      {/* Size */}
                      <select
                        className="select-richu"
                        style={{ padding: "6px 8px", fontSize: "0.75rem" }}
                        value={v.size}
                        onChange={(e) => handleVariantChange(i, "size", e.target.value)}
                      >
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="XXL">XXL</option>
                      </select>

                      {/* Color */}
                      <input
                        type="text"
                        placeholder="Color"
                        className="form-input-richu"
                        style={{ padding: "6px 8px", fontSize: "0.75rem" }}
                        value={v.color}
                        onChange={(e) => handleVariantChange(i, "color", e.target.value)}
                      />

                      {/* SKU */}
                      <input
                        type="text"
                        placeholder="Unique SKU"
                        className="form-input-richu"
                        style={{ padding: "6px 8px", fontSize: "0.75rem", fontFamily: "monospace" }}
                        value={v.sku}
                        onChange={(e) => handleVariantChange(i, "sku", e.target.value.toUpperCase())}
                      />

                      {/* Stock */}
                      <input
                        type="number"
                        min="0"
                        placeholder="Stock"
                        className="form-input-richu"
                        style={{ padding: "6px 8px", fontSize: "0.75rem" }}
                        value={v.stock}
                        onChange={(e) => handleVariantChange(i, "stock", e.target.value)}
                      />

                      {/* Price Override */}
                      <input
                        type="number"
                        min="0"
                        placeholder="Override ₹"
                        className="form-input-richu"
                        style={{ padding: "6px 8px", fontSize: "0.75rem" }}
                        value={v.priceOverride}
                        onChange={(e) => handleVariantChange(i, "priceOverride", e.target.value)}
                      />

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(i)}
                        style={{ background: "none", border: "none", color: "#BA1A1A", cursor: "pointer", padding: "4px" }}
                        title="Remove Variant"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status active switch */}
              <div className="form-group-richu" style={{ marginTop: "16px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.875rem" }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <span style={{ fontWeight: "600", color: "#0D1B2A" }}>Publish Garment to Atelier Showroom (Active)</span>
                </label>
              </div>

              <div className="drawer-footer">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="btn-secondary-richu"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={drawerSubmitting}
                  className="btn-primary-richu"
                >
                  {drawerSubmitting ? "Saving..." : editingProduct ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
