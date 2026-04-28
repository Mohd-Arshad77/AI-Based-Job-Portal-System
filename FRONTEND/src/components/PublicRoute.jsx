import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function PublicRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  // Only guard on actual auth state — NOT on loading.
  // loading is a generic API-call flag; using it here unmounts children
  // mid-request (e.g. during register), destroying in-progress state.
  // user/token are read synchronously from localStorage so no async
  // initialization phase exists that would require a loader here.
  if (user) {
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "recruiter") return <Navigate to="/recruiter/manage" replace />;
    if (user.role === "user") return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default PublicRoute;
