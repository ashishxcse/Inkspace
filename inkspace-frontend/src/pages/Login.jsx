import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, errorText } from "../api";
import AuthLayout from "../components/AuthLayout.jsx";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(form.username, form.password);
      navigate("/");
    } catch (err) {
      // Galat password par DRF "No active account found..." bhejta hai.
      setError(errorText(err));
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Log in to Inkspace"
      footer={<>New here? <Link to="/register">Create an account</Link></>}
    >
      <form onSubmit={handleSubmit}>
        {error && <div className="alert" role="alert">{error}</div>}
        <div className="field">
          <label htmlFor="username">Username</label>
          <input id="username" name="username" autoComplete="username"
            value={form.username} onChange={handleChange} required />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password"
            value={form.password} onChange={handleChange} required />
        </div>
        <button className="btn btn-primary" disabled={busy}>
          {busy ? "Logging in..." : "Log in"}
        </button>
      </form>
    </AuthLayout>
  );
}
