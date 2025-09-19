import { useEffect } from "react";
import { useAuth } from "../context/AuthProvider";

export default function Profile() {
  const { user, loading, logout, isAuthenticated } = useAuth();

  if (loading) return <div className="auth-container">Loading...</div>;

  if (!isAuthenticated || !user) {
    return <div className="auth-container">No user data. Please login.</div>;
  }

  return (
    <div className="auth-container">
      <h2>Profile</h2>

      <div className="auth-form">
        <div>
          <label>ID</label>
          <div>{user.id}</div>
        </div>

        <div>
          <label>Name</label>
          <div>
            {user.firstName} {user.lastName}
          </div>
        </div>

        <div>
          <label>Email</label>
          <div>{user.email}</div>
        </div>

        <div>
          <label>Role</label>
          <div>{user.role}</div>
        </div>

        <div>
          <label>Account Status</label>
          <div>{user.isActive ? "Active" : "Inactive"}</div>
        </div>

        <div>
          <label>Last Login</label>
          <div>
            {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "–"}
          </div>
        </div>

        <div>
          <label>Member Since</label>
          <div>
            {user.createdAt
              ? new Date(user.createdAt).toLocaleDateString()
              : "–"}
          </div>
        </div>

        {user.updatedAt && (
          <div>
            <label>Last Updated</label>
            <div>{new Date(user.updatedAt).toLocaleString()}</div>
          </div>
        )}

        <div className="form-actions">
          <button className="btn" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
