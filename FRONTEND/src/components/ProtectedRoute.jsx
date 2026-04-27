import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Loader from "./Loader.jsx";

function ProtectedRoute({ roles = [] }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader label="Preparing your workspace..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {

    if (user.role === "admin") {
      return <Navigate to="/admin" replace />;
    }

    if (user.role === "recruiter") {
      return <Navigate to="/recruiter" replace />;
    }

    if (user.role === "user") {
      return <Navigate to="/home" replace />;
    }

    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
