import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, AtSign, Eye, EyeOff, LockKeyhole, Phone, UserRound } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { signUp } = useAuth();
  const navigate = useNavigate();

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signUp(form);
      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.errors?.[0] ||
        err.response?.data?.message ||
        err.message ||
        "Unable to create your account"
      );
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
          <div className="p-3 mb-4 bg-error-container text-error text-xs rounded border border-error/20" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          {/* Name */}
          <div>
            <label className="font-label-caps uppercase text-on-surface-variant block mb-1">
              Distinguished Name / Title
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-on-surface-variant pointer-events-none">
                <UserRound size={16} />
              </span>
              <input
                id="name"
                required
                autoComplete="name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="e.g. Lord Edward Vance"
                className="w-full bg-surface-container-low pl-10 pr-3 py-3 rounded border border-surface-container-high text-on-surface focus:outline-none focus:border-secondary"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="font-label-caps uppercase text-on-surface-variant block mb-1">
              Patron Email
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-on-surface-variant pointer-events-none">
                <AtSign size={16} />
              </span>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="e.g. edward@richu.co"
                className="w-full bg-surface-container-low pl-10 pr-3 py-3 rounded border border-surface-container-high text-on-surface focus:outline-none focus:border-secondary"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="font-label-caps uppercase text-on-surface-variant block mb-1">
              Direct Phone / Concierge
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-on-surface-variant pointer-events-none">
                <Phone size={16} />
              </span>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-surface-container-low pl-10 pr-3 py-3 rounded border border-surface-container-high text-on-surface focus:outline-none focus:border-secondary"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-label-caps uppercase text-on-surface-variant">
                Secret Passcode
              </label>
              <span className="text-[10px] text-on-surface-variant">8+ characters</span>
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-on-surface-variant pointer-events-none">
                <LockKeyhole size={16} />
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                minLength={8}
                required
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
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
            className="w-full py-3.5 bg-primary-container text-on-primary hover:bg-secondary-fixed hover:text-on-secondary-fixed font-label-caps text-xs uppercase tracking-widest rounded shadow-md transition-all font-bold mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>{submitting ? "Registering In Atelier..." : "Enlist as Patron"}</span>
            <ArrowRight size={16} />
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