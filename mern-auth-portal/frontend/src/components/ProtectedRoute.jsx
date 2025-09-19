import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export default function ProtectedRoute({ children }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading)
    return (
      <div className="auth-container">
        <div className="loading">Loading...</div>
      </div>
    );

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
