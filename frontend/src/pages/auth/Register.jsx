import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.phone);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to register");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-surface">
      <div className="w-full max-w-md bg-surface-container-lowest p-8 rounded-2xl shadow-xl border border-surface-container-high">
        <div className="text-center mb-6">
          <span className="font-label-caps text-xs uppercase tracking-[0.2em] text-secondary font-bold">
            Private Atelier Enlistment
          </span>
          <h2 className="font-headline-lg text-2xl font-bold text-on-surface uppercase tracking-tight mt-1">
            Join RICHU Haute Couture
          </h2>
          <p className="text-xs text-on-surface-variant mt-1">
            Gain access to bespoke tailors, archival trunk drops, and private allocations.
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
              Distinguished Name / Title
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Lord Edward Vance"
              className="w-full bg-surface-container-low p-3 rounded border border-surface-container-high text-on-surface focus:outline-none focus:border-secondary"
            />
          </div>

          <div>
            <label className="font-label-caps uppercase text-on-surface-variant block mb-1">
              Patron Email
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="e.g. edward@richu.co"
              className="w-full bg-surface-container-low p-3 rounded border border-surface-container-high text-on-surface focus:outline-none focus:border-secondary"
            />
          </div>

          <div>
            <label className="font-label-caps uppercase text-on-surface-variant block mb-1">
              Direct Phone / Concierge
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+44 20 7946 0912"
              className="w-full bg-surface-container-low p-3 rounded border border-surface-container-high text-on-surface focus:outline-none focus:border-secondary"
            />
          </div>

          <div>
            <label className="font-label-caps uppercase text-on-surface-variant block mb-1">
              Secret Passcode (Min. 8 characters)
            </label>
            <input
              type="password"
              minLength={8}
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
            {loading ? "Registering In Atelier..." : "Enlist as Patron"}
          </button>
        </form>

        <p className="text-xs text-center text-on-surface-variant mt-6">
          Already enlisted?{" "}
          <Link to="/login" className="text-secondary font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
