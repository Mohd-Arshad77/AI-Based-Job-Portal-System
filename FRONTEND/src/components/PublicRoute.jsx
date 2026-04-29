import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function PublicRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (user) {
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "recruiter") return <Navigate to="/recruiter/manage" replace />;
    if (user.role === "user") return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default PublicRoute;
