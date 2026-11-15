import { Link, Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import Categories from "./pages/admin/Categories";
import Inventory from "./pages/admin/Inventory";
import Orders from "./pages/admin/Orders";
import Customers from "./pages/admin/Customers";
import Reviews from "./pages/admin/Reviews";
import AuditLogs from "./pages/admin/AuditLogs";

export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdminRoute && (
        <header className="site-header">
          <Link className="brand" to="/">RICHU<span>.</span></Link>
          <nav>
            <Link to="/">Home</Link>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            <Link to="/admin">Admin</Link>
          </nav>
        </header>
      )}

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Complete Admin Panel Module Shell */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="categories" element={<Categories />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="orders" element={<Orders />} />
            <Route path="customers" element={<Customers />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="audit-logs" element={<AuditLogs />} />
          </Route>
        </Routes>
      </main>

      {!isAdminRoute && (
        <footer>© {new Date().getFullYear()} RICHU Men's Fashion</footer>
      )}
    </>
  );
}
