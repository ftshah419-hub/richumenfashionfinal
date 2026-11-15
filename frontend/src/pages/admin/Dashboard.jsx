import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  DollarSign,
  ShoppingBag,
  Shirt,
  Users,
  AlertTriangle,
  Clock,
  TrendingUp,
  ArrowUpRight,
  PlusCircle,
  Eye,
  RefreshCw
} from "lucide-react";
import { getDashboardStats } from "../../services/adminService";

export default function Dashboard() {
  const { adminUser } = useOutletContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStats = () => {
    setLoading(true);
    getDashboardStats()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load dashboard metrics");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "60px 0", textAlign: "center", color: "#6B7280" }}>
        <RefreshCw className="animate-spin" size={28} style={{ margin: "0 auto 12px" }} />
        <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "0.875rem", textTransform: "uppercase" }}>
          Aggregating Atelier Performance Data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-toast toast-error">
        <span>{error}</span>
        <button onClick={loadStats} className="btn-secondary-richu" style={{ padding: "4px 10px" }}>
          Retry
        </button>
      </div>
    );
  }

  const { metrics, recentOrders = [], monthlySales = [], recentLogs = [] } = data || {};

  return (
    <div>
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <div className="page-eyebrow">
            <span>Executive Atelier Brief</span>
            <span>•</span>
            <span>FY2025 Cycle</span>
          </div>
          <h1 className="page-title">Executive Command Center</h1>
          <p className="page-description">
            Welcome back, {adminUser?.name || "Administrator"}. Comprehensive real-time monitoring of commissions, sartorial inventory, client metrics, and atelier activities.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={loadStats} className="btn-secondary-richu" title="Refresh metrics">
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
          <Link to="/admin/products" className="btn-primary-richu" style={{ textDecoration: "none" }}>
            <PlusCircle size={16} />
            <span>Add Garment</span>
          </Link>
        </div>
      </div>

      {/* 4 Primary KPI Counters */}
      <div className="kpi-grid">
        {/* Total Revenue */}
        <div className="kpi-card kpi-featured">
          <div className="kpi-header">
            <span className="kpi-title">Gross Revenue</span>
            <div className="kpi-icon-wrap">
              <DollarSign size={20} />
            </div>
          </div>
          <div>
            <div className="kpi-value">₹{(metrics?.totalRevenue || 0).toLocaleString()}</div>
            <div className="kpi-subtext">
              <span className="kpi-pill">
                <TrendingUp size={12} /> Live
              </span>
              <span>Paid &amp; Collected funds</span>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Commissions &amp; Orders</span>
            <div className="kpi-icon-wrap">
              <ShoppingBag size={20} />
            </div>
          </div>
          <div>
            <div className="kpi-value">{metrics?.totalOrders || 0}</div>
            <div className="kpi-subtext">
              <span style={{ color: "#D4AF37", fontWeight: "600" }}>{metrics?.pendingOrders || 0} Pending</span>
              <span>dispatch or processing</span>
            </div>
          </div>
        </div>

        {/* Total Products */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Garment Archive</span>
            <div className="kpi-icon-wrap">
              <Shirt size={20} />
            </div>
          </div>
          <div>
            <div className="kpi-value">{metrics?.totalProducts || 0}</div>
            <div className="kpi-subtext">
              <span>{metrics?.lowStockProducts || 0} Items</span>
              <span style={{ color: metrics?.lowStockProducts > 0 ? "#BA1A1A" : "#15803D" }}>
                {metrics?.lowStockProducts > 0 ? "require restock" : "healthy stock"}
              </span>
            </div>
          </div>
        </div>

        {/* VIP Patrons */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">VIP Clientèle</span>
            <div className="kpi-icon-wrap">
              <Users size={20} />
            </div>
          </div>
          <div>
            <div className="kpi-value">{metrics?.totalCustomers || 0}</div>
            <div className="kpi-subtext">
              <span className="kpi-pill">Registered</span>
              <span>Active buyer profiles</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Status & Low Stock Banner */}
      {metrics?.lowStockProducts > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            backgroundColor: "#FFFBEB",
            border: "1px solid #FDE68A",
            borderRadius: "8px",
            marginBottom: "24px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <AlertTriangle style={{ color: "#D97706" }} size={20} />
            <span style={{ fontSize: "0.875rem", color: "#92400E", fontWeight: "500" }}>
              <strong>Low Inventory Notice:</strong> {metrics.lowStockProducts} garment variant(s) have fallen below the 5-unit threshold.
            </span>
          </div>
          <Link
            to="/admin/inventory"
            className="btn-secondary-richu"
            style={{ textDecoration: "none", padding: "6px 14px", fontSize: "0.75rem" }}
          >
            Review Inventory
          </Link>
        </div>
      )}

      {/* Main Grid: Recent Orders & Atelier Activity Log */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "24px" }}>
        {/* Recent Orders Section */}
        <div className="admin-card">
          <div className="card-header-bar">
            <div>
              <h3 className="card-title">Recent Commissions</h3>
              <p className="card-subtitle">Latest customer purchases awaiting or under processing</p>
            </div>
            <Link to="/admin/orders" className="btn-secondary-richu" style={{ textDecoration: "none", padding: "6px 12px", fontSize: "0.75rem" }}>
              <span>View All</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="table-responsive">
            <table className="richu-table">
              <thead>
                <tr>
                  <th>Order Reference</th>
                  <th>Client</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", color: "#6B7280", padding: "28px" }}>
                      No customer orders recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((ord) => {
                    const statusClass =
                      ord.orderStatus === "DELIVERED"
                        ? "status-delivered"
                        : ord.orderStatus === "CANCELLED"
                        ? "status-cancelled"
                        : ord.orderStatus === "SHIPPED"
                        ? "status-shipped"
                        : "status-placed";

                    return (
                      <tr key={ord._id}>
                        <td>
                          <span style={{ fontFamily: "monospace", fontWeight: "600", color: "#0D1B2A" }}>
                            #{ord._id.toString().slice(-6).toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <div>
                            <div style={{ fontWeight: "600", fontSize: "0.8125rem" }}>{ord.user?.name || "Guest Client"}</div>
                            <div style={{ fontSize: "0.75rem", color: "#6B7280" }}>{ord.user?.email || "—"}</div>
                          </div>
                        </td>
                        <td>{ord.items?.length || 0}</td>
                        <td style={{ fontWeight: "600", color: "#D4AF37" }}>
                          ₹{(ord.totalAmount || 0).toLocaleString()}
                        </td>
                        <td>
                          <span className={`status-pill ${statusClass}`}>{ord.orderStatus}</span>
                        </td>
                        <td>
                          <Link
                            to={`/admin/orders`}
                            className="btn-secondary-richu"
                            style={{ textDecoration: "none", padding: "4px 8px" }}
                            title="Inspect order"
                          >
                            <Eye size={14} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Audit Logs Section */}
        <div className="admin-card">
          <div className="card-header-bar">
            <div>
              <h3 className="card-title">Governance &amp; Audit Trail</h3>
              <p className="card-subtitle">Immutable log of product, inventory, and order operations</p>
            </div>
            <Link to="/admin/audit-logs" className="btn-secondary-richu" style={{ textDecoration: "none", padding: "6px 12px", fontSize: "0.75rem" }}>
              <span>Log Archive</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div style={{ padding: "16px 20px" }}>
            {recentLogs.length === 0 ? (
              <p style={{ color: "#6B7280", textAlign: "center", padding: "20px 0" }}>
                No administrative actions logged yet.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {recentLogs.map((log) => (
                  <div
                    key={log._id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                      padding: "10px 14px",
                      backgroundColor: "#F8F9FC",
                      borderRadius: "6px",
                      border: "1px solid #E2E8F0"
                    }}
                  >
                    <div
                      style={{
                        padding: "6px",
                        borderRadius: "4px",
                        backgroundColor: "#0D1B2A",
                        color: "#D4AF37",
                        marginTop: "2px"
                      }}
                    >
                      <Clock size={14} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span
                          style={{
                            fontFamily: "Montserrat, sans-serif",
                            fontSize: "0.6875rem",
                            fontWeight: "700",
                            color: "#0D1B2A",
                            letterSpacing: "0.06em"
                          }}
                        >
                          {log.action}
                        </span>
                        <span style={{ fontSize: "0.7rem", color: "#94A3B8" }}>
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p style={{ margin: "4px 0 2px", fontSize: "0.8125rem", color: "#334155" }}>
                        {log.details || `Admin performed ${log.action} on ${log.targetType}`}
                      </p>
                      <span style={{ fontSize: "0.7rem", color: "#64748B" }}>
                        By {log.admin?.name || "Administrator"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
