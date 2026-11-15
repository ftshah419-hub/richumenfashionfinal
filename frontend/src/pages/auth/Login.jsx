import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login(form.email, form.password);
      if (result.user?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to log in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-surface">
      <div className="w-full max-w-md bg-surface-container-lowest p-8 rounded-2xl shadow-xl border border-surface-container-high">
        <div className="text-center mb-6">
          <span className="font-label-caps text-xs uppercase tracking-[0.2em] text-secondary font-bold">
            Sovereign Patron Entry
          </span>
          <h2 className="font-headline-lg text-2xl font-bold text-on-surface uppercase tracking-tight mt-1">
            Sign In to RICHU
          </h2>
          <p className="text-xs text-on-surface-variant mt-1">
            Access your reserved sartorial chamber and active commissions.
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 bg-error-container text-error text-xs rounded border border-error/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          <div>
            <label className="font-label-caps uppercase text-on-surface-variant block mb-1">
              Patron Email
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="e.g. lord.vance@richu.co"
              className="w-full bg-surface-container-low p-3 rounded border border-surface-container-high text-on-surface focus:outline-none focus:border-secondary"
            />
          </div>

          <div>
            <label className="font-label-caps uppercase text-on-surface-variant block mb-1">
              Passcode
            </label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="w-full bg-surface-container-low p-3 rounded border border-surface-container-high text-on-surface focus:outline-none focus:border-secondary"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary-container text-on-primary hover:bg-secondary-fixed hover:text-on-secondary-fixed font-label-caps text-xs uppercase tracking-widest rounded shadow-md transition-all font-bold mt-2 disabled:opacity-50"
          >
            {loading ? "Verifying Credentials..." : "Enter The Atelier"}
          </button>
        </form>

        <p className="text-xs text-center text-on-surface-variant mt-6">
          New to the atelier?{" "}
          <Link to="/register" className="text-secondary font-bold hover:underline">
            Request Patron Account
          </Link>
        </p>
      </div>
    </div>
  );
}
