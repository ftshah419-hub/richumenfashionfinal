import { useState } from "react";
import { AtSign, ArrowRight, Eye, EyeOff, LockKeyhole, Phone, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
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
      setError(err.response?.data?.errors?.[0] || err.response?.data?.message || "Unable to create your account");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="REQUEST MEMBERSHIP"
      title="Create your RICHU account"
      description="Join the collection to save your preferences and access your private account."
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="name">Full name</label>
        <div className="auth-input-wrap"><UserRound aria-hidden="true" /><input id="name" autoComplete="name" placeholder="Your full name" required value={form.name} onChange={(event) => update("name", event.target.value)} /></div>

        <label htmlFor="email">Email address</label>
        <div className="auth-input-wrap"><AtSign aria-hidden="true" /><input id="email" type="email" autoComplete="email" placeholder="you@example.com" required value={form.email} onChange={(event) => update("email", event.target.value)} /></div>

        <label htmlFor="phone">Phone number</label>
        <div className="auth-input-wrap"><Phone aria-hidden="true" /><input id="phone" type="tel" autoComplete="tel" placeholder="+91 98765 43210" required value={form.phone} onChange={(event) => update("phone", event.target.value)} /></div>

        <div className="auth-label-row"><label htmlFor="password">Create password</label><span>8+ characters</span></div>
        <div className="auth-input-wrap">
          <LockKeyhole aria-hidden="true" />
          <input id="password" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="Uppercase, lowercase & number" minLength="8" required value={form.password} onChange={(event) => update("password", event.target.value)} />
          <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="auth-submit" type="submit" disabled={submitting}><span>{submitting ? "Creating account…" : "Create customer account"}</span><ArrowRight size={17} /></button>
      </form>
      <div className="auth-secondary-cta"><p>Already have an account?</p><Link to="/login">Sign in to RICHU <ArrowRight size={15} /></Link></div>
    </AuthLayout>
  );
}
