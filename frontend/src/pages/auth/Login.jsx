import { useState } from "react";
import { AtSign, ArrowRight, Eye, EyeOff, LockKeyhole, Settings2, UserRound } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [portal, setPortal] = useState("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const result = await signIn(form, portal);
      const requestedPath = location.state?.from?.pathname;
      navigate(result.user.role === "admin" ? "/admin" : requestedPath || "/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to authenticate your account");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow={portal === "admin" ? "ATELIER ADMIN PORTAL" : "CLIENT PRIVATE SUITE"}
      title="Welcome to RICHU"
      description={portal === "admin"
        ? "Restricted access for authorized RICHU store management."
        : "Sign in to manage your profile and explore the RICHU collection."}
    >
      <div className="portal-tabs" role="tablist" aria-label="Account type">
        <button type="button" className={portal === "customer" ? "active" : ""} onClick={() => setPortal("customer")} role="tab" aria-selected={portal === "customer"}>
          <UserRound size={16} /> Customer portal
        </button>
        <button type="button" className={portal === "admin" ? "active" : ""} onClick={() => setPortal("admin")} role="tab" aria-selected={portal === "admin"}>
          <Settings2 size={16} /> Atelier admin
        </button>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="email">Email address</label>
        <div className="auth-input-wrap">
          <AtSign aria-hidden="true" />
          <input id="email" type="email" autoComplete="email" placeholder="you@example.com" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        </div>

        <div className="auth-label-row"><label htmlFor="password">Password</label></div>
        <div className="auth-input-wrap">
          <LockKeyhole aria-hidden="true" />
          <input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="auth-submit" type="submit" disabled={submitting}>
          <span>{submitting ? "Authenticating…" : "Authenticate access"}</span><ArrowRight size={17} />
        </button>
      </form>

      {portal === "customer" && <div className="auth-secondary-cta"><p>New to the RICHU collection?</p><Link to="/register">Create your customer account <ArrowRight size={15} /></Link></div>}
      {portal === "admin" && <p className="auth-help-text">Admin accounts are provisioned securely by the RICHU team.</p>}
    </AuthLayout>
  );
}
