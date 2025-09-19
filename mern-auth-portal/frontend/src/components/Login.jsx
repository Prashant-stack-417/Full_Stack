import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await login(form);
      if (res && res.success) {
        navigate("/profile");
      } else {
        setError(res?.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage =
        err?.response?.data?.message ||
        "Network error. Please check if the backend is running.";
      setError(errorMessage);
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      {error && (
        <div className="server-message" role="alert" aria-live="assertive">
          {error}
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            disabled={loading}
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            disabled={loading}
            autoComplete="current-password"
          />
        </div>

        <div className="form-actions">
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>
      </form>
    </div>
  );
}
