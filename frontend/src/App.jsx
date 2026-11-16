import { Link, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Account from "./pages/account/Account";
import AdminDashboard from "./pages/admin/Dashboard";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

function SiteHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await signOut();
    } finally {
      navigate("/", { replace: true });
    }
  }

  return (
    <header className="site-header">
      <Link className="brand" to="/">RICHU<span>.</span></Link>
      <nav>
        <Link to="/">Home</Link>
        {user ? <Link to="/account">Account</Link> : <Link to="/login">Login</Link>}
        {user?.role === "admin" && <Link to="/admin">Admin</Link>}
        {user ? <button className="nav-button" type="button" onClick={handleLogout}>Logout</button> : <Link to="/register">Register</Link>}
      </nav>
    </header>
  );
}

export default function App() {
  const location = useLocation();
  const isAuthScreen = ["/login", "/register"].includes(location.pathname);

  return (
    <>
      {!isAuthScreen && <SiteHeader />}
      <main className={isAuthScreen ? "auth-main" : ""}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
        </Routes>
      </main>
      {!isAuthScreen && <footer>© {new Date().getFullYear()} RICHU Men&apos;s Fashion</footer>}
    </>
  );
}
