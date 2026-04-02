import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Loader from "./Loader.jsx";

function ProtectedRoute({ roles }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md">
          <Loader label="Preparing your workspace..." />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user?.role)) {
    return <Navigate to={user?.role === "recruiter" ? "/recruiter/manage" : "/dashboard"} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
