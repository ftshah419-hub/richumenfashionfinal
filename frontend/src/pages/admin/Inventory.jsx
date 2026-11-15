import { useEffect, useState } from "react";
import {
  Search,
  AlertTriangle,
  CheckCircle,
  Layers,
  Edit2,
  RefreshCw,
  X,
  Package,
  ArrowDownCircle,
  TrendingDown
} from "lucide-react";
import {
  getAdminInventory,
  updateVariantStock
} from "../../services/adminService";

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Quick Adjustment Modal State
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [newStockValue, setNewStockValue] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const [toast, setToast] = useState({ message: "", type: "" });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 4000);
  };

  const loadInventory = async () => {
    setLoading(true);
    try {
      const res = await getAdminInventory({
        search,
        lowStockOnly,
        page,
        limit: 25
      });
      setItems(res.items || []);
      setSummary(res.summary || null);
      setTotal(res.total || 0);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to load inventory data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [search, lowStockOnly, page]);

  const handleOpenAdjust = (item) => {
    setSelectedVariant(item);
    setNewStockValue(item.stock);
    setAdjustmentReason("Restock shipment received");
  };

  const handleSaveStock = async (e) => {
    e.preventDefault();
    if (newStockValue === "" || parseInt(newStockValue, 10) < 0) {
      showToast("Stock quantity must be a non-negative number", "error");
      return;
    }

    setIsUpdating(true);
    try {
      await updateVariantStock({
        productId: selectedVariant.productId,
        variantId: selectedVariant.variantId,
        newStock: parseInt(newStockValue, 10),
        reason: adjustmentReason
      });
      showToast(`SKU ${selectedVariant.sku} stock updated to ${newStockValue}`);
      setSelectedVariant(null);
      loadInventory();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to adjust stock", "error");
    } finally {
      setIsUpdating(false);
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
            <span>Atelier Vault &amp; Logistics</span>
            <span>•</span>
            <span>Traceability</span>
          </div>
          <h1 className="page-title">Inventory Management</h1>
          <p className="page-description">
            Variant-level SKU tracking, real-time mill replenishment, low-stock threshold surveillance, and audited stock adjustments.
          </p>
        </div>

        <button onClick={loadInventory} className="btn-secondary-richu">
          <RefreshCw size={14} />
          <span>Refresh Stock</span>
        </button>
      </div>

      {/* Inventory KPI Summary Bar */}
      <div className="kpi-grid" style={{ marginBottom: "20px" }}>
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Total Active Units</span>
            <div className="kpi-icon-wrap">
              <Package size={18} />
            </div>
          </div>
          <div>
            <div className="kpi-value">{(summary?.totalStockUnits || 0).toLocaleString()}</div>
            <div className="kpi-subtext">Across {summary?.totalVariants || 0} distinct variant SKUs</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Low Stock Variants (&le; 5)</span>
            <div className="kpi-icon-wrap" style={{ color: "#D97706" }}>
              <TrendingDown size={18} />
            </div>
          </div>
          <div>
            <div className="kpi-value" style={{ color: summary?.lowStockVariants > 0 ? "#D97706" : "#0D1B2A" }}>
              {summary?.lowStockVariants || 0}
            </div>
            <div className="kpi-subtext">Requires procurement order</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Out of Stock Variants</span>
            <div className="kpi-icon-wrap" style={{ color: "#BA1A1A" }}>
              <ArrowDownCircle size={18} />
            </div>
          </div>
          <div>
            <div className="kpi-value" style={{ color: summary?.outOfStockVariants > 0 ? "#BA1A1A" : "#0D1B2A" }}>
              {summary?.outOfStockVariants || 0}
            </div>
            <div className="kpi-subtext">Zero inventory remaining</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Vault Health</span>
            <div className="kpi-icon-wrap" style={{ color: "#15803D" }}>
              <CheckCircle size={18} />
            </div>
          </div>
          <div>
            <div className="kpi-value" style={{ color: "#15803D" }}>
              {summary?.totalVariants
                ? Math.round(
                    ((summary.totalVariants - (summary.lowStockVariants + summary.outOfStockVariants)) /
                      summary.totalVariants) *
                      100
                  )
                : 100}
              %
            </div>
            <div className="kpi-subtext">Optimal availability ratio</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="filter-toolbar">
        <div className="search-input-wrap">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search by garment name or variant SKU..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="filter-actions">
          <button
            type="button"
            className={lowStockOnly ? "btn-primary-richu" : "btn-secondary-richu"}
            onClick={() => {
              setLowStockOnly(!lowStockOnly);
              setPage(1);
            }}
          >
            <AlertTriangle size={14} />
            <span>{lowStockOnly ? "Showing Low Stock Only" : "Filter Low Stock"}</span>
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="admin-card">
        <div className="card-header-bar">
          <div>
            <h3 className="card-title">Variant Stock Ledger ({total} Records)</h3>
            <p className="card-subtitle">Page {page} of {Math.ceil(total / 25) || 1}</p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="richu-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product Silhouette</th>
                <th>Category</th>
                <th>Size</th>
                <th>Color</th>
                <th>Price</th>
                <th>Stock Level</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Stock Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", padding: "40px" }}>
                    <RefreshCw className="animate-spin" size={24} style={{ margin: "0 auto 8px" }} />
                    <span style={{ fontSize: "0.8125rem", color: "#6B7280" }}>Auditing vault stocks...</span>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", color: "#6B7280", padding: "40px" }}>
                    No inventory items match the current criteria.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={`${item.productId}-${item.variantId}`}>
                    <td>
                      <span style={{ fontFamily: "monospace", fontWeight: "700", color: "#0D1B2A", fontSize: "0.8125rem" }}>
                        {item.sku}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontWeight: "600", color: "#0D1B2A" }}>{item.productName}</div>
                    </td>

                    <td>
                      <span style={{ fontSize: "0.75rem", color: "#475569", textTransform: "uppercase" }}>
                        {item.categoryName}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontWeight: "700", padding: "2px 8px", backgroundColor: "#F1F5F9", borderRadius: "4px" }}>
                        {item.size}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontSize: "0.8125rem", color: "#334155" }}>{item.color}</span>
                    </td>

                    <td>
                      <span style={{ fontWeight: "600", color: "#D4AF37" }}>
                        ₹{(item.price || 0).toLocaleString()}
                      </span>
                    </td>

                    <td>
                      <span
                        style={{
                          fontWeight: "700",
                          fontSize: "0.9375rem",
                          color: item.isOutOfStock ? "#BA1A1A" : item.isLowStock ? "#D97706" : "#15803D"
                        }}
                      >
                        {item.stock}
                      </span>
                    </td>

                    <td>
                      {item.isOutOfStock ? (
                        <span className="status-pill status-inactive">
                          <AlertTriangle size={12} /> Out of Stock
                        </span>
                      ) : item.isLowStock ? (
                        <span className="status-pill status-placed">
                          <AlertTriangle size={12} /> Low Stock (&le;5)
                        </span>
                      ) : (
                        <span className="status-pill status-active">
                          <CheckCircle size={12} /> In Stock
                        </span>
                      )}
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <button
                        onClick={() => handleOpenAdjust(item)}
                        className="btn-secondary-richu"
                        style={{ padding: "6px 12px", fontSize: "0.75rem" }}
                      >
                        <Edit2 size={12} />
                        <span>Adjust</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal Dialog */}
      {selectedVariant && (
        <div className="modal-overlay" onClick={() => setSelectedVariant(null)}>
          <div className="modal-center-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h3 className="drawer-title">Adjust Stock: {selectedVariant.sku}</h3>
              <button className="drawer-close-btn" onClick={() => setSelectedVariant(null)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveStock} style={{ padding: "24px" }}>
              <div style={{ marginBottom: "16px", padding: "12px", backgroundColor: "#F8F9FA", borderRadius: "6px" }}>
                <div style={{ fontWeight: "600", color: "#0D1B2A" }}>{selectedVariant.productName}</div>
                <div style={{ fontSize: "0.75rem", color: "#64748B", marginTop: "4px" }}>
                  Size: <strong>{selectedVariant.size}</strong> • Color: <strong>{selectedVariant.color}</strong> • Current Stock: <strong>{selectedVariant.stock} units</strong>
                </div>
              </div>

              <div className="form-group-richu">
                <label className="form-label-richu">New Available Units *</label>
                <input
                  type="number"
                  min="0"
                  required
                  className="form-input-richu"
                  value={newStockValue}
                  onChange={(e) => setNewStockValue(e.target.value)}
                />
                <span className="form-help">Enter the exact physical units verified in the atelier vault.</span>
              </div>

              <div className="form-group-richu">
                <label className="form-label-richu">Adjustment Reason *</label>
                <input
                  type="text"
                  required
                  className="form-input-richu"
                  placeholder="e.g. Mill shipment, damaged roll, inventory reconciliation"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                <button
                  type="button"
                  onClick={() => setSelectedVariant(null)}
                  className="btn-secondary-richu"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="btn-primary-richu"
                >
                  {isUpdating ? "Saving..." : "Confirm Stock Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
