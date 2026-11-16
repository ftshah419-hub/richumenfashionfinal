import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../../services/authService";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const result = await register(form);
      sessionStorage.setItem("richu_access_token", result.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to register");
    }
  }

  return (
    <section className="panel">
      <div className="eyebrow">JOIN RICHU</div>
      <h2>Create your account</h2>
      <form onSubmit={handleSubmit}>
        <label>Full name</label>
        <input required value={form.name} onChange={e => setForm({...form,name:e.target.value})} />
        <label>Email</label>
        <input type="email" required value={form.email} onChange={e => setForm({...form,email:e.target.value})} />
        <label>Phone</label>
        <input value={form.phone} onChange={e => setForm({...form,phone:e.target.value})} />
        <label>Password</label>
        <input type="password" minLength="8" required value={form.password} onChange={e => setForm({...form,password:e.target.value})} />
        {error && <p className="form-error">{error}</p>}
        <button className="button" type="submit">Create account</button>
      </form>
      <p className="muted">Already registered? <Link to="/login">Login</Link></p>
    </section>
  );
}
