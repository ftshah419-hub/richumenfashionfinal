import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AtSign, Eye, EyeOff, LockKeyhole, Settings2, UserRound } from "lucide-react";
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
      navigate(result?.user?.role === "admin" ? "/admin" : requestedPath || "/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to authenticate your account");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-surface">
      <div className="w-full max-w-md bg-surface-container-lowest p-8 rounded-2xl shadow-xl border border-surface-container-high">
        {/* Header */}
        <div className="text-center mb-6">
          <span className="font-label-caps text-xs uppercase tracking-[0.2em] text-secondary font-bold">
            {portal === "admin" ? "Atelier Admin Portal" : "Sovereign Patron Entry"}
          </span>
          <h2 className="font-headline-lg text-2xl font-bold text-on-surface uppercase tracking-tight mt-1">
            Sign In to RICHU
          </h2>
          <p className="text-xs text-on-surface-variant mt-1">
            {portal === "admin"
              ? "Restricted access for authorized RICHU store management."
              : "Access your reserved sartorial chamber and active commissions."}
          </p>
        </div>

        {/* Portal Switcher Tabs */}
        <div className="flex rounded-lg bg-surface-container-low p-1 mb-6 border border-surface-container-high">
          <button
            type="button"
            onClick={() => setPortal("customer")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded transition-all ${
              portal === "customer"
                ? "bg-primary-container text-on-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <UserRound size={14} /> Customer Portal
          </button>
          <button
            type="button"
            onClick={() => setPortal("admin")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded transition-all ${
              portal === "admin"
                ? "bg-primary-container text-on-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <Settings2 size={14} /> Atelier Admin
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 bg-error-container text-error text-xs rounded border border-error/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          {/* Email */}
          <div>
            <label className="font-label-caps uppercase text-on-surface-variant block mb-1">
              {portal === "admin" ? "Admin Email" : "Patron Email"}
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-on-surface-variant pointer-events-none">
                <AtSign size={16} />
              </span>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder={portal === "admin" ? "admin@richu.co" : "lord.vance@richu.co"}
                className="w-full bg-surface-container-low pl-10 pr-3 py-3 rounded border border-surface-container-high text-on-surface focus:outline-none focus:border-secondary"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="font-label-caps uppercase text-on-surface-variant block mb-1">
              Passcode
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-on-surface-variant pointer-events-none">
                <LockKeyhole size={16} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-surface-container-low pl-10 pr-10 py-3 rounded border border-surface-container-high text-on-surface focus:outline-none focus:border-secondary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-on-surface-variant hover:text-on-surface focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-primary-container text-on-primary hover:bg-secondary-fixed hover:text-on-secondary-fixed font-label-caps text-xs uppercase tracking-widest rounded shadow-md transition-all font-bold mt-2 disabled:opacity-50"
          >
            {submitting
              ? "Verifying Credentials..."
              : portal === "admin"
              ? "Enter Atelier Admin"
              : "Enter The Atelier"}
          </button>
        </form>

        {portal === "customer" ? (
          <p className="text-xs text-center text-on-surface-variant mt-6">
            New to the atelier?{" "}
            <Link to="/register" className="text-secondary font-bold hover:underline">
              Request Patron Account
            </Link>
          </p>
        ) : (
          <p className="text-xs text-center text-on-surface-variant mt-6">
            Admin accounts are provisioned securely by the RICHU team.
          </p>
        )}
      </div>
    </div>
  );
}