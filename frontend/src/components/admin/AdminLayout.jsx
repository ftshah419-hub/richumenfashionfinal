import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Shirt,
  Tags,
  Layers,
  ShoppingBag,
  Users,
  Star,
  FileText,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Diamond,
  ShieldCheck
} from "lucide-react";
import { getMe } from "../../services/authService";
import "../../styles/admin.css";

export default function AdminLayout() {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    getMe()
      .then((res) => {
        if (!res.user || res.user.role !== "admin") {
          setAuthError("Administrator access privileges required.");
          setLoading(false);
          return;
        }
        setAdminUser(res.user);
        setLoading(false);
      })
      .catch(() => {
        setAuthError("Please log in with an administrator account.");
        setLoading(false);
        navigate("/login");
      });
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("richu_access_token");
    navigate("/login");
  };

  // Derive current breadcrumb title
  const getBreadcrumbTitle = () => {
    const path = location.pathname;
    if (path === "/admin" || path === "/admin/") return "Overview Dashboard";
    if (path.startsWith("/admin/products")) return "Product Archive";
    if (path.startsWith("/admin/categories")) return "Categories & Disciplines";
    if (path.startsWith("/admin/inventory")) return "Inventory & Stock Levels";
    if (path.startsWith("/admin/orders")) return "Orders & Client Commissions";
    if (path.startsWith("/admin/customers")) return "Clientèle & VIP Patrons";
    if (path.startsWith("/admin/reviews")) return "Review Moderation";
    if (path.startsWith("/admin/audit-logs")) return "Atelier Activity Logs";
    return "Administration";
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#08111B", color: "#D4AF37", fontFamily: "Montserrat, sans-serif", letterSpacing: "0.1em" }}>
        <Diamond className="brand-icon animate-pulse" size={32} />
        <span style={{ marginLeft: "12px", textTransform: "uppercase", fontSize: "0.875rem" }}>Verifying Atelier Credentials...</span>
      </div>
    );
  }

  if (authError) {
    return (
      <div style={{ padding: "40px", maxWidth: "500px", margin: "60px auto", textAlign: "center", backgroundColor: "#ffffff", borderRadius: "10px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
        <h2 style={{ color: "#BA1A1A", fontFamily: "Montserrat, sans-serif", textTransform: "uppercase" }}>Access Restricted</h2>
        <p style={{ color: "#64748B", margin: "16px 0 24px" }}>{authError}</p>
        <Link to="/login" className="btn-primary-richu" style={{ textDecoration: "none" }}>
          Proceed to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="admin-app">
      {/* Sidebar Navigation */}
      <aside className={`admin-sidebar-nav ${sidebarOpen ? "open" : ""}`}>
        <div>
          <div className="admin-sidebar-brand">
            <div className="brand-row">
              <Diamond className="brand-icon" size={24} />
              <span className="brand-text">RICHU</span>
            </div>
            <span className="brand-subtitle">Haute Tailoring &amp; Atelier</span>
            <div className="atelier-status-pill">
              <span className="pulse-dot"></span>
              <span>Live Console Active</span>
            </div>
          </div>

          <nav className="admin-nav-menu">
            <span className="nav-section-label">Core Operations</span>
            <NavLink
              to="/admin"
              end
              className={({ isActive }) => `admin-nav-item ${isActive ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <div className="nav-item-content">
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </div>
            </NavLink>

            <NavLink
              to="/admin/products"
              className={({ isActive }) => `admin-nav-item ${isActive ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <div className="nav-item-content">
                <Shirt size={18} />
                <span>Products</span>
              </div>
            </NavLink>

            <NavLink
              to="/admin/categories"
              className={({ isActive }) => `admin-nav-item ${isActive ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <div className="nav-item-content">
                <Tags size={18} />
                <span>Categories</span>
              </div>
            </NavLink>

            <NavLink
              to="/admin/inventory"
              className={({ isActive }) => `admin-nav-item ${isActive ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <div className="nav-item-content">
                <Layers size={18} />
                <span>Inventory</span>
              </div>
            </NavLink>

            <NavLink
              to="/admin/orders"
              className={({ isActive }) => `admin-nav-item ${isActive ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <div className="nav-item-content">
                <ShoppingBag size={18} />
                <span>Orders</span>
              </div>
            </NavLink>

            <span className="nav-section-label" style={{ marginTop: "12px" }}>Client &amp; Governance</span>
            <NavLink
              to="/admin/customers"
              className={({ isActive }) => `admin-nav-item ${isActive ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <div className="nav-item-content">
                <Users size={18} />
                <span>Customers</span>
              </div>
            </NavLink>

            <NavLink
              to="/admin/reviews"
              className={({ isActive }) => `admin-nav-item ${isActive ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <div className="nav-item-content">
                <Star size={18} />
                <span>Reviews</span>
              </div>
            </NavLink>

            <NavLink
              to="/admin/audit-logs"
              className={({ isActive }) => `admin-nav-item ${isActive ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <div className="nav-item-content">
                <FileText size={18} />
                <span>Audit Logs</span>
              </div>
            </NavLink>
          </nav>
        </div>

        <div className="admin-sidebar-footer">
          <div className="admin-profile-box">
            <div className="admin-avatar">
              {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="admin-profile-info">
              <span className="admin-name">{adminUser?.name || "Administrator"}</span>
              <span className="admin-role">
                <ShieldCheck size={12} style={{ display: "inline", marginRight: "3px", verticalAlign: "middle" }} />
                Executive Admin
              </span>
            </div>
          </div>
          <button className="admin-logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Wrapper */}
      <div className="admin-main-wrapper">
        <header className="admin-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ background: "none", border: "none", cursor: "pointer", display: "inline-flex", color: "#131C27" }}
              aria-label="Toggle Navigation"
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <div className="topbar-breadcrumbs">
              <span className="breadcrumb-root">Atelier Console</span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-active">{getBreadcrumbTitle()}</span>
            </div>
          </div>

          <div className="topbar-actions">
            <Link to="/" className="topbar-portal-link" target="_blank" rel="noopener noreferrer">
              <ExternalLink size={14} style={{ display: "inline", marginRight: "6px", verticalAlign: "middle" }} />
              Customer Storefront
            </Link>
          </div>
        </header>

        <main className="admin-body-content">
          <Outlet context={{ adminUser }} />
        </main>
      </div>
    </div>
  );
}
