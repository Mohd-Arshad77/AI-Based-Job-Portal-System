import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Loader from "./Loader.jsx";

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log("USER:", user);
  console.log("LOADING:", loading);
  console.log("PATH:", location.pathname);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader label="Preparing your workspace..." />
      </div>
    );
  }

  if (user) {
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "recruiter") return <Navigate to="/recruiter/manage" replace />;
    if (user.role === "user") return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default PublicRoute;
