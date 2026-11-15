import { useEffect, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  X,
  Upload,
  RefreshCw,
  FolderPlus,
  Layers
} from "lucide-react";
import {
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadImage
} from "../../services/adminService";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialog State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    isActive: true
  });

  const [toast, setToast] = useState({ message: "", type: "" });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 4000);
  };

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await getAdminCategories();
      setCategories(res.categories || []);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to load categories", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      image: "",
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      image: cat.image || "",
      isActive: cat.isActive
    });
    setIsModalOpen(true);
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const res = await uploadImage(reader.result, "richu/categories");
        if (res.url) {
          setFormData((prev) => ({ ...prev, image: res.url }));
          showToast("Category banner uploaded to Cloudinary");
        }
      } catch (err) {
        showToast(err.response?.data?.message || "Image upload failed", "error");
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      showToast("Category name is required", "error");
      return;
    }

    setSubmitting(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory._id, formData);
        showToast(`Category "${formData.name}" updated successfully`);
      } else {
        await createCategory(formData);
        showToast(`New category "${formData.name}" created`);
      }
      setIsModalOpen(false);
      loadCategories();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save category", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Are you certain you wish to delete category "${cat.name}"?`)) {
      return;
    }
    try {
      await deleteCategory(cat._id);
      showToast(`Category "${cat.name}" deleted successfully`);
      loadCategories();
    } catch (err) {
      showToast(err.response?.data?.message || "Cannot delete category", "error");
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
            <span>Taxonomy &amp; Organization</span>
            <span>•</span>
            <span>Disciplines</span>
          </div>
          <h1 className="page-title">Category Management</h1>
          <p className="page-description">
            Define menswear disciplines, bespoke suiting hierarchies, banner images, and customer storefront navigation paths.
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn-primary-richu">
          <Plus size={16} />
          <span>+ New Category</span>
        </button>
      </div>

      {/* Categories Grid / Table */}
      <div className="admin-card">
        <div className="card-header-bar">
          <div>
            <h3 className="card-title">Disciplines &amp; Silhouettes ({categories.length})</h3>
            <p className="card-subtitle">All active and archived clothing classifications</p>
          </div>
          <button onClick={loadCategories} className="btn-secondary-richu" title="Refresh">
            <RefreshCw size={14} />
          </button>
        </div>

        <div className="table-responsive">
          <table className="richu-table">
            <thead>
              <tr>
                <th>Banner</th>
                <th>Category Name</th>
                <th>URL Slug</th>
                <th>Description</th>
                <th>Product Count</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "40px" }}>
                    <RefreshCw className="animate-spin" size={24} style={{ margin: "0 auto 8px" }} />
                    <span style={{ fontSize: "0.8125rem", color: "#6B7280" }}>Loading categories...</span>
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", color: "#6B7280", padding: "40px" }}>
                    No categories found. Click "+ New Category" to establish one.
                  </td>
                </tr>
              ) : (
                categories.map((c) => (
                  <tr key={c._id}>
                    <td>
                      {c.image ? (
                        <img
                          src={c.image}
                          alt={c.name}
                          style={{ width: "52px", height: "40px", objectFit: "cover", borderRadius: "4px", border: "1px solid #E2E8F0" }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "52px",
                            height: "40px",
                            backgroundColor: "#F1F5F9",
                            borderRadius: "4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#94A3B8"
                          }}
                        >
                          <FolderPlus size={18} />
                        </div>
                      )}
                    </td>

                    <td>
                      <div style={{ fontWeight: "700", color: "#0D1B2A" }}>{c.name}</div>
                    </td>

                    <td>
                      <span style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#64748B" }}>
                        /{c.slug}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontSize: "0.8125rem", color: "#475569", maxWidth: "300px", display: "inline-block" }}>
                        {c.description || "—"}
                      </span>
                    </td>

                    <td>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "2px 8px",
                          borderRadius: "9999px",
                          backgroundColor: "#F1F5F9",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          color: "#0F172A"
                        }}
                      >
                        <Layers size={12} /> {c.productCount || 0} Products
                      </span>
                    </td>

                    <td>
                      {c.isActive ? (
                        <span className="status-pill status-active">
                          <CheckCircle size={12} /> Active
                        </span>
                      ) : (
                        <span className="status-pill status-inactive">
                          <XCircle size={12} /> Inactive
                        </span>
                      )}
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "8px" }}>
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="btn-secondary-richu"
                          style={{ padding: "6px 10px" }}
                          title="Edit Category"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(c)}
                          className="btn-danger-richu"
                          style={{ padding: "6px 10px" }}
                          title="Delete Category"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialog for Category Create / Edit */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-center-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h3 className="drawer-title">
                {editingCategory ? `Edit Category: ${editingCategory.name}` : "Create New Category"}
              </h3>
              <button className="drawer-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
              <div className="form-group-richu">
                <label className="form-label-richu">Category Name *</label>
                <input
                  type="text"
                  required
                  className="form-input-richu"
                  placeholder="e.g. Bespoke Tuxedos, Sartorial Suiting"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group-richu">
                <label className="form-label-richu">Custom Slug (optional)</label>
                <input
                  type="text"
                  className="form-input-richu"
                  placeholder="Leave blank to auto-generate from name"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                />
              </div>

              <div className="form-group-richu">
                <label className="form-label-richu">Description</label>
                <textarea
                  rows="2"
                  className="form-textarea-richu"
                  placeholder="Briefly describe this clothing classification..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="form-group-richu">
                <label className="form-label-richu">Banner Image (Cloudinary)</label>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <label className="btn-secondary-richu" style={{ cursor: "pointer", display: "inline-flex" }}>
                    <Upload size={14} />
                    <span>{uploadingImage ? "Uploading..." : "Upload Image"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleImageFileChange}
                      disabled={uploadingImage}
                    />
                  </label>
                  {formData.image && (
                    <img
                      src={formData.image}
                      alt="Banner Preview"
                      style={{ width: "60px", height: "40px", objectFit: "cover", borderRadius: "4px", border: "1px solid #D4AF37" }}
                    />
                  )}
                </div>
              </div>

              <div className="form-group-richu" style={{ marginTop: "12px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.875rem" }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <span style={{ fontWeight: "600", color: "#0D1B2A" }}>Active in Navigation Menu</span>
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary-richu"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary-richu"
                >
                  {submitting ? "Saving..." : editingCategory ? "Save Changes" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
