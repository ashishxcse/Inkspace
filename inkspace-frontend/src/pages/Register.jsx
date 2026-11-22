import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, login, errorText } from "../api";
import AuthLayout from "../components/AuthLayout.jsx";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api("/auth/register/", { method: "POST", body: form, auth: false });
      await login(form.username, form.password); // register ke turant baad login
      navigate("/");
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      footer={<>Already have an account? <Link to="/login">Log in</Link></>}
    >
      <form onSubmit={handleSubmit}>
        {error && <div className="alert" role="alert">{error}</div>}
        <div className="field">
          <label htmlFor="username">Username</label>
          <input id="username" name="username" autoComplete="username"
            value={form.username} onChange={handleChange} required />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email"
            value={form.email} onChange={handleChange} required />
        </div>
        <div className="field">
          <label htmlFor="password">Password (at least 6 characters)</label>
          <input id="password" name="password" type="password" autoComplete="new-password"
            minLength={6} value={form.password} onChange={handleChange} required />
        </div>
        <button className="btn btn-primary" disabled={busy}>
          {busy ? "Creating account..." : "Create account"}
        </button>
      </form>
    </AuthLayout>
  );
}
