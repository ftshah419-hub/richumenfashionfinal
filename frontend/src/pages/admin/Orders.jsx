import { useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  Eye,
  CheckCircle,
  Truck,
  Package,
  XCircle,
  Clock,
  DollarSign,
  CreditCard,
  MapPin,
  X
} from "lucide-react";
import {
  getAdminOrders,
  getAdminOrderById,
  updateOrderStatus,
  updatePaymentStatus
} from "../../services/adminService";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [search, setSearch] = useState("");

  // Order Details Modal State
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statusTransitioning, setStatusTransitioning] = useState(false);
  const [statusNotes, setStatusNotes] = useState("");

  const [toast, setToast] = useState({ message: "", type: "" });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 4000);
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await getAdminOrders({
        status: statusFilter,
        paymentStatus: paymentFilter,
        search,
        page,
        limit: 15
      });
      setOrders(res.orders || []);
      setTotal(res.total || 0);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to fetch orders", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter, paymentFilter, search, page]);

  // Open Order Detail Drawer
  const handleViewOrder = async (orderId) => {
    setDetailLoading(true);
    try {
      const res = await getAdminOrderById(orderId);
      setSelectedOrderDetails(res);
      setStatusNotes("");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to fetch order details", "error");
    } finally {
      setDetailLoading(false);
    }
  };

  // Perform Status Transition
  const handleStatusChange = async (newStatus) => {
    if (!selectedOrderDetails?.order) return;
    const orderId = selectedOrderDetails.order._id;

    if (newStatus === "CANCELLED") {
      if (!window.confirm("Cancelling this order will automatically restore stock for all included items. Proceed?")) {
        return;
      }
    }

    setStatusTransitioning(true);
    try {
      await updateOrderStatus(orderId, {
        orderStatus: newStatus,
        notes: statusNotes || `Status updated to ${newStatus}`
      });
      showToast(`Order marked as ${newStatus}`);
      // Refresh details
      const refreshed = await getAdminOrderById(orderId);
      setSelectedOrderDetails(refreshed);
      loadOrders();
    } catch (err) {
      showToast(err.response?.data?.message || "Status transition failed", "error");
    } finally {
      setStatusTransitioning(false);
    }
  };

  // Perform Payment Status Transition
  const handlePaymentStatusChange = async (newPaymentStatus) => {
    if (!selectedOrderDetails?.order) return;
    const orderId = selectedOrderDetails.order._id;

    setStatusTransitioning(true);
    try {
      await updatePaymentStatus(orderId, { paymentStatus: newPaymentStatus });
      showToast(`Payment marked as ${newPaymentStatus}`);
      const refreshed = await getAdminOrderById(orderId);
      setSelectedOrderDetails(refreshed);
      loadOrders();
    } catch (err) {
      showToast(err.response?.data?.message || "Payment update failed", "error");
    } finally {
      setStatusTransitioning(false);
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
            <span>Client Commissions</span>
            <span>•</span>
            <span>Fulfillment Pipeline</span>
          </div>
          <h1 className="page-title">Order Management</h1>
          <p className="page-description">
            Inspect bespoke client commissions, verify payment collection, update dispatch statuses, and process cancellations.
          </p>
        </div>

        <button onClick={loadOrders} className="btn-secondary-richu">
          <RefreshCw size={14} />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="filter-toolbar">
        <div className="search-input-wrap">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search by client name, email, or order ID..."
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
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Fulfillment Statuses</option>
            <option value="PLACED">Placed</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            className="select-richu"
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Payment Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid (Razorpay)</option>
            <option value="COLLECTED">Collected (COD)</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="admin-card">
        <div className="card-header-bar">
          <div>
            <h3 className="card-title">Commissions Log ({total} Orders)</h3>
            <p className="card-subtitle">Page {page} of {Math.ceil(total / 15) || 1}</p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="richu-table">
            <thead>
              <tr>
                <th>Order Ref</th>
                <th>Client</th>
                <th>Date</th>
                <th>Payment</th>
                <th>Fulfillment Status</th>
                <th>Total Value</th>
                <th style={{ textAlign: "right" }}>Inspect</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "40px" }}>
                    <RefreshCw className="animate-spin" size={24} style={{ margin: "0 auto 8px" }} />
                    <span style={{ fontSize: "0.8125rem", color: "#6B7280" }}>Retrieving order pipeline...</span>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", color: "#6B7280", padding: "40px" }}>
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => {
                  const statusClass =
                    ord.orderStatus === "DELIVERED"
                      ? "status-delivered"
                      : ord.orderStatus === "CANCELLED"
                      ? "status-cancelled"
                      : ord.orderStatus === "SHIPPED"
                      ? "status-shipped"
                      : "status-placed";

                  const paymentClass =
                    ord.paymentStatus === "PAID" || ord.paymentStatus === "COLLECTED"
                      ? "status-paid"
                      : ord.paymentStatus === "FAILED"
                      ? "status-failed"
                      : "status-placed";

                  return (
                    <tr key={ord._id}>
                      <td>
                        <span style={{ fontFamily: "monospace", fontWeight: "700", color: "#0D1B2A" }}>
                          #{ord._id.toString().slice(-6).toUpperCase()}
                        </span>
                      </td>

                      <td>
                        <div>
                          <div style={{ fontWeight: "600", color: "#0D1B2A" }}>{ord.user?.name || "Guest Patron"}</div>
                          <div style={{ fontSize: "0.75rem", color: "#64748B" }}>{ord.user?.email || "—"}</div>
                        </div>
                      </td>

                      <td>
                        <span style={{ fontSize: "0.8125rem", color: "#475569" }}>
                          {new Date(ord.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </td>

                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span className={`status-pill ${paymentClass}`} style={{ width: "fit-content" }}>
                            {ord.paymentStatus}
                          </span>
                          <span style={{ fontSize: "0.7rem", color: "#64748B" }}>
                            Via {ord.paymentMethod}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span className={`status-pill ${statusClass}`}>{ord.orderStatus}</span>
                      </td>

                      <td>
                        <span style={{ fontWeight: "700", color: "#D4AF37", fontSize: "0.9375rem" }}>
                          ₹{(ord.totalAmount || 0).toLocaleString()}
                        </span>
                      </td>

                      <td style={{ textAlign: "right" }}>
                        <button
                          onClick={() => handleViewOrder(ord._id)}
                          className="btn-secondary-richu"
                          style={{ padding: "6px 12px", fontSize: "0.75rem" }}
                        >
                          <Eye size={14} />
                          <span>Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Drawer Modal */}
      {selectedOrderDetails && (
        <div className="modal-overlay" onClick={() => setSelectedOrderDetails(null)}>
          <div className="modal-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h2 className="drawer-title">
                Commission #{selectedOrderDetails.order._id.toString().slice(-6).toUpperCase()}
              </h2>
              <button className="drawer-close-btn" onClick={() => setSelectedOrderDetails(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="drawer-body">
              {/* Order Metadata Strip */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  padding: "16px",
                  backgroundColor: "#F8F9FA",
                  borderRadius: "8px",
                  marginBottom: "20px"
                }}
              >
                <div>
                  <span style={{ fontSize: "0.6875rem", textTransform: "uppercase", color: "#64748B", fontWeight: "700" }}>
                    Client
                  </span>
                  <div style={{ fontWeight: "700", color: "#0D1B2A", marginTop: "2px" }}>
                    {selectedOrderDetails.order.user?.name}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#475569" }}>
                    {selectedOrderDetails.order.user?.email}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: "0.6875rem", textTransform: "uppercase", color: "#64748B", fontWeight: "700" }}>
                    Placed On
                  </span>
                  <div style={{ fontSize: "0.875rem", color: "#0D1B2A", marginTop: "2px" }}>
                    {new Date(selectedOrderDetails.order.createdAt).toLocaleString()}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#D4AF37", fontWeight: "600" }}>
                    Payment: {selectedOrderDetails.order.paymentMethod} ({selectedOrderDetails.order.paymentStatus})
                  </div>
                </div>
              </div>

              {/* Status Action Controls */}
              <div className="admin-card" style={{ padding: "16px", marginBottom: "20px" }}>
                <span className="card-title" style={{ fontSize: "0.8125rem", display: "block", marginBottom: "8px" }}>
                  Workflow Transition Actions
                </span>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
                  {selectedOrderDetails.order.orderStatus === "PLACED" && (
                    <button
                      type="button"
                      disabled={statusTransitioning}
                      onClick={() => handleStatusChange("CONFIRMED")}
                      className="btn-primary-richu"
                      style={{ padding: "6px 14px", fontSize: "0.75rem" }}
                    >
                      <CheckCircle size={14} /> Confirm Commission
                    </button>
                  )}

                  {selectedOrderDetails.order.orderStatus === "CONFIRMED" && (
                    <button
                      type="button"
                      disabled={statusTransitioning}
                      onClick={() => handleStatusChange("PROCESSING")}
                      className="btn-primary-richu"
                      style={{ padding: "6px 14px", fontSize: "0.75rem" }}
                    >
                      <Package size={14} /> Send to Atelier Tailoring
                    </button>
                  )}

                  {selectedOrderDetails.order.orderStatus === "PROCESSING" && (
                    <button
                      type="button"
                      disabled={statusTransitioning}
                      onClick={() => handleStatusChange("SHIPPED")}
                      className="btn-primary-richu"
                      style={{ padding: "6px 14px", fontSize: "0.75rem" }}
                    >
                      <Truck size={14} /> Dispatch / Mark Shipped
                    </button>
                  )}

                  {selectedOrderDetails.order.orderStatus === "SHIPPED" && (
                    <button
                      type="button"
                      disabled={statusTransitioning}
                      onClick={() => handleStatusChange("OUT_FOR_DELIVERY")}
                      className="btn-primary-richu"
                      style={{ padding: "6px 14px", fontSize: "0.75rem" }}
                    >
                      <Truck size={14} /> Out For Delivery
                    </button>
                  )}

                  {selectedOrderDetails.order.orderStatus === "OUT_FOR_DELIVERY" && (
                    <button
                      type="button"
                      disabled={statusTransitioning}
                      onClick={() => handleStatusChange("DELIVERED")}
                      className="btn-primary-richu"
                      style={{ padding: "6px 14px", fontSize: "0.75rem" }}
                    >
                      <CheckCircle size={14} /> Mark Delivered
                    </button>
                  )}

                  {selectedOrderDetails.order.orderStatus !== "DELIVERED" &&
                    selectedOrderDetails.order.orderStatus !== "CANCELLED" && (
                      <button
                        type="button"
                        disabled={statusTransitioning}
                        onClick={() => handleStatusChange("CANCELLED")}
                        className="btn-danger-richu"
                        style={{ padding: "6px 14px" }}
                      >
                        <XCircle size={14} /> Cancel Commission &amp; Restock
                      </button>
                    )}
                </div>

                {/* For COD Orders, Mark as Collected */}
                {selectedOrderDetails.order.paymentMethod === "COD" &&
                  selectedOrderDetails.order.paymentStatus !== "COLLECTED" && (
                    <div style={{ marginTop: "10px", borderTop: "1px solid #E2E8F0", paddingTop: "10px" }}>
                      <button
                        type="button"
                        disabled={statusTransitioning}
                        onClick={() => handlePaymentStatusChange("COLLECTED")}
                        className="btn-secondary-richu"
                        style={{ padding: "6px 12px", fontSize: "0.75rem" }}
                      >
                        <DollarSign size={14} /> Mark COD Payment as Collected
                      </button>
                    </div>
                  )}
              </div>

              {/* Garment Line Items */}
              <h4 style={{ fontFamily: "Montserrat, sans-serif", fontSize: "0.875rem", textTransform: "uppercase", marginBottom: "10px" }}>
                Commission Line Items ({selectedOrderDetails.order.items?.length || 0})
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                {selectedOrderDetails.order.items?.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px 14px",
                      backgroundColor: "#F8F9FA",
                      borderRadius: "6px",
                      border: "1px solid #E2E8F0"
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: "700", color: "#0D1B2A" }}>{item.productName}</div>
                      <div style={{ fontSize: "0.75rem", color: "#64748B", marginTop: "2px" }}>
                        Size: <strong>{item.size || "Standard"}</strong> • Color: <strong>{item.color || "Standard"}</strong> • Qty: <strong>{item.quantity}</strong>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: "700", color: "#D4AF37" }}>
                        ₹{(item.totalPrice || item.unitPrice * item.quantity).toLocaleString()}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#94A3B8" }}>
                        ₹{item.unitPrice} each
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Shipping Address */}
              <div style={{ padding: "16px", backgroundColor: "#F8F9FA", borderRadius: "8px", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px", color: "#0D1B2A", fontWeight: "700", fontSize: "0.8125rem" }}>
                  <MapPin size={16} style={{ color: "#D4AF37" }} />
                  <span>Delivery Destination</span>
                </div>
                <div style={{ fontSize: "0.8125rem", color: "#334155", lineHeight: "1.5" }}>
                  <div>{selectedOrderDetails.order.shippingAddress?.fullName}</div>
                  <div>{selectedOrderDetails.order.shippingAddress?.street}</div>
                  <div>
                    {selectedOrderDetails.order.shippingAddress?.city}, {selectedOrderDetails.order.shippingAddress?.state} - {selectedOrderDetails.order.shippingAddress?.pincode}
                  </div>
                  <div>Phone: {selectedOrderDetails.order.shippingAddress?.phone}</div>
                </div>
              </div>

              {/* Order Cost Totals */}
              <div style={{ borderTop: "2px solid #E2E8F0", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", color: "#64748B" }}>
                  <span>Subtotal</span>
                  <span>₹{(selectedOrderDetails.order.subtotal || 0).toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", color: "#64748B" }}>
                  <span>Shipping &amp; Courier</span>
                  <span>₹{(selectedOrderDetails.order.shippingCharge || 0).toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.125rem", fontWeight: "700", color: "#0D1B2A", marginTop: "6px" }}>
                  <span>Total Amount</span>
                  <span style={{ color: "#D4AF37" }}>₹{(selectedOrderDetails.order.totalAmount || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="drawer-footer">
              <button
                type="button"
                onClick={() => setSelectedOrderDetails(null)}
                className="btn-secondary-richu"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
