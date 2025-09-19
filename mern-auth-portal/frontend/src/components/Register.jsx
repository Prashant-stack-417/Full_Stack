import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export default function Register() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState([]);
  const [serverMessage, setServerMessage] = useState("");

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setServerMessage("");

    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      };

      const data = await register(payload);

      if (data?.success) {
        if (data.token) {
          navigate("/profile");
        } else {
          setServerMessage("Registration successful! Please log in.");
          setTimeout(() => navigate("/login"), 2000);
        }
        return;
      }

      if (Array.isArray(data?.errors)) {
        setErrors(data.errors);
      } else if (data?.message) {
        setServerMessage(data.message);
      } else {
        setServerMessage("Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);

      if (err?.response?.data) {
        const errorData = err.response.data;

        if (Array.isArray(errorData.errors)) {
          setErrors(errorData.errors);
        } else if (errorData.message) {
          setServerMessage(errorData.message);
        } else {
          setServerMessage("Registration failed. Please try again.");
        }
      } else {
        setServerMessage(
          "Network error. Please check if the backend is running."
        );
      }
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>

      {serverMessage && (
        <div className="server-message" role="alert" aria-live="assertive">
          {serverMessage}
        </div>
      )}

      {errors.length > 0 && (
        <ul className="error-list" role="alert" aria-live="polite">
          {errors.map((err, idx) => (
            <li key={idx}>
              {err.path ? `${err.path}: ${err.msg}` : err.msg || err}
            </li>
          ))}
        </ul>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="firstName">First name</label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            value={form.firstName}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="lastName">Last name</label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            value={form.lastName}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
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
          />
        </div>
        <div className="form-actions">
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </div>
      </form>
    </div>
  );
}
