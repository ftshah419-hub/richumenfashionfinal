import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMe } from "../../services/authService";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getMe()
      .then(({ user }) => {
        if (user.role !== "admin") {
          setError("Administrator access required.");
          return;
        }
        setUser(user);
      })
      .catch(() => {
        setError("Please log in with an administrator account.");
        navigate("/login");
      });
  }, [navigate]);

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <strong>RICHU ADMIN</strong>
        <p>Dashboard</p><p>Products</p><p>Categories</p><p>Inventory</p><p>Orders</p><p>Customers</p><p>Payments</p>
      </aside>
      <section className="admin-content">
        <div className="eyebrow">STORE MANAGEMENT</div>
        <h1>Admin Dashboard</h1>
        {error ? <p className="form-error">{error}</p> : <p className="muted">{user ? `Welcome, ${user.name}. Admin workspace is ready for API integration.` : "Checking admin access..."}</p>}
      </section>
    </div>
  );
}
