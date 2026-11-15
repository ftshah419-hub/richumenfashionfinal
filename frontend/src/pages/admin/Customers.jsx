import { useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  Eye,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserX,
  X,
  ShoppingBag,
  Calendar,
  Phone,
  Mail
} from "lucide-react";
import {
  getAdminCustomers,
  getAdminCustomerById,
  updateCustomerStatus
} from "../../services/adminService";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Customer Profile & Order History Modal State
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const [toast, setToast] = useState({ message: "", type: "" });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 4000);
  };

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await getAdminCustomers({
        search,
        status: statusFilter,
        page,
        limit: 15
      });
      setCustomers(res.customers || []);
      setTotal(res.total || 0);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to load customers", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [search, statusFilter, page]);

  // View Customer History
  const handleViewCustomer = async (customerId) => {
    setDetailLoading(true);
    try {
      const res = await getAdminCustomerById(customerId);
      setSelectedCustomer(res.customer);
      setCustomerOrders(res.orders || []);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to fetch customer profile", "error");
    } finally {
      setDetailLoading(false);
    }
  };

  // Toggle or Update Account Status (ACTIVE / SUSPENDED)
  const handleToggleAccountStatus = async (customer) => {
    const nextStatus = customer.accountStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    if (
      !window.confirm(
        `Are you sure you want to change account status for ${customer.name} to ${nextStatus}?`
      )
    ) {
      return;
    }

    try {
      await updateCustomerStatus(customer._id, { accountStatus: nextStatus });
      showToast(`Account status for ${customer.name} updated to ${nextStatus}`);
      if (selectedCustomer && selectedCustomer._id === customer._id) {
        setSelectedCustomer((prev) => ({ ...prev, accountStatus: nextStatus }));
      }
      loadCustomers();
    } catch (err) {
      showToast(err.response?.data?.message || "Status change failed", "error");
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
            <span>VIP Patronage &amp; CRM</span>
            <span>•</span>
            <span>Clientèle</span>
          </div>
          <h1 className="page-title">Customer Management</h1>
          <p className="page-description">
            Monitor client account statuses, lifetime sartorial expenditures, delivery addresses, and commission histories.
          </p>
        </div>

        <button onClick={loadCustomers} className="btn-secondary-richu">
          <RefreshCw size={14} />
          <span>Refresh Clients</span>
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="filter-toolbar">
        <div className="search-input-wrap">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search by patron name, email address, or phone..."
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
            <option value="">All Account Statuses</option>
            <option value="ACTIVE">Active Patrons</option>
            <option value="SUSPENDED">Suspended Patrons</option>
            <option value="INACTIVE">Inactive Patrons</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="admin-card">
        <div className="card-header-bar">
          <div>
            <h3 className="card-title">Registered Patrons ({total} Clients)</h3>
            <p className="card-subtitle">Page {page} of {Math.ceil(total / 15) || 1}</p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="richu-table">
            <thead>
              <tr>
                <th>Patron Profile</th>
                <th>Contact</th>
                <th>Joined Date</th>
                <th>Total Orders</th>
                <th>Lifetime Spend</th>
                <th>Account Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "40px" }}>
                    <RefreshCw className="animate-spin" size={24} style={{ margin: "0 auto 8px" }} />
                    <span style={{ fontSize: "0.8125rem", color: "#6B7280" }}>Retrieving patron database...</span>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", color: "#6B7280", padding: "40px" }}>
                    No customer accounts match your search.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            backgroundColor: "#0D1B2A",
                            color: "#D4AF37",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "700",
                            fontSize: "0.8125rem"
                          }}
                        >
                          {c.name ? c.name.charAt(0).toUpperCase() : "P"}
                        </div>
                        <div>
                          <div style={{ fontWeight: "700", color: "#0D1B2A" }}>{c.name}</div>
                          <div style={{ fontSize: "0.75rem", color: "#64748B" }}>
                            {c.isEmailVerified ? (
                              <span style={{ color: "#15803D" }}>Verified Email</span>
                            ) : (
                              <span>Unverified</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ fontSize: "0.8125rem", color: "#334155" }}>
                        <div>{c.email}</div>
                        <div style={{ fontSize: "0.75rem", color: "#64748B" }}>{c.phone || "No phone registered"}</div>
                      </div>
                    </td>

                    <td>
                      <span style={{ fontSize: "0.8125rem", color: "#475569" }}>
                        {new Date(c.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
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
                          fontWeight: "600"
                        }}
                      >
                        <ShoppingBag size={12} /> {c.orderCount || 0}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontWeight: "700", color: "#D4AF37", fontSize: "0.9375rem" }}>
                        ₹{(c.totalSpent || 0).toLocaleString()}
                      </span>
                    </td>

                    <td>
                      {c.accountStatus === "ACTIVE" ? (
                        <span className="status-pill status-active">
                          <ShieldCheck size={12} /> Active
                        </span>
                      ) : (
                        <span className="status-pill status-suspended">
                          <ShieldAlert size={12} /> {c.accountStatus}
                        </span>
                      )}
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "8px" }}>
                        <button
                          onClick={() => handleViewCustomer(c._id)}
                          className="btn-secondary-richu"
                          style={{ padding: "6px 10px" }}
                          title="View Patron History"
                        >
                          <Eye size={14} />
                        </button>

                        <button
                          onClick={() => handleToggleAccountStatus(c)}
                          className={c.accountStatus === "ACTIVE" ? "btn-danger-richu" : "btn-secondary-richu"}
                          style={{ padding: "6px 10px" }}
                          title={c.accountStatus === "ACTIVE" ? "Suspend Account" : "Activate Account"}
                        >
                          {c.accountStatus === "ACTIVE" ? <UserX size={14} /> : <UserCheck size={14} />}
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

      {/* Customer Profile & Commission History Drawer */}
      {selectedCustomer && (
        <div className="modal-overlay" onClick={() => setSelectedCustomer(null)}>
          <div className="modal-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h2 className="drawer-title">Patron Dossier: {selectedCustomer.name}</h2>
              <button className="drawer-close-btn" onClick={() => setSelectedCustomer(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="drawer-body">
              {/* Profile Overview */}
              <div
                style={{
                  padding: "18px",
                  backgroundColor: "#F8F9FA",
                  borderRadius: "8px",
                  border: "1px solid #E2E8F0",
                  marginBottom: "20px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h3 style={{ margin: 0, color: "#0D1B2A", fontSize: "1.125rem", fontWeight: "700" }}>
                      {selectedCustomer.name}
                    </h3>
                    <div style={{ display: "flex", gap: "16px", marginTop: "8px", fontSize: "0.8125rem", color: "#475569" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Mail size={14} /> {selectedCustomer.email}
                      </span>
                      {selectedCustomer.phone && (
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Phone size={14} /> {selectedCustomer.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  <span
                    className={`status-pill ${
                      selectedCustomer.accountStatus === "ACTIVE" ? "status-active" : "status-suspended"
                    }`}
                  >
                    {selectedCustomer.accountStatus}
                  </span>
                </div>

                <div style={{ marginTop: "16px", borderTop: "1px solid #E2E8F0", paddingTop: "12px" }}>
                  <button
                    type="button"
                    onClick={() => handleToggleAccountStatus(selectedCustomer)}
                    className={selectedCustomer.accountStatus === "ACTIVE" ? "btn-danger-richu" : "btn-primary-richu"}
                    style={{ fontSize: "0.75rem", padding: "6px 12px" }}
                  >
                    {selectedCustomer.accountStatus === "ACTIVE" ? "Suspend Account Access" : "Reinstate Active Access"}
                  </button>
                </div>
              </div>

              {/* Saved Addresses */}
              <h4 style={{ fontFamily: "Montserrat, sans-serif", fontSize: "0.8125rem", textTransform: "uppercase", marginBottom: "10px" }}>
                Registered Delivery Addresses ({selectedCustomer.addresses?.length || 0})
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
                {selectedCustomer.addresses?.length === 0 ? (
                  <p style={{ fontSize: "0.8125rem", color: "#6B7280" }}>No saved addresses on file.</p>
                ) : (
                  selectedCustomer.addresses?.map((addr, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "10px 14px",
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E2E8F0",
                        borderRadius: "6px",
                        fontSize: "0.8125rem"
                      }}
                    >
                      <div style={{ fontWeight: "700", color: "#0D1B2A" }}>
                        {addr.fullName} <span style={{ color: "#64748B", fontWeight: "normal" }}>({addr.addressType})</span>
                      </div>
                      <div style={{ color: "#334155", marginTop: "2px" }}>
                        {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Commission History */}
              <h4 style={{ fontFamily: "Montserrat, sans-serif", fontSize: "0.8125rem", textTransform: "uppercase", marginBottom: "10px" }}>
                Order History ({customerOrders.length})
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {customerOrders.length === 0 ? (
                  <p style={{ fontSize: "0.8125rem", color: "#6B7280" }}>No past orders found for this patron.</p>
                ) : (
                  customerOrders.map((ord) => (
                    <div
                      key={ord._id}
                      style={{
                        padding: "12px 14px",
                        backgroundColor: "#F8F9FA",
                        border: "1px solid #E2E8F0",
                        borderRadius: "6px"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontFamily: "monospace", fontWeight: "700", color: "#0D1B2A" }}>
                          #{ord._id.toString().slice(-6).toUpperCase()}
                        </span>
                        <span className="status-pill status-placed">{ord.orderStatus}</span>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "0.8125rem" }}>
                        <span style={{ color: "#64748B" }}>
                          {new Date(ord.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })} • {ord.items?.length || 0} items
                        </span>
                        <span style={{ fontWeight: "700", color: "#D4AF37" }}>
                          ₹{(ord.totalAmount || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="drawer-footer">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="btn-secondary-richu"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
