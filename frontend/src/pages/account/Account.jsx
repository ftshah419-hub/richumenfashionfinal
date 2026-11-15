import { useState } from "react";
import { KeyRound } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Account() {
  const { user, changePassword } = useAuth();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);
    try {
      await changePassword(form);
      setForm({ currentPassword: "", newPassword: "" });
      setMessage("Password updated. Other active sessions have been signed out.");
    } catch (err) {
      setError(err.response?.data?.errors?.[0] || err.response?.data?.message || "Unable to update password");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="container account-page">
      <p className="eyebrow">PRIVATE ACCOUNT</p>
      <h1>Welcome, {user.name}</h1>
      <div className="account-grid">
        <article className="account-card"><h2>Profile</h2><dl><div><dt>Name</dt><dd>{user.name}</dd></div><div><dt>Email</dt><dd>{user.email}</dd></div><div><dt>Phone</dt><dd>{user.phone || "Not provided"}</dd></div><div><dt>Access</dt><dd className="account-role">{user.role}</dd></div></dl></article>
        <article className="account-card"><h2><KeyRound size={19} /> Change password</h2><p className="muted">Use a minimum of eight characters with uppercase, lowercase, and a number.</p><form onSubmit={handleSubmit}><label htmlFor="currentPassword">Current password</label><input id="currentPassword" type="password" autoComplete="current-password" required value={form.currentPassword} onChange={(event) => setForm({ ...form, currentPassword: event.target.value })} /><label htmlFor="newPassword">New password</label><input id="newPassword" type="password" autoComplete="new-password" minLength="8" required value={form.newPassword} onChange={(event) => setForm({ ...form, newPassword: event.target.value })} />{error && <p className="form-error" role="alert">{error}</p>}{message && <p className="form-success" role="status">{message}</p>}<button className="button" disabled={submitting} type="submit">{submitting ? "Updating…" : "Update password"}</button></form></article>
      </div>
    </section>
  );
}
