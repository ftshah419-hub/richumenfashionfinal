import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../services/authService";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const result = await login(form);
      sessionStorage.setItem("richu_access_token", result.token);
      navigate(result.user.role === "admin" ? "/admin" : "/");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to log in");
    }
  }

  return (
    <section className="panel">
      <div className="eyebrow">WELCOME BACK</div>
      <h2>Sign in to RICHU</h2>
      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input type="email" required value={form.email} onChange={e => setForm({...form,email:e.target.value})} />
        <label>Password</label>
        <input type="password" required value={form.password} onChange={e => setForm({...form,password:e.target.value})} />
        {error && <p className="form-error">{error}</p>}
        <button className="button" type="submit">Login</button>
      </form>
      <p className="muted">New to RICHU? <Link to="/register">Create an account</Link></p>
    </section>
  );
}
